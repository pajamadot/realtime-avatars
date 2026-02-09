import toolingFeed from '../data/tooling-feed.json';
import { formatISODate, formatStars } from '../lib/utils';

type ToolItem = {
  name: string;
  link: string;
  description?: string;
  stars?: number;
  pushedAt?: string;
  language?: string;
};

type ToolQuery = {
  label: string;
  q?: string;
  items: ToolItem[];
};

type ToolingFeed = {
  updatedAt: string;
  source: string;
  queries: Record<string, ToolQuery>;
};

export default function ToolingRadar({ className = '' }: { className?: string }) {
  const feed = toolingFeed as unknown as ToolingFeed;
  const updated = formatISODate(feed.updatedAt);
  const queries = Object.entries(feed.queries ?? {});

  if (!queries.length) return null;

  return (
    <div className={className}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
        <p className="text-sm text-[var(--text-muted)]">
          Tooling radar (source: {feed.source}).{updated ? ` Last refresh: ${updated}.` : ''}
        </p>
        <code>npm run tooling:update</code>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {queries.map(([key, q]) => (
          <div key={key} className="card p-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <p className="font-medium">{q.label}</p>
              <span className="badge">GitHub</span>
            </div>
            {q.q ? (
              <p className="text-xs text-[var(--text-muted)] mb-3">
                Query: <code>{q.q}</code>
              </p>
            ) : null}

            {q.items?.length ? (
              <div className="space-y-3">
                {q.items.slice(0, 6).map((it) => (
                  <a
                    key={it.link}
                    href={it.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 bg-[var(--surface-2)] rounded border border-[var(--border)] hover:border-[var(--border-strong)] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-medium text-sm leading-snug">{it.name}</p>
                      <span className="text-xs text-[var(--text-muted)] whitespace-nowrap">
                        {formatStars(it.stars)}★
                      </span>
                    </div>
                    {it.description ? (
                      <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-3">{it.description}</p>
                    ) : null}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {it.language ? (
                        <span className="badge text-[0.6875rem] py-0.5 px-2">{it.language}</span>
                      ) : null}
                      {it.pushedAt ? (
                        <span className="badge text-[0.6875rem] py-0.5 px-2">
                          pushed {formatISODate(it.pushedAt)}
                        </span>
                      ) : null}
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--text-muted)]">
                No items yet. Run <code>npm run tooling:update</code> to populate this section.
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

