import GaussianSplatDemo from './components/GaussianSplatDemo';
import LivingResearchFeed from './components/LivingResearchFeed';
import ResearchHighlights from './components/ResearchHighlights';
import RecentPapers from './components/RecentPapers';
import ToolingHighlights from './components/ToolingHighlights';
import ToolingRadar from './components/ToolingRadar';

export default function Home() {
  return (
    <div className="min-h-screen relative">
      {/* Paper texture overlay */}
      <div className="paper-texture fixed inset-0" />

      {/* Header */}
      <header className="border-b border-[var(--border)] bg-[var(--surface-0)]">
        <div className="mx-auto max-w-4xl px-6">
          <nav className="flex items-center justify-between h-14">
            <span className="font-semibold text-sm">Real-Time Avatars</span>
            <div className="flex items-center gap-6">
              <a href="#methods" className="nav-link">Methods</a>
              <a href="#comparison" className="nav-link">Comparison</a>
              <a href="#hybrids" className="nav-link">Hybrids</a>
              <a href="#implementation" className="nav-link">Implementation</a>
              <a href="#living-feed" className="nav-link">Feed</a>
              <a href="#tooling-radar" className="nav-link">Tooling</a>
              <a href="#demos" className="nav-link font-medium">Demos</a>
              <a href="/learn" className="nav-link font-medium">Learn</a>
            </div>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12 relative">
        {/* Title Section */}
        <article className="mb-12">
          <p className="section-label mb-4">Research Survey · February 2026</p>
          <h1 className="text-3xl md:text-4xl font-semibold mb-4 leading-tight">
            Real-Time Avatar Systems:<br />
            A Comparative Analysis
          </h1>
          <p className="text-lg text-[var(--text-muted)] max-w-2xl">
            A comprehensive survey of four approaches to building interactive digital humans,
            examining trade-offs in latency, visual fidelity, controllability, and deployment
            across graphics pipelines, generative models, neural rendering, and streaming infrastructure.
          </p>
        </article>

        {/* Abstract / Key Findings */}
        <section className="highlight-box mb-12">
          <p className="section-label mb-3">Key Findings (2026)</p>
          <div className="grid md:grid-cols-5 gap-6 text-center">
            <div>
              <div className="text-2xl font-semibold mb-1">60+ FPS</div>
              <div className="text-sm text-[var(--text-muted)]">MetaHuman rendering</div>
            </div>
            <div>
              <div className="text-2xl font-semibold mb-1">&lt;100ms</div>
              <div className="text-sm text-[var(--text-muted)]">Gaussian splatting</div>
            </div>
            <div>
              <div className="text-2xl font-semibold mb-1">~32 FPS</div>
              <div className="text-sm text-[var(--text-muted)]">Diffusion real-time</div>
            </div>
            <div>
              <div className="text-2xl font-semibold mb-1">&lt;500ms</div>
              <div className="text-sm text-[var(--text-muted)]">Avatar Forcing E2E</div>
            </div>
            <div>
              <div className="text-2xl font-semibold mb-1">7+</div>
              <div className="text-sm text-[var(--text-muted)]">Streaming providers</div>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <div className="grid md:grid-cols-2 gap-6">
            <ResearchHighlights />
            <ToolingHighlights />
          </div>
        </section>

        {/* Getting Started callout */}
        <div className="card p-5 mb-12 bg-gradient-to-r from-[var(--color-gaussian)]/5 via-[var(--color-generative)]/5 to-[var(--color-streaming)]/5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="font-medium mb-1">New to real-time avatars?</p>
              <p className="text-sm text-[var(--text-muted)]">
                Start with our interactive learning paths — hands-on demos and step-by-step guides for each approach.
              </p>
            </div>
            <a
              href="/learn"
              className="badge hover:border-[var(--border-strong)] whitespace-nowrap px-4 py-2"
            >
              Start Learning →
            </a>
          </div>
        </div>

        <div className="divider" />

        {/* Introduction */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
          <p className="text-[var(--text-muted)] mb-4">
            Interactive digital humans—realistic avatars that respond in near real-time to user
            input—are becoming central to virtual communication, gaming, and AI assistants.
            Achieving a convincing digital human requires balancing visual realism, low latency,
            precise controllability, and feasible deployment.
          </p>
          <p className="text-[var(--text-muted)] mb-4">
            Recent advances (2023–2026) have produced several distinct approaches to real-time
            responsive avatars. This survey examines four primary methods, each with unique
            characteristics suited to different use cases. Rather than one approach replacing
            the others, we are seeing convergence—future systems will likely combine elements
            from graphics, generative AI, and neural rendering.
          </p>
          <div className="research-note">
            &ldquo;The day is not far when interacting with a digital character in real-time feels
            nearly as natural as a video call with a real person—and it will likely be thanks
            to the combination of these techniques.&rdquo;
          </div>

          <div className="card p-5 mt-6">
            <p className="font-medium mb-4">Latency Budget (Rule of Thumb)</p>
            <div className="grid md:grid-cols-5 gap-3 text-sm">
              {[
                { k: "Capture", v: "10–30ms", d: "cam / mic" },
                { k: "Tracking", v: "10–40ms", d: "pose / face" },
                { k: "Render/Gen", v: "10–120ms", d: "GPU / model" },
                { k: "Encode", v: "5–25ms", d: "H.264/AV1" },
                { k: "Network", v: "30–150ms", d: "RTT-dependent" },
              ].map((x) => (
                <div key={x.k} className="p-3 bg-[var(--surface-2)] rounded">
                  <div className="text-xs text-[var(--text-muted)]">{x.k}</div>
                  <div className="font-semibold">{x.v}</div>
                  <div className="text-xs text-[var(--text-muted)]">{x.d}</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-3">
              For conversational avatars, “feels responsive” is usually an end-to-end budget under ~200–400ms,
              depending on turn-taking and how much motion must match the audio.
            </p>
          </div>
        </section>

        {/* Methods Overview */}
        <section id="methods" className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">2. Methods</h2>

          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {[
              {
                num: "2.1",
                title: "MetaHuman Pipeline",
                type: "Graphics-based",
                color: "var(--color-metahuman)",
                desc: "Game-engine characters with rigged faces for real-time rendering at 60+ FPS",
              },
              {
                num: "2.2",
                title: "Generative Video Models",
                type: "Diffusion / Transformer",
                color: "var(--color-generative)",
                desc: "AI models synthesizing photorealistic video with 40x distillation speedup",
              },
              {
                num: "2.3",
                title: "Gaussian Splatting",
                type: "Neural 3D Rendering",
                color: "var(--color-gaussian)",
                desc: "3D Gaussian primitives enabling real-time photorealistic rendering",
              },
              {
                num: "2.4",
                title: "Streaming Avatars",
                type: "Infrastructure",
                color: "var(--color-streaming)",
                desc: "Production-ready WebRTC systems with multiple avatar providers",
              },
            ].map((method) => (
              <a
                key={method.num}
                href={`#section-${method.num}`}
                className="card p-5 block"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="approach-dot"
                    style={{ backgroundColor: method.color }}
                  />
                  <span className="text-sm text-[var(--text-muted)]">{method.num}</span>
                  <span className="badge">{method.type}</span>
                </div>
                <h3 className="font-semibold mb-1">{method.title}</h3>
                <p className="text-sm text-[var(--text-muted)]">{method.desc}</p>
              </a>
            ))}
          </div>
        </section>

        <div className="divider" />

        {/* Section 2.1: MetaHuman */}
        <section id="section-2.1" className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="approach-dot"
              style={{ backgroundColor: "var(--color-metahuman)" }}
            />
            <h3 className="text-xl font-semibold">2.1 MetaHuman Pipeline</h3>
          </div>

          <p className="text-[var(--text-muted)] mb-4">
            Epic Games&apos; MetaHuman framework exemplifies the graphics-based approach to digital
            humans. MetaHumans are highly detailed 3D character models with rigged faces and
            bodies, designed for real-time rendering in Unreal Engine. By driving these rigs
            with input data (live video, motion capture, or audio), one can achieve interactive
            animation at 60+ FPS.
          </p>

          <p className="text-[var(--text-muted)] mb-6">
            In 2023, Epic introduced MetaHuman Animator, a tool using a 4D facial solver to combine
            video and depth data from a single camera (e.g., an iPhone) and automatically retarget
            an actor&apos;s performance onto any MetaHuman character. This captures subtle details
            down to tongue movement driven by audio cues.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="card-alt p-5">
              <p className="font-medium mb-3">Advantages</p>
              <ul className="space-y-2 text-sm text-[var(--text-muted)]">
                <li className="flex items-start gap-2">
                  <span className="marker-pro">+</span>
                  60+ FPS rendering with ~30-50ms latency
                </li>
                <li className="flex items-start gap-2">
                  <span className="marker-pro">+</span>
                  Precise control via rigs and blendshapes
                </li>
                <li className="flex items-start gap-2">
                  <span className="marker-pro">+</span>
                  Live Link support for real-time streaming
                </li>
                <li className="flex items-start gap-2">
                  <span className="marker-pro">+</span>
                  No per-person ML training required
                </li>
                <li className="flex items-start gap-2">
                  <span className="marker-pro">+</span>
                  Stable, deterministic output
                </li>
              </ul>
            </div>
            <div className="card-alt p-5">
              <p className="font-medium mb-3">Limitations</p>
              <ul className="space-y-2 text-sm text-[var(--text-muted)]">
                <li className="flex items-start gap-2">
                  <span className="marker-con">−</span>
                  CGI appearance may not achieve photorealism
                </li>
                <li className="flex items-start gap-2">
                  <span className="marker-con">−</span>
                  Significant content creation effort
                </li>
                <li className="flex items-start gap-2">
                  <span className="marker-con">−</span>
                  Requires capable GPU and game engine
                </li>
                <li className="flex items-start gap-2">
                  <span className="marker-con">−</span>
                  Manual design for specific likenesses
                </li>
                <li className="flex items-start gap-2">
                  <span className="marker-con">−</span>
                  Scaling to many concurrent users is costly
                </li>
              </ul>
            </div>
          </div>

          <div className="card p-5 mb-6">
            <p className="font-medium mb-4">Key Technologies</p>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-medium mb-1">MetaHuman Animator</p>
                <p className="text-[var(--text-muted)]">
                  4D facial solver combining video and depth data for high-fidelity performance capture.
                </p>
              </div>
              <div>
                <p className="font-medium mb-1">Live Link System</p>
                <p className="text-[var(--text-muted)]">
                  Real-time streaming of facial blendshape parameters from iPhone or microphone input.
                </p>
              </div>
              <div>
                <p className="font-medium mb-1">NVIDIA Audio2Face</p>
                <p className="text-[var(--text-muted)]">
                  Pretrained ML model for audio-driven lip-sync that integrates with Unreal Engine.
                </p>
              </div>
            </div>
          </div>

          <div className="figure">
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="text-center px-4 py-3 bg-[var(--surface-0)] rounded border border-[var(--border)]">
                <div className="font-medium">Input</div>
                <div className="text-xs text-[var(--text-muted)]">Camera / Audio</div>
              </div>
              <span className="text-[var(--text-muted)]">→</span>
              <div className="text-center px-4 py-3 bg-[var(--surface-0)] rounded border border-[var(--border)]">
                <div className="font-medium">Tracking</div>
                <div className="text-xs text-[var(--text-muted)]">ARKit / LiveLink</div>
              </div>
              <span className="text-[var(--text-muted)]">→</span>
              <div className="text-center px-4 py-3 bg-[var(--surface-0)] rounded border border-[var(--border)]">
                <div className="font-medium">Animation</div>
                <div className="text-xs text-[var(--text-muted)]">Blendshapes</div>
              </div>
              <span className="text-[var(--text-muted)]">→</span>
              <div className="text-center px-4 py-3 bg-[var(--surface-0)] rounded border border-[var(--border)]">
                <div className="font-medium">Render</div>
                <div className="text-xs text-[var(--text-muted)]">Unreal Engine</div>
              </div>
            </div>
            <p className="figure-caption">Figure 1: MetaHuman real-time animation pipeline</p>
          </div>

          <div className="card p-5 mt-6">
            <p className="font-medium mb-4">Interactive Demo: Rapport MetaHuman Avatar</p>
            <p className="text-sm text-[var(--text-muted)] mb-4">
              Experience a real-time MetaHuman avatar powered by Unreal Engine pixel streaming.
              Cloud-rendered photorealistic avatar with voice interaction capabilities.
            </p>
            <a href="/rapport" className="badge hover:border-[var(--border-strong)]">
              Open Rapport demo →
            </a>
          </div>

          <RecentPapers methodKey="metahuman" className="mt-6" />
        </section>

        <div className="divider" />

        {/* Section 2.2: Generative */}
        <section id="section-2.2" className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="approach-dot"
              style={{ backgroundColor: "var(--color-generative)" }}
            />
            <h3 className="text-xl font-semibold">2.2 Generative Video Models</h3>
          </div>

          <p className="text-[var(--text-muted)] mb-4">
            AI generative models, based on diffusion or transformer architectures, directly
            synthesize video frames of a talking or moving person. These models can turn a
            single input image into a lifelike talking video with one-shot generalization
            to unseen identities—a significant advantage for rapid deployment.
          </p>

          <p className="text-[var(--text-muted)] mb-6">
            Recent research has attacked the speed problem from multiple angles: autoregressive
            streaming with block-wise causal attention, aggressive diffusion distillation achieving
            40x speedup, and adversarial refinement to recover quality lost in distillation.
          </p>

          <div className="research-note">
            &ldquo;LiveTalk (Chern et al., 2025) introduces a real-time diffusion avatar that runs
            the denoising process at 1/40 of the original runtime via a two-stage distillation
            and refinement strategy, achieving ~24-25 FPS on a single high-end GPU.&rdquo;
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="card-alt p-5">
              <p className="font-medium mb-3">Advantages</p>
              <ul className="space-y-2 text-sm text-[var(--text-muted)]">
                <li className="flex items-start gap-2">
                  <span className="marker-pro">+</span>
                  Photorealistic output from minimal input
                </li>
                <li className="flex items-start gap-2">
                  <span className="marker-pro">+</span>
                  One-shot: no per-subject training needed
                </li>
                <li className="flex items-start gap-2">
                  <span className="marker-pro">+</span>
                  Natural behaviors (blinks, head movements)
                </li>
                <li className="flex items-start gap-2">
                  <span className="marker-pro">+</span>
                  24-32 FPS achievable with distillation
                </li>
                <li className="flex items-start gap-2">
                  <span className="marker-pro">+</span>
                  Rapid improvement via ML research
                </li>
              </ul>
            </div>
            <div className="card-alt p-5">
              <p className="font-medium mb-3">Limitations</p>
              <ul className="space-y-2 text-sm text-[var(--text-muted)]">
                <li className="flex items-start gap-2">
                  <span className="marker-con">−</span>
                  Heavy compute requirements (A100+ GPU)
                </li>
                <li className="flex items-start gap-2">
                  <span className="marker-con">−</span>
                  Limited explicit control over output
                </li>
                <li className="flex items-start gap-2">
                  <span className="marker-con">−</span>
                  Risk of artifacts or identity drift
                </li>
                <li className="flex items-start gap-2">
                  <span className="marker-con">−</span>
                  Higher first-frame latency (~0.3-1s)
                </li>
                <li className="flex items-start gap-2">
                  <span className="marker-con">−</span>
                  Ethical concerns (deepfake potential)
                </li>
              </ul>
            </div>
          </div>

          <div className="card p-5 mb-6">
            <p className="font-medium mb-4">Key Techniques (2024-2026)</p>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <p className="font-medium mb-1">Autoregressive Streaming</p>
                <p className="text-[var(--text-muted)] mb-3">
                  Block-wise causal attention (CausVid, Self-Forcing, Seaweed) enables real-time
                  generation without future context, achieving orders-of-magnitude speedup.
                </p>
              </div>
              <div>
                <p className="font-medium mb-1">Long-term Consistency</p>
                <p className="text-[var(--text-muted)] mb-3">
                  Reference Sink and Reference-Anchored Positional Re-encoding (RAPR) prevent
                  identity drift in 5+ minute continuous generation sessions.
                </p>
              </div>
              <div>
                <p className="font-medium mb-1">Adversarial Refinement</p>
                <p className="text-[var(--text-muted)]">
                  Consistency-aware discriminator training recovers detail lost in distillation,
                  approaching quality of heavy non-real-time models.
                </p>
              </div>
              <div>
                <p className="font-medium mb-1">Avatar Forcing (Ki et al., 2026)</p>
                <p className="text-[var(--text-muted)]">
                  Combines diffusion forcing with preference optimization to achieve &lt;500ms
                  latency for interactive conversational avatars.
                </p>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <p className="font-medium mb-4">Performance Benchmarks</p>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="text-center p-4 bg-[var(--surface-2)] rounded">
                <div className="text-xl font-semibold mb-1">~0.33s</div>
                <div className="text-[var(--text-muted)]">First frame latency (LiveTalk 1.3B)</div>
              </div>
              <div className="text-center p-4 bg-[var(--surface-2)] rounded">
                <div className="text-xl font-semibold mb-1">24-25 FPS</div>
                <div className="text-[var(--text-muted)]">Sustained generation (single GPU)</div>
              </div>
              <div className="text-center p-4 bg-[var(--surface-2)] rounded">
                <div className="text-xl font-semibold mb-1">~32 FPS</div>
                <div className="text-[var(--text-muted)]">SoulX-LiveTalk 14B (8× H800)</div>
              </div>
            </div>
          </div>

          <div className="figure mt-6">
            <div className="flex items-center justify-center gap-4 text-sm flex-wrap">
              <div className="text-center px-4 py-3 bg-[var(--surface-0)] rounded border border-[var(--border)]">
                <div className="font-medium">Photo</div>
                <div className="text-xs text-[var(--text-muted)]">Reference face</div>
              </div>
              <span className="text-[var(--text-muted)]">→</span>
              <div className="text-center px-4 py-3 bg-[var(--surface-0)] rounded border border-[var(--border)]">
                <div className="font-medium">Audio</div>
                <div className="text-xs text-[var(--text-muted)]">Speech / TTS</div>
              </div>
              <span className="text-[var(--text-muted)]">→</span>
              <div className="text-center px-4 py-3 bg-[var(--surface-0)] rounded border border-[var(--border)]">
                <div className="font-medium">Diffusion</div>
                <div className="text-xs text-[var(--text-muted)]">Denoise latents</div>
              </div>
              <span className="text-[var(--text-muted)]">→</span>
              <div className="text-center px-4 py-3 bg-[var(--surface-0)] rounded border border-[var(--border)]">
                <div className="font-medium">Decode</div>
                <div className="text-xs text-[var(--text-muted)]">VAE → frames</div>
              </div>
              <span className="text-[var(--text-muted)]">→</span>
              <div className="text-center px-4 py-3 bg-[var(--surface-0)] rounded border border-[var(--border)]">
                <div className="font-medium">Stream</div>
                <div className="text-xs text-[var(--text-muted)]">WebRTC output</div>
              </div>
            </div>
            <p className="figure-caption">Figure 2: Generative video avatar pipeline</p>
          </div>

          <RecentPapers methodKey="generative" className="mt-6" />
        </section>

        <div className="divider" />

        {/* Section 2.3: Gaussian */}
        <section id="section-2.3" className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="approach-dot"
              style={{ backgroundColor: "var(--color-gaussian)" }}
            />
            <h3 className="text-xl font-semibold">2.3 Neural Gaussian Splatting</h3>
          </div>

          <p className="text-[var(--text-muted)] mb-4">
            3D Gaussian Splatting (3DGS), emerging in 2023, enables real-time rendering of
            photorealistic 3D scenes using clouds of Gaussian primitives instead of dense
            neural networks. By capturing a person as textured 3D Gaussians that can be
            transformed and animated, we obtain a streaming neural avatar that runs extremely
            fast and looks realistic.
          </p>

          <p className="text-[var(--text-muted)] mb-6">
            Multi-view video capture of a person is used to optimize a Gaussian splatting model,
            creating a personalized neural character—a digital asset that &ldquo;looks exactly like X.&rdquo;
            Once trained, it can be driven by parametric rigs or audio/motion models.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="card-alt p-5">
              <p className="font-medium mb-3">Advantages</p>
              <ul className="space-y-2 text-sm text-[var(--text-muted)]">
                <li className="flex items-start gap-2">
                  <span className="marker-pro">+</span>
                  60+ FPS rendering on consumer GPUs
                </li>
                <li className="flex items-start gap-2">
                  <span className="marker-pro">+</span>
                  Photorealistic for captured subjects
                </li>
                <li className="flex items-start gap-2">
                  <span className="marker-pro">+</span>
                  Multi-view consistent output for AR/VR
                </li>
                <li className="flex items-start gap-2">
                  <span className="marker-pro">+</span>
                  Can be driven by parametric models
                </li>
                <li className="flex items-start gap-2">
                  <span className="marker-pro">+</span>
                  Lower runtime cost than diffusion
                </li>
              </ul>
            </div>
            <div className="card-alt p-5">
              <p className="font-medium mb-3">Limitations</p>
              <ul className="space-y-2 text-sm text-[var(--text-muted)]">
                <li className="flex items-start gap-2">
                  <span className="marker-con">−</span>
                  Requires multi-view capture per person
                </li>
                <li className="flex items-start gap-2">
                  <span className="marker-con">−</span>
                  Hours of training per identity
                </li>
                <li className="flex items-start gap-2">
                  <span className="marker-con">−</span>
                  Fixed identity (one model = one person)
                </li>
                <li className="flex items-start gap-2">
                  <span className="marker-con">−</span>
                  Quality degrades outside training range
                </li>
                <li className="flex items-start gap-2">
                  <span className="marker-con">−</span>
                  Tooling less mature than game engines
                </li>
              </ul>
            </div>
          </div>

          <div className="card p-5 mb-6">
            <p className="font-medium mb-4">Notable Implementations</p>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <p className="font-medium mb-1">D3GA (Zielonka et al., 2025)</p>
                <p className="text-[var(--text-muted)]">
                  Drivable 3D Gaussian Avatars factoring full human avatars into layered Gaussian
                  clusters (body, garments, face) attached to a deformable cage rig. Handles complex
                  phenomena like loose clothing through layered Gaussian sets.
                </p>
              </div>
              <div>
                <p className="font-medium mb-1">GaussianSpeech (Aneja et al., 2025)</p>
                <p className="text-[var(--text-muted)]">
                  First photorealistic multi-view talking head from audio input with expression-dependent
                  color changes. Supports high-frequency details like wrinkles through specialized
                  perceptual losses.
                </p>
              </div>
            </div>
          </div>

          <div className="research-note">
            &ldquo;GaussianSpeech&apos;s representation supports expression-dependent color changes and
            high-frequency details like wrinkles: as the person speaks or smiles, the model adjusts
            the splats&apos; colors to simulate skin creases or micro-expressions.&rdquo;
          </div>

          <RecentPapers methodKey="gaussian" className="mt-6" />

          {/* Interactive Demo */}
          <div className="card p-5 mt-6">
            <p className="font-medium mb-4">Interactive Demo: Animated Gaussian Splat Avatar</p>
            <p className="text-sm text-[var(--text-muted)] mb-4">
              A digital human captured as a Gaussian splat avatar, with an idle animation loop to
              keep the presence feeling alive. This keeps the demo aligned with real-time avatar
              experiences while staying fully browser-native.
            </p>
            <GaussianSplatDemo className="h-[400px] bg-black/20" />
            <p className="text-xs text-[var(--text-muted)] mt-3 text-center">
              Powered by <a href="https://lumalabs.ai" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">Luma AI</a> WebGL renderer
            </p>
          </div>
        </section>

        <div className="divider" />

        {/* Section 2.4: Streaming */}
        <section id="section-2.4" className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="approach-dot"
              style={{ backgroundColor: "var(--color-streaming)" }}
            />
            <h3 className="text-xl font-semibold">2.4 Streaming Avatars (LiveKit)</h3>
          </div>

          <p className="text-[var(--text-muted)] mb-6">
            LiveKit Agents provides production-ready infrastructure for deploying real-time
            avatars at scale. Rather than implementing avatar rendering directly, it integrates
            multiple third-party avatar providers through a unified API, handling WebRTC
            streaming, synchronization, and voice AI pipelines automatically.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="card-alt p-5">
              <p className="font-medium mb-3">Advantages</p>
              <ul className="space-y-2 text-sm text-[var(--text-muted)]">
                <li className="flex items-start gap-2">
                  <span className="marker-pro">+</span>
                  Multiple avatar providers available
                </li>
                <li className="flex items-start gap-2">
                  <span className="marker-pro">+</span>
                  Built-in voice AI pipeline (STT + LLM + TTS)
                </li>
                <li className="flex items-start gap-2">
                  <span className="marker-pro">+</span>
                  WebRTC-based low-latency streaming
                </li>
                <li className="flex items-start gap-2">
                  <span className="marker-pro">+</span>
                  Cross-platform SDKs
                </li>
                <li className="flex items-start gap-2">
                  <span className="marker-pro">+</span>
                  No local GPU required
                </li>
              </ul>
            </div>
            <div className="card-alt p-5">
              <p className="font-medium mb-3">Limitations</p>
              <ul className="space-y-2 text-sm text-[var(--text-muted)]">
                <li className="flex items-start gap-2">
                  <span className="marker-con">−</span>
                  Requires third-party provider subscription
                </li>
                <li className="flex items-start gap-2">
                  <span className="marker-con">−</span>
                  Less control over rendering pipeline
                </li>
                <li className="flex items-start gap-2">
                  <span className="marker-con">−</span>
                  Dependent on provider capabilities
                </li>
                <li className="flex items-start gap-2">
                  <span className="marker-con">−</span>
                  Per-minute or per-session pricing
                </li>
                <li className="flex items-start gap-2">
                  <span className="marker-con">−</span>
                  Network latency dependency
                </li>
              </ul>
            </div>
          </div>

          <div className="figure">
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="text-center px-4 py-3 bg-[var(--surface-0)] rounded border border-[var(--border)]">
                <div className="font-medium">Agent Session</div>
                <div className="text-xs text-[var(--text-muted)]">Python / Node.js</div>
              </div>
              <span className="text-[var(--text-muted)]">→</span>
              <div className="text-center px-4 py-3 bg-[var(--surface-0)] rounded border border-[var(--border)]">
                <div className="font-medium">Avatar Worker</div>
                <div className="text-xs text-[var(--text-muted)]">Provider API</div>
              </div>
              <span className="text-[var(--text-muted)]">→</span>
              <div className="text-center px-4 py-3 bg-[var(--surface-0)] rounded border border-[var(--border)]">
                <div className="font-medium">LiveKit Room</div>
                <div className="text-xs text-[var(--text-muted)]">WebRTC</div>
              </div>
              <span className="text-[var(--text-muted)]">→</span>
              <div className="text-center px-4 py-3 bg-[var(--surface-0)] rounded border border-[var(--border)]">
                <div className="font-medium">Client</div>
                <div className="text-xs text-[var(--text-muted)]">Web / Mobile</div>
              </div>
            </div>
            <p className="figure-caption">Figure 3: LiveKit avatar streaming architecture</p>
          </div>

          <div className="card p-5 mt-6">
            <p className="font-medium mb-4">Supported Providers</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              {[
                { name: "Tavus", desc: "Photorealistic digital twins", color: "var(--color-streaming)" },
                { name: "Hedra", desc: "Expressive character avatars", color: "var(--color-streaming)" },
                { name: "Rapport", desc: "MetaHuman pixel streaming", color: "var(--color-metahuman)" },
                { name: "Simli", desc: "Real-time lip-sync", color: "var(--color-streaming)" },
                { name: "Anam", desc: "Natural gesture avatars", color: "var(--color-streaming)" },
                { name: "Beyond Presence", desc: "Enterprise-grade", color: "var(--color-streaming)" },
                { name: "bitHuman", desc: "Hyper-realistic faces", color: "var(--color-streaming)" },
              ].map((p) => (
                <div key={p.name} className="flex items-center gap-2">
                  <div
                    className="approach-dot"
                    style={{ backgroundColor: p.color }}
                  />
                  <div>
                    <span className="font-medium">{p.name}</span>
                    <span className="text-[var(--text-muted)]"> · {p.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div id="demos" className="card p-5 mt-6 scroll-mt-20">
            <p className="font-medium mb-4">Interactive Demos</p>
            <p className="text-sm text-[var(--text-muted)] mb-4">
              Try real-time avatar streaming with different providers and architectures.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-[var(--surface-2)] rounded-lg">
                <p className="font-medium text-sm mb-2">LiveKit + Hedra</p>
                <p className="text-xs text-[var(--text-muted)] mb-3">
                  WebRTC room with diffusion-based avatar worker. Requires LiveKit credentials.
                </p>
                <a href="/livekit" className="badge hover:border-[var(--border-strong)]">
                  Open demo →
                </a>
              </div>
              <div className="p-4 bg-[var(--surface-2)] rounded-lg">
                <p className="font-medium text-sm mb-2">Rapport MetaHuman</p>
                <p className="text-xs text-[var(--text-muted)] mb-3">
                  Unreal Engine pixel streaming with cloud-rendered photorealistic avatar.
                </p>
                <a href="/rapport" className="badge hover:border-[var(--border-strong)]">
                  Open demo →
                </a>
              </div>
            </div>
          </div>

          <RecentPapers methodKey="streaming" className="mt-6" />
        </section>

        <div className="divider" />

        {/* Comparison Table */}
        <section id="comparison" className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">3. Comparison</h2>

          <div className="overflow-x-auto">
            <table className="research-table">
              <thead>
                <tr>
                  <th>Characteristic</th>
                  <th>
                    <div className="flex items-center gap-2">
                      <div className="approach-dot" style={{ backgroundColor: "var(--color-metahuman)" }} />
                      MetaHuman
                    </div>
                  </th>
                  <th>
                    <div className="flex items-center gap-2">
                      <div className="approach-dot" style={{ backgroundColor: "var(--color-generative)" }} />
                      Generative
                    </div>
                  </th>
                  <th>
                    <div className="flex items-center gap-2">
                      <div className="approach-dot" style={{ backgroundColor: "var(--color-gaussian)" }} />
                      Gaussian
                    </div>
                  </th>
                  <th>
                    <div className="flex items-center gap-2">
                      <div className="approach-dot" style={{ backgroundColor: "var(--color-streaming)" }} />
                      Streaming
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-medium">Latency</td>
                  <td>~30-50ms</td>
                  <td>~0.3-1s first frame</td>
                  <td>&lt;100ms</td>
                  <td>~100-300ms</td>
                </tr>
                <tr>
                  <td className="font-medium">Visual Quality</td>
                  <td>High-quality CGI</td>
                  <td>Photorealistic</td>
                  <td>Photorealistic</td>
                  <td>Provider-dependent</td>
                </tr>
                <tr>
                  <td className="font-medium">Controllability</td>
                  <td>Fine-grained (rig)</td>
                  <td>Limited (audio)</td>
                  <td>Moderate to high</td>
                  <td>API-based</td>
                </tr>
                <tr>
                  <td className="font-medium">New Identity Setup</td>
                  <td>3D modeling</td>
                  <td>Single image</td>
                  <td>Capture + training</td>
                  <td>Provider config</td>
                </tr>
                <tr>
                  <td className="font-medium">Training Required</td>
                  <td>None per character</td>
                  <td>Base model only</td>
                  <td>Hours per subject</td>
                  <td>None</td>
                </tr>
                <tr>
                  <td className="font-medium">Hardware</td>
                  <td>Gaming GPU</td>
                  <td>A100+ / Cloud</td>
                  <td>Consumer GPU</td>
                  <td>Any (cloud)</td>
                </tr>
                <tr>
                  <td className="font-medium">Runtime Cost</td>
                  <td>Low (local render)</td>
                  <td>High (inference)</td>
                  <td>Low (splatting)</td>
                  <td>Per-minute pricing</td>
                </tr>
                <tr>
                  <td className="font-medium">Deployment Ease</td>
                  <td>Hard (UE5 + GPU)</td>
                  <td>Medium (Python + GPU)</td>
                  <td>Hard (capture rig)</td>
                  <td>Easy (API key)</td>
                </tr>
                <tr>
                  <td className="font-medium">Open Source</td>
                  <td>Partial (MetaHuman Creator free)</td>
                  <td>Yes (SadTalker, GeneFace++)</td>
                  <td>Yes (3DGS, D3GA)</td>
                  <td>Partial (LiveKit OSS, providers closed)</td>
                </tr>
                <tr>
                  <td className="font-medium">Best Use Case</td>
                  <td>Production control</td>
                  <td>Quick deployment</td>
                  <td>VR/AR telepresence</td>
                  <td>Voice AI apps</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="figure-caption mt-4">Table 1: Comparative analysis of real-time avatar approaches</p>
        </section>

        <div className="divider" />

        {/* Hybrid Strategies */}
        <section id="hybrids" className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">4. Hybrid Strategies</h2>

          <p className="text-[var(--text-muted)] mb-6">
            Given the strengths and weaknesses of each approach, researchers are exploring hybrid
            solutions that combine elements of graphics, generative models, and neural renderers
            to achieve the best of both worlds—controllability of a rig with realism of generative output.
          </p>

          <div className="grid gap-6 mb-6">
            <div className="card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="approach-dot" style={{ backgroundColor: "var(--color-metahuman)" }} />
                <span className="text-[var(--accent)]">+</span>
                <div className="approach-dot" style={{ backgroundColor: "var(--color-generative)" }} />
                <h4 className="font-semibold">4.1 MetaHuman + Generative Enhancement</h4>
              </div>
              <p className="text-sm text-[var(--text-muted)] mb-4">
                Start with a MetaHuman for real-time responsiveness and precise control, then use
                a generative model to enhance realism. GeneFace++ exemplifies this: a 3D face model
                ensures accurate lip movement, while a neural renderer produces realistic appearance.
              </p>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-[var(--surface-2)] rounded">
                  <p className="font-medium text-[var(--success)] mb-1">Benefits</p>
                  <p className="text-[var(--text-muted)]">Combines precision with realism. Rig enforces hard constraints while generative step adds rich detail.</p>
                </div>
                <div className="p-3 bg-[var(--surface-2)] rounded">
                  <p className="font-medium text-[var(--error)] mb-1">Challenges</p>
                  <p className="text-[var(--text-muted)]">Complex pipeline. Risk of AI introducing unwanted movements. Additional latency from diffusion.</p>
                </div>
              </div>
            </div>

            <div className="card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="approach-dot" style={{ backgroundColor: "var(--color-gaussian)" }} />
                <span className="text-[var(--accent)]">+</span>
                <span className="badge">Parametric</span>
                <h4 className="font-semibold">4.2 Gaussian + Parametric Driver</h4>
              </div>
              <p className="text-sm text-[var(--text-muted)] mb-4">
                Drive a Gaussian avatar with classical parametric models (ARKit blendshapes, FLAME).
                One person can puppeteer a photoreal avatar of someone else in real-time. VASA-3D
                uses hybrid audio-driven and pose-driven control for this approach.
              </p>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-[var(--surface-2)] rounded">
                  <p className="font-medium text-[var(--success)] mb-1">Benefits</p>
                  <p className="text-[var(--text-muted)]">Low latency (~10ms tracking + fast render). Allows existing animation data to drive neural avatars.</p>
                </div>
                <div className="p-3 bg-[var(--surface-2)] rounded">
                  <p className="font-medium text-[var(--error)] mb-1">Challenges</p>
                  <p className="text-[var(--text-muted)]">Calibration between driver and avatar. Extrapolating beyond training data may cause artifacts.</p>
                </div>
              </div>
            </div>

            <div className="card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="approach-dot" style={{ backgroundColor: "var(--color-generative)" }} />
                <span className="text-[var(--accent)]">+</span>
                <span className="badge">Animation</span>
                <h4 className="font-semibold">4.3 Generative Motion + Traditional Rendering</h4>
              </div>
              <p className="text-sm text-[var(--text-muted)] mb-4">
                Use generative models to produce animation (not pixels)—GLDiTalker generates 3D mesh
                vertex movements at ~30 FPS via latent diffusion. By splitting content generation
                (AI) from rendering (deterministic), we get robust, tunable systems.
              </p>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-[var(--surface-2)] rounded">
                  <p className="font-medium text-[var(--success)] mb-1">Benefits</p>
                  <p className="text-[var(--text-muted)]">Interpretable output (animation curves). Human designers can adjust without retraining models.</p>
                </div>
                <div className="p-3 bg-[var(--surface-2)] rounded">
                  <p className="font-medium text-[var(--error)] mb-1">Challenges</p>
                  <p className="text-[var(--text-muted)]">Bridging representation gaps between AI output and rig parameters. Motion retargeting complexity.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="research-note">
            &ldquo;Future MetaHumans might internally use neural networks to render facial detail,
            making them as photoreal as diffusion models while remaining fully controllable—
            we are likely to see convergence rather than one approach replacing the others.&rdquo;
          </div>
        </section>

        <div className="divider" />

        {/* Implementation Guide */}
        <section id="implementation" className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">5. Implementation</h2>

          <p className="text-[var(--text-muted)] mb-6">
            The following guides provide starting points for each approach. All referenced
            implementations are open-source or freely available.
          </p>

          {/* MetaHuman Implementation */}
          <div className="card p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="approach-dot" style={{ backgroundColor: "var(--color-metahuman)" }} />
              <h4 className="font-semibold">5.1 MetaHuman + Live Link</h4>
            </div>
            <ol className="numbered-list text-sm text-[var(--text-muted)]">
              <li>Install Unreal Engine 5 from Epic Games Launcher</li>
              <li>Create character using MetaHuman Creator web tool</li>
              <li>Install Live Link Face app on iPhone, connect to Unreal</li>
              <li>Enable Live Link plugin and connect ARKit face data to MetaHuman blueprint</li>
              <li>Optionally integrate NVIDIA Audio2Face for audio-driven lip-sync</li>
            </ol>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href="https://www.unrealengine.com/en-US/metahuman" target="_blank" rel="noopener noreferrer" className="badge hover:border-[var(--border-strong)]">
                MetaHuman Creator →
              </a>
              <a href="https://dev.epicgames.com/documentation/en-us/unreal-engine/live-link-plugin-development-in-unreal-engine" target="_blank" rel="noopener noreferrer" className="badge hover:border-[var(--border-strong)]">
                Live Link Docs →
              </a>
            </div>
          </div>

          {/* Generative Implementation */}
          <div className="card p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="approach-dot" style={{ backgroundColor: "var(--color-generative)" }} />
              <h4 className="font-semibold">5.2 SadTalker (Diffusion-based)</h4>
            </div>
            <ol className="numbered-list text-sm text-[var(--text-muted)]">
              <li>
                <div>
                  Clone repository
                  <div className="code mt-2">git clone https://github.com/OpenTalker/SadTalker.git</div>
                </div>
              </li>
              <li>
                <div>
                  Install dependencies
                  <div className="code mt-2">pip install -r requirements.txt</div>
                </div>
              </li>
              <li>Download pretrained models from releases page</li>
              <li>
                <div>
                  Generate talking head
                  <div className="code mt-2">python inference.py --source_image face.jpg --driven_audio speech.wav</div>
                </div>
              </li>
            </ol>
          </div>

          {/* GeneFace++ Implementation */}
          <div className="card p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="approach-dot" style={{ backgroundColor: "var(--color-generative)" }} />
              <h4 className="font-semibold">5.3 GeneFace++ (Hybrid NeRF)</h4>
            </div>
            <ol className="numbered-list text-sm text-[var(--text-muted)]">
              <li>
                <div>
                  Clone repository
                  <div className="code mt-2">git clone https://github.com/yerfor/GeneFacePlusPlus.git</div>
                </div>
              </li>
              <li>Install PyTorch and dependencies for NeRF rendering</li>
              <li>Download pretrained audio-to-motion and neural renderer models</li>
              <li>Run real-time audio-driven generation on a single GPU with strong lip-sync</li>
            </ol>
          </div>

          {/* Gaussian Implementation */}
          <div className="card p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="approach-dot" style={{ backgroundColor: "var(--color-gaussian)" }} />
              <h4 className="font-semibold">5.4 D3GA (Gaussian Avatars)</h4>
            </div>
            <ol className="numbered-list text-sm text-[var(--text-muted)]">
              <li>
                <div>
                  Clone repository
                  <div className="code mt-2">git clone https://github.com/facebookresearch/D3GA.git</div>
                </div>
              </li>
              <li>Capture multi-view video of subject from multiple angles</li>
              <li>Run training script with captured data (several hours)</li>
              <li>Drive avatar with FLAME parameters, body poses, or audio input</li>
            </ol>
          </div>

          {/* Streaming Implementation */}
          <div className="card p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="approach-dot" style={{ backgroundColor: "var(--color-streaming)" }} />
              <h4 className="font-semibold">5.5 LiveKit Agents + Avatar</h4>
            </div>
            <ol className="numbered-list text-sm text-[var(--text-muted)]">
              <li>
                <div>
                  Install SDK
                  <div className="code mt-2">pip install -r agents/livekit-hedra-avatar/requirements.txt</div>
                </div>
              </li>
              <li>Configure LiveKit Cloud account and avatar provider API keys</li>
              <li>Create AgentSession and AvatarSession in Python</li>
              <li>Deploy frontend using LiveKit React hooks for video display</li>
            </ol>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href="https://docs.livekit.io/agents/" target="_blank" rel="noopener noreferrer" className="badge hover:border-[var(--border-strong)]">
                LiveKit Agents Docs →
              </a>
              <a href="/livekit" className="badge hover:border-[var(--border-strong)]">
                See live demo →
              </a>
            </div>
          </div>

          {/* Pixel Streaming Implementation */}
          <div className="card p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="approach-dot" style={{ backgroundColor: "var(--color-metahuman)" }} />
              <span className="text-[var(--accent)]">+</span>
              <div className="approach-dot" style={{ backgroundColor: "var(--color-streaming)" }} />
              <h4 className="font-semibold">5.6 Pixel Streaming (Rapport / UE5)</h4>
            </div>
            <p className="text-sm text-[var(--text-muted)] mb-4">
              Pixel streaming bridges MetaHuman quality with browser-based delivery by rendering
              on cloud GPUs and streaming video via WebRTC.
            </p>
            <ol className="numbered-list text-sm text-[var(--text-muted)]">
              <li>Design MetaHuman in Unreal Engine 5 with conversation blueprint</li>
              <li>Enable Pixel Streaming plugin in UE5 project settings</li>
              <li>Deploy UE5 instance to cloud GPU (AWS g5, Azure NV-series, or Rapport Cloud)</li>
              <li>
                <div>
                  Embed in web app via iframe or WebRTC signaling
                  <div className="code mt-2">&lt;iframe src=&quot;https://your-pixel-stream-url&quot; allow=&quot;microphone&quot; /&gt;</div>
                </div>
              </li>
              <li>Connect audio pipeline for real-time lip sync and conversation</li>
            </ol>
            <div className="mt-4">
              <a href="/rapport" className="badge hover:border-[var(--border-strong)]">
                See live Rapport demo →
              </a>
            </div>
          </div>
        </section>

        <div className="divider" />

        {/* Discussion */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">6. Discussion & Outlook</h2>

          <p className="text-[var(--text-muted)] mb-4">
            The rapid progress in responsive digital human technologies is bringing us closer to
            avatars that can engage in natural, face-to-face style conversations. Each approach
            contributes vital pieces: graphics gives interactivity, generative AI gives authenticity,
            and neural rendering gives personalization.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="card-alt p-5">
              <p className="font-medium mb-3">Latency vs. Quality Trade-off</p>
              <p className="text-sm text-[var(--text-muted)]">
                Real-time systems historically meant compromising fidelity, but that gap is closing.
                With distillation and powerful hardware, even complex models hit real-time thresholds.
                Adaptive systems can adjust quality on the fly—lower during fast dialogue, higher
                during pauses.
              </p>
            </div>
            <div className="card-alt p-5">
              <p className="font-medium mb-3">Human-Centric Evaluation</p>
              <p className="text-sm text-[var(--text-muted)]">
                Users strongly prefer avatars with responsive listening behaviors and timely nods.
                It&apos;s not just about photorealistic speaking, but behaving realistically in two-way
                interaction. This drives hybrid approaches combining language models (knowing when
                to nod) with visual models (executing naturally).
              </p>
            </div>
          </div>

          <div className="research-note mb-6">
            &ldquo;We can expect tighter integration of language understanding, voice synthesis, and
            visual animation—essentially full conversational AI avatars that not only look and
            sound human but also act and react in a human-like loop.&rdquo;
          </div>

          <div className="card p-5 mb-6">
            <p className="font-medium mb-4">Convergence Timeline</p>
            <p className="text-sm text-[var(--text-muted)] mb-4">
              Rather than one method winning, we see convergence — each approach absorbs
              strengths from the others.
            </p>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="p-3 bg-[var(--surface-2)] rounded">
                <p className="font-medium mb-1">2023-2024</p>
                <p className="text-[var(--text-muted)]">
                  Separate silos. MetaHumans are CGI, diffusion models produce video,
                  Gaussians need multi-view capture. Each has clear tradeoffs.
                </p>
              </div>
              <div className="p-3 bg-[var(--surface-2)] rounded">
                <p className="font-medium mb-1">2025</p>
                <p className="text-[var(--text-muted)]">
                  Hybrids emerge. GeneFace++ blends rigs with neural renderers. D3GA layers
                  Gaussians on deformable cages. Distillation makes diffusion real-time.
                </p>
              </div>
              <div className="p-3 bg-[var(--surface-2)] rounded">
                <p className="font-medium mb-1">2026+</p>
                <p className="text-[var(--text-muted)]">
                  Full convergence. MetaHumans with neural skin rendering. One-shot Gaussian
                  avatars from a single photo. Sub-200ms end-to-end conversational loops.
                </p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="card p-5">
              <p className="font-medium mb-3">Ethical Considerations</p>
              <p className="text-sm text-[var(--text-muted)]">
                With photoreal digital humans come concerns: deepfake misuse, identity theft, and
                recreating someone without consent. Real-time deepfakes are practically possible—an
                avatar could mimic a celebrity in a live call. The community is developing watermarking,
                gatekeeping models, and consent requirements as necessary norms.
              </p>
            </div>
            <div className="card p-5">
              <p className="font-medium mb-3">Open Problems</p>
              <p className="text-sm text-[var(--text-muted)]">
                Full-body coherence remains unsolved—most systems handle faces well but struggle
                with hands and torso gestures. Long-form identity consistency drifts after 5+ minutes
                in generative models. And the compute cost of photorealistic real-time avatars still
                limits deployment to cloud-rendered streaming rather than on-device.
              </p>
            </div>
          </div>
        </section>

        <div className="divider" />

        {/* References / Resources */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">7. References, Resources & Living Feed</h2>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                title: "SadTalker (CVPR 2023)",
                desc: "Audio-driven talking head with 3D motion coefficients",
                url: "https://github.com/OpenTalker/SadTalker",
              },
              {
                title: "GeneFace++",
                desc: "Real-time NeRF-based talking head with strong lip-sync",
                url: "https://github.com/yerfor/GeneFacePlusPlus",
              },
              {
                title: "D3GA (3DV 2025)",
                desc: "Drivable 3D Gaussian Avatars (Facebook Research)",
                url: "https://github.com/facebookresearch/D3GA",
              },
              {
                title: "GaussianSpeech (ICCV 2025)",
                desc: "Audio-driven multi-view Gaussian talking heads",
                url: "https://github.com/shivangi-aneja/GaussianSpeech",
              },
              {
                title: "ICo3D (IJCV 2025)",
                desc: "Interactive conversational 3D avatars with Gaussian Splatting",
                url: "https://ico3d.github.io/",
              },
              {
                title: "OmniAvatar",
                desc: "1.3B audio-driven diffusion for one-shot avatars",
                url: "https://github.com/omni-avatar/OmniAvatar",
              },
              {
                title: "Avatarify",
                desc: "Real-time face animation with first-order motion model",
                url: "https://github.com/alievk/avatarify",
              },
              {
                title: "LiveKit Agents",
                desc: "Real-time AI agents with avatar support",
                url: "https://github.com/livekit/agents",
              },
              {
                title: "Rapport Cloud",
                desc: "MetaHuman pixel streaming for conversational avatars",
                url: "https://www.rapport.cloud/",
              },
              {
                title: "Awesome Talking Head Generation",
                desc: "Curated list of papers and implementations",
                url: "https://github.com/harlanhong/awesome-talking-head-generation",
              },
            ].map((ref) => (
              <a
                key={ref.title}
                href={ref.url}
                target="_blank"
                rel="noopener noreferrer"
                className="card p-4 flex items-start gap-3 hover:border-[var(--border-strong)] transition-colors"
              >
                <span className="text-[var(--accent)]">↗</span>
                <div>
                  <p className="font-medium">{ref.title}</p>
                  <p className="text-sm text-[var(--text-muted)]">{ref.desc}</p>
                </div>
              </a>
            ))}
          </div>

          <div className="divider" />

          <h3 id="living-feed" className="text-xl font-semibold mb-4">7.1 Living Research Feed (Auto-updating)</h3>
          <p className="text-sm text-[var(--text-muted)] mb-6">
            This section is generated from an updater script so the site can continuously evolve as new papers land.
            It is intentionally broad (keyword-based) to act as an inbox rather than a curated bibliography.
          </p>
          <LivingResearchFeed />

          <div className="divider" />

          <h3 id="tooling-radar" className="text-xl font-semibold mb-4">7.2 Tooling Radar (Auto-updating)</h3>
          <p className="text-sm text-[var(--text-muted)] mb-6">
            A lightweight GitHub search feed to surface useful repos (implementations, demos, and tooling)
            around real-time avatars. Treat it as discovery, then curate what matters into the main sections.
          </p>
          <ToolingRadar />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] bg-[var(--surface-0)]">
        <div className="mx-auto max-w-4xl px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="footer-text">
              Real-Time Avatar Systems: A Comparative Analysis
            </p>
            <div className="flex items-center gap-4">
              <a href="/learn" className="footer-text hover:text-[var(--accent)]">Learn Hub</a>
              <span className="footer-text">·</span>
              <p className="footer-text">
                Based on research from 2023–2026 · Last updated February 2026
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
