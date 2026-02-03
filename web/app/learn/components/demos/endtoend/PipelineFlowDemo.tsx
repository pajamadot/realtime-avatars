'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface PipelineStage {
  id: string;
  name: string;
  icon: string;
  latency: { min: number; max: number };
  description: string;
  color: string;
}

const stages: PipelineStage[] = [
  { id: 'mic', name: 'Mic', icon: '🎤', latency: { min: 0, max: 0 }, description: 'User speaks', color: '#6bcb77' },
  { id: 'vad', name: 'VAD', icon: '📊', latency: { min: 100, max: 300 }, description: 'Detect speech end', color: '#4ecdc4' },
  { id: 'stt', name: 'STT', icon: '📝', latency: { min: 100, max: 400 }, description: 'Transcribe audio', color: '#45b7d1' },
  { id: 'llm', name: 'LLM', icon: '🧠', latency: { min: 150, max: 500 }, description: 'Generate response', color: '#96ceb4' },
  { id: 'tts', name: 'TTS', icon: '🔊', latency: { min: 100, max: 300 }, description: 'Synthesize speech', color: '#ffd93d' },
  { id: 'avatar', name: 'Avatar', icon: '🎭', latency: { min: 50, max: 200 }, description: 'Render face', color: '#ff6b6b' },
  { id: 'stream', name: 'Stream', icon: '📡', latency: { min: 30, max: 100 }, description: 'Deliver to user', color: '#c9b1ff' },
];

interface DataPacket {
  id: number;
  stage: number;
  progress: number;
  startTime: number;
  stageLatencies: number[];
  content: string;
}

