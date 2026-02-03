'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Lightbulb, Gamepad2, Search } from 'lucide-react';

interface ConceptCardProps {
  id: string;
  title: string;
  summary: string;
  visualMetaphor: string;
  demoId?: string;
  drillDown?: string;
  trackId: string;
  color?: string;
  index?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  timeEstimate?: string;
  prerequisites?: string[];
  keyInsight?: string;
}

export default function ConceptCard({
  id,
  title,
  summary,
  visualMetaphor,
  demoId,
  drillDown,
  trackId,
  color = 'var(--accent)',
  index = 0,
  difficulty = 'intermediate',
  timeEstimate,
  prerequisites = [],
  keyInsight,
}: ConceptCardProps) {
  const [showMetaphor, setShowMetaphor] = useState(false);
  const [showPrereqs, setShowPrereqs] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const difficultyColors = {
    beginner: '#66ff66',
    intermediate: '#ffaa66',
    advanced: '#ff6666',
  };

  const difficultyLabels = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
  };

  return (
    <div
      className={`card p-5 relative transition-all duration-300 ${isHovered ? 'shadow-lg -translate-y-1' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        borderColor: isHovered ? color : undefined,
        borderWidth: isHovered ? '2px' : undefined,
      }}
    >
      {/* Index badge */}
      <div
        className={`absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white transition-transform duration-300 ${isHovered ? 'scale-110' : ''}`}
        style={{ backgroundColor: color }}
      >
        {index + 1}
      </div>

      {/* Difficulty and time badge */}
      <div className="absolute -top-2 right-3 flex items-center gap-2">
        <span
          className="text-xs px-2 py-0.5 rounded-full font-medium"
          style={{ backgroundColor: difficultyColors[difficulty] + '30', color: difficultyColors[difficulty] }}
        >
          {difficultyLabels[difficulty]}
        </span>
        {timeEstimate && (
          <span className="text-xs text-[var(--muted)] bg-[var(--card-bg-alt)] px-2 py-0.5 rounded-full">
            {timeEstimate}
          </span>
        )}
      </div>

      <div className="pl-4 pt-2">
        <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
          {title}
          {isHovered && (
            <span className="text-sm font-normal text-[var(--muted)] animate-pulse">→</span>
          )}
        </h3>
        <p className="text-sm text-[var(--muted)] mb-4 leading-relaxed">{summary}</p>

        {/* Key Insight - Always visible if provided */}
        {keyInsight && (
          <div
            className="p-3 rounded mb-4 text-sm border-l-4 transition-all duration-300"
            style={{
              borderColor: color,
              backgroundColor: isHovered ? color + '15' : 'var(--card-bg-alt)',
            }}
          >
            <span className="font-semibold" style={{ color }}>Key insight:</span>{' '}
            <span className="text-[var(--foreground)]">{keyInsight}</span>
          </div>
        )}

        {/* Prerequisites toggle */}
        {prerequisites.length > 0 && (
          <>
            <button
              type="button"
              onClick={() => setShowPrereqs(!showPrereqs)}
              className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] mb-2 flex items-center gap-2 transition-colors"
            >
              <span className={`transition-transform duration-200 ${showPrereqs ? 'rotate-90' : ''}`}>▶</span>
              <span>Prerequisites ({prerequisites.length})</span>
            </button>

            <div className={`overflow-hidden transition-all duration-300 ${showPrereqs ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="flex flex-wrap gap-1 mb-3 pl-4">
                {prerequisites.map((prereq) => (
                  <span
                    key={prereq}
                    className="text-xs bg-[var(--card-bg-alt)] px-2 py-1 rounded border border-[var(--border)]"
                  >
                    {prereq}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Metaphor toggle */}
        <button
          type="button"
          onClick={() => setShowMetaphor(!showMetaphor)}
          className="text-sm hover:underline mb-3 flex items-center gap-2 transition-colors"
          style={{ color }}
        >
          <span className={`transition-transform duration-200 ${showMetaphor ? 'rotate-90' : ''}`}>▶</span>
          <span>Visual metaphor</span>
        </button>

        <div className={`overflow-hidden transition-all duration-300 ${showMetaphor ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div
            className="p-3 bg-[var(--card-bg-alt)] rounded text-sm text-[var(--muted)] mb-4 border-l-2 flex items-start gap-2"
            style={{ borderColor: color }}
          >
            <Lightbulb size={16} className="flex-shrink-0 mt-0.5" style={{ color }} />
            <span>{visualMetaphor}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          {demoId && (
            <Link
              href={`/learn/${trackId}#demo-${demoId}`}
              className="badge hover:border-[var(--border-strong)] flex items-center gap-1 transition-all hover:scale-105"
            >
              <Gamepad2 size={14} />
              <span>Try demo</span>
            </Link>
          )}
          {drillDown && (
            <Link
              href={`/learn/${trackId}/concepts/${drillDown}`}
              className="badge hover:border-[var(--border-strong)] flex items-center gap-1 transition-all hover:scale-105"
            >
              <Search size={14} />
              <span>Go deeper</span>
            </Link>
          )}
        </div>

        {/* Progress indicator on hover */}
        {isHovered && (
          <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b overflow-hidden">
            <div
              className="h-full animate-pulse"
              style={{ backgroundColor: color, width: '30%' }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
