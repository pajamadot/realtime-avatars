'use client';

import { useState, useEffect } from 'react';

interface PipelineStep {
  id: string;
  label: string;
  description: string;
  icon?: string;
}

interface AnimatedDiagramProps {
  steps: PipelineStep[];
  connections: string[][];
  color?: string;
  autoPlay?: boolean;
  intervalMs?: number;
}

export default function AnimatedDiagram({
  steps,
  connections,
  color = 'var(--accent)',
  autoPlay = true,
  intervalMs = 2000,
}: AnimatedDiagramProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isPlaying, steps.length, intervalMs]);

  const handleStepClick = (index: number) => {
    setIsPlaying(false);
    setActiveStep(index);
  };

  return (
    <div className="card p-6">
      {/* Pipeline visualization */}
      <div className="flex items-center justify-between gap-2 mb-6 overflow-x-auto pb-2">
        {steps.map((step, index) => {
          const isActive = index === activeStep;
          const isPast = index < activeStep;

          return (
            <div key={step.id} className="flex items-center">
              <button
                type="button"
                onClick={() => handleStepClick(index)}
                className={`
                  flex flex-col items-center p-3 rounded-lg transition-all min-w-[100px]
                  ${isActive ? 'scale-110' : 'hover:bg-[var(--card-bg-alt)]'}
                `}
                style={isActive ? { backgroundColor: color, color: 'white' } : undefined}
              >
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center mb-2 text-lg
                  ${!isActive && isPast ? 'bg-green-500 text-white' : ''}
                  ${!isActive && !isPast ? 'bg-[var(--card-bg-alt)] border border-[var(--border)]' : ''}
                `}
                style={isActive ? { backgroundColor: 'rgba(255,255,255,0.2)' } : undefined}
                >
                  {isPast && !isActive ? '✓' : step.icon || (index + 1)}
                </div>
                <span className={`text-xs font-medium text-center ${isActive ? '' : 'text-[var(--muted)]'}`}>
                  {step.label}
                </span>
              </button>

              {/* Arrow */}
              {index < steps.length - 1 && (
                <div className={`
                  w-8 h-0.5 mx-1
                  ${index < activeStep ? 'bg-green-500' : 'bg-[var(--border)]'}
                `} />
              )}
            </div>
          );
        })}
      </div>

      {/* Active step description */}
      <div className="p-4 bg-[var(--card-bg-alt)] rounded-lg min-h-[80px]">
        <h4 className="font-semibold mb-2" style={{ color }}>
          {steps[activeStep]?.label}
        </h4>
        <p className="text-sm text-[var(--muted)]">
          {steps[activeStep]?.description}
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mt-4">
        <button
          type="button"
          onClick={() => setActiveStep((prev) => (prev - 1 + steps.length) % steps.length)}
          className="badge hover:border-[var(--border-strong)]"
        >
          ← Prev
        </button>
        <button
          type="button"
          onClick={() => setIsPlaying(!isPlaying)}
          className="badge hover:border-[var(--border-strong)]"
        >
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>
        <button
          type="button"
          onClick={() => setActiveStep((prev) => (prev + 1) % steps.length)}
          className="badge hover:border-[var(--border-strong)]"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
