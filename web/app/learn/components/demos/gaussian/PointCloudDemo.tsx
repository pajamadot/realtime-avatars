'use client';

import { useState, useEffect, useRef } from 'react';

interface Point3D {
  x: number;
  y: number;
  z: number;
  color: [number, number, number];
}

export function PointCloudDemo() {
  const [points, setPoints] = useState<Point3D[]>([]);
  const [rotation, setRotation] = useState({ x: 0.3, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });
  const [pointSize, setPointSize] = useState(3);
  const [showGaussians, setShowGaussians] = useState(false);
  const [gaussianScale, setGaussianScale] = useState(0.5);
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const autoRotateRef = useRef<number | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);

  // Generate a face-like point cloud
  useEffect(() => {
    const newPoints: Point3D[] = [];
    const faceColor: [number, number, number] = [255, 200, 160];
    const eyeColor: [number, number, number] = [60, 40, 30];
    const lipColor: [number, number, number] = [200, 100, 100];

    // Face surface (ellipsoid)
    for (let i = 0; i < 200; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const r = 1;

      const x = r * 0.8 * Math.sin(phi) * Math.cos(theta);
      const y = r * 1.1 * Math.cos(phi);
      const z = r * 0.7 * Math.sin(phi) * Math.sin(theta);

      // Only front half
      if (z > -0.3) {
        newPoints.push({
          x: x + (Math.random() - 0.5) * 0.05,
          y: y + (Math.random() - 0.5) * 0.05,
          z: z + (Math.random() - 0.5) * 0.05,
          color: faceColor,
        });
      }
    }

    // Eyes
    const eyePositions = [
      { x: -0.25, y: 0.2, z: 0.6 },
      { x: 0.25, y: 0.2, z: 0.6 },
    ];
    eyePositions.forEach(pos => {
      for (let i = 0; i < 15; i++) {
        newPoints.push({
          x: pos.x + (Math.random() - 0.5) * 0.15,
          y: pos.y + (Math.random() - 0.5) * 0.08,
          z: pos.z + (Math.random() - 0.5) * 0.05,
          color: eyeColor,
        });
      }
    });

    // Nose
    for (let i = 0; i < 20; i++) {
      const t = i / 20;
      newPoints.push({
        x: (Math.random() - 0.5) * 0.1,
        y: -0.1 + t * 0.4,
        z: 0.65 + Math.sin(t * Math.PI) * 0.15,
        color: faceColor,
      });
    }

    // Mouth
    for (let i = 0; i < 20; i++) {
      const t = (i / 20) * Math.PI;
      newPoints.push({
        x: Math.cos(t) * 0.2,
        y: -0.4,
        z: 0.55 + Math.sin(t) * 0.05,
        color: lipColor,
      });
    }

    setPoints(newPoints);
  }, []);

  // Auto rotation
  useEffect(() => {
    if (!autoRotate) {
      if (autoRotateRef.current) cancelAnimationFrame(autoRotateRef.current);
      return;
    }

    const animate = () => {
      setRotation(prev => ({ ...prev, y: prev.y + 0.01 }));
      autoRotateRef.current = requestAnimationFrame(animate);
    };

    autoRotateRef.current = requestAnimationFrame(animate);
    return () => {
      if (autoRotateRef.current) cancelAnimationFrame(autoRotateRef.current);
    };
  }, [autoRotate]);

  // Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = 120;

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    // Project and sort points by depth
    const projected = points.map((p, idx) => {
      // Rotate around Y axis
      const cosY = Math.cos(rotation.y);
      const sinY = Math.sin(rotation.y);
      const x1 = p.x * cosY - p.z * sinY;
      const z1 = p.x * sinY + p.z * cosY;

      // Rotate around X axis
      const cosX = Math.cos(rotation.x);
      const sinX = Math.sin(rotation.x);
      const y1 = p.y * cosX - z1 * sinX;
      const z2 = p.y * sinX + z1 * cosX;

      return {
        x: centerX + x1 * scale,
        y: centerY - y1 * scale,
        z: z2,
        color: p.color,
        idx,
      };
    });

    // Sort by depth (painter's algorithm)
    projected.sort((a, b) => a.z - b.z);

    // Draw points/gaussians
    projected.forEach(p => {
      const depthFade = 0.5 + (p.z + 1) * 0.25;
      const size = pointSize * depthFade;
      const isSelected = selectedPoint === p.idx;

      if (showGaussians) {
        // Draw as Gaussian splat
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * gaussianScale * 10);
        gradient.addColorStop(0, `rgba(${p.color[0]}, ${p.color[1]}, ${p.color[2]}, ${0.8 * depthFade})`);
        gradient.addColorStop(0.5, `rgba(${p.color[0]}, ${p.color[1]}, ${p.color[2]}, ${0.3 * depthFade})`);
        gradient.addColorStop(1, `rgba(${p.color[0]}, ${p.color[1]}, ${p.color[2]}, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size * gaussianScale * 10, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Draw as point
        ctx.fillStyle = isSelected
          ? '#ff6b6b'
          : `rgb(${Math.round(p.color[0] * depthFade)}, ${Math.round(p.color[1] * depthFade)}, ${Math.round(p.color[2] * depthFade)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Info
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '11px sans-serif';
    ctx.fillText(`${points.length} points`, 10, 20);
    ctx.fillText(showGaussians ? 'Gaussian mode' : 'Point mode', 10, 35);

  }, [points, rotation, pointSize, showGaussians, gaussianScale, selectedPoint]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setAutoRotate(false);
    setLastMouse({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - lastMouse.x;
    const dy = e.clientY - lastMouse.y;
    setRotation(prev => ({
      x: prev.x + dy * 0.01,
      y: prev.y + dx * 0.01,
    }));
    setLastMouse({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className="card p-6">
      <h3 className="font-semibold mb-2">Point Cloud to Gaussians</h3>
      <p className="text-sm text-[var(--muted)] mb-6">
        3DGS starts from SfM point cloud and initializes Gaussians at each point.
        Drag to rotate. Toggle to see how points become splats.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Canvas */}
        <div>
          <canvas
            ref={canvasRef}
            width={350}
            height={350}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="w-full rounded-lg border border-[var(--border)] cursor-grab active:cursor-grabbing"
          />

          {/* Toggle */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setShowGaussians(!showGaussians)}
              className={`flex-1 py-2 rounded font-medium text-sm transition-colors ${
                showGaussians ? 'bg-[var(--accent)] text-white' : 'bg-[var(--card-bg-alt)]'
              }`}
            >
              {showGaussians ? 'Gaussian Splats' : 'Point Cloud'}
            </button>
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={`badge ${autoRotate ? 'bg-[var(--accent)]/20' : ''}`}
            >
              {autoRotate ? 'Stop' : 'Rotate'}
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <div className="p-4 bg-[var(--card-bg-alt)] rounded">
            <div className="flex justify-between text-sm mb-2">
              <span>Point Size</span>
              <span className="font-mono">{pointSize}px</span>
            </div>
            <input
              type="range"
              min={1}
              max={8}
              value={pointSize}
              onChange={(e) => setPointSize(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {showGaussians && (
            <div className="p-4 bg-[var(--card-bg-alt)] rounded">
              <div className="flex justify-between text-sm mb-2">
                <span>Gaussian Scale</span>
                <span className="font-mono">{gaussianScale.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min={0.2}
                max={2}
                step={0.1}
                value={gaussianScale}
                onChange={(e) => setGaussianScale(Number(e.target.value))}
                className="w-full"
              />
            </div>
          )}

          <div className="p-4 bg-[var(--card-bg-alt)] rounded">
            <p className="font-medium text-sm mb-3">SfM → Gaussian Pipeline</p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#3498db] flex items-center justify-center text-white">1</span>
                <span>Multi-view images → COLMAP SfM</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#9b59b6] flex items-center justify-center text-white">2</span>
                <span>Sparse point cloud (3D positions)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#2ecc71] flex items-center justify-center text-white">3</span>
                <span>Initialize Gaussian at each point</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#e74c3c] flex items-center justify-center text-white">4</span>
                <span>Optimize position, covariance, color</span>
              </div>
            </div>
          </div>

          <div className="p-3 border border-[var(--border)] rounded text-sm">
            <p className="font-medium mb-1">Key Insight</p>
            <p className="text-xs text-[var(--muted)]">
              Each SfM point becomes a Gaussian with learnable parameters.
              During training, Gaussians can split (densify) or merge (prune)
              to better represent the scene.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PointCloudDemo;
