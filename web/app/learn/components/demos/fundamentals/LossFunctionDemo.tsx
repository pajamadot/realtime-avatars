'use client';

import { useState, useRef, useEffect } from 'react';

type LossType = 'mse' | 'mae' | 'bce' | 'huber';

export function LossFunctionDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [lossType, setLossType] = useState<LossType>('mse');
  const [prediction, setPrediction] = useState(0.3);
  const [target, setTarget] = useState(0.7);
  const [huberDelta, setHuberDelta] = useState(1);

  // Calculate loss values
  const calculateLoss = (pred: number, tgt: number, type: LossType): number => {
    const diff = pred - tgt;

    switch (type) {
      case 'mse':
        return diff * diff;
      case 'mae':
        return Math.abs(diff);
      case 'bce':
        // Binary cross-entropy (clamp to avoid log(0))
        const p = Math.max(0.001, Math.min(0.999, pred));
        const t = Math.max(0.001, Math.min(0.999, tgt));
        return -(t * Math.log(p) + (1 - t) * Math.log(1 - p));
      case 'huber':
        const absDiff = Math.abs(diff);
        if (absDiff <= huberDelta) {
          return 0.5 * diff * diff;
        } else {
          return huberDelta * (absDiff - 0.5 * huberDelta);
        }
      default:
        return 0;
    }
  };

  const currentLoss = calculateLoss(prediction, target, lossType);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    // Graph area
    const graphX = 60;
    const graphY = 40;
    const graphWidth = width - 100;
    const graphHeight = height - 100;

    // Draw axes
    ctx.strokeStyle = '#444466';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(graphX, graphY);
    ctx.lineTo(graphX, graphY + graphHeight);
    ctx.lineTo(graphX + graphWidth, graphY + graphHeight);
    ctx.stroke();

    // Axis labels
    ctx.fillStyle = '#888888';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Prediction', graphX + graphWidth / 2, height - 15);
    ctx.save();
    ctx.translate(15, graphY + graphHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Loss', 0, 0);
    ctx.restore();

    // Draw loss curve
    ctx.beginPath();
    let maxLoss = 0;

    // First pass to find max loss for scaling
    for (let i = 0; i <= 100; i++) {
      const p = i / 100;
      const loss = calculateLoss(p, target, lossType);
      maxLoss = Math.max(maxLoss, loss);
    }
    maxLoss = Math.max(maxLoss, 0.1); // Minimum scale

    // Draw the curve
    const colors: Record<LossType, string> = {
      mse: '#66aaff',
      mae: '#66ff66',
      bce: '#ff66aa',
      huber: '#ffaa66',
    };

    ctx.strokeStyle = colors[lossType];
    ctx.lineWidth = 2;

    for (let i = 0; i <= 100; i++) {
      const p = i / 100;
      const loss = calculateLoss(p, target, lossType);

      const x = graphX + (p * graphWidth);
      const y = graphY + graphHeight - (loss / maxLoss) * graphHeight;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // Draw target line
    ctx.strokeStyle = '#66ff66';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    const targetX = graphX + target * graphWidth;
    ctx.beginPath();
    ctx.moveTo(targetX, graphY);
    ctx.lineTo(targetX, graphY + graphHeight);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#66ff66';
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Target', targetX, graphY - 5);

    // Draw current prediction point
    const predX = graphX + prediction * graphWidth;
    const predY = graphY + graphHeight - (currentLoss / maxLoss) * graphHeight;

    ctx.beginPath();
    ctx.arc(predX, predY, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#ff6666';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw error line
    ctx.strokeStyle = 'rgba(255, 100, 100, 0.5)';
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(predX, graphY + graphHeight);
    ctx.lineTo(predX, predY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Y-axis scale
    ctx.fillStyle = '#666666';
    ctx.font = '9px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('0', graphX - 5, graphY + graphHeight + 4);
    ctx.fillText(maxLoss.toFixed(2), graphX - 5, graphY + 4);

    // X-axis scale
    ctx.textAlign = 'center';
    ctx.fillText('0', graphX, graphY + graphHeight + 15);
    ctx.fillText('1', graphX + graphWidth, graphY + graphHeight + 15);

    // Loss value display
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`Loss: ${currentLoss.toFixed(4)}`, width - 120, 25);

    // Formula display
    ctx.fillStyle = '#888888';
    ctx.font = '10px monospace';
    const formulas: Record<LossType, string> = {
      mse: 'MSE = (pred - target)²',
      mae: 'MAE = |pred - target|',
      bce: 'BCE = -[t·log(p) + (1-t)·log(1-p)]',
      huber: `Huber(δ=${huberDelta}) = 0.5x² if |x|≤δ`,
    };
    ctx.fillText(formulas[lossType], 10, height - 5);

  }, [lossType, prediction, target, huberDelta, currentLoss]);

  return (
    <div className="card p-6">
      <h3 className="font-semibold mb-2">Loss Functions</h3>
      <p className="text-sm text-[var(--text-muted)] mb-4">
        Loss functions measure how wrong predictions are. Different losses have different properties for training.
      </p>

      <canvas
        ref={canvasRef}
        width={500}
        height={280}
        className="w-full max-w-[500px] mb-4 rounded"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="text-xs text-[var(--text-muted)] block mb-1">Loss Function</label>
          <select
            value={lossType}
            onChange={(e) => setLossType(e.target.value as LossType)}
            className="w-full px-2 py-1 rounded bg-[var(--surface-0)] border border-[var(--border)] text-sm"
          >
            <option value="mse">MSE (L2)</option>
            <option value="mae">MAE (L1)</option>
            <option value="bce">Binary Cross-Entropy</option>
            <option value="huber">Huber Loss</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-[var(--text-muted)] block mb-1">Prediction: {prediction.toFixed(2)}</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={prediction}
            onChange={(e) => setPrediction(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="text-xs text-[var(--text-muted)] block mb-1">Target: {target.toFixed(2)}</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={target}
            onChange={(e) => setTarget(Number(e.target.value))}
            className="w-full"
          />
        </div>
        {lossType === 'huber' && (
          <div>
            <label className="text-xs text-[var(--text-muted)] block mb-1">Huber δ: {huberDelta.toFixed(1)}</label>
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              value={huberDelta}
              onChange={(e) => setHuberDelta(Number(e.target.value))}
              className="w-full"
            />
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-3 text-xs">
        <div className="p-3 bg-[var(--surface-2)] rounded">
          <p className="font-medium mb-1">MSE vs MAE</p>
          <p className="text-[var(--text-muted)]">MSE penalizes large errors more heavily (quadratic). MAE is more robust to outliers (linear).</p>
        </div>
        <div className="p-3 bg-[var(--surface-2)] rounded">
          <p className="font-medium mb-1">Huber Loss</p>
          <p className="text-[var(--text-muted)]">Combines MSE and MAE: quadratic for small errors, linear for large ones. Best of both worlds.</p>
        </div>
      </div>
    </div>
  );
}
