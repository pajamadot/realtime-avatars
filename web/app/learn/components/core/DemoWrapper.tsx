'use client';

import { useState } from 'react';

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
}: DemoWrapperProps) {
  const [showInsights, setShowInsights] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const difficultyColors = {
    beginner: '#22c55e',
    intermediate: '#f59e0b',
    advanced: '#ef4444',
  };

  return (
    <div
      id={id ? `demo-${id}` : undefined}
      className={`card overflow-hidden transition-all duration-300 ${
        isFullscreen ? 'fixed inset-4 z-50 overflow-auto' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border)] bg-[var(--card-bg)]">
        <div className="flex items-center gap-3">
          <span className="text-lg">🎮</span>
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              {title}
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: difficultyColors[difficulty] + '20',
                  color: difficultyColors[difficulty],
                }}
              >
                {difficulty}
              </span>
            </h3>
            {description && (
              <p className="text-xs text-[var(--muted)] mt-0.5">{description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {insights.length > 0 && (
            <button
              type="button"
              onClick={() => setShowInsights(!showInsights)}
              className={`text-xs px-3 py-1 rounded transition-colors ${
                showInsights
                  ? 'bg-purple-500 text-white'
                  : 'bg-[var(--card-bg-alt)] text-[var(--muted)] hover:text-[var(--foreground)]'
              }`}
            >
              💡 Insights
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="text-xs px-3 py-1 rounded bg-[var(--card-bg-alt)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? '⊙' : '⛶'}
          </button>
        </div>
      </div>

      {/* Insights panel */}
      {showInsights && insights.length > 0 && (
        <div className="p-4 bg-purple-500/10 border-b border-purple-500/20">
          <h4 className="text-sm font-semibold text-purple-400 mb-2">Key Insights</h4>
          <ul className="space-y-1">
            {insights.map((insight, i) => (
              <li key={i} className="text-sm text-[var(--muted)] flex items-start gap-2">
                <span className="text-purple-400">•</span>
                {insight}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Demo content */}
      <div className="p-4">
        {children}
      </div>

      {/* Controls */}
      {controls && (
        <div className="p-4 border-t border-[var(--border)] bg-[var(--card-bg-alt)]">
          {controls}
        </div>
      )}

      {/* Tips section */}
      {tips.length > 0 && (
        <div className="p-4 border-t border-[var(--border)] bg-blue-500/5">
          <h4 className="text-xs font-semibold text-blue-400 mb-2 flex items-center gap-1">
            <span>🎯</span> Tips for this demo
          </h4>
          <ul className="grid md:grid-cols-2 gap-2">
            {tips.map((tip, i) => (
              <li key={i} className="text-xs text-[var(--muted)] flex items-start gap-2">
                <span className="text-blue-400">→</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Related concepts */}
      {relatedConcepts.length > 0 && (
        <div className="p-4 border-t border-[var(--border)]">
          <span className="text-xs text-[var(--muted)]">Related:</span>
          <div className="flex flex-wrap gap-2 mt-1">
            {relatedConcepts.map((concept) => (
              <a
                key={concept.name}
                href={concept.link}
                className="text-xs px-2 py-1 rounded bg-[var(--card-bg-alt)] hover:bg-[var(--border)] transition-colors"
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
