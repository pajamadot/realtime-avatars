#!/usr/bin/env python3
"""
MetaHuman Evolver cycle runner.

Scans Unreal Engine MetaHuman-related plugins, extracts architecture/API signals,
and persists a cumulative memory log for iterative deep dives.
"""

from __future__ import annotations

import argparse
import html
import json
import os
import re
import sys
import urllib.error
import urllib.request
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


METAHUMAN_PLUGIN_BASES = [
    Path("Engine/Plugins/MetaHuman"),
    Path("Engine/Plugins/Experimental/MetaHuman"),
]

RELATED_PLUGIN_DIRS = [
    Path("Engine/Plugins/Animation/RigLogic"),
    Path("Engine/Plugins/Animation/DNACalib"),
    Path("Engine/Plugins/Animation/LiveLink"),
]

BUILD_DEP_KEYS = [
    "PublicDependencyModuleNames",
    "PrivateDependencyModuleNames",
    "PublicIncludePathModuleNames",
    "PrivateIncludePathModuleNames",
    "DynamicallyLoadedModuleNames",
    "CircularlyReferencedDependentModules",
]

HEADER_EXTENSIONS = {".h", ".hpp", ".inl"}
SOURCE_EXTENSIONS = {".cpp", ".cc", ".cxx"}

CLASS_RE = re.compile(r"^\s*class\s+(?:\w+_API\s+)?([A-Za-z_]\w*)\s*(?::|\{)", re.MULTILINE)
STRUCT_RE = re.compile(r"^\s*struct\s+(?:\w+_API\s+)?([A-Za-z_]\w*)\s*(?::|\{)", re.MULTILINE)
NAMESPACE_RE = re.compile(r"^\s*namespace\s+([A-Za-z_]\w*(?:::[A-Za-z_]\w*)*)", re.MULTILINE)
HEADER_FUNCTION_RE = re.compile(
    r"^\s*(?:virtual\s+)?(?:static\s+)?(?:inline\s+)?(?:FORCEINLINE\s+)?(?:constexpr\s+)?"
    r"(?:explicit\s+)?(?:friend\s+)?[A-Za-z_~][A-Za-z0-9_<>\s:\*&,\[\]]*?\s+([A-Za-z_~]\w*)"
    r"\s*\([^;{}]*\)\s*(?:const)?\s*(?:override|final)?\s*;",
    re.MULTILINE,
)
CPP_METHOD_RE = re.compile(
    r"^\s*[A-Za-z_~][A-Za-z0-9_<>\s:\*&,\[\]]*?\s+([A-Za-z_]\w*)::([A-Za-z_~]\w*)\s*\([^;{}]*\)",
    re.MULTILINE,
)
QUOTED_STRING_RE = re.compile(r'"([^"]+)"')
HTML_TITLE_RE = re.compile(r"<title[^>]*>(.*?)</title>", re.IGNORECASE | re.DOTALL)

OFFICIAL_METAHUMAN_DOCS = [
    {
        "name": "MetaHuman Documentation",
        "url": "https://dev.epicgames.com/documentation/en-us/metahuman/metahuman-documentation",
    },
    {
        "name": "MetaHumans in Unreal Engine",
        "url": "https://dev.epicgames.com/documentation/en-us/metahuman/metahumans-in-unreal-engine",
    },
    {
        "name": "MetaHuman Animator",
        "url": "https://dev.epicgames.com/documentation/en-us/metahuman/metahuman-animator",
    },
    {
        "name": "Realtime Animation Using Live Link",
        "url": "https://dev.epicgames.com/documentation/en-us/metahuman/realtime-animation-using-live-link",
    },
    {
        "name": "Mesh to MetaHuman",
        "url": "https://dev.epicgames.com/documentation/en-us/metahuman/mesh-to-metahuman",
    },
]

EPIC_UNREAL_REPO = "EpicGames/UnrealEngine"
EPIC_UNREAL_GITHUB_API_ROOT = f"https://api.github.com/repos/{EPIC_UNREAL_REPO}"
HTTP_USER_AGENT = "metahuman-evolver/1.0"


def now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def timestamp_for_filename() -> str:
    return datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")


def read_text(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8", errors="ignore")
    except OSError:
        return ""


def read_json(path: Path) -> dict[str, Any] | None:
    if not path.exists():
        return None
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return None


def write_json(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=True) + "\n", encoding="utf-8")


def truncate_text(value: str, max_length: int = 280) -> str:
    if len(value) <= max_length:
        return value
    return value[: max_length - 3] + "..."


def build_http_headers(url: str, accept: str) -> dict[str, str]:
    headers = {
        "User-Agent": HTTP_USER_AGENT,
        "Accept": accept,
    }
    github_token = os.getenv("GITHUB_TOKEN") or os.getenv("GH_TOKEN")
    if github_token and url.startswith("https://api.github.com/"):
        headers["Authorization"] = f"Bearer {github_token}"
        headers["X-GitHub-Api-Version"] = "2022-11-28"
    return headers


def fetch_url_text(url: str, accept: str, timeout_seconds: float = 20.0) -> dict[str, Any]:
    request = urllib.request.Request(
        url,
        headers=build_http_headers(url, accept),
    )
    try:
        with urllib.request.urlopen(request, timeout=timeout_seconds) as response:
            body = response.read(1_500_000).decode("utf-8", errors="ignore")
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


def extract_html_title(text: str) -> str:
    if not text:
        return ""
    match = HTML_TITLE_RE.search(text)
    if not match:
        return ""
    title = re.sub(r"\s+", " ", html.unescape(match.group(1))).strip()
    return truncate_text(title, 200)


def watch_official_metahuman_docs() -> dict[str, Any]:
    docs: list[dict[str, Any]] = []
    for item in OFFICIAL_METAHUMAN_DOCS:
        fetch = fetch_url_text(item["url"], accept="text/html,application/xhtml+xml")
        docs.append(
            {
                "name": item["name"],
                "url": item["url"],
                "resolved_url": fetch.get("url"),
                "status_code": fetch.get("status_code"),
                "ok": bool(fetch.get("ok")),
                "content_type": fetch.get("content_type"),
                "last_modified": fetch.get("last_modified"),
                "etag": fetch.get("etag"),
                "title": extract_html_title(fetch.get("body", "")),
                "error": fetch.get("error"),
            }
        )

    reachable = sum(1 for doc in docs if doc["ok"])
    unavailable = len(docs) - reachable
    return {
        "items": docs,
        "summary": {
            "total": len(docs),
            "reachable": reachable,
            "unavailable": unavailable,
        },
    }


