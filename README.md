# realtime-avatars

Public research/engineering repository for comparing and operating real-time digital avatar pipelines:

1. MetaHuman / Unreal graphics pipeline
2. Streaming avatar infrastructure (WebRTC + LiveKit)
3. Neural Gaussian splatting track
4. Generative video avatar track

## Current Status (2026-02-19)

- Repository visibility: `PUBLIC` (`https://github.com/pajamadot/realtime-avatars`).
- Web app: Next.js `16.1.6` with TypeScript and Tailwind v4.
- Build status: `npm run build` in `web/` passes.
- Living feeds:
  - arXiv research feed: `web/app/data/research-feed.json`
  - GitHub tooling feed: `web/app/data/tooling-feed.json`
- MetaHuman E2E control path is implemented and wired to `/rapport`.
- MetaHuman source intelligence skill is implemented at `.claude/skills/metahuman-evolver`.

## What Is Implemented

### 1) Web experience

- Main site and method tracks under `web/app/learn/*`.
- Live demo pages:
  - `/rapport` (MetaHuman control + realtime talk UI)
  - `/livekit` (LiveKit streaming demo)
- APIs:
  - `web/app/api/metahuman/control/route.ts`
  - `web/app/api/livekit/token/route.ts`
  - `web/app/api/openai/realtime/client-secret/route.ts`

### 2) MetaHuman local control path

- Unreal plugin:
  - `metahuman/avatar01/Plugins/PajamaRealtimeControl/Source/PajamaRealtimeControl/*`
- Bridge service:
  - `metahuman/editor-bridge/server.mjs`
- Web control panels:
  - `web/app/components/MetaHumanEditorControlPanel.tsx`
  - `web/app/components/MetaHumanRealtimeTalkPanel.tsx`

Detailed runbook: `metahuman/UE57_REALTIME_E2E.md`

### 3) MetaHuman architecture + dependency graph generation

- Skill:
  - `.claude/skills/metahuman-evolver/SKILL.md`
  - `.claude/skills/metahuman-evolver/scripts/evolve_metahuman.py`
- Default scan scope:
  - `Engine/Plugins/MetaHuman/*`
  - `Engine/Plugins/Experimental/MetaHuman/*`
  - `Engine/Plugins/Animation/LiveLink`
  - `Engine/Plugins/Animation/RigLogic`
  - `Engine/Plugins/Animation/DNACalib`
- Generated artifacts (local skill memory):
  - `.claude/skills/metahuman-evolver/references/latest-scan.json`
  - `.claude/skills/metahuman-evolver/references/latest-architecture.json`
  - `.claude/skills/metahuman-evolver/references/latest-dependency-graph.json`
  - `.claude/skills/metahuman-evolver/references/latest-dependency-graph.mmd`
- Published artifacts (web-consumed):
  - `web/public/docs/metahuman-evolution-latest.json`
  - `web/public/docs/metahuman-architecture-latest.json`
  - `web/public/docs/metahuman-dependency-graph-latest.json`
  - `web/public/docs/metahuman-dependency-graph-latest.mmd`

The architecture page renders these generated artifacts directly:
- `web/app/learn/metahuman/architecture/page.tsx`

## Local Development

### Web app

```bash
cd web
npm install
npm run dev
```

Production build check:

```bash
cd web
npm run build
```

### Refresh living feeds

```bash
cd web
npm run feeds:update
```

### Run MetaHuman evolver cycle

```bash
python .claude/skills/metahuman-evolver/scripts/evolve_metahuman.py --max-api-samples 30
```

## Automation

- Feed refresh workflow: `.github/workflows/update-research-feed.yml`
- Scheduled daily run updates research/tooling feed JSON and commits changes when diffs exist.

## Notes and Boundaries

- This repo is an active research/iteration workspace, not a packaged production product.
- Unreal/MetaHuman control requires local UE setup and valid runtime secrets/tokens.
- Generated docs and skill snapshots are source-of-truth for current MetaHuman architecture status.
