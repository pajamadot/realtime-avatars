'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Maximize,
  Minimize,
  Monitor,
  Video,
  Box,
  Mic,
  Clock,
  Sparkles,
  Cpu,
  Globe,
  GraduationCap,
  User,
  Gamepad2,
  Headset,
  BookOpen,
  Palette,
  Users,
  ChevronRight,
  Eye,
  Zap,
  Layers,
  Brain,
  Activity,
  Timer,
  Play,
  Github,
} from 'lucide-react';
import SlideFlow from './components/SlideFlow';

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════ */

const TOTAL_SLIDES = 29;

function clampSlideNumber(slide: number) {
  if (!Number.isFinite(slide)) return 1;
  return Math.min(TOTAL_SLIDES, Math.max(1, Math.trunc(slide)));
}

const METHOD_COLORS = {
  metahuman: '#a78bdb',
  generative: '#6ec87a',
  gaussian: '#e08840',
} as const;

const PROJECT_REPO_URL = 'https://github.com/pajamadot/realtime-avatars';
const HEDRA_AVATAR_URL = 'https://www.hedra.com/app/avatar';
const WORLDLABS_SPLAT_WORLD_URL = 'https://www.worldlabs.ai/case-studies/1-splat-world';
const WORLDLABS_MARBLE_GUIDE_URL = 'https://docs.worldlabs.ai/marble/getting-started/user-guide';
const WORLDLABS_YOUTUBE_EMBED_URL = 'https://www.youtube.com/embed/6vRUKR2Qv30';

