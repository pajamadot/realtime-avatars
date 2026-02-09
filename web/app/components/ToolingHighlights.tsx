import toolingFeed from '../data/tooling-feed.json';
import { formatISODate, asTime, formatStars, METHOD_COLOR } from '../lib/utils';

type ToolItem = {
  name: string;
  link: string;
  stars?: number;
  pushedAt?: string;
  language?: string;
};

type ToolQuery = {
  label: string;
  items: ToolItem[];
};

type ToolingFeed = {
  updatedAt: string;
  queries: Record<string, ToolQuery>;
};

export default function ToolingHighlights({
  limit = 6,
  className = '',
}: {
  limit?: number;
  className?: string;
}) {
  const feed = toolingFeed as unknown as ToolingFeed;
  const rows: Array<{
    queryKey: string;
    queryLabel: string;
    item: ToolItem;
  }> = [];

  for (const [queryKey, query] of Object.entries(feed.queries ?? {})) {
    for (const item of query.items ?? []) {
      if (!item?.link || !item?.name) continue;
      rows.push({ queryKey, queryLabel: query.label ?? queryKey, item });
    }
  }

  rows.sort((a, b) => {
    const ta = asTime(a.item.pushedAt);
    const tb = asTime(b.item.pushedAt);
    if (tb !== ta) return tb - ta;
    const sa = Number(a.item.stars ?? 0);
    const sb = Number(b.item.stars ?? 0);
    if (sb !== sa) return sb - sa;
    return a.item.link.localeCompare(b.item.link);
  });

  const top = rows.slice(0, Math.max(0, limit));
  const updated = formatISODate(feed.updatedAt);

  return (
    <div className={className}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
        <p className="section-label">Tooling Radar</p>
        <p className="text-xs text-[var(--text-muted)]">
          {updated ? `Updated ${updated}.` : 'Not updated yet.'} See <a href="#tooling-radar" className="hover:underline">tooling</a>
        </p>
      </div>

      <div className="space-y-2">
        {top.map((row) => (
          <a
            key={`${row.queryKey}:${row.item.link}`}
            href={row.item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 p-3 bg-[var(--surface-0)] rounded border border-[var(--border)] hover:border-[var(--border-strong)] transition-colors"
          >
            <div
              className="approach-dot mt-1"
              style={{ backgroundColor: METHOD_COLOR[row.queryKey] ?? 'var(--border-strong)' }}
              aria-hidden="true"
            />
            <div className="min-w-0 w-full">
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium text-sm leading-snug truncate">{row.item.name}</p>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-[var(--text-muted)] whitespace-nowrap">
                    {formatStars(row.item.stars)}★
                  </span>
                  <span className="text-xs text-[var(--text-muted)] whitespace-nowrap">
                    {formatISODate(row.item.pushedAt)}
                  </span>
                </div>
              </div>
              <div className="mt-1 flex items-center justify-between gap-3">
                <p className="text-xs text-[var(--text-muted)] truncate">{row.queryLabel}</p>
                {row.item.language ? (
                  <span className="badge text-[0.6875rem] py-0.5 px-2">{row.item.language}</span>
                ) : null}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
