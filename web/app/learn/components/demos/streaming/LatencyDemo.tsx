'use client';

import { useState, useEffect, useRef } from 'react';

interface PipelineStage {
  id: string;
  name: string;
  minLatency: number;
  maxLatency: number;
  currentLatency: number;
  color: string;
}

const DEFAULT_STAGES: PipelineStage[] = [
  { id: 'capture', name: 'Audio Capture', minLatency: 10, maxLatency: 30, currentLatency: 20, color: '#4CAF50' },
  { id: 'network1', name: 'Upload (WebRTC)', minLatency: 20, maxLatency: 100, currentLatency: 50, color: '#2196F3' },
  { id: 'stt', name: 'Speech-to-Text', minLatency: 90, maxLatency: 300, currentLatency: 150, color: '#FF9800' },
  { id: 'llm', name: 'LLM Processing', minLatency: 75, maxLatency: 500, currentLatency: 200, color: '#9C27B0' },
  { id: 'tts', name: 'Text-to-Speech', minLatency: 100, maxLatency: 300, currentLatency: 150, color: '#E91E63' },
  { id: 'avatar', name: 'Avatar Render', minLatency: 30, maxLatency: 150, currentLatency: 80, color: '#00BCD4' },
  { id: 'network2', name: 'Download (WebRTC)', minLatency: 20, maxLatency: 100, currentLatency: 50, color: '#2196F3' },
];

