'use client';

import { useState } from 'react';

interface CodeStep {
  title: string;
  description: string;
  code?: string;
  language?: string;
}

interface CodeWalkthroughProps {
  steps: CodeStep[];
  color?: string;
}

export default function CodeWalkthrough({
  steps,
  color = 'var(--accent)',
}: CodeWalkthroughProps) {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className="card overflow-hidden">
      {/* Step tabs */}
      <div className="flex border-b border-[var(--border)] overflow-x-auto">
        {steps.map((step, index) => (
          <button
            key={step.title}
            type="button"
            onClick={() => setActiveStep(index)}
            className={`
              px-4 py-3 text-sm font-medium whitespace-nowrap
              border-b-2 transition-colors
              ${index === activeStep
                ? 'border-current'
                : 'border-transparent text-[var(--muted)] hover:text-[var(--foreground)]'
              }
            `}
            style={index === activeStep ? { color, borderColor: color } : undefined}
          >
            <span className="mr-2">{index + 1}.</span>
            {step.title}
          </button>
        ))}
      </div>

      {/* Step content */}
      <div className="p-6">
        <p className="text-sm text-[var(--muted)] mb-4">
          {steps[activeStep]?.description}
        </p>

        {steps[activeStep]?.code && (
          <div className="relative">
            <div className="absolute top-2 right-2 text-xs text-[var(--muted)] bg-[var(--card-bg)] px-2 py-1 rounded">
              {steps[activeStep]?.language || 'code'}
            </div>
            <pre className="code overflow-x-auto text-sm p-4 rounded-lg bg-[var(--card-bg-alt)]">
              <code>{steps[activeStep]?.code}</code>
            </pre>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            type="button"
            onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
            disabled={activeStep === 0}
            className="badge hover:border-[var(--border-strong)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          <span className="text-sm text-[var(--muted)]">
            Step {activeStep + 1} of {steps.length}
          </span>
          <button
            type="button"
            onClick={() => setActiveStep((prev) => Math.min(steps.length - 1, prev + 1))}
            disabled={activeStep === steps.length - 1}
            className="badge hover:border-[var(--border-strong)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
