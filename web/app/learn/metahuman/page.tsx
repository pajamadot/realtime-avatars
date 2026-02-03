'use client';

import { useState } from 'react';
import Link from 'next/link';
import content from '../data/content/metahuman.json';
import { ConceptCard, AnimatedDiagram, CodeWalkthrough, CrossTrackNav } from '../components/core';
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

  return (
    <div>
      {/* Header */}
      <section className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
          <span className="badge">Graphics-based</span>
          <span className="text-sm text-[var(--muted)]">~30 min</span>
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
        <h2 className="text-2xl font-semibold mb-4">What is MetaHuman?</h2>

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
              <div className="text-3xl mb-2">🦴</div>
              <p className="font-medium">Skeletal Rig</p>
              <p className="text-sm text-[var(--muted)]">700+ bones control mesh deformation hierarchically</p>
            </div>
            <div className="p-4 bg-[var(--card-bg)] rounded">
              <div className="text-3xl mb-2">😊</div>
              <p className="font-medium">52 Blendshapes</p>
              <p className="text-sm text-[var(--muted)]">ARKit standard for facial expressions at 60 FPS</p>
            </div>
            <div className="p-4 bg-[var(--card-bg)] rounded">
              <div className="text-3xl mb-2">📱</div>
              <p className="font-medium">Live Link</p>
              <p className="text-sm text-[var(--muted)]">iPhone face tracking streams directly to UE5</p>
            </div>
          </div>
        </div>

        {/* Puppet metaphor */}
        <div className="card p-6 mt-6">
          <h3 className="font-semibold mb-3">The Marionette Metaphor</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-[var(--card-bg-alt)] rounded">
              <div className="text-4xl mb-2">🎭</div>
              <p className="text-sm font-medium">Bones</p>
              <p className="text-xs text-[var(--muted)]">Wooden crossbars</p>
            </div>
            <div className="text-center p-4 bg-[var(--card-bg-alt)] rounded">
              <div className="text-4xl mb-2">🔗</div>
              <p className="text-sm font-medium">Joints</p>
              <p className="text-xs text-[var(--muted)]">Strings connecting bars</p>
            </div>
            <div className="text-center p-4 bg-[var(--card-bg-alt)] rounded">
              <div className="text-4xl mb-2">👕</div>
              <p className="text-sm font-medium">Mesh</p>
              <p className="text-xs text-[var(--muted)]">Puppet's cloth/skin</p>
            </div>
            <div className="text-center p-4 bg-[var(--card-bg-alt)] rounded">
              <div className="text-4xl mb-2">✨</div>
              <p className="text-sm font-medium">Blendshapes</p>
              <p className="text-xs text-[var(--muted)]">Facial expressions overlay</p>
            </div>
          </div>
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
        <p className="text-[var(--muted)] mb-6">
          From iPhone face tracking to rendered MetaHuman, here's how data flows.
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
        <p className="text-[var(--muted)] mb-6">
          Set up MetaHuman with Live Link face tracking in Unreal Engine 5.
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
                  {resource.type === 'github' ? '📦' : '📖'}
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
        <h2 className="text-2xl font-semibold mb-4">When to Use MetaHuman</h2>

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

      {/* Next Steps */}
      <section>
        <div className="card p-6 text-center">
          <h3 className="font-semibold mb-2">Ready to Go Deeper?</h3>
          <p className="text-sm text-[var(--muted)] mb-4">
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
