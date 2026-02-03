'use client';

import { useState, useEffect, useRef } from 'react';

export function TemporalConsistencyDemo() {
  const [temporalWeight, setTemporalWeight] = useState(0.7);
  const [isPlaying, setIsPlaying] = useState(false);
  const [frame, setFrame] = useState(0);
  const [mode, setMode] = useState<'none' | 'temporal'>('temporal');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const noisePatternRef = useRef<number[][]>([]);
  const previousFrameRef = useRef<number[][]>([]);

  const width = 200;
  const height = 200;
  const gridSize = 20;

  // Initialize noise patterns
  useEffect(() => {
    const pattern: number[][] = [];
    const prev: number[][] = [];
    for (let y = 0; y < gridSize; y++) {
      pattern[y] = [];
      prev[y] = [];
      for (let x = 0; x < gridSize; x++) {
        pattern[y][x] = Math.random();
        prev[y][x] = 0.5;
      }
    }
    noisePatternRef.current = pattern;
    previousFrameRef.current = prev;
  }, []);

  // Animation
  useEffect(() => {
    if (!isPlaying) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    let lastTime = 0;
    const animate = (time: number) => {
      if (time - lastTime > 100) {
        lastTime = time;
        setFrame(f => f + 1);

        // Update noise pattern
        const newPattern: number[][] = [];
        for (let y = 0; y < gridSize; y++) {
          newPattern[y] = [];
          for (let x = 0; x < gridSize; x++) {
            // Base change
            const baseValue = Math.sin(x * 0.3 + frame * 0.1) * 0.3 + 0.5 +
                             Math.cos(y * 0.2 + frame * 0.15) * 0.2;
            const noise = (Math.random() - 0.5) * 0.3;
            newPattern[y][x] = Math.max(0, Math.min(1, baseValue + noise));
          }
        }
        noisePatternRef.current = newPattern;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, frame]);

  // Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width * 2 + 20, height);

    const cellWidth = width / gridSize;
    const cellHeight = height / gridSize;

    // Left panel: No temporal consistency
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const value = noisePatternRef.current[y]?.[x] ?? 0.5;
        const brightness = Math.floor(value * 255);
        ctx.fillStyle = `rgb(${brightness}, ${brightness * 0.9}, ${brightness * 0.8})`;
        ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth - 1, cellHeight - 1);
      }
    }

    // Right panel: With temporal consistency
    const offsetX = width + 20;
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const currentValue = noisePatternRef.current[y]?.[x] ?? 0.5;
        const previousValue = previousFrameRef.current[y]?.[x] ?? 0.5;

        // Blend current with previous based on temporal weight
        const blendedValue = mode === 'temporal'
          ? previousValue * temporalWeight + currentValue * (1 - temporalWeight)
          : currentValue;

        previousFrameRef.current[y][x] = blendedValue;

        const brightness = Math.floor(blendedValue * 255);
        ctx.fillStyle = `rgb(${brightness}, ${brightness * 0.9}, ${brightness * 0.8})`;
        ctx.fillRect(offsetX + x * cellWidth, y * cellHeight, cellWidth - 1, cellHeight - 1);
      }
    }

    // Labels
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('No Temporal', width / 2, height - 5);
    ctx.fillText('With Temporal', offsetX + width / 2, height - 5);

    // Frame counter
    ctx.textAlign = 'left';
    ctx.fillText(`Frame: ${frame}`, 5, 15);

  }, [frame, temporalWeight, mode]);

  return (
    <div className="card p-6">
      <h3 className="font-semibold mb-2">Temporal Consistency</h3>
      <p className="text-sm text-[var(--muted)] mb-6">
        Video generation requires frame-to-frame coherence. Without temporal consistency,
        each frame flickers independently. With it, changes are smooth and natural.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Canvas */}
        <div>
          <canvas
            ref={canvasRef}
            width={width * 2 + 20}
            height={height}
            className="w-full rounded-lg border border-[var(--border)]"
          />

          {/* Controls */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex-1 py-2 rounded font-medium text-sm transition-colors ${
                isPlaying ? 'bg-red-500 text-white' : 'bg-[var(--accent)] text-white'
              }`}
            >
              {isPlaying ? 'Stop' : 'Play'}
            </button>
            <button
              onClick={() => setFrame(0)}
              className="badge"
            >
              Reset
            </button>
          </div>

          {/* Comparison info */}
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-[var(--card-bg-alt)] rounded text-center">
              <p className="font-medium">Left: Raw Output</p>
              <p className="text-[var(--muted)]">Each frame independent</p>
            </div>
            <div className="p-2 bg-[var(--card-bg-alt)] rounded text-center">
              <p className="font-medium">Right: Temporally Smoothed</p>
              <p className="text-[var(--muted)]">Blended with previous</p>
            </div>
          </div>
        </div>

        {/* Parameters */}
        <div className="space-y-4">
          <div className="p-4 bg-[var(--card-bg-alt)] rounded">
            <div className="flex justify-between text-sm mb-2">
              <span>Temporal Weight</span>
              <span className="font-mono">{temporalWeight.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={0.95}
              step={0.05}
              value={temporalWeight}
              onChange={(e) => setTemporalWeight(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-[var(--muted)] mt-1">
              <span>No smoothing</span>
              <span>Heavy smoothing</span>
            </div>
          </div>

          <div className="p-4 bg-[var(--card-bg-alt)] rounded">
            <p className="font-medium text-sm mb-2">Techniques Used</p>
            <div className="space-y-2 text-xs text-[var(--muted)]">
              <div className="p-2 bg-[var(--card-bg)] rounded">
                <span className="font-medium text-[var(--foreground)]">Latent Blending:</span>
                <span> Interpolate latent codes between frames</span>
              </div>
              <div className="p-2 bg-[var(--card-bg)] rounded">
                <span className="font-medium text-[var(--foreground)]">Cross-Frame Attention:</span>
                <span> Attend to previous frame features</span>
              </div>
              <div className="p-2 bg-[var(--card-bg)] rounded">
                <span className="font-medium text-[var(--foreground)]">Motion Prior:</span>
                <span> Predict expected change from audio</span>
              </div>
              <div className="p-2 bg-[var(--card-bg)] rounded">
                <span className="font-medium text-[var(--foreground)]">Optical Flow:</span>
                <span> Warp previous frame as initialization</span>
              </div>
            </div>
          </div>

          <div className="p-3 border border-[var(--border)] rounded text-sm">
            <p className="font-medium mb-1">For Talking Heads</p>
            <p className="text-xs text-[var(--muted)]">
              Avatar systems must balance temporal consistency with responsiveness.
              Too much smoothing = laggy lip sync. Too little = jittery video.
              Most systems use ~0.6-0.8 weight with audio-aware adjustments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TemporalConsistencyDemo;
