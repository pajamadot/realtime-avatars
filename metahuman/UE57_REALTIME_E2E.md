# UE 5.7 MetaHuman Realtime E2E (This Repo)

This repository now includes an end-to-end control path:

1. Browser page (`/rapport`) sends control commands.
2. Next.js API route forwards the command.
3. Local bridge service forwards to Unreal Editor.
4. Unreal plugin applies morph targets and head pose to your MetaHuman actor.

## What Was Added

- Unreal plugin:
  - `metahuman/avatar01/Plugins/PajamaRealtimeControl/...`
  - Local endpoints in editor:
    - `GET http://127.0.0.1:5189/pajama/health`
    - `POST http://127.0.0.1:5189/pajama/control`
- Local bridge service:
  - `metahuman/editor-bridge/server.mjs`
  - `GET /health`, `POST /v1/command`
- Web integration:
  - `web/app/api/metahuman/control/route.ts`
  - `web/app/api/openai/realtime/client-secret/route.ts`
  - `web/app/components/MetaHumanEditorControlPanel.tsx`
  - `web/app/components/MetaHumanRealtimeTalkPanel.tsx`
  - `/rapport` page now includes this control panel.

## Unreal Setup (Assets + Blueprint)

1. Open `metahuman/avatar01/avatar01.uproject` in Unreal Engine 5.7.
2. Confirm plugin is enabled:
   - `Edit -> Plugins -> Pajama Realtime Control`
3. Load your map and MetaHuman actor (for this project, likely in `Content/metahuman/Clay.uasset`).
4. On the actor you want to drive:
   - Add actor tag: `PajamaMetaHuman` (or use your own tag and match it in web UI).
   - Add component: `PajamaMetaHumanControllerComponent`.
5. In component settings:
   - Keep `bAutoCollectSkeletalMeshes=true` unless you need manual mesh assignment.
   - If needed, manually populate `ControlledMeshComponents` with face/body skeletal mesh components.
6. Press Play In Editor (PIE) or keep in editor world.

Notes:
- The plugin applies morph targets directly to skeletal mesh components.
- If your MetaHuman rig uses different morph target names, adjust payload keys accordingly.
- Current presets in plugin: `smile`, `talk`, `surprised`.

## API Contract

POST `http://127.0.0.1:5189/pajama/control`

```json
{
  "targetActorTag": "PajamaMetaHuman",
  "preset": "smile",
  "strength": 1.0
}
```

Or manual control:

```json
{
  "targetActorTag": "PajamaMetaHuman",
  "morphTargets": {
    "mouthSmileLeft": 0.6,
    "mouthSmileRight": 0.6,
    "jawOpen": 0.2
  },
  "headYaw": 8,
  "headPitch": -3,
  "headRoll": 0
}
```

## Run Local Bridge

```powershell
cd metahuman/editor-bridge
$env:ENGINE_BRIDGE_TOKEN = "replace-with-a-secret"
node server.mjs
```

By default it forwards to `http://127.0.0.1:5189/pajama/control`.

## Connect Web App to Bridge

For local dev, set:

```bash
METAHUMAN_CONTROL_ENDPOINT=http://127.0.0.1:8788/v1/command
METAHUMAN_CONTROL_HEALTH_ENDPOINT=http://127.0.0.1:8788/health
METAHUMAN_CONTROL_TOKEN=replace-with-a-secret
```

Also required for realtime talk:

```bash
OPENAI_API_KEY=sk-...
```

For public tunnel:

```bash
METAHUMAN_CONTROL_ENDPOINT=https://engine.pajamadot.com/v1/command
METAHUMAN_CONTROL_HEALTH_ENDPOINT=https://engine.pajamadot.com/health
METAHUMAN_CONTROL_TOKEN=replace-with-a-secret
```

## Cloudflared + Domain Binding (`engine.pajamadot.com`)

```powershell
cloudflared tunnel login
cloudflared tunnel create pajama-engine
cloudflared tunnel route dns pajama-engine engine.pajamadot.com
```

Then run the tunnel with a config (example file provided at `metahuman/editor-bridge/cloudflared/config.example.yml`):

```powershell
cloudflared tunnel --config C:\Users\PS\.cloudflared\config.yml run pajama-engine
```

## Wrangler Note

If you also deploy a Worker on a custom domain, Cloudflare requires `custom_domain=true` routes and no conflicting CNAME on that same hostname. For this specific local-editor control path, direct Cloudflare Tunnel routing to `engine.pajamadot.com` is the simplest approach.

## Open-Source Repos You Can Reuse (UE 5.7 Caveats)

1. `sovietspaceship/ue4-remote-control`
   - https://github.com/sovietspaceship/ue4-remote-control
   - Node TypeScript client for Unreal Remote Control HTTP.
   - Caveat: built around UE4-era API; endpoint compatibility must be rechecked on UE 5.7.

2. `cgtoolbox/UnrealRemoteControlWrapper`
   - https://github.com/cgtoolbox/UnrealRemoteControlWrapper
   - Python wrapper for Remote Control API and remote Python execution.
   - Caveat: test data repo targets UE 5.3, so validate against UE 5.7.

3. `igsxf22/python_unreal_relay`
   - https://github.com/igsxf22/python_unreal_relay
   - Minimal realtime TCP relay pattern into UE (states UE >= 5.6.1).
   - Useful pattern if you want external process control without Remote Control Presets.

4. `EpicGames/MetaHuman-DNA-Calibration`
   - https://github.com/EpicGames/MetaHuman-DNA-Calibration
   - Official open-source DNA tooling for MetaHuman rig data.
   - Caveat: useful for asset pipeline/calibration; not a realtime editor control server.

## Realtime Talking Path Implemented

- Browser panel (`MetaHumanRealtimeTalkPanel`) starts OpenAI Realtime WebRTC session.
- Mic audio is streamed to model.
- Assistant returned audio is played in browser.
- Audio is analyzed frame-by-frame (RMS + frequency bands) and mapped to facial morph targets.
- Morph target frames are sent to Unreal via `/api/metahuman/control` -> bridge -> plugin.

This gives practical realtime talking animation now, with room to improve viseme quality later.
