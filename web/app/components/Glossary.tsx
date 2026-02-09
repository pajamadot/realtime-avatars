'use client';

import { useState } from 'react';

const terms = [
  { term: 'Blendshapes', def: 'Predefined facial expressions stored as mesh deformations that can be blended together to create any expression.' },
  { term: 'Diffusion Model', def: 'A generative AI model that creates images/video by iteratively removing noise from random input.' },
  { term: 'Gaussian Splatting', def: 'A 3D representation using millions of colored, semi-transparent ellipsoids that render via rasterization.' },
  { term: 'LiveLink', def: 'Unreal Engine plugin that streams face tracking data from mobile apps to drive MetaHuman animations.' },
  { term: 'NeRF', def: 'Neural Radiance Field — a neural network that learns a 3D scene from 2D images using volumetric ray marching.' },
  { term: 'Pixel Streaming', def: 'Server-side rendering of Unreal Engine content streamed to web browsers via WebRTC.' },
  { term: 'SFU', def: 'Selective Forwarding Unit — a WebRTC server that routes media streams between participants without decoding.' },
  { term: 'STT/TTS', def: 'Speech-to-Text and Text-to-Speech — the audio conversion layers in a voice AI pipeline.' },
  { term: 'VAD', def: 'Voice Activity Detection — algorithm that determines when a user is speaking vs. silent.' },
  { term: 'WebRTC', def: 'Web Real-Time Communication — browser API for peer-to-peer audio, video, and data streaming.' },
];

export default function Glossary({ className = '' }: { className?: string }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? terms : terms.slice(0, 5);

  return (
    <div className={className}>
      <dl className="grid md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
        {visible.map((t) => (
          <div key={t.term}>
            <dt className="font-medium">{t.term}</dt>
            <dd className="text-[var(--text-muted)]">{t.def}</dd>
          </div>
        ))}
      </dl>
      {terms.length > 5 && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="mt-3 badge hover:border-[var(--border-strong)] text-xs"
        >
          {expanded ? 'Show less' : `Show all ${terms.length} terms`}
        </button>
      )}
    </div>
  );
}
