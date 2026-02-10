'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface PipelineStage {
  id: string;
  name: string;
  latency: { min: number; max: number };
  description: string;
  color: string;
  icon: string;
}

const STAGES: PipelineStage[] = [
  { id: 'mic', name: 'Mic', latency: { min: 0, max: 0 }, description: 'Capture audio', color: '#6bcb77', icon: '\uD83C\uDFA4' },
  { id: 'vad', name: 'VAD', latency: { min: 100, max: 300 }, description: 'Detect speech end', color: '#4ecdc4', icon: '\uD83D\uDCC8' },
  { id: 'stt', name: 'STT', latency: { min: 100, max: 400 }, description: 'Transcribe audio', color: '#45b7d1', icon: '\uD83D\uDCC4' },
  { id: 'llm', name: 'LLM', latency: { min: 150, max: 500 }, description: 'Generate response', color: '#96ceb4', icon: '\uD83E\uDDE0' },
  { id: 'tts', name: 'TTS', latency: { min: 100, max: 300 }, description: 'Synthesize speech', color: '#ffd93d', icon: '\uD83D\uDD0A' },
  { id: 'avatar', name: 'Avatar', latency: { min: 50, max: 200 }, description: 'Render face', color: '#ff6b6b', icon: '\uD83D\uDE42' },
  { id: 'stream', name: 'Stream', latency: { min: 30, max: 100 }, description: 'Deliver to user', color: '#c9b1ff', icon: '\uD83D\uDCE1' },
];

interface Packet {
  id: number;
  stage: number;
  stageProgress: number;
  stageLatencies: number[];
  elapsed: number;
  startTime: number;
}

