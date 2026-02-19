#!/usr/bin/env python3
"""
Self-evolving deep research runner for realtime Gaussian avatars.

Cycle responsibilities:
1) Pull fresh ArXiv evidence for realtime Gaussian avatar queries.
2) Pull curated + searched GitHub repos.
3) Persist machine-readable outputs, delta, and evolving focus terms.
4) Upsert a clean "how it works" conclusion into:
   deep-research-Realtime-Gaussian Avatars.md
"""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


SKILL_DIR = Path(__file__).resolve().parents[1]
REPO_ROOT = Path(__file__).resolve().parents[4]
REF_DIR = SKILL_DIR / "references"
HISTORY_DIR = REF_DIR / "history"
STATE_PATH = SKILL_DIR / "state.json"
EVENTS_PATH = SKILL_DIR / "events.jsonl"
LATEST_JSON_PATH = REF_DIR / "latest-research.json"
LATEST_MD_PATH = REF_DIR / "latest-report.md"
PROGRESS_PATH = REF_DIR / "progress.md"

TARGET_RESEARCH_MD = REPO_ROOT / "deep-research-Realtime-Gaussian Avatars.md"

PUBLISH_JSON = REPO_ROOT / "web" / "public" / "docs" / "realtime-gaussian-research-latest.json"
PUBLISH_MD = REPO_ROOT / "web" / "public" / "docs" / "realtime-gaussian-research-latest.md"

ARXIV_API = "https://export.arxiv.org/api/query"
GITHUB_API = "https://api.github.com"

DEFAULT_STATE: dict[str, Any] = {
    "cycles_completed": 0,
    "last_run": None,
    "seed_arxiv_queries": [
        "realtime gaussian avatar",
        "3d gaussian splatting avatar",
        "animatable gaussian avatar",
        "audio driven gaussian talking head",
        "gaussian avatar reenactment",
    ],
    "focus_terms": [
        "realtime",
        "audio-driven",
        "talking",
        "avatar",
        "gaussian",
        "splatting",
    ],
    "curated_repos": [
        "graphdeco-inria/gaussian-splatting",
        "nerfstudio-project/gsplat",
        "graphdeco-inria/hierarchical-3d-gaussians",
        "graphdeco-inria/reduced-3dgs",
        "initialneil/SplattingAvatar",
        "ShenhanQian/GaussianAvatars",
        "lizhe00/AnimatableGaussians",
        "aipixel/GaussianAvatar",
        "cvlab-kaist/GaussianTalker",
    ],
    "seen_arxiv_ids": [],
    "seen_repo_full_names": [],
}

GAUSSIAN_TERMS = ("gaussian", "splat", "3dgs", "splatting")
AVATAR_TERMS = (
    "avatar",
    "talking",
    "head",
    "face",
    "human",
    "reenact",
    "speech",
    "audio",
    "realtime",
    "real-time",
)
STOPWORDS = {
    "the",
    "and",
    "for",
    "with",
    "from",
    "this",
    "that",
    "using",
    "based",
    "toward",
    "towards",
    "real",
    "time",
    "realtime",
    "real-time",
    "gaussian",
    "splatting",
    "avatar",
    "avatars",
    "rendering",
    "learning",
    "model",
    "models",
    "paper",
    "code",
}


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def iso(ts: datetime | None = None) -> str:
    return (ts or now_utc()).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def slug_ts(ts: datetime | None = None) -> str:
    return (ts or now_utc()).strftime("%Y%m%dT%H%M%SZ")


def ensure_dirs() -> None:
    REF_DIR.mkdir(parents=True, exist_ok=True)
    HISTORY_DIR.mkdir(parents=True, exist_ok=True)
    PUBLISH_JSON.parent.mkdir(parents=True, exist_ok=True)
    PUBLISH_MD.parent.mkdir(parents=True, exist_ok=True)


def load_json(path: Path, default: Any) -> Any:
    if not path.exists():
        return default
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return default


