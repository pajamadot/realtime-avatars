---
name: full-modality-social-evolver
description: Use this skill when you need deep verification of slide-5 interaction claims, continuous ArXiv/GitHub research on real-time social avatars, and self-evolving architecture guidance across MetaHuman, video generation, and Gaussian splatting.
---

# Full Modality Social Evolver

## Overview

This skill runs repeatable research cycles to keep a full-modality social avatar stack current:
- Verifies `https://www.realtime-avatars.com/slides/5` against local source.
- Audits signal support claims (inputs, outputs, coupling) for the three techniques.
- Pulls current ArXiv and GitHub evidence.
- Builds a unified architecture + dependency graph for realtime social interaction and narrative loops.
- Self-evolves by extracting new focus terms from each cycle and using them in the next cycle.

## When To Use

Use this skill when the user asks for:
- Deep verification of interaction-modality claims in slide 5.
- Research-backed connection architecture across MetaHuman, video generation, and Gaussian splatting.
- Ongoing discovery of state-of-the-art papers/repos for realtime performance and narrative/social behavior.
- A persistent self-evolving research loop with audit history.

## Run Cycle

1. Run one cycle:
- `python .claude/skills/full-modality-social-evolver/scripts/evolve_social_modality_research.py`

2. Useful options:
- `--slide-url <url>`
- `--slide-source <path-relative-to-repo-root>`
- `--max-arxiv-per-query <n>`
- `--max-github-per-query <n>`
- `--no-publish` to keep outputs local.

3. Auth:
- Preferred: set `GITHUB_TOKEN` or `GH_TOKEN`.
- Fallback: if `gh` CLI is logged in, the runner auto-uses `gh auth token` for GitHub API calls.

## Outputs

Local skill outputs:
- `.claude/skills/full-modality-social-evolver/references/latest-research.json`
- `.claude/skills/full-modality-social-evolver/references/latest-report.md`
- `.claude/skills/full-modality-social-evolver/references/latest-claim-check.json`
- `.claude/skills/full-modality-social-evolver/references/latest-architecture.json`
- `.claude/skills/full-modality-social-evolver/references/latest-dependency-graph.json`
- `.claude/skills/full-modality-social-evolver/references/latest-dependency-graph.mmd`
- `.claude/skills/full-modality-social-evolver/references/progress.md`
- `.claude/skills/full-modality-social-evolver/references/history/*`
- `.claude/skills/full-modality-social-evolver/state.json`
- `.claude/skills/full-modality-social-evolver/events.jsonl`

Published mirrors (unless `--no-publish`):
- `web/public/docs/full-modality-research-latest.md`
- `web/public/docs/full-modality-research-latest.json`
- `web/public/docs/full-modality-claim-check-latest.json`
- `web/public/docs/full-modality-architecture-latest.json`
- `web/public/docs/full-modality-dependency-graph-latest.json`
- `web/public/docs/full-modality-dependency-graph-latest.mmd`
- `web/public/docs/full-modality-research-progress.md`

## Self-Evolving Contract

Each cycle must:
- Load `state.json` and prior `latest-research.json`.
- Compute delta of newly discovered ArXiv entries and GitHub repos.
- Derive new focus terms from fresh papers/repos.
- Persist updated focus terms into `state.json` for next cycle query expansion.
- Append an event to `events.jsonl` and append a narrative summary to `progress.md`.

Do not delete history/events unless explicitly asked.
