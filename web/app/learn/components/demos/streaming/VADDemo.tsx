'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type SpeechPattern = 'greeting' | 'question' | 'hesitation' | 'rapid';
type VadState = 'silence' | 'speaking' | 'endpoint';

interface SpeechSegment {
  startMs: number;
  endMs: number;
  type: 'speech' | 'pause';
  energy: number;
  pitchHz: number;
  fricative: boolean;
}

interface RawVadFrame {
  startMs: number;
  endMs: number;
  rms: number;
  zcr: number;
  voicing: number;
  snrDb: number;
  truthSpeech: boolean;
}

interface VadTimelineFrame extends RawVadFrame {
  score: number;
  detectedSpeech: boolean;
  state: VadState;
}

interface TimeRange {
  startMs: number;
  endMs: number;
}

const SAMPLE_RATE = 16_000;
const DURATION_MS = 4_000;

const PATTERN_LABELS: Record<SpeechPattern, string> = {
  greeting: 'Greeting',
  question: 'Question',
  hesitation: 'Hesitation',
  rapid: 'Rapid',
};

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

// Deterministic pseudo-noise so the demo is repeatable.
function hashNoise(index: number) {
  const x = Math.sin(index * 12.9898 + 78.233) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
}

function buildSpeechPlan(pattern: SpeechPattern, durationMs: number): SpeechSegment[] {
  const templates: Record<SpeechPattern, Array<Omit<SpeechSegment, 'startMs' | 'endMs'>>> = {
    greeting: [
      { type: 'pause', energy: 0, pitchHz: 0, fricative: false },
      { type: 'speech', energy: 0.42, pitchHz: 145, fricative: false },
      { type: 'pause', energy: 0, pitchHz: 0, fricative: false },
      { type: 'speech', energy: 0.5, pitchHz: 155, fricative: false },
      { type: 'pause', energy: 0, pitchHz: 0, fricative: false },
      { type: 'speech', energy: 0.38, pitchHz: 140, fricative: true },
      { type: 'pause', energy: 0, pitchHz: 0, fricative: false },
    ],
    question: [
      { type: 'pause', energy: 0, pitchHz: 0, fricative: false },
      { type: 'speech', energy: 0.4, pitchHz: 135, fricative: false },
      { type: 'pause', energy: 0, pitchHz: 0, fricative: false },
      { type: 'speech', energy: 0.46, pitchHz: 150, fricative: false },
      { type: 'pause', energy: 0, pitchHz: 0, fricative: false },
      { type: 'speech', energy: 0.5, pitchHz: 175, fricative: false },
      { type: 'pause', energy: 0, pitchHz: 0, fricative: false },
    ],
    hesitation: [
      { type: 'pause', energy: 0, pitchHz: 0, fricative: false },
      { type: 'speech', energy: 0.33, pitchHz: 125, fricative: false },
      { type: 'pause', energy: 0, pitchHz: 0, fricative: false },
      { type: 'speech', energy: 0.3, pitchHz: 130, fricative: true },
      { type: 'pause', energy: 0, pitchHz: 0, fricative: false },
      { type: 'speech', energy: 0.44, pitchHz: 145, fricative: false },
      { type: 'pause', energy: 0, pitchHz: 0, fricative: false },
    ],
    rapid: [
      { type: 'pause', energy: 0, pitchHz: 0, fricative: false },
      { type: 'speech', energy: 0.48, pitchHz: 150, fricative: false },
      { type: 'pause', energy: 0, pitchHz: 0, fricative: false },
      { type: 'speech', energy: 0.52, pitchHz: 165, fricative: true },
      { type: 'pause', energy: 0, pitchHz: 0, fricative: false },
      { type: 'speech', energy: 0.46, pitchHz: 155, fricative: false },
      { type: 'pause', energy: 0, pitchHz: 0, fricative: false },
    ],
  };

  const durationPattern = {
    greeting: [180, 520, 120, 460, 160, 560, 180],
    question: [120, 420, 90, 450, 120, 640, 200],
    hesitation: [140, 260, 240, 220, 280, 640, 200],
    rapid: [100, 300, 80, 310, 90, 330, 80],
  } as const;

  const template = templates[pattern];
  const durations = durationPattern[pattern];

  const segments: SpeechSegment[] = [];
  let cursor = 0;
  let index = 0;

  while (cursor < durationMs) {
    const base = template[index % template.length];
    const duration = durations[index % durations.length];
    const startMs = cursor;
    const endMs = Math.min(durationMs, cursor + duration);
    segments.push({
      ...base,
      startMs,
      endMs,
    });
    cursor = endMs;
    index += 1;
  }

  return segments;
}

