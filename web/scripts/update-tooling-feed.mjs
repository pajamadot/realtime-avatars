import fs from 'node:fs/promises';
import path from 'node:path';

const CONFIGFILE = path.join(process.cwd(), 'app', 'data', 'tooling-feed.config.json');
const OUTFILE = path.join(process.cwd(), 'app', 'data', 'tooling-feed.json');

function normalizeText(v) {
  if (!v) return '';
  return String(v)
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/[^\x20-\x7E]/g, '');
}

async function readJson(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function asIso(d) {
  if (!d) return '';
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return '';
  return dt.toISOString();
}

async function fetchJson(url, token) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'realtime-avatars-feed-bot',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);
  try {
    const res = await fetch(url, { headers, signal: controller.signal });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`GitHub API ${res.status}: ${text.slice(0, 200)}`);
    }
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}

function buildSearchUrl(q, maxResults) {
  const params = new URLSearchParams({
    q,
    sort: 'stars',
    order: 'desc',
    per_page: String(maxResults),
  });
  return `https://api.github.com/search/repositories?${params.toString()}`;
}

async function main() {
  const config = await readJson(CONFIGFILE);
  const existingOut = await readJson(OUTFILE);

  if (!config?.queries || typeof config.queries !== 'object') {
    throw new Error(`Invalid config: ${CONFIGFILE}`);
  }

  const token =
    process.env.GITHUB_TOKEN ||
    process.env.GH_TOKEN ||
    process.env.GITHUB_AUTH_TOKEN ||
    '';

  const maxResultsPerQuery = Number(config.maxResultsPerQuery ?? 25);
  const maxItemsPerQuery = Number(config.maxItemsPerQuery ?? 10);

  const next = {
    updatedAt: new Date().toISOString(),
    source: config.source ?? 'GitHub Search',
    queries: {},
  };

  for (const [key, qcfg] of Object.entries(config.queries)) {
    const label = qcfg?.label ?? key;
    const q = qcfg?.q;
    if (!q) {
      next.queries[key] = { label, q: '', items: [] };
      continue;
    }

    try {
      const url = buildSearchUrl(q, maxResultsPerQuery);
      const data = await fetchJson(url, token);
      const items = (data.items ?? [])
        .map((repo) => ({
          name: repo.full_name ?? repo.name ?? '',
          link: repo.html_url ?? '',
          description: normalizeText(repo.description ?? ''),
          stars: Number(repo.stargazers_count ?? 0),
          pushedAt: asIso(repo.pushed_at),
          language: repo.language ?? '',
        }))
        .filter((it) => it.link && it.name)
        .slice(0, maxItemsPerQuery);

      next.queries[key] = { label, q, items };
    } catch (err) {
      const prev = existingOut?.queries?.[key];
      if (prev) next.queries[key] = prev;
      else next.queries[key] = { label, q, items: [] };
      // eslint-disable-next-line no-console
      console.warn(`WARN: tooling feed failed for ${key}; using previous items`);
      // eslint-disable-next-line no-console
      console.warn(err);
    }
  }

  const comparableNext = { source: next.source, queries: next.queries };
  const comparableExisting = existingOut ? { source: existingOut.source, queries: existingOut.queries } : null;
  if (comparableExisting && JSON.stringify(comparableExisting) === JSON.stringify(comparableNext)) {
    // eslint-disable-next-line no-console
    console.log(`No changes for ${path.relative(process.cwd(), OUTFILE)}`);
    return;
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
