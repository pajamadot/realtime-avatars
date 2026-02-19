# Gaussian Splatting and Real-Time Gaussian Avatars: Training, Rendering, and Deployment

## Executive Summary

Gaussian splatting (in the modern “3D Gaussian Splatting” sense) represents a radiance field as a **set of explicit, anisotropic 3D Gaussian primitives** whose parameters are optimized by differentiable rendering against posed multi-view images, and rendered in real time via a **GPU tile-based rasterization + depth sorting + alpha compositing pipeline**. citeturn9view0turn25view0turn13view0

For **static scenes**, the canonical end-to-end pipeline is: (1) run SfM (commonly via COLMAP) to estimate camera poses and an initial sparse point cloud; (2) initialize one Gaussian per SfM point; (3) optimize Gaussian parameters using an image reconstruction loss (L1 + SSIM-family term) while **densifying/pruning** Gaussians interleaved with optimization; (4) deploy a real-time splat renderer (CUDA/OpenGL, Vulkan, game engines, or WebGL). citeturn9view0turn23view0turn18view0turn25view0

For **real-time Gaussian avatars**, the scene pipeline is extended with **explicit motion models** (e.g., SMPL/SMPL-X for body, FLAME for face, or a driving mesh), and training must solve both: (a) **canonicalization / correspondence** over time; and (b) **pose-dependent dynamics** (wrinkles, mouth interior, hair, accessories). Recent avatar systems cluster into four dominant design patterns:

1. **Mesh-embedded Gaussians** (explicit mesh drives splats; exportable to engines; very high FPS). citeturn27view0turn29view0turn8search2  
2. **Rigged Gaussians on a parametric model** (e.g., FLAME-rigged head Gaussians; controllable expressions/pose). citeturn34view0turn36view1  
3. **Animatable Gaussians with learned Gaussian maps** (2D CNNs predict pose-dependent splat attributes on 2D parameterizations; strong detail). citeturn37view0turn38view0turn38view4  
4. **SMPL/SMPL-X–conditioned Gaussians with learned pose→appearance modules** (explicit LBS forward skinning; sometimes joint pose refinement). citeturn31view0turn31view1turn33view0  

Rendering-wise, the core real-time trick is to **avoid per-ray sampling** (as in NeRF volume marching) and instead do **screen-space splat evaluation** with aggressive GPU parallelism: view-frustum and tile culling, global radix sort by (tile, depth), and per-pixel front-to-back compositing with early termination. citeturn11view0turn25view0turn19view0

Two practical deployment pressures dominate current research and engineering:  
- **Aliasing / filtering mismatch** (training views vs novel zoom/FOV and pixel footprint), addressed by anti-aliasing variants such as Mip-Splatting and analytic integration methods. citeturn10view1turn39search7turn39search10  
- **Model size / bandwidth** (millions of Gaussians; large SH payloads), addressed by hierarchical LOD, compression, and codec-style representations. citeturn10view1turn21view0turn22view0turn8search1  

## Foundations and Landscape

Modern Gaussian splatting sits at the intersection of **point-based rendering** (surfels, splats) and **radiance fields**. Classic “surface splatting” introduced an EWA (elliptical weighted average) formulation for high-quality point rendering with anisotropic filtering and anti-aliasing properties. citeturn26view0 Contemporary 3D Gaussian Splatting builds on these graphics principles while adopting the radiance-field training paradigm: optimize a differentiable scene representation to match multi-view images. citeturn9view0turn13view0

A useful taxonomy for “Gaussian splatting” in 2023–2026 is:

- **3DGS for static scenes**: explicit Gaussians with view-dependent color (often SH) optimized directly from posed images, rendered in real time. citeturn9view0turn18view0  
- **Dynamic Gaussians / 4D Gaussians**: time-varying scenes represented either by per-timestep Gaussians or canonical Gaussians + deformation over time; typically still splat-rendered. citeturn0search27turn0search25  
- **Gaussian avatars**: dynamic humans with explicit control signals (pose/expression), often using SMPL/SMPL-X/FLAME and “rigging” to enable animation control rather than just playback. citeturn27view0turn34view0turn37view0  
- **Feed-forward / sparse-view / single-view Gaussian reconstruction**: networks predict Gaussians directly (no per-scene optimization at inference), trading ultimate fidelity for speed and generalization; e.g., “Splatter Image” reports fast test-time reconstruction and rendering. citeturn39search11  

image_group{"layout":"carousel","aspect_ratio":"16:9","query":["3D Gaussian Splatting ellipses screen space splats visualization","surface splatting EWA ellipsoids rendering diagram","real-time gaussian splatting rasterization tiles depth sorting illustration"],"num_per_query":1}

Key primary sources and “official” implementations that define the baseline most later work inherits from:

- **3D Gaussian Splatting for Real-Time Radiance Field Rendering** (ACM TOG 2023) with the official authors’ repository under entity["organization","Inria","research institute france"]’s GRAPHDECO group. citeturn9view0turn13view0  
- **diff-gaussian-rasterization** (CUDA rasterizer) as a core building block used by many forks and follow-ons. citeturn20view0turn33view0  
- **gsplat** (JMLR 2025), a widely used open-source CUDA/PyTorch kernel library that benchmarks improved memory/time vs the original and consolidates features like anti-aliasing and multiple densification strategies. citeturn19view0  
- **Hierarchical 3D Gaussians** (SIGGRAPH 2024) for large-scale datasets, emphasizing preprocessing and LOD/hierarchy construction and VRAM budgeting/streaming. citeturn21view0  
- **Reducing the Memory Footprint of 3DGS** (PACMCGIT 2024) for compression (fewer primitives, adaptive SH, quantization/half-float) and improved mobile download feasibility. citeturn22view0  

