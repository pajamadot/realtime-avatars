'use client';

import { useState, useEffect } from 'react';

interface PipelineConfig {
  stt: 'fast' | 'balanced' | 'accurate';
  llm: 'small' | 'medium' | 'large';
  tts: 'streaming' | 'buffered';
  avatar: 'simple' | 'diffusion' | 'metahuman';
}

interface ComponentSpec {
  latency: number;
  quality: number;
  cost: number;
  description: string;
}

const COMPONENTS: Record<string, Record<string, ComponentSpec>> = {
  stt: {
    fast: { latency: 80, quality: 75, cost: 1, description: 'Whisper Tiny - Fast but less accurate' },
    balanced: { latency: 150, quality: 88, cost: 2, description: 'Whisper Base - Good balance' },
    accurate: { latency: 300, quality: 96, cost: 4, description: 'Whisper Large - Most accurate' },
  },
  llm: {
    small: { latency: 50, quality: 70, cost: 1, description: 'GPT-3.5 Turbo - Fast responses' },
    medium: { latency: 120, quality: 85, cost: 3, description: 'GPT-4 Turbo - Better reasoning' },
    large: { latency: 250, quality: 95, cost: 5, description: 'GPT-4 - Best quality' },
  },
  tts: {
    streaming: { latency: 50, quality: 80, cost: 2, description: 'Streaming TTS - Low latency' },
    buffered: { latency: 200, quality: 95, cost: 3, description: 'Buffered TTS - Better quality' },
  },
  avatar: {
    simple: { latency: 30, quality: 60, cost: 1, description: '2D lip sync overlay' },
    diffusion: { latency: 150, quality: 92, cost: 4, description: 'Diffusion-based (Hedra/etc)' },
    metahuman: { latency: 20, quality: 88, cost: 3, description: 'Real-time MetaHuman' },
  },
};

const PRESETS = {
  'ultra-fast': { stt: 'fast', llm: 'small', tts: 'streaming', avatar: 'simple' },
  'balanced': { stt: 'balanced', llm: 'medium', tts: 'streaming', avatar: 'diffusion' },
  'high-quality': { stt: 'accurate', llm: 'large', tts: 'buffered', avatar: 'diffusion' },
  'metahuman': { stt: 'balanced', llm: 'medium', tts: 'streaming', avatar: 'metahuman' },
} as const;

const LATENCY_THRESHOLDS = {
  excellent: 300,
  good: 500,
  acceptable: 800,
};

