'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Ear,
  Brain,
  MessageCircle,
  Drama,
  Github,
  Gamepad2,
  BookOpen,
} from 'lucide-react';
import content from '../data/content/end-to-end.json';
import { AnimatedDiagram, CodeWalkthrough } from '../components/core';
import { PipelineFlowDemo, QualityLatencyDemo } from '../components/demos/endtoend';

const sections = [
  { id: 'intro', label: 'Overview' },
  { id: 'pipeline', label: 'Pipeline' },
  { id: 'approaches', label: 'Approaches' },
  { id: 'latency', label: 'Latency' },
  { id: 'implementation', label: 'Build It' },
  { id: 'decision', label: 'Choose' },
];

const approachColors: Record<string, string> = {
  'streaming-approach': 'var(--color-streaming)',
  'generative-approach': 'var(--color-generative)',
  'metahuman-approach': 'var(--color-metahuman)',
  'gaussian-approach': 'var(--color-gaussian)',
};

const approachLinks: Record<string, string> = {
  'streaming-approach': '/learn/streaming-avatars',
  'generative-approach': '/learn/generative-video',
  'metahuman-approach': '/learn/metahuman',
  'gaussian-approach': '/learn/gaussian-splatting',
};

export default function EndToEndPage() {
  const [currentSection, setCurrentSection] = useState('intro');
  const [selectedApproach, setSelectedApproach] = useState<string | null>(null);
  const color = 'var(--accent)';

  return (
    <div>
      {/* Header */}
      <section className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-4 h-4 rounded-full bg-gradient-to-r from-[var(--color-gaussian)] via-[var(--color-generative)] to-[var(--color-streaming)]" />
          <span className="badge">Complete System</span>
          <span className="text-sm text-[var(--text-muted)]">~30 min</span>
        </div>
        <h1 className="text-3xl font-semibold mb-2">{content.title}</h1>
        <p className="text-lg text-[var(--text-muted)]">{content.subtitle}</p>
      </section>

      {/* Progress tracker */}
      <nav className="sticky top-20 z-40 bg-[var(--bg)] py-3 border-b border-[var(--border)] mb-8 -mx-6 px-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {sections.map((section, index) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              onClick={() => setCurrentSection(section.id)}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors
                ${section.id === currentSection ? 'font-medium text-white' : 'text-[var(--text-muted)] hover:text-[var(--foreground)]'}
              `}
              style={section.id === currentSection ? { backgroundColor: color } : undefined}
            >
              <span className={`
                w-5 h-5 rounded-full flex items-center justify-center text-xs
                ${section.id === currentSection ? 'bg-white/30' : 'border border-[var(--border)]'}
              `}>
                {index + 1}
              </span>
              <span className="hidden sm:inline">{section.label}</span>
            </a>
          ))}
        </div>
      </nav>

      {/* Section 1: Introduction */}
      <section id="intro" className="mb-16 scroll-mt-32">
        <h2 className="text-2xl font-semibold mb-4">The Complete Picture</h2>

        <div className="prose prose-neutral max-w-none">
          <p className="text-lg text-[var(--text-muted)] leading-relaxed mb-6">
            {content.intro.text}
          </p>
        </div>

        {/* Visual overview */}
        <div className="highlight-box">
          <p className="font-medium mb-4">What Makes a Real-Time Avatar?</p>
          <div className="grid md:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-[var(--surface-0)] rounded">
              <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-[var(--accent-subtle)] flex items-center justify-center">
                <Ear size={24} className="text-[var(--accent)]" />
              </div>
              <p className="font-medium">Listen</p>
              <p className="text-sm text-[var(--text-muted)]">Capture and transcribe speech</p>
            </div>
            <div className="p-4 bg-[var(--surface-0)] rounded">
              <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-[var(--accent-subtle)] flex items-center justify-center">
                <Brain size={24} className="text-[var(--accent)]" />
              </div>
              <p className="font-medium">Think</p>
              <p className="text-sm text-[var(--text-muted)]">Generate intelligent response</p>
            </div>
            <div className="p-4 bg-[var(--surface-0)] rounded">
              <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-[var(--accent-subtle)] flex items-center justify-center">
                <MessageCircle size={24} className="text-[var(--accent)]" />
              </div>
              <p className="font-medium">Speak</p>
              <p className="text-sm text-[var(--text-muted)]">Synthesize natural speech</p>
            </div>
            <div className="p-4 bg-[var(--surface-0)] rounded">
              <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-[var(--accent-subtle)] flex items-center justify-center">
                <Drama size={24} className="text-[var(--accent)]" />
              </div>
              <p className="font-medium">Animate</p>
              <p className="text-sm text-[var(--text-muted)]">Render talking avatar</p>
            </div>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* Section 2: Pipeline */}
      <section id="pipeline" className="mb-16 scroll-mt-32">
        <h2 className="text-2xl font-semibold mb-4">The Voice AI Pipeline</h2>
        <p className="text-[var(--text-muted)] mb-6">
          Every conversational avatar follows this flow. Understanding each stage
          helps you optimize for latency and choose the right tools.
        </p>

        <AnimatedDiagram
          steps={content.pipeline.steps}
          connections={content.pipeline.connections}
          color={color}
          autoPlay={true}
          intervalMs={2000}
        />

        {/* Interactive Pipeline Demo */}
        <div className="mt-8">
          <PipelineFlowDemo />
        </div>

        {/* Pipeline detail */}
        <div className="grid md:grid-cols-2 gap-4 mt-8">
          {content.pipeline.steps.map((step, index) => (
            <div key={step.id} className="card p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="w-6 h-6 rounded-full bg-[var(--accent)]/20 flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </span>
                <span className="font-medium">{step.label}</span>
              </div>
              <p className="text-sm text-[var(--text-muted)]">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="divider" />

      {/* Section 3: Approaches */}
      <section id="approaches" className="mb-16 scroll-mt-32">
        <h2 className="text-2xl font-semibold mb-4">Four Paths to Real-Time Avatars</h2>
        <p className="text-[var(--text-muted)] mb-6">
          Each approach offers different tradeoffs. Click to explore the architecture and code for each.
        </p>

        {/* Approach cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {content.approaches.map((approach) => (
            <div
              key={approach.id}
              className={`card p-5 cursor-pointer transition-all ${
                selectedApproach === approach.id ? 'ring-2' : ''
              }`}
              style={{
                borderColor: selectedApproach === approach.id ? approachColors[approach.id] : undefined,
                '--ring-color': approachColors[approach.id],
              } as React.CSSProperties}
              onClick={() => setSelectedApproach(selectedApproach === approach.id ? null : approach.id)}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: approachColors[approach.id] }}
                />
                <span className="badge">{approach.complexity} complexity</span>
                <span className="text-xs text-[var(--text-muted)]">{approach.latency}</span>
              </div>
              <h3 className="text-lg font-semibold mb-1">{approach.title}</h3>
              <p className="text-sm text-[var(--text-muted)] mb-3">{approach.subtitle}</p>
              <p className="text-sm text-[var(--text-muted)]">{approach.summary}</p>

              <div className="mt-4 flex items-center gap-2">
                <Link
                  href={approachLinks[approach.id]}
                  className="text-xs text-[var(--accent)] hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  Learn more →
                </Link>
                <span className="text-xs text-[var(--text-muted)]">|</span>
                <span className="text-xs text-[var(--text-muted)]">
                  {selectedApproach === approach.id ? 'Click to collapse' : 'Click to expand'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Expanded approach details */}
        {selectedApproach && (
          <div className="card p-6 mb-8" style={{ borderColor: approachColors[selectedApproach] }}>
            {content.approaches.filter(a => a.id === selectedApproach).map((approach) => (
              <div key={approach.id}>
                <h3 className="text-xl font-semibold mb-4" style={{ color: approachColors[approach.id] }}>
                  {approach.title} - Deep Dive
                </h3>

                {/* Architecture */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Architecture</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 bg-[var(--surface-2)] rounded">
                      <p className="text-xs text-[var(--text-muted)] mb-2">CLIENT</p>
                      <ul className="text-sm space-y-1">
                        {approach.architecture.client.map((item, i) => (
                          <li key={i}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-4 bg-[var(--surface-2)] rounded">
                      <p className="text-xs text-[var(--text-muted)] mb-2">SERVER</p>
                      <ul className="text-sm space-y-1">
                        {approach.architecture.server.map((item, i) => (
                          <li key={i}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-4 bg-[var(--surface-2)] rounded">
                      <p className="text-xs text-[var(--text-muted)] mb-2">AVATAR</p>
                      <ul className="text-sm space-y-1">
                        {approach.architecture.avatar.map((item, i) => (
                          <li key={i}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Pros and Cons */}
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-green-500/5 rounded border border-green-500/20">
                    <p className="font-medium text-green-600 mb-2">Advantages</p>
                    <ul className="text-sm space-y-1">
                      {approach.pros.map((pro, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-green-500">+</span>
                          <span className="text-[var(--text-muted)]">{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 bg-red-500/5 rounded border border-red-500/20">
                    <p className="font-medium text-red-600 mb-2">Limitations</p>
                    <ul className="text-sm space-y-1">
                      {approach.cons.map((con, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-red-500">-</span>
                          <span className="text-[var(--text-muted)]">{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Code example */}
                <div>
                  <h4 className="font-medium mb-3">{approach.code.title}</h4>
                  <pre className="bg-[var(--surface-2)] p-4 rounded overflow-x-auto text-sm">
                    <code>{approach.code.snippet}</code>
                  </pre>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Comparison table */}
        <div className="overflow-x-auto">
          <table className="research-table">
            <thead>
              <tr>
                {content.comparisonTable.headers.map((header) => (
                  <th key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {content.comparisonTable.rows.map((row) => (
                <tr key={row.approach}>
                  <td className="font-medium">{row.approach}</td>
                  <td>{row.latency}</td>
                  <td>{row.quality}</td>
                  <td>{row.setupTime}</td>
                  <td>{row.cost}</td>
                  <td className="text-[var(--text-muted)]">{row.bestFor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="divider" />

      {/* Section 4: Latency */}
      <section id="latency" className="mb-16 scroll-mt-32">
        <h2 className="text-2xl font-semibold mb-4">{content.latencyBreakdown.title}</h2>
        <p className="text-[var(--text-muted)] mb-6">
          Target: <span className="font-medium text-[var(--foreground)]">{content.latencyBreakdown.target}</span> for natural conversation
        </p>

        {/* Latency visualization */}
        <div className="card p-6 mb-6">
          <div className="space-y-4">
            {content.latencyBreakdown.components.map((component, index) => {
              const maxWidth = 500;
              const minPct = (component.min / maxWidth) * 100;
              const maxPct = (component.max / maxWidth) * 100;

              return (
                <div key={component.name} className="flex items-center gap-4">
                  <div className="w-40 text-sm text-right text-[var(--text-muted)]">{component.name}</div>
                  <div className="flex-1 h-6 bg-[var(--surface-2)] rounded relative">
                    <div
                      className="absolute h-full rounded bg-[var(--accent)]/30"
                      style={{ width: `${maxPct}%` }}
                    />
                    <div
                      className="absolute h-full rounded bg-[var(--accent)]"
                      style={{ width: `${minPct}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-end pr-2">
                      <span className="text-xs font-medium">
                        {component.min}-{component.max}{component.unit}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-[var(--border)]">
            <div className="flex items-center gap-4">
              <div className="w-40 text-sm text-right font-medium">Total (worst case)</div>
              <div className="flex-1">
                <span className="text-lg font-semibold">
                  {content.latencyBreakdown.components.reduce((sum, c) => sum + c.max, 0)}ms
                </span>
                <span className="text-[var(--text-muted)] ml-2">
                  (best: {content.latencyBreakdown.components.reduce((sum, c) => sum + c.min, 0)}ms)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="highlight-box">
          <p className="font-medium mb-3">Optimization Tips</p>
          <ul className="space-y-2">
            {content.latencyBreakdown.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-[var(--accent)]">→</span>
                <span className="text-[var(--text-muted)]">{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Quality vs Latency Demo */}
        <div className="mt-8">
          <QualityLatencyDemo />
        </div>
      </section>

      <div className="divider" />

      {/* Section 5: Implementation */}
      <section id="implementation" className="mb-16 scroll-mt-32">
        <h2 className="text-2xl font-semibold mb-4">Build It Yourself</h2>
        <p className="text-[var(--text-muted)] mb-6">
          Follow these steps to deploy a complete real-time avatar system using LiveKit.
        </p>

        <CodeWalkthrough
          steps={content.implementation.steps}
          color={color}
        />

        {/* Resources */}
        <div className="mt-8">
          <h3 className="font-semibold mb-4">Resources</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {content.implementation.resources.map((resource) => (
              <a
                key={resource.url}
                href={resource.url}
                target={resource.url.startsWith('/') ? undefined : '_blank'}
                rel={resource.url.startsWith('/') ? undefined : 'noopener noreferrer'}
                className="card p-4 flex items-start gap-3 hover:border-[var(--border-strong)]"
              >
                <span className="text-[var(--accent)]">
                  {resource.type === 'github' ? <Github size={18} /> : resource.type === 'demo' ? <Gamepad2 size={18} /> : <BookOpen size={18} />}
                </span>
                <div>
                  <p className="font-medium text-sm">{resource.title}</p>
                  <p className="text-xs text-[var(--text-muted)]">{resource.type}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* Section 6: Decision */}
      <section id="decision" className="mb-16 scroll-mt-32">
        <h2 className="text-2xl font-semibold mb-4">{content.decisionTree.title}</h2>

        {/* Decision flow */}
        <div className="card p-6 mb-8">
          <div className="space-y-6">
            {content.decisionTree.questions.map((q, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center text-white font-medium flex-shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium mb-2">{q.question}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="badge bg-green-500/10 text-green-600 border-green-500/20">
                      Yes → {q.yes === 'next' ? 'Next question' :
                             q.yes === 'generative-or-gaussian' ? 'Generative or Gaussian' :
                             content.approaches.find(a => a.id === q.yes)?.title}
                    </span>
                    <span className="badge bg-red-500/10 text-red-600 border-red-500/20">
                      No → {q.no === 'next' ? 'Next question' :
                            content.approaches.find(a => a.id === q.no)?.title}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick links to each track */}
        <div className="grid md:grid-cols-4 gap-4">
          <Link href="/learn/streaming-avatars" className="card p-4 hover:border-[var(--color-streaming)] text-center">
            <div className="w-3 h-3 rounded-full mx-auto mb-2" style={{ backgroundColor: 'var(--color-streaming)' }} />
            <p className="font-medium text-sm">Streaming</p>
            <p className="text-xs text-[var(--text-muted)]">Fastest to deploy</p>
          </Link>
          <Link href="/learn/generative-video" className="card p-4 hover:border-[var(--color-generative)] text-center">
            <div className="w-3 h-3 rounded-full mx-auto mb-2" style={{ backgroundColor: 'var(--color-generative)' }} />
            <p className="font-medium text-sm">Generative</p>
            <p className="text-xs text-[var(--text-muted)]">Best quality</p>
          </Link>
          <Link href="/learn/metahuman" className="card p-4 hover:border-[var(--color-metahuman)] text-center">
            <div className="w-3 h-3 rounded-full mx-auto mb-2" style={{ backgroundColor: 'var(--color-metahuman)' }} />
            <p className="font-medium text-sm">MetaHuman</p>
            <p className="text-xs text-[var(--text-muted)]">Most control</p>
          </Link>
          <Link href="/learn/gaussian-splatting" className="card p-4 hover:border-[var(--color-gaussian)] text-center">
            <div className="w-3 h-3 rounded-full mx-auto mb-2" style={{ backgroundColor: 'var(--color-gaussian)' }} />
            <p className="font-medium text-sm">Gaussian</p>
            <p className="text-xs text-[var(--text-muted)]">Cutting edge</p>
          </Link>
        </div>
      </section>

      {/* Try it */}
      <section className="mb-16">
        <div className="card p-6 text-center bg-gradient-to-r from-[var(--color-gaussian)]/10 via-[var(--color-generative)]/10 to-[var(--color-streaming)]/10">
          <h3 className="font-semibold mb-2">See It In Action</h3>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            Experience a complete real-time avatar system using the Streaming approach
            with LiveKit and Hedra.
          </p>
          <Link
            href="/livekit"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Launch Live Demo
            <span>→</span>
          </Link>
        </div>
      </section>

      {/* Trade-offs */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">When to Build a Real-Time Avatar</h2>
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="card-alt p-5">
            <p className="font-medium mb-3 text-green-600">Good Use Cases</p>
            <ul className="space-y-2 text-sm text-[var(--text-muted)]">
              {content.tradeoffs.when.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-green-500">+</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="card-alt p-5">
            <p className="font-medium mb-3 text-red-600">Consider Alternatives</p>
            <ul className="space-y-2 text-sm text-[var(--text-muted)]">
              {content.tradeoffs.whenNot.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-red-500">-</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="highlight-box">
          <p className="font-medium mb-2">Best Use Case</p>
          <p className="text-[var(--text-muted)]">{content.tradeoffs.bestFor}</p>
        </div>
      </section>
    </div>
  );
}
