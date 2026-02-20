'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

interface Gaussian2D {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  color: [number, number, number];
  opacity: number;
}

type GradientKey = 'x' | 'y' | 'scaleX' | 'scaleY' | 'rotation' | 'opacity';
type GradientVector = Record<GradientKey, number>;

interface ForwardPass {
  g: number;
  loss: number;
  predictedColor: [number, number, number];
  predictedNorm: [number, number, number];
  rx: number;
  ry: number;
  dx: number;
  dy: number;
  cos: number;
  sin: number;
}

const INITIAL_GAUSSIAN: Gaussian2D = {
  x: 150,
  y: 150,
  scaleX: 42,
  scaleY: 26,
  rotation: 0.32,
  color: [100, 150, 255],
  opacity: 0.82,
};

const INITIAL_TARGET_PIXEL = { x: 186, y: 128 };
const INITIAL_TARGET_COLOR: [number, number, number] = [255, 100, 100];

const INITIAL_GRADIENTS: GradientVector = {
  x: 0,
  y: 0,
  scaleX: 0,
  scaleY: 0,
  rotation: 0,
  opacity: 0,
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function wrapAngle(angle: number) {
  const twoPi = Math.PI * 2;
  let wrapped = angle % twoPi;
  if (wrapped > Math.PI) wrapped -= twoPi;
  if (wrapped < -Math.PI) wrapped += twoPi;
  return wrapped;
}

function runForwardPass(gaussian: Gaussian2D, targetPixel: { x: number; y: number }, targetColor: [number, number, number]): ForwardPass {
  const dx = targetPixel.x - gaussian.x;
  const dy = targetPixel.y - gaussian.y;
  const cos = Math.cos(gaussian.rotation);
  const sin = Math.sin(gaussian.rotation);

  // Transform point to Gaussian local coordinates.
  const rx = cos * dx + sin * dy;
  const ry = -sin * dx + cos * dy;

  const invSx2 = 1 / (gaussian.scaleX * gaussian.scaleX);
  const invSy2 = 1 / (gaussian.scaleY * gaussian.scaleY);
  const exponent = -0.5 * (rx * rx * invSx2 + ry * ry * invSy2);
  const g = Math.exp(exponent);

  const predictedNorm: [number, number, number] = [
    (gaussian.color[0] / 255) * gaussian.opacity * g,
    (gaussian.color[1] / 255) * gaussian.opacity * g,
    (gaussian.color[2] / 255) * gaussian.opacity * g,
  ];

  const targetNorm: [number, number, number] = [
    targetColor[0] / 255,
    targetColor[1] / 255,
    targetColor[2] / 255,
  ];

  // Mean squared error.
  const loss =
    ((predictedNorm[0] - targetNorm[0]) ** 2 +
      (predictedNorm[1] - targetNorm[1]) ** 2 +
      (predictedNorm[2] - targetNorm[2]) ** 2) /
    3;

  const predictedColor: [number, number, number] = [
    clamp(predictedNorm[0] * 255, 0, 255),
    clamp(predictedNorm[1] * 255, 0, 255),
    clamp(predictedNorm[2] * 255, 0, 255),
  ];

  return {
    g,
    loss,
    predictedColor,
    predictedNorm,
    rx,
    ry,
    dx,
    dy,
    cos,
    sin,
  };
}

function computeAnalyticGradients(
  gaussian: Gaussian2D,
  targetPixel: { x: number; y: number },
  targetColor: [number, number, number],
  forward: ForwardPass
): GradientVector {
  const targetNorm: [number, number, number] = [
    targetColor[0] / 255,
    targetColor[1] / 255,
    targetColor[2] / 255,
  ];

  const dLdPred: [number, number, number] = [
    (2 * (forward.predictedNorm[0] - targetNorm[0])) / 3,
    (2 * (forward.predictedNorm[1] - targetNorm[1])) / 3,
    (2 * (forward.predictedNorm[2] - targetNorm[2])) / 3,
  ];

  const dLdG =
    dLdPred[0] * (gaussian.color[0] / 255) * gaussian.opacity +
    dLdPred[1] * (gaussian.color[1] / 255) * gaussian.opacity +
    dLdPred[2] * (gaussian.color[2] / 255) * gaussian.opacity;

  const invSx2 = 1 / (gaussian.scaleX * gaussian.scaleX);
  const invSy2 = 1 / (gaussian.scaleY * gaussian.scaleY);

  const dGdRx = -forward.g * forward.rx * invSx2;
  const dGdRy = -forward.g * forward.ry * invSy2;

  // Chain through dx/dy and center position.
  const dGdDx = dGdRx * forward.cos - dGdRy * forward.sin;
  const dGdDy = dGdRx * forward.sin + dGdRy * forward.cos;
  const dGdX = -dGdDx;
  const dGdY = -dGdDy;

  // Scale derivatives from exponent term.
  const dGdScaleX = forward.g * (forward.rx * forward.rx) / (gaussian.scaleX ** 3);
  const dGdScaleY = forward.g * (forward.ry * forward.ry) / (gaussian.scaleY ** 3);

  // Rotation derivative (through rx, ry).
  const dGdRotation =
    -forward.g *
    forward.rx *
    forward.ry *
    (1 / (gaussian.scaleX * gaussian.scaleX) - 1 / (gaussian.scaleY * gaussian.scaleY));

  const dLdOpacity =
    dLdPred[0] * (gaussian.color[0] / 255) * forward.g +
    dLdPred[1] * (gaussian.color[1] / 255) * forward.g +
    dLdPred[2] * (gaussian.color[2] / 255) * forward.g;

  return {
    x: dLdG * dGdX,
    y: dLdG * dGdY,
    scaleX: dLdG * dGdScaleX,
    scaleY: dLdG * dGdScaleY,
    rotation: dLdG * dGdRotation,
    opacity: dLdOpacity,
  };
}

function withParam(gaussian: Gaussian2D, key: GradientKey, value: number): Gaussian2D {
  return {
    ...gaussian,
    [key]: value,
  };
}

function computeNumericalGradients(
  gaussian: Gaussian2D,
  targetPixel: { x: number; y: number },
  targetColor: [number, number, number]
): GradientVector {
  const eps: Record<GradientKey, number> = {
    x: 0.2,
    y: 0.2,
    scaleX: 0.2,
    scaleY: 0.2,
    rotation: 0.003,
    opacity: 0.002,
  };

  const gradients: GradientVector = { ...INITIAL_GRADIENTS };

  (Object.keys(eps) as GradientKey[]).forEach((key) => {
    const plus = runForwardPass(withParam(gaussian, key, (gaussian[key] as number) + eps[key]), targetPixel, targetColor).loss;
    const minus = runForwardPass(withParam(gaussian, key, (gaussian[key] as number) - eps[key]), targetPixel, targetColor).loss;
    gradients[key] = (plus - minus) / (2 * eps[key]);
  });

  return gradients;
}

function formatColor(rgb: [number, number, number]) {
  return `rgb(${rgb[0].toFixed(0)}, ${rgb[1].toFixed(0)}, ${rgb[2].toFixed(0)})`;
}

export function DifferentiableRenderingDemo() {
  const [gaussian, setGaussian] = useState<Gaussian2D>(INITIAL_GAUSSIAN);
  const [targetPixel, setTargetPixel] = useState(INITIAL_TARGET_PIXEL);
  const [targetColor, setTargetColor] = useState<[number, number, number]>(INITIAL_TARGET_COLOR);
  const [showGradients, setShowGradients] = useState(true);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [gradientMode, setGradientMode] = useState<'analytic' | 'numerical'>('analytic');
  const [learningRate, setLearningRate] = useState(1);
  const [lossHistory, setLossHistory] = useState<number[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const forward = useMemo(
    () => runForwardPass(gaussian, targetPixel, targetColor),
    [gaussian, targetPixel, targetColor]
  );

  const analyticGradients = useMemo(
    () => computeAnalyticGradients(gaussian, targetPixel, targetColor, forward),
    [gaussian, targetPixel, targetColor, forward]
  );

  const numericalGradients = useMemo(
    () => computeNumericalGradients(gaussian, targetPixel, targetColor),
    [gaussian, targetPixel, targetColor]
  );

  const activeGradients = gradientMode === 'analytic' ? analyticGradients : numericalGradients;

  const gradientL2Gap = useMemo(() => {
    let sum = 0;
    (Object.keys(analyticGradients) as GradientKey[]).forEach((key) => {
      const delta = analyticGradients[key] - numericalGradients[key];
      sum += delta * delta;
    });
    return Math.sqrt(sum);
  }, [analyticGradients, numericalGradients]);

  useEffect(() => {
    setLossHistory((prev) => [...prev.slice(-119), forward.loss]);
  }, [forward.loss]);

  useEffect(() => {
    if (!isOptimizing) return;

    const interval = setInterval(() => {
      setGaussian((prev) => {
        const grads = activeGradients;
        const posScale = 120 * learningRate;
        const shapeScale = 35 * learningRate;
        const rotScale = 0.8 * learningRate;
        const opacityScale = 0.4 * learningRate;

        return {
          ...prev,
          x: prev.x - posScale * grads.x,
          y: prev.y - posScale * grads.y,
          scaleX: clamp(prev.scaleX - shapeScale * grads.scaleX, 8, 90),
          scaleY: clamp(prev.scaleY - shapeScale * grads.scaleY, 8, 90),
          rotation: wrapAngle(prev.rotation - rotScale * grads.rotation),
          opacity: clamp(prev.opacity - opacityScale * grads.opacity, 0.05, 1),
        };
      });
    }, 90);

    return () => clearInterval(interval);
  }, [isOptimizing, activeGradients, learningRate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.fillStyle = '#131320';
    ctx.fillRect(0, 0, width, height);

    // Draw Gaussian as contour levels from the same analytic model used for loss.
    const levels = [0.85, 0.6, 0.35, 0.16];
    ctx.save();
    ctx.translate(gaussian.x, gaussian.y);
    ctx.rotate(gaussian.rotation);

    levels.forEach((level, idx) => {
      const factor = Math.sqrt(-2 * Math.log(level));
      const alpha = gaussian.opacity * (0.32 - idx * 0.06);
      ctx.fillStyle = `rgba(${gaussian.color[0]}, ${gaussian.color[1]}, ${gaussian.color[2]}, ${Math.max(0.04, alpha)})`;
      ctx.beginPath();
      ctx.ellipse(0, 0, gaussian.scaleX * factor, gaussian.scaleY * factor, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.strokeStyle = 'rgba(255,255,255,0.65)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(0, 0, gaussian.scaleX, gaussian.scaleY, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();

    // Gaussian center.
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(gaussian.x, gaussian.y, 4, 0, Math.PI * 2);
    ctx.fill();

    // Target pixel.
    ctx.fillStyle = `rgb(${targetColor[0]}, ${targetColor[1]}, ${targetColor[2]})`;
    ctx.fillRect(targetPixel.x - 5, targetPixel.y - 5, 10, 10);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(targetPixel.x - 5, targetPixel.y - 5, 10, 10);

    if (showGradients) {
      // Draw update direction (negative gradient in x/y).
      const ux = -activeGradients.x;
      const uy = -activeGradients.y;
      const mag = Math.hypot(ux, uy);
      if (mag > 1e-6) {
        const scale = 46;
        const nx = (ux / mag) * scale;
        const ny = (uy / mag) * scale;
        const endX = gaussian.x + nx;
        const endY = gaussian.y + ny;

        ctx.strokeStyle = '#f87171';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(gaussian.x, gaussian.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        const angle = Math.atan2(ny, nx);
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(endX - 8 * Math.cos(angle - 0.35), endY - 8 * Math.sin(angle - 0.35));
        ctx.moveTo(endX, endY);
        ctx.lineTo(endX - 8 * Math.cos(angle + 0.35), endY - 8 * Math.sin(angle + 0.35));
        ctx.stroke();

        ctx.fillStyle = '#fca5a5';
        ctx.font = '11px sans-serif';
        ctx.fillText('update direction', endX + 5, endY - 3);
      }
    }

    ctx.fillStyle = 'rgba(220,224,245,0.9)';
    ctx.font = '11px sans-serif';
    ctx.fillText(`g(target) = ${forward.g.toFixed(3)}`, 10, 16);
    ctx.fillText(`pred = ${formatColor(forward.predictedColor)}`, 10, 32);
  }, [gaussian, targetPixel, targetColor, showGradients, activeGradients, forward]);

  const optimizeStep = () => {
    setGaussian((prev) => {
      const grads = activeGradients;
      return {
        ...prev,
        x: prev.x - 120 * learningRate * grads.x,
        y: prev.y - 120 * learningRate * grads.y,
        scaleX: clamp(prev.scaleX - 35 * learningRate * grads.scaleX, 8, 90),
        scaleY: clamp(prev.scaleY - 35 * learningRate * grads.scaleY, 8, 90),
        rotation: wrapAngle(prev.rotation - 0.8 * learningRate * grads.rotation),
        opacity: clamp(prev.opacity - 0.4 * learningRate * grads.opacity, 0.05, 1),
      };
    });
  };

  const resetAll = () => {
    setIsOptimizing(false);
    setGaussian(INITIAL_GAUSSIAN);
    setTargetPixel(INITIAL_TARGET_PIXEL);
    setTargetColor(INITIAL_TARGET_COLOR);
    setLossHistory([]);
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const scaleX = event.currentTarget.width / rect.width;
    const scaleY = event.currentTarget.height / rect.height;
    const x = clamp((event.clientX - rect.left) * scaleX, 0, event.currentTarget.width);
    const y = clamp((event.clientY - rect.top) * scaleY, 0, event.currentTarget.height);
    setTargetPixel({ x, y });
  };

  return (
    <div className="card p-6">
      <h3 className="font-semibold mb-2">Differentiable Rendering (Analytic vs Numerical Gradients)</h3>
      <p className="text-sm text-[var(--text-muted)] mb-5">
        Click in the canvas to pick a supervision pixel. The optimizer updates Gaussian position, scale, rotation, and opacity
        by descending the rendered-color loss gradient, mirroring the core idea used in 3D Gaussian Splatting training.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <canvas
            ref={canvasRef}
            width={320}
            height={320}
            onClick={handleCanvasClick}
            className="w-full rounded-lg border border-[var(--border)] cursor-crosshair"
          />

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setIsOptimizing((prev) => !prev)}
              className={`px-3 py-2 rounded text-sm font-medium ${
                isOptimizing ? 'bg-red-500 text-white' : 'bg-[var(--accent)] text-white'
              }`}
            >
              {isOptimizing ? 'Stop' : 'Auto Optimize'}
            </button>
            <button
              onClick={optimizeStep}
              disabled={isOptimizing}
              className="badge hover:border-[var(--border-strong)] disabled:opacity-50"
            >
              Single Step
            </button>
            <button
              onClick={() => setShowGradients((prev) => !prev)}
              className="badge hover:border-[var(--border-strong)]"
            >
              {showGradients ? 'Hide vectors' : 'Show vectors'}
            </button>
            <button onClick={resetAll} className="badge hover:border-[var(--border-strong)]">
              Reset
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-[var(--surface-2)] rounded">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Loss (MSE)</span>
              <span className="font-mono text-lg">{forward.loss.toFixed(5)}</span>
            </div>
            <div className="h-2 bg-[var(--surface-0)] rounded overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-red-500"
                style={{ width: `${Math.min(100, forward.loss * 260)}%` }}
              />
            </div>
          </div>

          <div className="p-4 bg-[var(--surface-2)] rounded space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>Gradient Mode</span>
              <select
                value={gradientMode}
                onChange={(e) => setGradientMode(e.target.value as 'analytic' | 'numerical')}
                className="bg-[var(--surface-0)] border border-[var(--border)] rounded px-2 py-1 text-xs"
              >
                <option value="analytic">Analytic</option>
                <option value="numerical">Numerical</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Learning rate</span>
                <span className="font-mono">{learningRate.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={0.2}
                max={2}
                step={0.1}
                value={learningRate}
                onChange={(e) => setLearningRate(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>dL/dx: <span className="font-mono">{activeGradients.x.toFixed(6)}</span></div>
              <div>dL/dy: <span className="font-mono">{activeGradients.y.toFixed(6)}</span></div>
              <div>dL/dsx: <span className="font-mono">{activeGradients.scaleX.toFixed(6)}</span></div>
              <div>dL/dsy: <span className="font-mono">{activeGradients.scaleY.toFixed(6)}</span></div>
              <div>dL/drot: <span className="font-mono">{activeGradients.rotation.toFixed(6)}</span></div>
              <div>dL/dalpha: <span className="font-mono">{activeGradients.opacity.toFixed(6)}</span></div>
            </div>

            <p className="text-xs text-[var(--text-muted)]">
              Analytic vs numerical gap (L2): <span className="font-mono">{gradientL2Gap.toExponential(2)}</span>
            </p>
          </div>

          <div className="p-4 bg-[var(--surface-2)] rounded space-y-3">
            <p className="font-medium text-sm">Target Color</p>
            {(['R', 'G', 'B'] as const).map((channel, idx) => (
              <div key={channel}>
                <div className="flex justify-between text-xs mb-1">
                  <span>{channel}</span>
                  <span className="font-mono">{targetColor[idx].toFixed(0)}</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={255}
                  step={1}
                  value={targetColor[idx]}
                  onChange={(e) => {
                    const next = [...targetColor] as [number, number, number];
                    next[idx] = Number(e.target.value);
                    setTargetColor(next);
                  }}
                  className="w-full"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-[var(--surface-2)] rounded">
        <p className="font-medium mb-2 text-sm">Loss History</p>
        <svg viewBox="0 0 320 80" className="w-full h-20">
          <rect x="0" y="0" width="320" height="80" fill="transparent" />
          {lossHistory.length > 1 && (
            <polyline
              fill="none"
              stroke="#60a5fa"
              strokeWidth="1.8"
              points={lossHistory
                .map((value, idx) => {
                  const x = (idx / (lossHistory.length - 1)) * 320;
                  const maxLoss = Math.max(...lossHistory, 1e-6);
                  const y = 72 - (value / maxLoss) * 64;
                  return `${x},${y}`;
                })
                .join(' ')}
            />
          )}
        </svg>
      </div>

      <p className="text-xs text-[var(--text-muted)] mt-4">
        The forward pass computes a Gaussian response at the supervision pixel, then MSE loss against target RGB. Gradients are backpropagated
        through translation, anisotropic scale, rotation, and opacity. This is the same differentiable optimization pattern used in 3DGS fitting.
      </p>
    </div>
  );
}

export default DifferentiableRenderingDemo;
