#!/usr/bin/env python3
"""Self-evolving collector for realtime Gaussian avatar YouTube demos."""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.parse import urlencode
from urllib.request import Request, urlopen


SKILL_DIR = Path(__file__).resolve().parents[1]
REPO_ROOT = Path(__file__).resolve().parents[4]
REF_DIR = SKILL_DIR / "references"
HISTORY_DIR = REF_DIR / "history"
STATE_PATH = SKILL_DIR / "state.json"
EVENTS_PATH = SKILL_DIR / "events.jsonl"
LATEST_JSON_PATH = REF_DIR / "latest-videos.json"
LATEST_MD_PATH = REF_DIR / "latest-report.md"
PROGRESS_PATH = REF_DIR / "progress.md"

PUBLISH_JSON_PATHS = [
    REPO_ROOT / "web" / "app" / "data" / "gaussian-video-wall.json",
    REPO_ROOT / "web" / "public" / "docs" / "gaussian-video-wall-latest.json",
]
PUBLISH_MD_PATH = REPO_ROOT / "web" / "public" / "docs" / "gaussian-video-wall-latest.md"

YOUTUBE_SEARCH_ENDPOINT = "https://www.youtube.com/results"
YOUTUBE_WATCH_URL = "https://www.youtube.com/watch?v={video_id}"
YOUTUBE_EMBED_URL = "https://www.youtube.com/embed/{video_id}"

DEFAULT_STATE: dict[str, Any] = {
    "cycle": 0,
    "seed_queries": [
        "realtime gaussian splatting avatar demo",
        "3DGS talking head avatar demo",
        "gaussian avatar lip sync demo",
        "single image gaussian avatar realtime",
        "streaming gaussian avatar demo",
        "gaussian digital human demo",
    ],
    "focus_terms": [
        "audio-driven",
        "talking head",
        "realtime",
        "web",
        "mobile",
    ],
    "channel_scores": {},
    "seen_video_ids": [],
}

GAUSSIAN_TERMS = [
    "gaussian",
    "3dgs",
    "splat",
    "splatting",
    "gaussian avatar",
]

AVATAR_TERMS = [
    "avatar",
    "talking head",
    "digital human",
    "face",
    "speech",
    "audio driven",
    "audio-driven",
    "lip sync",
    "realtime",
    "real-time",
    "demo",
    "research",
]

BLACKLIST_TERMS = [
    "minecraft",
    "fortnite",
    "counter-strike",
    "music video",
    "meme",
    "roblox",
]

STOPWORDS = {
    "the",
    "and",
    "for",
    "with",
    "from",
    "that",
    "this",
    "into",
    "your",
    "using",
    "real",
    "time",
    "realtime",
    "real-time",
    "demo",
    "research",
    "avatar",
    "gaussian",
    "splatting",
    "3dgs",
    "head",
    "talking",
    "video",
    "system",
    "method",
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
    for publish_path in PUBLISH_JSON_PATHS:
        publish_path.parent.mkdir(parents=True, exist_ok=True)
    PUBLISH_MD_PATH.parent.mkdir(parents=True, exist_ok=True)


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


def build_queries(state: dict[str, Any]) -> list[str]:
    queries: list[str] = []
    for q in state.get("seed_queries", []):
        if q:
            queries.append(str(q))

    focus_terms = [str(t).strip() for t in state.get("focus_terms", []) if str(t).strip()]
    for term in focus_terms[:8]:
        queries.append(f"gaussian avatar {term} demo")
        queries.append(f"3dgs talking head {term}")

    seen: set[str] = set()
    deduped: list[str] = []
    for q in queries:
        nq = q.strip().lower()
        if nq and nq not in seen:
            seen.add(nq)
            deduped.append(q.strip())
    return deduped


def http_get(url: str) -> str:
    req = Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept-Language": "en-US,en;q=0.9",
        },
    )
    with urlopen(req, timeout=25) as resp:
        charset = resp.headers.get_content_charset() or "utf-8"
        return resp.read().decode(charset, errors="replace")


def extract_balanced_json(text: str, marker: str) -> str | None:
    idx = text.find(marker)
    if idx < 0:
        return None
    start = text.find("{", idx + len(marker))
    if start < 0:
        return None

    depth = 0
    in_string = False
    escaped = False
    for i in range(start, len(text)):
        ch = text[i]
        if in_string:
            if escaped:
                escaped = False
            elif ch == "\\":
                escaped = True
            elif ch == '"':
                in_string = False
            continue

        if ch == '"':
            in_string = True
            continue
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                return text[start : i + 1]
    return None


def parse_yt_initial_data(html: str) -> dict[str, Any]:
    blob = extract_balanced_json(html, "var ytInitialData = ")
    if not blob:
        blob = extract_balanced_json(html, "ytInitialData = ")
    if not blob:
        raise RuntimeError("ytInitialData not found in YouTube search HTML")
    return json.loads(blob)