function estimateVoicing(samples: number[]) {
  let energy = 0;
  for (let i = 0; i < samples.length; i += 1) {
    energy += samples[i] * samples[i];
  }
  if (energy < 1e-8) return 0;

  const minLag = 40; // ~400Hz at 16k
  const maxLag = 160; // ~100Hz at 16k
  let best = 0;

  for (let lag = minLag; lag <= maxLag; lag += 4) {
    let corr = 0;
    for (let i = 0; i < samples.length - lag; i += 1) {
      corr += samples[i] * samples[i + lag];
    }
    best = Math.max(best, corr / energy);
  }

  return clamp01(best);
}

function buildRangesFromTruth(frames: RawVadFrame[]): TimeRange[] {
  const ranges: TimeRange[] = [];
  let active: TimeRange | null = null;

  for (const frame of frames) {
    if (frame.truthSpeech) {
      if (!active) {
        active = { startMs: frame.startMs, endMs: frame.endMs };
      } else {
        active.endMs = frame.endMs;
      }
    } else if (active) {
      ranges.push(active);
      active = null;
    }
  }

  if (active) ranges.push(active);
  return ranges;
}

function generateVadFrames(
  durationMs: number,
  frameMs: number,
  pattern: SpeechPattern,
  noiseFloorDb: number
): RawVadFrame[] {
  const plan = buildSpeechPlan(pattern, durationMs);
  const frames: RawVadFrame[] = [];

  const frameSamples = Math.max(1, Math.round((SAMPLE_RATE * frameMs) / 1000));
  const noiseRms = Math.pow(10, noiseFloorDb / 20); // Amplitude domain.
  const noiseAmplitude = noiseRms * Math.sqrt(3); // Uniform noise RMS conversion.
  const frameCount = Math.ceil(durationMs / frameMs);

  const seedBase = pattern === 'greeting' ? 101 : pattern === 'question' ? 202 : pattern === 'hesitation' ? 303 : 404;

  for (let frameIndex = 0; frameIndex < frameCount; frameIndex += 1) {
    const startMs = frameIndex * frameMs;
    const endMs = Math.min(durationMs, startMs + frameMs);
    const midpointMs = (startMs + endMs) * 0.5;
    const segment = plan.find((s) => midpointMs >= s.startMs && midpointMs < s.endMs);
    const truthSpeech = segment?.type === 'speech';
    const segmentDuration = segment ? Math.max(1, segment.endMs - segment.startMs) : 1;

    const samples: number[] = new Array(frameSamples);

    for (let i = 0; i < frameSamples; i += 1) {
      const sampleTimeMs = startMs + (i / SAMPLE_RATE) * 1000;
      const timeSec = sampleTimeMs * 0.001;
      const sampleIndex = frameIndex * frameSamples + i;
      const noise = hashNoise(seedBase + sampleIndex * 13);

      let sample = noiseAmplitude * noise;

      if (truthSpeech && segment) {
        const local = clamp01((sampleTimeMs - segment.startMs) / segmentDuration);
        const envelope = Math.pow(Math.sin(Math.PI * local), 1.4);
        const f0 = segment.pitchHz * (1 + 0.03 * Math.sin((frameIndex + i) * 0.17));
        const harmonic =
          Math.sin(2 * Math.PI * f0 * timeSec) +
          0.5 * Math.sin(4 * Math.PI * f0 * timeSec) +
          0.25 * Math.sin(6 * Math.PI * f0 * timeSec);
        const voicedRatio = segment.fricative ? 0.35 : 0.82;
        const excitation = voicedRatio * harmonic + (1 - voicedRatio) * 0.7 * noise;
        sample += segment.energy * envelope * excitation;
      }

      samples[i] = sample;
    }

    let sumSquares = 0;
    let zcrCount = 0;
    for (let i = 0; i < samples.length; i += 1) {
      sumSquares += samples[i] * samples[i];
      if (i > 0 && ((samples[i - 1] >= 0 && samples[i] < 0) || (samples[i - 1] < 0 && samples[i] >= 0))) {
        zcrCount += 1;
      }
    }

    const rms = Math.sqrt(sumSquares / samples.length);
    const zcr = zcrCount / Math.max(1, samples.length - 1);
    const voicing = estimateVoicing(samples);
    const snrDb = 20 * Math.log10((rms + 1e-6) / (noiseRms + 1e-6));

    frames.push({
      startMs,
      endMs,
      rms,
      zcr,
      voicing,
      snrDb,
      truthSpeech,
    });
  }

  return frames;
}

