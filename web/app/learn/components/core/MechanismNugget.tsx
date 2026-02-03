'use client';

import { useState, useEffect, useRef } from 'react';

interface MechanismNuggetProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  color?: string;
}

export default function MechanismNugget({
  title,
  description,
  children,
  color = 'var(--accent)',
}: MechanismNuggetProps) {
  return (
    <div className="card overflow-hidden my-6">
      <div
        className="px-4 py-2 border-b border-[var(--border)] flex items-center gap-2"
        style={{ backgroundColor: `color-mix(in srgb, ${color} 10%, transparent)` }}
      >
        <span className="text-sm" style={{ color }}>⚙️</span>
        <span className="text-sm font-medium">{title}</span>
      </div>
      {description && (
        <p className="text-xs text-[var(--muted)] px-4 pt-3">{description}</p>
      )}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}

// Mini visualization: How alpha blending works mathematically
export function AlphaBlendMath() {
  const [alpha, setAlpha] = useState(0.5);
  const front = { r: 255, g: 100, b: 100 };
  const back = { r: 100, g: 100, b: 255 };

  const result = {
    r: Math.round(front.r * alpha + back.r * (1 - alpha)),
    g: Math.round(front.g * alpha + back.g * (1 - alpha)),
    b: Math.round(front.b * alpha + back.b * (1 - alpha)),
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4 justify-center">
        <div
          className="w-12 h-12 rounded shadow-inner"
          style={{ backgroundColor: `rgb(${front.r},${front.g},${front.b})` }}
        />
        <span className="text-lg font-mono">×{alpha.toFixed(1)}</span>
        <span className="text-lg">+</span>
        <div
          className="w-12 h-12 rounded shadow-inner"
          style={{ backgroundColor: `rgb(${back.r},${back.g},${back.b})` }}
        />
        <span className="text-lg font-mono">×{(1-alpha).toFixed(1)}</span>
        <span className="text-lg">=</span>
        <div
          className="w-12 h-12 rounded shadow-lg"
          style={{ backgroundColor: `rgb(${result.r},${result.g},${result.b})` }}
        />
      </div>
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={alpha}
        onChange={(e) => setAlpha(parseFloat(e.target.value))}
        className="w-full"
      />
      <p className="text-xs text-center text-[var(--muted)] font-mono">
        C_out = C_front × α + C_back × (1-α)
      </p>
    </div>
  );
}

// Mini visualization: Gaussian function curve
export function GaussianCurve() {
  const [sigma, setSigma] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Draw grid
    ctx.strokeStyle = 'rgba(128,128,128,0.2)';
    ctx.beginPath();
    for (let x = 0; x <= w; x += w/8) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    }
    for (let y = 0; y <= h; y += h/4) {
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    ctx.stroke();

    // Draw Gaussian curve
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let px = 0; px < w; px++) {
      const x = (px - w/2) / (w/8);
      const y = Math.exp(-(x * x) / (2 * sigma * sigma));
      const py = h - y * (h * 0.9) - 5;
      if (px === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Fill under curve
    ctx.fillStyle = 'rgba(139, 92, 246, 0.2)';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let px = 0; px < w; px++) {
      const x = (px - w/2) / (w/8);
      const y = Math.exp(-(x * x) / (2 * sigma * sigma));
      const py = h - y * (h * 0.9) - 5;
      ctx.lineTo(px, py);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();
  }, [sigma]);

  return (
    <div className="space-y-3">
      <canvas ref={canvasRef} width={200} height={100} className="w-full rounded bg-[var(--card-bg-alt)]" />
      <div className="flex items-center gap-3">
        <span className="text-xs text-[var(--muted)]">σ</span>
        <input
          type="range"
          min="0.3"
          max="2"
          step="0.1"
          value={sigma}
          onChange={(e) => setSigma(parseFloat(e.target.value))}
          className="flex-1"
        />
        <span className="text-xs font-mono w-8">{sigma.toFixed(1)}</span>
      </div>
      <p className="text-xs text-center text-[var(--muted)] font-mono">
        G(x) = e^(-x²/2σ²)
      </p>
    </div>
  );
}