def fetch_json_feed(url: str) -> tuple[dict[str, Any], Any]:
    fetch = fetch_url_text(url, accept="application/vnd.github+json")
    status = {
        "url": url,
        "resolved_url": fetch.get("url"),
        "status_code": fetch.get("status_code"),
        "ok": bool(fetch.get("ok")),
        "last_modified": fetch.get("last_modified"),
        "etag": fetch.get("etag"),
        "error": fetch.get("error"),
    }

    if not fetch.get("ok"):
        return status, None

    body = fetch.get("body", "")
    try:
        data = json.loads(body)
    except json.JSONDecodeError as exc:
        status["ok"] = False
        status["error"] = truncate_text(f"JSONDecodeError: {exc}")
        return status, None
    return status, data


def normalize_release_item(item: dict[str, Any]) -> dict[str, Any]:
    return {
        "name": item.get("name") or item.get("tag_name"),
        "tag_name": item.get("tag_name"),
        "published_at": item.get("published_at"),
        "created_at": item.get("created_at"),
        "prerelease": bool(item.get("prerelease")),
        "url": item.get("html_url"),
    }


def normalize_tag_item(item: dict[str, Any]) -> dict[str, Any]:
    commit = item.get("commit") if isinstance(item.get("commit"), dict) else {}
    return {
        "name": item.get("name"),
        "commit_sha": commit.get("sha"),
        "url": commit.get("url"),
    }


def normalize_commit_item(item: dict[str, Any]) -> dict[str, Any]:
    commit_payload = item.get("commit") if isinstance(item.get("commit"), dict) else {}
    committer_payload = commit_payload.get("committer") if isinstance(commit_payload.get("committer"), dict) else {}
    return {
        "sha": item.get("sha"),
        "message": truncate_text((commit_payload.get("message") or "").splitlines()[0], 180),
        "date": committer_payload.get("date"),
        "url": item.get("html_url"),
    }


def watch_epic_unreal_repo() -> dict[str, Any]:
    releases_status, releases_data = fetch_json_feed(f"{EPIC_UNREAL_GITHUB_API_ROOT}/releases?per_page=5")
    tags_status, tags_data = fetch_json_feed(f"{EPIC_UNREAL_GITHUB_API_ROOT}/tags?per_page=10")
    commits_status, commits_data = fetch_json_feed(f"{EPIC_UNREAL_GITHUB_API_ROOT}/commits?per_page=5")

    releases = []
    if isinstance(releases_data, list):
        releases = [normalize_release_item(item) for item in releases_data if isinstance(item, dict)]

    tags = []
    if isinstance(tags_data, list):
        tags = [normalize_tag_item(item) for item in tags_data if isinstance(item, dict)]

    commits = []
    if isinstance(commits_data, list):
        commits = [normalize_commit_item(item) for item in commits_data if isinstance(item, dict)]

    availability = "available"
    if not (releases_status["ok"] or tags_status["ok"] or commits_status["ok"]):
        availability = "restricted_or_unavailable"

    errors = []
    for label, status in [
        ("releases", releases_status),
        ("tags", tags_status),
        ("commits", commits_status),
    ]:
        if not status.get("ok"):
            code = status.get("status_code")
            reason = status.get("error") or "unknown"
            errors.append(f"{label}: status={code} ({reason})")

    return {
        "repo": EPIC_UNREAL_REPO,
        "api_root": EPIC_UNREAL_GITHUB_API_ROOT,
        "availability": availability,
        "feeds": {
            "releases": releases_status,
            "tags": tags_status,
            "commits": commits_status,
        },
        "releases": releases[:5],
        "tags": tags[:10],
        "commits": commits[:5],
        "errors": errors,
    }


def compute_watch_delta(previous_watch: dict[str, Any] | None, current_watch: dict[str, Any]) -> dict[str, Any]:
    previous_docs = {}
    if isinstance(previous_watch, dict):
        for item in previous_watch.get("metahuman_docs", []):
            if isinstance(item, dict) and item.get("url"):
                previous_docs[item["url"]] = item

    doc_changes: list[str] = []
    doc_recovered: list[str] = []
    doc_regressed: list[str] = []
    for item in current_watch.get("metahuman_docs", []):
        if not isinstance(item, dict):
            continue
        url = item.get("url")
        if not url:
            continue
        previous_item = previous_docs.get(url)
        if not previous_item:
            doc_changes.append(url)
            continue
        if previous_item.get("status_code") != item.get("status_code"):
            doc_changes.append(url)
        if (previous_item.get("title") or "") != (item.get("title") or ""):
            doc_changes.append(url)
        if not previous_item.get("ok") and item.get("ok"):
            doc_recovered.append(url)
        if previous_item.get("ok") and not item.get("ok"):
            doc_regressed.append(url)

    previous_repo = previous_watch.get("unreal_engine_repo", {}) if isinstance(previous_watch, dict) else {}
    current_repo = current_watch.get("unreal_engine_repo", {})

    previous_release_tags = {
        item.get("tag_name") for item in previous_repo.get("releases", []) if isinstance(item, dict) and item.get("tag_name")
    }
    current_release_tags = [
        item.get("tag_name") for item in current_repo.get("releases", []) if isinstance(item, dict) and item.get("tag_name")
    ]
    new_release_tags = [tag for tag in current_release_tags if tag not in previous_release_tags]

    previous_tags = {item.get("name") for item in previous_repo.get("tags", []) if isinstance(item, dict) and item.get("name")}
    current_tags = [item.get("name") for item in current_repo.get("tags", []) if isinstance(item, dict) and item.get("name")]
    new_tags = [tag for tag in current_tags if tag not in previous_tags]

    previous_commit_sha = None
    if isinstance(previous_repo.get("commits"), list) and previous_repo.get("commits"):
        first = previous_repo["commits"][0]
        if isinstance(first, dict):
            previous_commit_sha = first.get("sha")

    current_commit_sha = None
    if isinstance(current_repo.get("commits"), list) and current_repo.get("commits"):
        first = current_repo["commits"][0]
        if isinstance(first, dict):
            current_commit_sha = first.get("sha")

    return {
        "doc_status_changes": sorted(set(doc_changes)),
        "doc_recovered": sorted(set(doc_recovered)),
        "doc_regressed": sorted(set(doc_regressed)),
        "new_release_tags": new_release_tags,
        "new_tags": new_tags,
        "latest_commit_changed": bool(
            previous_commit_sha and current_commit_sha and previous_commit_sha != current_commit_sha
        ),
    }


