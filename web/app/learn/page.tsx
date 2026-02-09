import Link from 'next/link';
import { BookOpen, Search, Gamepad2 } from 'lucide-react';

const tracks = [
  {
    id: 'gaussian-splatting',
    title: 'Gaussian Splatting',
    subtitle: '3D Gaussian primitives for photorealistic rendering',
    color: 'var(--color-gaussian)',
    description: 'Learn how millions of fuzzy 3D blobs can represent photorealistic scenes and avatars, rendering at 60+ FPS on consumer hardware.',
    concepts: ['3D Gaussians', 'Covariance Matrix', 'Spherical Harmonics', 'Differentiable Rendering'],
    difficulty: 'Intermediate',
    time: '45 min',
  },
  {
    id: 'metahuman',
    title: 'MetaHuman Pipeline',
    subtitle: 'Game-engine rigged avatars with precise control',
    color: 'var(--color-metahuman)',
    description: 'Understand how game engines use skeletal rigs, blendshapes, and real-time face tracking to animate detailed 3D characters.',
    concepts: ['Blendshapes', 'Skeletal Rigs', 'Live Link', 'Audio2Face'],
    difficulty: 'Beginner',
    time: '30 min',
  },
  {
    id: 'generative-video',
    title: 'Generative Video Models',
    subtitle: 'Diffusion-based photorealistic synthesis',
    color: 'var(--color-generative)',
    description: 'Explore how diffusion models denoise random noise into photorealistic talking head videos, achieving real-time through distillation.',
    concepts: ['Diffusion Process', 'Latent Space', 'Audio-to-Motion', 'Distillation'],
    difficulty: 'Advanced',
    time: '60 min',
  },
  {
    id: 'streaming-avatars',
    title: 'Streaming Avatars',
    subtitle: 'WebRTC infrastructure for production deployment',
    color: 'var(--color-streaming)',
    description: 'Learn how WebRTC, LiveKit, and avatar providers work together to stream interactive avatars to any device.',
    concepts: ['WebRTC', 'SFU Architecture', 'Voice AI Pipeline', 'Provider Integration'],
    difficulty: 'Beginner',
    time: '25 min',
  },
];

