'use client';

import { useState } from 'react';
import Link from 'next/link';
import content from '../data/content/generative-video.json';
import { ConceptCard, AnimatedDiagram, CodeWalkthrough, CrossTrackNav } from '../components/core';
import { DenoisingDemo, DiffusionStepsDemo, LatentSpaceDemo, LipSyncPlaygroundDemo, IdentityLockDemo, CrossAttentionDemo, UNetArchitectureDemo, NoiseScheduleDemo, CFGStrengthDemo, TemporalConsistencyDemo, SamplerComparisonDemo, FaceEncoderDemo, VAEDemo, MotionFieldDemo } from '../components/demos/generative';
import { ConvolutionDemo, ActivationFunctionsDemo, BackpropagationDemo, PoolingLayerDemo, DropoutDemo } from '../components/demos/fundamentals';
import { GradientDescentDemo, NeuralNetworkDemo } from '../components/demos/fundamentals';

const sections = [
  { id: 'intro', label: 'Introduction' },
  { id: 'pipeline', label: 'Pipeline' },
  { id: 'concepts', label: 'Key Concepts' },
  { id: 'implementation', label: 'Build It' },
  { id: 'tradeoffs', label: 'Trade-offs' },
];

export default function GenerativeVideoPage() {
  const [currentSection, setCurrentSection] = useState('intro');
  const color = 'var(--color-generative)';

  return (
    <div>
      {/* Header */}
      <section className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
          <span className="badge">Diffusion / Transformer</span>
          <span className="text-sm text-[var(--muted)]">~60 min</span>
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
        <h2 className="text-2xl font-semibold mb-4">What is Generative Video?</h2>

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
              <div className="text-3xl mb-2">📺</div>
              <p className="font-medium">Add Noise → Learn to Reverse</p>
              <p className="text-sm text-[var(--muted)]">Train on clear→noisy, generate noisy→clear</p>
            </div>
            <div className="p-4 bg-[var(--card-bg)] rounded">
              <div className="text-3xl mb-2">🎤</div>
              <p className="font-medium">Audio Drives Motion</p>
              <p className="text-sm text-[var(--muted)]">Sound patterns map to mouth shapes automatically</p>
            </div>
            <div className="p-4 bg-[var(--card-bg)] rounded">
              <div className="text-3xl mb-2">🖼️</div>
              <p className="font-medium">One Photo → Any Voice</p>
              <p className="text-sm text-[var(--muted)]">No per-person training, works on any face</p>
            </div>
          </div>
        </div>

        {/* Sculpture metaphor */}
        <div className="card p-6 mt-6">
          <h3 className="font-semibold mb-3">The Marble Sculpture Metaphor</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-[var(--card-bg-alt)] rounded">
              <div className="text-4xl mb-2">🗿</div>
              <p className="text-sm font-medium">1. Perfect Sculpture</p>
              <p className="text-xs text-[var(--muted)]">Start with a clear image</p>
            </div>
            <div className="text-center p-4 bg-[var(--card-bg-alt)] rounded">
              <div className="text-4xl mb-2">🪨</div>
              <p className="text-sm font-medium">2. Sandpaper 1000x</p>
              <p className="text-xs text-[var(--muted)]">Add noise until unrecognizable</p>
            </div>
            <div className="text-center p-4 bg-[var(--card-bg-alt)] rounded">
              <div className="text-4xl mb-2">👨‍🎨</div>
              <p className="text-sm font-medium">3. Train Restorer</p>
              <p className="text-xs text-[var(--muted)]">Learn to undo one stroke</p>
            </div>
            <div className="text-center p-4 bg-[var(--card-bg-alt)] rounded">
              <div className="text-4xl mb-2">✨</div>
              <p className="text-sm font-medium">4. Generate</p>
              <p className="text-xs text-[var(--muted)]">Rough block → sculpture emerges</p>
            </div>
          </div>
        </div>

        {/* Interactive Demo */}
        <div className="mt-8">
          <DenoisingDemo />
        </div>

        {/* Steps Comparison Demo */}
        <div className="mt-8">
          <DiffusionStepsDemo />
        </div>

        {/* Latent Space Demo */}
        <div className="mt-8">
          <LatentSpaceDemo />
        </div>

        {/* Lip Sync Demo */}
        <div className="mt-8">
          <LipSyncPlaygroundDemo />
        </div>

        {/* Identity Lock Demo */}
        <div className="mt-8">
          <IdentityLockDemo />
        </div>

        {/* Gradient Descent Demo - Fundamental */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-3">How Neural Networks Learn</h3>
          <p className="text-sm text-[var(--muted)] mb-4">
            Diffusion models learn to denoise through gradient descent. This fundamental algorithm drives all deep learning.
          </p>
          <GradientDescentDemo />
        </div>

        {/* Neural Network Demo - Fundamental */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-3">Neural Network Forward Pass</h3>
          <p className="text-sm text-[var(--muted)] mb-4">
            Watch data flow through layers of neurons. This is the basic building block of diffusion models and face encoders.
          </p>
          <NeuralNetworkDemo />
        </div>

        {/* U-Net Architecture Demo */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-3">U-Net Architecture</h3>
          <p className="text-sm text-[var(--muted)] mb-4">
            The U-Net is the denoising backbone of Stable Diffusion. Explore its encoder-decoder structure with skip connections.
          </p>
          <UNetArchitectureDemo />
        </div>

        {/* Cross-Attention Demo */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-3">Cross-Attention Mechanism</h3>
          <p className="text-sm text-[var(--muted)] mb-4">
            See how audio tokens guide which parts of the image to modify. This is how the model knows to move the mouth when speaking.
          </p>
          <CrossAttentionDemo />
        </div>

        {/* Noise Schedule Demo */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-3">Noise Schedule Comparison</h3>
          <p className="text-sm text-[var(--muted)] mb-4">
            Different schedules control how quickly noise is added/removed. The schedule significantly affects generation quality and speed.
          </p>
          <NoiseScheduleDemo />
        </div>

        {/* CFG Strength Demo */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-3">Classifier-Free Guidance</h3>
          <p className="text-sm text-[var(--muted)] mb-4">
            CFG controls how strongly the model follows conditioning. Too low = blurry, too high = artifacts. Find the sweet spot.
          </p>
          <CFGStrengthDemo />
        </div>

        {/* Temporal Consistency Demo */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-3">Temporal Consistency</h3>
          <p className="text-sm text-[var(--muted)] mb-4">
            Video generation requires frame-to-frame coherence. Compare raw output vs temporally smoothed output.
          </p>
          <TemporalConsistencyDemo />
        </div>

        {/* Convolution Demo - Fundamental */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-3">Convolution Operation</h3>
          <p className="text-sm text-[var(--muted)] mb-4">
            The fundamental operation behind CNNs. Watch how kernels slide over images to extract features for face encoding.
          </p>
          <ConvolutionDemo />
        </div>

        {/* Sampler Comparison Demo */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-3">Sampler Comparison</h3>
          <p className="text-sm text-[var(--muted)] mb-4">
            Compare DDPM, DDIM, Euler, and DPM++ samplers. See how modern samplers achieve quality in 20 steps vs 1000.
          </p>
          <SamplerComparisonDemo />
        </div>

        {/* Face Encoder Demo */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-3">Face Encoder Architecture</h3>
          <p className="text-sm text-[var(--muted)] mb-4">
            See how face encoders extract identity, expression, and pose into a compact latent code for conditioning.
          </p>
          <FaceEncoderDemo />
        </div>

        {/* Activation Functions Demo */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-3">Activation Functions</h3>
          <p className="text-sm text-[var(--muted)] mb-4">
            Explore ReLU, Sigmoid, Tanh, and GELU - the non-linearities that enable neural networks to learn.
          </p>
          <ActivationFunctionsDemo />
        </div>

        {/* Backpropagation Demo */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-3">Backpropagation</h3>
          <p className="text-sm text-[var(--muted)] mb-4">
            Watch the training algorithm in action: forward pass, backward pass, and weight updates.
          </p>
          <BackpropagationDemo />
        </div>

        {/* Pooling Layers Demo */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-3">Pooling Layers</h3>
          <p className="text-sm text-[var(--muted)] mb-4">
            Pooling reduces spatial dimensions while preserving important features. Essential for building efficient encoders.
          </p>
          <PoolingLayerDemo />
        </div>

        {/* VAE Demo */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-3">Variational Autoencoder (VAE)</h3>
          <p className="text-sm text-[var(--muted)] mb-4">
            Stable Diffusion operates in VAE latent space. Understand how images are compressed and reconstructed.
          </p>
          <VAEDemo />
        </div>

        {/* Motion Field Demo */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-3">Motion Field (Optical Flow)</h3>
          <p className="text-sm text-[var(--muted)] mb-4">
            Visualize per-pixel motion vectors. Motion fields help video models understand and predict movement patterns.
          </p>
          <MotionFieldDemo />
        </div>

        {/* Dropout Demo */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-3">Dropout Regularization</h3>
          <p className="text-sm text-[var(--muted)] mb-4">
            Prevent overfitting by randomly deactivating neurons during training. Watch the network learn redundant representations.
          </p>
          <DropoutDemo />
        </div>
      </section>

      <div className="divider" />

      {/* Section 2: Pipeline */}
      <section id="pipeline" className="mb-16 scroll-mt-32">
        <h2 className="text-2xl font-semibold mb-4">The Generation Pipeline</h2>
        <p className="text-[var(--muted)] mb-6">
          Audio comes in, identity reference is extracted, and through iterative denoising,
          a photorealistic talking video emerges.
        </p>

        <AnimatedDiagram
          steps={content.pipeline.steps}
          connections={content.pipeline.connections}
          color={color}
          autoPlay={true}
          intervalMs={3000}
        />

        {/* Architecture note */}
        <div className="research-note mt-6">
          <p className="font-medium mb-2">Key Architectural Insight</p>
          <p className="text-sm text-[var(--muted)]">
            The magic happens in the U-Net or Transformer denoiser, which receives conditioning
            from both the audio (what motion to generate) and the reference image (what identity
            to preserve). Cross-attention layers let these signals guide the denoising process.
          </p>
        </div>
      </section>

      <div className="divider" />

      {/* Section 3: Key Concepts */}
      <section id="concepts" className="mb-16 scroll-mt-32">
        <h2 className="text-2xl font-semibold mb-4">Key Concepts</h2>
        <p className="text-[var(--muted)] mb-6">
          Understanding these five pillars will give you a complete mental model of how
          diffusion-based talking heads work.
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
              trackId="generative-video"
              color={color}
              index={index}
            />
          ))}
        </div>
      </section>

      <div className="divider" />

      {/* Section 4: Implementation */}
      <section id="implementation" className="mb-16 scroll-mt-32">
        <h2 className="text-2xl font-semibold mb-4">Build It Yourself</h2>
        <p className="text-[var(--muted)] mb-6">
          Start with SadTalker for quick results, then explore more advanced options.
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

      {/* Section 5: Trade-offs */}
      <section id="tradeoffs" className="mb-16 scroll-mt-32">
        <h2 className="text-2xl font-semibold mb-4">When to Use Generative Video</h2>

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

      {/* Misconceptions */}
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

      {/* Comparison */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-4">Approaches Comparison</h2>
        <div className="overflow-x-auto">
          <table className="research-table">
            <thead>
              <tr>
                <th>Approach</th>
                <th>Method</th>
                <th>Example</th>
                <th>Best For</th>
              </tr>
            </thead>
            <tbody>
              {content.avatarApplications.approaches.map((approach) => (
                <tr key={approach.name}>
                  <td className="font-medium">{approach.name}</td>
                  <td className="text-[var(--muted)]">{approach.description}</td>
                  <td>{approach.example}</td>
                  <td className="text-[var(--muted)]">
                    {approach.name === '2D Warping' && 'Quick prototypes'}
                    {approach.name === '3DMM-based' && 'Controllable animation'}
                    {approach.name === 'NeRF-based' && 'Multi-view synthesis'}
                    {approach.name === 'Full Diffusion' && 'Maximum quality'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Next Steps */}
      <section>
        <div className="card p-6 text-center">
          <h3 className="font-semibold mb-2">Ready to Go Deeper?</h3>
          <p className="text-sm text-[var(--muted)] mb-4">
            Explore the math behind diffusion, or see how this compares to other avatar approaches.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/learn/generative-video/concepts/diffusion-math"
              className="badge hover:border-[var(--border-strong)]"
            >
              Dive into Diffusion Math →
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

      <CrossTrackNav currentTrack="generative-video" />
    </div>
  );
}