def build_official_watch_payload(
    generated_at: str,
    previous_watch: dict[str, Any] | None,
) -> dict[str, Any]:
    docs_watch = watch_official_metahuman_docs()
    repo_watch = watch_epic_unreal_repo()
    payload = {
        "generated_at": generated_at,
        "metahuman_docs": docs_watch["items"],
        "metahuman_docs_summary": docs_watch["summary"],
        "unreal_engine_repo": repo_watch,
    }
    payload["delta"] = compute_watch_delta(previous_watch, payload)
    return payload


def find_repo_root(start: Path) -> Path:
    for candidate in [start, *start.parents]:
        if (candidate / ".git").exists():
            return candidate
    return start.parents[4]


def parse_ue_root_hint(repo_root: Path) -> Path | None:
    hint_file = repo_root / "metahuman" / "UNREAL_ENGINE_SOURCE_ROOT.txt"
    if not hint_file.exists():
        return None
    text = read_text(hint_file)
    for line in text.splitlines():
        stripped = line.strip()
        if stripped:
            return Path(stripped)
    return None


def resolve_ue_root(cli_ue_root: str | None, repo_root: Path) -> Path:
    candidates: list[Path] = []
    if cli_ue_root:
        candidates.append(Path(cli_ue_root))
    env_ue = os.getenv("UE_SOURCE_ROOT") or os.getenv("UNREAL_ENGINE_SOURCE_ROOT")
    if env_ue:
        candidates.append(Path(env_ue))
    hint = parse_ue_root_hint(repo_root)
    if hint:
        candidates.append(hint)
    candidates.append(Path(r"G:\UE\UnrealEngine"))

    for candidate in candidates:
        resolved = candidate.expanduser()
        if resolved.exists():
            return resolved
    return candidates[0].expanduser()


def path_depth_from(base: Path, child: Path) -> int:
    return len(child.relative_to(base).parts)


def has_uplugin(plugin_dir: Path) -> bool:
    return any(plugin_dir.glob("*.uplugin"))


def discover_plugin_dirs(ue_root: Path, extra_plugins: list[str]) -> list[Path]:
    discovered: list[Path] = []
    for base_rel in METAHUMAN_PLUGIN_BASES:
        base = ue_root / base_rel
        if not base.is_dir():
            continue
        for child in sorted(base.iterdir(), key=lambda p: p.name.lower()):
            if child.is_dir() and has_uplugin(child):
                discovered.append(child)

    for rel in RELATED_PLUGIN_DIRS:
        plugin_dir = ue_root / rel
        if plugin_dir.is_dir() and has_uplugin(plugin_dir):
            discovered.append(plugin_dir)

    for extra in extra_plugins:
        extra_path = Path(extra)
        if not extra_path.is_absolute():
            extra_path = ue_root / extra_path
        if extra_path.is_dir() and has_uplugin(extra_path):
            discovered.append(extra_path)

    unique: dict[str, Path] = {}
    for item in discovered:
        unique[str(item.resolve())] = item.resolve()
    return [unique[key] for key in sorted(unique.keys(), key=lambda p: Path(p).name.lower())]


def first_uplugin_file(plugin_dir: Path) -> Path | None:
    files = sorted(plugin_dir.glob("*.uplugin"), key=lambda p: p.name.lower())
    return files[0] if files else None


def parse_uplugin(uplugin_file: Path) -> dict[str, Any]:
    text = read_text(uplugin_file)
    if not text:
        return {}
    try:
        payload = json.loads(text)
    except json.JSONDecodeError:
        return {}

    return {
        "friendly_name": payload.get("FriendlyName"),
        "version_name": payload.get("VersionName"),
        "version": payload.get("Version"),
        "category": payload.get("Category"),
        "description": payload.get("Description"),
        "enabled_by_default": payload.get("EnabledByDefault"),
        "modules": payload.get("Modules", []),
    }


def extract_quoted_items(segment: str) -> list[str]:
    return [item.strip() for item in QUOTED_STRING_RE.findall(segment) if item.strip()]


def parse_build_dependencies(build_text: str) -> dict[str, list[str]]:
    dependencies: dict[str, list[str]] = {}
    for key in BUILD_DEP_KEYS:
        names: list[str] = []
        add_range_pattern = re.compile(
            rf"{key}\s*\.AddRange\s*\(\s*new\s+(?:string\s*)?\[\s*\]\s*\{{(?P<body>.*?)\}}\s*\)\s*;",
            re.DOTALL,
        )
        for match in add_range_pattern.finditer(build_text):
            names.extend(extract_quoted_items(match.group("body")))

        add_pattern = re.compile(rf'{key}\s*\.Add\s*\(\s*"([^"]+)"\s*\)\s*;')
        for match in add_pattern.finditer(build_text):
            names.append(match.group(1).strip())

        names = sorted(set(name for name in names if name))
        if names:
            dependencies[key] = names
    return dependencies


def rank_counter(counter: Counter[str], limit: int) -> list[str]:
    ranked = sorted(counter.items(), key=lambda item: (-item[1], item[0]))
    return [name for name, _ in ranked[:limit]]


def extract_api_surface(
    header_files: list[Path],
    source_files: list[Path],
    max_samples: int,
) -> dict[str, list[str]]:
    class_counter: Counter[str] = Counter()
    struct_counter: Counter[str] = Counter()
    namespace_counter: Counter[str] = Counter()
    method_counter: Counter[str] = Counter()

    for header in header_files:
        text = read_text(header)
        if not text:
            continue
        class_counter.update(CLASS_RE.findall(text))
        struct_counter.update(STRUCT_RE.findall(text))
        namespace_counter.update(NAMESPACE_RE.findall(text))
        method_counter.update(HEADER_FUNCTION_RE.findall(text))

    for source in source_files:
        text = read_text(source)
        if not text:
            continue
        for class_name, method_name in CPP_METHOD_RE.findall(text):
            method_counter.update([f"{class_name}::{method_name}"])

    return {
        "classes": rank_counter(class_counter, max_samples),
        "structs": rank_counter(struct_counter, max_samples),
        "namespaces": rank_counter(namespace_counter, max_samples),
        "methods": rank_counter(method_counter, max_samples),
    }


def find_build_cs(module_dir: Path, module_name: str) -> Path | None:
    exact = module_dir / f"{module_name}.Build.cs"
    if exact.exists():
        return exact
    candidates = sorted(module_dir.glob("*.Build.cs"), key=lambda p: p.name.lower())
    return candidates[0] if candidates else None


