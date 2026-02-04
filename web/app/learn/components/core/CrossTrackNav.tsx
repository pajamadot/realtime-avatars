'use client';

import Link from 'next/link';

interface Track {
  id: string;
  title: string;
  color: string;
  subtitle: string;
}

const TRACKS: Track[] = [
  { id: 'gaussian-splatting', title: 'Gaussian Splatting', color: 'var(--color-gaussian)', subtitle: 'Neural 3D rendering' },
  { id: 'metahuman', title: 'MetaHuman', color: 'var(--color-metahuman)', subtitle: 'Game engine rigs' },
  { id: 'generative-video', title: 'Generative Video', color: 'var(--color-generative)', subtitle: 'Diffusion synthesis' },
  { id: 'streaming-avatars', title: 'Streaming Avatars', color: 'var(--color-streaming)', subtitle: 'WebRTC infrastructure' },
];

interface CrossTrackNavProps {
  currentTrack: string;
}

export function CrossTrackNav({ currentTrack }: CrossTrackNavProps) {
  const otherTracks = TRACKS.filter(t => t.id !== currentTrack);

  return (
    <section className="mt-16 pt-8 border-t border-[var(--border)]">
      <h3 className="font-semibold mb-4">Explore Other Approaches</h3>
      <div className="grid md:grid-cols-3 gap-4">
        {otherTracks.map((track) => (
          <Link
            key={track.id}
            href={`/learn/${track.id}`}
            className="card p-4 group hover:border-[var(--border-strong)] transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: track.color }}
              />
              <span className="font-medium text-sm group-hover:text-[var(--accent)] transition-colors">
                {track.title}
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)]">{track.subtitle}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default CrossTrackNav;