export function LatencyDemo() {
  const [stages, setStages] = useState<PipelineStage[]>(DEFAULT_STAGES);
  const [isSimulating, setIsSimulating] = useState(false);
  const [packetPosition, setPacketPosition] = useState(-1);
  const [streamingEnabled, setStreamingEnabled] = useState(true);
  const animationRef = useRef<number | null>(null);

  const totalLatency = stages.reduce((sum, s) => sum + s.currentLatency, 0);

  const updateStageLatency = (id: string, value: number) => {
    setStages(prev => prev.map(s =>
      s.id === id ? { ...s, currentLatency: value } : s
    ));
  };

  const randomizeLatencies = () => {
    setStages(prev => prev.map(s => ({
      ...s,
      currentLatency: Math.round(s.minLatency + Math.random() * (s.maxLatency - s.minLatency))
    })));
  };

  const setOptimized = () => {
    setStages(prev => prev.map(s => ({
      ...s,
      currentLatency: Math.round(s.minLatency + (s.maxLatency - s.minLatency) * 0.2)
    })));
  };

  const setWorstCase = () => {
    setStages(prev => prev.map(s => ({
      ...s,
      currentLatency: s.maxLatency
    })));
  };

  // Simulate packet traveling through pipeline
  useEffect(() => {
    if (!isSimulating) {
      setPacketPosition(-1);
      return;
    }

    let currentStage = 0;
    let stageProgress = 0;
    const stageDelays = stages.map(s => s.currentLatency);

    const animate = () => {
      if (currentStage >= stages.length) {
        setIsSimulating(false);
        setPacketPosition(-1);
        return;
      }

      stageProgress += 16; // ~60fps
      const stageDelay = streamingEnabled
        ? stageDelays[currentStage] * 0.3 // Streaming reduces effective latency
        : stageDelays[currentStage];

      if (stageProgress >= stageDelay) {
        currentStage++;
        stageProgress = 0;
      }

      setPacketPosition(currentStage + (stageProgress / (stageDelays[currentStage] || 1)));
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isSimulating, stages, streamingEnabled]);

  const getLatencyColor = (total: number) => {
    if (total < 400) return 'text-green-500';
    if (total < 700) return 'text-yellow-500';
    if (total < 1000) return 'text-orange-500';
    return 'text-red-500';
  };

  const getLatencyLabel = (total: number) => {
    if (total < 400) return 'Excellent - feels instant';
    if (total < 700) return 'Good - natural conversation';
    if (total < 1000) return 'Acceptable - slight delay';
    return 'Poor - noticeable lag';
  };

  return (
    <div className="card p-6">
      <h3 className="font-semibold mb-4">Voice AI Latency Visualizer</h3>
      <p className="text-sm text-[var(--text-muted)] mb-6">
        Understand how latency accumulates across the voice AI pipeline.
        Adjust individual stages to see the impact on total round-trip time.
      </p>

      {/* Total latency display */}
      <div className="mb-6 p-4 bg-[var(--surface-2)] rounded-lg text-center">
        <p className="text-sm text-[var(--text-muted)] mb-1">Total Round-Trip Latency</p>
        <p className={`text-4xl font-bold ${getLatencyColor(totalLatency)}`}>
          {totalLatency}ms
        </p>
        <p className={`text-sm ${getLatencyColor(totalLatency)}`}>
          {getLatencyLabel(totalLatency)}
        </p>
      </div>

      {/* Pipeline visualization */}
      <div className="mb-6">
        <div className="flex items-center gap-1 mb-2 overflow-x-auto pb-2">
          {stages.map((stage, index) => (
            <div key={stage.id} className="flex items-center">
              <div
                className={`relative px-2 py-3 rounded text-xs text-center min-w-[80px] transition-all ${
                  packetPosition >= index && packetPosition < index + 1
                    ? 'ring-2 ring-white scale-105'
                    : ''
                }`}
                style={{
                  backgroundColor: stage.color,
                  opacity: packetPosition >= 0 && packetPosition < index ? 0.4 : 1
                }}
              >
                <p className="font-medium text-white truncate">{stage.name}</p>
                <p className="text-white/80">{stage.currentLatency}ms</p>
              </div>
              {index < stages.length - 1 && (
                <div className="w-4 h-0.5 bg-[var(--border)]" />
              )}
            </div>
          ))}
        </div>

        {/* Streaming indicator */}
        <div className="flex items-center gap-2 text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={streamingEnabled}
              onChange={(e) => setStreamingEnabled(e.target.checked)}
              className="rounded"
            />
            <span>Streaming mode (parallel processing)</span>
          </label>
          {streamingEnabled && (
            <span className="text-xs text-green-500">
              ~{Math.round(totalLatency * 0.5)}ms effective latency
            </span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Presets */}
        <div>
          <p className="text-sm font-medium mb-3">Quick Presets</p>
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={setOptimized}
              className="badge hover:border-[var(--border-strong)] text-xs"
            >
              Optimized
            </button>
            <button
              onClick={randomizeLatencies}
              className="badge hover:border-[var(--border-strong)] text-xs"
            >
              Randomize
            </button>
            <button
              onClick={setWorstCase}
              className="badge hover:border-[var(--border-strong)] text-xs"
            >
              Worst Case
            </button>
          </div>

          <button
            onClick={() => setIsSimulating(true)}
            disabled={isSimulating}
            className="w-full badge hover:border-[var(--border-strong)] justify-center"
          >
            {isSimulating ? 'Simulating...' : 'Simulate Request'}
          </button>
        </div>

        {/* Sliders */}
        <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2">
          {stages.map((stage) => (
            <div key={stage.id}>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium" style={{ color: stage.color }}>
                  {stage.name}
                </span>
                <span className="text-[var(--text-muted)]">
                  {stage.currentLatency}ms ({stage.minLatency}-{stage.maxLatency})
                </span>
              </div>
              <input
                type="range"
                min={stage.minLatency}
                max={stage.maxLatency}
                value={stage.currentLatency}
                onChange={(e) => updateStageLatency(stage.id, parseInt(e.target.value))}
                className="w-full h-2"
                style={{ accentColor: stage.color }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Budget breakdown */}
      <div className="mt-6 grid grid-cols-4 gap-2 text-center text-xs">
        <div className="p-2 bg-[var(--surface-2)] rounded">
          <p className="font-medium">Target</p>
          <p className="text-green-500">~500ms</p>
        </div>
        <div className="p-2 bg-[var(--surface-2)] rounded">
          <p className="font-medium">Acceptable</p>
          <p className="text-yellow-500">~700ms</p>
        </div>
        <div className="p-2 bg-[var(--surface-2)] rounded">
          <p className="font-medium">Noticeable</p>
          <p className="text-orange-500">~1000ms</p>
        </div>
        <div className="p-2 bg-[var(--surface-2)] rounded">
          <p className="font-medium">Poor</p>
          <p className="text-red-500">&gt;1000ms</p>
        </div>
      </div>

      {/* Optimization tips */}
      <div className="mt-6 p-4 bg-[var(--surface-2)] rounded text-sm">
        <p className="font-medium mb-2">Optimization Strategies</p>
        <ul className="space-y-1 text-xs text-[var(--text-muted)]">
          <li>• <strong>Streaming STT:</strong> Start processing before user finishes speaking</li>
          <li>• <strong>Streaming TTS:</strong> Begin playback before full response generated</li>
          <li>• <strong>Edge deployment:</strong> Reduce network latency with regional servers</li>
          <li>• <strong>Model selection:</strong> Smaller LLMs trade quality for speed</li>
          <li>• <strong>Turn detection:</strong> Faster endpointing reduces perceived latency</li>
        </ul>
      </div>
    </div>
  );
}

export default LatencyDemo;
