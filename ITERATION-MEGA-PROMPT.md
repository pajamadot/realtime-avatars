# Repository Iteration Mega Prompt

Use this prompt for deterministic repo evolution cycles in `realtime-avatars`.

This version reflects the current repository shape (2026-02-20).

---

## Evolution Principles

1. **Evidence before edits**
- Verify claims against current source files and primary references.
- Do not preserve stale wording just because it existed in previous cycles.

2. **Small, auditable mutations**
- Prefer focused changes over broad rewrites.
- Keep each commit scoped to one coherent objective.

3. **Cycle memory is mandatory**
- Read and update `state.json`, `events.jsonl`, latest outputs, and progress logs for active skills.
- Never delete history files unless explicitly requested.

4. **Published artifacts must stay in sync**
- If a skill updates local references, mirror the published snapshot in `web/public/docs/`.

5. **Validation gates are required**
- Run `npm run build` in `web/` at defined checkpoints.
- Do not push failing builds.

6. **No hidden drift**
- Update operational docs (`README.md`, `AGENTS.md`, this file) when process or structure changes.

---

## Current Repository Reality

- Primary app: `web/` (Next.js 16 + React 19 + TS + Tailwind v4)
- Slide source of truth: `web/app/slides/SlidesDeck.tsx` (`TOTAL_SLIDES = 35`)
- Learn architecture file: `web/app/learn/ARCHITECTURE.md`
- MetaHuman architecture file: `metahuman/UE57_METAHUMAN_ARCHITECTURE.md`
- Skill system: `.claude/skills/*`
- Published research/proof outputs: `web/public/docs/*`
- No active top-level `docs/exec-plans` structure in this repo currently

---

## Cycle Contract

Run each cycle in this order:

1. **Load state**
- Read `git status --short`
- Read active skill state/events/progress/latest outputs

2. **Collect signals**
- Product/UI: slide and route behavior (`web/app/*`)
- Research: latest ArXiv/GitHub deltas from skill outputs
- Runtime: API/service path drift in `metahuman/`, `workers/`, `agents/`

3. **Select mutation**
- Choose 1-3 concrete changes with measurable impact
- Prefer backwards-compatible edits

4. **Implement**
- Apply minimal coherent patch set
- Keep docs and source aligned

5. **Validate**
- Build/lint/test touched scope
- Re-run relevant skill(s) if claim-driven content changed

6. **Publish and persist**
- Update `web/public/docs/*` mirrors when applicable
- Append `events.jsonl`, update `state.json`, append progress markdown

7. **Report**
- Summarize exact files changed
- Record validation output
- List remaining risks/next mutation options

---

## Active Skill Matrix

Use these skill runners as building blocks:

- `metahuman-evolver`
  - `python .claude/skills/metahuman-evolver/scripts/evolve_metahuman.py --max-api-samples 30`
- `full-modality-social-evolver`
  - `python .claude/skills/full-modality-social-evolver/scripts/evolve_social_modality_research.py`
- `multimodal-io-research-evolver`
  - `python .claude/skills/multimodal-io-research-evolver/scripts/evolve_multimodal_io_research.py --slide-url https://www.realtime-avatars.com/slides/35 --slide-source web/app/slides/SlidesDeck.tsx`
- `realtime-gaussian-research-evolver`
  - `python .claude/skills/realtime-gaussian-research-evolver/scripts/evolve_realtime_gaussian_research.py`
- `gaussian-youtube-video-wall-evolver`
  - `python .claude/skills/gaussian-youtube-video-wall-evolver/scripts/evolve_gaussian_video_wall.py`
- `slide-research-proofreader-evolver`
  - `python .claude/skills/slide-research-proofreader-evolver/scripts/evolve_slide_research_proofread.py --min-primary-sources 2`

---

## Multi-Round Evolution Mode

For long evolution runs (for example 100 rounds):

1. Run content/research/proof cycles each round.
2. Run full core refresh on a fixed cadence (for example every 5 rounds).
3. Run `cd web && npm run build` at checkpoint cadence (recommended every 20 rounds).
4. Commit and push at each build checkpoint.
5. Keep commit messages explicit by round window.

Recommended checkpoint commit format:
- `chore(evolution): rounds 1-20 article and slide updates`

---

## Quality Gates

A cycle is complete only if all gates pass:

- No unresolved build failures in touched scope
- Claim/proofread warnings are reviewed and resolved or explicitly accepted
- State/events/progress files updated for each executed skill
- Published mirror docs updated when local reference outputs changed
- Repo remains in a clean/intentional git state

---

## Auth and Rate Limits

- Prefer `GITHUB_TOKEN` or `GH_TOKEN` for GitHub API-backed research.
- If `gh` CLI auth exists, inject token when needed:
  - PowerShell: `$env:GITHUB_TOKEN = gh auth token`
- Record fallback behavior when rate-limited.

---

## End-of-Cycle Output Template

Always report:

- **What changed**: files and behavior deltas
- **Validation**: build/test/lint/skill results
- **Evidence updates**: newly added/removed/recovered claims
- **Risk and next step**: highest-value next mutation
