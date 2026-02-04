'use client';

import { useState, useEffect, useRef } from 'react';

interface TrainingState {
  iteration: number;
  numGaussians: number;
  psnr: number;
  loss: number;
  densifications: number;
  prunings: number;
}

const TRAINING_MILESTONES = [
  { iter: 0, gaussians: 100000, psnr: 15, loss: 0.5, event: 'Initial SfM points' },
  { iter: 500, gaussians: 120000, psnr: 20, loss: 0.3, event: 'Early optimization' },
  { iter: 1000, gaussians: 180000, psnr: 24, loss: 0.15, event: 'First densification' },
  { iter: 3000, gaussians: 350000, psnr: 28, loss: 0.08, event: 'Rapid growth phase' },
  { iter: 7000, gaussians: 500000, psnr: 31, loss: 0.04, event: 'Densification slowing' },
  { iter: 15000, gaussians: 450000, psnr: 33, loss: 0.02, event: 'Pruning small Gaussians' },
  { iter: 30000, gaussians: 400000, psnr: 34.5, loss: 0.01, event: 'Convergence' },
];

export function TrainingProgressDemo() {
  const [currentIter, setCurrentIter] = useState(0);
  const [isTraining, setIsTraining] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [history, setHistory] = useState<TrainingState[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  // Interpolate state from milestones
  const getStateAtIteration = (iter: number): TrainingState => {
    const maxIter = TRAINING_MILESTONES[TRAINING_MILESTONES.length - 1].iter;
    const clampedIter = Math.min(iter, maxIter);

    let lower = TRAINING_MILESTONES[0];
    let upper = TRAINING_MILESTONES[TRAINING_MILESTONES.length - 1];

    for (let i = 0; i < TRAINING_MILESTONES.length - 1; i++) {
      if (clampedIter >= TRAINING_MILESTONES[i].iter && clampedIter < TRAINING_MILESTONES[i + 1].iter) {
        lower = TRAINING_MILESTONES[i];
        upper = TRAINING_MILESTONES[i + 1];
        break;
      }
    }

    const t = (clampedIter - lower.iter) / (upper.iter - lower.iter || 1);

    return {
      iteration: clampedIter,
      numGaussians: Math.round(lower.gaussians + (upper.gaussians - lower.gaussians) * t),
      psnr: lower.psnr + (upper.psnr - lower.psnr) * t,
      loss: lower.loss + (upper.loss - lower.loss) * t,
      densifications: TRAINING_MILESTONES.filter(m => m.iter <= clampedIter && m.event.includes('densification')).length,
      prunings: TRAINING_MILESTONES.filter(m => m.iter <= clampedIter && m.event.includes('Pruning')).length,
    };
  };

  // Animation loop
  useEffect(() => {
    if (!isTraining) return;

    const maxIter = TRAINING_MILESTONES[TRAINING_MILESTONES.length - 1].iter;
    let lastTime = performance.now();

    const animate = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;

      setCurrentIter(prev => {
        const next = prev + delta * speed * 10;
        if (next >= maxIter) {
          setIsTraining(false);
          return maxIter;
        }
        return next;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isTraining, speed]);

  // Update history
  useEffect(() => {
    const state = getStateAtIteration(currentIter);
    setHistory(prev => {
      const newHistory = [...prev, state];
      // Keep last 100 points
      return newHistory.slice(-100);
    });
  }, [Math.floor(currentIter / 300)]); // Sample every 300 iterations

  // Render charts
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = (height - padding * 3) / 2;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    const maxIter = TRAINING_MILESTONES[TRAINING_MILESTONES.length - 1].iter;

    // Draw PSNR chart
    const drawChart = (
      data: { x: number; y: number }[],
      yMin: number,
      yMax: number,
      color: string,
      label: string,
      offsetY: number
    ) => {
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1;

      // Grid
      for (let i = 0; i <= 4; i++) {
        const y = offsetY + chartHeight - (i / 4) * chartHeight;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(padding + chartWidth, y);
        ctx.stroke();

        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText((yMin + (yMax - yMin) * (i / 4)).toFixed(1), padding - 5, y + 3);
      }

      // Data line
      if (data.length > 1) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();

        data.forEach((point, i) => {
          const x = padding + (point.x / maxIter) * chartWidth;
          const y = offsetY + chartHeight - ((point.y - yMin) / (yMax - yMin)) * chartHeight;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });

        ctx.stroke();
      }

      // Current position marker
      const currentState = getStateAtIteration(currentIter);
      const currentY = label === 'PSNR' ? currentState.psnr : currentState.numGaussians / 1000;
      const markerX = padding + (currentIter / maxIter) * chartWidth;
      const markerY = offsetY + chartHeight - ((currentY - yMin) / (yMax - yMin)) * chartHeight;

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(markerX, markerY, 5, 0, Math.PI * 2);
      ctx.fill();

      // Label
      ctx.fillStyle = color;
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(label, padding, offsetY - 5);
    };

    // PSNR chart
    const psnrData = history.map(h => ({ x: h.iteration, y: h.psnr }));
    drawChart(psnrData, 10, 40, '#4ecdc4', 'PSNR (dB)', padding);

    // Gaussian count chart
    const gaussianData = history.map(h => ({ x: h.iteration, y: h.numGaussians / 1000 }));
    drawChart(gaussianData, 0, 600, '#ff6b6b', 'Gaussians (K)', padding + chartHeight + padding);

    // Current iteration line
    const iterX = padding + (currentIter / maxIter) * chartWidth;
    ctx.strokeStyle = 'rgba(255, 217, 61, 0.5)';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(iterX, padding);
    ctx.lineTo(iterX, height - padding);
    ctx.stroke();
    ctx.setLineDash([]);

    // X-axis label
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Iterations', width / 2, height - 5);

  }, [currentIter, history]);

  const state = getStateAtIteration(currentIter);
  const maxIter = TRAINING_MILESTONES[TRAINING_MILESTONES.length - 1].iter;

  // Find current event
  const currentEvent = [...TRAINING_MILESTONES].reverse().find(m => currentIter >= m.iter)?.event || '';

  return (
    <div className="card p-6">
      <h3 className="font-semibold mb-2">3DGS Training Progress</h3>
      <p className="text-sm text-[var(--text-muted)] mb-6">
        Watch how Gaussian Splatting training evolves: Gaussians multiply through densification,
        then get pruned for efficiency. PSNR (quality) improves as loss decreases.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Charts */}
        <div>
          <canvas
            ref={canvasRef}
            width={400}
            height={300}
            className="w-full rounded-lg border border-[var(--border)]"
          />

          {/* Timeline */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-[var(--text-muted)] mb-1">
              <span>0</span>
              <span>{(currentIter / 1000).toFixed(1)}K</span>
              <span>{(maxIter / 1000)}K iterations</span>
            </div>
            <input
              type="range"
              min={0}
              max={maxIter}
              value={currentIter}
              onChange={(e) => {
                setIsTraining(false);
                setCurrentIter(Number(e.target.value));
              }}
              className="w-full"
            />
          </div>

          {/* Controls */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setIsTraining(!isTraining)}
              className={`flex-1 py-2 rounded font-medium text-sm transition-colors ${
                isTraining
                  ? 'bg-red-500 text-white'
                  : 'bg-[var(--accent)] text-white'
              }`}
            >
              {isTraining ? 'Pause' : 'Train'}
            </button>
            <button
              onClick={() => {
                setCurrentIter(0);
                setHistory([]);
                setIsTraining(false);
              }}
              className="flex-1 badge hover:border-[var(--border-strong)] justify-center"
            >
              Reset
            </button>
            <select
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="px-3 py-1 rounded border border-[var(--border)] bg-[var(--surface-0)] text-sm"
            >
              <option value={0.5}>0.5x</option>
              <option value={1}>1x</option>
              <option value={2}>2x</option>
              <option value={5}>5x</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-4">
          {/* Current metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-[var(--surface-2)] rounded">
              <p className="text-xs text-[var(--text-muted)]">PSNR</p>
              <p className="text-xl font-bold text-[#4ecdc4]">{state.psnr.toFixed(1)} dB</p>
            </div>
            <div className="p-3 bg-[var(--surface-2)] rounded">
              <p className="text-xs text-[var(--text-muted)]">Loss</p>
              <p className="text-xl font-bold">{state.loss.toFixed(4)}</p>
            </div>
            <div className="p-3 bg-[var(--surface-2)] rounded">
              <p className="text-xs text-[var(--text-muted)]">Gaussians</p>
              <p className="text-xl font-bold text-[#ff6b6b]">{(state.numGaussians / 1000).toFixed(0)}K</p>
            </div>
            <div className="p-3 bg-[var(--surface-2)] rounded">
              <p className="text-xs text-[var(--text-muted)]">Progress</p>
              <p className="text-xl font-bold">{((currentIter / maxIter) * 100).toFixed(0)}%</p>
            </div>
          </div>

          {/* Current event */}
          <div className="p-3 bg-[var(--accent)]/20 rounded border border-[var(--accent)]/30">
            <p className="text-xs text-[var(--text-muted)]">Current Phase</p>
            <p className="font-medium">{currentEvent}</p>
          </div>

          {/* Training milestones */}
          <div className="p-4 bg-[var(--surface-2)] rounded max-h-48 overflow-y-auto">
            <p className="font-medium text-sm mb-3">Training Milestones</p>
            <div className="space-y-2">
              {TRAINING_MILESTONES.map((milestone, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 text-xs ${
                    currentIter >= milestone.iter ? 'opacity-100' : 'opacity-40'
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      currentIter >= milestone.iter ? 'bg-[#4ecdc4]' : 'bg-[var(--border)]'
                    }`}
                  />
                  <span className="font-mono w-12">{(milestone.iter / 1000)}K</span>
                  <span className="text-[var(--text-muted)]">{milestone.event}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key insight */}
          <div className="p-3 border border-[var(--border)] rounded text-sm">
            <p className="font-medium mb-1">Key Insight</p>
            <p className="text-xs text-[var(--text-muted)]">
              Gaussian count peaks mid-training due to densification (splitting large gradients),
              then decreases as tiny/transparent Gaussians get pruned. Quality keeps improving
              even as count drops.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrainingProgressDemo;