## Training 3D Gaussian Splatting End-to-End

### Data requirements and preprocessing

**Baseline 3DGS assumes posed multi-view images**. The standard preprocessing pipeline uses SfM to estimate camera intrinsics/extrinsics and produce a sparse point cloud, then uses that point cloud to initialize Gaussians “for free” as part of calibration. citeturn9view0turn23view0

The official implementation expects a COLMAP-style directory layout (images + sparse reconstruction). It also provides a `convert.py` workflow to run COLMAP, undistort images, and optionally create multi-resolution image pyramids (½, ¼, ⅛), which is both a preprocessing and a practicality step to manage VRAM/training speed. citeturn23view0turn23view3

**Camera model constraints** matter because the renderer and projection math assume a pinhole-style model; the official repo explicitly notes rasterization requires SIMPLE_PINHOLE or PINHOLE in COLMAP outputs. citeturn23view0

### Scene representation and Gaussian parameterization

In 3DGS, each primitive is a **3D Gaussian** with optimized attributes including:
- **Position** (mean) in 3D. citeturn9view0turn18view0  
- **Anisotropic covariance**, typically parameterized via per-axis scale and a rotation (commonly a quaternion) so that covariance stays symmetric positive definite. citeturn9view0turn11view0turn18view0  
- **Opacity** (alpha), constrained with a sigmoid in the reference method for stable gradients. citeturn11view0turn17view0turn18view0  
- **View-dependent color**, represented via spherical harmonics (SH) coefficients; the reference training defaults to SH degree 3. citeturn9view0turn12view0turn18view0turn23view3  

A practical on-disk manifestation of this parameterization is often a PLY where each Gaussian contributes fields for position, DC color, SH “rest” coefficients, opacity, scale, and rotation; the Reduced-3DGS repo enumerates this layout explicitly (e.g., 3 floats for DC color and 45 floats for the remaining SH coefficients in the classic format). citeturn22view0

### Loss functions and supervision signals

**Core supervision** is reconstruction of training images from known cameras via the differentiable splat renderer. In the original 3DGS training loop, the primary loss is a combination of **L1 photometric error** and a **D-SSIM term** (implemented as a weighted (1−SSIM) component). citeturn11view0turn17view0turn18view0

The official training code implements:
\[
\mathcal{L} = (1-\lambda_{dssim})\|I-\hat I\|_1 + \lambda_{dssim}(1-\mathrm{SSIM}(I,\hat I))
\]
with a default \(\lambda_{dssim}=0.2\). citeturn17view0turn18view0

The “vanilla” paper also notes that it **did not apply explicit regularization** (in the initial formulation), and highlights antialiasing and regularization as natural future directions. citeturn10view1

Since the original release, the official repo documents an update adding training-speed acceleration and compatibility with **depth regularization, anti-aliasing, and exposure compensation** (implementation details vary by branch/version). citeturn13view0turn17view0turn18view0turn19view0

### Optimization schedules and default hyperparameters

The reference implementation’s default optimization parameters (useful as a “baseline recipe”) include: 30k iterations; separate learning rates for position, features, opacity, scaling, rotation; and fixed densification cadence. citeturn18view0

Concretely (defaults):
- Iterations: **30,000**. citeturn18view0turn17view0  
- Position LR schedule: init **1.6e−4**, final **1.6e−6**, with a delay multiplier and max steps = 30k (exponential decay scheduling for positions is also described in the paper). citeturn11view0turn18view0  
- Feature LR **2.5e−3**, opacity LR **2.5e−2**, scaling LR **5e−3**, rotation LR **1e−3**. citeturn18view0  
- Densification interval **100**, densify from iter **500** until **15,000**, opacity reset interval **3,000**, densify gradient threshold **2e−4**. citeturn18view0turn17view0  

The paper reports two canonical training budgets:
- **7k iterations**: minutes-scale training, already good quality for many scenes. citeturn12view0  
- **30k iterations**: tens-of-minutes training, higher quality. citeturn12view0  

### Densification, pruning, and stability heuristics

The defining training feature of 3DGS is **interleaving optimization with adaptive density control**: clone/split Gaussians in under-/over-reconstructed regions and prune transparent or problematic Gaussians. citeturn11view0turn17view0turn25view0

In the original paper, densification is guided by large view-space position gradients (heuristically identifying regions where geometry is missing or overly coarse), and opacity resets are used to “flush out” redundant Gaussians so pruning can remove them. citeturn11view0turn17view0

The renderer/optimizer pair also includes numerical stability rules (e.g., skipping very small alpha contributions, clamping, and early stopping when accumulated opacity saturates), because backward passes reconstruct intermediate transmittance/opacity terms from forward-pass accumulations. citeturn25view0turn12view0  

### Multi-view vs single-view supervision

- **Multi-view (posed) supervision** is the “native” regime for 3DGS: you render from each camera and optimize Gaussians to match images; camera poses are fixed inputs from SfM or ground truth. citeturn9view0turn23view0turn17view0  
- **Single-view / few-view regimes** are inherently ill-posed; recent work increasingly uses feed-forward predictors or strong priors. For example, “Splatter Image” describes mapping an input image to “one 3D Gaussian per pixel” in a feed-forward manner and reports fast test-time behavior (details of training setup are method-specific). citeturn39search11  
- A widely used “middle ground” is **pose-free or unposed multi-view** pipelines that jointly refine poses and reconstruction (often outside this baseline report’s scope); official large-scale methods also discuss “unposed images” as a scenario motivating different pipelines. citeturn21view0  

