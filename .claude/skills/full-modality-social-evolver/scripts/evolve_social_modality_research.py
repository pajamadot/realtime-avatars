#!/usr/bin/env python3
"""
Full-modality social interaction research evolver.

Runs repeatable research cycles that:
1) Verify slide-5 interaction-signal claims.
2) Pull latest evidence from ArXiv and GitHub.
3) Build unified architecture + dependency graph across three avatar techniques.
4) Self-evolve query terms from newly observed research trends.
5) Persist auditable state/events/history and publish web docs.
"""

from __future__ import annotations

import argparse
import html
import json
import os
import re
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


METHOD_KEYS = ["metahuman", "video_generation", "gaussian_splatting"]
METHOD_LABELS = {
    "metahuman": "MetaHuman",
    "video_generation": "Video Generation",
    "gaussian_splatting": "Gaussian Splatting",
}

DEFAULT_SLIDE_URL = "https://www.realtime-avatars.com/slides/5"
DEFAULT_SLIDE_SOURCE = Path("web/app/slides/SlidesDeck.tsx")

BASE_ARXIV_QUERIES = [
    "real-time talking avatar",
    "multimodal social interaction avatar",
    "audio driven facial animation",
    "3D Gaussian Splatting talking avatar",
    "interactive controllable portrait generation",
    "turn-taking conversational agents",
    "co-speech gesture generation",
    "real-time neural rendering avatar",
]

BASE_GITHUB_QUERIES = [
    "livekit agents",
    "graphdeco gaussian-splatting",
    "KwaiVGI LivePortrait",
    "NVIDIA Audio2Face-3D-SDK",
    "cvlab-kaist GaussianTalker",
    "soulx-ai SoulX-FlashHead",
    "SadTalker",
    "metahuman livelink",
]

CURATED_GITHUB_REPOS = [
    "https://github.com/livekit/agents",
    "https://github.com/KwaiVGI/LivePortrait",
    "https://github.com/graphdeco-inria/gaussian-splatting",
    "https://github.com/NVIDIA/Audio2Face-3D-SDK",
    "https://github.com/cvlab-kaist/GaussianTalker",
    "https://github.com/soulx-ai/SoulX-FlashHead",
    "https://github.com/OpenTalker/SadTalker",
]

CURATED_ARXIV_IDS = [
    "2308.04079",  # 3D Gaussian Splatting
    "2312.02069",  # GaussianAvatars
    "2407.03168",  # LivePortrait
    "2409.12533",  # GazeGaussian
    "2505.22210",  # ChatAnyone
    "2506.09976",  # TaoAvatar
    "2509.17080",  # ICo3D
    "2512.23576",  # LiveTalk
    "2601.00664",  # Avatar Forcing
]

CURATED_ARXIV_ID_SET = set(CURATED_ARXIV_IDS)

ARXIV_CORE_TITLE_TERMS = [
    "avatar",
    "metahuman",
    "portrait",
    "talking",
    "face",
    "facial",
    "gaussian",
    "splatting",
    "lipsync",
    "lip-sync",
    "gaze",
    "gesture",
    "audio-driven",
    "audio driven",
    "speech",
    "liveportrait",
    "livelink",
    "audio2face",
]

ARXIV_AVATAR_ANCHOR_TERMS = [
    "avatar",
    "metahuman",
    "portrait",
    "talking",
    "face",
    "facial",
    "lipsync",
    "lip-sync",
    "gaze",
    "gesture",
    "liveportrait",
    "audio2face",
    "livelink",
]

ARXIV_CONTEXT_TERMS = [
    "audio",
    "speech",
    "video",
    "expression",
    "pose",
    "gaussian",
    "splatting",
    "diffusion",
    "conversation",
    "social",
    "turn-taking",
    "narrative",
    "real-time",
    "realtime",
]

FOCUS_TERM_WHITELIST = {
    "metahuman",
    "livelink",
    "livekit",
    "avatar",
    "avatars",
    "talking",
    "portrait",
    "facial",
    "gaze",
    "gesture",
    "audio2face",
    "audio-driven",
    "gaussian",
    "splatting",
    "gaussian-splatting",
    "liveportrait",
    "sadtalker",
    "linly-talker",
    "tts",
    "lipsync",
    "lip-sync",
    "realtime",
    "real-time",
    "voice",
    "speech",
}

EVIDENCE_REFERENCES = {
    "epic_metahuman_animator": {
        "url": "https://dev.epicgames.com/documentation/en-us/metahuman/metahuman-animator",
        "note": "MetaHuman Animator supports animation from video or audio data.",
    },
    "epic_realtime_livelink": {
        "url": "https://dev.epicgames.com/documentation/en-us/metahuman/realtime-animation-using-live-link",
        "note": "MetaHuman can be driven in real time using webcam and audio devices.",
    },
    "epic_metahuman_audio_source": {
        "url": "https://dev.epicgames.com/documentation/en-us/metahuman/using-audio-source-for-animation",
        "note": "Audio Source mode maps speech to facial animation for MetaHuman.",
    },
    "apple_wwdc_arkit": {
        "url": "https://developer.apple.com/videos/play/wwdc2018/716/",
        "note": "ARKit face tracking exposes 50+ blendshape coefficients at up to 60 FPS.",
    },
    "arxiv_3dgs": {
        "url": "https://arxiv.org/abs/2308.04079",
        "note": "3D Gaussian Splatting baseline demonstrates high-quality real-time rendering.",
    },
    "arxiv_liveportrait": {
        "url": "https://arxiv.org/abs/2407.03168",
        "note": "LivePortrait enables controllable portrait animation with expression/pose retargeting.",
    },
    "arxiv_livetalk": {
        "url": "https://arxiv.org/abs/2512.23576",
        "note": "LiveTalk uses audio/text/image conditioning for real-time talking video generation.",
    },
    "arxiv_avatar_forcing": {
        "url": "https://arxiv.org/abs/2601.00664",
        "note": "Avatar Forcing introduces interactive user-motion-conditioned generation loops.",
    },
    "arxiv_taoavatar": {
        "url": "https://arxiv.org/abs/2506.09976",
        "note": "TaoAvatar targets full-body real-time talking avatars for XR with controllable body motion.",
    },
    "arxiv_gaussianavatars": {
        "url": "https://arxiv.org/abs/2312.02069",
        "note": "GaussianAvatars supports driving by expression and pose transfers.",
    },
    "arxiv_gazegaussian": {
        "url": "https://arxiv.org/abs/2409.12533",
        "note": "GazeGaussian studies gaze-aware Gaussian-head synthesis with explicit gaze cues.",
    },
    "arxiv_ico3d": {
        "url": "https://arxiv.org/abs/2509.17080",
        "note": "ICo3D integrates oral and written interactions for interactive 3D social avatars.",
    },
    "arxiv_chatanyone": {
        "url": "https://arxiv.org/abs/2505.22210",
        "note": "ChatAnyone supports real-time full-body avatar interaction including hand gestures.",
    },
    "github_livekit_agents": {
        "url": "https://github.com/livekit/agents",
        "note": "LiveKit Agents provides realtime voice pipelines with turn-detection modules.",
    },
    "github_liveportrait": {
        "url": "https://github.com/KwaiVGI/LivePortrait",
        "note": "Open implementation for controllable portrait animation and stitching.",
    },
    "github_gaussian_splatting": {
        "url": "https://github.com/graphdeco-inria/gaussian-splatting",
        "note": "Reference implementation of 3D Gaussian Splatting.",
    },
    "github_audio2face_sdk": {
        "url": "https://github.com/NVIDIA/Audio2Face-3D-Samples",
        "note": "Audio2Face SDK samples for real-time blendshape-driven animation.",
    },
}

