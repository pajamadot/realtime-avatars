import os

from livekit import agents
from livekit.agents import AgentServer, AgentSession
from livekit.plugins import hedra


def _env(name: str) -> str:
    v = os.environ.get(name, "")
    return v.strip()


server = AgentServer()


@server.rtc_session(agent_name=_env("LIVEKIT_AGENT_NAME") or "avatar-agent")
async def entrypoint(ctx: agents.JobContext):
    # NOTE: This is intentionally minimal. For a real conversational avatar,
    # configure STT/LLM/TTS on the AgentSession and handle turn-taking.
    session = AgentSession()

    avatar_id = _env("HEDRA_AVATAR_ID")
    if not avatar_id:
        raise RuntimeError("Missing HEDRA_AVATAR_ID")

    avatar = hedra.AvatarSession(avatar_id=avatar_id)
    await avatar.start(session, room=ctx.room)

    # The Hedra avatar session uses the agent audio output to drive the avatar.
    # Your web client should publish microphone audio into the same room.
    await session.start(room=ctx.room)


if __name__ == "__main__":
    server.run()

