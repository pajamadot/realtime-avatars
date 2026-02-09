# Real-Time Avatars - Project Guide

## What This Is
A living research website comparing four approaches to building real-time digital humans:
MetaHuman (graphics), Generative Video (diffusion), Gaussian Splatting (neural 3D), and Streaming Avatars (WebRTC).

## Tech Stack
- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS 4 + custom design system in `globals.css`
- **3D**: Three.js + React Three Fiber + Luma AI WebGL
- **Streaming**: LiveKit + WebRTC
- **AI**: FAL.ai (image gen), OpenAI Realtime (voice)
- **Deploy**: Vercel

## Key Directories
- `web/app/page.tsx` — Main survey page (~1170 lines)
- `web/app/learn/` — Interactive learning tracks (4 methods + end-to-end)
- `web/app/components/` — Shared components + UI primitives
- `web/app/data/` — Auto-generated JSON feeds (arXiv + GitHub)
- `web/scripts/` — Feed updater scripts (Node.js)
- `agents/` — Python LiveKit avatar agent (Hedra)
- `.github/workflows/` — Daily feed update automation

## Design System
Warm editor theme with method-specific colors:
- MetaHuman: `--color-metahuman` (purple)
- Generative: `--color-generative` (sage green)
- Gaussian: `--color-gaussian` (burnt orange)
- Streaming: `--color-streaming` (dusty blue)

## Commands
```bash
npm run dev              # Local dev server
npm run build            # Production build (always run before commit)
npm run feeds:refresh    # Update research + tooling feeds + build
```

## Conventions
- No emojis in code or UI — use Lucide icons
- Commit style: imperative mood, 1-2 sentence summary
- Always `npm run build` before committing to catch errors
- Prefer editing existing files over creating new ones

## Self-Evolution
This repo has a self-evolving skill at `.claude/skills/evolve/`.
Run `/evolve` to trigger an evolution cycle that analyzes the site
and makes targeted improvements.
