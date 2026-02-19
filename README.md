# realtime-avatars

Public research and engineering repo for real-time digital avatar systems across:

1. MetaHuman + Unreal Engine
2. Streaming avatar infrastructure (WebRTC + LiveKit)
3. Gaussian splatting avatars
4. Generative video avatars

## Live URLs

- Primary: `https://www.realtime-avatars.com`
- Vercel fallback: `https://realtime-avatars.vercel.app`
- Slides entry: `https://www.realtime-avatars.com/slides/1`

## Current Project Status

- Visibility: public (`https://github.com/pajamadot/realtime-avatars`)
- Web stack: Next.js `16.1.6` + TypeScript + Tailwind v4
- Build status: `web/` production build passes (`npm run build`)
- Research feeds:
  - `web/app/data/research-feed.json` (arXiv feed)
  - `web/app/data/tooling-feed.json` (GitHub tooling feed)
- Active skill automation under `.claude/skills/` for MetaHuman, modality research, and Gaussian video-wall evolution

## Key Implemented Areas

### Web Experience

- Learning pages: `web/app/learn/*`
- Slides system: `web/app/slides/*`
- Demos:
  - `/rapport` (MetaHuman control + realtime talk)
  - `/livekit` (LiveKit streaming demo)
  - `/gaussian-video-wall` (modal YouTube video wall)

### API Endpoints

- `web/app/api/metahuman/control/route.ts`
- `web/app/api/livekit/token/route.ts`
- `web/app/api/openai/realtime/client-secret/route.ts`

### MetaHuman Control Path

- Unreal plugin: `metahuman/avatar01/Plugins/PajamaRealtimeControl/Source/PajamaRealtimeControl/*`
- Bridge service: `metahuman/editor-bridge/server.mjs`
- Web panels:
  - `web/app/components/MetaHumanEditorControlPanel.tsx`
  - `web/app/components/MetaHumanRealtimeTalkPanel.tsx`
- Runbook: `metahuman/UE57_REALTIME_E2E.md`

### Skill-Generated Architecture Artifacts

- Skills root: `.claude/skills/`
- MetaHuman architecture/dependency outputs:
  - `web/public/docs/metahuman-architecture-latest.json`
  - `web/public/docs/metahuman-dependency-graph-latest.json`
  - `web/public/docs/metahuman-dependency-graph-latest.mmd`
- Full-modality outputs:
  - `web/public/docs/full-modality-research-latest.json`
  - `web/public/docs/full-modality-architecture-latest.json`
- Gaussian video wall outputs:
  - `web/app/data/gaussian-video-wall.json`
  - `web/public/docs/gaussian-video-wall-latest.json`

## Local Development

### Run web app

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

### Refresh research/tooling feeds

```bash
cd web
npm run feeds:update
```

### Run evolver skills

```bash
python .claude/skills/metahuman-evolver/scripts/evolve_metahuman.py --max-api-samples 30
python .claude/skills/full-modality-social-evolver/scripts/evolve_social_modality_research.py
python .claude/skills/gaussian-youtube-video-wall-evolver/scripts/evolve_gaussian_video_wall.py
```

## Automation

- Workflow: `.github/workflows/update-research-feed.yml`
- Daily scheduled refresh updates feed JSONs and commits diffs automatically

## Notes

- This is an active iteration repo, not a packaged product release.
- Unreal and MetaHuman paths require local UE setup and valid runtime credentials.
- Skill-generated docs under `web/public/docs/` are the latest architecture/research snapshots.
