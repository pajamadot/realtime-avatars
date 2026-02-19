---
name: realtime-gaussian-research-evolver
description: Use this skill when you need deep, repeatable research on realtime Gaussian avatars, continuous ArXiv/GitHub tracking, and auto-updated conclusions in deep-research-Realtime-Gaussian Avatars.md.
---

# Realtime Gaussian Research Evolver

## Overview

Run repeatable research cycles for realtime Gaussian avatar systems.  
Each cycle:
- pulls current evidence from ArXiv and GitHub,
- tracks deltas across cycles,
- updates a canonical "how it works" conclusion,
- persists state/events/history for self-evolution.

The primary authored output target is:
- `deep-research-Realtime-Gaussian Avatars.md`

## Run Cycle

1. Run one cycle:
- `python .claude/skills/realtime-gaussian-research-evolver/scripts/evolve_realtime_gaussian_research.py`

2. Useful options:
- `--max-arxiv-per-query 12`
- `--max-github-search 12`
- `--max-papers 40`
- `--no-publish` (skip publishing to `web/public/docs`)

## Outputs

Local skill outputs:
- `.claude/skills/realtime-gaussian-research-evolver/references/latest-research.json`
- `.claude/skills/realtime-gaussian-research-evolver/references/latest-report.md`
- `.claude/skills/realtime-gaussian-research-evolver/references/progress.md`
- `.claude/skills/realtime-gaussian-research-evolver/references/history/research-*.json`
- `.claude/skills/realtime-gaussian-research-evolver/state.json`
- `.claude/skills/realtime-gaussian-research-evolver/events.jsonl`

Published mirrors (unless `--no-publish`):
- `web/public/docs/realtime-gaussian-research-latest.json`
- `web/public/docs/realtime-gaussian-research-latest.md`

Primary narrative output:
- `deep-research-Realtime-Gaussian Avatars.md` (upserted conclusion section)

## Self-Evolving Contract

Each cycle must:
- load `state.json` and prior `latest-research.json` when present,
- compute newly discovered papers/repos since the previous cycle,
- derive updated focus terms from new evidence,
- persist updates in `state.json`,
- append an event line to `events.jsonl`,
- append a human-readable run log in `references/progress.md`.

Do not delete history/events unless explicitly requested.