export default function PipelineFlowDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [lastLatency, setLastLatency] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [showStreaming, setShowStreaming] = useState(true);

  const packetsRef = useRef<Packet[]>([]);
  const animRef = useRef<number | null>(null);
  const packetIdRef = useRef(0);
  const lastSpawnRef = useRef(0);
  const stageFlashRef = useRef<number[]>(new Array(STAGES.length).fill(0));

  const spawnPacket = useCallback(() => {
    const stageLatencies = STAGES.map(s =>
      s.latency.min + Math.random() * (s.latency.max - s.latency.min)
    );
    packetsRef.current.push({
      id: packetIdRef.current++,
      stage: 0,
      stageProgress: 0,
      stageLatencies,
      elapsed: 0,
      startTime: performance.now(),
    });
  }, []);

  // Animation loop — all canvas-based
  useEffect(() => {
    if (!isRunning) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }

    let prevTime = performance.now();

    const animate = (timestamp: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dt = (timestamp - prevTime) * speedMultiplier;
      prevTime = timestamp;

      const w = canvas.width;
      const h = canvas.height;

      // Auto-spawn
      if (timestamp - lastSpawnRef.current > 2200 / speedMultiplier) {
        if (packetsRef.current.length < 3) {
          spawnPacket();
          lastSpawnRef.current = timestamp;
        }
      }

      // Update packets
      const completed: Packet[] = [];
      packetsRef.current.forEach(pkt => {
        pkt.elapsed += dt;

        let cumTime = 0;
        let found = false;
        for (let i = 0; i < STAGES.length; i++) {
          const stageTime = pkt.stageLatencies[i];
          if (pkt.elapsed < cumTime + stageTime) {
            const prevStage = pkt.stage;
            pkt.stage = i;
            pkt.stageProgress = (pkt.elapsed - cumTime) / stageTime;

            // Flash on stage entry
            if (i !== prevStage) {
              stageFlashRef.current[i] = 1;
            }
            found = true;
            break;
          }
          cumTime += stageTime;
        }
        if (!found) {
          completed.push(pkt);
        }
      });

      // Remove completed
      if (completed.length > 0) {
        completed.forEach(pkt => {
          const total = pkt.stageLatencies.reduce((a, b) => a + b, 0);
          setLastLatency(Math.round(total));
          setCompletedCount(c => c + 1);
        });
        packetsRef.current = packetsRef.current.filter(
          p => !completed.includes(p)
        );
      }

      // Decay flash
      stageFlashRef.current = stageFlashRef.current.map(f => Math.max(0, f - 0.03));

      // --- DRAW ---
      // Background
      const bg = ctx.createLinearGradient(0, 0, w, 0);
      bg.addColorStop(0, '#121220');
      bg.addColorStop(1, '#0e0e1a');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Layout
      const stageCount = STAGES.length;
      const marginX = 40;
      const stageWidth = (w - marginX * 2) / stageCount;
      const pipelineY = h * 0.38;
      const boxW = 50;
      const boxH = 50;

      // Connection line
      const lineY = pipelineY;
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(marginX + stageWidth * 0.5, lineY);
      ctx.lineTo(marginX + stageWidth * (stageCount - 0.5), lineY);
      ctx.stroke();

      // Animated dashes on top
      const dashOff = (timestamp * 0.03) % 16;
      ctx.setLineDash([4, 8]);
      ctx.lineDashOffset = -dashOff;
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(marginX + stageWidth * 0.5, lineY);
      ctx.lineTo(marginX + stageWidth * (stageCount - 0.5), lineY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Directional arrows between stages
      for (let i = 0; i < stageCount - 1; i++) {
        const x1 = marginX + stageWidth * (i + 0.5) + boxW / 2 + 4;
        const x2 = marginX + stageWidth * (i + 1.5) - boxW / 2 - 4;
        const midX = (x1 + x2) / 2;

        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.beginPath();
        ctx.moveTo(midX + 5, lineY);
        ctx.lineTo(midX - 3, lineY - 4);
        ctx.lineTo(midX - 3, lineY + 4);
        ctx.closePath();
        ctx.fill();
      }

      // Stage boxes
      STAGES.forEach((stage, idx) => {
        const cx = marginX + stageWidth * (idx + 0.5);
        const bx = cx - boxW / 2;
        const by = lineY - boxH / 2;
        const flash = stageFlashRef.current[idx];
        const hasPacket = packetsRef.current.some(p => p.stage === idx);

        // Flash glow
        if (flash > 0) {
          const glow = ctx.createRadialGradient(cx, lineY, 0, cx, lineY, boxW);
          const c = stage.color;
          glow.addColorStop(0, `rgba(${parseInt(c.slice(1, 3), 16)},${parseInt(c.slice(3, 5), 16)},${parseInt(c.slice(5, 7), 16)},${flash * 0.4})`);
          glow.addColorStop(1, `rgba(${parseInt(c.slice(1, 3), 16)},${parseInt(c.slice(3, 5), 16)},${parseInt(c.slice(5, 7), 16)},0)`);
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(cx, lineY, boxW, 0, Math.PI * 2);
          ctx.fill();
        }

        // Box bg
        ctx.fillStyle = hasPacket
          ? `${stage.color}30`
          : 'rgba(30,30,50,0.8)';
        ctx.strokeStyle = hasPacket
          ? `${stage.color}90`
          : 'rgba(255,255,255,0.1)';
        ctx.lineWidth = hasPacket ? 2 : 1;

        // Rounded rect
        const r = 8;
        ctx.beginPath();
        ctx.moveTo(bx + r, by);
        ctx.lineTo(bx + boxW - r, by);
        ctx.quadraticCurveTo(bx + boxW, by, bx + boxW, by + r);
        ctx.lineTo(bx + boxW, by + boxH - r);
        ctx.quadraticCurveTo(bx + boxW, by + boxH, bx + boxW - r, by + boxH);
        ctx.lineTo(bx + r, by + boxH);
        ctx.quadraticCurveTo(bx, by + boxH, bx, by + boxH - r);
        ctx.lineTo(bx, by + r);
        ctx.quadraticCurveTo(bx, by, bx + r, by);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Icon
        ctx.font = '18px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = stage.color;
        ctx.fillText(stage.icon, cx, lineY - 4);

        // Label below box
        ctx.font = 'bold 10px sans-serif';
        ctx.fillStyle = '#e8e4dd';
        ctx.fillText(stage.name, cx, lineY + boxH / 2 + 14);

        // Latency below label
        if (stage.latency.max > 0) {
          ctx.font = '9px monospace';
          ctx.fillStyle = '#787268';
          ctx.fillText(`${stage.latency.min}-${stage.latency.max}ms`, cx, lineY + boxH / 2 + 26);
        }
      });

      // Draw packets as glowing dots
      packetsRef.current.forEach(pkt => {
        const stageX = marginX + stageWidth * (pkt.stage + 0.5);
        const nextX = pkt.stage < stageCount - 1
          ? marginX + stageWidth * (pkt.stage + 1.5)
          : stageX + stageWidth;

        const px = stageX + (nextX - stageX) * pkt.stageProgress;
        const py = lineY;

        const stageColor = STAGES[Math.min(pkt.stage, stageCount - 1)].color;
        const cr = parseInt(stageColor.slice(1, 3), 16);
        const cg = parseInt(stageColor.slice(3, 5), 16);
        const cb = parseInt(stageColor.slice(5, 7), 16);

        // Glow
        const glow = ctx.createRadialGradient(px, py, 0, px, py, 14);
        glow.addColorStop(0, `rgba(${cr},${cg},${cb},0.8)`);
        glow.addColorStop(0.5, `rgba(${cr},${cg},${cb},0.2)`);
        glow.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(px, py, 14, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      // Latency bar chart at bottom
      const barY = h * 0.72;
      const barH = h * 0.18;
      const totalMin = STAGES.slice(1).reduce((a, s) => a + s.latency.min, 0);
      const totalMax = STAGES.slice(1).reduce((a, s) => a + s.latency.max, 0);

      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.fillRect(marginX, barY - 4, w - marginX * 2, barH + 20);

      ctx.font = '9px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillStyle = '#787268';
      ctx.fillText('Latency Breakdown', marginX + 6, barY + 6);
      ctx.textAlign = 'right';
      ctx.fillText(`Total: ${totalMin}-${totalMax}ms`, w - marginX - 6, barY + 6);
      ctx.textAlign = 'center';

      // Gantt-style bars
      const ganttY = barY + 14;
      const ganttH = barH - 8;
      const ganttW = w - marginX * 2 - 12;
      let cumX = marginX + 6;

      STAGES.slice(1).forEach((stage, idx) => {
        const frac = stage.latency.max / totalMax;
        const segW = ganttW * frac;

        const cr = parseInt(stage.color.slice(1, 3), 16);
        const cg = parseInt(stage.color.slice(3, 5), 16);
        const cb = parseInt(stage.color.slice(5, 7), 16);

        ctx.fillStyle = `rgba(${cr},${cg},${cb},0.3)`;
        ctx.fillRect(cumX, ganttY, segW - 1, ganttH);

        // Range indicator
        const minFrac = stage.latency.min / stage.latency.max;
        ctx.fillStyle = `rgba(${cr},${cg},${cb},0.6)`;
        ctx.fillRect(cumX, ganttY, segW * minFrac - 1, ganttH);

        // Label
        if (segW > 30) {
          ctx.font = '8px sans-serif';
          ctx.fillStyle = '#e8e4dd';
          ctx.textAlign = 'center';
          ctx.fillText(stage.name, cumX + segW / 2, ganttY + ganttH / 2 + 3);
        }

        cumX += segW;
      });

      // Stats HUD
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(8, 8, 160, 36);
      ctx.font = '10px monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = '#c4713b';
      ctx.fillText(`Last E2E: ${lastLatency}ms`, 14, 22);
      ctx.fillStyle = '#787268';
      ctx.fillText(`Completed: ${completedCount}`, 14, 36);

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [isRunning, speedMultiplier, spawnPacket, lastLatency, completedCount, showStreaming]);

  const toggleRunning = () => {
    if (!isRunning && packetsRef.current.length === 0) {
      spawnPacket();
    }
    setIsRunning(!isRunning);
  };

  const reset = () => {
    setIsRunning(false);
    packetsRef.current = [];
    stageFlashRef.current = new Array(STAGES.length).fill(0);
    setLastLatency(0);
    setCompletedCount(0);
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
            className="px-3 py-1 text-xs bg-[var(--surface-2)] rounded hover:bg-[var(--border)] disabled:opacity-50"
          >
            Send
          </button>
          <button
            onClick={reset}
            className="px-3 py-1 text-xs bg-[var(--surface-2)] rounded hover:bg-[var(--border)]"
          >
            Reset
          </button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={700}
        height={320}
        className="w-full rounded-lg border border-[var(--border)]"
      />

      <div className="grid md:grid-cols-3 gap-4 mt-4">
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

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="streaming-mode"
            checked={showStreaming}
            onChange={(e) => setShowStreaming(e.target.checked)}
            className="rounded"
          />
          <label htmlFor="streaming-mode" className="text-sm">
            Streaming Mode
          </label>
        </div>

        <div className="text-sm text-[var(--text-muted)]">
          <p>Last latency: <span className="text-[var(--foreground)]">{lastLatency}ms</span></p>
          <p>Completed: <span className="text-[var(--foreground)]">{completedCount}</span></p>
        </div>
      </div>

      <p className="text-xs text-[var(--text-muted)] mt-4">
        Watch data packets flow through the voice AI pipeline. Each stage adds latency.
        Total E2E: {STAGES.slice(1).reduce((a, s) => a + s.latency.min, 0)}-
        {STAGES.slice(1).reduce((a, s) => a + s.latency.max, 0)}ms.
      </p>
    </div>
  );
}
