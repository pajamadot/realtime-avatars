'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bone, Smile, Smartphone, Palette, Link2, Shirt, Sparkles, Github, BookOpen, Check, X } from 'lucide-react';
import content from '../data/content/metahuman.json';
import { ConceptCard, AnimatedDiagram, CodeWalkthrough, CrossTrackNav, KeyInsight, InteractiveTooltip, MechanismNugget,
  BoneHierarchyMini, BlendshapeInterpolation, SkinningWeightsMini, FKvsIKMini, LODMini, FACSMini, WrinkleMapMini,
  BoneTransformMini, MorphTargetMini, JointLimitsMini, QuaternionMini, InterpolationMini,
  NormalMappingMini, PBRMaterialMini, AmbientOcclusionMini, PhonemeVisemeMini, LipSyncWeightsMini,
  MelSpectrogramMini, AudioEnvelopeMini
} from '../components/core';
import { BlendshapeDemo, SkinningWeightDemo, FaceTrackingDemo, AudioToExpressionDemo, BoneHierarchyDemo, BlendshapeMixerDemo, InverseKinematicsDemo, LODDemo, WrinkleMapDemo, CorrectiveBlendshapesDemo, JointConstraintsDemo, EyeGazeDemo, HairSimulationDemo, SecondaryMotionDemo, MuscleSystemDemo } from '../components/demos/metahuman';

const sections = [
  { id: 'intro', label: 'Introduction' },
  { id: 'pipeline', label: 'Pipeline' },
  { id: 'concepts', label: 'Key Concepts' },
  { id: 'implementation', label: 'Build It' },
  { id: 'tradeoffs', label: 'Trade-offs' },
];