# 0 absent, 1 limited/conditional, 2 strong.
RECOMMENDED_SIGNAL_SUPPORT: dict[str, dict[str, list[int]]] = {
    "inputs": {
        "Audio prosody": [2, 2, 2],
        "Face video (webcam)": [2, 2, 1],
        "Head pose": [2, 2, 2],
        "Gaze direction": [2, 1, 1],
        "Expression coefficients": [2, 1, 2],
        "Turn-taking signals": [2, 2, 2],
    },
    "outputs": {
        "Speech audio": [2, 2, 2],
        "Facial action units": [2, 1, 1],
        "Head motion": [2, 2, 2],
        "Gaze shifts": [2, 1, 1],
        "Hand gestures": [2, 2, 1],
        "Idle micro-motion": [2, 2, 2],
    },
    "coupling": {
        "Audio-only driven": [2, 2, 2],
        "Audio + user motion (Avatar Forcing)": [0, 2, 0],
        "Audio + text + image (LiveTalk)": [0, 2, 0],
        "Audio + pose (TaoAvatar)": [0, 0, 2],
    },
}

SIGNAL_EVIDENCE_IDS: dict[str, list[str]] = {
    "inputs/Audio prosody": ["epic_metahuman_audio_source", "arxiv_livetalk", "arxiv_taoavatar"],
    "inputs/Face video (webcam)": ["epic_realtime_livelink", "arxiv_liveportrait", "arxiv_gaussianavatars"],
    "inputs/Head pose": ["arxiv_liveportrait", "arxiv_gaussianavatars", "arxiv_taoavatar"],
    "inputs/Gaze direction": ["epic_metahuman_animator", "arxiv_gazegaussian"],
    "inputs/Expression coefficients": ["apple_wwdc_arkit", "arxiv_liveportrait", "arxiv_gaussianavatars"],
    "inputs/Turn-taking signals": ["github_livekit_agents", "arxiv_ico3d", "arxiv_avatar_forcing"],
    "outputs/Speech audio": ["epic_metahuman_audio_source", "arxiv_livetalk", "github_livekit_agents"],
    "outputs/Facial action units": ["apple_wwdc_arkit", "github_audio2face_sdk", "arxiv_liveportrait"],
    "outputs/Head motion": ["arxiv_liveportrait", "arxiv_taoavatar", "arxiv_avatar_forcing"],
    "outputs/Gaze shifts": ["epic_metahuman_animator", "arxiv_gazegaussian"],
    "outputs/Hand gestures": ["arxiv_chatanyone", "arxiv_taoavatar"],
    "outputs/Idle micro-motion": ["arxiv_liveportrait", "arxiv_gaussianavatars", "arxiv_avatar_forcing"],
    "coupling/Audio-only driven": ["epic_metahuman_audio_source", "arxiv_livetalk", "arxiv_taoavatar"],
    "coupling/Audio + user motion (Avatar Forcing)": ["arxiv_avatar_forcing"],
    "coupling/Audio + text + image (LiveTalk)": ["arxiv_livetalk"],
    "coupling/Audio + pose (TaoAvatar)": ["arxiv_taoavatar"],
}

STOPWORDS = {
    "avatar",
    "avatars",
    "social",
    "interaction",
    "interactive",
    "realtime",
    "real",
    "time",
    "video",
    "generation",
    "talking",
    "head",
    "heads",
    "face",
    "facial",
    "with",
    "from",
    "using",
    "based",
    "towards",
    "toward",
    "through",
    "for",
    "and",
    "the",
    "that",
    "this",
    "into",
    "multi",
    "multimodal",
    "rendering",
    "neural",
    "model",
    "models",
    "code",
    "github",
    "arxiv",
    "repo",
    "repository",
    "are",
    "data",
    "system",
    "systems",
    "study",
    "learning",
    "language",
    "llm",
    "llms",
    "token",
    "tokens",
    "method",
    "methods",
    "paper",
    "papers",
    "approach",
    "approaches",
    "modeling",
    "analysis",
    "benchmark",
    "benchmarks",
    "results",
    "toward",
    "towards",
    "into",
    "over",
    "under",
    "between",
    "across",
    "from",
    "with",
    "without",
    "their",
    "there",
    "than",
    "this",
    "that",
    "these",
    "those",
    "such",
    "show",
    "shows",
    "using",
    "used",
    "use",
    "based",
    "novel",
    "via",
    "toward",
    "possible",
    "new",
    "open",
    "source",
    "project",
    "projects",
    "repo",
    "github",
    "first",
    "second",
    "third",
    "our",
    "your",
    "they",
    "them",
    "you",
    "can",
    "may",
    "will",
    "not",
    "but",
    "also",
    "more",
    "most",
    "less",
    "high",
    "low",
    "best",
    "state",
    "art",
    "performance",
}

RESEARCH_KEYWORDS = [
    "avatar",
    "metahuman",
    "talking",
    "portrait",
    "facial",
    "gaussian",
    "splatting",
    "audio",
    "speech",
    "livelink",
    "audio2face",
    "gesture",
    "gaze",
    "turn-taking",
    "conversation",
    "conversational",
    "narrative",
    "social",
    "diffusion",
    "webrtc",
]

DOMAIN_TERM_FRAGMENTS = [
    "avatar",
    "metahuman",
    "livekit",
    "livelink",
    "audio",
    "speech",
    "voice",
    "prosody",
    "gesture",
    "gaze",
    "talk",
    "portrait",
    "diffusion",
    "gaussian",
    "splat",
    "narrative",
    "dialog",
    "turn",
    "tts",
    "asr",
    "blend",
    "emotion",
    "social",
    "xr",
    "vision",
]

HTML_TITLE_RE = re.compile(r"<title[^>]*>(.*?)</title>", re.IGNORECASE | re.DOTALL)
HTML_META_DESC_RE = re.compile(
    r'<meta[^>]+name=["\']description["\'][^>]+content=["\']([^"\']+)["\']',
    re.IGNORECASE,
)
SLIDE_ROW_RE = re.compile(
    r"\{\s*name:\s*'([^']+)'\s*,\s*support:\s*\[(true|false)\s*,\s*(true|false)\s*,\s*(true|false)\]\s*\}",
    re.DOTALL,
)

