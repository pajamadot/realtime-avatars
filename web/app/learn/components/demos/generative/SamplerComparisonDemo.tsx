'use client';

import { useState, useEffect, useRef } from 'react';

type SamplerType = 'ddpm' | 'ddim' | 'euler' | 'dpm';

interface SamplerInfo {
  name: string;
  fullName: string;
  stepsNeeded: number;
  description: string;
  color: string;
}

const SAMPLERS: Record<SamplerType, SamplerInfo> = {
  ddpm: {
    name: 'DDPM',
    fullName: 'Denoising Diffusion Probabilistic Models',
    stepsNeeded: 1000,
    description: 'Original method. Slow but high quality. Stochastic sampling.',
    color: '#e74c3c',
  },
  ddim: {
    name: 'DDIM',
    fullName: 'Denoising Diffusion Implicit Models',
    stepsNeeded: 50,
    description: 'Deterministic. Skip steps without quality loss. 20x faster.',
    color: '#3498db',
  },
  euler: {
    name: 'Euler',
    fullName: 'Euler Method',
    stepsNeeded: 30,
    description: 'Simple ODE solver. Fast convergence. Good for real-time.',
    color: '#2ecc71',
  },
  dpm: {
    name: 'DPM++',
    fullName: 'Diffusion Probabilistic Model Solver++',
    stepsNeeded: 20,
    description: 'State-of-the-art. Best quality at low steps. Used in SDXL.',
    color: '#9b59b6',
  },
};

