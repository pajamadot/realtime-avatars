'use client';

import { useState, useRef, useEffect } from 'react';

export function MotionFieldDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [motionType, setMotionType] = useState<'speaking' | 'nodding' | 'custom'>('speaking');
  const [showVectors, setShowVectors] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0);
  const [customMotion, setCustomMotion] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 0.05) % (Math.PI * 2));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    const gridSize = 20;
    const centerX = width / 2;
    const centerY = height / 2 - 20;

    // Define face region
    const faceRadiusX = 80;
    const faceRadiusY = 100;
    const mouthY = centerY + 30;
    const mouthRadiusX = 35;
    const mouthRadiusY = 15;

    // Calculate motion vectors based on type
    const getMotionVector = (x: number, y: number): { dx: number, dy: number, magnitude: number } => {
      // Distance from face center
      const normalizedX = (x - centerX) / faceRadiusX;
      const normalizedY = (y - centerY) / faceRadiusY;
      const distFromCenter = Math.sqrt(normalizedX * normalizedX + normalizedY * normalizedY);

      // Distance from mouth
      const mouthNormalizedX = (x - centerX) / mouthRadiusX;
      const mouthNormalizedY = (y - mouthY) / mouthRadiusY;
      const distFromMouth = Math.sqrt(mouthNormalizedX * mouthNormalizedX + mouthNormalizedY * mouthNormalizedY);

      let dx = 0;
      let dy = 0;

      if (motionType === 'speaking') {
        // Mouth region has vertical oscillation
        if (distFromMouth < 2) {
          const mouthInfluence = Math.max(0, 1 - distFromMouth / 2);
          dy = Math.sin(animationPhase * 3) * 8 * mouthInfluence;

          // Lips move apart
          if (y > mouthY) {
            dy += Math.abs(Math.sin(animationPhase * 3)) * 4 * mouthInfluence;
          } else if (y < mouthY - 10) {
            dy -= Math.abs(Math.sin(animationPhase * 3)) * 2 * mouthInfluence;
          }
        }

        // Cheeks have slight horizontal motion
        if (Math.abs(normalizedX) > 0.3 && Math.abs(normalizedY) < 0.5 && distFromCenter < 1) {
          dx = Math.sin(animationPhase * 3) * 2 * Math.sign(normalizedX);
        }

      } else if (motionType === 'nodding') {
        // Global vertical motion with rotation
        if (distFromCenter < 1.2) {
          const faceInfluence = Math.max(0, 1 - distFromCenter / 1.2);
          dy = Math.sin(animationPhase * 2) * 6 * faceInfluence;

          // Add rotation component (higher points move more horizontally when nodding)
          dx = Math.sin(animationPhase * 2) * normalizedY * 4 * faceInfluence;
        }

      } else if (motionType === 'custom') {
        // User-defined motion
        if (distFromCenter < 1.2) {
          const faceInfluence = Math.max(0, 1 - distFromCenter / 1.2);
          dx = customMotion.x * 10 * faceInfluence;
          dy = customMotion.y * 10 * faceInfluence;
        }
      }

      const magnitude = Math.sqrt(dx * dx + dy * dy);
      return { dx, dy, magnitude };
    };

    // Draw face outline
    ctx.strokeStyle = '#444466';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, faceRadiusX, faceRadiusY, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Draw eyes
    ctx.fillStyle = '#555577';
    ctx.beginPath();
    ctx.ellipse(centerX - 25, centerY - 20, 12, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(centerX + 25, centerY - 20, 12, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw mouth region
    ctx.strokeStyle = '#555577';
    ctx.beginPath();
    ctx.ellipse(centerX, mouthY, mouthRadiusX, mouthRadiusY, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Draw motion field
    for (let x = gridSize; x < width - gridSize; x += gridSize) {
      for (let y = gridSize; y < height - gridSize; y += gridSize) {
        const { dx, dy, magnitude } = getMotionVector(x, y);

        if (magnitude < 0.5) continue;

        if (showHeatmap) {
          // Draw heatmap
          const intensity = Math.min(magnitude / 10, 1);
          const r = Math.floor(255 * intensity);
          const g = Math.floor(100 * (1 - intensity));
          const b = Math.floor(100);

          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.5)`;
          ctx.fillRect(x - gridSize / 2, y - gridSize / 2, gridSize, gridSize);
        }

        if (showVectors) {
          // Draw vector arrow
          const scale = 1.5;
          const endX = x + dx * scale;
          const endY = y + dy * scale;

          // Color based on magnitude
          const hue = 200 - magnitude * 10;
          ctx.strokeStyle = `hsl(${hue}, 80%, 60%)`;
          ctx.lineWidth = 1.5;

          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(endX, endY);
          ctx.stroke();

          // Arrow head
          const angle = Math.atan2(dy, dx);
          const arrowSize = 4;
          ctx.beginPath();
          ctx.moveTo(endX, endY);
          ctx.lineTo(
            endX - arrowSize * Math.cos(angle - Math.PI / 6),
            endY - arrowSize * Math.sin(angle - Math.PI / 6)
          );
          ctx.moveTo(endX, endY);
          ctx.lineTo(
            endX - arrowSize * Math.cos(angle + Math.PI / 6),
            endY - arrowSize * Math.sin(angle + Math.PI / 6)
          );
          ctx.stroke();

          // Origin dot
          ctx.fillStyle = `hsl(${hue}, 80%, 60%)`;
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Draw legend
    ctx.fillStyle = '#888888';
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Motion Field (Optical Flow)', 10, 20);

    // Motion type indicator
    ctx.fillStyle = '#aaaaaa';
    ctx.font = '10px monospace';
    const typeLabel = motionType === 'speaking' ? 'Speaking animation' :
                      motionType === 'nodding' ? 'Head nodding' : 'Custom motion';
    ctx.fillText(typeLabel, 10, height - 10);

  }, [motionType, showVectors, showHeatmap, animationPhase, customMotion]);

  return (
    <div className="card p-6">
      <h3 className="font-semibold mb-2">Motion Field Visualization</h3>
      <p className="text-sm text-[var(--muted)] mb-4">
        Optical flow shows per-pixel motion vectors. This is how video models understand and predict movement.
      </p>

      <canvas
        ref={canvasRef}
        width={400}
        height={350}
        className="w-full max-w-[400px] mb-4 rounded"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="text-xs text-[var(--muted)] block mb-1">Motion Type</label>
          <select
            value={motionType}
            onChange={(e) => setMotionType(e.target.value as typeof motionType)}
            className="w-full px-2 py-1 rounded bg-[var(--card-bg)] border border-[var(--border)] text-sm"
          >
            <option value="speaking">Speaking</option>
            <option value="nodding">Head Nod</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showVectors}
              onChange={(e) => setShowVectors(e.target.checked)}
            />
            Show vectors
          </label>
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showHeatmap}
              onChange={(e) => setShowHeatmap(e.target.checked)}
            />
            Show heatmap
          </label>
        </div>
      </div>

      {motionType === 'custom' && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs text-[var(--muted)] block mb-1">X Motion: {customMotion.x.toFixed(1)}</label>
            <input
              type="range"
              min="-1"
              max="1"
              step="0.1"
              value={customMotion.x}
              onChange={(e) => setCustomMotion(prev => ({ ...prev, x: Number(e.target.value) }))}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-xs text-[var(--muted)] block mb-1">Y Motion: {customMotion.y.toFixed(1)}</label>
            <input
              type="range"
              min="-1"
              max="1"
              step="0.1"
              value={customMotion.y}
              onChange={(e) => setCustomMotion(prev => ({ ...prev, y: Number(e.target.value) }))}
              className="w-full"
            />
          </div>
        </div>
      )}

      <div className="p-3 bg-[var(--card-bg-alt)] rounded text-xs">
        <p className="font-medium mb-1">In Video Generation</p>
        <p className="text-[var(--muted)]">
          Motion fields help maintain temporal consistency. The model predicts motion vectors from audio,
          then warps the previous frame accordingly before refining with diffusion.
        </p>
      </div>
    </div>
  );
}