HTTP_USER_AGENT = "full-modality-social-evolver/1.0"
_RESOLVED_GH_TOKEN: str | None = None


def now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def timestamp_for_filename() -> str:
    return datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")


def parse_iso_date(value: str | None) -> datetime:
    if not value:
        return datetime.fromtimestamp(0, tz=timezone.utc)
    text = value.replace("Z", "+00:00")
    try:
        parsed = datetime.fromisoformat(text)
    except ValueError:
        return datetime.fromtimestamp(0, tz=timezone.utc)
    if parsed.tzinfo is None:
        return parsed.replace(tzinfo=timezone.utc)
    return parsed


def read_text(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8", errors="ignore")
    except OSError:
        return ""


def read_json(path: Path) -> dict[str, Any] | None:
    if not path.exists():
        return None
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return None
    return payload if isinstance(payload, dict) else None


def write_json(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=True) + "\n", encoding="utf-8")


def truncate_text(value: str, max_length: int = 280) -> str:
    text = value.strip()
    if len(text) <= max_length:
        return text
    return text[: max_length - 3] + "..."


def find_repo_root(start: Path) -> Path:
    for candidate in [start, *start.parents]:
        if (candidate / ".git").exists():
            return candidate
    return start


def resolve_github_token() -> str | None:
    global _RESOLVED_GH_TOKEN
    if _RESOLVED_GH_TOKEN is not None:
        return _RESOLVED_GH_TOKEN or None

    env_token = os.getenv("GITHUB_TOKEN") or os.getenv("GH_TOKEN")
    if env_token:
        _RESOLVED_GH_TOKEN = env_token.strip()
        return _RESOLVED_GH_TOKEN or None

    try:
        completed = subprocess.run(
            ["gh", "auth", "token"],
            capture_output=True,
            text=True,
            timeout=6,
            check=True,
        )
        token = completed.stdout.strip()
    except (OSError, subprocess.SubprocessError):
        token = ""

    _RESOLVED_GH_TOKEN = token
    return _RESOLVED_GH_TOKEN or None


def build_headers(url: str, accept: str) -> dict[str, str]:
    headers = {
        "User-Agent": HTTP_USER_AGENT,
        "Accept": accept,
    }
    token = resolve_github_token()
    if token and url.startswith("https://api.github.com/"):
        headers["Authorization"] = f"Bearer {token}"
        headers["X-GitHub-Api-Version"] = "2022-11-28"
    return headers


def fetch_url_text(url: str, accept: str, timeout_seconds: float = 25.0) -> dict[str, Any]:
    request = urllib.request.Request(url, headers=build_headers(url, accept))
    try:
        with urllib.request.urlopen(request, timeout=timeout_seconds) as response:
            body = response.read(2_000_000).decode("utf-8", errors="ignore")
            return {
                "ok": True,
                "url": response.geturl(),
                "status_code": int(response.getcode() or 200),
                "content_type": response.headers.get("Content-Type"),
                "last_modified": response.headers.get("Last-Modified"),
                "etag": response.headers.get("ETag"),
                "body": body,
                "error": None,
            }
    except urllib.error.HTTPError as exc:
        return {
            "ok": False,
            "url": url,
            "status_code": int(exc.code),
            "content_type": None,
            "last_modified": None,
            "etag": None,
            "body": "",
            "error": truncate_text(f"HTTPError: {exc.reason}"),
        }
    except urllib.error.URLError as exc:
        return {
            "ok": False,
            "url": url,
            "status_code": None,
            "content_type": None,
            "last_modified": None,
            "etag": None,
            "body": "",
            "error": truncate_text(f"URLError: {exc.reason}"),
        }
    except TimeoutError as exc:
        return {
            "ok": False,
            "url": url,
            "status_code": None,
            "content_type": None,
            "last_modified": None,
            "etag": None,
            "body": "",
            "error": truncate_text(f"TimeoutError: {exc}"),
        }
    except OSError as exc:
        return {
            "ok": False,
            "url": url,
            "status_code": None,
            "content_type": None,
            "last_modified": None,
            "etag": None,
            "body": "",
            "error": truncate_text(f"OSError: {exc}"),
        }


def extract_html_title(body: str) -> str:
    match = HTML_TITLE_RE.search(body or "")
    if not match:
        return ""
    cleaned = re.sub(r"\s+", " ", html.unescape(match.group(1))).strip()
    return truncate_text(cleaned, 200)


def extract_html_description(body: str) -> str:
    match = HTML_META_DESC_RE.search(body or "")
    if not match:
        return ""
    cleaned = re.sub(r"\s+", " ", html.unescape(match.group(1))).strip()
    return truncate_text(cleaned, 220)


def parse_slide5_signals(slide_source_text: str) -> dict[str, list[dict[str, Any]]]:
    start = slide_source_text.find("function SlideSignalsInteraction()")
    end = slide_source_text.find("function SlideCapabilityMatrix()")
    if start < 0 or end <= start:
        return {"inputs": [], "outputs": [], "coupling": []}

    block = slide_source_text[start:end]
    parsed: dict[str, list[dict[str, Any]]] = {"inputs": [], "outputs": [], "coupling": []}
    for section in ["inputs", "outputs", "coupling"]:
        pattern = re.compile(
            rf"{section}\s*:\s*\{{.*?signals:\s*\[(?P<body>.*?)\]\s*,\s*\}}",
            re.DOTALL,
        )
        match = pattern.search(block)
        if not match:
            continue
        rows: list[dict[str, Any]] = []
        for row in SLIDE_ROW_RE.finditer(match.group("body")):
            rows.append(
                {
                    "name": row.group(1).strip(),
                    "support": [row.group(2) == "true", row.group(3) == "true", row.group(4) == "true"],
                }
            )
        parsed[section] = rows
    return parsed


def slide_support_to_scores(support: list[bool]) -> list[int]:
    return [2 if item else 0 for item in support]


def relevance_score(text: str) -> int:
    normalized = text.lower()
    score = 0
    for keyword in RESEARCH_KEYWORDS:
        if keyword in normalized:
            score += 1
    return score


def is_domain_term(token: str) -> bool:
    lowered = token.lower()
    if lowered in FOCUS_TERM_WHITELIST:
        return True
    return any(fragment in lowered for fragment in DOMAIN_TERM_FRAGMENTS)


def arxiv_id_from_url(arxiv_url: str) -> str:
    value = (arxiv_url or "").strip()
    match = re.search(r"arxiv\.org/abs/([0-9]{4}\.[0-9]{4,5})(v\d+)?", value)
    if not match:
        return value
    return match.group(1)


