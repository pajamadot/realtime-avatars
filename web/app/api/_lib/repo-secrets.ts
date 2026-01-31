import fs from 'node:fs';
import path from 'node:path';

let loaded = false;

function stripQuotes(v: string) {
  const t = v.trim();
  if (
    (t.startsWith('"') && t.endsWith('"')) ||
    (t.startsWith("'") && t.endsWith("'"))
  ) {
    return t.slice(1, -1);
  }
  return t;
}

function parseEnvFile(contents: string) {
  const lines = contents.split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const maybeExport = line.startsWith('export ') ? line.slice('export '.length) : line;
    const eq = maybeExport.indexOf('=');
    if (eq <= 0) continue;

    const key = maybeExport.slice(0, eq).trim();
    if (!key) continue;
    if (process.env[key] != null && process.env[key] !== '') continue;

    const value = stripQuotes(maybeExport.slice(eq + 1));
    process.env[key] = value;
  }
}

function findRepoRootWithSecrets(startDir: string) {
  let dir = path.resolve(startDir);
  for (let i = 0; i < 10; i++) {
    const candidate = path.join(dir, 'secrets', '.ENV');
    if (fs.existsSync(candidate)) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

/**
 * Local dev convenience: if this repo has `secrets/.ENV`, load it into process.env.
 *
 * This does NOT override env vars already set by the deployment environment.
 */
export function loadRepoSecretsEnv() {
  if (loaded) return;
  loaded = true;

  try {
    const root = findRepoRootWithSecrets(process.cwd());
    if (!root) return;

    const envPath = path.join(root, 'secrets', '.ENV');
    const contents = fs.readFileSync(envPath, 'utf8');
    parseEnvFile(contents);
  } catch {
    // Best-effort only; production should set env vars via the platform.
  }
}