export function QualityLatencyDemo() {
  const [config, setConfig] = useState<PipelineConfig>({
    stt: 'balanced',
    llm: 'medium',
    tts: 'streaming',
    avatar: 'diffusion',
  });

  const [showBreakdown, setShowBreakdown] = useState(true);

  const calculateMetrics = () => {
    const stt = COMPONENTS.stt[config.stt];
    const llm = COMPONENTS.llm[config.llm];
    const tts = COMPONENTS.tts[config.tts];
    const avatar = COMPONENTS.avatar[config.avatar];

    const totalLatency = stt.latency + llm.latency + tts.latency + avatar.latency + 50; // +50 for network
    const avgQuality = (stt.quality + llm.quality + tts.quality + avatar.quality) / 4;
    const totalCost = stt.cost + llm.cost + tts.cost + avatar.cost;

    return { totalLatency, avgQuality, totalCost, components: { stt, llm, tts, avatar } };
  };

  const metrics = calculateMetrics();

  const getLatencyColor = (latency: number) => {
    if (latency <= LATENCY_THRESHOLDS.excellent) return '#2ecc71';
    if (latency <= LATENCY_THRESHOLDS.good) return '#f1c40f';
    if (latency <= LATENCY_THRESHOLDS.acceptable) return '#e67e22';
    return '#e74c3c';
  };

  const getLatencyLabel = (latency: number) => {
    if (latency <= LATENCY_THRESHOLDS.excellent) return 'Excellent';
    if (latency <= LATENCY_THRESHOLDS.good) return 'Good';
    if (latency <= LATENCY_THRESHOLDS.acceptable) return 'Acceptable';
    return 'Too Slow';
  };

  const applyPreset = (presetKey: keyof typeof PRESETS) => {
    setConfig(PRESETS[presetKey] as PipelineConfig);
  };

  return (
    <div className="card p-6">
      <h3 className="font-semibold mb-2">Quality vs Latency Tradeoff</h3>
      <p className="text-sm text-[var(--text-muted)] mb-6">
        Configure each component of the voice AI pipeline to see how choices affect
        total latency, quality, and cost. Find the right balance for your use case.
      </p>

      {/* Presets */}
      <div className="flex flex-wrap gap-2 mb-6">
        <span className="text-sm text-[var(--text-muted)]">Presets:</span>
        {Object.entries(PRESETS).map(([key, _]) => (
          <button
            key={key}
            onClick={() => applyPreset(key as keyof typeof PRESETS)}
            className="badge hover:border-[var(--border-strong)] capitalize"
          >
            {key.replace('-', ' ')}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Configuration */}
        <div className="space-y-4">
          {/* STT */}
          <div className="p-4 bg-[var(--surface-2)] rounded">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-sm">Speech-to-Text</span>
              <span className="text-xs text-[var(--text-muted)]">{COMPONENTS.stt[config.stt].latency}ms</span>
            </div>
            <div className="flex gap-2">
              {(['fast', 'balanced', 'accurate'] as const).map(opt => (
                <button
                  key={opt}
                  onClick={() => setConfig(prev => ({ ...prev, stt: opt }))}
                  className={`flex-1 py-1.5 px-2 rounded text-xs transition-colors ${
                    config.stt === opt
                      ? 'bg-[var(--accent)] text-white'
                      : 'bg-[var(--surface-0)] hover:bg-[var(--border)]'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-2">{COMPONENTS.stt[config.stt].description}</p>
          </div>

          {/* LLM */}
          <div className="p-4 bg-[var(--surface-2)] rounded">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-sm">Language Model</span>
              <span className="text-xs text-[var(--text-muted)]">{COMPONENTS.llm[config.llm].latency}ms</span>
            </div>
            <div className="flex gap-2">
              {(['small', 'medium', 'large'] as const).map(opt => (
                <button
                  key={opt}
                  onClick={() => setConfig(prev => ({ ...prev, llm: opt }))}
                  className={`flex-1 py-1.5 px-2 rounded text-xs transition-colors ${
                    config.llm === opt
                      ? 'bg-[var(--accent)] text-white'
                      : 'bg-[var(--surface-0)] hover:bg-[var(--border)]'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-2">{COMPONENTS.llm[config.llm].description}</p>
          </div>

          {/* TTS */}
          <div className="p-4 bg-[var(--surface-2)] rounded">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-sm">Text-to-Speech</span>
              <span className="text-xs text-[var(--text-muted)]">{COMPONENTS.tts[config.tts].latency}ms</span>
            </div>
            <div className="flex gap-2">
              {(['streaming', 'buffered'] as const).map(opt => (
                <button
                  key={opt}
                  onClick={() => setConfig(prev => ({ ...prev, tts: opt }))}
                  className={`flex-1 py-1.5 px-2 rounded text-xs transition-colors ${
                    config.tts === opt
                      ? 'bg-[var(--accent)] text-white'
                      : 'bg-[var(--surface-0)] hover:bg-[var(--border)]'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-2">{COMPONENTS.tts[config.tts].description}</p>
          </div>

          {/* Avatar */}
          <div className="p-4 bg-[var(--surface-2)] rounded">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-sm">Avatar Rendering</span>
              <span className="text-xs text-[var(--text-muted)]">{COMPONENTS.avatar[config.avatar].latency}ms</span>
            </div>
            <div className="flex gap-2">
              {(['simple', 'diffusion', 'metahuman'] as const).map(opt => (
                <button
                  key={opt}
                  onClick={() => setConfig(prev => ({ ...prev, avatar: opt }))}
                  className={`flex-1 py-1.5 px-2 rounded text-xs transition-colors ${
                    config.avatar === opt
                      ? 'bg-[var(--accent)] text-white'
                      : 'bg-[var(--surface-0)] hover:bg-[var(--border)]'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-2">{COMPONENTS.avatar[config.avatar].description}</p>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {/* Main metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 bg-[var(--surface-2)] rounded text-center">
              <p className="text-xs text-[var(--text-muted)] mb-1">Total Latency</p>
              <p
                className="text-2xl font-bold"
                style={{ color: getLatencyColor(metrics.totalLatency) }}
              >
                {metrics.totalLatency}ms
              </p>
              <p
                className="text-xs mt-1"
                style={{ color: getLatencyColor(metrics.totalLatency) }}
              >
                {getLatencyLabel(metrics.totalLatency)}
              </p>
            </div>
            <div className="p-4 bg-[var(--surface-2)] rounded text-center">
              <p className="text-xs text-[var(--text-muted)] mb-1">Avg Quality</p>
              <p className="text-2xl font-bold text-[var(--foreground)]">
                {metrics.avgQuality.toFixed(0)}%
              </p>
              <div className="mt-1 h-1.5 bg-[var(--border)] rounded-full">
                <div
                  className="h-full bg-[#3498db] rounded-full"
                  style={{ width: `${metrics.avgQuality}%` }}
                />
              </div>
            </div>
            <div className="p-4 bg-[var(--surface-2)] rounded text-center">
              <p className="text-xs text-[var(--text-muted)] mb-1">Cost Index</p>
              <p className="text-2xl font-bold text-[var(--foreground)]">
                {'$'.repeat(Math.ceil(metrics.totalCost / 3))}
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                {metrics.totalCost}/20 units
              </p>
            </div>
          </div>

          {/* Latency breakdown */}
          <div className="p-4 bg-[var(--surface-2)] rounded">
            <div className="flex justify-between items-center mb-3">
              <span className="font-medium text-sm">Latency Breakdown</span>
              <button
                onClick={() => setShowBreakdown(!showBreakdown)}
                className="text-xs text-[var(--text-muted)]"
              >
                {showBreakdown ? 'Hide' : 'Show'}
              </button>
            </div>

            {showBreakdown && (
              <div className="space-y-2">
                {[
                  { name: 'STT', value: metrics.components.stt.latency, color: '#e74c3c' },
                  { name: 'LLM', value: metrics.components.llm.latency, color: '#9b59b6' },
                  { name: 'TTS', value: metrics.components.tts.latency, color: '#3498db' },
                  { name: 'Avatar', value: metrics.components.avatar.latency, color: '#2ecc71' },
                  { name: 'Network', value: 50, color: '#95a5a6' },
                ].map(item => (
                  <div key={item.name} className="flex items-center gap-2">
                    <span className="text-xs w-14">{item.name}</span>
                    <div className="flex-1 h-4 bg-[var(--surface-0)] rounded overflow-hidden">
                      <div
                        className="h-full transition-all duration-300"
                        style={{
                          width: `${(item.value / metrics.totalLatency) * 100}%`,
                          backgroundColor: item.color
                        }}
                      />
                    </div>
                    <span className="text-xs font-mono w-12 text-right">{item.value}ms</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Timeline visualization */}
          <div className="p-4 bg-[var(--surface-2)] rounded">
            <p className="font-medium text-sm mb-3">Response Timeline</p>
            <div className="relative h-8 bg-[var(--surface-0)] rounded overflow-hidden">
              {[
                { name: 'STT', start: 0, width: metrics.components.stt.latency, color: '#e74c3c' },
                { name: 'LLM', start: metrics.components.stt.latency, width: metrics.components.llm.latency, color: '#9b59b6' },
                { name: 'TTS', start: metrics.components.stt.latency + metrics.components.llm.latency, width: metrics.components.tts.latency, color: '#3498db' },
                { name: 'Avatar', start: metrics.components.stt.latency + metrics.components.llm.latency + metrics.components.tts.latency, width: metrics.components.avatar.latency, color: '#2ecc71' },
              ].map(item => (
                <div
                  key={item.name}
                  className="absolute top-0 h-full flex items-center justify-center text-white text-xs font-medium"
                  style={{
                    left: `${(item.start / metrics.totalLatency) * 100}%`,
                    width: `${(item.width / metrics.totalLatency) * 100}%`,
                    backgroundColor: item.color,
                  }}
                >
                  {item.width > 60 && item.name}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-[var(--text-muted)] mt-1">
              <span>0ms</span>
              <span>User speaks</span>
              <span>Avatar responds</span>
              <span>{metrics.totalLatency}ms</span>
            </div>
          </div>

          {/* Recommendation */}
          <div className="p-3 border border-[var(--border)] rounded text-sm">
            <p className="font-medium mb-1">Recommendation</p>
            <p className="text-xs text-[var(--text-muted)]">
              {metrics.totalLatency <= 300 && 'Great for real-time conversation. Users won\'t notice delay.'}
              {metrics.totalLatency > 300 && metrics.totalLatency <= 500 && 'Good for most use cases. Slight noticeable pause.'}
              {metrics.totalLatency > 500 && metrics.totalLatency <= 800 && 'Consider for quality-focused applications only.'}
              {metrics.totalLatency > 800 && 'Too slow for conversation. Use for pre-recorded content.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QualityLatencyDemo;
