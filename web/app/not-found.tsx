import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <div className="paper-texture fixed inset-0" />
      <div className="text-center relative">
        <p className="text-6xl font-semibold text-[var(--text-muted)] mb-4">404</p>
        <h1 className="text-2xl font-semibold mb-2">Page Not Found</h1>
        <p className="text-[var(--text-muted)] mb-6">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/" className="badge hover:border-[var(--border-strong)] px-4 py-2">
            Research Survey
          </Link>
          <Link href="/learn" className="badge hover:border-[var(--border-strong)] px-4 py-2">
            Learn Hub
          </Link>
        </div>
      </div>
    </div>
  );
}
