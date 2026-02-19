import { NextResponse } from 'next/server';
import { loadRepoSecretsEnv } from '@/app/api/_lib/repo-secrets';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

loadRepoSecretsEnv();

function getEnv(name: string) {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : '';
}

const DEFAULT_ENDPOINT = 'http://127.0.0.1:8788/v1/command';
const DEFAULT_HEALTH_ENDPOINT = 'http://127.0.0.1:8788/health';

export async function GET() {
  const endpoint = getEnv('METAHUMAN_CONTROL_HEALTH_ENDPOINT') || DEFAULT_HEALTH_ENDPOINT;
  const token = getEnv('METAHUMAN_CONTROL_TOKEN');

  try {
    const res = await fetch(endpoint, {
      method: 'GET',
      cache: 'no-store',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    const payload = await res.json().catch(() => ({}));
    return NextResponse.json(
      {
        ok: res.ok,
        endpoint,
        payload,
      },
      { status: res.status }
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        endpoint,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 502 }
    );
  }
}

export async function POST(req: Request) {
  const endpoint = getEnv('METAHUMAN_CONTROL_ENDPOINT') || DEFAULT_ENDPOINT;
  const token = getEnv('METAHUMAN_CONTROL_TOKEN');

  let body: unknown = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  try {
    const upstream = await fetch(endpoint, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });

    const payload = await upstream.json().catch(() => ({}));
    return NextResponse.json(
      {
        ok: upstream.ok,
        endpoint,
        payload,
      },
      { status: upstream.status }
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        endpoint,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 502 }
    );
  }
}
