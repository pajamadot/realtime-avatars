'use client';

import { useState, useRef, useEffect } from 'react';

export function EyeGazeDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gazeX, setGazeX] = useState(0);
  const [gazeY, setGazeY] = useState(0);
  const [blinkAmount, setBlinkAmount] = useState(0);
  const [pupilDilation, setPupilDilation] = useState(0.5);
  const [trackMouse, setTrackMouse] = useState(false);
  const [showAnnotations, setShowAnnotations] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    // Face outline
    const faceX = width / 2;
    const faceY = height / 2 + 20;

    // Draw simple face outline
    ctx.strokeStyle = '#444466';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(faceX, faceY, 120, 150, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Eye parameters
    const eyeSpacing = 50;
    const eyeY = faceY - 30;
    const eyeWidth = 35;
    const eyeHeight = 20 * (1 - blinkAmount);
    const irisRadius = 12;
    const pupilRadius = 4 + pupilDilation * 4;

    // Calculate iris position based on gaze
    const maxIrisOffset = eyeWidth - irisRadius - 5;
    const irisOffsetX = gazeX * maxIrisOffset * 0.6;
    const irisOffsetY = gazeY * (eyeHeight - irisRadius) * 0.4;

    // Draw both eyes
    const drawEye = (centerX: number, centerY: number, isLeft: boolean) => {
      // Sclera (white of eye)
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, eyeWidth, Math.max(eyeHeight, 2), 0, 0, Math.PI * 2);
      ctx.fillStyle = blinkAmount > 0.9 ? '#8b7355' : '#f0f0e8';
      ctx.fill();
      ctx.strokeStyle = '#8b7355';
      ctx.lineWidth = 2;
      ctx.stroke();

      if (blinkAmount < 0.8) {
        // Iris
        const irisX = centerX + irisOffsetX;
        const irisY = centerY + irisOffsetY;

        // Iris gradient
        const irisGradient = ctx.createRadialGradient(irisX, irisY, 0, irisX, irisY, irisRadius);
        irisGradient.addColorStop(0, '#4a6741');
        irisGradient.addColorStop(0.7, '#3d5a35');
        irisGradient.addColorStop(1, '#2d4a28');

        ctx.beginPath();
        ctx.arc(irisX, irisY, irisRadius, 0, Math.PI * 2);
        ctx.fillStyle = irisGradient;
        ctx.fill();

        // Iris detail lines
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < 12; i++) {
          const angle = (i / 12) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(irisX + Math.cos(angle) * 3, irisY + Math.sin(angle) * 3);
          ctx.lineTo(irisX + Math.cos(angle) * irisRadius, irisY + Math.sin(angle) * irisRadius);
          ctx.stroke();
        }

        // Pupil
        ctx.beginPath();
        ctx.arc(irisX, irisY, pupilRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#000000';
        ctx.fill();

        // Light reflection
        ctx.beginPath();
        ctx.arc(irisX + 3, irisY - 3, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fill();

        // Annotations
        if (showAnnotations && isLeft) {
          ctx.strokeStyle = '#66aaff';
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 3]);

          // Gaze direction line
          ctx.beginPath();
          ctx.moveTo(irisX, irisY);
          ctx.lineTo(irisX + gazeX * 80, irisY + gazeY * 60);
          ctx.stroke();

          // Arrow head
          const arrowX = irisX + gazeX * 80;
          const arrowY = irisY + gazeY * 60;
          ctx.setLineDash([]);
          ctx.beginPath();
          ctx.arc(arrowX, arrowY, 3, 0, Math.PI * 2);
          ctx.fillStyle = '#66aaff';
          ctx.fill();
        }
      }

      // Eyelid
      if (blinkAmount > 0) {
        ctx.beginPath();
        ctx.ellipse(centerX, centerY - eyeHeight + blinkAmount * eyeHeight * 2, eyeWidth + 2, eyeHeight * blinkAmount * 1.2, 0, 0, Math.PI);
        ctx.fillStyle = '#c4a882';
        ctx.fill();
      }

      // Upper eyelid line
      ctx.strokeStyle = '#8b7355';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY - 2, eyeWidth + 3, eyeHeight + 5, 0, Math.PI, Math.PI * 2);
      ctx.stroke();
    };

    drawEye(faceX - eyeSpacing, eyeY, true);
    drawEye(faceX + eyeSpacing, eyeY, false);

    // Eyebrows
    ctx.strokeStyle = '#6b5344';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(faceX - eyeSpacing - 30, eyeY - 35);
    ctx.quadraticCurveTo(faceX - eyeSpacing, eyeY - 45, faceX - eyeSpacing + 25, eyeY - 38);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(faceX + eyeSpacing + 30, eyeY - 35);
    ctx.quadraticCurveTo(faceX + eyeSpacing, eyeY - 45, faceX + eyeSpacing - 25, eyeY - 38);
    ctx.stroke();

    // Nose hint
    ctx.strokeStyle = '#444466';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(faceX, eyeY + 15);
    ctx.lineTo(faceX - 5, eyeY + 50);
    ctx.stroke();

    // Info panel
    if (showAnnotations) {
      ctx.fillStyle = 'rgba(30, 30, 50, 0.9)';
      ctx.fillRect(10, 10, 150, 90);
      ctx.strokeStyle = '#444466';
      ctx.strokeRect(10, 10, 150, 90);

      ctx.fillStyle = '#aaaaaa';
      ctx.font = '11px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('Eye Tracking Data', 20, 30);
      ctx.fillStyle = '#888888';
      ctx.font = '10px monospace';
      ctx.fillText(`Gaze X: ${gazeX.toFixed(2)}`, 20, 48);
      ctx.fillText(`Gaze Y: ${gazeY.toFixed(2)}`, 20, 62);
      ctx.fillText(`Blink: ${(blinkAmount * 100).toFixed(0)}%`, 20, 76);
      ctx.fillText(`Pupil: ${(pupilDilation * 100).toFixed(0)}%`, 20, 90);
    }

    // Bones/joints visualization
    if (showAnnotations) {
      ctx.fillStyle = 'rgba(30, 30, 50, 0.9)';
      ctx.fillRect(width - 180, 10, 170, 100);
      ctx.strokeStyle = '#444466';
      ctx.strokeRect(width - 180, 10, 170, 100);

      ctx.fillStyle = '#aaaaaa';
      ctx.font = '11px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('Eye Bones', width - 170, 30);

      ctx.fillStyle = '#666688';
      ctx.font = '9px monospace';
      ctx.fillText('• eye_l, eye_r (rotation)', width - 170, 48);
      ctx.fillText('• eyelid_upper_l/r', width - 170, 62);
      ctx.fillText('• eyelid_lower_l/r', width - 170, 76);
      ctx.fillText('• eyebrow_inner/mid/outer', width - 170, 90);
      ctx.fillText('+ Blendshapes for detail', width - 170, 104);
    }

  }, [gazeX, gazeY, blinkAmount, pupilDilation, showAnnotations]);

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!trackMouse) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Normalize to -1 to 1
    const normalizedX = (x / canvas.width) * 2 - 1;
    const normalizedY = (y / canvas.height) * 2 - 1;

    setGazeX(Math.max(-1, Math.min(1, normalizedX)));
    setGazeY(Math.max(-1, Math.min(1, normalizedY)));
  };

  return (
    <div className="card p-6">
      <h3 className="font-semibold mb-2">Eye Gaze & Tracking</h3>
      <p className="text-sm text-[var(--text-muted)] mb-4">
        Eyes are crucial for believable avatars. Control gaze direction, blink, and pupil dilation.
      </p>

      <canvas
        ref={canvasRef}
        width={500}
        height={350}
        className="w-full max-w-[500px] mb-4 rounded cursor-crosshair"
        onMouseMove={handleCanvasMouseMove}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="text-xs text-[var(--text-muted)] block mb-1">Gaze X: {gazeX.toFixed(2)}</label>
          <input
            type="range"
            min="-1"
            max="1"
            step="0.05"
            value={gazeX}
            onChange={(e) => setGazeX(Number(e.target.value))}
            className="w-full"
            disabled={trackMouse}
          />
        </div>
        <div>
          <label className="text-xs text-[var(--text-muted)] block mb-1">Gaze Y: {gazeY.toFixed(2)}</label>
          <input
            type="range"
            min="-1"
            max="1"
            step="0.05"
            value={gazeY}
            onChange={(e) => setGazeY(Number(e.target.value))}
            className="w-full"
            disabled={trackMouse}
          />
        </div>
        <div>
          <label className="text-xs text-[var(--text-muted)] block mb-1">Blink: {(blinkAmount * 100).toFixed(0)}%</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={blinkAmount}
            onChange={(e) => setBlinkAmount(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="text-xs text-[var(--text-muted)] block mb-1">Pupil: {(pupilDilation * 100).toFixed(0)}%</label>
          <input
            type="range"
            min="0.2"
            max="1"
            step="0.05"
            value={pupilDilation}
            onChange={(e) => setPupilDilation(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={trackMouse}
            onChange={(e) => setTrackMouse(e.target.checked)}
          />
          Track mouse
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showAnnotations}
            onChange={(e) => setShowAnnotations(e.target.checked)}
          />
          Show annotations
        </label>
      </div>

      <div className="grid md:grid-cols-2 gap-3 text-xs">
        <div className="p-3 bg-[var(--surface-2)] rounded">
          <p className="font-medium mb-1">Gaze Direction</p>
          <p className="text-[var(--text-muted)]">Controlled by eye bone rotation. ARKit provides eyeLookIn/Out/Up/Down blendshapes for detailed control.</p>
        </div>
        <div className="p-3 bg-[var(--surface-2)] rounded">
          <p className="font-medium mb-1">Pupil Response</p>
          <p className="text-[var(--text-muted)]">Dilates with emotion and lighting. Small detail that adds significant realism to digital humans.</p>
        </div>
      </div>
    </div>
  );
}
