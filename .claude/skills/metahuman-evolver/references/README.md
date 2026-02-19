# MetaHuman Evolver References

This folder is generated/updated by `scripts/evolve_metahuman.py`.

## Files

- `latest-scan.json`: most recent structured scan payload.
- `latest-summary.md`: markdown architecture summary for the latest cycle.
- `latest-architecture.json`: normalized architecture snapshot for web rendering.
- `latest-dependency-graph.json`: graph payload (plugin/module nodes + edges).
- `latest-dependency-graph.mmd`: Mermaid plugin-level graph.
- `latest-official-watch.json`: official MetaHuman docs + Epic Unreal repo watch snapshot.
- `progress.md`: append-only cycle diary.
- `history/scan-*.json`: immutable snapshots by timestamp.
- `history/architecture-*.json`: immutable architecture snapshots by timestamp.
- `history/dependency-graph-*.json` + `.mmd`: immutable graph snapshots by timestamp.
- `history/official-watch-*.json`: immutable official-watch snapshots by timestamp.

## Typical Command

```bash
python .claude/skills/metahuman-evolver/scripts/evolve_metahuman.py
```

## Publish Output

By default, each run mirrors docs to:
- `web/public/docs/metahuman-evolution-latest.md`
- `web/public/docs/metahuman-evolution-latest.json`
- `web/public/docs/metahuman-architecture-latest.json`
- `web/public/docs/metahuman-dependency-graph-latest.json`
- `web/public/docs/metahuman-dependency-graph-latest.mmd`
- `web/public/docs/metahuman-official-watch-latest.json`
- `web/public/docs/metahuman-evolution-progress.md`

Use `--no-publish` to keep outputs local to this skill directory only.