def is_avatar_research_entry(entry: dict[str, Any]) -> bool:
    arxiv_id = arxiv_id_from_url(entry.get("id", ""))
    if arxiv_id in CURATED_ARXIV_ID_SET:
        return True
    title = (entry.get("title") or "").lower()
    summary = (entry.get("summary") or "").lower()
    categories = " ".join(entry.get("categories", [])) if isinstance(entry.get("categories"), list) else ""
    query = (entry.get("query") or "").lower()
    text = f"{title} {summary} {categories} {query}"
    has_anchor_title = any(term in title for term in ARXIV_AVATAR_ANCHOR_TERMS)
    has_anchor_anywhere = any(term in text for term in ARXIV_AVATAR_ANCHOR_TERMS)
    has_context = any(term in text for term in ARXIV_CONTEXT_TERMS)
    score = int(entry.get("relevance_score", 0))
    return has_anchor_title or (has_anchor_anywhere and has_context and score >= 2)


def is_avatar_repo_entry(entry: dict[str, Any]) -> bool:
    text = (
        f"{entry.get('full_name', '')} {entry.get('description', '')} "
        f"{' '.join(entry.get('topics', []) if isinstance(entry.get('topics'), list) else [])}"
    ).lower()
    if entry.get("source") == "curated_fallback":
        return True
    primary_tokens = [
        "metahuman",
        "livelink",
        "audio2face",
        "liveportrait",
        "sadtalker",
        "gaussiantalker",
        "talking face",
        "avatar",
        "livekit",
    ]
    if any(token in text for token in primary_tokens):
        return True

    has_splat = "splat" in text or "gaussian-splatting" in text
    has_avatar_context = any(token in text for token in ["avatar", "talk", "face", "facial", "portrait"])
    return has_splat and has_avatar_context


def build_claim_check(slide_signals: dict[str, list[dict[str, Any]]]) -> dict[str, Any]:
    checks: list[dict[str, Any]] = []
    mismatch_count = 0
    mismatch_by_method = Counter()

    for section, rows in slide_signals.items():
        for row in rows:
            signal_name = row["name"]
            slide_scores = slide_support_to_scores(row["support"])
            expected_scores = RECOMMENDED_SIGNAL_SUPPORT.get(section, {}).get(signal_name)
            if expected_scores is None:
                continue

            mismatches: list[dict[str, Any]] = []
            for idx, method in enumerate(METHOD_KEYS):
                slide_bool = slide_scores[idx] > 0
                expected_bool = expected_scores[idx] > 0
                if slide_bool != expected_bool:
                    mismatch_by_method[method] += 1
                    mismatches.append(
                        {
                            "method": METHOD_LABELS[method],
                            "slide_support": bool(slide_bool),
                            "recommended_support": bool(expected_bool),
                            "recommended_level": expected_scores[idx],
                        }
                    )

            claim_id = f"{section}/{signal_name}"
            evidence_ids = SIGNAL_EVIDENCE_IDS.get(claim_id, [])
            checks.append(
                {
                    "section": section,
                    "signal": signal_name,
                    "slide_support": row["support"],
                    "recommended_scores": expected_scores,
                    "matches_recommendation": len(mismatches) == 0,
                    "mismatches": mismatches,
                    "evidence_ids": evidence_ids,
                    "evidence_links": [EVIDENCE_REFERENCES[eid]["url"] for eid in evidence_ids if eid in EVIDENCE_REFERENCES],
                }
            )
            if mismatches:
                mismatch_count += 1

    checks.sort(key=lambda item: (item["section"], item["signal"].lower()))
    return {
        "generated_at": now_iso(),
        "totals": {
            "claims_checked": len(checks),
            "mismatched_claims": mismatch_count,
        },
        "mismatch_by_method": {
            METHOD_LABELS[key]: mismatch_by_method.get(key, 0) for key in METHOD_KEYS
        },
        "checks": checks,
    }


def fetch_arxiv_entries(query: str, max_results: int) -> list[dict[str, Any]]:
    encoded_query = urllib.parse.quote(f"all:{query}")
    url = (
        "https://export.arxiv.org/api/query"
        f"?search_query={encoded_query}&start=0&max_results={max_results}"
        "&sortBy=lastUpdatedDate&sortOrder=descending"
    )
    fetched = fetch_url_text(url, accept="application/atom+xml,text/xml")
    if not fetched["ok"]:
        return []

    try:
        root = ET.fromstring(fetched["body"])
    except ET.ParseError:
        return []

    ns = {"atom": "http://www.w3.org/2005/Atom", "arxiv": "http://arxiv.org/schemas/atom"}
    entries: list[dict[str, Any]] = []
    for entry in root.findall("atom:entry", ns):
        arxiv_id = entry.findtext("atom:id", default="", namespaces=ns).strip()
        title = re.sub(r"\s+", " ", entry.findtext("atom:title", default="", namespaces=ns)).strip()
        summary = re.sub(r"\s+", " ", entry.findtext("atom:summary", default="", namespaces=ns)).strip()
        published = entry.findtext("atom:published", default="", namespaces=ns).strip()
        updated = entry.findtext("atom:updated", default="", namespaces=ns).strip()
        authors = [
            author.findtext("atom:name", default="", namespaces=ns).strip()
            for author in entry.findall("atom:author", ns)
        ]
        categories = [item.attrib.get("term", "").strip() for item in entry.findall("atom:category", ns)]
        links = [item.attrib.get("href", "").strip() for item in entry.findall("atom:link", ns)]
        text_blob = f"{title} {summary}"
        entries.append(
            {
                "id": arxiv_id,
                "title": truncate_text(title, 220),
                "summary": truncate_text(summary, 360),
                "published": published,
                "updated": updated,
                "authors": [author for author in authors if author],
                "categories": [cat for cat in categories if cat],
                "links": [link for link in links if link],
                "query": query,
                "relevance_score": relevance_score(text_blob),
                "source": "arxiv_query_api",
            }
        )
    return entries


def fetch_curated_arxiv_entries() -> list[dict[str, Any]]:
    curated: list[dict[str, Any]] = []
    for arxiv_id in CURATED_ARXIV_IDS:
        records = fetch_arxiv_entries(f"id:{arxiv_id}", 1)
        if not records:
            continue
        record = records[0]
        record["query"] = "curated"
        record["source"] = "curated_reference"
        record["relevance_score"] = max(int(record.get("relevance_score", 0)), 6)
        curated.append(record)
    return curated


