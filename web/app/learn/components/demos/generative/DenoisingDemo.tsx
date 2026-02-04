'use client';

import { useState, useEffect, useRef } from 'react';
import { ParameterSlider } from '../../core';

interface NoiseLevel {
  step: number;
  noise: number;
  description: string;
}

const NOISE_STEPS: NoiseLevel[] = [
  { step: 50, noise: 1.0, description: 'Pure noise - completely random' },
  { step: 40, noise: 0.8, description: 'Faint shapes emerging' },
  { step: 30, noise: 0.6, description: 'Rough structure visible' },
  { step: 20, noise: 0.4, description: 'Features taking form' },
  { step: 10, noise: 0.2, description: 'Details sharpening' },
  { step: 0, noise: 0.0, description: 'Clean image - denoising complete' },
];

export function DenoisingDemo() {
  const [currentStep, setCurrentStep] = useState(50);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [imageSize, setImageSize] = useState(256);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const targetImageRef = useRef<ImageData | null>(null);

  // Generate a simple gradient as "target image"
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = imageSize;
    canvas.height = imageSize;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create a face-like gradient pattern
    const gradient = ctx.createRadialGradient(
      imageSize / 2, imageSize / 2.2, imageSize * 0.1,
      imageSize / 2, imageSize / 2, imageSize * 0.45
    );
    gradient.addColorStop(0, '#ffdbac');
    gradient.addColorStop(0.7, '#e0ac69');
    gradient.addColorStop(1, '#c68642');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(imageSize / 2, imageSize / 2, imageSize * 0.4, imageSize * 0.48, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(imageSize * 0.35, imageSize * 0.4, imageSize * 0.08, imageSize * 0.05, 0, 0, Math.PI * 2);
    ctx.ellipse(imageSize * 0.65, imageSize * 0.4, imageSize * 0.08, imageSize * 0.05, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#3d2314';
    ctx.beginPath();
    ctx.arc(imageSize * 0.35, imageSize * 0.4, imageSize * 0.03, 0, Math.PI * 2);
    ctx.arc(imageSize * 0.65, imageSize * 0.4, imageSize * 0.03, 0, Math.PI * 2);
    ctx.fill();

    // Mouth
    ctx.strokeStyle = '#8b4513';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(imageSize / 2, imageSize * 0.55, imageSize * 0.12, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();

    targetImageRef.current = ctx.getImageData(0, 0, imageSize, imageSize);
  }, [imageSize]);

  // Render with noise
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !targetImageRef.current) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const noiseAmount = currentStep / 50; // 0 to 1
    const targetData = targetImageRef.current.data;
    const outputData = ctx.createImageData(imageSize, imageSize);

    for (let i = 0; i < targetData.length; i += 4) {
      const noise = (Math.random() - 0.5) * 255;

      outputData.data[i] = Math.max(0, Math.min(255, targetData[i] * (1 - noiseAmount) + (128 + noise) * noiseAmount));
      outputData.data[i + 1] = Math.max(0, Math.min(255, targetData[i + 1] * (1 - noiseAmount) + (128 + noise) * noiseAmount));
      outputData.data[i + 2] = Math.max(0, Math.min(255, targetData[i + 2] * (1 - noiseAmount) + (128 + noise) * noiseAmount));
      outputData.data[i + 3] = 255;
    }

    ctx.putImageData(outputData, 0, 0);
  }, [currentStep, imageSize]);

  // Auto-play animation
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev <= 0) {
          setIsAutoPlaying(false);
          return 0;
        }
        return prev - 1;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const getCurrentDescription = () => {
    const level = NOISE_STEPS.find(l => currentStep >= l.step) || NOISE_STEPS[NOISE_STEPS.length - 1];
    return level.description;
  };

  return (
    <div className="card p-6">
      <h3 className="font-semibold mb-4">Denoising Visualizer</h3>
      <p className="text-sm text-[var(--text-muted)] mb-6">
        Watch how diffusion models progressively remove noise to reveal an image.
        Each step predicts and subtracts a small amount of noise.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Canvas */}
        <div className="flex flex-col items-center">
          <canvas
            ref={canvasRef}
            width={imageSize}
            height={imageSize}
            className="border border-[var(--border)] rounded-lg bg-[var(--surface-2)]"
            style={{ imageRendering: 'pixelated' }}
          />
          <p className="text-sm text-[var(--text-muted)] mt-3 text-center">
            {getCurrentDescription()}
          </p>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Denoising Step</span>
              <span className="text-sm text-[var(--text-muted)]">{50 - currentStep} / 50</span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              value={currentStep}
              onChange={(e) => setCurrentStep(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setCurrentStep(50)}
              className="badge hover:border-[var(--border-strong)] text-center justify-center"
            >
              Reset to Noise
            </button>
            <button
              onClick={() => {
                setCurrentStep(50);
                setIsAutoPlaying(true);
              }}
              disabled={isAutoPlaying}
              className="badge hover:border-[var(--border-strong)] text-center justify-center"
            >
              {isAutoPlaying ? 'Running...' : 'Auto Denoise'}
            </button>
          </div>

          {/* Math explanation */}
          <div className="p-4 bg-[var(--surface-2)] rounded text-sm">
            <p className="font-medium mb-2">The Math</p>
            <code className="text-xs block mb-2">
              x_(t-1) = x_t - noise_predicted(x_t, t)
            </code>
            <p className="text-xs text-[var(--text-muted)]">
              At each step t, the model predicts what noise was added,
              then subtracts it to get a slightly cleaner image.
            </p>
          </div>

          {/* Step breakdown */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Noise Schedule</p>
            {NOISE_STEPS.map((level) => (
              <div
                key={level.step}
                className={`flex items-center gap-2 text-xs p-2 rounded ${
                  currentStep >= level.step && (NOISE_STEPS.find(l => l.step > level.step)?.step || 51) > currentStep
                    ? 'bg-[var(--accent)] bg-opacity-20'
                    : 'opacity-50'
                }`}
              >
                <span className="w-12">Step {50 - level.step}</span>
                <div className="flex-1 h-2 bg-[var(--border)] rounded overflow-hidden">
                  <div
                    className="h-full bg-[var(--accent)]"
                    style={{ width: `${(1 - level.noise) * 100}%` }}
                  />
                </div>
                <span className="w-12 text-right">{Math.round((1 - level.noise) * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DenoisingDemo;
