import fs from 'node:fs/promises';
import path from 'node:path';
import Parser from 'rss-parser';

const CONFIGFILE = path.join(process.cwd(), 'app', 'data', 'research-feed.config.json');
const OUTFILE = path.join(process.cwd(), 'app', 'data', 'research-feed.json');

function stripHtml(input) {
  if (!input) return '';
  const cleaned = String(input).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  // Keep output mostly-ASCII to avoid mojibake across different terminals.
  return cleaned
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2026/g, '...');
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
  return `${cleaned.slice(0, Math.max(0, limit - 3))}...`;
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

function buildArxivUrl(searchQuery, maxResults) {
  const params = new URLSearchParams({
    search_query: searchQuery,
    start: '0',
    max_results: String(maxResults),
    sortBy: 'submittedDate',
    sortOrder: 'descending',
  });
  return `https://export.arxiv.org/api/query?${params.toString()}`;
}

async function readJson(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function splitKeywords(list) {
  if (!Array.isArray(list)) return [];
  return list
    .map((x) => String(x ?? '').trim().toLowerCase())
    .filter(Boolean);
}

function scoreText(text, keywords) {
  if (!text || !keywords.length) return 0;
  const t = String(text).toLowerCase();
  let score = 0;
  for (const kw of keywords) {
    if (!kw) continue;
    if (t.includes(kw)) score += 1;
  }
  return score;
}

function scoreItem(item, includeAny, excludeAny) {
  const text = `${item.title ?? ''}\n${item.summary ?? ''}`;
  const includeScore = scoreText(text, includeAny);
  const excludeScore = scoreText(text, excludeAny);
  return includeScore - excludeScore;
}

const TAG_RULES = [
  { tag: 'real-time', any: ['real-time', 'realtime', 'low-latency', 'low latency'] },
  { tag: 'audio-driven', any: ['audio-driven', 'audio driven', 'speech-driven', 'speech driven'] },
  { tag: 'lip-sync', any: ['lip-sync', 'lipsync', 'lip sync'] },
  { tag: 'diffusion', any: ['diffusion', 'dit', 'diffusion transformer'] },
  { tag: 'transformer', any: ['transformer', 'attention'] },
  { tag: 'gaussian', any: ['gaussian', '3dgs', 'splatting'] },
  { tag: 'monocular', any: ['monocular', 'single-view', 'single view', 'single image'] },
  { tag: 'multi-view', any: ['multi-view', 'multiview', 'multi view'] },
  { tag: 'few-shot', any: ['few-shot', 'few shot'] },
  { tag: 'relighting', any: ['relight', 'relighting', 'illumination'] },
  { tag: 'compression', any: ['compression', 'bitrate', 'codec', 'neural compression'] },
  { tag: 'telepresence', any: ['telepresence', 'video conferencing', 'conferencing'] },
  { tag: 'webrtc', any: ['webrtc', 'sfu'] },
];

function extractTags(item) {
  const text = `${item.title ?? ''}\n${item.summary ?? ''}`.toLowerCase();
  const tags = [];
  for (const rule of TAG_RULES) {
    if (rule.any.some((kw) => text.includes(String(kw).toLowerCase()))) {
      tags.push(rule.tag);
    }
  }
  return Array.from(new Set(tags)).sort();
}

async function main() {
  const config = await readJson(CONFIGFILE);
  const existingOut = await readJson(OUTFILE);
  const methods = config?.methods ?? {};
  const maxResultsPerMethod = Number(config?.maxResultsPerMethod ?? 24);
  const maxItemsPerMethod = Number(config?.maxItemsPerMethod ?? 12);

  const parser = new Parser({
    // rss-parser treats Atom feeds as "feeds" with "items".
    // arXiv "content" often contains HTML-like tags.
    timeout: 30_000,
  });

  const next = {
    updatedAt: new Date().toISOString(),
    source: config?.source ?? 'arXiv',
    methods: {},
  };

  const entries = Object.entries(methods);
  if (!entries.length) {
    throw new Error(`No methods found in ${CONFIGFILE}.`);
  }

  for (const [key, method] of entries) {
    const label = method?.label ?? key;
    const query = method?.query;
    const includeAny = splitKeywords(method?.includeAny);
    const excludeAny = splitKeywords(method?.excludeAny);
    const minScore = Number(method?.minScore ?? 0);
    if (!query) {
      next.methods[key] = { label, query: '', items: [] };
      continue;
    }

    let items = [];
    try {
      const url = buildArxivUrl(query, maxResultsPerMethod);
      const feed = await parser.parseURL(url);

      items = (feed.items ?? []).map((it) => ({
        title: normalizeTitle(it.title),
        link: it.link,
        published: normalizeIsoDate(it.isoDate ?? it.pubDate),
        authors: normalizeAuthors(it.creator ?? it.author),
        summary: normalizeSummary(it.summary ?? it.contentSnippet ?? it.content),
      }));
      for (const it of items) {
        it.tags = extractTags(it);
      }
    } catch (err) {
      // Keep the last known items for this method rather than nuking the section.
      const prev = existingOut?.methods?.[key]?.items;
      if (Array.isArray(prev)) items = prev;
      // eslint-disable-next-line no-console
      console.warn(`WARN: failed to fetch ${key}; using previous items`);
      // eslint-disable-next-line no-console
      console.warn(err);
    }

    // Deduplicate by link and keep output stable.
    const byLink = new Map();
    for (const it of items) {
      if (!it.link) continue;
      if (!byLink.has(it.link)) byLink.set(it.link, it);
    }

    const deduped = stableSortByPublishedDesc(Array.from(byLink.values()))
      .filter((it) => scoreItem(it, includeAny, excludeAny) >= minScore)
      .slice(0, maxItemsPerMethod);

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