export default function PipelineFlowDemo() {
  const [packets, setPackets] = useState<DataPacket[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showStreaming, setShowStreaming] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [totalLatency, setTotalLatency] = useState(0);
  const [completedPackets, setCompletedPackets] = useState(0);
  const packetIdRef = useRef(0);
  const animationRef = useRef<number | null>(null);

  const messages = [
    { input: '"Hello, how are you?"', output: '"I\'m doing great!"' },
    { input: '"What\'s the weather?"', output: '"It\'s sunny today!"' },
    { input: '"Tell me a joke"', output: '"Why did the AI..."' },
  ];

  // Generate random latency within stage bounds
  const generateLatency = (stage: PipelineStage) => {
    return stage.latency.min + Math.random() * (stage.latency.max - stage.latency.min);
  };

  // Spawn a new packet
  const spawnPacket = useCallback(() => {
    const stageLatencies = stages.map(s => generateLatency(s));
    const msg = messages[packetIdRef.current % messages.length];

    const newPacket: DataPacket = {
      id: packetIdRef.current++,
      stage: 0,
      progress: 0,
      startTime: Date.now(),
      stageLatencies,
      content: msg.input,
    };

    setPackets(prev => [...prev, newPacket]);
  }, []);

  // Animation loop
  const animate = useCallback(() => {
    const now = Date.now();

    setPackets(prev => {
      const updated = prev.map(packet => {
        const elapsed = (now - packet.startTime) * speedMultiplier;

        // Calculate cumulative time for each stage
        let cumulativeTime = 0;
        let currentStage = 0;
        let stageProgress = 0;

        for (let i = 0; i < stages.length; i++) {
          const stageTime = showStreaming ? packet.stageLatencies[i] : packet.stageLatencies[i];
          if (elapsed < cumulativeTime + stageTime) {
            currentStage = i;
            stageProgress = (elapsed - cumulativeTime) / stageTime;
            break;
          }
          cumulativeTime += stageTime;
          if (i === stages.length - 1) {
            currentStage = stages.length;
            stageProgress = 1;
          }
        }

        return {
          ...packet,
          stage: currentStage,
          progress: stageProgress,
        };
      });

      // Remove completed packets and count them
      const completed = updated.filter(p => p.stage >= stages.length);
      if (completed.length > 0) {
        completed.forEach(p => {
          const total = p.stageLatencies.reduce((a, b) => a + b, 0);
          setTotalLatency(total);
          setCompletedPackets(c => c + 1);
        });
      }

      return updated.filter(p => p.stage < stages.length);
    });

    if (isRunning) {
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [isRunning, showStreaming, speedMultiplier]);

  useEffect(() => {
    if (isRunning) {
      animationRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isRunning, animate]);

  // Auto-spawn packets when running
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      if (packets.length < 3) {
        spawnPacket();
      }
    }, 2000 / speedMultiplier);

    return () => clearInterval(interval);
  }, [isRunning, packets.length, spawnPacket, speedMultiplier]);

  const toggleRunning = () => {
    if (!isRunning && packets.length === 0) {
      spawnPacket();
    }
    setIsRunning(!isRunning);
  };

  const reset = () => {
    setIsRunning(false);
    setPackets([]);
    setTotalLatency(0);
    setCompletedPackets(0);
  };

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Voice AI Pipeline Flow</h3>
        <div className="flex gap-2">
          <button
            onClick={toggleRunning}
            className={`px-3 py-1 text-xs rounded ${
              isRunning ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
            }`}
          >
            {isRunning ? 'Pause' : 'Start'}
          </button>
          <button
            onClick={() => { if (!isRunning) spawnPacket(); }}
            disabled={isRunning}
            className="px-3 py-1 text-xs bg-[var(--card-bg-alt)] rounded hover:bg-[var(--border)] disabled:opacity-50"
          >
            Send Message
          </button>
          <button
            onClick={reset}
            className="px-3 py-1 text-xs bg-[var(--card-bg-alt)] rounded hover:bg-[var(--border)]"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Pipeline visualization */}
      <div className="relative py-8 overflow-hidden">
        {/* Stage boxes */}
        <div className="flex justify-between items-center relative z-10">
          {stages.map((stage, idx) => (
            <div key={stage.id} className="flex flex-col items-center">
              <div
                className="w-14 h-14 rounded-lg flex items-center justify-center text-2xl relative"
                style={{ backgroundColor: `${stage.color}20`, border: `2px solid ${stage.color}` }}
              >
                {stage.icon}
                {/* Stage activity indicator */}
                {packets.some(p => p.stage === idx) && (
                  <div
                    className="absolute inset-0 rounded-lg animate-pulse"
                    style={{ backgroundColor: `${stage.color}30` }}
                  />
                )}
              </div>
              <span className="text-xs mt-2 font-medium">{stage.name}</span>
              <span className="text-xs text-[var(--muted)]">
                {stage.latency.min}-{stage.latency.max}ms
              </span>
            </div>
          ))}
        </div>

        {/* Connection lines */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-[var(--border)] -translate-y-1/2" style={{ top: 'calc(50% - 12px)' }} />

        {/* Animated packets */}
        {packets.map(packet => {
          const stageWidth = 100 / stages.length;
          const position = (packet.stage + packet.progress) * stageWidth;

          return (
            <div
              key={packet.id}
              className="absolute w-4 h-4 rounded-full bg-white shadow-lg transition-all duration-75"
              style={{
                left: `calc(${position}% - 8px)`,
                top: 'calc(50% - 20px)',
                boxShadow: `0 0 10px ${stages[Math.min(packet.stage, stages.length - 1)].color}`,
              }}
            />
          );
        })}
      </div>

      {/* Stats and controls */}
      <div className="grid md:grid-cols-3 gap-4 mt-4">
        {/* Speed control */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Speed</span>
            <span className="text-[var(--accent)]">{speedMultiplier}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.5"
            value={speedMultiplier}
            onChange={(e) => setSpeedMultiplier(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Streaming toggle */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="streaming"
            checked={showStreaming}
            onChange={(e) => setShowStreaming(e.target.checked)}
            className="rounded"
          />
          <label htmlFor="streaming" className="text-sm">
            Streaming Mode
          </label>
        </div>

        {/* Stats */}
        <div className="text-sm text-[var(--muted)]">
          <p>Last latency: <span className="text-[var(--foreground)]">{totalLatency.toFixed(0)}ms</span></p>
          <p>Completed: <span className="text-[var(--foreground)]">{completedPackets}</span></p>
        </div>
      </div>

      {/* Stage breakdown */}
      <div className="mt-4 p-3 bg-[var(--card-bg-alt)] rounded">
        <p className="text-xs font-medium mb-2">Latency Breakdown (typical):</p>
        <div className="flex flex-wrap gap-2">
          {stages.slice(1).map(stage => (
            <div key={stage.id} className="flex items-center gap-1 text-xs">
              <div className="w-2 h-2 rounded" style={{ backgroundColor: stage.color }} />
              <span>{stage.name}: {stage.latency.min}-{stage.latency.max}ms</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-[var(--muted)] mt-2">
          Total: {stages.slice(1).reduce((a, s) => a + s.latency.min, 0)}-
          {stages.slice(1).reduce((a, s) => a + s.latency.max, 0)}ms
        </p>
      </div>

      <p className="text-xs text-[var(--muted)] mt-4">
        Watch data packets flow through the pipeline. Each stage adds latency.
        Streaming mode processes data in parallel where possible.
      </p>
    </div>
  );
}
