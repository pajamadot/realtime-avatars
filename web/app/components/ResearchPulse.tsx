'use client';

import { useMemo, useState } from 'react';
import researchFeed from '../data/research-feed.json';
import { asTime, formatISODate, METHOD_COLOR } from '../lib/utils';

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
  items: FeedItem[];
};

type ResearchFeed = {
  updatedAt: string;
  methods: Record<string, FeedMethod>;
};

type FlatEntry = {
  methodKey: string;
  methodLabel: string;
  item: FeedItem;
};

type GroupedEntry = {
  link: string;
  title: string;
  published?: string;
  authors?: string;
  summary?: string;
  tags: string[];
  methodKeys: string[];
  methodLabels: string[];
};

const TIME_WINDOWS = [
  { days: 14, label: '14d' },
  { days: 30, label: '30d' },
  { days: 90, label: '90d' },
  { days: 0, label: 'all' },
] as const;

function windowStart(days: number) {
  if (!days) return 0;
  return Date.now() - days * 24 * 60 * 60 * 1000;
}

export default function ResearchPulse({ className = '' }: { className?: string }) {
  const feed = researchFeed as unknown as ResearchFeed;
  const methods = useMemo(() => Object.entries(feed.methods ?? {}), [feed]);
  const updated = formatISODate(feed.updatedAt);

  const [methodFilter, setMethodFilter] = useState('all');
  const [daysFilter, setDaysFilter] = useState<number>(30);
  const [tagFilter, setTagFilter] = useState('');

  const flat = useMemo(() => {
    const rows: FlatEntry[] = [];
    for (const [methodKey, method] of methods) {
      for (const item of method.items ?? []) {
        if (!item?.link || !item?.title) continue;
        rows.push({
          methodKey,
          methodLabel: method.label ?? methodKey,
          item,
        });
      }
    }
    return rows;
  }, [methods]);

  const filtered = useMemo(() => {
    const t0 = windowStart(daysFilter);
    return flat.filter((row) => {
      if (methodFilter !== 'all' && row.methodKey !== methodFilter) return false;
      const publishedAt = asTime(row.item.published);
      if (t0 && (!publishedAt || publishedAt < t0)) return false;
      if (tagFilter) {
        return (row.item.tags ?? []).some((tag) => String(tag).toLowerCase() === tagFilter);
      }
      return true;
    });
  }, [daysFilter, flat, methodFilter, tagFilter]);

  const grouped = useMemo(() => {
    const byLink = new Map<string, GroupedEntry>();
    for (const row of filtered) {
      const existing = byLink.get(row.item.link);
      if (!existing) {
        byLink.set(row.item.link, {
          link: row.item.link,
          title: row.item.title,
          published: row.item.published,
          authors: row.item.authors,
          summary: row.item.summary,
          tags: Array.from(new Set(row.item.tags ?? [])),
          methodKeys: [row.methodKey],
          methodLabels: [row.methodLabel],
        });
        continue;
      }

      if (!existing.methodKeys.includes(row.methodKey)) {
        existing.methodKeys.push(row.methodKey);
      }
      if (!existing.methodLabels.includes(row.methodLabel)) {
        existing.methodLabels.push(row.methodLabel);
      }
      for (const tag of row.item.tags ?? []) {
        if (!existing.tags.includes(tag)) existing.tags.push(tag);
      }
    }

    return Array.from(byLink.values()).sort((a, b) => {
      const ta = asTime(a.published);
      const tb = asTime(b.published);
      if (tb !== ta) return tb - ta;
      return a.link.localeCompare(b.link);
    });
  }, [filtered]);

  const topTags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const row of grouped) {
      for (const tag of row.tags ?? []) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }

    return Array.from(counts.entries())
      .sort((a, b) => {
        if (b[1] !== a[1]) return b[1] - a[1];
        return a[0].localeCompare(b[0]);
      })
      .slice(0, 10);
  }, [grouped]);

  const monthlyTrend = useMemo(() => {
    const buckets: Array<{ key: string; label: string; count: number }> = [];
    const now = new Date();

    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
      const key = d.toISOString().slice(0, 7);
      const label = d.toLocaleString('en-US', { month: 'short' });
      buckets.push({ key, label, count: 0 });
    }

    const indexByKey = new Map<string, number>();
    buckets.forEach((b, i) => indexByKey.set(b.key, i));

    for (const row of grouped) {
      const t = asTime(row.published);
      if (!t) continue;
      const key = new Date(t).toISOString().slice(0, 7);
      const idx = indexByKey.get(key);
      if (idx !== undefined) buckets[idx].count += 1;
    }

    const maxCount = Math.max(1, ...buckets.map((b) => b.count));
    return buckets.map((b) => ({
      ...b,
      height: Math.max(10, Math.round((b.count / maxCount) * 100)),
    }));
  }, [grouped]);

  const overlapCount = grouped.filter((row) => row.methodKeys.length > 1).length;
  const newest = grouped[0];
  const hottestTag = topTags[0]?.[0] ?? '-';

  return (
    <div className={className}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
        <p className="section-label">Research Pulse</p>
        <p className="text-xs text-[var(--text-muted)]">
          {updated ? `Updated ${updated}.` : 'No update timestamp.'} Interactive lens over the living feed.
        </p>
      </div>

      <div className="card p-4 mb-4">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-xs text-[var(--text-muted)]">Window</span>
          {TIME_WINDOWS.map((w) => (
            <button
              key={w.label}
              type="button"
              onClick={() => setDaysFilter(w.days)}
              className="badge hover:border-[var(--border-strong)]"
              style={{
                background: daysFilter === w.days ? 'var(--surface-3)' : undefined,
                borderColor: daysFilter === w.days ? 'var(--border-strong)' : undefined,
              }}
            >
              {w.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <label htmlFor="pulse-method" className="text-xs text-[var(--text-muted)]">
            Method
          </label>
          <select
            id="pulse-method"
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="input input-sm select max-w-xs"
          >
            <option value="all">All methods</option>
            {methods.map(([methodKey, method]) => (
              <option key={methodKey} value={methodKey}>
                {method.label}
              </option>
            ))}
          </select>

          {tagFilter ? (
            <button
              type="button"
              onClick={() => setTagFilter('')}
              className="badge hover:border-[var(--border-strong)]"
            >
              Clear tag: {tagFilter}
            </button>
          ) : (
            <span className="text-xs text-[var(--text-muted)]">Select a tag below to focus the lens.</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="card p-3">
          <p className="text-xs text-[var(--text-muted)]">Papers in lens</p>
          <p className="text-2xl font-semibold">{grouped.length}</p>
        </div>
        <div className="card p-3">
          <p className="text-xs text-[var(--text-muted)]">Cross-method overlap</p>
          <p className="text-2xl font-semibold">{overlapCount}</p>
        </div>
        <div className="card p-3">
          <p className="text-xs text-[var(--text-muted)]">Hottest tag</p>
          <p className="text-2xl font-semibold">{hottestTag}</p>
        </div>
        <div className="card p-3">
          <p className="text-xs text-[var(--text-muted)]">Newest paper</p>
          <p className="text-2xl font-semibold">{newest ? formatISODate(newest.published) : '-'}</p>
        </div>
      </div>

      <div className="card p-4 mb-4">
        <p className="font-medium text-sm mb-3">6-month publication trend</p>
        <div className="grid grid-cols-6 gap-2 h-24 items-end">
          {monthlyTrend.map((bucket) => (
            <div key={bucket.key} className="flex flex-col items-center gap-1">
              <div className="w-full h-16 flex items-end">
                <div
                  className="w-full rounded-sm"
                  style={{
                    height: `${bucket.height}%`,
                    background: 'linear-gradient(180deg, var(--accent-light), var(--accent))',
                  }}
                  aria-label={`${bucket.label}: ${bucket.count} papers`}
                />
              </div>
              <span className="text-[10px] text-[var(--text-muted)]">{bucket.label}</span>
              <span className="text-[10px] text-[var(--text-muted)]">{bucket.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between gap-3 mb-3">
          <p className="font-medium">Tags and latest signals</p>
          <span className="badge">{grouped.length} unique papers</span>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {topTags.length ? (
            topTags.map(([tag, count]) => (
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
                {tag} ({count})
              </button>
            ))
          ) : (
            <span className="text-xs text-[var(--text-muted)]">No tags in current lens.</span>
          )}
        </div>

        {grouped.length ? (
          <div className="space-y-2">
            {grouped.slice(0, 5).map((row) => (
              <a
                key={row.link}
                href={row.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 bg-[var(--surface-2)] rounded border border-[var(--border)] hover:border-[var(--border-strong)] transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium text-sm leading-snug">{row.title}</p>
                  <span className="text-xs text-[var(--text-muted)] whitespace-nowrap">
                    {formatISODate(row.published)}
                  </span>
                </div>
                {row.authors ? <p className="text-xs text-[var(--text-muted)] mt-1">{row.authors}</p> : null}
                {row.summary ? <p className="text-xs text-[var(--text-muted)] mt-2 line-clamp-2">{row.summary}</p> : null}
                <div className="mt-2 flex flex-wrap gap-1">
                  {row.methodKeys.map((methodKey, idx) => (
                    <span
                      key={`${row.link}:${methodKey}`}
                      className="badge text-[0.6875rem] py-0.5 px-2"
                      style={{
                        borderColor: METHOD_COLOR[methodKey] ?? 'var(--border)',
                        color: METHOD_COLOR[methodKey] ?? 'var(--text-secondary)',
                      }}
                    >
                      {row.methodLabels[idx] ?? methodKey}
                    </span>
                  ))}
                </div>
              </a>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--text-muted)]">No papers match this lens. Try widening the window or clearing the tag filter.</p>
        )}
      </div>
    </div>
  );
}
