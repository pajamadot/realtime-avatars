'use client';

import { useState, useEffect, useRef } from 'react';

interface Gaussian2D {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  color: [number, number, number];
  opacity: number;
}

export function DifferentiableRenderingDemo() {
  const [gaussian, setGaussian] = useState<Gaussian2D>({
    x: 150,
    y: 150,
    scaleX: 40,
    scaleY: 25,
    rotation: 0.3,
    color: [100, 150, 255],
    opacity: 0.8,
  });
  const [targetPixel, setTargetPixel] = useState({ x: 180, y: 130 });
  const [targetColor, setTargetColor] = useState([255, 100, 100]);
  const [showGradients, setShowGradients] = useState(true);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [loss, setLoss] = useState(0);
  const [gradients, setGradients] = useState<Record<string, number>>({});
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  // Compute Gaussian value at a point
  const gaussianValue = (gx: number, gy: number, px: number, py: number, sx: number, sy: number, rot: number) => {
    const cos = Math.cos(rot);
    const sin = Math.sin(rot);
    const dx = px - gx;
    const dy = py - gy;

    // Rotate point
    const rx = cos * dx + sin * dy;
    const ry = -sin * dx + cos * dy;

    // Gaussian falloff
    const exponent = -0.5 * ((rx * rx) / (sx * sx) + (ry * ry) / (sy * sy));
    return Math.exp(exponent);
  };

  // Compute loss and gradients
  useEffect(() => {
    const { x, y, scaleX, scaleY, rotation, color, opacity } = gaussian;

    // Rendered color at target pixel
    const g = gaussianValue(x, y, targetPixel.x, targetPixel.y, scaleX, scaleY, rotation);
    const renderedColor = color.map(c => c * opacity * g);

    // L2 loss
    const l = targetColor.reduce((sum, tc, i) => sum + Math.pow(tc - renderedColor[i], 2), 0);
    setLoss(l);

    // Numerical gradients (simplified)
    const eps = 0.1;
    const computeGrad = (param: keyof Gaussian2D, delta: number) => {
      const gPlus = { ...gaussian, [param]: (gaussian[param] as number) + eps };
      const gMinus = { ...gaussian, [param]: (gaussian[param] as number) - eps };

      const gValPlus = gaussianValue(
        param === 'x' ? gPlus.x : x,
        param === 'y' ? gPlus.y : y,
        targetPixel.x, targetPixel.y,
        param === 'scaleX' ? gPlus.scaleX : scaleX,
        param === 'scaleY' ? gPlus.scaleY : scaleY,
        param === 'rotation' ? gPlus.rotation : rotation
      );
      const gValMinus = gaussianValue(
        param === 'x' ? gMinus.x : x,
        param === 'y' ? gMinus.y : y,
        targetPixel.x, targetPixel.y,
        param === 'scaleX' ? gMinus.scaleX : scaleX,
        param === 'scaleY' ? gMinus.scaleY : scaleY,
        param === 'rotation' ? gMinus.rotation : rotation
      );

      return (gValPlus - gValMinus) / (2 * eps) * delta;
    };

    const errorSignal = targetColor.reduce((sum, tc, i) => sum + (tc - renderedColor[i]), 0);

    setGradients({
      x: computeGrad('x', errorSignal) * 0.1,
      y: computeGrad('y', errorSignal) * 0.1,
      scaleX: computeGrad('scaleX', errorSignal) * 0.05,
      scaleY: computeGrad('scaleY', errorSignal) * 0.05,
      rotation: computeGrad('rotation', errorSignal) * 0.02,
    });
  }, [gaussian, targetPixel, targetColor]);

  // Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    // Render Gaussian as filled ellipse with gradient
    const { x, y, scaleX, scaleY, rotation, color, opacity } = gaussian;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);

    // Draw Gaussian blob using radial gradient
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(scaleX, scaleY) * 2);
    gradient.addColorStop(0, `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${opacity})`);
    gradient.addColorStop(0.5, `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${opacity * 0.3})`);
    gradient.addColorStop(1, `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0)`);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(0, 0, scaleX * 2.5, scaleY * 2.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw ellipse outline
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(0, 0, scaleX, scaleY, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();

    // Draw center point
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();

    // Draw target pixel
    ctx.fillStyle = `rgb(${targetColor[0]}, ${targetColor[1]}, ${targetColor[2]})`;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(targetPixel.x, targetPixel.y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Draw gradient arrows if enabled
    if (showGradients) {
      const arrowScale = 50;

      // Position gradient
      const posGradMag = Math.sqrt(gradients.x ** 2 + gradients.y ** 2);
      if (posGradMag > 0.01) {
        ctx.strokeStyle = '#ff6b6b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + gradients.x * arrowScale, y + gradients.y * arrowScale);
        ctx.stroke();

        // Arrowhead
        const angle = Math.atan2(gradients.y, gradients.x);
        ctx.beginPath();
        ctx.moveTo(x + gradients.x * arrowScale, y + gradients.y * arrowScale);
        ctx.lineTo(
          x + gradients.x * arrowScale - 8 * Math.cos(angle - 0.3),
          y + gradients.y * arrowScale - 8 * Math.sin(angle - 0.3)
        );
        ctx.moveTo(x + gradients.x * arrowScale, y + gradients.y * arrowScale);
        ctx.lineTo(
          x + gradients.x * arrowScale - 8 * Math.cos(angle + 0.3),
          y + gradients.y * arrowScale - 8 * Math.sin(angle + 0.3)
        );
        ctx.stroke();
      }

      // Label
      ctx.fillStyle = '#ff6b6b';
      ctx.font = '10px sans-serif';
      ctx.fillText('∇position', x + gradients.x * arrowScale + 5, y + gradients.y * arrowScale);
    }

    // Legend
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '11px sans-serif';
    ctx.fillText('● Gaussian center', 10, 20);
    ctx.fillText('● Target pixel', 10, 35);
    if (showGradients) ctx.fillText('→ Gradient direction', 10, 50);

  }, [gaussian, targetPixel, targetColor, gradients, showGradients]);

  // Optimization step
  const optimizeStep = () => {
    const lr = 0.5;
    setGaussian(prev => ({
      ...prev,
      x: prev.x + gradients.x * lr,
      y: prev.y + gradients.y * lr,
      scaleX: Math.max(10, prev.scaleX + gradients.scaleX * lr),
      scaleY: Math.max(10, prev.scaleY + gradients.scaleY * lr),
    }));
  };

  // Auto optimization
  useEffect(() => {
    if (!isOptimizing) return;

    const interval = setInterval(() => {
      optimizeStep();
    }, 100);

    return () => clearInterval(interval);
  }, [isOptimizing, gradients]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setTargetPixel({ x, y });
  };

  return (
    <div className="card p-6">
      <h3 className="font-semibold mb-2">Differentiable Rendering</h3>
      <p className="text-sm text-[var(--text-muted)] mb-6">
        See how gradients flow backward through the rendering process. Click to set a target pixel -
        the Gaussian will learn to cover it. This is how 3DGS learns from photos.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Canvas */}
        <div>
          <canvas
            ref={canvasRef}
            width={300}
            height={300}
            onClick={handleCanvasClick}
            className="w-full rounded-lg border border-[var(--border)] cursor-crosshair"
          />

          {/* Controls */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setIsOptimizing(!isOptimizing)}
              className={`flex-1 py-2 rounded font-medium text-sm transition-colors ${
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
              onClick={() => setShowGradients(!showGradients)}
              className="badge hover:border-[var(--border-strong)]"
            >
              {showGradients ? 'Hide' : 'Show'} ∇
            </button>
          </div>
        </div>

        {/* Parameters */}
        <div className="space-y-4">
          {/* Loss display */}
          <div className="p-4 bg-[var(--surface-2)] rounded">
            <div className="flex justify-between items-center">
              <span className="font-medium">Loss (L2)</span>
              <span className="font-mono text-lg">{loss.toFixed(1)}</span>
            </div>
            <div className="mt-2 h-2 bg-[var(--surface-0)] rounded overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-red-500"
                style={{ width: `${Math.min(100, loss / 500 * 100)}%` }}
              />
            </div>
          </div>

          {/* Gaussian parameters */}
          <div className="p-4 bg-[var(--surface-2)] rounded space-y-3">
            <p className="font-medium text-sm">Gaussian Parameters</p>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Scale X</span>
                <span className="font-mono">{gaussian.scaleX.toFixed(0)}</span>
              </div>
              <input
                type="range"
                min={10}
                max={80}
                value={gaussian.scaleX}
                onChange={(e) => setGaussian(prev => ({ ...prev, scaleX: Number(e.target.value) }))}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Scale Y</span>
                <span className="font-mono">{gaussian.scaleY.toFixed(0)}</span>
              </div>
              <input
                type="range"
                min={10}
                max={80}
                value={gaussian.scaleY}
                onChange={(e) => setGaussian(prev => ({ ...prev, scaleY: Number(e.target.value) }))}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Rotation</span>
                <span className="font-mono">{(gaussian.rotation * 180 / Math.PI).toFixed(0)}°</span>
              </div>
              <input
                type="range"
                min={-Math.PI}
                max={Math.PI}
                step={0.1}
                value={gaussian.rotation}
                onChange={(e) => setGaussian(prev => ({ ...prev, rotation: Number(e.target.value) }))}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Opacity</span>
                <span className="font-mono">{gaussian.opacity.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={0.1}
                max={1}
                step={0.05}
                value={gaussian.opacity}
                onChange={(e) => setGaussian(prev => ({ ...prev, opacity: Number(e.target.value) }))}
                className="w-full"
              />
            </div>
          </div>

          {/* Gradients display */}
          <div className="p-4 bg-[var(--surface-2)] rounded">
            <p className="font-medium text-sm mb-2">Gradients (∂Loss/∂param)</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>∂x: <span className="font-mono">{gradients.x?.toFixed(3) || 0}</span></div>
              <div>∂y: <span className="font-mono">{gradients.y?.toFixed(3) || 0}</span></div>
              <div>∂σx: <span className="font-mono">{gradients.scaleX?.toFixed(3) || 0}</span></div>
              <div>∂σy: <span className="font-mono">{gradients.scaleY?.toFixed(3) || 0}</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className="mt-6 p-4 bg-[var(--surface-2)] rounded">
        <p className="font-medium mb-2">Why Differentiable Rendering Matters</p>
        <p className="text-xs text-[var(--text-muted)]">
          Traditional rendering (rasterization, ray tracing) can't compute gradients because they use
          discrete operations. 3D Gaussian Splatting uses smooth, differentiable operations so we can
          ask: "How should I move/scale/rotate this Gaussian to make the rendered image look more like
          the target photo?" This enables learning from images.
        </p>
      </div>
    </div>
  );
}

export default DifferentiableRenderingDemo;
