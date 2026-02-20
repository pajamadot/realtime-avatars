# realtime-avatars

Monorepo for real-time digital avatar R&D across:

1. MetaHuman + Unreal Engine control/runtime
2. Video-generation avatar workflows
3. Gaussian avatar runtimes
4. WebRTC/LiveKit streaming infrastructure
5. Evidence-backed slide/article evolution pipelines

## Live URLs

- Primary: `https://www.realtime-avatars.com`
- Vercel fallback: `https://realtime-avatars.vercel.app`
- Slides deck entry: `https://www.realtime-avatars.com/slides/1`

## Current Project Status (2026-02-20)

- Repository: public at `https://github.com/pajamadot/realtime-avatars`
- Web stack: Next.js `16.1.6`, React `19`, TypeScript, Tailwind v4
- Slides: `35` slides in `web/app/slides/SlidesDeck.tsx`
- API routes live under `web/app/api/*`
- Latest evolution snapshot:
  - `full-modality-social-evolver` cycle `31`
  - `multimodal-io-research-evolver` cycle `102`
  - `slide-research-proofreader-evolver` cycle `103` (`0` warned slides)
- GitHub Actions automation: `.github/workflows/update-research-feed.yml` (daily feed refresh + build safety check)

## Repository Map

- `web/`: Next.js app, slides, demos, learning tracks, API routes, public docs snapshots
- `metahuman/`: UE 5.7 project (`avatar01`), plugin, bridge service, architecture/E2E docs
- `agents/`: LiveKit Hedra avatar Python agent runtime
- `workers/`: Cloudflare Worker for LiveKit token issuance
- `gaussian-avatar/`: Dockerized OpenAvatarChat + LAM runtime
- `.claude/skills/`: self-evolving research/proofread/architecture automation
- `research/`: lightweight research notes
- `secrets/`: local secret-loading support (not for committed secrets)

## Web Routes (Key)

- `/`: main survey page
- `/slides`, `/slides/[id]`, `/slides/demos/[slug]`
- `/learn/*` track pages and concept drilldowns
- `/rapport`: MetaHuman realtime control/talk panel
- `/livekit`: LiveKit streaming avatar demo
- `/gaussian-video-wall`: curated Gaussian-avatar video wall
- `/presenter-script` and `/presenter-script/s/[token]`

## API Endpoints

- `web/app/api/metahuman/control/route.ts`
- `web/app/api/livekit/token/route.ts`
- `web/app/api/openai/realtime/client-secret/route.ts`
- `web/app/api/fal/proxy/route.ts`

## Local Development

### Web app

```bash
cd web
npm install
npm run dev
```

### Production build check

```bash
cd web
npm run build
```

### Feed refresh

```bash
cd web
npm run feeds:update
```

### Feed refresh + build safety check

```bash
cd web
npm run feeds:refresh
```

## Evolution Pipelines

Run from repository root:

```bash
python .claude/skills/metahuman-evolver/scripts/evolve_metahuman.py --max-api-samples 30
python .claude/skills/full-modality-social-evolver/scripts/evolve_social_modality_research.py
python .claude/skills/multimodal-io-research-evolver/scripts/evolve_multimodal_io_research.py
python .claude/skills/realtime-gaussian-research-evolver/scripts/evolve_realtime_gaussian_research.py
python .claude/skills/gaussian-youtube-video-wall-evolver/scripts/evolve_gaussian_video_wall.py
python .claude/skills/slide-research-proofreader-evolver/scripts/evolve_slide_research_proofread.py
```

Published snapshots are mirrored to `web/public/docs/` (research, claim checks, dependency graphs, proofread reports).

## MetaHuman Control Path

- Unreal plugin source:
  - `metahuman/avatar01/Plugins/PajamaRealtimeControl/Source/PajamaRealtimeControl/*`
- Local bridge:
  - `metahuman/editor-bridge/server.mjs`
- Web UI:
  - `web/app/components/MetaHumanEditorControlPanel.tsx`
  - `web/app/components/MetaHumanRealtimeTalkPanel.tsx`
- Runbook:
  - `metahuman/UE57_REALTIME_E2E.md`

## Notes

- This is an actively iterated engineering/research repo, not a versioned product release.
- Some local-runtime-heavy folders can exist (for example `agents/livekit-hedra-avatar/.venv` and UE artifacts under `metahuman/avatar01/`).
- Source-of-truth operational guidance is in `AGENTS.md` and `ITERATION-MEGA-PROMPT.md`.
