export type PresenterScriptEntry = {
  slide: number;
  title: string;
  script: string;
};

export const PRESENTER_SCRIPTS: PresenterScriptEntry[] = [
  {
    slide: 1,
    title: 'Title',
    script: 'Today I will walk through a practical map of real-time avatars for storytelling. The goal is not hype. The goal is to compare concrete approaches, show where each one works, and define an end-to-end system that can actually run in production.',
  },
  {
    slide: 2,
    title: 'Intro',
    script: 'This is my working context. I build systems that combine AI behavior, rendering, and interaction tooling. This presentation is not a concept pitch. It is a build log with architecture decisions and evidence links.',
  },
  {
    slide: 3,
    title: 'Cogix Eye Tracker Prototype',
    script: 'During the day, I work on Cogix and eye-tracking pipeline work. This matters because gaze and attention are core interaction signals for believable social avatars. The prototype work informs how I think about multimodal perception upstream of rendering.',
  },
  {
    slide: 4,
    title: 'Graph Nerd',
    script: 'At night, I build graph-based storytelling tools. Graph structure is how I represent scenes, state, and transitions. That graph mindset carries into avatar orchestration: inputs, policy, controls, and outputs should be explicit and traceable.',
  },
  {
    slide: 5,
    title: 'Character Creation Roadmap',
    script: 'Current character creation is 2D and static. The roadmap is straightforward: keep identity consistency first, then move to 3D dynamic embodiment, then move to live real-time performance. The stack should evolve without losing narrative continuity.',
  },
  {
    slide: 6,
    title: 'Identity to Performance Bridge',
    script: 'This bridge slide is the handoff: identity definition becomes runtime response behavior, and runtime behavior becomes live performance. The key point is sequencing. Identity and memory come first; rendering is downstream execution.',
  },
  {
    slide: 7,
    title: 'End-to-End Runtime Definition',
    script: 'Here is the shared runtime definition: end-user inputs go into perception, then response model and memory, then avatar control signals, then multimodal outputs. All three backend approaches plug into this same high-level contract.',
  },
  {
    slide: 8,
    title: 'Selection Question',
    script: 'Now we ask the actual decision question: which backend best matches control, latency, platform, and production constraints. This is where architecture becomes a tradeoff problem, not a branding preference.',
  },
  {
    slide: 9,
    title: 'Three Approaches',
    script: 'The three approaches are MetaHuman, video generation, and Gaussian splatting. They differ mostly in representation and control surface. Upstream perception can be shared, but backend execution behavior is very different.',
  },
  {
    slide: 10,
    title: 'Multimodal User-Input Processing Layer',
    script: 'This slide isolates the missing but essential layer: user-input processing. Capture, quality checks, per-modality feature extraction, temporal alignment, and state update happen before backend control. This is where interaction reliability is won or lost.',
  },
  {
    slide: 11,
    title: 'Interaction Signal Contract',
    script: 'This page is backend-facing only. It specifies which signals are built-in backend paths, which need adapters, and which remain external services. For MetaHuman specifically, Live Link and rig controls are native; ASR and policy logic are external.',
  },
  {
    slide: 12,
    title: 'MetaHuman Demo',
    script: 'This is the MetaHuman demo entry point. It shows the practical result of the Unreal-based control stack and streaming path. Use it as the visual anchor before the mechanism details.',
  },
  {
    slide: 13,
    title: 'MetaHuman Mechanism',
    script: 'Mechanically, MetaHuman runs through capture inputs, solving paths, core filtering, RigLogic evaluation, then Unreal render and stream output. The value is explicit rig control and deterministic animation behavior.',
  },
  {
    slide: 14,
    title: 'MetaHuman Identity and Response Stack',
    script: 'Identity is authored through Mesh-to-MetaHuman and DNA-backed assets. Runtime response uses capture and solve pipelines to produce control curves and transforms. Social policy still comes from an external cognition layer.',
  },
  {
    slide: 15,
    title: 'Video Generation Demo',
    script: 'This demo represents diffusion-based talking avatars delivered over real-time streaming. The operational value is fast setup and strong visual style flexibility, especially when direct rig authoring is not required.',
  },
  {
    slide: 16,
    title: 'Video Generation Mechanism',
    script: 'The pipeline combines conditioning inputs, temporal modules, and generation blocks to produce frame streams. Practical performance depends on distillation, forcing strategies, and transport latency management.',
  },
  {
    slide: 17,
    title: 'Video Generation Identity and Response Stack',
    script: 'Identity is encoded into latent features from reference imagery. Response behavior is mostly implicit through conditioning and temporal generation modules. This is fast to iterate but less explicit than rig-based control.',
  },
  {
    slide: 18,
    title: 'Video Generation Research Snapshot',
    script: 'This page is the paper-backed snapshot for latency, control, and deployment lines of work. It is there to anchor claims with sources, not to declare a universal winner.',
  },
  {
    slide: 19,
    title: 'OpenAvatarChat and LAM Demo',
    script: 'This is the Gaussian avatar demo entry point for OpenAvatarChat and LAM-style setup. If local infrastructure is unavailable, use the external fallback demo link to keep the presentation flow intact.',
  },
  {
    slide: 20,
    title: 'SuperSplat Demo One',
    script: 'This first SuperSplat scene shows practical Gaussian content quality and interaction feel. It demonstrates what captured assets look like when presented in a web-friendly viewer.',
  },
  {
    slide: 21,
    title: 'SuperSplat Demo Two',
    script: 'This second scene gives variety in capture and reconstruction outcome. The point is to show consistency and usability across multiple examples, not just one favorable sample.',
  },
  {
    slide: 22,
    title: 'Personal PlayCanvas Demo',
    script: 'This personal demo shows my own capture-to-runtime path. The workflow is capture, reconstruction, cleanup, and deployment in an interactive web runtime.',
  },
  {
    slide: 23,
    title: 'Worldlabs Demo',
    script: 'This slide links to Worldlabs Marble as an external generation/demo experience. It is positioned here to keep all Gaussian-related demos together before moving into deeper technical explanation.',
  },
  {
    slide: 24,
    title: 'Gaussian Research Video Wall',
    script: 'This video wall is a continuously refreshed survey of public Gaussian-avatar demos. It helps track field direction and identify implementation patterns worth evaluating in the main stack.',
  },
  {
    slide: 25,
    title: 'Gaussian Fundamentals',
    script: 'This slide explains Gaussian splatting in plain sequence steps. The default view is simplified for delivery. Deep mechanism details can be expanded only when needed, so pacing stays clean during presentation.',
  },
  {
    slide: 26,
    title: 'Gaussian Facial Animation',
    script: 'Here we focus on facial animation specifically: driver signals, control space, deformation, temporal stabilization, and rendering. This is the practical bridge from static Gaussian identity to talking-avatar behavior.',
  },
  {
    slide: 27,
    title: 'Gaussian Identity and Response Stack',
    script: 'This stack slide summarizes identity construction and runtime response for Gaussian avatars. It clarifies which parts are explicit geometry control and which parts depend on learned drivers and external logic.',
  },
  {
    slide: 28,
    title: 'Audio-to-Avatar Control Bridge',
    script: 'This is the shared control bridge view. One audio and control interface can drive different backend implementations. The card details are intentionally compact, with extra details revealed only on hover or focus.',
  },
  {
    slide: 29,
    title: 'Where Behavior Logic Lives',
    script: 'This is the architecture boundary decision. Path A keeps logic external and backend execution explicit. Path B internalizes more behavior in generation. For this project, Path A is the default for controllability and debuggability.',
  },
  {
    slide: 30,
    title: 'Research Frontier',
    script: 'This is a source-backed grid of recent work across interactive, streaming, and 3D/XR tracks. It is used to keep claims current and to inform the next iteration cycle.',
  },
  {
    slide: 31,
    title: 'Workflow Comparison',
    script: 'Now we compare end-to-end workflows across the three approaches using the same upstream to downstream frame. This makes differences in execution path visible without mixing terminology.',
  },
  {
    slide: 32,
    title: 'Capability Transition',
    script: 'This transition slide closes the evidence section and sets up final architecture scoring. It keeps the narrative smooth before we move into the decision matrix.',
  },
  {
    slide: 33,
    title: 'Capability Matrix',
    script: 'This matrix is the final decision frame. It compares capabilities with explicit notes, including rendering heaviness and platform flexibility. Use it to explain chosen priorities rather than claiming absolute rankings.',
  },
  {
    slide: 34,
    title: 'How to Evolve the Project',
    script: 'This is the operational loop: refresh sources, run skills, update claims, patch implementation, validate, and publish. The key is repeatability, so the project stays current as the field moves.',
  },
  {
    slide: 35,
    title: 'Thank You',
    script: 'Thank you for the time. I can now open any section for deeper technical discussion: multimodal input processing, backend control contracts, or concrete deployment choices for the next build phase.',
  },
];

