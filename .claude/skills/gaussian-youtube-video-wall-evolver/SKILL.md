---
name: gaussian-youtube-video-wall-evolver
description: Use this skill when you need to continuously collect the latest YouTube research/demo videos for realtime Gaussian avatar systems, publish a curated video-wall dataset, and keep a self-evolving memory of queries/channels over repeated cycles.
---

# Gaussian YouTube Video Wall Evolver

## Overview

Run repeatable discovery cycles for realtime Gaussian avatar demos on YouTube, then publish a curated wall dataset used by both slides and website pages.

This skill:
- Queries YouTube search result pages for Gaussian-avatar demo terms.
- Extracts video entries from `ytInitialData`.
- Filters to realtime avatar-relevant demos.
- Updates a self-evolving state with better focus terms and channel priors.
- Publishes data for UI embedding and modal playback.

## Run Cycle

1. Run one cycle:
- `python .claude/skills/gaussian-youtube-video-wall-evolver/scripts/evolve_gaussian_video_wall.py`

2. Useful options:
- `--max-videos 24`
- `--max-per-query 18`
- `--no-publish` to keep outputs local only

## Outputs

Local skill outputs:
- `.claude/skills/gaussian-youtube-video-wall-evolver/references/latest-videos.json`
- `.claude/skills/gaussian-youtube-video-wall-evolver/references/latest-report.md`
- `.claude/skills/gaussian-youtube-video-wall-evolver/references/progress.md`
- `.claude/skills/gaussian-youtube-video-wall-evolver/references/history/videos-*.json`
- `.claude/skills/gaussian-youtube-video-wall-evolver/state.json`
- `.claude/skills/gaussian-youtube-video-wall-evolver/events.jsonl`

Published mirrors (unless `--no-publish`):
- `web/app/data/gaussian-video-wall.json`
- `web/public/docs/gaussian-video-wall-latest.json`
- `web/public/docs/gaussian-video-wall-latest.md`

## Self-Evolving Contract

Each cycle must:
- Load previous `state.json` and `latest-videos.json` if present.
- Compute and persist delta of newly surfaced videos.
- Derive new focus terms from fresh titles/channels.
- Persist focus terms and channel priors to `state.json`.
- Append cycle record to `events.jsonl` and `progress.md`.

Do not delete history/events unless explicitly requested.
