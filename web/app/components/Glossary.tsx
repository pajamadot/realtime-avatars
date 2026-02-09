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
  { term: 'VAE', def: 'Variational Autoencoder — a neural network that compresses data into a latent space and reconstructs it, used in diffusion pipelines.' },
  { term: 'WebRTC', def: 'Web Real-Time Communication — browser API for peer-to-peer audio, video, and data streaming.' },
  { term: 'FLAME', def: 'Faces Learned with an Articulated Model and Expressions — a parametric 3D face model used to drive Gaussian and NeRF avatars.' },
  { term: 'Latent Space', def: 'A compressed mathematical representation where generative models operate, encoding high-dimensional data (images, video) into compact vectors.' },
  { term: 'LoRA', def: 'Low-Rank Adaptation — a parameter-efficient fine-tuning method that adapts large models to new identities or styles with minimal compute.' },
  { term: 'Distillation', def: 'Training a smaller, faster model to replicate a larger model\'s outputs, enabling real-time inference from expensive teacher models.' },
  { term: 'ARKit', def: 'Apple\'s augmented reality framework providing 52 facial blendshape coefficients for real-time face tracking on iPhone.' },
  { term: 'Audio2Expression', def: 'A model that converts speech audio into facial expression coefficients (e.g., ARKit blendshapes) in real-time, enabling voice-driven avatar animation.' },
  { term: 'Feed-Forward Generation', def: 'Creating a 3D avatar in a single forward pass through a neural network, without iterative per-subject optimization — enabling instant avatar creation from a photo.' },
  { term: 'WebGPU', def: 'Next-generation browser graphics API offering compute shaders and lower overhead than WebGL, enabling 60-135x faster Gaussian splatting in the browser.' },
  { term: 'SfM', def: 'Structure from Motion — a photogrammetry technique that extracts 3D point clouds and camera poses from overlapping 2D images, used to initialize Gaussian splatting scenes.' },
  { term: 'One-Shot Avatar', def: 'A 3D avatar generated from a single photo via a feed-forward neural network (e.g., LAM), bypassing multi-view capture and per-subject training entirely.' },
  { term: 'OpenAvatarChat', def: 'An open-source conversational avatar SDK that integrates VAD, ASR, LLM, TTS, and Audio2Expression into a single pipeline driving Gaussian or 2D avatar backends via WebRTC.' },
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