## Rendering and GPU Implementation

### Core pipeline: project, bin, sort, splat, composite

The 3DGS renderer is a **visibility-aware, tile-based GPU rasterizer** designed to render millions of anisotropic splats efficiently while remaining differentiable. citeturn11view0turn25view0

A canonical forward pass is:

1. **Frustum culling**: keep Gaussians whose confidence interval intersects the frustum; reject unstable cases with a guard band near the near plane. citeturn11view0  
2. **Project Gaussian to screen space**: compute 2D mean and 2D covariance (ellipse) from camera transform and the 3D covariance. citeturn11view0turn25view0turn19view0  
3. **Tile binning (acceleration structure)**: split the screen into **16×16 pixel tiles**; for each Gaussian, determine which tiles it overlaps, “duplicate” the Gaussian into (Gaussian, tile) instances, and assign each instance a key combining tile ID and depth. citeturn11view0turn25view0  
4. **Global radix sort**: sort all instances once per frame by the 64-bit key (tile + depth), then identify per-tile ranges. citeturn11view0turn25view0  
5. **Per-pixel blending within each tile**: traverse depth-sorted splats and accumulate color via alpha compositing (front-to-back in the canonical formulation), with early termination when transmittance approaches zero. citeturn25view0turn19view0  

### Blending/compositing model

The renderer uses an alpha-compositing model closely aligned with volume rendering’s accumulated transmittance view:
- With a depth-sorted list, transmittance \(T_n\) is the product of \(\prod_{j<n}(1-\alpha_j)\), and contributions are blended accordingly. citeturn19view0turn25view0  
- The implementation tracks accumulated opacity/transparency in forward pass so the backward pass can reconstruct needed intermediate values without storing a full per-pixel list, supporting constant overhead per pixel. citeturn12view0turn11view0turn25view0  

### GPU implementation details that matter in practice

The paper explicitly emphasizes that it is built around GPU rasterization principles: tile-based processing, fast GPU sorting, and a design that avoids per-pixel sorting. citeturn11view0turn25view0

In the baseline implementation, GPU radix sort is implemented using optimized GPU sorting routines (paper mentions NVIDIA CUB sorting routines; codebases vary). citeturn12view0turn25view0

A major engineering driver is **memory**:
- The paper states that peak GPU memory can exceed **20 GB** during training for large scenes in an unoptimized prototype, and that storing a trained model can be hundreds of MB plus rasterizer buffers depending on resolution. citeturn10view1turn12view0  
- The official repo’s hardware recommendations align with that pressure: “24 GB VRAM (to train to paper evaluation quality)” and Compute Capability 7.0+. citeturn13view0  

### Anti-aliasing and filtering

Baseline 3DGS historically acknowledged aliasing and identified anti-aliasing as future work. citeturn10view1turn11view0  

In practice, anti-aliasing has become a major subfield:

- **gsplat** explicitly documents an “anti-alias mode” that modifies the effective 2D Gaussian footprint (e.g., adding a smoothing term to the 2D covariance / screen-space size), providing a more robust rendering mode under sampling changes. citeturn19view0  
- **Mip-Splatting (CVPR 2024)** targets “alias-free 3D Gaussian splatting” and frames anti-aliasing via filtering strategies (including EWA-style filtering) adapted to 3DGS. citeturn39search7  
- **Analytic-Splatting (ECCV 2024)** revisits pixel shading/integration and proposes analytic approximations to the pixel window integral response for anti-aliasing. citeturn39search10  

When deploying in engines/WebGL, anti-aliasing often must also be reconciled with the platform’s blending rules, render order, and post-processing pipeline (TAA/FXAA) — details are platform-specific and often unspecified in papers unless the method targets those runtimes directly.

### Real-time constraints, LOD, and compression

Two official, primary-source directions illustrate the production pressures:

- **Hierarchical / LOD**: the Hierarchical 3D Gaussians implementation targets “very large datasets,” includes preprocessing steps, and discusses GPU on-demand streaming and VRAM budgeting as part of the viewer architecture (with ongoing work to improve streaming-from-disk and budget efficiency). citeturn21view0  
- **Compression / bandwidth**: Reduced-3DGS identifies three main levers—primitive count, SH coefficient count, and precision—and reports a combined **×27 size reduction** plus **×1.7 rendering speedup**, explicitly motivated by storage/transmission and improved mobile download times. citeturn22view0  

## Real-Time Gaussian Avatars End-to-End

This section focuses on **end-to-end avatar pipelines**: capture → tracking/calibration → training → animation/control → deployment (engine/web) with latency/bandwidth considerations.

### Capture setups and inputs

Two dominant capture regimes appear across primary sources:

- **Multi-view studio rigs (known cameras)**: Head avatars commonly rely on synchronized multi-view videos with known camera parameters; GaussianAvatars trains on NeRSemble sequences with **16 views** and uses a photometric head tracker to fit FLAME parameters from multi-view observations. citeturn35view0turn35view3turn36view1  
- **Monocular videos (phone/DSLR/in-the-wild)**: Several methods explicitly target single-video capture; SplattingAvatar can be trained from monocular video and uses tracked FLAME meshes for head avatars or SMPL/SMPL-X driven meshes for full body. citeturn27view0turn29view0  

### Pose/camera estimation and preprocessing

