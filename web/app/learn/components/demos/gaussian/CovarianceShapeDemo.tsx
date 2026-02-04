'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface Point3D {
  x: number;
  y: number;
  z: number;
}

// Generate ellipsoid points
function generateEllipsoid(
  scaleX: number,
  scaleY: number,
  scaleZ: number,
  rotationY: number,
  rotationZ: number,
  segments: number = 16
): Point3D[][] {
  const points: Point3D[][] = [];

  for (let i = 0; i <= segments; i++) {
    const phi = (i / segments) * Math.PI;
    const ring: Point3D[] = [];

    for (let j = 0; j <= segments * 2; j++) {
      const theta = (j / (segments * 2)) * Math.PI * 2;

      // Unit sphere point
      let x = Math.sin(phi) * Math.cos(theta);
      let y = Math.sin(phi) * Math.sin(theta);
      let z = Math.cos(phi);

      // Apply scale
      x *= scaleX;
      y *= scaleY;
      z *= scaleZ;

      // Apply Y rotation
      const cosY = Math.cos(rotationY);
      const sinY = Math.sin(rotationY);
      const newX = x * cosY + z * sinY;
      const newZ = -x * sinY + z * cosY;
      x = newX;
      z = newZ;

      // Apply Z rotation
      const cosZ = Math.cos(rotationZ);
      const sinZ = Math.sin(rotationZ);
      const newX2 = x * cosZ - y * sinZ;
      const newY2 = x * sinZ + y * cosZ;
      x = newX2;
      y = newY2;

      ring.push({ x, y, z });
    }
    points.push(ring);
  }

  return points;
}

// Project 3D to 2D with simple perspective
function project(p: Point3D, scale: number, centerX: number, centerY: number): { x: number; y: number; depth: number } {
  const perspective = 4;
  const z = p.z + perspective;
  const factor = perspective / z;
  return {
    x: centerX + p.x * scale * factor,
    y: centerY - p.y * scale * factor,
    depth: z
  };
}