def fetch_arxiv_corpus(queries: list[str], max_per_query: int, max_total: int) -> dict[str, Any]:
    records_by_id: dict[str, dict[str, Any]] = {}
    for query in queries:
        for record in fetch_arxiv_entries(query, max_per_query):
            key = arxiv_id_from_url(record.get("id", "")) or f"{record['query']}::{record['title']}"
            existing = records_by_id.get(key)
            if existing is None:
                records_by_id[key] = record
            else:
                seen_queries = set(existing.get("queries", [existing.get("query", "")]))
                seen_queries.add(query)
                existing["queries"] = sorted(item for item in seen_queries if item)

    for record in fetch_curated_arxiv_entries():
        key = arxiv_id_from_url(record.get("id", "")) or f"curated::{record['title']}"
        existing = records_by_id.get(key)
        if existing is None:
            records_by_id[key] = record
        else:
            seen_queries = set(existing.get("queries", [existing.get("query", "")]))
            seen_queries.add("curated")
            existing["queries"] = sorted(item for item in seen_queries if item)
            existing["relevance_score"] = max(
                int(existing.get("relevance_score", 0)),
                int(record.get("relevance_score", 0)),
            )
            existing["source"] = existing.get("source") or "curated_reference"

    entries = list(records_by_id.values())
    filtered = [entry for entry in entries if is_avatar_research_entry(entry)]
    if not filtered:
        filtered = [entry for entry in entries if int(entry.get("relevance_score", 0)) >= 3]
    if not filtered:
        filtered = entries
    filtered.sort(
        key=lambda item: (
            int(item.get("relevance_score", 0)),
            parse_iso_date(item.get("updated")),
        ),
        reverse=True,
    )
    trimmed = filtered[:max_total]
    return {
        "queries": queries,
        "total_collected": len(entries),
        "total_after_relevance_filter": len(filtered),
        "entries": trimmed,
    }


def fetch_curated_github_repositories() -> list[dict[str, Any]]:
    curated: list[dict[str, Any]] = []
    for url in CURATED_GITHUB_REPOS:
        fetched = fetch_url_text(url, accept="text/html,application/xhtml+xml")
        path = urllib.parse.urlparse(url).path.strip("/")
        description = extract_html_description(fetched.get("body", ""))
        curated.append(
            {
                "full_name": path,
                "url": url,
                "description": description,
                "language": None,
                "stars": None,
                "forks": None,
                "open_issues": None,
                "updated_at": None,
                "pushed_at": None,
                "topics": [],
                "query": "curated",
                "relevance_score": relevance_score(f"{path} {description}") + 5,
                "source": "curated_fallback",
                "status_code": fetched.get("status_code"),
                "ok": bool(fetched.get("ok")),
                "title": extract_html_title(fetched.get("body", "")),
                "error": fetched.get("error"),
            }
        )
    return curated


def fetch_github_repositories(queries: list[str], max_per_query: int, max_total: int) -> dict[str, Any]:
    repositories: dict[str, dict[str, Any]] = {}
    failures: list[str] = []

    for query in queries:
        encoded_query = urllib.parse.quote(query)
        url = (
            "https://api.github.com/search/repositories"
            f"?q={encoded_query}&sort=updated&order=desc&per_page={max_per_query}"
        )
        fetched = fetch_url_text(url, accept="application/vnd.github+json")
        if not fetched["ok"]:
            failures.append(f"{query}: status={fetched['status_code']} ({fetched['error']})")
            continue
        try:
            payload = json.loads(fetched["body"])
        except json.JSONDecodeError:
            failures.append(f"{query}: invalid JSON")
            continue

        items = payload.get("items", [])
        if not isinstance(items, list):
            continue
        for item in items:
            if not isinstance(item, dict):
                continue
            full_name = item.get("full_name")
            if not full_name:
                continue
            existing = repositories.get(full_name)
            normalized = {
                "full_name": full_name,
                "url": item.get("html_url"),
                "description": truncate_text(item.get("description") or "", 220),
                "language": item.get("language"),
                "stars": item.get("stargazers_count"),
                "forks": item.get("forks_count"),
                "open_issues": item.get("open_issues_count"),
                "updated_at": item.get("updated_at"),
                "pushed_at": item.get("pushed_at"),
                "topics": item.get("topics", []) if isinstance(item.get("topics"), list) else [],
                "query": query,
                "relevance_score": relevance_score(
                    f"{full_name} {(item.get('description') or '')} "
                    f"{' '.join(item.get('topics', []) if isinstance(item.get('topics'), list) else [])}"
                ),
                "source": "github_search_api",
            }
            if existing is None:
                repositories[full_name] = normalized
            else:
                seen_queries = set(existing.get("queries", [existing.get("query", "")]))
                seen_queries.add(query)
                existing["queries"] = sorted(item for item in seen_queries if item)
                existing["updated_at"] = max(existing.get("updated_at") or "", normalized.get("updated_at") or "")

    for curated in fetch_curated_github_repositories():
        if curated["full_name"] not in repositories:
            repositories[curated["full_name"]] = curated

    entries = list(repositories.values())
    filtered = [entry for entry in entries if is_avatar_repo_entry(entry)]
    if not filtered:
        filtered = entries
    filtered.sort(
        key=lambda item: (
            int(item.get("relevance_score", 0)),
            parse_iso_date(item.get("pushed_at")),
            parse_iso_date(item.get("updated_at")),
            int(item.get("stars") or 0),
        ),
        reverse=True,
    )
    return {
        "queries": queries,
        "total_collected": len(entries),
        "total_after_relevance_filter": len(filtered),
        "failures": failures,
        "repositories": filtered[:max_total],
    }


def build_query_plan(state: dict[str, Any]) -> dict[str, list[str]]:
    focus_terms = state.get("focus_terms", [])
    if not isinstance(focus_terms, list):
        focus_terms = []
    cleaned_terms: list[str] = []
    for term in focus_terms:
        token = str(term).strip().lower()
        if not token:
            continue
        if token in STOPWORDS:
            continue
        if not re.match(r"^[a-z0-9\-\+]{3,}$", token):
            continue
        if not is_domain_term(token):
            continue
        cleaned_terms.append(token)
    focus_terms = cleaned_terms

    high_precision_terms = [
        term
        for term in focus_terms
        if term
        in {
            "metahuman",
            "livelink",
            "livekit",
            "avatar",
            "talking",
            "liveportrait",
            "sadtalker",
            "linly-talker",
            "audio2face",
            "gaussian",
            "splatting",
            "gaussian-splatting",
            "facial",
            "gaze",
            "gesture",
        }
    ]

    extra_arxiv = [f"{term} avatar" for term in high_precision_terms[:4]]
    extra_github = high_precision_terms[:8]
    arxiv_queries = list(dict.fromkeys(BASE_ARXIV_QUERIES + extra_arxiv))
    github_queries = list(dict.fromkeys(BASE_GITHUB_QUERIES + extra_github))
    return {
        "arxiv_queries": arxiv_queries,
        "github_queries": github_queries,
        "focus_terms": focus_terms,
    }


def tokenize(text: str) -> list[str]:
    return [token for token in re.findall(r"[a-z0-9][a-z0-9\-\+]{2,}", text.lower())]


