export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-[var(--card-bg)]">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <h1 className="text-2xl font-bold">Real-Time Avatars</h1>
          <p className="mt-1 text-[var(--muted)]">
            A comparative guide to building interactive digital humans
          </p>
        </div>
      </header>

      {/* Navigation */}
      <nav className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex gap-6 overflow-x-auto py-4 text-sm font-medium">
            <a href="#overview" className="whitespace-nowrap hover:text-[var(--muted)]">
              Overview
            </a>
            <a href="#metahuman" className="whitespace-nowrap hover:text-[var(--muted)]">
              MetaHuman Pipeline
            </a>
            <a href="#generative" className="whitespace-nowrap hover:text-[var(--muted)]">
              Generative Models
            </a>
            <a href="#gaussian" className="whitespace-nowrap hover:text-[var(--muted)]">
              Gaussian Splatting
            </a>
            <a href="#comparison" className="whitespace-nowrap hover:text-[var(--muted)]">
              Comparison
            </a>
            <a href="#tutorial" className="whitespace-nowrap hover:text-[var(--muted)]">
              Tutorial
            </a>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-6 py-12">
        {/* Overview Section */}
        <section id="overview" className="mb-16">
          <h2 className="mb-6 text-3xl font-bold">Overview</h2>
          <div className="prose">
            <p>
              Interactive digital humans that respond in near real-time to user input are becoming
              central to virtual communication, gaming, and AI assistants. Achieving a convincing
              digital human requires balancing visual realism, low latency, precise controllability,
              and feasible deployment.
            </p>
            <p>
              Recent advances (2023-2024) have produced three distinct approaches to real-time
              responsive avatars, each with unique trade-offs in latency, fidelity, control, and
              system cost.
            </p>
          </div>

          {/* Three Cards */}
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card-bg)] p-6">
              <div
                className="mb-4 inline-block rounded-full px-3 py-1 text-sm font-medium text-white"
                style={{ backgroundColor: "var(--accent-metahuman)" }}
              >
                Graphics
              </div>
              <h3 className="mb-2 text-lg font-semibold">MetaHuman Pipeline</h3>
              <p className="text-sm text-[var(--muted)]">
                Game-engine characters driven by performance capture or animation rigs for real-time
                rendering in Unreal Engine.
              </p>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card-bg)] p-6">
              <div
                className="mb-4 inline-block rounded-full px-3 py-1 text-sm font-medium text-white"
                style={{ backgroundColor: "var(--accent-generative)" }}
              >
                AI/ML
              </div>
              <h3 className="mb-2 text-lg font-semibold">Generative Video Models</h3>
              <p className="text-sm text-[var(--muted)]">
                Diffusion or transformer-based models that directly synthesize avatar video frames
                from audio or other signals.
              </p>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card-bg)] p-6">
              <div
                className="mb-4 inline-block rounded-full px-3 py-1 text-sm font-medium text-white"
                style={{ backgroundColor: "var(--accent-gaussian)" }}
              >
                Neural 3D
              </div>
              <h3 className="mb-2 text-lg font-semibold">Gaussian Splatting</h3>
              <p className="text-sm text-[var(--muted)]">
                Neural 3D scene representation using Gaussian primitives that can be efficiently
                animated and rendered in real-time.
              </p>
            </div>
          </div>
        </section>

        {/* MetaHuman Section */}
        <section id="metahuman" className="mb-16">
          <div
            className="mb-4 inline-block rounded-full px-3 py-1 text-sm font-medium text-white"
            style={{ backgroundColor: "var(--accent-metahuman)" }}
          >
            Approach 1
          </div>
          <h2 className="mb-6 text-3xl font-bold">MetaHuman Pipeline</h2>

          <div className="prose mb-8">
            <p>
              Epic Games&apos; MetaHuman framework exemplifies the graphics-based approach to digital
              humans. MetaHumans are highly detailed 3D character models with rigged faces and
              bodies, designed for real-time rendering in Unreal Engine.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card-bg)] p-6">
              <h3 className="mb-4 font-semibold">Key Features</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-green-600">+</span>
                  <span>60+ FPS rendering with ~30-50ms latency</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-green-600">+</span>
                  <span>Precise control via rigs and blendshapes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-green-600">+</span>
                  <span>Live Link support for real-time streaming</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-green-600">+</span>
                  <span>No per-person ML training required</span>
                </li>
              </ul>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card-bg)] p-6">
              <h3 className="mb-4 font-semibold">Limitations</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-red-500">-</span>
                  <span>CGI look may not achieve true photorealism</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-red-500">-</span>
                  <span>Significant content creation effort upfront</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-red-500">-</span>
                  <span>Requires capable GPU and game engine</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-red-500">-</span>
                  <span>Manual design needed for specific likenesses</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card-bg)] p-6">
            <h3 className="mb-4 font-semibold">How It Works</h3>
            <div className="flex flex-col gap-4 text-sm md:flex-row md:items-center">
              <div className="flex-1 rounded bg-[var(--background)] p-3 text-center">
                <div className="font-medium">Input</div>
                <div className="text-[var(--muted)]">Camera/Audio</div>
              </div>
              <div className="hidden text-[var(--muted)] md:block">&rarr;</div>
              <div className="flex-1 rounded bg-[var(--background)] p-3 text-center">
                <div className="font-medium">Tracking</div>
                <div className="text-[var(--muted)]">ARKit/LiveLink</div>
              </div>
              <div className="hidden text-[var(--muted)] md:block">&rarr;</div>
              <div className="flex-1 rounded bg-[var(--background)] p-3 text-center">
                <div className="font-medium">Animation</div>
                <div className="text-[var(--muted)]">Blendshapes</div>
              </div>
              <div className="hidden text-[var(--muted)] md:block">&rarr;</div>
              <div className="flex-1 rounded bg-[var(--background)] p-3 text-center">
                <div className="font-medium">Render</div>
                <div className="text-[var(--muted)]">Unreal Engine</div>
              </div>
            </div>
          </div>
        </section>

        {/* Generative Models Section */}
        <section id="generative" className="mb-16">
          <div
            className="mb-4 inline-block rounded-full px-3 py-1 text-sm font-medium text-white"
            style={{ backgroundColor: "var(--accent-generative)" }}
          >
            Approach 2
          </div>
          <h2 className="mb-6 text-3xl font-bold">Generative Video Models</h2>

          <div className="prose mb-8">
            <p>
              AI generative models, often based on diffusion or transformer architectures, directly
              synthesize video frames of a talking or moving person. A single input image can be
              turned into a lifelike talking video with one-shot generalization to unseen identities.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card-bg)] p-6">
              <h3 className="mb-4 font-semibold">Key Features</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-green-600">+</span>
                  <span>Photorealistic output from minimal input</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-green-600">+</span>
                  <span>One-shot: no per-subject training needed</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-green-600">+</span>
                  <span>Natural behaviors (blinks, head movements)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-green-600">+</span>
                  <span>20-30 FPS on high-end GPUs achievable</span>
                </li>
              </ul>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card-bg)] p-6">
              <h3 className="mb-4 font-semibold">Limitations</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-red-500">-</span>
                  <span>Heavy compute requirements (A100+ GPU)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-red-500">-</span>
                  <span>Limited explicit control over output</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-red-500">-</span>
                  <span>Risk of artifacts or identity drift</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-red-500">-</span>
                  <span>Higher first-frame latency (~0.3-1s)</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card-bg)] p-6">
            <h3 className="mb-4 font-semibold">Key Techniques</h3>
            <div className="grid gap-4 text-sm md:grid-cols-3">
              <div className="rounded bg-[var(--background)] p-4">
                <div className="mb-2 font-medium">Autoregressive Streaming</div>
                <p className="text-[var(--muted)]">
                  Models like CausVid use block-wise causal attention for 40x speedup over vanilla
                  diffusion.
                </p>
              </div>
              <div className="rounded bg-[var(--background)] p-4">
                <div className="mb-2 font-medium">Long-term Consistency</div>
                <p className="text-[var(--muted)]">
                  Reference Sink and RAPR techniques prevent identity drift over extended
                  generation.
                </p>
              </div>
              <div className="rounded bg-[var(--background)] p-4">
                <div className="mb-2 font-medium">Adversarial Refinement</div>
                <p className="text-[var(--muted)]">
                  Second-stage discriminator training recovers detail lost in distillation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Gaussian Splatting Section */}
        <section id="gaussian" className="mb-16">
          <div
            className="mb-4 inline-block rounded-full px-3 py-1 text-sm font-medium text-white"
            style={{ backgroundColor: "var(--accent-gaussian)" }}
          >
            Approach 3
          </div>
          <h2 className="mb-6 text-3xl font-bold">Neural Gaussian Splatting</h2>

          <div className="prose mb-8">
            <p>
              3D Gaussian Splatting (3DGS) enables real-time rendering of photorealistic 3D scenes
              using a cloud of Gaussian primitives. By capturing a person as textured 3D Gaussians
              that can be animated, we get a streaming neural avatar that runs extremely fast and
              looks realistic.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card-bg)] p-6">
              <h3 className="mb-4 font-semibold">Key Features</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-green-600">+</span>
                  <span>60+ FPS rendering on consumer GPUs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-green-600">+</span>
                  <span>Photorealistic for the captured subject</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-green-600">+</span>
                  <span>Multi-view consistent output for AR/VR</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-green-600">+</span>
                  <span>Can be driven by parametric models</span>
                </li>
              </ul>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card-bg)] p-6">
              <h3 className="mb-4 font-semibold">Limitations</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-red-500">-</span>
                  <span>Requires multi-view capture per person</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-red-500">-</span>
                  <span>Hours of training time per identity</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-red-500">-</span>
                  <span>Fixed identity (one model = one person)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-red-500">-</span>
                  <span>Quality degrades outside training range</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card-bg)] p-6">
            <h3 className="mb-4 font-semibold">Notable Projects</h3>
            <div className="grid gap-4 text-sm md:grid-cols-2">
              <div className="rounded bg-[var(--background)] p-4">
                <div className="mb-2 font-medium">D3GA (Drivable 3D Gaussian Avatars)</div>
                <p className="text-[var(--muted)]">
                  Factors full human avatar into layered Gaussian clusters (body, garments, face)
                  attached to a deformable cage rig.
                </p>
              </div>
              <div className="rounded bg-[var(--background)] p-4">
                <div className="mb-2 font-medium">GaussianSpeech</div>
                <p className="text-[var(--muted)]">
                  First to generate photorealistic multi-view talking head sequences from audio
                  input with expression-dependent details.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Table Section */}
        <section id="comparison" className="mb-16">
          <h2 className="mb-6 text-3xl font-bold">Side-by-Side Comparison</h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="p-4 text-left font-semibold">Aspect</th>
                  <th
                    className="p-4 text-left font-semibold"
                    style={{ color: "var(--accent-metahuman)" }}
                  >
                    MetaHuman
                  </th>
                  <th
                    className="p-4 text-left font-semibold"
                    style={{ color: "var(--accent-generative)" }}
                  >
                    Generative
                  </th>
                  <th
                    className="p-4 text-left font-semibold"
                    style={{ color: "var(--accent-gaussian)" }}
                  >
                    Gaussian
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[var(--border)]">
                  <td className="p-4 font-medium">Latency</td>
                  <td className="p-4">~30-50ms (60+ FPS)</td>
                  <td className="p-4">~0.3-1s first frame, 20-30 FPS</td>
                  <td className="p-4">&lt;100ms (30-60 FPS)</td>
                </tr>
                <tr className="border-b border-[var(--border)]">
                  <td className="p-4 font-medium">Visual Realism</td>
                  <td className="p-4">High-quality CGI</td>
                  <td className="p-4">Photorealistic</td>
                  <td className="p-4">Photorealistic (subject-specific)</td>
                </tr>
                <tr className="border-b border-[var(--border)]">
                  <td className="p-4 font-medium">Controllability</td>
                  <td className="p-4">Explicit, fine-grained</td>
                  <td className="p-4">Limited, audio-driven</td>
                  <td className="p-4">Moderate to high</td>
                </tr>
                <tr className="border-b border-[var(--border)]">
                  <td className="p-4 font-medium">New Identity</td>
                  <td className="p-4">Moderate effort (modeling)</td>
                  <td className="p-4">One-shot (just an image)</td>
                  <td className="p-4">Low (capture + training)</td>
                </tr>
                <tr className="border-b border-[var(--border)]">
                  <td className="p-4 font-medium">Training Required</td>
                  <td className="p-4">None per character</td>
                  <td className="p-4">Base model only</td>
                  <td className="p-4">Per-subject (hours)</td>
                </tr>
                <tr className="border-b border-[var(--border)]">
                  <td className="p-4 font-medium">Hardware</td>
                  <td className="p-4">Gaming GPU</td>
                  <td className="p-4">A100+ or cloud</td>
                  <td className="p-4">Consumer GPU</td>
                </tr>
                <tr className="border-b border-[var(--border)]">
                  <td className="p-4 font-medium">Best For</td>
                  <td className="p-4">Production, precise control</td>
                  <td className="p-4">Quick deployment, any face</td>
                  <td className="p-4">VR/AR telepresence</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Tutorial Section */}
        <section id="tutorial" className="mb-16">
          <h2 className="mb-6 text-3xl font-bold">Getting Started Tutorial</h2>

          <div className="prose mb-8">
            <p>
              Choose your approach based on your requirements. Below are quick-start guides for each
              method with links to open-source implementations.
            </p>
          </div>

          {/* MetaHuman Tutorial */}
          <div className="mb-8 rounded-lg border border-[var(--border)] bg-[var(--card-bg)] p-6">
            <div
              className="mb-4 inline-block rounded-full px-3 py-1 text-sm font-medium text-white"
              style={{ backgroundColor: "var(--accent-metahuman)" }}
            >
              Tutorial 1
            </div>
            <h3 className="mb-4 text-xl font-semibold">MetaHuman + Live Link</h3>

            <div className="space-y-4 text-sm">
              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent-metahuman)] font-bold text-white">
                  1
                </div>
                <div>
                  <div className="font-medium">Install Unreal Engine 5</div>
                  <p className="text-[var(--muted)]">
                    Download from Epic Games Launcher. MetaHuman requires UE 5.0+.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent-metahuman)] font-bold text-white">
                  2
                </div>
                <div>
                  <div className="font-medium">Create a MetaHuman</div>
                  <p className="text-[var(--muted)]">
                    Use MetaHuman Creator (metahuman.unrealengine.com) to design or import a
                    character.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent-metahuman)] font-bold text-white">
                  3
                </div>
                <div>
                  <div className="font-medium">Set up Live Link Face</div>
                  <p className="text-[var(--muted)]">
                    Install Live Link Face app on iPhone. Connect to Unreal via your local network.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent-metahuman)] font-bold text-white">
                  4
                </div>
                <div>
                  <div className="font-medium">Enable Live Link in your project</div>
                  <p className="text-[var(--muted)]">
                    Add Live Link plugin, create a Live Link preset, and connect the ARKit face
                    data to your MetaHuman blueprint.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded bg-[var(--background)] p-4 font-mono text-sm">
              <div className="text-[var(--muted)]">// Alternative: Audio2Face for audio-driven</div>
              <div>NVIDIA Omniverse Audio2Face can drive MetaHuman lips from audio</div>
            </div>
          </div>

          {/* Generative Tutorial */}
          <div className="mb-8 rounded-lg border border-[var(--border)] bg-[var(--card-bg)] p-6">
            <div
              className="mb-4 inline-block rounded-full px-3 py-1 text-sm font-medium text-white"
              style={{ backgroundColor: "var(--accent-generative)" }}
            >
              Tutorial 2
            </div>
            <h3 className="mb-4 text-xl font-semibold">SadTalker (Diffusion-based)</h3>

            <div className="space-y-4 text-sm">
              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent-generative)] font-bold text-white">
                  1
                </div>
                <div>
                  <div className="font-medium">Clone the repository</div>
                  <code className="mt-1 block rounded bg-[var(--background)] px-2 py-1 font-mono text-xs">
                    git clone https://github.com/OpenTalker/SadTalker.git
                  </code>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent-generative)] font-bold text-white">
                  2
                </div>
                <div>
                  <div className="font-medium">Install dependencies</div>
                  <code className="mt-1 block rounded bg-[var(--background)] px-2 py-1 font-mono text-xs">
                    pip install -r requirements.txt
                  </code>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent-generative)] font-bold text-white">
                  3
                </div>
                <div>
                  <div className="font-medium">Download pretrained models</div>
                  <p className="text-[var(--muted)]">
                    Run the download script or manually download checkpoints from the releases
                    page.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent-generative)] font-bold text-white">
                  4
                </div>
                <div>
                  <div className="font-medium">Generate talking head</div>
                  <code className="mt-1 block rounded bg-[var(--background)] px-2 py-1 font-mono text-xs">
                    python inference.py --source_image face.jpg --driven_audio speech.wav
                  </code>
                </div>
              </div>
            </div>

            <div className="mt-6 text-sm text-[var(--muted)]">
              Other options: GeneFace++, OmniAvatar, Avatarify (for real-time webcam)
            </div>
          </div>

          {/* Gaussian Tutorial */}
          <div className="mb-8 rounded-lg border border-[var(--border)] bg-[var(--card-bg)] p-6">
            <div
              className="mb-4 inline-block rounded-full px-3 py-1 text-sm font-medium text-white"
              style={{ backgroundColor: "var(--accent-gaussian)" }}
            >
              Tutorial 3
            </div>
            <h3 className="mb-4 text-xl font-semibold">D3GA (Gaussian Avatars)</h3>

            <div className="space-y-4 text-sm">
              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent-gaussian)] font-bold text-white">
                  1
                </div>
                <div>
                  <div className="font-medium">Clone D3GA repository</div>
                  <code className="mt-1 block rounded bg-[var(--background)] px-2 py-1 font-mono text-xs">
                    git clone https://github.com/facebookresearch/D3GA.git
                  </code>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent-gaussian)] font-bold text-white">
                  2
                </div>
                <div>
                  <div className="font-medium">Capture multi-view video</div>
                  <p className="text-[var(--muted)]">
                    Record the subject from multiple angles. The more viewpoints, the better the
                    reconstruction.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent-gaussian)] font-bold text-white">
                  3
                </div>
                <div>
                  <div className="font-medium">Train the Gaussian avatar</div>
                  <p className="text-[var(--muted)]">
                    Run the training script with your captured data. This may take several hours
                    depending on data size.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent-gaussian)] font-bold text-white">
                  4
                </div>
                <div>
                  <div className="font-medium">Drive with motion data</div>
                  <p className="text-[var(--muted)]">
                    Use FLAME parameters, body poses, or audio input to animate your trained avatar
                    in real-time.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 text-sm text-[var(--muted)]">
              Also see: GaussianSpeech (audio-driven), GaussianTalker
            </div>
          </div>
        </section>

        {/* Resources Section */}
        <section className="mb-16">
          <h2 className="mb-6 text-3xl font-bold">Open Source Resources</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <a
              href="https://github.com/OpenTalker/SadTalker"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-[var(--border)] bg-[var(--card-bg)] p-4 transition-colors hover:border-[var(--muted)]"
            >
              <div className="font-medium">SadTalker</div>
              <p className="text-sm text-[var(--muted)]">
                Audio-driven talking head generation with 3D motion prediction
              </p>
            </a>

            <a
              href="https://github.com/facebookresearch/D3GA"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-[var(--border)] bg-[var(--card-bg)] p-4 transition-colors hover:border-[var(--muted)]"
            >
              <div className="font-medium">D3GA</div>
              <p className="text-sm text-[var(--muted)]">
                Drivable 3D Gaussian Avatars from Facebook Research
              </p>
            </a>

            <a
              href="https://github.com/alievk/avatarify"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-[var(--border)] bg-[var(--card-bg)] p-4 transition-colors hover:border-[var(--muted)]"
            >
              <div className="font-medium">Avatarify</div>
              <p className="text-sm text-[var(--muted)]">
                Real-time face animation with first-order motion model
              </p>
            </a>

            <a
              href="https://github.com/harlanhong/awesome-talking-head-generation"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-[var(--border)] bg-[var(--card-bg)] p-4 transition-colors hover:border-[var(--muted)]"
            >
              <div className="font-medium">Awesome Talking Head</div>
              <p className="text-sm text-[var(--muted)]">
                Curated list of talking head generation papers and code
              </p>
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] bg-[var(--card-bg)]">
        <div className="mx-auto max-w-6xl px-6 py-8 text-center text-sm text-[var(--muted)]">
          <p>Real-Time Avatars Comparison Guide</p>
          <p className="mt-1">Based on research from 2023-2025</p>
        </div>
      </footer>
    </div>
  );
}
