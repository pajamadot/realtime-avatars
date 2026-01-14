// SVG Icons as components
const IconMetahuman = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="9" cy="10" r="1.5" fill="currentColor"/>
    <circle cx="15" cy="10" r="1.5" fill="currentColor"/>
    <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M12 2v2M12 20v2M2 12h2M20 12h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
  </svg>
);

const IconGenerative = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
    <path d="M4 4h4v4H4zM16 4h4v4h-4zM4 16h4v4H4zM16 16h4v4h-4z" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M8 6h8M6 8v8M18 8v8M8 18h8" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" opacity="0.5"/>
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M12 9v6M9 12h6" stroke="currentColor" strokeWidth="1.5" opacity="0.7"/>
  </svg>
);

const IconGaussian = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
    <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.8"/>
    <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3"/>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
    <circle cx="6" cy="8" r="1.5" fill="currentColor" opacity="0.6"/>
    <circle cx="18" cy="8" r="1.5" fill="currentColor" opacity="0.6"/>
    <circle cx="8" cy="17" r="1.5" fill="currentColor" opacity="0.6"/>
    <circle cx="16" cy="17" r="1.5" fill="currentColor" opacity="0.6"/>
  </svg>
);

const IconStreaming = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
    <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M10 10l4 2-4 2v-4z" fill="currentColor"/>
    <path d="M1 9v6M23 9v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
    <path d="M7 3v2M17 3v2M7 19v2M17 19v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3"/>
  </svg>
);

