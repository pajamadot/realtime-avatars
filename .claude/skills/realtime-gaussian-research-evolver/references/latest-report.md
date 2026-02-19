# Realtime Gaussian Avatar Deep Research (Latest Cycle)

- Generated at (UTC): `2026-02-19T05:05:43Z`
- Cycle: `2`
- ArXiv papers tracked: `50`
- GitHub repos tracked: `21`

## Delta From Previous Cycle

- New papers: `4`
- New repos: `0`

## How It Works (Conclusion)

### Pipeline
1. Identity capture: collect multi-view (best quality) or monocular (faster setup) data.
1. Tracking + canonicalization: fit camera/face/body parameters and define a canonical avatar space.
1. Gaussian parameter learning: optimize per-splat position/covariance/color/opacity and optional dynamics.
1. Driver inference: map audio, expression, pose, and gaze signals into deformation/control updates.
1. Realtime render: tile-based depth-sorted Gaussian splat rasterization and alpha compositing.
1. Delivery: stream rendered avatar with synchronized audio through WebRTC/game-engine surfaces.

### Dominant Architecture Patterns
- Canonical representation: explicit anisotropic 3D Gaussians (position, covariance, opacity, color/SH).
- Realtime renderer: tile-based, depth-sorted splat rasterization with alpha compositing.
- Animation control: drive Gaussian attributes/deformation from pose, expression, and audio-derived signals.
- Deployment stack: compression/LOD/streaming are required for web/mobile scale.
- Monocular reconstruction variants trade quality for easier capture and faster onboarding.

### Design Tradeoffs
- Quality vs setup: multi-view capture improves realism but increases capture complexity.
- Control vs realism: stronger rig constraints improve editability but can limit fine detail.
- Latency vs fidelity: anti-aliasing and high-resolution rendering increase quality but cost frame budget.
- Model size vs portability: compression/LOD are required for web/mobile distribution.

## Top Recent Papers

- `2026-02-12` [OMEGA-Avatar: One-shot Modeling of 360° Gaussian Avatars](https://arxiv.org/abs/2602.11693v1) (`2602.11693v1`)
- `2026-02-12` [ReaDy-Go: Real-to-Sim Dynamic 3D Gaussian Splatting Simulation for Environment-Specific Visual Navigation with Moving Obstacles](https://arxiv.org/abs/2602.11575v2) (`2602.11575v2`)
- `2026-02-10` [Toward Fine-Grained Facial Control in 3D Talking Head Generation](https://arxiv.org/abs/2602.09736v1) (`2602.09736v1`)
- `2026-02-05` [From Blurry to Believable: Enhancing Low-quality Talking Heads with 3D Generative Priors](https://arxiv.org/abs/2602.06122v1) (`2602.06122v1`)
- `2026-02-04` [JOintGS: Joint Optimization of Cameras, Bodies and 3D Gaussians for In-the-Wild Monocular Reconstruction](https://arxiv.org/abs/2602.04317v1) (`2602.04317v1`)
- `2026-02-02` [VRGaussianAvatar: Integrating 3D Gaussian Avatars into VR](https://arxiv.org/abs/2602.01674v1) (`2602.01674v1`)
- `2026-01-29` [Lightweight High-Fidelity Low-Bitrate Talking Face Compression for 3D Video Conference](https://arxiv.org/abs/2601.21269v1) (`2601.21269v1`)
- `2026-01-27` [Uncertainty-Aware 3D Emotional Talking Face Synthesis with Emotion Prior Distillation](https://arxiv.org/abs/2601.19112v1) (`2601.19112v1`)
- `2026-01-26` [Splat-Portrait: Generalizing Talking Heads with Gaussian Splatting](https://arxiv.org/abs/2601.18633v1) (`2601.18633v1`)
- `2026-01-23` [ReWeaver: Towards Simulation-Ready and Topology-Accurate Garment Reconstruction](https://arxiv.org/abs/2601.16672v1) (`2601.16672v1`)
- `2026-01-19` [ICo3D: An Interactive Conversational 3D Virtual Human](https://arxiv.org/abs/2601.13148v1) (`2601.13148v1`)
- `2026-01-19` [Generalizable and Animatable 3D Full-Head Gaussian Avatar from a Single Image](https://arxiv.org/abs/2601.12770v1) (`2601.12770v1`)

## Key Repositories

- [graphdeco-inria/gaussian-splatting](https://github.com/graphdeco-inria/gaussian-splatting) - stars `20701`, pushed `2025-10-17`
- [nerfstudio-project/gsplat](https://github.com/nerfstudio-project/gsplat) - stars `4521`, pushed `2026-01-28`
- [graphdeco-inria/hierarchical-3d-gaussians](https://github.com/graphdeco-inria/hierarchical-3d-gaussians) - stars `1373`, pushed `2025-06-10`
- [lizhe00/AnimatableGaussians](https://github.com/lizhe00/AnimatableGaussians) - stars `1071`, pushed `2024-11-16`
- [ShenhanQian/GaussianAvatars](https://github.com/ShenhanQian/GaussianAvatars) - stars `948`, pushed `2026-02-11`
- [aigc3d/LAM](https://github.com/aigc3d/LAM) - stars `922`, pushed `2025-09-11`
- [aipixel/GaussianAvatar](https://github.com/aipixel/GaussianAvatar) - stars `576`, pushed `2024-03-26`
- [xg-chu/GAGAvatar](https://github.com/xg-chu/GAGAvatar) - stars `569`, pushed `2025-03-13`
- [initialneil/SplattingAvatar](https://github.com/initialneil/SplattingAvatar) - stars `539`, pushed `2024-10-28`
- [aigc3d/AniGS](https://github.com/aigc3d/AniGS) - stars `453`, pushed `2025-03-13`
- [cvlab-kaist/GaussianTalker](https://github.com/cvlab-kaist/GaussianTalker) - stars `387`, pushed `2025-10-12`
- [graphdeco-inria/reduced-3dgs](https://github.com/graphdeco-inria/reduced-3dgs) - stars `229`, pushed `2025-09-22`
