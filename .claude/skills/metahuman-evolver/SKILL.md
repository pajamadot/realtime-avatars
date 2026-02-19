---
name: metahuman-evolver
description: Use this skill when a task asks for deeper MetaHuman understanding from Unreal source, architecture/module/function extraction, continuous MetaHuman documentation refreshes, or cumulative memory across repeated analysis cycles.
---

# MetaHuman Evolver

## Overview

Run repeatable source-analysis cycles over Unreal Engine MetaHuman plugins and adjacent RigLogic/DNACalib code, then persist what was learned so each cycle builds on prior runs.  
Each cycle also watches official Epic MetaHuman documentation endpoints and Epic's Unreal Engine GitHub repo update feeds.

This skill is for deep-dive architecture and implementation mapping, not for one-off superficial summaries.

## When To Use

Use this skill when the user asks for any of the following:
- Deep MetaHuman architecture/module/function implementation details from Unreal source.
- Repeated digging across `G:\UE\UnrealEngine\Engine\Plugins\MetaHuman` and related plugins.
- Ongoing "keep evolving" behavior with persistent memory/progress.
- Refreshing/publishing MetaHuman complementary docs for the website.

## Core Workflow

Follow this sequence every cycle:

1. **Load Memory First**
- Read:
  - `.claude/skills/metahuman-evolver/state.json`
  - `.claude/skills/metahuman-evolver/events.jsonl`
  - `.claude/skills/metahuman-evolver/references/progress.md`
- Determine prior cycle count, last Unreal root, and previous deltas.

2. **Run One Evolution Cycle**
- Execute:
  - `python .claude/skills/metahuman-evolver/scripts/evolve_metahuman.py`
- Optional overrides:
  - `--ue-root <path>` to force a specific Unreal source root.
  - `--extra-plugin <path-or-relative>` repeatable for additional plugin dirs.
  - `--max-api-samples <n>` to increase or reduce API symbol sampling.
  - `--no-publish` to skip mirror output into `web/public/docs`.
  - `GITHUB_TOKEN` or `GH_TOKEN` env var (optional) to authenticate Epic Unreal GitHub API checks for private-repo access.

3. **Review Outputs**
- Core outputs:
  - `.claude/skills/metahuman-evolver/references/latest-scan.json`
  - `.claude/skills/metahuman-evolver/references/latest-summary.md`
  - `.claude/skills/metahuman-evolver/references/latest-architecture.json`
  - `.claude/skills/metahuman-evolver/references/latest-dependency-graph.json`
  - `.claude/skills/metahuman-evolver/references/latest-dependency-graph.mmd`
  - `.claude/skills/metahuman-evolver/references/latest-official-watch.json`
  - `.claude/skills/metahuman-evolver/references/progress.md`
- Published mirrors (unless `--no-publish`):
  - `web/public/docs/metahuman-evolution-latest.md`
  - `web/public/docs/metahuman-evolution-latest.json`
  - `web/public/docs/metahuman-architecture-latest.json`
  - `web/public/docs/metahuman-dependency-graph-latest.json`
  - `web/public/docs/metahuman-dependency-graph-latest.mmd`
  - `web/public/docs/metahuman-official-watch-latest.json`
  - `web/public/docs/metahuman-evolution-progress.md`

4. **Report Delta, Not Just Snapshot**
- Always report:
  - New/removed plugins
  - New/removed modules
  - Changed modules count
  - Where implementation details expanded (dependencies, classes, methods)

5. **If User Says "Keep Evolving"**
- Run up to 3 cycles in one response unless blocked.
- After each cycle, check whether deltas are still meaningful.
- Stop early if no meaningful new deltas are found.

## Source Scope

By default, the runner scans:
- `Engine/Plugins/MetaHuman/*`
- `Engine/Plugins/Experimental/MetaHuman/*`
- `Engine/Plugins/Animation/LiveLink`
- `Engine/Plugins/Animation/RigLogic`
- `Engine/Plugins/Animation/DNACalib`

Unreal root resolution priority:
1. `--ue-root`
2. `UE_SOURCE_ROOT` or `UNREAL_ENGINE_SOURCE_ROOT` env vars
3. `metahuman/UNREAL_ENGINE_SOURCE_ROOT.txt`
4. `G:\UE\UnrealEngine`

## Memory And Persistence Contract

Every cycle must append machine-readable and human-readable memory:
- `events.jsonl`: append one event per run.
- `state.json`: update cycle count, last run metadata, known plugin/module sets.
- `references/progress.md`: append narrative run notes.
- `references/history/scan-*.json`: immutable scan snapshot per cycle.
- `references/history/architecture-*.json`: immutable architecture snapshot per cycle.
- `references/history/dependency-graph-*.json` and `.mmd`: immutable graph snapshots per cycle.
- `references/history/official-watch-*.json`: immutable official-source watch snapshots per cycle.

Do not delete prior events or history unless explicitly instructed.

## Output Expectations

Prioritize implementation-level detail grounded in source:
- Plugin/module graph and dependency relationships from `.Build.cs` and `.uplugin`.
- Generated plugin dependency graph artifacts (`.json` + `.mmd`) for webpage rendering.
- Sample classes, namespaces, and methods from headers/sources.
- One-line doc extraction from `ReadMe`/`README`/`*.md`/`*.txt`.
- Official-watch status:
  - MetaHuman docs page reachability/title signals from Epic docs.
  - Epic Unreal Engine repo feed availability + recent release/tag/commit metadata when accessible.
- Delta vs previous run.

When presenting results to the user, include concrete file paths and avoid unstated assumptions.