def find_source_files(module_dir: Path) -> tuple[list[Path], list[Path]]:
    header_files: list[Path] = []
    source_files: list[Path] = []
    for path in module_dir.rglob("*"):
        if not path.is_file():
            continue
        suffix = path.suffix.lower()
        if suffix in HEADER_EXTENSIONS:
            header_files.append(path)
        elif suffix in SOURCE_EXTENSIONS:
            source_files.append(path)
    header_files.sort()
    source_files.sort()
    return header_files, source_files


def first_meaningful_line(path: Path) -> str:
    text = read_text(path)
    if not text:
        return ""
    for raw_line in text.splitlines():
        line = raw_line.strip()
        if not line:
            continue
        if line.startswith(("#", "```", "//", "/*", "*", "- ")):
            continue
        if len(line) > 220:
            line = line[:217] + "..."
        return line
    return ""


def collect_doc_snippets(plugin_dir: Path, max_docs: int = 12) -> list[dict[str, str]]:
    docs: list[dict[str, str]] = []
    for path in plugin_dir.rglob("*"):
        if not path.is_file():
            continue
        rel_depth = path_depth_from(plugin_dir, path)
        if rel_depth > 8:
            continue

        name_lower = path.name.lower()
        suffix_lower = path.suffix.lower()
        is_readme = name_lower.startswith("readme")
        is_short_doc = suffix_lower in {".md", ".txt"} and rel_depth <= 4
        if not (is_readme or is_short_doc):
            continue

        try:
            if path.stat().st_size > 250_000:
                continue
        except OSError:
            continue

        line = first_meaningful_line(path)
        if not line:
            continue
        docs.append(
            {
                "path": str(path),
                "relative_path": str(path.relative_to(plugin_dir)),
                "line": line,
            }
        )

    docs.sort(key=lambda item: item["relative_path"].lower())
    unique: dict[str, dict[str, str]] = {}
    for doc in docs:
        unique[doc["path"]] = doc
    return list(unique.values())[:max_docs]


def module_fingerprint(module: dict[str, Any]) -> str:
    deps = module.get("build_dependencies", {})
    stats = module.get("stats", {})
    api = module.get("api_samples", {})
    payload = {
        "deps": deps,
        "stats": stats,
        "classes": api.get("classes", []),
        "methods": api.get("methods", []),
    }
    return json.dumps(payload, sort_keys=True, ensure_ascii=True)


def scan_plugin(plugin_dir: Path, max_api_samples: int) -> dict[str, Any]:
    uplugin_file = first_uplugin_file(plugin_dir)
    descriptor = parse_uplugin(uplugin_file) if uplugin_file else {}
    descriptor_modules = descriptor.get("modules", []) or []
    descriptor_module_map = {
        module.get("Name"): module for module in descriptor_modules if isinstance(module, dict) and module.get("Name")
    }

    source_dir = plugin_dir / "Source"
    module_dirs = []
    if source_dir.is_dir():
        module_dirs = [child for child in sorted(source_dir.iterdir(), key=lambda p: p.name.lower()) if child.is_dir()]

    modules: list[dict[str, Any]] = []
    for module_dir in module_dirs:
        module_name = module_dir.name
        module_meta = descriptor_module_map.get(module_name, {})
        build_file = find_build_cs(module_dir, module_name)
        if not module_meta and not build_file:
            # Skip support folders under Source/ that are not Unreal modules.
            continue
        build_text = read_text(build_file) if build_file else ""
        build_dependencies = parse_build_dependencies(build_text) if build_text else {}
        header_files, source_files = find_source_files(module_dir)
        api_samples = extract_api_surface(header_files, source_files, max_api_samples)

        modules.append(
            {
                "name": module_name,
                "type": module_meta.get("Type"),
                "loading_phase": module_meta.get("LoadingPhase"),
                "source_path": str(module_dir),
                "build_cs": str(build_file) if build_file else None,
                "build_dependencies": build_dependencies,
                "stats": {
                    "header_files": len(header_files),
                    "source_files": len(source_files),
                    "class_count": len(api_samples["classes"]),
                    "struct_count": len(api_samples["structs"]),
                    "namespace_count": len(api_samples["namespaces"]),
                },
                "api_samples": api_samples,
            }
        )

    for descriptor_only_name, module_meta in descriptor_module_map.items():
        if any(existing["name"] == descriptor_only_name for existing in modules):
            continue
        modules.append(
            {
                "name": descriptor_only_name,
                "type": module_meta.get("Type"),
                "loading_phase": module_meta.get("LoadingPhase"),
                "source_path": None,
                "build_cs": None,
                "build_dependencies": {},
                "stats": {
                    "header_files": 0,
                    "source_files": 0,
                    "class_count": 0,
                    "struct_count": 0,
                    "namespace_count": 0,
                },
                "api_samples": {"classes": [], "structs": [], "namespaces": [], "methods": []},
            }
        )

    modules.sort(key=lambda item: item["name"].lower())
    docs = collect_doc_snippets(plugin_dir)
    return {
        "name": plugin_dir.name,
        "path": str(plugin_dir),
        "uplugin_file": str(uplugin_file) if uplugin_file else None,
        "descriptor": {
            "friendly_name": descriptor.get("friendly_name"),
            "version_name": descriptor.get("version_name"),
            "version": descriptor.get("version"),
            "category": descriptor.get("category"),
            "description": descriptor.get("description"),
            "enabled_by_default": descriptor.get("enabled_by_default"),
        },
        "docs": docs,
        "modules": modules,
    }


def build_dependency_edges(plugins: list[dict[str, Any]]) -> list[dict[str, str]]:
    all_module_names = {module["name"] for plugin in plugins for module in plugin.get("modules", [])}
    edges: list[dict[str, str]] = []
    for plugin in plugins:
        plugin_name = plugin["name"]
        for module in plugin.get("modules", []):
            source_module = module["name"]
            deps = module.get("build_dependencies", {})
            for dep_key, dep_modules in deps.items():
                for dep in dep_modules:
                    if dep in all_module_names:
                        edges.append(
                            {
                                "from_plugin": plugin_name,
                                "from_module": source_module,
                                "to_module": dep,
                                "dependency_kind": dep_key,
                            }
                        )
    edges.sort(
        key=lambda edge: (
            edge["from_plugin"].lower(),
            edge["from_module"].lower(),
            edge["to_module"].lower(),
            edge["dependency_kind"].lower(),
        )
    )
    return edges


