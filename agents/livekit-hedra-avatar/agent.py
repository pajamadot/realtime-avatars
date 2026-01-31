import os
import base64
import json
from io import BytesIO
from pathlib import Path

from dotenv import load_dotenv
from PIL import Image

from livekit import agents
from livekit.agents.voice import Agent, AgentSession
from livekit.plugins import hedra, openai, silero
import aiohttp


_HERE = Path(__file__).resolve().parent


def _find_repo_root_for_secrets(start: Path) -> Path | None:
    # When running from the monorepo, this file lives at:
    #   <repo>/agents/livekit-hedra-avatar/agent.py
    #
    # When deployed to LiveKit Cloud, the build context is usually the agent folder,
    # so this file will be at:
    #   /app/agent.py
    #
    # We walk upwards safely and only use the repo root if it contains secrets/.ENV.
    for p in (start, *start.parents):
        if (p / "secrets" / ".ENV").exists():
            return p
    return None


# Support repo-level secrets storage (not checked into git), while still allowing
# per-agent overrides via a local `.env` next to this file.
_repo_root = _find_repo_root_for_secrets(_HERE)
if _repo_root:
    load_dotenv(dotenv_path=_repo_root / "secrets" / ".ENV", override=False)
load_dotenv(dotenv_path=_HERE / ".env", override=False)


def _env(name: str, default: str = "") -> str:
    v = os.environ.get(name, default)
    return v.strip()


def _load_avatar_image() -> Image.Image:
    # Prefer explicit env var for CI / container deployments.
    configured = _env("AVATAR_IMAGE_PATH") or _env("HEDRA_AVATAR_IMAGE_PATH")
    if configured:
        p = Path(configured).expanduser().resolve()
        if not p.exists():
            raise FileNotFoundError(f"Avatar image not found at {p}")
        return Image.open(p)

    # Local dev convenience: drop avatar.(png|jpg|jpeg) next to this file.
    here = Path(__file__).resolve().parent
    for ext in (".png", ".jpg", ".jpeg"):
        p = here / f"avatar{ext}"
        if p.exists():
            return Image.open(p)

    raise FileNotFoundError(
        "No avatar image found. Add agents/livekit-hedra-avatar/avatar.png (or .jpg/.jpeg) "
        "or set AVATAR_IMAGE_PATH."
    )


def _parse_job_metadata(raw: str) -> dict[str, object] | None:
    raw = (raw or "").strip()
    if not raw:
        return None

    try:
        parsed = json.loads(raw)
    except Exception:
        return None

    if isinstance(parsed, dict):
        return parsed

    return None


async def _load_avatar_image_from_url(url: str) -> Image.Image:
    url = url.strip()

    # Support data URLs for small demos, but prefer https URLs.
    if url.startswith("data:"):
        header, data = url.split(",", 1)
        if ";base64" not in header:
            raise ValueError("Only base64 data URLs are supported for avatar images")
        raw = base64.b64decode(data)
        return Image.open(BytesIO(raw))

    if not (url.startswith("https://") or url.startswith("http://")):
        raise ValueError("avatar image url must be http(s)")

    timeout = aiohttp.ClientTimeout(total=20)
    async with aiohttp.ClientSession(timeout=timeout) as s:
        async with s.get(url) as r:
            r.raise_for_status()
            raw = await r.read()

    # Safety: avoid attempting to decode huge files.
    if len(raw) > 10 * 1024 * 1024:
        raise ValueError("avatar image is too large (>10MB)")

    return Image.open(BytesIO(raw))


class HedraRealtimeAgent(Agent):
    def __init__(self) -> None:
        super().__init__(
            instructions=(
                "You are a helpful, concise voice assistant. "
                "Speak clearly and keep responses under 2 sentences unless asked."
            )
        )


async def entrypoint(ctx: agents.JobContext):
    # Hedra creates a live avatar stream from a static face image, driven by the agent's
    # speech output. This requires no GPU on your side.
    avatar_identity = _env("AVATAR_PARTICIPANT_IDENTITY", "hedra-avatar")

    # Allow per-room overrides via LiveKit agent dispatch metadata.
    # We expect a JSON object string, for example:
    #   { "avatarImageUrl": "https://..." }
    #
    # This makes it possible to generate a face image on the website (e.g. via fal.ai)
    # and pass it to the agent without shipping image files in the container.
    job_meta = _parse_job_metadata(getattr(ctx.job, "metadata", ""))
    meta_avatar_id = (
        job_meta.get("hedraAvatarId") if job_meta else None
    ) or (job_meta.get("hedra_avatar_id") if job_meta else None)
    meta_avatar_url = (
        job_meta.get("avatarImageUrl") if job_meta else None
    ) or (job_meta.get("avatar_image_url") if job_meta else None)

    if not isinstance(meta_avatar_id, str):
        meta_avatar_id = None
    if not isinstance(meta_avatar_url, str):
        meta_avatar_url = None

    hedra_avatar_id = (meta_avatar_id or _env("HEDRA_AVATAR_ID")).strip()

    avatar_session: hedra.AvatarSession | None = None
    if meta_avatar_url and meta_avatar_url.strip():
        try:
            avatar_image = await _load_avatar_image_from_url(meta_avatar_url)
            avatar_session = hedra.AvatarSession(
                avatar_participant_identity=avatar_identity,
                avatar_image=avatar_image,
            )
        except Exception as e:
            print(f"[avatar] failed to load avatarImageUrl ({e}); falling back")

    if not avatar_session and hedra_avatar_id:
        avatar_session = hedra.AvatarSession(
            avatar_participant_identity=avatar_identity,
            avatar_id=hedra_avatar_id,
        )

    if not avatar_session:
        try:
            avatar_image = _load_avatar_image()
            avatar_session = hedra.AvatarSession(
                avatar_participant_identity=avatar_identity,
                avatar_image=avatar_image,
            )
        except FileNotFoundError as e:
            print(f"[avatar] {e}. Continuing without an avatar video stream.")
            avatar_session = None

    session = AgentSession(
        llm=openai.realtime.RealtimeModel(),
        vad=silero.VAD.load(),
    )

    # Start the avatar worker first so its tracks appear immediately when the user joins.
    if avatar_session:
        await avatar_session.start(session, room=ctx.room)

    await session.start(room=ctx.room, agent=HedraRealtimeAgent())

    # Optional: speak first (removes the "blank room" feeling).
    if _env("AGENT_GREET", "1") not in ("0", "false", "False"):
        await session.generate_reply(
            instructions="Greet the user briefly and ask what you can help with."
        )


if __name__ == "__main__":
    agents.cli.run_app(
        agents.WorkerOptions(
            entrypoint_fnc=entrypoint,
            agent_name=_env("LIVEKIT_AGENT_NAME", "avatar-agent"),
        )
    )
