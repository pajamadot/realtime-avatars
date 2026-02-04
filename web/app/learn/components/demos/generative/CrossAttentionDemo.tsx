'use client';

import { useState, useEffect, useRef } from 'react';

interface AttentionWeight {
  queryIdx: number;
  keyIdx: number;
  weight: number;
}

const IMAGE_TOKENS = ['face', 'hair', 'eye_L', 'eye_R', 'nose', 'mouth', 'chin', 'ear'];
const AUDIO_TOKENS = ['silence', 'ah', 'ee', 'oh', 'mm', 'silence'];

export function CrossAttentionDemo() {
  const [selectedImageToken, setSelectedImageToken] = useState<number | null>(null);
  const [selectedAudioToken, setSelectedAudioToken] = useState<number | null>(null);
  const [attentionWeights, setAttentionWeights] = useState<number[][]>([]);
  const [audioFrame, setAudioFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [temperature, setTemperature] = useState(1.0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  // Generate attention weights based on semantic relationships
  useEffect(() => {
    const weights: number[][] = [];

    // Define semantic relationships (which audio affects which image region)
    const relationships: Record<string, Record<string, number>> = {
      'ah': { 'mouth': 0.9, 'chin': 0.4, 'face': 0.3 },
      'ee': { 'mouth': 0.8, 'face': 0.3 },
      'oh': { 'mouth': 0.95, 'chin': 0.5, 'face': 0.2 },
      'mm': { 'mouth': 0.7, 'nose': 0.2 },
      'silence': { 'face': 0.5, 'eye_L': 0.3, 'eye_R': 0.3 },
    };

    for (let i = 0; i < IMAGE_TOKENS.length; i++) {
      const row: number[] = [];
      for (let j = 0; j < AUDIO_TOKENS.length; j++) {
        const audioToken = AUDIO_TOKENS[j];
        const imageToken = IMAGE_TOKENS[i];
        const baseWeight = relationships[audioToken]?.[imageToken] || 0.1;
        // Add some noise and apply temperature
        const noisyWeight = baseWeight + (Math.random() - 0.5) * 0.1;
        row.push(Math.max(0, Math.min(1, noisyWeight)));
      }
      weights.push(row);
    }

    // Apply softmax with temperature
    const softmaxWeights = weights.map(row => {
      const scaled = row.map(w => Math.exp(w / temperature));
      const sum = scaled.reduce((a, b) => a + b, 0);
      return scaled.map(w => w / sum);
    });

    setAttentionWeights(softmaxWeights);
  }, [temperature]);

  // Animation
  useEffect(() => {
    if (!isPlaying) return;

    const animate = () => {
      setAudioFrame(prev => (prev + 1) % AUDIO_TOKENS.length);
      animationRef.current = window.setTimeout(() => {
        animationRef.current = requestAnimationFrame(animate) as unknown as number;
      }, 500) as unknown as number;
    };

    animationRef.current = requestAnimationFrame(animate) as unknown as number;
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        clearTimeout(animationRef.current);
      }
    };
  }, [isPlaying]);

  // Render attention visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || attentionWeights.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const leftX = 80;
    const rightX = width - 80;
    const imageSpacing = height / (IMAGE_TOKENS.length + 1);
    const audioSpacing = height / (AUDIO_TOKENS.length + 1);

    // Draw attention lines
    for (let i = 0; i < IMAGE_TOKENS.length; i++) {
      for (let j = 0; j < AUDIO_TOKENS.length; j++) {
        const weight = attentionWeights[i][j];
        if (weight < 0.05) continue;

        const isHighlighted =
          (selectedImageToken === i) ||
          (selectedAudioToken === j) ||
          (isPlaying && j === audioFrame);

        const startY = audioSpacing * (j + 1);
        const endY = imageSpacing * (i + 1);

        ctx.strokeStyle = isHighlighted
          ? `rgba(255, 107, 107, ${weight})`
          : `rgba(78, 205, 196, ${weight * 0.5})`;
        ctx.lineWidth = isHighlighted ? weight * 8 : weight * 4;

        ctx.beginPath();
        ctx.moveTo(rightX, startY);
        ctx.bezierCurveTo(
          rightX - 50, startY,
          leftX + 50, endY,
          leftX, endY
        );
        ctx.stroke();
      }
    }

    // Draw image tokens (left side - Query)
    IMAGE_TOKENS.forEach((token, i) => {
      const y = imageSpacing * (i + 1);
      const isHighlighted = selectedImageToken === i;

      ctx.fillStyle = isHighlighted ? '#ff6b6b' : '#4ecdc4';
      ctx.beginPath();
      ctx.roundRect(10, y - 12, 60, 24, 4);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(token, 40, y);
    });

    // Draw audio tokens (right side - Key/Value)
    AUDIO_TOKENS.forEach((token, j) => {
      const y = audioSpacing * (j + 1);
      const isHighlighted = selectedAudioToken === j || (isPlaying && j === audioFrame);

      ctx.fillStyle = isHighlighted ? '#ffd93d' : '#9b59b6';
      ctx.beginPath();
      ctx.roundRect(width - 70, y - 12, 60, 24, 4);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(token, width - 40, y);
    });

    // Labels
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Image (Query)', 40, height - 10);
    ctx.fillText('Audio (Key)', width - 40, height - 10);

  }, [attentionWeights, selectedImageToken, selectedAudioToken, audioFrame, isPlaying]);

  return (
    <div className="card p-6">
      <h3 className="font-semibold mb-2">Cross-Attention Visualizer</h3>
      <p className="text-sm text-[var(--text-muted)] mb-6">
        See how audio tokens guide which parts of the image to modify. This is how diffusion models
        know to move the mouth when you say "ah" but keep the eyes still.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Visualization */}
        <div>
          <canvas
            ref={canvasRef}
            width={400}
            height={320}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)]"
          />

          {/* Controls */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex-1 py-2 rounded font-medium text-sm transition-colors ${
                isPlaying ? 'bg-red-500 text-white' : 'bg-[var(--accent)] text-white'
              }`}
            >
              {isPlaying ? 'Stop' : 'Animate Audio'}
            </button>
            <button
              onClick={() => {
                setSelectedImageToken(null);
                setSelectedAudioToken(null);
              }}
              className="badge hover:border-[var(--border-strong)]"
            >
              Clear Selection
            </button>
          </div>
        </div>

        {/* Controls panel */}
        <div className="space-y-4">
          {/* Temperature */}
          <div className="p-4 bg-[var(--surface-2)] rounded">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">Attention Temperature</span>
              <span className="font-mono">{temperature.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min={0.1}
              max={2.0}
              step={0.1}
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Low = sharp focus on few tokens, High = diffuse attention
            </p>
          </div>

          {/* Token selectors */}
          <div className="p-4 bg-[var(--surface-2)] rounded">
            <p className="font-medium text-sm mb-2">Select Image Region</p>
            <div className="flex flex-wrap gap-1">
              {IMAGE_TOKENS.map((token, i) => (
                <button
                  key={token}
                  onClick={() => setSelectedImageToken(selectedImageToken === i ? null : i)}
                  className={`px-2 py-1 rounded text-xs transition-colors ${
                    selectedImageToken === i
                      ? 'bg-[#ff6b6b] text-white'
                      : 'bg-[var(--surface-0)] hover:bg-[var(--border)]'
                  }`}
                >
                  {token}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 bg-[var(--surface-2)] rounded">
            <p className="font-medium text-sm mb-2">Select Audio Token</p>
            <div className="flex flex-wrap gap-1">
              {AUDIO_TOKENS.map((token, j) => (
                <button
                  key={`${token}-${j}`}
                  onClick={() => setSelectedAudioToken(selectedAudioToken === j ? null : j)}
                  className={`px-2 py-1 rounded text-xs transition-colors ${
                    selectedAudioToken === j
                      ? 'bg-[#ffd93d] text-black'
                      : 'bg-[var(--surface-0)] hover:bg-[var(--border)]'
                  }`}
                >
                  {token}
                </button>
              ))}
            </div>
          </div>

          {/* Attention matrix */}
          {selectedImageToken !== null && (
            <div className="p-4 bg-[var(--surface-2)] rounded">
              <p className="font-medium text-sm mb-2">
                Attention for "{IMAGE_TOKENS[selectedImageToken]}"
              </p>
              <div className="space-y-1">
                {AUDIO_TOKENS.map((token, j) => (
                  <div key={j} className="flex items-center gap-2 text-xs">
                    <span className="w-12">{token}</span>
                    <div className="flex-1 h-3 bg-[var(--surface-0)] rounded overflow-hidden">
                      <div
                        className="h-full bg-[var(--accent)]"
                        style={{ width: `${(attentionWeights[selectedImageToken]?.[j] || 0) * 100}%` }}
                      />
                    </div>
                    <span className="font-mono w-10">
                      {((attentionWeights[selectedImageToken]?.[j] || 0) * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Explanation */}
      <div className="mt-6 p-4 bg-[var(--surface-2)] rounded">
        <p className="font-medium mb-2">How Cross-Attention Works</p>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-[var(--text-muted)]">
          <div>
            <p className="font-medium text-[var(--foreground)] mb-1">Query (Image)</p>
            <p>"What information do I need?" - each image region asks what audio to attend to</p>
          </div>
          <div>
            <p className="font-medium text-[var(--foreground)] mb-1">Key (Audio)</p>
            <p>"Here's what I represent" - audio tokens provide their semantic meaning</p>
          </div>
          <div>
            <p className="font-medium text-[var(--foreground)] mb-1">Value (Audio)</p>
            <p>"Here's my actual content" - weighted sum of audio features guides denoising</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CrossAttentionDemo;
