import Link from 'next/link';

export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen relative">
      <div className="paper-texture fixed inset-0" />

      <a href="#learn-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-3 focus:bg-[var(--accent)] focus:text-white focus:rounded">
        Skip to content
      </a>

      {/* Header */}
      <header className="border-b border-[var(--border)] bg-[var(--surface-0)] sticky top-0 z-50">
        <div className="mx-auto max-w-5xl px-6">
          <nav className="flex items-center justify-between h-14">
            <div className="flex items-center gap-6">
              <Link href="/" className="font-semibold text-sm hover:text-[var(--accent)]">
                Real-Time Avatars
              </Link>
              <span className="text-[var(--text-muted)]">/</span>
              <Link href="/learn" className="font-medium text-sm hover:text-[var(--accent)]">
                Learn
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/learn/end-to-end" className="nav-link text-sm font-medium">
                End-to-End
              </Link>
              <span className="text-[var(--border)]">|</span>
              <Link href="/learn/gaussian-splatting" className="nav-link text-sm">
                <span className="inline-block w-2 h-2 rounded-full bg-[var(--color-gaussian)] mr-2" />
                Gaussian
              </Link>
              <Link href="/learn/metahuman" className="nav-link text-sm">
                <span className="inline-block w-2 h-2 rounded-full bg-[var(--color-metahuman)] mr-2" />
                MetaHuman
              </Link>
              <Link href="/learn/generative-video" className="nav-link text-sm">
                <span className="inline-block w-2 h-2 rounded-full bg-[var(--color-generative)] mr-2" />
                Generative
              </Link>
              <Link href="/learn/streaming-avatars" className="nav-link text-sm">
                <span className="inline-block w-2 h-2 rounded-full bg-[var(--color-streaming)] mr-2" />
                Streaming
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <main id="learn-content" className="mx-auto max-w-5xl px-6 py-12 relative">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] bg-[var(--surface-0)]">
        <div className="mx-auto max-w-5xl px-6 py-6">
          <div className="flex items-center justify-between text-sm text-[var(--text-muted)]">
            <p>Learn Real-Time Avatar Technologies</p>
            <Link href="/" className="hover:text-[var(--accent)]">
              Back to Research Survey
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
