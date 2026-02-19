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
import { Position } from '@xyflow/react';
import SlideFlow from './components/SlideFlow';
import GaussianVideoWall from '../components/GaussianVideoWall';
import gaussianVideoWallData from '../data/gaussian-video-wall.json';

/* 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?   CONSTANTS
   鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?*/

const TOTAL_SLIDES = 34;

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
const PROJECT_SKILLS_DIR_URL = 'https://github.com/pajamadot/realtime-avatars/tree/main/.claude/skills';
const SKILL_METAHUMAN_URL = 'https://github.com/pajamadot/realtime-avatars/blob/main/.claude/skills/metahuman-evolver/SKILL.md';
const SKILL_FULL_MODALITY_URL = 'https://github.com/pajamadot/realtime-avatars/blob/main/.claude/skills/full-modality-social-evolver/SKILL.md';
const SKILL_GAUSSIAN_WALL_URL = 'https://github.com/pajamadot/realtime-avatars/blob/main/.claude/skills/gaussian-youtube-video-wall-evolver/SKILL.md';
const SKILL_MULTIMODAL_IO_URL = 'https://github.com/pajamadot/realtime-avatars/blob/main/.claude/skills/multimodal-io-research-evolver/SKILL.md';
const SKILL_SLIDE_PROOFREADER_URL = 'https://github.com/pajamadot/realtime-avatars/blob/main/.claude/skills/slide-research-proofreader-evolver/SKILL.md';
const METAHUMAN_EVOLVER_ARCH_URL = 'https://github.com/pajamadot/realtime-avatars/blob/main/.claude/skills/metahuman-evolver/references/latest-architecture.json';
const METAHUMAN_EVOLVER_SUMMARY_URL = 'https://github.com/pajamadot/realtime-avatars/blob/main/.claude/skills/metahuman-evolver/references/latest-summary.md';
const MULTIMODAL_IO_REPORT_URL = 'https://github.com/pajamadot/realtime-avatars/blob/main/.claude/skills/multimodal-io-research-evolver/references/latest-report.md';
const FULL_MODALITY_REPORT_URL = 'https://github.com/pajamadot/realtime-avatars/blob/main/.claude/skills/full-modality-social-evolver/references/latest-report.md';
const FULL_MODALITY_CLAIM_CHECK_URL = 'https://github.com/pajamadot/realtime-avatars/blob/main/.claude/skills/full-modality-social-evolver/references/latest-claim-check.json';
const HEDRA_AVATAR_URL = 'https://www.hedra.com/app/avatar';
const WORLDLABS_MARBLE_APP_URL = 'https://marble.worldlabs.ai';
const SUPERSPLAT_DEMO_ONE_URL = 'https://superspl.at/view?id=bd964899';
const SUPERSPLAT_DEMO_TWO_URL = 'https://superspl.at/view?id=97a75605';
const PLAYCANVAS_PERSONAL_DEMO_URL = 'https://playcanv.as/p/ySwArvB0/';
const GAUSSIAN_VIDEO_WALL_ROUTE = '/gaussian-video-wall';
const EVIDENCE_URLS = {
  epicMetaHumanDocs: 'https://dev.epicgames.com/documentation/en-us/metahuman/metahuman-documentation',
  epicMetaHumansInUE: 'https://dev.epicgames.com/documentation/en-us/metahuman/metahumans-in-unreal-engine',
  epicMetaHumanAnimator: 'https://dev.epicgames.com/documentation/en-us/metahuman/metahuman-animator',
  epicMetaHumanLiveLink: 'https://dev.epicgames.com/documentation/en-us/metahuman/realtime-animation-using-live-link',
  epicMetaHumanAudioSource: 'https://dev.epicgames.com/documentation/en-us/metahuman/using-audio-source-for-animation',
  epicAudioDrivenAnimation: 'https://dev.epicgames.com/documentation/en-us/metahuman/audio-driven-animation',
  epicMeshToMetaHuman: 'https://dev.epicgames.com/documentation/en-us/metahuman/mesh-to-metahuman',
  epicRigLogicApi: 'https://dev.epicgames.com/documentation/en-us/unreal-engine/API/PluginIndex/RigLogic',
  nvidiaAudio2FaceBlog: 'https://developer.nvidia.com/blog/nvidia-open-sources-audio2face-animation-model/',
  nvidiaAudio2FaceRepo: 'https://github.com/NVIDIA/Audio2Face-3D',
  nvidiaAcePluginDocs: 'https://docs.nvidia.com/ace/ace-unreal-plugin/latest/index.html',
  openaiRealtimeApi: 'https://platform.openai.com/docs/guides/realtime',
  arxivDdpm: 'https://arxiv.org/abs/2006.11239',
  arxivProgressiveDistillation: 'https://arxiv.org/abs/2202.00512',
  arxiv3dgs: 'https://arxiv.org/abs/2308.04079',
  arxivTaoAvatar: 'https://arxiv.org/abs/2503.17032',
  arxivLAM: 'https://arxiv.org/abs/2502.17796',
  arxivMIDAS: 'https://arxiv.org/abs/2508.19320',
  arxivKnotForcing: 'https://arxiv.org/abs/2512.21734',
  arxivStreamAvatar: 'https://arxiv.org/abs/2512.22065',
  arxivLiveTalk: 'https://arxiv.org/abs/2512.23576',
  arxivAvatarForcing: 'https://arxiv.org/abs/2601.00664',
  arxivLivePortrait: 'https://arxiv.org/abs/2407.03168',
  arxivICo3D: 'https://arxiv.org/abs/2601.13148',
  arxivFastGHA: 'https://arxiv.org/abs/2601.13837',
  arxivSoulXFlashHead: 'https://arxiv.org/abs/2602.07449',
  arxivGazeGPT: 'https://arxiv.org/abs/2401.17217',
  githubAvatarForcing: 'https://github.com/TaekyungKi/AvatarForcing',
  githubSoulXFlashHead: 'https://github.com/Soul-AILab/SoulX-FlashHead',
  githubTaoAvatarMobileDemo: 'https://github.com/alibaba/MNN/blob/master/apps/Android/Mnn3dAvatar/README.md',
  pupilGpt4EyesDocs: 'https://docs.pupil-labs.com/alpha-lab/gpt4-eyes/',
  pupilGpt4EyesCode: 'https://gist.github.com/pupil-labs/1698f708a5dcd5f6f8f3da19741b7313',
} as const;
const SLIDE_FONT_SCALE = 1.2;
const SLIDE_TYPOGRAPHY_CSS = `
.slides-root {
  --slide-font-display: "Inter Tight", "Avenir Next", "Segoe UI", sans-serif;
  --slide-font-body: "Inter", "Segoe UI", sans-serif;
  --slide-font-mono: "JetBrains Mono", "SFMono-Regular", Consolas, monospace;
  --slide-button-fg: #e8dfd2;
  --slide-button-fg-hover: #ffffff;
  --slide-type--1: clamp(0.78rem, 0.74rem + 0.18vw, 0.9rem);
  --slide-type-0: clamp(0.9rem, 0.86rem + 0.24vw, 1.02rem);
  --slide-type-1: clamp(1.02rem, 0.95rem + 0.32vw, 1.2rem);
  --slide-type-2: clamp(1.16rem, 1.05rem + 0.5vw, 1.42rem);
  --slide-type-3: clamp(1.34rem, 1.18rem + 0.72vw, 1.78rem);
  --slide-type-4: clamp(1.62rem, 1.35rem + 1.1vw, 2.32rem);
  --slide-type-5: clamp(2.02rem, 1.62rem + 1.6vw, 3.08rem);
  --slide-type-6: clamp(2.56rem, 1.94rem + 2.45vw, 4.18rem);
  --slide-type-7: clamp(3.24rem, 2.42rem + 3.25vw, 5.46rem);
}

.slides-root .slide-content-shell {
  font-family: var(--slide-font-body);
  line-height: 1.36;
  letter-spacing: -0.01em;
  font-feature-settings: "liga" 1, "tnum" 1, "ss01" 1;
}

.slides-root .slide-content-shell h1,
.slides-root .slide-content-shell h2,
.slides-root .slide-content-shell h3,
.slides-root .slide-content-shell h4 {
  color: #ffffff;
  font-family: var(--slide-font-display);
  letter-spacing: -0.025em;
}

.slides-root .slide-content-shell h1 {
  font-size: var(--slide-type-7);
  line-height: 1.02;
  font-weight: 780;
}

.slides-root .slide-content-shell h2 {
  font-size: var(--slide-type-6);
  line-height: 1.08;
  font-weight: 740;
}

.slides-root .slide-content-shell h3 {
  font-size: var(--slide-type-4);
  line-height: 1.14;
  font-weight: 700;
}

.slides-root .slide-content-shell h4 {
  font-size: var(--slide-type-3);
  line-height: 1.18;
  font-weight: 680;
}

.slides-root .slide-content-shell p,
.slides-root .slide-content-shell li,
.slides-root .slide-content-shell span {
  text-wrap: pretty;
}

.slides-root .slide-content-shell code,
.slides-root .slide-content-shell .font-mono {
  font-family: var(--slide-font-mono);
  letter-spacing: -0.01em;
}

.slides-root button,
.slides-root a[class*="rounded"] {
  color: var(--slide-button-fg);
}

.slides-root button:hover,
.slides-root a[class*="rounded"]:hover {
  color: var(--slide-button-fg-hover);
}
`;

const GAUSSIAN_WALL_VIDEOS = ((gaussianVideoWallData as { videos?: Array<{
  video_id: string;
  title: string;
  channel?: string;
  published_text?: string;
  url: string;
  embed_url: string;
  thumbnail_url?: string;
}> })?.videos ?? []);

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

/* 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?   INDIVIDUAL SLIDE COMPONENTS
   鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?*/

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
      <p className="text-xl sm:text-2xl text-[#c4bfb6] max-w-4xl mb-14">
        Three approaches to making digital humans respond in real-time
      </p>
      <div className="flex flex-col items-center gap-1.5 text-[#948d82]">
        <span className="text-2xl font-medium text-[#f5f2ec]">Yuntian Chai</span>
      </div>
    </div>
  );
}

function SlideEvidenceStrip({
  links,
  note,
}: {
  links: Array<{ label: string; href: string }>;
  note?: string;
}) {
  return (
    <div className="mt-3 rounded-lg border border-[#3d3a36] bg-[#181716] px-3 py-2">
      <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#948d82]">
        <span className="uppercase tracking-widest">Reference</span>
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-full border border-[#3d3a36] px-2 py-0.5 text-[#bdb8af] hover:text-[#f5f2ec] transition-colors"
          >
            {link.label}
            <ExternalLink size={10} />
          </a>
        ))}
      </div>
      {note ? <p className="text-[10px] text-[#7f7b74] mt-1">{note}</p> : null}
    </div>
  );
}