For avatar learning, preprocessing typically replaces SfM with **human-specific tracking**:

- **Face**: SplattingAvatar reports altering prior pipelines to use DECA for face tracking, RVM for segmentation, and BiSeNetV2 for face parsing in its head avatar dataset construction. citeturn29view0  
- **Body**: GaussianAvatar’s public repo recommends preprocessing your own video using the InstantAvatar scripts to compute masks and poses (including cameras.npz and pose sequences), and includes a ROMP-to-method pose conversion script path. citeturn33view0  
- **Mesh templates**: Multiple methods assume access to fitted **SMPL/SMPL-X** (body) or **FLAME** (face) meshes per frame, either from tracking pipelines or provided by datasets. citeturn31view0turn29view0turn35view3turn38view1  

### Avatar representations and how animation is achieved

#### Mesh-embedded Gaussians for engine-friendly animation

SplattingAvatar is a clear “graphics-first” pipeline that optimizes a hybrid representation:

- Gaussians are embedded using **barycentric coordinates (u, v) on a triangle index k** plus a displacement *d* along the interpolated normal (Phong surface), making each Gaussian’s motion explicitly tied to mesh deformation. citeturn27view0turn29view0  
- This avoids ambiguous inverse mappings used by many canonical-space NeRF avatars and enables compatibility with multiple animation techniques (skeletal animation, blend shapes, mesh editing). citeturn27view0  
- It reports **>300 FPS** on an entity["company","NVIDIA","gpu company"] RTX 3090 and **30 FPS** on iPhone 13 (rendered in Unity). citeturn27view0turn29view0  

Rigging/export pipeline (notable for practical deployment):
- They export Gaussians (.ply), an embedding descriptor (.json), and a rigged mesh (.fbx), using entity["company","Mixamo","auto rigging service"] for auto-rigging the canonical mesh before bringing assets into entity["company","Unity Technologies","game engine company"]. citeturn29view0  

Rendering in Unity:
- Sort Gaussians by camera-space z, draw one front-parallel quad per visible Gaussian, and use premultiplied-alpha blending (ONE, ONE_MINUS_SRC_ALPHA) to integrate into a standard engine pipeline with occlusion against other objects. citeturn29view0turn8search2  

#### Rigged Gaussians for controllable head avatars

GaussianAvatars rigs 3D Gaussians to a FLAME parametric face mesh:

- It initializes Gaussians at triangle centers and moves them according to the parent triangle’s local frame when FLAME is animated, while allowing learned offsets to deviate for high-fidelity features. citeturn34view0turn35view3  
- It explicitly optimizes both FLAME parameters and Gaussian parameters end-to-end, enabling control via FLAME expression/pose parameters (including expression transfer from a driving sequence). citeturn34view0turn35view3  

Training details (head-specific but illustrative of “avatar GS” regimes):
- Uses Adam; sets learning rates for Gaussian position (5e−3) and scaling (1.7e−2), keeps other learning rates as in 3DGS for remaining parameters, and fine-tunes FLAME translation/joint rotation/expression with small learning rates. citeturn36view1  
- Trains for **600,000 iterations**, enables adaptive density control (with binding inheritance) every 2,000 iterations from iteration 10,000 onward, and resets opacities every 60,000 iterations. citeturn36view1  
- Uses NeRSemble multi-view recordings (9 subjects, 16 views) and evaluates novel-view synthesis, self-reenactment, and cross-identity reenactment. citeturn35view0turn36view1  

Losses include a photometric component plus explicit **position and scaling regularizers** to prevent splats drifting too far from the mesh (hurting controllability) or becoming unstable spikes. citeturn35view2turn35view3  

#### Gaussian maps + 2D CNNs for high-frequency pose-dependent dynamics

Animatable Gaussians proposes a “Gaussian maps” representation:

- Learn a character-specific template (including loose clothing like dresses) and parameterize it onto **front/back “Gaussian maps,” where each pixel corresponds to one 3D Gaussian** with attributes like position/covariance/opacity/color. citeturn37view0turn38view0  
- Use a StyleGAN-derived conditional CNN backbone (StyleUNet) to predict pose-dependent Gaussian maps from pose-conditioned position maps. citeturn37view0turn38view1  
- Use a PCA-based “pose projection strategy” (project posed position maps into a PCA space and clip coefficients) to improve generalization to out-of-distribution poses. citeturn38view0  

Training loss combines L1 + perceptual loss plus an offset regularization on predicted offsets. citeturn38view0

Datasets/metrics:
- Uses THuman4.0 (24 views), ActorsHQ (160 views available; uses 47 full-body views), and AvatarReX dataset (2 sequences, 16 views) and reports that training chunks contain ~1500–3000 frames. citeturn38view1  
- Reports PSNR/SSIM/LPIPS/FID and provides an “animation speed” table: “Ours (PyTorch)” at **10 FPS** (1024×1024) on RTX 3090, contrasting with a TensorRT AvatarReX configuration reported at 25 FPS in their table. citeturn38view1turn38view4  

#### SMPL/SMPL-X–conditioned Gaussians with learned pose→appearance and motion refinement

GaussianAvatar’s paper constructs “animatable 3D Gaussians” integrated with SMPL/SMPL-X:

