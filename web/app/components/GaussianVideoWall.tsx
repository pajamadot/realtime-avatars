'use client';

import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, Play, X } from 'lucide-react';

export type GaussianVideoItem = {
  video_id: string;
  title: string;
  channel?: string;
  published_text?: string;
  url: string;
  embed_url: string;
  thumbnail_url?: string;
  relevance_score?: number;
};

type Props = {
  videos: GaussianVideoItem[];
  maxItems?: number;
  compact?: boolean;
};

export default function GaussianVideoWall({ videos, maxItems, compact = false }: Props) {
  const [activeVideo, setActiveVideo] = useState<GaussianVideoItem | null>(null);

  const visibleVideos = useMemo(() => {
    const safeVideos = Array.isArray(videos) ? videos : [];
    return typeof maxItems === 'number' ? safeVideos.slice(0, maxItems) : safeVideos;
  }, [videos, maxItems]);

  useEffect(() => {
    if (!activeVideo) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveVideo(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeVideo]);

  if (!visibleVideos.length) {
    return (
      <div className="rounded-xl border border-[#3d3a36] bg-[#1d1c1a] p-6 text-center text-sm text-[#948d82]">
        No videos yet. Run the collector skill to refresh this wall.
      </div>
    );
  }

  return (
    <>
      <div className={`grid gap-3 ${compact ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
        {visibleVideos.map((video) => (
          <button
            key={video.video_id}
            type="button"
            onClick={() => setActiveVideo(video)}
            className="group text-left rounded-xl overflow-hidden border border-[#3d3a36] bg-[#1d1c1a] hover:border-[#e08840] transition-colors"
          >
            <div className="relative aspect-video bg-[#151412]">
              {video.thumbnail_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={video.thumbnail_url}
                  alt={video.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#948d82] text-sm">
                  No thumbnail
                </div>
              )}
              <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-black/70 text-white">
                  <Play size={12} />
                  Play
                </span>
              </div>
            </div>
            <div className="p-3">
              <p className="text-sm font-semibold text-[#f5f2ec] line-clamp-2">{video.title}</p>
              <p className="text-xs text-[#bdb8af] mt-1 line-clamp-1">
                {video.channel || 'Unknown channel'}
              </p>
              {video.published_text && (
                <p className="text-[11px] text-[#948d82] mt-0.5">{video.published_text}</p>
              )}
            </div>
          </button>
        ))}
      </div>

      {activeVideo && (
        <div
          className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={activeVideo.title}
          onClick={() => setActiveVideo(null)}
        >
          <div
            className="w-full max-w-6xl rounded-2xl border border-[#3d3a36] bg-[#151412] overflow-hidden"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#2f2c28]">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#f5f2ec] truncate">{activeVideo.title}</p>
                <p className="text-xs text-[#948d82] truncate">
                  {activeVideo.channel || 'Unknown channel'}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <a
                  href={activeVideo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md border border-[#3d3a36] text-[#f5f2ec] hover:bg-[#242220] transition-colors"
                >
                  <ExternalLink size={13} />
                  YouTube
                </a>
                <button
                  type="button"
                  onClick={() => setActiveVideo(null)}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-[#3d3a36] text-[#f5f2ec] hover:bg-[#242220] transition-colors"
                  aria-label="Close video modal"
                >
                  <X size={15} />
                </button>
              </div>
            </div>
            <div className="aspect-video w-full bg-black">
              <iframe
                src={`${activeVideo.embed_url}?autoplay=1&rel=0`}
                title={activeVideo.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
