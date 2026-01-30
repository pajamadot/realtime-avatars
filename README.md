Real-time digital humans: a living comparison site for four technical routes:

1) MetaHuman / graphics pipeline
2) Generative video models (diffusion/transformers)
3) Neural Gaussian splatting (3DGS)
4) Streaming avatars / infrastructure (WebRTC + backend)

The website includes an auto-updating "Living Research Feed" that pulls recent papers from arXiv and renders them on the homepage and per-method sections.

## LiveKit streaming avatar demo

There is a LiveKit WebRTC demo page at `/livekit` that connects to a LiveKit room and renders the first remote video track (intended to be an avatar worker publishing a digital human stream).

### Token issuer (server-side)

The browser must fetch a LiveKit token from a server-side endpoint (because it uses `LIVEKIT_API_SECRET`).

Option A: Next.js API route (Node)
- `web/app/api/livekit/token/route.ts`

Option B (Cloudflare): Worker token service
- `workers/livekit-token/` implements `POST /api/livekit/token` using WebCrypto (HS256 JWT).

If the Worker is hosted on a different origin, set `NEXT_PUBLIC_LIVEKIT_TOKEN_ENDPOINT` in the web build to that full URL.

Server env vars / secrets (set on the token issuer):

- `LIVEKIT_URL`
- `LIVEKIT_API_KEY`
- `LIVEKIT_API_SECRET`

You also need a running agent that publishes an avatar stream into the room. A minimal Hedra example is in `agents/livekit-hedra-avatar/`.

## Local dev

From `web/`:

```bash
npm install
npm run dev
```

## Research feed (auto-evolving)

The feed is generated into `web/app/data/research-feed.json` using this config:

- `web/app/data/research-feed.config.json`

Update locally:

```bash
cd web
npm run research:update
```

This will fetch arXiv results, filter for relevance, tag items, and rewrite the JSON used by the UI.

## Automation

GitHub Actions runs the updater on a schedule and auto-commits changes (plus a build safety check):

- `.github/workflows/update-research-feed.yml`
