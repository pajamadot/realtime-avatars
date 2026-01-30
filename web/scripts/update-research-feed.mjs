import fs from 'node:fs/promises';
import path from 'node:path';
import Parser from 'rss-parser';

const OUTFILE = path.join(process.cwd(), 'app', 'data', 'research-feed.json');
const MAX_RESULTS_PER_METHOD = 12;

function stripHtml(input) {
  if (!input) return '';
  return String(input).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

function normalizeTitle(t) {
  return stripHtml(t)
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeAuthors(a) {
  return stripHtml(a)
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeSummary(s) {
  const cleaned = stripHtml(s);
  if (!cleaned) return '';
  // Keep it short enough for a compact UI card.
  const limit = 280;
  if (cleaned.length <= limit) return cleaned;
  return `${cleaned.slice(0, limit - 1)}…`;
}

function normalizeIsoDate(d) {
  if (!d) return '';
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return '';
  return dt.toISOString();
}

function stableSortByPublishedDesc(items) {
  return items
    .slice()
    .sort((a, b) => {
      const da = a.published ? Date.parse(a.published) : 0;
      const db = b.published ? Date.parse(b.published) : 0;
      if (db !== da) return db - da;
      return String(a.link).localeCompare(String(b.link));
    });
}

function buildArxivUrl(searchQuery) {
  const params = new URLSearchParams({
    search_query: searchQuery,
    start: '0',
    max_results: String(MAX_RESULTS_PER_METHOD),
    sortBy: 'submittedDate',
    sortOrder: 'descending',
  });
  return `https://export.arxiv.org/api/query?${params.toString()}`;
}

async function readExisting() {
  try {
    const raw = await fs.readFile(OUTFILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function main() {
  const existing = await readExisting();
  const methods = existing?.methods ?? {};

  const parser = new Parser({
    // rss-parser treats Atom feeds as "feeds" with "items".
    // arXiv "content" often contains HTML-like tags.
    timeout: 30_000,
  });

  const next = {
    updatedAt: new Date().toISOString(),
    source: existing?.source ?? 'arXiv',
    methods: {},
  };

  const entries = Object.entries(methods);
  if (!entries.length) {
    throw new Error(`No methods found in ${OUTFILE}.`);
  }

  for (const [key, method] of entries) {
    const label = method?.label ?? key;
    const query = method?.query;
    if (!query) {
      next.methods[key] = { label, query: '', items: [] };
      continue;
    }

    const url = buildArxivUrl(query);
    const feed = await parser.parseURL(url);

    const items = (feed.items ?? []).map((it) => ({
      title: normalizeTitle(it.title),
      link: it.link,
      published: normalizeIsoDate(it.isoDate ?? it.pubDate),
      authors: normalizeAuthors(it.creator ?? it.author),
      summary: normalizeSummary(it.summary ?? it.contentSnippet ?? it.content),
    }));

    // Deduplicate by link and keep output stable.
    const byLink = new Map();
    for (const it of items) {
      if (!it.link) continue;
      if (!byLink.has(it.link)) byLink.set(it.link, it);
    }

    const deduped = stableSortByPublishedDesc(Array.from(byLink.values())).slice(0, MAX_RESULTS_PER_METHOD);

    next.methods[key] = {
      label,
      query,
      items: deduped,
    };
  }

  await fs.mkdir(path.dirname(OUTFILE), { recursive: true });
  await fs.writeFile(OUTFILE, `${JSON.stringify(next, null, 2)}\n`, 'utf8');

  // eslint-disable-next-line no-console
  console.log(`Updated ${path.relative(process.cwd(), OUTFILE)} at ${next.updatedAt}`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});