def build_dependency_graph_payload(scan: dict[str, Any]) -> dict[str, Any]:
    plugins = scan.get("plugins", [])
    module_to_plugin: dict[str, str] = {}
    plugin_nodes: list[dict[str, Any]] = []

    for plugin in plugins:
        modules = plugin.get("modules", [])
        module_type_counter = Counter((module.get("type") or "Unknown") for module in modules)
        for module in modules:
            module_to_plugin[module["name"]] = plugin["name"]
        plugin_nodes.append(
            {
                "id": plugin["name"],
                "name": plugin["name"],
                "category": plugin.get("descriptor", {}).get("category") or "n/a",
                "module_count": len(modules),
                "module_types": dict(sorted(module_type_counter.items())),
            }
        )

    module_edges: list[dict[str, Any]] = []
    plugin_edge_accumulator: dict[tuple[str, str], dict[str, Any]] = {}
    for edge in scan.get("dependency_edges", []):
        from_plugin = edge["from_plugin"]
        from_module = edge["from_module"]
        to_module = edge["to_module"]
        to_plugin = module_to_plugin.get(to_module)
        if not to_plugin:
            continue

        module_edges.append(
            {
                "from_plugin": from_plugin,
                "from_module": from_module,
                "to_plugin": to_plugin,
                "to_module": to_module,
                "dependency_kind": edge["dependency_kind"],
            }
        )

        key = (from_plugin, to_plugin)
        aggregate = plugin_edge_accumulator.setdefault(
            key,
            {
                "from_plugin": from_plugin,
                "to_plugin": to_plugin,
                "count": 0,
                "dependency_kinds": Counter(),
                "module_pairs": set(),
            },
        )
        aggregate["count"] += 1
        aggregate["dependency_kinds"].update([edge["dependency_kind"]])
        aggregate["module_pairs"].add((from_module, to_module))

    plugin_edges: list[dict[str, Any]] = []
    for aggregate in plugin_edge_accumulator.values():
        plugin_edges.append(
            {
                "from_plugin": aggregate["from_plugin"],
                "to_plugin": aggregate["to_plugin"],
                "count": aggregate["count"],
                "dependency_kinds": sorted(aggregate["dependency_kinds"].keys()),
                "module_pair_count": len(aggregate["module_pairs"]),
                "intra_plugin": aggregate["from_plugin"] == aggregate["to_plugin"],
            }
        )

    plugin_nodes.sort(key=lambda item: item["name"].lower())
    plugin_edges.sort(key=lambda item: (-item["count"], item["from_plugin"].lower(), item["to_plugin"].lower()))
    module_edges.sort(
        key=lambda item: (
            item["from_plugin"].lower(),
            item["from_module"].lower(),
            item["to_plugin"].lower(),
            item["to_module"].lower(),
            item["dependency_kind"].lower(),
        )
    )

    return {
        "generated_at": scan.get("generated_at"),
        "cycle": scan.get("cycle"),
        "ue_root": scan.get("ue_root"),
        "totals": {
            "plugin_nodes": len(plugin_nodes),
            "plugin_edges": len(plugin_edges),
            "module_edges": len(module_edges),
        },
        "plugin_nodes": plugin_nodes,
        "plugin_edges": plugin_edges,
        "module_edges": module_edges,
    }


def build_architecture_payload(scan: dict[str, Any], dependency_graph: dict[str, Any]) -> dict[str, Any]:
    plugins = scan.get("plugins", [])
    dependency_edges = scan.get("dependency_edges", [])
    module_target_counter = Counter(edge["to_module"] for edge in dependency_edges)
    plugin_target_counter: Counter[str] = Counter()
    plugin_source_counter: Counter[str] = Counter()
    for edge in dependency_graph.get("plugin_edges", []):
        plugin_target_counter.update({edge["to_plugin"]: edge["count"]})
        plugin_source_counter.update({edge["from_plugin"]: edge["count"]})

    plugin_inventory: list[dict[str, Any]] = []
    for plugin in plugins:
        modules = plugin.get("modules", [])
        module_type_counter = Counter((module.get("type") or "Unknown") for module in modules)
        ranked_modules = sorted(
            modules,
            key=lambda module: (
                -(module.get("stats", {}).get("header_files", 0) + module.get("stats", {}).get("source_files", 0)),
                module["name"].lower(),
            ),
        )
        top_modules = [
            {
                "name": module["name"],
                "type": module.get("type") or "Unknown",
                "header_files": module.get("stats", {}).get("header_files", 0),
                "source_files": module.get("stats", {}).get("source_files", 0),
            }
            for module in ranked_modules[:8]
        ]
        plugin_inventory.append(
            {
                "name": plugin["name"],
                "path": plugin.get("path"),
                "category": plugin.get("descriptor", {}).get("category") or "n/a",
                "description": plugin.get("descriptor", {}).get("description") or "",
                "module_count": len(modules),
                "module_types": dict(sorted(module_type_counter.items())),
                "top_modules": top_modules,
                "docs": plugin.get("docs", []),
            }
        )

    plugin_inventory.sort(key=lambda item: (-item["module_count"], item["name"].lower()))

    hubs = {
        "module_targets": [
            {"module": module, "incoming_edges": count}
            for module, count in module_target_counter.most_common(20)
        ],
        "plugin_targets": [
            {"plugin": plugin, "incoming_edges": count}
            for plugin, count in plugin_target_counter.most_common(20)
        ],
        "plugin_sources": [
            {"plugin": plugin, "outgoing_edges": count}
            for plugin, count in plugin_source_counter.most_common(20)
        ],
    }

    return {
        "generated_at": scan.get("generated_at"),
        "cycle": scan.get("cycle"),
        "ue_root": scan.get("ue_root"),
        "totals": scan.get("totals", {}),
        "plugin_inventory": plugin_inventory,
        "dependency_hubs": hubs,
    }


def sanitize_mermaid_id(value: str) -> str:
    sanitized = re.sub(r"[^A-Za-z0-9_]", "_", value)
    if re.match(r"^[0-9]", sanitized):
        sanitized = f"N_{sanitized}"
    return sanitized or "N_Unknown"


def build_plugin_graph_mermaid(dependency_graph: dict[str, Any], max_edges: int = 80) -> str:
    plugin_nodes = dependency_graph.get("plugin_nodes", [])
    plugin_edges = dependency_graph.get("plugin_edges", [])

    lines: list[str] = []
    lines.append("graph LR")
    for node in plugin_nodes:
        node_id = sanitize_mermaid_id(node["name"])
        lines.append(f'  {node_id}["{node["name"]} ({node["module_count"]})"]')

    rendered_edges = 0
    for edge in plugin_edges:
        if rendered_edges >= max_edges:
            break
        if edge.get("intra_plugin"):
            continue
        source_id = sanitize_mermaid_id(edge["from_plugin"])
        target_id = sanitize_mermaid_id(edge["to_plugin"])
        label = edge["count"]
        lines.append(f"  {source_id} -->|{label}| {target_id}")
        rendered_edges += 1

    if rendered_edges == 0:
        lines.append("  N_Empty[No cross-plugin dependency edges]")

    return "\n".join(lines) + "\n"


