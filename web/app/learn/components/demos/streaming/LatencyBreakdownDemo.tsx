'use client';

import { useState, useRef, useEffect } from 'react';

interface LatencyComponent {
  id: string;
  name: string;
  minMs: number;
  maxMs: number;
  color: string;
  description: string;
}

const latencyComponents: LatencyComponent[] = [
  { id: 'capture', name: 'Capture', minMs: 8, maxMs: 33, color: '#66aaff', description: 'Camera frame capture (30-120 FPS)' },
  { id: 'encode', name: 'Encode', minMs: 2, maxMs: 15, color: '#66ffaa', description: 'Video compression (H.264/VP8/AV1)' },
  { id: 'packetize', name: 'Packetize', minMs: 1, maxMs: 3, color: '#ffaa66', description: 'RTP packet fragmentation' },
  { id: 'network', name: 'Network', minMs: 10, maxMs: 150, color: '#ff6666', description: 'Internet transit (ping/2)' },
  { id: 'jitter', name: 'Jitter Buffer', minMs: 20, maxMs: 100, color: '#aa66ff', description: 'Packet reordering buffer' },
  { id: 'decode', name: 'Decode', minMs: 2, maxMs: 10, color: '#66ffff', description: 'Video decompression' },
  { id: 'render', name: 'Render', minMs: 8, maxMs: 16, color: '#ffff66', description: 'Display refresh (60-120 Hz)' },
];

