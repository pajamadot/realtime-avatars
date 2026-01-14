export default function Home() {
  return (
    <div className="min-h-screen relative">
      {/* Paper texture overlay */}
      <div className="paper-texture fixed inset-0" />

      {/* Header */}
      <header className="border-b border-[var(--border)] bg-[var(--card-bg)]">
        <div className="mx-auto max-w-4xl px-6">
          <nav className="flex items-center justify-between h-14">
            <span className="font-semibold text-sm">Real-Time Avatars</span>
            <div className="flex items-center gap-6">
              <a href="#methods" className="nav-link">Methods</a>
              <a href="#comparison" className="nav-link">Comparison</a>
              <a href="#implementation" className="nav-link">Implementation</a>
            </div>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12 relative">
        {/* Title Section */}
        <article className="mb-12">
          <p className="section-label mb-4">Research Survey · 2024</p>
          <h1 className="text-3xl md:text-4xl font-semibold mb-4 leading-tight">
            Real-Time Avatar Systems:<br />
            A Comparative Analysis
          </h1>
          <p className="text-lg text-[var(--muted)] max-w-2xl">
            An overview of four approaches to building interactive digital humans,
            examining trade-offs in latency, visual fidelity, controllability, and deployment.
          </p>
        </article>

        {/* Abstract / Key Findings */}
        <section className="highlight-box mb-12">
          <p className="section-label mb-3">Key Findings</p>
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-semibold mb-1">60+ FPS</div>
              <div className="text-sm text-[var(--muted)]">Best-case rendering</div>
            </div>
            <div>
              <div className="text-2xl font-semibold mb-1">&lt;100ms</div>
              <div className="text-sm text-[var(--muted)]">Achievable latency</div>
            </div>
            <div>
              <div className="text-2xl font-semibold mb-1">4</div>
              <div className="text-sm text-[var(--muted)]">Distinct approaches</div>
            </div>
            <div>
              <div className="text-2xl font-semibold mb-1">10+</div>
              <div className="text-sm text-[var(--muted)]">Open implementations</div>
            </div>
          </div>
        </section>

        <div className="divider" />

        {/* Introduction */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
          <p className="text-[var(--muted)] mb-4">
            Interactive digital humans—realistic avatars that respond in near real-time to user
            input—are becoming central to virtual communication, gaming, and AI assistants.
            Achieving a convincing digital human requires balancing visual realism, low latency,
            precise controllability, and feasible deployment.
          </p>
          <p className="text-[var(--muted)] mb-4">
            Recent advances (2023–2024) have produced several distinct approaches to real-time
            responsive avatars. This survey examines four primary methods, each with unique
            characteristics suited to different use cases.
          </p>
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
                desc: "Game-engine characters with rigged faces for real-time rendering",
              },
              {
                num: "2.2",
                title: "Generative Video Models",
                type: "Diffusion / Transformer",
                color: "var(--color-generative)",
                desc: "AI models synthesizing photorealistic video from audio signals",
              },
              {
                num: "2.3",
                title: "Gaussian Splatting",
                type: "Neural 3D Rendering",
                color: "var(--color-gaussian)",
                desc: "3D Gaussian primitives enabling fast photorealistic rendering",
              },
              {
                num: "2.4",
                title: "Streaming Avatars",
                type: "Infrastructure",
                color: "var(--color-streaming)",
                desc: "Production-ready WebRTC systems with multiple providers",
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
                  <span className="text-sm text-[var(--muted)]">{method.num}</span>
                  <span className="badge">{method.type}</span>
                </div>
                <h3 className="font-semibold mb-1">{method.title}</h3>
                <p className="text-sm text-[var(--muted)]">{method.desc}</p>
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

          <p className="text-[var(--muted)] mb-6">
            Epic Games&apos; MetaHuman framework exemplifies the graphics-based approach to digital
            humans. MetaHumans are highly detailed 3D character models with rigged faces and
            bodies, designed for real-time rendering in Unreal Engine. By driving these rigs
            with input data (live video, motion capture, or audio), one can achieve interactive
            animation at 60+ FPS.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="card-alt p-5">
              <p className="font-medium mb-3">Advantages</p>
              <ul className="space-y-2 text-sm text-[var(--muted)]">
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
              </ul>
            </div>
            <div className="card-alt p-5">
              <p className="font-medium mb-3">Limitations</p>
              <ul className="space-y-2 text-sm text-[var(--muted)]">
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
              </ul>
            </div>
          </div>

          <div className="figure">
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="text-center px-4 py-3 bg-[var(--card-bg)] rounded border border-[var(--border)]">
                <div className="font-medium">Input</div>
                <div className="text-xs text-[var(--muted)]">Camera / Audio</div>
              </div>
              <span className="text-[var(--muted)]">→</span>
              <div className="text-center px-4 py-3 bg-[var(--card-bg)] rounded border border-[var(--border)]">
                <div className="font-medium">Tracking</div>
                <div className="text-xs text-[var(--muted)]">ARKit / LiveLink</div>
              </div>
              <span className="text-[var(--muted)]">→</span>
              <div className="text-center px-4 py-3 bg-[var(--card-bg)] rounded border border-[var(--border)]">
                <div className="font-medium">Animation</div>
                <div className="text-xs text-[var(--muted)]">Blendshapes</div>
              </div>
              <span className="text-[var(--muted)]">→</span>
              <div className="text-center px-4 py-3 bg-[var(--card-bg)] rounded border border-[var(--border)]">
                <div className="font-medium">Render</div>
                <div className="text-xs text-[var(--muted)]">Unreal Engine</div>
              </div>
            </div>
            <p className="figure-caption">Figure 1: MetaHuman real-time animation pipeline</p>
          </div>
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

          <p className="text-[var(--muted)] mb-6">
            AI generative models, based on diffusion or transformer architectures, directly
            synthesize video frames of a talking or moving person. These models can turn a
            single input image into a lifelike talking video with one-shot generalization
            to unseen identities—a significant advantage for rapid deployment.
          </p>

          <div className="research-note">
            &ldquo;Diffusion models have become the leading method for high-quality avatar video
            generation. Recent distillation techniques achieve 40× speedup over vanilla diffusion,
            enabling near real-time performance.&rdquo;
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="card-alt p-5">
              <p className="font-medium mb-3">Advantages</p>
              <ul className="space-y-2 text-sm text-[var(--muted)]">
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
                  20-30 FPS achievable on high-end GPUs
                </li>
              </ul>
            </div>
            <div className="card-alt p-5">
              <p className="font-medium mb-3">Limitations</p>
              <ul className="space-y-2 text-sm text-[var(--muted)]">
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
              </ul>
            </div>
          </div>

          <div className="card p-5">
            <p className="font-medium mb-4">Key Techniques</p>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-medium mb-1">Autoregressive Streaming</p>
                <p className="text-[var(--muted)]">
                  Block-wise causal attention enables real-time generation without future context.
                </p>
              </div>
              <div>
                <p className="font-medium mb-1">Long-term Consistency</p>
                <p className="text-[var(--muted)]">
                  Reference anchors and positional re-encoding prevent identity drift.
                </p>
              </div>
              <div>
                <p className="font-medium mb-1">Adversarial Refinement</p>
                <p className="text-[var(--muted)]">
                  Second-stage discriminator training recovers detail lost in distillation.
                </p>
              </div>
            </div>
          </div>
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

          <p className="text-[var(--muted)] mb-6">
            3D Gaussian Splatting (3DGS) enables real-time rendering of photorealistic 3D scenes
            using clouds of Gaussian primitives instead of dense neural networks. By capturing a
            person as textured 3D Gaussians that can be transformed and animated, we obtain a
            streaming neural avatar that runs extremely fast and looks realistic.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="card-alt p-5">
              <p className="font-medium mb-3">Advantages</p>
              <ul className="space-y-2 text-sm text-[var(--muted)]">
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
              </ul>
            </div>
            <div className="card-alt p-5">
              <p className="font-medium mb-3">Limitations</p>
              <ul className="space-y-2 text-sm text-[var(--muted)]">
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
              </ul>
            </div>
          </div>

          <div className="card p-5">
            <p className="font-medium mb-4">Notable Implementations</p>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <p className="font-medium mb-1">D3GA (Drivable 3D Gaussian Avatars)</p>
                <p className="text-[var(--muted)]">
                  Factors full human avatars into layered Gaussian clusters (body, garments, face)
                  attached to a deformable cage rig, enabling animation via standard motion inputs.
                </p>
              </div>
              <div>
                <p className="font-medium mb-1">GaussianSpeech</p>
                <p className="text-[var(--muted)]">
                  First photorealistic multi-view talking head from audio input, with
                  expression-dependent color changes and high-frequency details like wrinkles.
                </p>
              </div>
            </div>
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

          <p className="text-[var(--muted)] mb-6">
            LiveKit Agents provides production-ready infrastructure for deploying real-time
            avatars at scale. Rather than implementing avatar rendering directly, it integrates
            multiple third-party avatar providers through a unified API, handling WebRTC
            streaming, synchronization, and voice AI pipelines automatically.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="card-alt p-5">
              <p className="font-medium mb-3">Advantages</p>
              <ul className="space-y-2 text-sm text-[var(--muted)]">
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
              </ul>
            </div>
            <div className="card-alt p-5">
              <p className="font-medium mb-3">Limitations</p>
              <ul className="space-y-2 text-sm text-[var(--muted)]">
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
              </ul>
            </div>
          </div>

          <div className="figure">
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="text-center px-4 py-3 bg-[var(--card-bg)] rounded border border-[var(--border)]">
                <div className="font-medium">Agent Session</div>
                <div className="text-xs text-[var(--muted)]">Python / Node.js</div>
              </div>
              <span className="text-[var(--muted)]">→</span>
              <div className="text-center px-4 py-3 bg-[var(--card-bg)] rounded border border-[var(--border)]">
                <div className="font-medium">Avatar Worker</div>
                <div className="text-xs text-[var(--muted)]">Provider API</div>
              </div>
              <span className="text-[var(--muted)]">→</span>
              <div className="text-center px-4 py-3 bg-[var(--card-bg)] rounded border border-[var(--border)]">
                <div className="font-medium">LiveKit Room</div>
                <div className="text-xs text-[var(--muted)]">WebRTC</div>
              </div>
              <span className="text-[var(--muted)]">→</span>
              <div className="text-center px-4 py-3 bg-[var(--card-bg)] rounded border border-[var(--border)]">
                <div className="font-medium">Client</div>
                <div className="text-xs text-[var(--muted)]">Web / Mobile</div>
              </div>
            </div>
            <p className="figure-caption">Figure 2: LiveKit avatar streaming architecture</p>
          </div>

          <div className="card p-5 mt-6">
            <p className="font-medium mb-4">Supported Providers</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              {[
                { name: "Tavus", desc: "Photorealistic digital twins" },
                { name: "Hedra", desc: "Expressive character avatars" },
                { name: "Simli", desc: "Real-time lip-sync" },
                { name: "Anam", desc: "Natural gesture avatars" },
                { name: "Beyond Presence", desc: "Enterprise-grade" },
                { name: "bitHuman", desc: "Hyper-realistic faces" },
              ].map((p) => (
                <div key={p.name} className="flex items-center gap-2">
                  <div
                    className="approach-dot"
                    style={{ backgroundColor: "var(--color-streaming)" }}
                  />
                  <div>
                    <span className="font-medium">{p.name}</span>
                    <span className="text-[var(--muted)]"> · {p.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
                  <td>Moderate</td>
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

        {/* Implementation Guide */}
        <section id="implementation" className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">4. Implementation</h2>

          <p className="text-[var(--muted)] mb-6">
            The following guides provide starting points for each approach. All referenced
            implementations are open-source or freely available.
          </p>

          {/* MetaHuman Implementation */}
          <div className="card p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="approach-dot" style={{ backgroundColor: "var(--color-metahuman)" }} />
              <h4 className="font-semibold">4.1 MetaHuman + Live Link</h4>
            </div>
            <ol className="numbered-list text-sm text-[var(--muted)]">
              <li>Install Unreal Engine 5 from Epic Games Launcher</li>
              <li>Create character using MetaHuman Creator web tool</li>
              <li>Install Live Link Face app on iPhone, connect to Unreal</li>
              <li>Enable Live Link plugin and connect ARKit face data to MetaHuman blueprint</li>
            </ol>
          </div>

          {/* Generative Implementation */}
          <div className="card p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="approach-dot" style={{ backgroundColor: "var(--color-generative)" }} />
              <h4 className="font-semibold">4.2 SadTalker (Diffusion-based)</h4>
            </div>
            <ol className="numbered-list text-sm text-[var(--muted)]">
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

          {/* Gaussian Implementation */}
          <div className="card p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="approach-dot" style={{ backgroundColor: "var(--color-gaussian)" }} />
              <h4 className="font-semibold">4.3 D3GA (Gaussian Avatars)</h4>
            </div>
            <ol className="numbered-list text-sm text-[var(--muted)]">
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
              <h4 className="font-semibold">4.4 LiveKit Agents + Avatar</h4>
            </div>
            <ol className="numbered-list text-sm text-[var(--muted)]">
              <li>
                <div>
                  Install SDK
                  <div className="code mt-2">pip install livekit-agents livekit-plugins-hedra</div>
                </div>
              </li>
              <li>Configure LiveKit Cloud account and avatar provider API keys</li>
              <li>Create AgentSession and AvatarSession in Python</li>
              <li>Deploy frontend using LiveKit React hooks for video display</li>
            </ol>
          </div>
        </section>

        <div className="divider" />

        {/* References / Resources */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">5. References & Resources</h2>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                title: "SadTalker",
                desc: "Audio-driven talking head generation with 3D motion",
                url: "https://github.com/OpenTalker/SadTalker",
              },
              {
                title: "D3GA",
                desc: "Drivable 3D Gaussian Avatars (Facebook Research)",
                url: "https://github.com/facebookresearch/D3GA",
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
                title: "LiveKit Avatar Documentation",
                desc: "Official integration guide for avatar providers",
                url: "https://docs.livekit.io/agents/models/avatar/",
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
                className="card p-4 flex items-start gap-3"
              >
                <span className="text-[var(--accent)]">↗</span>
                <div>
                  <p className="font-medium">{ref.title}</p>
                  <p className="text-sm text-[var(--muted)]">{ref.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] bg-[var(--card-bg)]">
        <div className="mx-auto max-w-4xl px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="footer-text">
              Real-Time Avatar Systems: A Comparative Analysis
            </p>
            <p className="footer-text">
              Based on research from 2023–2025
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