def compute_delta(previous_scan: dict[str, Any] | None, current_scan: dict[str, Any]) -> dict[str, Any]:
    if not previous_scan:
        return {
            "first_cycle": True,
            "new_plugins": sorted(plugin["name"] for plugin in current_scan.get("plugins", [])),
            "removed_plugins": [],
            "new_modules": sorted(
                f'{plugin["name"]}/{module["name"]}'
                for plugin in current_scan.get("plugins", [])
                for module in plugin.get("modules", [])
            ),
            "removed_modules": [],
            "changed_modules": [],
        }

    previous_plugins = {plugin["name"] for plugin in previous_scan.get("plugins", [])}
    current_plugins = {plugin["name"] for plugin in current_scan.get("plugins", [])}

    previous_modules: dict[str, str] = {}
    for plugin in previous_scan.get("plugins", []):
        for module in plugin.get("modules", []):
            key = f'{plugin["name"]}/{module["name"]}'
            previous_modules[key] = module_fingerprint(module)

    current_modules: dict[str, str] = {}
    for plugin in current_scan.get("plugins", []):
        for module in plugin.get("modules", []):
            key = f'{plugin["name"]}/{module["name"]}'
            current_modules[key] = module_fingerprint(module)

    shared_modules = set(previous_modules.keys()) & set(current_modules.keys())
    changed_modules = sorted(
        key for key in shared_modules if previous_modules[key] != current_modules[key]
    )

    return {
        "first_cycle": False,
        "new_plugins": sorted(current_plugins - previous_plugins),
        "removed_plugins": sorted(previous_plugins - current_plugins),
        "new_modules": sorted(set(current_modules.keys()) - set(previous_modules.keys())),
        "removed_modules": sorted(set(previous_modules.keys()) - set(current_modules.keys())),
        "changed_modules": changed_modules,
    }


def make_summary_markdown(scan: dict[str, Any], delta: dict[str, Any], cycle_number: int) -> str:
    lines: list[str] = []
    lines.append("# MetaHuman Evolver: Latest Scan")
    lines.append("")
    lines.append(f"- Generated at (UTC): `{scan['generated_at']}`")
    lines.append(f"- Cycle: `{cycle_number}`")
    lines.append(f"- Unreal source root: `{scan['ue_root']}`")
    lines.append(
        f"- Totals: `{scan['totals']['plugins']} plugins`, `{scan['totals']['modules']} modules`, "
        f"`{scan['totals']['source_files']} source files`"
    )
    lines.append("")

    lines.append("## Delta From Previous Cycle")
    lines.append("")
    lines.append(f"- New plugins: `{len(delta['new_plugins'])}`")
    lines.append(f"- Removed plugins: `{len(delta['removed_plugins'])}`")
    lines.append(f"- New modules: `{len(delta['new_modules'])}`")
    lines.append(f"- Removed modules: `{len(delta['removed_modules'])}`")
    lines.append(f"- Changed modules: `{len(delta['changed_modules'])}`")
    lines.append("")

    if delta["new_plugins"]:
        lines.append("New plugins:")
        for item in delta["new_plugins"][:20]:
            lines.append(f"- `{item}`")
        lines.append("")
    if delta["new_modules"]:
        lines.append("New modules:")
        for item in delta["new_modules"][:30]:
            lines.append(f"- `{item}`")
        lines.append("")
    if delta["changed_modules"]:
        lines.append("Changed modules:")
        for item in delta["changed_modules"][:30]:
            lines.append(f"- `{item}`")
        lines.append("")

    lines.append("## Plugin Matrix")
    lines.append("")
    lines.append("| Plugin | Category | Modules | One-line Docs |")
    lines.append("|---|---|---:|---:|")
    for plugin in scan.get("plugins", []):
        lines.append(
            f"| `{plugin['name']}` | `{plugin['descriptor'].get('category') or 'n/a'}` | "
            f"{len(plugin.get('modules', []))} | {len(plugin.get('docs', []))} |"
        )
    lines.append("")

    lines.append("## Module Highlights")
    lines.append("")
    for plugin in scan.get("plugins", []):
        lines.append(f"### {plugin['name']}")
        lines.append("")
        modules = plugin.get("modules", [])
        if not modules:
            lines.append("- No modules found.")
            lines.append("")
            continue

        for module in modules[:6]:
            deps = module.get("build_dependencies", {})
            public_deps = ", ".join(deps.get("PublicDependencyModuleNames", [])[:8]) or "n/a"
            private_deps = ", ".join(deps.get("PrivateDependencyModuleNames", [])[:8]) or "n/a"
            classes = ", ".join(module["api_samples"].get("classes", [])[:6]) or "n/a"
            methods = ", ".join(module["api_samples"].get("methods", [])[:8]) or "n/a"
            lines.append(
                f"- `{module['name']}` ({module.get('type') or 'unknown'}): "
                f"`{module['stats']['header_files']}h / {module['stats']['source_files']}cpp`"
            )
            lines.append(f"  - Public deps: `{public_deps}`")
            lines.append(f"  - Private deps: `{private_deps}`")
            lines.append(f"  - Sample classes: `{classes}`")
            lines.append(f"  - Sample methods: `{methods}`")
        lines.append("")

    lines.append("## One-line Docs Found")
    lines.append("")
    for plugin in scan.get("plugins", []):
        docs = plugin.get("docs", [])
        if not docs:
            continue
        lines.append(f"### {plugin['name']}")
        lines.append("")
        for doc in docs[:8]:
            lines.append(f"- `{doc['relative_path']}`: {doc['line']}")
        lines.append("")

    official_watch = scan.get("official_watch", {})
    if isinstance(official_watch, dict):
        docs_summary = official_watch.get("metahuman_docs_summary", {})
        repo_watch = official_watch.get("unreal_engine_repo", {})
        lines.append("## Official Watch")
        lines.append("")
        lines.append(
            f"- MetaHuman docs reachability: `{docs_summary.get('reachable', 0)}`/"
            f"`{docs_summary.get('total', 0)}`"
        )
        lines.append(f"- Epic Unreal repo feed availability: `{repo_watch.get('availability') or 'unknown'}`")
        lines.append("")

        lines.append("### MetaHuman Official Docs")
        lines.append("")
        for item in official_watch.get("metahuman_docs", []):
            if not isinstance(item, dict):
                continue
            status = item.get("status_code")
            title = item.get("title") or "n/a"
            status_text = status if status is not None else "n/a"
            lines.append(f"- `{item.get('name')}`: status=`{status_text}`, title=`{title}`")
        lines.append("")

        lines.append("### Epic Unreal Engine Repo Feeds")
        lines.append("")
        for feed_name, feed_status in (repo_watch.get("feeds", {}) or {}).items():
            if not isinstance(feed_status, dict):
                continue
            status = feed_status.get("status_code")
            status_text = status if status is not None else "n/a"
            lines.append(f"- `{feed_name}`: status=`{status_text}`, ok=`{feed_status.get('ok')}`")
        if isinstance(repo_watch.get("errors"), list) and repo_watch.get("errors"):
            lines.append("")
            lines.append("Feed errors:")
            for error in repo_watch.get("errors", [])[:6]:
                lines.append(f"- `{error}`")
        lines.append("")

    return "\n".join(lines).rstrip() + "\n"