export default function LearnPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="mb-16">
        <p className="section-label mb-4">Interactive Learning Path</p>
        <h1 className="text-3xl md:text-4xl font-semibold mb-4 leading-tight">
          The Four Paths to<br />
          Real-Time Avatars
        </h1>
        <p className="text-lg text-[var(--text-muted)] max-w-2xl mb-8">
          From fundamentals to implementation. Each track builds from core concepts
          to working code, with interactive demos along the way. Choose your path
          based on your goals.
        </p>

        {/* Quick comparison */}
        <div className="highlight-box">
          <p className="font-medium mb-4">Which path is right for you?</p>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="p-4 bg-[var(--surface-0)] rounded border border-[var(--border)]">
              <p className="font-medium mb-2">Want photorealism of a specific person?</p>
              <p className="text-[var(--text-muted)]">
                Start with <span className="text-[var(--color-gaussian)]">Gaussian Splatting</span> —
                capture once, render in real-time forever.
              </p>
            </div>
            <div className="p-4 bg-[var(--surface-0)] rounded border border-[var(--border)]">
              <p className="font-medium mb-2">Need precise animation control?</p>
              <p className="text-[var(--text-muted)]">
                Start with <span className="text-[var(--color-metahuman)]">MetaHuman</span> —
                industry-standard rigs with live face tracking.
              </p>
            </div>
            <div className="p-4 bg-[var(--surface-0)] rounded border border-[var(--border)]">
              <p className="font-medium mb-2">Want any face from one photo?</p>
              <p className="text-[var(--text-muted)]">
                Start with <span className="text-[var(--color-generative)]">Generative Video</span> —
                one-shot synthesis from a single image.
              </p>
            </div>
            <div className="p-4 bg-[var(--surface-0)] rounded border border-[var(--border)]">
              <p className="font-medium mb-2">Building a production app fast?</p>
              <p className="text-[var(--text-muted)]">
                Start with <span className="text-[var(--color-streaming)]">Streaming Avatars</span> —
                use hosted providers via WebRTC.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* End-to-End Guide - Featured */}
      <section className="mb-16">
        <Link
          href="/learn/end-to-end"
          className="block card p-6 bg-gradient-to-r from-[var(--color-gaussian)]/5 via-[var(--color-generative)]/5 to-[var(--color-streaming)]/5 hover:from-[var(--color-gaussian)]/10 hover:via-[var(--color-generative)]/10 hover:to-[var(--color-streaming)]/10 transition-all group"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-[var(--color-gaussian)] via-[var(--color-generative)] to-[var(--color-streaming)]" />
            <span className="badge bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20">
              Start Here
            </span>
            <span className="text-xs text-[var(--text-muted)]">30 min</span>
          </div>
          <h2 className="text-2xl font-semibold mb-2 group-hover:text-[var(--accent)] transition-colors">
            End-to-End Real-Time Avatar
          </h2>
          <p className="text-[var(--text-muted)] mb-4 max-w-2xl">
            Build a complete conversational avatar system from scratch. Learn how audio flows through
            STT → LLM → TTS → Avatar rendering, with working code for each of the four approaches.
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="badge text-xs">Voice AI Pipeline</span>
            <span className="badge text-xs">Latency Optimization</span>
            <span className="badge text-xs">LiveKit Integration</span>
            <span className="badge text-xs">Production Deployment</span>
          </div>
          <div className="text-sm font-medium text-[var(--accent)] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
            Build the complete system →
          </div>
        </Link>
      </section>

      {/* Tracks Grid */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-6">Deep Dive: Choose Your Track</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {tracks.map((track) => (
            <Link
              key={track.id}
              href={`/learn/${track.id}`}
              className="card p-6 block group hover:border-[var(--border-strong)] transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: track.color }}
                />
                <span className="badge">{track.difficulty}</span>
                <span className="text-xs text-[var(--text-muted)]">{track.time}</span>
              </div>

              <h3 className="text-xl font-semibold mb-1 group-hover:text-[var(--accent)] transition-colors">
                {track.title}
              </h3>
              <p className="text-sm text-[var(--text-muted)] mb-4">{track.subtitle}</p>

              <p className="text-sm text-[var(--text-muted)] mb-4">{track.description}</p>

              <div className="flex flex-wrap gap-2">
                {track.concepts.map((concept) => (
                  <span key={concept} className="badge text-xs">
                    {concept}
                  </span>
                ))}
              </div>

              <div className="mt-4 text-sm font-medium text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity">
                Start learning →
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Learning Philosophy */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-6">How These Guides Work</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="card-alt p-5">
            <div className="w-10 h-10 rounded-lg bg-[var(--accent-subtle)] flex items-center justify-center mb-3">
              <BookOpen size={20} className="text-[var(--accent)]" />
            </div>
            <h3 className="font-semibold mb-2">Level 3: Practical Start</h3>
            <p className="text-sm text-[var(--text-muted)]">
              Each track starts with "what does this do?" — practical explanations
              you can understand in 60 seconds. No prerequisites beyond basic programming.
            </p>
          </div>
          <div className="card-alt p-5">
            <div className="w-10 h-10 rounded-lg bg-[var(--accent-subtle)] flex items-center justify-center mb-3">
              <Search size={20} className="text-[var(--accent)]" />
            </div>
            <h3 className="font-semibold mb-2">Level 2: Drill Down</h3>
            <p className="text-sm text-[var(--text-muted)]">
              Curious about the math? Click any concept to drill deeper.
              Each explanation links to its prerequisites, so you can go as deep as needed.
            </p>
          </div>
          <div className="card-alt p-5">
            <div className="w-10 h-10 rounded-lg bg-[var(--accent-subtle)] flex items-center justify-center mb-3">
              <Gamepad2 size={20} className="text-[var(--accent)]" />
            </div>
            <h3 className="font-semibold mb-2">Interactive Demos</h3>
            <p className="text-sm text-[var(--text-muted)]">
              Every concept has tweakable parameters. Manipulate a Gaussian,
              reorder alpha layers, watch diffusion denoise — learning by doing.
            </p>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-6">Quick Comparison</h2>
        <div className="overflow-x-auto">
          <table className="research-table">
            <thead>
              <tr>
                <th>Approach</th>
                <th>Latency</th>
                <th>Quality</th>
                <th>Setup Cost</th>
                <th>Best For</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-medium" style={{ color: 'var(--color-gaussian)' }}>Gaussian Splatting</td>
                <td>~16ms</td>
                <td>Photorealistic</td>
                <td>High (capture)</td>
                <td>Static scenes, known identities</td>
              </tr>
              <tr>
                <td className="font-medium" style={{ color: 'var(--color-metahuman)' }}>MetaHuman</td>
                <td>~16ms</td>
                <td>High-quality 3D</td>
                <td>Medium (setup)</td>
                <td>Games, precise animation control</td>
              </tr>
              <tr>
                <td className="font-medium" style={{ color: 'var(--color-generative)' }}>Generative Video</td>
                <td>100-500ms</td>
                <td>Photorealistic</td>
                <td>Low (1 photo)</td>
                <td>Any face, async content</td>
              </tr>
              <tr>
                <td className="font-medium" style={{ color: 'var(--color-streaming)' }}>Streaming</td>
                <td>300-800ms</td>
                <td>Provider-dependent</td>
                <td>Low (API key)</td>
                <td>Production apps, any device</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Try the Demos */}
      <section className="mb-16">
        <div className="card p-6">
          <h3 className="font-semibold mb-2 text-center">See It In Action</h3>
          <p className="text-sm text-[var(--text-muted)] mb-4 text-center">
            Try real-time avatar demos spanning different approaches.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-[var(--surface-2)] rounded-lg text-center">
              <p className="font-medium text-sm mb-1">LiveKit + Hedra</p>
              <p className="text-xs text-[var(--text-muted)] mb-3">Diffusion-based streaming avatar with voice</p>
              <Link
                href="/livekit"
                className="badge hover:border-[var(--border-strong)] inline-flex"
              >
                Launch Demo →
              </Link>
            </div>
            <div className="p-4 bg-[var(--surface-2)] rounded-lg text-center">
              <p className="font-medium text-sm mb-1">Rapport MetaHuman</p>
              <p className="text-xs text-[var(--text-muted)] mb-3">Unreal Engine pixel-streamed avatar</p>
              <Link
                href="/rapport"
                className="badge hover:border-[var(--border-strong)] inline-flex"
              >
                Launch Demo →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Convergence Note */}
      <section>
        <div className="research-note">
          <p className="font-medium mb-2">These approaches are converging</p>
          <p className="text-sm text-[var(--text-muted)]">
            The future isn't picking one approach — it's combining them. MetaHumans enhanced
            by generative models. Gaussian avatars driven by parametric rigs. Understanding
            all four paths helps you build hybrid systems that take the best of each.
          </p>
        </div>
      </section>
    </div>
  );
}
