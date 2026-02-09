'use client';

import { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Circle, Layers, Zap, Github, BookOpen, ArrowRight, Check, X } from 'lucide-react';
import content from '../data/content/gaussian-splatting.json';
import { ConceptCard, AnimatedDiagram, CodeWalkthrough, CrossTrackNav, KeyInsight, DemoWrapper, InteractiveTooltip, MechanismNugget,
  AlphaBlendMath, GaussianCurve, MatrixTransformMini, DepthSortingMini, TileRasterizationMini,
  ScreenProjectionMini, OpacityAccumulation, SphericalHarmonicsBands, GradientFlowMini, AdaptiveDensityMini,
  CovarianceMatrixMini, PointCloudToSplatMini, ViewDependentColorMini, FrustumCullingMini, ZBufferMini,
  LossLandscape, BackpropagationMini, NoiseGenerationMini
} from '../components/core';

// Dynamically import heavy 3D demos
const SingleGaussianDemo = dynamic(
  () => import('../components/demos/gaussian/SingleGaussianDemo'),
  { ssr: false, loading: () => <DemoPlaceholder label="Loading 3D Gaussian demo..." /> }
);

const AlphaBlendingDemo = dynamic(
  () => import('../components/demos/gaussian/AlphaBlendingDemo'),
  { ssr: false, loading: () => <DemoPlaceholder label="Loading alpha blending demo..." /> }
);

const SphericalHarmonicsDemo = dynamic(
  () => import('../components/demos/gaussian/SphericalHarmonicsDemo'),
  { ssr: false, loading: () => <DemoPlaceholder label="Loading spherical harmonics demo..." /> }
);

const MatrixTransformDemo = dynamic(
  () => import('../components/demos/gaussian/MatrixTransformDemo'),
  { ssr: false, loading: () => <DemoPlaceholder label="Loading matrix transform demo..." /> }
);

const CovarianceShapeDemo = dynamic(
  () => import('../components/demos/gaussian/CovarianceShapeDemo'),
  { ssr: false, loading: () => <DemoPlaceholder label="Loading covariance shape demo..." /> }
);

const TrainingProgressDemo = dynamic(
  () => import('../components/demos/gaussian/TrainingProgressDemo'),
  { ssr: false, loading: () => <DemoPlaceholder label="Loading training progress demo..." /> }
);

const DifferentiableRenderingDemo = dynamic(
  () => import('../components/demos/gaussian/DifferentiableRenderingDemo'),
  { ssr: false, loading: () => <DemoPlaceholder label="Loading differentiable rendering demo..." /> }
);

const PointCloudDemo = dynamic(
  () => import('../components/demos/gaussian/PointCloudDemo'),
  { ssr: false, loading: () => <DemoPlaceholder label="Loading point cloud demo..." /> }
);

const TileRasterizationDemo = dynamic(
  () => import('../components/demos/gaussian/TileRasterizationDemo'),
  { ssr: false, loading: () => <DemoPlaceholder label="Loading tile rasterization demo..." /> }
);

const AdaptiveDensityDemo = dynamic(
  () => import('../components/demos/gaussian/AdaptiveDensityDemo'),
  { ssr: false, loading: () => <DemoPlaceholder label="Loading adaptive density demo..." /> }
);

const DepthSortingDemo = dynamic(
  () => import('../components/demos/gaussian/DepthSortingDemo'),
  { ssr: false, loading: () => <DemoPlaceholder label="Loading depth sorting demo..." /> }
);

function DemoPlaceholder({ label }: { label: string }) {
  return (
    <div className="h-[300px] bg-[var(--surface-2)] rounded-lg flex items-center justify-center text-[var(--text-muted)]">
      {label}
    </div>
  );
}

const sections = [
  { id: 'intro', label: 'Introduction' },
  { id: 'pipeline', label: 'Pipeline' },
  { id: 'concepts', label: 'Key Concepts' },
  { id: 'demos', label: 'Interactive Demos' },
  { id: 'implementation', label: 'Build It' },
  { id: 'tradeoffs', label: 'Trade-offs' },
  { id: 'conversation', label: 'Conversation' },
];

