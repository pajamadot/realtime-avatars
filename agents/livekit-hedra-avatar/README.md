# LiveKit Hedra Avatar Agent (Realtime, Custom Face)

This agent publishes a low-latency talking-head avatar into a LiveKit room:
- Custom face from a single image (no GPU required)
- OpenAI Realtime model for fast conversation
- Hedra generates the avatar video/audio tracks

Works with LiveKit Cloud (recommended) or a self-hosted LiveKit server.

## What you need

- LiveKit project (Cloud)
- Hedra API key
- OpenAI API key (Realtime)
- A face image (e.g. `avatar.png`)

## Setup (local)

1) Put your face image here (NOT committed):

- `agents/livekit-hedra-avatar/avatar.png` (or `.jpg` / `.jpeg`)

2) Create a venv and install deps:

```bash
cd agents/livekit-hedra-avatar
python -m venv .venv
.venv\\Scripts\\activate
pip install -r requirements.txt
```

3) Create `.env`:

```bash
LIVEKIT_URL=wss://YOUR-PROJECT.livekit.cloud
LIVEKIT_API_KEY=...
LIVEKIT_API_SECRET=...

LIVEKIT_AGENT_NAME=avatar-agent

HEDRA_API_KEY=...
OPENAI_API_KEY=...
```

4) Run:

```bash
python agent.py
```

Then open the web demo at `/livekit`, use the same room name, and keep `Agent name` as
`avatar-agent` (or whatever you set in `LIVEKIT_AGENT_NAME`).

## Deploy (LiveKit Cloud Agents)

You can deploy this as a managed agent on LiveKit Cloud and avoid running a server yourself.

High-level steps:
- Install and auth the LiveKit CLI (`lk`)
- Create an agent deployment from this folder
- Set secrets on the deployment (`HEDRA_API_KEY`, `OPENAI_API_KEY`, etc.)

LiveKit docs:
- https://docs.livekit.io/agents/deployment/

## Notes

- If you want the avatar to wait for the user to speak first, set `AGENT_GREET=0`.
- You can also set `AVATAR_IMAGE_PATH` to point at an image file instead of `avatar.png`.

