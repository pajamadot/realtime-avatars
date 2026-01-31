import { NextResponse } from 'next/server';
import { AccessToken, VideoGrant } from 'livekit-server-sdk';
import { RoomAgentDispatch, RoomConfiguration } from '@livekit/protocol';
import { loadRepoSecretsEnv } from '@/app/api/_lib/repo-secrets';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

loadRepoSecretsEnv();

type TokenRequestBody = {
  // LiveKit endpoint token generation schema (supports both snake_case and camelCase).
  room_name?: string;
  roomName?: string;

  participant_identity?: string;
  participantIdentity?: string;

  participant_name?: string;
  participantName?: string;

  participant_metadata?: string;
  participantMetadata?: string;

  participant_attributes?: Record<string, string>;
  participantAttributes?: Record<string, string>;

  // Convenience: allow direct agent dispatch fields from clients.
  agent_name?: string;
  agentName?: string;
  agent_metadata?: unknown;
  agentMetadata?: unknown;
};

function getEnv(name: string) {
  const v = process.env[name];
  return v && v.trim() ? v.trim() : '';
}

function normalizeMetadata(value: unknown) {
  if (!value) return undefined;
  if (typeof value === 'string') {
    const t = value.trim();
    return t ? t : undefined;
  }
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return undefined;
    }
  }
  return undefined;
}

export async function POST(req: Request) {
  let body: TokenRequestBody = {};
  try {
    body = (await req.json()) as TokenRequestBody;
  } catch {
    body = {};
  }

  const apiKey = getEnv('LIVEKIT_API_KEY');
  const apiSecret = getEnv('LIVEKIT_API_SECRET');
  const serverUrl = getEnv('LIVEKIT_URL');

  if (!apiKey || !apiSecret || !serverUrl) {
    return NextResponse.json(
      {
        error:
          'Missing LIVEKIT_API_KEY / LIVEKIT_API_SECRET / LIVEKIT_URL. Set them in your deployment environment.',
      },
      { status: 500 }
    );
  }

  const roomName = body.room_name ?? body.roomName ?? '';
  if (!roomName) {
    return NextResponse.json({ error: 'room_name is required' }, { status: 400 });
  }

  const identity =
    body.participant_identity ?? body.participantIdentity ?? crypto.randomUUID();
  const name = body.participant_name ?? body.participantName ?? identity;
  const metadata = body.participant_metadata ?? body.participantMetadata;
  const attributes =
    body.participant_attributes ?? body.participantAttributes ?? undefined;

  const agentName = body.agent_name ?? body.agentName;
  const agentMetadata = normalizeMetadata(body.agent_metadata ?? body.agentMetadata);

  const token = new AccessToken(apiKey, apiSecret, {
    identity,
    name,
    metadata,
    attributes,
  });

  const grant: VideoGrant = {
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  };
  token.addGrant(grant);

  // If an agent name is provided, dispatch the agent when this participant joins the room.
  // This requires that an agent with the same agentName is registered/running.
  if (agentName) {
    token.roomConfig = new RoomConfiguration({
      agents: [
        new RoomAgentDispatch({
          agentName,
          metadata: agentMetadata,
        }),
      ],
    });
  }

  const jwt = await token.toJwt();

  // LiveKit "Endpoint token generation" response format.
  return NextResponse.json(
    {
      server_url: serverUrl,
      participant_token: jwt,
    },
    { status: 201 }
  );
}