def append_progress_log(
    progress_file: Path,
    scan: dict[str, Any],
    delta: dict[str, Any],
    cycle_number: int,
) -> None:
    progress_file.parent.mkdir(parents=True, exist_ok=True)
    lines: list[str] = []
    lines.append(f"## {scan['generated_at']} (cycle {cycle_number})")
    lines.append("")
    lines.append(f"- Unreal root: `{scan['ue_root']}`")
    lines.append(
        f"- Totals: `{scan['totals']['plugins']} plugins`, `{scan['totals']['modules']} modules`, "
        f"`{scan['totals']['source_files']} source files`"
    )
    lines.append(
        f"- Delta: +`{len(delta['new_plugins'])}` plugins, +`{len(delta['new_modules'])}` modules, "
        f"`{len(delta['changed_modules'])}` changed modules"
    )
    if delta["new_plugins"]:
        lines.append(f"- New plugins: `{', '.join(delta['new_plugins'][:10])}`")
    if delta["new_modules"]:
        lines.append(f"- New modules: `{', '.join(delta['new_modules'][:12])}`")
    if delta["changed_modules"]:
        lines.append(f"- Changed modules: `{', '.join(delta['changed_modules'][:12])}`")
    official_watch = scan.get("official_watch", {})
    if isinstance(official_watch, dict):
        docs_summary = official_watch.get("metahuman_docs_summary", {})
        repo_watch = official_watch.get("unreal_engine_repo", {})
        lines.append(
            f"- Official docs: `{docs_summary.get('reachable', 0)}`/"
            f"`{docs_summary.get('total', 0)}` reachable"
        )
        lines.append(f"- Epic repo feed availability: `{repo_watch.get('availability') or 'unknown'}`")
        watch_delta = official_watch.get("delta", {})
        if isinstance(watch_delta, dict) and watch_delta.get("new_tags"):
            lines.append(f"- New Epic tags observed: `{', '.join(watch_delta['new_tags'][:5])}`")
        if isinstance(watch_delta, dict) and watch_delta.get("new_release_tags"):
            lines.append(
                f"- New Epic release tags observed: `{', '.join(watch_delta['new_release_tags'][:5])}`"
            )
    lines.append("")

    with progress_file.open("a", encoding="utf-8") as handle:
        handle.write("\n".join(lines) + "\n")


def append_event(events_file: Path, event: dict[str, Any]) -> None:
    events_file.parent.mkdir(parents=True, exist_ok=True)
    with events_file.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(event, ensure_ascii=True) + "\n")


def load_state(state_file: Path) -> dict[str, Any]:
    state = read_json(state_file)
    if not isinstance(state, dict):
        return {
            "cycles_completed": 0,
            "last_run": None,
            "ue_root": None,
            "known_plugins": [],
            "known_modules": [],
        }
    return state


def save_state(state_file: Path, state: dict[str, Any]) -> None:
    write_json(state_file, state)


def publish_outputs(
    repo_root: Path,
    scan: dict[str, Any],
    summary_markdown: str,
    progress_file: Path,
    architecture_payload: dict[str, Any],
    dependency_graph_payload: dict[str, Any],
    mermaid_graph: str,
    official_watch_payload: dict[str, Any],
) -> None:
    docs_dir = repo_root / "web" / "public" / "docs"
    docs_dir.mkdir(parents=True, exist_ok=True)
    (docs_dir / "metahuman-evolution-latest.md").write_text(summary_markdown, encoding="utf-8")
    write_json(docs_dir / "metahuman-evolution-latest.json", scan)
    write_json(docs_dir / "metahuman-architecture-latest.json", architecture_payload)
    write_json(docs_dir / "metahuman-dependency-graph-latest.json", dependency_graph_payload)
    (docs_dir / "metahuman-dependency-graph-latest.mmd").write_text(mermaid_graph, encoding="utf-8")
    write_json(docs_dir / "metahuman-official-watch-latest.json", official_watch_payload)
    if progress_file.exists():
        (docs_dir / "metahuman-evolution-progress.md").write_text(
            read_text(progress_file),
            encoding="utf-8",
        )


