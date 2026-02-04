'use client';

import { useState, useEffect, useCallback } from 'react';
import { Check } from 'lucide-react';

interface PipelineStep {
  id: string;
  label: string;
  description: string;
  icon?: string;
  details?: string[];
  duration?: string;
}

interface AnimatedDiagramProps {
  steps: PipelineStep[];
  connections: string[][];
  color?: string;
  autoPlay?: boolean;
  intervalMs?: number;
  showDetails?: boolean;
}

export default function AnimatedDiagram({
  steps,
  connections,
  color = 'var(--accent)',
  autoPlay = true,
  intervalMs = 2000,
  showDetails = true,
}: AnimatedDiagramProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [speed, setSpeed] = useState(1);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  // Mark steps as completed when passed
  useEffect(() => {
    setCompletedSteps(prev => {
      const newSet = new Set(prev);
      for (let i = 0; i < activeStep; i++) {
        newSet.add(i);
      }
      return newSet;
    });
  }, [activeStep]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setIsPlaying(false);
        setActiveStep(prev => (prev - 1 + steps.length) % steps.length);
      } else if (e.key === 'ArrowRight') {
        setIsPlaying(false);
        setActiveStep(prev => (prev + 1) % steps.length);
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [steps.length]);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, intervalMs / speed);

    return () => clearInterval(interval);
  }, [isPlaying, steps.length, intervalMs, speed]);

  const handleStepClick = useCallback((index: number) => {
    setIsPlaying(false);
    setActiveStep(index);
  }, []);

  const progress = ((activeStep + 1) / steps.length) * 100;

  return (
    <div className="card p-6">
      {/* Progress bar */}
      <div className="h-1 bg-[var(--surface-2)] rounded-full mb-4 overflow-hidden">
        <div
          className="h-full transition-all duration-300 rounded-full"
          style={{ backgroundColor: color, width: `${progress}%` }}
        />
      </div>

      {/* Step counter and speed control */}
      <div className="flex items-center justify-between mb-4 text-sm">
        <span className="text-[var(--text-muted)]">
          Step {activeStep + 1} of {steps.length}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[var(--text-muted)]">Speed:</span>
          {[0.5, 1, 2].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSpeed(s)}
              className={`px-2 py-0.5 rounded text-xs transition-colors ${
                speed === s
                  ? 'text-white'
                  : 'text-[var(--text-muted)] hover:text-[var(--foreground)]'
              }`}
              style={speed === s ? { backgroundColor: color } : undefined}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Pipeline visualization */}
      <div className="flex items-center justify-between gap-2 mb-6 overflow-x-auto pb-2">
        {steps.map((step, index) => {
          const isActive = index === activeStep;
          const isCompleted = completedSteps.has(index);
          const isHovered = hoveredStep === index;

          return (
            <div key={step.id} className="flex items-center">
              <button
                type="button"
                onClick={() => handleStepClick(index)}
                onMouseEnter={() => setHoveredStep(index)}
                onMouseLeave={() => setHoveredStep(null)}
                className={`
                  flex flex-col items-center p-3 rounded-lg transition-all min-w-[100px] relative
                  ${isActive ? 'scale-110 shadow-lg' : 'hover:bg-[var(--surface-2)]'}
                  ${isHovered && !isActive ? 'scale-105' : ''}
                `}
                style={isActive ? { backgroundColor: color, color: 'white' } : undefined}
              >
                {/* Step indicator */}
                <div
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center mb-2 text-xl
                    transition-all duration-300
                    ${!isActive && isCompleted ? 'bg-green-500 text-white' : ''}
                    ${!isActive && !isCompleted ? 'bg-[var(--surface-2)] border-2 border-[var(--border)]' : ''}
                  `}
                  style={isActive ? { backgroundColor: 'rgba(255,255,255,0.2)' } : undefined}
                >
                  {isCompleted && !isActive ? (
                    <Check size={18} />
                  ) : (
                    step.icon || (index + 1)
                  )}
                </div>

                <span
                  className={`text-xs font-medium text-center transition-colors ${
                    isActive ? '' : 'text-[var(--text-muted)]'
                  }`}
                >
                  {step.label}
                </span>

                {/* Duration badge */}
                {step.duration && (
                  <span
                    className={`text-[10px] mt-1 px-1.5 py-0.5 rounded ${
                      isActive ? 'bg-white/20' : 'bg-[var(--surface-2)]'
                    }`}
                  >
                    {step.duration}
                  </span>
                )}

                {/* Hover tooltip */}
                {isHovered && !isActive && (
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-[var(--surface-0)] border border-[var(--border)] rounded px-2 py-1 text-xs whitespace-nowrap z-10 shadow-lg">
                    Click to view
                  </div>
                )}
              </button>

              {/* Animated connection arrow */}
              {index < steps.length - 1 && (
                <div className="relative w-12 h-0.5 mx-1">
                  <div
                    className={`absolute inset-0 ${
                      index < activeStep ? 'bg-green-500' : 'bg-[var(--border)]'
                    }`}
                  />
                  {index === activeStep - 1 && (
                    <div
                      className="absolute inset-0 animate-pulse"
                      style={{ backgroundColor: color }}
                    />
                  )}
                  {/* Animated dot */}
                  {isPlaying && index === activeStep && (
                    <div
                      className="absolute w-2 h-2 rounded-full -top-0.5 animate-bounce"
                      style={{
                        backgroundColor: color,
                        animation: 'moveRight 1s ease-in-out infinite',
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Active step description */}
      <div
        className="p-5 bg-[var(--surface-2)] rounded-lg min-h-[100px] transition-all duration-300"
        style={{ borderLeft: `4px solid ${color}` }}
      >
        <h4 className="font-semibold mb-2 flex items-center gap-2" style={{ color }}>
          <span className="text-lg">{steps[activeStep]?.icon}</span>
          {steps[activeStep]?.label}
        </h4>
        <p className="text-sm text-[var(--text-muted)] leading-relaxed">
          {steps[activeStep]?.description}
        </p>

        {/* Details list */}
        {showDetails && steps[activeStep]?.details && steps[activeStep].details!.length > 0 && (
          <ul className="mt-3 space-y-1">
            {steps[activeStep].details!.map((detail, i) => (
              <li key={i} className="text-xs text-[var(--text-muted)] flex items-start gap-2">
                <span style={{ color }}>•</span>
                {detail}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-4">
        <button
          type="button"
          onClick={() => {
            setIsPlaying(false);
            setActiveStep((prev) => (prev - 1 + steps.length) % steps.length);
          }}
          className="badge hover:border-[var(--border-strong)] flex items-center gap-1"
        >
          <span>←</span>
          <span>Prev</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="badge hover:border-[var(--border-strong)] px-4"
            style={isPlaying ? { backgroundColor: color, color: 'white', borderColor: color } : undefined}
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveStep(0);
              setCompletedSteps(new Set());
              setIsPlaying(true);
            }}
            className="badge hover:border-[var(--border-strong)]"
            title="Restart from beginning"
          >
            ↺ Reset
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsPlaying(false);
            setActiveStep((prev) => (prev + 1) % steps.length);
          }}
          className="badge hover:border-[var(--border-strong)] flex items-center gap-1"
        >
          <span>Next</span>
          <span>→</span>
        </button>
      </div>

      {/* Keyboard hint */}
      <p className="text-center text-xs text-[var(--text-muted)] mt-3">
        Use ← → arrow keys to navigate, Space to play/pause
      </p>

      <style jsx>{`
        @keyframes moveRight {
          0% { left: 0; }
          100% { left: calc(100% - 8px); }
        }
      `}</style>
    </div>
  );
}
