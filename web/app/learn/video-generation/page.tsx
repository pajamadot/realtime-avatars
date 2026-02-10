'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Monitor, Mic, Image, Box, Layers, Paintbrush, Sparkles, Github, BookOpen, FileText, Check, X,
  Globe, Drama, Smartphone, Video, Eye,
} from 'lucide-react';
import content from '../data/content/generative-video.json';
import { ConceptCard, AnimatedDiagram, CodeWalkthrough, CrossTrackNav, KeyInsight, InteractiveTooltip, MechanismNugget,
  DiffusionNoiseLevels, GaussianCurve, UNetSkipMini, AttentionHeatmapMini, VAELatentMini, CFGStrengthMini,
  NoiseScheduleMini, TemporalConsistencyMini, NeuronMini, ActivationFunctionsMini, ConvolutionMini,
  PoolingMini, DropoutMini, LossLandscape, LearningRateMini, BatchNormMini,
  SamplingMethodMini, TextEmbeddingMini, CFGScaleMini, SoftmaxMini, EmbeddingSpaceMini,
  PositionalEncodingMini, ResidualConnectionMini, LayerNormMini, MultiHeadAttentionMini,
  BackpropagationMini, AttentionMechanismMini, OverfittingMini, VanishingGradientMini
} from '../components/core';
import { DenoisingDemo, DiffusionStepsDemo, LatentSpaceDemo, LipSyncPlaygroundDemo, IdentityLockDemo, CrossAttentionDemo, UNetArchitectureDemo, NoiseScheduleDemo, CFGStrengthDemo, TemporalConsistencyDemo, SamplerComparisonDemo, FaceEncoderDemo, VAEDemo, MotionFieldDemo, AttentionMechanismDemo, EmbeddingSpaceDemo } from '../components/demos/generative';
import { LatencyDemo, ProviderComparisonDemo, SFUComparisonDemo } from '../components/demos/streaming';
import { ConvolutionDemo, ActivationFunctionsDemo, BackpropagationDemo, PoolingLayerDemo, DropoutDemo, BatchNormalizationDemo, LossFunctionDemo } from '../components/demos/fundamentals';
import { GradientDescentDemo, NeuralNetworkDemo } from '../components/demos/fundamentals';

const sections = [
  { id: 'intro', label: 'Introduction' },
  { id: 'pipeline', label: 'Pipeline' },
  { id: 'concepts', label: 'Key Concepts' },
  { id: 'providers', label: 'Providers' },
  { id: 'implementation', label: 'Build It' },
  { id: 'tradeoffs', label: 'Trade-offs' },
];