- It uses standard **linear blend skinning (LBS)** to repose Gaussians from canonical to posed space, propagating skinning weights from mesh vertices to nearby Gaussians. citeturn31view0  
- The pipeline samples ~**200k points** on the SMPL mesh surface and predicts Gaussian attributes via a dynamic appearance network (U-Net) and an MLP decoder; it keeps some Gaussian parameters fixed (e.g., fixed rotations and opacity in their overview figure description). citeturn31view0  
- Training is **two-stage**: first fuse appearance into an optimizable feature tensor and refine motion; second incorporate pose-dependent features and penalize pose features to reduce overfitting to limited pose distributions. The paper provides explicit loss weights for stage 1 (e.g., L1/SSIM/LPIPS weights and L2 regularizers). citeturn31view1turn31view0  

The accompanying repo emphasizes practical preprocessing reuse and notes an explicit TODO to “provide the code for real-time animation” (i.e., **real-time animation support is unspecified / not fully shipped** in that repo at the time of its README snapshot). citeturn33view0  

### Latency, bandwidth, and shipping avatars

For telepresence-style or networked avatars, splat representations stress both storage and streaming:

- Reduced-3DGS demonstrates one principled approach to shrink splat assets: reduce primitive count, adapt SH coefficient counts, and quantize/half-float attributes; it reports **×27 size reduction** and improved rendering speed, with mobile download time motivation. citeturn22view0  
- Hierarchical 3D Gaussians discusses VRAM budgeting and on-demand streaming to GPU, and flags active work on better “streaming from disk” and more efficient VRAM budgeting. citeturn21view0  
- “Relightable Full-Body Gaussian Codec Avatars” explicitly positions Gaussian representations as compatible with conventional real-time engines and explores codec-style decomposition (details are extensive; only high-level claims are summarized here). citeturn8search1turn8search21  

### Integration with engines and WebGL

Engine/web implementations span from research prototypes to practical plugins:

- Unity: SplattingAvatar provides a concrete Unity compute-shader pipeline (quad per Gaussian, engine blending integration). citeturn29view0turn8search2  
- Unity plugin ecosystem: open-source Unity renderers exist (e.g., “UnityGaussianSplatting,” including tooling for formats like “spz” in some releases). citeturn0search28turn0search27  
- Vulkan: NVIDIA provides a Vulkan sample for “Gaussian splatting,” indicating interest in native graphics API deployments. citeturn0search29  
- WebGL: projects like `antimatter15/splat` implement a WebGL real-time viewer for 3DGS outputs, and Three.js-based viewers exist for browser deployment. citeturn8search3turn8search22  

image_group{"layout":"carousel","aspect_ratio":"16:9","query":["SplattingAvatar mesh embedded gaussian splatting Unity rendering example","GaussianAvatars rigged 3D Gaussians head avatar rendering","WebGL 3D Gaussian Splatting viewer screenshot"],"num_per_query":1}

## Comparison of Methods and Repositories

### Static scenes and general Gaussian splatting systems

| paper | year | code link | dataset | training time | real-time capability | pros/cons |
|---|---:|---|---|---|---|---|
| 3D Gaussian Splatting for Real-Time Radiance Field Rendering | 2023 | graphdeco-inria/gaussian-splatting citeturn13view0 | Mip-NeRF 360, Tanks&Temples, Deep Blending; also Blender synthetic citeturn12view0 | Reported 6–45 min depending on iteration budget/dataset (e.g., 30K: ~27–42 min in their table) citeturn12view0 | Yes; paper reports high FPS and repo targets ≥30 fps at high resolution citeturn12view0turn13view0 | **Pros:** strong quality/speed; explicit editable primitives. **Cons:** memory heavy; aliasing noted; unseen regions can artifact. citeturn10view1turn12view0 |
| gsplat: An Open-Source Library for Gaussian Splatting | 2025 | nerfstudio-project/gsplat citeturn0search23turn19view0 | Library (depends on downstream) | N/A (library) | Yes (optimized CUDA kernels) citeturn19view0 | **Pros:** modular CUDA/PyTorch kernels; reports up to 4× less memory and faster training vs original; includes anti-aliasing and multiple densification strategies. **Cons:** integration details depend on project. citeturn19view0 |
| A Hierarchical 3D Gaussian Representation for Real-Time Rendering of Very Large Datasets | 2024 | graphdeco-inria/hierarchical-3d-gaussians citeturn21view0 | “Toy example” released; full datasets “to be released” (as per repo) citeturn21view0 | Unspecified in README excerpt | Targets real-time viewing with VRAM budgeting/streaming considerations citeturn21view0 | **Pros:** addresses scale/LOD; streaming/V RAM budgets. **Cons:** added preprocessing complexity; dataset availability evolving. citeturn21view0 |
| Reducing the Memory Footprint of 3D Gaussian Splatting | 2024 | graphdeco-inria/reduced-3dgs citeturn22view0 | Standard datasets (as described by paper/repo) citeturn22view0 | Unspecified in README excerpt | Yes; claims 1.7× rendering speedup with compression pipeline citeturn22view0 | **Pros:** large storage reduction (×27) via pruning + adaptive SH + quantization/half-float. **Cons:** extra compression pipeline; format changes. citeturn22view0 |
| Scaffold-GS: Structured 3D Gaussians for View-Adaptive Rendering | 2024 (preprint/project) | city-super/Scaffold-GS citeturn39search1turn39search5 | Unspecified in snippet | Unspecified | Aims at view-adaptive rendering with fewer primitives via anchors citeturn39search5 | **Pros:** anchor-based structure; predicts attributes on-the-fly. **Cons:** on-the-fly prediction adds runtime compute; paper-specific tradeoffs. citeturn39search5 |
| 3D Gaussian Splatting as Markov Chain Monte Carlo | 2024 | ubc-vision/3dgs-mcmc citeturn39search2turn39search6 | Unspecified in snippet | Unspecified | Rendering inherits 3DGS; training framed as MCMC/SGLD-style updates citeturn39search9 | **Pros:** replaces/justifies densification via probabilistic sampling view; reduces engineered heuristics. **Cons:** introduces stochasticity/noise; practical stability depends on tuning. citeturn39search9turn39search2 |
| Mip-Splatting: Alias-free 3D Gaussian Splatting | 2024 | (code link unspecified in snippet) citeturn39search7 | Unspecified in snippet | Unspecified | Targets alias-free rendering via filtering strategies citeturn39search7 | **Pros:** addresses aliasing explicitly. **Cons:** added filtering complexity; performance impact depends on implementation. citeturn39search7turn10view1 |