export function LatencyBreakdownDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [networkQuality, setNetworkQuality] = useState(0.5);
  const [encoderPreset, setEncoderPreset] = useState<'ultrafast' | 'fast' | 'medium'>('fast');
  const [jitterBufferSize, setJitterBufferSize] = useState(50);
  const [frameRate, setFrameRate] = useState(30);
  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null);

  // Calculate actual latencies based on settings
  const getLatency = (component: LatencyComponent): number => {
    const range = component.maxMs - component.minMs;
    let latency = component.minMs;

    switch (component.id) {
      case 'capture':
        latency = 1000 / frameRate;
        break;
      case 'encode':
        const encodeMultiplier = encoderPreset === 'ultrafast' ? 0.2 : encoderPreset === 'fast' ? 0.5 : 1;
        latency = component.minMs + range * encodeMultiplier;
        break;
      case 'network':
        latency = component.minMs + range * (1 - networkQuality);
        break;
      case 'jitter':
        latency = jitterBufferSize;
        break;
      case 'render':
        latency = 1000 / 60; // Assume 60Hz display
        break;
      default:
        latency = component.minMs + range * 0.5;
    }

    return Math.round(latency);
  };

  const totalLatency = latencyComponents.reduce((sum, c) => sum + getLatency(c), 0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    const barHeight = 40;
    const barY = 60;
    const barStartX = 50;
    const maxBarWidth = width - 100;

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('End-to-End Latency Breakdown', 20, 30);

    ctx.fillStyle = '#888888';
    ctx.font = '12px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`Total: ${totalLatency}ms`, width - 20, 30);

    // Quality indicator
    let qualityLabel = '';
    let qualityColor = '';
    if (totalLatency < 100) {
      qualityLabel = 'Excellent';
      qualityColor = '#66ff66';
    } else if (totalLatency < 200) {
      qualityLabel = 'Good';
      qualityColor = '#aaff66';
    } else if (totalLatency < 350) {
      qualityLabel = 'Acceptable';
      qualityColor = '#ffaa66';
    } else {
      qualityLabel = 'Poor';
      qualityColor = '#ff6666';
    }

    ctx.fillStyle = qualityColor;
    ctx.fillText(qualityLabel, width - 80, 30);

    // Draw stacked bar
    let currentX = barStartX;
    const scale = maxBarWidth / Math.max(totalLatency, 100);

    latencyComponents.forEach((component) => {
      const latency = getLatency(component);
      const segmentWidth = latency * scale;

      const isHovered = hoveredComponent === component.id;

      ctx.fillStyle = isHovered ? component.color : component.color + '99';
      ctx.fillRect(currentX, barY, segmentWidth, barHeight);

      // Border
      ctx.strokeStyle = isHovered ? '#ffffff' : component.color;
      ctx.lineWidth = isHovered ? 2 : 1;
      ctx.strokeRect(currentX, barY, segmentWidth, barHeight);

      // Label if segment is wide enough
      if (segmentWidth > 30) {
        ctx.fillStyle = '#000000';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${latency}ms`, currentX + segmentWidth / 2, barY + barHeight / 2 + 4);
      }

      currentX += segmentWidth;
    });

    // Timeline markers
    ctx.strokeStyle = '#444466';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);

    const markers = [0, 50, 100, 150, 200, 250, 300, 350, 400];
    markers.forEach(ms => {
      if (ms <= Math.max(totalLatency, 100)) {
        const x = barStartX + ms * scale;
        ctx.beginPath();
        ctx.moveTo(x, barY + barHeight + 5);
        ctx.lineTo(x, barY + barHeight + 15);
        ctx.stroke();

        ctx.fillStyle = '#666666';
        ctx.font = '9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${ms}`, x, barY + barHeight + 25);
      }
    });
    ctx.setLineDash([]);

    // Legend
    const legendY = 140;
    const legendColumns = 2;
    const columnWidth = (width - 40) / legendColumns;

    latencyComponents.forEach((component, i) => {
      const col = i % legendColumns;
      const row = Math.floor(i / legendColumns);
      const x = 20 + col * columnWidth;
      const y = legendY + row * 45;

      const isHovered = hoveredComponent === component.id;
      const latency = getLatency(component);

      // Color box
      ctx.fillStyle = component.color;
      ctx.fillRect(x, y, 12, 12);
      if (isHovered) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, 12, 12);
      }

      // Name and value
      ctx.fillStyle = isHovered ? '#ffffff' : '#cccccc';
      ctx.font = isHovered ? 'bold 11px monospace' : '11px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`${component.name}: ${latency}ms`, x + 18, y + 10);

      // Description
      ctx.fillStyle = '#888888';
      ctx.font = '9px monospace';
      ctx.fillText(component.description, x + 18, y + 24);
    });

    // Draw timeline visualization at bottom
    const timelineY = height - 50;
    const stages = ['Camera', 'CPU', 'Network', 'CPU', 'Display'];
    const stageWidth = (width - 100) / stages.length;

    ctx.fillStyle = '#888888';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';

    stages.forEach((stage, i) => {
      const x = 50 + i * stageWidth + stageWidth / 2;
      ctx.fillText(stage, x, timelineY + 25);

      // Draw arrow
      if (i < stages.length - 1) {
        ctx.strokeStyle = '#444466';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + 30, timelineY + 20);
        ctx.lineTo(x + stageWidth - 30, timelineY + 20);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x + stageWidth - 30, timelineY + 20);
        ctx.lineTo(x + stageWidth - 38, timelineY + 16);
        ctx.lineTo(x + stageWidth - 38, timelineY + 24);
        ctx.closePath();
        ctx.fillStyle = '#444466';
        ctx.fill();
      }
    });

  }, [networkQuality, encoderPreset, jitterBufferSize, frameRate, hoveredComponent, totalLatency]);

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if hovering over legend
    const legendY = 140;
    const columnWidth = (canvas.width - 40) / 2;

    let found = false;
    latencyComponents.forEach((component, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const lx = 20 + col * columnWidth;
      const ly = legendY + row * 45;

      if (x >= lx && x <= lx + columnWidth - 20 && y >= ly && y <= ly + 35) {
        setHoveredComponent(component.id);
        found = true;
      }
    });

    if (!found) {
      setHoveredComponent(null);
    }
  };

  return (
    <div className="card p-6">
      <h3 className="font-semibold mb-2">Latency Breakdown</h3>
      <p className="text-sm text-[var(--muted)] mb-4">
        Understanding where latency comes from is key to optimizing real-time systems. Hover over components to highlight them.
      </p>

      <canvas
        ref={canvasRef}
        width={600}
        height={320}
        className="w-full max-w-[600px] mb-4 rounded cursor-pointer"
        onMouseMove={handleCanvasMouseMove}
        onMouseLeave={() => setHoveredComponent(null)}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="text-xs text-[var(--muted)] block mb-1">Network Quality</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={networkQuality}
            onChange={(e) => setNetworkQuality(Number(e.target.value))}
            className="w-full"
          />
          <span className="text-xs text-[var(--muted)]">{networkQuality < 0.3 ? 'Poor' : networkQuality < 0.7 ? 'Average' : 'Good'}</span>
        </div>
        <div>
          <label className="text-xs text-[var(--muted)] block mb-1">Encoder Preset</label>
          <select
            value={encoderPreset}
            onChange={(e) => setEncoderPreset(e.target.value as typeof encoderPreset)}
            className="w-full px-2 py-1 rounded bg-[var(--card-bg)] border border-[var(--border)] text-sm"
          >
            <option value="ultrafast">Ultrafast</option>
            <option value="fast">Fast</option>
            <option value="medium">Medium</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-[var(--muted)] block mb-1">Jitter Buffer: {jitterBufferSize}ms</label>
          <input
            type="range"
            min="20"
            max="150"
            step="10"
            value={jitterBufferSize}
            onChange={(e) => setJitterBufferSize(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="text-xs text-[var(--muted)] block mb-1">Frame Rate: {frameRate} FPS</label>
          <input
            type="range"
            min="15"
            max="60"
            step="5"
            value={frameRate}
            onChange={(e) => setFrameRate(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      <div className="p-3 bg-[var(--card-bg-alt)] rounded text-xs">
        <p className="font-medium mb-1">Optimization Targets</p>
        <p className="text-[var(--muted)]">
          For real-time avatars, aim for &lt;200ms total latency. Network is often the largest factor.
          Use SFU topology, reduce jitter buffer, and choose faster encoder presets for lower latency
          (at the cost of quality/bandwidth).
        </p>
      </div>
    </div>
  );
}
