import researchFeed from '../data/research-feed.json';

type FeedItem = {
  title: string;
  link: string;
  published?: string;
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

const METHOD_COLOR: Record<string, string> = {
  metahuman: 'var(--color-metahuman)',
  generative: 'var(--color-generative)',
  gaussian: 'var(--color-gaussian)',
  streaming: 'var(--color-streaming)',
};

function formatISODate(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

function asTime(iso?: string) {
  if (!iso) return 0;
  const t = Date.parse(iso);
  return Number.isNaN(t) ? 0 : t;
}

export default function ResearchHighlights({
  limit = 6,
  className = '',
}: {
  limit?: number;
  className?: string;
}) {
  const feed = researchFeed as unknown as ResearchFeed;
  const rows: Array<{ methodKey: string; methodLabel: string; item: FeedItem }> = [];

  for (const [methodKey, method] of Object.entries(feed.methods ?? {})) {
    for (const item of method.items ?? []) {
      if (!item?.link || !item?.title) continue;
      rows.push({ methodKey, methodLabel: method.label ?? methodKey, item });
    }
  }

  rows.sort((a, b) => {
    const ta = asTime(a.item.published);
    const tb = asTime(b.item.published);
    if (tb !== ta) return tb - ta;
    return a.item.link.localeCompare(b.item.link);
  });

  const top = rows.slice(0, Math.max(0, limit));
  const updated = formatISODate(feed.updatedAt);

  return (
    <div className={className}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
        <p className="section-label">Living Research Feed</p>
        <p className="text-xs text-[var(--text-muted)]">
          {updated ? `Updated ${updated}.` : 'Not updated yet.'} Run <code>npm run research:update</code>
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {top.map((row) => (
          <a
            key={`${row.methodKey}:${row.item.link}`}
            href={row.item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 p-3 bg-[var(--surface-0)] rounded border border-[var(--border)] hover:border-[var(--border-strong)] transition-colors"
          >
            <div
              className="approach-dot mt-1"
              style={{ backgroundColor: METHOD_COLOR[row.methodKey] ?? 'var(--border-strong)' }}
              aria-hidden="true"
            />
            <div className="min-w-0">
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium text-sm leading-snug truncate">{row.item.title}</p>
                <span className="text-xs text-[var(--text-muted)] whitespace-nowrap">
                  {formatISODate(row.item.published)}
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-1">{row.methodLabel}</p>
              {row.item.tags?.length ? (
                <div className="mt-2 flex flex-wrap gap-1">
                  {row.item.tags.slice(0, 4).map((t) => (
                    <span key={t} className="badge text-[0.6875rem] py-0.5 px-2">
                      {t}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
