'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

// Viseme shapes for different sounds
const visemes: Record<string, Record<string, number>> = {
  'rest': { jawOpen: 0, mouthSmile: 0, mouthPucker: 0, mouthFunnel: 0 },
  'AA': { jawOpen: 0.8, mouthSmile: 0.2, mouthPucker: 0, mouthFunnel: 0 },
  'EE': { jawOpen: 0.3, mouthSmile: 0.7, mouthPucker: 0, mouthFunnel: 0 },
  'IH': { jawOpen: 0.4, mouthSmile: 0.5, mouthPucker: 0, mouthFunnel: 0 },
  'OH': { jawOpen: 0.6, mouthSmile: 0, mouthPucker: 0.3, mouthFunnel: 0.5 },
  'OO': { jawOpen: 0.3, mouthSmile: 0, mouthPucker: 0.8, mouthFunnel: 0.3 },
  'PP': { jawOpen: 0, mouthSmile: 0, mouthPucker: 0.6, mouthFunnel: 0 },
  'FF': { jawOpen: 0.2, mouthSmile: 0.2, mouthPucker: 0, mouthFunnel: 0.4 },
  'TH': { jawOpen: 0.3, mouthSmile: 0.1, mouthPucker: 0, mouthFunnel: 0.2 },
  'SS': { jawOpen: 0.2, mouthSmile: 0.4, mouthPucker: 0, mouthFunnel: 0 },
};

// Phrases with phoneme timing
const phrases: Record<string, { text: string; phonemes: { viseme: string; duration: number }[] }> = {
  'hello': {
    text: 'Hello',
    phonemes: [
      { viseme: 'rest', duration: 100 },
      { viseme: 'EE', duration: 150 },
      { viseme: 'IH', duration: 100 },
      { viseme: 'OH', duration: 200 },
      { viseme: 'OO', duration: 150 },
      { viseme: 'rest', duration: 200 },
    ]
  },
  'avatar': {
    text: 'Avatar',
    phonemes: [
      { viseme: 'rest', duration: 100 },
      { viseme: 'AA', duration: 200 },
      { viseme: 'FF', duration: 100 },
      { viseme: 'AA', duration: 150 },
      { viseme: 'TH', duration: 100 },
      { viseme: 'AA', duration: 150 },
      { viseme: 'rest', duration: 200 },
    ]
  },
  'speech': {
    text: 'Speech Synthesis',
    phonemes: [
      { viseme: 'rest', duration: 100 },
      { viseme: 'SS', duration: 150 },
      { viseme: 'PP', duration: 100 },
      { viseme: 'EE', duration: 200 },
      { viseme: 'TH', duration: 100 },
      { viseme: 'rest', duration: 100 },
      { viseme: 'SS', duration: 150 },
      { viseme: 'IH', duration: 100 },
      { viseme: 'TH', duration: 100 },
      { viseme: 'IH', duration: 100 },
      { viseme: 'SS', duration: 150 },
      { viseme: 'IH', duration: 100 },
      { viseme: 'SS', duration: 150 },
      { viseme: 'rest', duration: 200 },
    ]
  },
  'ooh_aah': {
    text: 'Ooh Aah',
    phonemes: [
      { viseme: 'rest', duration: 100 },
      { viseme: 'OO', duration: 300 },
      { viseme: 'rest', duration: 150 },
      { viseme: 'AA', duration: 300 },
      { viseme: 'rest', duration: 200 },
    ]
  }
};

