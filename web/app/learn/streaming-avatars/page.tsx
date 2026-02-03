'use client';

import { useState } from 'react';
import Link from 'next/link';
import content from '../data/content/streaming-avatars.json';
import { ConceptCard, AnimatedDiagram, CodeWalkthrough, CrossTrackNav } from '../components/core';
import { LatencyDemo, ICEConnectionDemo, VADDemo, SFUComparisonDemo, ProviderComparisonDemo, JitterBufferDemo, BitrateAdaptationDemo } from '../components/demos/streaming';

const sections = [
  { id: 'intro', label: 'Introduction' },
  { id: 'pipeline', label: 'Pipeline' },
  { id: 'concepts', label: 'Key Concepts' },
  { id: 'implementation', label: 'Build It' },
  { id: 'tradeoffs', label: 'Trade-offs' },
];

export default function StreamingAvatarsPage() {
  const [currentSection, setCurrentSection] = useState('intro');
  const color = 'var(--color-streaming)';

  return (
    <div>
      {/* Header */}
      <section className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
          <span className="badge">Infrastructure</span>
          <span className="text-sm text-[var(--muted)]">~25 min</span>
        </div>
        <h1 className="text-3xl font-semibold mb-2">{content.title}</h1>
        <p className="text-lg text-[var(--muted)]">{content.subtitle}</p>
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
                ${section.id === currentSection ? 'font-medium text-white' : 'text-[var(--muted)] hover:text-[var(--foreground)]'}
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
        <h2 className="text-2xl font-semibold mb-4">What are Streaming Avatars?</h2>

        <div className="prose prose-neutral max-w-none">
          <p className="text-lg text-[var(--muted)] leading-relaxed mb-6">
            {content.intro.text}
          </p>
        </div>

        {/* Quick visual */}
        <div className="highlight-box">
          <p className="font-medium mb-4">The Core Idea in 30 Seconds</p>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-[var(--card-bg)] rounded">
              <div className="text-3xl mb-2">🌐</div>
              <p className="font-medium">WebRTC Transport</p>
              <p className="text-sm text-[var(--muted)]">Encrypted, real-time, no plugins needed</p>
            </div>
            <div className="p-4 bg-[var(--card-bg)] rounded">
              <div className="text-3xl mb-2">🎭</div>
              <p className="font-medium">Cloud Avatar</p>
              <p className="text-sm text-[var(--muted)]">GPU rendering happens server-side</p>
            </div>
            <div className="p-4 bg-[var(--card-bg)] rounded">
              <div className="text-3xl mb-2">📱</div>
              <p className="font-medium">Any Device</p>
              <p className="text-sm text-[var(--muted)]">Works on web, mobile, low-end hardware</p>
            </div>
          </div>
        </div>

        {/* Architecture diagram */}
        <div className="card p-6 mt-6">
          <h3 className="font-semibold mb-3">The Puppeteer Metaphor</h3>
          <p className="text-sm text-[var(--muted)] mb-4">
            Avatar providers are like puppeteers hidden behind the stage. You send them audio (the script),
            they perform the show (generate video). The audience only sees the puppet, never the puppeteer.
          </p>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-[var(--card-bg-alt)] rounded">
              <div className="text-4xl mb-2">🎤</div>
              <p className="text-sm font-medium">Your Audio</p>
              <p className="text-xs text-[var(--muted)]">The script</p>
            </div>
            <div className="text-center p-4 bg-[var(--card-bg-alt)] rounded">
              <div className="text-4xl mb-2">🎭</div>
              <p className="text-sm font-medium">Avatar Provider</p>
              <p className="text-xs text-[var(--muted)]">The hidden puppeteer</p>
            </div>
            <div className="text-center p-4 bg-[var(--card-bg-alt)] rounded">
              <div className="text-4xl mb-2">📹</div>
              <p className="text-sm font-medium">Video Stream</p>
              <p className="text-xs text-[var(--muted)]">The performance</p>
            </div>
            <div className="text-center p-4 bg-[var(--card-bg-alt)] rounded">
              <div className="text-4xl mb-2">👀</div>
              <p className="text-sm font-medium">Your User</p>
              <p className="text-xs text-[var(--muted)]">The audience</p>
            </div>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* Section 2: Pipeline */}
      <section id="pipeline" className="mb-16 scroll-mt-32">
        <h2 className="text-2xl font-semibold mb-4">The Voice AI Pipeline</h2>
        <p className="text-[var(--muted)] mb-6">
          Speech flows through STT, LLM, TTS, and finally avatar rendering.
          Each component adds latency - the goal is to minimize total round-trip time.
        </p>

        <AnimatedDiagram
          steps={content.pipeline.steps}
          connections={content.pipeline.connections}
          color={color}
          autoPlay={true}
          intervalMs={2500}
        />

        {/* Interactive Demo */}
        <div className="mt-8">
          <LatencyDemo />
        </div>

        {/* ICE Connection Demo */}
        <div className="mt-8">
          <ICEConnectionDemo />
        </div>

        {/* VAD Demo */}
        <div className="mt-8">
          <VADDemo />
        </div>

        {/* SFU Comparison Demo */}
        <div className="mt-8">
          <SFUComparisonDemo />
        </div>

        {/* Provider Comparison Demo */}
        <div className="mt-8">
          <ProviderComparisonDemo />
        </div>

        {/* Jitter Buffer Demo */}
        <div className="mt-8">
          <JitterBufferDemo />
        </div>

        {/* Bitrate Adaptation Demo */}
        <div className="mt-8">
          <BitrateAdaptationDemo />
        </div>

        {/* Latency budget */}
        <div className="card p-5 mt-6">
          <p className="font-medium mb-4">Latency Budget (Target: ~500ms)</p>
          <div className="grid md:grid-cols-4 gap-4 text-sm">
            <div className="p-3 bg-[var(--card-bg-alt)] rounded text-center">
              <div className="font-semibold mb-1">STT</div>
              <div className="text-[var(--muted)]">90-200ms</div>
            </div>
            <div className="p-3 bg-[var(--card-bg-alt)] rounded text-center">
              <div className="font-semibold mb-1">LLM</div>
              <div className="text-[var(--muted)]">75-300ms</div>
            </div>
            <div className="p-3 bg-[var(--card-bg-alt)] rounded text-center">
              <div className="font-semibold mb-1">TTS</div>
              <div className="text-[var(--muted)]">100-200ms</div>
            </div>
            <div className="p-3 bg-[var(--card-bg-alt)] rounded text-center">
              <div className="font-semibold mb-1">Network</div>
              <div className="text-[var(--muted)]">50-100ms</div>
            </div>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* Section 3: Key Concepts */}
      <section id="concepts" className="mb-16 scroll-mt-32">
        <h2 className="text-2xl font-semibold mb-4">Key Concepts</h2>
        <p className="text-[var(--muted)] mb-6">
          Understand these five pillars of streaming avatar infrastructure.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {content.concepts.map((concept, index) => (
            <ConceptCard
              key={concept.id}
              id={concept.id}
              title={concept.title}
              summary={concept.summary}
              visualMetaphor={concept.visualMetaphor}
              demoId={concept.demoId}
              drillDown={concept.drillDown}
              trackId="streaming-avatars"
              color={color}
              index={index}
            />
          ))}
        </div>
      </section>

      <div className="divider" />

      {/* Section 4: Implementation */}
      <section id="implementation" className="mb-16 scroll-mt-32">
        <h2 className="text-2xl font-semibold mb-4">Build It Yourself</h2>
        <p className="text-[var(--muted)] mb-6">
          Deploy a streaming avatar with LiveKit and Hedra in under an hour.
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
                target="_blank"
                rel="noopener noreferrer"
                className="card p-4 flex items-start gap-3 hover:border-[var(--border-strong)]"
              >
                <span className="text-[var(--accent)]">
                  {resource.type === 'github' ? '📦' : '📖'}
                </span>
                <div>
                  <p className="font-medium text-sm">{resource.title}</p>
                  <p className="text-xs text-[var(--muted)]">{resource.type}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* Section 5: Trade-offs */}
      <section id="tradeoffs" className="mb-16 scroll-mt-32">
        <h2 className="text-2xl font-semibold mb-4">When to Use Streaming Avatars</h2>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="card-alt p-5">
            <p className="font-medium mb-3 text-green-600">✓ Use When</p>
            <ul className="space-y-2 text-sm text-[var(--muted)]">
              {content.tradeoffs.when.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-green-500">+</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="card-alt p-5">
            <p className="font-medium mb-3 text-red-600">✗ Avoid When</p>
            <ul className="space-y-2 text-sm text-[var(--muted)]">
              {content.tradeoffs.whenNot.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-red-500">−</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="highlight-box">
          <p className="font-medium mb-2">Best Use Case</p>
          <p className="text-[var(--muted)]">{content.tradeoffs.bestFor}</p>
        </div>
      </section>

      {/* Provider Comparison */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-4">Avatar Providers</h2>
        <div className="overflow-x-auto">
          <table className="research-table">
            <thead>
              <tr>
                <th>Provider</th>
                <th>Latency</th>
                <th>Input</th>
                <th>Best For</th>
              </tr>
            </thead>
            <tbody>
              {content.avatarApplications.providers.map((provider) => (
                <tr key={provider.name}>
                  <td className="font-medium">{provider.name}</td>
                  <td>{provider.latency}</td>
                  <td className="text-[var(--muted)]">{provider.input}</td>
                  <td className="text-[var(--muted)]">{provider.bestFor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Misconceptions */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-4">Common Misconceptions</h2>
        <div className="space-y-4">
          {content.misconceptions.map((item, i) => (
            <div key={i} className="card p-4">
              <p className="text-sm">
                <span className="text-red-500 line-through">{item.wrong}</span>
              </p>
              <p className="text-sm mt-2">
                <span className="text-green-600 font-medium">Actually:</span>{' '}
                <span className="text-[var(--muted)]">{item.correct}</span>
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Try it */}
      <section className="mb-16">
        <div className="card p-6">
          <h3 className="font-semibold mb-2">Try the Live Demo</h3>
          <p className="text-sm text-[var(--muted)] mb-4">
            Experience a streaming avatar in action. The demo uses LiveKit and Hedra
            to create a real-time conversational avatar.
          </p>
          <Link
            href="/livekit"
            className="badge hover:border-[var(--border-strong)]"
          >
            Launch LiveKit Demo →
          </Link>
        </div>
      </section>

      {/* Next Steps */}
      <section>
        <div className="card p-6 text-center">
          <h3 className="font-semibold mb-2">Ready to Go Deeper?</h3>
          <p className="text-sm text-[var(--muted)] mb-4">
            Explore WebRTC internals or compare streaming with other approaches.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/learn/streaming-avatars/concepts/ice-protocol"
              className="badge hover:border-[var(--border-strong)]"
            >
              Dive into ICE Protocol →
            </Link>
            <Link
              href="/learn"
              className="badge hover:border-[var(--border-strong)]"
            >
              Compare All Methods
            </Link>
          </div>
        </div>
      </section>

      <CrossTrackNav currentTrack="streaming-avatars" />
    </div>
  );
}