function DemoLink({ slug, label, color }: { slug: string; label: string; color: string }) {
  return (
    <a
      href={`/slides/demos/${slug}`}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-xl border border-[#3d3a36] bg-[#1d1c1a] hover:bg-[#242220] transition-colors p-5 flex items-center gap-4"
    >
      <div
        className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}22` }}
      >
        <Play size={22} style={{ color }} />
      </div>
      <div>
        <div className="text-base font-semibold text-[#f5f2ec]">{label}</div>
        <div className="text-sm text-[#948d82]">Open interactive demo</div>
      </div>
      <ExternalLink size={16} className="ml-auto text-[#5d5a55]" />
    </a>
  );
}

function FormulaBlock({ children, color, label }: { children: React.ReactNode; color: string; label?: string }) {
  return (
    <div className="rounded-lg p-4 bg-[#181716] border border-[#3d3a36]">
      {label && (
        <div className="text-sm uppercase tracking-widest text-[#948d82] mb-2">{label}</div>
      )}
      <div className="font-mono text-center text-xl leading-relaxed" style={{ color }}>
        {children}
      </div>
    </div>
  );
}

function SlideMethodBadge({ method, label, color }: { method: string; label?: string; color: string }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
      <span className="text-sm font-semibold uppercase tracking-widest" style={{ color }}>
        {label || method}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   INDIVIDUAL SLIDE COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

function SlideTitle() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <div
        className="w-28 h-1.5 rounded-full mb-10"
        style={{ background: METHOD_COLORS.gaussian }}
      />
      <h1 className="text-7xl sm:text-8xl lg:text-9xl font-bold tracking-tight leading-[1.05] mb-8">
        Real-Time Digital Avatars:
        <br />
        <span style={{ color: METHOD_COLORS.gaussian }}>
          A Comparative Analysis
        </span>
      </h1>
      <p className="text-2xl sm:text-3xl text-[#c4bfb6] max-w-4xl mb-14">
        Three approaches to making digital humans respond in real-time
      </p>
      <div className="flex flex-col items-center gap-1.5 text-[#948d82]">
        <span className="text-2xl font-medium text-[#f5f2ec]">Yuntian Chai</span>
        <span className="text-lg">PajamaDot / Cogix</span>
        <a
          href={PROJECT_REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-2 text-base hover:underline"
          style={{ color: METHOD_COLORS.gaussian }}
        >
          <Github size={16} />
          github.com/pajamadot/realtime-avatars
        </a>
      </div>
    </div>
  );
}

function SlideAboutMe() {
  const experience = [
    { icon: Video, title: 'Hedra', period: '2024-2025', text: 'Software engineer on diffusion video pipeline implementation.', color: METHOD_COLORS.generative },
    { icon: Gamepad2, title: 'Epic Games', period: '2018-2020', text: 'Developer relations engineer for UE4/UE5 in Shanghai.', color: METHOD_COLORS.metahuman },
    { icon: Headset, title: 'UnrealLight Digital Tech', period: '2015-2017', text: 'Early-stage VR product and engineering work.', color: METHOD_COLORS.gaussian },
  ];

  const education = [
    { icon: GraduationCap, title: 'University of Pennsylvania', period: 'MCIT', text: 'Master of Computer and Information Technology.', color: '#6ec87a' },
    { icon: BookOpen, title: 'East China Normal University', period: 'M.Ed + B.S', text: 'Psychology education background.', color: '#45b7d1' },
    { icon: Palette, title: 'Sheridan College', period: 'Certificate', text: 'Visual and Creative Art and Interactive Media training.', color: METHOD_COLORS.gaussian },
  ];

  return (
    <div className="flex flex-col justify-center h-full px-12 max-w-6xl mx-auto">
      <h2 className="text-5xl font-bold mb-2">About Me</h2>
      <div className="w-14 h-1 rounded-full mb-6" style={{ background: METHOD_COLORS.gaussian }} />

      <div className="rounded-xl p-5 border border-[#3d3a36] bg-[#1d1c1a] mb-5">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(196, 113, 59, 0.15)' }}
          >
            <User size={26} style={{ color: METHOD_COLORS.gaussian }} />
          </div>
          <div>
            <h3 className="text-2xl font-semibold">Yuntian Chai</h3>
            <div className="flex items-center gap-3 mt-1 text-sm text-[#bdb8af]">
              <span className="text-[#948d82]">Working on:</span>
              <a href="https://pajamadot.com" target="_blank" rel="noopener noreferrer" className="underline decoration-dotted underline-offset-2 hover:text-[#f5f2ec]">pajamadot.com</a>
              <span className="text-[#66625d]">|</span>
              <a href="https://cogix.app" target="_blank" rel="noopener noreferrer" className="underline decoration-dotted underline-offset-2 hover:text-[#f5f2ec]">cogix.app</a>
            </div>
          </div>
          <div className="ml-auto flex flex-wrap gap-1.5">
            <span className="text-xs px-2 py-1 rounded bg-[#181716] border border-[#3d3a36] text-[#bdb8af]">CS + Psych + Art</span>
          </div>
        </div>
      </div>

      <div className="grid gap-5" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div>
          <p className="text-sm uppercase tracking-widest text-[#948d82] mb-3">Experience in 3D Digital Avatar & VR</p>
          <div className="space-y-3">
            {experience.map((entry) => (
              <div key={entry.title} className="rounded-xl p-4 border border-[#3d3a36] bg-[#181716] flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${entry.color}18` }}>
                  <entry.icon size={18} style={{ color: entry.color }} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-base font-semibold text-[#f5f2ec]">{entry.title}</p>
                    <span className="text-xs text-[#948d82] font-mono">{entry.period}</span>
                  </div>
                  <p className="text-sm text-[#bdb8af] mt-0.5">{entry.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm uppercase tracking-widest text-[#948d82] mb-3">Education</p>
          <div className="space-y-3">
            {education.map((entry) => (
              <div key={entry.title} className="rounded-xl p-4 border border-[#3d3a36] bg-[#181716] flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${entry.color}18` }}>
                  <entry.icon size={18} style={{ color: entry.color }} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-base font-semibold text-[#f5f2ec]">{entry.title}</p>
                    <span className="text-xs text-[#948d82] font-mono">{entry.period}</span>
                  </div>
                  <p className="text-sm text-[#bdb8af] mt-0.5">{entry.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SlideProblem() {
  const useCases = [
    { icon: Gamepad2, label: 'Gaming', desc: 'NPCs that react naturally' },
    { icon: Headset, label: 'Customer Service', desc: 'Empathetic virtual agents' },
    { icon: BookOpen, label: 'Education', desc: 'Personalized AI tutors' },
    { icon: Users, label: 'Telepresence', desc: 'Photorealistic remote presence' },
  ];

  return (
    <div className="flex flex-col justify-center h-full px-12 max-w-7xl mx-auto">
      <h2 className="text-5xl font-bold mb-2">Why Real-Time Avatars?</h2>
      <div
        className="w-14 h-1 rounded-full mb-8"
        style={{ background: METHOD_COLORS.gaussian }}
      />
      <div className="grid grid-cols-2 gap-6 mb-8">
        {useCases.map((uc) => (
          <div
            key={uc.label}
            className="rounded-xl p-5 border border-[#3d3a36] bg-[#1d1c1a]"
          >
            <uc.icon size={28} className="mb-3" style={{ color: METHOD_COLORS.gaussian }} />
            <h3 className="text-xl font-semibold mb-1">{uc.label}</h3>
            <p className="text-base text-[#bdb8af]">{uc.desc}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-[#3d3a36] bg-[#1d1c1a] p-5">
        <h3 className="text-xl font-semibold mb-3">The Core Challenge</h3>
        <p className="text-lg text-[#bdb8af]">
          Balance visual realism, low latency, controllability, and deployment
          cost -- no single approach dominates all four.
        </p>
      </div>
    </div>
  );
}

function SlideThreeApproaches() {
  const methods = [
    {
      name: 'MetaHuman',
      color: METHOD_COLORS.metahuman,
      icon: Monitor,
      tagline: 'Deterministic control at 60+ FPS',
      desc: 'Mesh-based rendering with blendshape animation via Unreal Engine',
    },
    {
      name: 'Video Generation',
      color: METHOD_COLORS.generative,
      icon: Video,
      tagline: 'Photorealism from a single photo',
      desc: 'Diffusion-based synthesis streamed via WebRTC providers',
    },
    {
      name: 'Gaussian Splatting',
      color: METHOD_COLORS.gaussian,
      icon: Box,
      tagline: 'Explicit 3D Gaussians at 100+ FPS',
      desc: 'Scene as anisotropic Gaussian splats, directly rasterized in real time',
    },
  ];

  return (
    <div className="flex flex-col justify-center h-full px-12 max-w-7xl mx-auto">
      <h2 className="text-5xl font-bold mb-2">Three Approaches</h2>
      <div
        className="w-14 h-1 rounded-full mb-10"
        style={{ background: METHOD_COLORS.gaussian }}
      />
      <div className="grid grid-cols-3 gap-6">
        {methods.map((m) => (
          <div
            key={m.name}
            className="rounded-xl p-6 border bg-[#1d1c1a] flex flex-col"
            style={{ borderColor: m.color }}
          >
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
              style={{ background: `${m.color}22` }}
            >
              <m.icon size={24} style={{ color: m.color }} />
            </div>
            <h3 className="text-2xl font-semibold mb-1" style={{ color: m.color }}>
              {m.name}
            </h3>
            <p className="text-base font-medium text-[#f5f2ec] mb-2">
              {m.tagline}
            </p>
            <p className="text-base text-[#948d82] mt-auto">{m.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SlideMetahumanHow() {
  return (
    <div className="flex flex-col justify-center h-full px-12 max-w-7xl mx-auto">
      <SlideMethodBadge method="MetaHuman" color={METHOD_COLORS.metahuman} />
      <h2 className="text-5xl font-bold mb-2">How It Works</h2>
      <div
        className="w-14 h-1 rounded-full mb-8"
        style={{ background: METHOD_COLORS.metahuman }}
      />

      {/* Pipeline via ReactFlow */}
      <div className="mb-8">
        <SlideFlow
          accentColor={METHOD_COLORS.metahuman}
          nodes={[
            { id: 'cam', label: 'Camera / Audio' },
            { id: 'arkit', label: 'ARKit / LiveLink' },
            { id: 'blend', label: 'Blendshapes' },
            { id: 'ue', label: 'Unreal Engine' },
            { id: 'fps', label: '60+ FPS' },
          ]}
        />
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Polygons', value: '~60K' },
          { label: 'Textures', value: '4K resolution' },
          { label: 'Blendshapes', value: '52 ARKit' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl p-5 border border-[#3d3a36] bg-[#1d1c1a] text-center"
          >
            <div className="text-4xl font-bold mb-1" style={{ color: METHOD_COLORS.metahuman }}>
              {stat.value}
            </div>
            <div className="text-sm text-[#948d82] uppercase tracking-wide">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SlideMetahumanMechanism() {
  return (
    <div className="flex flex-col justify-center h-full px-12 max-w-7xl mx-auto">
      <SlideMethodBadge method="MetaHuman" color={METHOD_COLORS.metahuman} />
      <h2 className="text-5xl font-bold mb-2">Blendshapes & Facial Rigging</h2>
      <div className="w-14 h-1 rounded-full mb-5" style={{ background: METHOD_COLORS.metahuman }} />

      {/* Formula */}
      <FormulaBlock color={METHOD_COLORS.metahuman} label="Linear Blend Model">
        <span className="text-[#f5f2ec]">f</span> = <span className="text-[#f5f2ec]">x</span>
        <sub>0</sub> + <span className="text-[#bdb8af]">&Sigma;</span>
        <sub>i=1</sub><sup>52</sup>{' '}
        <span style={{ color: METHOD_COLORS.metahuman }}>w</span>
        <sub>i</sub> &middot; <span className="text-[#f5f2ec]">B</span>
        <sub>i</sub>
      </FormulaBlock>

      <div className="grid grid-cols-2 gap-5 mt-5 items-start">
        {/* Explanation */}
        <div className="space-y-3">
          {/* Key stats row */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: '52', unit: 'blendshapes', desc: 'ARKit basis vectors' },
              { value: '60', unit: 'FPS', desc: 'tracking rate' },
              { value: '<16', unit: 'ms', desc: 'mesh deform' },
            ].map((s) => (
              <div key={s.unit} className="rounded-lg p-3 border border-[#3d3a36] bg-[#1d1c1a] text-center">
                <div className="text-2xl font-bold font-mono" style={{ color: METHOD_COLORS.metahuman }}>
                  {s.value}<span className="text-sm ml-0.5 text-[#bdb8af]">{s.unit}</span>
                </div>
                <div className="text-sm text-[#948d82] mt-0.5">{s.desc}</div>
              </div>
            ))}
          </div>

          {/* How it works */}
          <div className="rounded-xl p-4 border border-[#3d3a36] bg-[#1d1c1a] space-y-2.5">
            <div className="flex items-start gap-2.5">
              <span className="text-sm font-bold px-1.5 py-0.5 rounded mt-0.5" style={{ background: `${METHOD_COLORS.metahuman}25`, color: METHOD_COLORS.metahuman }}>B<sub>i</sub></span>
              <p className="text-base text-[#bdb8af]">Each blendshape is a <span className="text-[#f5f2ec]">vertex displacement map</span> -- a basis vector describing how the mesh deforms for one facial action unit.</p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-sm font-bold px-1.5 py-0.5 rounded mt-0.5" style={{ background: `${METHOD_COLORS.metahuman}25`, color: METHOD_COLORS.metahuman }}>w<sub>i</sub></span>
              <p className="text-base text-[#bdb8af]">Weights range <span className="font-mono text-[#f5f2ec]">[0, 1]</span>. ARKit extracts these from camera in real-time. LiveLink streams to Unreal Engine.</p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-sm font-bold px-1.5 py-0.5 rounded mt-0.5" style={{ background: `${METHOD_COLORS.metahuman}25`, color: METHOD_COLORS.metahuman }}>&Sigma;</span>
              <p className="text-base text-[#bdb8af]">Any expression = weighted sum. Try the presets in the interactive demo.</p>
            </div>
          </div>
        </div>

        {/* Demo link */}
        <DemoLink slug="blendshape" label="Blendshape Explorer" color={METHOD_COLORS.metahuman} />
      </div>
    </div>
  );
}

function SlideMetahumanDemo() {
  return (
    <div className="flex flex-col justify-center h-full px-12 max-w-7xl mx-auto">
      <SlideMethodBadge method="MetaHuman Demo" color={METHOD_COLORS.metahuman} />
      <h2 className="text-5xl font-bold mb-1">Live Demo: Rapport MetaHuman</h2>
      <p className="text-[#bdb8af] text-xl mb-6">
        Cloud-rendered Unreal Engine avatar via pixel streaming
      </p>

      <a
        href="/rapport"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-3 px-8 py-4 rounded-xl text-lg font-semibold text-white transition-all hover:scale-105"
        style={{ background: METHOD_COLORS.metahuman }}
      >
        <Monitor size={22} />
        Open Rapport Demo
        <ExternalLink size={16} />
      </a>

      <div className="flex items-center gap-2 text-xs text-[#948d82] mt-6">
        <Mic size={14} />
        <span>Requires microphone permission</span>
      </div>
    </div>
  );
}

function SlideGenerativeHow() {
  return (
    <div className="flex flex-col justify-center h-full px-12 max-w-7xl mx-auto">
      <SlideMethodBadge method="Video Generation" color={METHOD_COLORS.generative} />
      <h2 className="text-5xl font-bold mb-2">How It Works</h2>
      <div
        className="w-14 h-1 rounded-full mb-6"
        style={{ background: METHOD_COLORS.generative }}
      />

      <p className="text-[#bdb8af] mb-6 text-xl">
        Two components: diffusion models for synthesis, and streaming providers for real-time delivery.
      </p>

      {/* Pipeline via ReactFlow */}
      <div className="mb-8">
        <SlideFlow
          accentColor={METHOD_COLORS.generative}
          nodes={[
            { id: 'photo', label: 'Photo + Audio' },
            { id: 'diff', label: 'Diffusion / U-Net' },
            { id: 'decode', label: 'Decode' },
            { id: 'stream', label: 'WebRTC Stream' },
          ]}
        />
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl p-5 border border-[#3d3a36] bg-[#1d1c1a] text-center">
          <div className="text-4xl font-bold mb-1" style={{ color: METHOD_COLORS.generative }}>
            24-32 FPS
          </div>
          <div className="text-sm text-[#948d82] uppercase tracking-wide">
            With distillation
          </div>
        </div>
        <div className="rounded-xl p-5 border border-[#3d3a36] bg-[#1d1c1a] text-center">
          <div className="text-4xl font-bold mb-1" style={{ color: METHOD_COLORS.generative }}>
            {'<'}500ms
          </div>
          <div className="text-sm text-[#948d82] uppercase tracking-wide">
            E2E with Avatar Forcing
          </div>
        </div>
      </div>
    </div>
  );
}

function SlideGenerativeMechanism() {
  return (
    <div className="flex flex-col justify-center h-full px-12 max-w-7xl mx-auto">
      <SlideMethodBadge method="Video Generation" color={METHOD_COLORS.generative} />
      <h2 className="text-5xl font-bold mb-2">The Denoising Process</h2>
      <div className="w-14 h-1 rounded-full mb-5" style={{ background: METHOD_COLORS.generative }} />

      {/* DDPM reverse step formula */}
      <FormulaBlock color={METHOD_COLORS.generative} label="DDPM Reverse Step">
        <span className="text-[#f5f2ec]">x</span><sub>t-1</sub> ={' '}
        <span className="text-[#bdb8af]">1/&radic;&alpha;</span><sub>t</sub>{' '}
        <span className="text-[#948d82]">(</span>{' '}
        <span className="text-[#f5f2ec]">x</span><sub>t</sub> &minus;{' '}
        <span className="text-[#bdb8af]">&beta;</span><sub>t</sub>
        <span className="text-[#bdb8af]">/&radic;(1-&alpha;&#772;</span><sub>t</sub>
        <span className="text-[#bdb8af]">)</span> &middot;{' '}
        <span style={{ color: METHOD_COLORS.generative }}>&epsilon;</span>
        <sub>&theta;</sub>
        <span className="text-[#948d82]">(x</span><sub>t</sub>
        <span className="text-[#948d82]">, t)</span>{' '}
        <span className="text-[#948d82]">)</span>
      </FormulaBlock>

      <div className="grid grid-cols-2 gap-5 mt-5 items-start">
        {/* Explanation */}
        <div className="space-y-3">
          {/* Forward process visualization */}
          <div className="rounded-xl p-4 border border-[#3d3a36] bg-[#1d1c1a]">
            <div className="text-sm uppercase tracking-widest text-[#948d82] mb-2">Forward Process (add noise)</div>
            <div className="flex items-center gap-1.5 text-sm font-mono overflow-hidden">
              {['x\u2080', 'x\u2081', 'x\u2082', '\u2026', 'x\u209C'].map((label, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span
                    className="px-2.5 py-1 rounded"
                    style={{
                      background: `rgba(93, 138, 102, ${0.4 - i * 0.08})`,
                      color: i < 4 ? '#f5f2ec' : '#948d82',
                    }}
                  >
                    {label}
                  </span>
                  {i < 4 && <ChevronRight size={12} className="text-[#948d82] flex-shrink-0" />}
                </div>
              ))}
            </div>
            <p className="text-sm text-[#948d82] mt-2">
              Add Gaussian noise at each step. At t=T, pure noise.
            </p>
          </div>

          {/* Reverse process steps */}
          <div className="rounded-xl p-4 border border-[#3d3a36] bg-[#1d1c1a] space-y-2">
            <div className="text-sm uppercase tracking-widest text-[#948d82] mb-1">Reverse Process (denoise)</div>
            {[
              { step: '1', text: 'U-Net predicts noise \u03B5\u03B8(x\u209C, t) at current step' },
              { step: '2', text: 'Subtract predicted noise, scaled by schedule (\u03B1, \u03B2)' },
              { step: '3', text: 'Repeat T\u219250 times for full denoising' },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-2">
                <span
                  className="text-sm font-bold w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: `${METHOD_COLORS.generative}30`, color: METHOD_COLORS.generative }}
                >
                  {item.step}
                </span>
                <span className="text-base text-[#bdb8af]">{item.text}</span>
              </div>
            ))}
          </div>

          {/* Distillation callout */}
          <div
            className="rounded-xl p-3 border text-center"
            style={{ borderColor: METHOD_COLORS.generative, background: `${METHOD_COLORS.generative}10` }}
          >
            <div className="flex items-center justify-center gap-3 text-base">
              <span className="font-mono text-[#bdb8af]">50 steps</span>
              <span className="text-[#948d82]">&xrarr;</span>
              <span className="font-mono font-bold" style={{ color: METHOD_COLORS.generative }}>1-4 steps</span>
            </div>
            <p className="text-sm text-[#948d82] mt-1">Progressive distillation preserves quality at 40x speedup</p>
          </div>
        </div>

        {/* Demo link */}
        <DemoLink slug="denoising" label="Denoising Process" color={METHOD_COLORS.generative} />
      </div>
    </div>
  );
}

function SlideGenerativeResearch() {
  const tracks = [
    {
      id: 'latency',
      label: 'Latency',
      hint: 'How papers cut end-to-end delay',
      papers: [
        {
          name: 'Avatar Forcing (2026)',
          metric: '<500ms E2E',
          desc: 'Causal forcing keeps interaction state warm between turns.',
          speed: 9,
          realism: 7,
          control: 7,
        },
        {
          name: 'SoulX-FlashHead (2026)',
          metric: 'Streaming-ready',
          desc: 'Oracle-guided architecture targets consistent real-time throughput.',
          speed: 8,
          realism: 8,
          control: 6,
        },
        {
          name: 'LiveTalk (2025)',
          metric: '40x fewer steps',
          desc: 'Distillation compresses diffusion loops from dozens of steps to a few.',
          speed: 8,
          realism: 6,
          control: 5,
        },
      ],
    },
    {
      id: 'control',
      label: 'Control',
      hint: 'How papers improve expression precision',
      papers: [
        {
          name: 'AUHead (2026)',
          metric: 'AU-conditioned',
          desc: 'Action Unit controls improve emotion steering beyond lip-sync.',
          speed: 6,
          realism: 8,
          control: 9,
        },
        {
          name: 'Toward Fine-Grained Facial Control (2026)',
          metric: 'Fine-grained motion',
          desc: 'Targets sub-region expression control on 3D talking heads.',
          speed: 7,
          realism: 8,
          control: 9,
        },
        {
          name: 'EditYourself (2026)',
          metric: 'Script-level edits',
          desc: 'Modifies existing videos while preserving identity and motion.',
          speed: 5,
          realism: 8,
          control: 8,
        },
      ],
    },
    {
      id: 'deployment',
      label: 'Deployment',
      hint: 'How papers improve practicality and scaling',
      papers: [
        {
          name: 'SelfieAvatar (2026)',
          metric: 'Selfie video input',
          desc: 'Reduces capture requirements for personalization.',
          speed: 8,
          realism: 7,
          control: 6,
        },
        {
          name: 'Splat-Portrait (2026)',
          metric: 'Single portrait',
          desc: 'Generalizes to unseen identities while keeping 3DGS rendering speed.',
          speed: 8,
          realism: 8,
          control: 7,
        },
        {
          name: 'MANGO (2026)',
          metric: 'Multi-speaker focus',
          desc: 'Conversation-aware switching between speaking and listening behavior.',
          speed: 6,
          realism: 8,
          control: 7,
        },
      ],
    },
  ] as const;

  type TrackId = (typeof tracks)[number]['id'];
  type PaperName = (typeof tracks)[number]['papers'][number]['name'];
  type PaperMetricKey = 'speed' | 'realism' | 'control';
  const [activeTrackId, setActiveTrackId] = useState<TrackId>('latency');
  const [activePaperName, setActivePaperName] = useState<PaperName>(tracks[0].papers[0].name);

  const activeTrack = tracks.find((track) => track.id === activeTrackId) ?? tracks[0];
  const activePaper = activeTrack.papers.find((paper) => paper.name === activePaperName) ?? activeTrack.papers[0];

  const metrics: Array<{ key: PaperMetricKey; label: string }> = [
    { key: 'speed', label: 'Speed' },
    { key: 'realism', label: 'Realism' },
    { key: 'control', label: 'Control' },
  ];

  return (
    <div className="flex flex-col justify-center h-full px-12 max-w-7xl mx-auto">
      <SlideMethodBadge method="Video Generation" color={METHOD_COLORS.generative} />
      <h2 className="text-5xl font-bold mb-2">Research Frontier Deep Dive</h2>
      <div className="w-14 h-1 rounded-full mb-5" style={{ background: METHOD_COLORS.generative }} />

      <div className="rounded-xl p-4 border border-[#3d3a36] bg-[#1d1c1a] mb-4">
        <p className="text-sm text-[#948d82] mb-3">Pick a research track, then inspect representative papers.</p>
        <div className="flex flex-wrap gap-2">
          {tracks.map((track) => (
            <button
              key={track.id}
              type="button"
              onClick={() => {
                setActiveTrackId(track.id);
                setActivePaperName(track.papers[0].name);
              }}
              className="px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wide border transition-colors"
              style={{
                borderColor: activeTrackId === track.id ? METHOD_COLORS.generative : '#3d3a36',
                color: activeTrackId === track.id ? METHOD_COLORS.generative : '#bdb8af',
                background: activeTrackId === track.id ? `${METHOD_COLORS.generative}16` : '#181716',
              }}
            >
              {track.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-[#948d82] mt-2">{activeTrack.hint}</p>
      </div>

      <div className="grid grid-cols-2 gap-5 items-start">
        <div className="space-y-2.5">
          {activeTrack.papers.map((paper) => {
            const selected = paper.name === activePaper.name;
            return (
              <button
                key={paper.name}
                type="button"
                onClick={() => setActivePaperName(paper.name)}
                className="w-full text-left rounded-xl p-3 border transition-colors"
                style={{
                  borderColor: selected ? METHOD_COLORS.generative : '#3d3a36',
                  background: selected ? `${METHOD_COLORS.generative}12` : '#1d1c1a',
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-[#f5f2ec]">{paper.name}</p>
                  <span className="text-xs font-mono" style={{ color: METHOD_COLORS.generative }}>
                    {paper.metric}
                  </span>
                </div>
                <p className="text-xs text-[#bdb8af] mt-1">{paper.desc}</p>
              </button>
            );
          })}
        </div>

        <div className="rounded-xl p-4 border border-[#3d3a36] bg-[#1d1c1a]">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `${METHOD_COLORS.generative}22` }}
            >
              <Sparkles size={18} style={{ color: METHOD_COLORS.generative }} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#f5f2ec]">{activePaper.name}</p>
              <p className="text-[11px] text-[#948d82]">{activePaper.metric}</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {metrics.map((metric) => (
              <div key={metric.key}>
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-[#bdb8af]">{metric.label}</span>
                  <span className="font-mono text-[#f5f2ec]">{activePaper[metric.key]}/10</span>
                </div>
                <div className="h-1.5 rounded-full bg-[#181716] overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${activePaper[metric.key] * 10}%`,
                      background: METHOD_COLORS.generative,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-[#948d82] mt-4">
            Practical direction: combine distillation (speed), AU or expression controls (precision),
            and streaming-aware training for robust deployment.
          </p>
        </div>
      </div>
    </div>
  );
}

function SlideGenerativeDemo() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-12 text-center">
      <SlideMethodBadge method="Video Generation Demo" color={METHOD_COLORS.generative} />
      <h2 className="text-5xl font-bold mb-1">Live Demo: LiveKit + Hedra</h2>
      <p className="text-[#bdb8af] text-xl mb-8 max-w-lg">
        Diffusion-based avatar streamed via WebRTC
      </p>

      <a
        href="/livekit"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-3 px-8 py-4 rounded-xl text-lg font-semibold text-white transition-all hover:scale-105"
        style={{ background: METHOD_COLORS.generative }}
      >
        <Video size={22} />
        Open LiveKit Demo
        <ExternalLink size={16} />
      </a>

      <a
        href={HEDRA_AVATAR_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-5 py-2.5 mt-4 rounded-lg text-sm font-semibold border border-[#3d3a36] text-[#f5f2ec] hover:bg-[#242220] transition-colors"
      >
        <ExternalLink size={14} />
        Open Hedra Avatar (Alternative)
      </a>

      <div className="flex items-center gap-2 text-xs text-[#948d82] mt-6">
        <Clock size={14} />
        <span>Requires LiveKit credentials. Use Hedra alternative if unavailable.</span>
      </div>
    </div>
  );
}

function SlideGaussianHow() {
  return (
    <div className="flex flex-col justify-center h-full px-12 max-w-7xl mx-auto">
      <SlideMethodBadge method="Gaussian Splatting" color={METHOD_COLORS.gaussian} />
      <h2 className="text-5xl font-bold mb-2">Gaussian Splatting Fundamentals</h2>
      <div
        className="w-14 h-1 rounded-full mb-8"
        style={{ background: METHOD_COLORS.gaussian }}
      />

      <div className="rounded-xl p-4 border border-[#3d3a36] bg-[#1d1c1a] mb-6">
        <p className="text-lg text-[#bdb8af] leading-relaxed">
          Think of a scene as <span className="text-[#f5f2ec]">millions of tiny translucent paint clouds</span>.
          {' '}Each cloud is a 3D Gaussian with center, shape, color, and opacity. Rendering means projecting those clouds to screen-space ellipses and alpha-blending them front-to-back.
        </p>
      </div>

      {/* Classic training vs feed-forward generation */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="rounded-xl p-5 border border-[#3d3a36] bg-[#1d1c1a]">
          <h3 className="text-xl font-semibold mb-3">Classic 3DGS Pipeline</h3>
          <ul className="space-y-2 text-base text-[#bdb8af]">
            <li className="flex items-center gap-2">
              <ChevronRight size={16} style={{ color: METHOD_COLORS.gaussian }} />
              Multi-view capture (often 50+ photos)
            </li>
            <li className="flex items-center gap-2">
              <ChevronRight size={16} style={{ color: METHOD_COLORS.gaussian }} />
              Optimize Gaussian params via photometric loss
            </li>
            <li className="flex items-center gap-2">
              <ChevronRight size={16} style={{ color: METHOD_COLORS.gaussian }} />
              Fast rasterized rendering after convergence
            </li>
          </ul>
        </div>
        <div
          className="rounded-xl p-5 border bg-[#1d1c1a]"
          style={{ borderColor: METHOD_COLORS.gaussian }}
        >
          <h3 className="text-xl font-semibold mb-3" style={{ color: METHOD_COLORS.gaussian }}>Feed-Forward Variants</h3>
          <ul className="space-y-2 text-base text-[#bdb8af]">
            <li className="flex items-center gap-2">
              <ChevronRight size={16} style={{ color: METHOD_COLORS.gaussian }} />
              Regress splat parameters from very few views
            </li>
            <li className="flex items-center gap-2">
              <ChevronRight size={16} style={{ color: METHOD_COLORS.gaussian }} />
              Great for quick avatar bootstrapping
            </li>
            <li className="flex items-center gap-2">
              <ChevronRight size={16} style={{ color: METHOD_COLORS.gaussian }} />
              Trade quality/control for speed and convenience
            </li>
          </ul>
        </div>
      </div>

      {/* Pipeline via ReactFlow */}
      <SlideFlow
        accentColor={METHOD_COLORS.gaussian}
        nodes={[
          { id: 'capture', label: 'Capture / Input Views' },
          { id: 'opt', label: 'Estimate Gaussian Params (μ, Σ, c, α)' },
          { id: 'project', label: 'Project to 2D Ellipses' },
          { id: 'blend', label: 'Alpha Blend (Depth-Aware)' },
          { id: 'render', label: 'Realtime View Synthesis' },
        ]}
      />
    </div>
  );
}

function SlideGaussianMechanism() {
  return (
    <div className="flex flex-col justify-center h-full px-12 max-w-7xl mx-auto">
      <SlideMethodBadge method="Gaussian Splatting" color={METHOD_COLORS.gaussian} />
      <h2 className="text-5xl font-bold mb-2">From Points to Splats</h2>
      <div className="w-14 h-1 rounded-full mb-5" style={{ background: METHOD_COLORS.gaussian }} />

      {/* Gaussian function formula */}
      <FormulaBlock color={METHOD_COLORS.gaussian} label="3D Gaussian Function">
        G(<span className="text-[#f5f2ec]">x</span>) = exp
        <span className="text-[#948d82]">(</span>
        -&frac12; (<span className="text-[#f5f2ec]">x</span>-<span style={{ color: METHOD_COLORS.gaussian }}>&mu;</span>)
        <sup>T</sup>{' '}
        <span style={{ color: METHOD_COLORS.gaussian }}>&Sigma;</span><sup>-1</sup>{' '}
        (<span className="text-[#f5f2ec]">x</span>-<span style={{ color: METHOD_COLORS.gaussian }}>&mu;</span>)
        <span className="text-[#948d82]">)</span>
      </FormulaBlock>

      <div className="grid grid-cols-2 gap-5 mt-5 items-start">
        {/* Explanation */}
        <div className="space-y-3">
          {/* Learnable parameters as tagged pills */}
          <div className="rounded-xl p-4 border border-[#3d3a36] bg-[#1d1c1a]">
            <div className="text-sm uppercase tracking-widest text-[#948d82] mb-2.5">Learnable Parameters per Gaussian</div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { sym: '\u03BC', name: 'Position', desc: 'xyz center', color: '#ff6b6b' },
                { sym: '\u03A3', name: 'Covariance', desc: '3x3 shape', color: '#ffd93d' },
                { sym: 'c', name: 'Color', desc: 'SH coefficients', color: '#4ecdc4' },
                { sym: '\u03B1', name: 'Opacity', desc: '[0, 1] alpha', color: '#c9b1ff' },
              ].map((p) => (
                <div key={p.sym} className="flex items-center gap-2 p-2.5 rounded-lg bg-[#181716]">
                  <span
                    className="w-7 h-7 rounded flex items-center justify-center text-sm font-bold font-mono"
                    style={{ background: `${p.color}25`, color: p.color }}
                  >
                    {p.sym}
                  </span>
                  <div>
                    <div className="text-base font-medium text-[#f5f2ec]">{p.name}</div>
                    <div className="text-sm text-[#948d82]">{p.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Training pipeline */}
          <div className="rounded-xl p-4 border border-[#3d3a36] bg-[#1d1c1a]">
            <div className="text-sm uppercase tracking-widest text-[#948d82] mb-2">Optimization Loop</div>
            <div className="space-y-2">
              {[
                'Render Gaussians \u2192 2D image via differentiable rasterizer',
                'Compute photometric loss: L = ||I\u0302 - I||',
                'Backprop gradients to all Gaussian parameters',
                'Adaptive density: split under-reconstructed, prune low-\u03B1',
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span
                    className="text-sm font-bold w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: `${METHOD_COLORS.gaussian}30`, color: METHOD_COLORS.gaussian }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-base text-[#bdb8af]">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Demo link */}
        <DemoLink slug="point-cloud" label="Point Cloud to Splats" color={METHOD_COLORS.gaussian} />
      </div>
    </div>
  );
}

function SlideGaussianCovariance() {
  return (
    <div className="flex flex-col justify-center h-full px-12 max-w-7xl mx-auto">
      <SlideMethodBadge method="Gaussian Splatting" color={METHOD_COLORS.gaussian} />
      <h2 className="text-5xl font-bold mb-2">Covariance & Shape Control</h2>
      <div className="w-14 h-1 rounded-full mb-5" style={{ background: METHOD_COLORS.gaussian }} />

      {/* Covariance decomposition formula */}
      <FormulaBlock color={METHOD_COLORS.gaussian} label="Covariance Decomposition">
        <span style={{ color: METHOD_COLORS.gaussian }}>&Sigma;</span> ={' '}
        <span className="text-[#ff6b6b]">R</span> &middot;{' '}
        <span className="text-[#ffd93d]">S</span> &middot;{' '}
        <span className="text-[#ffd93d]">S</span><sup>T</sup> &middot;{' '}
        <span className="text-[#ff6b6b]">R</span><sup>T</sup>
        <span className="text-[#948d82] text-sm ml-4">
          <span className="text-[#ff6b6b]">R</span>=rotation{'  '}
          <span className="text-[#ffd93d]">S</span>=scale
        </span>
      </FormulaBlock>

      <div className="grid grid-cols-2 gap-5 mt-5 items-start">
        {/* Explanation */}
        <div className="space-y-3">
          {/* Shape examples */}
          <div className="rounded-xl p-4 border border-[#3d3a36] bg-[#1d1c1a]">
            <div className="text-sm uppercase tracking-widest text-[#948d82] mb-2.5">Shape Controls</div>
            <div className="space-y-2">
              {[
                { shape: 'Sphere', formula: 'sx = sy = sz', use: 'Isotropic regions, distant points', icon: '\u25CF' },
                { shape: 'Pancake', formula: 'sx = sy \u226B sz', use: 'Flat surfaces, walls, skin', icon: '\u2B2D' },
                { shape: 'Needle', formula: 'sz \u226B sx = sy', use: 'Edges, hair strands, wires', icon: '\u2502' },
              ].map((s) => (
                <div key={s.shape} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#181716]">
                  <span className="text-xl leading-none mt-0.5" style={{ color: METHOD_COLORS.gaussian }}>{s.icon}</span>
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-semibold text-[#f5f2ec]">{s.shape}</span>
                      <code className="text-sm text-[#948d82]">{s.formula}</code>
                    </div>
                    <div className="text-sm text-[#bdb8af]">{s.use}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2D projection */}
          <div
            className="rounded-xl p-3 border"
            style={{ borderColor: METHOD_COLORS.gaussian, background: `${METHOD_COLORS.gaussian}08` }}
          >
            <div className="text-base font-semibold text-[#f5f2ec] mb-1">2D Splatting</div>
            <p className="text-sm text-[#bdb8af]">
              3D Gaussians project to <span className="text-[#f5f2ec]">2D ellipses</span> on screen.
              Alpha-composited front-to-back for differentiable rendering.
            </p>
          </div>
        </div>

        {/* Demo link */}
        <DemoLink slug="covariance" label="Covariance & Shape" color={METHOD_COLORS.gaussian} />
      </div>
    </div>
  );
}

function SlideGaussianPerf() {
  const profiles = [
    { id: 'a100', label: 'A100 Cloud', renderFactor: 1, latencyFactor: 1, memory: '80GB', note: 'Best quality per avatar' },
    { id: 'rtx4090', label: 'RTX 4090', renderFactor: 0.62, latencyFactor: 1.18, memory: '24GB', note: 'Great single-node deployment' },
    { id: 'rtx4070', label: 'RTX 4070', renderFactor: 0.38, latencyFactor: 1.45, memory: '12GB', note: 'Lean edge server choice' },
    { id: 'mobile', label: 'Mobile NPU', renderFactor: 0.2, latencyFactor: 1.8, memory: 'shared', note: 'On-device fallback mode' },
  ] as const;

  const qualityModes = [
    { id: 'preview', label: 'Preview', fpsFactor: 1.2, latencyFactor: 0.86 },
    { id: 'standard', label: 'Standard', fpsFactor: 1, latencyFactor: 1 },
    { id: 'cinematic', label: 'Cinematic', fpsFactor: 0.74, latencyFactor: 1.25 },
  ] as const;

  const systems = [
    { name: 'LAM Renderer', baseFps: 563, note: 'One-shot feed-forward avatar' },
    { name: 'GaussianTalker', baseFps: 120, note: 'Per-subject optimized model' },
    { name: 'TaoAvatar', baseFps: 90, note: 'XR-focused full body pipeline' },
  ] as const;

  const [profileId, setProfileId] = useState<(typeof profiles)[number]['id']>('rtx4090');
  const [qualityId, setQualityId] = useState<(typeof qualityModes)[number]['id']>('standard');
  const [sessionCount, setSessionCount] = useState(2);

  const profile = profiles.find((entry) => entry.id === profileId) ?? profiles[0];
  const quality = qualityModes.find((entry) => entry.id === qualityId) ?? qualityModes[1];
  const concurrencyPenalty = 1 / (1 + Math.max(0, sessionCount - 1) * 0.22);

  const projected = systems.map((system) => {
    const fps = Math.max(
      1,
      Math.round(system.baseFps * profile.renderFactor * quality.fpsFactor * concurrencyPenalty),
    );
    return {
      ...system,
      fps,
      hits30: fps >= 30,
      hits60: fps >= 60,
    };
  });

  const bestFps = Math.max(...projected.map((entry) => entry.fps));
  const e2eLatencyMs = Math.round(
    2200 * profile.latencyFactor * quality.latencyFactor * (1 + Math.max(0, sessionCount - 1) * 0.12),
  );
  const e2eGrade =
    e2eLatencyMs <= 1800
      ? { label: 'Good', color: '#6ec87a' }
      : e2eLatencyMs <= 2600
        ? { label: 'Acceptable', color: '#ffd93d' }
        : { label: 'Slow', color: '#ff6b6b' };

  return (
    <div className="flex flex-col justify-center h-full px-12 max-w-7xl mx-auto">
      <SlideMethodBadge method="Gaussian Splatting" color={METHOD_COLORS.gaussian} />
      <h2 className="text-5xl font-bold mb-2">Performance Planner</h2>
      <div className="w-14 h-1 rounded-full mb-4" style={{ background: METHOD_COLORS.gaussian }} />

      <div className="rounded-xl p-4 border border-[#3d3a36] bg-[#1d1c1a] mb-4">
        <p className="text-sm text-[#948d82] mb-3">Tune deployment assumptions and inspect projected runtime behavior.</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {profiles.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => setProfileId(entry.id)}
              className="px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wide border transition-colors"
              style={{
                borderColor: profileId === entry.id ? METHOD_COLORS.gaussian : '#3d3a36',
                color: profileId === entry.id ? METHOD_COLORS.gaussian : '#bdb8af',
                background: profileId === entry.id ? `${METHOD_COLORS.gaussian}14` : '#181716',
              }}
            >
              {entry.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {qualityModes.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => setQualityId(entry.id)}
              className="px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors"
              style={{
                borderColor: qualityId === entry.id ? METHOD_COLORS.gaussian : '#3d3a36',
                color: qualityId === entry.id ? METHOD_COLORS.gaussian : '#bdb8af',
                background: qualityId === entry.id ? `${METHOD_COLORS.gaussian}14` : '#181716',
              }}
            >
              {entry.label}
            </button>
          ))}
        </div>
        <div>
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-[#bdb8af]">Concurrent sessions</span>
            <span className="font-mono text-[#f5f2ec]">{sessionCount}</span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={sessionCount}
            onChange={(e) => setSessionCount(Number(e.target.value))}
            className="slider"
            aria-label="Concurrent sessions"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="rounded-lg p-3 border border-[#3d3a36] bg-[#1d1c1a]">
          <div className="text-sm uppercase tracking-widest text-[#948d82]">Best FPS</div>
          <div className="text-2xl font-bold font-mono" style={{ color: METHOD_COLORS.gaussian }}>{bestFps}</div>
        </div>
        <div className="rounded-lg p-3 border border-[#3d3a36] bg-[#1d1c1a]">
          <div className="text-sm uppercase tracking-widest text-[#948d82]">E2E Conversation</div>
          <div className="text-2xl font-bold font-mono text-[#f5f2ec]">{e2eLatencyMs}ms</div>
        </div>
        <div className="rounded-lg p-3 border border-[#3d3a36] bg-[#1d1c1a]">
          <div className="text-sm uppercase tracking-widest text-[#948d82]">Grade</div>
          <div className="text-2xl font-bold font-mono" style={{ color: e2eGrade.color }}>{e2eGrade.label}</div>
        </div>
      </div>

      <div className="space-y-2.5">
        {projected.map((entry) => (
          <div key={entry.name} className="rounded-xl p-3 border border-[#3d3a36] bg-[#1d1c1a]">
            <div className="flex items-center justify-between gap-3 mb-1.5">
              <p className="text-sm font-semibold text-[#f5f2ec]">{entry.name}</p>
              <span className="font-mono text-sm" style={{ color: METHOD_COLORS.gaussian }}>{entry.fps} FPS</span>
            </div>
            <div className="h-1.5 rounded-full bg-[#181716] overflow-hidden mb-1.5">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(100, Math.round((entry.fps / 120) * 100))}%`,
                  background: METHOD_COLORS.gaussian,
                }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#948d82]">
              <span>{entry.note}</span>
              <span>{entry.hits60 ? '60 FPS ready' : entry.hits30 ? '30 FPS ready' : 'sub-30 FPS'}</span>
            </div>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-[#948d82] mt-3">
        Profile: {profile.label} ({profile.memory}) · {profile.note}
      </p>
    </div>
  );
}

function SlideGaussianDemo() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-12 text-center">
      <SlideMethodBadge method="Gaussian Splatting Demo" color={METHOD_COLORS.gaussian} />
      <h2 className="text-5xl font-bold mb-1">Live Demo: OpenAvatarChat + LAM</h2>
      <p className="text-[#bdb8af] text-xl mb-8 max-w-lg">
        Self-hosted Gaussian avatar with real-time conversation
      </p>

      <a
        href="https://localhost:8282"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-3 px-8 py-4 rounded-xl text-lg font-semibold text-white transition-all hover:scale-105"
        style={{ background: METHOD_COLORS.gaussian }}
      >
        <Box size={22} />
        Open Gaussian Demo
        <ExternalLink size={16} />
      </a>

      <div className="flex items-center gap-2 text-xs text-[#948d82] mt-6">
        <Cpu size={14} />
        <span>Requires local Docker setup (see gaussian-avatar/ directory)</span>
      </div>
    </div>
  );
}

function SlideGaussianWorldlabsDemo() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-12 text-center">
      <SlideMethodBadge method="Gaussian Splatting Demo" label="World Labs" color={METHOD_COLORS.gaussian} />
      <h2 className="text-5xl font-bold mb-1">World Labs Gaussian Showcase</h2>
      <p className="text-[#bdb8af] text-lg mb-5 max-w-3xl">
        Public World Labs pages are not embeddable (frame-ancestors / X-Frame-Options). We embed their public demo walkthrough and link directly to the live case study.
      </p>

      <div className="w-full max-w-5xl aspect-video rounded-xl overflow-hidden border border-[#3d3a36] bg-[#1d1c1a]">
        <iframe
          src={WORLDLABS_YOUTUBE_EMBED_URL}
          title="World Labs Gaussian Splatting Demo"
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
        <a
          href={WORLDLABS_SPLAT_WORLD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#3d3a36] text-sm font-semibold hover:bg-[#242220] transition-colors"
          style={{ color: METHOD_COLORS.gaussian }}
        >
          <Globe size={15} />
          Open World Labs Splat World
          <ExternalLink size={14} />
        </a>
        <a
          href={WORLDLABS_MARBLE_GUIDE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#3d3a36] text-sm font-semibold hover:bg-[#242220] transition-colors"
          style={{ color: METHOD_COLORS.gaussian }}
        >
          <BookOpen size={15} />
          Open Marble User Guide
          <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
}

function SlideStreamingArchitecture() {
  const [participants, setParticipants] = useState(4);
  const [bitrateKbps, setBitrateKbps] = useState(900);
  const [uplinkBudgetMbps, setUplinkBudgetMbps] = useState(8);
  const [relayHops, setRelayHops] = useState(1);

  const p2pClientUp = ((participants - 1) * bitrateKbps) / 1000;
  const p2pClientDown = p2pClientUp;
  const sfuClientUp = bitrateKbps / 1000;
  const sfuClientDown = ((participants - 1) * bitrateKbps) / 1000;
  const mcuClientUp = bitrateKbps / 1000;
  const mcuClientDown = bitrateKbps / 1000;

  const topologies = [
    {
      id: 'p2p',
      name: 'P2P (Mesh)',
      color: '#ff6b6b',
      links: (participants * (participants - 1)) / 2,
      clientUp: p2pClientUp,
      clientDown: p2pClientDown,
      serverLoad: participants * 0.4,
      latencyMs: Math.round(45 + relayHops * 18 + Math.max(0, participants - 3) * 14),
      note: 'Lowest baseline latency, but client uplink scales as N-1.',
    },
    {
      id: 'sfu',
      name: 'SFU',
      color: '#3498db',
      links: participants,
      clientUp: sfuClientUp,
      clientDown: sfuClientDown,
      serverLoad: participants * 1.2,
      latencyMs: Math.round(78 + relayHops * 20 + Math.max(0, participants - 8) * 4),
      note: 'Best default for interactive avatars and group sessions.',
    },
    {
      id: 'mcu',
      name: 'MCU',
      color: '#9b59b6',
      links: participants,
      clientUp: mcuClientUp,
      clientDown: mcuClientDown,
      serverLoad: participants * 3.2,
      latencyMs: Math.round(132 + relayHops * 28 + Math.max(0, participants - 8) * 6),
      note: 'Fixed client bandwidth, higher transcoding cost and delay.',
    },
  ].map((entry) => {
    const fitsUplink = entry.clientUp <= uplinkBudgetMbps;
    const overflow = Math.max(0, entry.clientUp - uplinkBudgetMbps);
    const score = entry.latencyMs + entry.serverLoad * 10 + overflow * 65;
    return {
      ...entry,
      fitsUplink,
      overflow,
      score,
    };
  });

  const recommended =
    [...topologies].sort((a, b) => a.score - b.score)[0] ?? topologies[0];

  return (
    <div className="flex flex-col justify-center h-full px-12 max-w-7xl mx-auto">
      <SlideMethodBadge method="Streaming" label="Streaming" color={METHOD_COLORS.generative} />
      <h2 className="text-5xl font-bold mb-2">Streaming Topology Explorer</h2>
      <div className="w-14 h-1 rounded-full mb-4" style={{ background: METHOD_COLORS.generative }} />

      <div className="rounded-xl p-4 border border-[#3d3a36] bg-[#1d1c1a] mb-4">
        <p className="text-sm text-[#948d82] mb-3">Tune room size and network envelope to see which transport model wins.</p>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-[11px] text-[#bdb8af]">
            Participants: {participants}
            <input
              type="range"
              min={2}
              max={20}
              step={1}
              value={participants}
              onChange={(e) => setParticipants(Number(e.target.value))}
              className="slider mt-1.5"
              aria-label="Participants"
            />
          </label>
          <label className="text-[11px] text-[#bdb8af]">
            Per-stream bitrate: {bitrateKbps} kbps
            <input
              type="range"
              min={300}
              max={2500}
              step={50}
              value={bitrateKbps}
              onChange={(e) => setBitrateKbps(Number(e.target.value))}
              className="slider mt-1.5"
              aria-label="Per-stream bitrate"
            />
          </label>
          <label className="text-[11px] text-[#bdb8af]">
            Client uplink budget: {uplinkBudgetMbps.toFixed(1)} Mbps
            <input
              type="range"
              min={1}
              max={20}
              step={0.5}
              value={uplinkBudgetMbps}
              onChange={(e) => setUplinkBudgetMbps(Number(e.target.value))}
              className="slider mt-1.5"
              aria-label="Client uplink budget"
            />
          </label>
          <label className="text-[11px] text-[#bdb8af]">
            Relay/region hops: {relayHops}
            <input
              type="range"
              min={0}
              max={4}
              step={1}
              value={relayHops}
              onChange={(e) => setRelayHops(Number(e.target.value))}
              className="slider mt-1.5"
              aria-label="Relay hops"
            />
          </label>
        </div>
        <div className="mt-3 text-xs text-[#948d82]">
          Recommended topology: <span className="font-semibold" style={{ color: recommended.color }}>{recommended.name}</span>
          {' '}for the current latency and uplink envelope.
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {topologies.map((topology) => (
          <div key={topology.id} className="rounded-xl p-3 border border-[#3d3a36] bg-[#1d1c1a]">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <p className="text-xs font-semibold" style={{ color: topology.color }}>{topology.name}</p>
              <span
                className="text-[10px] px-1.5 py-0.5 rounded"
                style={{
                  background: topology.fitsUplink ? '#2a3a2f' : '#3a2525',
                  color: topology.fitsUplink ? '#8be39a' : '#ff9b9b',
                }}
              >
                {topology.fitsUplink ? 'uplink fit' : `+${topology.overflow.toFixed(1)} Mbps`}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[10px] text-[#bdb8af]">
              <div>Links</div>
              <div className="font-mono text-right text-[#f5f2ec]">{topology.links}</div>
              <div>Client up</div>
              <div className="font-mono text-right text-[#f5f2ec]">{topology.clientUp.toFixed(1)} Mbps</div>
              <div>Client down</div>
              <div className="font-mono text-right text-[#f5f2ec]">{topology.clientDown.toFixed(1)} Mbps</div>
              <div>Server load</div>
              <div className="font-mono text-right text-[#f5f2ec]">{topology.serverLoad.toFixed(1)}x</div>
              <div>Latency</div>
              <div className="font-mono text-right text-[#f5f2ec]">{topology.latencyMs} ms</div>
            </div>
            <p className="text-[10px] text-[#948d82] mt-2">{topology.note}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5 items-start">
        <div className="rounded-xl p-3 border border-[#3d3a36] bg-[#1d1c1a]">
          <div className="text-base font-semibold text-[#f5f2ec] mb-2">Decision heuristic</div>
          <ul className="text-sm text-[#bdb8af] space-y-1.5">
            <li>P2P when participants are small and uplink is strong.</li>
            <li>SFU for most conversational avatar products.</li>
            <li>MCU for constrained clients that need fixed downlink.</li>
            <li>Move SFUs closer to users before adding GPU-heavy processing.</li>
          </ul>
        </div>
        <DemoLink slug="sfu-comparison" label="SFU Topology Comparison" color={METHOD_COLORS.generative} />
      </div>
    </div>
  );
}

function SlideComparison() {
  type CriterionKey = 'latency' | 'realism' | 'control' | 'setup' | 'cost' | 'portability';
  const criteria: Array<{ id: CriterionKey; label: string }> = [
    { id: 'latency', label: 'Latency' },
    { id: 'realism', label: 'Realism' },
    { id: 'control', label: 'Control' },
    { id: 'setup', label: 'Setup Speed' },
    { id: 'cost', label: 'Cost Efficiency' },
    { id: 'portability', label: 'Device Reach' },
  ];

  const methods: Array<{
    id: string;
    name: string;
    color: string;
    summary: string;
    scores: Record<CriterionKey, number>;
  }> = [
    {
      id: 'metahuman',
      name: 'MetaHuman',
      color: METHOD_COLORS.metahuman,
      summary: 'Strongest direct animation control and production-grade cinematic tooling.',
      scores: { latency: 9, realism: 8, control: 9, setup: 4, cost: 3, portability: 4 },
    },
    {
      id: 'generative',
      name: 'Video Generation',
      color: METHOD_COLORS.generative,
      summary: 'Fastest onboarding and broadest deployment via managed streaming providers.',
      scores: { latency: 6, realism: 9, control: 6, setup: 9, cost: 5, portability: 9 },
    },
    {
      id: 'gaussian',
      name: 'Gaussian Splatting',
      color: METHOD_COLORS.gaussian,
      summary: 'Best quality-latency-cost balance when you can self-host rendering.',
      scores: { latency: 8, realism: 8, control: 7, setup: 7, cost: 8, portability: 8 },
    },
  ];

  const scenarios: Array<{
    id: string;
    label: string;
    hint: string;
    weights: Record<CriterionKey, number>;
  }> = [
    {
      id: 'balanced',
      label: 'Balanced',
      hint: 'General product deployment',
      weights: { latency: 5, realism: 4, control: 4, setup: 3, cost: 3, portability: 3 },
    },
    {
      id: 'enterprise',
      label: 'Enterprise Support',
      hint: 'Reliability and rollout speed matter most',
      weights: { latency: 4, realism: 3, control: 3, setup: 5, cost: 4, portability: 5 },
    },
    {
      id: 'cinematic',
      label: 'Premium Experience',
      hint: 'Max expression quality with artistic control',
      weights: { latency: 3, realism: 6, control: 6, setup: 2, cost: 2, portability: 2 },
    },
    {
      id: 'edge',
      label: 'Edge / Mobile',
      hint: 'Bandwidth and portability constrained',
      weights: { latency: 5, realism: 3, control: 3, setup: 4, cost: 5, portability: 6 },
    },
  ];

  const [scenarioId, setScenarioId] = useState('balanced');
  const [fidelityBias, setFidelityBias] = useState(5);

  const scenario = scenarios.find((entry) => entry.id === scenarioId) ?? scenarios[0];
  const fidelityShift = (fidelityBias - 5) / 5;
  const weights: Record<CriterionKey, number> = {
    ...scenario.weights,
    realism: Math.max(1, scenario.weights.realism + fidelityShift * 2.2),
    control: Math.max(1, scenario.weights.control + fidelityShift * 1.7),
    setup: Math.max(1, scenario.weights.setup - fidelityShift * 1.5),
    cost: Math.max(1, scenario.weights.cost - fidelityShift * 1.5),
  };

  const totalWeight = criteria.reduce((sum, criterion) => sum + weights[criterion.id], 0);

  const ranked = methods
    .map((method) => {
      const weightedScore = criteria.reduce(
        (sum, criterion) => sum + method.scores[criterion.id] * weights[criterion.id],
        0,
      ) / totalWeight;
      const topStrengths = [...criteria]
        .sort((a, b) => method.scores[b.id] - method.scores[a.id])
        .slice(0, 2)
        .map((criterion) => criterion.label);
      return {
        ...method,
        weightedScore,
        topStrengths,
      };
    })
    .sort((a, b) => b.weightedScore - a.weightedScore);

  const winner = ranked[0];

  return (
    <div className="flex flex-col justify-center h-full px-12 max-w-7xl mx-auto">
      <h2 className="text-5xl font-bold mb-2">Scenario Matrix</h2>
      <div className="w-14 h-1 rounded-full mb-4" style={{ background: METHOD_COLORS.gaussian }} />

      <div className="rounded-xl p-4 border border-[#3d3a36] bg-[#1d1c1a] mb-4">
        <p className="text-xs text-[#948d82] mb-3">Pick a scenario, then bias toward realism or deployment simplicity.</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {scenarios.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => setScenarioId(entry.id)}
              className="px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors"
              style={{
                borderColor: scenarioId === entry.id ? METHOD_COLORS.gaussian : '#3d3a36',
                color: scenarioId === entry.id ? METHOD_COLORS.gaussian : '#bdb8af',
                background: scenarioId === entry.id ? `${METHOD_COLORS.gaussian}16` : '#181716',
              }}
            >
              {entry.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-[#948d82] mb-2">{scenario.hint}</p>
        <label className="text-[11px] text-[#bdb8af] block">
          Fidelity bias: {fidelityBias}
          <input
            type="range"
            min={0}
            max={10}
            step={1}
            value={fidelityBias}
            onChange={(e) => setFidelityBias(Number(e.target.value))}
            className="slider mt-1.5"
            aria-label="Fidelity bias"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {criteria.map((criterion) => (
          <span key={criterion.id} className="text-[10px] px-2 py-1 rounded bg-[#181716] border border-[#3d3a36] text-[#bdb8af]">
            {criterion.label}: <span className="font-mono text-[#f5f2ec]">{weights[criterion.id].toFixed(1)}</span>
          </span>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {ranked.map((method, idx) => (
          <div key={method.id} className="rounded-xl p-3 border border-[#3d3a36] bg-[#1d1c1a]">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <p className="text-sm font-semibold" style={{ color: method.color }}>{method.name}</p>
              <span className="text-xs font-mono text-[#f5f2ec]">{method.weightedScore.toFixed(2)}</span>
            </div>
            <p className="text-[10px] text-[#948d82] mb-2">{method.summary}</p>
            <div className="h-1.5 rounded-full bg-[#181716] overflow-hidden mb-2">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.round((method.weightedScore / 10) * 100)}%`,
                  background: method.color,
                }}
              />
            </div>
            <div className="text-[10px] text-[#bdb8af]">
              Strengths: <span className="text-[#f5f2ec]">{method.topStrengths.join(', ')}</span>
            </div>
            <div className="text-[10px] text-[#948d82] mt-1">Rank #{idx + 1}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl p-3 border border-[#3d3a36] bg-[#1d1c1a] text-xs text-[#bdb8af]">
        Recommended for this scenario: <span className="font-semibold" style={{ color: winner.color }}>{winner.name}</span>
        {' '}({winner.weightedScore.toFixed(2)} / 10 weighted fit).
      </div>
    </div>
  );
}

function SlideE2EPipeline() {
  type StageKey = 'vad' | 'stt' | 'llm' | 'tts' | 'avatar' | 'stream';
  const stages: Array<{
    key: StageKey;
    label: string;
    color: string;
    min: number;
    max: number;
  }> = [
    { key: 'vad', label: 'VAD', color: '#4ecdc4', min: 40, max: 350 },
    { key: 'stt', label: 'STT', color: '#45b7d1', min: 60, max: 450 },
    { key: 'llm', label: 'LLM', color: '#96ceb4', min: 80, max: 800 },
    { key: 'tts', label: 'TTS', color: '#ffd93d', min: 50, max: 400 },
    { key: 'avatar', label: 'Avatar', color: '#ff6b6b', min: 20, max: 260 },
    { key: 'stream', label: 'Stream', color: '#c9b1ff', min: 20, max: 220 },
  ];

  const [stageValues, setStageValues] = useState<Record<StageKey, number>>({
    vad: 120,
    stt: 170,
    llm: 280,
    tts: 140,
    avatar: 90,
    stream: 60,
  });
  const [overlapPercent, setOverlapPercent] = useState(35);
  const [networkJitter, setNetworkJitter] = useState(20);

  const totalLatency = stages.reduce((sum, stage) => sum + stageValues[stage.key], 0);
  const overlapGain = Math.round(totalLatency * (overlapPercent / 100) * 0.45);
  const effectiveLatency = Math.max(120, totalLatency - overlapGain + networkJitter);

  const latencyGrade =
    effectiveLatency <= 850
      ? { label: 'Excellent', color: '#6ec87a' }
      : effectiveLatency <= 1300
        ? { label: 'Good', color: '#ffd93d' }
        : { label: 'Needs optimization', color: '#ff6b6b' };

  const bottleneck =
    stages.reduce((max, stage) => (
      stageValues[stage.key] > stageValues[max.key] ? stage : max
    ), stages[0]);

  const bottleneckCut = Math.round(stageValues[bottleneck.key] * 0.25);
  const whatIfLatency = Math.max(120, effectiveLatency - bottleneckCut);

  return (
    <div className="flex flex-col justify-center h-full px-12 max-w-7xl mx-auto">
      <SlideMethodBadge method="End-to-End" color={METHOD_COLORS.gaussian} />
      <h2 className="text-5xl font-bold mb-2">Latency Budget Simulator</h2>
      <div className="w-14 h-1 rounded-full mb-4" style={{ background: METHOD_COLORS.gaussian }} />

      <div className="grid grid-cols-2 gap-4 mb-4">
        <FormulaBlock color={METHOD_COLORS.gaussian} label="Total Latency">
          L<sub>total</sub> ={' '}
          <span className="text-[#bdb8af]">&Sigma;</span> L<sub>i</sub> ={' '}
          <span className="text-[#4ecdc4]">{stageValues.vad}</span> +{' '}
          <span className="text-[#45b7d1]">{stageValues.stt}</span> +{' '}
          <span className="text-[#96ceb4]">{stageValues.llm}</span> +{' '}
          <span className="text-[#ffd93d]">{stageValues.tts}</span> +{' '}
          <span className="text-[#ff6b6b]">{stageValues.avatar}</span> +{' '}
          <span className="text-[#c9b1ff]">{stageValues.stream}</span>
          <div className="text-xs text-[#bdb8af] mt-1">
            Raw sum: {totalLatency} ms
          </div>
        </FormulaBlock>

        <div className="rounded-lg p-3 bg-[#181716] border border-[#3d3a36] flex flex-col justify-center">
          <div className="text-[10px] uppercase tracking-widest text-[#948d82] mb-2">Effective Turn Latency</div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="rounded p-2 bg-[#1d1c1a] border border-[#3d3a36]">
              <div className="text-[#948d82]">Overlap gain</div>
              <div className="font-mono text-[#f5f2ec]">-{overlapGain} ms</div>
            </div>
            <div className="rounded p-2 bg-[#1d1c1a] border border-[#3d3a36]">
              <div className="text-[#948d82]">Jitter buffer</div>
              <div className="font-mono text-[#f5f2ec]">+{networkJitter} ms</div>
            </div>
          </div>
          <div className="mt-2 flex items-end justify-between">
            <div>
              <div className="text-[10px] text-[#948d82]">Projected E2E</div>
              <div className="text-xl font-mono text-[#f5f2ec]">{effectiveLatency} ms</div>
            </div>
            <div className="text-sm font-semibold" style={{ color: latencyGrade.color }}>
              {latencyGrade.label}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-2.5">
          {stages.map((stage) => (
            <label key={stage.key} className="block rounded-lg p-2.5 border border-[#3d3a36] bg-[#1d1c1a]">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="font-semibold" style={{ color: stage.color }}>{stage.label}</span>
                <span className="font-mono text-[#f5f2ec]">{stageValues[stage.key]} ms</span>
              </div>
              <input
                type="range"
                min={stage.min}
                max={stage.max}
                step={10}
                value={stageValues[stage.key]}
                onChange={(e) => setStageValues((prev) => ({ ...prev, [stage.key]: Number(e.target.value) }))}
                className="slider"
                aria-label={`${stage.label} latency`}
              />
            </label>
          ))}
        </div>

        <div className="rounded-xl p-3 border border-[#3d3a36] bg-[#1d1c1a]">
          <div className="text-xs font-semibold text-[#f5f2ec] mb-2">Pipeline controls</div>
          <label className="text-[11px] text-[#bdb8af] block mb-3">
            Stage overlap: {overlapPercent}%
            <input
              type="range"
              min={0}
              max={70}
              step={1}
              value={overlapPercent}
              onChange={(e) => setOverlapPercent(Number(e.target.value))}
              className="slider mt-1.5"
              aria-label="Stage overlap"
            />
          </label>
          <label className="text-[11px] text-[#bdb8af] block mb-3">
            Network jitter budget: {networkJitter} ms
            <input
              type="range"
              min={0}
              max={120}
              step={5}
              value={networkJitter}
              onChange={(e) => setNetworkJitter(Number(e.target.value))}
              className="slider mt-1.5"
              aria-label="Network jitter budget"
            />
          </label>

          <div className="text-[11px] text-[#bdb8af] mb-2">
            Bottleneck: <span className="font-semibold" style={{ color: bottleneck.color }}>{bottleneck.label}</span>
            {' '}({stageValues[bottleneck.key]} ms)
          </div>
          <div className="text-[11px] text-[#948d82] mb-2">
            If bottleneck is cut by 25%: <span className="font-mono text-[#f5f2ec]">{whatIfLatency} ms</span>
          </div>
          <div className="h-2 rounded-full bg-[#181716] overflow-hidden flex">
            {stages.map((stage) => (
              <div
                key={stage.key}
                style={{
                  width: `${Math.max(6, (stageValues[stage.key] / totalLatency) * 100)}%`,
                  background: stage.color,
                }}
              />
            ))}
          </div>
          <div className="text-[10px] text-[#948d82] mt-1">Stage contribution mix (raw latency share).</div>
        </div>
      </div>

      <DemoLink slug="pipeline-flow" label="Pipeline Flow" color={METHOD_COLORS.gaussian} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   NEW SLIDES (Deep Research Overhaul)
   ═══════════════════════════════════════════════════════════════ */

function SlideSignalsInteraction() {
  type TabId = 'inputs' | 'outputs' | 'coupling';
  const [activeTab, setActiveTab] = useState<TabId>('inputs');

  const methodDot = (supported: boolean[], colors: string[]) => (
    <div className="flex gap-1">
      {supported.map((s, i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full"
          style={{ background: s ? colors[i] : '#3d3a36' }}
          title={s ? 'Supported' : 'Not supported'}
        />
      ))}
    </div>
  );

  const colors = [METHOD_COLORS.metahuman, METHOD_COLORS.generative, METHOD_COLORS.gaussian];

  const tabs: Record<TabId, { label: string; signals: Array<{ name: string; support: boolean[] }> }> = {
    inputs: {
      label: 'User Inputs',
      signals: [
        { name: 'Audio prosody', support: [true, true, true] },
        { name: 'Face video (webcam)', support: [true, true, true] },
        { name: 'Head pose', support: [true, true, true] },
        { name: 'Gaze direction', support: [true, true, true] },
        { name: 'Expression coefficients', support: [true, true, true] },
        { name: 'Turn-taking signals', support: [true, true, true] },
      ],
    },
    outputs: {
      label: 'Agent Outputs',
      signals: [
        { name: 'Speech audio', support: [true, true, true] },
        { name: 'Facial action units', support: [true, true, true] },
        { name: 'Head motion', support: [true, true, true] },
        { name: 'Gaze shifts', support: [true, true, true] },
        { name: 'Hand gestures', support: [true, true, true] },
        { name: 'Idle micro-motion', support: [true, true, true] },
      ],
    },
    coupling: {
      label: 'Coupling Styles',
      signals: [
        { name: 'Audio-only driven', support: [true, true, true] },
        { name: 'Audio + user motion (Avatar Forcing)', support: [false, true, false] },
        { name: 'Audio + text + image (LiveTalk)', support: [false, true, false] },
        { name: 'Audio + pose (TaoAvatar)', support: [false, false, true] },
      ],
    },
  };

  const active = tabs[activeTab];

  return (
    <div className="flex flex-col justify-center h-full px-12 max-w-7xl mx-auto">
      <h2 className="text-5xl font-bold mb-2">Interaction Signals</h2>
      <div className="w-14 h-1 rounded-full mb-4" style={{ background: METHOD_COLORS.gaussian }} />
      <p className="text-xl text-[#bdb8af] mb-5">
        What signals flow between user and avatar -- and which methods support them?
      </p>

      <div className="flex gap-2 mb-4">
        {(Object.entries(tabs) as [TabId, typeof tabs[TabId]][]).map(([id, tab]) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className="px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wide border transition-colors"
            style={{
              borderColor: activeTab === id ? METHOD_COLORS.gaussian : '#3d3a36',
              color: activeTab === id ? '#f5f2ec' : '#bdb8af',
              background: activeTab === id ? `${METHOD_COLORS.gaussian}16` : '#181716',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl p-5 border border-[#3d3a36] bg-[#1d1c1a]">
        <div className="flex items-center gap-4 mb-3 text-sm text-[#948d82] uppercase tracking-widest">
          <span className="flex-1">Signal</span>
          <div className="flex gap-3">
            <span style={{ color: METHOD_COLORS.metahuman }}>MH</span>
            <span style={{ color: METHOD_COLORS.generative }}>VG</span>
            <span style={{ color: METHOD_COLORS.gaussian }}>GS</span>
          </div>
        </div>
        <div className="space-y-2">
          {active.signals.map((signal) => (
            <div key={signal.name} className="flex items-center gap-4 py-1.5 border-b border-[#242220] last:border-0">
              <span className="flex-1 text-base text-[#f5f2ec]">{signal.name}</span>
              {methodDot(signal.support, colors)}
            </div>
          ))}
        </div>
      </div>

      <p className="text-sm text-[#948d82] mt-3">
        Emotional responsiveness is not just about rendering -- it depends on what signals the pipeline can ingest and produce.
      </p>
    </div>
  );
}

function SlideCapabilityMatrix() {
  type ScoreLevel = 0 | 1 | 2 | 3;
  const scoreLabels: Record<ScoreLevel, string> = { 0: 'Absent', 1: 'Limited', 2: 'Supported', 3: 'Strong' };
  const scoreColors: Record<ScoreLevel, string> = { 0: '#3d3a36', 1: '#5d5a55', 2: '#7a8a6a', 3: '#6ec87a' };

  const capabilities: Array<{
    name: string;
    scores: [ScoreLevel, ScoreLevel, ScoreLevel];
    cite: string;
  }> = [
    { name: 'Reactive Listening', scores: [2, 3, 1], cite: 'Avatar Forcing enables user-motion-conditioned generation' },
    { name: 'Eye / Gaze Control', scores: [3, 1, 2], cite: 'MetaHuman has explicit gaze rigs; ICo3D adds gaze to Gaussians' },
    { name: 'Gesture Support', scores: [3, 2, 0], cite: 'Full body rigs vs. portrait-only generation' },
    { name: 'XR-Ready', scores: [3, 0, 2], cite: 'TaoAvatar: 90 FPS on Vision Pro; Audio2Face: UE5 XR' },
  ];

  const methods = [
    { label: 'MetaHuman', color: METHOD_COLORS.metahuman },
    { label: 'Video Gen', color: METHOD_COLORS.generative },
    { label: 'Gaussian', color: METHOD_COLORS.gaussian },
  ];

  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="flex flex-col justify-center h-full px-12 max-w-7xl mx-auto">
      <h2 className="text-5xl font-bold mb-2">Capability Matrix</h2>
      <div className="w-14 h-1 rounded-full mb-4" style={{ background: METHOD_COLORS.gaussian }} />
      <p className="text-xl text-[#bdb8af] mb-5">
        Emotion-responsiveness comparison across the three paradigms.
      </p>

      <div className="rounded-xl border border-[#3d3a36] bg-[#1d1c1a] overflow-hidden">
        {/* Header row */}
        <div className="grid grid-cols-4 gap-0 text-xs uppercase tracking-widest text-[#948d82] border-b border-[#3d3a36]">
          <div className="p-3">Capability</div>
          {methods.map((m) => (
            <div key={m.label} className="p-3 text-center" style={{ color: m.color }}>{m.label}</div>
          ))}
        </div>

        {/* Data rows */}
        {capabilities.map((cap) => (
          <div key={cap.name}>
            <button
              onClick={() => setExpanded(expanded === cap.name ? null : cap.name)}
              className="grid grid-cols-4 gap-0 w-full text-left border-b border-[#242220] hover:bg-[#242220] transition-colors"
            >
              <div className="p-3 text-sm text-[#f5f2ec] flex items-center gap-2">
                {cap.name}
                <ChevronRight
                  size={12}
                  className="text-[#948d82] transition-transform"
                  style={{ transform: expanded === cap.name ? 'rotate(90deg)' : 'rotate(0)' }}
                />
              </div>
              {cap.scores.map((score, i) => (
                <div key={i} className="p-3 flex items-center justify-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: scoreColors[score] }} />
                  <span className="text-xs" style={{ color: scoreColors[score] }}>
                    {scoreLabels[score]}
                  </span>
                </div>
              ))}
            </button>
            {expanded === cap.name && (
              <div className="px-4 py-2.5 bg-[#181716] text-xs text-[#bdb8af] border-b border-[#242220]">
                {cap.cite}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 mt-4 text-[10px] text-[#948d82]">
        {Object.entries(scoreLabels).map(([level, label]) => (
          <div key={level} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: scoreColors[Number(level) as ScoreLevel] }} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

function SlideRealTimeMetrics() {
  const [latencyMs, setLatencyMs] = useState(500);

  const latencyLabel = latencyMs < 200 ? 'Instant' : latencyMs < 500 ? 'Responsive' : latencyMs < 1000 ? 'Noticeable' : 'Sluggish';
  const latencyColor = latencyMs < 200 ? '#6ec87a' : latencyMs < 500 ? '#e08840' : '#ff6b6b';

  return (
    <div className="flex flex-col justify-center h-full px-12 max-w-7xl mx-auto">
      <h2 className="text-5xl font-bold mb-2">Redefining &ldquo;Real-Time&rdquo;</h2>
      <div className="w-14 h-1 rounded-full mb-4" style={{ background: METHOD_COLORS.gaussian }} />
      <p className="text-xl text-[#bdb8af] mb-5">
        FPS alone does not capture responsiveness. Two metrics matter independently.
      </p>

      <div className="grid grid-cols-2 gap-5">
        {/* Left: First-Reaction Latency */}
        <div className="rounded-xl p-4 border border-[#3d3a36] bg-[#1d1c1a]">
          <div className="flex items-center gap-2 mb-3">
            <Timer size={16} style={{ color: METHOD_COLORS.gaussian }} />
            <h3 className="text-sm font-semibold text-[#f5f2ec]">First-Reaction Latency</h3>
          </div>
          <p className="text-xs text-[#bdb8af] mb-4">
            Time from user input to first visible response (nod, blink, or lip movement).
          </p>

          <label className="text-[11px] text-[#948d82]">
            Simulated latency: <span className="font-mono font-semibold" style={{ color: latencyColor }}>{latencyMs}ms</span>
            <input
              type="range"
              min={50}
              max={1500}
              step={50}
              value={latencyMs}
              onChange={(e) => setLatencyMs(Number(e.target.value))}
              className="slider mt-2"
              aria-label="First-reaction latency"
            />
          </label>

          <div
            className="mt-3 px-3 py-1.5 rounded text-xs font-semibold text-center"
            style={{ background: `${latencyColor}22`, color: latencyColor }}
          >
            {latencyLabel}
          </div>

          <div className="mt-4 space-y-1.5 text-[10px] text-[#948d82]">
            <div className="flex justify-between"><span>Avatar Forcing</span><span className="font-mono" style={{ color: METHOD_COLORS.generative }}>&lt;500ms</span></div>
            <div className="flex justify-between"><span>MetaHuman + LiveLink</span><span className="font-mono" style={{ color: METHOD_COLORS.metahuman }}>~80ms</span></div>
            <div className="flex justify-between"><span>LAM + Audio2Exp</span><span className="font-mono" style={{ color: METHOD_COLORS.gaussian }}>~200ms</span></div>
          </div>
        </div>

        {/* Right: Steady-State FPS + Drift */}
        <div className="rounded-xl p-4 border border-[#3d3a36] bg-[#1d1c1a]">
          <div className="flex items-center gap-2 mb-3">
            <Activity size={16} style={{ color: METHOD_COLORS.gaussian }} />
            <h3 className="text-sm font-semibold text-[#f5f2ec]">Steady-State FPS + Drift</h3>
          </div>
          <p className="text-xs text-[#bdb8af] mb-4">
            Sustained frame rate and identity stability over time (does the face drift?).
          </p>

          <div className="space-y-3">
            {[
              { method: 'MetaHuman', fps: '60+', drift: 'None', driftColor: '#6ec87a', color: METHOD_COLORS.metahuman, bar: 100 },
              { method: 'LAM (A100)', fps: '563', drift: 'None', driftColor: '#6ec87a', color: METHOD_COLORS.gaussian, bar: 100 },
              { method: 'LiveTalk 1.3B', fps: '25', drift: 'Low', driftColor: '#e08840', color: METHOD_COLORS.generative, bar: 42 },
              { method: 'SoulX 14B', fps: '32', drift: 'Low', driftColor: '#e08840', color: METHOD_COLORS.generative, bar: 53 },
            ].map((row) => (
              <div key={row.method}>
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span style={{ color: row.color }}>{row.method}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[#f5f2ec]">{row.fps} FPS</span>
                    <span className="text-[10px]" style={{ color: row.driftColor }}>drift: {row.drift}</span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-[#181716] overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${row.bar}%`, background: row.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-lg p-3 bg-[#242220] border border-[#3d3a36]">
        <p className="text-xs text-[#f5f2ec] font-medium">
          <Zap size={12} className="inline mr-1" style={{ color: METHOD_COLORS.gaussian }} />
          Key insight: 30 FPS can feel non-interactive if first reaction takes 800ms.
          Conversely, 25 FPS feels responsive at &lt;500ms first-reaction.
        </p>
      </div>
    </div>
  );
}

function SlideAudio2FaceBuildingBlocks() {
  type PathId = 'metahuman' | 'gaussian' | 'videogen';
  const [activePath, setActivePath] = useState<PathId>('metahuman');

  const paths: Record<PathId, { label: string; color: string; steps: string[]; note: string }> = {
    metahuman: {
      label: 'MetaHuman Path',
      color: METHOD_COLORS.metahuman,
      steps: ['52 ARKit blendshapes', 'LiveLink / MetaHuman Animator', 'UE5 rig rendering'],
      note: 'Explicit rig control with highest fidelity. Requires Unreal Engine.',
    },
    gaussian: {
      label: 'Gaussian Path',
      color: METHOD_COLORS.gaussian,
      steps: ['Expression coefficients', 'LAM Audio2Expression', 'Gaussian splatting render'],
      note: 'One-shot from photo. Client-side WebGL rendering at 110+ FPS mobile.',
    },
    videogen: {
      label: 'Video Gen Path',
      color: METHOD_COLORS.generative,
      steps: ['Emotion embedding', 'Conditioning signal for diffusion', 'Frame-by-frame pixel output'],
      note: 'No explicit 3D needed. Generator internalizes embodiment.',
    },
  };

  const active = paths[activePath];

  return (
    <div className="flex flex-col justify-center h-full px-12 max-w-7xl mx-auto">
      <h2 className="text-5xl font-bold mb-2">Audio2Face: The Bridge</h2>
      <div className="w-14 h-1 rounded-full mb-4" style={{ background: METHOD_COLORS.gaussian }} />
      <p className="text-xl text-[#bdb8af] mb-5">
        Audio-to-face is the shared building block. Same audio input, three different rendering backends.
      </p>

      {/* Pipeline via ReactFlow */}
      <div className="rounded-xl p-4 border border-[#3d3a36] bg-[#1d1c1a] mb-4">
        <SlideFlow
          accentColor={METHOD_COLORS.gaussian}
          nodes={[
            { id: 'audio', label: 'Audio Input' },
            { id: 'a2e', label: 'Audio2Emotion' },
            { id: 'viseme', label: 'Viseme + Emotion' },
            { id: 'rig', label: 'Rig Controls' },
          ]}
        />
        <div className="flex items-center justify-center gap-2 text-sm text-[#948d82] mt-2">
          <Layers size={14} />
          Open models: Audio2Face (NVIDIA), Audio2Expression (LAM), SadTalker, GeneFace++
        </div>
      </div>

      {/* Three output path tabs */}
      <div className="flex gap-2 mb-4">
        {(Object.entries(paths) as [PathId, typeof paths[PathId]][]).map(([id, path]) => (
          <button
            key={id}
            onClick={() => setActivePath(id)}
            className="px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors flex-1 text-center"
            style={{
              borderColor: activePath === id ? path.color : '#3d3a36',
              color: activePath === id ? path.color : '#bdb8af',
              background: activePath === id ? `${path.color}16` : '#181716',
            }}
          >
            {path.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl p-4 border border-[#3d3a36] bg-[#1d1c1a]">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-3 h-3 rounded-full" style={{ background: active.color }} />
          <h3 className="text-base font-semibold text-[#f5f2ec]">{active.label}</h3>
        </div>

        <SlideFlow
          accentColor={active.color}
          nodes={active.steps.map((step, i) => ({ id: `step-${i}`, label: step }))}
        />

        <p className="text-base text-[#bdb8af] mt-3">{active.note}</p>
      </div>
    </div>
  );
}

function SlideWhereIntelligenceLives() {
  return (
    <div className="flex flex-col justify-center h-full px-12 max-w-7xl mx-auto">
      <h2 className="text-5xl font-bold mb-2">Where Intelligence Lives</h2>
      <div className="w-14 h-1 rounded-full mb-4" style={{ background: METHOD_COLORS.gaussian }} />
      <p className="text-xl text-[#bdb8af] mb-5">
        Two paradigms for how avatars embody emotion and response behavior.
      </p>

      <div className="grid grid-cols-2 gap-5 mb-6">
        {/* Paradigm 1: External policy */}
        <div className="rounded-xl p-5 border border-[#3d3a36] bg-[#1d1c1a]">
          <div className="flex items-center gap-2 mb-3">
            <Cpu size={16} style={{ color: METHOD_COLORS.metahuman }} />
            <Brain size={16} style={{ color: METHOD_COLORS.gaussian }} />
          </div>
          <h3 className="text-sm font-bold text-[#f5f2ec] mb-2">
            Policy in AI, Embodiment in Renderer
          </h3>
          <p className="text-xs text-[#bdb8af] mb-4">
            An external AI decides what emotions to show. The renderer executes those explicit control signals on a rig or 3D representation.
          </p>

          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: METHOD_COLORS.metahuman }} />
              <span className="text-[#bdb8af]">MetaHuman + Audio2Face</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: METHOD_COLORS.gaussian }} />
              <span className="text-[#bdb8af]">Gaussian + LAM driver</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: METHOD_COLORS.gaussian }} />
              <span className="text-[#bdb8af]">TaoAvatar (90 FPS Vision Pro)</span>
            </div>
          </div>

          <div className="mt-4 text-[10px] text-[#948d82] px-2 py-1.5 rounded bg-[#242220]">
            Pros: Interpretable, debuggable, composable with any LLM
          </div>
        </div>

        {/* Paradigm 2: Embodiment in AI */}
        <div className="rounded-xl p-5 border border-[#3d3a36] bg-[#1d1c1a]">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} style={{ color: METHOD_COLORS.generative }} />
          </div>
          <h3 className="text-sm font-bold text-[#f5f2ec] mb-2">
            Embodiment in AI
          </h3>
          <p className="text-xs text-[#bdb8af] mb-4">
            The pixel generator itself internalizes emotional inference. No explicit rig needed -- the model learns what a nod or smile looks like.
          </p>

          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: METHOD_COLORS.generative }} />
              <span className="text-[#bdb8af]">Avatar Forcing (causal state)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: METHOD_COLORS.generative }} />
              <span className="text-[#bdb8af]">LiveTalk (streaming diffusion)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: METHOD_COLORS.generative }} />
              <span className="text-[#bdb8af]">SoulX-FlashHead (oracle guidance)</span>
            </div>
          </div>

          <div className="mt-4 text-[10px] text-[#948d82] px-2 py-1.5 rounded bg-[#242220]">
            Pros: Zero rigging, one-shot identity, richer emergent behavior
          </div>
        </div>
      </div>

      <div className="rounded-lg p-3 bg-[#242220] border border-[#3d3a36]">
        <p className="text-xs text-[#f5f2ec] text-center font-medium">
          <Eye size={12} className="inline mr-1" style={{ color: METHOD_COLORS.gaussian }} />
          Central question: Do we want emotion inference to control explicit rigs,
          or do we want the pixel generator to internalize it?
        </p>
      </div>
    </div>
  );
}

function SlideResearchFrontier() {
  type CategoryId = 'interactive' | 'streaming' | '3d_xr' | 'all';
  const [activeCategory, setActiveCategory] = useState<CategoryId>('all');

  const papers = [
    { name: 'Avatar Forcing', year: '2026', category: 'interactive' as const, metric: '<500ms E2E', speed: 9, realism: 7, control: 7, desc: 'Causal forcing keeps interaction state warm between turns.' },
    { name: 'Knot Forcing', year: '2026', category: 'interactive' as const, metric: 'Identity stable', speed: 7, realism: 8, control: 7, desc: 'Knot-based forcing prevents identity drift over long sessions.' },
    { name: 'StreamAvatar', year: '2025', category: 'streaming' as const, metric: 'Streaming 3DGS', speed: 8, realism: 7, control: 6, desc: 'Disentangled motion for real-time Gaussian avatar streaming.' },
    { name: 'SoulX-FlashHead', year: '2026', category: 'streaming' as const, metric: '32 FPS (8xH800)', speed: 8, realism: 8, control: 6, desc: 'Oracle-guided architecture for consistent real-time throughput.' },
    { name: 'LiveTalk', year: '2025', category: 'streaming' as const, metric: '40x fewer steps', speed: 8, realism: 6, control: 5, desc: 'Distillation compresses diffusion loops from dozens to a few steps.' },
    { name: 'MIDAS', year: '2026', category: '3d_xr' as const, metric: 'Multi-identity', speed: 6, realism: 8, control: 7, desc: 'Disentangled geometry and appearance for multi-identity Gaussian avatars.' },
    { name: 'ICo3D', year: '2026', category: '3d_xr' as const, metric: 'Gaze + expression', speed: 7, realism: 8, control: 8, desc: 'Interactive controllable 3D head avatars with gaze and fine expression.' },
    { name: 'FastGHA', year: '2026', category: '3d_xr' as const, metric: 'Fast generation', speed: 9, realism: 7, control: 6, desc: 'Gaussian head avatars from single image in under 2 seconds.' },
    { name: 'TaoAvatar', year: '2025', category: '3d_xr' as const, metric: '90 FPS Vision Pro', speed: 9, realism: 8, control: 8, desc: 'On-device Gaussian avatar for Apple Vision Pro at 90 FPS.' },
  ];

  const categories: Array<{ id: CategoryId; label: string }> = [
    { id: 'all', label: 'All' },
    { id: 'interactive', label: 'Interactive' },
    { id: 'streaming', label: 'Streaming' },
    { id: '3d_xr', label: '3D + XR' },
  ];

  const filtered = activeCategory === 'all' ? papers : papers.filter((p) => p.category === activeCategory);
  const [selectedPaper, setSelectedPaper] = useState(papers[0].name);
  const selected = papers.find((p) => p.name === selectedPaper) ?? papers[0];

  const metrics: Array<{ key: 'speed' | 'realism' | 'control'; label: string }> = [
    { key: 'speed', label: 'Speed' },
    { key: 'realism', label: 'Realism' },
    { key: 'control', label: 'Control' },
  ];

  const categoryColor = (cat: string) =>
    cat === 'interactive' ? METHOD_COLORS.generative : cat === 'streaming' ? METHOD_COLORS.generative : METHOD_COLORS.gaussian;

  return (
    <div className="flex flex-col justify-center h-full px-12 max-w-7xl mx-auto">
      <h2 className="text-5xl font-bold mb-2">Research Frontier (Late 2025 -- Feb 2026)</h2>
      <div className="w-14 h-1 rounded-full mb-4" style={{ background: METHOD_COLORS.gaussian }} />

      <div className="flex gap-2 mb-4">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className="px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wide border transition-colors"
            style={{
              borderColor: activeCategory === cat.id ? METHOD_COLORS.gaussian : '#3d3a36',
              color: activeCategory === cat.id ? '#f5f2ec' : '#bdb8af',
              background: activeCategory === cat.id ? `${METHOD_COLORS.gaussian}16` : '#181716',
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5 items-start">
        <div className="space-y-2">
          {filtered.map((paper) => {
            const isSelected = paper.name === selectedPaper;
            const color = categoryColor(paper.category);
            return (
              <button
                key={paper.name}
                onClick={() => setSelectedPaper(paper.name)}
                className="w-full text-left rounded-xl p-3 border transition-colors"
                style={{
                  borderColor: isSelected ? color : '#3d3a36',
                  background: isSelected ? `${color}12` : '#1d1c1a',
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-[#f5f2ec]">{paper.name} ({paper.year})</p>
                  <span className="text-xs font-mono" style={{ color }}>{paper.metric}</span>
                </div>
                <p className="text-xs text-[#bdb8af] mt-1 line-clamp-2">{paper.desc}</p>
              </button>
            );
          })}
        </div>

        <div className="rounded-xl p-4 border border-[#3d3a36] bg-[#1d1c1a]">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `${categoryColor(selected.category)}22` }}
            >
              <Sparkles size={18} style={{ color: categoryColor(selected.category) }} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#f5f2ec]">{selected.name} ({selected.year})</p>
              <p className="text-[11px] text-[#948d82]">{selected.metric}</p>
            </div>
          </div>

          <p className="text-xs text-[#bdb8af] mb-4">{selected.desc}</p>

          <div className="space-y-2.5">
            {metrics.map((metric) => (
              <div key={metric.key}>
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-[#bdb8af]">{metric.label}</span>
                  <span className="font-mono text-[#f5f2ec]">{selected[metric.key]}/10</span>
                </div>
                <div className="h-1.5 rounded-full bg-[#181716] overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${selected[metric.key] * 10}%`,
                      background: categoryColor(selected.category),
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SlideConvergenceUpdated() {
  const threeDCards = [
    {
      title: '3D as Explicit Representation',
      desc: 'Point clouds and meshes rendered directly. Full geometric control.',
      color: METHOD_COLORS.gaussian,
      examples: 'Gaussian Splatting, LAM, TaoAvatar',
    },
    {
      title: '3D as Learned Prior',
      desc: 'Tri-planes and implicit volumes inside the generator. 3D consistency without explicit meshes.',
      color: METHOD_COLORS.generative,
      examples: 'MIDAS tri-planes, SplattingAvatar',
    },
    {
      title: '3D as Control Signals',
      desc: 'Pose, landmarks, and depth maps guide a 2D generator. 3D informs but pixels remain 2D.',
      color: METHOD_COLORS.metahuman,
      examples: 'AUHead, LiveTalk pose conditioning',
    },
  ];

  const trends = [
    { text: 'Audio2Face bridges all three paradigms', color: METHOD_COLORS.gaussian },
    { text: 'MetaHuman + neural skin rendering', color: METHOD_COLORS.metahuman },
    { text: 'One-shot Gaussian from single photo (LAM)', color: METHOD_COLORS.gaussian },
    { text: 'Sub-500ms E2E conversational loops', color: METHOD_COLORS.generative },
    { text: 'On-device: TaoAvatar 90 FPS Vision Pro, LAM 110 FPS mobile', color: METHOD_COLORS.gaussian },
  ];

  return (
    <div className="flex flex-col justify-center h-full px-12 max-w-7xl mx-auto">
      <h2 className="text-5xl font-bold mb-2">Convergence & the Role of 3D</h2>
      <div className="w-14 h-1 rounded-full mb-4" style={{ background: METHOD_COLORS.gaussian }} />

      <div className="grid grid-cols-3 gap-4 mb-5">
        {threeDCards.map((card) => (
          <div key={card.title} className="rounded-xl p-4 border border-[#3d3a36] bg-[#1d1c1a]">
            <div className="w-2.5 h-2.5 rounded-full mb-2" style={{ background: card.color }} />
            <h3 className="text-base font-bold text-[#f5f2ec] mb-1">{card.title}</h3>
            <p className="text-sm text-[#bdb8af] mb-2">{card.desc}</p>
            <p className="text-sm text-[#948d82]">{card.examples}</p>
          </div>
        ))}
      </div>

      <h3 className="text-lg font-semibold text-[#f5f2ec] mb-3">Convergence Trends</h3>
      <div className="space-y-3">
        {trends.map((t, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: t.color }} />
            <span className="text-base text-[#f5f2ec]">{t.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SlideBuiltWithClaudeSkills() {
  return (
    <div className="flex flex-col justify-center h-full px-12 max-w-7xl mx-auto">
      <SlideMethodBadge method="Build Process" label="Claude Code + Skills" color={METHOD_COLORS.gaussian} />
      <h2 className="text-5xl font-bold mb-2">How I Built This Project</h2>
      <div className="w-14 h-1 rounded-full mb-4" style={{ background: METHOD_COLORS.gaussian }} />

      <p className="text-lg text-[#bdb8af] mb-5">
        This deck and site were built with iterative agent loops: inspect code, run skill cycles, verify claims against sources, patch, test, and publish artifacts.
      </p>

      <div className="mb-5">
        <SlideFlow
          accentColor={METHOD_COLORS.gaussian}
          nodes={[
            { id: 'scan', label: 'Scan Repo + Live Pages' },
            { id: 'skill', label: 'Run Skills (MetaHuman / Full-Modality)' },
            { id: 'patch', label: 'Patch Code + Slides' },
            { id: 'verify', label: 'Verify Claims + Lint' },
            { id: 'publish', label: 'Publish docs to web/public/docs' },
          ]}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="rounded-xl p-4 border border-[#3d3a36] bg-[#1d1c1a]">
          <h3 className="text-lg font-semibold mb-2 text-[#f5f2ec]">Skills Used</h3>
          <ul className="space-y-1.5 text-sm text-[#bdb8af]">
            <li>`metahuman-evolver`: Unreal plugin architecture + dependency graph</li>
            <li>`full-modality-social-evolver`: slide claim checks + ArXiv/GitHub deltas</li>
            <li>Self-evolving state/events memory for repeatable improvement cycles</li>
          </ul>
        </div>

        <div className="rounded-xl p-4 border border-[#3d3a36] bg-[#1d1c1a]">
          <h3 className="text-lg font-semibold mb-2 text-[#f5f2ec]">Continuous Outputs</h3>
          <ul className="space-y-1.5 text-sm text-[#bdb8af]">
            <li>`full-modality-research-latest.md/json`</li>
            <li>`full-modality-claim-check-latest.json`</li>
            <li>`metahuman-architecture-latest.json`</li>
            <li>`metahuman-dependency-graph-latest.json/.mmd`</li>
          </ul>
        </div>
      </div>

      <div className="rounded-xl p-4 border border-[#3d3a36] bg-[#1d1c1a]">
        <p className="text-sm text-[#948d82] mb-2">Typical cycle command</p>
        <code className="text-sm text-[#f5f2ec] break-all">
          python .claude/skills/full-modality-social-evolver/scripts/evolve_social_modality_research.py
        </code>
      </div>
    </div>
  );
}

function SlideThankYou() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-12">
      <h2 className="text-6xl sm:text-7xl font-bold mb-8">Thank You</h2>
      <div
        className="w-16 h-1 rounded-full mb-10"
        style={{ background: METHOD_COLORS.gaussian }}
      />

      <div className="space-y-3 mb-12">
        <a
          href="https://realtime-avatars.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-base hover:underline justify-center"
          style={{ color: METHOD_COLORS.gaussian }}
        >
          <Globe size={16} />
          realtime-avatars.vercel.app
        </a>
        <a
          href={PROJECT_REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-base hover:underline justify-center"
          style={{ color: METHOD_COLORS.gaussian }}
        >
          <Github size={16} />
          github.com/pajamadot/realtime-avatars
        </a>
      </div>

      <p className="text-2xl font-semibold text-white/80">Questions?</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SLIDES ARRAY
   ═══════════════════════════════════════════════════════════════ */

const SLIDES: React.FC[] = [
  SlideTitle,                    // 1
  SlideAboutMe,                  // 2
  SlideProblem,                  // 3
  SlideThreeApproaches,          // 4
  SlideSignalsInteraction,       // 5  NEW
  SlideMetahumanHow,             // 6
  SlideMetahumanMechanism,       // 7
  SlideMetahumanDemo,            // 8
  SlideGenerativeHow,            // 9
  SlideGenerativeMechanism,      // 10
  SlideGenerativeResearch,       // 11
  SlideGenerativeDemo,           // 12
  SlideGaussianHow,              // 13
  SlideGaussianMechanism,        // 14
  SlideGaussianCovariance,       // 15
  SlideGaussianPerf,             // 16
  SlideGaussianDemo,             // 17
  SlideGaussianWorldlabsDemo,    // 18 NEW
  SlideStreamingArchitecture,    // 19
  SlideCapabilityMatrix,         // 20 NEW
  SlideComparison,               // 21
  SlideRealTimeMetrics,          // 22 NEW
  SlideE2EPipeline,              // 23
  SlideAudio2FaceBuildingBlocks, // 24 NEW
  SlideWhereIntelligenceLives,   // 25 NEW
  SlideResearchFrontier,         // 26 NEW
  SlideConvergenceUpdated,       // 27 REPLACED
  SlideBuiltWithClaudeSkills,    // 28 NEW
  SlideThankYou,                 // 29
];

/* ═══════════════════════════════════════════════════════════════
   MAIN SLIDES PAGE
   ═══════════════════════════════════════════════════════════════ */

export default function SlidesDeck({ initialSlide = 1, onExit }: { initialSlide?: number; onExit?: () => void }) {
  const router = useRouter();
  const [current, setCurrent] = useState(() => clampSlideNumber(initialSlide) - 1);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  // Sync URL on initial mount (e.g. /slides -> /slides/1)
  useEffect(() => {
    if (!onExit && typeof window !== 'undefined') {
      const slideNum = clampSlideNumber(initialSlide);
      window.history.replaceState(null, '', `/slides/${slideNum}`);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const goTo = useCallback(
    (index: number, dir: 'left' | 'right') => {
      if (isAnimating || index < 0 || index >= TOTAL_SLIDES || index === current) return;
      setDirection(dir);
      setIsAnimating(true);
      setTimeout(() => {
        setCurrent(index);
        if (!onExit) {
          router.replace(`/slides/${index + 1}`, { scroll: false });
        }
        setDirection(null);
        setIsAnimating(false);
      }, 300);
    },
    [current, isAnimating, onExit, router]
  );

  const next = useCallback(() => {
    if (current < TOTAL_SLIDES - 1) goTo(current + 1, 'right');
  }, [current, goTo]);

  const prev = useCallback(() => {
    if (current > 0) goTo(current - 1, 'left');
  }, [current, goTo]);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }, []);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          next();
          break;
        case ' ':
          if (e.target instanceof HTMLButtonElement) return;
          e.preventDefault();
          next();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          prev();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'Escape':
          if (document.fullscreenElement) {
            document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
          } else if (onExit) {
            onExit();
          } else {
            window.location.href = '/';
          }
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [next, prev, toggleFullscreen, onExit]);

  // Fullscreen change listener
  useEffect(() => {
    function handleFSChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener('fullscreenchange', handleFSChange);
    return () => document.removeEventListener('fullscreenchange', handleFSChange);
  }, []);

  // Touch swipe support
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function handleTouchStart(e: TouchEvent) {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    }

    function handleTouchEnd(e: TouchEvent) {
      const deltaX = e.changedTouches[0].clientX - touchStartX.current;
      const deltaY = e.changedTouches[0].clientY - touchStartY.current;

      // Only trigger if horizontal swipe is dominant and significant
      if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
        if (deltaX < 0) {
          next();
        } else {
          prev();
        }
      }
    }

    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [next, prev]);

  const CurrentSlide = SLIDES[current];

  // Compute animation style
  const slideStyle: React.CSSProperties = {
    transition: 'opacity 300ms ease, transform 300ms ease',
    opacity: direction ? 0 : 1,
    transform: direction === 'right'
      ? 'translateX(60px)'
      : direction === 'left'
        ? 'translateX(-60px)'
        : 'translateX(0)',
  };

  return (
    <div
      ref={containerRef}
      className="slides-root fixed inset-0 bg-[#111110] text-[#f5f2ec] flex flex-col select-none overflow-hidden"
    >
      <style>{`.slides-root h1,.slides-root h2,.slides-root h3,.slides-root h4{color:#ffffff}`}</style>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 z-10 flex-shrink-0">
        {onExit ? (
          <button
            onClick={onExit}
            className="flex items-center gap-1.5 text-sm text-[#948d82] hover:text-[#bdb8af] transition-colors"
          >
            <ArrowLeft size={16} />
            Article
          </button>
        ) : (
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-[#948d82] hover:text-[#bdb8af] transition-colors"
          >
            <ArrowLeft size={16} />
            Exit
          </Link>
        )}

        <div className="flex items-center gap-3">
          <span className="text-sm font-mono text-[#948d82]">
            {current + 1} / {TOTAL_SLIDES}
          </span>
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-md text-[#948d82] hover:text-[#bdb8af] hover:bg-[#242220] transition-colors"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>
        </div>
      </div>

      {/* Slide content area */}
      <div className="flex-1 relative min-h-0">
        {/* Navigation arrows (larger screens) */}
        <button
          onClick={prev}
          disabled={current === 0}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-lg text-[#948d82] hover:text-[#f5f2ec] hover:bg-[#242220] transition-colors disabled:opacity-20 disabled:cursor-default hidden sm:block"
          aria-label="Previous slide"
        >
          <ArrowLeft size={24} />
        </button>
        <button
          onClick={next}
          disabled={current === TOTAL_SLIDES - 1}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-lg text-[#948d82] hover:text-[#f5f2ec] hover:bg-[#242220] transition-colors disabled:opacity-20 disabled:cursor-default hidden sm:block"
          aria-label="Next slide"
        >
          <ArrowRight size={24} />
        </button>

        {/* Slide */}
        <div className="h-full px-4 sm:px-6" style={slideStyle}>
          <CurrentSlide />
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-1.5 py-3 flex-shrink-0">
        {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
          <button
            key={i}
            onClick={() => {
              if (i !== current) goTo(i, i > current ? 'right' : 'left');
            }}
            className="transition-all duration-200"
            style={{
              width: i === current ? 28 : 8,
              height: 8,
              borderRadius: 4,
              background: i === current ? METHOD_COLORS.gaussian : '#3d3a36',
            }}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