def scan_all_plugins(plugin_dirs: list[Path], max_api_samples: int) -> dict[str, Any]:
    plugins = [scan_plugin(plugin_dir, max_api_samples=max_api_samples) for plugin_dir in plugin_dirs]
    plugins.sort(key=lambda item: item["name"].lower())
    dependency_edges = build_dependency_edges(plugins)

    source_files = 0
    modules = 0
    for plugin in plugins:
        modules += len(plugin.get("modules", []))
        for module in plugin.get("modules", []):
            source_files += module["stats"]["header_files"] + module["stats"]["source_files"]

    return {
        "plugins": plugins,
        "dependency_edges": dependency_edges,
        "totals": {
            "plugins": len(plugins),
            "modules": modules,
            "source_files": source_files,
            "internal_dependency_edges": len(dependency_edges),
        },
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run one MetaHuman architecture evolution cycle.")
    parser.add_argument("--ue-root", type=str, default=None, help="Override Unreal Engine source root path")
    parser.add_argument(
        "--repo-root",
        type=str,
        default=None,
        help="Override repository root (default: inferred from .git)",
    )
    parser.add_argument(
        "--extra-plugin",
        action="append",
        default=[],
        help="Additional plugin directory (absolute or relative to UE root). Repeatable.",
    )
    parser.add_argument(
        "--max-api-samples",
        type=int,
        default=20,
        help="Maximum sampled classes/structs/namespaces/methods per module.",
    )
    parser.add_argument(
        "--no-publish",
        action="store_true",
        help="Do not mirror outputs into web/public/docs.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    script_path = Path(__file__).resolve()
    skill_root = script_path.parent.parent
    repo_root = Path(args.repo_root).resolve() if args.repo_root else find_repo_root(skill_root)

    ue_root = resolve_ue_root(args.ue_root, repo_root).resolve()
    if not ue_root.exists():
        print(f"[ERROR] Unreal source root does not exist: {ue_root}")
        return 2

    plugin_dirs = discover_plugin_dirs(ue_root, args.extra_plugin)
    if not plugin_dirs:
        print(f"[ERROR] No MetaHuman-related plugins discovered under: {ue_root}")
        return 3

    references_dir = skill_root / "references"
    history_dir = references_dir / "history"
    scan_file = references_dir / "latest-scan.json"
    summary_file = references_dir / "latest-summary.md"
    architecture_file = references_dir / "latest-architecture.json"
    dependency_graph_file = references_dir / "latest-dependency-graph.json"
    dependency_mermaid_file = references_dir / "latest-dependency-graph.mmd"
    official_watch_file = references_dir / "latest-official-watch.json"
    progress_file = references_dir / "progress.md"
    state_file = skill_root / "state.json"
    events_file = skill_root / "events.jsonl"

    previous_scan = read_json(scan_file)
    previous_official_watch = read_json(official_watch_file)
    state = load_state(state_file)
    cycle_number = int(state.get("cycles_completed", 0)) + 1

    scan_payload = scan_all_plugins(plugin_dirs, max_api_samples=max(5, args.max_api_samples))
    scan_payload["generated_at"] = now_iso()
    scan_payload["ue_root"] = str(ue_root)
    scan_payload["scan_roots"] = [str(path) for path in plugin_dirs]

    delta = compute_delta(previous_scan, scan_payload)
    scan_payload["cycle"] = cycle_number
    scan_payload["delta"] = delta
    official_watch_payload = build_official_watch_payload(scan_payload["generated_at"], previous_official_watch)
    official_watch_payload["cycle"] = cycle_number
    official_watch_payload["ue_root"] = str(ue_root)
    scan_payload["official_watch"] = official_watch_payload
    dependency_graph_payload = build_dependency_graph_payload(scan_payload)
    architecture_payload = build_architecture_payload(scan_payload, dependency_graph_payload)
    mermaid_graph = build_plugin_graph_mermaid(dependency_graph_payload)
    summary_markdown = make_summary_markdown(scan_payload, delta, cycle_number)

    run_stamp = timestamp_for_filename()
    write_json(scan_file, scan_payload)
    summary_file.write_text(summary_markdown, encoding="utf-8")
    write_json(architecture_file, architecture_payload)
    write_json(dependency_graph_file, dependency_graph_payload)
    dependency_mermaid_file.write_text(mermaid_graph, encoding="utf-8")
    write_json(official_watch_file, official_watch_payload)
    history_dir.mkdir(parents=True, exist_ok=True)
    write_json(history_dir / f"scan-{run_stamp}.json", scan_payload)
    write_json(history_dir / f"architecture-{run_stamp}.json", architecture_payload)
    write_json(history_dir / f"dependency-graph-{run_stamp}.json", dependency_graph_payload)
    (history_dir / f"dependency-graph-{run_stamp}.mmd").write_text(mermaid_graph, encoding="utf-8")
    write_json(history_dir / f"official-watch-{run_stamp}.json", official_watch_payload)
    append_progress_log(progress_file, scan_payload, delta, cycle_number)

    event = {
        "timestamp": scan_payload["generated_at"],
        "cycle": cycle_number,
        "ue_root": str(ue_root),
        "plugins_scanned": scan_payload["totals"]["plugins"],
        "modules_scanned": scan_payload["totals"]["modules"],
        "source_files_scanned": scan_payload["totals"]["source_files"],
        "new_plugins": delta["new_plugins"],
        "removed_plugins": delta["removed_plugins"],
        "new_modules": delta["new_modules"],
        "removed_modules": delta["removed_modules"],
        "changed_modules_count": len(delta["changed_modules"]),
        "official_docs_reachable": official_watch_payload["metahuman_docs_summary"]["reachable"],
        "official_docs_total": official_watch_payload["metahuman_docs_summary"]["total"],
        "epic_repo_feed_availability": official_watch_payload["unreal_engine_repo"]["availability"],
        "summary_file": str(summary_file),
        "scan_file": str(scan_file),
        "architecture_file": str(architecture_file),
        "dependency_graph_file": str(dependency_graph_file),
        "official_watch_file": str(official_watch_file),
    }
    append_event(events_file, event)

    current_plugins = sorted(plugin["name"] for plugin in scan_payload["plugins"])
    current_modules = sorted(
        f'{plugin["name"]}/{module["name"]}'
        for plugin in scan_payload["plugins"]
        for module in plugin.get("modules", [])
    )
    state.update(
        {
            "cycles_completed": cycle_number,
            "last_run": scan_payload["generated_at"],
            "ue_root": str(ue_root),
            "known_plugins": current_plugins,
            "known_modules": current_modules,
            "last_summary_file": str(summary_file),
            "last_scan_file": str(scan_file),
            "last_architecture_file": str(architecture_file),
            "last_dependency_graph_file": str(dependency_graph_file),
            "last_official_watch_file": str(official_watch_file),
            "last_epic_repo_feed_availability": official_watch_payload["unreal_engine_repo"]["availability"],
        }
    )
    save_state(state_file, state)

    if not args.no_publish:
        publish_outputs(
            repo_root,
            scan_payload,
            summary_markdown,
            progress_file,
            architecture_payload,
            dependency_graph_payload,
            mermaid_graph,
            official_watch_payload,
        )

    print(
        "[OK] MetaHuman evolution cycle complete: "
        f"cycle={cycle_number}, plugins={scan_payload['totals']['plugins']}, "
        f"modules={scan_payload['totals']['modules']}, source_files={scan_payload['totals']['source_files']}"
    )
    print(f"[OK] Summary: {summary_file}")
    print(f"[OK] Architecture: {architecture_file}")
    print(f"[OK] Dependency graph: {dependency_graph_file}")
    print(f"[OK] Official watch: {official_watch_file}")
    print(f"[OK] Progress log: {progress_file}")
    if not args.no_publish:
        print(f"[OK] Published docs: {repo_root / 'web' / 'public' / 'docs' / 'metahuman-evolution-latest.md'}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
