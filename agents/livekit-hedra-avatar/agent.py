import os
from pathlib import Path

from dotenv import load_dotenv
from PIL import Image

from livekit import agents
from livekit.agents.voice import Agent, AgentSession
from livekit.plugins import hedra, openai, silero


load_dotenv()


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
    avatar_image = _load_avatar_image()

    avatar_identity = _env("AVATAR_PARTICIPANT_IDENTITY", "hedra-avatar")
    avatar_session = hedra.AvatarSession(
        avatar_participant_identity=avatar_identity,
        avatar_image=avatar_image,
    )

    session = AgentSession(
        llm=openai.realtime.RealtimeModel(),
        vad=silero.VAD.load(),
    )

    # Start the avatar worker first so its tracks appear immediately when the user joins.
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