def walk_video_renderers(node: Any) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    stack = [node]
    while stack:
        current = stack.pop()
        if isinstance(current, dict):
            vr = current.get("videoRenderer")
            if isinstance(vr, dict):
                out.append(vr)
            for value in current.values():
                stack.append(value)
        elif isinstance(current, list):
            stack.extend(current)
    return out


def text_value(node: Any) -> str:
    if not node:
        return ""
    if isinstance(node, str):
        return node
    if isinstance(node, dict):
        if "simpleText" in node and isinstance(node["simpleText"], str):
            return node["simpleText"]
        runs = node.get("runs")
        if isinstance(runs, list):
            parts = [r.get("text", "") for r in runs if isinstance(r, dict)]
            return "".join(parts).strip()
    return ""


def parse_age_days(published_text: str) -> float | None:
    if not published_text:
        return None
    txt = published_text.strip().lower()
    txt = txt.replace("streamed ", "").replace("premiered ", "")
    if "just now" in txt or "today" in txt:
        return 0.1
    if "yesterday" in txt:
        return 1.0
    m = re.search(r"(\d+)\s+(second|minute|hour|day|week|month|year)s?\s+ago", txt)
    if not m:
        return None
    n = float(m.group(1))
    unit = m.group(2)
    factor = {
        "second": 1.0 / 86400.0,
        "minute": 1.0 / 1440.0,
        "hour": 1.0 / 24.0,
        "day": 1.0,
        "week": 7.0,
        "month": 30.0,
        "year": 365.0,
    }[unit]
    return n * factor


def is_relevant(title: str, channel: str) -> bool:
    hay = f"{title} {channel}".lower()
    if any(term in hay for term in BLACKLIST_TERMS):
        return False
    has_gaussian = any(term in hay for term in GAUSSIAN_TERMS)
    if not has_gaussian:
        return False
    has_avatar_context = any(term in hay for term in AVATAR_TERMS)
    return has_avatar_context


def score_video(video: dict[str, Any], channel_scores: dict[str, int]) -> float:
    hay = f"{video.get('title', '')} {video.get('channel', '')}".lower()
    score = 0.0
    score += 25.0 if any(term in hay for term in GAUSSIAN_TERMS) else 0.0
    score += 10.0 if "demo" in hay else 0.0
    score += 8.0 if ("realtime" in hay or "real-time" in hay) else 0.0
    score += 8.0 if "avatar" in hay else 0.0
    score += 6.0 if ("talking head" in hay or "digital human" in hay) else 0.0

    age_days = video.get("published_days_estimate")
    if isinstance(age_days, (int, float)):
        score += max(0.0, 40.0 - min(40.0, float(age_days)))

    channel = str(video.get("channel", ""))
    channel_bias = float(channel_scores.get(channel, 0))
    score += min(12.0, channel_bias * 2.0)
    return score


def fetch_query_results(query: str, max_per_query: int) -> list[dict[str, Any]]:
    url = f"{YOUTUBE_SEARCH_ENDPOINT}?{urlencode({'search_query': query, 'sp': 'CAI%253D'})}"
    html = http_get(url)
    data = parse_yt_initial_data(html)
    renderers = walk_video_renderers(data)

    videos: list[dict[str, Any]] = []
    for vr in renderers:
        vid = vr.get("videoId")
        if not isinstance(vid, str) or not vid:
            continue

        title = text_value(vr.get("title"))
        if not title:
            continue

        channel = (
            text_value(vr.get("ownerText"))
            or text_value(vr.get("longBylineText"))
            or text_value(vr.get("shortBylineText"))
        )
        published_text = text_value(vr.get("publishedTimeText"))
        view_count_text = text_value(vr.get("viewCountText"))
        length_text = text_value(vr.get("lengthText"))
        thumbs = (((vr.get("thumbnail") or {}).get("thumbnails")) or [])
        thumb_url = ""
        if isinstance(thumbs, list) and thumbs:
            last = thumbs[-1]
            if isinstance(last, dict):
                thumb_url = str(last.get("url", ""))

        videos.append(
            {
                "video_id": vid,
                "title": title.strip(),
                "channel": channel.strip(),
                "published_text": published_text.strip(),
                "published_days_estimate": parse_age_days(published_text),
                "view_count_text": view_count_text.strip(),
                "duration_text": length_text.strip(),
                "url": YOUTUBE_WATCH_URL.format(video_id=vid),
                "embed_url": YOUTUBE_EMBED_URL.format(video_id=vid),
                "thumbnail_url": thumb_url,
                "source_query": query,
                "source": "youtube_search_html",
            }
        )

    return videos[:max_per_query]


def derive_focus_terms(videos: list[dict[str, Any]]) -> list[str]:
    counts: Counter[str] = Counter()
    for video in videos:
        title = str(video.get("title", "")).lower()
        for token in re.findall(r"[a-z0-9][a-z0-9\-]{2,}", title):
            if token in STOPWORDS:
                continue
            if token.isdigit():
                continue
            counts[token] += 1
    return [term for term, _ in counts.most_common(10)]


