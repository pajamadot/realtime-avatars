'use client';

import { useState, useRef, useEffect } from 'react';

export function FrameInterpolationDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [interpolationFactor, setInterpolationFactor] = useState(0.5);
  const [interpolationType, setInterpolationType] = useState<'linear' | 'motion' | 'none'>('linear');
  const [showMotionVectors, setShowMotionVectors] = useState(false);
  const [playAnimation, setPlayAnimation] = useState(true);
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    if (!playAnimation) return;

    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 0.03) % 1);
    }, 50);
    return () => clearInterval(interval);
  }, [playAnimation]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    // Define frames - circle moving across screen
    const frameWidth = 140;
    const frameHeight = 100;
    const frameY = 60;
    const gap = 20;

    // Frame positions
    const frame1X = 30;
    const frame2X = frame1X + frameWidth + gap;
    const interpolatedX = frame2X + frameWidth + gap;
    const frame3X = interpolatedX + frameWidth + gap;

    // Circle positions in frames
    const circleY = frameHeight / 2;
    const circleRadius = 20;

    // Keyframe circle positions
    const keyframe1CircleX = 35 + Math.sin(animationPhase * Math.PI * 2) * 20;
    const keyframe2CircleX = 105 + Math.sin((animationPhase + 0.5) * Math.PI * 2) * 20;

    // Draw frame helper
    const drawFrame = (x: number, y: number, w: number, h: number, label: string, isInterpolated: boolean = false) => {
      ctx.fillStyle = isInterpolated ? '#1e2a3e' : '#1a1a2e';
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = isInterpolated ? '#66aaff' : '#444466';
      ctx.lineWidth = isInterpolated ? 2 : 1;
      ctx.strokeRect(x, y, w, h);

      ctx.fillStyle = isInterpolated ? '#66aaff' : '#888888';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(label, x + w / 2, y + h + 15);
    };

    // Draw all frames
    drawFrame(frame1X, frameY, frameWidth, frameHeight, 'Frame N');
    drawFrame(frame2X, frameY, frameWidth, frameHeight, 'Frame N+1');
    drawFrame(interpolatedX, frameY, frameWidth, frameHeight, 'Interpolated', true);
    drawFrame(frame3X, frameY, frameWidth, frameHeight, 'Result');

    // Draw circles in frames
    // Frame 1
    ctx.beginPath();
    ctx.arc(frame1X + keyframe1CircleX, frameY + circleY, circleRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#ff6666';
    ctx.fill();

    // Frame 2
    ctx.beginPath();
    ctx.arc(frame2X + keyframe2CircleX, frameY + circleY, circleRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#6666ff';
    ctx.fill();

    // Interpolated frame
    let interpolatedCircleX: number;
    let interpolatedCircleY = circleY;

    if (interpolationType === 'none') {
      // No interpolation - use frame 1 (duplicate)
      interpolatedCircleX = keyframe1CircleX;
    } else if (interpolationType === 'linear') {
      // Linear interpolation
      interpolatedCircleX = keyframe1CircleX + (keyframe2CircleX - keyframe1CircleX) * interpolationFactor;
    } else {
      // Motion-compensated interpolation (simulated with slight curve)
      const t = interpolationFactor;
      // Add a slight arc to simulate motion-aware interpolation
      interpolatedCircleX = keyframe1CircleX + (keyframe2CircleX - keyframe1CircleX) * t;
      // Easing for smoother motion
      const easedT = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      interpolatedCircleX = keyframe1CircleX + (keyframe2CircleX - keyframe1CircleX) * easedT;
    }

    // Ghost frames showing interpolation path
    if (interpolationType !== 'none') {
      for (let i = 1; i < 4; i++) {
        const t = i / 4;
        let ghostX: number;

        if (interpolationType === 'linear') {
          ghostX = keyframe1CircleX + (keyframe2CircleX - keyframe1CircleX) * t;
        } else {
          const easedT = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
          ghostX = keyframe1CircleX + (keyframe2CircleX - keyframe1CircleX) * easedT;
        }

        ctx.beginPath();
        ctx.arc(interpolatedX + ghostX, frameY + circleY, circleRadius * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(150, 150, 255, ${0.2})`;
        ctx.fill();
      }
    }

    // Draw interpolated circle
    ctx.beginPath();
    ctx.arc(interpolatedX + interpolatedCircleX, frameY + interpolatedCircleY, circleRadius, 0, Math.PI * 2);
    const gradientInterp = ctx.createRadialGradient(
      interpolatedX + interpolatedCircleX, frameY + interpolatedCircleY, 0,
      interpolatedX + interpolatedCircleX, frameY + interpolatedCircleY, circleRadius
    );
    gradientInterp.addColorStop(0, `rgba(${255 * (1 - interpolationFactor) + 100 * interpolationFactor}, 100, ${100 * (1 - interpolationFactor) + 255 * interpolationFactor}, 1)`);
    gradientInterp.addColorStop(1, `rgba(${200 * (1 - interpolationFactor) + 50 * interpolationFactor}, 50, ${50 * (1 - interpolationFactor) + 200 * interpolationFactor}, 1)`);
    ctx.fillStyle = gradientInterp;
    ctx.fill();

    // Result frame - show smoother motion
    const resultT = animationPhase * 4 % 1;
    let resultCircleX: number;

    if (interpolationType === 'none') {
      // Jumpy - only show keyframes
      resultCircleX = animationPhase < 0.5 ? keyframe1CircleX : keyframe2CircleX;
    } else if (interpolationType === 'linear') {
      resultCircleX = keyframe1CircleX + (keyframe2CircleX - keyframe1CircleX) * resultT;
    } else {
      const easedT = resultT < 0.5 ? 2 * resultT * resultT : 1 - Math.pow(-2 * resultT + 2, 2) / 2;
      resultCircleX = keyframe1CircleX + (keyframe2CircleX - keyframe1CircleX) * easedT;
    }

    ctx.beginPath();
    ctx.arc(frame3X + resultCircleX, frameY + circleY, circleRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#66ff66';
    ctx.fill();

    // Motion vectors
    if (showMotionVectors && interpolationType !== 'none') {
      ctx.strokeStyle = '#ffaa66';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);

      // Vector from frame 1 to frame 2
      ctx.beginPath();
      ctx.moveTo(frame1X + keyframe1CircleX, frameY + circleY);
      ctx.lineTo(frame2X + keyframe2CircleX, frameY + circleY);
      ctx.stroke();

      // Arrow head
      ctx.setLineDash([]);
      const arrowX = frame2X + keyframe2CircleX - 10;
      ctx.beginPath();
      ctx.moveTo(frame2X + keyframe2CircleX, frameY + circleY);
      ctx.lineTo(arrowX, frameY + circleY - 5);
      ctx.lineTo(arrowX, frameY + circleY + 5);
      ctx.closePath();
      ctx.fillStyle = '#ffaa66';
      ctx.fill();

      ctx.setLineDash([]);
    }

    // Timeline
    const timelineY = height - 50;
    ctx.strokeStyle = '#444466';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, timelineY);
    ctx.lineTo(width - 50, timelineY);
    ctx.stroke();

    // Timeline markers
    const timelineWidth = width - 100;
    const markers = [
      { pos: 0, label: 't', color: '#ff6666' },
      { pos: interpolationFactor, label: 't+Δ', color: '#66aaff' },
      { pos: 1, label: 't+1', color: '#6666ff' },
    ];

    markers.forEach(marker => {
      const x = 50 + marker.pos * timelineWidth;

      ctx.fillStyle = marker.color;
      ctx.beginPath();
      ctx.arc(x, timelineY, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#aaaaaa';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(marker.label, x, timelineY + 20);
    });

    // FPS comparison
    ctx.fillStyle = '#888888';
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Without interpolation: 30 FPS (jerky)', 20, height - 15);
    ctx.fillText('With interpolation: 60+ FPS (smooth)', 300, height - 15);

  }, [animationPhase, interpolationFactor, interpolationType, showMotionVectors]);

  return (
    <div className="card p-6">
      <h3 className="font-semibold mb-2">Frame Interpolation</h3>
      <p className="text-sm text-[var(--muted)] mb-4">
        Generate intermediate frames to increase framerate. Essential for smooth streaming with limited bandwidth.
      </p>

      <canvas
        ref={canvasRef}
        width={600}
        height={220}
        className="w-full max-w-[600px] mb-4 rounded"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="text-xs text-[var(--muted)] block mb-1">Interpolation: {(interpolationFactor * 100).toFixed(0)}%</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={interpolationFactor}
            onChange={(e) => setInterpolationFactor(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="text-xs text-[var(--muted)] block mb-1">Method</label>
          <select
            value={interpolationType}
            onChange={(e) => setInterpolationType(e.target.value as typeof interpolationType)}
            className="w-full px-2 py-1 rounded bg-[var(--card-bg)] border border-[var(--border)] text-sm"
          >
            <option value="none">None (Frame Hold)</option>
            <option value="linear">Linear Blend</option>
            <option value="motion">Motion-Compensated</option>
          </select>
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showMotionVectors}
              onChange={(e) => setShowMotionVectors(e.target.checked)}
            />
            Show motion
          </label>
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={playAnimation}
              onChange={(e) => setPlayAnimation(e.target.checked)}
            />
            Animate
          </label>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-3 text-xs">
        <div className="p-3 bg-[var(--card-bg-alt)] rounded">
          <p className="font-medium mb-1">Frame Hold</p>
          <p className="text-[var(--muted)]">Repeat previous frame. Simple but causes stuttering at low FPS.</p>
        </div>
        <div className="p-3 bg-[var(--card-bg-alt)] rounded">
          <p className="font-medium mb-1">Linear Blend</p>
          <p className="text-[var(--muted)]">Cross-fade between frames. Creates ghosting on fast motion.</p>
        </div>
        <div className="p-3 bg-[var(--card-bg-alt)] rounded">
          <p className="font-medium mb-1">Motion-Compensated</p>
          <p className="text-[var(--muted)]">Warp based on optical flow. Best quality, GPU-intensive.</p>
        </div>
      </div>
    </div>
  );
}
