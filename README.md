Real-time digital humans: a living comparison site for four technical routes:

1) MetaHuman / graphics pipeline
2) Generative video models (diffusion/transformers)
3) Neural Gaussian splatting (3DGS)
4) Streaming avatars / infrastructure (WebRTC + backend)

The website includes an auto-updating "Living Research Feed" that pulls recent papers from arXiv and renders them on the homepage and per-method sections.

## Local dev

From `web/`:

```bash
npm install
npm run dev
```

## Research feed (auto-evolving)

The feed is generated into `web/app/data/research-feed.json` using this config:

- `web/app/data/research-feed.config.json`

Update locally:

```bash
cd web
npm run research:update
```

This will fetch arXiv results, filter for relevance, tag items, and rewrite the JSON used by the UI.

## Automation

GitHub Actions runs the updater on a schedule and auto-commits changes (plus a build safety check):

- `.github/workflows/update-research-feed.yml`