def save_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def save_text(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


def append_line(path: Path, line: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as fh:
        fh.write(line)


def fetch_text(url: str, headers: dict[str, str] | None = None) -> str:
    req_headers = {
        "User-Agent": "realtime-gaussian-research-evolver/1.0 (+https://www.realtime-avatars.com)",
        "Accept": "application/json, text/xml, application/atom+xml;q=0.9, */*;q=0.1",
    }
    if headers:
        req_headers.update(headers)
    req = urllib.request.Request(url, headers=req_headers)
    with urllib.request.urlopen(req, timeout=30) as resp:
        charset = resp.headers.get_content_charset() or "utf-8"
        return resp.read().decode(charset, errors="replace")


def get_github_token() -> str | None:
    token = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")
    if token:
        return token.strip()
    try:
        proc = subprocess.run(
            ["gh", "auth", "token"],
            check=True,
            capture_output=True,
            text=True,
            timeout=10,
        )
        t = proc.stdout.strip()
        return t or None
    except Exception:
        return None


def github_get(path: str, token: str | None = None) -> Any:
    url = f"{GITHUB_API}{path}"
    headers = {"Accept": "application/vnd.github+json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    text = fetch_text(url, headers=headers)
    return json.loads(text)


def parse_arxiv_date(value: str) -> datetime | None:
    if not value:
        return None
    for fmt in ("%Y-%m-%dT%H:%M:%SZ", "%Y-%m-%dT%H:%M:%S.%fZ"):
        try:
            return datetime.strptime(value, fmt).replace(tzinfo=timezone.utc)
        except ValueError:
            continue
    return None


def relevance_score(text: str) -> float:
    hay = text.lower()
    score = 0.0
    score += 30.0 if any(term in hay for term in GAUSSIAN_TERMS) else 0.0
    score += 20.0 if any(term in hay for term in AVATAR_TERMS) else 0.0
    score += 8.0 if ("realtime" in hay or "real-time" in hay) else 0.0
    score += 8.0 if ("audio" in hay or "speech" in hay) else 0.0
    score += 6.0 if ("animation" in hay or "driven" in hay) else 0.0
    return score


def query_to_arxiv_expr(query: str) -> str:
    terms = [t for t in re.split(r"\s+", query.strip()) if t]
    if not terms:
        return "all:gaussian"
    return "+AND+".join(f"all:{urllib.parse.quote_plus(t)}" for t in terms)


def fetch_arxiv_query(query: str, max_results: int) -> list[dict[str, Any]]:
    search_query = query_to_arxiv_expr(query)
    url = (
        f"{ARXIV_API}?search_query={search_query}"
        f"&sortBy=submittedDate&sortOrder=descending&max_results={max_results}"
    )
    xml_text = fetch_text(url, headers={"Accept": "application/atom+xml"})
    root = ET.fromstring(xml_text)
    ns = {"atom": "http://www.w3.org/2005/Atom"}
    out: list[dict[str, Any]] = []
    for entry in root.findall("atom:entry", ns):
        title = " ".join((entry.findtext("atom:title", default="", namespaces=ns) or "").split())
        summary = " ".join((entry.findtext("atom:summary", default="", namespaces=ns) or "").split())
        id_url = entry.findtext("atom:id", default="", namespaces=ns) or ""
        arxiv_id = id_url.rsplit("/", 1)[-1]
        published = entry.findtext("atom:published", default="", namespaces=ns) or ""
        updated = entry.findtext("atom:updated", default="", namespaces=ns) or ""
        authors = [
            (author.findtext("atom:name", default="", namespaces=ns) or "").strip()
            for author in entry.findall("atom:author", ns)
        ]
        links = []
        for link in entry.findall("atom:link", ns):
            href = link.attrib.get("href", "").strip()
            rel = link.attrib.get("rel", "").strip()
            typ = link.attrib.get("type", "").strip()
            if href:
                links.append({"href": href, "rel": rel, "type": typ})
        alt = next((ln["href"] for ln in links if ln.get("rel") == "alternate"), id_url)
        text_blob = f"{title}\n{summary}"
        score = relevance_score(text_blob)
        if score <= 35:
            continue
        out.append(
            {
                "arxiv_id": arxiv_id,
                "title": title,
                "summary": summary,
                "authors": [a for a in authors if a],
                "published": published,
                "updated": updated,
                "url": alt,
                "query": query,
                "score": round(score, 2),
            }
        )
    return out


def dedupe_papers(papers: list[dict[str, Any]]) -> list[dict[str, Any]]:
    merged: dict[str, dict[str, Any]] = {}
    for paper in papers:
        key = paper.get("arxiv_id") or paper.get("url")
        if not key:
            continue
        existing = merged.get(key)
        if existing is None or paper.get("score", 0) > existing.get("score", 0):
            merged[key] = paper
        else:
            existing.setdefault("alt_queries", [])
            q = paper.get("query")
            if q and q not in existing["alt_queries"]:
                existing["alt_queries"].append(q)
    result = list(merged.values())
    result.sort(
        key=lambda p: (
            parse_arxiv_date(p.get("published", "")) or datetime(1970, 1, 1, tzinfo=timezone.utc),
            p.get("score", 0),
        ),
        reverse=True,
    )
    return result


def fetch_repo(full_name: str, token: str | None) -> dict[str, Any]:
    data = github_get(f"/repos/{full_name}", token=token)
    return {
        "full_name": data.get("full_name") or full_name,
        "url": data.get("html_url") or f"https://github.com/{full_name}",
        "description": data.get("description"),
        "stars": data.get("stargazers_count"),
        "forks": data.get("forks_count"),
        "language": data.get("language"),
        "topics": data.get("topics") or [],
        "pushed_at": data.get("pushed_at"),
        "updated_at": data.get("updated_at"),
        "source": "curated",
    }


def search_repos(query: str, max_results: int, token: str | None) -> list[dict[str, Any]]:
    encoded = urllib.parse.quote_plus(query)
    path = f"/search/repositories?q={encoded}&sort=updated&order=desc&per_page={max_results}"
    try:
        data = github_get(path, token=token)
    except Exception:
        return []
    out: list[dict[str, Any]] = []
    for item in data.get("items", [])[:max_results]:
        full_name = item.get("full_name")
        if not full_name:
            continue
        desc = item.get("description") or ""
        text_blob = f"{item.get('name', '')} {desc}".lower()
        if not any(term in text_blob for term in GAUSSIAN_TERMS):
            continue
        if not any(term in text_blob for term in AVATAR_TERMS):
            continue
        out.append(
            {
                "full_name": full_name,
                "url": item.get("html_url"),
                "description": desc,
                "stars": item.get("stargazers_count"),
                "forks": item.get("forks_count"),
                "language": item.get("language"),
                "topics": item.get("topics") or [],
                "pushed_at": item.get("pushed_at"),
                "updated_at": item.get("updated_at"),
                "source": f"search:{query}",
            }
        )
    return out


def dedupe_repos(repos: list[dict[str, Any]]) -> list[dict[str, Any]]:
    merged: dict[str, dict[str, Any]] = {}
    for repo in repos:
        key = (repo.get("full_name") or "").lower()
        if not key:
            continue
        existing = merged.get(key)
        if existing is None:
            merged[key] = repo
            continue
        if (repo.get("pushed_at") or "") > (existing.get("pushed_at") or ""):
            merged[key] = repo
    result = list(merged.values())
    result.sort(key=lambda r: (r.get("stars") or 0, r.get("pushed_at") or ""), reverse=True)
    return result


def extract_focus_terms(papers: list[dict[str, Any]], repos: list[dict[str, Any]], limit: int = 16) -> list[str]:
    counter: Counter[str] = Counter()
    for paper in papers:
        tokens = re.findall(r"[a-z0-9][a-z0-9\-]+", f"{paper.get('title', '')} {paper.get('summary', '')}".lower())
        for tok in tokens:
            if len(tok) < 4 or tok in STOPWORDS:
                continue
            if tok.isdigit():
                continue
            counter[tok] += 1
    for repo in repos:
        text = f"{repo.get('full_name', '')} {repo.get('description', '')}".lower()
        tokens = re.findall(r"[a-z0-9][a-z0-9\-]+", text)
        for tok in tokens:
            if len(tok) < 4 or tok in STOPWORDS:
                continue
            counter[tok] += 1
    seeds = [
        "realtime",
        "audio-driven",
        "gaussian",
        "splatting",
        "avatar",
        "talking",
        "face",
        "speech",
    ]
    ranked = [t for t, _ in counter.most_common(limit * 2)]
    out: list[str] = []
    for term in seeds + ranked:
        if term not in out:
            out.append(term)
        if len(out) >= limit:
            break
    return out


def build_how_it_works(papers: list[dict[str, Any]]) -> dict[str, Any]:
    title_blob = " ".join(p.get("title", "") for p in papers).lower()
    patterns: list[str] = [
        "Canonical representation: explicit anisotropic 3D Gaussians (position, covariance, opacity, color/SH).",
        "Realtime renderer: tile-based, depth-sorted splat rasterization with alpha compositing.",
        "Animation control: drive Gaussian attributes/deformation from pose, expression, and audio-derived signals.",
        "Deployment stack: compression/LOD/streaming are required for web/mobile scale.",
    ]
    if "splattingavatar" in title_blob or "mesh-embedded" in title_blob:
        patterns.append("Mesh-embedded Gaussians provide strong rig compatibility and high runtime FPS.")
    if "gaussianavatars" in title_blob or "rigged" in title_blob:
        patterns.append("Rigged Gaussian heads bind to FLAME/face meshes for controllable expression transfer.")
    if "animatable gaussians" in title_blob:
        patterns.append("Pose-conditioned Gaussian maps synthesize high-frequency body dynamics.")
    if "single video" in title_blob or "single image" in title_blob:
        patterns.append("Monocular reconstruction variants trade quality for easier capture and faster onboarding.")

    return {
        "pipeline": [
            "Identity capture: collect multi-view (best quality) or monocular (faster setup) data.",
            "Tracking + canonicalization: fit camera/face/body parameters and define a canonical avatar space.",
            "Gaussian parameter learning: optimize per-splat position/covariance/color/opacity and optional dynamics.",
            "Driver inference: map audio, expression, pose, and gaze signals into deformation/control updates.",
            "Realtime render: tile-based depth-sorted Gaussian splat rasterization and alpha compositing.",
            "Delivery: stream rendered avatar with synchronized audio through WebRTC/game-engine surfaces.",
        ],
        "patterns": patterns,
        "design_tradeoffs": [
            "Quality vs setup: multi-view capture improves realism but increases capture complexity.",
            "Control vs realism: stronger rig constraints improve editability but can limit fine detail.",
            "Latency vs fidelity: anti-aliasing and high-resolution rendering increase quality but cost frame budget.",
            "Model size vs portability: compression/LOD are required for web/mobile distribution.",
        ],
    }


def build_markdown_report(payload: dict[str, Any]) -> str:
    lines: list[str] = []
    lines.append("# Realtime Gaussian Avatar Deep Research (Latest Cycle)")
    lines.append("")
    lines.append(f"- Generated at (UTC): `{payload['generated_at']}`")
    lines.append(f"- Cycle: `{payload['cycle']}`")
    lines.append(f"- ArXiv papers tracked: `{len(payload['papers'])}`")
    lines.append(f"- GitHub repos tracked: `{len(payload['repos'])}`")
    lines.append("")
    lines.append("## Delta From Previous Cycle")
    lines.append("")
    lines.append(f"- New papers: `{len(payload['delta']['new_papers'])}`")
    lines.append(f"- New repos: `{len(payload['delta']['new_repos'])}`")
    lines.append("")
    lines.append("## How It Works (Conclusion)")
    lines.append("")
    lines.append("### Pipeline")
    for step in payload["how_it_works"]["pipeline"]:
        lines.append(f"1. {step}")
    lines.append("")
    lines.append("### Dominant Architecture Patterns")
    for item in payload["how_it_works"]["patterns"]:
        lines.append(f"- {item}")
    lines.append("")
    lines.append("### Design Tradeoffs")
    for item in payload["how_it_works"]["design_tradeoffs"]:
        lines.append(f"- {item}")
    lines.append("")
    lines.append("## Top Recent Papers")
    lines.append("")
    for paper in payload["papers"][:12]:
        lines.append(
            f"- `{paper.get('published', '')[:10]}` [{paper.get('title')}]({paper.get('url')})"
            f" (`{paper.get('arxiv_id')}`)"
        )
    lines.append("")
    lines.append("## Key Repositories")
    lines.append("")
    for repo in payload["repos"][:12]:
        lines.append(
            f"- [{repo.get('full_name')}]({repo.get('url')}) - stars `{repo.get('stars')}`"
            f", pushed `{(repo.get('pushed_at') or '')[:10]}`"
        )
    lines.append("")
    return "\n".join(lines).rstrip() + "\n"


def upsert_target_research_doc(payload: dict[str, Any]) -> None:
    marker = "## Skill Conclusion: How Realtime Gaussian Avatars Work"
    section_lines: list[str] = []
    section_lines.append(marker)
    section_lines.append("")
    section_lines.append(f"- Updated at (UTC): `{payload['generated_at']}`")
    section_lines.append(f"- Cycle: `{payload['cycle']}`")
    section_lines.append("")
    section_lines.append("### Core conclusion")
    section_lines.append("Realtime Gaussian avatars work by combining explicit 3D Gaussian scene primitives with a controllable motion driver.")
    section_lines.append("They are trained from captured identity data, canonicalized against a face/body template, then rendered with a tile-based splat rasterizer at interactive frame rates.")
    section_lines.append("")
    section_lines.append("### End-to-end flow")
    for idx, step in enumerate(payload["how_it_works"]["pipeline"], start=1):
        section_lines.append(f"{idx}. {step}")
    section_lines.append("")
    section_lines.append("### Key architecture variants observed")
    for item in payload["how_it_works"]["patterns"]:
        section_lines.append(f"- {item}")
    section_lines.append("")
    section_lines.append("### Sources (sample)")
    for paper in payload["papers"][:8]:
        section_lines.append(f"- {paper.get('title')} - {paper.get('url')}")
    for repo in payload["repos"][:6]:
        section_lines.append(f"- {repo.get('full_name')} - {repo.get('url')}")
    section_lines.append("")

    section_text = "\n".join(section_lines).rstrip() + "\n"
    old = TARGET_RESEARCH_MD.read_text(encoding="utf-8") if TARGET_RESEARCH_MD.exists() else ""
    idx = old.find(marker)
    if idx >= 0:
        new_text = old[:idx].rstrip() + "\n\n" + section_text
    else:
        base = old.rstrip()
        new_text = (base + "\n\n" if base else "") + section_text
    save_text(TARGET_RESEARCH_MD, new_text)


def run(args: argparse.Namespace) -> int:
    ensure_dirs()
    state = load_json(STATE_PATH, DEFAULT_STATE)
    previous = load_json(LATEST_JSON_PATH, {})

    cycle = int(state.get("cycles_completed", 0)) + 1
    run_ts = now_utc()
    run_iso = iso(run_ts)
    ts_slug = slug_ts(run_ts)

    queries: list[str] = []
    queries.extend(str(q) for q in state.get("seed_arxiv_queries", []))
    for term in state.get("focus_terms", [])[:8]:
        term = str(term).strip()
        if not term:
            continue
        queries.append(f"realtime gaussian avatar {term}")
        queries.append(f"gaussian talking head {term}")
    # Deduplicate while preserving order.
    seen_q: set[str] = set()
    dedup_queries: list[str] = []
    for q in queries:
        k = q.lower().strip()
        if not k or k in seen_q:
            continue
        seen_q.add(k)
        dedup_queries.append(q)

    papers: list[dict[str, Any]] = []
    arxiv_errors: list[str] = []
    for q in dedup_queries:
        try:
            papers.extend(fetch_arxiv_query(q, args.max_arxiv_per_query))
        except Exception as exc:
            arxiv_errors.append(f"{q}: {exc}")
    papers = dedupe_papers(papers)[: args.max_papers]

    token = get_github_token()
    repos: list[dict[str, Any]] = []
    github_errors: list[str] = []

    for full_name in state.get("curated_repos", []):
        try:
            repos.append(fetch_repo(str(full_name), token))
        except Exception as exc:
            github_errors.append(f"{full_name}: {exc}")

    search_queries = [
        "realtime gaussian avatar",
        "gaussian talking head realtime",
        "animatable gaussian avatar",
    ]
    for sq in search_queries:
        repos.extend(search_repos(sq, args.max_github_search, token))

    repos = dedupe_repos(repos)

    seen_arxiv: set[str] = set(str(x) for x in state.get("seen_arxiv_ids", []))
    seen_repos: set[str] = set(str(x).lower() for x in state.get("seen_repo_full_names", []))
    new_papers = [p["arxiv_id"] for p in papers if p.get("arxiv_id") and p["arxiv_id"] not in seen_arxiv]
    new_repos = [r["full_name"] for r in repos if r.get("full_name") and r["full_name"].lower() not in seen_repos]

    how_it_works = build_how_it_works(papers)
    focus_terms = extract_focus_terms(papers, repos, limit=16)

    payload = {
        "generated_at": run_iso,
        "cycle": cycle,
        "queries": dedup_queries,
        "papers": papers,
        "repos": repos,
        "how_it_works": how_it_works,
        "delta": {
            "new_papers": new_papers,
            "new_repos": new_repos,
        },
        "errors": {
            "arxiv": arxiv_errors,
            "github": github_errors,
        },
        "focus_terms": focus_terms,
    }

    report_md = build_markdown_report(payload)
    save_json(LATEST_JSON_PATH, payload)
    save_text(LATEST_MD_PATH, report_md)
    save_json(HISTORY_DIR / f"research-{ts_slug}.json", payload)

    upsert_target_research_doc(payload)

    if not args.no_publish:
        save_json(PUBLISH_JSON, payload)
        save_text(PUBLISH_MD, report_md)

    state["cycles_completed"] = cycle
    state["last_run"] = run_iso
    state["last_report_file"] = str(LATEST_MD_PATH)
    state["last_research_file"] = str(LATEST_JSON_PATH)
    state["focus_terms"] = focus_terms
    state["seen_arxiv_ids"] = sorted(set(seen_arxiv.union(new_papers)))
    state["seen_repo_full_names"] = sorted(set(seen_repos.union({r.lower() for r in new_repos})))
    save_json(STATE_PATH, state)

    event = {
        "timestamp": run_iso,
        "cycle": cycle,
        "papers": len(papers),
        "repos": len(repos),
        "new_papers": len(new_papers),
        "new_repos": len(new_repos),
        "errors": {"arxiv": len(arxiv_errors), "github": len(github_errors)},
    }
    append_line(EVENTS_PATH, json.dumps(event, ensure_ascii=False) + "\n")

    progress_lines = [
        f"## {run_iso} (cycle {cycle})",
        "",
        f"- papers tracked: `{len(papers)}`",
        f"- repos tracked: `{len(repos)}`",
        f"- new papers: `{len(new_papers)}`",
        f"- new repos: `{len(new_repos)}`",
        f"- focus terms: `{', '.join(focus_terms[:10])}`",
        f"- target doc updated: `{TARGET_RESEARCH_MD}`",
        "",
    ]
    append_line(PROGRESS_PATH, "\n".join(progress_lines))

    print(
        f"[OK] Realtime Gaussian research cycle complete: cycle={cycle}, "
        f"papers={len(papers)}, repos={len(repos)}, new_papers={len(new_papers)}, new_repos={len(new_repos)}"
    )
    print(f"[OK] Latest report: {LATEST_MD_PATH}")
    print(f"[OK] Latest JSON: {LATEST_JSON_PATH}")
    print(f"[OK] Updated target: {TARGET_RESEARCH_MD}")
    if not args.no_publish:
        print(f"[OK] Published docs: {PUBLISH_MD}")
    return 0


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Evolve deep research for realtime Gaussian avatars.")
    parser.add_argument("--max-arxiv-per-query", type=int, default=10)
    parser.add_argument("--max-github-search", type=int, default=10)
    parser.add_argument("--max-papers", type=int, default=40)
    parser.add_argument("--no-publish", action="store_true")
    return parser.parse_args(argv)


if __name__ == "__main__":
    raise SystemExit(run(parse_args(os.sys.argv[1:])))