### Real-time Gaussian avatars and animatable humans

| paper | year | code link | dataset | training time | real-time capability | pros/cons |
|---|---:|---|---|---|---|---|
| SplattingAvatar: Realistic Real-Time Human Avatars with Mesh-Embedded Gaussian Splatting | 2024 | initialneil/SplattingAvatar citeturn0search11turn27view0 | Head dataset aggregated from INSTA/NHA/IMAvatar/NerFace; full-body on PeopleSnapshot (uses SMPL meshes refined by Anim-NeRF) citeturn29view0turn28view4 | Unspecified (iterations given; follows 3DGS-style 30k with densify/prune schedule) citeturn8search2turn28view4 | Yes; Unity implementation reports >300 FPS on RTX 3090 and 30 FPS on iPhone 13 citeturn27view0turn29view0 | **Pros:** mesh-driven motion (rig/blendshapes friendly); engine-friendly deployment; strong FPS. **Cons:** fidelity limited by driving mesh’s motion representation (hair/clothes motion not separately modeled). citeturn28view2turn29view0 |
| GaussianAvatars: Photorealistic Head Avatars with Rigged 3D Gaussians | 2024 | ShenhanQian/GaussianAvatars citeturn0search13turn34view0 | NeRSemble (9 subjects; 16 views) citeturn35view0turn36view1 | 600k iterations (time unspecified) citeturn36view1 | Rendering inherits 3DGS; interactive FPS unspecified in paper excerpt | **Pros:** explicit expression/pose control via FLAME; binding inheritance enables densification without losing rigging. **Cons:** relies on accurate tracking/known cameras; relighting not feasible in current approach per limitations. citeturn35view3turn36view1 |
| GaussianAvatar: Towards Realistic Human Avatar Modeling from a Single Video via Animatable 3D Gaussians | 2024 | aipixel/GaussianAvatar citeturn33view0turn30view0 | PeopleSnapshot, NeuMan, and DynVideo (collected; mobile phone) citeturn31view2turn33view0 | Unspecified (two-stage training described; repo shows training stages and epoch-based evaluation settings) citeturn33view0turn31view1 | Rendering inherits 3DGS; repo notes “real-time animation” code as TODO (unspecified) citeturn33view0 | **Pros:** explicit forward skinning avoids inverse mapping ambiguity; joint motion refinement. **Cons:** depends on SMPL/SMPL-X fitting quality and preprocessing; real-time animation pipeline not fully specified in repository. citeturn31view0turn33view0 |
| Animatable Gaussians: Learning Pose-dependent Gaussian Maps for High-fidelity Human Avatar Modeling | 2024 | lizhe00/AnimatableGaussians citeturn7search4turn37view0 | THuman4.0, ActorsHQ, AvatarReX dataset citeturn38view1 | Unspecified (training chunks 1500–3000 frames reported; optimizer schedule unspecified in excerpt) citeturn38view1 | Reports 10 FPS inference (PyTorch) at 1024×1024 on RTX 3090 citeturn38view4 | **Pros:** 2D CNN + Gaussian maps capture sharp pose-dependent cloth dynamics; PCA pose projection for OOD poses. **Cons:** multi-view needed for template reconstruction; clothing/body entangled; speed lower than engine-native rigs without further optimization. citeturn38view0turn38view1turn38view4 |
| Human Gaussian Splatting: Real-time Rendering of Animatable Avatars | 2023 (arXiv) | (code link unspecified in snippet) | Multi-view video frames of dynamic humans citeturn8search26 | Unspecified | Title/abstract emphasize real-time animatable avatars via canonical GS + deformation citeturn8search26 | **Pros:** explicitly targets animatable humans with 3DGS. **Cons:** many implementation details unspecified here (requires reading full paper/code). citeturn8search26 |
| ExAvatar: Expressive Whole-Body 3D Gaussian Avatar | 2024 | mks0601/ExAvatar_RELEASE (reimplementation) citeturn8search23turn8search29 | Monocular short video (paper); SMPL-X + 3DGS hybrid citeturn8search29 | Unspecified | Real-time FPS unspecified in snippet; rendering inherits GS | **Pros:** expressive whole-body with face/hands via SMPL-X drivability + GS photorealism. **Cons:** monocular diversity limits generalization; implementation/runtime details vary by release. citeturn8search29turn8search23 |

## End-to-End Workflow Diagram