export default function CovarianceShapeDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scaleX, setScaleX] = useState(1);
  const [scaleY, setScaleY] = useState(0.5);
  const [scaleZ, setScaleZ] = useState(0.3);
  const [rotationY, setRotationY] = useState(0);
  const [rotationZ, setRotationZ] = useState(0);
  const [autoRotate, setAutoRotate] = useState(false);
  const [showAxes, setShowAxes] = useState(true);
  const [opacity, setOpacity] = useState(0.7);

  const animationRef = useRef<number | null>(null);

  // Auto-rotation animation
  useEffect(() => {
    if (!autoRotate) return;

    const animate = () => {
      setRotationY(prev => (prev + 0.02) % (Math.PI * 2));
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [autoRotate]);

  // Draw
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = Math.min(width, height) / 3;

    // Clear
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    // Generate ellipsoid
    const ellipsoid = generateEllipsoid(scaleX, scaleY, scaleZ, rotationY, rotationZ);

    // Draw coordinate axes if enabled
    if (showAxes) {
      const axisLength = 1.5;
      const axes = [
        { start: { x: 0, y: 0, z: 0 }, end: { x: axisLength, y: 0, z: 0 }, color: '#ff6b6b', label: 'X' },
        { start: { x: 0, y: 0, z: 0 }, end: { x: 0, y: axisLength, z: 0 }, color: '#6bcb77', label: 'Y' },
        { start: { x: 0, y: 0, z: 0 }, end: { x: 0, y: 0, z: axisLength }, color: '#4ecdc4', label: 'Z' },
      ];

      axes.forEach(axis => {
        const start = project(axis.start, scale, centerX, centerY);
        const end = project(axis.end, scale, centerX, centerY);

        ctx.strokeStyle = axis.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();

        // Arrow head
        const angle = Math.atan2(end.y - start.y, end.x - start.x);
        ctx.beginPath();
        ctx.moveTo(end.x, end.y);
        ctx.lineTo(end.x - 8 * Math.cos(angle - 0.3), end.y - 8 * Math.sin(angle - 0.3));
        ctx.lineTo(end.x - 8 * Math.cos(angle + 0.3), end.y - 8 * Math.sin(angle + 0.3));
        ctx.closePath();
        ctx.fillStyle = axis.color;
        ctx.fill();

        // Label
        ctx.font = '12px sans-serif';
        ctx.fillStyle = axis.color;
        ctx.fillText(axis.label, end.x + 10, end.y);
      });
    }

    // Draw ellipsoid wireframe
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, scale);
    gradient.addColorStop(0, `rgba(255, 107, 107, ${opacity})`);
    gradient.addColorStop(0.5, `rgba(255, 217, 61, ${opacity})`);
    gradient.addColorStop(1, `rgba(107, 203, 119, ${opacity})`);

    // Draw horizontal rings
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 1.5;

    ellipsoid.forEach((ring, i) => {
      if (i % 2 === 0) {
        ctx.beginPath();
        ring.forEach((point, j) => {
          const p = project(point, scale, centerX, centerY);
          if (j === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();
      }
    });

    // Draw vertical lines
    for (let j = 0; j < ellipsoid[0].length; j += 4) {
      ctx.beginPath();
      ellipsoid.forEach((ring, i) => {
        const point = ring[j];
        const p = project(point, scale, centerX, centerY);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
    }

    // Draw center point
    const center = project({ x: 0, y: 0, z: 0 }, scale, centerX, centerY);
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(center.x, center.y, 4, 0, Math.PI * 2);
    ctx.fill();

  }, [scaleX, scaleY, scaleZ, rotationY, rotationZ, showAxes, opacity]);

  useEffect(() => {
    draw();
  }, [draw]);

  // Preset shapes
  const presets = {
    sphere: { x: 1, y: 1, z: 1, label: 'Sphere' },
    pancake: { x: 1, y: 1, z: 0.2, label: 'Pancake' },
    needle: { x: 0.2, y: 0.2, z: 1.5, label: 'Needle' },
    ellipsoid: { x: 1, y: 0.6, z: 0.3, label: 'Ellipsoid' },
  };

  const applyPreset = (preset: keyof typeof presets) => {
    setScaleX(presets[preset].x);
    setScaleY(presets[preset].y);
    setScaleZ(presets[preset].z);
  };

  // Calculate covariance matrix display
  const covMatrix = [
    [scaleX * scaleX, 0, 0],
    [0, scaleY * scaleY, 0],
    [0, 0, scaleZ * scaleZ]
  ];

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">3D Covariance Shape Demo</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-3 py-1 text-xs rounded ${
              autoRotate ? 'bg-green-500/20 text-green-400' : 'bg-[var(--surface-2)]'
            }`}
          >
            {autoRotate ? 'Stop' : 'Rotate'}
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
              id="showAxes"
              checked={showAxes}
              onChange={(e) => setShowAxes(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="showAxes" className="text-xs text-[var(--text-muted)]">
              Show coordinate axes
            </label>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-3">
          {/* Presets */}
          <div>
            <label className="text-sm mb-2 block">Shape Presets</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(presets).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => applyPreset(key as keyof typeof presets)}
                  className="px-3 py-1 text-xs bg-[var(--surface-2)] rounded hover:bg-[var(--border)]"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scale controls */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-[#ff6b6b]">Scale X</span>
              <span>{scaleX.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.5"
              step="0.1"
              value={scaleX}
              onChange={(e) => setScaleX(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-[#6bcb77]">Scale Y</span>
              <span>{scaleY.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.5"
              step="0.1"
              value={scaleY}
              onChange={(e) => setScaleY(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-[#4ecdc4]">Scale Z</span>
              <span>{scaleZ.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.5"
              step="0.1"
              value={scaleZ}
              onChange={(e) => setScaleZ(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Rotation */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Rotation Y</span>
              <span>{(rotationY * 180 / Math.PI).toFixed(0)}°</span>
            </div>
            <input
              type="range"
              min="0"
              max={Math.PI * 2}
              step="0.1"
              value={rotationY}
              onChange={(e) => setRotationY(parseFloat(e.target.value))}
              className="w-full"
              disabled={autoRotate}
            />
          </div>

          {/* Covariance matrix */}
          <div className="p-3 bg-[var(--surface-2)] rounded">
            <p className="text-xs text-[var(--text-muted)] mb-2">Covariance Matrix (diagonal):</p>
            <div className="grid grid-cols-3 gap-1 text-center font-mono text-xs">
              <div className="p-1 bg-[var(--surface-0)] rounded">{covMatrix[0][0].toFixed(2)}</div>
              <div className="p-1 bg-[var(--surface-0)] rounded text-[var(--text-muted)]">0</div>
              <div className="p-1 bg-[var(--surface-0)] rounded text-[var(--text-muted)]">0</div>
              <div className="p-1 bg-[var(--surface-0)] rounded text-[var(--text-muted)]">0</div>
              <div className="p-1 bg-[var(--surface-0)] rounded">{covMatrix[1][1].toFixed(2)}</div>
              <div className="p-1 bg-[var(--surface-0)] rounded text-[var(--text-muted)]">0</div>
              <div className="p-1 bg-[var(--surface-0)] rounded text-[var(--text-muted)]">0</div>
              <div className="p-1 bg-[var(--surface-0)] rounded text-[var(--text-muted)]">0</div>
              <div className="p-1 bg-[var(--surface-0)] rounded">{covMatrix[2][2].toFixed(2)}</div>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-2">
              Diagonal values = scale² (variance along each axis)
            </p>
          </div>
        </div>
      </div>

      <p className="text-xs text-[var(--text-muted)] mt-4">
        This shows how a 3D Gaussian's shape is defined by its covariance matrix.
        The diagonal values control stretching along each axis, creating spheres, pancakes, or needles.
      </p>
    </div>
  );
}