// Mini visualization: Matrix transformation
export function MatrixTransformMini() {
  const [angle, setAngle] = useState(0);
  const [scale, setScale] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    ctx.clearRect(0, 0, w, h);

    // Draw axes
    ctx.strokeStyle = 'rgba(128,128,128,0.3)';
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(w, cy);
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, h);
    ctx.stroke();

    // Draw original circle (dashed)
    ctx.strokeStyle = 'rgba(128,128,128,0.5)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(cx, cy, 30, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw transformed ellipse
    const rad = (angle * Math.PI) / 180;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rad);
    ctx.scale(scale, 1);
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 30, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }, [angle, scale]);

  return (
    <div className="space-y-3">
      <canvas ref={canvasRef} width={150} height={150} className="w-full max-w-[150px] mx-auto rounded bg-[var(--card-bg-alt)]" />
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-[var(--muted)]">Rotation</span>
          <input
            type="range"
            min="0"
            max="180"
            value={angle}
            onChange={(e) => setAngle(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <span className="text-[var(--muted)]">Scale X</span>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={scale}
            onChange={(e) => setScale(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}

// Mini visualization: Noise levels in diffusion
export function DiffusionNoiseLevels() {
  const [step, setStep] = useState(0);
  const steps = 5;

  return (
    <div className="space-y-3">
      <div className="flex gap-1 justify-center">
        {Array.from({ length: steps + 1 }).map((_, i) => {
          const noiseLevel = i / steps;
          const blur = noiseLevel * 8;
          const noise = noiseLevel * 100;
          return (
            <div
              key={i}
              className={`w-12 h-12 rounded transition-all cursor-pointer ${i === step ? 'ring-2 ring-purple-500' : ''}`}
              onClick={() => setStep(i)}
              style={{
                background: `linear-gradient(135deg, #8b5cf6 ${100 - noise}%, #1a1a2e ${100 - noise}%)`,
                filter: `blur(${blur}px) contrast(${1 + noiseLevel * 0.5})`,
              }}
            />
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-[var(--muted)]">
        <span>t=0 (clean)</span>
        <span>t=T (noise)</span>
      </div>
      <input
        type="range"
        min="0"
        max={steps}
        value={step}
        onChange={(e) => setStep(parseInt(e.target.value))}
        className="w-full"
      />
      <p className="text-xs text-center text-[var(--muted)]">
        {step === 0 ? 'Original image' : step === steps ? 'Pure Gaussian noise' : `${Math.round((step/steps)*100)}% noise added`}
      </p>
    </div>
  );
}

// Mini visualization: Bone hierarchy
export function BoneHierarchyMini() {
  const [shoulderAngle, setShoulderAngle] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Spine
    const spineX = w / 2;
    const spineTop = 30;
    const spineBottom = h - 30;

    ctx.strokeStyle = '#666';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(spineX, spineTop);
    ctx.lineTo(spineX, spineBottom);
    ctx.stroke();

    // Shoulder
    const shoulderY = spineTop + 20;
    const rad = (shoulderAngle * Math.PI) / 180;
    const armLength = 40;
    const forearmLength = 35;

    // Upper arm
    const elbowX = spineX + Math.cos(rad) * armLength;
    const elbowY = shoulderY + Math.sin(rad) * armLength;

    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(spineX, shoulderY);
    ctx.lineTo(elbowX, elbowY);
    ctx.stroke();

    // Forearm (inherits rotation)
    const handX = elbowX + Math.cos(rad + 0.3) * forearmLength;
    const handY = elbowY + Math.sin(rad + 0.3) * forearmLength;

    ctx.strokeStyle = '#3b82f6';
    ctx.beginPath();
    ctx.moveTo(elbowX, elbowY);
    ctx.lineTo(handX, handY);
    ctx.stroke();

    // Joints
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(spineX, shoulderY, 5, 0, Math.PI * 2);
    ctx.arc(elbowX, elbowY, 4, 0, Math.PI * 2);
    ctx.arc(handX, handY, 3, 0, Math.PI * 2);
    ctx.fill();
  }, [shoulderAngle]);

  return (
    <div className="space-y-3">
      <canvas ref={canvasRef} width={150} height={120} className="w-full max-w-[150px] mx-auto rounded bg-[var(--card-bg-alt)]" />
      <div className="flex items-center gap-2">
        <span className="text-xs text-[var(--muted)]">Shoulder</span>
        <input
          type="range"
          min="-45"
          max="135"
          value={shoulderAngle}
          onChange={(e) => setShoulderAngle(parseInt(e.target.value))}
          className="flex-1"
        />
      </div>
      <p className="text-xs text-center text-[var(--muted)]">
        Child bones inherit parent transforms
      </p>
    </div>
  );
}

// Mini visualization: Blendshape interpolation
export function BlendshapeInterpolation() {
  const [weight, setWeight] = useState(0);

  const neutral = { eyeOpen: 1, mouthSmile: 0 };
  const smile = { eyeOpen: 0.7, mouthSmile: 1 };

  const current = {
    eyeOpen: neutral.eyeOpen + (smile.eyeOpen - neutral.eyeOpen) * weight,
    mouthSmile: neutral.mouthSmile + (smile.mouthSmile - neutral.mouthSmile) * weight,
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center gap-6">
        {/* Simplified face */}
        <svg width="60" height="60" viewBox="0 0 60 60" className="rounded-full bg-[var(--card-bg-alt)]">
          {/* Face outline */}
          <circle cx="30" cy="30" r="25" fill="none" stroke="#666" strokeWidth="2" />
          {/* Left eye */}
          <ellipse
            cx="22"
            cy="25"
            rx="4"
            ry={4 * current.eyeOpen}
            fill="#666"
          />
          {/* Right eye */}
          <ellipse
            cx="38"
            cy="25"
            rx="4"
            ry={4 * current.eyeOpen}
            fill="#666"
          />
          {/* Mouth */}
          <path
            d={`M 20 38 Q 30 ${38 + current.mouthSmile * 8} 40 38`}
            fill="none"
            stroke="#666"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <input
        type="range"
        min="0"
        max="1"
        step="0.05"
        value={weight}
        onChange={(e) => setWeight(parseFloat(e.target.value))}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-[var(--muted)]">
        <span>Neutral</span>
        <span className="font-mono">{(weight * 100).toFixed(0)}%</span>
        <span>Smile</span>
      </div>
    </div>
  );
}

// Mini visualization: Latency components
export function LatencyStack() {
  const components = [
    { name: 'STT', min: 80, max: 200, color: '#ef4444' },
    { name: 'LLM', min: 100, max: 400, color: '#f59e0b' },
    { name: 'TTS', min: 80, max: 200, color: '#22c55e' },
    { name: 'Avatar', min: 50, max: 150, color: '#3b82f6' },
    { name: 'Network', min: 30, max: 100, color: '#8b5cf6' },
  ];

  const [values, setValues] = useState(components.map(c => c.min));
  const total = values.reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-2">
      {components.map((comp, i) => (
        <div key={comp.name} className="flex items-center gap-2">
          <span className="text-xs w-14 text-[var(--muted)]">{comp.name}</span>
          <div className="flex-1 h-4 bg-[var(--card-bg-alt)] rounded overflow-hidden">
            <div
              className="h-full transition-all"
              style={{
                width: `${(values[i] / 500) * 100}%`,
                backgroundColor: comp.color,
              }}
            />
          </div>
          <span className="text-xs font-mono w-12 text-right">{values[i]}ms</span>
        </div>
      ))}
      <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
        <span className="text-xs font-medium">Total</span>
        <span className={`text-sm font-mono font-bold ${total > 500 ? 'text-red-500' : 'text-green-500'}`}>
          {total}ms
        </span>
      </div>
      <button
        onClick={() => setValues(components.map(c => c.min + Math.random() * (c.max - c.min)))}
        className="w-full text-xs py-1 rounded bg-[var(--card-bg-alt)] hover:bg-[var(--border)] transition-colors"
      >
        Randomize
      </button>
    </div>
  );
}

// Mini visualization: Packet ordering
export function PacketOrdering() {
  const [packets, setPackets] = useState([1, 2, 3, 4, 5]);
  const [jittered, setJittered] = useState(false);

  const shuffle = () => {
    const shuffled = [...packets].sort(() => Math.random() - 0.5);
    setPackets(shuffled);
    setJittered(true);
  };

  const reorder = () => {
    setPackets([1, 2, 3, 4, 5]);
    setJittered(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-1 justify-center">
        {packets.map((p, i) => (
          <div
            key={i}
            className={`w-10 h-10 rounded flex items-center justify-center font-mono text-sm transition-all ${
              jittered && packets[i] !== i + 1 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
            }`}
          >
            {p}
          </div>
        ))}
      </div>
      <div className="flex gap-2 justify-center">
        <button
          onClick={shuffle}
          className="text-xs px-3 py-1 rounded bg-[var(--card-bg-alt)] hover:bg-[var(--border)] transition-colors"
        >
          Simulate Jitter
        </button>
        <button
          onClick={reorder}
          className="text-xs px-3 py-1 rounded bg-[var(--card-bg-alt)] hover:bg-[var(--border)] transition-colors"
        >
          Reorder (Buffer)
        </button>
      </div>
      <p className="text-xs text-center text-[var(--muted)]">
        {jittered ? 'Packets arrived out of order!' : 'Packets in correct sequence'}
      </p>
    </div>
  );
}
