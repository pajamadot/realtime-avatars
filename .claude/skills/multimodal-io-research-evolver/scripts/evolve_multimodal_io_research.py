#!/usr/bin/env python3
"""
Multimodal inputs/outputs research evolver.

This skill runner:
1) Refreshes the full-modality social research corpus.
2) Distills method-level multimodal I/O conclusions for:
   - MetaHuman
   - Video Generation
   - Gaussian Splatting
3) Upserts a canonical conclusion section into:
   deep-research-multimodal_inputs_outputs.md
4) Persists cycle state/events/history for repeatable self-evolution.
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


METHOD_ORDER = ["metahuman", "video_generation", "gaussian_splatting"]
METHOD_LABELS = {
    "metahuman": "MetaHuman",
    "video_generation": "Video Generation",
    "gaussian_splatting": "Gaussian Splatting",
}
METHOD_SHORT = {"metahuman": "MH", "video_generation": "VG", "gaussian_splatting": "GS"}
SECTION_ORDER = ["inputs", "outputs", "coupling"]
SECTION_LABELS = {"inputs": "User Inputs", "outputs": "Agent Outputs", "coupling": "Coupling Styles"}
SUPPORT_LABELS = {0: "Not native", 1: "Conditional", 2: "Native"}

MARKER = "## Skill Conclusion: Multimodal Inputs/Outputs by Approach"
TARGET_RESEARCH_MD = "deep-research-multimodal_inputs_outputs.md"


def now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def timestamp_for_filename() -> str:
    return datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")


def find_repo_root(start: Path) -> Path:
    for candidate in [start, *start.parents]:
        if (candidate / ".git").exists():
            return candidate
    return start


def read_text(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8", errors="ignore")
    except OSError:
        return ""


def write_text(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


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


def normalize_score(value: Any) -> int:
    if isinstance(value, bool):
        return 2 if value else 0
    if isinstance(value, int):
        return max(0, min(2, value))
    return 0


def load_state(path: Path) -> dict[str, Any]:
    payload = read_json(path)
    if not isinstance(payload, dict):
        return {"cycles_completed": 0, "last_run": None}
    return payload


def append_event(path: Path, event: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(event, ensure_ascii=True) + "\n")


def append_progress(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    lines = [
        f"## {payload['generated_at']} (cycle {payload['cycle']})",
        "",
        f"- Core cycle: `{payload['core_cycle']}`",
        f"- ArXiv tracked: `{len(payload['research']['arxiv_ids'])}`",
        f"- GitHub tracked: `{len(payload['research']['github_repos'])}`",
        f"- New ArXiv in cycle: `{payload['delta']['new_arxiv_count']}`",
        f"- New GitHub in cycle: `{payload['delta']['new_github_repo_count']}`",
        "",
    ]
    with path.open("a", encoding="utf-8") as handle:
        handle.write("\n".join(lines))


def run_core_refresh(repo_root: Path, args: argparse.Namespace) -> None:
    core_runner = repo_root / ".claude" / "skills" / "full-modality-social-evolver" / "scripts" / "evolve_social_modality_research.py"
    if not core_runner.exists():
        raise FileNotFoundError(f"Core runner not found: {core_runner}")

    cmd = [
        sys.executable,
        str(core_runner),
        "--repo-root",
        str(repo_root),
        "--slide-url",
        str(args.slide_url),
        "--slide-source",
        str(args.slide_source),
        "--max-arxiv-per-query",
        str(max(2, args.max_arxiv_per_query)),
        "--max-arxiv-total",
        str(max(10, args.max_arxiv_total)),
        "--max-github-per-query",
        str(max(2, args.max_github_per_query)),
        "--max-github-total",
        str(max(10, args.max_github_total)),
    ]
    if args.no_publish:
        cmd.append("--no-publish")

    completed = subprocess.run(cmd, capture_output=True, text=True, check=False)
    if completed.returncode != 0:
        stderr = (completed.stderr or "").strip()
        stdout = (completed.stdout or "").strip()
        detail = stderr if stderr else stdout
        raise RuntimeError(f"Core refresh failed: {detail[:800]}")


def parse_method_scores(entry: dict[str, Any]) -> dict[str, int]:
    scores: dict[str, int] = {}
    if isinstance(entry.get("recommended_scores"), list):
        source_scores = entry.get("recommended_scores", [])
    else:
        source_scores = entry.get("slide_support", [])
    for idx, method in enumerate(METHOD_ORDER):
        value = source_scores[idx] if idx < len(source_scores) else 0
        scores[method] = normalize_score(value)
    return scores


def build_claim_matrix(claim_check: dict[str, Any]) -> dict[str, list[dict[str, Any]]]:
    matrix: dict[str, list[dict[str, Any]]] = {key: [] for key in SECTION_ORDER}
    checks = claim_check.get("checks", [])
    if not isinstance(checks, list):
        return matrix

    for item in checks:
        if not isinstance(item, dict):
            continue
        section = item.get("section")
        signal = item.get("signal")
        if section not in matrix or not isinstance(signal, str) or not signal:
            continue
        scores = parse_method_scores(item)
        matrix[section].append(
            {
                "signal": signal,
                "scores": scores,
                "labels": {method: SUPPORT_LABELS.get(scores[method], "Not native") for method in METHOD_ORDER},
                "evidence_links": item.get("evidence_links", []) if isinstance(item.get("evidence_links"), list) else [],
            }
        )

    for section in SECTION_ORDER:
        matrix[section].sort(key=lambda row: row["signal"].lower())
    return matrix


def build_approach_details(claim_matrix: dict[str, list[dict[str, Any]]]) -> dict[str, dict[str, Any]]:
    details: dict[str, dict[str, Any]] = {
        "metahuman": {
            "identity_creation": [
                "Inputs: MetaHuman Creator parameters, scans/photos via Mesh to MetaHuman, and material/groom assets.",
                "Models: DNA + RigLogic calibration and rig assembly in Unreal.",
                "Representation: explicit skeletal mesh, blendshape curves, DNA-backed facial rig.",
            ],
            "response_model": [
                "Perception path: Live Link Face / MetaHuman Animator derive facial curves and pose from video+audio.",
                "Behavior path: agent text intent can modulate expression/gaze/turn-taking policy before render.",
                "Output path: deterministic Unreal render stream plus synchronized voice/audio.",
            ],
            "representation_note": "Deterministic rig controls with explicit facial coefficients and bone transforms.",
        },
        "video_generation": {
            "identity_creation": [
                "Inputs: single portrait or short reference clip, optional style/persona prompt.",
                "Models: reference encoders (identity tokens) + temporal conditioning stack.",
                "Representation: latent identity embeddings conditioned into diffusion/DiT decoders.",
            ],
            "response_model": [
                "Perception path: audio waveform, text intent, and optional pose/control tokens.",
                "Behavior path: temporal generators produce coherent motion and lip-sync in latent space.",
                "Output path: pixel-space video frames with optional separate synthesized speech track.",
            ],
            "representation_note": "Implicit latent dynamics decoded to pixels; less explicit geometric control.",
        },
        "gaussian_splatting": {
            "identity_creation": [
                "Inputs: multiview capture or one-shot portrait with reconstruction priors.",
                "Models: 3DGS optimization or feed-forward regressors for splat parameters.",
                "Representation: explicit 3D Gaussians (position, covariance, opacity, SH color).",
            ],
            "response_model": [
                "Perception path: audio, expression coefficients, head pose, gaze, optional text/emotion intent.",
                "Behavior path: audio-to-expression and deformation drivers update splat/rig state.",
                "Output path: realtime splat rasterization to RGB frames and stream transport.",
            ],
            "representation_note": "Explicit neural primitives with fast rasterization and high-fps rendering.",
        },
    }

    for method in METHOD_ORDER:
        coupling_rows: list[str] = []
        for row in claim_matrix.get("coupling", []):
            score = row["scores"].get(method, 0)
            if score >= 1:
                coupling_rows.append(f"{row['signal']} ({SUPPORT_LABELS[score]})")
        details[method]["coupling_patterns"] = coupling_rows or ["No native coupling pattern identified."]
    return details


def extract_research_sets(core_payload: dict[str, Any]) -> tuple[list[str], list[str], list[dict[str, Any]], list[dict[str, Any]]]:
    arxiv_entries = core_payload.get("research", {}).get("arxiv", {}).get("entries", [])
    github_repos = core_payload.get("research", {}).get("github", {}).get("repositories", [])

    arxiv_ids: list[str] = []
    arxiv_highlights: list[dict[str, Any]] = []
    if isinstance(arxiv_entries, list):
        for entry in arxiv_entries:
            if not isinstance(entry, dict):
                continue
            arxiv_id = str(entry.get("id") or "").strip()
            if arxiv_id:
                arxiv_ids.append(arxiv_id)
            if len(arxiv_highlights) < 15:
                arxiv_highlights.append(
                    {
                        "id": arxiv_id,
                        "title": str(entry.get("title") or "").strip(),
                        "updated": str(entry.get("updated") or entry.get("published") or "").strip(),
                    }
                )

    github_names: list[str] = []
    github_highlights: list[dict[str, Any]] = []
    if isinstance(github_repos, list):
        for repo in github_repos:
            if not isinstance(repo, dict):
                continue
            full_name = str(repo.get("full_name") or "").strip()
            if full_name:
                github_names.append(full_name)
            if len(github_highlights) < 15:
                github_highlights.append(
                    {
                        "full_name": full_name,
                        "url": str(repo.get("url") or "").strip(),
                        "stars": int(repo.get("stars") or 0),
                        "pushed_at": str(repo.get("pushed_at") or "").strip(),
                    }
                )
    return sorted(set(arxiv_ids)), sorted(set(github_names)), arxiv_highlights, github_highlights


def compute_delta(previous_payload: dict[str, Any] | None, arxiv_ids: list[str], github_names: list[str]) -> dict[str, Any]:
    prev_arxiv = set(previous_payload.get("research", {}).get("arxiv_ids", [])) if isinstance(previous_payload, dict) else set()
    prev_github = set(previous_payload.get("research", {}).get("github_repos", [])) if isinstance(previous_payload, dict) else set()

    new_arxiv = [entry for entry in arxiv_ids if entry not in prev_arxiv]
    new_github = [name for name in github_names if name not in prev_github]
    return {
        "new_arxiv_entries": new_arxiv[:30],
        "new_github_repositories": new_github[:30],
        "new_arxiv_count": len(new_arxiv),
        "new_github_repo_count": len(new_github),
    }


def make_report_markdown(payload: dict[str, Any]) -> str:
    lines: list[str] = []
    lines.append("# Multimodal Inputs/Outputs Research")
    lines.append("")
    lines.append(f"- Generated at (UTC): `{payload['generated_at']}`")
    lines.append(f"- Cycle: `{payload['cycle']}`")
    lines.append(f"- Core source cycle: `{payload['core_cycle']}`")
    lines.append("")
    lines.append("## Distilled Conclusion")
    lines.append("")
    lines.append("Multimodal behavior is achieved with three different representations:")
    lines.append("- `MetaHuman`: explicit rig coefficients (deterministic).")
    lines.append("- `Video Generation`: latent-conditioned frame synthesis (implicit).")
    lines.append("- `Gaussian Splatting`: explicit neural primitives rasterized in realtime.")
    lines.append("")
    lines.append("## Claim Matrix (Recommended Support)")
    lines.append("")
    for section in SECTION_ORDER:
        lines.append(f"### {SECTION_LABELS[section]}")
        lines.append("")
        rows = payload["claim_matrix"].get(section, [])
        for row in rows:
            labels = row.get("labels", {})
            lines.append(
                f"- `{row['signal']}` | "
                f"MH `{labels.get('metahuman', 'Not native')}` | "
                f"VG `{labels.get('video_generation', 'Not native')}` | "
                f"GS `{labels.get('gaussian_splatting', 'Not native')}`"
            )
        lines.append("")
    lines.append("## Delta")
    lines.append("")
    lines.append(f"- New ArXiv entries this cycle: `{payload['delta']['new_arxiv_count']}`")
    lines.append(f"- New GitHub repos this cycle: `{payload['delta']['new_github_repo_count']}`")
    lines.append("")
    lines.append("## ArXiv Highlights")
    lines.append("")
    for entry in payload["research"]["arxiv_highlights"][:10]:
        lines.append(f"- `{entry['title']}` - `{entry['id']}`")
    lines.append("")
    lines.append("## GitHub Highlights")
    lines.append("")
    for entry in payload["research"]["github_highlights"][:10]:
        lines.append(f"- `{entry['full_name']}` (stars `{entry['stars']}`)")
    lines.append("")
    return "\n".join(lines).rstrip() + "\n"


def build_conclusion_section(payload: dict[str, Any]) -> str:
    lines: list[str] = []
    lines.append(MARKER)
    lines.append("")
    lines.append(f"- Updated at (UTC): `{payload['generated_at']}`")
    lines.append(f"- Multimodal cycle: `{payload['cycle']}`")
    lines.append(f"- Research source cycle: `{payload['core_cycle']}`")
    lines.append("")
    lines.append("### Cross-method summary")
    lines.append("")
    lines.append("| Approach | Identity representation | Typical realtime inputs | Typical realtime outputs |")
    lines.append("|---|---|---|---|")
    lines.append("| MetaHuman | DNA + RigLogic + blendshape rig | face video, audio, head pose, gaze, turn cues | ARKit curves, head/eye transforms, rendered UE stream + speech |")
    lines.append("| Video Generation | identity latent tokens in diffusion/DiT stack | audio, text intent, optional pose/emotion controls | synthesized video frames + optional speech track |")
    lines.append("| Gaussian Splatting | explicit 3D Gaussian primitives (+ optional rig) | audio, expression coeffs, pose, gaze, optional text intent | realtime splat-rendered frames + speech |")
    lines.append("")

    for method in METHOD_ORDER:
        label = METHOD_LABELS[method]
        details = payload["approaches"][method]
        lines.append(f"### {label}: how multimodal I/O works")
        lines.append("")
        lines.append("1. Identity creation")
        for item in details["identity_creation"]:
            lines.append(f"- {item}")
        lines.append("2. Realtime response model")
        for item in details["response_model"]:
            lines.append(f"- {item}")
        lines.append(f"3. Runtime representation: {details['representation_note']}")
        lines.append("4. Supported coupling patterns")
        for item in details["coupling_patterns"]:
            lines.append(f"- {item}")
        lines.append("")

    lines.append("### Evidence pointers (sample)")
    lines.append("")
    lines.append("- Epic MetaHuman docs: MetaHuman Animator, Live Link, Audio Source animation")
    lines.append("- arXiv: LivePortrait, LiveTalk, Avatar Forcing, TaoAvatar, GaussianAvatars, GazeGaussian, ICo3D")
    lines.append("- GitHub: livekit/agents, KwaiVGI/LivePortrait, graphdeco-inria/gaussian-splatting")
    lines.append("")
    return "\n".join(lines).rstrip() + "\n"


def upsert_target_research_doc(path: Path, payload: dict[str, Any]) -> None:
    section_text = build_conclusion_section(payload)
    old = read_text(path)
    if MARKER in old:
        idx = old.index(MARKER)
        new_text = old[:idx].rstrip() + "\n\n" + section_text
    else:
        base = old.rstrip()
        new_text = (base + "\n\n" if base else "") + section_text
    write_text(path, new_text)


def publish_outputs(repo_root: Path, payload: dict[str, Any], report_text: str, progress_file: Path) -> None:
    docs_dir = repo_root / "web" / "public" / "docs"
    docs_dir.mkdir(parents=True, exist_ok=True)
    write_text(docs_dir / "multimodal-io-research-latest.md", report_text)
    write_json(docs_dir / "multimodal-io-research-latest.json", payload)
    write_json(docs_dir / "multimodal-io-claim-matrix-latest.json", {"generated_at": payload["generated_at"], "claim_matrix": payload["claim_matrix"]})
    if progress_file.exists():
        write_text(docs_dir / "multimodal-io-research-progress.md", read_text(progress_file))


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run one multimodal I/O research evolution cycle.")
    parser.add_argument("--repo-root", type=str, default=None, help="Repository root override")
    parser.add_argument("--slide-url", type=str, default="https://www.realtime-avatars.com/slides/35", help="Slide URL to anchor core verification")
    parser.add_argument("--slide-source", type=str, default="web/app/slides/SlidesDeck.tsx", help="Slide source path relative to repo root")
    parser.add_argument("--skip-core-refresh", action="store_true", help="Do not re-run full-modality core refresh")
    parser.add_argument("--max-arxiv-per-query", type=int, default=8, help="ArXiv results per query")
    parser.add_argument("--max-arxiv-total", type=int, default=60, help="ArXiv total retained")
    parser.add_argument("--max-github-per-query", type=int, default=8, help="GitHub repos per query")
    parser.add_argument("--max-github-total", type=int, default=60, help="GitHub total retained")
    parser.add_argument("--no-publish", action="store_true", help="Do not write web/public/docs outputs")
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
    progress_file = references_dir / "progress.md"
    state_file = skill_root / "state.json"
    events_file = skill_root / "events.jsonl"
    target_doc = repo_root / TARGET_RESEARCH_MD

    if not args.skip_core_refresh:
        run_core_refresh(repo_root, args)

    core_dir = repo_root / ".claude" / "skills" / "full-modality-social-evolver" / "references"
    core_research = read_json(core_dir / "latest-research.json")
    core_claim = read_json(core_dir / "latest-claim-check.json")

    if not isinstance(core_research, dict) or not isinstance(core_claim, dict):
        raise RuntimeError("Core multimodal research outputs are missing or invalid.")

    previous_payload = read_json(latest_research_file)
    state = load_state(state_file)
    cycle = int(state.get("cycles_completed", 0)) + 1

    arxiv_ids, github_names, arxiv_highlights, github_highlights = extract_research_sets(core_research)
    delta = compute_delta(previous_payload, arxiv_ids, github_names)
    claim_matrix = build_claim_matrix(core_claim)
    approaches = build_approach_details(claim_matrix)

    payload = {
        "generated_at": now_iso(),
        "cycle": cycle,
        "core_cycle": int(core_research.get("cycle", 0) or 0),
        "core_generated_at": core_research.get("generated_at"),
        "query_focus_terms": core_research.get("query_plan", {}).get("focus_terms", []),
        "delta": delta,
        "research": {
            "arxiv_ids": arxiv_ids,
            "github_repos": github_names,
            "arxiv_highlights": arxiv_highlights,
            "github_highlights": github_highlights,
        },
        "claim_matrix": claim_matrix,
        "approaches": approaches,
    }

    report_text = make_report_markdown(payload)
    stamp = timestamp_for_filename()

    write_json(latest_research_file, payload)
    write_text(latest_report_file, report_text)
    write_json(history_dir / f"research-{stamp}.json", payload)
    write_text(history_dir / f"report-{stamp}.md", report_text)

    upsert_target_research_doc(target_doc, payload)
    append_progress(progress_file, payload)

    event = {
        "timestamp": payload["generated_at"],
        "cycle": cycle,
        "core_cycle": payload["core_cycle"],
        "arxiv_entries": len(arxiv_ids),
        "github_repositories": len(github_names),
        "new_arxiv_entries": delta["new_arxiv_count"],
        "new_github_repositories": delta["new_github_repo_count"],
        "target_doc": str(target_doc),
        "latest_report_file": str(latest_report_file),
        "latest_research_file": str(latest_research_file),
    }
    append_event(events_file, event)

    state.update(
        {
            "cycles_completed": cycle,
            "last_run": payload["generated_at"],
            "last_core_cycle": payload["core_cycle"],
            "last_report_file": str(latest_report_file),
            "last_research_file": str(latest_research_file),
            "last_target_doc": str(target_doc),
            "focus_terms": payload.get("query_focus_terms", []),
        }
    )
    write_json(state_file, state)

    if not args.no_publish:
        publish_outputs(repo_root, payload, report_text, progress_file)

    print(
        "[OK] Multimodal I/O research cycle complete: "
        f"cycle={cycle}, core_cycle={payload['core_cycle']}, "
        f"arxiv={len(arxiv_ids)}, github={len(github_names)}"
    )
    print(f"[OK] Report: {latest_report_file}")
    print(f"[OK] Research: {latest_research_file}")
    print(f"[OK] Updated doc: {target_doc}")
    if not args.no_publish:
        print(f"[OK] Published: {repo_root / 'web' / 'public' / 'docs' / 'multimodal-io-research-latest.md'}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
