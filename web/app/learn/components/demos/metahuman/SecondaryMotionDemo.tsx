'use client';

import { useState, useRef, useEffect } from 'react';

interface PhysicsObject {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
}

export function SecondaryMotionDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dragAmount, setDragAmount] = useState(0.15);
  const [springStiffness, setSpringStiffness] = useState(0.08);
  const [damping, setDamping] = useState(0.85);
  const [showForces, setShowForces] = useState(false);

  const primaryRef = useRef({ x: 250, y: 150, vx: 0, vy: 0 });
  const secondaryRef = useRef<PhysicsObject[]>([
    { x: 250, y: 180, vx: 0, vy: 0, targetX: 0, targetY: 30 },  // Earring left
    { x: 250, y: 180, vx: 0, vy: 0, targetX: 0, targetY: 30 },  // Earring right
    { x: 250, y: 100, vx: 0, vy: 0, targetX: 0, targetY: -50 }, // Hair strand 1
    { x: 250, y: 100, vx: 0, vy: 0, targetX: 15, targetY: -45 }, // Hair strand 2
    { x: 250, y: 100, vx: 0, vy: 0, targetX: -15, targetY: -45 }, // Hair strand 3
  ]);
  const animationRef = useRef<number | null>(null);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const simulate = () => {
      timeRef.current += 0.016;
      const time = timeRef.current;

      // Primary motion: head bobbing
      const primary = primaryRef.current;
      primary.x = 250 + Math.sin(time * 2) * 40;
      primary.y = 150 + Math.sin(time * 3) * 20;

      // Calculate head velocity
      const headVx = Math.cos(time * 2) * 2 * 40;
      const headVy = Math.cos(time * 3) * 3 * 20;

      // Update secondary objects with spring physics
      secondaryRef.current.forEach((obj, i) => {
        // Target position relative to head
        const targetX = primary.x + obj.targetX;
        const targetY = primary.y + obj.targetY;

        // Spring force towards target
        const dx = targetX - obj.x;
        const dy = targetY - obj.y;
        const springFx = dx * springStiffness;
        const springFy = dy * springStiffness;

        // Drag force (air resistance)
        const dragFx = -obj.vx * dragAmount;
        const dragFy = -obj.vy * dragAmount;

        // Gravity (for hanging objects)
        const gravity = i < 2 ? 0.3 : 0.1; // Earrings vs hair

        // Update velocity
        obj.vx += springFx + dragFx;
        obj.vy += springFy + dragFy + gravity;

        // Apply damping
        obj.vx *= damping;
        obj.vy *= damping;

        // Update position
        obj.x += obj.vx;
        obj.y += obj.vy;
      });

      render(ctx, canvas.width, canvas.height);
      animationRef.current = requestAnimationFrame(simulate);
    };

    const render = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, width, height);

      const primary = primaryRef.current;

      // Draw head
      ctx.beginPath();
      ctx.ellipse(primary.x, primary.y, 50, 60, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#8b7355';
      ctx.fill();
      ctx.strokeStyle = '#6b5344';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw face
      ctx.fillStyle = '#6b5344';
      ctx.beginPath();
      ctx.ellipse(primary.x - 15, primary.y - 10, 6, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(primary.x + 15, primary.y - 10, 6, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(primary.x, primary.y + 15, 12, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();

      // Draw ears (attachment points)
      ctx.fillStyle = '#7a6245';
      ctx.beginPath();
      ctx.ellipse(primary.x - 52, primary.y, 8, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(primary.x + 52, primary.y, 8, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Draw earrings (secondary motion)
      const earringLeft = secondaryRef.current[0];
      const earringRight = secondaryRef.current[1];

      // Earring chains
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      ctx.moveTo(primary.x - 52, primary.y + 10);
      ctx.lineTo(earringLeft.x - 50, earringLeft.y);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(primary.x + 52, primary.y + 10);
      ctx.lineTo(earringRight.x + 50, earringRight.y);
      ctx.stroke();

      // Earring pendants
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(earringLeft.x - 50, earringLeft.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(earringRight.x + 50, earringRight.y, 8, 0, Math.PI * 2);
      ctx.fill();

      // Draw hair strands (secondary motion)
      const hairColors = ['#4a3728', '#3d2d20', '#4a3728'];
      secondaryRef.current.slice(2).forEach((strand, i) => {
        const startX = primary.x + strand.targetX;
        const startY = primary.y - 55;

        ctx.strokeStyle = hairColors[i];
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(startX, startY);

        // Curved strand
        const midX = (startX + strand.x) / 2 + strand.vx * 2;
        const midY = (startY + strand.y) / 2 + strand.vy;

        ctx.quadraticCurveTo(midX, midY, strand.x, strand.y);
        ctx.stroke();

        // Hair tip
        ctx.fillStyle = hairColors[i];
        ctx.beginPath();
        ctx.arc(strand.x, strand.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      // Force visualization
      if (showForces) {
        ctx.font = '10px monospace';
        ctx.textAlign = 'left';

        // Show velocity vectors on earring
        const obj = earringLeft;
        const arrowScale = 5;

        ctx.strokeStyle = '#ff6666';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(obj.x - 50, obj.y);
        ctx.lineTo(obj.x - 50 + obj.vx * arrowScale, obj.y + obj.vy * arrowScale);
        ctx.stroke();

        ctx.fillStyle = '#ff6666';
        ctx.fillText('velocity', obj.x - 50 + obj.vx * arrowScale + 5, obj.y + obj.vy * arrowScale);

        // Spring force indicator
        const targetX = primary.x + obj.targetX;
        const targetY = primary.y + obj.targetY;
        ctx.strokeStyle = '#66ff66';
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(obj.x - 50, obj.y);
        ctx.lineTo(targetX - 50, targetY);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#66ff66';
        ctx.fillText('spring', targetX - 40, targetY);
      }

      // Labels
      ctx.fillStyle = '#888888';
      ctx.font = '11px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('Primary: Head motion (animated)', 10, 20);
      ctx.fillText('Secondary: Earrings + Hair (physics-driven)', 10, 35);

      // Physics parameters
      ctx.fillStyle = '#666666';
      ctx.font = '9px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`Stiffness: ${springStiffness.toFixed(2)}`, width - 10, 20);
      ctx.fillText(`Damping: ${damping.toFixed(2)}`, width - 10, 35);
      ctx.fillText(`Drag: ${dragAmount.toFixed(2)}`, width - 10, 50);
    };

    simulate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dragAmount, springStiffness, damping, showForces]);

  return (
    <div className="card p-6">
      <h3 className="font-semibold mb-2">Secondary Motion</h3>
      <p className="text-sm text-[var(--text-muted)] mb-4">
        Secondary motion adds physics-based follow-through to primary animation. Watch earrings and hair react to head movement.
      </p>

      <canvas
        ref={canvasRef}
        width={500}
        height={300}
        className="w-full max-w-[500px] mb-4 rounded"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="text-xs text-[var(--text-muted)] block mb-1">Spring: {springStiffness.toFixed(2)}</label>
          <input
            type="range"
            min="0.01"
            max="0.2"
            step="0.01"
            value={springStiffness}
            onChange={(e) => setSpringStiffness(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="text-xs text-[var(--text-muted)] block mb-1">Damping: {damping.toFixed(2)}</label>
          <input
            type="range"
            min="0.5"
            max="0.99"
            step="0.01"
            value={damping}
            onChange={(e) => setDamping(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="text-xs text-[var(--text-muted)] block mb-1">Drag: {dragAmount.toFixed(2)}</label>
          <input
            type="range"
            min="0"
            max="0.5"
            step="0.01"
            value={dragAmount}
            onChange={(e) => setDragAmount(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showForces}
              onChange={(e) => setShowForces(e.target.checked)}
            />
            Show forces
          </label>
        </div>
      </div>

      <div className="p-3 bg-[var(--surface-2)] rounded text-xs">
        <p className="font-medium mb-1">Animation Principles</p>
        <p className="text-[var(--text-muted)]">
          Secondary motion follows Disney's principles: drag, overlap, and follow-through.
          Spring physics creates natural-looking motion that reacts to the primary animation.
        </p>
      </div>
    </div>
  );
}
