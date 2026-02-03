'use client';

import { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import content from '../data/content/gaussian-splatting.json';
import { ConceptCard, AnimatedDiagram, CodeWalkthrough, CrossTrackNav, KeyInsight, DemoWrapper, InteractiveTooltip, MechanismNugget,
  AlphaBlendMath, GaussianCurve, MatrixTransformMini, DepthSortingMini, TileRasterizationMini,
  ScreenProjectionMini, OpacityAccumulation, SphericalHarmonicsBands, GradientFlowMini, AdaptiveDensityMini
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
    <div className="h-[300px] bg-[var(--card-bg-alt)] rounded-lg flex items-center justify-center text-[var(--muted)]">
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
          <span className="badge">Neural 3D Rendering</span>
          <span className="text-sm text-[var(--muted)]">~45 min</span>
        </div>
        <h1 className="text-3xl font-semibold mb-2">{content.title}</h1>
        <p className="text-lg text-[var(--muted)]">{content.subtitle}</p>
      </section>

      {/* Progress tracker */}
      <nav className="sticky top-20 z-40 bg-[var(--bg)] py-3 border-b border-[var(--border)] mb-8 -mx-6 px-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {sections.map((section, index) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              onClick={() => setCurrentSection(section.id)}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors
                ${section.id === currentSection ? 'font-medium text-white' : 'text-[var(--muted)] hover:text-[var(--foreground)]'}
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
          <p className="text-lg text-[var(--muted)] leading-relaxed mb-6">
            {content.intro.text}
          </p>
        </div>

        {/* Quick visual */}
        <div className="highlight-box">
          <p className="font-medium mb-4">The Core Idea in 30 Seconds</p>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-[var(--card-bg)] rounded">
              <div className="text-3xl mb-2">🔵</div>
              <p className="font-medium">Millions of Fuzzy Blobs</p>
              <p className="text-sm text-[var(--muted)]">Each is a 3D Gaussian with position, shape, color, opacity</p>
            </div>
            <div className="p-4 bg-[var(--card-bg)] rounded">
              <div className="text-3xl mb-2">📽️</div>
              <p className="font-medium">Splat to Screen</p>
              <p className="text-sm text-[var(--muted)]">Project each blob to 2D, sort by depth, blend together</p>
            </div>
            <div className="p-4 bg-[var(--card-bg)] rounded">
              <div className="text-3xl mb-2">⚡</div>
              <p className="font-medium">60+ FPS</p>
              <p className="text-sm text-[var(--muted)]">Rasterization (not ray tracing) enables real-time speed</p>
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

          <MechanismNugget title="Matrix Transform" description="How rotation + scale create ellipsoid shapes">
            <MatrixTransformMini />
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

        {/* Mechanism Nuggets - Row 3 */}
        <h3 className="text-lg font-semibold mt-8 mb-4">Advanced Concepts</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <MechanismNugget title="Opacity Accumulation" description="Multiple Gaussians add up to opaque">
            <OpacityAccumulation />
          </MechanismNugget>

          <MechanismNugget title="Spherical Harmonics" description="View-dependent color encoding">
            <SphericalHarmonicsBands />
          </MechanismNugget>

          <MechanismNugget title="Gradient Flow" description="How backprop optimizes Gaussian params">
            <GradientFlowMini />
          </MechanismNugget>
        </div>

        {/* Mechanism Nuggets - Row 4 */}
        <h3 className="text-lg font-semibold mt-8 mb-4">Training Dynamics</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <MechanismNugget title="Adaptive Density" description="Clone, split, or prune Gaussians">
            <AdaptiveDensityMini />
          </MechanismNugget>
        </div>
      </section>

      <div className="divider" />

      {/* Section 2: Pipeline */}
      <section id="pipeline" className="mb-16 scroll-mt-32">
        <h2 className="text-2xl font-semibold mb-4">The Processing Pipeline</h2>
        <p className="text-[var(--muted)] mb-6">
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
        <p className="text-[var(--muted)] mb-6">
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
        <p className="text-[var(--muted)] mb-6">
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
          <p className="text-sm text-[var(--muted)] mb-4">
            See how scale and rotation matrices transform a unit circle into an ellipse—the foundation of Gaussian covariance.
          </p>
          <MatrixTransformDemo />
        </div>

        {/* Demo 5: Covariance Shape */}
        <div id="demo-covariance-shape" className="mb-8">
          <h3 className="text-xl font-semibold mb-3">Demo 5: 3D Covariance Shapes</h3>
          <p className="text-sm text-[var(--muted)] mb-4">
            Manipulate scale along each axis to create spheres, pancakes, or needles—the building blocks of 3D Gaussian Splatting.
          </p>
          <CovarianceShapeDemo />
        </div>

        {/* Demo 6: Training Progress */}
        <div id="demo-training-progress" className="mb-8">
          <h3 className="text-xl font-semibold mb-3">Demo 6: Training Progress</h3>
          <p className="text-sm text-[var(--muted)] mb-4">
            Watch how 3DGS training evolves over 30K iterations: Gaussian count, PSNR quality, and key milestones.
          </p>
          <TrainingProgressDemo />
        </div>

        {/* Demo 7: Differentiable Rendering */}
        <div id="demo-differentiable-rendering" className="mb-8">
          <h3 className="text-xl font-semibold mb-3">Demo 7: Differentiable Rendering</h3>
          <p className="text-sm text-[var(--muted)] mb-4">
            See how gradients flow backward through rendering. Click to set a target - the Gaussian learns to cover it.
          </p>
          <DifferentiableRenderingDemo />
        </div>

        {/* Demo 8: Point Cloud to Gaussians */}
        <div id="demo-point-cloud" className="mb-8">
          <h3 className="text-xl font-semibold mb-3">Demo 8: Point Cloud to Gaussians</h3>
          <p className="text-sm text-[var(--muted)] mb-4">
            3DGS starts from SfM point cloud and initializes Gaussians at each point. Drag to rotate, toggle to see how points become splats.
          </p>
          <PointCloudDemo />
        </div>

        {/* Demo 9: Tile-Based Rasterization */}
        <div id="demo-tile-rasterization" className="mb-8">
          <h3 className="text-xl font-semibold mb-3">Demo 9: Tile-Based Rasterization</h3>
          <p className="text-sm text-[var(--muted)] mb-4">
            See how 3DGS divides the screen into tiles for parallel GPU processing. Click tiles to see which Gaussians they contain.
          </p>
          <TileRasterizationDemo />
        </div>

        {/* Demo 10: Adaptive Density Control */}
        <div id="demo-adaptive-density" className="mb-8">
          <h3 className="text-xl font-semibold mb-3">Demo 10: Adaptive Density Control</h3>
          <p className="text-sm text-[var(--muted)] mb-4">
            Watch how 3DGS dynamically adjusts Gaussian count during training through densification and pruning.
          </p>
          <AdaptiveDensityDemo />
        </div>

        {/* Demo 11: Depth Sorting */}
        <div id="demo-depth-sorting" className="mb-8">
          <h3 className="text-xl font-semibold mb-3">Demo 11: Depth Sorting for Alpha Blending</h3>
          <p className="text-sm text-[var(--muted)] mb-4">
            Transparent objects must be rendered back-to-front. Watch the sorting algorithm in action.
          </p>
          <DepthSortingDemo />
        </div>
      </section>

      <div className="divider" />

      {/* Section 5: Implementation */}
      <section id="implementation" className="mb-16 scroll-mt-32">
        <h2 className="text-2xl font-semibold mb-4">Build It Yourself</h2>
        <p className="text-[var(--muted)] mb-6">
          Get started with the official implementation. Here's a step-by-step walkthrough.
        </p>

        <CodeWalkthrough
          steps={content.implementation.steps}
          color={color}
        />

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
                  {resource.type === 'github' ? '📦' : resource.type === 'paper' ? '📄' : '📖'}
                </span>
                <div>
                  <p className="font-medium text-sm">{resource.title}</p>
                  <p className="text-xs text-[var(--muted)]">{resource.type}</p>
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
            <p className="font-medium mb-3 text-green-600">✓ Use When</p>
            <ul className="space-y-2 text-sm text-[var(--muted)]">
              {content.tradeoffs.when.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-green-500">+</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="card-alt p-5">
            <p className="font-medium mb-3 text-red-600">✗ Avoid When</p>
            <ul className="space-y-2 text-sm text-[var(--muted)]">
              {content.tradeoffs.whenNot.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-red-500">−</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="highlight-box">
          <p className="font-medium mb-2">Best Use Case</p>
          <p className="text-[var(--muted)]">{content.tradeoffs.bestFor}</p>
        </div>
      </section>

      {/* Common Misconceptions */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-4">Common Misconceptions</h2>
        <div className="space-y-4">
          {content.misconceptions.map((item, i) => (
            <div key={i} className="card p-4">
              <p className="text-sm">
                <span className="text-red-500 line-through">{item.wrong}</span>
              </p>
              <p className="text-sm mt-2">
                <span className="text-green-600 font-medium">Actually:</span>{' '}
                <span className="text-[var(--muted)]">{item.correct}</span>
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Next Steps */}
      <section>
        <div className="card p-6 text-center">
          <h3 className="font-semibold mb-2">Ready to Go Deeper?</h3>
          <p className="text-sm text-[var(--muted)] mb-4">
            Explore the math behind each concept, or see how Gaussian Splatting compares to other approaches.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/learn/gaussian-splatting/concepts/covariance-matrix"
              className="badge hover:border-[var(--border-strong)]"
            >
              Dive into Covariance Matrix →
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