def derive_focus_terms(
    current_focus_terms: list[str],
    arxiv_entries: list[dict[str, Any]],
    github_entries: list[dict[str, Any]],
    limit: int = 16,
) -> tuple[list[str], list[str]]:
    counter: Counter[str] = Counter()
    for entry in arxiv_entries:
        text = f"{entry.get('title', '')} {entry.get('summary', '')}"
        counter.update(token for token in tokenize(text) if token not in STOPWORDS)
    for repo in github_entries:
        text = f"{repo.get('full_name', '')} {repo.get('description', '')}"
        topics = " ".join(repo.get("topics", [])) if isinstance(repo.get("topics"), list) else ""
        counter.update(token for token in tokenize(f"{text} {topics}") if token not in STOPWORDS)

    candidates = [token for token, _ in counter.most_common(40)]
    merged = [token for token in current_focus_terms if token]
    added: list[str] = []
    for token in candidates:
        if not is_domain_term(token):
            continue
        if token in merged:
            continue
        merged.append(token)
        added.append(token)
        if len(merged) >= limit:
            break
    return merged[:limit], added


def compute_research_delta(previous: dict[str, Any] | None, current: dict[str, Any]) -> dict[str, Any]:
    previous_arxiv = set()
    previous_repos = set()
    if isinstance(previous, dict):
        prev_arxiv_payload = previous.get("research", {}).get("arxiv", {})
        prev_repo_payload = previous.get("research", {}).get("github", {})
        for entry in prev_arxiv_payload.get("entries", []):
            if isinstance(entry, dict) and entry.get("id"):
                previous_arxiv.add(entry["id"])
        for repo in prev_repo_payload.get("repositories", []):
            if isinstance(repo, dict) and repo.get("full_name"):
                previous_repos.add(repo["full_name"])

    current_arxiv_entries = current.get("research", {}).get("arxiv", {}).get("entries", [])
    current_repo_entries = current.get("research", {}).get("github", {}).get("repositories", [])

    new_arxiv = [
        entry.get("id")
        for entry in current_arxiv_entries
        if isinstance(entry, dict) and entry.get("id") and entry.get("id") not in previous_arxiv
    ]
    new_repos = [
        repo.get("full_name")
        for repo in current_repo_entries
        if isinstance(repo, dict) and repo.get("full_name") and repo.get("full_name") not in previous_repos
    ]
    return {
        "new_arxiv_entries": new_arxiv[:30],
        "new_github_repositories": new_repos[:30],
        "new_arxiv_count": len(new_arxiv),
        "new_github_repo_count": len(new_repos),
    }


def build_architecture_payload() -> dict[str, Any]:
    return {
        "generated_at": now_iso(),
        "layers": [
            {
                "name": "Input Modalities",
                "components": [
                    "user_audio_stream",
                    "user_video_webcam",
                    "head_pose_gaze",
                    "text_chat",
                    "session_context",
                ],
            },
            {
                "name": "Perception + Social Signal Extraction",
                "components": [
                    "asr_and_prosody",
                    "vision_landmarks_expression",
                    "turn_taking_detector",
                    "emotion_state_estimator",
                ],
            },
            {
                "name": "Narrative + Dialogue Cognition",
                "components": [
                    "llm_dialogue_policy",
                    "persona_memory",
                    "narrative_planner",
                    "safety_guardrails",
                ],
            },
            {
                "name": "Behavior Planner",
                "components": [
                    "speech_text_to_tts",
                    "prosody_to_expression",
                    "gaze_and_head_scheduler",
                    "gesture_intent_timeline",
                ],
            },
            {
                "name": "Renderer Adapters",
                "components": [
                    "metahuman_livelink_adapter",
                    "video_diffusion_condition_adapter",
                    "gaussian_avatar_control_adapter",
                ],
            },
            {
                "name": "Output Modalities",
                "components": [
                    "speech_audio",
                    "facial_motion",
                    "head_gaze_motion",
                    "upper_body_gesture",
                    "rendered_video_stream",
                ],
            },
        ],
        "shared_contract": {
            "name": "SocialBehaviorFrame",
            "fields": [
                "timestamp_ms",
                "utterance_text",
                "phoneme_timeline",
                "prosody_features",
                "emotion_distribution",
                "head_pose",
                "gaze_target",
                "expression_coefficients",
                "gesture_tokens",
                "turn_state",
                "narrative_intent",
            ],
        },
        "realtime_targets": {
            "interaction_roundtrip_ms": 500,
            "motion_to_photon_ms": 120,
            "streaming_fps_target": 30,
            "xr_fps_target": 72,
        },
    }


def build_dependency_graph_payload() -> dict[str, Any]:
    nodes = [
        {"id": "input_audio", "label": "Audio Input", "group": "input"},
        {"id": "input_video", "label": "Video Input", "group": "input"},
        {"id": "input_text", "label": "Text Input", "group": "input"},
        {"id": "signal_core", "label": "Social Signal Core", "group": "core"},
        {"id": "narrative_core", "label": "Narrative Core", "group": "core"},
        {"id": "behavior_core", "label": "Behavior Planner", "group": "core"},
        {"id": "adapter_metahuman", "label": "MetaHuman Adapter", "group": "adapter"},
        {"id": "adapter_video", "label": "VideoGen Adapter", "group": "adapter"},
        {"id": "adapter_gaussian", "label": "Gaussian Adapter", "group": "adapter"},
        {"id": "output_stream", "label": "Realtime Stream", "group": "output"},
    ]
    edges = [
        {"from": "input_audio", "to": "signal_core", "kind": "signal"},
        {"from": "input_video", "to": "signal_core", "kind": "signal"},
        {"from": "input_text", "to": "narrative_core", "kind": "semantic"},
        {"from": "signal_core", "to": "narrative_core", "kind": "context"},
        {"from": "signal_core", "to": "behavior_core", "kind": "control"},
        {"from": "narrative_core", "to": "behavior_core", "kind": "intent"},
        {"from": "behavior_core", "to": "adapter_metahuman", "kind": "adapter"},
        {"from": "behavior_core", "to": "adapter_video", "kind": "adapter"},
        {"from": "behavior_core", "to": "adapter_gaussian", "kind": "adapter"},
        {"from": "adapter_metahuman", "to": "output_stream", "kind": "render"},
        {"from": "adapter_video", "to": "output_stream", "kind": "render"},
        {"from": "adapter_gaussian", "to": "output_stream", "kind": "render"},
    ]
    return {
        "generated_at": now_iso(),
        "nodes": nodes,
        "edges": edges,
        "totals": {"nodes": len(nodes), "edges": len(edges)},
    }


def build_dependency_mermaid(graph_payload: dict[str, Any]) -> str:
    node_lookup = {node["id"]: node["label"] for node in graph_payload.get("nodes", [])}
    lines = ["graph LR"]
    for node_id, label in node_lookup.items():
        safe = re.sub(r"[^A-Za-z0-9_]", "_", node_id)
        lines.append(f'  {safe}["{label}"]')
    for edge in graph_payload.get("edges", []):
        src = re.sub(r"[^A-Za-z0-9_]", "_", edge["from"])
        dst = re.sub(r"[^A-Za-z0-9_]", "_", edge["to"])
        label = edge.get("kind", "")
        lines.append(f"  {src} -->|{label}| {dst}")
    return "\n".join(lines) + "\n"


