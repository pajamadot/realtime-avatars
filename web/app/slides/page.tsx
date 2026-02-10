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
  Users,
  ChevronRight,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════ */

const TOTAL_SLIDES = 15;

const METHOD_COLORS = {
  metahuman: '#7c6a9c',
  generative: '#5d8a66',
  gaussian: '#c4713b',
} as const;

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
      <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight mb-6">
        Real-Time Digital Avatars:
        <br />
        <span style={{ color: METHOD_COLORS.gaussian }}>
          A Comparative Analysis
        </span>
      </h1>
      <p className="text-xl text-[#a8a29e] max-w-2xl mb-10">
        Three approaches to making digital humans respond in real-time
      </p>
      <div className="flex flex-col items-center gap-1 text-[#787268]">
        <span className="text-lg font-medium text-[#e8e4dd]">Yuntian Chai</span>
        <span className="text-sm">PajamaDot / Cogix</span>
      </div>
    </div>
  );
}

function SlideAboutMe() {
  const experiences = [
    { icon: Briefcase, text: 'Founder of PajamaDot, Co-founder of Cogix' },
    { icon: Gamepad2, text: 'Former Epic Games developer relations engineer (UE4, Shanghai 2018-2020)' },
    { icon: Video, text: 'Former Hedra software engineer (diffusion pipelines, 2024-2025)' },
    { icon: Headset, text: 'Co-founded UnrealLight Digital Tech for VR (2015-2017)' },
    { icon: GraduationCap, text: 'Pursuing MCIT at University of Pennsylvania' },
    { icon: BookOpen, text: 'Psychology background (M.Ed + B.S., East China Normal University)' },
  ];

  return (
    <div className="flex flex-col justify-center h-full px-8 max-w-3xl mx-auto">
      <h2 className="text-4xl font-bold mb-2">About Me</h2>
      <div
        className="w-12 h-1 rounded-full mb-8"
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
          <h3 className="text-2xl font-semibold">Yuntian Chai</h3>
          <p className="text-[#a8a29e] text-sm">PajamaDot / Cogix</p>
        </div>
      </div>
      <ul className="space-y-4">
        {experiences.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <item.icon
              size={18}
              className="mt-0.5 flex-shrink-0"
              style={{ color: METHOD_COLORS.gaussian }}
            />
            <span className="text-[#a8a29e] text-base">{item.text}</span>
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
      <h2 className="text-4xl font-bold mb-2">Why Real-Time Avatars?</h2>
      <div
        className="w-12 h-1 rounded-full mb-8"
        style={{ background: METHOD_COLORS.gaussian }}
      />
      <div className="grid grid-cols-2 gap-6 mb-10">
        {useCases.map((uc) => (
          <div
            key={uc.label}
            className="rounded-xl p-5 border border-[#3a3835] bg-[#232220]"
          >
            <uc.icon size={24} className="mb-3" style={{ color: METHOD_COLORS.gaussian }} />
            <h3 className="text-lg font-semibold mb-1">{uc.label}</h3>
            <p className="text-sm text-[#a8a29e]">{uc.desc}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-[#3a3835] bg-[#232220] p-5">
        <h3 className="text-lg font-semibold mb-3">The Core Challenge</h3>
        <p className="text-[#a8a29e]">
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
      <h2 className="text-4xl font-bold mb-2">Three Approaches</h2>
      <div
        className="w-12 h-1 rounded-full mb-10"
        style={{ background: METHOD_COLORS.gaussian }}
      />
      <div className="grid grid-cols-3 gap-6">
        {methods.map((m) => (
          <div
            key={m.name}
            className="rounded-xl p-6 border bg-[#232220] flex flex-col"
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
            <p className="text-sm font-medium text-[#e8e4dd] mb-2">
              {m.tagline}
            </p>
            <p className="text-sm text-[#787268] mt-auto">{m.desc}</p>
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
      <h2 className="text-4xl font-bold mb-2">How It Works</h2>
      <div
        className="w-12 h-1 rounded-full mb-8"
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
              <ChevronRight size={16} className="text-[#787268]" />
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
            className="rounded-xl p-4 border border-[#3a3835] bg-[#232220] text-center"
          >
            <div className="text-2xl font-bold mb-1" style={{ color: METHOD_COLORS.metahuman }}>
              {stat.value}
            </div>
            <div className="text-xs text-[#787268] uppercase tracking-wide">
              {stat.label}
            </div>
          </div>
        ))}
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
      <h2 className="text-3xl font-bold mb-1">Live Demo: Rapport MetaHuman</h2>
      <p className="text-[#a8a29e] text-sm mb-6">
        Cloud-rendered Unreal Engine avatar via pixel streaming
      </p>

      <div className="rounded-xl border border-[#3a3835] overflow-hidden bg-[#1a1917] mb-4">
        <iframe
          src="https://app.rapport.cloud/?modal=true"
          title="Rapport MetaHuman Demo"
          className="w-full border-0"
          style={{ height: '420px' }}
          allow="camera; microphone; fullscreen"
          loading="lazy"
        />
      </div>

      <div className="flex items-center gap-2 text-xs text-[#787268]">
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
      <h2 className="text-4xl font-bold mb-2">How It Works</h2>
      <div
        className="w-12 h-1 rounded-full mb-6"
        style={{ background: METHOD_COLORS.generative }}
      />

      <p className="text-[#a8a29e] mb-6 text-base">
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
              <ChevronRight size={16} className="text-[#787268]" />
            )}
          </div>
        ))}
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl p-4 border border-[#3a3835] bg-[#232220] text-center">
          <div className="text-2xl font-bold mb-1" style={{ color: METHOD_COLORS.generative }}>
            24-32 FPS
          </div>
          <div className="text-xs text-[#787268] uppercase tracking-wide">
            With distillation
          </div>
        </div>
        <div className="rounded-xl p-4 border border-[#3a3835] bg-[#232220] text-center">
          <div className="text-2xl font-bold mb-1" style={{ color: METHOD_COLORS.generative }}>
            {'<'}500ms
          </div>
          <div className="text-xs text-[#787268] uppercase tracking-wide">
            E2E with Avatar Forcing
          </div>
        </div>
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
      <h2 className="text-4xl font-bold mb-2">Research Frontier</h2>
      <div
        className="w-12 h-1 rounded-full mb-8"
        style={{ background: METHOD_COLORS.generative }}
      />

      <div className="space-y-4 mb-8">
        {papers.map((p) => (
          <div
            key={p.name}
            className="rounded-xl p-5 border border-[#3a3835] bg-[#232220] flex items-start gap-4"
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
              <p className="text-sm text-[#787268] mt-1">{p.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="text-sm text-[#787268]">
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
      <h2 className="text-3xl font-bold mb-1">Live Demo: LiveKit + Hedra</h2>
      <p className="text-[#a8a29e] text-sm mb-8 max-w-lg">
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

      <div className="flex items-center gap-2 text-xs text-[#787268] mt-6">
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
      <h2 className="text-4xl font-bold mb-2">How It Works</h2>
      <div
        className="w-12 h-1 rounded-full mb-8"
        style={{ background: METHOD_COLORS.gaussian }}
      />

      {/* Traditional vs One-shot */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="rounded-xl p-5 border border-[#3a3835] bg-[#232220]">
          <h3 className="text-lg font-semibold mb-3">Traditional</h3>
          <ul className="space-y-2 text-sm text-[#a8a29e]">
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
          className="rounded-xl p-5 border bg-[#232220]"
          style={{ borderColor: METHOD_COLORS.gaussian }}
        >
          <h3 className="text-lg font-semibold mb-3" style={{ color: METHOD_COLORS.gaussian }}>
            One-Shot (LAM)
          </h3>
          <ul className="space-y-2 text-sm text-[#a8a29e]">
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
              <ChevronRight size={16} className="text-[#787268]" />
            )}
          </div>
        ))}
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
      <h2 className="text-4xl font-bold mb-2">Performance</h2>
      <div
        className="w-12 h-1 rounded-full mb-8"
        style={{ background: METHOD_COLORS.gaussian }}
      />

      <div className="space-y-4">
        {benchmarks.map((b) => (
          <div
            key={b.system}
            className="rounded-xl p-5 border border-[#3a3835] bg-[#232220] flex items-center gap-6"
          >
            <div className="min-w-[140px]">
              <h3 className="text-base font-semibold">{b.system}</h3>
              <span className="text-xs text-[#787268]">{b.hardware}</span>
            </div>
            <div
              className="text-2xl font-bold font-mono"
              style={{ color: METHOD_COLORS.gaussian }}
            >
              {b.fps}
            </div>
            <div className="text-sm text-[#a8a29e] ml-auto">{b.note}</div>
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
      <h2 className="text-3xl font-bold mb-1">Live Demo: OpenAvatarChat + LAM</h2>
      <p className="text-[#a8a29e] text-sm mb-8 max-w-lg">
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

      <div className="flex items-center gap-2 text-xs text-[#787268] mt-6">
        <Cpu size={14} />
        <span>Requires local Docker setup (see gaussian-avatar/ directory)</span>
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
      <h2 className="text-4xl font-bold mb-2">Comparison</h2>
      <div
        className="w-12 h-1 rounded-full mb-8"
        style={{ background: METHOD_COLORS.gaussian }}
      />

      <div className="rounded-xl border border-[#3a3835] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left p-3 bg-[#2a2926] text-[#787268] font-medium border-b border-[#3a3835]" />
              <th
                className="text-left p-3 font-semibold border-b"
                style={{ background: `${METHOD_COLORS.metahuman}18`, color: METHOD_COLORS.metahuman, borderColor: '#3a3835' }}
              >
                MetaHuman
              </th>
              <th
                className="text-left p-3 font-semibold border-b"
                style={{ background: `${METHOD_COLORS.generative}18`, color: METHOD_COLORS.generative, borderColor: '#3a3835' }}
              >
                Video Generation
              </th>
              <th
                className="text-left p-3 font-semibold border-b"
                style={{ background: `${METHOD_COLORS.gaussian}18`, color: METHOD_COLORS.gaussian, borderColor: '#3a3835' }}
              >
                Gaussian Splatting
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.label}
                className={i % 2 === 0 ? 'bg-[#1a1917]' : 'bg-[#232220]'}
              >
                <td className="p-3 font-medium text-[#e8e4dd] border-r border-[#3a3835]">
                  {row.label}
                </td>
                <td className="p-3 text-[#a8a29e]">{row.metahuman}</td>
                <td className="p-3 text-[#a8a29e]">{row.generative}</td>
                <td className="p-3 text-[#a8a29e]">{row.gaussian}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
      <h2 className="text-4xl font-bold mb-2">Convergence & Future</h2>
      <div
        className="w-12 h-1 rounded-full mb-6"
        style={{ background: METHOD_COLORS.gaussian }}
      />
      <p className="text-xl text-[#a8a29e] mb-10">
        These approaches are converging -- each borrowing techniques from the others.
      </p>

      <div className="space-y-5">
        {trends.map((t, i) => (
          <div key={i} className="flex items-center gap-4">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ background: t.color }}
            />
            <span className="text-lg text-[#e8e4dd]">{t.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SlideThankYou() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <h2 className="text-5xl sm:text-6xl font-bold mb-8">Thank You</h2>
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

      <p className="text-2xl font-semibold text-[#a8a29e]">Questions?</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SLIDES ARRAY
   ═══════════════════════════════════════════════════════════════ */

const SLIDES: React.FC[] = [
  SlideTitle,
  SlideAboutMe,
  SlideProblem,
  SlideThreeApproaches,
  SlideMetahumanHow,
  SlideMetahumanDemo,
  SlideGenerativeHow,
  SlideGenerativeResearch,
  SlideGenerativeDemo,
  SlideGaussianHow,
  SlideGaussianPerf,
  SlideGaussianDemo,
  SlideComparison,
  SlideConvergence,
  SlideThankYou,
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
        case ' ':
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
      className="fixed inset-0 bg-[#1a1917] text-[#e8e4dd] flex flex-col select-none overflow-hidden"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 z-10 flex-shrink-0">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs text-[#787268] hover:text-[#a8a29e] transition-colors"
        >
          <ArrowLeft size={14} />
          Exit
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-[#787268]">
            {current + 1} / {TOTAL_SLIDES}
          </span>
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-md text-[#787268] hover:text-[#a8a29e] hover:bg-[#2a2926] transition-colors"
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
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-lg text-[#787268] hover:text-[#e8e4dd] hover:bg-[#2a2926] transition-colors disabled:opacity-20 disabled:cursor-default hidden sm:block"
          aria-label="Previous slide"
        >
          <ArrowLeft size={20} />
        </button>
        <button
          onClick={next}
          disabled={current === TOTAL_SLIDES - 1}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-lg text-[#787268] hover:text-[#e8e4dd] hover:bg-[#2a2926] transition-colors disabled:opacity-20 disabled:cursor-default hidden sm:block"
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
              background: i === current ? METHOD_COLORS.gaussian : '#3a3835',
            }}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
