'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
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
  Briefcase,
  User,
  Gamepad2,
  Headset,
  BookOpen,
  Palette,
  Users,
  ChevronRight,
} from 'lucide-react';
import dynamic from 'next/dynamic';

function DemoLoading() {
  return (
    <div className="flex items-center justify-center h-48 text-[#948d82]">
      <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

const BlendshapeDemo = dynamic(() => import('../learn/components/demos/metahuman/BlendshapeDemo'), { ssr: false, loading: () => <DemoLoading /> });
const DenoisingDemo = dynamic(() => import('../learn/components/demos/generative/DenoisingDemo'), { ssr: false, loading: () => <DemoLoading /> });
const PointCloudDemo = dynamic(() => import('../learn/components/demos/gaussian/PointCloudDemo'), { ssr: false, loading: () => <DemoLoading /> });
const CovarianceShapeDemo = dynamic(() => import('../learn/components/demos/gaussian/CovarianceShapeDemo'), { ssr: false, loading: () => <DemoLoading /> });
const SFUComparisonDemo = dynamic(() => import('../learn/components/demos/streaming/SFUComparisonDemo'), { ssr: false, loading: () => <DemoLoading /> });
const PipelineFlowDemo = dynamic(() => import('../learn/components/demos/endtoend/PipelineFlowDemo'), { ssr: false, loading: () => <DemoLoading /> });

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════ */

const TOTAL_SLIDES = 21;

const METHOD_COLORS = {
  metahuman: '#a78bdb',
  generative: '#6ec87a',
  gaussian: '#e08840',
} as const;

function SlideDemoWrapper({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <div
      className="rounded-xl border border-[#3d3a36] overflow-auto max-h-[480px]"
      style={{
        '--text-muted': '#948d82',
        '--text-primary': '#f5f2ec',
        '--border': '#3d3a36',
        '--border-strong': '#5d5a55',
        '--surface-0': '#111110',
        '--surface-1': '#181716',
        '--surface-2': '#1d1c1a',
        '--surface-3': '#242220',
        '--background': '#111110',
        '--accent': color || '#c4713b',
        '--foreground': '#f5f2ec',
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

function FormulaBlock({ children, color, label }: { children: React.ReactNode; color: string; label?: string }) {
  return (
    <div className="rounded-lg p-3 bg-[#181716] border border-[#3d3a36]">
      {label && (
        <div className="text-[10px] uppercase tracking-widest text-[#948d82] mb-1.5">{label}</div>
      )}
      <div className="font-mono text-center text-base leading-relaxed" style={{ color }}>
        {children}
      </div>
    </div>
  );
}

function SlideMethodBadge({ method, label, color }: { method: string; label?: string; color: string }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <div className="w-2 h-2 rounded-full" style={{ background: color }} />
      <span className="text-xs font-semibold uppercase tracking-widest" style={{ color }}>
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
        className="w-16 h-1 rounded-full mb-8"
        style={{ background: METHOD_COLORS.gaussian }}
      />
      <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight mb-6 text-white">
        Real-Time Digital Avatars:
        <br />
        <span style={{ color: METHOD_COLORS.gaussian }}>
          A Comparative Analysis
        </span>
      </h1>
      <p className="text-xl text-[#c4bfb6] max-w-2xl mb-10">
        Three approaches to making digital humans respond in real-time
      </p>
      <div className="flex flex-col items-center gap-1 text-[#948d82]">
        <span className="text-lg font-medium text-[#f5f2ec]">Yuntian Chai</span>
        <span className="text-sm">PajamaDot / Cogix</span>
      </div>
    </div>
  );
}

function SlideAboutMe() {
  const experiences = [
    { icon: Briefcase, text: 'Founder of PajamaDot, Co-founder of Cogix' },
    { icon: Gamepad2, text: 'Former Epic Games developer relations engineer (UE4/UE5, Shanghai 2018-2020)' },
    { icon: Video, text: 'Former Hedra software engineer (diffusion pipelines, 2024-2025)' },
    { icon: Headset, text: 'Co-founded UnrealLight Digital Tech for VR (2015-2017)' },
    { icon: GraduationCap, text: 'MCIT at University of Pennsylvania' },
    { icon: BookOpen, text: 'Psychology background (M.Ed + B.S., East China Normal University)' },
    { icon: Palette, text: 'Visual and Creative Art & Interactive Media at Sheridan College' },
  ];

  return (
    <div className="flex flex-col justify-center h-full px-8 max-w-3xl mx-auto">
      <h2 className="text-4xl font-bold mb-2 text-white">About Me</h2>
      <div
        className="w-14 h-1 rounded-full mb-8"
        style={{ background: METHOD_COLORS.gaussian }}
      />
      <div className="flex items-center gap-4 mb-8">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(196, 113, 59, 0.15)' }}
        >
          <User size={28} style={{ color: METHOD_COLORS.gaussian }} />
        </div>
        <div>
          <h3 className="text-2xl font-semibold text-white">Yuntian Chai</h3>
          <p className="text-[#bdb8af] text-sm">PajamaDot / Cogix</p>
        </div>
      </div>
      <p className="text-[#bdb8af] text-sm italic mb-8 max-w-xl">
        At the intersection of computer science, psychology, and art — building
        intelligent tools for human behavior research, interactive storytelling,
        and creative expression.
      </p>
      <ul className="space-y-4">
        {experiences.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <item.icon
              size={18}
              className="mt-0.5 flex-shrink-0"
              style={{ color: METHOD_COLORS.gaussian }}
            />
            <span className="text-[#bdb8af] text-base">{item.text}</span>
          </li>
        ))}
      </ul>
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
    <div className="flex flex-col justify-center h-full px-8 max-w-4xl mx-auto">
      <h2 className="text-4xl font-bold mb-2 text-white">Why Real-Time Avatars?</h2>
      <div
        className="w-14 h-1 rounded-full mb-8"
        style={{ background: METHOD_COLORS.gaussian }}
      />
      <div className="grid grid-cols-2 gap-6 mb-10">
        {useCases.map((uc) => (
          <div
            key={uc.label}
            className="rounded-xl p-5 border border-[#3d3a36] bg-[#1d1c1a]"
          >
            <uc.icon size={24} className="mb-3" style={{ color: METHOD_COLORS.gaussian }} />
            <h3 className="text-lg font-semibold mb-1 text-white">{uc.label}</h3>
            <p className="text-sm text-[#bdb8af]">{uc.desc}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-[#3d3a36] bg-[#1d1c1a] p-5">
        <h3 className="text-lg font-semibold mb-3 text-white">The Core Challenge</h3>
        <p className="text-[#bdb8af]">
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
      tagline: 'Neural 3D at 100+ FPS',
      desc: 'Learned radiance fields with real-time differentiable rendering',
    },
  ];

  return (
    <div className="flex flex-col justify-center h-full px-8 max-w-5xl mx-auto">
      <h2 className="text-4xl font-bold mb-2 text-white">Three Approaches</h2>
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
              className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
              style={{ background: `${m.color}22` }}
            >
              <m.icon size={22} style={{ color: m.color }} />
            </div>
            <h3 className="text-xl font-semibold mb-1" style={{ color: m.color }}>
              {m.name}
            </h3>
            <p className="text-sm font-medium text-[#f5f2ec] mb-2">
              {m.tagline}
            </p>
            <p className="text-sm text-[#948d82] mt-auto">{m.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SlideMetahumanHow() {
  const pipelineSteps = [
    'Camera / Audio',
    'ARKit / LiveLink',
    'Blendshapes',
    'Unreal Engine',
    '60+ FPS',
  ];

  return (
    <div className="flex flex-col justify-center h-full px-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-2 h-2 rounded-full"
          style={{ background: METHOD_COLORS.metahuman }}
        />
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: METHOD_COLORS.metahuman }}>
          MetaHuman
        </span>
      </div>
      <h2 className="text-4xl font-bold mb-2 text-white">How It Works</h2>
      <div
        className="w-14 h-1 rounded-full mb-8"
        style={{ background: METHOD_COLORS.metahuman }}
      />

      {/* Pipeline */}
      <div className="flex items-center gap-2 mb-10 flex-wrap">
        {pipelineSteps.map((step, i) => (
          <div key={step} className="flex items-center gap-2">
            <span
              className="px-4 py-2 rounded-lg text-sm font-medium border"
              style={{
                borderColor: METHOD_COLORS.metahuman,
                color: METHOD_COLORS.metahuman,
                background: `${METHOD_COLORS.metahuman}15`,
              }}
            >
              {step}
            </span>
            {i < pipelineSteps.length - 1 && (
              <ChevronRight size={16} className="text-[#948d82]" />
            )}
          </div>
        ))}
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
            className="rounded-xl p-4 border border-[#3d3a36] bg-[#1d1c1a] text-center"
          >
            <div className="text-2xl font-bold mb-1" style={{ color: METHOD_COLORS.metahuman }}>
              {stat.value}
            </div>
            <div className="text-xs text-[#948d82] uppercase tracking-wide">
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
    <div className="flex flex-col justify-center h-full px-8 max-w-5xl mx-auto">
      <SlideMethodBadge method="MetaHuman" color={METHOD_COLORS.metahuman} />
      <h2 className="text-3xl font-bold mb-2 text-white">Blendshapes & Facial Rigging</h2>
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
              <div key={s.unit} className="rounded-lg p-2.5 border border-[#3d3a36] bg-[#1d1c1a] text-center">
                <div className="text-lg font-bold font-mono" style={{ color: METHOD_COLORS.metahuman }}>
                  {s.value}<span className="text-xs ml-0.5 text-[#bdb8af]">{s.unit}</span>
                </div>
                <div className="text-[10px] text-[#948d82] mt-0.5">{s.desc}</div>
              </div>
            ))}
          </div>

          {/* How it works */}
          <div className="rounded-xl p-4 border border-[#3d3a36] bg-[#1d1c1a] space-y-2.5">
            <div className="flex items-start gap-2.5">
              <span className="text-xs font-bold px-1.5 py-0.5 rounded mt-0.5" style={{ background: `${METHOD_COLORS.metahuman}25`, color: METHOD_COLORS.metahuman }}>B<sub>i</sub></span>
              <p className="text-xs text-[#bdb8af]">Each blendshape is a <span className="text-[#f5f2ec]">vertex displacement map</span> -- a basis vector describing how the mesh deforms for one facial action unit.</p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-xs font-bold px-1.5 py-0.5 rounded mt-0.5" style={{ background: `${METHOD_COLORS.metahuman}25`, color: METHOD_COLORS.metahuman }}>w<sub>i</sub></span>
              <p className="text-xs text-[#bdb8af]">Weights range <span className="font-mono text-[#f5f2ec]">[0, 1]</span>. ARKit extracts these from camera in real-time. LiveLink streams to Unreal Engine.</p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-xs font-bold px-1.5 py-0.5 rounded mt-0.5" style={{ background: `${METHOD_COLORS.metahuman}25`, color: METHOD_COLORS.metahuman }}>&Sigma;</span>
              <p className="text-xs text-[#bdb8af]">Any expression = weighted sum. Try the presets: <span className="text-[#f5f2ec]">smile</span>, <span className="text-[#f5f2ec]">surprise</span>, <span className="text-[#f5f2ec]">angry</span> -- then adjust individual sliders.</p>
            </div>
          </div>
        </div>

        {/* Demo */}
        <SlideDemoWrapper color={METHOD_COLORS.metahuman}>
          <BlendshapeDemo />
        </SlideDemoWrapper>
      </div>
    </div>
  );
}

function SlideMetahumanDemo() {
  return (
    <div className="flex flex-col justify-center h-full px-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-2 h-2 rounded-full"
          style={{ background: METHOD_COLORS.metahuman }}
        />
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: METHOD_COLORS.metahuman }}>
          MetaHuman Demo
        </span>
      </div>
      <h2 className="text-3xl font-bold mb-1 text-white">Live Demo: Rapport MetaHuman</h2>
      <p className="text-[#bdb8af] text-sm mb-6">
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
  const pipelineSteps = [
    'Photo + Audio',
    'Diffusion / U-Net',
    'Decode',
    'WebRTC Stream',
  ];

  return (
    <div className="flex flex-col justify-center h-full px-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-2 h-2 rounded-full"
          style={{ background: METHOD_COLORS.generative }}
        />
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: METHOD_COLORS.generative }}>
          Video Generation
        </span>
      </div>
      <h2 className="text-4xl font-bold mb-2 text-white">How It Works</h2>
      <div
        className="w-14 h-1 rounded-full mb-6"
        style={{ background: METHOD_COLORS.generative }}
      />

      <p className="text-[#bdb8af] mb-6 text-base">
        Two components: diffusion models for synthesis, and streaming providers for real-time delivery.
      </p>

      {/* Pipeline */}
      <div className="flex items-center gap-2 mb-8 flex-wrap">
        {pipelineSteps.map((step, i) => (
          <div key={step} className="flex items-center gap-2">
            <span
              className="px-4 py-2 rounded-lg text-sm font-medium border"
              style={{
                borderColor: METHOD_COLORS.generative,
                color: METHOD_COLORS.generative,
                background: `${METHOD_COLORS.generative}15`,
              }}
            >
              {step}
            </span>
            {i < pipelineSteps.length - 1 && (
              <ChevronRight size={16} className="text-[#948d82]" />
            )}
          </div>
        ))}
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl p-4 border border-[#3d3a36] bg-[#1d1c1a] text-center">
          <div className="text-2xl font-bold mb-1" style={{ color: METHOD_COLORS.generative }}>
            24-32 FPS
          </div>
          <div className="text-xs text-[#948d82] uppercase tracking-wide">
            With distillation
          </div>
        </div>
        <div className="rounded-xl p-4 border border-[#3d3a36] bg-[#1d1c1a] text-center">
          <div className="text-2xl font-bold mb-1" style={{ color: METHOD_COLORS.generative }}>
            {'<'}500ms
          </div>
          <div className="text-xs text-[#948d82] uppercase tracking-wide">
            E2E with Avatar Forcing
          </div>
        </div>
      </div>
    </div>
  );
}

function SlideGenerativeMechanism() {
  return (
    <div className="flex flex-col justify-center h-full px-8 max-w-5xl mx-auto">
      <SlideMethodBadge method="Video Generation" color={METHOD_COLORS.generative} />
      <h2 className="text-3xl font-bold mb-2 text-white">The Denoising Process</h2>
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
            <div className="text-[10px] uppercase tracking-widest text-[#948d82] mb-2">Forward Process (add noise)</div>
            <div className="flex items-center gap-1 text-xs font-mono overflow-hidden">
              {['x\u2080', 'x\u2081', 'x\u2082', '\u2026', 'x\u209C'].map((label, i) => (
                <div key={i} className="flex items-center gap-1">
                  <span
                    className="px-2 py-1 rounded"
                    style={{
                      background: `rgba(93, 138, 102, ${0.4 - i * 0.08})`,
                      color: i < 4 ? '#f5f2ec' : '#948d82',
                    }}
                  >
                    {label}
                  </span>
                  {i < 4 && <ChevronRight size={10} className="text-[#948d82] flex-shrink-0" />}
                </div>
              ))}
            </div>
            <p className="text-[10px] text-[#948d82] mt-2">
              Add Gaussian noise at each step. At t=T, pure noise.
            </p>
          </div>

          {/* Reverse process steps */}
          <div className="rounded-xl p-4 border border-[#3d3a36] bg-[#1d1c1a] space-y-2">
            <div className="text-[10px] uppercase tracking-widest text-[#948d82] mb-1">Reverse Process (denoise)</div>
            {[
              { step: '1', text: 'U-Net predicts noise \u03B5\u03B8(x\u209C, t) at current step' },
              { step: '2', text: 'Subtract predicted noise, scaled by schedule (\u03B1, \u03B2)' },
              { step: '3', text: 'Repeat T\u219250 times for full denoising' },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-2">
                <span
                  className="text-[10px] font-bold w-4 h-4 rounded flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: `${METHOD_COLORS.generative}30`, color: METHOD_COLORS.generative }}
                >
                  {item.step}
                </span>
                <span className="text-xs text-[#bdb8af]">{item.text}</span>
              </div>
            ))}
          </div>

          {/* Distillation callout */}
          <div
            className="rounded-xl p-3 border text-center"
            style={{ borderColor: METHOD_COLORS.generative, background: `${METHOD_COLORS.generative}10` }}
          >
            <div className="flex items-center justify-center gap-3 text-sm">
              <span className="font-mono text-[#bdb8af]">50 steps</span>
              <span className="text-[#948d82]">&xrarr;</span>
              <span className="font-mono font-bold" style={{ color: METHOD_COLORS.generative }}>1-4 steps</span>
            </div>
            <p className="text-[10px] text-[#948d82] mt-1">Progressive distillation preserves quality at 40x speedup</p>
          </div>
        </div>

        {/* Demo */}
        <SlideDemoWrapper color={METHOD_COLORS.generative}>
          <DenoisingDemo />
        </SlideDemoWrapper>
      </div>
    </div>
  );
}

function SlideGenerativeResearch() {
  const papers = [
    { name: 'LiveTalk', stat: '40x distillation speedup', desc: 'Aggressive step reduction for real-time inference' },
    { name: 'Avatar Forcing', stat: '<500ms E2E latency', desc: 'Autoregressive forcing with causal attention' },
    { name: 'Self-Forcing', stat: 'Block-wise causal', desc: 'Self-supervised block attention for long sequences' },
  ];

  return (
    <div className="flex flex-col justify-center h-full px-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-2 h-2 rounded-full"
          style={{ background: METHOD_COLORS.generative }}
        />
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: METHOD_COLORS.generative }}>
          Video Generation
        </span>
      </div>
      <h2 className="text-4xl font-bold mb-2 text-white">Research Frontier</h2>
      <div
        className="w-14 h-1 rounded-full mb-8"
        style={{ background: METHOD_COLORS.generative }}
      />

      <div className="space-y-4 mb-8">
        {papers.map((p) => (
          <div
            key={p.name}
            className="rounded-xl p-5 border border-[#3d3a36] bg-[#1d1c1a] flex items-start gap-4"
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `${METHOD_COLORS.generative}22` }}
            >
              <Sparkles size={20} style={{ color: METHOD_COLORS.generative }} />
            </div>
            <div>
              <div className="flex items-baseline gap-3">
                <h3 className="text-base font-semibold">{p.name}</h3>
                <span className="text-sm font-mono" style={{ color: METHOD_COLORS.generative }}>
                  {p.stat}
                </span>
              </div>
              <p className="text-sm text-[#948d82] mt-1">{p.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="text-sm text-[#948d82]">
        7+ streaming providers: Hedra, Tavus, Simli, HeyGen, D-ID, Synthesia, Microsoft NOVA...
      </p>
    </div>
  );
}

function SlideGenerativeDemo() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center">
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-2 h-2 rounded-full"
          style={{ background: METHOD_COLORS.generative }}
        />
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: METHOD_COLORS.generative }}>
          Video Generation Demo
        </span>
      </div>
      <h2 className="text-3xl font-bold mb-1 text-white">Live Demo: LiveKit + Hedra</h2>
      <p className="text-[#bdb8af] text-sm mb-8 max-w-lg">
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

      <div className="flex items-center gap-2 text-xs text-[#948d82] mt-6">
        <Clock size={14} />
        <span>Requires LiveKit credentials</span>
      </div>
    </div>
  );
}

