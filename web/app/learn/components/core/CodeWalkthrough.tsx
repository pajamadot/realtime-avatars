'use client';

import { useState, useCallback } from 'react';

interface CodeStep {
  title: string;
  description: string;
  code?: string;
  language?: string;
  highlightLines?: number[];
  tip?: string;
  warning?: string;
}

interface CodeWalkthroughProps {
  steps: CodeStep[];
  color?: string;
  showLineNumbers?: boolean;
}

export default function CodeWalkthrough({
  steps,
  color = 'var(--accent)',
  showLineNumbers = true,
}: CodeWalkthroughProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [copied, setCopied] = useState(false);
  const [expandedCode, setExpandedCode] = useState(false);

  const copyToClipboard = useCallback(async () => {
    const code = steps[activeStep]?.code;
    if (!code) return;

    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [activeStep, steps]);

  const renderCodeWithLineNumbers = (code: string, highlightLines: number[] = []) => {
    const lines = code.split('\n');
    return lines.map((line, i) => {
      const lineNum = i + 1;
      const isHighlighted = highlightLines.includes(lineNum);

      return (
        <div
          key={i}
          className={`flex transition-colors ${isHighlighted ? 'bg-yellow-500/20' : 'hover:bg-[var(--card-bg)]'}`}
        >
          {showLineNumbers && (
            <span
              className={`select-none w-10 text-right pr-4 text-[var(--muted)] ${
                isHighlighted ? 'text-yellow-500 font-bold' : ''
              }`}
            >
              {lineNum}
            </span>
          )}
          <span className={isHighlighted ? 'font-medium' : ''}>
            {line || ' '}
          </span>
        </div>
      );
    });
  };

  const currentStep = steps[activeStep];
  const codeLines = currentStep?.code?.split('\n').length || 0;
  const shouldCollapse = codeLines > 20 && !expandedCode;

  return (
    <div className="card overflow-hidden">
      {/* Progress indicator */}
      <div className="h-1 bg-[var(--card-bg-alt)]">
        <div
          className="h-full transition-all duration-300"
          style={{
            backgroundColor: color,
            width: `${((activeStep + 1) / steps.length) * 100}%`,
          }}
        />
      </div>

      {/* Step tabs */}
      <div className="flex border-b border-[var(--border)] overflow-x-auto">
        {steps.map((step, index) => {
          const isActive = index === activeStep;
          const isCompleted = index < activeStep;

          return (
            <button
              key={step.title}
              type="button"
              onClick={() => setActiveStep(index)}
              className={`
                px-4 py-3 text-sm font-medium whitespace-nowrap
                border-b-2 transition-all relative
                ${isActive
                  ? 'border-current'
                  : isCompleted
                    ? 'border-green-500 text-green-500'
                    : 'border-transparent text-[var(--muted)] hover:text-[var(--foreground)]'
                }
              `}
              style={isActive ? { color, borderColor: color } : undefined}
            >
              <span className={`mr-2 ${isCompleted && !isActive ? '' : ''}`}>
                {isCompleted && !isActive ? '✓' : `${index + 1}.`}
              </span>
              {step.title}

              {/* Active indicator dot */}
              {isActive && (
                <span
                  className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
                  style={{ backgroundColor: color }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Step content */}
      <div className="p-6">
        {/* Description */}
        <p className="text-sm text-[var(--muted)] mb-4 leading-relaxed">
          {currentStep?.description}
        </p>

        {/* Tip callout */}
        {currentStep?.tip && (
          <div className="p-3 mb-4 rounded border-l-4 bg-blue-500/10 border-blue-500 text-sm">
            <span className="font-semibold text-blue-500">💡 Tip:</span>{' '}
            <span className="text-[var(--foreground)]">{currentStep.tip}</span>
          </div>
        )}

        {/* Warning callout */}
        {currentStep?.warning && (
          <div className="p-3 mb-4 rounded border-l-4 bg-yellow-500/10 border-yellow-500 text-sm">
            <span className="font-semibold text-yellow-500">⚠️ Warning:</span>{' '}
            <span className="text-[var(--foreground)]">{currentStep.warning}</span>
          </div>
        )}

        {currentStep?.code && (
          <div className="relative group">
            {/* Code header */}
            <div className="flex items-center justify-between px-4 py-2 bg-[var(--card-bg)] border-b border-[var(--border)] rounded-t-lg">
              <div className="flex items-center gap-2">
                {/* Traffic light dots */}
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>
                <span className="text-xs text-[var(--muted)] ml-2">
                  {currentStep?.language || 'code'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--muted)]">
                  {codeLines} lines
                </span>

                {/* Copy button */}
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className={`
                    px-3 py-1 text-xs rounded transition-all
                    ${copied
                      ? 'bg-green-500 text-white'
                      : 'bg-[var(--card-bg-alt)] hover:bg-[var(--border)] text-[var(--muted)]'
                    }
                  `}
                >
                  {copied ? '✓ Copied!' : '📋 Copy'}
                </button>
              </div>
            </div>

            {/* Code content */}
            <div
              className={`relative overflow-hidden transition-all duration-300 ${
                shouldCollapse ? 'max-h-[400px]' : ''
              }`}
            >
              <pre className="code overflow-x-auto text-sm p-4 rounded-b-lg bg-[var(--card-bg-alt)] font-mono">
                <code>{renderCodeWithLineNumbers(currentStep.code, currentStep.highlightLines)}</code>
              </pre>

              {/* Collapse gradient */}
              {shouldCollapse && (
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[var(--card-bg-alt)] to-transparent pointer-events-none" />
              )}
            </div>

            {/* Expand/Collapse button */}
            {codeLines > 20 && (
              <button
                type="button"
                onClick={() => setExpandedCode(!expandedCode)}
                className="w-full py-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] bg-[var(--card-bg-alt)] border-t border-[var(--border)] transition-colors"
              >
                {expandedCode ? '▲ Show less' : `▼ Show all ${codeLines} lines`}
              </button>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            type="button"
            onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
            disabled={activeStep === 0}
            className="badge hover:border-[var(--border-strong)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <span>←</span>
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-2">
            {steps.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setActiveStep(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === activeStep ? 'scale-125' : 'opacity-50 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: index === activeStep ? color : index < activeStep ? '#22c55e' : 'var(--border)',
                }}
                title={`Step ${index + 1}: ${steps[index].title}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => setActiveStep((prev) => Math.min(steps.length - 1, prev + 1))}
            disabled={activeStep === steps.length - 1}
            className="badge hover:border-[var(--border-strong)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <span>Next</span>
            <span>→</span>
          </button>
        </div>

        {/* Step indicator */}
        <p className="text-center text-xs text-[var(--muted)] mt-3">
          Step {activeStep + 1} of {steps.length}
          {activeStep === steps.length - 1 && (
            <span className="ml-2 text-green-500">✓ Complete!</span>
          )}
        </p>
      </div>
    </div>
  );
}
