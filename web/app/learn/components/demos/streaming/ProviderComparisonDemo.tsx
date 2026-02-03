'use client';

import { useState } from 'react';

interface Provider {
  id: string;
  name: string;
  type: 'diffusion' | 'metahuman' | 'neural' | 'hybrid';
  latency: number;
  quality: number;
  customization: number;
  cost: number;
  input: string[];
  output: string;
  features: string[];
  bestFor: string;
  color: string;
}

const PROVIDERS: Provider[] = [
  {
    id: 'hedra',
    name: 'Hedra',
    type: 'diffusion',
    latency: 200,
    quality: 95,
    customization: 70,
    cost: 3,
    input: ['Audio', 'Portrait'],
    output: 'Video stream',
    features: ['One-shot', 'Any face', 'Real-time'],
    bestFor: 'Photorealistic talking heads from any image',
    color: '#9b59b6',
  },
  {
    id: 'heygen',
    name: 'HeyGen',
    type: 'neural',
    latency: 150,
    quality: 90,
    customization: 85,
    cost: 4,
    input: ['Text/Audio', 'Avatar ID'],
    output: 'Video stream',
    features: ['Pre-trained avatars', 'Multi-language', 'Templates'],
    bestFor: 'Enterprise video production at scale',
    color: '#3498db',
  },
  {
    id: 'synthesia',
    name: 'Synthesia',
    type: 'neural',
    latency: 180,
    quality: 88,
    customization: 80,
    cost: 4,
    input: ['Script', 'Avatar'],
    output: 'Pre-rendered video',
    features: ['150+ avatars', 'Custom avatars', '120+ languages'],
    bestFor: 'Corporate training and marketing videos',
    color: '#e74c3c',
  },
  {
    id: 'tavus',
    name: 'Tavus',
    type: 'hybrid',
    latency: 250,
    quality: 92,
    customization: 90,
    cost: 5,
    input: ['Video training', 'Script'],
    output: 'Personalized video',
    features: ['Clone your face', 'Personalization', 'API'],
    bestFor: 'Personalized outreach at scale',
    color: '#2ecc71',
  },
  {
    id: 'did',
    name: 'D-ID',
    type: 'neural',
    latency: 160,
    quality: 85,
    customization: 75,
    cost: 3,
    input: ['Audio/Text', 'Image'],
    output: 'Video/Stream',
    features: ['Real-time API', 'Agents', 'Easy integration'],
    bestFor: 'Quick prototypes and chatbots',
    color: '#f39c12',
  },
  {
    id: 'simli',
    name: 'Simli',
    type: 'neural',
    latency: 100,
    quality: 82,
    customization: 60,
    cost: 2,
    input: ['Audio stream'],
    output: 'Video stream',
    features: ['Lowest latency', 'WebRTC native', 'Simple API'],
    bestFor: 'Real-time conversation with minimal delay',
    color: '#1abc9c',
  },
];

type SortKey = 'latency' | 'quality' | 'customization' | 'cost';

