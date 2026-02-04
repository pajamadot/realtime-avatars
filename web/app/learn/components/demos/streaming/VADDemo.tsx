'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface AudioSegment {
  start: number;
  end: number;
  isSpeech: boolean;
  amplitude: number;
}

// Simulated audio with speech and silence patterns
function generateSimulatedAudio(duration: number, speechPattern: 'greeting' | 'question' | 'pause' | 'random'): AudioSegment[] {
  const segments: AudioSegment[] = [];
  let time = 0;
  const segmentDuration = 50; // 50ms segments

  // Different speech patterns
  const patterns: Record<string, number[]> = {
    greeting: [0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
    question: [0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0],
    pause: [0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
    random: Array(20).fill(0).map(() => Math.random() > 0.4 ? 1 : 0)
  };

  const pattern = patterns[speechPattern];

  while (time < duration) {
    const patternIndex = Math.floor((time / segmentDuration) % pattern.length);
    const isSpeech = pattern[patternIndex] === 1;
    const baseAmplitude = isSpeech ? 0.4 + Math.random() * 0.5 : 0.05 + Math.random() * 0.1;

    segments.push({
      start: time,
      end: time + segmentDuration,
      isSpeech,
      amplitude: baseAmplitude
    });

    time += segmentDuration;
  }

  return segments;
}

export default function VADDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [vadThreshold, setVadThreshold] = useState(0.3);
  const [endpointDelay, setEndpointDelay] = useState(500);
  const [speechPattern, setSpeechPattern] = useState<'greeting' | 'question' | 'pause' | 'random'>('greeting');
  const [segments, setSegments] = useState<AudioSegment[]>([]);
  const [vadState, setVadState] = useState<'silence' | 'speaking' | 'endpoint'>('silence');
  const [silenceStart, setSilenceStart] = useState<number | null>(null);
  const [detectedSpeechRanges, setDetectedSpeechRanges] = useState<{start: number, end: number}[]>([]);

  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  const duration = 2000; // 2 seconds

  // Generate audio on pattern change
  useEffect(() => {
    setSegments(generateSimulatedAudio(duration, speechPattern));
    setCurrentTime(0);
    setVadState('silence');
    setSilenceStart(null);
    setDetectedSpeechRanges([]);
  }, [speechPattern]);

  // VAD logic
  useEffect(() => {
    if (!isPlaying) return;

    const currentSegment = segments.find(s => s.start <= currentTime && s.end > currentTime);
    if (!currentSegment) return;

    const isSpeechDetected = currentSegment.amplitude >= vadThreshold;

    if (isSpeechDetected) {
      if (vadState === 'silence' || vadState === 'endpoint') {
        setVadState('speaking');
        setSilenceStart(null);
        // Start new speech range
        setDetectedSpeechRanges(prev => [...prev, { start: currentTime, end: currentTime }]);
      } else {
        // Update current speech range
        setDetectedSpeechRanges(prev => {
          if (prev.length === 0) return prev;
          const updated = [...prev];
          updated[updated.length - 1].end = currentTime;
          return updated;
        });
      }
    } else {
      if (vadState === 'speaking') {
        if (silenceStart === null) {
          setSilenceStart(currentTime);
        } else if (currentTime - silenceStart >= endpointDelay) {
          setVadState('endpoint');
        }
      }
    }
  }, [currentTime, isPlaying, segments, vadThreshold, endpointDelay, vadState, silenceStart]);

  // Animation loop
  const animate = useCallback((timestamp: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const delta = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    setCurrentTime(prev => {
      const next = prev + delta;
      if (next >= duration) {
        setIsPlaying(false);
        return duration;
      }
      return next;
    });

    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      lastTimeRef.current = 0;
      animationRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, animate]);

  // Draw waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    // Draw threshold line
    const thresholdY = height / 2 - (vadThreshold * height / 2);
    ctx.strokeStyle = 'rgba(255, 200, 100, 0.5)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, thresholdY);
    ctx.lineTo(width, thresholdY);
    ctx.stroke();
    ctx.moveTo(0, height - thresholdY);
    ctx.lineTo(width, height - thresholdY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw detected speech ranges (background)
    ctx.fillStyle = 'rgba(100, 200, 100, 0.1)';
    detectedSpeechRanges.forEach(range => {
      const x1 = (range.start / duration) * width;
      const x2 = (range.end / duration) * width;
      ctx.fillRect(x1, 0, x2 - x1, height);
    });

    // Draw waveform
    segments.forEach(segment => {
      const x1 = (segment.start / duration) * width;
      const x2 = (segment.end / duration) * width;
      const segmentWidth = x2 - x1;

      // Color based on speech vs silence and threshold
      const isAboveThreshold = segment.amplitude >= vadThreshold;
      if (segment.isSpeech) {
        ctx.fillStyle = isAboveThreshold ? '#6bcb77' : '#ffd93d';
      } else {
        ctx.fillStyle = isAboveThreshold ? '#ffd93d' : '#4a4a6e';
      }

      // Draw amplitude bar
      const barHeight = segment.amplitude * height / 2;
      ctx.fillRect(x1, height / 2 - barHeight, segmentWidth - 1, barHeight * 2);
    });

    // Draw playhead
    const playheadX = (currentTime / duration) * width;
    ctx.strokeStyle = '#ff6b6b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, height);
    ctx.stroke();

    // Draw time markers
    ctx.fillStyle = '#6a6a8e';
    ctx.font = '10px sans-serif';
    for (let t = 0; t <= duration; t += 500) {
      const x = (t / duration) * width;
      ctx.fillText(`${t}ms`, x + 2, height - 4);
    }

  }, [segments, currentTime, vadThreshold, detectedSpeechRanges, duration]);

  const reset = () => {
    setCurrentTime(0);
    setIsPlaying(false);
    setVadState('silence');
    setSilenceStart(null);
    setDetectedSpeechRanges([]);
    setSegments(generateSimulatedAudio(duration, speechPattern));
  };

  const togglePlay = () => {
    if (currentTime >= duration) {
      reset();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Voice Activity Detection Demo</h3>
        <div className="flex gap-2">
          <button
            onClick={togglePlay}
            className={`px-3 py-1 text-xs rounded ${
              isPlaying ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
            }`}
          >
            {isPlaying ? 'Pause' : currentTime >= duration ? 'Replay' : 'Play'}
          </button>
          <button
            onClick={reset}
            className="px-3 py-1 text-xs bg-[var(--surface-2)] rounded hover:bg-[var(--border)]"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Waveform */}
      <canvas
        ref={canvasRef}
        width={600}
        height={120}
        className="w-full rounded-lg mb-4"
      />

      {/* VAD State indicator */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            vadState === 'speaking' ? 'bg-green-500 animate-pulse' :
            vadState === 'endpoint' ? 'bg-yellow-500' : 'bg-gray-500'
          }`} />
          <span className="text-sm font-medium">
            {vadState === 'speaking' ? 'Speech Detected' :
             vadState === 'endpoint' ? 'Endpoint (User Done)' : 'Silence'}
          </span>
        </div>
        <div className="text-sm text-[var(--text-muted)]">
          Time: {currentTime.toFixed(0)}ms
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-4">
          {/* Speech Pattern */}
          <div>
            <label className="text-sm mb-2 block">Speech Pattern</label>
            <div className="flex flex-wrap gap-2">
              {(['greeting', 'question', 'pause', 'random'] as const).map(pattern => (
                <button
                  key={pattern}
                  onClick={() => { setSpeechPattern(pattern); reset(); }}
                  className={`px-3 py-1 text-xs rounded ${
                    speechPattern === pattern
                      ? 'bg-[var(--accent)] text-white'
                      : 'bg-[var(--surface-2)] hover:bg-[var(--border)]'
                  }`}
                >
                  {pattern}
                </button>
              ))}
            </div>
          </div>

          {/* VAD Threshold */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>VAD Threshold</span>
              <span className="text-[var(--accent)]">{vadThreshold.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="0.6"
              step="0.05"
              value={vadThreshold}
              onChange={(e) => setVadThreshold(parseFloat(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-[var(--text-muted)]">Higher = more aggressive filtering</p>
          </div>

          {/* Endpoint Delay */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Endpoint Delay</span>
              <span className="text-[var(--accent)]">{endpointDelay}ms</span>
            </div>
            <input
              type="range"
              min="200"
              max="1000"
              step="100"
              value={endpointDelay}
              onChange={(e) => setEndpointDelay(parseInt(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-[var(--text-muted)]">Silence before considering user done</p>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-3">
          <div className="p-3 bg-[var(--surface-2)] rounded text-sm">
            <p className="font-medium mb-2">How VAD Works:</p>
            <ol className="list-decimal list-inside space-y-1 text-[var(--text-muted)]">
              <li>Audio amplitude compared to threshold</li>
              <li>Above threshold = speech detected</li>
              <li>Below threshold for endpoint delay = user done</li>
              <li>Endpoint triggers STT transcription</li>
            </ol>
          </div>
          <div className="space-y-1 text-xs">
            <p><span className="inline-block w-3 h-3 rounded bg-[#6bcb77] mr-2"></span>True speech (above threshold)</p>
            <p><span className="inline-block w-3 h-3 rounded bg-[#ffd93d] mr-2"></span>Ambiguous (near threshold)</p>
            <p><span className="inline-block w-3 h-3 rounded bg-[#4a4a6e] mr-2"></span>Silence / noise</p>
            <p><span className="inline-block w-3 h-3 rounded bg-green-500/20 mr-2"></span>Detected speech range</p>
          </div>
        </div>
      </div>

      <p className="text-xs text-[var(--text-muted)] mt-4">
        Try different thresholds and endpoint delays to see how they affect detection.
        Too aggressive cuts off speech; too lenient adds latency.
      </p>
    </div>
  );
}
