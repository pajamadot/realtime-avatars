'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { use } from 'react';

function DemoLoading() {
  return (
    <div className="flex items-center justify-center h-screen text-[#948d82]">
      <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

const DEMO_MAP: Record<string, {
  component: React.ComponentType;
  title: string;
  color: string;
}> = {
  blendshape: {
    component: dynamic(() => import('../../../learn/components/demos/metahuman/BlendshapeDemo'), { ssr: false, loading: DemoLoading }),
    title: 'Blendshape Explorer',
    color: '#a78bdb',
  },
  denoising: {
    component: dynamic(() => import('../../../learn/components/demos/generative/DenoisingDemo'), { ssr: false, loading: DemoLoading }),
    title: 'Denoising Process',
    color: '#6ec87a',
  },
  'point-cloud': {
    component: dynamic(() => import('../../../learn/components/demos/gaussian/PointCloudDemo'), { ssr: false, loading: DemoLoading }),
    title: 'Point Cloud to Splats',
    color: '#e08840',
  },
  covariance: {
    component: dynamic(() => import('../../../learn/components/demos/gaussian/CovarianceShapeDemo'), { ssr: false, loading: DemoLoading }),
    title: 'Covariance & Shape Control',
    color: '#e08840',
  },
  'sfu-comparison': {
    component: dynamic(() => import('../../../learn/components/demos/streaming/SFUComparisonDemo'), { ssr: false, loading: DemoLoading }),
    title: 'SFU Topology Comparison',
    color: '#6ec87a',
  },
  'pipeline-flow': {
    component: dynamic(() => import('../../../learn/components/demos/endtoend/PipelineFlowDemo'), { ssr: false, loading: DemoLoading }),
    title: 'Pipeline Flow',
    color: '#e08840',
  },
};

export default function DemoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const demo = DEMO_MAP[slug];

  if (!demo) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-xl text-[#948d82] mb-4">Demo not found</p>
        <Link href="/slides/demos" className="text-sm text-[#e08840] hover:underline">
          Back to demos
        </Link>
      </div>
    );
  }

  const DemoComponent = demo.component;

  return (
    <div className="min-h-screen flex flex-col"
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
        '--accent': demo.color,
        '--foreground': '#f5f2ec',
      } as React.CSSProperties}
    >
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[#3d3a36]">
        <Link
          href="/slides/demos"
          className="flex items-center gap-1.5 text-sm text-[#948d82] hover:text-[#f5f2ec] transition-colors"
        >
          <ArrowLeft size={16} />
          Demos
        </Link>
        <span className="text-[#3d3a36]">|</span>
        <h1 className="text-sm font-semibold" style={{ color: demo.color }}>
          {demo.title}
        </h1>
      </div>
      <div className="flex-1 p-6">
        <DemoComponent />
      </div>
    </div>
  );
}
