'use client';

import { useState } from 'react';
import {
  Gamepad2,
  Lightbulb,
  Maximize2,
  Minimize2,
  Target,
  ArrowRight,
  Circle,
} from 'lucide-react';

interface DemoWrapperProps {
  id?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  controls?: React.ReactNode;
  insights?: string[];
  tips?: string[];
  relatedConcepts?: { name: string; link: string }[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  isActive?: boolean;
}

export default function DemoWrapper({
  id,
  title,
  description,
  children,
  controls,
  insights = [],
  tips = [],
  relatedConcepts = [],
  difficulty = 'intermediate',
  isActive = false,
}: DemoWrapperProps) {
  const [showInsights, setShowInsights] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const difficultyConfig = {
    beginner: { color: 'var(--difficulty-beginner)', bg: 'var(--difficulty-beginner-bg)' },
    intermediate: { color: 'var(--difficulty-intermediate)', bg: 'var(--difficulty-intermediate-bg)' },
    advanced: { color: 'var(--difficulty-advanced)', bg: 'var(--difficulty-advanced-bg)' },
  };

  const config = difficultyConfig[difficulty];

  return (
    <div
      id={id ? `demo-${id}` : undefined}
      className={`card overflow-hidden transition-all duration-300 ${
        isFullscreen ? 'fixed inset-4 z-50 overflow-auto' : ''
      }`}
    >
      {/* Accent line at top */}
      <div
        className="h-0.5"
        style={{ background: 'var(--accent)' }}
      />

      {/* Header with gradient */}
      <div
        className="flex items-center justify-between p-4 border-b border-[var(--border)]"
        style={{ background: 'var(--surface-warm-gradient)' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-subtle)] flex items-center justify-center text-[var(--accent)]">
            <Gamepad2 size={18} strokeWidth={1.75} />
          </div>
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              {title}
              {isActive && (
                <span className="activity-indicator" title="Demo is active" />
              )}
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  backgroundColor: config.bg,
                  color: config.color,
                }}
              >
                {difficulty}
              </span>
            </h3>
            {description && (
              <p className="text-xs text-[var(--text-muted)] mt-0.5">{description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {insights.length > 0 && (
            <button
              type="button"
              onClick={() => setShowInsights(!showInsights)}
              className={`btn btn-sm ${
                showInsights ? 'btn-primary' : 'btn-ghost'
              }`}
            >
              <Lightbulb size={14} strokeWidth={1.75} />
              <span>Insights</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="btn btn-sm btn-ghost btn-icon"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? (
              <Minimize2 size={16} strokeWidth={1.75} />
            ) : (
              <Maximize2 size={16} strokeWidth={1.75} />
            )}
          </button>
        </div>
      </div>

      {/* Insights panel */}
      {showInsights && insights.length > 0 && (
        <div className="p-4 bg-[var(--color-metahuman-light)] border-b border-[var(--color-metahuman)]/20">
          <h4 className="text-sm font-semibold text-[var(--color-metahuman)] mb-2 flex items-center gap-2">
            <Lightbulb size={14} strokeWidth={2} />
            Key Insights
          </h4>
          <ul className="space-y-1.5">
            {insights.map((insight, i) => (
              <li key={i} className="text-sm text-[var(--text-secondary)] flex items-start gap-2">
                <Circle size={6} className="mt-1.5 fill-[var(--color-metahuman)] text-[var(--color-metahuman)]" />
                {insight}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Demo content */}
      <div className="p-4">{children}</div>

      {/* Controls */}
      {controls && (
        <div className="p-4 border-t border-[var(--border)] bg-[var(--surface-2)]">
          {controls}
        </div>
      )}

      {/* Tips section */}
      {tips.length > 0 && (
        <div className="p-4 border-t border-[var(--border)] bg-[var(--info-light)]">
          <h4 className="text-xs font-semibold text-[var(--info)] mb-2 flex items-center gap-1.5">
            <Target size={12} strokeWidth={2} />
            Tips for this demo
          </h4>
          <ul className="grid md:grid-cols-2 gap-2">
            {tips.map((tip, i) => (
              <li key={i} className="text-xs text-[var(--text-secondary)] flex items-start gap-2">
                <ArrowRight size={12} className="mt-0.5 text-[var(--info)]" strokeWidth={2} />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Related concepts */}
      {relatedConcepts.length > 0 && (
        <div className="p-4 border-t border-[var(--border)]">
          <span className="text-xs text-[var(--text-muted)]">Related:</span>
          <div className="flex flex-wrap gap-2 mt-1.5">
            {relatedConcepts.map((concept) => (
              <a
                key={concept.name}
                href={concept.link}
                className="badge hover:border-[var(--border-strong)] transition-colors"
              >
                {concept.name}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Fullscreen overlay */}
      {isFullscreen && (
        <div
          className="fixed inset-0 bg-black/50 -z-10"
          onClick={() => setIsFullscreen(false)}
        />
      )}
    </div>
  );
}
