# Editor Bridge (Localhost -> Unreal Editor)

This service exposes a small HTTP API for controlling the Unreal editor plugin endpoint:

- Bridge endpoint: `http://127.0.0.1:8788/v1/command`
- Unreal endpoint (default): `http://127.0.0.1:5189/pajama/control`

## Run locally

```powershell
cd metahuman/editor-bridge
$env:ENGINE_BRIDGE_TOKEN = "replace-with-a-secret"
node server.mjs
```

Optional environment variables:

- `ENGINE_BRIDGE_PORT` (default `8788`)
- `ENGINE_BRIDGE_HOST` (default `127.0.0.1`)
- `ENGINE_BRIDGE_ALLOW_ORIGIN` (default `*`)
- `ENGINE_BRIDGE_TOKEN` (optional bearer token)
- `UNREAL_CONTROL_ENDPOINT` (default `http://127.0.0.1:5189/pajama/control`)
- `UNREAL_HEALTH_ENDPOINT` (default `http://127.0.0.1:5189/pajama/health`)

## Quick test

```powershell
curl http://127.0.0.1:8788/health
```

```powershell
curl -X POST http://127.0.0.1:8788/v1/command `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer replace-with-a-secret" `
  -d "{\"targetActorTag\":\"PajamaMetaHuman\",\"preset\":\"smile\",\"strength\":1.0}"
```

## Expose via cloudflared

```powershell
cloudflared tunnel login
cloudflared tunnel create pajama-engine
cloudflared tunnel route dns pajama-engine engine.pajamadot.com
```

Then copy `cloudflared/config.example.yml` to your local Cloudflare config path and run:

```powershell
cloudflared tunnel run pajama-engine
```
