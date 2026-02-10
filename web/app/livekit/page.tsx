import type { Metadata } from 'next';
import Link from 'next/link';
import LiveKitStreamingAvatarDemo from '../components/LiveKitStreamingAvatarDemo';

export const metadata: Metadata = {
  title: 'LiveKit + Hedra Demo — Real-Time Avatars',
  description:
    'Interactive demo of a diffusion-based streaming avatar using LiveKit and Hedra. Experience real-time voice conversation with a generative video avatar.',
  keywords: ['LiveKit', 'Hedra', 'streaming avatar', 'diffusion', 'WebRTC', 'voice AI', 'real-time avatar'],
};

export default function LiveKitPage() {
  return (
    <div className="min-h-screen relative">
      <div className="paper-texture fixed inset-0" />

      <a href="#livekit-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-3 focus:bg-[var(--accent)] focus:text-white focus:rounded">
        Skip to content
      </a>

      <header className="border-b border-[var(--border)] bg-[var(--surface-0)]">
        <div className="mx-auto max-w-4xl px-6">
          <nav className="flex items-center justify-between h-14" aria-label="LiveKit demo navigation">
            <Link href="/" className="font-semibold text-sm hover:underline">
              Real-Time Avatars
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/#section-2.2" className="nav-link">
                Back to Video Generation
              </Link>
              <Link href="/#living-feed" className="nav-link">
                Research Feed
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <main id="livekit-content" className="mx-auto max-w-4xl px-6 py-12 relative">
        <nav aria-label="Breadcrumb" className="text-xs text-[var(--text-muted)] mb-6">
          <Link href="/" className="hover:underline">Home</Link>
          <span className="mx-1.5">/</span>
          <Link href="/#demos" className="hover:underline">Demos</Link>
          <span className="mx-1.5">/</span>
          <span>LiveKit + Hedra</span>
        </nav>

        <article className="mb-8">
          <p className="section-label mb-4">Interactive Demo</p>
          <h1 className="text-3xl md:text-4xl font-semibold mb-4 leading-tight">
            LiveKit Streaming Avatar
          </h1>
          <p className="text-lg text-[var(--text-muted)] max-w-2xl">
            A WebRTC streaming demo for real-time avatars. This page connects to a LiveKit room
            and renders the avatar video stream published by an avatar worker (e.g., Hedra).
          </p>
        </article>

        <LiveKitStreamingAvatarDemo />

        <div className="card p-5 mt-6">
          <p className="font-medium mb-2">Required environment</p>
          <div className="text-sm text-[var(--text-muted)] space-y-2">
            <p>
              Set these on the server (Vercel / local env):
            </p>
            <div className="code">
              LIVEKIT_URL=...{'\n'}
              LIVEKIT_API_KEY=...{'\n'}
              LIVEKIT_API_SECRET=...{'\n'}
              FAL_KEY=... (optional; only needed for generating a custom face image)
            </div>
            <p>
              Then run an agent that publishes an avatar stream into the same room (or dispatch
              one via <code>agent name</code> above).
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
