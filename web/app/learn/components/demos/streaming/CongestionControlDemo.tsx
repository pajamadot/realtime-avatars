'use client';

import { useState, useRef, useEffect } from 'react';

interface DataPoint {
  time: number;
  bandwidth: number;
  sendRate: number;
  bufferLevel: number;
}

export function CongestionControlDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [algorithm, setAlgorithm] = useState<'tcp' | 'gcc' | 'bbr'>('gcc');
  const [networkCondition, setNetworkCondition] = useState<'stable' | 'fluctuating' | 'congested'>('stable');
  const [dataHistory, setDataHistory] = useState<DataPoint[]>([]);
  const timeRef = useRef(0);
  const animationRef = useRef<number | null>(null);

  // State for congestion control algorithms
  const stateRef = useRef({
    cwnd: 10,  // Congestion window
    ssthresh: 64, // Slow start threshold
    rtt: 50,
    bbrState: 'startup' as 'startup' | 'drain' | 'probe_bw',
    gccRate: 500,
    lastLoss: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reset state when algorithm changes
    stateRef.current = {
      cwnd: 10,
      ssthresh: 64,
      rtt: 50,
      bbrState: 'startup',
      gccRate: 500,
      lastLoss: 0,
    };
    setDataHistory([]);
    timeRef.current = 0;

    const simulate = () => {
      timeRef.current += 0.05;
      const time = timeRef.current;
      const state = stateRef.current;

      // Simulate available bandwidth based on network condition
      let availableBandwidth: number;
      if (networkCondition === 'stable') {
        availableBandwidth = 800 + Math.sin(time * 0.5) * 50;
      } else if (networkCondition === 'fluctuating') {
        availableBandwidth = 600 + Math.sin(time * 2) * 300 + Math.sin(time * 5) * 100;
      } else {
        availableBandwidth = 400 + Math.sin(time * 0.3) * 100 - Math.abs(Math.sin(time)) * 200;
      }
      availableBandwidth = Math.max(100, availableBandwidth);

      // Simulate packet loss
      const hasLoss = Math.random() < 0.02 || (stateRef.current.cwnd > availableBandwidth / 10);

      let sendRate: number = state.gccRate;

      switch (algorithm) {
        case 'tcp':
          // TCP Reno-like behavior
          if (hasLoss) {
            state.ssthresh = Math.max(state.cwnd / 2, 2);
            state.cwnd = state.ssthresh;
            state.lastLoss = time;
          } else if (state.cwnd < state.ssthresh) {
            // Slow start: exponential growth
            state.cwnd *= 1.1;
          } else {
            // Congestion avoidance: linear growth
            state.cwnd += 0.1;
          }
          sendRate = state.cwnd * 10;
          break;

        case 'gcc':
          // Google Congestion Control (simplified)
          const delay = state.rtt + (state.gccRate > availableBandwidth ? 20 : 0);

          if (delay > 60) {
            // Delay increasing - reduce rate
            state.gccRate *= 0.95;
          } else if (delay < 40 && state.gccRate < availableBandwidth) {
            // Low delay - can increase
            state.gccRate *= 1.05;
          }

          if (hasLoss) {
            state.gccRate *= 0.85;
          }

          state.gccRate = Math.max(100, Math.min(1000, state.gccRate));
          sendRate = state.gccRate;
          break;

        case 'bbr':
          // BBR-like behavior (simplified)
          const btlBw = availableBandwidth;

          switch (state.bbrState) {
            case 'startup':
              state.cwnd *= 1.25;
              if (state.cwnd >= btlBw / 5) {
                state.bbrState = 'drain';
              }
              break;
            case 'drain':
              state.cwnd *= 0.75;
              if (state.cwnd <= btlBw / 10) {
                state.bbrState = 'probe_bw';
              }
              break;
            case 'probe_bw':
              // Cycle through probing phases
              const phase = Math.floor(time * 2) % 8;
              if (phase === 0) {
                state.cwnd = btlBw / 8 * 1.25;
              } else if (phase === 1) {
                state.cwnd = btlBw / 8 * 0.75;
              } else {
                state.cwnd = btlBw / 8;
              }
              break;
          }
          sendRate = state.cwnd * 10;
          break;

        default:
          sendRate = 500;
      }

      // Calculate buffer level
      const bufferLevel = Math.max(0, sendRate - availableBandwidth) / 10;

      // Store data point
      const newPoint: DataPoint = {
        time,
        bandwidth: availableBandwidth,
        sendRate: Math.min(sendRate, 1000),
        bufferLevel: Math.min(bufferLevel, 100),
      };

      setDataHistory(prev => {
        const updated = [...prev, newPoint];
        // Keep last 100 points
        if (updated.length > 100) {
          return updated.slice(-100);
        }
        return updated;
      });

      render(ctx, canvas.width, canvas.height);
      animationRef.current = requestAnimationFrame(simulate);
    };

    const render = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, width, height);

      const graphX = 50;
      const graphY = 30;
      const graphWidth = width - 70;
      const graphHeight = height - 80;

      // Draw axes
      ctx.strokeStyle = '#444466';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(graphX, graphY);
      ctx.lineTo(graphX, graphY + graphHeight);
      ctx.lineTo(graphX + graphWidth, graphY + graphHeight);
      ctx.stroke();

      // Y-axis labels
      ctx.fillStyle = '#666666';
      ctx.font = '9px monospace';
      ctx.textAlign = 'right';
      ctx.fillText('1000', graphX - 5, graphY + 5);
      ctx.fillText('500', graphX - 5, graphY + graphHeight / 2);
      ctx.fillText('0', graphX - 5, graphY + graphHeight);
      ctx.textAlign = 'left';
      ctx.fillText('kbps', graphX - 5, graphY - 10);

      if (dataHistory.length < 2) return;

      const maxTime = dataHistory[dataHistory.length - 1].time;
      const minTime = Math.max(0, maxTime - 5);
      const timeRange = maxTime - minTime || 1;

      // Draw bandwidth (available)
      ctx.strokeStyle = '#66ff66';
      ctx.lineWidth = 2;
      ctx.beginPath();
      dataHistory.forEach((point, i) => {
        if (point.time < minTime) return;
        const x = graphX + ((point.time - minTime) / timeRange) * graphWidth;
        const y = graphY + graphHeight - (point.bandwidth / 1000) * graphHeight;
        if (i === 0 || dataHistory[i - 1].time < minTime) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();

      // Draw send rate
      ctx.strokeStyle = '#66aaff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      dataHistory.forEach((point, i) => {
        if (point.time < minTime) return;
        const x = graphX + ((point.time - minTime) / timeRange) * graphWidth;
        const y = graphY + graphHeight - (point.sendRate / 1000) * graphHeight;
        if (i === 0 || dataHistory[i - 1].time < minTime) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();

      // Legend
      const legendY = height - 25;
      ctx.fillStyle = '#66ff66';
      ctx.fillRect(graphX, legendY, 15, 3);
      ctx.fillStyle = '#888888';
      ctx.font = '10px monospace';
      ctx.fillText('Available BW', graphX + 20, legendY + 4);

      ctx.fillStyle = '#66aaff';
      ctx.fillRect(graphX + 120, legendY, 15, 3);
      ctx.fillStyle = '#888888';
      ctx.fillText('Send Rate', graphX + 140, legendY + 4);

      // Algorithm state
      const state = stateRef.current;
      ctx.fillStyle = '#aaaaaa';
      ctx.textAlign = 'right';
      ctx.font = '10px monospace';

      if (algorithm === 'tcp') {
        ctx.fillText(`cwnd: ${state.cwnd.toFixed(0)}`, width - 10, 20);
        ctx.fillText(`ssthresh: ${state.ssthresh.toFixed(0)}`, width - 10, 35);
      } else if (algorithm === 'gcc') {
        ctx.fillText(`rate: ${state.gccRate.toFixed(0)}`, width - 10, 20);
      } else if (algorithm === 'bbr') {
        ctx.fillText(`state: ${state.bbrState}`, width - 10, 20);
        ctx.fillText(`cwnd: ${state.cwnd.toFixed(0)}`, width - 10, 35);
      }
    };

    simulate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [algorithm, networkCondition]);

  return (
    <div className="card p-6">
      <h3 className="font-semibold mb-2">Congestion Control</h3>
      <p className="text-sm text-[var(--muted)] mb-4">
        Congestion control adapts send rate to network conditions. Compare TCP, GCC (WebRTC), and BBR algorithms.
      </p>

      <canvas
        ref={canvasRef}
        width={550}
        height={250}
        className="w-full max-w-[550px] mb-4 rounded"
      />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="text-xs text-[var(--muted)] block mb-1">Algorithm</label>
          <select
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value as typeof algorithm)}
            className="w-full px-2 py-1 rounded bg-[var(--card-bg)] border border-[var(--border)] text-sm"
          >
            <option value="tcp">TCP Reno</option>
            <option value="gcc">GCC (WebRTC)</option>
            <option value="bbr">BBR</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-[var(--muted)] block mb-1">Network</label>
          <select
            value={networkCondition}
            onChange={(e) => setNetworkCondition(e.target.value as typeof networkCondition)}
            className="w-full px-2 py-1 rounded bg-[var(--card-bg)] border border-[var(--border)] text-sm"
          >
            <option value="stable">Stable</option>
            <option value="fluctuating">Fluctuating</option>
            <option value="congested">Congested</option>
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-3 text-xs">
        <div className="p-3 bg-[var(--card-bg-alt)] rounded">
          <p className="font-medium mb-1">TCP Reno</p>
          <p className="text-[var(--muted)]">Loss-based. Slow start + AIMD. Reactive to packet loss.</p>
        </div>
        <div className="p-3 bg-[var(--card-bg-alt)] rounded">
          <p className="font-medium mb-1">GCC</p>
          <p className="text-[var(--muted)]">Delay-based. Used in WebRTC. Proactive, detects congestion early.</p>
        </div>
        <div className="p-3 bg-[var(--card-bg-alt)] rounded">
          <p className="font-medium mb-1">BBR</p>
          <p className="text-[var(--muted)]">Model-based. Estimates bottleneck bandwidth. Best for long RTT.</p>
        </div>
      </div>
    </div>
  );
}