```mermaid
flowchart TD
  A[Input capture] --> B{Scenario}
  B -->|Static scene| C[Multi-view photos / video]
  B -->|Human avatar| D[Monocular or multi-view video of person]

  %% Static scene branch
  C --> E[Camera & pose estimation (SfM)]
  E --> F[Sparse point cloud + calibrated cameras]
  F --> G[Initialize 3D Gaussians (one per SfM point)]
  G --> H[Train: differentiable splat rendering loop]
  H --> I[Loss: photometric + perceptual/SSIM terms]
  I --> J[Densify / prune / opacity reset]
  J --> K[Export: splat model (PLY or compressed format)]
  K --> L[Deploy renderer: CUDA/OpenGL, Vulkan, Unity, WebGL]

  %% Avatar branch
  D --> M[Segmentation / matting + keypoint/mesh tracking]
  M --> N[Obtain per-frame template: FLAME or SMPL/SMPL-X or driving mesh]
  N --> O{Avatar representation choice}
  O -->|Mesh-embedded Gaussians| P[Bind Gaussians to mesh triangles (barycentric + normal offset)]
  O -->|Rigged head Gaussians| Q[Bind Gaussians to FLAME triangles + binding inheritance]
  O -->|Gaussian maps + CNN| R[Front/back Gaussian maps + pose-conditioned CNN]
  O -->|SMPL-conditioned + dynamic network| S[Canonical Gaussians + LBS + pose->appearance module]

  P --> T[Train: optimize Gaussians + bindings]
  Q --> T
  R --> T
  S --> T

  T --> U[Metrics: PSNR/SSIM/LPIPS/FID + re-enactment tests]
  T --> V[Runtime: drive avatar with pose/expression (retargeting)]
  V --> W[Deploy: Unity/Unreal/WebGL]
  W --> X[Optional: compression/LOD for streaming + latency budget]
```

## Implementation Checklist and Hardware Guidance

### Baseline implementation checklist (static scenes)

Start from the official authors’ baseline, then layer improvements.

1. **Dataset prep**
   - Calibrate cameras + sparse points with COLMAP; ensure pinhole camera model compatibility for the baseline pipeline. citeturn23view0  
   - Use the provided converter workflow to undistort and optionally construct image pyramids. citeturn23view0  

2. **Training**
   - Use baseline hyperparameters as a starting point (30k iterations; per-parameter learning rates; densify/prune schedule). citeturn18view0turn17view0  
   - Apply warm-up / multi-resolution training (paper describes starting at lower resolution and upsampling early). citeturn12view0  
   - Monitor memory; large scenes can exceed 20 GB VRAM during training in baseline prototypes. citeturn10view1turn13view0  

3. **Evaluation**
   - Use PSNR/SSIM/LPIPS on held-out views; follow dataset-specific splits (e.g., Mip-NeRF360-style “every 8th image” split in the baseline). citeturn12view0turn13view0  
   - Track FPS and model memory size as first-class metrics; the original 3DGS paper reports both. citeturn12view0  

4. **Deployment renderer**
   - Choose your runtime: CUDA/OpenGL viewer (baseline), Vulkan sample, Unity plugin, or WebGL viewer. citeturn13view0turn0search29turn0search28turn8search3  
   - For web/engine integration, validate blending correctness and depth interactions; many implementations adopt “one quad per Gaussian” to fit standard pipelines. citeturn29view0turn8search2  

### Avatar implementation checklist (real-time animatable humans)

1. **Tracking and rigging inputs**
   - Decide whether you will use FLAME (head) or SMPL/SMPL-X (body) or a custom driving mesh; build a robust tracking pipeline (masks + per-frame mesh parameters). citeturn29view0turn31view0turn35view3  

2. **Representation choice**
   - If you need maximum engine compatibility and low latency: prefer **mesh-embedded Gaussians** (SplattingAvatar-style). citeturn27view0turn29view0  
   - If you need explicit expression/pose control for face: prefer **rigged Gaussians on FLAME** (GaussianAvatars-style). citeturn34view0turn35view3  
   - If you need sharp pose-dependent clothing dynamics: consider **Gaussian maps + 2D CNN** approaches (Animatable Gaussians-style), but plan for additional inference compute. citeturn37view0turn38view4  

3. **Training and regularization**
   - Expect to add motion-aware regularizers (e.g., scaling/position constraints) to preserve animatability under novel expressions/poses. citeturn35view2turn28view0  
   - Consider two-stage training when pose estimates are noisy and you need joint refinement. citeturn31view1turn31view0  

4. **Runtime animation + retargeting**
   - Mesh-driven rigs can inherit classic animation tooling (skeletal retargeting, blendshapes); SplattingAvatar even documents a Mixamo-based export flow. citeturn27view0turn29view0  
   - For FLAME-based systems, animation can be accomplished by transferring FLAME expression/pose parameters from a driving sequence. citeturn34view0turn35view3  

5. **Bandwidth/latency planning**
   - If streaming avatars/scenes, plan for compression (Reduced-3DGS) or hierarchical streaming/LOD; otherwise splat sizes can be prohibitive. citeturn22view0turn21view0turn10view1  

### Hardware requirements (practical baseline)

- Training “full quality” 3DGS in the official repo: GPU Compute Capability 7.0+ and **~24 GB VRAM** recommended. citeturn13view0  
- Training times and FPS depend heavily on resolution and model size; the 3DGS paper provides dataset-specific training time and FPS numbers and reports results measured on an A6000 for most runs. citeturn12view0  
- For avatar runtimes:
  - SplattingAvatar reports extremely high FPS in Unity on RTX 3090-class GPUs and mobile feasibility (30 FPS iPhone 13). citeturn27view0turn29view0  
  - Animatable Gaussians reports 10 FPS (PyTorch inference) at 1024×1024 on RTX 3090, implying the need for further optimization (TensorRT/custom kernels) for higher-FPS deployment. citeturn38view4  