export default function GaussianSplattingPage() {
  const [currentSection, setCurrentSection] = useState('intro');
  const color = 'var(--color-gaussian)';

  return (
    <div>
      {/* Header */}
      <section className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
          <span className="badge">Neural 3D Rendering + Conversation</span>
          <span className="text-sm text-[var(--text-muted)]">~50 min</span>
        </div>
        <h1 className="text-3xl font-semibold mb-2">{content.title}</h1>
        <p className="text-lg text-[var(--text-muted)]">{content.subtitle}</p>
      </section>

      {/* Progress tracker */}
      <nav className="sticky top-20 z-40 bg-[var(--bg)] py-3 border-b border-[var(--border)] mb-8 -mx-6 px-6" aria-label="Section progress">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {sections.map((section, index) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              onClick={() => setCurrentSection(section.id)}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors
                ${section.id === currentSection ? 'font-medium text-white' : 'text-[var(--text-muted)] hover:text-[var(--foreground)]'}
              `}
              style={section.id === currentSection ? { backgroundColor: color } : undefined}
            >
              <span className={`
                w-5 h-5 rounded-full flex items-center justify-center text-xs
                ${section.id === currentSection ? 'bg-white/30' : 'border border-[var(--border)]'}
              `}>
                {index + 1}
              </span>
              <span className="hidden sm:inline">{section.label}</span>
            </a>
          ))}
        </div>
      </nav>

      {/* Section 1: Introduction */}
      <section id="intro" className="mb-16 scroll-mt-32">
        <h2 className="text-2xl font-semibold mb-4">What is Gaussian Splatting?</h2>

        <div className="prose prose-neutral max-w-none">
          <p className="text-lg text-[var(--text-muted)] leading-relaxed mb-6">
            {content.intro.text}
          </p>
        </div>

        {/* Quick visual */}
        <div className="highlight-box">
          <p className="font-medium mb-4">The Core Idea in 30 Seconds</p>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-[var(--surface-0)] rounded-lg">
              <div className="w-10 h-10 rounded-full bg-[var(--color-gaussian-light)] flex items-center justify-center mx-auto mb-3">
                <Circle size={24} className="text-[var(--color-gaussian)]" strokeWidth={1.5} />
              </div>
              <p className="font-medium">Millions of Fuzzy Blobs</p>
              <p className="text-sm text-[var(--text-muted)]">Each is a 3D Gaussian with position, shape, color, opacity</p>
            </div>
            <div className="p-4 bg-[var(--surface-0)] rounded-lg">
              <div className="w-10 h-10 rounded-full bg-[var(--color-gaussian-light)] flex items-center justify-center mx-auto mb-3">
                <Layers size={24} className="text-[var(--color-gaussian)]" strokeWidth={1.5} />
              </div>
              <p className="font-medium">Splat to Screen</p>
              <p className="text-sm text-[var(--text-muted)]">Project each blob to 2D, sort by depth, blend together</p>
            </div>
            <div className="p-4 bg-[var(--surface-0)] rounded-lg">
              <div className="w-10 h-10 rounded-full bg-[var(--color-gaussian-light)] flex items-center justify-center mx-auto mb-3">
                <Zap size={24} className="text-[var(--color-gaussian)]" strokeWidth={1.5} />
              </div>
              <p className="font-medium">60+ FPS</p>
              <p className="text-sm text-[var(--text-muted)]">Rasterization (not ray tracing) enables real-time speed</p>
            </div>
          </div>
        </div>

        <KeyInsight type="insight" title="Why Gaussians?">
          Unlike NeRF's implicit neural field that requires expensive ray marching, 3D Gaussians are <strong>explicit primitives</strong> that can be directly rasterized.
          This makes the representation both <InteractiveTooltip content="Each Gaussian can be independently moved, colored, or deleted without retraining">editable</InteractiveTooltip> and fast to render.
          The tradeoff? More memory usage (~1-2GB for typical scenes) compared to NeRF's compact MLP weights.
        </KeyInsight>

        {/* Mechanism Nuggets - Row 1 */}
        <h3 className="text-lg font-semibold mt-8 mb-4">Core Mechanisms</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <MechanismNugget title="Gaussian Function" description="The bell curve that defines each splat's falloff">
            <GaussianCurve />
          </MechanismNugget>

          <MechanismNugget title="Alpha Blending Math" description="How overlapping Gaussians combine colors">
            <AlphaBlendMath />
          </MechanismNugget>

          <MechanismNugget title="Covariance Matrix" description="2D ellipse shape from σx, σy, rotation">
            <CovarianceMatrixMini />
          </MechanismNugget>
        </div>

        {/* Mechanism Nuggets - Row 1b */}
        <div className="grid md:grid-cols-3 gap-4 mt-4">
          <MechanismNugget title="Matrix Transform" description="How rotation + scale create ellipsoid shapes">
            <MatrixTransformMini />
          </MechanismNugget>

          <MechanismNugget title="Point Cloud → Splats" description="Initialize Gaussians from SfM points">
            <PointCloudToSplatMini />
          </MechanismNugget>

          <MechanismNugget title="View-Dependent Color" description="Spherical harmonics encode reflections">
            <ViewDependentColorMini />
          </MechanismNugget>
        </div>

        {/* Mechanism Nuggets - Row 2 */}
        <h3 className="text-lg font-semibold mt-8 mb-4">Rendering Pipeline</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <MechanismNugget title="Depth Sorting" description="Back-to-front order for correct transparency">
            <DepthSortingMini />
          </MechanismNugget>

          <MechanismNugget title="Tile Rasterization" description="GPU-parallel screen-space rendering">
            <TileRasterizationMini />
          </MechanismNugget>

          <MechanismNugget title="Screen Projection" description="3D to 2D via perspective transform">
            <ScreenProjectionMini />
          </MechanismNugget>
        </div>

        {/* Mechanism Nuggets - Row 2b */}
        <div className="grid md:grid-cols-3 gap-4 mt-4">
          <MechanismNugget title="Frustum Culling" description="Skip Gaussians outside camera view">
            <FrustumCullingMini />
          </MechanismNugget>

          <MechanismNugget title="Z-Buffer" description="Depth testing for occlusion">
            <ZBufferMini />
          </MechanismNugget>

          <MechanismNugget title="Opacity Accumulation" description="Multiple Gaussians add up to opaque">
            <OpacityAccumulation />
          </MechanismNugget>
        </div>

        {/* Mechanism Nuggets - Row 3 */}
        <h3 className="text-lg font-semibold mt-8 mb-4">View-Dependent Effects</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <MechanismNugget title="Spherical Harmonics" description="View-dependent color encoding">
            <SphericalHarmonicsBands />
          </MechanismNugget>

          <MechanismNugget title="Noise in Training" description="Perturb positions for robustness">
            <NoiseGenerationMini />
          </MechanismNugget>
        </div>

        {/* Mechanism Nuggets - Row 4 */}
        <h3 className="text-lg font-semibold mt-8 mb-4">Training Dynamics</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <MechanismNugget title="Adaptive Density" description="Clone, split, or prune Gaussians">
            <AdaptiveDensityMini />
          </MechanismNugget>

          <MechanismNugget title="Gradient Flow" description="How backprop optimizes Gaussian params">
            <GradientFlowMini />
          </MechanismNugget>

          <MechanismNugget title="Loss Landscape" description="Optimization finds the best parameters">
            <LossLandscape />
          </MechanismNugget>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <MechanismNugget title="Backpropagation" description="Compute gradients through render pipeline">
            <BackpropagationMini />
          </MechanismNugget>
        </div>
      </section>

      <div className="divider" />

      {/* Section 2: Pipeline */}
      <section id="pipeline" className="mb-16 scroll-mt-32">
        <h2 className="text-2xl font-semibold mb-4">The Processing Pipeline</h2>
        <p className="text-[var(--text-muted)] mb-6">
          From multi-view capture to real-time rendering, here's how the data flows through the system.
        </p>

        <AnimatedDiagram
          steps={content.pipeline.steps}
          connections={content.pipeline.connections}
          color={color}
          autoPlay={true}
          intervalMs={3000}
        />
      </section>

      <div className="divider" />

      {/* Section 3: Key Concepts */}
      <section id="concepts" className="mb-16 scroll-mt-32">
        <h2 className="text-2xl font-semibold mb-4">Key Concepts</h2>
        <p className="text-[var(--text-muted)] mb-6">
          Master these five concepts and you'll understand how Gaussian Splatting works.
          Click "Go deeper" on any card to drill into the math.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {content.concepts.map((concept, index) => (
            <ConceptCard
              key={concept.id}
              id={concept.id}
              title={concept.title}
              summary={concept.summary}
              visualMetaphor={concept.visualMetaphor}
              demoId={concept.demoId}
              drillDown={concept.drillDown}
              trackId="gaussian-splatting"
              color={color}
              index={index}
            />
          ))}
        </div>
      </section>

      <div className="divider" />

      {/* Section 4: Interactive Demos */}
      <section id="demos" className="mb-16 scroll-mt-32">
        <h2 className="text-2xl font-semibold mb-4">Interactive Demos</h2>
        <p className="text-[var(--text-muted)] mb-6">
          Learn by doing. Manipulate parameters and see immediate visual feedback.
        </p>

        {/* Demo 1: Single Gaussian */}
        <DemoWrapper
          id="single-gaussian"
          title="Manipulate a Single Gaussian"
          description="Adjust position, scale, rotation, and opacity to see how each parameter affects the Gaussian's shape."
          difficulty="beginner"
          insights={[
            'Each Gaussian has 59 parameters: position (3), rotation quaternion (4), scale (3), opacity (1), color/SH (48)',
            'The covariance matrix defines the 3D ellipsoid shape',
            'Real scenes use 1-5 million Gaussians'
          ]}
          tips={[
            'Try making a flat "pancake" shape by reducing one scale axis',
            'Notice how rotation affects the ellipsoid orientation'
          ]}
          relatedConcepts={[
            { name: 'Covariance Matrix', link: '#demo-covariance-shape' },
            { name: 'Matrix Transforms', link: '#demo-matrix-transform' }
          ]}
        >
          <SingleGaussianDemo />
        </DemoWrapper>

        {/* Demo 2: Alpha Blending */}
        <DemoWrapper
          id="alpha-blending"
          title="Alpha Compositing"
          description="Drag to reorder layers and see how depth ordering affects the final blended color."
          difficulty="intermediate"
          insights={[
            'Alpha blending is NOT commutative: A over B ≠ B over A',
            '3DGS sorts Gaussians back-to-front per tile before blending',
            'The "over" operator: C_out = C_front * α + C_back * (1-α)'
          ]}
          tips={[
            'Drag layers to reorder and watch the output change',
            'Notice how semi-transparent layers reveal colors beneath'
          ]}
          relatedConcepts={[
            { name: 'Depth Sorting', link: '#demo-depth-sorting' }
          ]}
        >
          <AlphaBlendingDemo />
        </DemoWrapper>

        {/* Demo 3: Spherical Harmonics */}
        <DemoWrapper
          id="spherical-harmonics"
          title="Spherical Harmonics"
          description="Adjust SH coefficients to see how view-dependent color is encoded. This is how 3DGS captures specular highlights."
          difficulty="advanced"
          insights={[
            'SH degree 0 = constant color (diffuse only)',
            'Degree 1-3 add view-dependent effects (16 coefficients per channel = 48 total)',
            'Higher degrees capture sharper specular highlights but need more parameters'
          ]}
          tips={[
            'Start with degree 0, then add higher degrees to see the difference',
            'Move the viewpoint to see color changes with viewing angle'
          ]}
          relatedConcepts={[
            { name: 'Single Gaussian', link: '#demo-single-gaussian' }
          ]}
        >
          <SphericalHarmonicsDemo />
        </DemoWrapper>

        {/* Demo 4: Matrix Transform */}
        <div id="demo-matrix-transform" className="mb-8">
          <h3 className="text-xl font-semibold mb-3">Demo 4: Matrix Transformations</h3>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            See how scale and rotation matrices transform a unit circle into an ellipse—the foundation of Gaussian covariance.
          </p>
          <MatrixTransformDemo />
        </div>

        {/* Demo 5: Covariance Shape */}
        <div id="demo-covariance-shape" className="mb-8">
          <h3 className="text-xl font-semibold mb-3">Demo 5: 3D Covariance Shapes</h3>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            Manipulate scale along each axis to create spheres, pancakes, or needles—the building blocks of 3D Gaussian Splatting.
          </p>
          <CovarianceShapeDemo />
        </div>

        {/* Demo 6: Training Progress */}
        <div id="demo-training-progress" className="mb-8">
          <h3 className="text-xl font-semibold mb-3">Demo 6: Training Progress</h3>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            Watch how 3DGS training evolves over 30K iterations: Gaussian count, PSNR quality, and key milestones.
          </p>
          <TrainingProgressDemo />
        </div>

        {/* Demo 7: Differentiable Rendering */}
        <div id="demo-differentiable-rendering" className="mb-8">
          <h3 className="text-xl font-semibold mb-3">Demo 7: Differentiable Rendering</h3>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            See how gradients flow backward through rendering. Click to set a target - the Gaussian learns to cover it.
          </p>
          <DifferentiableRenderingDemo />
        </div>

        {/* Demo 8: Point Cloud to Gaussians */}
        <div id="demo-point-cloud" className="mb-8">
          <h3 className="text-xl font-semibold mb-3">Demo 8: Point Cloud to Gaussians</h3>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            3DGS starts from SfM point cloud and initializes Gaussians at each point. Drag to rotate, toggle to see how points become splats.
          </p>
          <PointCloudDemo />
        </div>

        {/* Demo 9: Tile-Based Rasterization */}
        <div id="demo-tile-rasterization" className="mb-8">
          <h3 className="text-xl font-semibold mb-3">Demo 9: Tile-Based Rasterization</h3>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            See how 3DGS divides the screen into tiles for parallel GPU processing. Click tiles to see which Gaussians they contain.
          </p>
          <TileRasterizationDemo />
        </div>

        {/* Demo 10: Adaptive Density Control */}
        <div id="demo-adaptive-density" className="mb-8">
          <h3 className="text-xl font-semibold mb-3">Demo 10: Adaptive Density Control</h3>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            Watch how 3DGS dynamically adjusts Gaussian count during training through densification and pruning.
          </p>
          <AdaptiveDensityDemo />
        </div>

        {/* Demo 11: Depth Sorting */}
        <div id="demo-depth-sorting" className="mb-8">
          <h3 className="text-xl font-semibold mb-3">Demo 11: Depth Sorting for Alpha Blending</h3>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            Transparent objects must be rendered back-to-front. Watch the sorting algorithm in action.
          </p>
          <DepthSortingDemo />
        </div>
      </section>

      <div className="divider" />

      {/* Section 5: Implementation */}
      <section id="implementation" className="mb-16 scroll-mt-32">
        <h2 className="text-2xl font-semibold mb-4">Build It Yourself</h2>
        <p className="text-[var(--text-muted)] mb-6">
          Get started with the official implementation. Here's a step-by-step walkthrough.
        </p>

        <h3 className="font-semibold mb-4">Traditional 3DGS (Multi-View Capture)</h3>
        <CodeWalkthrough
          steps={content.implementation.steps}
          color={color}
        />

        <div className="divider" />

        <h3 className="font-semibold mb-4">Conversational Avatar Quickstart (Docker)</h3>
        <p className="text-sm text-[var(--text-muted)] mb-4">
          Deploy a talking Gaussian avatar from a single photo using OpenAvatarChat + LAM in Docker.
          Server needs ~4-6 GB VRAM; the avatar renders client-side in the browser via WebGL.
        </p>
        <div className="space-y-3 mb-8">
          <div className="card p-4">
            <p className="font-medium text-sm mb-1">1. Clone and setup</p>
            <div className="code text-xs mt-2">cd gaussian-avatar && bash scripts/setup.sh</div>
            <p className="text-xs text-[var(--text-muted)] mt-1">Downloads models (~2 GB): wav2vec2, LAM Audio2Expression, SenseVoice ASR. Generates SSL certs for WebRTC.</p>
          </div>
          <div className="card p-4">
            <p className="font-medium text-sm mb-1">2. Add your API key</p>
            <div className="code text-xs mt-2">cp .env.example .env && nano .env</div>
            <p className="text-xs text-[var(--text-muted)] mt-1">Set <code>OPENAI_API_KEY</code> for the LLM. Or use the Ollama config for fully local operation (no keys needed).</p>
          </div>
          <div className="card p-4">
            <p className="font-medium text-sm mb-1">3. Build and run</p>
            <div className="code text-xs mt-2">docker compose up --build</div>
            <p className="text-xs text-[var(--text-muted)] mt-1">Builds the OpenAvatarChat image with CUDA 12.2 + Python 3.11, starts the avatar server + TURN relay.</p>
          </div>
          <div className="card p-4">
            <p className="font-medium text-sm mb-1">4. Open browser</p>
            <div className="code text-xs mt-2">https://localhost:8282</div>
            <p className="text-xs text-[var(--text-muted)] mt-1">Accept the self-signed cert, allow microphone access. The Gaussian avatar renders at 60+ FPS via WebGL.</p>
          </div>
          <div className="card p-4">
            <p className="font-medium text-sm mb-1">5. Custom avatar (optional)</p>
            <p className="text-xs text-[var(--text-muted)]">Generate a Gaussian avatar from any photo using LAM, export as <code>.zip</code>, and set <code>asset_path</code> in the config. Supports up to 5 concurrent sessions.</p>
          </div>
        </div>

        {/* Resources */}
        <div className="mt-8">
          <h3 className="font-semibold mb-4">Resources</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {content.implementation.resources.map((resource) => (
              <a
                key={resource.url}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="card p-4 flex items-start gap-3 hover:border-[var(--border-strong)]"
              >
                <span className="text-[var(--accent)]">
                  {resource.type === 'github' ? <Github size={18} strokeWidth={1.75} /> : <BookOpen size={18} strokeWidth={1.75} />}
                </span>
                <div>
                  <p className="font-medium text-sm">{resource.title}</p>
                  <p className="text-xs text-[var(--text-muted)]">{resource.type}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* Section 6: Trade-offs */}
      <section id="tradeoffs" className="mb-16 scroll-mt-32">
        <h2 className="text-2xl font-semibold mb-4">When to Use Gaussian Splatting</h2>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="card-alt p-5">
            <p className="font-medium mb-3 flex items-center gap-1" style={{ color: 'var(--success)' }}><Check size={16} /> Use When</p>
            <ul className="space-y-2 text-sm text-[var(--text-muted)]">
              {content.tradeoffs.when.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span style={{ color: 'var(--success)' }}>+</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="card-alt p-5">
            <p className="font-medium mb-3 flex items-center gap-1" style={{ color: 'var(--error)' }}><X size={16} /> Avoid When</p>
            <ul className="space-y-2 text-sm text-[var(--text-muted)]">
              {content.tradeoffs.whenNot.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span style={{ color: 'var(--error)' }}>−</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="highlight-box">
          <p className="font-medium mb-2">Best Use Case</p>
          <p className="text-[var(--text-muted)]">{content.tradeoffs.bestFor}</p>
        </div>
      </section>

      {/* Common Misconceptions */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-4">Common Misconceptions</h2>
        <div className="space-y-4">
          {content.misconceptions.map((item, i) => (
            <div key={i} className="card p-4">
              <p className="text-sm">
                <span className="line-through" style={{ color: 'var(--error)' }}>{item.wrong}</span>
              </p>
              <p className="text-sm mt-2">
                <span className="font-medium" style={{ color: 'var(--success)' }}>Actually:</span>{' '}
                <span className="text-[var(--text-muted)]">{item.correct}</span>
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 7: Conversational Avatars */}
      <section id="conversation" className="mb-16 scroll-mt-32">
        <h2 className="text-2xl font-semibold mb-4">Real-Time Conversation with Gaussian Avatars</h2>
        <p className="text-[var(--text-muted)] mb-6">
          One-shot models and conversational pipelines have transformed Gaussian splatting from a static
          capture technique into a viable real-time conversation platform.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="card-alt p-5">
            <p className="font-medium mb-3">Traditional Path</p>
            <ul className="space-y-2 text-sm text-[var(--text-muted)]">
              <li className="flex items-start gap-2">
                <span className="text-[var(--text-muted)]">1.</span>
                Multi-view video capture (50-200 images)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--text-muted)]">2.</span>
                Per-subject optimization (2-8 hours)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--text-muted)]">3.</span>
                Rig with FLAME/blendshape driver
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--text-muted)]">4.</span>
                Deploy with custom rendering server
              </li>
            </ul>
          </div>
          <div className="card-alt p-5" style={{ borderColor: 'var(--color-gaussian)' }}>
            <p className="font-medium mb-3" style={{ color: 'var(--color-gaussian)' }}>One-Shot Path (2025+)</p>
            <ul className="space-y-2 text-sm text-[var(--text-muted)]">
              <li className="flex items-start gap-2">
                <span style={{ color: 'var(--color-gaussian)' }}>1.</span>
                Single face photo as input
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: 'var(--color-gaussian)' }}>2.</span>
                LAM generates animatable avatar in seconds
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: 'var(--color-gaussian)' }}>3.</span>
                Audio2Expression maps speech to blendshapes
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: 'var(--color-gaussian)' }}>4.</span>
                WebGL/WebGPU renders in browser, no server GPU for rendering
              </li>
            </ul>
          </div>
        </div>

        <KeyInsight type="insight" title="The Conversation Pipeline">
          OpenAvatarChat combines SileroVAD, SenseVoice ASR, an OpenAI-compatible LLM, EdgeTTS (or CosyVoice),
          and LAM Audio2Expression into a single pipeline driving a Gaussian avatar. The server needs only
          ~4-6 GB VRAM while the browser renders the 3D avatar at 60+ FPS via WebGL. End-to-end latency:
          ~2.2s on RTX 4090. Supports 5+ concurrent sessions. Deploy with Docker. All Apache 2.0 licensed.
        </KeyInsight>

        <div className="card p-5 mt-6">
          <p className="font-medium mb-3">Architecture: Browser + Server Split</p>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-[var(--surface-2)] rounded">
              <p className="font-medium text-[var(--foreground)] mb-1">Browser (Client)</p>
              <p className="text-[var(--text-muted)]">
                LAM WebRender (WebGL) renders the 3D Gaussian avatar locally at 60-563 FPS.
                52 ARKit blendshape coefficients arrive via WebSocket. No GPU needed on client.
              </p>
            </div>
            <div className="p-3 bg-[var(--surface-2)] rounded">
              <p className="font-medium text-[var(--foreground)] mb-1">Server (Docker + GPU)</p>
              <p className="text-[var(--text-muted)]">
                SileroVAD detects speech, SenseVoice transcribes, LLM generates response,
                TTS synthesizes audio, Audio2Expression maps to ARKit blendshapes. Deploy via <code className="text-xs">docker compose up</code>.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* Next Steps */}
      <section>
        <div className="card p-6 text-center">
          <h3 className="font-semibold mb-2">Ready to Go Deeper?</h3>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            Explore the math behind each concept, build a conversational avatar, or compare approaches.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/learn/gaussian-splatting/concepts/covariance-matrix"
              className="badge hover:border-[var(--border-strong)]"
            >
              Dive into Covariance Matrix →
            </Link>
            <Link
              href="/learn/end-to-end"
              className="badge hover:border-[var(--border-strong)]"
            >
              End-to-End Pipeline →
            </Link>
            <Link
              href="/learn"
              className="badge hover:border-[var(--border-strong)]"
            >
              Compare All Methods
            </Link>
          </div>
        </div>
      </section>

      <CrossTrackNav currentTrack="gaussian-splatting" />
    </div>
  );
}
