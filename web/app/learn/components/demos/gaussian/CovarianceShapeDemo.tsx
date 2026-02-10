'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface Preset {
  x: number;
  y: number;
  z: number;
  label: string;
}

const PRESETS: Record<string, Preset> = {
  sphere: { x: 1, y: 1, z: 1, label: 'Sphere' },
  pancake: { x: 1, y: 1, z: 0.2, label: 'Pancake' },
  needle: { x: 0.2, y: 0.2, z: 1.5, label: 'Needle' },
  ellipsoid: { x: 1, y: 0.6, z: 0.3, label: 'Ellipsoid' },
};

function generateEllipsoidSurface(
  sx: number, sy: number, sz: number,
  rotY: number, rotZ: number,
  segments: number = 20
): Point3D[][] {
  const rings: Point3D[][] = [];
  const cosRY = Math.cos(rotY), sinRY = Math.sin(rotY);
  const cosRZ = Math.cos(rotZ), sinRZ = Math.sin(rotZ);

  for (let i = 0; i <= segments; i++) {
    const phi = (i / segments) * Math.PI;
    const ring: Point3D[] = [];
    for (let j = 0; j <= segments * 2; j++) {
      const theta = (j / (segments * 2)) * Math.PI * 2;
      let x = sx * Math.sin(phi) * Math.cos(theta);
      let y = sy * Math.sin(phi) * Math.sin(theta);
      let z = sz * Math.cos(phi);

      // Y rotation
      let nx = x * cosRY + z * sinRY;
      let nz = -x * sinRY + z * cosRY;
      x = nx; z = nz;

      // Z rotation
      nx = x * cosRZ - y * sinRZ;
      const ny = x * sinRZ + y * cosRZ;
      x = nx; y = ny;

      ring.push({ x, y, z });
    }
    rings.push(ring);
  }
  return rings;
}