def append_progress(
    progress_file: Path,
    cycle: int,
    payload: dict[str, Any],
    delta: dict[str, Any],
    added_focus_terms: list[str],
) -> None:
    progress_file.parent.mkdir(parents=True, exist_ok=True)
    report_lines = [
        f"## {payload['generated_at']} (cycle {cycle})",
        "",
        f"- Slide URL: `{payload['slide']['url']}` (status `{payload['slide']['status_code']}`)",
        f"- Slide claims checked: `{payload['claim_check']['totals']['claims_checked']}`",
        f"- Mismatched claims: `{payload['claim_check']['totals']['mismatched_claims']}`",
        f"- ArXiv entries: `{len(payload['research']['arxiv']['entries'])}` (new `{delta['new_arxiv_count']}`)",
        f"- GitHub repositories: `{len(payload['research']['github']['repositories'])}` (new `{delta['new_github_repo_count']}`)",
    ]
    if added_focus_terms:
        report_lines.append(f"- New focus terms: `{', '.join(added_focus_terms[:10])}`")
    report_lines.append("")
    with progress_file.open("a", encoding="utf-8") as handle:
        handle.write("\n".join(report_lines) + "\n")


def make_report_markdown(payload: dict[str, Any], delta: dict[str, Any], cycle: int) -> str:
    claim_check = payload["claim_check"]
    mismatch_items = [item for item in claim_check["checks"] if not item["matches_recommendation"]]

    lines: list[str] = []
    lines.append("# Full-Modality Social Interaction Research")
    lines.append("")
    lines.append(f"- Generated at (UTC): `{payload['generated_at']}`")
    lines.append(f"- Cycle: `{cycle}`")
    lines.append(f"- Slide URL: `{payload['slide']['url']}`")
    lines.append(f"- Slide status: `{payload['slide']['status_code']}`")
    lines.append(f"- Slide title: `{payload['slide']['title'] or 'n/a'}`")
    lines.append("")

    lines.append("## Slide-5 Verification")
    lines.append("")
    lines.append(f"- Claims checked: `{claim_check['totals']['claims_checked']}`")
    lines.append(f"- Mismatched claims: `{claim_check['totals']['mismatched_claims']}`")
    lines.append("")
    if mismatch_items:
        lines.append("### Recommended Corrections")
        lines.append("")
        for item in mismatch_items[:20]:
            lines.append(f"- `{item['section']}/{item['signal']}`")
            for mismatch in item["mismatches"]:
                lines.append(
                    f"  - {mismatch['method']}: slide=`{mismatch['slide_support']}` "
                    f"recommended=`{mismatch['recommended_support']}` "
                    f"(level `{mismatch['recommended_level']}`)"
                )
        lines.append("")

    lines.append("## Full-Modality Architecture")
    lines.append("")
    lines.append("Unified pipeline contract: `SocialBehaviorFrame`")
    lines.append("Core path: `Input -> Signal Core -> Narrative Core -> Behavior Planner -> Technique Adapter -> Output`.")
    lines.append("")
    lines.append("Technique adapters:")
    lines.append("- `MetaHuman`: deterministic rig control via Live Link / ARKit-style coefficients.")
    lines.append("- `Video Generation`: conditional image/video synthesis from audio+text+motion inputs.")
    lines.append("- `Gaussian Splatting`: explicit 3D neural rendering with audio/pose-driven control.")
    lines.append("")

    lines.append("## Research Delta")
    lines.append("")
    lines.append(f"- New ArXiv entries this cycle: `{delta['new_arxiv_count']}`")
    lines.append(f"- New GitHub repositories this cycle: `{delta['new_github_repo_count']}`")
    lines.append("")

    lines.append("### ArXiv Highlights")
    lines.append("")
    for entry in payload["research"]["arxiv"]["entries"][:12]:
        lines.append(
            f"- `{entry.get('title')}` ({entry.get('updated') or entry.get('published')}) - "
            f"{entry.get('id')} [score `{entry.get('relevance_score')}`, source `{entry.get('source')}`]"
        )
    lines.append("")

    lines.append("### GitHub Highlights")
    lines.append("")
    failures = payload["research"]["github"].get("failures", [])
    if failures:
        lines.append(f"- GitHub API warnings: `{len(failures)}` (using curated fallback where needed)")
    for repo in payload["research"]["github"]["repositories"][:12]:
        lines.append(
            f"- `{repo.get('full_name')}` (stars `{repo.get('stars')}`, pushed `{repo.get('pushed_at')}`, source `{repo.get('source')}`)"
        )
    lines.append("")

    lines.append("## Evidence Links")
    lines.append("")
    for key in sorted(EVIDENCE_REFERENCES.keys()):
        ref = EVIDENCE_REFERENCES[key]
        lines.append(f"- `{key}`: {ref['url']}")
    lines.append("")

    return "\n".join(lines).rstrip() + "\n"


def load_state(state_file: Path) -> dict[str, Any]:
    state = read_json(state_file)
    if not isinstance(state, dict):
        return {
            "cycles_completed": 0,
            "last_run": None,
            "focus_terms": [],
            "last_claim_mismatch_count": 0,
        }
    return state


def save_state(state_file: Path, state: dict[str, Any]) -> None:
    write_json(state_file, state)


def append_event(events_file: Path, event: dict[str, Any]) -> None:
    events_file.parent.mkdir(parents=True, exist_ok=True)
    with events_file.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(event, ensure_ascii=True) + "\n")


