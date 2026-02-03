'use client';

import { useState } from 'react';
import Link from 'next/link';

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
}: ConceptCardProps) {
  const [showMetaphor, setShowMetaphor] = useState(false);

  return (
    <div className="card p-5 relative">
      {/* Index badge */}
      <div
        className="absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white"
        style={{ backgroundColor: color }}
      >
        {index + 1}
      </div>

      <div className="pl-4">
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <p className="text-sm text-[var(--muted)] mb-4">{summary}</p>

        {/* Metaphor toggle */}
        <button
          type="button"
          onClick={() => setShowMetaphor(!showMetaphor)}
          className="text-sm text-[var(--accent)] hover:underline mb-3 flex items-center gap-2"
        >
          <span>{showMetaphor ? '▼' : '▶'}</span>
          <span>Visual metaphor</span>
        </button>

        {showMetaphor && (
          <div className="p-3 bg-[var(--card-bg-alt)] rounded text-sm text-[var(--muted)] mb-4 border-l-2" style={{ borderColor: color }}>
            💡 {visualMetaphor}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          {demoId && (
            <Link
              href={`/learn/${trackId}#demo-${demoId}`}
              className="badge hover:border-[var(--border-strong)]"
            >
              🎮 Try demo
            </Link>
          )}
          {drillDown && (
            <Link
              href={`/learn/${trackId}/concepts/${drillDown}`}
              className="badge hover:border-[var(--border-strong)]"
            >
              🔍 Go deeper
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
