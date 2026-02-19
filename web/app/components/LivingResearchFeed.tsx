'use client';

import { useMemo, useState } from 'react';
import researchFeed from '../data/research-feed.json';
import { asTime, formatISODate } from '../lib/utils';

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

export default function LivingResearchFeed({ className = '' }: { className?: string }) {
  const feed = researchFeed as unknown as ResearchFeed;
  const updated = formatISODate(feed.updatedAt);
  const methods = Object.entries(feed.methods ?? {});
  const timeWindows = [
    { days: 0, label: 'all' },
    { days: 180, label: '180d' },
    { days: 90, label: '90d' },
    { days: 30, label: '30d' },
    { days: 14, label: '14d' },
  ] as const;

  const [query, setQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');
  const [tagFilter, setTagFilter] = useState('all');
  const [itemsPerMethod, setItemsPerMethod] = useState(6);
  const [daysFilter, setDaysFilter] = useState(90);
  const [clockTs] = useState(() => Date.now());

  const tags = useMemo(() => {
    const bucket = new Set<string>();
    for (const [, method] of methods) {
      for (const item of method.items ?? []) {
        for (const tag of item.tags ?? []) {
          bucket.add(String(tag).toLowerCase());
        }
      }
    }
    return Array.from(bucket).sort((a, b) => a.localeCompare(b));
  }, [methods]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const cutoff = daysFilter ? clockTs - daysFilter * 24 * 60 * 60 * 1000 : 0;

    return methods
      .filter(([key]) => methodFilter === 'all' || key === methodFilter)
      .map(([key, method]) => {
        const items = (method.items ?? [])
          .filter((it) => {
            if (cutoff) {
              const t = asTime(it.published);
              if (!t || t < cutoff) return false;
            }

            const text = `${it.title ?? ''}\n${it.authors ?? ''}\n${it.summary ?? ''}`.toLowerCase();
            if (q && !text.includes(q) && !(it.tags ?? []).some((t) => String(t).toLowerCase().includes(q))) {
              return false;
            }
            if (tagFilter !== 'all') {
              return (it.tags ?? []).some((t) => String(t).toLowerCase() === tagFilter);
            }
            return true;
          })
          .sort((a, b) => {
            if (sortBy === 'title') return String(a.title).localeCompare(String(b.title));
            const ta = asTime(a.published);
            const tb = asTime(b.published);
            return sortBy === 'newest' ? tb - ta : ta - tb;
          });
        return [key, { ...method, items }] as const;
      });
  }, [clockTs, daysFilter, methods, methodFilter, query, sortBy, tagFilter]);

  const totalMatches = filtered.reduce((acc, [, method]) => acc + (method.items?.length ?? 0), 0);
  const feedStats = useMemo(() => {
    const linkMethods = new Map<string, Set<string>>();

    for (const [methodKey, method] of filtered) {
      for (const item of method.items ?? []) {
        if (!item.link) continue;
        let bucket = linkMethods.get(item.link);
        if (!bucket) {
          bucket = new Set<string>();
          linkMethods.set(item.link, bucket);
        }
        bucket.add(methodKey);
      }
    }

    const overlap = Array.from(linkMethods.values()).filter((bucket) => bucket.size > 1).length;
    const methodCounts = filtered.map(([methodKey, method]) => ({
      key: methodKey,
      label: method.label,
      count: method.items?.length ?? 0,
    }));

    return {
      uniqueLinks: linkMethods.size,
      overlap,
      methodCounts,
    };
  }, [filtered]);

  return (
    <div className={className}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
        <p className="text-sm text-[var(--text-muted)]">
          Auto-updating research feed (source: {feed.source}).{updated ? ` Last refresh: ${updated}.` : ''}
        </p>
        <code>npm run research:update</code>
      </div>

      <div className="card p-4 mb-4">
        <label htmlFor="research-feed-filter" className="sr-only">Filter research papers</label>
        <div className="flex items-center gap-3 mb-3">
          <input
            id="research-feed-filter"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by title, author, summary, or tag..."
            aria-label="Filter research papers by title, author, summary, or tag"
            className="w-full bg-[var(--surface-0)] border border-[var(--border)] rounded px-3 py-2 text-sm focus:outline-2 focus:outline-[var(--accent)] focus:outline-offset-1 focus:border-[var(--border-strong)]"
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

        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-xs text-[var(--text-muted)]">Window</span>
          {timeWindows.map((window) => (
            <button
              key={window.label}
              type="button"
              onClick={() => setDaysFilter(window.days)}
              className="badge hover:border-[var(--border-strong)]"
              style={{
                background: daysFilter === window.days ? 'var(--surface-3)' : undefined,
                borderColor: daysFilter === window.days ? 'var(--border-strong)' : undefined,
              }}
            >
              {window.label}
            </button>
          ))}
          <span className="text-xs text-[var(--text-muted)]">
            {feedStats.uniqueLinks} unique links · {feedStats.overlap} cross-method overlaps
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-2 mb-3">
          {feedStats.methodCounts.map((entry) => (
            <div key={entry.key} className="p-2 rounded border border-[var(--border)] bg-[var(--surface-2)]">
              <p className="text-[11px] text-[var(--text-muted)]">{entry.label}</p>
              <p className="font-semibold text-sm">{entry.count} papers</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-4 gap-3 mb-3">
          <label className="text-xs text-[var(--text-muted)]">
            Method
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="input input-sm select mt-1"
            >
              <option value="all">All methods</option>
              {methods.map(([key, method]) => (
                <option key={key} value={key}>{method.label}</option>
              ))}
            </select>
          </label>

          <label className="text-xs text-[var(--text-muted)]">
            Sort
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'title')}
              className="input input-sm select mt-1"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="title">Title A-Z</option>
            </select>
          </label>

          <label className="text-xs text-[var(--text-muted)]">
            Items per method: {itemsPerMethod}
            <input
              type="range"
              min={3}
              max={12}
              step={1}
              value={itemsPerMethod}
              onChange={(e) => setItemsPerMethod(Number(e.target.value))}
              className="slider mt-2"
            />
          </label>

          <div className="text-xs text-[var(--text-muted)] flex items-end">
            <p>{totalMatches} matching papers across {filtered.length} method sections.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setTagFilter('all')}
            className="badge hover:border-[var(--border-strong)]"
            style={{
              background: tagFilter === 'all' ? 'var(--surface-3)' : undefined,
              borderColor: tagFilter === 'all' ? 'var(--border-strong)' : undefined,
            }}
          >
            all tags
          </button>
          {tags.slice(0, 18).map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setTagFilter(tag)}
              className="badge hover:border-[var(--border-strong)]"
              style={{
                background: tagFilter === tag ? 'var(--surface-3)' : undefined,
                borderColor: tagFilter === tag ? 'var(--border-strong)' : undefined,
              }}
            >
              {tag}
            </button>
          ))}
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
              <p className="text-xs text-[var(--text-muted)] mb-3">
                Query: <code>{method.query}</code>
              </p>
            ) : null}

            {method.items?.length ? (
              <div className="space-y-3">
                {method.items.slice(0, itemsPerMethod).map((item) => (
                  <a
                    key={item.link}
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 bg-[var(--surface-2)] rounded border border-[var(--border)] hover:border-[var(--border-strong)] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-medium text-sm leading-snug">{item.title}</p>
                      <span className="text-xs text-[var(--text-muted)] whitespace-nowrap">
                        {formatISODate(item.published)}
                      </span>
                    </div>
                    {item.authors ? (
                      <p className="text-xs text-[var(--text-muted)] mt-1">{item.authors}</p>
                    ) : null}
                    {item.summary ? (
                      <p className="text-xs text-[var(--text-muted)] mt-2 line-clamp-3">{item.summary}</p>
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
              <p className="text-sm text-[var(--text-muted)]">
                No matching items for this filter combination.
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
