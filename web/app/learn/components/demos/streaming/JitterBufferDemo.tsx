'use client';

import { useState, useEffect, useRef } from 'react';

interface Packet {
  id: number;
  arrivalTime: number;
  playTime: number;
  delay: number;
}

export function JitterBufferDemo() {
  const [bufferSize, setBufferSize] = useState(100); // ms
  const [jitter, setJitter] = useState(50); // ms variance
  const [packetLoss, setPacketLoss] = useState(5); // percentage
  const [isRunning, setIsRunning] = useState(false);
  const [packets, setPackets] = useState<Packet[]>([]);
  const [bufferState, setBufferState] = useState<'empty' | 'filling' | 'stable' | 'overflow'>('empty');
  const [stats, setStats] = useState({ received: 0, played: 0, dropped: 0, late: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const packetIdRef = useRef(0);

  // Simulation
  useEffect(() => {
    if (!isRunning) return;

    const packetInterval = 20; // 20ms between packets (50 packets/sec like audio)
    let lastTime = performance.now();
    let accumulator = 0;

    const simulate = (currentTime: number) => {
      const delta = currentTime - lastTime;
      lastTime = currentTime;
      accumulator += delta;

      // Generate packets
      while (accumulator >= packetInterval) {
        accumulator -= packetInterval;

        // Check for packet loss
        if (Math.random() * 100 < packetLoss) {
          setStats(prev => ({ ...prev, dropped: prev.dropped + 1 }));
          packetIdRef.current++;
          continue;
        }

        // Add jitter to arrival time
        const jitterAmount = (Math.random() - 0.5) * 2 * jitter;
        const arrivalDelay = Math.max(0, jitterAmount);

        const newPacket: Packet = {
          id: packetIdRef.current++,
          arrivalTime: currentTime + arrivalDelay,
          playTime: currentTime + bufferSize,
          delay: arrivalDelay,
        };

        setPackets(prev => [...prev.slice(-50), newPacket]);
        setStats(prev => ({ ...prev, received: prev.received + 1 }));
      }

      // Process buffer - play packets that are ready
      setPackets(prev => {
        const now = performance.now();
        const toPlay = prev.filter(p => p.playTime <= now);
        const remaining = prev.filter(p => p.playTime > now);

        toPlay.forEach(p => {
          if (p.arrivalTime > p.playTime) {
            setStats(s => ({ ...s, late: s.late + 1 }));
          } else {
            setStats(s => ({ ...s, played: s.played + 1 }));
          }
        });

        return remaining;
      });

      // Update buffer state
      setPackets(prev => {
        const bufferedMs = prev.length * packetInterval;
        if (bufferedMs === 0) setBufferState('empty');
        else if (bufferedMs < bufferSize * 0.5) setBufferState('filling');
        else if (bufferedMs > bufferSize * 1.5) setBufferState('overflow');
        else setBufferState('stable');
        return prev;
      });

      animationRef.current = requestAnimationFrame(simulate);
    };

    animationRef.current = requestAnimationFrame(simulate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isRunning, bufferSize, jitter, packetLoss]);

  // Render visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    const now = performance.now();
    const timeWindow = 500; // Show 500ms window

    // Draw timeline
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(50, height / 2);
    ctx.lineTo(width - 20, height / 2);
    ctx.stroke();

    // Draw buffer zone
    const bufferStart = 50;
    const bufferEnd = 50 + (bufferSize / timeWindow) * (width - 70);

    ctx.fillStyle = 'rgba(46, 204, 113, 0.2)';
    ctx.fillRect(bufferStart, height / 2 - 40, bufferEnd - bufferStart, 80);

    ctx.strokeStyle = '#2ecc71';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(bufferEnd, height / 2 - 40);
    ctx.lineTo(bufferEnd, height / 2 + 40);
    ctx.stroke();
    ctx.setLineDash([]);

    // Label
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '10px sans-serif';
    ctx.fillText('Buffer', bufferStart + 5, height / 2 - 45);
    ctx.fillText(`${bufferSize}ms`, bufferEnd - 25, height / 2 - 45);

    // Draw packets
    packets.forEach(packet => {
      const timeSinceArrival = now - packet.arrivalTime;
      const timeUntilPlay = packet.playTime - now;

      if (timeSinceArrival < 0 || timeSinceArrival > timeWindow) return;

      const x = 50 + (timeSinceArrival / timeWindow) * (width - 70);
      const isLate = packet.arrivalTime > packet.playTime;

      // Packet circle
      ctx.fillStyle = isLate ? '#e74c3c' : '#3498db';
      ctx.beginPath();
      ctx.arc(x, height / 2 + packet.delay * 0.3, 6, 0, Math.PI * 2);
      ctx.fill();

      // Jitter line
      if (Math.abs(packet.delay) > 5) {
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.moveTo(x, height / 2);
        ctx.lineTo(x, height / 2 + packet.delay * 0.3);
        ctx.stroke();
      }
    });

    // Play head
    ctx.fillStyle = '#ffd93d';
    ctx.beginPath();
    ctx.moveTo(50, height / 2 - 15);
    ctx.lineTo(55, height / 2);
    ctx.lineTo(50, height / 2 + 15);
    ctx.closePath();
    ctx.fill();

    // Labels
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '10px sans-serif';
    ctx.fillText('Play', 35, height / 2 + 30);
    ctx.fillText('Network arrival →', width - 100, height / 2 + 30);

  }, [packets, bufferSize]);

  const reset = () => {
    setPackets([]);
    setStats({ received: 0, played: 0, dropped: 0, late: 0 });
    packetIdRef.current = 0;
  };

  const bufferStateColor = {
    empty: '#e74c3c',
    filling: '#f1c40f',
    stable: '#2ecc71',
    overflow: '#9b59b6',
  };

  return (
    <div className="card p-6">
      <h3 className="font-semibold mb-2">Jitter Buffer Simulation</h3>
      <p className="text-sm text-[var(--text-muted)] mb-6">
        Network jitter causes packets to arrive at irregular intervals. The jitter buffer
        smooths this out by adding delay. Too small = glitches, too large = latency.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Visualization */}
        <div>
          <canvas
            ref={canvasRef}
            width={400}
            height={200}
            className="w-full rounded-lg border border-[var(--border)]"
          />

          {/* Controls */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`flex-1 py-2 rounded font-medium text-sm transition-colors ${
                isRunning ? 'bg-red-500 text-white' : 'bg-[var(--accent)] text-white'
              }`}
            >
              {isRunning ? 'Stop' : 'Start'}
            </button>
            <button
              onClick={reset}
              className="badge hover:border-[var(--border-strong)]"
            >
              Reset
            </button>
          </div>

          {/* Legend */}
          <div className="mt-3 flex flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-[#3498db]" />
              <span>On-time packet</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-[#e74c3c]" />
              <span>Late packet</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-[#ffd93d]" style={{ clipPath: 'polygon(0 0, 100% 50%, 0 100%)' }} />
              <span>Play head</span>
            </div>
          </div>
        </div>

        {/* Parameters */}
        <div className="space-y-4">
          {/* Buffer state */}
          <div className="p-4 bg-[var(--surface-2)] rounded">
            <div className="flex justify-between items-center">
              <span className="font-medium text-sm">Buffer State</span>
              <span
                className="px-2 py-1 rounded text-xs font-medium text-white capitalize"
                style={{ backgroundColor: bufferStateColor[bufferState] }}
              >
                {bufferState}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-2">
            <div className="p-2 bg-[var(--surface-2)] rounded text-center">
              <p className="text-xs text-[var(--text-muted)]">Received</p>
              <p className="font-mono">{stats.received}</p>
            </div>
            <div className="p-2 bg-[var(--surface-2)] rounded text-center">
              <p className="text-xs text-[var(--text-muted)]">Played</p>
              <p className="font-mono text-green-500">{stats.played}</p>
            </div>
            <div className="p-2 bg-[var(--surface-2)] rounded text-center">
              <p className="text-xs text-[var(--text-muted)]">Dropped</p>
              <p className="font-mono text-red-500">{stats.dropped}</p>
            </div>
            <div className="p-2 bg-[var(--surface-2)] rounded text-center">
              <p className="text-xs text-[var(--text-muted)]">Late</p>
              <p className="font-mono text-yellow-500">{stats.late}</p>
            </div>
          </div>

          {/* Parameters */}
          <div className="p-4 bg-[var(--surface-2)] rounded space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Buffer Size</span>
                <span className="font-mono">{bufferSize}ms</span>
              </div>
              <input
                type="range"
                min={20}
                max={200}
                step={10}
                value={bufferSize}
                onChange={(e) => setBufferSize(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Network Jitter</span>
                <span className="font-mono">±{jitter}ms</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={jitter}
                onChange={(e) => setJitter(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Packet Loss</span>
                <span className="font-mono">{packetLoss}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={20}
                step={1}
                value={packetLoss}
                onChange={(e) => setPacketLoss(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          <div className="p-3 border border-[var(--border)] rounded text-sm">
            <p className="font-medium mb-1">Tradeoff</p>
            <p className="text-xs text-[var(--text-muted)]">
              Larger buffer = more latency but fewer glitches.
              For real-time avatars, target 50-100ms buffer with adaptive sizing
              based on measured jitter.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JitterBufferDemo;