def publish_outputs(
    repo_root: Path,
    payload: dict[str, Any],
    report_markdown: str,
    architecture_payload: dict[str, Any],
    dependency_graph_payload: dict[str, Any],
    dependency_mermaid: str,
    claim_check_payload: dict[str, Any],
    progress_file: Path,
) -> None:
    docs_dir = repo_root / "web" / "public" / "docs"
    docs_dir.mkdir(parents=True, exist_ok=True)
    (docs_dir / "full-modality-research-latest.md").write_text(report_markdown, encoding="utf-8")
    write_json(docs_dir / "full-modality-research-latest.json", payload)
    write_json(docs_dir / "full-modality-architecture-latest.json", architecture_payload)
    write_json(docs_dir / "full-modality-dependency-graph-latest.json", dependency_graph_payload)
    (docs_dir / "full-modality-dependency-graph-latest.mmd").write_text(dependency_mermaid, encoding="utf-8")
    write_json(docs_dir / "full-modality-claim-check-latest.json", claim_check_payload)
    if progress_file.exists():
        (docs_dir / "full-modality-research-progress.md").write_text(read_text(progress_file), encoding="utf-8")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run one full-modality social research evolution cycle.")
    parser.add_argument("--repo-root", type=str, default=None, help="Repository root override")
    parser.add_argument("--slide-url", type=str, default=DEFAULT_SLIDE_URL, help="Slide URL to verify")
    parser.add_argument(
        "--slide-source",
        type=str,
        default=str(DEFAULT_SLIDE_SOURCE),
        help="Slide source path relative to repo root",
    )
    parser.add_argument("--max-arxiv-per-query", type=int, default=8, help="ArXiv results per query")
    parser.add_argument("--max-arxiv-total", type=int, default=60, help="ArXiv total retained")
    parser.add_argument("--max-github-per-query", type=int, default=8, help="GitHub repos per query")
    parser.add_argument("--max-github-total", type=int, default=60, help="GitHub total retained")
    parser.add_argument("--no-publish", action="store_true", help="Do not write to web/public/docs")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    script_path = Path(__file__).resolve()
    skill_root = script_path.parent.parent
    repo_root = Path(args.repo_root).resolve() if args.repo_root else find_repo_root(skill_root)

    references_dir = skill_root / "references"
    history_dir = references_dir / "history"
    references_dir.mkdir(parents=True, exist_ok=True)
    history_dir.mkdir(parents=True, exist_ok=True)

    latest_research_file = references_dir / "latest-research.json"
    latest_report_file = references_dir / "latest-report.md"
    latest_architecture_file = references_dir / "latest-architecture.json"
    latest_dependency_graph_file = references_dir / "latest-dependency-graph.json"
    latest_dependency_mermaid_file = references_dir / "latest-dependency-graph.mmd"
    latest_claim_check_file = references_dir / "latest-claim-check.json"
    progress_file = references_dir / "progress.md"
    state_file = skill_root / "state.json"
    events_file = skill_root / "events.jsonl"

    previous_payload = read_json(latest_research_file)
    state = load_state(state_file)
    cycle_number = int(state.get("cycles_completed", 0)) + 1

    query_plan = build_query_plan(state)
    arxiv_payload = fetch_arxiv_corpus(
        query_plan["arxiv_queries"],
        max_per_query=max(2, args.max_arxiv_per_query),
        max_total=max(10, args.max_arxiv_total),
    )
    github_payload = fetch_github_repositories(
        query_plan["github_queries"],
        max_per_query=max(2, args.max_github_per_query),
        max_total=max(10, args.max_github_total),
    )

    slide_source_path = repo_root / args.slide_source
    slide_source_text = read_text(slide_source_path)
    slide_signals = parse_slide5_signals(slide_source_text)
    claim_check_payload = build_claim_check(slide_signals)

    live_slide = fetch_url_text(args.slide_url, accept="text/html,application/xhtml+xml")
    slide_payload = {
        "url": args.slide_url,
        "source_path": str(slide_source_path),
        "source_exists": slide_source_path.exists(),
        "status_code": live_slide.get("status_code"),
        "ok": bool(live_slide.get("ok")),
        "title": extract_html_title(live_slide.get("body", "")),
        "error": live_slide.get("error"),
        "sections_parsed": {key: len(value) for key, value in slide_signals.items()},
    }

    current_payload = {
        "generated_at": now_iso(),
        "cycle": cycle_number,
        "slide": slide_payload,
        "claim_check": claim_check_payload,
        "research": {
            "arxiv": arxiv_payload,
            "github": github_payload,
        },
        "evidence_references": EVIDENCE_REFERENCES,
        "query_plan": query_plan,
    }

    delta = compute_research_delta(previous_payload, current_payload)
    current_payload["delta"] = delta

    new_focus_terms, added_focus_terms = derive_focus_terms(
        query_plan["focus_terms"],
        arxiv_payload["entries"],
        github_payload["repositories"],
    )
    current_payload["focus_terms_next"] = new_focus_terms
    current_payload["focus_terms_added"] = added_focus_terms

    architecture_payload = build_architecture_payload()
    dependency_graph_payload = build_dependency_graph_payload()
    dependency_mermaid = build_dependency_mermaid(dependency_graph_payload)
    report_markdown = make_report_markdown(current_payload, delta, cycle_number)

    run_stamp = timestamp_for_filename()
    write_json(latest_research_file, current_payload)
    latest_report_file.write_text(report_markdown, encoding="utf-8")
    write_json(latest_architecture_file, architecture_payload)
    write_json(latest_dependency_graph_file, dependency_graph_payload)
    latest_dependency_mermaid_file.write_text(dependency_mermaid, encoding="utf-8")
    write_json(latest_claim_check_file, claim_check_payload)

    write_json(history_dir / f"research-{run_stamp}.json", current_payload)
    write_json(history_dir / f"architecture-{run_stamp}.json", architecture_payload)
    write_json(history_dir / f"dependency-graph-{run_stamp}.json", dependency_graph_payload)
    (history_dir / f"dependency-graph-{run_stamp}.mmd").write_text(dependency_mermaid, encoding="utf-8")
    write_json(history_dir / f"claim-check-{run_stamp}.json", claim_check_payload)

    append_progress(progress_file, cycle_number, current_payload, delta, added_focus_terms)

    event = {
        "timestamp": current_payload["generated_at"],
        "cycle": cycle_number,
        "slide_status_code": slide_payload["status_code"],
        "slide_claims_checked": claim_check_payload["totals"]["claims_checked"],
        "slide_mismatched_claims": claim_check_payload["totals"]["mismatched_claims"],
        "arxiv_entries": len(arxiv_payload["entries"]),
        "github_repositories": len(github_payload["repositories"]),
        "new_arxiv_entries": delta["new_arxiv_count"],
        "new_github_repositories": delta["new_github_repo_count"],
        "focus_terms_added": added_focus_terms[:12],
        "latest_report_file": str(latest_report_file),
        "latest_research_file": str(latest_research_file),
    }
    append_event(events_file, event)

    state.update(
        {
            "cycles_completed": cycle_number,
            "last_run": current_payload["generated_at"],
            "last_slide_url": args.slide_url,
            "focus_terms": new_focus_terms,
            "last_claim_mismatch_count": claim_check_payload["totals"]["mismatched_claims"],
            "last_report_file": str(latest_report_file),
            "last_research_file": str(latest_research_file),
        }
    )
    save_state(state_file, state)

    if not args.no_publish:
        publish_outputs(
            repo_root=repo_root,
            payload=current_payload,
            report_markdown=report_markdown,
            architecture_payload=architecture_payload,
            dependency_graph_payload=dependency_graph_payload,
            dependency_mermaid=dependency_mermaid,
            claim_check_payload=claim_check_payload,
            progress_file=progress_file,
        )

    print(
        "[OK] Full-modality social research cycle complete: "
        f"cycle={cycle_number}, claims={claim_check_payload['totals']['claims_checked']}, "
        f"mismatches={claim_check_payload['totals']['mismatched_claims']}, "
        f"arxiv={len(arxiv_payload['entries'])}, github={len(github_payload['repositories'])}"
    )
    print(f"[OK] Report: {latest_report_file}")
    print(f"[OK] Research: {latest_research_file}")
    print(f"[OK] Claim check: {latest_claim_check_file}")
    if not args.no_publish:
        print(f"[OK] Published: {repo_root / 'web' / 'public' / 'docs' / 'full-modality-research-latest.md'}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
