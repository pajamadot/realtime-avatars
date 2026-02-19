#!/usr/bin/env python3
"""
Self-evolving proofreading + evidence checker for research slides.

Cycle responsibilities:
1) Audit research-focused slide functions in web/app/slides/SlidesDeck.tsx.
2) Verify each target slide contains source links from primary domains.
3) Persist machine-readable and human-readable claim-check artifacts.
4) Keep cycle state/history for repeatable self-evolution.
"""

from __future__ import annotations

import argparse
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.parse import urlparse


SKILL_DIR = Path(__file__).resolve().parents[1]
REPO_ROOT = Path(__file__).resolve().parents[4]
SLIDES_PATH = REPO_ROOT / "web" / "app" / "slides" / "SlidesDeck.tsx"

REF_DIR = SKILL_DIR / "references"
HISTORY_DIR = REF_DIR / "history"
STATE_PATH = SKILL_DIR / "state.json"
EVENTS_PATH = SKILL_DIR / "events.jsonl"
LATEST_JSON_PATH = REF_DIR / "latest-claim-check.json"
LATEST_MD_PATH = REF_DIR / "latest-report.md"
PROGRESS_PATH = REF_DIR / "progress.md"

PUBLISH_JSON = REPO_ROOT / "web" / "public" / "docs" / "slide-proofread-latest.json"
PUBLISH_MD = REPO_ROOT / "web" / "public" / "docs" / "slide-proofread-latest.md"

FUNCTION_RE = re.compile(r"^function\s+(Slide[A-Za-z0-9_]+)\s*\(", re.MULTILINE)
URL_RE = re.compile(r"https?://[^\s'\"`<>()]+")
CONST_URL_RE = re.compile(r"const\s+([A-Za-z0-9_]+)\s*=\s*'(https?://[^']+)';")
EVIDENCE_BLOCK_RE = re.compile(r"const\s+EVIDENCE_URLS\s*=\s*\{(?P<body>.*?)\}\s*as const;", re.DOTALL)
EVIDENCE_ENTRY_RE = re.compile(r"([A-Za-z0-9_]+)\s*:\s*'(https?://[^']+)'")

PRIMARY_SOURCE_DOMAINS = {
    "arxiv.org",
    "dev.epicgames.com",
    "github.com",
    "docs.nvidia.com",
    "developer.nvidia.com",
}

TARGET_SLIDES = [
    "SlideThreeApproaches",
    "SlideMetahumanHow",
    "SlideMetahumanIdentityResponse",
    "SlideGenerativeHow",
    "SlideGenerativeIdentityResponse",
    "SlideGenerativeMechanism",
    "SlideGenerativeResearch",
    "SlideGaussianHow",
    "SlideGaussianIdentityResponse",
    "SlideGaussianMechanism",
    "SlideGaussianCovariance",
    "SlideSignalsInteraction",
    "SlideCapabilityMatrix",
    "SlideAudio2FaceBuildingBlocks",
    "SlideWhereIntelligenceLives",
    "SlideResearchFrontier",
    "SlideConvergenceUpdated",
]

