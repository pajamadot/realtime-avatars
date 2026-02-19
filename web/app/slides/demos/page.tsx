import Link from 'next/link';
import { Monitor, Video, Box, Layers, Network, Workflow } from 'lucide-react';

const DEMOS = [
  { slug: 'blendshape', title: 'Blendshape Explorer', desc: 'Interactive facial blendshape weights and presets', color: '#a78bdb', icon: Monitor },
  { slug: 'denoising', title: 'Denoising Process', desc: 'Step through the DDPM reverse diffusion process', color: '#6ec87a', icon: Video },
  { slug: 'point-cloud', title: 'Point Cloud to Splats', desc: 'Visualize Gaussian splatting from point clouds', color: '#e08840', icon: Box },
  { slug: 'covariance', title: 'Covariance & Shape', desc: 'Explore Gaussian shape controls (sphere, pancake, needle)', color: '#e08840', icon: Layers },
  { slug: 'sfu-comparison', title: 'SFU Topology Comparison', desc: 'Compare P2P, SFU, and MCU streaming topologies', color: '#6ec87a', icon: Network },
  { slug: 'pipeline-flow', title: 'Pipeline Flow', desc: 'End-to-end avatar pipeline visualization', color: '#e08840', icon: Workflow },
] as const;

export default function DemosIndexPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 py-12">
      <h1 className="text-4xl font-bold mb-2">Interactive Demos</h1>
      <p className="text-lg text-[#948d82] mb-10">Explore each demo fullscreen</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl w-full">
        {DEMOS.map((demo) => (
          <Link
            key={demo.slug}
            href={`/slides/demos/${demo.slug}`}
            className="rounded-xl p-6 border border-[#3d3a36] bg-[#1d1c1a] hover:bg-[#242220] transition-colors group"
          >
            <demo.icon
              size={28}
              className="mb-4 transition-colors"
              style={{ color: demo.color }}
            />
            <h2 className="text-xl font-semibold mb-1 group-hover:text-white transition-colors">
              {demo.title}
            </h2>
            <p className="text-sm text-[#948d82]">{demo.desc}</p>
          </Link>
        ))}
      </div>

      <Link
        href="/slides"
        className="mt-10 text-sm text-[#948d82] hover:text-[#f5f2ec] transition-colors"
      >
        Back to slides
      </Link>
    </div>
  );
}
