'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const TOTAL_STEPS = 50;

// Seeded random for consistent noise at each step
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function DenoisingDemo() {
  const [currentStep, setCurrentStep] = useState(TOTAL_STEPS);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const targetRef = useRef<ImageData | null>(null);
  const thumbnailsRef = useRef<string[]>([]);
  const SIZE = 256;

  // Generate high-quality target face image
  useEffect(() => {
    const c = document.createElement('canvas');
    c.width = SIZE;
    c.height = SIZE;
    const ctx = c.getContext('2d');
    if (!ctx) return;

    // Background gradient
    const bg = ctx.createLinearGradient(0, 0, 0, SIZE);
    bg.addColorStop(0, '#2a2040');
    bg.addColorStop(1, '#1a1530');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, SIZE, SIZE);

    const cx = SIZE / 2;
    const cy = SIZE / 2 - 5;

    // Hair
    ctx.fillStyle = '#1a0e08';
    ctx.beginPath();
    ctx.ellipse(cx, cy - 30, SIZE * 0.42, SIZE * 0.44, 0, Math.PI, 0);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx - 40, cy + 10, 30, SIZE * 0.38, -0.15, Math.PI * 0.5, Math.PI * 1.5);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 40, cy + 10, 30, SIZE * 0.38, 0.15, Math.PI * 1.5, Math.PI * 0.5);
    ctx.fill();

    // Neck
    const neckGrad = ctx.createLinearGradient(cx - 25, cy + 90, cx + 25, cy + 90);
    neckGrad.addColorStop(0, '#d4a070');
    neckGrad.addColorStop(0.5, '#e8b888');
    neckGrad.addColorStop(1, '#d4a070');
    ctx.fillStyle = neckGrad;
    ctx.fillRect(cx - 25, cy + 90, 50, 50);

    // Ears
    ctx.fillStyle = '#e0a878';
    ctx.beginPath();
    ctx.ellipse(cx - 88, cy, 12, 20, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 88, cy, 12, 20, 0.15, 0, Math.PI * 2);
    ctx.fill();

    // Face with gradient
    const face = ctx.createRadialGradient(cx - 10, cy - 20, 15, cx, cy + 10, SIZE * 0.4);
    face.addColorStop(0, '#ffe8cc');
    face.addColorStop(0.3, '#ffdbac');
    face.addColorStop(0.7, '#e8b888');
    face.addColorStop(1, '#c49060');
    ctx.fillStyle = face;
    ctx.beginPath();
    ctx.ellipse(cx, cy, SIZE * 0.34, SIZE * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyebrows
    ctx.strokeStyle = '#3a2818';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - 50, cy - 35);
    ctx.quadraticCurveTo(cx - 30, cy - 45, cx - 12, cy - 35);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + 50, cy - 35);
    ctx.quadraticCurveTo(cx + 30, cy - 45, cx + 12, cy - 35);
    ctx.stroke();

    // Eyes
    [cx - 30, cx + 30].forEach(ex => {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(ex, cy - 15, 16, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      const iris = ctx.createRadialGradient(ex - 1, cy - 16, 1, ex, cy - 15, 7);
      iris.addColorStop(0, '#6a4a30');
      iris.addColorStop(0.6, '#3d2314');
      iris.addColorStop(1, '#1a0e08');
      ctx.fillStyle = iris;
      ctx.beginPath();
      ctx.arc(ex, cy - 15, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#050200';
      ctx.beginPath();
      ctx.arc(ex, cy - 15, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.beginPath();
      ctx.arc(ex - 2, cy - 18, 2, 0, Math.PI * 2);
      ctx.fill();
      // Eyelash line
      ctx.strokeStyle = '#1a0e08';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(ex, cy - 15, 17, 11, 0, Math.PI + 0.1, -0.1);
      ctx.stroke();
    });

    // Nose
    ctx.strokeStyle = '#c49060';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 5);
    ctx.quadraticCurveTo(cx - 3, cy + 15, cx - 10, cy + 22);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, cy - 5);
    ctx.quadraticCurveTo(cx + 3, cy + 15, cx + 10, cy + 22);
    ctx.stroke();
    // Nose shadow
    ctx.fillStyle = 'rgba(150, 100, 60, 0.15)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 24, 14, 5, 0, 0, Math.PI);
    ctx.fill();

    // Mouth
    const lipGrad = ctx.createLinearGradient(cx - 25, cy + 42, cx + 25, cy + 42);
    lipGrad.addColorStop(0, '#c46050');
    lipGrad.addColorStop(0.5, '#d87868');
    lipGrad.addColorStop(1, '#c46050');
    ctx.fillStyle = lipGrad;
    ctx.beginPath();
    ctx.moveTo(cx - 22, cy + 42);
    ctx.quadraticCurveTo(cx, cy + 50, cx + 22, cy + 42);
    ctx.quadraticCurveTo(cx, cy + 55, cx - 22, cy + 42);
    ctx.fill();
    // Upper lip line
    ctx.strokeStyle = '#b05040';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - 22, cy + 42);
    ctx.quadraticCurveTo(cx - 8, cy + 38, cx, cy + 40);
    ctx.quadraticCurveTo(cx + 8, cy + 38, cx + 22, cy + 42);
    ctx.stroke();

    targetRef.current = ctx.getImageData(0, 0, SIZE, SIZE);

    // Pre-generate milestone thumbnails
    const milestones = [50, 40, 30, 20, 10, 0];
    const thumbs: string[] = [];
    milestones.forEach(step => {
      const tc = document.createElement('canvas');
      tc.width = SIZE;
      tc.height = SIZE;
      const tctx = tc.getContext('2d');
      if (!tctx || !targetRef.current) return;
      const noise = step / TOTAL_STEPS;
      const target = targetRef.current.data;
      const output = tctx.createImageData(SIZE, SIZE);
      const rng = seededRandom(step * 12345);
      for (let i = 0; i < target.length; i += 4) {
        const n = (rng() - 0.5) * 255;
        output.data[i] = Math.max(0, Math.min(255, target[i] * (1 - noise) + (128 + n) * noise));
        output.data[i + 1] = Math.max(0, Math.min(255, target[i + 1] * (1 - noise) + (128 + n) * noise));
        output.data[i + 2] = Math.max(0, Math.min(255, target[i + 2] * (1 - noise) + (128 + n) * noise));
        output.data[i + 3] = 255;
      }
      tctx.putImageData(output, 0, 0);
      thumbs.push(tc.toDataURL('image/jpeg', 0.6));
    });
    thumbnailsRef.current = thumbs;
  }, []);

  // Render with seeded noise
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !targetRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const noiseAmount = currentStep / TOTAL_STEPS;
    const target = targetRef.current.data;
    const output = ctx.createImageData(SIZE, SIZE);
    const rng = seededRandom(currentStep * 12345);

    for (let i = 0; i < target.length; i += 4) {
      const n = (rng() - 0.5) * 255;
      output.data[i] = Math.max(0, Math.min(255, target[i] * (1 - noiseAmount) + (128 + n) * noiseAmount));
      output.data[i + 1] = Math.max(0, Math.min(255, target[i + 1] * (1 - noiseAmount) + (128 + n) * noiseAmount));
      output.data[i + 2] = Math.max(0, Math.min(255, target[i + 2] * (1 - noiseAmount) + (128 + n) * noiseAmount));
      output.data[i + 3] = 255;
    }
    ctx.putImageData(output, 0, 0);

    // Overlay: step counter
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, SIZE - 28, SIZE, 28);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`t = ${currentStep}`, 8, SIZE - 10);
    ctx.textAlign = 'right';
    const pct = Math.round((1 - noiseAmount) * 100);
    ctx.fillText(`${pct}% denoised`, SIZE - 8, SIZE - 10);

    // Progress bar
    ctx.fillStyle = 'rgba(93, 138, 102, 0.6)';
    ctx.fillRect(0, SIZE - 3, SIZE * (1 - noiseAmount), 3);
  }, [currentStep]);

  // Auto-play with easing
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev <= 0) { setIsAutoPlaying(false); return 0; }
        return prev - 1;
      });
    }, 80);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const getDescription = useCallback(() => {
    if (currentStep >= 45) return 'Pure noise -- completely random';
    if (currentStep >= 35) return 'Faint shapes emerging from noise';
    if (currentStep >= 25) return 'Rough structure becoming visible';
    if (currentStep >= 15) return 'Features taking recognizable form';
    if (currentStep >= 5) return 'Fine details sharpening';
    return 'Clean image -- denoising complete';
  }, [currentStep]);

  const milestoneSteps = [50, 40, 30, 20, 10, 0];

  return (
    <div className="card p-6">
      <h3 className="font-semibold mb-4">Denoising Visualizer</h3>
      <p className="text-sm text-[var(--text-muted)] mb-6">
        Watch how diffusion models progressively remove noise to reveal an image.
        Each step predicts and subtracts a small amount of noise.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="flex flex-col items-center">
          <canvas
            ref={canvasRef}
            width={SIZE}
            height={SIZE}
            className="rounded-lg w-full"
            style={{ imageRendering: currentStep > 35 ? 'pixelated' : 'auto' }}
          />
          <p className="text-sm text-[var(--text-muted)] mt-3 text-center">
            {getDescription()}
          </p>

          {/* Milestone thumbnails */}
          {thumbnailsRef.current.length > 0 && (
            <div className="flex gap-1 mt-3 w-full">
              {milestoneSteps.map((step, i) => (
                <button
                  key={step}
                  onClick={() => { setIsAutoPlaying(false); setCurrentStep(step); }}
                  className="flex-1 relative rounded overflow-hidden border transition-all"
                  style={{
                    borderColor: currentStep === step ? 'var(--accent)' : 'transparent',
                    opacity: currentStep <= step ? 1 : 0.5,
                  }}
                >
                  {thumbnailsRef.current[i] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={thumbnailsRef.current[i]} alt={`Step ${step}`} className="w-full aspect-square object-cover" />
                  )}
                  <span className="absolute bottom-0 inset-x-0 text-[8px] font-mono text-center bg-black/60 text-white">
                    t={step}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Denoising Step</span>
              <span className="text-sm font-mono text-[var(--text-muted)]">
                {TOTAL_STEPS - currentStep} / {TOTAL_STEPS}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={TOTAL_STEPS}
              value={currentStep}
              onChange={(e) => { setIsAutoPlaying(false); setCurrentStep(Number(e.target.value)); }}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => { setIsAutoPlaying(false); setCurrentStep(TOTAL_STEPS); }}
              className="badge hover:border-[var(--border-strong)] text-center justify-center"
            >
              Reset to Noise
            </button>
            <button
              onClick={() => {
                setCurrentStep(TOTAL_STEPS);
                setIsAutoPlaying(true);
              }}
              disabled={isAutoPlaying}
              className="badge hover:border-[var(--border-strong)] text-center justify-center"
            >
              {isAutoPlaying ? 'Running...' : 'Auto Denoise'}
            </button>
          </div>

          {/* Live formula */}
          <div className="p-4 bg-[var(--surface-2)] rounded">
            <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-2">DDPM Reverse Step</p>
            <div className="font-mono text-sm text-center mb-2">
              <span>x</span><sub>{currentStep > 0 ? currentStep - 1 : 0}</sub>
              {' = '}
              <span className="text-[var(--accent)]">denoise</span>
              {'(x'}<sub>{currentStep}</sub>{', t='}{currentStep}{')'}
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              At each step t, the U-Net predicts noise &epsilon;&theta;(x<sub>t</sub>, t),
              which is subtracted from x<sub>t</sub> scaled by the noise schedule (&alpha;, &beta;).
            </p>
          </div>

          {/* Noise schedule visualization */}
          <div>
            <p className="text-sm font-medium mb-2">Noise Schedule</p>
            <div className="h-16 bg-[var(--surface-2)] rounded relative overflow-hidden">
              {/* Schedule curve */}
              <svg viewBox="0 0 100 40" className="w-full h-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="schedGrad" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.05" />
                  </linearGradient>
                </defs>
                {/* Area under curve */}
                <path
                  d={`M0,40 ${Array.from({ length: 51 }, (_, i) => {
                    const x = (i / 50) * 100;
                    const noise = i / 50;
                    const y = 40 - noise * noise * 38;
                    return `L${x},${y}`;
                  }).join(' ')} L100,40 Z`}
                  fill="url(#schedGrad)"
                />
                {/* Curve line */}
                <path
                  d={`M${Array.from({ length: 51 }, (_, i) => {
                    const x = (i / 50) * 100;
                    const noise = i / 50;
                    const y = 40 - noise * noise * 38;
                    return `${x},${y}`;
                  }).join(' L')}`}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="1.5"
                />
                {/* Current position marker */}
                <circle
                  cx={(currentStep / 50) * 100}
                  cy={40 - (currentStep / 50) * (currentStep / 50) * 38}
                  r="3"
                  fill="var(--accent)"
                />
              </svg>
              <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 text-[9px] text-[var(--text-muted)]">
                <span>t=0 (clean)</span>
                <span>t=50 (noise)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DenoisingDemo;