DEFAULT_STATE: dict[str, Any] = {
    "cycles_completed": 0,
    "last_run": None,
    "last_pass_rate": 0.0,
    "target_slides": TARGET_SLIDES,
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


def extract_slide_blocks(source: str) -> dict[str, str]:
    matches = list(FUNCTION_RE.finditer(source))
    blocks: dict[str, str] = {}
    for idx, match in enumerate(matches):
        name = match.group(1)
        start = match.start()
        end = matches[idx + 1].start() if idx + 1 < len(matches) else len(source)
        blocks[name] = source[start:end]
    return blocks


def extract_url_constants(source: str) -> tuple[dict[str, str], dict[str, str]]:
    const_urls: dict[str, str] = {}
    evidence_urls: dict[str, str] = {}

    for name, url in CONST_URL_RE.findall(source):
        const_urls[name] = url

    block = EVIDENCE_BLOCK_RE.search(source)
    if block:
        for key, url in EVIDENCE_ENTRY_RE.findall(block.group("body")):
            evidence_urls[key] = url

    return const_urls, evidence_urls


def is_primary_source(url: str) -> bool:
    try:
        hostname = (urlparse(url).hostname or "").lower()
    except Exception:
        return False
    if not hostname:
        return False
    return any(hostname == domain or hostname.endswith("." + domain) for domain in PRIMARY_SOURCE_DOMAINS)


def audit_block(
    name: str,
    block: str,
    min_primary_sources: int,
    const_urls: dict[str, str],
    evidence_urls: dict[str, str],
) -> dict[str, Any]:
    urls = set(URL_RE.findall(block))

    for const_name, url in const_urls.items():
        if const_name in block:
            urls.add(url)

    for key, url in evidence_urls.items():
        if f"EVIDENCE_URLS.{key}" in block:
            urls.add(url)

    url_list = sorted(urls)
    primary_urls = [u for u in url_list if is_primary_source(u)]
    evidence_strip_count = block.count("SlideEvidenceStrip")

    issues: list[str] = []
    if evidence_strip_count == 0:
        issues.append("missing SlideEvidenceStrip")
    if len(primary_urls) < min_primary_sources:
        issues.append(f"only {len(primary_urls)} primary source link(s), need >= {min_primary_sources}")

    status = "pass" if not issues else "warn"
    return {
        "slide": name,
        "status": status,
        "issue_count": len(issues),
        "issues": issues,
        "evidence_strip_count": evidence_strip_count,
        "total_urls": len(url_list),
        "primary_urls": primary_urls,
    }


def build_markdown_report(payload: dict[str, Any]) -> str:
    lines: list[str] = []
    lines.append("# Slide Research Proofread Report")
    lines.append("")
    lines.append(f"- Generated at (UTC): `{payload['generated_at']}`")
    lines.append(f"- Cycle: `{payload['cycle']}`")
    lines.append(f"- Target slides: `{payload['summary']['target_count']}`")
    lines.append(f"- Passed: `{payload['summary']['pass_count']}`")
    lines.append(f"- Warned: `{payload['summary']['warn_count']}`")
    lines.append(f"- Pass rate: `{payload['summary']['pass_rate_percent']}%`")
    lines.append("")
    lines.append("## Slide Results")
    lines.append("")

    for row in payload["slides"]:
        mark = "PASS" if row["status"] == "pass" else "WARN"
        lines.append(f"### {row['slide']} [{mark}]")
        lines.append(f"- Evidence strip count: `{row['evidence_strip_count']}`")
        lines.append(f"- Primary source links: `{len(row['primary_urls'])}`")
        if row["issues"]:
            lines.append(f"- Issues: `{' | '.join(row['issues'])}`")
        else:
            lines.append("- Issues: `none`")
        if row["primary_urls"]:
            lines.append("- Primary links:")
            for u in row["primary_urls"][:6]:
                lines.append(f"  - {u}")
        lines.append("")

    return "\n".join(lines).rstrip() + "\n"


def main() -> int:
    parser = argparse.ArgumentParser(description="Audit research slides for evidence-backed claims.")
    parser.add_argument("--min-primary-sources", type=int, default=2, help="Minimum primary source links required per research slide.")
    parser.add_argument("--no-publish", action="store_true", help="Skip publishing mirrors into web/public/docs.")
    parser.add_argument("--strict", action="store_true", help="Exit non-zero when any slide has warnings.")
    args = parser.parse_args()

    if not SLIDES_PATH.exists():
        raise FileNotFoundError(f"Slides file not found: {SLIDES_PATH}")

    ensure_dirs()
    state = load_json(STATE_PATH, DEFAULT_STATE.copy())
    prev = load_json(LATEST_JSON_PATH, {"slides": []})

    source = SLIDES_PATH.read_text(encoding="utf-8", errors="replace")
    blocks = extract_slide_blocks(source)
    const_urls, evidence_urls = extract_url_constants(source)

    rows: list[dict[str, Any]] = []
    missing_functions: list[str] = []
    for name in TARGET_SLIDES:
        block = blocks.get(name)
        if block is None:
            missing_functions.append(name)
            rows.append(
                {
                    "slide": name,
                    "status": "warn",
                    "issue_count": 1,
                    "issues": ["function not found in SlidesDeck.tsx"],
                    "evidence_strip_count": 0,
                    "total_urls": 0,
                    "primary_urls": [],
                }
            )
            continue
        rows.append(
            audit_block(
                name,
                block,
                max(1, args.min_primary_sources),
                const_urls=const_urls,
                evidence_urls=evidence_urls,
            )
        )

    pass_count = sum(1 for r in rows if r["status"] == "pass")
    warn_count = len(rows) - pass_count
    pass_rate = (pass_count / len(rows)) if rows else 0.0

    prev_lookup = {row.get("slide"): row for row in prev.get("slides", []) if isinstance(row, dict)}
    newly_warned: list[str] = []
    recovered: list[str] = []
    for row in rows:
        old = prev_lookup.get(row["slide"])
        old_status = old.get("status") if isinstance(old, dict) else None
        if old_status == "pass" and row["status"] == "warn":
            newly_warned.append(row["slide"])
        if old_status == "warn" and row["status"] == "pass":
            recovered.append(row["slide"])

    cycle = int(state.get("cycles_completed", 0)) + 1
    ts = now_utc()
    payload = {
        "generated_at": iso(ts),
        "cycle": cycle,
        "slides_path": str(SLIDES_PATH.relative_to(REPO_ROOT)),
        "target_slides": TARGET_SLIDES,
        "summary": {
            "target_count": len(rows),
            "pass_count": pass_count,
            "warn_count": warn_count,
            "pass_rate_percent": round(pass_rate * 100, 1),
            "missing_functions": missing_functions,
        },
        "delta": {
            "newly_warned": newly_warned,
            "recovered": recovered,
        },
        "slides": rows,
    }

    report_md = build_markdown_report(payload)

    save_json(LATEST_JSON_PATH, payload)
    save_text(LATEST_MD_PATH, report_md)

    stamp = slug_ts(ts)
    save_json(HISTORY_DIR / f"claim-check-{stamp}.json", payload)
    save_text(HISTORY_DIR / f"report-{stamp}.md", report_md)

    if not args.no_publish:
        save_json(PUBLISH_JSON, payload)
        save_text(PUBLISH_MD, report_md)

    state.update(
        {
            "cycles_completed": cycle,
            "last_run": payload["generated_at"],
            "last_pass_rate": payload["summary"]["pass_rate_percent"],
            "last_warn_count": warn_count,
            "last_missing_functions": missing_functions,
        }
    )
    save_json(STATE_PATH, state)

    event = {
        "ts": payload["generated_at"],
        "skill": "slide-research-proofreader-evolver",
        "cycle": cycle,
        "pass_count": pass_count,
        "warn_count": warn_count,
        "newly_warned": newly_warned,
        "recovered": recovered,
    }
    append_line(EVENTS_PATH, json.dumps(event, ensure_ascii=False) + "\n")

    progress = [
        f"## {payload['generated_at']} (cycle {cycle})",
        "",
        f"- Target slides: `{len(rows)}`",
        f"- Passed: `{pass_count}`",
        f"- Warned: `{warn_count}`",
        f"- Pass rate: `{payload['summary']['pass_rate_percent']}%`",
        f"- Newly warned: `{', '.join(newly_warned) if newly_warned else 'none'}`",
        f"- Recovered: `{', '.join(recovered) if recovered else 'none'}`",
        "",
    ]
    append_line(PROGRESS_PATH, "\n".join(progress))

    if args.strict and warn_count > 0:
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
