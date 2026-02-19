import { NextResponse } from 'next/server';
import { loadRepoSecretsEnv } from '@/app/api/_lib/repo-secrets';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

loadRepoSecretsEnv();

type RealtimeSecretRequest = {
  model?: string;
  voice?: string;
  instructions?: string;
};

function getEnv(name: string) {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : '';
}

export async function POST(req: Request) {
  const apiKey = getEnv('OPENAI_API_KEY');
  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: 'OPENAI_API_KEY is not set.' },
      { status: 500 }
    );
  }

  let body: RealtimeSecretRequest = {};
  try {
    body = (await req.json()) as RealtimeSecretRequest;
  } catch {
    body = {};
  }

  const model = body.model?.trim() || 'gpt-realtime';
  const voice = body.voice?.trim() || 'alloy';
  const instructions = body.instructions?.trim() || undefined;

  const payload: Record<string, unknown> = {
    session: {
      type: 'realtime',
      model,
      audio: {
        output: {
          voice,
        },
      },
    },
  };

  if (instructions) {
    (payload.session as Record<string, unknown>).instructions = instructions;
  }

  try {
    const upstream = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = (await upstream.json().catch(() => ({}))) as Record<string, unknown>;
    if (!upstream.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Failed to mint realtime client secret.',
          upstream: data,
        },
        { status: upstream.status }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        model,
        voice,
        data,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 502 }
    );
  }
}