export function SamplerComparisonDemo() {
  const [selectedSampler, setSelectedSampler] = useState<SamplerType>('ddim');
  const [steps, setSteps] = useState(20);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [noiseLevel, setNoiseLevel] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  // Simulation of denoising trajectory
  useEffect(() => {
    if (!isGenerating) return;

    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= steps) {
          setIsGenerating(false);
          return steps;
        }
        return prev + 1;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isGenerating, steps]);

  // Update noise level based on current step and sampler
  useEffect(() => {
    const t = currentStep / steps;
    const sampler = SAMPLERS[selectedSampler];

    // Different samplers have different noise reduction curves
    let newNoiseLevel: number;
    switch (selectedSampler) {
      case 'ddpm':
        // Linear decay (original)
        newNoiseLevel = 1 - t;
        break;
      case 'ddim':
        // Smoother, can skip steps
        newNoiseLevel = Math.cos(t * Math.PI / 2);
        break;
      case 'euler':
        // Exponential decay
        newNoiseLevel = Math.exp(-3 * t);
        break;
      case 'dpm':
        // Aggressive early, refined late
        newNoiseLevel = Math.pow(1 - t, 2);
        break;
      default:
        newNoiseLevel = 1 - t;
    }

    setNoiseLevel(Math.max(0, newNoiseLevel));
  }, [currentStep, steps, selectedSampler]);

  // Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    // Draw denoising trajectory graph
    const padding = 40;
    const graphWidth = width - 2 * padding;
    const graphHeight = height - 2 * padding;

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding + (i / 5) * graphHeight;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(padding + graphWidth, y);
      ctx.stroke();
    }

    // Draw all sampler curves (faded)
    Object.entries(SAMPLERS).forEach(([key, sampler]) => {
      const isSelected = key === selectedSampler;
      ctx.strokeStyle = isSelected ? sampler.color : `${sampler.color}40`;
      ctx.lineWidth = isSelected ? 3 : 1;
      ctx.beginPath();

      for (let i = 0; i <= 100; i++) {
        const t = i / 100;
        let noise: number;

        switch (key) {
          case 'ddpm':
            noise = 1 - t;
            break;
          case 'ddim':
            noise = Math.cos(t * Math.PI / 2);
            break;
          case 'euler':
            noise = Math.exp(-3 * t);
            break;
          case 'dpm':
            noise = Math.pow(1 - t, 2);
            break;
          default:
            noise = 1 - t;
        }

        const x = padding + t * graphWidth;
        const y = padding + (1 - noise) * graphHeight;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.stroke();
    });

    // Draw current position marker
    const currentT = currentStep / steps;
    const currentX = padding + currentT * graphWidth;
    const currentY = padding + (1 - noiseLevel) * graphHeight;

    ctx.fillStyle = '#ffd93d';
    ctx.beginPath();
    ctx.arc(currentX, currentY, 8, 0, Math.PI * 2);
    ctx.fill();

    // Draw step markers
    const stepSize = graphWidth / steps;
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    for (let i = 0; i <= steps; i++) {
      const x = padding + i * stepSize;
      ctx.beginPath();
      ctx.arc(x, padding + graphHeight, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Axes labels
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Steps (t)', width / 2, height - 5);
    ctx.save();
    ctx.translate(12, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Signal / Noise', 0, 0);
    ctx.restore();

    // Labels
    ctx.textAlign = 'left';
    ctx.fillText('Noise', padding - 35, padding + 5);
    ctx.fillText('Signal', padding - 35, padding + graphHeight + 5);

  }, [selectedSampler, currentStep, steps, noiseLevel]);

  const startGeneration = () => {
    setCurrentStep(0);
    setNoiseLevel(1);
    setIsGenerating(true);
  };

  const sampler = SAMPLERS[selectedSampler];

  return (
    <div className="card p-6">
      <h3 className="font-semibold mb-2">Sampler Comparison</h3>
      <p className="text-sm text-[var(--muted)] mb-6">
        Different samplers trade off speed vs quality. Modern samplers like DPM++ achieve
        high quality in 20 steps vs 1000 for original DDPM.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Graph */}
        <div>
          <canvas
            ref={canvasRef}
            width={400}
            height={250}
            className="w-full rounded-lg border border-[var(--border)]"
          />

          {/* Controls */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={startGeneration}
              disabled={isGenerating}
              className="flex-1 py-2 rounded font-medium text-sm bg-[var(--accent)] text-white disabled:opacity-50"
            >
              {isGenerating ? `Step ${currentStep}/${steps}` : 'Generate'}
            </button>
          </div>

          {/* Steps slider */}
          <div className="mt-4 p-3 bg-[var(--card-bg-alt)] rounded">
            <div className="flex justify-between text-sm mb-1">
              <span>Steps</span>
              <span className="font-mono">{steps}</span>
            </div>
            <input
              type="range"
              min={5}
              max={50}
              value={steps}
              onChange={(e) => setSteps(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Legend */}
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {Object.entries(SAMPLERS).map(([key, s]) => (
              <div key={key} className="flex items-center gap-1">
                <div className="w-3 h-0.5" style={{ backgroundColor: s.color }} />
                <span>{s.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sampler selector */}
        <div className="space-y-4">
          <div className="space-y-2">
            {(Object.keys(SAMPLERS) as SamplerType[]).map(key => {
              const s = SAMPLERS[key];
              return (
                <button
                  key={key}
                  onClick={() => setSelectedSampler(key)}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    selectedSampler === key
                      ? 'border-2'
                      : 'border border-[var(--border)] hover:border-[var(--border-strong)]'
                  }`}
                  style={{
                    borderColor: selectedSampler === key ? s.color : undefined,
                    backgroundColor: selectedSampler === key ? `${s.color}10` : undefined,
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{s.name}</span>
                    <span className="text-xs text-[var(--muted)]">~{s.stepsNeeded} steps</span>
                  </div>
                  <p className="text-xs text-[var(--muted)]">{s.description}</p>
                </button>
              );
            })}
          </div>

          {/* Current sampler info */}
          <div className="p-4 bg-[var(--card-bg-alt)] rounded">
            <p className="font-medium text-sm mb-1" style={{ color: sampler.color }}>
              {sampler.fullName}
            </p>
            <p className="text-xs text-[var(--muted)]">
              Recommended steps: {sampler.stepsNeeded}
            </p>
            <p className="text-xs text-[var(--muted)] mt-2">
              Current noise level: {(noiseLevel * 100).toFixed(1)}%
            </p>
          </div>

          <div className="p-3 border border-[var(--border)] rounded text-sm">
            <p className="font-medium mb-1">For Real-Time Avatars</p>
            <p className="text-xs text-[var(--muted)]">
              DPM++ or Euler with 4-8 steps is common for real-time face generation.
              Quality is acceptable, and speed meets the ~100ms budget for talking heads.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SamplerComparisonDemo;
