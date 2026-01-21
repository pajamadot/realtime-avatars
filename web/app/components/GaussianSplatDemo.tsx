'use client';

import dynamic from 'next/dynamic';

const GaussianSplatViewer = dynamic(
  () => import('./GaussianSplatViewer'),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] bg-[var(--card-bg)] rounded-lg flex items-center justify-center text-[var(--muted)]">
        Loading 3D viewer...
      </div>
    )
  }
);

interface GaussianSplatDemoProps {
  className?: string;
}

export default function GaussianSplatDemo({ className = '' }: GaussianSplatDemoProps) {
  return <GaussianSplatViewer className={className} />;
}
