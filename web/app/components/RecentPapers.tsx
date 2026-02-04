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

export default function RecentPapers({
  methodKey,
  limit = 5,
  className = '',
}: {
  methodKey: string;
  limit?: number;
  className?: string;
}) {
  const feed = researchFeed as unknown as ResearchFeed;
  const method = feed.methods?.[methodKey];

  if (!method?.items?.length) return null;

  const items = method.items.slice(0, Math.max(0, limit));
  const dot = METHOD_COLOR[methodKey] ?? 'var(--border-strong)';

  return (
    <div className={`card p-5 ${className}`}>
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="approach-dot" style={{ backgroundColor: dot }} aria-hidden="true" />
          <p className="font-medium">Recent papers</p>
        </div>
        <a href="#living-feed" className="text-xs text-[var(--text-muted)] hover:text-[var(--foreground)]">
          View all
        </a>
      </div>

      <div className="space-y-2">
        {items.map((it) => (
          <a
            key={it.link}
            href={it.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 bg-[var(--surface-2)] rounded border border-[var(--border)] hover:border-[var(--border-strong)] transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="font-medium text-sm leading-snug">{it.title}</p>
              <span className="text-xs text-[var(--text-muted)] whitespace-nowrap">
                {formatISODate(it.published)}
              </span>
            </div>
            {it.tags?.length ? (
              <div className="mt-2 flex flex-wrap gap-1">
                {it.tags.slice(0, 4).map((t) => (
                  <span key={t} className="badge text-[0.6875rem] py-0.5 px-2">
                    {t}
                  </span>
                ))}
              </div>
            ) : null}
          </a>
        ))}
      </div>
    </div>
  );
}

