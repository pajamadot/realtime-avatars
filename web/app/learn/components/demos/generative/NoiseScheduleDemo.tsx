'use client';

import { useState, useEffect, useRef } from 'react';

type ScheduleType = 'linear' | 'cosine' | 'sqrt' | 'sigmoid';

interface ScheduleInfo {
  name: string;
  description: string;
  formula: string;
  fn: (t: number) => number;
  color: string;
}

const SCHEDULES: Record<ScheduleType, ScheduleInfo> = {
  linear: {
    name: 'Linear',
    description: 'Simple linear interpolation. Adds noise uniformly.',
    formula: 'β(t) = β_min + t(β_max - β_min)',
    fn: (t: number) => t,
    color: '#3498db',
  },
  cosine: {
    name: 'Cosine',
    description: 'Slower noise at start/end, faster in middle. Better quality.',
    formula: 'β(t) = cos²(πt/2)',
    fn: (t: number) => Math.cos((t * Math.PI) / 2) ** 2,
    color: '#2ecc71',
  },
  sqrt: {
    name: 'Square Root',
    description: 'Fast early noise, slow refinement. Good for faces.',
    formula: 'β(t) = √t',
    fn: (t: number) => Math.sqrt(t),
    color: '#e74c3c',
  },
  sigmoid: {
    name: 'Sigmoid',
    description: 'S-curve: slow start, fast middle, slow end.',
    formula: 'β(t) = σ(12t - 6)',
    fn: (t: number) => 1 / (1 + Math.exp(-(12 * t - 6))),
    color: '#9b59b6',
  },
};

