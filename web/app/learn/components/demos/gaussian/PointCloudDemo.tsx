'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface Point3D {
  x: number;
  y: number;
  z: number;
  color: [number, number, number];
  splatSize: number;
}

// Seeded random for consistent point generation
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateFacePoints(rng: () => number): Point3D[] {
  const pts: Point3D[] = [];
  const skin: [number, number, number] = [245, 195, 160];
  const eyeCol: [number, number, number] = [50, 35, 25];
  const lipCol: [number, number, number] = [210, 100, 105];
  const hairCol: [number, number, number] = [60, 40, 30];
  const browCol: [number, number, number] = [80, 55, 40];

  // Face surface — denser ellipsoid
  for (let i = 0; i < 400; i++) {
    const theta = rng() * Math.PI * 2;
    const phi = rng() * Math.PI;
    const x = 0.82 * Math.sin(phi) * Math.cos(theta);
    const y = 1.12 * Math.cos(phi);
    const z = 0.72 * Math.sin(phi) * Math.sin(theta);
    if (z > -0.25) {
      const jitter = 0.03;
      pts.push({
        x: x + (rng() - 0.5) * jitter,
        y: y + (rng() - 0.5) * jitter,
        z: z + (rng() - 0.5) * jitter,
        color: [
          skin[0] + Math.round((rng() - 0.5) * 20),
          skin[1] + Math.round((rng() - 0.5) * 15),
          skin[2] + Math.round((rng() - 0.5) * 15),
        ],
        splatSize: 0.06 + rng() * 0.04,
      });
    }
  }

  // Eyes
  [{ x: -0.26, y: 0.22, z: 0.62 }, { x: 0.26, y: 0.22, z: 0.62 }].forEach(pos => {
    // Whites
    for (let i = 0; i < 12; i++) {
      pts.push({
        x: pos.x + (rng() - 0.5) * 0.14,
        y: pos.y + (rng() - 0.5) * 0.07,
        z: pos.z + rng() * 0.04,
        color: [230, 225, 220],
        splatSize: 0.04,
      });
    }
    // Iris/pupil
    for (let i = 0; i < 8; i++) {
      const a = rng() * Math.PI * 2;
      const r = rng() * 0.04;
      pts.push({
        x: pos.x + Math.cos(a) * r,
        y: pos.y + Math.sin(a) * r,
        z: pos.z + 0.04,
        color: eyeCol,
        splatSize: 0.03,
      });
    }
  });

  // Eyebrows
  [{ cx: -0.26, cy: 0.38, dir: 1 }, { cx: 0.26, cy: 0.38, dir: -1 }].forEach(b => {
    for (let i = 0; i < 14; i++) {
      const t = (i / 13 - 0.5);
      pts.push({
        x: b.cx + t * 0.22,
        y: b.cy + Math.abs(t) * -0.06,
        z: 0.65 + rng() * 0.02,
        color: browCol,
        splatSize: 0.035,
      });
    }
  });

  // Nose ridge + tip
  for (let i = 0; i < 30; i++) {
    const t = i / 29;
    const noseY = 0.3 - t * 0.45;
    pts.push({
      x: (rng() - 0.5) * 0.06,
      y: noseY,
      z: 0.65 + Math.sin(t * Math.PI) * 0.18,
      color: [skin[0] - 10, skin[1] - 10, skin[2] - 5],
      splatSize: 0.04 + Math.sin(t * Math.PI) * 0.02,
    });
  }
  // Nostrils
  [-0.06, 0.06].forEach(nx => {
    for (let i = 0; i < 5; i++) {
      pts.push({
        x: nx + (rng() - 0.5) * 0.04,
        y: -0.15 + (rng() - 0.5) * 0.03,
        z: 0.68 + rng() * 0.02,
        color: [160, 110, 90],
        splatSize: 0.03,
      });
    }
  });

  // Mouth / lips
  for (let i = 0; i < 28; i++) {
    const t = (i / 27) * Math.PI;
    pts.push({
      x: Math.cos(t) * 0.22,
      y: -0.38 + Math.sin(t) * 0.04,
      z: 0.56 + Math.sin(t) * 0.06,
      color: lipCol,
      splatSize: 0.04,
    });
    // Lower lip
    if (i % 2 === 0) {
      pts.push({
        x: Math.cos(t) * 0.19,
        y: -0.42 - Math.sin(t) * 0.03,
        z: 0.54 + Math.sin(t) * 0.04,
        color: [lipCol[0] - 20, lipCol[1] - 10, lipCol[2] - 5],
        splatSize: 0.04,
      });
    }
  }

  // Hair (top/back)
  for (let i = 0; i < 120; i++) {
    const theta = rng() * Math.PI * 2;
    const phi = rng() * Math.PI * 0.5;
    const r = 0.9 + rng() * 0.15;
    const x = r * 0.85 * Math.sin(phi) * Math.cos(theta);
    const y = 0.55 + r * 0.5 * Math.cos(phi);
    const z = r * 0.8 * Math.sin(phi) * Math.sin(theta);
    if (y > 0.2) {
      pts.push({
        x,
        y,
        z: z * 0.8,
        color: [
          hairCol[0] + Math.round((rng() - 0.5) * 20),
          hairCol[1] + Math.round((rng() - 0.5) * 15),
          hairCol[2] + Math.round((rng() - 0.5) * 15),
        ],
        splatSize: 0.07 + rng() * 0.04,
      });
    }
  }

  // Ears
  [-0.78, 0.78].forEach(ex => {
    for (let i = 0; i < 10; i++) {
      pts.push({
        x: ex + (rng() - 0.5) * 0.1,
        y: 0.15 + (rng() - 0.5) * 0.2,
        z: 0.1 + (rng() - 0.5) * 0.08,
        color: [skin[0] - 15, skin[1] - 15, skin[2] - 10],
        splatSize: 0.05,
      });
    }
  });

  return pts;
}