function SlideAboutMe() {
  const experience = [
    { icon: Video, title: 'Hedra', period: '2024-2025', text: 'Software engineer on real-time avatar work and diffusion-based image generation pipelines.', color: METHOD_COLORS.generative },
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
            <p className="text-sm text-[#bdb8af] mt-1">
              Previous work includes diffusion-based image generation pipelines at Hedra.
            </p>
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

function SlideCogixEyeTrackerPrototype() {
  return (
    <div className="flex flex-col justify-center h-full px-12 max-w-7xl mx-auto">
      <SlideMethodBadge method="Cogix" label="Current Work" color={METHOD_COLORS.gaussian} />
      <h2 className="text-5xl font-bold mb-2">By Day: Work at Cogix</h2>
      <div className="w-14 h-1 rounded-full mb-4" style={{ background: METHOD_COLORS.gaussian }} />

      <p className="text-base text-[#c7c2b9] mb-4 max-w-4xl">
        I am also building an eye tracker prototype at Cogix, combining a custom IR hardware rig with a session-based analytics software pipeline.
      </p>

      <div className="w-[82%] max-w-4xl mx-auto">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl overflow-hidden border border-[#3d3a36] bg-[#10100f]">
            <img
              src="/eye-tracker-calibration.jpg"
              alt="Eye tracker calibration target layout"
              className="w-full aspect-video object-cover"
            />
            <div className="px-3 py-2 text-[11px] text-[#bdb8af] border-t border-[#3d3a36]">
              Calibration map: 9-point target distribution.
            </div>
          </div>
          <div className="rounded-xl overflow-hidden border border-[#3d3a36] bg-[#10100f]">
            <img
              src="/eye-tracker.jpg"
              alt="Eye tracker prototype hardware rig with IR LEDs and cameras"
              className="w-full aspect-video object-cover"
            />
            <div className="px-3 py-2 text-[11px] text-[#bdb8af] border-t border-[#3d3a36]">
              Hardware prototype: IR illuminators + cameras.
            </div>
          </div>
          <div className="rounded-xl overflow-hidden border border-[#3d3a36] bg-[#10100f]">
            <img
              src="/eye-tracking-software.png"
              alt="Eye-Tracking Studio interface showing session timeline and gaze analytics"
              className="w-full aspect-video object-cover object-top"
            />
            <div className="px-3 py-2 text-[11px] text-[#bdb8af] border-t border-[#3d3a36]">
              Software: timeline, fixations, saccades, pupil metrics.
            </div>
          </div>
          <div className="rounded-xl overflow-hidden border border-[#3d3a36] bg-[#10100f]">
            <video
              src="/eye_tracking_video.mp4"
              className="w-full aspect-video object-cover bg-black"
              controls
              muted
              playsInline
              preload="metadata"
              poster="/eye_tracking_video-poster.jpg"
            />
            <div className="px-3 py-2 text-[11px] text-[#bdb8af] border-t border-[#3d3a36]">
              Prototype session video playback from the same stack.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SlideGraphNerd() {
  const PAJAMADOT_FLOW_EXAMPLE_URL = 'https://www.pajamadot.com/projects/5c91c637-ff86-4cf9-a47f-14175022a454/flow';
  const graphNodes = [
    {
      id: 'graphs',
      label: 'Graphs',
      color: METHOD_COLORS.gaussian,
      position: { x: 24, y: 168 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    },
    {
      id: 'webgeo',
      label: 'Web Geometry Nodes',
      color: '#45b7d1',
      position: { x: 270, y: 0 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    },
    {
      id: 'reactflow',
      label: 'React Flow Graphs',
      color: '#86c6ff',
      position: { x: 270, y: 56 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    },
    {
      id: 'blueprint',
      label: 'UE Blueprint',
      color: METHOD_COLORS.metahuman,
      position: { x: 270, y: 112 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    },
    {
      id: 'uematerial',
      label: 'UE Material Nodes',
      color: '#c9b1ff',
      position: { x: 270, y: 168 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    },
    {
      id: 'blender',
      label: 'Blender Geo Nodes',
      color: '#6ec87a',
      position: { x: 270, y: 224 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    },
    {
      id: 'storynodes',
      label: 'Story Narrative Nodes',
      color: '#e1a65b',
      position: { x: 270, y: 280 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    },
    {
      id: 'pajamaflow',
      label: 'PajamaDot Flow (Build)',
      color: METHOD_COLORS.gaussian,
      position: { x: 270, y: 336 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    },
  ];
  const graphEdges = graphNodes
    .filter((node) => node.id !== 'graphs')
    .map((node) => ({
      source: 'graphs',
      target: node.id,
    }));

  return (
    <div className="flex flex-col justify-center h-full px-12 max-w-7xl mx-auto">
      <SlideMethodBadge method="Personal Lens" label="Node-First Thinking" color={METHOD_COLORS.gaussian} />
      <h2 className="text-5xl font-bold mb-2">Graph Nerd & Storyteller at Night</h2>
      <div className="w-14 h-1 rounded-full mb-4" style={{ background: METHOD_COLORS.gaussian }} />

      <div className="rounded-xl p-3 border border-[#3d3a36] bg-[#1d1c1a]">
        <p className="text-xs uppercase tracking-widest text-[#948d82] mb-2">Draggable Graph</p>
        <SlideFlow
          accentColor={METHOD_COLORS.gaussian}
          interactive
          height={420}
          nodes={graphNodes}
          edges={graphEdges}
        />
        <div className="mt-2.5 flex items-center justify-between gap-3 text-xs">
          <span className="text-[#948d82]">Hierarchical layout: root node “Graphs” on the left, branch nodes on the right, each node draggable.</span>
          <a
            href={PAJAMADOT_FLOW_EXAMPLE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-semibold hover:underline"
            style={{ color: METHOD_COLORS.gaussian }}
          >
            PajamaDot Flow Example
            <ExternalLink size={13} />
          </a>
        </div>
      </div>
    </div>
  );
}

function SlideStoryCharacterCreationTool() {
  const PAJAMADOT_CHARACTER_URL = 'https://www.pajamadot.com/projects/5c91c637-ff86-4cf9-a47f-14175022a454/characters/7bc804f1-5880-492e-bd33-a74f062856c0';

  return (
    <div className="flex flex-col justify-center h-full px-12 max-w-7xl mx-auto">
      <SlideMethodBadge method="PajamaDot Tool" label="Story Character Creation" color={METHOD_COLORS.gaussian} />
      <h2 className="text-5xl font-bold mb-2">Character Creation Tool for Story (2D)</h2>
      <div className="w-14 h-1 rounded-full mb-5" style={{ background: METHOD_COLORS.gaussian }} />

      <div className="rounded-xl p-5 border border-[#3d3a36] bg-[#1d1c1a] mb-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-xl font-semibold text-[#f5f2ec] mb-2">Current Scope: 2D Static Identity</h3>
            <ul className="list-disc pl-5 space-y-1.5 text-base text-[#c7c2b9]">
              <li>This character workflow is 2D, not 3D.</li>
              <li>Defines reusable identity: personality, style, and narrative role.</li>
              <li>Links characters to node-based story flow and memory.</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-[#f5f2ec] mb-2">Planned Expansion Path</h3>
            <ul className="list-disc pl-5 space-y-1.5 text-base text-[#c7c2b9]">
              <li>Step 1: 2D static identity (current).</li>
              <li>Step 2: 3D dynamic embodiment with richer expression controls.</li>
              <li>Step 3: real-time performance for live storytelling with humans.</li>
            </ul>
          </div>
        </div>
      </div>

      <a
        href={PAJAMADOT_CHARACTER_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 self-start rounded-lg px-5 py-3 border text-base font-semibold hover:underline"
        style={{ borderColor: METHOD_COLORS.gaussian, color: METHOD_COLORS.gaussian, background: `${METHOD_COLORS.gaussian}12` }}
      >
        <User size={18} />
        Open PajamaDot Character Example
        <ExternalLink size={15} />
      </a>
    </div>
  );
}

function SlideRealtimeAvatarPerformanceBridge() {
  const steps = [
    {
      icon: Box,
      title: '2D Static Base (Now)',
      points: [
        'Story-consistent character identity and style profiles.',
        'Text/voice behavior grounded in character context.',
      ],
      color: METHOD_COLORS.gaussian,
    },
    {
      icon: Sparkles,
      title: 'Real-time Story Performance',
      points: [
        'Multimodal user input.',
        'Story-aware model response.',
      ],
      color: METHOD_COLORS.generative,
    },
  ];

  return (
    <div className="flex flex-col justify-center h-full px-12 max-w-7xl mx-auto">
      <SlideMethodBadge method="Roadmap" label="2D -> Real-time Performance" color={METHOD_COLORS.gaussian} />
      <h2 className="text-5xl font-bold mb-2">Real-time Avatar Performance for Storytelling</h2>
      <div className="w-14 h-1 rounded-full mb-5" style={{ background: METHOD_COLORS.gaussian }} />

      <p className="text-lg text-[#c7c2b9] mb-6">
        Start with a 2D identity layer, then move directly to real-time storytelling performance.
      </p>

      <div className="grid grid-cols-2 gap-4">
        {steps.map((step) => (
          <div key={step.title} className="rounded-xl p-4 border border-[#3d3a36] bg-[#1d1c1a]">
            <step.icon size={24} className="mb-3" style={{ color: step.color }} />
            <h3 className="text-xl font-semibold mb-2" style={{ color: step.color }}>{step.title}</h3>
            <ul className="list-disc pl-5 space-y-1.5 text-base text-[#c7c2b9]">
              {step.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <SlideEvidenceStrip
        links={[
          { label: 'MIDAS', href: EVIDENCE_URLS.arxivMIDAS },
          { label: 'LiveTalk', href: EVIDENCE_URLS.arxivLiveTalk },
        ]}
      />
    </div>
  );
}

function SlideE2EDefinitionMindmap() {
  return (
    <div className="flex flex-col justify-center h-full px-12 max-w-7xl mx-auto">
      <SlideMethodBadge method="Definition" label="End-to-End Real-time Avatar System" color={METHOD_COLORS.gaussian} />
      <h2 className="text-5xl font-bold mb-2">End-to-End Definition</h2>
      <div className="w-14 h-1 rounded-full mb-4" style={{ background: METHOD_COLORS.gaussian }} />

      <div className="rounded-xl p-4 border border-[#3d3a36] bg-[#1d1c1a] mb-3">
        <SlideFlow
          accentColor={METHOD_COLORS.gaussian}
          edgeType="straight"
          height={180}
          nodes={[
            { id: 'input', label: 'End User Inputs', color: METHOD_COLORS.generative, position: { x: 40, y: 80 } },
            { id: 'perception', label: 'Perception (ASR + vision + gaze)', color: METHOD_COLORS.generative, position: { x: 280, y: 80 } },
            { id: 'response', label: 'LLM Response Model + Memory', color: METHOD_COLORS.metahuman, position: { x: 520, y: 80 } },
            { id: 'actuation', label: 'Avatar Control Inputs', color: METHOD_COLORS.metahuman, position: { x: 760, y: 80 } },
            { id: 'output', label: 'Multimodal Outputs', color: METHOD_COLORS.gaussian, position: { x: 1000, y: 80 } },
          ]}
          edges={[
            { source: 'input', target: 'perception' },
            { source: 'perception', target: 'response' },
            { source: 'response', target: 'actuation' },
            { source: 'actuation', target: 'output' },
          ]}
        />
      </div>

      <div className="rounded-xl p-3 border border-[#3d3a36] bg-[#1d1c1a] mb-3">
        <p className="text-sm text-[#c7c2b9]">
          Operational path: <span className="text-[#f5f2ec]">inputs → perception → LLM response model → avatar control → outputs</span>
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-2">
        <div className="rounded-lg p-3 border border-[#3d3a36] bg-[#1d1c1a]">
          <p className="text-[11px] uppercase tracking-wide text-[#948d82] mb-1">End User Inputs</p>
          <p className="text-xs text-[#c7c2b9]">Audio, text, face video, facial expression, gaze, gesture, events.</p>
        </div>
        <div className="rounded-lg p-3 border border-[#3d3a36] bg-[#1d1c1a]">
          <p className="text-[11px] uppercase tracking-wide text-[#948d82] mb-1">System Boundary</p>
          <p className="text-xs text-[#c7c2b9]">LLM response model means dialogue/intent generation with memory/state. Avatar control inputs are downstream actuation signals.</p>
        </div>
        <div className="rounded-lg p-3 border border-[#3d3a36] bg-[#1d1c1a]">
          <p className="text-[11px] uppercase tracking-wide text-[#948d82] mb-1">Multimodal Outputs</p>
          <p className="text-xs text-[#c7c2b9]">Speech, facial dynamics, gaze/head motion, gesture, rendered stream frames.</p>
        </div>
      </div>

      <SlideEvidenceStrip
        links={[
          { label: 'OpenAI Realtime API', href: EVIDENCE_URLS.openaiRealtimeApi },
          { label: 'GazeGPT', href: EVIDENCE_URLS.arxivGazeGPT },
          { label: 'MetaHuman Live Link', href: EVIDENCE_URLS.epicMetaHumanLiveLink },
          { label: 'NVIDIA Audio2Face', href: EVIDENCE_URLS.nvidiaAudio2FaceRepo },
        ]}
      />
    </div>
  );
}

function SlideProblem() {
  const rationale = [
    {
      step: '01',
      icon: Cpu,
      label: 'Agents Handle Machine Work',
      desc: 'Automation, routing, ETL, and backend ops do not need avatars.',
    },
    {
      step: '02',
      icon: Users,
      label: 'Humans Need Social Signals',
      desc: 'Trust depends on timing, gaze, expression, and turn-taking.',
    },
    {
      step: '03',
      icon: Headset,
      label: 'Storytelling Is Live Performance',
      desc: 'Live storytelling needs pacing, emotion, and character continuity.',
    },
    {
      step: '04',
      icon: BookOpen,
      label: 'Avatar = Human Interface Runtime',
      desc: 'Avatars turn model intelligence into readable human performance.',
    },
  ];

  return (
    <div className="flex flex-col justify-center h-full px-12 max-w-7xl mx-auto">
      <SlideMethodBadge method="Framing" label="Why Real-time Avatars Now" color={METHOD_COLORS.gaussian} />
      <h2 className="text-5xl font-bold mb-2">Why Real-time Avatars In The Agent Era?</h2>
      <div
        className="w-14 h-1 rounded-full mb-5"
        style={{ background: METHOD_COLORS.gaussian }}
      />
      <p className="text-base text-[#c7c2b9] mb-5">
        Agents run workflows. Real-time avatars handle human-facing storytelling and social interaction.
      </p>
      <div className="grid grid-cols-2 gap-4 mb-6">
        {rationale.map((uc) => (
          <div
            key={uc.label}
            className="rounded-xl p-4 border border-[#3d3a36] bg-[#1d1c1a]"
          >
            <div className="flex items-center justify-between mb-3">
              <uc.icon size={28} style={{ color: METHOD_COLORS.gaussian }} />
              <span
                className="text-xs font-semibold tracking-wider px-2 py-1 rounded border"
                style={{ borderColor: `${METHOD_COLORS.gaussian}88`, color: METHOD_COLORS.gaussian, background: `${METHOD_COLORS.gaussian}14` }}
              >
                STEP {uc.step}
              </span>
            </div>
            <h3 className="text-lg font-semibold mb-1">{uc.label}</h3>
            <p className="text-sm text-[#bdb8af]">{uc.desc}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-[#3d3a36] bg-[#1d1c1a] p-4">
        <h3 className="text-lg font-semibold mb-2">Narrative Throughline</h3>
        <p className="text-base text-[#bdb8af]">
          Keep agents invisible for machine throughput. Use real-time avatars where trust, emotion, and storytelling outcomes matter.
        </p>
      </div>
    </div>
  );
}

function SlideStoryPerformanceMotivation() {
  const goals = [
    'Focus on real-time interactive storytelling and live performance with humans, not only a technical avatar demo.',
    'Keep avatar behavior grounded in story context: scene memory, character intent, emotional arc, and relationship state.',
    'Target expressive performance quality across voice, face, gaze, timing, and body language.',
    'Track the latest real-time avatar technology and integrate useful advances into the storytelling workflow.',
  ];

  const principles = [
    {
      title: 'Story-First System',
      color: METHOD_COLORS.generative,
      bullets: [
        'Prefer narrative continuity over isolated responses.',
        'Maintain character-consistent behavior across long sessions.',
        'Adapt in real-time without losing scene coherence.',
      ],
    },
    {
      title: 'Performance-First Avatar',
      color: METHOD_COLORS.metahuman,
      bullets: [
        'Use emotion-aware delivery with controllable intensity.',
        'Prioritize timing for pauses, turn-taking, and emphasis.',
        'Support expressive multimodal output, not only lip-sync.',
      ],
    },
    {
      title: 'Human-Loop Interaction',
      color: METHOD_COLORS.gaussian,
      bullets: [
        'Capture rich human inputs continuously.',
        'Respond with legible social signals.',
        'Keep latency low enough to sustain live rapport.',
      ],
    },
  ];

  return (
    <div className="flex flex-col justify-center h-full px-12 max-w-7xl mx-auto">
      <SlideMethodBadge method="Motivation" label="Story + Performance Vision" color={METHOD_COLORS.gaussian} />
      <h2 className="text-5xl font-bold mb-2">Project Motivation</h2>
      <div className="w-14 h-1 rounded-full mb-5" style={{ background: METHOD_COLORS.gaussian }} />

      <ul className="list-disc pl-6 space-y-2 text-lg text-[#c7c2b9] mb-6">
        {goals.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <div className="grid grid-cols-3 gap-4">
        {principles.map((block) => (
          <div key={block.title} className="rounded-xl p-4 border border-[#3d3a36] bg-[#1d1c1a]">
            <h3 className="text-xl font-semibold mb-2" style={{ color: block.color }}>
              {block.title}
            </h3>
            <ul className="list-disc pl-5 space-y-1.5 text-base text-[#c7c2b9]">
              {block.bullets.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function SlideHumanModalityGraph() {
  const inputModalities = [
    'Speech content + prosody',
    'Face expression + gaze',
    'Head pose + turn-taking cues',
    'Text intent + narrative choices',
  ];
  const coreLayer = [
    'Multimodal perception fusion',
    'Emotion/state estimation',
    'Narrative policy + pacing',
    'Character performance planner',
  ];
  const outputModalities = [
    'Voice tone + timing + phrasing',
    'Facial expression dynamics',
    'Eye contact + gaze shifts',
    'Head motion + gesture rhythm',
  ];
  const graphLinks = [
    'Prosody -> voice style + emotional cadence',
    'Gaze/attention -> eye-contact strategy',
    'Emotion state -> expression intensity + gesture energy',
    'Narrative context -> content, timing, and delivery',
  ];

  return (
    <div className="flex flex-col justify-center h-full px-12 max-w-7xl mx-auto">
      <SlideMethodBadge method="Motivation" label="Full Human Modality Graph" color={METHOD_COLORS.gaussian} />
      <h2 className="text-5xl font-bold mb-2">Full Modality Storytelling Graph</h2>
      <div className="w-14 h-1 rounded-full mb-5" style={{ background: METHOD_COLORS.gaussian }} />

      <p className="text-base text-[#c7c2b9] mb-4">
        Map human inputs to expressive outputs through a story-aware cognition layer, so avatar behavior stays context-aware instead of detached from scene intent.
      </p>

      <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] gap-3 items-stretch mb-5">
        <div className="rounded-xl p-4 border border-[#3d3a36] bg-[#1d1c1a]">
          <h3 className="text-xl font-semibold mb-2" style={{ color: METHOD_COLORS.metahuman }}>Input Modalities</h3>
          <ul className="list-disc pl-5 space-y-1.5 text-sm text-[#c7c2b9]">
            {inputModalities.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>

        <div className="flex items-center justify-center text-3xl text-[#7d776f]">→</div>

        <div className="rounded-xl p-4 border border-[#3d3a36] bg-[#1d1c1a]">
          <h3 className="text-xl font-semibold mb-2" style={{ color: METHOD_COLORS.generative }}>Cognition Core</h3>
          <ul className="list-disc pl-5 space-y-1.5 text-sm text-[#c7c2b9]">
            {coreLayer.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>

        <div className="flex items-center justify-center text-3xl text-[#7d776f]">→</div>

        <div className="rounded-xl p-4 border border-[#3d3a36] bg-[#1d1c1a]">
          <h3 className="text-xl font-semibold mb-2" style={{ color: METHOD_COLORS.gaussian }}>Output Modalities</h3>
          <ul className="list-disc pl-5 space-y-1.5 text-sm text-[#c7c2b9]">
            {outputModalities.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      </div>

      <div className="rounded-xl p-4 border border-[#3d3a36] bg-[#1d1c1a]">
        <h3 className="text-lg font-semibold mb-2 text-[#f5f2ec]">Key Graph Edges</h3>
        <ul className="list-disc pl-5 space-y-1.5 text-sm text-[#c7c2b9]">
          {graphLinks.map((edge) => (
            <li key={edge}>{edge}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function SlideApproachSelectionQuestion() {
  const selectionAxes = [
    'Identity control: how precisely can character identity be authored and preserved?',
    'Response performance: how quickly and reliably can the system react in real time?',
    'Expression bandwidth: how much facial/voice/gesture control is available?',
    'Production fit: how practical is this for our storytelling pipeline?',
  ];

  return (
    <div className="flex flex-col justify-center h-full px-12 max-w-7xl mx-auto">
      <SlideMethodBadge method="Bridge" label="From Modality Graph to Rendering Choice" color={METHOD_COLORS.gaussian} />
      <h2 className="text-5xl font-bold mb-2">Question Before We Pick a Stack</h2>
      <div className="w-14 h-1 rounded-full mb-5" style={{ background: METHOD_COLORS.gaussian }} />

      <div className="rounded-xl p-6 border border-[#3d3a36] bg-[#1d1c1a] mb-5">
        <p className="text-xl text-[#f5f2ec] leading-relaxed">
          If our cognition layer understands multimodal social signals, which rendering approach
          can meet the required control and latency targets?
        </p>
      </div>

      <div className="rounded-xl p-5 border border-[#3d3a36] bg-[#1d1c1a]">
        <p className="text-sm uppercase tracking-wide text-[#948d82] mb-2">Selection Axes</p>
        <ul className="list-disc pl-6 space-y-2 text-base text-[#c7c2b9]">
          {selectionAxes.map((axis) => (
            <li key={axis}>{axis}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function SlideFuturePerspectiveMissingLayers() {
  const stages = [
    {
      title: 'Capture + Timestamping',
      color: METHOD_COLORS.gaussian,
      icon: Clock,
      bullets: [
        'Collect audio, text, face video, gaze, and interaction events in one clock domain.',
        'Preserve packet/frame timestamps for turn-taking and causality.',
      ],
    },
    {
      title: 'Signal Quality + Calibration',
      color: METHOD_COLORS.generative,
      icon: Activity,
      bullets: [
        'Run VAD/SNR, face-track confidence, gaze confidence, and drift checks.',
        'Down-weight noisy channels instead of hard-failing the whole interaction.',
      ],
    },
    {
      title: 'Feature Extraction Per Modality',
      color: METHOD_COLORS.metahuman,
      icon: Eye,
      bullets: [
        'Audio -> transcript/prosody; video -> expression/head/gaze features; text -> intent entities.',
        'Emit calibrated features with uncertainty for each modality.',
      ],
    },
    {
      title: 'Cross-Modal Alignment + State Update',
      color: METHOD_COLORS.gaussian,
      icon: Brain,
      bullets: [
        'Fuse features in short temporal windows and update interaction state.',
        'Handoff one compact context object to the response model and avatar backend adapter.',
      ],
    },
  ];

  const signalContracts = [
    'Audio: waveform + VAD + prosody + transcript confidence',
    'Face video: landmarks/AUs + head pose + per-frame confidence',
    'Gaze: fixation/saccade events + AOI hits + quality score',
    'Text/events: user intent, tool events, and turn boundary markers',
  ];

  return (
    <div className="flex flex-col justify-center h-full px-12 max-w-7xl mx-auto">
      <SlideMethodBadge method="Input Architecture" label="Multimodal User Input Processing" color={METHOD_COLORS.gaussian} />
      <h2 className="text-5xl font-bold mb-2">Multimodal User-Input Processing Layer</h2>
      <div className="w-14 h-1 rounded-full mb-4" style={{ background: METHOD_COLORS.gaussian }} />

      <p className="text-base text-[#c7c2b9] mb-5">
        This layer is upstream of all avatar backends. Its job is to convert noisy human signals into reliable interaction state before response generation and actuation.
      </p>

      <div className="mb-4">
        <SlideFlow
          accentColor={METHOD_COLORS.gaussian}
          edgeType="straight"
          nodes={[
            { id: 'capture', label: 'Capture (audio / text / video / gaze / events)' },
            { id: 'quality', label: 'Quality + calibration gates' },
            { id: 'extract', label: 'Per-modality feature extraction' },
            { id: 'align', label: 'Temporal alignment + uncertainty fusion' },
            { id: 'state', label: 'Interaction state update' },
            { id: 'handoff', label: 'Response model + avatar backend adapter' },
          ]}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {stages.map((layer) => (
          <div key={layer.title} className="rounded-xl p-4 border border-[#3d3a36] bg-[#1d1c1a]">
            <div className="flex items-center gap-2 mb-2">
              <layer.icon size={18} style={{ color: layer.color }} />
              <h3 className="text-lg font-semibold" style={{ color: layer.color }}>
                {layer.title}
              </h3>
            </div>
            <ul className="list-disc pl-5 space-y-1.5 text-sm text-[#c7c2b9]">
              {layer.bullets.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="rounded-xl p-4 border border-[#3d3a36] bg-[#1d1c1a] mb-4">
        <h3 className="text-lg font-semibold text-[#f5f2ec] mb-2">Per-Signal Contract (Input Side)</h3>
        <ul className="list-disc pl-5 space-y-1.5 text-sm text-[#c7c2b9]">
          {signalContracts.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-[#3d3a36] bg-[#1d1c1a] p-4 text-sm text-[#bdb8af]">
        <span className="font-semibold text-[#f5f2ec]">Design rule:</span> keep user-input processing and avatar actuation separate, then bridge them with a typed interaction-state contract.
      </div>

      <SlideEvidenceStrip
        links={[
          { label: 'OpenAI Realtime API', href: EVIDENCE_URLS.openaiRealtimeApi },
          { label: 'GazeGPT paper', href: EVIDENCE_URLS.arxivGazeGPT },
          { label: 'LivePortrait', href: EVIDENCE_URLS.arxivLivePortrait },
          { label: 'Avatar Forcing', href: EVIDENCE_URLS.arxivAvatarForcing },
          { label: 'TaoAvatar', href: EVIDENCE_URLS.arxivTaoAvatar },
          { label: 'GPT-4 Eyes docs', href: EVIDENCE_URLS.pupilGpt4EyesDocs },
          { label: 'GPT-4 Eyes code (gist)', href: EVIDENCE_URLS.pupilGpt4EyesCode },
        ]}
      />
    </div>
  );
}

// Parked slide: hidden from deck order for now, keep for future re-enable.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function SlideRealtimeNarrativeLoop() {
  const loopCards = [
    {
      title: 'State to Track',
      color: METHOD_COLORS.gaussian,
      lines: [
        'conversation memory + participant profile',
        'emotion / arousal / confidence trajectory',
        'story variables, goals, and branch constraints',
      ],
    },
    {
      title: 'Narrative Policy Engine',
      color: METHOD_COLORS.generative,
      lines: [
        'mode A: linear beat continuation',
        'mode B: branch selection from choice graph',
        'merge to canonical anchors to preserve coherence',
      ],
    },
    {
      title: 'Multimodal Delivery',
      color: METHOD_COLORS.metahuman,
      lines: [
        'voice prosody + text semantics',
        'face/gesture/gaze aligned to beat or branch intent',
        'camera/staging updates to reinforce narrative',
      ],
    },
  ];

  return (
    <div className="flex flex-col justify-center h-full px-12 max-w-7xl mx-auto">
      <SlideMethodBadge method="Real-time Narrative" color={METHOD_COLORS.gaussian} />
      <h2 className="text-5xl font-bold mb-1">Storytelling in Real-time (Linear + Branching)</h2>
      <ul className="text-[#c7c2b9] text-lg mb-4 max-w-5xl list-disc pl-6 space-y-1.5">
        <li>Sense speech, text, gaze, and gesture in one loop.</li>
        <li>Update shared social and story state continuously.</li>
        <li>Continue linear beats or switch branches while preserving coherence and timing.</li>
      </ul>
      <div className="w-14 h-1 rounded-full mb-5" style={{ background: METHOD_COLORS.gaussian }} />

      <div className="mb-6">
        <SlideFlow
          accentColor={METHOD_COLORS.gaussian}
          nodes={[
            { id: 'sense', label: 'Sense (speech / text / gaze / gesture)' },
            { id: 'state', label: 'Update social + story state' },
            { id: 'plan', label: 'Plan intent + pacing' },
            { id: 'choose', label: 'Choose beat or branch' },
            { id: 'deliver', label: 'Compose line + delivery style' },
            { id: 'render', label: 'Render multimodal response' },
            { id: 'feedback', label: 'Observe feedback + replan' },
          ]}
        />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        {loopCards.map((card) => (
          <div key={card.title} className="rounded-xl p-4 border border-[#3d3a36] bg-[#1d1c1a]">
            <h3 className="text-xl font-semibold mb-2" style={{ color: card.color }}>
              {card.title}
            </h3>
            <ul className="space-y-1.5 text-base text-[#c7c2b9] list-disc pl-5">
              {card.lines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-xl p-4 border border-[#3d3a36] bg-[#1d1c1a]">
          <h3 className="text-lg font-semibold mb-2" style={{ color: METHOD_COLORS.generative }}>
            Branching Brainstorm Patterns
          </h3>
          <ul className="space-y-1.5 text-base text-[#c7c2b9] list-disc pl-5">
            <li>Explicit choice cards: pick option A/B/C in real time.</li>
            <li>Implicit branching: infer intent from interruption or sentiment shift.</li>
            <li>Micro-branches: take local detours, then rejoin quickly.</li>
            <li>Hard branches: allow chapter-level divergence with persistent state changes.</li>
          </ul>
        </div>
        <div className="rounded-xl p-4 border border-[#3d3a36] bg-[#1d1c1a]">
          <h3 className="text-lg font-semibold mb-2" style={{ color: METHOD_COLORS.metahuman }}>
            Guardrails for Coherence
          </h3>
          <ul className="space-y-1.5 text-base text-[#c7c2b9] list-disc pl-5">
            <li>Branch budget: limit depth/time per branch.</li>
            <li>Canonical anchors: enforce return points for continuity.</li>
            <li>Persona lock: keep character goals and voice stable across branches.</li>
            <li>State checks: prevent contradictions before each response.</li>
          </ul>
        </div>
      </div>

      <div className="rounded-xl p-4 border border-[#3d3a36] bg-[#1d1c1a] text-lg text-[#c7c2b9]">
        <span className="font-semibold text-[#f5f2ec]">Practical effect:</span> without real-time narrative timing, avatars can feel delayed or monotone.
        Real-time narrative policy supports linear scenes or interactive branching while preserving coherence.
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
      tagline: 'Rig-based control with stable real-time output',
      desc: 'Mesh-based rendering with rig/blendshape animation in Unreal Engine',
      a2f: 'MetaHuman Animator Speech2Face + Audio Live Link (UE-native).',
    },
    {
      name: 'Video Generation',
      color: METHOD_COLORS.generative,
      icon: Video,
      tagline: 'Photo-based identity with diffusion rendering',
      desc: 'Diffusion-based synthesis streamed via WebRTC providers',
      a2f: 'Audio-conditioned video synthesis; control is mostly implicit.',
    },
    {
      name: 'Gaussian Splatting',
      color: METHOD_COLORS.gaussian,
      icon: Box,
      tagline: 'Explicit 3D primitives, real-time rasterization',
      desc: 'Per-splat (mu, Sigma, color, alpha) rendering without neural-field runtime inference',
      a2f: 'Audio2Expression drives explicit pose/expression coefficients.',
    },
  ];

  return (
    <div className="flex flex-col justify-center h-full px-12 max-w-7xl mx-auto">
      <h2 className="text-5xl font-bold mb-2">Three Approaches</h2>
      <div
        className="w-14 h-1 rounded-full mb-4"
        style={{ background: METHOD_COLORS.gaussian }}
      />

      <div className="rounded-xl p-4 border border-[#3d3a36] bg-[#1d1c1a] mb-5">
        <p className="text-base text-[#c7c2b9]">
          This page compares backend approaches at the output layer. System input processing is a separate shared pipeline.
        </p>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="rounded-lg p-3 border border-[#3d3a36] bg-[#181716]">
            <p className="text-xs uppercase tracking-wide text-[#948d82] mb-1">Shared upstream pipeline</p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-[#bdb8af]">
              <li>End-user multimodal input reception</li>
              <li>Perception + fusion + state update</li>
              <li>Policy and actuation planning</li>
            </ul>
          </div>
          <div className="rounded-lg p-3 border border-[#3d3a36] bg-[#181716]">
            <p className="text-xs uppercase tracking-wide text-[#948d82] mb-1">Backend layer (this page)</p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-[#bdb8af]">
              <li>MetaHuman stack</li>
              <li>Video generation stack</li>
              <li>Gaussian splatting stack</li>
            </ul>
          </div>
        </div>
      </div>

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
            <div className="mt-auto space-y-2">
              <p className="text-base text-[#948d82]">{m.desc}</p>
              <p className="text-sm text-[#bdb8af]">
                <span className="font-semibold text-[#f5f2ec]">Audio-to-Face:</span> {m.a2f}
              </p>
            </div>
          </div>
        ))}
      </div>

      <SlideEvidenceStrip
        links={[
          { label: 'OpenAI Realtime API', href: EVIDENCE_URLS.openaiRealtimeApi },
          { label: 'MetaHuman docs', href: EVIDENCE_URLS.epicMetaHumanDocs },
          { label: 'Avatar Forcing', href: EVIDENCE_URLS.arxivAvatarForcing },
          { label: '3D Gaussian Splatting', href: EVIDENCE_URLS.arxiv3dgs },
        ]}
      />
    </div>
  );
}

function SlideMetahumanHow() {
  const moduleLayers = [
    {
      title: 'Identity & Authoring',
      points: [
        'MetaHumanCharacterEditor (91h/90cpp)',
        'MetaHumanIdentity + IdentityEditor',
        'Mesh-to-MetaHuman -> DNA-backed character assets',
      ],
    },
    {
      title: 'Capture & Solving',
      points: [
        'MetaHumanCaptureSource + CaptureProtocolStack',
        'MetaHumanFaceAnimationSolver / Speech2Face',
        'MetaHumanPerformance + MetaHumanPipeline',
      ],
    },
    {
      title: 'Runtime & Delivery',
      points: [
        'MetaHumanCoreTech (OneEuro + real-time smoothing)',
        'RigLogicModule/RigLogicLib evaluates DNA rig',
        'MetaHumanLiveLink + LiveLink -> UE render',
      ],
    },
  ];

  const dependencySignals = [
    'MetaHumanAnimator -> MetaHumanCoreTechLib (35)',
    'MetaHumanAnimator -> RigLogic (8)',
    'MetaHumanCharacter -> MetaHumanSDK (10)',
    'MetaHumanLiveLink -> MetaHumanCoreTechLib (9)',
  ];

  return (
    <div className="flex flex-col justify-center h-full px-12 max-w-7xl mx-auto">
      <SlideMethodBadge method="MetaHuman" color={METHOD_COLORS.metahuman} />
      <h2 className="text-5xl font-bold mb-1">How It Works (UE 5.7, Source-Backed)</h2>
      <div className="rounded-xl p-3 border border-[#3d3a36] bg-[#1d1c1a] mb-3">
        <p className="text-sm text-[#c7c2b9]">
          Transition from slide 13: this is the same end-to-end IO pipeline mapped onto one concrete backend,
          <span className="text-[#f5f2ec]"> MetaHuman on UE 5.7</span>.
        </p>
      </div>
      <p className="text-[#bdb8af] text-base mb-2">
        Refined from metahuman-evolver cycle 11: 12 plugins, 70 modules, 248 internal module dependency edges.
      </p>
      <div
        className="w-14 h-1 rounded-full mb-5"
        style={{ background: METHOD_COLORS.metahuman }}
      />

      <div className="mb-5">
        <SlideFlow
          accentColor={METHOD_COLORS.metahuman}
          height={260}
          nodes={[
            { id: 'input', label: 'Camera / Audio / IMU', position: { x: 0, y: 92 }, sourcePosition: Position.Right, targetPosition: Position.Left },
            { id: 'livelink', label: 'Real-time Path: LiveLinkFaceSource / MetaHumanLiveLink', position: { x: 250, y: 20 }, sourcePosition: Position.Right, targetPosition: Position.Left },
            { id: 'capture', label: 'Solve Path: CaptureSource + ProtocolStack', position: { x: 250, y: 162 }, sourcePosition: Position.Right, targetPosition: Position.Left },
            { id: 'solve', label: 'FaceAnimationSolver / Speech2Face', position: { x: 520, y: 162 }, sourcePosition: Position.Right, targetPosition: Position.Left },
            { id: 'core', label: 'MetaHumanCoreTech (filters/smoothing)', position: { x: 790, y: 92 }, sourcePosition: Position.Right, targetPosition: Position.Left },
            { id: 'riglogic', label: 'RigLogic (DNA -> rig controls)', position: { x: 1060, y: 92 }, sourcePosition: Position.Right, targetPosition: Position.Left },
            { id: 'render', label: 'UE 5.7 Render + Stream', position: { x: 1330, y: 92 }, sourcePosition: Position.Right, targetPosition: Position.Left },
          ]}
          edges={[
            { source: 'input', target: 'livelink' },
            { source: 'input', target: 'capture' },
            { source: 'capture', target: 'solve' },
            { source: 'solve', target: 'core' },
            { source: 'livelink', target: 'core' },
            { source: 'core', target: 'riglogic' },
            { source: 'riglogic', target: 'render' },
          ]}
        />
      </div>

      <div className="grid grid-cols-3 gap-3 mb-3">
        {moduleLayers.map((layer) => (
          <div
            key={layer.title}
            className="rounded-xl p-4 border border-[#3d3a36] bg-[#1d1c1a]"
          >
            <div className="text-sm font-semibold uppercase tracking-wide mb-2" style={{ color: METHOD_COLORS.metahuman }}>
              {layer.title}
            </div>
            <ul className="space-y-1 text-xs text-[#bdb8af]">
              {layer.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl p-4 border border-[#3d3a36] bg-[#1d1c1a]">
          <div className="text-sm font-semibold uppercase tracking-wide mb-2" style={{ color: METHOD_COLORS.metahuman }}>
            Dependency Hot Paths
          </div>
          <ul className="space-y-1 text-xs text-[#bdb8af]">
            {dependencySignals.map((entry) => (
              <li key={entry}>{entry}</li>
            ))}
            <li>Hub targets: MetaHumanCore (19), MetaHumanCoreTech (20), RigLogicModule (15)</li>
          </ul>
        </div>

        <div className="rounded-xl p-4 border border-[#3d3a36] bg-[#1d1c1a]">
          <div className="text-sm font-semibold uppercase tracking-wide mb-2" style={{ color: METHOD_COLORS.metahuman }}>
            Evolver + Official Signals
          </div>
          <ul className="space-y-1 text-xs text-[#bdb8af]">
            <li>One-line docs include tracker model tags: hyprface-0.1.4, wav2face-0.0.10.</li>
            <li>MetaHuman docs watch: 5/5 Epic docs endpoints reachable in latest cycle.</li>
            <li>Plugin topology is stable across cycles; updates are mostly in API/method coverage.</li>
          </ul>
        </div>
      </div>

      <SlideEvidenceStrip
        links={[
          { label: 'Local architecture snapshot', href: METAHUMAN_EVOLVER_ARCH_URL },
          { label: 'Local cycle summary', href: METAHUMAN_EVOLVER_SUMMARY_URL },
          { label: 'MetaHuman docs', href: EVIDENCE_URLS.epicMetaHumanDocs },
          { label: 'RigLogic API', href: EVIDENCE_URLS.epicRigLogicApi },
        ]}
        note="Counts and dependency hubs on this slide are pulled from the local metahuman-evolver scan artifacts."
      />
    </div>
  );
}

function SlideMetahumanIdentityResponse() {
  return (
    <div className="flex flex-col justify-center h-full px-12 max-w-7xl mx-auto">
      <SlideMethodBadge method="MetaHuman Deep Dive" color={METHOD_COLORS.metahuman} />
      <h2 className="text-5xl font-bold mb-2">Identity & Response Stack</h2>
      <div className="w-14 h-1 rounded-full mb-4" style={{ background: METHOD_COLORS.metahuman }} />

      <div className="rounded-xl p-3 border border-[#3d3a36] bg-[#1d1c1a] mb-4">
        <p className="text-sm text-[#c7c2b9]">
          Scope note: this page describes avatar-backend control stack inputs and outputs. End-user multimodal perception (ASR, vision, gaze, affect inference) is an upstream layer.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-5 mb-4">
        <div className="rounded-xl p-4 border border-[#3d3a36] bg-[#1d1c1a]">
          <h3 className="text-lg font-semibold text-[#f5f2ec] mb-2">1) Identity Creation</h3>
          <ul className="space-y-1.5 text-sm text-[#bdb8af]">
            <li>Inputs: creator parameters, scans/photos (Mesh to MetaHuman), texture/groom assets.</li>
            <li>Models/solvers: MetaHuman Creator + DNA/RigLogic calibration pipeline.</li>
            <li>Representation: skeletal mesh + blendshape rig + DNA file + materials/grooms.</li>
            <li>Output modality: controllable character state (not final frame yet).</li>
          </ul>
        </div>
        <div className="rounded-xl p-4 border border-[#3d3a36] bg-[#1d1c1a]">
          <h3 className="text-lg font-semibold text-[#f5f2ec] mb-2">2) Real-time Response Model</h3>
          <ul className="space-y-1.5 text-sm text-[#bdb8af]">
            <li>Renderer/control inputs: face video/depth retargeting (pipeline-dependent), audio, and head motion from Live Link devices.</li>
            <li>Models: Live Link Face + MetaHuman Animator 4D solver + RigLogic runtime path.</li>
            <li>Control outputs: ARKit-style blendshape curves, head/eye transforms, and interaction-state cues.</li>
            <li>Turn-taking, intent, and social policy cues are usually handled in an external cognition layer.</li>
            <li>Final outputs: rendered video stream + synced speech audio.</li>
          </ul>
        </div>
      </div>

      <div className="rounded-xl p-4 border border-[#3d3a36] bg-[#1d1c1a]">
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="rounded-lg p-3 bg-[#181716]">
            <p className="text-[#948d82] uppercase tracking-wide mb-1">Input Modalities</p>
            <p className="text-[#f5f2ec]">Face/depth video, audio, head pose, and optional gaze feeds from capture tools.</p>
          </div>
          <div className="rounded-lg p-3 bg-[#181716]">
            <p className="text-[#948d82] uppercase tracking-wide mb-1">Core Models</p>
            <p className="text-[#f5f2ec]">MetaHuman Animator, Live Link Face, RigLogic/DNA runtime.</p>
          </div>
          <div className="rounded-lg p-3 bg-[#181716]">
            <p className="text-[#948d82] uppercase tracking-wide mb-1">Runtime Representation</p>
            <p className="text-[#f5f2ec]">Explicit rig controls on mesh geometry (deterministic render).</p>
          </div>
        </div>
      </div>

      <SlideEvidenceStrip
        links={[
          { label: 'MetaHuman Animator', href: EVIDENCE_URLS.epicMetaHumanAnimator },
          { label: 'Real-time Live Link', href: EVIDENCE_URLS.epicMetaHumanLiveLink },
          { label: 'Mesh to MetaHuman', href: EVIDENCE_URLS.epicMeshToMetaHuman },
        ]}
      />
    </div>
  );
}

function SlideMetahumanDemo() {
  return (
    <div className="flex flex-col justify-center h-full px-12 max-w-7xl mx-auto">
      <SlideMethodBadge method="MetaHuman Demo" color={METHOD_COLORS.metahuman} />
      <h2 className="text-5xl font-bold mb-1">Live Demo: Rapport MetaHuman</h2>
      <p className="text-[#bdb8af] text-xl mb-6">
        Cloud-rendered Unreal Engine 5.7 avatar via pixel streaming
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
            Reported in recent streaming models
          </div>
        </div>
        <div className="rounded-xl p-5 border border-[#3d3a36] bg-[#1d1c1a] text-center">
          <div className="text-4xl font-bold mb-1" style={{ color: METHOD_COLORS.generative }}>
            ≈500ms
          </div>
          <div className="text-sm text-[#948d82] uppercase tracking-wide">
            End-to-end interaction target
          </div>
        </div>
      </div>

      <SlideEvidenceStrip
        links={[
          { label: 'Avatar Forcing', href: EVIDENCE_URLS.arxivAvatarForcing },
          { label: 'LiveTalk', href: EVIDENCE_URLS.arxivLiveTalk },
          { label: 'SoulX-FlashHead', href: EVIDENCE_URLS.arxivSoulXFlashHead },
        ]}
        note="Latency/FPS values are taken from paper-reported settings and are not normalized head-to-head benchmarks."
      />
    </div>
  );
}

function SlideGenerativeIdentityResponse() {
  return (
    <div className="flex flex-col justify-center h-full px-12 max-w-7xl mx-auto">
      <SlideMethodBadge method="Video Generation Deep Dive" color={METHOD_COLORS.generative} />
      <h2 className="text-5xl font-bold mb-2">Identity & Response Stack</h2>
      <div className="w-14 h-1 rounded-full mb-4" style={{ background: METHOD_COLORS.generative }} />

      <div className="rounded-xl p-3 border border-[#3d3a36] bg-[#1d1c1a] mb-4">
        <p className="text-sm text-[#c7c2b9]">
          Scope note: this page focuses on generation/avatar-backend control stack. End-user multimodal perception is a separate upstream processing layer.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-5 mb-4">
        <div className="rounded-xl p-4 border border-[#3d3a36] bg-[#1d1c1a]">
          <h3 className="text-lg font-semibold text-[#f5f2ec] mb-2">1) Identity Creation</h3>
          <ul className="space-y-1.5 text-sm text-[#bdb8af]">
            <li>Inputs: one portrait image (or short reference video) + optional style prompt.</li>
            <li>Models: reference-conditioned identity encoders (for example, ReferenceNet/IP-Adapter style modules).</li>
            <li>Representation: latent identity tokens/features (2D latent space or DiT embeddings).</li>
            <li>Output modality: identity-conditioned latent state for subsequent frame generation.</li>
          </ul>
        </div>
        <div className="rounded-xl p-4 border border-[#3d3a36] bg-[#1d1c1a]">
          <h3 className="text-lg font-semibold text-[#f5f2ec] mb-2">2) Real-time Response Model</h3>
          <ul className="space-y-1.5 text-sm text-[#bdb8af]">
            <li>Renderer/control inputs: audio waveform + text intent; optional pose/emotion/image controls for stronger conditioning.</li>
            <li>Conditional inputs: direct webcam-derived gaze/AU signals usually need an extra perception front-end.</li>
            <li>Models: audio/text encoders + temporal causal modules + diffusion/DiT decoders (LiveTalk/Avatar Forcing style).</li>
            <li>Runtime output: generated video frames with temporal lip-sync and expression consistency constraints.</li>
            <li>Delivery output: WebRTC streamed video + optional synthesized speech audio.</li>
          </ul>
        </div>
      </div>

      <div className="rounded-xl p-4 border border-[#3d3a36] bg-[#1d1c1a]">
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="rounded-lg p-3 bg-[#181716]">
            <p className="text-[#948d82] uppercase tracking-wide mb-1">Input Modalities</p>
            <p className="text-[#f5f2ec]">Portrait/video reference, audio, text intent, emotion/pose controls, turn-state.</p>
          </div>
          <div className="rounded-lg p-3 bg-[#181716]">
            <p className="text-[#948d82] uppercase tracking-wide mb-1">Core Models</p>
            <p className="text-[#f5f2ec]">Reference encoders, diffusion/DiT denoisers, temporal forcing modules.</p>
          </div>
          <div className="rounded-lg p-3 bg-[#181716]">
            <p className="text-[#948d82] uppercase tracking-wide mb-1">Runtime Representation</p>
            <p className="text-[#f5f2ec]">Implicit latent dynamics decoded directly to pixels.</p>
          </div>
        </div>
      </div>

      <SlideEvidenceStrip
        links={[
          { label: 'Avatar Forcing', href: EVIDENCE_URLS.arxivAvatarForcing },
          { label: 'LiveTalk', href: EVIDENCE_URLS.arxivLiveTalk },
          { label: 'StreamAvatar', href: EVIDENCE_URLS.arxivStreamAvatar },
        ]}
      />
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
              { step: '3', text: 'Repeat across many denoising steps (commonly tens in baseline DDPM)' },
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

      <SlideEvidenceStrip
        links={[
          { label: 'DDPM', href: EVIDENCE_URLS.arxivDdpm },
          { label: 'Progressive Distillation', href: EVIDENCE_URLS.arxivProgressiveDistillation },
          { label: 'LiveTalk (distillation application)', href: EVIDENCE_URLS.arxivLiveTalk },
        ]}
      />
    </div>
  );
}

function SlideGenerativeResearch() {
  type TrackId = 'latency' | 'control' | 'deployment';
  type ResearchPaper = {
    name: string;
    metric: string;
    desc: string;
    focus: string;
    inputs: string;
    url: string;
    codeUrl?: string;
    codeLabel?: string;
  };

  const tracks: Array<{ id: TrackId; label: string; hint: string; papers: ResearchPaper[] }> = [
    {
      id: 'latency',
      label: 'Latency',
      hint: 'Papers that explicitly target lower interaction delay.',
      papers: [
        {
          name: 'Avatar Forcing (2026)',
          metric: '~500ms E2E',
          desc: 'Causal multimodal forcing for low-latency conversational video.',
          focus: 'Keep interactive state warm between turns to reduce first-reaction lag.',
          inputs: 'Audio + interaction history + multimodal context',
          url: EVIDENCE_URLS.arxivAvatarForcing,
          codeUrl: EVIDENCE_URLS.githubAvatarForcing,
          codeLabel: 'GitHub code',
        },
        {
          name: 'SoulX-FlashHead (2026)',
          metric: 'Up to 96 FPS (Lite)',
          desc: 'Oracle-guided streaming architecture for long-horizon stability.',
          focus: 'Sustain real-time generation with stable long-form behavior.',
          inputs: 'Audio + visual conditioning',
          url: EVIDENCE_URLS.arxivSoulXFlashHead,
          codeUrl: EVIDENCE_URLS.githubSoulXFlashHead,
          codeLabel: 'GitHub code',
        },
        {
          name: 'LiveTalk (2025)',
          metric: '20x distillation',
          desc: 'Real-time multimodal interactive video diffusion.',
          focus: 'Compress denoising cost using a distillation-heavy real-time stack.',
          inputs: 'Audio + text + image',
          url: EVIDENCE_URLS.arxivLiveTalk,
        },
      ],
    },
    {
      id: 'control',
      label: 'Control',
      hint: 'Papers emphasizing identity consistency and controllable interaction.',
      papers: [
        {
          name: 'Knot Forcing (2025)',
          metric: 'Identity stability',
          desc: 'Infinite interactive portrait animation with temporal knot constraints.',
          focus: 'Hold identity and temporal consistency under prolonged interaction.',
          inputs: 'Audio + interaction controls',
          url: EVIDENCE_URLS.arxivKnotForcing,
        },
        {
          name: 'StreamAvatar (2025)',
          metric: 'Streaming diffusion',
          desc: 'Consistent streaming talking avatar generation.',
          focus: 'Preserve coherence while running a streaming pipeline.',
          inputs: 'Audio + dialogue context',
          url: EVIDENCE_URLS.arxivStreamAvatar,
        },
        {
          name: 'MIDAS (2025)',
          metric: 'Audio+pose+text',
          desc: 'Real-time autoregressive multimodal digital human synthesis.',
          focus: 'Fuse multiple control channels in one autoregressive model.',
          inputs: 'Audio + pose + text',
          url: EVIDENCE_URLS.arxivMIDAS,
        },
      ],
    },
    {
      id: 'deployment',
      label: 'Deployment',
      hint: 'Papers emphasizing practical real-time deployment paths.',
      papers: [
        {
          name: 'TaoAvatar (2025)',
          metric: '90 FPS Vision Pro',
          desc: 'Controllable full-body 3DGS avatars with XR deployment results.',
          focus: 'Ship controllable Gaussian avatars in real-time XR settings.',
          inputs: 'Audio + expression + gesture/pose controls',
          url: EVIDENCE_URLS.arxivTaoAvatar,
          codeUrl: EVIDENCE_URLS.githubTaoAvatarMobileDemo,
          codeLabel: 'Mobile demo code',
        },
        {
          name: 'ICo3D (2026)',
          metric: 'Gaze + expression',
          desc: 'Interactive conversational 3D virtual human using Gaussian components.',
          focus: 'Integrate conversational behavior with explicit 3D avatar representation.',
          inputs: 'Speech + conversation state + expression controls',
          url: EVIDENCE_URLS.arxivICo3D,
        },
        {
          name: 'FastGHA (2026)',
          metric: 'Few-shot real-time',
          desc: 'Few-shot Gaussian head avatars animated in real time.',
          focus: 'Lower data requirements while preserving real-time behavior.',
          inputs: 'Few-shot visual identity + driving signals',
          url: EVIDENCE_URLS.arxivFastGHA,
        },
      ],
    },
  ];

  type PaperName = ResearchPaper['name'];
  const [activeTrackId, setActiveTrackId] = useState<TrackId>('latency');
  const [activePaperName, setActivePaperName] = useState<PaperName>(tracks[0].papers[0].name);

  const activeTrack = tracks.find((track) => track.id === activeTrackId) ?? tracks[0];
  const activePaper = activeTrack.papers.find((paper) => paper.name === activePaperName) ?? activeTrack.papers[0];

  return (
    <div className="flex flex-col justify-center h-full px-12 max-w-7xl mx-auto">
      <SlideMethodBadge method="Video Generation" color={METHOD_COLORS.generative} />
      <h2 className="text-5xl font-bold mb-2">Research Frontier</h2>
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

          <div className="space-y-2 text-xs text-[#bdb8af]">
            <div>
              <p className="text-[#948d82] uppercase tracking-widest mb-1">Focus</p>
              <p className="text-[#f5f2ec]">{activePaper.focus}</p>
            </div>
            <div>
              <p className="text-[#948d82] uppercase tracking-widest mb-1">Primary Inputs</p>
              <p className="text-[#f5f2ec]">{activePaper.inputs}</p>
            </div>
            <div className="pt-1 flex flex-wrap items-center gap-2">
              <a
                href={activePaper.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold hover:underline"
                style={{ color: METHOD_COLORS.generative }}
              >
                Original paper
                <ExternalLink size={12} />
              </a>
              {activePaper.codeUrl ? (
                <a
                  href={activePaper.codeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold hover:underline text-[#f5f2ec]"
                >
                  {activePaper.codeLabel ?? 'Code'}
                  <ExternalLink size={12} />
                </a>
              ) : (
                <span className="text-[10px] text-[#7f7b74]">Code: not public</span>
              )}
            </div>
          </div>

          <p className="text-[11px] text-[#948d82] mt-4">
            This panel is source-backed: each card links to the original paper; no synthetic scoring is used here.
          </p>
        </div>
      </div>

      <SlideEvidenceStrip
        links={[
          { label: 'Avatar Forcing', href: EVIDENCE_URLS.arxivAvatarForcing },
          { label: 'SoulX-FlashHead', href: EVIDENCE_URLS.arxivSoulXFlashHead },
          { label: 'LiveTalk', href: EVIDENCE_URLS.arxivLiveTalk },
          { label: 'TaoAvatar', href: EVIDENCE_URLS.arxivTaoAvatar },
        ]}
      />
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
          {' '}Each cloud is a 3D Gaussian with center, shape, color, and opacity. Unlike NeRF-style MLP field queries, 3DGS renders by projecting those clouds to screen-space ellipses and alpha-blending front-to-back.
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
              Useful for quick avatar bootstrapping
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
          { id: 'opt', label: 'Estimate Gaussian Params (mu, Sigma, c, alpha)' },
          { id: 'project', label: 'Project to 2D Ellipses' },
          { id: 'blend', label: 'Alpha Blend (Depth-Aware)' },
          { id: 'render', label: 'Real-time View Synthesis' },
        ]}
      />

      <SlideEvidenceStrip
        links={[
          { label: '3D Gaussian Splatting', href: EVIDENCE_URLS.arxiv3dgs },
          { label: 'LAM (one-shot Gaussian avatar)', href: EVIDENCE_URLS.arxivLAM },
        ]}
      />
    </div>
  );
}

function SlideGaussianIdentityResponse() {
  return (
    <div className="flex flex-col justify-center h-full px-12 max-w-7xl mx-auto">
      <SlideMethodBadge method="Gaussian Deep Dive" color={METHOD_COLORS.gaussian} />
      <h2 className="text-5xl font-bold mb-2">Identity & Response Stack</h2>
      <div className="w-14 h-1 rounded-full mb-4" style={{ background: METHOD_COLORS.gaussian }} />

      <div className="rounded-xl p-3 border border-[#3d3a36] bg-[#1d1c1a] mb-4">
        <p className="text-sm text-[#c7c2b9]">
          Scope note: this page describes Gaussian avatar control/render stack. End-user multimodal sensing and inference remain upstream components.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-5 mb-4">
        <div className="rounded-xl p-4 border border-[#3d3a36] bg-[#1d1c1a]">
          <h3 className="text-lg font-semibold text-[#f5f2ec] mb-2">1) Identity Creation</h3>
          <ul className="space-y-1.5 text-sm text-[#bdb8af]">
            <li>Inputs: single portrait (feed-forward) or multiview photo/video capture (optimized).</li>
            <li>Models: one-shot regressors (e.g., LAM-style) or iterative 3DGS optimization loops.</li>
            <li>Representation: explicit Gaussians (mu, Sigma, alpha, SH color) plus optional face/body rig.</li>
            <li>Output modality: editable 3D avatar state with per-splat geometry/appearance control.</li>
          </ul>
        </div>
        <div className="rounded-xl p-4 border border-[#3d3a36] bg-[#1d1c1a]">
          <h3 className="text-lg font-semibold text-[#f5f2ec] mb-2">2) Real-time Response Model</h3>
          <ul className="space-y-1.5 text-sm text-[#bdb8af]">
            <li>Common avatar-backend control inputs: audio, expression coefficients, and head pose; direct webcam gaze/AU feeds are often extra modules.</li>
            <li>Models: Audio2Expression driver + deformation model (FLAME/SMPL-X or learned fields).</li>
            <li>Renderer: differentiable or real-time splat rasterizer with depth-aware alpha blending.</li>
            <li>Final outputs: high-FPS video stream and avatar state updates for interaction loops.</li>
          </ul>
        </div>
      </div>

      <div className="rounded-xl p-4 border border-[#3d3a36] bg-[#1d1c1a]">
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="rounded-lg p-3 bg-[#181716]">
            <p className="text-[#948d82] uppercase tracking-wide mb-1">Input Modalities</p>
            <p className="text-[#f5f2ec]">Image/video capture, audio speech, expression/pose drivers, optional gaze/emotion controls.</p>
          </div>
          <div className="rounded-lg p-3 bg-[#181716]">
            <p className="text-[#948d82] uppercase tracking-wide mb-1">Core Models</p>
            <p className="text-[#f5f2ec]">3DGS optimizers, feed-forward avatar regressors, Audio2Expression drivers.</p>
          </div>
          <div className="rounded-lg p-3 bg-[#181716]">
            <p className="text-[#948d82] uppercase tracking-wide mb-1">Runtime Representation</p>
            <p className="text-[#f5f2ec]">Explicit 3D Gaussian primitives rasterized directly in real time.</p>
          </div>
        </div>
      </div>

      <SlideEvidenceStrip
        links={[
          { label: '3D Gaussian Splatting', href: EVIDENCE_URLS.arxiv3dgs },
          { label: 'TaoAvatar', href: EVIDENCE_URLS.arxivTaoAvatar },
          { label: 'ICo3D', href: EVIDENCE_URLS.arxivICo3D },
          { label: 'FastGHA', href: EVIDENCE_URLS.arxivFastGHA },
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

      <SlideEvidenceStrip
        links={[
          { label: '3D Gaussian Splatting', href: EVIDENCE_URLS.arxiv3dgs },
          { label: 'LAM', href: EVIDENCE_URLS.arxivLAM },
        ]}
      />
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

      <SlideEvidenceStrip
        links={[
          { label: '3D Gaussian Splatting', href: EVIDENCE_URLS.arxiv3dgs },
          { label: 'TaoAvatar', href: EVIDENCE_URLS.arxivTaoAvatar },
        ]}
      />
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

      <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
        <a
          href={EVIDENCE_URLS.arxivLAM}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#3d3a36] text-sm font-semibold hover:bg-[#242220] transition-colors"
          style={{ color: METHOD_COLORS.gaussian }}
        >
          LAM Paper
          <ExternalLink size={13} />
        </a>
        <a
          href={EVIDENCE_URLS.arxiv3dgs}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#3d3a36] text-sm font-semibold hover:bg-[#242220] transition-colors"
          style={{ color: METHOD_COLORS.gaussian }}
        >
          3DGS Paper
          <ExternalLink size={13} />
        </a>
      </div>

      <div className="flex items-center gap-2 text-xs text-[#948d82] mt-6">
        <Cpu size={14} />
        <span>Requires local Docker setup (see gaussian-avatar/ directory)</span>
      </div>
    </div>
  );
}

function SlideGaussianSupersplatDemo({
  title,
  demoUrl,
}: {
  title: string;
  demoUrl: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-12 text-center">
      <SlideMethodBadge method="Gaussian Splatting Demo" label="SuperSplat" color={METHOD_COLORS.gaussian} />
      <h2 className="text-5xl font-bold mb-1">{title}</h2>
      <p className="text-[#bdb8af] text-lg mb-5 max-w-3xl">
        Interactive Gaussian splat scene by artist Dany Bittel.
      </p>

      <div className="w-full max-w-5xl aspect-video rounded-xl overflow-hidden border border-[#3d3a36] bg-[#1d1c1a]">
        <iframe
          src={demoUrl}
          title={title}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>

      <a
        href={demoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 mt-5 rounded-lg border border-[#3d3a36] text-sm font-semibold hover:bg-[#242220] transition-colors"
        style={{ color: METHOD_COLORS.gaussian }}
      >
        <ExternalLink size={14} />
        Open on superspl.at
      </a>
    </div>
  );
}

function SlideGaussianSupersplatDemoOne() {
  return (
    <SlideGaussianSupersplatDemo
      title="Gaussian Splat Demo: Dany Bittel (Scene 1)"
      demoUrl={SUPERSPLAT_DEMO_ONE_URL}
    />
  );
}

function SlideGaussianSupersplatDemoTwo() {
  return (
    <SlideGaussianSupersplatDemo
      title="Gaussian Splat Demo: Dany Bittel (Scene 2)"
      demoUrl={SUPERSPLAT_DEMO_TWO_URL}
    />
  );
}

function SlideGaussianPersonalDemo() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-12 text-center">
      <SlideMethodBadge method="Gaussian Splatting Demo" label="Personal Demo" color={METHOD_COLORS.gaussian} />
      <h2 className="text-5xl font-bold mb-1">Mr. Platypus</h2>
      <p className="text-[#bdb8af] text-lg mb-5 max-w-3xl">
        Personal PlayCanvas interactive demo.
      </p>

      <div className="w-full max-w-5xl aspect-video rounded-xl overflow-hidden border border-[#3d3a36] bg-[#1d1c1a]">
        <iframe
          src={PLAYCANVAS_PERSONAL_DEMO_URL}
          title="Personal PlayCanvas Gaussian Demo"
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>

      <a
        href={PLAYCANVAS_PERSONAL_DEMO_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 mt-5 rounded-lg border border-[#3d3a36] text-sm font-semibold hover:bg-[#242220] transition-colors"
        style={{ color: METHOD_COLORS.gaussian }}
      >
        <ExternalLink size={14} />
        Open on PlayCanvas
      </a>
    </div>
  );
}

function SlideGaussianWorldlabsDemo() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-12 text-center">
      <SlideMethodBadge method="Gaussian Splatting Demo" label="World Labs" color={METHOD_COLORS.gaussian} />
      <h2 className="text-5xl font-bold mb-1">World Labs Gaussian Demo</h2>
      <p className="text-[#bdb8af] text-lg mb-6 max-w-3xl">
        Open the official World Labs Marble experience directly in a new tab.
      </p>

      <a
        href={WORLDLABS_MARBLE_APP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-base font-semibold border border-[#3d3a36] hover:bg-[#242220] transition-colors"
        style={{ color: METHOD_COLORS.gaussian }}
      >
        <Globe size={17} />
        Open marble.worldlabs.ai
        <ExternalLink size={15} />
      </a>
    </div>
  );
}

function SlideGaussianResearchVideoWall() {
  return (
    <div className="flex flex-col justify-center h-full px-12 max-w-7xl mx-auto">
      <SlideMethodBadge method="Gaussian Splatting Demo" label="YouTube Research Wall" color={METHOD_COLORS.gaussian} />
      <h2 className="text-5xl font-bold mb-1">Gaussian Avatar Research Video Wall</h2>
      <p className="text-[#bdb8af] text-base mb-4">
        Auto-collected from YouTube by the self-evolving
        <code className="mx-1">gaussian-youtube-video-wall-evolver</code>
        skill. Click any tile to open modal playback.
      </p>

      <div className="mb-5">
        <GaussianVideoWall videos={GAUSSIAN_WALL_VIDEOS} maxItems={12} compact />
      </div>

      <a
        href={GAUSSIAN_VIDEO_WALL_ROUTE}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#3d3a36] text-sm font-semibold hover:bg-[#242220] transition-colors self-start"
        style={{ color: METHOD_COLORS.gaussian }}
      >
        <ExternalLink size={14} />
        Open Full Video Wall Page
      </a>
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
      summary: 'High direct animation control with mature cinematic tooling.',
      scores: { latency: 9, realism: 8, control: 9, setup: 4, cost: 3, portability: 4 },
    },
    {
      id: 'generative',
      name: 'Video Generation',
      color: METHOD_COLORS.generative,
      summary: 'Low setup overhead and broad deployment via managed streaming providers.',
      scores: { latency: 6, realism: 9, control: 6, setup: 9, cost: 5, portability: 9 },
    },
    {
      id: 'gaussian',
      name: 'Gaussian Splatting',
      color: METHOD_COLORS.gaussian,
      summary: 'Balanced latency, quality, and cost when self-hosted rendering is available.',
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

/* 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?   NEW SLIDES (Deep Research Overhaul)
   鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?*/

function SlideSignalsInteraction() {
  type AspectId = 'endUser' | 'avatarInputs' | 'outputs' | 'coupling';
  type ApproachId = 'metahuman' | 'generative' | 'gaussian';
  type SupportLevel = 0 | 1 | 2;
  type SignalRef = { label: string; href: string };
  type SignalRow = {
    name: string;
    support: [SupportLevel, SupportLevel, SupportLevel];
    refs: SignalRef[];
    note?: string;
  };
  const [activeApproach, setActiveApproach] = useState<ApproachId>('metahuman');
  const [activeAspect, setActiveAspect] = useState<AspectId>('endUser');
  const [selectedSignalName, setSelectedSignalName] = useState<string>('');

  const supportLabels: Record<SupportLevel, string> = {
    0: 'Not native',
    1: 'Conditional',
    2: 'Native',
  };

  const approaches: Record<ApproachId, { label: string; short: string; color: string; index: 0 | 1 | 2 }> = {
    metahuman: { label: 'MetaHuman', short: 'MH', color: METHOD_COLORS.metahuman, index: 0 },
    generative: { label: 'Video Generation', short: 'VG', color: METHOD_COLORS.generative, index: 1 },
    gaussian: { label: 'Gaussian Splatting', short: 'GS', color: METHOD_COLORS.gaussian, index: 2 },
  };

  const tabs: Record<
    AspectId,
    {
      label: string;
      signals: SignalRow[];
    }
  > = {
    endUser: {
      label: 'End User Inputs',
      signals: [
        {
          name: 'Live user speech/audio',
          support: [2, 2, 2],
          refs: [{ label: 'OpenAI Realtime', href: EVIDENCE_URLS.openaiRealtimeApi }],
        },
        {
          name: 'User text input / chat message',
          support: [2, 2, 2],
          refs: [{ label: 'OpenAI Realtime', href: EVIDENCE_URLS.openaiRealtimeApi }],
        },
        {
          name: 'User face video (motion retargeting)',
          support: [2, 1, 1],
          refs: [
            { label: 'MetaHuman Animator', href: EVIDENCE_URLS.epicMetaHumanAnimator },
            { label: 'Avatar Forcing', href: EVIDENCE_URLS.arxivAvatarForcing },
          ],
        },
        {
          name: 'User face video (response modeling: expression/affect)',
          support: [0, 0, 0],
          refs: [
            { label: 'GazeGPT', href: EVIDENCE_URLS.arxivGazeGPT },
            { label: 'GPT-4 Eyes docs', href: EVIDENCE_URLS.pupilGpt4EyesDocs },
          ],
          note: 'Typically implemented in an upstream perception module, not native in avatar backends.',
        },
        {
          name: 'User gaze / eye-movement stream',
          support: [0, 0, 0],
          refs: [
            { label: 'GazeGPT', href: EVIDENCE_URLS.arxivGazeGPT },
            { label: 'GPT-4 Eyes code', href: EVIDENCE_URLS.pupilGpt4EyesCode },
          ],
          note: 'Usually routed into context/state estimation before avatar actuation.',
        },
        {
          name: 'User head pose / body gesture',
          support: [2, 1, 1],
          refs: [
            { label: 'MetaHuman Live Link', href: EVIDENCE_URLS.epicMetaHumanLiveLink },
            { label: 'TaoAvatar', href: EVIDENCE_URLS.arxivTaoAvatar },
          ],
        },
        {
          name: 'User interaction events (click/select/tool)',
          support: [2, 2, 2],
          refs: [{ label: 'OpenAI Realtime', href: EVIDENCE_URLS.openaiRealtimeApi }],
        },
      ],
    },
    avatarInputs: {
      label: 'Avatar System Inputs (Control Layer)',
      signals: [
        {
          name: 'ASR transcript + confidence',
          support: [2, 2, 2],
          refs: [{ label: 'OpenAI Realtime', href: EVIDENCE_URLS.openaiRealtimeApi }],
        },
        {
          name: 'VAD + turn-taking state',
          support: [2, 2, 2],
          refs: [{ label: 'OpenAI Realtime', href: EVIDENCE_URLS.openaiRealtimeApi }],
        },
        {
          name: 'Emotion/affect estimates',
          support: [1, 1, 1],
          refs: [
            { label: 'LiveTalk', href: EVIDENCE_URLS.arxivLiveTalk },
            { label: 'Avatar Forcing', href: EVIDENCE_URLS.arxivAvatarForcing },
          ],
          note: 'Conditional because affect inference is usually external to the avatar backend.',
        },
        {
          name: 'Viseme / expression coefficients',
          support: [2, 1, 2],
          refs: [
            { label: 'MetaHuman Audio Driven', href: EVIDENCE_URLS.epicAudioDrivenAnimation },
            { label: 'NVIDIA Audio2Face', href: EVIDENCE_URLS.nvidiaAudio2FaceRepo },
          ],
        },
        {
          name: 'LLM policy tokens / dialogue acts',
          support: [2, 2, 2],
          refs: [{ label: 'OpenAI Realtime', href: EVIDENCE_URLS.openaiRealtimeApi }],
        },
        {
          name: 'Tool or real-time API events',
          support: [2, 2, 2],
          refs: [{ label: 'OpenAI Realtime', href: EVIDENCE_URLS.openaiRealtimeApi }],
        },
        {
          name: 'Camera/staging directives',
          support: [2, 1, 1],
          refs: [
            { label: 'MetaHuman docs', href: EVIDENCE_URLS.epicMetaHumanDocs },
            { label: 'LiveTalk', href: EVIDENCE_URLS.arxivLiveTalk },
          ],
        },
        {
          name: 'Head/eye/gesture motion targets',
          support: [2, 1, 2],
          refs: [
            { label: 'MetaHuman Live Link', href: EVIDENCE_URLS.epicMetaHumanLiveLink },
            { label: 'TaoAvatar', href: EVIDENCE_URLS.arxivTaoAvatar },
          ],
        },
      ],
    },
    outputs: {
      label: 'Avatar Outputs',
      signals: [
        {
          name: 'Speech audio',
          support: [2, 2, 2],
          refs: [{ label: 'OpenAI Realtime', href: EVIDENCE_URLS.openaiRealtimeApi }],
        },
        {
          name: 'Facial action units / expression curves',
          support: [2, 1, 2],
          refs: [
            { label: 'MetaHuman docs', href: EVIDENCE_URLS.epicMetaHumanDocs },
            { label: 'NVIDIA Audio2Face', href: EVIDENCE_URLS.nvidiaAudio2FaceRepo },
          ],
        },
        {
          name: 'Head motion',
          support: [2, 2, 2],
          refs: [
            { label: 'MetaHuman Live Link', href: EVIDENCE_URLS.epicMetaHumanLiveLink },
            { label: 'LiveTalk', href: EVIDENCE_URLS.arxivLiveTalk },
          ],
        },
        {
          name: 'Gaze shifts',
          support: [2, 1, 1],
          refs: [
            { label: 'MetaHuman docs', href: EVIDENCE_URLS.epicMetaHumanDocs },
            { label: 'ICo3D', href: EVIDENCE_URLS.arxivICo3D },
          ],
        },
        {
          name: 'Hand gestures',
          support: [2, 2, 1],
          refs: [
            { label: 'MetaHuman docs', href: EVIDENCE_URLS.epicMetaHumanDocs },
            { label: 'TaoAvatar', href: EVIDENCE_URLS.arxivTaoAvatar },
          ],
        },
        {
          name: 'Idle micro-motion',
          support: [2, 2, 2],
          refs: [
            { label: 'MetaHuman docs', href: EVIDENCE_URLS.epicMetaHumanDocs },
            { label: 'LiveTalk', href: EVIDENCE_URLS.arxivLiveTalk },
          ],
        },
      ],
    },
    coupling: {
      label: 'Coupling Styles',
      signals: [
        {
          name: 'Audio-only driven',
          support: [2, 2, 2],
          refs: [
            { label: 'MetaHuman Audio Driven', href: EVIDENCE_URLS.epicAudioDrivenAnimation },
            { label: 'NVIDIA Audio2Face', href: EVIDENCE_URLS.nvidiaAudio2FaceRepo },
          ],
        },
        {
          name: 'Audio + user motion (Avatar Forcing)',
          support: [0, 2, 0],
          refs: [{ label: 'Avatar Forcing', href: EVIDENCE_URLS.arxivAvatarForcing }],
        },
        {
          name: 'Audio + text + image (LiveTalk)',
          support: [0, 2, 0],
          refs: [{ label: 'LiveTalk', href: EVIDENCE_URLS.arxivLiveTalk }],
        },
        {
          name: 'Audio + pose (TaoAvatar)',
          support: [0, 0, 2],
          refs: [{ label: 'TaoAvatar', href: EVIDENCE_URLS.arxivTaoAvatar }],
        },
      ],
    },
  };

  const active = tabs[activeAspect];
  const approach = approaches[activeApproach];
  const selectedSignal = active.signals.find((s) => s.name === selectedSignalName) ?? active.signals[0];

  const supportPill = (level: SupportLevel) => {
    const style =
      level === 2
        ? { color: '#6ec87a', borderColor: '#6ec87a66', background: '#6ec87a12' }
        : level === 1
          ? { color: '#e1a65b', borderColor: '#e1a65b66', background: '#e1a65b12' }
          : { color: '#948d82', borderColor: '#4a4641', background: '#252320' };
    return (
      <span className="text-[10px] px-2 py-0.5 rounded border" style={style}>
        {supportLabels[level]}
      </span>
    );
  };

  return (
    <div className="flex flex-col justify-center h-full px-12 max-w-7xl mx-auto">
      <h2 className="text-5xl font-bold mb-2">Interaction Signals</h2>
      <div className="w-14 h-1 rounded-full mb-4" style={{ background: METHOD_COLORS.gaussian }} />
      <p className="text-base text-[#bdb8af] mb-4">
        Approach tab selects backend. Aspect tab separates end-user perception inputs from avatar control/render interfaces.
      </p>

      <div className="rounded-xl p-3 border border-[#3d3a36] bg-[#1d1c1a] mb-4">
        <p className="text-xs text-[#c7c2b9]">
          Face video has two roles: <span className="text-[#f5f2ec]">retargeting</span> vs
          <span className="text-[#f5f2ec]"> perception for response modeling</span>.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {(Object.entries(approaches) as [ApproachId, typeof approaches[ApproachId]][]).map(([id, item]) => (
          <button
            key={id}
            onClick={() => {
              setActiveApproach(id);
              setSelectedSignalName('');
            }}
            className="px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wide border transition-colors"
            style={{
              borderColor: activeApproach === id ? item.color : '#3d3a36',
              color: activeApproach === id ? '#f5f2ec' : '#bdb8af',
              background: activeApproach === id ? `${item.color}16` : '#181716',
            }}
          >
            {item.short} · {item.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {(Object.entries(tabs) as [AspectId, typeof tabs[AspectId]][]).map(([id, tab]) => (
          <button
            key={id}
            onClick={() => {
              setActiveAspect(id);
              setSelectedSignalName('');
            }}
            className="px-3 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wide border transition-colors"
            style={{
              borderColor: activeAspect === id ? METHOD_COLORS.gaussian : '#3d3a36',
              color: activeAspect === id ? '#f5f2ec' : '#bdb8af',
              background: activeAspect === id ? `${METHOD_COLORS.gaussian}16` : '#181716',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl p-5 border border-[#3d3a36] bg-[#1d1c1a]">
        <div className="flex items-center gap-4 mb-3 text-sm text-[#948d82] uppercase tracking-widest">
          <span className="flex-1">Signal</span>
          <span style={{ color: approach.color }}>{approach.short}</span>
        </div>
        <div className="space-y-2">
          {active.signals.map((signal) => (
            <button
              key={signal.name}
              type="button"
              onClick={() => setSelectedSignalName(signal.name)}
              className={`w-full text-left flex items-start gap-4 py-2 border-b border-[#242220] last:border-0 ${selectedSignal?.name === signal.name ? 'bg-[#20201d]' : ''}`}
            >
              <div className="flex-1 min-w-0">
                <span className="text-base text-[#f5f2ec]">{signal.name}</span>
                {selectedSignal?.name === signal.name && signal.note ? (
                  <p className="text-[11px] text-[#948d82] mt-0.5">{signal.note}</p>
                ) : null}
              </div>
              {supportPill(signal.support[approach.index])}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-5 mt-3 text-[11px] text-[#948d82]">
        <div className="flex items-center gap-1.5 text-[#6ec87a]">
          <div className="w-2.5 h-2.5 rounded-full border border-[#6ec87a] bg-[#6ec87a]" />
          Native
        </div>
        <div className="flex items-center gap-1.5 text-[#e1a65b]">
          <div className="w-2.5 h-2.5 rounded-full border border-[#e1a65b] bg-[#e1a65b88]" />
          Conditional
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full border border-[#4a4641] bg-[#3d3a36]" />
          Not native
        </div>
      </div>

      <p className="text-xs text-[#948d82] mt-3">
        End-user inputs belong to perception. Avatar-system inputs are control/actuation signals. Native = documented inside backend defaults.
      </p>

      <SlideEvidenceStrip
        links={[
          { label: 'OpenAI Realtime API', href: EVIDENCE_URLS.openaiRealtimeApi },
          { label: 'MetaHuman Animator', href: EVIDENCE_URLS.epicMetaHumanAnimator },
          { label: 'MetaHuman Audio Driven', href: EVIDENCE_URLS.epicAudioDrivenAnimation },
          { label: 'MetaHuman Live Link', href: EVIDENCE_URLS.epicMetaHumanLiveLink },
          { label: 'NVIDIA Audio2Face', href: EVIDENCE_URLS.nvidiaAudio2FaceRepo },
          { label: 'GazeGPT', href: EVIDENCE_URLS.arxivGazeGPT },
          { label: 'GPT-4 Eyes docs', href: EVIDENCE_URLS.pupilGpt4EyesDocs },
          { label: 'Avatar Forcing', href: EVIDENCE_URLS.arxivAvatarForcing },
          { label: 'LiveTalk', href: EVIDENCE_URLS.arxivLiveTalk },
          { label: 'TaoAvatar', href: EVIDENCE_URLS.arxivTaoAvatar },
          { label: 'ICo3D', href: EVIDENCE_URLS.arxivICo3D },
        ]}
        note="Support dots indicate default pipeline behavior in cited systems, not absolute theoretical limits."
      />
      <p className="text-[10px] text-[#7f7b74] mt-2">
        Heuristic classification updated from cited papers/docs on February 19, 2026.
      </p>
    </div>
  );
}

function SlideCurrentE2EIOPaths() {
  const inputModalities = [
    'Audio (speech + prosody)',
    'Text/chat messages',
    'Video (face/head/gesture)',
    'Facial expression signal (AU / affect features)',
    'Gaze/eye-tracking stream',
    'Interaction events (click/select/tool)',
  ];

  const outputModalities = [
    'Speech audio',
    'Facial expression dynamics',
    'Head and gaze motion',
    'Gesture and idle motion',
    'Text/metadata for logs and tools',
  ];

  const longPath = [
    'Input audio -> ASR transcript',
    'Transcript + multimodal context -> LLM policy/dialogue',
    'LLM text -> TTS audio',
    'TTS + policy controls -> avatar speech/lipsync + expression output',
  ];

  const directPath = [
    'Input audio + interaction state -> audio-to-audio real-time model',
    'Real-time output audio/prosody -> viseme/expression solver',
    'Solver output -> rig curves / expression coefficients',
    'Renderer executes motion + shading in real time',
  ];

  return (
    <div className="flex flex-col justify-center h-full px-12 max-w-7xl mx-auto">
      <SlideMethodBadge method="End-to-End IO" label="Current Pipeline (Observed)" color={METHOD_COLORS.gaussian} />
      <h2 className="text-5xl font-bold mb-2">Current End-to-End IO Paths</h2>
      <div className="w-14 h-1 rounded-full mb-4" style={{ background: METHOD_COLORS.gaussian }} />

      <div className="mb-4">
        <SlideFlow
          accentColor={METHOD_COLORS.gaussian}
          nodes={[
            { id: 'user', label: 'End user multimodal input' },
            { id: 'perception', label: 'Perception (ASR + vision + gaze + events)' },
            { id: 'fusion', label: 'Temporal fusion + state update' },
            { id: 'policy', label: 'Response policy / actuation planning' },
            { id: 'render', label: 'Avatar rendering + delivery' },
          ]}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="rounded-xl p-4 border border-[#3d3a36] bg-[#1d1c1a]">
          <h3 className="text-base font-semibold text-[#f5f2ec] mb-2">End User Inputs</h3>
          <ul className="list-disc pl-5 space-y-1.5 text-sm text-[#c7c2b9]">
            {inputModalities.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl p-4 border border-[#3d3a36] bg-[#1d1c1a]">
          <h3 className="text-base font-semibold text-[#f5f2ec] mb-2">Multimodal Outputs</h3>
          <ul className="list-disc pl-5 space-y-1.5 text-sm text-[#c7c2b9]">
            {outputModalities.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="rounded-xl p-4 border border-[#3d3a36] bg-[#1d1c1a]">
          <h3 className="text-base font-semibold mb-2" style={{ color: METHOD_COLORS.generative }}>
            Path A: Semantic Voice Loop (Longer)
          </h3>
          <ul className="list-disc pl-5 space-y-1.5 text-sm text-[#c7c2b9]">
            {longPath.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl p-4 border border-[#3d3a36] bg-[#1d1c1a]">
          <h3 className="text-base font-semibold mb-2" style={{ color: METHOD_COLORS.metahuman }}>
            Path B: Audio-to-Audio + Audio-to-Face
          </h3>
          <ul className="list-disc pl-5 space-y-1.5 text-sm text-[#c7c2b9]">
            {directPath.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </div>
      </div>

      <p className="text-sm text-[#948d82] mb-2">
        Connection to the &quot;Missing Layer&quot; slide: current paths exist, but fusion reliability, memory persistence, and evaluation instrumentation are still incomplete.
      </p>

      <SlideEvidenceStrip
        links={[
          { label: 'OpenAI Realtime API', href: EVIDENCE_URLS.openaiRealtimeApi },
          { label: 'NVIDIA ACE Unreal Plugin', href: EVIDENCE_URLS.nvidiaAcePluginDocs },
          { label: 'MetaHuman Audio Driven Animation', href: EVIDENCE_URLS.epicAudioDrivenAnimation },
          { label: 'MetaHuman Live Link', href: EVIDENCE_URLS.epicMetaHumanLiveLink },
          { label: 'NVIDIA Audio2Face (repo)', href: EVIDENCE_URLS.nvidiaAudio2FaceRepo },
          { label: 'GazeGPT paper', href: EVIDENCE_URLS.arxivGazeGPT },
          { label: 'GPT-4 Eyes docs', href: EVIDENCE_URLS.pupilGpt4EyesDocs },
          { label: 'GPT-4 Eyes code (gist)', href: EVIDENCE_URLS.pupilGpt4EyesCode },
        ]}
        note="Links document currently used or comparable input-processing paths; implementation details vary by stack."
      />
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
    sources: Array<{ label: string; href: string }>;
  }> = [
    {
      name: 'Identity Creation: Customizability & Control',
      scores: [3, 1, 2],
      cite: 'MetaHuman exposes explicit rig channels and authoring workflows; video generation is mostly latent conditioning; Gaussian pipelines sit between explicit and learned control.',
      sources: [
        { label: 'Mesh to MetaHuman', href: EVIDENCE_URLS.epicMeshToMetaHuman },
        { label: 'Avatar Forcing', href: EVIDENCE_URLS.arxivAvatarForcing },
        { label: 'LAM', href: EVIDENCE_URLS.arxivLAM },
      ],
    },
    {
      name: 'Eye / Gaze Control',
      scores: [3, 1, 2],
      cite: 'MetaHuman has direct rig-level eye controls, while gaze in generative stacks is usually conditional; ICo3D reports gaze-aware conversational control on 3D avatars.',
      sources: [
        { label: 'MetaHuman docs', href: EVIDENCE_URLS.epicMetaHumanDocs },
        { label: 'ICo3D', href: EVIDENCE_URLS.arxivICo3D },
      ],
    },
    {
      name: 'Gesture Support',
      scores: [3, 2, 1],
      cite: 'MetaHuman has mature full-body rig workflows; TaoAvatar reports controllable expression/gesture in a Gaussian avatar pipeline.',
      sources: [
        { label: 'MetaHuman docs', href: EVIDENCE_URLS.epicMetaHumanDocs },
        { label: 'TaoAvatar', href: EVIDENCE_URLS.arxivTaoAvatar },
      ],
    },
    {
      name: 'XR-Ready',
      scores: [3, 0, 3],
      cite: 'TaoAvatar reports 90 FPS on Vision Pro; MetaHuman remains widely used in Unreal-based XR production workflows.',
      sources: [
        { label: 'TaoAvatar', href: EVIDENCE_URLS.arxivTaoAvatar },
        { label: 'MetaHumans in UE', href: EVIDENCE_URLS.epicMetaHumansInUE },
      ],
    },
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
        Output/performance + identity-control comparison across the three paradigms.
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
                <p>{cap.cite}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {cap.sources.map((src) => (
                    <a
                      key={src.href}
                      href={src.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] text-[#f5f2ec] hover:underline"
                    >
                      {src.label}
                      <ExternalLink size={10} />
                    </a>
                  ))}
                </div>
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

      <p className="text-[10px] text-[#948d82] mt-2">
        Note: this matrix evaluates rendering/output and identity-control traits. Full multimodal user-input processing is a separate stack.
      </p>
      <p className="text-[10px] text-[#7f7b74] mt-1">
        Scores are evidence-guided heuristics for architecture planning, not a normalized benchmark.
      </p>

      <SlideEvidenceStrip
        links={[
          { label: 'MetaHuman docs', href: EVIDENCE_URLS.epicMetaHumanDocs },
          { label: 'Avatar Forcing', href: EVIDENCE_URLS.arxivAvatarForcing },
          { label: 'TaoAvatar', href: EVIDENCE_URLS.arxivTaoAvatar },
          { label: 'ICo3D', href: EVIDENCE_URLS.arxivICo3D },
        ]}
      />
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
          Conversely, 25 FPS can still feel responsive when first reaction is &lt;500ms.
        </p>
      </div>
    </div>
  );
}

function SlideAudio2FaceBuildingBlocks() {
  const backendCards = [
    {
      title: 'MetaHuman Backend',
      color: METHOD_COLORS.metahuman,
      representation: 'Rig + blendshape controls (ARKit / RigLogic)',
      runtime: 'UE5 rendering pipeline with deterministic control surfaces',
      notes: [
        'Useful when precise authoring and stable facial control are required.',
        'Integrates directly with Live Link and production animation stacks.',
      ],
    },
    {
      title: 'Video Diffusion Backend',
      color: METHOD_COLORS.generative,
      representation: 'Latent pixel synthesis conditioned by audio/text/image',
      runtime: 'Autoregressive/streaming diffusion video generation',
      notes: [
        'Supports one-shot identity onboarding with high visual quality potential.',
        'Control is mostly implicit via conditioning rather than explicit rig channels.',
      ],
    },
    {
      title: 'Gaussian Backend',
      color: METHOD_COLORS.gaussian,
      representation: 'Explicit 3D Gaussians + expression/pose coefficient drivers',
      runtime: 'Real-time splat rasterization (client or GPU server)',
      notes: [
        'Balances control and real-time speed on modern GPUs.',
        'Supports explicit geometry-level editing and fast render loops.',
      ],
    },
  ];

  const ecosystem = [
    { name: 'Avatar Forcing', detail: 'Public GitHub repo', url: 'https://github.com/TaekyungKi/AvatarForcing' },
    { name: 'SoulX-FlashHead', detail: 'Public GitHub repo', url: 'https://github.com/Soul-AILab/SoulX-FlashHead' },
    { name: 'TaoAvatar Mobile Demo', detail: 'Public GitHub demo code', url: 'https://github.com/alibaba/MNN/blob/master/apps/Android/Mnn3dAvatar/README.md' },
  ];

  return (
    <div className="flex flex-col justify-center h-full px-12 max-w-7xl mx-auto">
      <SlideMethodBadge method="Actuation Layer" label="Why This Page Exists" color={METHOD_COLORS.gaussian} />
      <h2 className="text-5xl font-bold mb-2">Audio-to-Avatar Actuation Bridge</h2>
      <div className="w-14 h-1 rounded-full mb-4" style={{ background: METHOD_COLORS.gaussian }} />
      <p className="text-base text-[#bdb8af] mb-4">
        Purpose: clarify the shared actuation layer between response-model output and each avatar backend.
      </p>
      <p className="text-sm text-[#948d82] mb-4">
        Same input speech signal, different backend execution paths.
      </p>

      <div className="rounded-xl p-4 border border-[#3d3a36] bg-[#1d1c1a] mb-4">
        <SlideFlow
          accentColor={METHOD_COLORS.gaussian}
          nodes={[
            { id: 'audio', label: 'Audio Input' },
            { id: 'a2e', label: 'Phoneme + Emotion Extraction' },
            { id: 'viseme', label: 'Viseme / Expression Actuation' },
            { id: 'avatar_backend', label: 'Avatar Backend (MH / VG / GS)' },
          ]}
        />
        <div className="flex items-center justify-center gap-2 text-sm text-[#948d82] mt-2">
          <Layers size={14} />
          Shared abstraction: one voice stream → one actuation interface → multiple avatar backends.
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {backendCards.map((card) => (
          <div key={card.title} className="rounded-xl p-4 border border-[#3d3a36] bg-[#1d1c1a]">
            <h3 className="text-base font-semibold mb-2" style={{ color: card.color }}>
              {card.title}
            </h3>
            <p className="text-xs text-[#948d82] mb-1">Representation</p>
            <p className="text-sm text-[#c7c2b9] mb-2">{card.representation}</p>
            <p className="text-xs text-[#948d82] mb-1">Runtime</p>
            <p className="text-sm text-[#c7c2b9] mb-2">{card.runtime}</p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-[#bdb8af]">
              {card.notes.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl p-3 border border-[#3d3a36] bg-[#1d1c1a]">
          <h3 className="text-sm font-semibold text-[#f5f2ec] mb-1">Official Tracks (2026)</h3>
          <ul className="list-disc pl-5 space-y-1 text-xs text-[#bdb8af]">
            <li>MetaHuman docs provide official Audio Driven Animation and Live Link real-time workflows.</li>
            <li>NVIDIA Audio2Face-3D is open sourced with model code and training/runtime assets.</li>
            <li>For ACE Unreal plugin deployment, verify UE-version compatibility in the current plugin docs.</li>
          </ul>
        </div>
        <div className="rounded-xl p-3 border border-[#3d3a36] bg-[#1d1c1a]">
          <h3 className="text-sm font-semibold text-[#f5f2ec] mb-1">Public Code Anchors</h3>
          <div className="space-y-2">
            {ecosystem.map((item) => (
              <a
                key={item.name}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-2 text-xs text-[#bdb8af] hover:text-[#f5f2ec] transition-colors"
              >
                <span>{item.name}</span>
                <span className="inline-flex items-center gap-1" style={{ color: METHOD_COLORS.gaussian }}>
                  {item.detail}
                  <ExternalLink size={11} />
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>

      <SlideEvidenceStrip
        links={[
          { label: 'Audio Driven Animation (Epic)', href: EVIDENCE_URLS.epicAudioDrivenAnimation },
          { label: 'Real-time Live Link (Epic)', href: EVIDENCE_URLS.epicMetaHumanLiveLink },
          { label: 'NVIDIA Audio2Face-3D', href: EVIDENCE_URLS.nvidiaAudio2FaceRepo },
          { label: 'NVIDIA Audio2Face release note', href: EVIDENCE_URLS.nvidiaAudio2FaceBlog },
          { label: 'ACE Unreal plugin docs', href: EVIDENCE_URLS.nvidiaAcePluginDocs },
        ]}
      />
    </div>
  );
}

function SlideWhereIntelligenceLives() {
  const criteria = [
    'Need precise expression/gaze/gesture control?',
    'Need deterministic debugging and guardrails?',
    'Need faster setup with fewer explicit control channels?',
  ];

  return (
    <div className="flex flex-col justify-center h-full px-12 max-w-7xl mx-auto">
      <SlideMethodBadge method="Architecture Decision" label="Why This Slide Exists" color={METHOD_COLORS.gaussian} />
      <h2 className="text-5xl font-bold mb-2">Where Should Behavior Logic Live?</h2>
      <div className="w-14 h-1 rounded-full mb-4" style={{ background: METHOD_COLORS.gaussian }} />
      <p className="text-base text-[#bdb8af] mb-5">
        Purpose of this page: choose the control architecture before implementation.
      </p>

      <div className="grid grid-cols-2 gap-5 mb-6">
        <div className="rounded-xl p-5 border border-[#3d3a36] bg-[#1d1c1a]">
          <div className="flex items-center gap-2 mb-3">
            <Cpu size={16} style={{ color: METHOD_COLORS.metahuman }} />
            <Brain size={16} style={{ color: METHOD_COLORS.gaussian }} />
          </div>
          <h3 className="text-base font-bold text-[#f5f2ec] mb-2">
            Path A: External Response Model + Avatar Backend
          </h3>
          <p className="text-sm text-[#bdb8af] mb-3">
            User input processing and response logic stay upstream. Avatar backend executes explicit control signals.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#c7c2b9]">
            <li>Best for controllability and safety constraints.</li>
            <li>Easier to debug latency path and behavior failures.</li>
            <li>Examples: MetaHuman + Live Link, Gaussian + explicit drivers.</li>
          </ul>
          <div className="mt-3 text-[10px] text-[#948d82] px-2 py-1.5 rounded bg-[#242220]">
            Recommended for production storytelling systems.
          </div>
        </div>

        <div className="rounded-xl p-5 border border-[#3d3a36] bg-[#1d1c1a]">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} style={{ color: METHOD_COLORS.generative }} />
          </div>
          <h3 className="text-base font-bold text-[#f5f2ec] mb-2">
            Path B: End-to-End Generative Embodiment
          </h3>
          <p className="text-sm text-[#bdb8af] mb-3">
            More behavior is internalized in the generator; fewer explicit actuation channels.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#c7c2b9]">
            <li>Fast to prototype from image/audio/text conditioning.</li>
            <li>Can produce rich motion with minimal explicit rig authoring.</li>
            <li>Examples: Avatar Forcing, LiveTalk, SoulX-FlashHead.</li>
          </ul>
          <div className="mt-3 text-[10px] text-[#948d82] px-2 py-1.5 rounded bg-[#242220]">
            Useful for rapid experimentation, but control can be less explicit.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="rounded-lg p-3 bg-[#242220] border border-[#3d3a36]">
          <p className="text-xs uppercase tracking-wide text-[#948d82] mb-2">Decision Questions</p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-[#c7c2b9]">
            {criteria.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg p-3 bg-[#242220] border border-[#3d3a36] flex items-center">
          <p className="text-xs text-[#f5f2ec] font-medium">
            <Eye size={12} className="inline mr-1" style={{ color: METHOD_COLORS.gaussian }} />
            Takeaway: default to Path A for controllable real-time storytelling; use Path B when speed of iteration is the main objective.
          </p>
        </div>
      </div>

      <SlideEvidenceStrip
        links={[
          { label: 'MetaHuman Live Link', href: EVIDENCE_URLS.epicMetaHumanLiveLink },
          { label: 'Avatar Forcing', href: EVIDENCE_URLS.arxivAvatarForcing },
          { label: 'LiveTalk', href: EVIDENCE_URLS.arxivLiveTalk },
          { label: 'SoulX-FlashHead', href: EVIDENCE_URLS.arxivSoulXFlashHead },
          { label: 'TaoAvatar', href: EVIDENCE_URLS.arxivTaoAvatar },
          { label: 'ICo3D', href: EVIDENCE_URLS.arxivICo3D },
        ]}
      />
    </div>
  );
}

function SlideCapabilityTransition() {
  const checkpoints = [
    'Demos showed what each approach can render.',
    'Now compare them with one decision frame.',
    'Next slide turns evidence into selection criteria.',
  ];

  return (
    <div className="flex flex-col justify-center h-full px-12 max-w-5xl mx-auto text-center">
      <SlideMethodBadge method="Transition" label="From Demos To Decision" color={METHOD_COLORS.gaussian} />
      <h2 className="text-5xl font-bold mb-2">Before The Capability Matrix</h2>
      <div className="w-14 h-1 rounded-full mb-6 mx-auto" style={{ background: METHOD_COLORS.gaussian }} />

      <p className="text-lg text-[#c7c2b9] mb-6">
        The previous section showed individual demos and papers. The next step is a direct comparison to choose a stack.
      </p>

      <div className="rounded-xl p-5 border border-[#3d3a36] bg-[#1d1c1a]">
        <ul className="list-disc pl-6 space-y-2 text-base text-[#c7c2b9] text-left">
          {checkpoints.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function SlideResearchFrontier() {
  type CategoryId = 'interactive' | 'streaming' | '3d_xr' | 'all';
  const [activeCategory, setActiveCategory] = useState<CategoryId>('all');

  const papers = [
    {
      name: 'Avatar Forcing',
      year: '2026',
      category: 'interactive' as const,
      metric: '~500ms E2E',
      desc: 'Causal multimodal forcing for reactive conversation.',
      url: EVIDENCE_URLS.arxivAvatarForcing,
      codeUrl: EVIDENCE_URLS.githubAvatarForcing,
      codeLabel: 'GitHub code',
    },
    {
      name: 'Knot Forcing',
      year: '2025',
      category: 'interactive' as const,
      metric: 'Identity stability',
      desc: 'Infinite interactive portrait animation with temporal knots.',
      url: EVIDENCE_URLS.arxivKnotForcing,
    },
    {
      name: 'StreamAvatar',
      year: '2025',
      category: 'streaming' as const,
      metric: 'Streaming avatar',
      desc: 'Streaming diffusion with coherent listening gestures.',
      url: EVIDENCE_URLS.arxivStreamAvatar,
    },
    {
      name: 'SoulX-FlashHead',
      year: '2026',
      category: 'streaming' as const,
      metric: '96 FPS (Lite)',
      desc: 'Oracle-guided streaming talking heads with long-horizon stability.',
      url: EVIDENCE_URLS.arxivSoulXFlashHead,
      codeUrl: EVIDENCE_URLS.githubSoulXFlashHead,
      codeLabel: 'GitHub code',
    },
    {
      name: 'LiveTalk',
      year: '2025',
      category: 'streaming' as const,
      metric: '20x distillation',
      desc: 'Real-time multimodal interactive video diffusion (audio+text+image).',
      url: EVIDENCE_URLS.arxivLiveTalk,
    },
    {
      name: 'MIDAS',
      year: '2025',
      category: '3d_xr' as const,
      metric: 'Audio+pose+text',
      desc: 'Real-time autoregressive multimodal digital-human synthesis.',
      url: EVIDENCE_URLS.arxivMIDAS,
    },
    {
      name: 'ICo3D',
      year: '2026',
      category: '3d_xr' as const,
      metric: 'Gaze + expression',
      desc: 'Interactive conversational 3D virtual human with Gaussian head/body.',
      url: EVIDENCE_URLS.arxivICo3D,
    },
    {
      name: 'FastGHA',
      year: '2026',
      category: '3d_xr' as const,
      metric: 'Few-shot real-time',
      desc: 'Few-shot Gaussian head avatars with real-time animation.',
      url: EVIDENCE_URLS.arxivFastGHA,
    },
    {
      name: 'TaoAvatar',
      year: '2025',
      category: '3d_xr' as const,
      metric: '90 FPS Vision Pro',
      desc: 'Full-body 3DGS avatars with controllable expression and gesture.',
      url: EVIDENCE_URLS.arxivTaoAvatar,
      codeUrl: EVIDENCE_URLS.githubTaoAvatarMobileDemo,
      codeLabel: 'Mobile demo code',
    },
  ];

  const categories: Array<{ id: CategoryId; label: string }> = [
    { id: 'all', label: 'All' },
    { id: 'interactive', label: 'Interactive' },
    { id: 'streaming', label: 'Streaming' },
    { id: '3d_xr', label: '3D + XR' },
  ];

  const filtered = activeCategory === 'all' ? papers : papers.filter((p) => p.category === activeCategory);

  const categoryColor = (cat: string) =>
    cat === 'interactive' ? METHOD_COLORS.generative : cat === 'streaming' ? METHOD_COLORS.generative : METHOD_COLORS.gaussian;

  return (
    <div className="flex flex-col justify-center h-full px-12 max-w-7xl mx-auto">
      <h2 className="text-5xl font-bold mb-2">Research Frontier (Late 2025 -- Feb 2026)</h2>
      <div className="w-14 h-1 rounded-full mb-4" style={{ background: METHOD_COLORS.gaussian }} />
      <p className="text-sm text-[#bdb8af] mb-4">
        Grid view with verified original paper links (arXiv/CVPR-aligned records).
      </p>

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

      <div className="grid grid-cols-3 gap-3">
        {filtered.map((paper) => {
          const color = categoryColor(paper.category);
          return (
            <div
              key={paper.name}
              className="rounded-xl p-3 border bg-[#1d1c1a] flex flex-col"
              style={{ borderColor: color }}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="text-sm font-semibold text-[#f5f2ec]">{paper.name}</p>
                <span className="text-[10px] text-[#948d82]">{paper.year}</span>
              </div>

              <p className="text-[11px] font-mono mb-1" style={{ color }}>
                {paper.metric}
              </p>
              <p className="text-[11px] text-[#bdb8af] line-clamp-2 mb-2">{paper.desc}</p>

              <div className="mt-auto flex items-center justify-between gap-2">
                <a
                  href={paper.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold hover:underline"
                  style={{ color }}
                >
                  Original paper
                  <ExternalLink size={12} />
                </a>
                {paper.codeUrl ? (
                  <a
                    href={paper.codeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold hover:underline"
                    style={{ color: '#f5f2ec' }}
                  >
                    {paper.codeLabel ?? 'Code'}
                    <ExternalLink size={12} />
                  </a>
                ) : (
                  <span className="text-[10px] text-[#7f7b74]">Code: not public</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <SlideEvidenceStrip
        links={[
          { label: 'Avatar Forcing', href: EVIDENCE_URLS.arxivAvatarForcing },
          { label: 'LiveTalk', href: EVIDENCE_URLS.arxivLiveTalk },
          { label: 'SoulX-FlashHead', href: EVIDENCE_URLS.arxivSoulXFlashHead },
          { label: 'TaoAvatar', href: EVIDENCE_URLS.arxivTaoAvatar },
          { label: 'ICo3D', href: EVIDENCE_URLS.arxivICo3D },
          { label: 'FastGHA', href: EVIDENCE_URLS.arxivFastGHA },
        ]}
        note="Cards show paper-reported attributes and links to original sources; synthetic S/R/C scores were removed to avoid unsupported ranking."
      />
    </div>
  );
}

function SlideConvergenceUpdated() {
  const workflowCards = [
    {
      title: 'MetaHuman Workflow (Rig-Controlled)',
      desc: 'Deterministic control path: solved facial controls drive explicit rig channels.',
      color: METHOD_COLORS.metahuman,
      inputs: 'User audio/video + Live Link streams',
      steps: [
        'Capture user streams (audio + face/head data).',
        'Solve controls with MetaHuman Animator / Live Link.',
        'LLM response model emits dialogue intent + timing tags.',
        'RigLogic + UE render executes final avatar output.',
      ],
    },
    {
      title: 'Video Generation Workflow (Latent-Controlled)',
      desc: 'Conditional generation path: multimodal conditioning drives streaming frame synthesis.',
      color: METHOD_COLORS.generative,
      inputs: 'Reference image + user audio/text (+ optional user motion)',
      steps: [
        'Encode identity and conditioning signals.',
        'Run causal/streaming generation for next-frame prediction.',
        'Use distillation/forcing modules to reduce latency.',
        'Deliver video/audio stream via real-time transport.',
      ],
    },
    {
      title: 'Gaussian Workflow (Explicit 3D Primitives)',
      desc: '3D primitive path: control signals deform Gaussian avatar state before rasterization.',
      color: METHOD_COLORS.gaussian,
      inputs: 'Avatar model + user audio + pose/expression controls',
      steps: [
        'Build/initialize animatable 3DGS avatar.',
        'Map audio/pose to expression and motion controls.',
        'Deform Gaussian attributes per frame.',
        'Rasterize and stream high-FPS outputs.',
      ],
    },
  ];

  return (
    <div className="flex flex-col justify-center h-full px-12 max-w-7xl mx-auto">
      <h2 className="text-5xl font-bold mb-2">Paper-Backed Workflow Comparison</h2>
      <div className="w-14 h-1 rounded-full mb-4" style={{ background: METHOD_COLORS.gaussian }} />
      <p className="text-sm text-[#bdb8af] mb-4">
        Workflow view: user input processing hands off to response modeling, then each avatar backend executes a different actuation/render path.
      </p>

      <div className="mb-4">
        <SlideFlow
          accentColor={METHOD_COLORS.gaussian}
          edgeType="straight"
          nodes={[
            { id: 'user', label: 'User input processing' },
            { id: 'state', label: 'Interaction state' },
            { id: 'llm', label: 'Response model (LLM + memory)' },
            { id: 'adapter', label: 'Avatar backend adapter' },
            { id: 'out', label: 'Avatar output stream' },
          ]}
        />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        {workflowCards.map((card) => (
          <div key={card.title} className="rounded-xl p-4 border border-[#3d3a36] bg-[#1d1c1a]">
            <div className="w-2.5 h-2.5 rounded-full mb-2" style={{ background: card.color }} />
            <h3 className="text-base font-bold text-[#f5f2ec] mb-1">{card.title}</h3>
            <p className="text-xs text-[#bdb8af] mb-2">{card.desc}</p>
            <p className="text-[11px] text-[#948d82] mb-2"><span className="text-[#f5f2ec]">Inputs:</span> {card.inputs}</p>
            <ol className="list-decimal pl-4 space-y-1 text-[11px] text-[#c7c2b9]">
              {card.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        ))}
      </div>

      <div className="rounded-xl p-3 border border-[#3d3a36] bg-[#1d1c1a] mb-2">
        <p className="text-sm text-[#c7c2b9]">
          Repo evidence: latest skill outputs track and verify these workflow claims against docs/papers each cycle.
        </p>
      </div>

      <SlideEvidenceStrip
        links={[
          { label: 'MetaHuman Animator', href: EVIDENCE_URLS.epicMetaHumanAnimator },
          { label: 'MetaHuman Live Link', href: EVIDENCE_URLS.epicMetaHumanLiveLink },
          { label: 'MetaHuman Audio Source', href: EVIDENCE_URLS.epicMetaHumanAudioSource },
          { label: 'LiveTalk', href: EVIDENCE_URLS.arxivLiveTalk },
          { label: 'Avatar Forcing', href: EVIDENCE_URLS.arxivAvatarForcing },
          { label: 'SoulX-FlashHead', href: EVIDENCE_URLS.arxivSoulXFlashHead },
          { label: '3D Gaussian Splatting', href: EVIDENCE_URLS.arxiv3dgs },
          { label: 'TaoAvatar', href: EVIDENCE_URLS.arxivTaoAvatar },
          { label: 'ICo3D', href: EVIDENCE_URLS.arxivICo3D },
          { label: 'Multimodal IO report (repo)', href: MULTIMODAL_IO_REPORT_URL },
          { label: 'Full-modality report (repo)', href: FULL_MODALITY_REPORT_URL },
          { label: 'Claim check JSON (repo)', href: FULL_MODALITY_CLAIM_CHECK_URL },
        ]}
      />
    </div>
  );
}

function SlideHowToEvolveProject() {
  return (
    <div className="flex flex-col justify-center h-full px-12 max-w-7xl mx-auto">
      <SlideMethodBadge method="Evolution Guide" label="Research + Implementation Loop" color={METHOD_COLORS.gaussian} />
      <h2 className="text-5xl font-bold mb-2">How To Evolve This Project</h2>
      <div className="w-14 h-1 rounded-full mb-4" style={{ background: METHOD_COLORS.gaussian }} />

      <p className="text-base text-[#bdb8af] mb-5">
        Keep one repeatable cycle: refresh sources, update claim matrix, patch slides/code, validate, publish, and store artifacts.
      </p>

      <div className="mb-5">
        <SlideFlow
          accentColor={METHOD_COLORS.gaussian}
          edgeType="straight"
          nodes={[
            { id: 'scan', label: '1) Refresh docs/papers/repos' },
            { id: 'skill', label: '2) Run evolution skills' },
            { id: 'claims', label: '3) Update claim matrix + workflows' },
            { id: 'patch', label: '4) Patch slides + implementation' },
            { id: 'verify', label: '5) Build + evidence check + publish' },
          ]}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="rounded-xl p-4 border border-[#3d3a36] bg-[#1d1c1a]">
          <h3 className="text-lg font-semibold mb-2 text-[#f5f2ec]">Core Skills</h3>
          <ul className="space-y-1.5 text-sm text-[#bdb8af]">
            <li><code>metahuman-evolver</code>: Unreal plugin architecture + dependency graph.</li>
            <li><code>multimodal-io-research-evolver</code>: cross-approach I/O research refresh.</li>
            <li><code>full-modality-social-evolver</code>: modality claim checks and deltas.</li>
            <li><code>slide-research-proofreader-evolver</code>: citation and claim audits per slide.</li>
          </ul>
        </div>

        <div className="rounded-xl p-4 border border-[#3d3a36] bg-[#1d1c1a]">
          <h3 className="text-lg font-semibold mb-2 text-[#f5f2ec]">Always Track</h3>
          <ul className="space-y-1.5 text-sm text-[#bdb8af]">
            <li>new papers/repos affecting input processing or avatar backends</li>
            <li>claim-matrix diffs (native vs conditional support)</li>
            <li>latency path updates (input → response model → output)</li>
            <li>latest generated reports under <code>.claude/skills/*/references/</code></li>
          </ul>
        </div>
      </div>

      <div className="rounded-xl p-4 border border-[#3d3a36] bg-[#1d1c1a]">
        <p className="text-sm text-[#948d82] mb-2">Reference artifacts</p>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <a href={MULTIMODAL_IO_REPORT_URL} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: METHOD_COLORS.gaussian }}>
            multimodal-io latest report <ExternalLink size={13} className="inline ml-1" />
          </a>
          <a href={FULL_MODALITY_REPORT_URL} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: METHOD_COLORS.gaussian }}>
            full-modality latest report <ExternalLink size={13} className="inline ml-1" />
          </a>
          <a href={FULL_MODALITY_CLAIM_CHECK_URL} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: METHOD_COLORS.gaussian }}>
            claim-check JSON <ExternalLink size={13} className="inline ml-1" />
          </a>
        </div>
      </div>
    </div>
  );
}

function SlideAgentSkillsUsed() {
  const skills = [
    {
      name: 'metahuman-evolver',
      purpose: 'Scans Unreal MetaHuman plugin internals, updates architecture + dependency graph.',
      url: SKILL_METAHUMAN_URL,
    },
    {
      name: 'full-modality-social-evolver',
      purpose: 'Verifies modality claims, tracks ArXiv/GitHub deltas, and evolves social interaction research.',
      url: SKILL_FULL_MODALITY_URL,
    },
    {
      name: 'multimodal-io-research-evolver',
      purpose: 'Refreshes multimodal research and upserts cross-approach I/O conclusions into the deep-research doc.',
      url: SKILL_MULTIMODAL_IO_URL,
    },
    {
      name: 'gaussian-youtube-video-wall-evolver',
      purpose: 'Collects latest real-time Gaussian avatar demo videos and publishes the modal video wall dataset.',
      url: SKILL_GAUSSIAN_WALL_URL,
    },
    {
      name: 'slide-research-proofreader-evolver',
      purpose: 'Runs evidence audits on research slides and tracks pass/warn deltas across proofreading cycles.',
      url: SKILL_SLIDE_PROOFREADER_URL,
    },
  ];

  return (
    <div className="flex flex-col justify-center h-full px-12 max-w-7xl mx-auto">
      <SlideMethodBadge method="Agent Skills" label="Project Automation" color={METHOD_COLORS.gaussian} />
      <h2 className="text-5xl font-bold mb-2">Agent Skills Used In This Repo</h2>
      <div className="w-14 h-1 rounded-full mb-4" style={{ background: METHOD_COLORS.gaussian }} />

      <p className="text-base text-[#bdb8af] mb-5">
        These are the reusable agent skills that powered this project build, verification, and continuous evolution cycles.
      </p>

      <div className="grid grid-cols-1 gap-3 mb-5">
        {skills.map((skill) => (
          <div key={skill.name} className="rounded-xl p-4 border border-[#3d3a36] bg-[#1d1c1a]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-[#f5f2ec]">{skill.name}</h3>
                <p className="text-sm text-[#bdb8af] mt-1">{skill.purpose}</p>
              </div>
              <a
                href={skill.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#3d3a36] text-xs font-semibold hover:bg-[#242220] transition-colors"
                style={{ color: METHOD_COLORS.gaussian }}
              >
                <ExternalLink size={13} />
                Open Skill
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl p-4 border border-[#3d3a36] bg-[#1d1c1a] flex items-center justify-between gap-3">
        <p className="text-sm text-[#948d82]">
          Browse all skill implementations in the repository:
        </p>
        <a
          href={PROJECT_SKILLS_DIR_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-semibold hover:underline"
          style={{ color: METHOD_COLORS.gaussian }}
        >
          <Github size={15} />
          github.com/pajamadot/realtime-avatars/.claude/skills
          <ExternalLink size={14} />
        </a>
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
          href="https://www.realtime-avatars.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-base hover:underline justify-center"
          style={{ color: METHOD_COLORS.gaussian }}
        >
          <Globe size={16} />
          www.realtime-avatars.com
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

/* 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?   SLIDES ARRAY
   鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?*/

const SLIDES: React.FC[] = [
  SlideTitle,                    // 1
  SlideAboutMe,                  // 2
  SlideCogixEyeTrackerPrototype, // 3
  SlideGraphNerd,                // 4
  SlideStoryCharacterCreationTool,// 5
  SlideRealtimeAvatarPerformanceBridge, // 6
  SlideE2EDefinitionMindmap,     // 7
  SlideApproachSelectionQuestion,// 8
  SlideThreeApproaches,          // 9
  SlideSignalsInteraction,       // 10
  SlideMetahumanDemo,            // 11
  SlideMetahumanHow,             // 12
  SlideMetahumanIdentityResponse,// 13
  SlideGenerativeDemo,           // 14
  SlideGenerativeHow,            // 15
  SlideGenerativeIdentityResponse,// 16
  SlideGenerativeResearch,       // 17
  SlideGaussianDemo,             // 18
  SlideGaussianHow,              // 19
  SlideGaussianIdentityResponse, // 20
  SlideGaussianSupersplatDemoOne,// 21
  SlideGaussianSupersplatDemoTwo,// 22
  SlideGaussianPersonalDemo,     // 23
  SlideGaussianWorldlabsDemo,    // 24
  SlideGaussianResearchVideoWall,// 25
  SlideCapabilityTransition,     // 26
  SlideCapabilityMatrix,         // 27
  SlideAudio2FaceBuildingBlocks, // 28
  SlideWhereIntelligenceLives,   // 29
  SlideResearchFrontier,         // 30
  SlideFuturePerspectiveMissingLayers, // 31
  SlideConvergenceUpdated,       // 32
  SlideHowToEvolveProject,       // 33
  SlideThankYou,                 // 34
];

/* 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?   MAIN SLIDES PAGE
   鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?*/

export default function SlidesDeck({ initialSlide = 1, onExit }: { initialSlide?: number; onExit?: () => void }) {
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
        if (!onExit && typeof window !== 'undefined') {
          window.history.replaceState(null, '', `/slides/${index + 1}`);
        }
        setDirection(null);
        setIsAnimating(false);
      }, 300);
    },
    [current, isAnimating, onExit]
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

  const slideContentStyle: React.CSSProperties = {
    ...slideStyle,
    fontSize: `${SLIDE_FONT_SCALE}em`,
    lineHeight: 1.36,
  };

  return (
    <div
      ref={containerRef}
      className="slides-root fixed inset-0 bg-[#111110] text-[#f5f2ec] flex flex-col select-none overflow-hidden"
    >
      <style>{SLIDE_TYPOGRAPHY_CSS}</style>
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
        <div className="slide-content-shell h-full px-4 sm:px-6 overflow-y-auto" style={slideContentStyle}>
          <div className="h-full min-h-full max-w-[1720px] mx-auto py-1">
            <CurrentSlide />
          </div>
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