function project(p: Point3D, scale: number, cx: number, cy: number) {
  const persp = 4.5;
  const z = p.z + persp;
  const f = persp / z;
  return { x: cx + p.x * scale * f, y: cy - p.y * scale * f, depth: z };
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
  const [activePreset, setActivePreset] = useState<string | null>('ellipsoid');

  // Smooth animation targets
  const targetRef = useRef({ sx: 1, sy: 0.5, sz: 0.3 });
  const currentRef = useRef({ sx: 1, sy: 0.5, sz: 0.3 });
  const presetAnimRef = useRef<number | null>(null);

  // Mouse drag
  const [isDragging, setIsDragging] = useState(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number | null>(null);

  // Auto-rotation
  useEffect(() => {
    if (!autoRotate) return;
    const animate = () => {
      setRotationY(prev => (prev + 0.015) % (Math.PI * 2));
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [autoRotate]);

  // Smooth preset transitions
  const applyPreset = useCallback((key: string) => {
    setActivePreset(key);
    const p = PRESETS[key];
    targetRef.current = { sx: p.x, sy: p.y, sz: p.z };

    if (presetAnimRef.current) cancelAnimationFrame(presetAnimRef.current);
    const animate = () => {
      const c = currentRef.current;
      const t = targetRef.current;
      let done = true;

      ['sx', 'sy', 'sz'].forEach(k => {
        const key = k as keyof typeof c;
        const diff = t[key] - c[key];
        if (Math.abs(diff) > 0.005) {
          c[key] += diff * 0.1;
          done = false;
        } else {
          c[key] = t[key];
        }
      });

      setScaleX(c.sx);
      setScaleY(c.sy);
      setScaleZ(c.sz);

      if (!done) presetAnimRef.current = requestAnimationFrame(animate);
    };
    presetAnimRef.current = requestAnimationFrame(animate);
  }, []);

  // Update current ref when sliders change manually
  useEffect(() => {
    currentRef.current = { sx: scaleX, sy: scaleY, sz: scaleZ };
    targetRef.current = { sx: scaleX, sy: scaleY, sz: scaleZ };
  }, [scaleX, scaleY, scaleZ]);

  // Draw
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const scale = Math.min(w, h) / 3;

    // Background gradient
    const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, w * 0.7);
    bg.addColorStop(0, '#1e1e35');
    bg.addColorStop(1, '#14142a');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    const ellipsoid = generateEllipsoidSurface(scaleX, scaleY, scaleZ, rotationY, rotationZ);

    // Axes
    if (showAxes) {
      const axLen = 1.6;
      const axes = [
        { end: { x: axLen, y: 0, z: 0 }, color: '#ff6b6b', label: 'X' },
        { end: { x: 0, y: axLen, z: 0 }, color: '#6bcb77', label: 'Y' },
        { end: { x: 0, y: 0, z: axLen }, color: '#4ecdc4', label: 'Z' },
      ];
      const origin = project({ x: 0, y: 0, z: 0 }, scale, cx, cy);

      axes.forEach(axis => {
        const end = project(axis.end, scale, cx, cy);
        // Dashed line
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = axis.color + '60';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(origin.x, origin.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Arrow head
        const angle = Math.atan2(end.y - origin.y, end.x - origin.x);
        ctx.beginPath();
        ctx.moveTo(end.x, end.y);
        ctx.lineTo(end.x - 8 * Math.cos(angle - 0.3), end.y - 8 * Math.sin(angle - 0.3));
        ctx.lineTo(end.x - 8 * Math.cos(angle + 0.3), end.y - 8 * Math.sin(angle + 0.3));
        ctx.closePath();
        ctx.fillStyle = axis.color;
        ctx.fill();

        ctx.font = 'bold 12px sans-serif';
        ctx.fillStyle = axis.color;
        ctx.fillText(axis.label, end.x + 10, end.y + 4);
      });
    }

    // Draw filled ellipsoid with gradient coloring
    // Back-face rings first (filled), then front-face wireframe
    const projectedRings = ellipsoid.map(ring =>
      ring.map(p => project(p, scale, cx, cy))
    );

    // Fill quad patches for solid look
    for (let i = 0; i < projectedRings.length - 1; i++) {
      for (let j = 0; j < projectedRings[i].length - 1; j++) {
        const p1 = projectedRings[i][j];
        const p2 = projectedRings[i][j + 1];
        const p3 = projectedRings[i + 1][j + 1];
        const p4 = projectedRings[i + 1][j];

        const avgDepth = (p1.depth + p2.depth + p3.depth + p4.depth) / 4;
        const normalFade = Math.max(0, Math.min(1, (avgDepth - 3) / 3));

        // Color gradient based on position
        const t = i / (projectedRings.length - 1);
        const r = Math.round(200 + 55 * t);
        const g = Math.round(100 + 60 * (1 - t));
        const b = Math.round(80 + 40 * Math.sin(t * Math.PI));
        const alpha = 0.15 + normalFade * 0.2;

        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.lineTo(p4.x, p4.y);
        ctx.closePath();
        ctx.fill();
      }
    }

    // Wireframe — horizontal rings
    ctx.lineWidth = 1;
    ellipsoid.forEach((ring, i) => {
      if (i % 3 === 0) {
        ctx.strokeStyle = `rgba(255,180,100,0.3)`;
        ctx.beginPath();
        ring.forEach((point, j) => {
          const p = project(point, scale, cx, cy);
          if (j === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();
      }
    });

    // Vertical lines
    for (let j = 0; j < ellipsoid[0].length; j += 5) {
      ctx.strokeStyle = 'rgba(255,180,100,0.2)';
      ctx.beginPath();
      ellipsoid.forEach((ring, i) => {
        const p = project(ring[j], scale, cx, cy);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
    }

    // Glow center
    const center = project({ x: 0, y: 0, z: 0 }, scale, cx, cy);
    const glow = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, 8);
    glow.addColorStop(0, 'rgba(255,255,255,0.9)');
    glow.addColorStop(0.5, 'rgba(255,200,150,0.4)');
    glow.addColorStop(1, 'rgba(255,200,150,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(center.x, center.y, 8, 0, Math.PI * 2);
    ctx.fill();

    // 2D projected ellipse inset (bottom-right)
    const insetSize = 70;
    const ix = w - insetSize - 12;
    const iy = h - insetSize - 12;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.fillRect(ix - 4, iy - 4, insetSize + 8, insetSize + 8);
    ctx.strokeRect(ix - 4, iy - 4, insetSize + 8, insetSize + 8);

    ctx.font = '9px sans-serif';
    ctx.fillStyle = '#787268';
    ctx.fillText('2D Projection', ix, iy - 8);

    // Draw 2D ellipse (project XY scales)
    const insetCX = ix + insetSize / 2;
    const insetCY = iy + insetSize / 2;
    const eRx = scaleX * (insetSize / 3.5);
    const eRy = scaleY * (insetSize / 3.5);

    const eGrad = ctx.createRadialGradient(insetCX, insetCY, 0, insetCX, insetCY, Math.max(eRx, eRy));
    eGrad.addColorStop(0, 'rgba(255,180,100,0.5)');
    eGrad.addColorStop(0.6, 'rgba(255,140,80,0.2)');
    eGrad.addColorStop(1, 'rgba(255,140,80,0)');
    ctx.fillStyle = eGrad;
    ctx.beginPath();
    ctx.ellipse(insetCX, insetCY, eRx, eRy, rotationZ, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255,180,100,0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(insetCX, insetCY, eRx, eRy, rotationZ, 0, Math.PI * 2);
    ctx.stroke();

  }, [scaleX, scaleY, scaleZ, rotationY, rotationZ, showAxes]);

  // Continuous render
  useEffect(() => {
    let running = true;
    const loop = () => {
      if (!running) return;
      draw();
      requestAnimationFrame(loop);
    };
    loop();
    return () => { running = false; };
  }, [draw]);

  // Mouse drag rotation
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setAutoRotate(false);
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - lastMouseRef.current.x;
    const dy = e.clientY - lastMouseRef.current.y;
    setRotationY(prev => prev + dx * 0.01);
    setRotationZ(prev => prev + dy * 0.01);
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    setAutoRotate(false);
    const t = e.touches[0];
    lastMouseRef.current = { x: t.clientX, y: t.clientY };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const t = e.touches[0];
    const dx = t.clientX - lastMouseRef.current.x;
    const dy = t.clientY - lastMouseRef.current.y;
    setRotationY(prev => prev + dx * 0.01);
    setRotationZ(prev => prev + dy * 0.01);
    lastMouseRef.current = { x: t.clientX, y: t.clientY };
  };

  // Covariance matrix display
  const covMatrix = [
    [scaleX * scaleX, 0, 0],
    [0, scaleY * scaleY, 0],
    [0, 0, scaleZ * scaleZ],
  ];

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">3D Covariance Shape Demo</h3>
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`px-3 py-1 text-xs rounded ${
            autoRotate ? 'bg-green-500/20 text-green-400' : 'bg-[var(--surface-2)]'
          }`}
        >
          {autoRotate ? 'Stop' : 'Rotate'}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <canvas
            ref={canvasRef}
            width={350}
            height={350}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            className="w-full aspect-square rounded-lg cursor-grab active:cursor-grabbing"
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
            <span className="text-xs text-[var(--text-muted)] ml-auto">Drag to rotate</span>
          </div>
        </div>

        <div className="space-y-3">
          {/* Presets */}
          <div>
            <label className="text-sm mb-2 block">Shape Presets</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => applyPreset(key)}
                  className={`px-3 py-1 text-xs rounded transition-colors ${
                    activePreset === key
                      ? 'bg-[var(--accent)] text-white'
                      : 'bg-[var(--surface-2)] hover:bg-[var(--border)]'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scale controls */}
          {[
            { label: 'Scale X', color: '#ff6b6b', value: scaleX, set: setScaleX },
            { label: 'Scale Y', color: '#6bcb77', value: scaleY, set: setScaleY },
            { label: 'Scale Z', color: '#4ecdc4', value: scaleZ, set: setScaleZ },
          ].map(ctrl => (
            <div key={ctrl.label}>
              <div className="flex justify-between text-sm mb-1">
                <span style={{ color: ctrl.color }}>{ctrl.label}</span>
                <span className="font-mono text-xs">{ctrl.value.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.5"
                step="0.05"
                value={ctrl.value}
                onChange={(e) => {
                  ctrl.set(parseFloat(e.target.value));
                  setActivePreset(null);
                }}
                className="w-full"
              />
            </div>
          ))}

          {/* Covariance matrix */}
          <div className="p-3 bg-[var(--surface-2)] rounded">
            <p className="text-xs text-[var(--text-muted)] mb-2">{'\u03A3'} = R S S{'\u1D40'} R{'\u1D40'} (Covariance Matrix):</p>
            <div className="grid grid-cols-3 gap-1 text-center font-mono text-xs">
              {covMatrix.flat().map((val, i) => (
                <div
                  key={i}
                  className={`p-1 rounded ${
                    i === 0 || i === 4 || i === 8
                      ? 'bg-[var(--surface-0)] text-[var(--foreground)]'
                      : 'bg-[var(--surface-0)] text-[var(--text-muted)]'
                  }`}
                >
                  {val.toFixed(2)}
                </div>
              ))}
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-2">
              Diagonal = scale{'\u00B2'} (variance). Off-diagonal = rotation coupling.
            </p>
          </div>
        </div>
      </div>

      <p className="text-xs text-[var(--text-muted)] mt-4">
        Each 3D Gaussian's shape is defined by its covariance matrix {'\u03A3'}.
        The diagonal values control stretching along each axis. Drag to rotate the view.
      </p>
    </div>
  );
}
