# AGENTS.md

This file is the agent entrypoint for repository navigation and execution discipline.

## Start Here

1. `README.md` - project overview and runtime entrypoints.
2. `ARCHITECTURE.md` - layered architecture and dependency invariants.
3. `ITERATION-MEGA-PROMPT.md` - current iteration strategy and priorities.
4. `docs/design-docs/index.md` - durable design decisions and rationale.
5. `docs/exec-plans/README.md` - execution planning format and lifecycle.

## Working Protocol (Harness-Inspired)

1. Load map and constraints:
- `AGENTS.md`
- `ARCHITECTURE.md`
- relevant plan in `docs/exec-plans/active/`

2. Execute against an explicit plan:
- use one active plan file per coherent change stream
- keep plans short, testable, and linked to touched paths

3. Implement in small, auditable batches:
- make minimal coherent changes
- verify with build/lint/tests where available

4. Close the loop:
- update relevant docs when structure or behavior changes
- move completed plans to `docs/exec-plans/completed/`
- log follow-up debt in `docs/exec-plans/tech-debt-tracker.md`

## Repository Map

- `web/` - Next.js application, API routes, slides, learning surfaces.
- `agents/` - LiveKit and avatar agent runtimes.
- `workers/` - support workers and token services.
- `metahuman/` - Unreal project assets, bridge, architecture dossiers.
- `gaussian-avatar/` - gaussian avatar runtime assets and configs.
- `.claude/skills/` - local skill automation and evolvers.
- `docs/` - design docs, execution plans, references, quality/reliability/security docs.

## Source-of-Truth Rules

- Architecture contracts live in `ARCHITECTURE.md`.
- Durable design reasoning lives in `docs/design-docs/`.
- Active work plans live in `docs/exec-plans/active/`.
- Research snapshots intended for website rendering live in `web/public/docs/`.

## Required Updates for Structural Changes

If folder layout, boundaries, or runtime wiring changes, update all relevant files in the same change:

- `ARCHITECTURE.md`
- `README.md`
- impacted `docs/design-docs/*`
- impacted `docs/exec-plans/*`