export function NoiseScheduleDemo() {
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleType>('cosine');
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(50);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const graphCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const baseImageRef = useRef<ImageData | null>(null);

  // Generate base image
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 150;
    canvas.height = 150;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Simple face gradient
    const gradient = ctx.createRadialGradient(75, 70, 10, 75, 75, 65);
    gradient.addColorStop(0, '#ffdbac');
    gradient.addColorStop(0.8, '#e0ac69');
    gradient.addColorStop(1, '#1a1a2e');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(75, 75, 55, 65, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(55, 60, 10, 6, 0, 0, Math.PI * 2);
    ctx.ellipse(95, 60, 10, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#3d2314';
    ctx.beginPath();
    ctx.arc(55, 60, 4, 0, Math.PI * 2);
    ctx.arc(95, 60, 4, 0, Math.PI * 2);
    ctx.fill();

    // Mouth
    ctx.strokeStyle = '#c9544d';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(75, 85, 15, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();

    baseImageRef.current = ctx.getImageData(0, 0, 150, 150);
  }, []);

  // Animation
  useEffect(() => {
    if (!isAnimating) return;

    const animate = () => {
      setCurrentStep(prev => {
        if (prev >= totalSteps) {
          setIsAnimating(false);
          return totalSteps;
        }
        return prev + 1;
      });

      animationRef.current = setTimeout(() => {
        animationRef.current = requestAnimationFrame(animate) as unknown as number;
      }, 100) as unknown as number;
    };

    animationRef.current = requestAnimationFrame(animate) as unknown as number;
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        clearTimeout(animationRef.current);
      }
    };
  }, [isAnimating, totalSteps]);

  // Render graph
  useEffect(() => {
    const canvas = graphCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding + (i / 4) * (height - 2 * padding);
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Draw schedules
    const schedulesToDraw = showComparison
      ? (Object.keys(SCHEDULES) as ScheduleType[])
      : [selectedSchedule];

    schedulesToDraw.forEach(scheduleKey => {
      const schedule = SCHEDULES[scheduleKey];
      const isSelected = scheduleKey === selectedSchedule;

      ctx.strokeStyle = isSelected ? schedule.color : `${schedule.color}40`;
      ctx.lineWidth = isSelected ? 3 : 1;
      ctx.beginPath();

      for (let i = 0; i <= 100; i++) {
        const t = i / 100;
        const x = padding + t * (width - 2 * padding);
        const y = padding + (1 - schedule.fn(t)) * (height - 2 * padding);

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.stroke();
    });

    // Current step marker
    const t = currentStep / totalSteps;
    const x = padding + t * (width - 2 * padding);
    const y = padding + (1 - SCHEDULES[selectedSchedule].fn(t)) * (height - 2 * padding);

    ctx.fillStyle = '#ffd93d';
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();

    // Vertical line at current step
    ctx.strokeStyle = 'rgba(255, 217, 61, 0.5)';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(x, padding);
    ctx.lineTo(x, height - padding);
    ctx.stroke();
    ctx.setLineDash([]);

    // Axes labels
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Timestep (t)', width / 2, height - 5);
    ctx.save();
    ctx.translate(12, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Noise Level', 0, 0);
    ctx.restore();

    ctx.fillText('0', padding, height - padding + 15);
    ctx.fillText('T', width - padding, height - padding + 15);
    ctx.textAlign = 'right';
    ctx.fillText('1.0', padding - 5, padding + 5);
    ctx.fillText('0.0', padding - 5, height - padding + 5);

  }, [selectedSchedule, currentStep, totalSteps, showComparison]);

  // Render noised image
  useEffect(() => {
    const canvas = imageCanvasRef.current;
    if (!canvas || !baseImageRef.current) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const t = currentStep / totalSteps;
    const noiseLevel = SCHEDULES[selectedSchedule].fn(t);

    const imageData = ctx.createImageData(150, 150);
    const baseData = baseImageRef.current.data;

    for (let i = 0; i < baseData.length; i += 4) {
      const noise = (Math.random() - 0.5) * 255;

      imageData.data[i] = Math.max(0, Math.min(255,
        baseData[i] * (1 - noiseLevel) + (128 + noise) * noiseLevel
      ));
      imageData.data[i + 1] = Math.max(0, Math.min(255,
        baseData[i + 1] * (1 - noiseLevel) + (128 + noise) * noiseLevel
      ));
      imageData.data[i + 2] = Math.max(0, Math.min(255,
        baseData[i + 2] * (1 - noiseLevel) + (128 + noise) * noiseLevel
      ));
      imageData.data[i + 3] = 255;
    }

    ctx.putImageData(imageData, 0, 0);
  }, [selectedSchedule, currentStep, totalSteps]);

  const schedule = SCHEDULES[selectedSchedule];
  const currentNoise = SCHEDULES[selectedSchedule].fn(currentStep / totalSteps);

  return (
    <div className="card p-6">
      <h3 className="font-semibold mb-2">Noise Schedule Comparison</h3>
      <p className="text-sm text-[var(--text-muted)] mb-6">
        Different schedules control how quickly noise is added/removed. The schedule
        significantly affects generation quality and speed.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Visualization */}
        <div>
          <div className="flex gap-4 mb-4">
            <canvas
              ref={graphCanvasRef}
              width={250}
              height={180}
              className="rounded-lg border border-[var(--border)]"
            />
            <canvas
              ref={imageCanvasRef}
              width={150}
              height={150}
              className="rounded-lg border border-[var(--border)]"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>

          {/* Step slider */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Step</span>
              <span className="font-mono">{currentStep} / {totalSteps}</span>
            </div>
            <input
              type="range"
              min={0}
              max={totalSteps}
              value={currentStep}
              onChange={(e) => {
                setIsAnimating(false);
                setCurrentStep(Number(e.target.value));
              }}
              className="w-full"
            />
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                setCurrentStep(0);
                setIsAnimating(true);
              }}
              disabled={isAnimating}
              className="flex-1 py-2 rounded font-medium text-sm bg-[var(--accent)] text-white disabled:opacity-50"
            >
              {isAnimating ? 'Running...' : 'Animate'}
            </button>
            <button
              onClick={() => setShowComparison(!showComparison)}
              className={`badge ${showComparison ? 'bg-[var(--accent)]/20' : ''}`}
            >
              Compare All
            </button>
          </div>
        </div>

        {/* Schedule selector */}
        <div className="space-y-4">
          <div className="space-y-2">
            {(Object.keys(SCHEDULES) as ScheduleType[]).map(key => {
              const s = SCHEDULES[key];
              return (
                <button
                  key={key}
                  onClick={() => setSelectedSchedule(key)}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    selectedSchedule === key
                      ? 'border-2'
                      : 'border border-[var(--border)] hover:border-[var(--border-strong)]'
                  }`}
                  style={{
                    borderColor: selectedSchedule === key ? s.color : undefined,
                    backgroundColor: selectedSchedule === key ? `${s.color}10` : undefined,
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="font-medium text-sm">{s.name}</span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">{s.description}</p>
                </button>
              );
            })}
          </div>

          {/* Current schedule info */}
          <div className="p-4 bg-[var(--surface-2)] rounded">
            <p className="font-medium text-sm mb-2">{schedule.name} Schedule</p>
            <code className="text-xs block mb-2 font-mono text-[var(--text-muted)]">
              {schedule.formula}
            </code>
            <div className="flex justify-between text-sm">
              <span>Current noise level:</span>
              <span className="font-mono">{(currentNoise * 100).toFixed(1)}%</span>
            </div>
          </div>

          <div className="p-3 border border-[var(--border)] rounded text-sm">
            <p className="font-medium mb-1">Best Practices</p>
            <p className="text-xs text-[var(--text-muted)]">
              Cosine schedule is preferred for most diffusion models (used in DDPM, Stable Diffusion).
              It preserves more signal at the start, allowing fine details to emerge gradually.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NoiseScheduleDemo;