export default function VideoGenerationPage() {
  const [currentSection, setCurrentSection] = useState('intro');
  const color = 'var(--color-generative)';

  return (
    <div>
      {/* Header */}
      <section className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
          <span className="badge">Diffusion / Streaming</span>
          <span className="text-sm text-[var(--text-muted)]">~60 min</span>
        </div>
        <h1 className="text-3xl font-semibold mb-2">Video Generation</h1>
        <p className="text-lg text-[var(--text-muted)]">Diffusion-based synthesis and streaming avatar infrastructure for real-time talking heads</p>
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
        <h2 className="text-2xl font-semibold mb-4">What is Video Generation?</h2>

        <div className="prose prose-neutral max-w-none">
          <p className="text-lg text-[var(--text-muted)] leading-relaxed mb-6">
            Video generation encompasses two complementary sides of real-time talking heads:
            <strong> diffusion-based synthesis</strong> (creating photorealistic video from noise and conditioning signals)
            and <strong>streaming infrastructure</strong> (delivering that video to users in real time via WebRTC and cloud providers).
            Together, they form a complete pipeline from a single reference photo to a live, interactive avatar on any device.
          </p>
        </div>

        {/* Quick visual */}
        <div className="highlight-box">
          <p className="font-medium mb-4">The Core Idea in 30 Seconds</p>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-[var(--surface-0)] rounded">
              <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-[var(--color-generative-light)] flex items-center justify-center">
                <Monitor size={24} className="text-[var(--color-generative)]" />
              </div>
              <p className="font-medium">Add Noise, Learn to Reverse</p>
              <p className="text-sm text-[var(--text-muted)]">Train on clear-to-noisy, generate noisy-to-clear</p>
            </div>
            <div className="p-4 bg-[var(--surface-0)] rounded">
              <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-[var(--color-generative-light)] flex items-center justify-center">
                <Mic size={24} className="text-[var(--color-generative)]" />
              </div>
              <p className="font-medium">Audio Drives Motion</p>
              <p className="text-sm text-[var(--text-muted)]">Sound patterns map to mouth shapes automatically</p>
            </div>
            <div className="p-4 bg-[var(--surface-0)] rounded">
              <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-[var(--color-generative-light)] flex items-center justify-center">
                <Globe size={24} className="text-[var(--color-generative)]" />
              </div>
              <p className="font-medium">Stream to Any Device</p>
              <p className="text-sm text-[var(--text-muted)]">WebRTC delivers video in real time, no plugins needed</p>
            </div>
          </div>
        </div>

        {/* Sculpture metaphor */}
        <div className="card p-6 mt-6">
          <h3 className="font-semibold mb-3">The Marble Sculpture Metaphor</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-[var(--surface-2)] rounded">
              <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-[var(--color-generative-light)] flex items-center justify-center">
                <Box size={24} className="text-[var(--color-generative)]" />
              </div>
              <p className="text-sm font-medium">1. Perfect Sculpture</p>
              <p className="text-xs text-[var(--text-muted)]">Start with a clear image</p>
            </div>
            <div className="text-center p-4 bg-[var(--surface-2)] rounded">
              <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-[var(--color-generative-light)] flex items-center justify-center">
                <Layers size={24} className="text-[var(--color-generative)]" />
              </div>
              <p className="text-sm font-medium">2. Sandpaper 1000x</p>
              <p className="text-xs text-[var(--text-muted)]">Add noise until unrecognizable</p>
            </div>
            <div className="text-center p-4 bg-[var(--surface-2)] rounded">
              <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-[var(--color-generative-light)] flex items-center justify-center">
                <Paintbrush size={24} className="text-[var(--color-generative)]" />
              </div>
              <p className="text-sm font-medium">3. Train Restorer</p>
              <p className="text-xs text-[var(--text-muted)]">Learn to undo one stroke</p>
            </div>
            <div className="text-center p-4 bg-[var(--surface-2)] rounded">
              <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-[var(--color-generative-light)] flex items-center justify-center">
                <Sparkles size={24} className="text-[var(--color-generative)]" />
              </div>
              <p className="text-sm font-medium">4. Generate</p>
              <p className="text-xs text-[var(--text-muted)]">Rough block, sculpture emerges</p>
            </div>
          </div>
        </div>

        <KeyInsight type="insight" title="The Power of Diffusion">
          Unlike GANs which learn to generate in a single shot, diffusion models <InteractiveTooltip content="Breaking down generation into many small denoising steps">iteratively refine</InteractiveTooltip> their output.
          This makes training <strong>more stable</strong> (no mode collapse) and generation <strong>more controllable</strong> (you can guide each step).
          The cost? Generation requires 20-50 network passes instead of just one, making real-time video challenging.
        </KeyInsight>

        {/* Mechanism Nuggets - Diffusion Core */}
        <h3 className="text-lg font-semibold mt-8 mb-4">Diffusion Fundamentals</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <MechanismNugget title="Noise Levels" description="Forward adds noise, reverse removes it">
            <DiffusionNoiseLevels />
          </MechanismNugget>

          <MechanismNugget title="Gaussian Noise" description="Bell curve distribution for noise">
            <GaussianCurve />
          </MechanismNugget>

          <MechanismNugget title="Noise Schedule" description="Linear vs cosine noise timing">
            <NoiseScheduleMini />
          </MechanismNugget>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mt-4">
          <MechanismNugget title="DDPM vs DDIM" description="Stochastic vs deterministic sampling">
            <SamplingMethodMini />
          </MechanismNugget>

          <MechanismNugget title="Text Embeddings" description="Prompt to vector representation">
            <TextEmbeddingMini />
          </MechanismNugget>

          <MechanismNugget title="CFG Scale Effect" description="Prompt adherence strength">
            <CFGScaleMini />
          </MechanismNugget>
        </div>

        {/* Mechanism Nuggets - Architecture */}
        <h3 className="text-lg font-semibold mt-8 mb-4">Model Architecture</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <MechanismNugget title="U-Net Skip Connections" description="Encoder-decoder with shortcuts">
            <UNetSkipMini />
          </MechanismNugget>

          <MechanismNugget title="VAE Latent Space" description="Compress/decompress images">
            <VAELatentMini />
          </MechanismNugget>

          <MechanismNugget title="Residual Connections" description="Skip connections for gradient flow">
            <ResidualConnectionMini />
          </MechanismNugget>
        </div>

        {/* Mechanism Nuggets - Attention */}
        <h3 className="text-lg font-semibold mt-8 mb-4">Attention Mechanisms</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <MechanismNugget title="Attention Heatmap" description="Where the model focuses">
            <AttentionHeatmapMini />
          </MechanismNugget>

          <MechanismNugget title="Multi-Head Attention" description="Parallel attention patterns">
            <MultiHeadAttentionMini />
          </MechanismNugget>

          <MechanismNugget title="Attention Q*K" description="Query-key dot product similarity">
            <AttentionMechanismMini />
          </MechanismNugget>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mt-4">
          <MechanismNugget title="Positional Encoding" description="Position info in transformers">
            <PositionalEncodingMini />
          </MechanismNugget>

          <MechanismNugget title="Layer Normalization" description="Stabilize transformer training">
            <LayerNormMini />
          </MechanismNugget>

          <MechanismNugget title="Softmax" description="Attention weight normalization">
            <SoftmaxMini />
          </MechanismNugget>
        </div>

        {/* Mechanism Nuggets - Generation Control */}
        <h3 className="text-lg font-semibold mt-8 mb-4">Generation Control</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <MechanismNugget title="CFG Strength" description="Conditioning guidance scale">
            <CFGStrengthMini />
          </MechanismNugget>

          <MechanismNugget title="Temporal Consistency" description="Frame-to-frame stability">
            <TemporalConsistencyMini />
          </MechanismNugget>

          <MechanismNugget title="Embedding Space" description="Semantic word clustering">
            <EmbeddingSpaceMini />
          </MechanismNugget>
        </div>

        {/* Mechanism Nuggets - Neural Network Basics */}
        <h3 className="text-lg font-semibold mt-8 mb-4">Neural Network Basics</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <MechanismNugget title="Single Neuron" description="Weighted sum + activation">
            <NeuronMini />
          </MechanismNugget>

          <MechanismNugget title="Activation Functions" description="ReLU, Sigmoid, Tanh">
            <ActivationFunctionsMini />
          </MechanismNugget>

          <MechanismNugget title="Convolution Kernel" description="Edge/blur/sharpen filters">
            <ConvolutionMini />
          </MechanismNugget>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mt-4">
          <MechanismNugget title="Pooling Layers" description="Max/Avg downsampling">
            <PoolingMini />
          </MechanismNugget>

          <MechanismNugget title="Dropout" description="Regularization by random deactivation">
            <DropoutMini />
          </MechanismNugget>

          <MechanismNugget title="Batch Normalization" description="Normalize layer outputs">
            <BatchNormMini />
          </MechanismNugget>
        </div>

        {/* Mechanism Nuggets - Training */}
        <h3 className="text-lg font-semibold mt-8 mb-4">Training Dynamics</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <MechanismNugget title="Loss Landscape" description="Optimization surface">
            <LossLandscape />
          </MechanismNugget>

          <MechanismNugget title="Learning Rate" description="Step size affects convergence">
            <LearningRateMini />
          </MechanismNugget>

          <MechanismNugget title="Backpropagation" description="Gradient computation through layers">
            <BackpropagationMini />
          </MechanismNugget>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <MechanismNugget title="Overfitting" description="Train vs validation loss divergence">
            <OverfittingMini />
          </MechanismNugget>

          <MechanismNugget title="Vanishing Gradient" description="Gradient decay in deep networks">
            <VanishingGradientMini />
          </MechanismNugget>
        </div>

        {/* Interactive Demos */}
        <div className="mt-8">
          <DenoisingDemo />
        </div>

        <div className="mt-8">
          <DiffusionStepsDemo />
        </div>

        <div className="mt-8">
          <LatentSpaceDemo />
        </div>

        <div className="mt-8">
          <LipSyncPlaygroundDemo />
        </div>

        <div className="mt-8">
          <IdentityLockDemo />
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-3">How Neural Networks Learn</h3>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            Diffusion models learn to denoise through gradient descent. This fundamental algorithm drives all deep learning.
          </p>
          <GradientDescentDemo />
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-3">Neural Network Forward Pass</h3>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            Watch data flow through layers of neurons. This is the basic building block of diffusion models and face encoders.
          </p>
          <NeuralNetworkDemo />
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-3">U-Net Architecture</h3>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            The U-Net is the denoising backbone of Stable Diffusion. Explore its encoder-decoder structure with skip connections.
          </p>
          <UNetArchitectureDemo />
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-3">Cross-Attention Mechanism</h3>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            See how audio tokens guide which parts of the image to modify. This is how the model knows to move the mouth when speaking.
          </p>
          <CrossAttentionDemo />
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-3">Noise Schedule Comparison</h3>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            Different schedules control how quickly noise is added/removed. The schedule significantly affects generation quality and speed.
          </p>
          <NoiseScheduleDemo />
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-3">Classifier-Free Guidance</h3>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            CFG controls how strongly the model follows conditioning. Too low = blurry, too high = artifacts. Find the sweet spot.
          </p>
          <CFGStrengthDemo />
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-3">Temporal Consistency</h3>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            Video generation requires frame-to-frame coherence. Compare raw output vs temporally smoothed output.
          </p>
          <TemporalConsistencyDemo />
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-3">Convolution Operation</h3>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            The fundamental operation behind CNNs. Watch how kernels slide over images to extract features for face encoding.
          </p>
          <ConvolutionDemo />
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-3">Sampler Comparison</h3>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            Compare DDPM, DDIM, Euler, and DPM++ samplers. See how modern samplers achieve quality in 20 steps vs 1000.
          </p>
          <SamplerComparisonDemo />
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-3">Face Encoder Architecture</h3>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            See how face encoders extract identity, expression, and pose into a compact latent code for conditioning.
          </p>
          <FaceEncoderDemo />
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-3">Activation Functions</h3>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            Explore ReLU, Sigmoid, Tanh, and GELU - the non-linearities that enable neural networks to learn.
          </p>
          <ActivationFunctionsDemo />
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-3">Backpropagation</h3>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            Watch the training algorithm in action: forward pass, backward pass, and weight updates.
          </p>
          <BackpropagationDemo />
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-3">Pooling Layers</h3>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            Pooling reduces spatial dimensions while preserving important features. Essential for building efficient encoders.
          </p>
          <PoolingLayerDemo />
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-3">Variational Autoencoder (VAE)</h3>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            Stable Diffusion operates in VAE latent space. Understand how images are compressed and reconstructed.
          </p>
          <VAEDemo />
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-3">Motion Field (Optical Flow)</h3>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            Visualize per-pixel motion vectors. Motion fields help video models understand and predict movement patterns.
          </p>
          <MotionFieldDemo />
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-3">Dropout Regularization</h3>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            Prevent overfitting by randomly deactivating neurons during training. Watch the network learn redundant representations.
          </p>
          <DropoutDemo />
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-3">Batch Normalization</h3>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            Normalize activations to stabilize training. See how BatchNorm transforms the distribution of layer outputs.
          </p>
          <BatchNormalizationDemo />
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-3">Attention Mechanism</h3>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            Explore self-attention and cross-attention. These mechanisms allow models to focus on relevant parts of the input.
          </p>
          <AttentionMechanismDemo />
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-3">Loss Functions</h3>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            Loss functions measure prediction errors. Compare MSE, MAE, BCE, and Huber loss for different training scenarios.
          </p>
          <LossFunctionDemo />
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-3">Embedding Space</h3>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            Explore how neural networks learn meaningful vector representations. Similar concepts cluster together in embedding space.
          </p>
          <EmbeddingSpaceDemo />
        </div>
      </section>

      <div className="divider" />

      {/* Section 2: Pipeline */}
      <section id="pipeline" className="mb-16 scroll-mt-32">
        <h2 className="text-2xl font-semibold mb-4">The Generation Pipeline</h2>
        <p className="text-[var(--text-muted)] mb-6">
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
          <p className="text-sm text-[var(--text-muted)]">
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
        <p className="text-[var(--text-muted)] mb-6">
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
              trackId="video-generation"
              color={color}
              index={index}
            />
          ))}
        </div>
      </section>

      <div className="divider" />

      {/* Section 4: Providers & Streaming */}
      <section id="providers" className="mb-16 scroll-mt-32">
        <h2 className="text-2xl font-semibold mb-4">Providers & Streaming Infrastructure</h2>
        <p className="text-[var(--text-muted)] mb-6">
          Generative video models produce the frames, but delivering them to users requires
          real-time streaming infrastructure. Avatar providers bundle generation with
          WebRTC delivery so you can integrate via API.
        </p>

        {/* Puppeteer metaphor */}
        <div className="card p-6 mb-8">
          <h3 className="font-semibold mb-3">The Puppeteer Metaphor</h3>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            Avatar providers are like puppeteers hidden behind the stage. You send them audio (the script),
            they perform the show (generate video). The audience only sees the puppet, never the puppeteer.
          </p>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-[var(--surface-2)] rounded">
              <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-[var(--color-generative-light)] flex items-center justify-center">
                <Mic size={24} className="text-[var(--color-generative)]" />
              </div>
              <p className="text-sm font-medium">Your Audio</p>
              <p className="text-xs text-[var(--text-muted)]">The script</p>
            </div>
            <div className="text-center p-4 bg-[var(--surface-2)] rounded">
              <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-[var(--color-generative-light)] flex items-center justify-center">
                <Drama size={24} className="text-[var(--color-generative)]" />
              </div>
              <p className="text-sm font-medium">Avatar Provider</p>
              <p className="text-xs text-[var(--text-muted)]">The hidden puppeteer</p>
            </div>
            <div className="text-center p-4 bg-[var(--surface-2)] rounded">
              <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-[var(--color-generative-light)] flex items-center justify-center">
                <Video size={24} className="text-[var(--color-generative)]" />
              </div>
              <p className="text-sm font-medium">Video Stream</p>
              <p className="text-xs text-[var(--text-muted)]">The performance</p>
            </div>
            <div className="text-center p-4 bg-[var(--surface-2)] rounded">
              <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-[var(--color-generative-light)] flex items-center justify-center">
                <Eye size={24} className="text-[var(--color-generative)]" />
              </div>
              <p className="text-sm font-medium">Your User</p>
              <p className="text-xs text-[var(--text-muted)]">The audience</p>
            </div>
          </div>
        </div>

        <KeyInsight type="insight" title="Latency is Everything">
          In conversational AI, <InteractiveTooltip content="Speech-to-Text + LLM reasoning + Text-to-Speech + Avatar generation + Network round-trip">total latency</InteractiveTooltip> determines user experience.
          Above <strong>500ms</strong> feels sluggish, above <strong>1 second</strong> feels broken. Streaming avatars must balance quality vs speed:
          faster generation often means lower quality, and network conditions add unpredictable delays.
        </KeyInsight>

        {/* WebRTC / LiveKit overview */}
        <div className="card p-6 mt-8 mb-8">
          <h3 className="font-semibold mb-3">WebRTC & LiveKit Architecture</h3>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            WebRTC enables peer-to-peer encrypted media transport directly in the browser.
            LiveKit adds a Selective Forwarding Unit (SFU) for scalable multi-party rooms,
            plus server-side agent infrastructure for connecting AI pipelines (STT, LLM, TTS, Avatar)
            to the media stream.
          </p>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-[var(--surface-2)] rounded">
              <p className="font-medium mb-1">ICE / STUN / TURN</p>
              <p className="text-xs text-[var(--text-muted)]">NAT traversal for peer connectivity</p>
            </div>
            <div className="p-3 bg-[var(--surface-2)] rounded">
              <p className="font-medium mb-1">SFU (Selective Forwarding)</p>
              <p className="text-xs text-[var(--text-muted)]">Server relays media without decoding</p>
            </div>
            <div className="p-3 bg-[var(--surface-2)] rounded">
              <p className="font-medium mb-1">LiveKit Agents</p>
              <p className="text-xs text-[var(--text-muted)]">Server-side AI pipeline participants</p>
            </div>
          </div>
        </div>

        {/* Latency budget */}
        <div className="card p-5 mb-8">
          <p className="font-medium mb-4">Latency Budget (Target: ~500ms)</p>
          <div className="grid md:grid-cols-4 gap-4 text-sm">
            <div className="p-3 bg-[var(--surface-2)] rounded text-center">
              <div className="font-semibold mb-1">STT</div>
              <div className="text-[var(--text-muted)]">90-200ms</div>
            </div>
            <div className="p-3 bg-[var(--surface-2)] rounded text-center">
              <div className="font-semibold mb-1">LLM</div>
              <div className="text-[var(--text-muted)]">75-300ms</div>
            </div>
            <div className="p-3 bg-[var(--surface-2)] rounded text-center">
              <div className="font-semibold mb-1">TTS</div>
              <div className="text-[var(--text-muted)]">100-200ms</div>
            </div>
            <div className="p-3 bg-[var(--surface-2)] rounded text-center">
              <div className="font-semibold mb-1">Network</div>
              <div className="text-[var(--text-muted)]">50-100ms</div>
            </div>
          </div>
        </div>

        {/* Provider Comparison Demo */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-3">Provider Comparison</h3>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            Compare avatar providers across latency, quality, and pricing. Each takes a different approach to real-time generation.
          </p>
          <ProviderComparisonDemo />
        </div>

        {/* SFU Comparison Demo */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-3">SFU Architecture Comparison</h3>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            Understand why Selective Forwarding Units are preferred over mesh or MCU topologies for real-time avatar streaming.
          </p>
          <SFUComparisonDemo />
        </div>

        {/* Latency Demo */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-3">End-to-End Latency</h3>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            Simulate the full voice AI pipeline latency from microphone input to avatar video output.
          </p>
          <LatencyDemo />
        </div>

        {/* Try it */}
        <div className="card p-6 mt-8">
          <h3 className="font-semibold mb-2">Try the Live Demos</h3>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            Experience streaming avatars in action with two different approaches.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-[var(--surface-2)] rounded-lg">
              <p className="font-medium text-sm mb-1">LiveKit + Hedra</p>
              <p className="text-xs text-[var(--text-muted)] mb-3">Diffusion-based avatar streamed via WebRTC</p>
              <Link
                href="/livekit"
                className="badge hover:border-[var(--border-strong)]"
              >
                Launch Demo
              </Link>
            </div>
            <div className="p-4 bg-[var(--surface-2)] rounded-lg">
              <p className="font-medium text-sm mb-1">Rapport MetaHuman</p>
              <p className="text-xs text-[var(--text-muted)] mb-3">Unreal Engine pixel-streamed avatar</p>
              <Link
                href="/rapport"
                className="badge hover:border-[var(--border-strong)]"
              >
                Launch Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* Section 5: Implementation */}
      <section id="implementation" className="mb-16 scroll-mt-32">
        <h2 className="text-2xl font-semibold mb-4">Build It Yourself</h2>
        <p className="text-[var(--text-muted)] mb-6">
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
                  {resource.type === 'github' ? <Github size={18} /> : resource.type === 'paper' ? <FileText size={18} /> : <BookOpen size={18} />}
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
        <h2 className="text-2xl font-semibold mb-4">When to Use Video Generation</h2>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="card-alt p-5">
            <p className="font-medium mb-3 text-green-600 flex items-center gap-1"><Check size={16} /> Use When</p>
            <ul className="space-y-2 text-sm text-[var(--text-muted)]">
              {content.tradeoffs.when.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-green-500">+</span>
                  {item}
                </li>
              ))}
              <li className="flex items-start gap-2">
                <span className="text-green-500">+</span>
                You need to deploy to any device via WebRTC with minimal client requirements
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">+</span>
                You want a hosted provider API for fast time-to-market
              </li>
            </ul>
          </div>
          <div className="card-alt p-5">
            <p className="font-medium mb-3 text-red-600 flex items-center gap-1"><X size={16} /> Avoid When</p>
            <ul className="space-y-2 text-sm text-[var(--text-muted)]">
              {content.tradeoffs.whenNot.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-red-500">-</span>
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
                <span className="text-[var(--text-muted)]">{item.correct}</span>
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
                  <td className="text-[var(--text-muted)]">{approach.description}</td>
                  <td>{approach.example}</td>
                  <td className="text-[var(--text-muted)]">
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
          <p className="text-sm text-[var(--text-muted)] mb-4">
            Explore the math behind diffusion, or see how this compares to other avatar approaches.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/learn/video-generation/concepts/diffusion-math"
              className="badge hover:border-[var(--border-strong)]"
            >
              Dive into Diffusion Math
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

      <CrossTrackNav currentTrack="video-generation" />
    </div>
  );
}
