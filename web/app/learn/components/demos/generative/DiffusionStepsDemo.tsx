'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface ImageState {
  steps: number;
  canvas: HTMLCanvasElement | null;
  generating: boolean;
}

const STEP_CONFIGS = [
  { steps: 4, label: '4 steps', desc: 'Fastest, lower quality', timeMs: 200 },
  { steps: 10, label: '10 steps', desc: 'Fast, decent quality', timeMs: 400 },
  { steps: 25, label: '25 steps', desc: 'Balanced', timeMs: 800 },
  { steps: 50, label: '50 steps', desc: 'High quality', timeMs: 1500 },
];

export function DiffusionStepsDemo() {
  const [images, setImages] = useState<Map<number, ImageData>>(new Map());
  const [generating, setGenerating] = useState(false);
  const [seed, setSeed] = useState(12345);
  const canvasRefs = useRef<Map<number, HTMLCanvasElement>>(new Map());
  const imageSize = 128;

  // Seeded random number generator
  const seededRandom = useCallback((seed: number, index: number) => {
    const x = Math.sin(seed + index * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  }, []);

  // Generate a simple face-like pattern as target
  const generateTargetPattern = useCallback((ctx: CanvasRenderingContext2D, size: number) => {
    // Background gradient
    const gradient = ctx.createRadialGradient(
      size / 2, size / 2.2, size * 0.05,
      size / 2, size / 2, size * 0.5
    );
    gradient.addColorStop(0, '#ffdbac');
    gradient.addColorStop(0.6, '#e0ac69');
    gradient.addColorStop(1, '#8b6914');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(size / 2, size / 2, size * 0.4, size * 0.48, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(size * 0.35, size * 0.4, size * 0.07, size * 0.04, 0, 0, Math.PI * 2);
    ctx.ellipse(size * 0.65, size * 0.4, size * 0.07, size * 0.04, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#2d1b0e';
    ctx.beginPath();
    ctx.arc(size * 0.35, size * 0.4, size * 0.025, 0, Math.PI * 2);
    ctx.arc(size * 0.65, size * 0.4, size * 0.025, 0, Math.PI * 2);
    ctx.fill();

    // Eyebrows
    ctx.strokeStyle = '#5c3d1e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(size * 0.25, size * 0.32);
    ctx.quadraticCurveTo(size * 0.35, size * 0.28, size * 0.45, size * 0.32);
    ctx.moveTo(size * 0.55, size * 0.32);
    ctx.quadraticCurveTo(size * 0.65, size * 0.28, size * 0.75, size * 0.32);
    ctx.stroke();

    // Nose
    ctx.strokeStyle = '#c68642';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(size * 0.5, size * 0.42);
    ctx.lineTo(size * 0.48, size * 0.55);
    ctx.lineTo(size * 0.5, size * 0.56);
    ctx.stroke();

    // Mouth
    ctx.strokeStyle = '#8b4513';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(size / 2, size * 0.58, size * 0.1, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();

    // Hair suggestion
    ctx.fillStyle = '#3d2314';
    ctx.beginPath();
    ctx.ellipse(size / 2, size * 0.18, size * 0.35, size * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  // Simulate diffusion at different step counts
  const generateImage = useCallback((steps: number, targetData: ImageData): ImageData => {
    const output = new ImageData(imageSize, imageSize);
    const quality = Math.pow(steps / 50, 0.7); // Non-linear quality scaling
    const noiseReduction = quality;

    for (let i = 0; i < targetData.data.length; i += 4) {
      const pixelIndex = i / 4;

      // Base noise from seed
      const noise1 = (seededRandom(seed, pixelIndex * 3) - 0.5) * 255;
      const noise2 = (seededRandom(seed, pixelIndex * 3 + 1) - 0.5) * 255;
      const noise3 = (seededRandom(seed, pixelIndex * 3 + 2) - 0.5) * 255;

      // Blend between noise and target based on steps
      const blend = noiseReduction;

      // Add some spatial coherence for low step counts (blocky artifacts)
      const blockSize = Math.max(1, Math.floor(8 - steps / 8));
      const x = pixelIndex % imageSize;
      const y = Math.floor(pixelIndex / imageSize);
      const blockX = Math.floor(x / blockSize) * blockSize;
      const blockY = Math.floor(y / blockSize) * blockSize;
      const blockIndex = blockY * imageSize + blockX;

      const blockNoise1 = (seededRandom(seed, blockIndex * 3) - 0.5) * 255 * (1 - blend) * 0.3;
      const blockNoise2 = (seededRandom(seed, blockIndex * 3 + 1) - 0.5) * 255 * (1 - blend) * 0.3;
      const blockNoise3 = (seededRandom(seed, blockIndex * 3 + 2) - 0.5) * 255 * (1 - blend) * 0.3;

      output.data[i] = Math.max(0, Math.min(255,
        targetData.data[i] * blend +
        (128 + noise1) * (1 - blend) +
        blockNoise1
      ));
      output.data[i + 1] = Math.max(0, Math.min(255,
        targetData.data[i + 1] * blend +
        (128 + noise2) * (1 - blend) +
        blockNoise2
      ));
      output.data[i + 2] = Math.max(0, Math.min(255,
        targetData.data[i + 2] * blend +
        (128 + noise3) * (1 - blend) +
        blockNoise3
      ));
      output.data[i + 3] = 255;
    }

    return output;
  }, [seed, seededRandom]);

  const runGeneration = async () => {
    setGenerating(true);
    setImages(new Map());

    // Create target image
    const targetCanvas = document.createElement('canvas');
    targetCanvas.width = imageSize;
    targetCanvas.height = imageSize;
    const targetCtx = targetCanvas.getContext('2d');
    if (!targetCtx) return;

    generateTargetPattern(targetCtx, imageSize);
    const targetData = targetCtx.getImageData(0, 0, imageSize, imageSize);

    // Generate each version with simulated delay
    for (const config of STEP_CONFIGS) {
      await new Promise(r => setTimeout(r, config.timeMs));

      const imageData = generateImage(config.steps, targetData);
      setImages(prev => new Map(prev).set(config.steps, imageData));

      // Draw to canvas
      const canvas = canvasRefs.current.get(config.steps);
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.putImageData(imageData, 0, 0);
        }
      }
    }

    setGenerating(false);
  };

  const randomizeSeed = () => {
    setSeed(Math.floor(Math.random() * 100000));
  };

  // Set up canvas refs
  const setCanvasRef = (steps: number) => (el: HTMLCanvasElement | null) => {
    if (el) {
      canvasRefs.current.set(steps, el);
    }
  };

  return (
    <div className="card p-6">
      <h3 className="font-semibold mb-2">Diffusion Steps Comparison</h3>
      <p className="text-sm text-[var(--muted)] mb-6">
        Compare image quality at different denoising step counts.
        More steps = better quality but slower generation.
      </p>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={runGeneration}
          disabled={generating}
          className="badge hover:border-[var(--border-strong)]"
        >
          {generating ? 'Generating...' : 'Generate All'}
        </button>
        <button
          onClick={randomizeSeed}
          disabled={generating}
          className="badge hover:border-[var(--border-strong)]"
        >
          New Seed
        </button>
        <span className="text-xs text-[var(--muted)] self-center">
          Seed: {seed}
        </span>
      </div>

      {/* Image grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {STEP_CONFIGS.map((config) => (
          <div key={config.steps} className="text-center">
            <div className="relative aspect-square mb-2 bg-[var(--card-bg-alt)] rounded-lg overflow-hidden border border-[var(--border)]">
              <canvas
                ref={setCanvasRef(config.steps)}
                width={imageSize}
                height={imageSize}
                className="w-full h-full"
                style={{ imageRendering: 'pixelated' }}
              />
              {generating && !images.has(config.steps) && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full" />
                </div>
              )}
              {!generating && !images.has(config.steps) && (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-[var(--muted)]">
                  Click Generate
                </div>
              )}
            </div>
            <p className="font-medium text-sm">{config.label}</p>
            <p className="text-xs text-[var(--muted)]">{config.desc}</p>
            <p className="text-xs text-[var(--muted)]">~{config.timeMs}ms</p>
          </div>
        ))}
      </div>

      {/* Quality vs Speed chart */}
      <div className="p-4 bg-[var(--card-bg-alt)] rounded mb-4">
        <p className="font-medium text-sm mb-3">Quality vs Speed Trade-off</p>
        <div className="relative h-8 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded overflow-hidden">
          {STEP_CONFIGS.map((config, i) => (
            <div
              key={config.steps}
              className="absolute top-0 bottom-0 flex items-center justify-center"
              style={{
                left: `${(i / (STEP_CONFIGS.length - 1)) * 100}%`,
                transform: 'translateX(-50%)',
              }}
            >
              <div className="w-4 h-4 bg-white rounded-full border-2 border-black flex items-center justify-center text-[8px] font-bold">
                {config.steps}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-[var(--muted)] mt-1">
          <span>Fastest / Lowest Quality</span>
          <span>Slowest / Highest Quality</span>
        </div>
      </div>

      {/* Technical explanation */}
      <div className="grid md:grid-cols-2 gap-4 text-sm">
        <div className="p-4 bg-[var(--card-bg-alt)] rounded">
          <p className="font-medium mb-2">Why Fewer Steps = Lower Quality?</p>
          <ul className="space-y-1 text-xs text-[var(--muted)]">
            <li>• Each step removes a small amount of noise</li>
            <li>• Fewer steps = larger noise jumps = artifacts</li>
            <li>• Fine details emerge in later steps</li>
            <li>• Blocky/blurry results from skipped refinement</li>
          </ul>
        </div>
        <div className="p-4 bg-[var(--card-bg-alt)] rounded">
          <p className="font-medium mb-2">For Real-Time Avatars</p>
          <ul className="space-y-1 text-xs text-[var(--muted)]">
            <li>• 4-8 steps typical for interactive use</li>
            <li>• Consistency models enable 1-4 step generation</li>
            <li>• Distillation transfers quality to fewer steps</li>
            <li>• Trade acceptable quality for latency</li>
          </ul>
        </div>
      </div>

      {/* Insight */}
      <div className="mt-4 p-4 bg-[var(--card-bg-alt)] rounded text-sm text-[var(--muted)]">
        💡 <strong>Try this:</strong> Generate with different seeds and compare the 4-step vs 50-step results.
        Notice how the basic structure is there in 4 steps, but fine details like eye highlights are missing!
      </div>
    </div>
  );
}

export default DiffusionStepsDemo;
