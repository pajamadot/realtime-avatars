# AGENTS.md

Agent entrypoint for repository navigation and execution discipline.

## Start Here

1. `README.md` - current project status and runtime entrypoints.
2. `ITERATION-MEGA-PROMPT.md` - current evolution principles and cycle contract.
3. `web/app/learn/ARCHITECTURE.md` - learn-surface architecture context.
4. `metahuman/UE57_METAHUMAN_ARCHITECTURE.md` - MetaHuman subsystem architecture.
5. Relevant skill docs under `.claude/skills/*/SKILL.md`.

## Working Protocol

1. Load map and constraints:
- `AGENTS.md`
- `README.md`
- `ITERATION-MEGA-PROMPT.md`
- subsystem docs for touched scope

2. Execute against an explicit change stream:
- keep changes scoped and auditable
- prefer one coherent objective per commit
- avoid mixing unrelated subsystem edits

3. Implement in small batches:
- make minimal coherent edits
- verify with `web` build/lint/tests where relevant
- do not revert unrelated workspace changes

4. Close the loop:
- update affected docs in the same change
- summarize file-level deltas and validation
- capture follow-up debt explicitly

## Repository Map

- `web/` - Next.js app, slides, learn tracks, demos, API routes, published docs snapshots
- `metahuman/` - UE 5.7 project, plugin, bridge service, runtime docs
- `agents/` - LiveKit Hedra avatar agent runtime
- `workers/` - Cloudflare worker token service
- `gaussian-avatar/` - Dockerized Gaussian avatar runtime stack
- `.claude/skills/` - evolvers and persistent skill state/history
- `research/` - supporting research notes
- `secrets/` - local secret-loading support

## Source-of-Truth Rules

- Web behavior and routes: `web/app/*`
- Slide deck source: `web/app/slides/SlidesDeck.tsx`
- Evolution policy and cycle gates: `ITERATION-MEGA-PROMPT.md`
- Skill outputs intended for site rendering: `web/public/docs/*`
- MetaHuman runtime contract: `metahuman/UE57_REALTIME_E2E.md`

## Scan Hygiene

- Exclude environment/build-heavy trees when scanning unless needed:
  - `agents/**/.venv/**`
  - `metahuman/avatar01/DerivedDataCache/**`
  - `metahuman/avatar01/Intermediate/**`
  - `metahuman/avatar01/Saved/**`
  - `web/.next/**`
- Prefer targeted `rg` queries over recursive full dumps.

## Required Updates for Structural Changes

If boundaries, folder layout, or runtime wiring changes, update all relevant files in the same change:

- `README.md`
- `AGENTS.md`
- `ITERATION-MEGA-PROMPT.md`
- impacted subsystem architecture docs (for example `web/app/learn/ARCHITECTURE.md`, `metahuman/UE57_METAHUMAN_ARCHITECTURE.md`)
