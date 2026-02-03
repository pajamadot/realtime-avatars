'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface Point {
  x: number;
  y: number;
}

// 2D transformation functions
function rotatePoint(p: Point, angle: number): Point {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: p.x * cos - p.y * sin,
    y: p.x * sin + p.y * cos
  };
}

function scalePoint(p: Point, sx: number, sy: number): Point {
  return { x: p.x * sx, y: p.y * sy };
}

// Generate unit circle points
function generateCircle(segments: number = 32): Point[] {
  const points: Point[] = [];
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    points.push({ x: Math.cos(angle), y: Math.sin(angle) });
  }
  return points;
}

// Generate axes
function generateAxes(): Point[][] {
  return [
    [{ x: -1.5, y: 0 }, { x: 1.5, y: 0 }], // X axis
    [{ x: 0, y: -1.5 }, { x: 0, y: 1.5 }], // Y axis
  ];
}

export default function MatrixTransformDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scaleX, setScaleX] = useState(1);
  const [scaleY, setScaleY] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [showSteps, setShowSteps] = useState(true);
  const [animating, setAnimating] = useState(false);
  const animationRef = useRef<number | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const scale = Math.min(width, height) / 4;
    const centerX = width / 2;
    const centerY = height / 2;

    // Clear
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    // Transform point to canvas coordinates
    const toCanvas = (p: Point) => ({
      x: centerX + p.x * scale,
      y: centerY - p.y * scale
    });

    // Draw grid
    ctx.strokeStyle = '#2a2a4e';
    ctx.lineWidth = 1;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(centerX + i * scale, 0);
      ctx.lineTo(centerX + i * scale, height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, centerY + i * scale);
      ctx.lineTo(width, centerY + i * scale);
      ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = '#4a4a6e';
    ctx.lineWidth = 2;
    generateAxes().forEach(axis => {
      ctx.beginPath();
      const start = toCanvas(axis[0]);
      const end = toCanvas(axis[1]);
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    });

    // Original circle (faint)
    const circle = generateCircle();
    ctx.strokeStyle = 'rgba(100, 100, 150, 0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    circle.forEach((p, i) => {
      const cp = toCanvas(p);
      if (i === 0) ctx.moveTo(cp.x, cp.y);
      else ctx.lineTo(cp.x, cp.y);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // Step 1: Scale only (if showing steps)
    if (showSteps) {
      const scaledCircle = circle.map(p => scalePoint(p, scaleX, scaleY));
      ctx.strokeStyle = 'rgba(255, 200, 100, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      scaledCircle.forEach((p, i) => {
        const cp = toCanvas(p);
        if (i === 0) ctx.moveTo(cp.x, cp.y);
        else ctx.lineTo(cp.x, cp.y);
      });
      ctx.stroke();
    }

    // Final transformation: Scale then Rotate
    const rotationRad = (rotation * Math.PI) / 180;
    const transformedCircle = circle.map(p => {
      const scaled = scalePoint(p, scaleX, scaleY);
      return rotatePoint(scaled, rotationRad);
    });

    // Draw transformed shape with gradient
    const gradient = ctx.createLinearGradient(
      centerX - scale, centerY - scale,
      centerX + scale, centerY + scale
    );
    gradient.addColorStop(0, '#ff6b6b');
    gradient.addColorStop(0.5, '#ffd93d');
    gradient.addColorStop(1, '#6bcb77');

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 3;
    ctx.beginPath();
    transformedCircle.forEach((p, i) => {
      const cp = toCanvas(p);
      if (i === 0) ctx.moveTo(cp.x, cp.y);
      else ctx.lineTo(cp.x, cp.y);
    });
    ctx.stroke();

    // Fill with transparency
    ctx.fillStyle = 'rgba(255, 107, 107, 0.1)';
    ctx.fill();

    // Draw transformed axes
    const xAxis = [{ x: -1, y: 0 }, { x: 1, y: 0 }];
    const yAxis = [{ x: 0, y: -1 }, { x: 0, y: 1 }];

    const transformAxis = (axis: Point[]) => axis.map(p => {
      const scaled = scalePoint(p, scaleX, scaleY);
      return rotatePoint(scaled, rotationRad);
    });

    // X axis (red)
    ctx.strokeStyle = '#ff6b6b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const txAxis = transformAxis(xAxis);
    ctx.moveTo(toCanvas(txAxis[0]).x, toCanvas(txAxis[0]).y);
    ctx.lineTo(toCanvas(txAxis[1]).x, toCanvas(txAxis[1]).y);
    ctx.stroke();

    // Y axis (green)
    ctx.strokeStyle = '#6bcb77';
    ctx.beginPath();
    const tyAxis = transformAxis(yAxis);
    ctx.moveTo(toCanvas(tyAxis[0]).x, toCanvas(tyAxis[0]).y);
    ctx.lineTo(toCanvas(tyAxis[1]).x, toCanvas(tyAxis[1]).y);
    ctx.stroke();

  }, [scaleX, scaleY, rotation, showSteps]);

  useEffect(() => {
    draw();
  }, [draw]);

  // Animation
  const animate = useCallback(() => {
    if (!animating) return;

    setRotation(prev => (prev + 2) % 360);
    animationRef.current = requestAnimationFrame(animate);
  }, [animating]);

  useEffect(() => {
    if (animating) {
      animationRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [animating, animate]);

  const reset = () => {
    setScaleX(1);
    setScaleY(1);
    setRotation(0);
    setAnimating(false);
  };

  // Matrix display
  const rotRad = (rotation * Math.PI) / 180;
  const cos = Math.cos(rotRad).toFixed(2);
  const sin = Math.sin(rotRad).toFixed(2);
  const negSin = (-Math.sin(rotRad)).toFixed(2);

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Matrix Transformation Demo</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setAnimating(!animating)}
            className={`px-3 py-1 text-xs rounded ${
              animating ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
            }`}
          >
            {animating ? 'Stop' : 'Animate'}
          </button>
          <button
            onClick={reset}
            className="px-3 py-1 text-xs bg-[var(--card-bg-alt)] rounded hover:bg-[var(--border)]"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Canvas */}
        <div>
          <canvas
            ref={canvasRef}
            width={300}
            height={300}
            className="w-full aspect-square rounded-lg"
          />
          <div className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="showSteps"
              checked={showSteps}
              onChange={(e) => setShowSteps(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="showSteps" className="text-xs text-[var(--muted)]">
              Show intermediate step (scale only)
            </label>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {/* Scale X */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Scale X</span>
              <span className="text-[var(--accent)]">{scaleX.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="2"
              step="0.1"
              value={scaleX}
              onChange={(e) => setScaleX(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Scale Y */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Scale Y</span>
              <span className="text-[var(--accent)]">{scaleY.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="2"
              step="0.1"
              value={scaleY}
              onChange={(e) => setScaleY(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Rotation */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Rotation</span>
              <span className="text-[var(--accent)]">{rotation.toFixed(0)}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              step="5"
              value={rotation}
              onChange={(e) => setRotation(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Matrix Display */}
          <div className="p-3 bg-[var(--card-bg-alt)] rounded text-sm font-mono">
            <p className="text-xs text-[var(--muted)] mb-2">Combined Matrix (R × S):</p>
            <div className="grid grid-cols-2 gap-1 text-center">
              <div className="p-1 bg-[var(--card-bg)] rounded">
                {(parseFloat(cos) * scaleX).toFixed(2)}
              </div>
              <div className="p-1 bg-[var(--card-bg)] rounded">
                {(parseFloat(negSin) * scaleY).toFixed(2)}
              </div>
              <div className="p-1 bg-[var(--card-bg)] rounded">
                {(parseFloat(sin) * scaleX).toFixed(2)}
              </div>
              <div className="p-1 bg-[var(--card-bg)] rounded">
                {(parseFloat(cos) * scaleY).toFixed(2)}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="text-xs text-[var(--muted)] space-y-1">
            <p><span className="text-[#ff6b6b]">—</span> Transformed X axis</p>
            <p><span className="text-[#6bcb77]">—</span> Transformed Y axis</p>
            <p><span className="text-[#ffd93d]">- -</span> Original circle</p>
          </div>
        </div>
      </div>

      <p className="text-xs text-[var(--muted)] mt-4">
        Watch how scaling stretches the circle into an ellipse, then rotation reorients it.
        This is exactly how Gaussian Splatting builds covariance matrices from scale and rotation parameters.
      </p>
    </div>
  );
}
