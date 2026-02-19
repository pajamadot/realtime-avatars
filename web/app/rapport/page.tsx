import type { Metadata } from 'next';
import Link from 'next/link';
import { ExternalLink, Cpu, Video, Mic } from 'lucide-react';
import MetaHumanEditorControlPanel from '../components/MetaHumanEditorControlPanel';
import MetaHumanRealtimeTalkPanel from '../components/MetaHumanRealtimeTalkPanel';

export const metadata: Metadata = {
  title: 'Rapport MetaHuman Demo — Real-Time Avatars',
  description:
    'Interactive demo of a cloud-rendered MetaHuman avatar powered by Unreal Engine 5 pixel streaming. Experience photorealistic real-time conversation with WebRTC delivery.',
  keywords: ['MetaHuman', 'Unreal Engine 5', 'pixel streaming', 'real-time avatar', 'Rapport', 'WebRTC', 'conversational AI'],
};

export default function RapportPage() {
  return (
    <div className="min-h-screen relative">
      <div className="paper-texture fixed inset-0" />

      <a href="#rapport-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-3 focus:bg-[var(--accent)] focus:text-white focus:rounded">
        Skip to content
      </a>

      <header className="border-b border-[var(--border)] bg-[var(--surface-0)]">
        <div className="mx-auto max-w-4xl px-6">
          <nav className="flex items-center justify-between h-14" aria-label="Rapport demo navigation">
            <Link href="/" className="font-semibold text-sm hover:underline">
              Real-Time Avatars
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/learn/metahuman" className="nav-link">
                MetaHuman Track
              </Link>
              <Link href="/#living-feed" className="nav-link">
                Research Feed
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <main id="rapport-content" className="mx-auto max-w-4xl px-6 py-12 relative">
        <nav aria-label="Breadcrumb" className="text-xs text-[var(--text-muted)] mb-6">
          <Link href="/" className="hover:underline">Home</Link>
          <span className="mx-1.5">/</span>
          <Link href="/#demos" className="hover:underline">Demos</Link>
          <span className="mx-1.5">/</span>
          <span>Rapport MetaHuman</span>
        </nav>

        <article className="mb-8">
          <p className="section-label mb-4">Interactive Demo</p>
          <h1 className="text-3xl md:text-4xl font-semibold mb-4 leading-tight">
            Rapport MetaHuman Avatar
          </h1>
          <p className="text-lg text-[var(--text-muted)] max-w-2xl">
            A real-time MetaHuman avatar powered by Unreal Engine and pixel streaming.
            This demo showcases Rapport&apos;s cloud-rendered photorealistic avatars with
            natural conversation capabilities.
          </p>
        </article>

        {/* Technology badges */}
        <div className="flex flex-wrap gap-3 mb-8">
          <span className="badge flex items-center gap-2">
            <Cpu size={14} />
            Unreal Engine 5
          </span>
          <span className="badge flex items-center gap-2">
            <Video size={14} />
            Pixel Streaming
          </span>
          <span className="badge flex items-center gap-2">
            <Mic size={14} />
            Voice Interaction
          </span>
        </div>

        <MetaHumanEditorControlPanel />
        <MetaHumanRealtimeTalkPanel />

        {/* Rapport iframe embed */}
        <div className="flex justify-center">
          <div className="w-full max-w-[600px]">
            <div
              className="relative w-full rounded-xl overflow-hidden shadow-lg"
              style={{ aspectRatio: '1 / 1' }}
            >
              <iframe
                src="https://accounts.rapport.cloud/avatar-iframe?projectId=a75078e8-6f32-405a-913f-c85dc430125d&projectToken=8a4038a7-c12b-4479-b9a5-71694f174cb2&aiUserId=25b90290-ee16-4063-8917-e1055040bcae&buttonLabel=Start%20Demo"
                title="Rapport MetaHuman Avatar"
                allow="microphone; camera; autoplay; fullscreen"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 w-full h-full"
                style={{ border: 0, background: '#87CFFF' }}
              />
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-3 text-center">
              Click <strong>Start Demo</strong> and allow microphone access to interact
            </p>
          </div>
        </div>

        {/* How it works */}
        <div className="card p-5 mt-6">
          <p className="font-medium mb-3">How Pixel Streaming Works</p>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-[var(--text-muted)]">
            <div className="p-3 bg-[var(--surface-2)] rounded-lg">
              <p className="font-medium text-[var(--foreground)] mb-1">1. Cloud Rendering</p>
              <p>Unreal Engine renders the MetaHuman on powerful cloud GPUs at high fidelity.</p>
            </div>
            <div className="p-3 bg-[var(--surface-2)] rounded-lg">
              <p className="font-medium text-[var(--foreground)] mb-1">2. Video Encoding</p>
              <p>Frames are encoded to H.264/VP9 and streamed via WebRTC to your browser.</p>
            </div>
            <div className="p-3 bg-[var(--surface-2)] rounded-lg">
              <p className="font-medium text-[var(--foreground)] mb-1">3. Low Latency</p>
              <p>Audio input is sent back for real-time lip sync and natural conversation.</p>
            </div>
          </div>
        </div>

        {/* Comparison note */}
        <div className="highlight-box mt-6">
          <p className="font-medium mb-2">MetaHuman vs Diffusion-Based Avatars</p>
          <p className="text-sm text-[var(--text-muted)]">
            Unlike diffusion-based avatars (Hedra, Tavus), MetaHumans use traditional graphics
            pipelines with skeletal rigs and blendshapes. This provides <strong>consistent 60 FPS</strong>,
            <strong> full artistic control</strong>, and <strong>deterministic output</strong> - but requires
            more compute and specialized infrastructure for streaming.
          </p>
        </div>

        {/* Links */}
        <div className="grid md:grid-cols-4 gap-4 mt-6">
          <a
            href="https://www.rapport.cloud/"
            target="_blank"
            rel="noopener noreferrer"
            className="card p-4 flex items-center gap-3 hover:border-[var(--border-strong)]"
          >
            <ExternalLink size={18} className="text-[var(--accent)]" />
            <div>
              <p className="font-medium text-sm">Rapport Cloud</p>
              <p className="text-xs text-[var(--text-muted)]">Official website</p>
            </div>
          </a>
          <Link
            href="/livekit"
            className="card p-4 flex items-center gap-3 hover:border-[var(--border-strong)]"
          >
            <Video size={18} className="text-[var(--accent)]" />
            <div>
              <p className="font-medium text-sm">LiveKit Demo</p>
              <p className="text-xs text-[var(--text-muted)]">Hedra streaming avatar</p>
            </div>
          </Link>
          <Link
            href="/learn/metahuman"
            className="card p-4 flex items-center gap-3 hover:border-[var(--border-strong)]"
          >
            <Cpu size={18} className="text-[var(--accent)]" />
            <div>
              <p className="font-medium text-sm">MetaHuman Track</p>
              <p className="text-xs text-[var(--text-muted)]">Learn how it works</p>
            </div>
          </Link>
          <Link
            href="/learn/metahuman/architecture"
            className="card p-4 flex items-center gap-3 hover:border-[var(--border-strong)]"
          >
            <ExternalLink size={18} className="text-[var(--accent)]" />
            <div>
              <p className="font-medium text-sm">Architecture Docs</p>
              <p className="text-xs text-[var(--text-muted)]">Module and function map</p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
