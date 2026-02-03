'use client';

import { useState, useEffect, useRef } from 'react';

interface QualityLevel {
  name: string;
  bitrate: number;
  resolution: string;
  color: string;
}

const QUALITY_LEVELS: QualityLevel[] = [
  { name: '1080p', bitrate: 4000, resolution: '1920×1080', color: '#2ecc71' },
  { name: '720p', bitrate: 2500, resolution: '1280×720', color: '#3498db' },
  { name: '480p', bitrate: 1000, resolution: '854×480', color: '#f1c40f' },
  { name: '360p', bitrate: 500, resolution: '640×360', color: '#e67e22' },
  { name: '240p', bitrate: 300, resolution: '426×240', color: '#e74c3c' },
];

export function BitrateAdaptationDemo() {
  const [bandwidth, setBandwidth] = useState(3000); // kbps
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentQuality, setCurrentQuality] = useState(1); // index
  const [bufferHealth, setBufferHealth] = useState(100); // percent
  const [history, setHistory] = useState<{ time: number; bandwidth: number; quality: number }[]>([]);
  const [algorithm, setAlgorithm] = useState<'simple' | 'buffer-based'>('buffer-based');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simulationRef = useRef<number | null>(null);
  const timeRef = useRef(0);

  // Adaptive bitrate selection
  const selectQuality = (bw: number, buffer: number): number => {
    if (algorithm === 'simple') {
      // Simple: pick highest quality that fits bandwidth
      for (let i = 0; i < QUALITY_LEVELS.length; i++) {
        if (QUALITY_LEVELS[i].bitrate <= bw * 0.8) {
          return i;
        }
      }
      return QUALITY_LEVELS.length - 1;
    } else {
      // Buffer-based: consider buffer health
      if (buffer < 30) {
        // Low buffer - be conservative
        for (let i = 0; i < QUALITY_LEVELS.length; i++) {
          if (QUALITY_LEVELS[i].bitrate <= bw * 0.5) {
            return i;
          }
        }
        return QUALITY_LEVELS.length - 1;
      } else if (buffer > 70) {
        // High buffer - can be aggressive
        for (let i = 0; i < QUALITY_LEVELS.length; i++) {
          if (QUALITY_LEVELS[i].bitrate <= bw * 0.95) {
            return i;
          }
        }
        return QUALITY_LEVELS.length - 1;
      } else {
        // Normal - moderate
        for (let i = 0; i < QUALITY_LEVELS.length; i++) {
          if (QUALITY_LEVELS[i].bitrate <= bw * 0.7) {
            return i;
          }
        }
        return QUALITY_LEVELS.length - 1;
      }
    }
  };

  // Simulation
  useEffect(() => {
    if (!isSimulating) {
      if (simulationRef.current) {
        clearInterval(simulationRef.current);
      }
      return;
    }

    simulationRef.current = setInterval(() => {
      timeRef.current += 1;

      // Simulate bandwidth fluctuations
      const fluctuation = (Math.sin(timeRef.current * 0.1) * 500) + (Math.random() - 0.5) * 800;
      const newBandwidth = Math.max(200, Math.min(5000, bandwidth + fluctuation));
      setBandwidth(Math.round(newBandwidth));

      // Update buffer
      const selectedQuality = QUALITY_LEVELS[currentQuality];
      const fillRate = newBandwidth / selectedQuality.bitrate;
      const newBuffer = Math.max(0, Math.min(100, bufferHealth + (fillRate - 1) * 10));
      setBufferHealth(newBuffer);

      // Select new quality
      const newQuality = selectQuality(newBandwidth, newBuffer);
      setCurrentQuality(newQuality);

      // Update history
      setHistory(prev => [
        ...prev.slice(-50),
        { time: timeRef.current, bandwidth: newBandwidth, quality: newQuality },
      ]);
    }, 200) as unknown as number;

    return () => {
      if (simulationRef.current) {
        clearInterval(simulationRef.current);
      }
    };
  }, [isSimulating, bandwidth, bufferHealth, currentQuality, algorithm]);

  // Render graph
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding + (i / 5) * (height - 2 * padding);
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Draw quality level bands
    QUALITY_LEVELS.forEach((level, i) => {
      const y = padding + (1 - level.bitrate / 5000) * (height - 2 * padding);
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = `${level.color}40`;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label
      ctx.fillStyle = level.color;
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(level.name, width - padding + 5, y + 3);
    });

    // Draw bandwidth history
    if (history.length > 1) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();

      history.forEach((point, i) => {
        const x = padding + (i / 50) * (width - 2 * padding);
        const y = padding + (1 - point.bandwidth / 5000) * (height - 2 * padding);

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });

      ctx.stroke();

      // Draw quality selections
      ctx.lineWidth = 3;
      history.forEach((point, i) => {
        const x = padding + (i / 50) * (width - 2 * padding);
        const level = QUALITY_LEVELS[point.quality];
        const y = padding + (1 - level.bitrate / 5000) * (height - 2 * padding);

        ctx.fillStyle = level.color;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Axes labels
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Time', width / 2, height - 5);
    ctx.save();
    ctx.translate(12, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Bitrate (kbps)', 0, 0);
    ctx.restore();

    // Current values
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`BW: ${bandwidth} kbps`, padding, 20);
    ctx.fillText(`Buffer: ${bufferHealth.toFixed(0)}%`, padding + 120, 20);

  }, [history, bandwidth, bufferHealth]);

  const currentLevel = QUALITY_LEVELS[currentQuality];

  const reset = () => {
    setHistory([]);
    timeRef.current = 0;
    setBufferHealth(100);
    setCurrentQuality(1);
    setBandwidth(3000);
  };

  return (
    <div className="card p-6">
      <h3 className="font-semibold mb-2">Adaptive Bitrate Streaming</h3>
      <p className="text-sm text-[var(--muted)] mb-6">
        ABR algorithms select video quality based on network bandwidth and buffer health.
        Watch the system adapt to changing conditions in real-time.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Canvas */}
        <div>
          <canvas
            ref={canvasRef}
            width={400}
            height={220}
            className="w-full rounded-lg border border-[var(--border)]"
          />

          {/* Controls */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              className={`flex-1 py-2 rounded font-medium text-sm transition-colors ${
                isSimulating ? 'bg-red-500 text-white' : 'bg-[var(--accent)] text-white'
              }`}
            >
              {isSimulating ? 'Stop' : 'Simulate'}
            </button>
            <button onClick={reset} className="badge">
              Reset
            </button>
          </div>

          {/* Legend */}
          <div className="mt-3 flex flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-8 h-0.5 bg-white" />
              <span>Bandwidth</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-[var(--accent)]" />
              <span>Selected quality</span>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="space-y-4">
          {/* Current quality */}
          <div className="p-4 rounded" style={{ backgroundColor: `${currentLevel.color}20` }}>
            <div className="flex justify-between items-center">
              <span className="font-medium text-sm">Current Quality</span>
              <span
                className="px-2 py-1 rounded text-xs font-medium text-white"
                style={{ backgroundColor: currentLevel.color }}
              >
                {currentLevel.name}
              </span>
            </div>
            <p className="text-xs text-[var(--muted)] mt-1">
              {currentLevel.resolution} @ {currentLevel.bitrate} kbps
            </p>
          </div>

          {/* Buffer health */}
          <div className="p-4 bg-[var(--card-bg-alt)] rounded">
            <div className="flex justify-between text-sm mb-2">
              <span>Buffer Health</span>
              <span className="font-mono">{bufferHealth.toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-[var(--card-bg)] rounded overflow-hidden">
              <div
                className="h-full transition-all duration-200"
                style={{
                  width: `${bufferHealth}%`,
                  backgroundColor:
                    bufferHealth < 30 ? '#e74c3c' : bufferHealth < 60 ? '#f1c40f' : '#2ecc71',
                }}
              />
            </div>
          </div>

          {/* Algorithm selector */}
          <div className="p-4 bg-[var(--card-bg-alt)] rounded">
            <p className="font-medium text-sm mb-2">ABR Algorithm</p>
            <div className="flex gap-2">
              <button
                onClick={() => setAlgorithm('simple')}
                className={`flex-1 py-2 rounded text-xs ${
                  algorithm === 'simple' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--card-bg)]'
                }`}
              >
                Simple
              </button>
              <button
                onClick={() => setAlgorithm('buffer-based')}
                className={`flex-1 py-2 rounded text-xs ${
                  algorithm === 'buffer-based' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--card-bg)]'
                }`}
              >
                Buffer-Based
              </button>
            </div>
            <p className="text-xs text-[var(--muted)] mt-2">
              {algorithm === 'simple'
                ? 'Picks highest quality ≤ 80% bandwidth'
                : 'Adjusts based on buffer: conservative when low, aggressive when high'}
            </p>
          </div>

          <div className="p-3 border border-[var(--border)] rounded text-sm">
            <p className="font-medium mb-1">For Avatars</p>
            <p className="text-xs text-[var(--muted)]">
              Real-time avatars use similar techniques. Buffer-based ABR helps maintain
              smooth playback even with network jitter, choosing quality that keeps the pipeline fed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BitrateAdaptationDemo;