def build_markdown(payload: dict[str, Any]) -> str:
    lines: list[str] = []
    lines.append("# Gaussian Video Wall Research (Latest)")
    lines.append("")
    lines.append(f"- Generated at: `{payload['generated_at']}`")
    lines.append(f"- Cycle: `{payload['cycle']}`")
    lines.append(f"- Queries: `{len(payload.get('queries', []))}`")
    lines.append(f"- Candidates: `{payload['stats']['candidate_count']}`")
    lines.append(f"- Selected: `{payload['stats']['selected_count']}`")
    lines.append(f"- New this cycle: `{payload['stats']['new_count']}`")
    lines.append("")
    lines.append("## Videos")
    lines.append("")
    for i, video in enumerate(payload.get("videos", []), start=1):
        lines.append(
            f"{i}. [{video['title']}]({video['url']}) - {video.get('channel', 'Unknown')} "
            f"({video.get('published_text') or 'date n/a'})"
        )
    lines.append("")
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description="Self-evolving YouTube collector for Gaussian avatar demos")
    parser.add_argument("--max-videos", type=int, default=24)
    parser.add_argument("--max-per-query", type=int, default=18)
    parser.add_argument("--no-publish", action="store_true")
    args = parser.parse_args()

    ensure_dirs()
    state = load_json(STATE_PATH, DEFAULT_STATE)
    if not isinstance(state, dict):
        state = dict(DEFAULT_STATE)

    cycle = int(state.get("cycle", 0)) + 1
    queries = build_queries(state)
    channel_scores = state.get("channel_scores", {}) or {}
    if not isinstance(channel_scores, dict):
        channel_scores = {}

    all_candidates: list[dict[str, Any]] = []
    errors: list[str] = []
    for query in queries:
        try:
            all_candidates.extend(fetch_query_results(query, args.max_per_query))
        except Exception as exc:  # noqa: BLE001
            errors.append(f"{query}: {exc}")

    deduped: dict[str, dict[str, Any]] = {}
    for candidate in all_candidates:
        vid = candidate["video_id"]
        if not is_relevant(candidate.get("title", ""), candidate.get("channel", "")):
            continue
        candidate["relevance_score"] = score_video(candidate, channel_scores)
        old = deduped.get(vid)
        if old is None or float(candidate["relevance_score"]) > float(old.get("relevance_score", 0)):
            deduped[vid] = candidate

    selected = sorted(
        deduped.values(),
        key=lambda v: (-float(v.get("relevance_score", 0)), float(v.get("published_days_estimate") or 9e9)),
    )[: max(1, args.max_videos)]

    seen_ids = set(str(x) for x in state.get("seen_video_ids", []) if x)
    new_count = sum(1 for v in selected if str(v["video_id"]) not in seen_ids)
    for video in selected:
        seen_ids.add(str(video["video_id"]))
        channel = str(video.get("channel", "")).strip()
        if channel:
            channel_scores[channel] = int(channel_scores.get(channel, 0)) + 1

    new_terms = derive_focus_terms(selected)
    old_terms = [str(t) for t in state.get("focus_terms", []) if str(t).strip()]
    merged_terms: list[str] = []
    seen_terms: set[str] = set()
    for term in [*old_terms, *new_terms]:
        norm = term.strip().lower()
        if not norm or norm in seen_terms:
            continue
        seen_terms.add(norm)
        merged_terms.append(norm)
    merged_terms = merged_terms[:30]

    payload = {
        "generated_at": iso(),
        "cycle": cycle,
        "queries": queries,
        "stats": {
            "candidate_count": len(all_candidates),
            "selected_count": len(selected),
            "new_count": new_count,
            "error_count": len(errors),
        },
        "errors": errors,
        "videos": selected,
    }

    md = build_markdown(payload)

    save_json(LATEST_JSON_PATH, payload)
    save_text(LATEST_MD_PATH, md)
    save_json(HISTORY_DIR / f"videos-{slug_ts()}.json", payload)

    state["cycle"] = cycle
    state["focus_terms"] = merged_terms
    state["channel_scores"] = channel_scores
    state["seen_video_ids"] = sorted(seen_ids)[-2000:]
    save_json(STATE_PATH, state)

    event = {
        "timestamp": iso(),
        "cycle": cycle,
        "queries": len(queries),
        "candidate_count": len(all_candidates),
        "selected_count": len(selected),
        "new_count": new_count,
        "error_count": len(errors),
    }
    append_line(EVENTS_PATH, json.dumps(event, ensure_ascii=False) + "\n")
    append_line(
        PROGRESS_PATH,
        (
            f"- {event['timestamp']} cycle={cycle} queries={event['queries']} "
            f"selected={event['selected_count']} new={event['new_count']} errors={event['error_count']}\n"
        ),
    )

    if not args.no_publish:
        for publish_path in PUBLISH_JSON_PATHS:
            save_json(publish_path, payload)
        save_text(PUBLISH_MD_PATH, md)

    print(
        json.dumps(
            {
                "ok": True,
                "cycle": cycle,
                "selected": len(selected),
                "new": new_count,
                "errors": len(errors),
                "published": not args.no_publish,
            },
            ensure_ascii=False,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
