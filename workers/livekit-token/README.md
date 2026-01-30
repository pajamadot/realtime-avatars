# LiveKit Token Worker (Cloudflare)

This Cloudflare Worker implements LiveKit "endpoint token generation" using WebCrypto (HS256 JWT).

It is meant to be used by the web demo (`/livekit`) as a secure server-side token issuer.

## Deploy

From repo root:

```bash
cd workers/livekit-token
npx wrangler deploy
```

## Configure secrets

Set these secrets on the Worker:

```bash
npx wrangler secret put LIVEKIT_URL
npx wrangler secret put LIVEKIT_API_KEY
npx wrangler secret put LIVEKIT_API_SECRET
```

Optional:
- `ALLOWED_ORIGIN` (e.g. `https://your-site.pages.dev`) to restrict CORS. Default is `*`.
- `TOKEN_TTL_SECONDS` (default `3600`).

## Route

The Worker exposes:
- `POST /api/livekit/token`

You can either:
1) Bind the Worker to the same domain/path as your website (`/api/livekit/token`), so the frontend can use the default URL.
2) Or deploy it to a separate domain and set `NEXT_PUBLIC_LIVEKIT_TOKEN_ENDPOINT` in the web build to that full URL.

