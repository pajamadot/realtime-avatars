'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Lightbulb } from 'lucide-react';

// Import concept data
import diffusionMath from '../../../data/concepts/diffusion-math.json';
import gradientDescent from '../../../data/concepts/gradient-descent.json';
import vaeEncoder from '../../../data/concepts/vae-encoder.json';
import phonemeViseme from '../../../data/concepts/phoneme-viseme.json';
import consistencyModels from '../../../data/concepts/consistency-models.json';
import referenceNet from '../../../data/concepts/reference-net.json';

const concepts: Record<string, typeof diffusionMath> = {
  'diffusion-math': diffusionMath,
  'gradient-descent': gradientDescent,
  'vae-encoder': vaeEncoder,
  'phoneme-viseme': phonemeViseme,
  'consistency-models': consistencyModels,
  'reference-net': referenceNet,
};

const color = 'var(--color-generative)';

export default function ConceptPage() {
  const params = useParams();
  const conceptId = params.concept as string;
  const concept = concepts[conceptId];

  if (!concept) {
    notFound();
  }

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-sm text-[var(--text-muted)]">
        <Link href="/learn" className="hover:text-[var(--accent)]">Learn</Link>
        <span>/</span>
        <Link href="/learn/generative-video" className="hover:text-[var(--accent)]">Generative Video</Link>
        <span>/</span>
        <span className="text-[var(--foreground)]">{concept.title}</span>
      </nav>

      {/* Header */}
      <section className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span
            className="px-2 py-1 text-xs font-medium rounded text-white"
            style={{ backgroundColor: color }}
          >
            Level {concept.level}
          </span>
          <span className="text-sm text-[var(--text-muted)]">Drill-down concept</span>
        </div>
        <h1 className="text-3xl font-semibold mb-4">{concept.title}</h1>
      </section>

      {/* What Level 3 Assumed */}
      <section className="mb-8">
        <div className="card-alt p-5">
          <p className="font-medium mb-2">What the parent explanation assumed you knew:</p>
          <p className="text-[var(--text-muted)]">{concept.explanation.level3Assumes}</p>
        </div>
      </section>

      {/* This Explains */}
      <section className="mb-8">
        <div className="highlight-box">
          <p className="font-medium mb-2">What this page explains:</p>
          <p className="text-[var(--text-muted)]">{concept.explanation.thisExplains}</p>
        </div>
      </section>

      {/* Main Explanation */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">The Explanation</h2>
        <div className="prose prose-neutral max-w-none">
          {concept.explanation.text.split('\n\n').map((paragraph, i) => {
            // Check if it's a code block
            if (paragraph.startsWith('```')) {
              const code = paragraph.replace(/```\w*\n?/g, '').trim();
              return (
                <pre key={i} className="code p-4 rounded-lg bg-[var(--surface-2)] overflow-x-auto">
                  <code>{code}</code>
                </pre>
              );
            }

            // Check if it's a list
            if (paragraph.includes('\n-') || paragraph.includes('\n1.')) {
              const lines = paragraph.split('\n');
              const title = lines[0];
              const items = lines.slice(1).filter(l => l.trim());

              return (
                <div key={i} className="mb-4">
                  {title && !title.startsWith('-') && !title.match(/^\d\./) && (
                    <p className="font-medium mb-2">{title}</p>
                  )}
                  <ul className="space-y-1">
                    {(title.startsWith('-') || title.match(/^\d\./) ? [title, ...items] : items).map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-[var(--text-muted)]">
                        <span className="text-[var(--accent)]">•</span>
                        {item.replace(/^[-\d.]\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            }

            // Regular paragraph
            return (
              <p
                key={i}
                className="text-[var(--text-muted)] mb-4 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: paragraph
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-[var(--foreground)]">$1</strong>')
                    .replace(/`(.*?)`/g, '<code class="px-1 py-0.5 bg-[var(--surface-2)] rounded text-sm">$1</code>')
                }}
              />
            );
          })}
        </div>
      </section>

      {/* Visual Aid */}
      {concept.visual && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Visual Aid</h2>
          <div className="card p-6">
            {concept.visual.type === 'interactive' && concept.visual.demoId && (
              <div className="text-center py-8">
                <p className="text-[var(--text-muted)] mb-4">{concept.visual.caption}</p>
                <Link
                  href={`/learn/generative-video#demo-${concept.visual.demoId}`}
                  className="badge hover:border-[var(--border-strong)]"
                >
                  Open interactive demo →
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Aha Moment */}
      <section className="mb-12">
        <div className="research-note">
          <p className="font-medium mb-2 flex items-center gap-2"><Lightbulb size={18} className="text-yellow-500" /> The "Aha" Moment</p>
          <p className="text-lg">{concept.insight}</p>
        </div>
      </section>

      {/* Prerequisites (Level 1) */}
      {concept.prerequisites && concept.prerequisites.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Go Even Deeper</h2>
          <p className="text-[var(--text-muted)] mb-4">
            This explanation assumes you understand these fundamentals. Click to learn more:
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {concept.prerequisites.map((prereq) => (
              <Link key={prereq} href={`/learn/generative-video/concepts/${prereq}`} className="card p-4 hover:border-[var(--border-strong)]">
                <p className="font-medium capitalize">{prereq.replace(/-/g, ' ')}</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">Level 1 fundamental</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Navigation */}
      <section>
        <div className="flex items-center justify-between pt-8 border-t border-[var(--border)]">
          <Link
            href="/learn/generative-video"
            className="badge hover:border-[var(--border-strong)]"
          >
            ← Back to Generative Video
          </Link>
          <Link
            href="/learn/generative-video#concepts"
            className="badge hover:border-[var(--border-strong)]"
          >
            View All Concepts
          </Link>
        </div>
      </section>
    </div>
  );
}
