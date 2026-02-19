---
name: slide-research-proofreader-evolver
description: Use this skill when you need to proofread research-focused slides, validate claims against primary-source links, avoid hallucinated metrics, and persist repeatable evidence-check history for future cycles.
---

# Slide Research Proofreader Evolver

## Overview

Run repeatable evidence-audit cycles for research slides in `web/app/slides/SlidesDeck.tsx`.
Each cycle verifies source-link coverage, emits pass/warn diagnostics per slide, and persists artifacts so later runs can detect regressions or recovery.

## Run Cycle

1. Run one cycle:
- `python .claude/skills/slide-research-proofreader-evolver/scripts/evolve_slide_research_proofread.py`

2. Useful options:
- `--min-primary-sources 2` (minimum primary links required per target slide)
- `--strict` (exit non-zero if any target slide is warned)
- `--no-publish` (skip mirror output in `web/public/docs`)

## What It Checks

- Target research slides:
  - `SlideThreeApproaches`
  - `SlideMetahumanHow`
  - `SlideMetahumanIdentityResponse`
  - `SlideGenerativeHow`
  - `SlideGenerativeIdentityResponse`
  - `SlideGenerativeMechanism`
  - `SlideGenerativeResearch`
  - `SlideGaussianHow`
  - `SlideGaussianIdentityResponse`
  - `SlideGaussianMechanism`
  - `SlideGaussianCovariance`
  - `SlideSignalsInteraction`
  - `SlideCapabilityMatrix`
  - `SlideAudio2FaceBuildingBlocks`
  - `SlideWhereIntelligenceLives`
  - `SlideResearchFrontier`
  - `SlideConvergenceUpdated`
- Presence of `SlideEvidenceStrip`.
- Count of links from primary-source domains:
  - `arxiv.org`
  - `dev.epicgames.com`
  - `github.com`
  - `docs.nvidia.com`
  - `developer.nvidia.com`

## Outputs

Local skill outputs:
- `.claude/skills/slide-research-proofreader-evolver/references/latest-claim-check.json`
- `.claude/skills/slide-research-proofreader-evolver/references/latest-report.md`
- `.claude/skills/slide-research-proofreader-evolver/references/progress.md`
- `.claude/skills/slide-research-proofreader-evolver/references/history/claim-check-*.json`
- `.claude/skills/slide-research-proofreader-evolver/references/history/report-*.md`
- `.claude/skills/slide-research-proofreader-evolver/state.json`
- `.claude/skills/slide-research-proofreader-evolver/events.jsonl`

Published mirrors (unless `--no-publish`):
- `web/public/docs/slide-proofread-latest.json`
- `web/public/docs/slide-proofread-latest.md`

## Self-Evolving Contract

Each cycle must:
- Load previous state and previous claim-check result.
- Compute delta (`newly_warned`, `recovered`) at slide level.
- Persist updated state, event log, and history snapshots.
- Preserve prior events/history unless explicitly asked to clean them.
