'use client';

import { useState, useEffect, useRef } from 'react';

interface LatentPoint {
  x: number;
  y: number;
  color: string;
  label: string;
}

const PRESET_FACES: LatentPoint[] = [
  { x: 0.3, y: 0.3, color: '#ff6b6b', label: 'Smiling' },
  { x: 0.7, y: 0.3, color: '#4ecdc4', label: 'Neutral' },
  { x: 0.3, y: 0.7, color: '#45b7d1', label: 'Surprised' },
  { x: 0.7, y: 0.7, color: '#96ceb4', label: 'Serious' },
  { x: 0.5, y: 0.5, color: '#ffeaa7', label: 'Average' },
];

export function LatentSpaceDemo() {
  const [latentX, setLatentX] = useState(0.5);
  const [latentY, setLatentY] = useState(0.5);
  const [isDragging, setIsDragging] = useState(false);
  const [compressionRatio, setCompressionRatio] = useState(8);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spaceRef = useRef<HTMLDivElement>(null);

  // Render interpolated face based on latent position
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 200;
    ctx.clearRect(0, 0, size, size);

    // Background
    const bgGradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    bgGradient.addColorStop(0, '#2d3436');
    bgGradient.addColorStop(1, '#1a1a2e');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, size, size);

    // Generate face based on latent coordinates
    // X axis: expression (0=positive, 1=neutral/serious)
    // Y axis: arousal (0=calm, 1=excited)

    const smileAmount = 1 - latentX; // More smile on left
    const eyeOpenness = 0.8 + latentY * 0.4; // More open eyes at bottom
    const browRaise = latentY * 0.3; // Raised brows at bottom

    // Face shape
    const faceGradient = ctx.createRadialGradient(
      size * 0.5, size * 0.45, size * 0.1,
      size * 0.5, size * 0.5, size * 0.4
    );
    faceGradient.addColorStop(0, '#ffdbac');
    faceGradient.addColorStop(0.8, '#e0ac69');
    faceGradient.addColorStop(1, '#c68642');

    ctx.fillStyle = faceGradient;
    ctx.beginPath();
    ctx.ellipse(size * 0.5, size * 0.5, size * 0.35, size * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    const eyeY = size * (0.4 - browRaise * 0.1);
    const eyeHeight = size * 0.04 * eyeOpenness;

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(size * 0.35, eyeY, size * 0.07, eyeHeight, 0, 0, Math.PI * 2);
    ctx.ellipse(size * 0.65, eyeY, size * 0.07, eyeHeight, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pupils
    ctx.fillStyle = '#2d3436';
    const pupilSize = size * 0.025 * (0.8 + eyeOpenness * 0.2);
    ctx.beginPath();
    ctx.arc(size * 0.35, eyeY, pupilSize, 0, Math.PI * 2);
    ctx.arc(size * 0.65, eyeY, pupilSize, 0, Math.PI * 2);
    ctx.fill();

    // Eyebrows
    ctx.strokeStyle = '#5d4e37';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    // Left eyebrow
    ctx.beginPath();
    ctx.moveTo(size * 0.25, size * (0.3 - browRaise * 0.1));
    ctx.quadraticCurveTo(
      size * 0.35, size * (0.28 - browRaise * 0.15),
      size * 0.45, size * (0.3 - browRaise * 0.05)
    );
    ctx.stroke();

    // Right eyebrow
    ctx.beginPath();
    ctx.moveTo(size * 0.55, size * (0.3 - browRaise * 0.05));
    ctx.quadraticCurveTo(
      size * 0.65, size * (0.28 - browRaise * 0.15),
      size * 0.75, size * (0.3 - browRaise * 0.1)
    );
    ctx.stroke();

    // Mouth - interpolate between expressions
    ctx.strokeStyle = '#8b4513';
    ctx.lineWidth = 3;
    ctx.fillStyle = '#d63031';

    ctx.beginPath();
    const mouthY = size * 0.62;
    const mouthWidth = size * 0.12;
    const mouthCurve = smileAmount * size * 0.08;

    ctx.moveTo(size * 0.5 - mouthWidth, mouthY);
    ctx.quadraticCurveTo(
      size * 0.5, mouthY + mouthCurve,
      size * 0.5 + mouthWidth, mouthY
    );
    ctx.stroke();

    // If smiling wide, show teeth
    if (smileAmount > 0.6) {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(size * 0.5, mouthY + mouthCurve * 0.3, mouthWidth * 0.6, mouthCurve * 0.4, 0, 0, Math.PI);
      ctx.fill();
    }

  }, [latentX, latentY]);

  const handleSpaceClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!spaceRef.current) return;
    const rect = spaceRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    setLatentX(x);
    setLatentY(y);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !spaceRef.current) return;
    const rect = spaceRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    setLatentX(x);
    setLatentY(y);
  };

  const goToPreset = (point: LatentPoint) => {
    setLatentX(point.x);
    setLatentY(point.y);
  };

  return (
    <div className="card p-6">
      <h3 className="font-semibold mb-2">Latent Space Explorer</h3>
      <p className="text-sm text-[var(--text-muted)] mb-6">
        Explore how VAEs compress images into a low-dimensional latent space.
        Click and drag in the space to interpolate between expressions.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Latent Space Visualization */}
        <div>
          <p className="text-sm font-medium mb-2">2D Latent Space</p>
          <div
            ref={spaceRef}
            className="relative w-full aspect-square bg-[var(--surface-2)] rounded-lg border border-[var(--border)] cursor-crosshair overflow-hidden"
            onClick={handleSpaceClick}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            onMouseMove={handleMouseMove}
          >
            {/* Grid lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
              {[...Array(10)].map((_, i) => (
                <g key={i}>
                  <line x1={`${i * 10}%`} y1="0" x2={`${i * 10}%`} y2="100%" stroke="currentColor" />
                  <line x1="0" y1={`${i * 10}%`} x2="100%" y2={`${i * 10}%`} stroke="currentColor" />
                </g>
              ))}
            </svg>

            {/* Preset points */}
            {PRESET_FACES.map((point, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  goToPreset(point);
                }}
                className="absolute w-8 h-8 rounded-full border-2 border-white/50 flex items-center justify-center text-xs font-medium transition-transform hover:scale-110"
                style={{
                  left: `${point.x * 100}%`,
                  top: `${point.y * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: point.color,
                }}
                title={point.label}
              >
                {point.label[0]}
              </button>
            ))}

            {/* Current position */}
            <div
              className="absolute w-6 h-6 rounded-full bg-white border-2 border-[var(--accent)] shadow-lg pointer-events-none"
              style={{
                left: `${latentX * 100}%`,
                top: `${latentY * 100}%`,
                transform: 'translate(-50%, -50%)',
              }}
            />

            {/* Axis labels */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-[var(--text-muted)]">
              Expression (Positive → Serious)
            </div>
            <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-[var(--text-muted)] whitespace-nowrap">
              Arousal (Calm → Excited)
            </div>
          </div>
        </div>

        {/* Generated Face */}
        <div>
          <p className="text-sm font-medium mb-2">Decoded Face</p>
          <div className="flex flex-col items-center">
            <canvas
              ref={canvasRef}
              width={200}
              height={200}
              className="rounded-lg border border-[var(--border)]"
            />

            {/* Latent coordinates display */}
            <div className="mt-4 p-3 bg-[var(--surface-2)] rounded text-sm w-full">
              <p className="font-medium mb-2">Latent Vector z</p>
              <code className="text-xs block font-mono">
                z = [{latentX.toFixed(3)}, {latentY.toFixed(3)}]
              </code>
            </div>

            {/* Compression info */}
            <div className="mt-4 p-3 bg-[var(--surface-2)] rounded text-sm w-full">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Compression Ratio</span>
                <span className="text-[var(--text-muted)]">{compressionRatio}x</span>
              </div>
              <input
                type="range"
                min={4}
                max={16}
                value={compressionRatio}
                onChange={(e) => setCompressionRatio(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-[var(--text-muted)] mt-2">
                <span>512×512×3 pixels</span>
                <span>→</span>
                <span>{Math.round(512/compressionRatio)}×{Math.round(512/compressionRatio)}×4 latent</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className="mt-6 p-4 bg-[var(--surface-2)] rounded">
        <p className="font-medium mb-2">How VAE Latent Space Works</p>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-[var(--text-muted)]">
          <div>
            <p className="font-medium text-[var(--foreground)] mb-1">Encode</p>
            <p>Compress 512×512 image → small latent vector (e.g., 64×64×4)</p>
          </div>
          <div>
            <p className="font-medium text-[var(--foreground)] mb-1">Manipulate</p>
            <p>Diffusion happens in latent space, much faster than pixel space</p>
          </div>
          <div>
            <p className="font-medium text-[var(--foreground)] mb-1">Decode</p>
            <p>Reconstruct full image from modified latent vector</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LatentSpaceDemo;