## Open Challenges and Research Opportunities

**Aliasing and correct filtering across view changes** remains a central unresolved issue for production deployment. Baseline 3DGS identifies antialiasing as future work, and follow-ons like Mip-Splatting and analytic integration methods demonstrate that filtering choices interact deeply with both optimization and rendering. citeturn10view1turn39search7turn39search10  

**Memory footprint and network delivery** is a persistent bottleneck:
- Baseline training can exceed 20 GB VRAM for large scenes, and trained models can be hundreds of MB, making web/mobile distribution challenging without compression and LOD. citeturn10view1turn12view0turn22view0  
- Hierarchical and codec approaches point to an emerging “Gaussian streaming stack,” but efficient cross-platform formats and standardized GPU decode/render pipelines remain open. citeturn21view0turn8search1turn22view0  

**Animatable humans still struggle with controllability vs fidelity tradeoffs**:
- Strong mesh/parametric priors (SMPL/FLAME) improve controllability but can under-model hair/clothing topology and non-modeled regions; multiple avatar papers explicitly cite these limitations. citeturn28view2turn35view3turn37view0  
- Methods that allow Gaussians to drift too freely can overfit training frames and break under novel expressions/poses, motivating explicit position/scaling regularizers and binding strategies. citeturn35view2turn35view3  

**Better densification/placement (and removing heuristics)** is an active area:
- Libraries like gsplat expose multiple densification strategies (including MCMC-style) as modular research knobs, and NeurIPS work reframes Gaussian placement as MCMC sampling. citeturn19view0turn39search2turn39search6  

**Feed-forward and generalizable Gaussian reconstruction** is accelerating:
- Single-/few-view Gaussian prediction (e.g., Splatter Image) suggests a “real-time-from-image” future, but robust geometry, view consistency, and controllable animation remain open problems compared to per-subject optimization pipelines. citeturn39search11turn37view0  

**Engine-native interoperability** is promising but fragmented:
- Unity/WebGL renderers prove feasibility, yet consistent depth interaction, correct transparency sorting, and post-processing compatibility vary widely across implementations. Formalizing renderer contracts (formats, sorting guarantees, AA semantics) is still an open ecosystem effort. citeturn29view0turn8search3turn0search28turn19view0

## Skill Conclusion: How Realtime Gaussian Avatars Work

- Updated at (UTC): `2026-02-19T05:05:43Z`
- Cycle: `2`

### Core conclusion
Realtime Gaussian avatars work by combining explicit 3D Gaussian scene primitives with a controllable motion driver.
They are trained from captured identity data, canonicalized against a face/body template, then rendered with a tile-based splat rasterizer at interactive frame rates.

### End-to-end flow
1. Identity capture: collect multi-view (best quality) or monocular (faster setup) data.
2. Tracking + canonicalization: fit camera/face/body parameters and define a canonical avatar space.
3. Gaussian parameter learning: optimize per-splat position/covariance/color/opacity and optional dynamics.
4. Driver inference: map audio, expression, pose, and gaze signals into deformation/control updates.
5. Realtime render: tile-based depth-sorted Gaussian splat rasterization and alpha compositing.
6. Delivery: stream rendered avatar with synchronized audio through WebRTC/game-engine surfaces.

### Key architecture variants observed
- Canonical representation: explicit anisotropic 3D Gaussians (position, covariance, opacity, color/SH).
- Realtime renderer: tile-based, depth-sorted splat rasterization with alpha compositing.
- Animation control: drive Gaussian attributes/deformation from pose, expression, and audio-derived signals.
- Deployment stack: compression/LOD/streaming are required for web/mobile scale.
- Monocular reconstruction variants trade quality for easier capture and faster onboarding.

### Sources (sample)
- OMEGA-Avatar: One-shot Modeling of 360° Gaussian Avatars - https://arxiv.org/abs/2602.11693v1
- ReaDy-Go: Real-to-Sim Dynamic 3D Gaussian Splatting Simulation for Environment-Specific Visual Navigation with Moving Obstacles - https://arxiv.org/abs/2602.11575v2
- Toward Fine-Grained Facial Control in 3D Talking Head Generation - https://arxiv.org/abs/2602.09736v1
- From Blurry to Believable: Enhancing Low-quality Talking Heads with 3D Generative Priors - https://arxiv.org/abs/2602.06122v1
- JOintGS: Joint Optimization of Cameras, Bodies and 3D Gaussians for In-the-Wild Monocular Reconstruction - https://arxiv.org/abs/2602.04317v1
- VRGaussianAvatar: Integrating 3D Gaussian Avatars into VR - https://arxiv.org/abs/2602.01674v1
- Lightweight High-Fidelity Low-Bitrate Talking Face Compression for 3D Video Conference - https://arxiv.org/abs/2601.21269v1
- Uncertainty-Aware 3D Emotional Talking Face Synthesis with Emotion Prior Distillation - https://arxiv.org/abs/2601.19112v1
- graphdeco-inria/gaussian-splatting - https://github.com/graphdeco-inria/gaussian-splatting
- nerfstudio-project/gsplat - https://github.com/nerfstudio-project/gsplat
- graphdeco-inria/hierarchical-3d-gaussians - https://github.com/graphdeco-inria/hierarchical-3d-gaussians
- lizhe00/AnimatableGaussians - https://github.com/lizhe00/AnimatableGaussians
- ShenhanQian/GaussianAvatars - https://github.com/ShenhanQian/GaussianAvatars
- aigc3d/LAM - https://github.com/aigc3d/LAM