export default function MetaHumanPage() {
  const [currentSection, setCurrentSection] = useState('intro');
  const color = 'var(--color-metahuman)';
  const evolverSignals = [
    'Cycle 11 scan: 12 plugins, 70 modules, 2898 source files, 248 internal module edges.',
    'Hub plugins: MetaHumanAnimator (28 modules), MetaHumanCoreTechLib (5), MetaHumanLiveLink (7).',
    'Official watch: 5/5 Epic MetaHuman docs endpoints reachable in latest cycle.',
  ];
  const dependencySignals = [
    'MetaHumanAnimator -> MetaHumanCoreTechLib (35)',
    'MetaHumanAnimator -> RigLogic (8)',
    'MetaHumanCharacter -> MetaHumanSDK (10)',
    'MetaHumanLiveLink -> MetaHumanCoreTechLib (9)',
  ];

  return (
    <div>
      {/* Header */}
      <section className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
          <span className="badge">Graphics-based</span>
          <span className="text-sm text-[var(--text-muted)]">~30 min</span>
        </div>
        <h1 className="text-3xl font-semibold mb-2">{content.title}</h1>
        <p className="text-lg text-[var(--text-muted)]">{content.subtitle}</p>
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
        <h2 className="text-2xl font-semibold mb-4">What is MetaHuman?</h2>

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
              <div className="w-10 h-10 rounded-full bg-[var(--color-metahuman-light)] flex items-center justify-center mx-auto mb-3">
                <Bone size={24} className="text-[var(--color-metahuman)]" strokeWidth={1.5} />
              </div>
              <p className="font-medium">Skeletal Rig</p>
              <p className="text-sm text-[var(--text-muted)]">700+ bones control mesh deformation hierarchically</p>
            </div>
            <div className="p-4 bg-[var(--surface-0)] rounded-lg">
              <div className="w-10 h-10 rounded-full bg-[var(--color-metahuman-light)] flex items-center justify-center mx-auto mb-3">
                <Smile size={24} className="text-[var(--color-metahuman)]" strokeWidth={1.5} />
              </div>
              <p className="font-medium">52 Blendshapes</p>
              <p className="text-sm text-[var(--text-muted)]">ARKit standard for facial expressions at 60 FPS</p>
            </div>
            <div className="p-4 bg-[var(--surface-0)] rounded-lg">
              <div className="w-10 h-10 rounded-full bg-[var(--color-metahuman-light)] flex items-center justify-center mx-auto mb-3">
                <Smartphone size={24} className="text-[var(--color-metahuman)]" strokeWidth={1.5} />
              </div>
              <p className="font-medium">Live Link</p>
              <p className="text-sm text-[var(--text-muted)]">iPhone face tracking streams directly to UE5</p>
            </div>
          </div>
        </div>

        {/* Puppet metaphor */}
        <div className="card p-6 mt-6">
          <h3 className="font-semibold mb-3">The Marionette Metaphor</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-[var(--surface-2)] rounded-lg">
              <div className="w-10 h-10 rounded-full bg-[var(--surface-0)] flex items-center justify-center mx-auto mb-2">
                <Palette size={20} className="text-[var(--color-metahuman)]" strokeWidth={1.5} />
              </div>
              <p className="text-sm font-medium">Bones</p>
              <p className="text-xs text-[var(--text-muted)]">Wooden crossbars</p>
            </div>
            <div className="text-center p-4 bg-[var(--surface-2)] rounded-lg">
              <div className="w-10 h-10 rounded-full bg-[var(--surface-0)] flex items-center justify-center mx-auto mb-2">
                <Link2 size={20} className="text-[var(--color-metahuman)]" strokeWidth={1.5} />
              </div>
              <p className="text-sm font-medium">Joints</p>
              <p className="text-xs text-[var(--text-muted)]">Strings connecting bars</p>
            </div>
            <div className="text-center p-4 bg-[var(--surface-2)] rounded-lg">
              <div className="w-10 h-10 rounded-full bg-[var(--surface-0)] flex items-center justify-center mx-auto mb-2">
                <Shirt size={20} className="text-[var(--color-metahuman)]" strokeWidth={1.5} />
              </div>
              <p className="text-sm font-medium">Mesh</p>
              <p className="text-xs text-[var(--text-muted)]">Puppet&apos;s cloth/skin</p>
            </div>
            <div className="text-center p-4 bg-[var(--surface-2)] rounded-lg">
              <div className="w-10 h-10 rounded-full bg-[var(--surface-0)] flex items-center justify-center mx-auto mb-2">
                <Sparkles size={20} className="text-[var(--color-metahuman)]" strokeWidth={1.5} />
              </div>
              <p className="text-sm font-medium">Blendshapes</p>
              <p className="text-xs text-[var(--text-muted)]">Facial expressions overlay</p>
            </div>
          </div>
        </div>

        <KeyInsight type="insight" title="Why Traditional Graphics?">
          MetaHuman uses <InteractiveTooltip content="Triangles, bones, and blendshapes - the same tech used in games for 30+ years">classical graphics techniques</InteractiveTooltip> rather than neural rendering.
          This means <strong>predictable performance</strong> (always 60 FPS on target hardware), <strong>full artistic control</strong> (every parameter is adjustable),
          and <strong>no training required</strong>. The tradeoff is the need for expensive motion capture or manual animation.
        </KeyInsight>

        {/* Mechanism Nuggets - Skeletal Animation */}
        <h3 className="text-lg font-semibold mt-8 mb-4">Skeletal Animation</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <MechanismNugget title="Bone Hierarchy" description="Child bones inherit parent transforms">
            <BoneHierarchyMini />
          </MechanismNugget>

          <MechanismNugget title="Skinning Weights" description="Vertices follow bones based on weight">
            <SkinningWeightsMini />
          </MechanismNugget>

          <MechanismNugget title="FK vs IK" description="Forward vs Inverse Kinematics">
            <FKvsIKMini />
          </MechanismNugget>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mt-4">
          <MechanismNugget title="Bone Transforms" description="Rotation propagation down chain">
            <BoneTransformMini />
          </MechanismNugget>

          <MechanismNugget title="Joint Limits" description="Angle constraints prevent bad poses">
            <JointLimitsMini />
          </MechanismNugget>

          <MechanismNugget title="Quaternion Rotation" description="Smooth interpolation without gimbal lock">
            <QuaternionMini />
          </MechanismNugget>
        </div>

        {/* Mechanism Nuggets - Facial Animation */}
        <h3 className="text-lg font-semibold mt-8 mb-4">Facial Animation</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <MechanismNugget title="Blendshape Interpolation" description="Linear blend between stored poses">
            <BlendshapeInterpolation />
          </MechanismNugget>

          <MechanismNugget title="FACS Action Units" description="Anatomical facial muscle controls">
            <FACSMini />
          </MechanismNugget>

          <MechanismNugget title="Morph Targets" description="Combine multiple deformations">
            <MorphTargetMini />
          </MechanismNugget>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mt-4">
          <MechanismNugget title="Wrinkle Maps" description="Dynamic skin detail based on expression">
            <WrinkleMapMini />
          </MechanismNugget>

          <MechanismNugget title="Phoneme to Viseme" description="Audio phonemes map to mouth shapes">
            <PhonemeVisemeMini />
          </MechanismNugget>

          <MechanismNugget title="Lip Sync Weights" description="Blendshape weights per viseme">
            <LipSyncWeightsMini />
          </MechanismNugget>
        </div>

        {/* Mechanism Nuggets - Audio Processing */}
        <h3 className="text-lg font-semibold mt-8 mb-4">Audio to Animation</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <MechanismNugget title="Mel Spectrogram" description="Frequency-time representation">
            <MelSpectrogramMini />
          </MechanismNugget>

          <MechanismNugget title="Audio Envelope" description="Amplitude over time for lip sync">
            <AudioEnvelopeMini />
          </MechanismNugget>
        </div>

        {/* Mechanism Nuggets - Materials */}
        <h3 className="text-lg font-semibold mt-8 mb-4">Realistic Materials</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <MechanismNugget title="PBR Materials" description="Physically-based roughness/metallic">
            <PBRMaterialMini />
          </MechanismNugget>

          <MechanismNugget title="Normal Mapping" description="Surface detail without geometry">
            <NormalMappingMini />
          </MechanismNugget>

          <MechanismNugget title="Ambient Occlusion" description="Soft contact shadows">
            <AmbientOcclusionMini />
          </MechanismNugget>
        </div>

        {/* Mechanism Nuggets - Optimization */}
        <h3 className="text-lg font-semibold mt-8 mb-4">Performance Optimization</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <MechanismNugget title="LOD Switching" description="Detail level based on camera distance">
            <LODMini />
          </MechanismNugget>

          <MechanismNugget title="Interpolation Types" description="Linear, ease, step transitions">
            <InterpolationMini />
          </MechanismNugget>
        </div>

        {/* Interactive Demo */}
        <div className="mt-8">
          <BlendshapeDemo />
        </div>

        {/* Skinning Demo */}
        <div className="mt-8">
          <SkinningWeightDemo />
        </div>

        {/* Face Tracking Demo */}
        <div className="mt-8">
          <FaceTrackingDemo />
        </div>

        {/* Audio to Expression Demo */}
        <div className="mt-8">
          <AudioToExpressionDemo />
        </div>

        {/* Bone Hierarchy Demo */}
        <div className="mt-8">
          <BoneHierarchyDemo />
        </div>

        {/* Blendshape Mixer Demo */}
        <div className="mt-8">
          <BlendshapeMixerDemo />
        </div>

        {/* Inverse Kinematics Demo */}
        <div className="mt-8">
          <InverseKinematicsDemo />
        </div>

        {/* LOD Demo */}
        <div className="mt-8">
          <LODDemo />
        </div>

        {/* Wrinkle Map Demo */}
        <div className="mt-8">
          <WrinkleMapDemo />
        </div>

        {/* Corrective Blendshapes Demo */}
        <div className="mt-8">
          <CorrectiveBlendshapesDemo />
        </div>

        {/* Joint Constraints Demo */}
        <div className="mt-8">
          <JointConstraintsDemo />
        </div>

        {/* Eye Gaze Demo */}
        <div className="mt-8">
          <EyeGazeDemo />
        </div>

        {/* Hair Simulation Demo */}
        <div className="mt-8">
          <HairSimulationDemo />
        </div>

        {/* Secondary Motion Demo */}
        <div className="mt-8">
          <SecondaryMotionDemo />
        </div>

        {/* Muscle System Demo */}
        <div className="mt-8">
          <MuscleSystemDemo />
        </div>
      </section>

      <div className="divider" />

      {/* Section 2: Pipeline */}
      <section id="pipeline" className="mb-16 scroll-mt-32">
        <h2 className="text-2xl font-semibold mb-4">The Animation Pipeline</h2>
        <p className="text-[var(--text-muted)] mb-6">
          Refined with metahuman-evolver output from Unreal Engine 5.7 source scans.
        </p>

        <AnimatedDiagram
          steps={content.pipeline.steps}
          connections={content.pipeline.connections}
          color={color}
          autoPlay={true}
          intervalMs={3000}
        />

        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <div className="card p-4">
            <h3 className="font-semibold mb-2">Dependency Hot Paths</h3>
            <ul className="space-y-1 text-sm text-[var(--text-muted)]">
              {dependencySignals.map((signal) => (
                <li key={signal}>{signal}</li>
              ))}
              <li>Top module hubs: MetaHumanCoreTech (20), MetaHumanCore (19), RigLogicModule (15)</li>
            </ul>
          </div>

          <div className="card p-4">
            <h3 className="font-semibold mb-2">Evolver Signals</h3>
            <ul className="space-y-1 text-sm text-[var(--text-muted)]">
              {evolverSignals.map((signal) => (
                <li key={signal}>{signal}</li>
              ))}
              <li>One-line docs include tracker model tags: hyprface-0.1.4 and wav2face-0.0.10.</li>
            </ul>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* Section 3: Key Concepts */}
      <section id="concepts" className="mb-16 scroll-mt-32">
        <h2 className="text-2xl font-semibold mb-4">Key Concepts</h2>
        <p className="text-[var(--text-muted)] mb-6">
          Master these five building blocks of the MetaHuman system.
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
              trackId="metahuman"
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
        <p className="text-[var(--text-muted)] mb-6">
          Set up MetaHuman with Live Link face tracking in Unreal Engine 5.
        </p>

        <CodeWalkthrough
          steps={content.implementation.steps}
          color={color}
        />

        {/* Resources */}
        <div className="mt-8">
          <h3 className="font-semibold mb-4">Resources</h3>
          <div className="card p-4 mb-3">
            <p className="font-medium text-sm mb-1">Complete UE 5.7 Architecture Dossier</p>
            <p className="text-xs text-[var(--text-muted)] mb-2">
              Full module-by-module implementation map spanning this repo, the UE source tree, and official Epic docs.
            </p>
            <Link href="/learn/metahuman/architecture" className="badge hover:border-[var(--border-strong)]">
              Open architecture documentation
            </Link>
          </div>
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
                  {resource.type === 'github' ? <Github size={18} /> : <BookOpen size={18} />}
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

      {/* Section 5: Trade-offs */}
      <section id="tradeoffs" className="mb-16 scroll-mt-32">
        <h2 className="text-2xl font-semibold mb-4">When to Use MetaHuman</h2>

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
            </ul>
          </div>
          <div className="card-alt p-5">
            <p className="font-medium mb-3 text-red-600 flex items-center gap-1"><X size={16} /> Avoid When</p>
            <ul className="space-y-2 text-sm text-[var(--text-muted)]">
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

      {/* Live Demo */}
      <section className="mb-8">
        <div className="card p-6">
          <h3 className="font-semibold mb-2">See MetaHuman in Action</h3>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            Try a real-time MetaHuman avatar powered by Unreal Engine pixel streaming.
            Cloud-rendered on GPU and delivered to your browser via WebRTC.
          </p>
          <Link
            href="/rapport"
            className="badge hover:border-[var(--border-strong)]"
          >
            Launch Rapport Demo →
          </Link>
        </div>
      </section>

      {/* Next Steps */}
      <section>
        <div className="card p-6 text-center">
          <h3 className="font-semibold mb-2">Ready to Go Deeper?</h3>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            Explore ARKit blendshapes or see how MetaHuman compares to other approaches.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/learn/metahuman/concepts/arkit-blendshapes"
              className="badge hover:border-[var(--border-strong)]"
            >
              Explore ARKit Blendshapes →
            </Link>
            <Link
              href="/learn/metahuman/architecture"
              className="badge hover:border-[var(--border-strong)]"
            >
              Full architecture docs
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

      <CrossTrackNav currentTrack="metahuman" />
    </div>
  );
}