export function PointCloudDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState({ x: 0.3, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const [autoRotate, setAutoRotate] = useState(true);
  const autoRotateRef = useRef<number | null>(null);

  // Morph progress: 0 = point cloud, 1 = gaussian splats
  const [morphTarget, setMorphTarget] = useState(0);
  const morphRef = useRef(0);
  const morphAnimRef = useRef<number | null>(null);

  const [pointCount, setPointCount] = useState(0);
  const pointsRef = useRef<Point3D[]>([]);

  // Generate points once with seeded random
  useEffect(() => {
    const rng = seededRandom(42);
    const pts = generateFacePoints(rng);
    pointsRef.current = pts;
    setPointCount(pts.length);
  }, []);

  // Smooth morph animation
  useEffect(() => {
    if (morphAnimRef.current) cancelAnimationFrame(morphAnimRef.current);

    const animateMorph = () => {
      const diff = morphTarget - morphRef.current;
      if (Math.abs(diff) < 0.005) {
        morphRef.current = morphTarget;
        return;
      }
      morphRef.current += diff * 0.08;
      morphAnimRef.current = requestAnimationFrame(animateMorph);
    };
    morphAnimRef.current = requestAnimationFrame(animateMorph);

    return () => { if (morphAnimRef.current) cancelAnimationFrame(morphAnimRef.current); };
  }, [morphTarget]);

  // Auto rotation
  useEffect(() => {
    if (!autoRotate) {
      if (autoRotateRef.current) cancelAnimationFrame(autoRotateRef.current);
      return;
    }
    const animate = () => {
      setRotation(prev => ({ ...prev, y: prev.y + 0.008 }));
      autoRotateRef.current = requestAnimationFrame(animate);
    };
    autoRotateRef.current = requestAnimationFrame(animate);
    return () => { if (autoRotateRef.current) cancelAnimationFrame(autoRotateRef.current); };
  }, [autoRotate]);

  // Render loop
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const scale = Math.min(w, h) * 0.38;
    const morph = morphRef.current;
    const points = pointsRef.current;

    // Dark gradient background
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#16162a');
    bg.addColorStop(1, '#1a1a2e');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Subtle grid
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1;
    for (let gx = 0; gx < w; gx += 30) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke();
    }
    for (let gy = 0; gy < h; gy += 30) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke();
    }

    const cosY = Math.cos(rotation.y);
    const sinY = Math.sin(rotation.y);
    const cosX = Math.cos(rotation.x);
    const sinX = Math.sin(rotation.x);

    // Project and sort
    const projected = points.map((p, idx) => {
      const x1 = p.x * cosY - p.z * sinY;
      const z1 = p.x * sinY + p.z * cosY;
      const y1 = p.y * cosX - z1 * sinX;
      const z2 = p.y * sinX + z1 * cosX;

      const perspective = 4;
      const zp = z2 + perspective;
      const factor = perspective / zp;

      return {
        sx: cx + x1 * scale * factor,
        sy: cy - y1 * scale * factor,
        z: z2,
        color: p.color,
        splatSize: p.splatSize,
        idx,
      };
    });

    projected.sort((a, b) => a.z - b.z);

    // Draw points/splats
    projected.forEach(p => {
      const depthFade = Math.max(0.3, Math.min(1, 0.5 + (p.z + 1) * 0.3));
      const r = p.color[0];
      const g = p.color[1];
      const b = p.color[2];

      if (morph < 0.01) {
        // Pure point mode
        const size = 2 + depthFade * 1.5;
        ctx.fillStyle = `rgb(${Math.round(r * depthFade)},${Math.round(g * depthFade)},${Math.round(b * depthFade)})`;
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, size, 0, Math.PI * 2);
        ctx.fill();
      } else if (morph > 0.99) {
        // Pure splat mode with glow
        const splatR = p.splatSize * scale * 0.35;
        const grad = ctx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, splatR);
        grad.addColorStop(0, `rgba(${r},${g},${b},${0.85 * depthFade})`);
        grad.addColorStop(0.4, `rgba(${r},${g},${b},${0.5 * depthFade})`);
        grad.addColorStop(0.7, `rgba(${r},${g},${b},${0.15 * depthFade})`);
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, splatR, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Morphing: blend point + splat
        const pointAlpha = 1 - morph;
        const splatAlpha = morph;

        // Point part
        const pointSize = (2 + depthFade * 1.5) * (1 - morph * 0.5);
        ctx.fillStyle = `rgba(${Math.round(r * depthFade)},${Math.round(g * depthFade)},${Math.round(b * depthFade)},${pointAlpha})`;
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, pointSize, 0, Math.PI * 2);
        ctx.fill();

        // Splat part (growing)
        const splatR = p.splatSize * scale * 0.35 * morph;
        if (splatR > 1) {
          const grad = ctx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, splatR);
          grad.addColorStop(0, `rgba(${r},${g},${b},${0.7 * depthFade * splatAlpha})`);
          grad.addColorStop(0.5, `rgba(${r},${g},${b},${0.25 * depthFade * splatAlpha})`);
          grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.sx, p.sy, splatR, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });

    // HUD overlay
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(8, 8, 140, 48);
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.strokeRect(8, 8, 140, 48);

    ctx.font = '11px monospace';
    ctx.fillStyle = '#c4713b';
    ctx.fillText(`Points: ${points.length}`, 16, 24);
    ctx.fillStyle = morph > 0.5 ? '#6bcb77' : '#787268';
    const modeLabel = morph < 0.1 ? 'Point Cloud' : morph > 0.9 ? 'Gaussian Splats' : `Morphing ${Math.round(morph * 100)}%`;
    ctx.fillText(modeLabel, 16, 40);

    // Formula at bottom
    if (morph > 0.5) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(8, h - 30, w - 16, 22);
      ctx.font = '10px monospace';
      ctx.fillStyle = '#c4713b';
      ctx.textAlign = 'center';
      ctx.fillText('G(x) = exp(-0.5 (x-\u03BC)\u1D40 \u03A3\u207B\u00B9 (x-\u03BC))', w / 2, h - 14);
      ctx.textAlign = 'left';
    }
  }, [rotation]);

  // Render on every frame
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

  // Mouse interaction
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setAutoRotate(false);
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - lastMouseRef.current.x;
    const dy = e.clientY - lastMouseRef.current.y;
    setRotation(prev => ({
      x: Math.max(-1, Math.min(1, prev.x + dy * 0.008)),
      y: prev.y + dx * 0.008,
    }));
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => setIsDragging(false);

  // Touch support
  const handleTouchStart = (e: React.TouchEvent) => {
    setAutoRotate(false);
    const t = e.touches[0];
    lastMouseRef.current = { x: t.clientX, y: t.clientY };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const t = e.touches[0];
    const dx = t.clientX - lastMouseRef.current.x;
    const dy = t.clientY - lastMouseRef.current.y;
    setRotation(prev => ({
      x: Math.max(-1, Math.min(1, prev.x + dy * 0.008)),
      y: prev.y + dx * 0.008,
    }));
    lastMouseRef.current = { x: t.clientX, y: t.clientY };
  };

  return (
    <div className="card p-6">
      <h3 className="font-semibold mb-2">Point Cloud to Gaussians</h3>
      <p className="text-sm text-[var(--text-muted)] mb-6">
        3DGS starts from SfM point cloud and initializes Gaussians at each point.
        Drag to rotate. Toggle to see how points smoothly become splats.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            className="w-full rounded-lg border border-[var(--border)] cursor-grab active:cursor-grabbing"
          />

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setMorphTarget(morphTarget < 0.5 ? 1 : 0)}
              className={`flex-1 py-2 rounded font-medium text-sm transition-colors ${
                morphTarget > 0.5 ? 'bg-[var(--accent)] text-white' : 'bg-[var(--surface-2)]'
              }`}
            >
              {morphTarget > 0.5 ? 'Gaussian Splats' : 'Point Cloud'}
            </button>
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={`px-4 py-2 rounded text-sm transition-colors ${
                autoRotate ? 'bg-green-500/20 text-green-400' : 'bg-[var(--surface-2)]'
              }`}
            >
              {autoRotate ? 'Stop' : 'Rotate'}
            </button>
          </div>

          {/* Morph slider */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-[var(--text-muted)] mb-1">
              <span>Points</span>
              <span>Splats</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={morphTarget}
              onChange={(e) => setMorphTarget(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-[var(--surface-2)] rounded">
            <p className="font-medium text-sm mb-3">SfM to Gaussian Pipeline</p>
            <div className="space-y-2.5 text-xs">
              {[
                { num: 1, color: '#3498db', text: 'Multi-view images \u2192 COLMAP SfM' },
                { num: 2, color: '#9b59b6', text: `Sparse point cloud (${pointCount} points)` },
                { num: 3, color: '#2ecc71', text: 'Initialize Gaussian at each point' },
                { num: 4, color: '#e74c3c', text: 'Optimize: position, covariance, color, opacity' },
                { num: 5, color: '#f39c12', text: 'Adaptive densify/prune for detail' },
              ].map(step => (
                <div key={step.num} className="flex items-center gap-2">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                    style={{ backgroundColor: step.color }}
                  >{step.num}</span>
                  <span>{step.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-[var(--surface-2)] rounded font-mono text-xs text-center">
            <span className="text-[var(--text-muted)]">Per Gaussian: </span>
            <span className="text-[#c4713b]">{'\u03BC'}</span>
            <span className="text-[var(--text-muted)]">(pos) + </span>
            <span className="text-[#c4713b]">{'\u03A3'}</span>
            <span className="text-[var(--text-muted)]">(cov) + </span>
            <span className="text-[#c4713b]">c</span>
            <span className="text-[var(--text-muted)]">(SH) + </span>
            <span className="text-[#c4713b]">{'\u03B1'}</span>
            <span className="text-[var(--text-muted)]">(opacity)</span>
          </div>

          <div className="p-3 border border-[var(--border)] rounded text-sm">
            <p className="font-medium mb-1">Key Insight</p>
            <p className="text-xs text-[var(--text-muted)]">
              Each SfM point becomes a 3D Gaussian with learnable parameters.
              During training, Gaussians can split (densify in under-reconstructed areas)
              or be pruned (remove near-transparent splats) to optimally represent the scene.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PointCloudDemo;
