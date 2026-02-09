'use client';

import { useState } from 'react';

const faqs = [
  {
    q: 'Which approach is best for low-latency conversational avatars?',
    a: 'Streaming avatar providers (like Rapport or LiveKit + Hedra) give you the fastest path to production. MetaHuman pipelines offer the highest fidelity but require Unreal Engine infrastructure.',
  },
  {
    q: 'Can I run a real-time avatar on mobile?',
    a: 'Streaming approaches work on mobile browsers via WebRTC. Gaussian splatting viewers are emerging for mobile. MetaHuman and generative video currently need server-side rendering streamed to the client.',
  },
  {
    q: 'How much does it cost to deploy a real-time avatar?',
    a: 'Costs vary widely. Streaming providers charge per-minute API fees ($0.01–0.10/min). Self-hosted MetaHuman pipelines require GPU servers ($1–5/hr). Generative video inference needs high-end GPUs for real-time speeds.',
  },
  {
    q: 'What is the difference between Gaussian splatting and NeRF?',
    a: 'Both reconstruct 3D scenes from images. NeRFs use neural networks for ray marching (slower). Gaussian splatting uses explicit 3D Gaussians with rasterization, achieving 100+ FPS rendering — making it viable for real-time avatar applications.',
  },
  {
    q: 'Do I need ML expertise to build a real-time avatar?',
    a: 'Not necessarily. Streaming avatar APIs abstract away the ML complexity. MetaHuman Creator is a visual tool. Only generative video and Gaussian splatting approaches require ML knowledge for training custom models.',
  },
  {
    q: 'What hardware do I need to get started?',
    a: 'It depends on the approach. Streaming avatars work from any device with a browser. MetaHuman requires a gaming GPU (RTX 3060+) for Unreal Engine. Generative video needs an A100 or H100 GPU. Gaussian splatting trains on an RTX 4090 but can render on lower-end GPUs.',
  },
  {
    q: 'Can I create an avatar that looks like a specific person?',
    a: 'Yes. Gaussian splatting creates photorealistic digital twins from multi-view video capture. Generative models can animate a single photo. MetaHuman Creator allows manual sculpting. Always ensure you have consent when creating likenesses of real people.',
  },
  {
    q: 'How do hybrid approaches combine different methods?',
    a: 'Hybrids take the best of each: e.g., a MetaHuman rig for control with a neural renderer for realism (GeneFace++), or Gaussian splatting driven by parametric face models (D3GA). This combines precision with photorealism while keeping latency manageable.',
  },
];

export default function FAQ({ className = '' }: { className?: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className={className}>
      <div className="space-y-2">
        {faqs.map((faq, i) => (
          <div key={i} className="card overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full text-left p-4 flex items-start justify-between gap-4 hover:bg-[var(--surface-1)] transition-colors"
              aria-expanded={openIndex === i}
            >
              <span className="font-medium text-sm">{faq.q}</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className={`flex-shrink-0 mt-0.5 transition-transform ${openIndex === i ? 'rotate-180' : ''}`}
              >
                <path d="M4 6l4 4 4-4" />
              </svg>
            </button>
            {openIndex === i && (
              <div className="px-4 pb-4">
                <p className="text-sm text-[var(--text-muted)]">{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
