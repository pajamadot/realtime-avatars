# Audio-to-Face Options (UE 5.7)

This compares practical routes for driving MetaHuman facial animation from speech, and what is already implemented in this repo.

## 1) MetaHuman Audio Live Link (official Epic path)

- Official docs:  
  - Realtime animation overview: https://dev.epicgames.com/documentation/en-us/metahuman/realtime-animation  
  - Audio source setup: https://dev.epicgames.com/documentation/en-us/metahuman/using-a-metahuman-audio-source  
  - Subject connection: https://dev.epicgames.com/documentation/es-mx/metahuman/connecting-a-live-link-subject-to-your-metahuman
- Best when you want the standard Epic workflow and direct Live Link subject control.
- Requires MetaHuman Live Link plugin and subject binding on the assembled MetaHuman actor.

## 2) OpenAI Realtime + custom morph mapping (implemented here)

- OpenAI WebRTC + ephemeral client secret flow: https://platform.openai.com/docs/guides/realtime-webrtc
- In this repo:
  - Browser connects to OpenAI Realtime via WebRTC.
  - Assistant audio is analyzed (RMS + band energy).
  - Morph targets are generated and sent to Unreal control endpoint in realtime.
- This is now the fastest path to “talking MetaHuman” in your current project with your custom local control plugin.

## 3) NVIDIA ACE Audio2Face-3D

- Docs:  
  - Install: https://docs.nvidia.com/ace/ace-unreal-plugin/latest/ace-unreal-plugin-install.html  
  - Audio2Face-3D: https://docs.nvidia.com/ace/ace-unreal-plugin/latest/ace-unreal-plugin-audio2face.html
- Provides stronger production-grade speech-to-face solving, with C++ and Blueprint integration.
- Tradeoff: additional plugin/runtime dependencies and GPU/service requirements.

## 4) OVR Lip Sync (community UE5 builds)

- Community UE5 build example: https://github.com/viniciushelder/OVRLipSync-UE5
- Good for classic viseme-driven lipsync pipelines; plugin licensing and UE-version compatibility must be checked per branch/release.

## Recommendation for your project right now

1. Keep the newly implemented OpenAI Realtime + custom morph mapping path for immediate interactive demos.
2. In parallel, validate MetaHuman Audio Live Link in-editor as the baseline official Epic pipeline.
3. If you need higher-quality production lipsync robustness, evaluate NVIDIA ACE next.
