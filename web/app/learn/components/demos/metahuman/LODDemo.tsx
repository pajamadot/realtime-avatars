'use client';

import { useState, useEffect, useRef } from 'react';

interface LODLevel {
  name: string;
  triangles: number;
  vertices: number;
  textureSize: string;
  distance: string;
}

const LOD_LEVELS: LODLevel[] = [
  { name: 'LOD 0', triangles: 50000, vertices: 25000, textureSize: '4K', distance: '0-2m' },
  { name: 'LOD 1', triangles: 15000, vertices: 8000, textureSize: '2K', distance: '2-5m' },
  { name: 'LOD 2', triangles: 5000, vertices: 2500, textureSize: '1K', distance: '5-15m' },
  { name: 'LOD 3', triangles: 1500, vertices: 800, textureSize: '512', distance: '15-30m' },
  { name: 'LOD 4', triangles: 500, vertices: 300, textureSize: '256', distance: '30m+' },
];

export function LODDemo() {
  const [distance, setDistance] = useState(3);
  const [autoLOD, setAutoLOD] = useState(true);
  const [manualLOD, setManualLOD] = useState(0);
  const [showWireframe, setShowWireframe] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getCurrentLOD = (): number => {
    if (!autoLOD) return manualLOD;
    if (distance < 2) return 0;
    if (distance < 5) return 1;
    if (distance < 15) return 2;
    if (distance < 30) return 3;
    return 4;
  };

  const currentLOD = getCurrentLOD();
  const lodInfo = LOD_LEVELS[currentLOD];

  // Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    // Calculate face size based on distance (perspective)
    const baseFaceSize = 150;
    const faceSize = Math.max(20, baseFaceSize / (distance * 0.3 + 0.5));
    const centerX = width / 2;
    const centerY = height / 2 - 20;

    // Draw "ground" grid for depth reference
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 10; i++) {
      const y = height - 50 + i * 5;
      const spread = (10 - i) * 20;
      ctx.beginPath();
      ctx.moveTo(centerX - spread, y);
      ctx.lineTo(centerX + spread, y);
      ctx.stroke();
    }

    // Draw face with appropriate detail level
    const detailLevel = 1 - currentLOD / 4;

    // Face outline
    const faceColor = `rgb(255, ${200 - currentLOD * 10}, ${160 - currentLOD * 15})`;
    ctx.fillStyle = faceColor;

    if (showWireframe) {
      // Draw wireframe
      ctx.strokeStyle = '#4ecdc4';
      ctx.lineWidth = 1;

      // Number of vertices decreases with LOD
      const gridSize = Math.max(3, Math.floor(10 * detailLevel));

      // Draw simplified wireframe grid on face
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, faceSize * 0.8, faceSize, 0, 0, Math.PI * 2);
      ctx.stroke();

      for (let i = 0; i < gridSize; i++) {
        const angle = (i / gridSize) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
          centerX + Math.cos(angle) * faceSize * 0.8,
          centerY + Math.sin(angle) * faceSize
        );
        ctx.stroke();
      }

      // Concentric circles
      for (let r = 1; r <= Math.ceil(detailLevel * 3); r++) {
        ctx.beginPath();
        ctx.ellipse(
          centerX,
          centerY,
          faceSize * 0.8 * (r / 3),
          faceSize * (r / 3),
          0,
          0,
          Math.PI * 2
        );
        ctx.stroke();
      }
    } else {
      // Draw solid face
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, faceSize * 0.8, faceSize, 0, 0, Math.PI * 2);
      ctx.fill();

      // Eyes - detail decreases with LOD
      if (currentLOD < 4) {
        const eyeSize = faceSize * 0.15 * detailLevel + faceSize * 0.05;
        const eyeY = centerY - faceSize * 0.15;

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(centerX - faceSize * 0.25, eyeY, eyeSize, eyeSize * 0.6, 0, 0, Math.PI * 2);
        ctx.ellipse(centerX + faceSize * 0.25, eyeY, eyeSize, eyeSize * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();

        if (currentLOD < 3) {
          // Pupils
          ctx.fillStyle = '#3d2314';
          ctx.beginPath();
          ctx.arc(centerX - faceSize * 0.25, eyeY, eyeSize * 0.4, 0, Math.PI * 2);
          ctx.arc(centerX + faceSize * 0.25, eyeY, eyeSize * 0.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Mouth
      if (currentLOD < 4) {
        ctx.strokeStyle = '#c9544d';
        ctx.lineWidth = Math.max(1, 2 * detailLevel);
        ctx.beginPath();
        ctx.arc(centerX, centerY + faceSize * 0.2, faceSize * 0.2, 0.2 * Math.PI, 0.8 * Math.PI);
        ctx.stroke();
      }

      // Nose - only at high detail
      if (currentLOD < 2) {
        ctx.strokeStyle = 'rgba(150, 100, 80, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - faceSize * 0.1);
        ctx.lineTo(centerX - faceSize * 0.08, centerY + faceSize * 0.1);
        ctx.lineTo(centerX + faceSize * 0.08, centerY + faceSize * 0.1);
        ctx.stroke();
      }

      // Eyebrows - only at highest detail
      if (currentLOD === 0) {
        ctx.strokeStyle = '#5d4037';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX - faceSize * 0.25, centerY - faceSize * 0.35, faceSize * 0.15, 0.8 * Math.PI, 0.2 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(centerX + faceSize * 0.25, centerY - faceSize * 0.35, faceSize * 0.15, 0.8 * Math.PI, 0.2 * Math.PI);
        ctx.stroke();
      }
    }

    // Distance indicator
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${distance.toFixed(1)}m`, centerX, height - 15);

    // LOD indicator
    const lodColor =
      currentLOD === 0 ? '#2ecc71' : currentLOD === 1 ? '#3498db' : currentLOD === 2 ? '#f1c40f' : currentLOD === 3 ? '#e67e22' : '#e74c3c';
    ctx.fillStyle = lodColor;
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(lodInfo.name, 10, 20);

  }, [distance, currentLOD, showWireframe]);

  return (
    <div className="card p-6">
      <h3 className="font-semibold mb-2">Level of Detail (LOD) System</h3>
      <p className="text-sm text-[var(--text-muted)] mb-6">
        MetaHuman uses LOD to maintain performance. Closer = more triangles and higher textures.
        Far away = simplified mesh. The transition is seamless.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Canvas */}
        <div>
          <canvas
            ref={canvasRef}
            width={350}
            height={280}
            className="w-full rounded-lg border border-[var(--border)]"
          />

          {/* Toggles */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setShowWireframe(!showWireframe)}
              className={`flex-1 py-2 rounded font-medium text-sm transition-colors ${
                showWireframe ? 'bg-[#4ecdc4] text-white' : 'bg-[var(--surface-2)]'
              }`}
            >
              {showWireframe ? 'Wireframe' : 'Solid'}
            </button>
            <button
              onClick={() => setAutoLOD(!autoLOD)}
              className={`badge ${autoLOD ? 'bg-[var(--accent)]/20' : ''}`}
            >
              {autoLOD ? 'Auto LOD' : 'Manual'}
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <div className="p-4 bg-[var(--surface-2)] rounded">
            <div className="flex justify-between text-sm mb-2">
              <span>Camera Distance</span>
              <span className="font-mono">{distance.toFixed(1)}m</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={50}
              step={0.5}
              value={distance}
              onChange={(e) => setDistance(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {!autoLOD && (
            <div className="p-4 bg-[var(--surface-2)] rounded">
              <div className="flex justify-between text-sm mb-2">
                <span>Manual LOD Level</span>
                <span className="font-mono">{manualLOD}</span>
              </div>
              <input
                type="range"
                min={0}
                max={4}
                step={1}
                value={manualLOD}
                onChange={(e) => setManualLOD(Number(e.target.value))}
                className="w-full"
              />
            </div>
          )}

          {/* LOD info */}
          <div className="p-4 bg-[var(--surface-2)] rounded">
            <p className="font-medium text-sm mb-3">Current LOD Stats</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-[var(--surface-0)] rounded">
                <span className="text-[var(--text-muted)]">Triangles:</span>
                <span className="font-mono ml-1">{lodInfo.triangles.toLocaleString()}</span>
              </div>
              <div className="p-2 bg-[var(--surface-0)] rounded">
                <span className="text-[var(--text-muted)]">Vertices:</span>
                <span className="font-mono ml-1">{lodInfo.vertices.toLocaleString()}</span>
              </div>
              <div className="p-2 bg-[var(--surface-0)] rounded">
                <span className="text-[var(--text-muted)]">Texture:</span>
                <span className="font-mono ml-1">{lodInfo.textureSize}</span>
              </div>
              <div className="p-2 bg-[var(--surface-0)] rounded">
                <span className="text-[var(--text-muted)]">Range:</span>
                <span className="font-mono ml-1">{lodInfo.distance}</span>
              </div>
            </div>
          </div>

          {/* LOD levels table */}
          <div className="p-4 bg-[var(--surface-2)] rounded">
            <p className="font-medium text-sm mb-2">All LOD Levels</p>
            <div className="space-y-1 text-xs">
              {LOD_LEVELS.map((lod, i) => (
                <div
                  key={lod.name}
                  className={`flex justify-between p-1 rounded ${
                    i === currentLOD ? 'bg-[var(--accent)]/20' : ''
                  }`}
                >
                  <span className="font-medium">{lod.name}</span>
                  <span className="text-[var(--text-muted)]">
                    {lod.triangles.toLocaleString()} tris @ {lod.distance}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 border border-[var(--border)] rounded text-sm">
            <p className="font-medium mb-1">Performance Impact</p>
            <p className="text-xs text-[var(--text-muted)]">
              LOD 0 to LOD 4 is a 100x reduction in triangles. In a scene with multiple
              MetaHumans, this is essential for maintaining 60 FPS.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LODDemo;
