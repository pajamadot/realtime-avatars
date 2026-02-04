'use client';

import dynamic from 'next/dynamic';

const GaussianSplatViewer = dynamic(
  () => import('./GaussianSplatViewer'),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] bg-[var(--surface-0)] rounded-lg flex flex-col items-center justify-center">
        <div className="relative w-16 h-16 mb-3">
          <div className="absolute inset-0 rounded-full bg-[var(--accent)]/20 animate-pulse" />
          <div className="absolute inset-2 rounded-full bg-[var(--accent)]/30 animate-pulse" style={{ animationDelay: '0.2s' }} />
          <div className="absolute inset-4 rounded-full bg-[var(--accent)]/40 animate-pulse" style={{ animationDelay: '0.4s' }} />
        </div>
        <p className="text-sm text-[var(--text-muted)]">Preparing 3D viewer...</p>
      </div>
    )
  }
);

interface GaussianSplatDemoProps {
  className?: string;
  source?: string;
  lazyLoad?: boolean;
}

export default function GaussianSplatDemo({
  className = '',
  source,
  lazyLoad = true
}: GaussianSplatDemoProps) {
  return (
    <GaussianSplatViewer
      className={className}
      source={source}
      lazyLoad={lazyLoad}
    />
  );
}
