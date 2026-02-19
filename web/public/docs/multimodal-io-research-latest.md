# Multimodal Inputs/Outputs Research

- Generated at (UTC): `2026-02-19T05:14:56Z`
- Cycle: `2`
- Core source cycle: `10`

## Distilled Conclusion

Multimodal behavior is achieved with three different representations:
- `MetaHuman`: explicit rig coefficients (deterministic).
- `Video Generation`: latent-conditioned frame synthesis (implicit).
- `Gaussian Splatting`: explicit neural primitives rasterized in realtime.

## Claim Matrix (Recommended Support)

### User Inputs

- `Audio prosody` | MH `Native` | VG `Native` | GS `Native`
- `Expression coefficients` | MH `Native` | VG `Conditional` | GS `Native`
- `Face video (webcam)` | MH `Native` | VG `Native` | GS `Conditional`
- `Gaze direction` | MH `Native` | VG `Conditional` | GS `Conditional`
- `Head pose` | MH `Native` | VG `Native` | GS `Native`
- `Turn-taking signals` | MH `Native` | VG `Native` | GS `Native`

### Agent Outputs

- `Facial action units` | MH `Native` | VG `Conditional` | GS `Conditional`
- `Gaze shifts` | MH `Native` | VG `Conditional` | GS `Conditional`
- `Hand gestures` | MH `Native` | VG `Native` | GS `Conditional`
- `Head motion` | MH `Native` | VG `Native` | GS `Native`
- `Idle micro-motion` | MH `Native` | VG `Native` | GS `Native`
- `Speech audio` | MH `Native` | VG `Native` | GS `Native`

### Coupling Styles

- `Audio + pose (TaoAvatar)` | MH `Not native` | VG `Not native` | GS `Native`
- `Audio + text + image (LiveTalk)` | MH `Not native` | VG `Native` | GS `Not native`
- `Audio + user motion (Avatar Forcing)` | MH `Not native` | VG `Native` | GS `Not native`
- `Audio-only driven` | MH `Native` | VG `Native` | GS `Native`

## Delta

- New ArXiv entries this cycle: `0`
- New GitHub repos this cycle: `1`

## ArXiv Highlights

- `Punchlines Unbound: Comedy Practices in Social Virtual Reality` - `http://arxiv.org/abs/2602.16013v1`
- `ReaDy-Go: Real-to-Sim Dynamic 3D Gaussian Splatting Simulation for Environment-Specific Visual Navigation with Moving Obstacles` - `http://arxiv.org/abs/2602.11575v2`
- `OMEGA-Avatar: One-shot Modeling of 360° Gaussian Avatars` - `http://arxiv.org/abs/2602.11693v1`
- `Scaling Open Discrete Audio Foundation Models with Interleaved Semantic, Acoustic, and Text Tokens` - `http://arxiv.org/abs/2602.16687v1`
- `DreamBarbie: Text to Barbie-Style 3D Avatars` - `http://arxiv.org/abs/2408.09126v7`
- `StrandHead: Text to Hair-Disentangled 3D Head Avatars Using Human-Centric Priors` - `http://arxiv.org/abs/2412.11586v4`

## GitHub Highlights

- `cvlab-kaist/GaussianTalker` (stars `0`)
- `graphdeco-inria/gaussian-splatting` (stars `0`)
- `OpenTalker/SadTalker` (stars `0`)
- `KwaiVGI/LivePortrait` (stars `0`)
- `Kedreamix/Linly-Talker` (stars `3134`)
- `livekit/agents` (stars `0`)
- `soulx-ai/SoulX-FlashHead` (stars `0`)
- `chocolatepcode/unreal-motion` (stars `0`)
- `TimoR91/FGJ2022_Lahti_TimoR` (stars `0`)
- `alexdjulin/LiveLinkFace-CSV-Retarget-For-Motionbuilder` (stars `19`)
