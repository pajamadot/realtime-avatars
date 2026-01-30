export interface Env {
  LIVEKIT_URL: string;
  LIVEKIT_API_KEY: string;
  LIVEKIT_API_SECRET: string;
  ALLOWED_ORIGIN?: string;
  TOKEN_TTL_SECONDS?: string;
}

type TokenRequestBody = {
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
};

function json(data: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json; charset=utf-8');
  return new Response(JSON.stringify(data), { ...init, headers });
}

function b64url(bytes: Uint8Array) {
  // Cloudflare Workers has btoa; convert bytes to a binary string first.
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function encodeJwtPart(obj: unknown) {
  return b64url(new TextEncoder().encode(JSON.stringify(obj)));
}

async function signHs256(message: string, secret: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return b64url(new Uint8Array(sig));
}

function getAllowedOrigin(reqOrigin: string | null, allowed: string | undefined) {
  const allow = (allowed ?? '*').trim();
  if (allow === '*') return '*';
  if (!reqOrigin) return '';
  const list = allow
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return list.includes(reqOrigin) ? reqOrigin : '';
}

function corsHeaders(origin: string) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  } as Record<string, string>;
}

function getString(v: string | undefined) {
  return (v ?? '').trim();
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const reqOrigin = request.headers.get('Origin');
    const allowOrigin = getAllowedOrigin(reqOrigin, env.ALLOWED_ORIGIN);

    // Only serve the token endpoint. (Useful when Worker is mounted at a route.)
    if (url.pathname !== '/api/livekit/token') {
      return new Response('Not found', { status: 404 });
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(allowOrigin || '*'),
      });
    }

    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, { status: 405, headers: corsHeaders(allowOrigin || '*') });
    }

    const apiKey = getString(env.LIVEKIT_API_KEY);
    const apiSecret = getString(env.LIVEKIT_API_SECRET);
    const serverUrl = getString(env.LIVEKIT_URL);

    if (!apiKey || !apiSecret || !serverUrl) {
      return json(
        { error: 'Missing LIVEKIT_URL / LIVEKIT_API_KEY / LIVEKIT_API_SECRET' },
        { status: 500, headers: corsHeaders(allowOrigin || '*') }
      );
    }

    let body: TokenRequestBody = {};
    try {
      body = (await request.json()) as TokenRequestBody;
    } catch {
      body = {};
    }

    const roomName = (body.room_name ?? body.roomName ?? '').trim();
    if (!roomName) {
      return json({ error: 'room_name is required' }, { status: 400, headers: corsHeaders(allowOrigin || '*') });
    }

    const identity = (body.participant_identity ?? body.participantIdentity ?? crypto.randomUUID()).trim();
    const name = (body.participant_name ?? body.participantName ?? identity).trim();
    const metadata = body.participant_metadata ?? body.participantMetadata;
    const attributes = body.participant_attributes ?? body.participantAttributes;

    const now = Math.floor(Date.now() / 1000);
    const ttl = Number(getString(env.TOKEN_TTL_SECONDS) || '3600') || 3600;

    const header = { alg: 'HS256', typ: 'JWT' };
    const payload: Record<string, unknown> = {
      iss: apiKey,
      sub: identity,
      name,
      nbf: now - 10,
      exp: now + ttl,
      jti: crypto.randomUUID(),
      video: {
        room: roomName,
        roomJoin: true,
        canPublish: true,
        canSubscribe: true,
        canPublishData: true,
      },
    };

    if (metadata) payload.metadata = metadata;
    if (attributes) payload.attributes = attributes;

    const encodedHeader = encodeJwtPart(header);
    const encodedPayload = encodeJwtPart(payload);
    const message = `${encodedHeader}.${encodedPayload}`;
    const signature = await signHs256(message, apiSecret);
    const jwt = `${message}.${signature}`;

    return json(
      {
        server_url: serverUrl,
        participant_token: jwt,
      },
      { status: 201, headers: corsHeaders(allowOrigin || '*') }
    );
  },
};