const IconCheck = () => (
  <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
    <path d="M3 8l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconX = () => (
  <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const IconArrow = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconExternal = () => (
  <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
    <path d="M6 2H2v12h12v-4M10 2h4v4M7 9l7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Approach card component
function ApproachCard({
  icon,
  tag,
  title,
  description,
  color,
  href,
}: {
  icon: React.ReactNode;
  tag: string;
  title: string;
  description: string;
  color: string;
  href: string;
}) {
  return (
    <a href={href} className="feature-card card-hover group block">
      <div
        className="icon-container mb-4"
        style={{ background: `${color}20`, color }}
      >
        {icon}
      </div>
      <span
        className="tag mb-3"
        style={{ background: `${color}15`, color }}
      >
        {tag}
      </span>
      <h3 className="text-lg font-semibold mb-2 group-hover:text-white transition-colors">
        {title}
      </h3>
      <p className="text-sm text-[var(--muted)]">{description}</p>
    </a>
  );
}

// Stats row component
function StatsRow({
  items,
}: {
  items: { label: string; value: string }[];
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {items.map((item, i) => (
        <div key={i} className="text-center">
          <div className="stat-value">{item.value}</div>
          <div className="text-sm text-[var(--muted)] mt-1">{item.label}</div>
        </div>
      ))}
    </div>
  );
}

// Feature list component
function FeatureList({
  features,
  color,
  type,
}: {
  features: string[];
  color: string;
  type: "pro" | "con";
}) {
  return (
    <ul className="space-y-3">
      {features.map((feature, i) => (
        <li key={i} className="flex items-start gap-3 text-sm">
          <span
            className="mt-0.5 p-1 rounded-full"
            style={{
              background: type === "pro" ? "#10b98120" : "#ef444420",
              color: type === "pro" ? "#10b981" : "#ef4444",
            }}
          >
            {type === "pro" ? <IconCheck /> : <IconX />}
          </span>
          <span className="text-[var(--muted)]">{feature}</span>
        </li>
      ))}
    </ul>
  );
}

// Architecture diagram component
function ArchitectureDiagram({
  steps,
  color,
}: {
  steps: { title: string; subtitle: string }[];
  color: string;
}) {
  return (
    <div className="flex flex-col md:flex-row items-stretch gap-2">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-2 flex-1">
          <div
            className="flex-1 rounded-xl p-4 text-center"
            style={{ background: `${color}10`, border: `1px solid ${color}30` }}
          >
            <div className="font-medium text-sm">{step.title}</div>
            <div className="text-xs text-[var(--muted)] mt-1">{step.subtitle}</div>
          </div>
          {i < steps.length - 1 && (
            <div className="hidden md:block text-[var(--muted)]">
              <IconArrow />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Tutorial step component
function TutorialStep({
  number,
  title,
  description,
  code,
  color,
}: {
  number: number;
  title: string;
  description?: string;
  code?: string;
  color: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="step-number text-white" style={{ background: color }}>
        {number}
      </div>
      <div className="flex-1 pb-6">
        <div className="font-medium mb-1">{title}</div>
        {description && (
          <p className="text-sm text-[var(--muted)] mb-2">{description}</p>
        )}
        {code && <div className="code-block text-[var(--muted)]">{code}</div>}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 grid-pattern" />
        <div
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse-slow"
          style={{ background: "var(--accent-metahuman)", opacity: 0.1 }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse-slow"
          style={{ background: "var(--accent-streaming)", opacity: 0.1, animationDelay: "1.5s" }}
        />

        {/* Navigation */}
        <nav className="relative z-10 border-b border-[var(--border)]">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex items-center justify-between h-16">
              <div className="font-bold text-lg">Real-Time Avatars</div>
              <div className="hidden md:flex items-center gap-8 text-sm">
                <a href="#approaches" className="text-[var(--muted)] hover:text-white transition-colors">
                  Approaches
                </a>
                <a href="#comparison" className="text-[var(--muted)] hover:text-white transition-colors">
                  Compare
                </a>
                <a href="#tutorials" className="text-[var(--muted)] hover:text-white transition-colors">
                  Tutorials
                </a>
                <a href="#resources" className="text-[var(--muted)] hover:text-white transition-colors">
                  Resources
                </a>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero content */}
        <header className="relative z-10 mx-auto max-w-6xl px-6 py-24 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--card-bg)] border border-[var(--border)] text-sm mb-8">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[var(--muted)]">2024 Research Survey</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Build Interactive
            <br />
            <span className="bg-gradient-to-r from-[var(--accent-metahuman)] via-[var(--accent-generative)] to-[var(--accent-streaming)] bg-clip-text text-transparent">
              Digital Humans
            </span>
          </h1>
          <p className="text-lg md:text-xl text-[var(--muted)] max-w-2xl mx-auto mb-12">
            Compare four approaches to real-time avatar systems. From game engine pipelines
            to neural rendering, find the right solution for your use case.
          </p>

          {/* Quick stats */}
          <div className="gradient-border p-6 md:p-8 max-w-3xl mx-auto">
            <StatsRow
              items={[
                { value: "60+", label: "FPS Possible" },
                { value: "<100ms", label: "Latency" },
                { value: "4", label: "Approaches" },
                { value: "10+", label: "Open Source" },
              ]}
            />
          </div>
        </header>
      </div>

      <main className="mx-auto max-w-6xl px-6">
        {/* Approaches Section */}
        <section id="approaches" className="py-20">
          <div className="text-center mb-12">
            <span className="tag bg-[var(--card-bg)] text-[var(--muted)] mb-4">
              Four Approaches
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Choose Your Path</h2>
            <p className="text-[var(--muted)] max-w-2xl mx-auto">
              Each approach offers unique trade-offs in latency, visual quality, controllability, and deployment complexity.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <ApproachCard
              icon={<IconMetahuman />}
              tag="Graphics"
              title="MetaHuman Pipeline"
              description="Game-engine characters with rigged faces for real-time rendering in Unreal Engine."
              color="var(--accent-metahuman)"
              href="#metahuman"
            />
            <ApproachCard
              icon={<IconGenerative />}
              tag="AI/ML"
              title="Generative Models"
              description="Diffusion and transformer models that synthesize photorealistic video from audio."
              color="var(--accent-generative)"
              href="#generative"
            />
            <ApproachCard
              icon={<IconGaussian />}
              tag="Neural 3D"
              title="Gaussian Splatting"
              description="3D Gaussian primitives enabling fast, photorealistic neural rendering."
              color="var(--accent-gaussian)"
              href="#gaussian"
            />
            <ApproachCard
              icon={<IconStreaming />}
              tag="Infrastructure"
              title="Streaming Avatars"
              description="Production-ready WebRTC infrastructure with multiple avatar providers."
              color="var(--accent-streaming)"
              href="#streaming"
            />
          </div>
        </section>

        <div className="section-divider" />

        {/* MetaHuman Section */}
        <section id="metahuman" className="py-20">
          <div className="flex items-center gap-4 mb-8">
            <div
              className="icon-container"
              style={{ background: "var(--accent-metahuman)20", color: "var(--accent-metahuman)" }}
            >
              <IconMetahuman />
            </div>
            <div>
              <span className="tag mb-1" style={{ background: "var(--accent-metahuman)15", color: "var(--accent-metahuman)" }}>
                Approach 1
              </span>
              <h2 className="text-2xl md:text-3xl font-bold">MetaHuman Pipeline</h2>
            </div>
          </div>

          <p className="text-[var(--muted)] text-lg mb-8 max-w-3xl">
            Epic Games&apos; MetaHuman framework exemplifies the graphics-based approach.
            Highly detailed 3D characters with rigged faces, designed for real-time
            rendering in Unreal Engine with precise animator control.
          </p>

          <div className="grid gap-6 md:grid-cols-2 mb-8">
            <div className="feature-card">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Strengths
              </h3>
              <FeatureList
                color="var(--accent-metahuman)"
                type="pro"
                features={[
                  "60+ FPS rendering with ~30-50ms latency",
                  "Precise control via rigs and blendshapes",
                  "Live Link support for real-time streaming",
                  "No per-person ML training required",
                  "Mature tooling with Unreal Engine",
                ]}
              />
            </div>
            <div className="feature-card">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Limitations
              </h3>
              <FeatureList
                color="var(--accent-metahuman)"
                type="con"
                features={[
                  "CGI look may not achieve true photorealism",
                  "Significant content creation effort upfront",
                  "Requires capable GPU and game engine",
                  "Manual design needed for specific likenesses",
                ]}
              />
            </div>
          </div>

          <div className="feature-card">
            <h3 className="font-semibold mb-4">How It Works</h3>
            <ArchitectureDiagram
              color="var(--accent-metahuman)"
              steps={[
                { title: "Input", subtitle: "Camera / Audio" },
                { title: "Tracking", subtitle: "ARKit / LiveLink" },
                { title: "Animation", subtitle: "Blendshapes" },
                { title: "Render", subtitle: "Unreal Engine" },
              ]}
            />
          </div>
        </section>

        <div className="section-divider" />

        {/* Generative Section */}
        <section id="generative" className="py-20">
          <div className="flex items-center gap-4 mb-8">
            <div
              className="icon-container"
              style={{ background: "var(--accent-generative)20", color: "var(--accent-generative)" }}
            >
              <IconGenerative />
            </div>
            <div>
              <span className="tag mb-1" style={{ background: "var(--accent-generative)15", color: "var(--accent-generative)" }}>
                Approach 2
              </span>
              <h2 className="text-2xl md:text-3xl font-bold">Generative Video Models</h2>
            </div>
          </div>

          <p className="text-[var(--muted)] text-lg mb-8 max-w-3xl">
            AI generative models using diffusion or transformer architectures directly
            synthesize video frames. A single input image becomes a lifelike talking
            video with one-shot generalization to unseen identities.
          </p>

          <div className="grid gap-6 md:grid-cols-2 mb-8">
            <div className="feature-card">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Strengths
              </h3>
              <FeatureList
                color="var(--accent-generative)"
                type="pro"
                features={[
                  "Photorealistic output from minimal input",
                  "One-shot: no per-subject training needed",
                  "Natural behaviors (blinks, head movements)",
                  "20-30 FPS achievable on high-end GPUs",
                ]}
              />
            </div>
            <div className="feature-card">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Limitations
              </h3>
              <FeatureList
                color="var(--accent-generative)"
                type="con"
                features={[
                  "Heavy compute requirements (A100+ GPU)",
                  "Limited explicit control over output",
                  "Risk of artifacts or identity drift",
                  "Higher first-frame latency (~0.3-1s)",
                ]}
              />
            </div>
          </div>

          <div className="feature-card">
            <h3 className="font-semibold mb-6">Key Techniques</h3>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  title: "Autoregressive Streaming",
                  desc: "Block-wise causal attention for 40x speedup over vanilla diffusion.",
                },
                {
                  title: "Long-term Consistency",
                  desc: "Reference Sink and RAPR techniques prevent identity drift.",
                },
                {
                  title: "Adversarial Refinement",
                  desc: "Second-stage discriminator recovers detail lost in distillation.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl"
                  style={{ background: "var(--accent-generative)08", border: "1px solid var(--accent-generative)20" }}
                >
                  <div className="font-medium text-sm mb-2">{item.title}</div>
                  <div className="text-xs text-[var(--muted)]">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="section-divider" />

        {/* Gaussian Section */}
        <section id="gaussian" className="py-20">
          <div className="flex items-center gap-4 mb-8">
            <div
              className="icon-container"
              style={{ background: "var(--accent-gaussian)20", color: "var(--accent-gaussian)" }}
            >
              <IconGaussian />
            </div>
            <div>
              <span className="tag mb-1" style={{ background: "var(--accent-gaussian)15", color: "var(--accent-gaussian)" }}>
                Approach 3
              </span>
              <h2 className="text-2xl md:text-3xl font-bold">Neural Gaussian Splatting</h2>
            </div>
          </div>

          <p className="text-[var(--muted)] text-lg mb-8 max-w-3xl">
            3D Gaussian Splatting enables real-time rendering of photorealistic 3D scenes
            using clouds of Gaussian primitives. Capture a person as textured 3D Gaussians
            that can be animated for streaming neural avatars.
          </p>

          <div className="grid gap-6 md:grid-cols-2 mb-8">
            <div className="feature-card">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Strengths
              </h3>
              <FeatureList
                color="var(--accent-gaussian)"
                type="pro"
                features={[
                  "60+ FPS rendering on consumer GPUs",
                  "Photorealistic for the captured subject",
                  "Multi-view consistent output for AR/VR",
                  "Can be driven by parametric models",
                ]}
              />
            </div>
            <div className="feature-card">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Limitations
              </h3>
              <FeatureList
                color="var(--accent-gaussian)"
                type="con"
                features={[
                  "Requires multi-view capture per person",
                  "Hours of training time per identity",
                  "Fixed identity (one model = one person)",
                  "Quality degrades outside training range",
                ]}
              />
            </div>
          </div>

          <div className="feature-card">
            <h3 className="font-semibold mb-6">Notable Projects</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                {
                  title: "D3GA",
                  subtitle: "Drivable 3D Gaussian Avatars",
                  desc: "Layered Gaussian clusters (body, garments, face) attached to a deformable cage rig.",
                },
                {
                  title: "GaussianSpeech",
                  subtitle: "Audio-driven 3D Heads",
                  desc: "First photorealistic multi-view talking head from audio with expression-dependent details.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl"
                  style={{ background: "var(--accent-gaussian)08", border: "1px solid var(--accent-gaussian)20" }}
                >
                  <div className="font-medium mb-1">{item.title}</div>
                  <div className="text-xs text-[var(--accent-gaussian)] mb-2">{item.subtitle}</div>
                  <div className="text-sm text-[var(--muted)]">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="section-divider" />

        {/* Streaming Section */}
        <section id="streaming" className="py-20">
          <div className="flex items-center gap-4 mb-8">
            <div
              className="icon-container"
              style={{ background: "var(--accent-streaming)20", color: "var(--accent-streaming)" }}
            >
              <IconStreaming />
            </div>
            <div>
              <span className="tag mb-1" style={{ background: "var(--accent-streaming)15", color: "var(--accent-streaming)" }}>
                Production Ready
              </span>
              <h2 className="text-2xl md:text-3xl font-bold">Streaming Avatars with LiveKit</h2>
            </div>
          </div>

          <p className="text-[var(--muted)] text-lg mb-8 max-w-3xl">
            LiveKit Agents provides production-ready infrastructure for deploying real-time
            avatars at scale. Integrates multiple avatar providers through a unified API,
            handling WebRTC streaming and voice AI pipelines automatically.
          </p>

          <div className="grid gap-6 md:grid-cols-2 mb-8">
            <div className="feature-card">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Strengths
              </h3>
              <FeatureList
                color="var(--accent-streaming)"
                type="pro"
                features={[
                  "Multiple avatar providers (Tavus, Hedra, Simli)",
                  "Built-in voice AI pipeline (STT + LLM + TTS)",
                  "WebRTC-based low-latency streaming",
                  "Production deployment with load balancing",
                  "Cross-platform SDKs (Web, iOS, Android)",
                ]}
              />
            </div>
            <div className="feature-card">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Limitations
              </h3>
              <FeatureList
                color="var(--accent-streaming)"
                type="con"
                features={[
                  "Requires third-party provider subscription",
                  "Less control over avatar rendering pipeline",
                  "Dependent on provider capabilities",
                  "Per-minute or per-session pricing",
                ]}
              />
            </div>
          </div>

          <div className="feature-card mb-8">
            <h3 className="font-semibold mb-4">Architecture</h3>
            <ArchitectureDiagram
              color="var(--accent-streaming)"
              steps={[
                { title: "Agent Session", subtitle: "Python / Node.js" },
                { title: "Avatar Worker", subtitle: "Provider API" },
                { title: "LiveKit Room", subtitle: "WebRTC" },
                { title: "Client", subtitle: "Web / Mobile" },
              ]}
            />
            <p className="text-sm text-[var(--muted)] mt-4">
              The avatar worker joins as a separate participant, receiving audio from the agent
              and publishing synchronized video back to users with minimal latency.
            </p>
          </div>

          <div className="feature-card">
            <h3 className="font-semibold mb-6">Supported Providers</h3>
            <div className="grid gap-3 md:grid-cols-3">
              {[
                { name: "Tavus", desc: "Photorealistic digital twins" },
                { name: "Hedra", desc: "Expressive character avatars" },
                { name: "Simli", desc: "Real-time lip-sync avatars" },
                { name: "Anam", desc: "Natural gesture avatars" },
                { name: "Beyond Presence", desc: "Enterprise-grade avatars" },
                { name: "bitHuman", desc: "Hyper-realistic faces" },
              ].map((provider, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-lg"
                  style={{ background: "var(--accent-streaming)08" }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                    style={{ background: "var(--accent-streaming)20", color: "var(--accent-streaming)" }}
                  >
                    {provider.name[0]}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{provider.name}</div>
                    <div className="text-xs text-[var(--muted)]">{provider.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="section-divider" />

        {/* Comparison Section */}
        <section id="comparison" className="py-20">
          <div className="text-center mb-12">
            <span className="tag bg-[var(--card-bg)] text-[var(--muted)] mb-4">
              Side by Side
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Compare Approaches</h2>
            <p className="text-[var(--muted)] max-w-2xl mx-auto">
              Quick reference for choosing the right approach based on your requirements.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
            <table className="comparison-table w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left font-semibold">Aspect</th>
                  <th className="text-left" style={{ color: "var(--accent-metahuman)" }}>
                    <div className="flex items-center gap-2">
                      <IconMetahuman />
                      MetaHuman
                    </div>
                  </th>
                  <th className="text-left" style={{ color: "var(--accent-generative)" }}>
                    <div className="flex items-center gap-2">
                      <IconGenerative />
                      Generative
                    </div>
                  </th>
                  <th className="text-left" style={{ color: "var(--accent-gaussian)" }}>
                    <div className="flex items-center gap-2">
                      <IconGaussian />
                      Gaussian
                    </div>
                  </th>
                  <th className="text-left" style={{ color: "var(--accent-streaming)" }}>
                    <div className="flex items-center gap-2">
                      <IconStreaming />
                      Streaming
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="text-[var(--muted)]">
                <tr>
                  <td className="font-medium text-white">Latency</td>
                  <td>~30-50ms</td>
                  <td>~0.3-1s first frame</td>
                  <td>&lt;100ms</td>
                  <td>~100-300ms</td>
                </tr>
                <tr>
                  <td className="font-medium text-white">Visual Quality</td>
                  <td>High CGI</td>
                  <td>Photorealistic</td>
                  <td>Photorealistic</td>
                  <td>Varies</td>
                </tr>
                <tr>
                  <td className="font-medium text-white">Control</td>
                  <td>Fine-grained</td>
                  <td>Limited</td>
                  <td>Moderate</td>
                  <td>API-based</td>
                </tr>
                <tr>
                  <td className="font-medium text-white">New Identity</td>
                  <td>Modeling</td>
                  <td>One image</td>
                  <td>Capture + train</td>
                  <td>Provider setup</td>
                </tr>
                <tr>
                  <td className="font-medium text-white">Hardware</td>
                  <td>Gaming GPU</td>
                  <td>A100+ / Cloud</td>
                  <td>Consumer GPU</td>
                  <td>Any (cloud)</td>
                </tr>
                <tr>
                  <td className="font-medium text-white">Best For</td>
                  <td>Production</td>
                  <td>Quick deploy</td>
                  <td>VR/AR</td>
                  <td>Voice AI</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <div className="section-divider" />

        {/* Tutorials Section */}
        <section id="tutorials" className="py-20">
          <div className="text-center mb-12">
            <span className="tag bg-[var(--card-bg)] text-[var(--muted)] mb-4">
              Get Started
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Quick Start Tutorials</h2>
            <p className="text-[var(--muted)] max-w-2xl mx-auto">
              Step-by-step guides to get you up and running with each approach.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* MetaHuman Tutorial */}
            <div className="feature-card">
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="icon-container"
                  style={{ background: "var(--accent-metahuman)20", color: "var(--accent-metahuman)" }}
                >
                  <IconMetahuman />
                </div>
                <div>
                  <div className="font-semibold">MetaHuman + Live Link</div>
                  <div className="text-xs text-[var(--muted)]">Unreal Engine 5</div>
                </div>
              </div>
              <div className="space-y-4">
                <TutorialStep number={1} title="Install Unreal Engine 5" description="Download from Epic Games Launcher" color="var(--accent-metahuman)" />
                <TutorialStep number={2} title="Create MetaHuman" description="Use MetaHuman Creator web tool" color="var(--accent-metahuman)" />
                <TutorialStep number={3} title="Set up Live Link Face" description="Install app on iPhone, connect to Unreal" color="var(--accent-metahuman)" />
                <TutorialStep number={4} title="Enable Live Link plugin" description="Connect ARKit data to MetaHuman blueprint" color="var(--accent-metahuman)" />
              </div>
            </div>

            {/* SadTalker Tutorial */}
            <div className="feature-card">
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="icon-container"
                  style={{ background: "var(--accent-generative)20", color: "var(--accent-generative)" }}
                >
                  <IconGenerative />
                </div>
                <div>
                  <div className="font-semibold">SadTalker</div>
                  <div className="text-xs text-[var(--muted)]">Diffusion-based</div>
                </div>
              </div>
              <div className="space-y-4">
                <TutorialStep number={1} title="Clone repository" code="git clone https://github.com/OpenTalker/SadTalker.git" color="var(--accent-generative)" />
                <TutorialStep number={2} title="Install dependencies" code="pip install -r requirements.txt" color="var(--accent-generative)" />
                <TutorialStep number={3} title="Download models" description="Run download script from releases" color="var(--accent-generative)" />
                <TutorialStep number={4} title="Generate" code="python inference.py --source_image face.jpg --driven_audio speech.wav" color="var(--accent-generative)" />
              </div>
            </div>

            {/* D3GA Tutorial */}
            <div className="feature-card">
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="icon-container"
                  style={{ background: "var(--accent-gaussian)20", color: "var(--accent-gaussian)" }}
                >
                  <IconGaussian />
                </div>
                <div>
                  <div className="font-semibold">D3GA</div>
                  <div className="text-xs text-[var(--muted)]">Gaussian Avatars</div>
                </div>
              </div>
              <div className="space-y-4">
                <TutorialStep number={1} title="Clone repository" code="git clone https://github.com/facebookresearch/D3GA.git" color="var(--accent-gaussian)" />
                <TutorialStep number={2} title="Capture multi-view video" description="Record subject from multiple angles" color="var(--accent-gaussian)" />
                <TutorialStep number={3} title="Train the avatar" description="Run training script (several hours)" color="var(--accent-gaussian)" />
                <TutorialStep number={4} title="Drive with motion" description="Use FLAME params or audio input" color="var(--accent-gaussian)" />
              </div>
            </div>

            {/* LiveKit Tutorial */}
            <div className="feature-card">
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="icon-container"
                  style={{ background: "var(--accent-streaming)20", color: "var(--accent-streaming)" }}
                >
                  <IconStreaming />
                </div>
                <div>
                  <div className="font-semibold">LiveKit Agents</div>
                  <div className="text-xs text-[var(--muted)]">Streaming Avatar</div>
                </div>
              </div>
              <div className="space-y-4">
                <TutorialStep number={1} title="Install SDK" code="pip install livekit-agents livekit-plugins-hedra" color="var(--accent-streaming)" />
                <TutorialStep number={2} title="Configure credentials" description="LiveKit Cloud + avatar provider API keys" color="var(--accent-streaming)" />
                <TutorialStep number={3} title="Create sessions" description="AgentSession + AvatarSession in Python" color="var(--accent-streaming)" />
                <TutorialStep number={4} title="Deploy frontend" description="Use LiveKit React hooks for video display" color="var(--accent-streaming)" />
              </div>
            </div>
          </div>
        </section>

        <div className="section-divider" />

        {/* Resources Section */}
        <section id="resources" className="py-20">
          <div className="text-center mb-12">
            <span className="tag bg-[var(--card-bg)] text-[var(--muted)] mb-4">
              Open Source
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Resources</h2>
            <p className="text-[var(--muted)] max-w-2xl mx-auto">
              Explore open-source implementations and documentation.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "SadTalker",
                desc: "Audio-driven talking head with 3D motion",
                url: "https://github.com/OpenTalker/SadTalker",
                color: "var(--accent-generative)",
              },
              {
                title: "D3GA",
                desc: "Drivable 3D Gaussian Avatars",
                url: "https://github.com/facebookresearch/D3GA",
                color: "var(--accent-gaussian)",
              },
              {
                title: "Avatarify",
                desc: "Real-time face animation",
                url: "https://github.com/alievk/avatarify",
                color: "var(--accent-generative)",
              },
              {
                title: "LiveKit Agents",
                desc: "Real-time AI agents framework",
                url: "https://github.com/livekit/agents",
                color: "var(--accent-streaming)",
              },
              {
                title: "LiveKit Avatar Docs",
                desc: "Official avatar integration guide",
                url: "https://docs.livekit.io/agents/models/avatar/",
                color: "var(--accent-streaming)",
              },
              {
                title: "Awesome Talking Head",
                desc: "Curated papers and code list",
                url: "https://github.com/harlanhong/awesome-talking-head-generation",
                color: "var(--accent-metahuman)",
              },
            ].map((resource, i) => (
              <a
                key={i}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="feature-card card-hover group flex items-start gap-4"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${resource.color}20`, color: resource.color }}
                >
                  {resource.title[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium group-hover:text-white transition-colors flex items-center gap-2">
                    {resource.title}
                    <IconExternal />
                  </div>
                  <div className="text-sm text-[var(--muted)] mt-1">{resource.desc}</div>
                </div>
              </a>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] mt-20">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-[var(--muted)]">
              Real-Time Avatars Comparison Guide
            </div>
            <div className="flex items-center gap-6 text-sm text-[var(--muted)]">
              <span>Based on 2023-2025 research</span>
              <a href="#approaches" className="hover:text-white transition-colors">
                Back to top
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
