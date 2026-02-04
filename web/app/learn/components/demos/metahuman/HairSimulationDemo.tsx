'use client';

import { useState, useRef, useEffect } from 'react';

interface HairStrand {
  points: { x: number, y: number }[];
  baseX: number;
  baseY: number;
  length: number;
  stiffness: number;
}

export function HairSimulationDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [windStrength, setWindStrength] = useState(0);
  const [gravity, setGravity] = useState(0.5);
  const [stiffness, setStiffness] = useState(0.3);
  const [hairDensity, setHairDensity] = useState<'sparse' | 'medium' | 'dense'>('medium');
  const [showForces, setShowForces] = useState(false);
  const strandsRef = useRef<HairStrand[]>([]);
  const animationRef = useRef<number | null>(null);
  const timeRef = useRef(0);

  // Initialize hair strands
  useEffect(() => {
    const strandCounts = { sparse: 25, medium: 50, dense: 100 };
    const count = strandCounts[hairDensity];
    const strands: HairStrand[] = [];

    const headCenterX = 250;
    const headTopY = 80;
    const headRadius = 60;

    for (let i = 0; i < count; i++) {
      // Distribute strands along the top of the head
      const angle = Math.PI * (0.2 + 0.6 * (i / count));
      const baseX = headCenterX + Math.cos(angle) * headRadius;
      const baseY = headTopY + headRadius - Math.sin(angle) * headRadius * 0.8;

      const length = 50 + Math.random() * 40;
      const segments = 8;
      const points: { x: number, y: number }[] = [];

      for (let j = 0; j <= segments; j++) {
        points.push({
          x: baseX,
          y: baseY + (j / segments) * length,
        });
      }

      strands.push({
        points,
        baseX,
        baseY,
        length,
        stiffness: 0.2 + Math.random() * 0.2,
      });
    }

    strandsRef.current = strands;
  }, [hairDensity]);

  // Physics simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const simulate = () => {
      timeRef.current += 0.016;
      const time = timeRef.current;

      // Wind oscillation
      const windX = windStrength * Math.sin(time * 2) * 2;
      const windVariation = Math.sin(time * 5) * 0.3;

      strandsRef.current.forEach(strand => {
        // Apply forces to each point (except the root)
        for (let i = 1; i < strand.points.length; i++) {
          const point = strand.points[i];
          const prevPoint = strand.points[i - 1];

          // Calculate target position (straight down from previous point)
          const segmentLength = strand.length / (strand.points.length - 1);

          // Gravity force
          const gravityForce = gravity * 2;

          // Wind force (varies along the strand)
          const windInfluence = (i / strand.points.length);
          const localWind = (windX + windVariation * Math.sin(time * 3 + i)) * windInfluence;

          // Target position with forces applied
          let targetX = prevPoint.x + localWind;
          let targetY = prevPoint.y + segmentLength + gravityForce * (i / strand.points.length);

          // Stiffness: pull towards original straight-down position
          const originalX = strand.baseX;
          const originalY = strand.baseY + (i / (strand.points.length - 1)) * strand.length;

          targetX += (originalX - targetX) * stiffness * strand.stiffness;
          targetY += (originalY - targetY) * stiffness * strand.stiffness * 0.5;

          // Constraint: maintain segment length
          const dx = targetX - prevPoint.x;
          const dy = targetY - prevPoint.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist > 0) {
            point.x = prevPoint.x + (dx / dist) * segmentLength;
            point.y = prevPoint.y + (dy / dist) * segmentLength;
          }

          // Smoothing
          point.x = point.x * 0.8 + targetX * 0.2;
          point.y = point.y * 0.8 + targetY * 0.2;
        }
      });

      // Render
      render(ctx, canvas.width, canvas.height, windX);

      animationRef.current = requestAnimationFrame(simulate);
    };

    const render = (ctx: CanvasRenderingContext2D, width: number, height: number, windX: number) => {
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, width, height);

      const headCenterX = 250;
      const headCenterY = 150;
      const headRadius = 60;

      // Draw head
      ctx.beginPath();
      ctx.ellipse(headCenterX, headCenterY, headRadius, headRadius * 1.2, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#8b7355';
      ctx.fill();
      ctx.strokeStyle = '#6b5344';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw face features
      ctx.fillStyle = '#6b5344';
      ctx.beginPath();
      ctx.ellipse(headCenterX - 20, headCenterY - 10, 8, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(headCenterX + 20, headCenterY - 10, 8, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#6b5344';
      ctx.beginPath();
      ctx.arc(headCenterX, headCenterY + 20, 15, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();

      // Draw hair strands
      strandsRef.current.forEach((strand, strandIdx) => {
        // Hair color variation
        const hue = 25 + (strandIdx % 10);
        const lightness = 20 + (strandIdx % 15);

        ctx.beginPath();
        ctx.moveTo(strand.points[0].x, strand.points[0].y);

        for (let i = 1; i < strand.points.length; i++) {
          const point = strand.points[i];
          const prevPoint = strand.points[i - 1];

          // Use quadratic curves for smoother hair
          if (i < strand.points.length - 1) {
            const nextPoint = strand.points[i + 1];
            const midX = (point.x + nextPoint.x) / 2;
            const midY = (point.y + nextPoint.y) / 2;
            ctx.quadraticCurveTo(point.x, point.y, midX, midY);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        }

        ctx.strokeStyle = `hsl(${hue}, 40%, ${lightness}%)`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      // Draw force indicators
      if (showForces) {
        // Wind arrow
        ctx.strokeStyle = '#66aaff';
        ctx.lineWidth = 2;
        const arrowY = 50;
        const arrowStartX = 150;
        const arrowLength = Math.abs(windX) * 10;

        if (arrowLength > 5) {
          ctx.beginPath();
          ctx.moveTo(arrowStartX, arrowY);
          ctx.lineTo(arrowStartX + arrowLength * Math.sign(windX), arrowY);
          ctx.stroke();

          // Arrow head
          ctx.beginPath();
          const arrowEndX = arrowStartX + arrowLength * Math.sign(windX);
          ctx.moveTo(arrowEndX, arrowY);
          ctx.lineTo(arrowEndX - 8 * Math.sign(windX), arrowY - 5);
          ctx.lineTo(arrowEndX - 8 * Math.sign(windX), arrowY + 5);
          ctx.closePath();
          ctx.fillStyle = '#66aaff';
          ctx.fill();
        }

        ctx.fillStyle = '#66aaff';
        ctx.font = '10px monospace';
        ctx.fillText('Wind', arrowStartX - 30, arrowY + 4);

        // Gravity arrow
        ctx.strokeStyle = '#66ff66';
        const gravArrowX = 400;
        const gravArrowStartY = 50;
        const gravArrowLength = gravity * 50;

        ctx.beginPath();
        ctx.moveTo(gravArrowX, gravArrowStartY);
        ctx.lineTo(gravArrowX, gravArrowStartY + gravArrowLength);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(gravArrowX, gravArrowStartY + gravArrowLength);
        ctx.lineTo(gravArrowX - 5, gravArrowStartY + gravArrowLength - 8);
        ctx.lineTo(gravArrowX + 5, gravArrowStartY + gravArrowLength - 8);
        ctx.closePath();
        ctx.fillStyle = '#66ff66';
        ctx.fill();

        ctx.fillStyle = '#66ff66';
        ctx.fillText('Gravity', gravArrowX - 20, gravArrowStartY - 8);
      }

      // Labels
      ctx.fillStyle = '#888888';
      ctx.font = '11px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`Strands: ${strandsRef.current.length}`, 10, height - 10);
    };

    simulate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [windStrength, gravity, stiffness, showForces]);

  return (
    <div className="card p-6">
      <h3 className="font-semibold mb-2">Hair Simulation</h3>
      <p className="text-sm text-[var(--text-muted)] mb-4">
        Real-time hair dynamics using simplified physics. Each strand responds to wind, gravity, and stiffness.
      </p>

      <canvas
        ref={canvasRef}
        width={500}
        height={300}
        className="w-full max-w-[500px] mb-4 rounded"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="text-xs text-[var(--text-muted)] block mb-1">Wind: {windStrength.toFixed(1)}</label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={windStrength}
            onChange={(e) => setWindStrength(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="text-xs text-[var(--text-muted)] block mb-1">Gravity: {gravity.toFixed(1)}</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={gravity}
            onChange={(e) => setGravity(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="text-xs text-[var(--text-muted)] block mb-1">Stiffness: {stiffness.toFixed(1)}</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={stiffness}
            onChange={(e) => setStiffness(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="text-xs text-[var(--text-muted)] block mb-1">Density</label>
          <select
            value={hairDensity}
            onChange={(e) => setHairDensity(e.target.value as typeof hairDensity)}
            className="w-full px-2 py-1 rounded bg-[var(--surface-0)] border border-[var(--border)] text-sm"
          >
            <option value="sparse">Sparse (25)</option>
            <option value="medium">Medium (50)</option>
            <option value="dense">Dense (100)</option>
          </select>
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showForces}
            onChange={(e) => setShowForces(e.target.checked)}
          />
          Show forces
        </label>
      </div>

      <div className="p-3 bg-[var(--surface-2)] rounded text-xs">
        <p className="font-medium mb-1">In MetaHuman</p>
        <p className="text-[var(--text-muted)]">
          Real hair simulation uses thousands of guide strands with interpolation, collision detection,
          and GPU-accelerated physics. Groom assets define the hair's look and behavior.
        </p>
      </div>
    </div>
  );
}