function SlideGaussianHow() {
  return (
    <div className="flex flex-col justify-center h-full px-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-2 h-2 rounded-full"
          style={{ background: METHOD_COLORS.gaussian }}
        />
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: METHOD_COLORS.gaussian }}>
          Gaussian Splatting
        </span>
      </div>
      <h2 className="text-4xl font-bold mb-2 text-white">How It Works</h2>
      <div
        className="w-14 h-1 rounded-full mb-8"
        style={{ background: METHOD_COLORS.gaussian }}
      />

      {/* Traditional vs One-shot */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="rounded-xl p-5 border border-[#3d3a36] bg-[#1d1c1a]">
          <h3 className="text-lg font-semibold mb-3 text-white">Traditional</h3>
          <ul className="space-y-2 text-sm text-[#bdb8af]">
            <li className="flex items-center gap-2">
              <ChevronRight size={14} style={{ color: METHOD_COLORS.gaussian }} />
              50-200 input images
            </li>
            <li className="flex items-center gap-2">
              <ChevronRight size={14} style={{ color: METHOD_COLORS.gaussian }} />
              Hours of training
            </li>
            <li className="flex items-center gap-2">
              <ChevronRight size={14} style={{ color: METHOD_COLORS.gaussian }} />
              100+ FPS rendering
            </li>
          </ul>
        </div>
        <div
          className="rounded-xl p-5 border bg-[#1d1c1a]"
          style={{ borderColor: METHOD_COLORS.gaussian }}
        >
          <h3 className="text-lg font-semibold mb-3" style={{ color: METHOD_COLORS.gaussian }}>
            One-Shot (LAM)
          </h3>
          <ul className="space-y-2 text-sm text-[#bdb8af]">
            <li className="flex items-center gap-2">
              <ChevronRight size={14} style={{ color: METHOD_COLORS.gaussian }} />
              1 photo input
            </li>
            <li className="flex items-center gap-2">
              <ChevronRight size={14} style={{ color: METHOD_COLORS.gaussian }} />
              ~1.4s inference
            </li>
            <li className="flex items-center gap-2">
              <ChevronRight size={14} style={{ color: METHOD_COLORS.gaussian }} />
              563 FPS (A100)
            </li>
          </ul>
        </div>
      </div>

      {/* Pipeline */}
      <div className="flex items-center gap-2 flex-wrap">
        {['Photo', 'LAM', '3D Gaussians', 'WebGL Render + Audio2Expression'].map((step, i) => (
          <div key={step} className="flex items-center gap-2">
            <span
              className="px-4 py-2 rounded-lg text-sm font-medium border"
              style={{
                borderColor: METHOD_COLORS.gaussian,
                color: METHOD_COLORS.gaussian,
                background: `${METHOD_COLORS.gaussian}15`,
              }}
            >
              {step}
            </span>
            {i < 3 && (
              <ChevronRight size={16} className="text-[#948d82]" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function SlideGaussianMechanism() {
  return (
    <div className="flex flex-col justify-center h-full px-8 max-w-5xl mx-auto">
      <SlideMethodBadge method="Gaussian Splatting" color={METHOD_COLORS.gaussian} />
      <h2 className="text-3xl font-bold mb-2 text-white">From Points to Splats</h2>
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
            <div className="text-[10px] uppercase tracking-widest text-[#948d82] mb-2.5">Learnable Parameters per Gaussian</div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { sym: '\u03BC', name: 'Position', desc: 'xyz center', color: '#ff6b6b' },
                { sym: '\u03A3', name: 'Covariance', desc: '3x3 shape', color: '#ffd93d' },
                { sym: 'c', name: 'Color', desc: 'SH coefficients', color: '#4ecdc4' },
                { sym: '\u03B1', name: 'Opacity', desc: '[0, 1] alpha', color: '#c9b1ff' },
              ].map((p) => (
                <div key={p.sym} className="flex items-center gap-2 p-2 rounded-lg bg-[#181716]">
                  <span
                    className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold font-mono"
                    style={{ background: `${p.color}25`, color: p.color }}
                  >
                    {p.sym}
                  </span>
                  <div>
                    <div className="text-xs font-medium text-[#f5f2ec]">{p.name}</div>
                    <div className="text-[10px] text-[#948d82]">{p.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Training pipeline */}
          <div className="rounded-xl p-4 border border-[#3d3a36] bg-[#1d1c1a]">
            <div className="text-[10px] uppercase tracking-widest text-[#948d82] mb-2">Optimization Loop</div>
            <div className="space-y-1.5">
              {[
                'Render Gaussians \u2192 2D image via differentiable rasterizer',
                'Compute photometric loss: L = ||I\u0302 - I||',
                'Backprop gradients to all Gaussian parameters',
                'Adaptive density: split under-reconstructed, prune low-\u03B1',
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span
                    className="text-[10px] font-bold w-4 h-4 rounded flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: `${METHOD_COLORS.gaussian}30`, color: METHOD_COLORS.gaussian }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-xs text-[#bdb8af]">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Demo */}
        <SlideDemoWrapper color={METHOD_COLORS.gaussian}>
          <PointCloudDemo />
        </SlideDemoWrapper>
      </div>
    </div>
  );
}

function SlideGaussianCovariance() {
  return (
    <div className="flex flex-col justify-center h-full px-8 max-w-5xl mx-auto">
      <SlideMethodBadge method="Gaussian Splatting" color={METHOD_COLORS.gaussian} />
      <h2 className="text-3xl font-bold mb-2 text-white">Covariance & Shape Control</h2>
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
            <div className="text-[10px] uppercase tracking-widest text-[#948d82] mb-2.5">Shape Controls</div>
            <div className="space-y-2">
              {[
                { shape: 'Sphere', formula: 'sx = sy = sz', use: 'Isotropic regions, distant points', icon: '\u25CF' },
                { shape: 'Pancake', formula: 'sx = sy \u226B sz', use: 'Flat surfaces, walls, skin', icon: '\u2B2D' },
                { shape: 'Needle', formula: 'sz \u226B sx = sy', use: 'Edges, hair strands, wires', icon: '\u2502' },
              ].map((s) => (
                <div key={s.shape} className="flex items-start gap-2.5 p-2 rounded-lg bg-[#181716]">
                  <span className="text-lg leading-none mt-0.5" style={{ color: METHOD_COLORS.gaussian }}>{s.icon}</span>
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-semibold text-[#f5f2ec]">{s.shape}</span>
                      <code className="text-[10px] text-[#948d82]">{s.formula}</code>
                    </div>
                    <div className="text-[10px] text-[#bdb8af]">{s.use}</div>
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
            <div className="text-xs font-semibold text-[#f5f2ec] mb-1">2D Splatting</div>
            <p className="text-[11px] text-[#bdb8af]">
              3D Gaussians project to <span className="text-[#f5f2ec]">2D ellipses</span> on screen.
              Alpha-composited front-to-back for differentiable rendering.
              Try the shape presets and auto-rotate in the demo.
            </p>
          </div>
        </div>

        {/* Demo */}
        <SlideDemoWrapper color={METHOD_COLORS.gaussian}>
          <CovarianceShapeDemo />
        </SlideDemoWrapper>
      </div>
    </div>
  );
}

function SlideGaussianPerf() {
  const benchmarks = [
    { system: 'LAM', fps: '563 FPS', hardware: 'A100 GPU', note: '110 FPS on mobile' },
    { system: 'GaussianTalker', fps: '120 FPS', hardware: 'Consumer GPU', note: 'After per-subject training' },
    { system: 'TaoAvatar', fps: '90 FPS', hardware: 'Apple Vision Pro', note: 'On-device rendering' },
    { system: 'OpenAvatarChat', fps: '~2.2s E2E', hardware: 'Docker (self-hosted)', note: 'Full conversation latency' },
  ];

  return (
    <div className="flex flex-col justify-center h-full px-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-2 h-2 rounded-full"
          style={{ background: METHOD_COLORS.gaussian }}
        />
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: METHOD_COLORS.gaussian }}>
          Gaussian Splatting
        </span>
      </div>
      <h2 className="text-4xl font-bold mb-2 text-white">Performance</h2>
      <div
        className="w-14 h-1 rounded-full mb-8"
        style={{ background: METHOD_COLORS.gaussian }}
      />

      <div className="space-y-4">
        {benchmarks.map((b) => (
          <div
            key={b.system}
            className="rounded-xl p-5 border border-[#3d3a36] bg-[#1d1c1a] flex items-center gap-6"
          >
            <div className="min-w-[140px]">
              <h3 className="text-base font-semibold">{b.system}</h3>
              <span className="text-xs text-[#948d82]">{b.hardware}</span>
            </div>
            <div
              className="text-2xl font-bold font-mono"
              style={{ color: METHOD_COLORS.gaussian }}
            >
              {b.fps}
            </div>
            <div className="text-sm text-[#bdb8af] ml-auto">{b.note}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SlideGaussianDemo() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center">
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-2 h-2 rounded-full"
          style={{ background: METHOD_COLORS.gaussian }}
        />
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: METHOD_COLORS.gaussian }}>
          Gaussian Splatting Demo
        </span>
      </div>
      <h2 className="text-3xl font-bold mb-1 text-white">Live Demo: OpenAvatarChat + LAM</h2>
      <p className="text-[#bdb8af] text-sm mb-8 max-w-lg">
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

function SlideStreamingArchitecture() {
  return (
    <div className="flex flex-col justify-center h-full px-8 max-w-5xl mx-auto">
      <SlideMethodBadge method="Streaming" label="Streaming" color={METHOD_COLORS.generative} />
      <h2 className="text-3xl font-bold mb-2 text-white">How It Reaches the User</h2>
      <div className="w-14 h-1 rounded-full mb-5" style={{ background: METHOD_COLORS.generative }} />

      {/* Connection formulas comparison */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { name: 'P2P (Mesh)', formula: 'N(N-1)/2', example: '4p = 6', latency: '~50ms', color: '#ff6b6b' },
          { name: 'SFU', formula: 'N', example: '4p = 4', latency: '~100ms', color: '#3498db' },
          { name: 'MCU', formula: 'N', example: '4p = 4', latency: '~200ms', color: '#9b59b6' },
        ].map((arch) => (
          <div key={arch.name} className="rounded-lg p-3 border border-[#3d3a36] bg-[#181716] text-center">
            <div className="text-xs font-semibold mb-1" style={{ color: arch.color }}>{arch.name}</div>
            <div className="font-mono text-sm text-[#f5f2ec]">{arch.formula}</div>
            <div className="text-[10px] text-[#948d82] mt-1">
              {arch.example} &middot; {arch.latency}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5 items-start">
        {/* Architecture details */}
        <div className="space-y-2.5">
          {[
            {
              name: 'P2P',
              color: '#ff6b6b',
              desc: 'Direct connections. Lowest latency, no server cost, but each client uploads to every peer.',
              badge: 'N\u00B2 scaling',
            },
            {
              name: 'SFU',
              color: '#3498db',
              desc: 'Server forwards without processing. Used by LiveKit, Twilio, Agora. The standard for avatar streaming.',
              badge: 'Avatar pattern',
            },
            {
              name: 'MCU',
              color: '#9b59b6',
              desc: 'Server transcodes and mixes all streams. Lowest client bandwidth but highest server CPU and latency.',
              badge: 'Max scalability',
            },
          ].map((arch) => (
            <div key={arch.name} className="flex items-start gap-3 rounded-xl p-3 border border-[#3d3a36] bg-[#1d1c1a]">
              <span
                className="text-[10px] font-bold px-2 py-1 rounded flex-shrink-0 mt-0.5"
                style={{ background: `${arch.color}25`, color: arch.color }}
              >
                {arch.name}
              </span>
              <div className="min-w-0">
                <p className="text-xs text-[#bdb8af]">{arch.desc}</p>
                <span className="inline-block text-[10px] mt-1 px-1.5 py-0.5 rounded bg-[#181716] text-[#948d82]">{arch.badge}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Demo */}
        <SlideDemoWrapper color={METHOD_COLORS.generative}>
          <SFUComparisonDemo />
        </SlideDemoWrapper>
      </div>
    </div>
  );
}

function SlideComparison() {
  const rows = [
    { label: 'Latency', metahuman: '< 16ms (60 FPS)', generative: '< 500ms (Avatar Forcing)', gaussian: '< 10ms (100+ FPS)' },
    { label: 'Quality', metahuman: 'Stylized realism', generative: 'Photorealistic', gaussian: 'Near-photorealistic' },
    { label: 'Setup', metahuman: 'UE5 + MetaHuman Creator', generative: 'Single photo + API', gaussian: '1 photo (LAM) or multi-view' },
    { label: 'Hardware', metahuman: 'GPU server or cloud', generative: 'Cloud GPU (provider)', gaussian: 'Mobile to A100' },
    { label: 'Cost', metahuman: 'High (UE licensing)', generative: 'Per-minute API', gaussian: 'Low (self-hosted)' },
    { label: 'Best For', metahuman: 'AAA games, brand avatars', generative: 'Quick deploy, any face', gaussian: 'On-device, research' },
  ];

  return (
    <div className="flex flex-col justify-center h-full px-8 max-w-5xl mx-auto">
      <h2 className="text-4xl font-bold mb-2 text-white">Comparison</h2>
      <div
        className="w-14 h-1 rounded-full mb-8"
        style={{ background: METHOD_COLORS.gaussian }}
      />

      <div className="rounded-xl border border-[#3d3a36] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left p-3 bg-[#242220] text-[#948d82] font-medium border-b border-[#3d3a36]" />
              <th
                className="text-left p-3 font-semibold border-b"
                style={{ background: `${METHOD_COLORS.metahuman}18`, color: METHOD_COLORS.metahuman, borderColor: '#3d3a36' }}
              >
                MetaHuman
              </th>
              <th
                className="text-left p-3 font-semibold border-b"
                style={{ background: `${METHOD_COLORS.generative}18`, color: METHOD_COLORS.generative, borderColor: '#3d3a36' }}
              >
                Video Generation
              </th>
              <th
                className="text-left p-3 font-semibold border-b"
                style={{ background: `${METHOD_COLORS.gaussian}18`, color: METHOD_COLORS.gaussian, borderColor: '#3d3a36' }}
              >
                Gaussian Splatting
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.label}
                className={i % 2 === 0 ? 'bg-[#111110]' : 'bg-[#1d1c1a]'}
              >
                <td className="p-3 font-medium text-[#f5f2ec] border-r border-[#3d3a36]">
                  {row.label}
                </td>
                <td className="p-3 text-[#bdb8af]">{row.metahuman}</td>
                <td className="p-3 text-[#bdb8af]">{row.generative}</td>
                <td className="p-3 text-[#bdb8af]">{row.gaussian}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SlideE2EPipeline() {
  return (
    <div className="flex flex-col justify-center h-full px-8 max-w-5xl mx-auto">
      <SlideMethodBadge method="End-to-End" color={METHOD_COLORS.gaussian} />
      <h2 className="text-3xl font-bold mb-2 text-white">The Full Loop</h2>
      <div className="w-14 h-1 rounded-full mb-4" style={{ background: METHOD_COLORS.gaussian }} />

      {/* Formula + latency breakdown side by side */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <FormulaBlock color={METHOD_COLORS.gaussian} label="Total Latency">
          L<sub>total</sub> ={' '}
          <span className="text-[#bdb8af]">&Sigma;</span> L<sub>i</sub> ={' '}
          <span className="text-[#4ecdc4]">L<sub>vad</sub></span> +{' '}
          <span className="text-[#45b7d1]">L<sub>stt</sub></span> +{' '}
          <span className="text-[#96ceb4]">L<sub>llm</sub></span> +{' '}
          <span className="text-[#ffd93d]">L<sub>tts</sub></span> +{' '}
          <span className="text-[#ff6b6b]">L<sub>av</sub></span> +{' '}
          <span className="text-[#c9b1ff]">L<sub>str</sub></span>
        </FormulaBlock>

        {/* Latency range bar */}
        <div className="rounded-lg p-3 bg-[#181716] border border-[#3d3a36] flex flex-col justify-center">
          <div className="text-[10px] uppercase tracking-widest text-[#948d82] mb-2">Typical Range</div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-3 rounded-full bg-[#1d1c1a] overflow-hidden relative">
              <div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  width: '30%',
                  background: `linear-gradient(90deg, ${METHOD_COLORS.generative}, ${METHOD_COLORS.gaussian})`,
                  opacity: 0.6,
                }}
              />
              <div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  width: '100%',
                  background: `linear-gradient(90deg, ${METHOD_COLORS.generative}40, ${METHOD_COLORS.gaussian}40)`,
                }}
              />
            </div>
          </div>
          <div className="flex justify-between text-[10px] font-mono mt-1">
            <span style={{ color: METHOD_COLORS.generative }}>530ms</span>
            <span className="text-[#948d82]">streaming overlaps stages</span>
            <span style={{ color: METHOD_COLORS.gaussian }}>1800ms</span>
          </div>
        </div>
      </div>

      {/* Stage color legend */}
      <div className="flex items-center gap-3 mb-3 text-[10px]">
        {[
          { name: 'VAD', color: '#4ecdc4', ms: '100-300' },
          { name: 'STT', color: '#45b7d1', ms: '100-400' },
          { name: 'LLM', color: '#96ceb4', ms: '150-500' },
          { name: 'TTS', color: '#ffd93d', ms: '100-300' },
          { name: 'Avatar', color: '#ff6b6b', ms: '50-200' },
          { name: 'Stream', color: '#c9b1ff', ms: '30-100' },
        ].map((s) => (
          <div key={s.name} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-sm" style={{ background: s.color }} />
            <span className="text-[#bdb8af]">{s.name}</span>
            <span className="text-[#948d82] font-mono">{s.ms}</span>
          </div>
        ))}
      </div>

      <SlideDemoWrapper color={METHOD_COLORS.gaussian}>
        <PipelineFlowDemo />
      </SlideDemoWrapper>
    </div>
  );
}

function SlideConvergence() {
  const trends = [
    { text: 'MetaHuman + neural skin rendering', color: METHOD_COLORS.metahuman },
    { text: 'One-shot Gaussian from single photo (LAM)', color: METHOD_COLORS.gaussian },
    { text: 'Sub-200ms E2E conversational loops', color: METHOD_COLORS.generative },
    { text: 'On-device: TaoAvatar 90 FPS Vision Pro, LAM 110 FPS mobile', color: METHOD_COLORS.gaussian },
  ];

  return (
    <div className="flex flex-col justify-center h-full px-8 max-w-4xl mx-auto">
      <h2 className="text-4xl font-bold mb-2 text-white">Convergence & Future</h2>
      <div
        className="w-14 h-1 rounded-full mb-6"
        style={{ background: METHOD_COLORS.gaussian }}
      />
      <p className="text-xl text-[#bdb8af] mb-10">
        These approaches are converging -- each borrowing techniques from the others.
      </p>

      <div className="space-y-5">
        {trends.map((t, i) => (
          <div key={i} className="flex items-center gap-4">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ background: t.color }}
            />
            <span className="text-lg text-[#f5f2ec]">{t.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SlideThankYou() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <h2 className="text-5xl sm:text-6xl font-bold mb-8 text-white">Thank You</h2>
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
          href="https://github.com/PajamaDot/realtime-avatars"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-base hover:underline justify-center"
          style={{ color: METHOD_COLORS.gaussian }}
        >
          <ExternalLink size={16} />
          github.com/PajamaDot/realtime-avatars
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
  SlideTitle,                 // 1
  SlideAboutMe,               // 2
  SlideProblem,               // 3
  SlideThreeApproaches,       // 4
  SlideMetahumanHow,          // 5
  SlideMetahumanMechanism,    // 6  NEW
  SlideMetahumanDemo,         // 7
  SlideGenerativeHow,         // 8
  SlideGenerativeMechanism,   // 9  NEW
  SlideGenerativeResearch,    // 10
  SlideGenerativeDemo,        // 11
  SlideGaussianHow,           // 12
  SlideGaussianMechanism,     // 13 NEW
  SlideGaussianCovariance,    // 14 NEW
  SlideGaussianPerf,          // 15
  SlideGaussianDemo,          // 16
  SlideStreamingArchitecture, // 17 NEW
  SlideComparison,            // 18
  SlideE2EPipeline,           // 19 NEW
  SlideConvergence,           // 20
  SlideThankYou,              // 21
];

/* ═══════════════════════════════════════════════════════════════
   MAIN SLIDES PAGE
   ═══════════════════════════════════════════════════════════════ */

export default function SlidesPage() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const goTo = useCallback(
    (index: number, dir: 'left' | 'right') => {
      if (isAnimating || index < 0 || index >= TOTAL_SLIDES || index === current) return;
      setDirection(dir);
      setIsAnimating(true);
      // After a brief moment, switch the slide
      setTimeout(() => {
        setCurrent(index);
        setDirection(null);
        setIsAnimating(false);
      }, 300);
    },
    [current, isAnimating]
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
          } else {
            window.location.href = '/';
          }
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [next, prev, toggleFullscreen]);

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
      className="fixed inset-0 bg-[#111110] text-[#f5f2ec] flex flex-col select-none overflow-hidden"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 z-10 flex-shrink-0">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs text-[#948d82] hover:text-[#bdb8af] transition-colors"
        >
          <ArrowLeft size={14} />
          Exit
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-[#948d82]">
            {current + 1} / {TOTAL_SLIDES}
          </span>
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-md text-[#948d82] hover:text-[#bdb8af] hover:bg-[#242220] transition-colors"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
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
          <ArrowLeft size={20} />
        </button>
        <button
          onClick={next}
          disabled={current === TOTAL_SLIDES - 1}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-lg text-[#948d82] hover:text-[#f5f2ec] hover:bg-[#242220] transition-colors disabled:opacity-20 disabled:cursor-default hidden sm:block"
          aria-label="Next slide"
        >
          <ArrowRight size={20} />
        </button>

        {/* Slide */}
        <div className="h-full px-4 sm:px-12" style={slideStyle}>
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
              width: i === current ? 24 : 6,
              height: 6,
              borderRadius: 3,
              background: i === current ? METHOD_COLORS.gaussian : '#3d3a36',
            }}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
