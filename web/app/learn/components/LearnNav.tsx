'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tracks = [
  { href: '/learn/end-to-end', label: 'End-to-End', color: undefined, separator: true },
  { href: '/learn/gaussian-splatting', label: 'Gaussian', color: 'var(--color-gaussian)' },
  { href: '/learn/metahuman', label: 'MetaHuman', color: 'var(--color-metahuman)' },
  { href: '/learn/generative-video', label: 'Generative', color: 'var(--color-generative)' },
  { href: '/learn/streaming-avatars', label: 'Streaming', color: 'var(--color-streaming)' },
];

export default function LearnNav() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-4 overflow-x-auto scrollbar-none -mr-6 pr-6">
      {tracks.map((track, i) => {
        const active = pathname === track.href || pathname.startsWith(track.href + '/');
        return (
          <span key={track.href} className="contents">
            {track.separator && i > 0 && (
              <span className="text-[var(--border)]">|</span>
            )}
            <Link
              href={track.href}
              className={`nav-link text-sm whitespace-nowrap ${track.separator ? 'font-medium' : ''} ${active ? 'text-[var(--accent)] font-semibold' : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              {track.color && (
                <span
                  className="inline-block w-2 h-2 rounded-full mr-1.5"
                  style={{ backgroundColor: track.color }}
                />
              )}
              {track.label}
            </Link>
            {track.separator && (
              <span className="text-[var(--border)]">|</span>
            )}
          </span>
        );
      })}
    </div>
  );
}
