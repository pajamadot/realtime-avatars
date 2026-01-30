'use client';

import { useMemo, useState } from 'react';
import researchFeed from '../data/research-feed.json';

type FeedItem = {
  title: string;
  link: string;
  published?: string;
  authors?: string;
  summary?: string;
  tags?: string[];
};

type FeedMethod = {
  label: string;
  query?: string;
  items: FeedItem[];
};

type ResearchFeed = {
  updatedAt: string;
  source: string;
  methods: Record<string, FeedMethod>;
};

function formatISODate(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

export default function LivingResearchFeed({ className = '' }: { className?: string }) {
  const feed = researchFeed as unknown as ResearchFeed;
  const updated = formatISODate(feed.updatedAt);
  const methods = Object.entries(feed.methods ?? {});
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return methods;

    return methods.map(([key, method]) => {
      const items = (method.items ?? []).filter((it) => {
        const text = `${it.title ?? ''}\n${it.authors ?? ''}\n${it.summary ?? ''}`.toLowerCase();
        if (text.includes(q)) return true;
        return (it.tags ?? []).some((t) => String(t).toLowerCase().includes(q));
      });
      return [key, { ...method, items }] as const;
    });
  }, [methods, query]);

  return (
    <div className={className}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
        <p className="text-sm text-[var(--muted)]">
          Auto-updating research feed (source: {feed.source}).{updated ? ` Last refresh: ${updated}.` : ''}
        </p>
        <code>npm run research:update</code>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by title, author, summary, or tag..."
            className="w-full bg-[var(--card-bg)] border border-[var(--border)] rounded px-3 py-2 text-sm outline-none focus:border-[var(--border-strong)]"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="badge hover:border-[var(--border-strong)]"
            >
              Clear
            </button>
          ) : null}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map(([key, method]) => (
          <div key={key} className="card p-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <p className="font-medium">{method.label}</p>
              <span className="badge">arXiv</span>
            </div>
            {method.query ? (
              <p className="text-xs text-[var(--muted)] mb-3">
                Query: <code>{method.query}</code>
              </p>
            ) : null}

            {method.items?.length ? (
              <div className="space-y-3">
                {method.items.slice(0, 6).map((item) => (
                  <a
                    key={item.link}
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 bg-[var(--card-bg-alt)] rounded border border-[var(--border)] hover:border-[var(--border-strong)] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-medium text-sm leading-snug">{item.title}</p>
                      <span className="text-xs text-[var(--muted)] whitespace-nowrap">
                        {formatISODate(item.published)}
                      </span>
                    </div>
                    {item.authors ? (
                      <p className="text-xs text-[var(--muted)] mt-1">{item.authors}</p>
                    ) : null}
                    {item.summary ? (
                      <p className="text-xs text-[var(--muted)] mt-2 line-clamp-3">{item.summary}</p>
                    ) : null}
                    {item.tags?.length ? (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {item.tags.slice(0, 6).map((t) => (
                          <span key={t} className="badge text-[0.6875rem] py-0.5 px-2">
                            {t}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--muted)]">
                No items yet. Run <code>npm run research:update</code> to populate this section.
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
