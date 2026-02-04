'use client';

import { useState, useRef, useEffect } from 'react';

export function BatchNormalizationDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [batchSize, setBatchSize] = useState(8);
  const [showBeforeNorm, setShowBeforeNorm] = useState(true);
  const [showAfterNorm, setShowAfterNorm] = useState(true);
  const [gamma, setGamma] = useState(1);
  const [beta, setBeta] = useState(0);
  const [animating, setAnimating] = useState(false);

  // Generate random batch data
  const [batchData, setBatchData] = useState<number[]>([]);

  useEffect(() => {
    // Generate data with different mean/variance
    const data: number[] = [];
    const mean = 50 + Math.random() * 40;
    const std = 15 + Math.random() * 20;

    for (let i = 0; i < batchSize; i++) {
      // Box-Muller transform for gaussian
      const u1 = Math.random();
      const u2 = Math.random();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      data.push(mean + z * std);
    }
    setBatchData(data);
  }, [batchSize]);

  // Calculate statistics
  const mean = batchData.reduce((a, b) => a + b, 0) / batchData.length || 0;
  const variance = batchData.reduce((a, b) => a + (b - mean) ** 2, 0) / batchData.length || 1;
  const std = Math.sqrt(variance);

  // Normalize data
  const normalizedData = batchData.map(x => {
    const normalized = (x - mean) / (std + 0.0001);
    return gamma * normalized + beta;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    // Distribution visualization area
    const distY = 60;
    const distHeight = 80;
    const beforeX = 50;
    const afterX = width / 2 + 30;
    const distWidth = width / 2 - 80;

    // Helper to draw distribution
    const drawDistribution = (
      data: number[],
      x: number,
      y: number,
      w: number,
      h: number,
      color: string,
      label: string,
      showStats: boolean
    ) => {
      // Find data range
      const min = Math.min(...data);
      const max = Math.max(...data);
      const range = max - min || 1;

      // Background
      ctx.fillStyle = 'rgba(40, 40, 60, 0.5)';
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = '#444466';
      ctx.strokeRect(x, y, w, h);

      // Draw histogram
      const bins = 10;
      const binCounts: number[] = new Array(bins).fill(0);

      data.forEach(val => {
        const binIdx = Math.min(Math.floor(((val - min) / range) * bins), bins - 1);
        binCounts[binIdx]++;
      });

      const maxCount = Math.max(...binCounts);
      const binWidth = w / bins;

      binCounts.forEach((count, i) => {
        const barHeight = (count / maxCount) * (h - 20);
        const barX = x + i * binWidth;
        const barY = y + h - barHeight - 10;

        ctx.fillStyle = color;
        ctx.fillRect(barX + 2, barY, binWidth - 4, barHeight);
      });

      // Draw individual points
      data.forEach((val, i) => {
        const px = x + ((val - min) / range) * w;
        const py = y + h - 15;

        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(label, x + w / 2, y - 8);

      // Stats
      if (showStats) {
        const dataMean = data.reduce((a, b) => a + b, 0) / data.length;
        const dataVar = data.reduce((a, b) => a + (b - dataMean) ** 2, 0) / data.length;
        const dataStd = Math.sqrt(dataVar);

        ctx.fillStyle = '#888888';
        ctx.font = '9px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`μ=${dataMean.toFixed(1)} σ=${dataStd.toFixed(1)}`, x + 5, y + h + 15);
      }

      // Axis labels
      ctx.fillStyle = '#666666';
      ctx.font = '8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(min.toFixed(0), x + 10, y + h + 25);
      ctx.fillText(max.toFixed(0), x + w - 10, y + h + 25);
    };

    // Draw before normalization
    if (showBeforeNorm && batchData.length > 0) {
      drawDistribution(batchData, beforeX, distY, distWidth, distHeight, '#ff6666', 'Before BatchNorm', true);
    }

    // Draw after normalization
    if (showAfterNorm && normalizedData.length > 0) {
      drawDistribution(normalizedData, afterX, distY, distWidth, distHeight, '#66ff66', 'After BatchNorm', true);
    }

    // Arrow between
    if (showBeforeNorm && showAfterNorm) {
      ctx.strokeStyle = '#888888';
      ctx.lineWidth = 2;
      const arrowX1 = beforeX + distWidth + 15;
      const arrowX2 = afterX - 15;
      const arrowY = distY + distHeight / 2;

      ctx.beginPath();
      ctx.moveTo(arrowX1, arrowY);
      ctx.lineTo(arrowX2, arrowY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(arrowX2, arrowY);
      ctx.lineTo(arrowX2 - 8, arrowY - 5);
      ctx.lineTo(arrowX2 - 8, arrowY + 5);
      ctx.closePath();
      ctx.fillStyle = '#888888';
      ctx.fill();
    }

    // Formula
    ctx.fillStyle = '#aaaaaa';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('x̂ = (x - μ) / σ', width / 4, height - 60);
    ctx.fillText(`y = γ·x̂ + β`, width * 3 / 4, height - 60);

    // Show gamma and beta values
    ctx.fillStyle = '#66aaff';
    ctx.fillText(`γ = ${gamma.toFixed(2)}`, width * 3 / 4 - 50, height - 40);
    ctx.fillStyle = '#ffaa66';
    ctx.fillText(`β = ${beta.toFixed(2)}`, width * 3 / 4 + 50, height - 40);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Batch Normalization', 10, 20);

    // Explanation
    ctx.fillStyle = '#888888';
    ctx.font = '10px monospace';
    ctx.fillText('Normalizes activations to zero mean, unit variance', 10, height - 15);

  }, [batchData, normalizedData, showBeforeNorm, showAfterNorm, gamma, beta]);

  const regenerate = () => {
    const data: number[] = [];
    const mean = 20 + Math.random() * 80;
    const std = 10 + Math.random() * 30;

    for (let i = 0; i < batchSize; i++) {
      const u1 = Math.random();
      const u2 = Math.random();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      data.push(mean + z * std);
    }
    setBatchData(data);
  };

  return (
    <div className="card p-6">
      <h3 className="font-semibold mb-2">Batch Normalization</h3>
      <p className="text-sm text-[var(--text-muted)] mb-4">
        BatchNorm normalizes layer inputs to stabilize training. See how it transforms the distribution of activations.
      </p>

      <canvas
        ref={canvasRef}
        width={550}
        height={220}
        className="w-full max-w-[550px] mb-4 rounded"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="text-xs text-[var(--text-muted)] block mb-1">Batch Size: {batchSize}</label>
          <input
            type="range"
            min="4"
            max="32"
            value={batchSize}
            onChange={(e) => setBatchSize(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="text-xs text-[var(--text-muted)] block mb-1">Gamma (γ): {gamma.toFixed(2)}</label>
          <input
            type="range"
            min="0.1"
            max="3"
            step="0.1"
            value={gamma}
            onChange={(e) => setGamma(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="text-xs text-[var(--text-muted)] block mb-1">Beta (β): {beta.toFixed(2)}</label>
          <input
            type="range"
            min="-2"
            max="2"
            step="0.1"
            value={beta}
            onChange={(e) => setBeta(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={regenerate}
            className="px-3 py-1.5 text-sm bg-[var(--surface-0)] border border-[var(--border)] rounded hover:border-[var(--border-strong)]"
          >
            New Batch
          </button>
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showBeforeNorm}
            onChange={(e) => setShowBeforeNorm(e.target.checked)}
          />
          Show before
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showAfterNorm}
            onChange={(e) => setShowAfterNorm(e.target.checked)}
          />
          Show after
        </label>
      </div>

      <div className="grid md:grid-cols-2 gap-3 text-xs">
        <div className="p-3 bg-[var(--surface-2)] rounded">
          <p className="font-medium mb-1">Training</p>
          <p className="text-[var(--text-muted)]">Uses batch statistics (μ, σ). Learnable γ and β allow the network to undo normalization if needed.</p>
        </div>
        <div className="p-3 bg-[var(--surface-2)] rounded">
          <p className="font-medium mb-1">Inference</p>
          <p className="text-[var(--text-muted)]">Uses running averages computed during training. No dependency on batch size at test time.</p>
        </div>
      </div>
    </div>
  );
}
