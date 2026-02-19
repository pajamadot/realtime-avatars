---
name: multimodal-io-research-evolver
description: Use this skill when you need deep, repeatable multimodal inputs/outputs research across MetaHuman, video generation, and Gaussian splatting, with auto-updated conclusions in deep-research-multimodal_inputs_outputs.md.
---

# Multimodal I/O Research Evolver

## Overview

Run repeatable research cycles to keep multimodal pipeline claims current for the three avatar approaches:
- MetaHuman
- Video Generation
- Gaussian Splatting

Each cycle:
- refreshes evidence through the full-modality social research skill,
- distills method-level I/O and coupling support,
- upserts a canonical conclusion section into `deep-research-multimodal_inputs_outputs.md`,
- persists state/events/history for self-evolution.

## Run Cycle

1. Run one cycle:
- `python .claude/skills/multimodal-io-research-evolver/scripts/evolve_multimodal_io_research.py`

2. Useful options:
- `--skip-core-refresh` (reuse latest full-modality outputs)
- `--max-arxiv-per-query 12`
- `--max-arxiv-total 80`
- `--max-github-per-query 12`
- `--max-github-total 80`
- `--no-publish` (skip writing `web/public/docs` mirrors)

## Outputs

Local skill outputs:
- `.claude/skills/multimodal-io-research-evolver/references/latest-research.json`
- `.claude/skills/multimodal-io-research-evolver/references/latest-report.md`
- `.claude/skills/multimodal-io-research-evolver/references/progress.md`
- `.claude/skills/multimodal-io-research-evolver/references/history/research-*.json`
- `.claude/skills/multimodal-io-research-evolver/references/history/report-*.md`
- `.claude/skills/multimodal-io-research-evolver/state.json`
- `.claude/skills/multimodal-io-research-evolver/events.jsonl`

Published mirrors (unless `--no-publish`):
- `web/public/docs/multimodal-io-research-latest.md`
- `web/public/docs/multimodal-io-research-latest.json`
- `web/public/docs/multimodal-io-claim-matrix-latest.json`
- `web/public/docs/multimodal-io-research-progress.md`

Primary narrative output:
- `deep-research-multimodal_inputs_outputs.md` (upserted conclusion section)

## Self-Evolving Contract

Each cycle must:
- load `state.json` and prior `latest-research.json` when present,
- refresh or reuse the latest full-modality evidence corpus,
- compute new ArXiv/GitHub deltas versus previous cycle,
- append events into `events.jsonl`,
- append a human-readable run log into `references/progress.md`,
- persist updated state for next cycle.

Do not delete history/events unless explicitly requested.