export default function AudioToExpressionDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentPhrase, setCurrentPhrase] = useState<string>('hello');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentViseme, setCurrentViseme] = useState<string>('rest');
  const [blendshapes, setBlendshapes] = useState(visemes.rest);
  const [smoothing, setSmoothing] = useState(0.3);
  const [manualViseme, setManualViseme] = useState<string | null>(null);

  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const targetBlendshapesRef = useRef(visemes.rest);

  // Calculate total duration
  const getTotalDuration = useCallback(() => {
    return phrases[currentPhrase].phonemes.reduce((sum, p) => sum + p.duration, 0);
  }, [currentPhrase]);

  // Get current viseme based on time
  const getCurrentViseme = useCallback((time: number) => {
    const phonemes = phrases[currentPhrase].phonemes;
    let elapsed = 0;
    for (const phoneme of phonemes) {
      elapsed += phoneme.duration;
      if (time < elapsed) {
        return phoneme.viseme;
      }
    }
    return 'rest';
  }, [currentPhrase]);

  // Animation loop
  const animate = useCallback((timestamp: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const delta = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    setCurrentTime(prev => {
      const totalDuration = getTotalDuration();
      const next = prev + delta;
      if (next >= totalDuration) {
        setIsPlaying(false);
        return totalDuration;
      }
      return next;
    });

    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [isPlaying, getTotalDuration]);

  useEffect(() => {
    if (isPlaying) {
      lastTimeRef.current = 0;
      animationRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, animate]);

  // Update viseme based on time or manual selection
  useEffect(() => {
    if (manualViseme) {
      setCurrentViseme(manualViseme);
      targetBlendshapesRef.current = visemes[manualViseme];
    } else if (isPlaying) {
      const viseme = getCurrentViseme(currentTime);
      setCurrentViseme(viseme);
      targetBlendshapesRef.current = visemes[viseme];
    }
  }, [currentTime, isPlaying, manualViseme, getCurrentViseme]);

  // Smooth blendshape interpolation
  useEffect(() => {
    const interval = setInterval(() => {
      setBlendshapes(prev => {
        const target = targetBlendshapesRef.current;
        const result: Record<string, number> = {};
        for (const key of Object.keys(prev)) {
          result[key] = prev[key] + (target[key] - prev[key]) * (1 - smoothing);
        }
        return result;
      });
    }, 16);
    return () => clearInterval(interval);
  }, [smoothing]);

  // Draw face
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    // Clear
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    // Face outline
    ctx.strokeStyle = '#6a6a8e';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, 80, 100, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Eyes
    const eyeY = centerY - 25;
    const eyeSpacing = 35;

    // Left eye
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(centerX - eyeSpacing, eyeY, 12, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(centerX - eyeSpacing, eyeY, 4, 0, Math.PI * 2);
    ctx.fill();

    // Right eye
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(centerX + eyeSpacing, eyeY, 12, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(centerX + eyeSpacing, eyeY, 4, 0, Math.PI * 2);
    ctx.fill();

    // Mouth
    const mouthY = centerY + 35;
    const jawOpen = blendshapes.jawOpen;
    const mouthSmile = blendshapes.mouthSmile;
    const mouthPucker = blendshapes.mouthPucker;
    const mouthFunnel = blendshapes.mouthFunnel;

    // Calculate mouth shape
    const mouthWidth = 40 - mouthPucker * 25 + mouthSmile * 10;
    const mouthHeight = 5 + jawOpen * 30;
    const mouthRoundness = mouthFunnel * 0.5;

    // Outer mouth
    ctx.fillStyle = '#8b5a5a';
    ctx.beginPath();
    ctx.ellipse(
      centerX,
      mouthY + jawOpen * 10,
      mouthWidth,
      mouthHeight,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Inner mouth (teeth/darkness)
    if (jawOpen > 0.1) {
      ctx.fillStyle = '#2a1a1a';
      ctx.beginPath();
      ctx.ellipse(
        centerX,
        mouthY + jawOpen * 10,
        mouthWidth * 0.7,
        mouthHeight * 0.6,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Teeth
      if (jawOpen > 0.3) {
        ctx.fillStyle = '#eee';
        ctx.fillRect(
          centerX - mouthWidth * 0.5,
          mouthY + jawOpen * 5 - 3,
          mouthWidth,
          6
        );
      }
    }

    // Smile curves
    if (mouthSmile > 0.2) {
      ctx.strokeStyle = '#8b5a5a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX - 30, mouthY, 10, 0, Math.PI * 0.5);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(centerX + 30, mouthY, 10, Math.PI * 0.5, Math.PI);
      ctx.stroke();
    }

    // Current viseme label
    ctx.fillStyle = '#ffd93d';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(currentViseme, centerX, height - 20);

  }, [blendshapes, currentViseme]);

  const reset = () => {
    setCurrentTime(0);
    setIsPlaying(false);
    setCurrentViseme('rest');
    targetBlendshapesRef.current = visemes.rest;
    setManualViseme(null);
  };

  const togglePlay = () => {
    setManualViseme(null);
    if (currentTime >= getTotalDuration()) {
      reset();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Audio-to-Expression Demo</h3>
        <div className="flex gap-2">
          <button
            onClick={togglePlay}
            className={`px-3 py-1 text-xs rounded ${
              isPlaying ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
            }`}
          >
            {isPlaying ? 'Pause' : currentTime >= getTotalDuration() ? 'Replay' : 'Play'}
          </button>
          <button
            onClick={reset}
            className="px-3 py-1 text-xs bg-[var(--card-bg-alt)] rounded hover:bg-[var(--border)]"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Face visualization */}
        <div className="text-center">
          <canvas
            ref={canvasRef}
            width={250}
            height={280}
            className="mx-auto rounded-lg"
          />
          <p className="text-lg font-medium mt-2">{phrases[currentPhrase].text}</p>
        </div>

        {/* Controls and blendshapes */}
        <div className="space-y-4">
          {/* Phrase selection */}
          <div>
            <label className="text-sm mb-2 block">Select Phrase</label>
            <div className="flex flex-wrap gap-2">
              {Object.keys(phrases).map(phrase => (
                <button
                  key={phrase}
                  onClick={() => { setCurrentPhrase(phrase); reset(); }}
                  className={`px-3 py-1 text-xs rounded ${
                    currentPhrase === phrase
                      ? 'bg-[var(--accent)] text-white'
                      : 'bg-[var(--card-bg-alt)] hover:bg-[var(--border)]'
                  }`}
                >
                  {phrases[phrase].text}
                </button>
              ))}
            </div>
          </div>

          {/* Manual viseme selection */}
          <div>
            <label className="text-sm mb-2 block">Try Individual Visemes</label>
            <div className="flex flex-wrap gap-1">
              {Object.keys(visemes).map(v => (
                <button
                  key={v}
                  onClick={() => { setIsPlaying(false); setManualViseme(v); }}
                  onMouseEnter={() => { if (!isPlaying) setManualViseme(v); }}
                  onMouseLeave={() => { if (!isPlaying && manualViseme === v) setManualViseme('rest'); }}
                  className={`px-2 py-1 text-xs rounded ${
                    currentViseme === v
                      ? 'bg-[var(--accent)] text-white'
                      : 'bg-[var(--card-bg-alt)] hover:bg-[var(--border)]'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Smoothing */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Smoothing</span>
              <span className="text-[var(--accent)]">{smoothing.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="0.8"
              step="0.05"
              value={smoothing}
              onChange={(e) => setSmoothing(parseFloat(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-[var(--muted)]">Higher = smoother transitions</p>
          </div>

          {/* Blendshape values */}
          <div className="p-3 bg-[var(--card-bg-alt)] rounded">
            <p className="text-xs text-[var(--muted)] mb-2">Current Blendshapes:</p>
            <div className="space-y-1">
              {Object.entries(blendshapes).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="text-xs w-24">{key}</span>
                  <div className="flex-1 h-2 bg-[var(--card-bg)] rounded">
                    <div
                      className="h-full bg-[var(--accent)] rounded"
                      style={{ width: `${value * 100}%` }}
                    />
                  </div>
                  <span className="text-xs w-8">{value.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-[var(--muted)] mt-4">
        This demonstrates how phonemes (speech sounds) map to visemes (mouth shapes).
        Neural audio-to-expression models learn these mappings from video data automatically.
      </p>
    </div>
  );
}