export function ProviderComparisonDemo() {
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>('latency');
  const [filterType, setFilterType] = useState<string>('all');

  const sortedProviders = [...PROVIDERS]
    .filter(p => filterType === 'all' || p.type === filterType)
    .sort((a, b) => {
      if (sortBy === 'cost' || sortBy === 'latency') {
        return a[sortBy] - b[sortBy]; // Lower is better
      }
      return b[sortBy] - a[sortBy]; // Higher is better
    });

  const getMetricBar = (value: number, max: number, color: string, inverted = false) => {
    const percent = inverted ? ((max - value) / max) * 100 : (value / max) * 100;
    return (
      <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${percent}%`, backgroundColor: color }}
        />
      </div>
    );
  };

  return (
    <div className="card p-6">
      <h3 className="font-semibold mb-2">Avatar Provider Comparison</h3>
      <p className="text-sm text-[var(--muted)] mb-6">
        Compare streaming avatar providers by latency, quality, and features.
        Click a provider for detailed information.
      </p>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="text-sm font-medium block mb-1">Sort by</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="px-3 py-1.5 rounded border border-[var(--border)] bg-[var(--card-bg)] text-sm"
          >
            <option value="latency">Latency (lowest first)</option>
            <option value="quality">Quality (highest first)</option>
            <option value="customization">Customization (highest first)</option>
            <option value="cost">Cost (lowest first)</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Filter by type</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 rounded border border-[var(--border)] bg-[var(--card-bg)] text-sm"
          >
            <option value="all">All Types</option>
            <option value="diffusion">Diffusion</option>
            <option value="neural">Neural Network</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Provider List */}
        <div className="space-y-3">
          {sortedProviders.map((provider) => (
            <button
              key={provider.id}
              onClick={() => setSelectedProvider(provider)}
              className={`w-full p-4 rounded-lg border transition-all text-left ${
                selectedProvider?.id === provider.id
                  ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                  : 'border-[var(--border)] hover:border-[var(--border-strong)]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: provider.color }}
                  />
                  <span className="font-medium">{provider.name}</span>
                </div>
                <span className="text-xs px-2 py-0.5 bg-[var(--card-bg-alt)] rounded">
                  {provider.type}
                </span>
              </div>

              {/* Mini metrics */}
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-[var(--muted)]">Latency</span>
                  <p className="font-mono">{provider.latency}ms</p>
                </div>
                <div>
                  <span className="text-[var(--muted)]">Quality</span>
                  <p className="font-mono">{provider.quality}%</p>
                </div>
                <div>
                  <span className="text-[var(--muted)]">Custom</span>
                  <p className="font-mono">{provider.customization}%</p>
                </div>
                <div>
                  <span className="text-[var(--muted)]">Cost</span>
                  <p className="font-mono">{'$'.repeat(provider.cost)}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Detail Panel */}
        <div className="p-4 bg-[var(--card-bg-alt)] rounded-lg">
          {selectedProvider ? (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: selectedProvider.color }}
                />
                <h4 className="font-semibold text-lg">{selectedProvider.name}</h4>
              </div>

              {/* Metrics */}
              <div className="space-y-3 mb-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Latency</span>
                    <span className="font-mono">{selectedProvider.latency}ms</span>
                  </div>
                  {getMetricBar(selectedProvider.latency, 300, selectedProvider.color, true)}
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Quality</span>
                    <span className="font-mono">{selectedProvider.quality}%</span>
                  </div>
                  {getMetricBar(selectedProvider.quality, 100, selectedProvider.color)}
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Customization</span>
                    <span className="font-mono">{selectedProvider.customization}%</span>
                  </div>
                  {getMetricBar(selectedProvider.customization, 100, selectedProvider.color)}
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-[var(--muted)]">Input:</span>
                  <span className="ml-2">{selectedProvider.input.join(', ')}</span>
                </div>
                <div>
                  <span className="text-[var(--muted)]">Output:</span>
                  <span className="ml-2">{selectedProvider.output}</span>
                </div>
                <div>
                  <span className="text-[var(--muted)]">Features:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedProvider.features.map((feature, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-0.5 bg-[var(--card-bg)] rounded"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="pt-2 border-t border-[var(--border)]">
                  <span className="text-[var(--muted)]">Best for:</span>
                  <p className="mt-1">{selectedProvider.bestFor}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-[var(--muted)]">
              <p>Select a provider to see details</p>
            </div>
          )}
        </div>
      </div>

      {/* Decision Guide */}
      <div className="mt-6 p-4 bg-[var(--card-bg-alt)] rounded">
        <p className="font-medium mb-3">Quick Decision Guide</p>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="font-medium text-[var(--foreground)]">Lowest Latency</p>
            <p className="text-[var(--muted)]">Simli (~100ms) for real-time conversation</p>
          </div>
          <div>
            <p className="font-medium text-[var(--foreground)]">Best Quality</p>
            <p className="text-[var(--muted)]">Hedra for photorealistic output</p>
          </div>
          <div>
            <p className="font-medium text-[var(--foreground)]">Most Customizable</p>
            <p className="text-[var(--muted)]">Tavus for personalized clones</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProviderComparisonDemo;
