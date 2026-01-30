# LiveKit Hedra Avatar Agent (Example)

This folder contains a minimal LiveKit Agents example that starts a Hedra avatar session
and publishes an avatar video track into a LiveKit room.

Prereqs
- A LiveKit project (Cloud or self-hosted)
- A Hedra account + avatar id
- Python 3.10+

Environment
- LIVEKIT_URL
- LIVEKIT_API_KEY
- LIVEKIT_API_SECRET
- HEDRA_API_KEY
- HEDRA_AVATAR_ID

Install
```bash
pip install "livekit-agents[hedra]~=1.3"
```

Run
```bash
python agent.py
```

Then open the web demo at `/livekit` and join the same room.

