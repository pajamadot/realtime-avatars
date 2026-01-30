import Link from 'next/link';
import LiveKitStreamingAvatarDemo from '../components/LiveKitStreamingAvatarDemo';

export default function LiveKitPage() {
  return (
    <div className="min-h-screen relative">
      <div className="paper-texture fixed inset-0" />

      <header className="border-b border-[var(--border)] bg-[var(--card-bg)]">
        <div className="mx-auto max-w-4xl px-6">
          <nav className="flex items-center justify-between h-14">
            <Link href="/" className="font-semibold text-sm hover:underline">
              Real-Time Avatars
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/#section-2.4" className="nav-link">
                Back to Streaming Section
              </Link>
              <Link href="/#living-feed" className="nav-link">
                Research Feed
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12 relative">
        <article className="mb-8">
          <p className="section-label mb-4">Interactive Demo</p>
          <h1 className="text-3xl md:text-4xl font-semibold mb-4 leading-tight">
            LiveKit Streaming Avatar
          </h1>
          <p className="text-lg text-[var(--muted)] max-w-2xl">
            A WebRTC streaming demo for real-time avatars. This page connects to a LiveKit room
            and renders the avatar video stream published by an avatar worker (e.g., Hedra).
          </p>
        </article>

        <LiveKitStreamingAvatarDemo />

        <div className="card p-5 mt-6">
          <p className="font-medium mb-2">Required environment</p>
          <div className="text-sm text-[var(--muted)] space-y-2">
            <p>
              Set these on the server (Vercel / local env):
            </p>
            <div className="code">
              LIVEKIT_URL=...{'\n'}
              LIVEKIT_API_KEY=...{'\n'}
              LIVEKIT_API_SECRET=...
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