function runVadModel(
  rawFrames: RawVadFrame[],
  threshold: number,
  endpointDelayMs: number,
  smoothing: number
): { timeline: VadTimelineFrame[]; detectedRanges: TimeRange[] } {
  if (rawFrames.length === 0) return { timeline: [], detectedRanges: [] };

  const frameMs = rawFrames[0].endMs - rawFrames[0].startMs;
  const endpointFrames = Math.max(1, Math.round(endpointDelayMs / Math.max(1, frameMs)));
  const releaseThreshold = Math.max(0.02, threshold - 0.08);

  const timeline: VadTimelineFrame[] = [];
  const detectedRanges: TimeRange[] = [];

  let inSpeech = false;
  let lowScoreFrames = 0;
  let smoothedScore = 0;
  let activeRange: TimeRange | null = null;

  for (let i = 0; i < rawFrames.length; i += 1) {
    const frame = rawFrames[i];
    const snrTerm = clamp01((frame.snrDb + 5) / 25);
    const voicingTerm = clamp01((frame.voicing - 0.2) / 0.7);
    const zcrTerm = clamp01((0.24 - frame.zcr) * 4 + 0.5);
    const instantScore = 0.58 * snrTerm + 0.27 * voicingTerm + 0.15 * zcrTerm;

    smoothedScore = i === 0 ? instantScore : smoothing * smoothedScore + (1 - smoothing) * instantScore;

    let state: VadState = 'silence';

    if (inSpeech) {
      if (smoothedScore < releaseThreshold) {
        lowScoreFrames += 1;
        if (lowScoreFrames >= endpointFrames) {
          inSpeech = false;
          lowScoreFrames = 0;
          state = 'endpoint';
          if (activeRange) {
            activeRange.endMs = frame.startMs;
            detectedRanges.push(activeRange);
            activeRange = null;
          }
        } else {
          state = 'speaking';
        }
      } else {
        lowScoreFrames = 0;
        state = 'speaking';
      }
    } else if (smoothedScore >= threshold) {
      inSpeech = true;
      state = 'speaking';
      lowScoreFrames = 0;
      activeRange = { startMs: frame.startMs, endMs: frame.endMs };
    }

    if (inSpeech && activeRange) {
      activeRange.endMs = frame.endMs;
    }

    timeline.push({
      ...frame,
      score: smoothedScore,
      detectedSpeech: inSpeech,
      state,
    });
  }

  if (activeRange) {
    detectedRanges.push(activeRange);
  }

  return { timeline, detectedRanges };
}

function clipRangesAtTime(ranges: TimeRange[], timeMs: number): TimeRange[] {
  return ranges
    .filter((range) => range.startMs < timeMs)
    .map((range) => ({
      startMs: range.startMs,
      endMs: Math.min(range.endMs, timeMs),
    }))
    .filter((range) => range.endMs > range.startMs);
}

export default function VADDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const lastFrameTsRef = useRef(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  const [pattern, setPattern] = useState<SpeechPattern>('greeting');
  const [threshold, setThreshold] = useState(0.52);
  const [endpointDelayMs, setEndpointDelayMs] = useState(320);
  const [smoothing, setSmoothing] = useState(0.72);
  const [frameMs, setFrameMs] = useState(20);
  const [noiseFloorDb, setNoiseFloorDb] = useState(-33);

  const rawFrames = useMemo(
    () => generateVadFrames(DURATION_MS, frameMs, pattern, noiseFloorDb),
    [frameMs, pattern, noiseFloorDb]
  );

  const truthRanges = useMemo(() => buildRangesFromTruth(rawFrames), [rawFrames]);

  const model = useMemo(
    () => runVadModel(rawFrames, threshold, endpointDelayMs, smoothing),
    [rawFrames, threshold, endpointDelayMs, smoothing]
  );

  const timeline = model.timeline;
  const detectedRanges = model.detectedRanges;

  const frameIndex = useMemo(() => {
    if (timeline.length === 0) return 0;
    return Math.min(timeline.length - 1, Math.floor(currentTimeMs / frameMs));
  }, [timeline.length, currentTimeMs, frameMs]);

  const currentFrame = timeline[frameIndex];
  const currentState: VadState = currentFrame?.state ?? 'silence';
  const activeTruthRanges = useMemo(() => clipRangesAtTime(truthRanges, currentTimeMs), [truthRanges, currentTimeMs]);
  const activeDetectedRanges = useMemo(
    () => clipRangesAtTime(detectedRanges, currentTimeMs),
    [detectedRanges, currentTimeMs]
  );

  const maxRms = useMemo(() => {
    const observed = timeline.reduce((max, frame) => Math.max(max, frame.rms), 0.2);
    return Math.max(0.2, observed);
  }, [timeline]);

  const resetPlayback = useCallback(() => {
    setIsPlaying(false);
    setCurrentTimeMs(0);
    lastFrameTsRef.current = 0;
  }, []);

  useEffect(() => {
    resetPlayback();
  }, [pattern, frameMs, noiseFloorDb, resetPlayback]);

  const animate = useCallback(
    (timestamp: number) => {
      if (lastFrameTsRef.current === 0) lastFrameTsRef.current = timestamp;
      const dt = timestamp - lastFrameTsRef.current;
      lastFrameTsRef.current = timestamp;

      setCurrentTimeMs((prev) => {
        const next = prev + dt;
        if (next >= DURATION_MS) {
          setIsPlaying(false);
          return DURATION_MS;
        }
        return next;
      });

      if (isPlaying) {
        animationRef.current = requestAnimationFrame(animate);
      }
    },
    [isPlaying]
  );

  useEffect(() => {
    if (!isPlaying) return;
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, animate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    const waveformHeight = Math.floor(height * 0.62);
    const scoreTop = waveformHeight + 14;
    const scoreHeight = height - scoreTop - 10;

    ctx.fillStyle = '#131320';
    ctx.fillRect(0, 0, width, height);

    const drawRanges = (ranges: TimeRange[], color: string, y: number, h: number) => {
      ctx.fillStyle = color;
      for (const range of ranges) {
        const x1 = (range.startMs / DURATION_MS) * width;
        const x2 = (range.endMs / DURATION_MS) * width;
        ctx.fillRect(x1, y, Math.max(1, x2 - x1), h);
      }
    };

    // Ground-truth and detected overlays.
    drawRanges(activeTruthRanges, 'rgba(121, 95, 255, 0.14)', 0, waveformHeight);
    drawRanges(activeDetectedRanges, 'rgba(103, 211, 137, 0.18)', 0, waveformHeight);

    // RMS bars.
    timeline.forEach((frame) => {
      const x1 = (frame.startMs / DURATION_MS) * width;
      const x2 = (frame.endMs / DURATION_MS) * width;
      const barW = Math.max(1, x2 - x1 - 1);
      const norm = clamp01(frame.rms / maxRms);
      const barH = norm * (waveformHeight - 14);

      let color = '#4b5563';
      if (frame.truthSpeech && frame.detectedSpeech) color = '#22c55e';
      else if (frame.truthSpeech && !frame.detectedSpeech) color = '#fbbf24';
      else if (!frame.truthSpeech && frame.detectedSpeech) color = '#ef4444';

      ctx.fillStyle = color;
      ctx.fillRect(x1, waveformHeight - barH, barW, barH);
    });

    // Score threshold line.
    const thresholdY = scoreTop + (1 - threshold) * scoreHeight;
    ctx.strokeStyle = 'rgba(255, 211, 105, 0.9)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(0, thresholdY);
    ctx.lineTo(width, thresholdY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Score curve.
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 2;
    ctx.beginPath();
    timeline.forEach((frame, i) => {
      const x = ((frame.startMs + frame.endMs) * 0.5 / DURATION_MS) * width;
      const y = scoreTop + (1 - frame.score) * scoreHeight;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Playhead.
    const playX = (currentTimeMs / DURATION_MS) * width;
    ctx.strokeStyle = '#f87171';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playX, 0);
    ctx.lineTo(playX, height);
    ctx.stroke();

    // Time ticks.
    ctx.fillStyle = '#8b8fa7';
    ctx.font = '10px sans-serif';
    for (let t = 0; t <= DURATION_MS; t += 500) {
      const x = (t / DURATION_MS) * width;
      ctx.fillText(`${t}ms`, x + 2, height - 2);
    }

    // Dividers and labels.
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, waveformHeight + 2);
    ctx.lineTo(width, waveformHeight + 2);
    ctx.stroke();

    ctx.fillStyle = '#c9cce1';
    ctx.font = '11px sans-serif';
    ctx.fillText('RMS energy', 10, 14);
    ctx.fillText('VAD score', 10, scoreTop + 12);
    ctx.fillText('Threshold', width - 72, thresholdY - 4);
  }, [
    timeline,
    threshold,
    currentTimeMs,
    activeTruthRanges,
    activeDetectedRanges,
    maxRms,
  ]);

  const togglePlay = () => {
    if (currentTimeMs >= DURATION_MS) {
      setCurrentTimeMs(0);
    }
    setIsPlaying((prev) => !prev);
  };

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between gap-2 mb-4">
        <h3 className="font-semibold">Voice Activity Detection (Frame-Level Model)</h3>
        <div className="flex gap-2">
          <button
            onClick={togglePlay}
            className={`px-3 py-1 text-xs rounded ${
              isPlaying ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
            }`}
          >
            {isPlaying ? 'Pause' : currentTimeMs >= DURATION_MS ? 'Replay' : 'Play'}
          </button>
          <button
            onClick={resetPlayback}
            className="px-3 py-1 text-xs bg-[var(--surface-2)] rounded hover:bg-[var(--border)]"
          >
            Reset
          </button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={860}
        height={240}
        className="w-full rounded-lg mb-4 border border-[var(--border)]"
      />

      <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              currentState === 'speaking'
                ? 'bg-green-500 animate-pulse'
                : currentState === 'endpoint'
                ? 'bg-yellow-400'
                : 'bg-gray-500'
            }`}
          />
          <span className="font-medium">
            {currentState === 'speaking' ? 'Speaking' : currentState === 'endpoint' ? 'Endpoint' : 'Silence'}
          </span>
        </div>
        <span className="text-[var(--text-muted)]">Time: {currentTimeMs.toFixed(0)}ms</span>
        <span className="text-[var(--text-muted)]">Score: {currentFrame?.score.toFixed(3) ?? '0.000'}</span>
        <span className="text-[var(--text-muted)]">SNR: {currentFrame?.snrDb.toFixed(1) ?? '0.0'} dB</span>
        <span className="text-[var(--text-muted)]">Voicing: {currentFrame?.voicing.toFixed(2) ?? '0.00'}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm mb-2 block">Speech Pattern</label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(PATTERN_LABELS) as SpeechPattern[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setPattern(key)}
                  className={`px-3 py-1 text-xs rounded ${
                    pattern === key ? 'bg-[var(--accent)] text-white' : 'bg-[var(--surface-2)] hover:bg-[var(--border)]'
                  }`}
                >
                  {PATTERN_LABELS[key]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Detection Threshold</span>
              <span className="text-[var(--accent)]">{threshold.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.20"
              max="0.90"
              step="0.01"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Endpoint Delay</span>
              <span className="text-[var(--accent)]">{endpointDelayMs}ms</span>
            </div>
            <input
              type="range"
              min="120"
              max="800"
              step="20"
              value={endpointDelayMs}
              onChange={(e) => setEndpointDelayMs(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Score Smoothing</span>
              <span className="text-[var(--accent)]">{smoothing.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.10"
              max="0.95"
              step="0.01"
              value={smoothing}
              onChange={(e) => setSmoothing(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Frame Size</span>
              <span className="text-[var(--accent)]">{frameMs}ms</span>
            </div>
            <input
              type="range"
              min="10"
              max="40"
              step="10"
              value={frameMs}
              onChange={(e) => setFrameMs(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Noise Floor</span>
              <span className="text-[var(--accent)]">{noiseFloorDb} dB</span>
            </div>
            <input
              type="range"
              min="-50"
              max="-20"
              step="1"
              value={noiseFloorDb}
              onChange={(e) => setNoiseFloorDb(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 text-xs text-[var(--text-muted)] space-y-1">
        <p>Green bars: true-positive speech. Yellow: missed speech. Red: false-positive speech.</p>
        <p>
          The score combines frame RMS/SNR, zero-crossing rate, and normalized autocorrelation (voicing),
          then runs an endpoint state machine with release hysteresis.
        </p>
      </div>
    </div>
  );
}
