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

// ============ GAUSSIAN SPLATTING MECHANISMS ============

// Depth sorting visualization
export function DepthSortingMini() {
  const [sorted, setSorted] = useState(true);
  const layers = [
    { z: 3, color: '#ef4444', label: 'Far' },
    { z: 2, color: '#22c55e', label: 'Mid' },
    { z: 1, color: '#3b82f6', label: 'Near' },
  ];

  const displayLayers = sorted
    ? [...layers].sort((a, b) => b.z - a.z)
    : [...layers].sort(() => Math.random() - 0.5);

  return (
    <div className="space-y-3">
      <div className="relative h-20 flex items-center justify-center">
        {displayLayers.map((layer, i) => (
          <div
            key={layer.label}
            className="absolute w-16 h-16 rounded-full opacity-70 flex items-center justify-center text-xs font-bold text-white"
            style={{
              backgroundColor: layer.color,
              left: `${30 + i * 15}%`,
              zIndex: sorted ? layer.z : i,
            }}
          >
            {layer.label}
          </div>
        ))}
      </div>
      <button
        onClick={() => setSorted(!sorted)}
        className="w-full text-xs py-1 rounded bg-[var(--card-bg-alt)] hover:bg-[var(--border)]"
      >
        {sorted ? 'Scramble Order' : 'Sort by Depth'}
      </button>
      <p className="text-xs text-center text-[var(--muted)]">
        {sorted ? 'Back-to-front order for correct blending' : 'Wrong order causes artifacts!'}
      </p>
    </div>
  );
}

// Tile rasterization
export function TileRasterizationMini() {
  const [activeTile, setActiveTile] = useState<number | null>(null);
  const tiles = Array(16).fill(0);
  const gaussiansPerTile = [3, 5, 2, 8, 4, 6, 1, 7, 5, 3, 4, 2, 6, 8, 3, 5];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-1">
        {tiles.map((_, i) => (
          <div
            key={i}
            className={`aspect-square rounded cursor-pointer transition-all flex items-center justify-center text-xs font-mono
              ${activeTile === i ? 'ring-2 ring-purple-500 bg-purple-500/30' : 'bg-[var(--card-bg-alt)] hover:bg-[var(--border)]'}`}
            onClick={() => setActiveTile(activeTile === i ? null : i)}
          >
            {gaussiansPerTile[i]}
          </div>
        ))}
      </div>
      <p className="text-xs text-center text-[var(--muted)]">
        {activeTile !== null
          ? `Tile ${activeTile}: ${gaussiansPerTile[activeTile]} Gaussians to blend`
          : 'Click tile to see Gaussian count'}
      </p>
    </div>
  );
}

// Screen projection
export function ScreenProjectionMini() {
  const [fov, setFov] = useState(60);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Draw frustum
    const halfFov = (fov / 2) * Math.PI / 180;
    const nearW = 20;
    const farW = Math.tan(halfFov) * 80;

    ctx.strokeStyle = '#666';
    ctx.beginPath();
    ctx.moveTo(w/2 - nearW, h - 20);
    ctx.lineTo(w/2 - farW, 20);
    ctx.moveTo(w/2 + nearW, h - 20);
    ctx.lineTo(w/2 + farW, 20);
    ctx.stroke();

    // Draw 3D point
    const pointZ = 50;
    const pointX = 20;
    const projectedX = pointX / (pointZ / 40);

    ctx.fillStyle = '#8b5cf6';
    ctx.beginPath();
    ctx.arc(w/2 + pointX, h - pointZ - 20, 6, 0, Math.PI * 2);
    ctx.fill();

    // Draw projected point
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(w/2 + projectedX, h - 10, 4, 0, Math.PI * 2);
    ctx.fill();

    // Connect them
    ctx.strokeStyle = '#22c55e';
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(w/2 + pointX, h - pointZ - 20);
    ctx.lineTo(w/2 + projectedX, h - 10);
    ctx.stroke();
    ctx.setLineDash([]);
  }, [fov]);

  return (
    <div className="space-y-3">
      <canvas ref={canvasRef} width={150} height={100} className="w-full rounded bg-[var(--card-bg-alt)]" />
      <div className="flex items-center gap-2">
        <span className="text-xs text-[var(--muted)]">FOV</span>
        <input
          type="range"
          min="30"
          max="120"
          value={fov}
          onChange={(e) => setFov(parseInt(e.target.value))}
          className="flex-1"
        />
        <span className="text-xs font-mono">{fov}°</span>
      </div>
    </div>
  );
}

// Opacity accumulation
export function OpacityAccumulation() {
  const [count, setCount] = useState(3);
  const alpha = 0.3;
  const accumulated = 1 - Math.pow(1 - alpha, count);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center gap-2">
        {Array(count).fill(0).map((_, i) => (
          <div
            key={i}
            className="w-8 h-8 rounded-full bg-purple-500"
            style={{ opacity: alpha }}
          />
        ))}
        <span className="mx-2">=</span>
        <div
          className="w-10 h-10 rounded-full bg-purple-500"
          style={{ opacity: accumulated }}
        />
      </div>
      <input
        type="range"
        min="1"
        max="10"
        value={count}
        onChange={(e) => setCount(parseInt(e.target.value))}
        className="w-full"
      />
      <p className="text-xs text-center text-[var(--muted)] font-mono">
        T = 1 - (1-α)^n = {(accumulated * 100).toFixed(0)}%
      </p>
    </div>
  );
}

// SH Bands visualization
export function SphericalHarmonicsBands() {
  const [degree, setDegree] = useState(0);
  const bands = [
    { d: 0, coeffs: 1, desc: 'Constant (diffuse)' },
    { d: 1, coeffs: 4, desc: '+ Directional' },
    { d: 2, coeffs: 9, desc: '+ Soft shadows' },
    { d: 3, coeffs: 16, desc: '+ Specular hints' },
  ];

  return (
    <div className="space-y-3">
      <div className="flex gap-1 justify-center">
        {bands.map((b, i) => (
          <div
            key={i}
            className={`px-3 py-2 rounded text-xs cursor-pointer transition-all
              ${degree >= i ? 'bg-purple-500/30 text-purple-300' : 'bg-[var(--card-bg-alt)] text-[var(--muted)]'}`}
            onClick={() => setDegree(i)}
          >
            L{b.d}
          </div>
        ))}
      </div>
      <div className="text-center">
        <p className="text-sm font-medium">{bands[degree].coeffs} coefficients</p>
        <p className="text-xs text-[var(--muted)]">{bands[degree].desc}</p>
      </div>
      <div className="h-2 bg-[var(--card-bg-alt)] rounded overflow-hidden">
        <div
          className="h-full bg-purple-500 transition-all"
          style={{ width: `${(bands[degree].coeffs / 16) * 100}%` }}
        />
      </div>
    </div>
  );
}

// Gradient flow
export function GradientFlowMini() {
  const [step, setStep] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Loss landscape (simple parabola)
    ctx.strokeStyle = '#666';
    ctx.beginPath();
    for (let x = 0; x < w; x++) {
      const nx = (x - w/2) / 30;
      const y = h - 20 - (1 - nx * nx * 0.3) * 60;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Current position
    const pos = -2 + step * 0.4;
    const px = w/2 + pos * 30;
    const py = h - 20 - (1 - pos * pos * 0.3) * 60;

    // Gradient arrow
    const gradient = -pos * 0.6;
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + gradient * 20, py);
    ctx.stroke();

    // Point
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(px, py, 5, 0, Math.PI * 2);
    ctx.fill();
  }, [step]);

  return (
    <div className="space-y-3">
      <canvas ref={canvasRef} width={150} height={80} className="w-full rounded bg-[var(--card-bg-alt)]" />
      <input
        type="range"
        min="0"
        max="10"
        value={step}
        onChange={(e) => setStep(parseInt(e.target.value))}
        className="w-full"
      />
      <p className="text-xs text-center text-[var(--muted)]">
        Step {step}: Following negative gradient
      </p>
    </div>
  );
}

// Adaptive density
export function AdaptiveDensityMini() {
  const [mode, setMode] = useState<'clone' | 'split' | 'prune'>('clone');

  return (
    <div className="space-y-3">
      <div className="flex gap-2 justify-center">
        {(['clone', 'split', 'prune'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-3 py-1 rounded text-xs capitalize ${mode === m ? 'bg-purple-500 text-white' : 'bg-[var(--card-bg-alt)]'}`}
          >
            {m}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-center gap-4 h-16">
        {mode === 'clone' && (
          <>
            <div className="w-8 h-8 rounded-full bg-blue-500" />
            <span>→</span>
            <div className="w-8 h-8 rounded-full bg-blue-500" />
            <div className="w-8 h-8 rounded-full bg-blue-500 opacity-50" />
          </>
        )}
        {mode === 'split' && (
          <>
            <div className="w-12 h-12 rounded-full bg-green-500" />
            <span>→</span>
            <div className="w-6 h-6 rounded-full bg-green-500" />
            <div className="w-6 h-6 rounded-full bg-green-500" />
          </>
        )}
        {mode === 'prune' && (
          <>
            <div className="w-8 h-8 rounded-full bg-red-500 opacity-20" />
            <span>→</span>
            <div className="w-8 h-8 rounded-full border-2 border-dashed border-red-500/50" />
          </>
        )}
      </div>
      <p className="text-xs text-center text-[var(--muted)]">
        {mode === 'clone' && 'High gradient → duplicate for detail'}
        {mode === 'split' && 'Too large → divide into smaller'}
        {mode === 'prune' && 'Low opacity → remove redundant'}
      </p>
    </div>
  );
}

// ============ NEURAL NETWORK MECHANISMS ============

// Single neuron
export function NeuronMini() {
  const [inputs] = useState([0.5, 0.8, 0.3]);
  const [weights, setWeights] = useState([0.4, -0.2, 0.6]);
  const bias = 0.1;
  const sum = inputs.reduce((acc, inp, i) => acc + inp * weights[i], 0) + bias;
  const output = 1 / (1 + Math.exp(-sum)); // sigmoid

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center gap-2">
        <div className="space-y-1">
          {inputs.map((inp, i) => (
            <div key={i} className="flex items-center gap-1 text-xs">
              <span className="w-6 text-right text-blue-400">{inp}</span>
              <span className="text-[var(--muted)]">×</span>
              <input
                type="range"
                min="-1"
                max="1"
                step="0.1"
                value={weights[i]}
                onChange={(e) => {
                  const newW = [...weights];
                  newW[i] = parseFloat(e.target.value);
                  setWeights(newW);
                }}
                className="w-12"
              />
              <span className="w-8 font-mono text-green-400">{weights[i].toFixed(1)}</span>
            </div>
          ))}
        </div>
        <span className="text-lg">→</span>
        <div className="w-12 h-12 rounded-full bg-purple-500/30 flex items-center justify-center">
          <span className="text-xs font-mono">{output.toFixed(2)}</span>
        </div>
      </div>
      <p className="text-xs text-center text-[var(--muted)] font-mono">
        σ(Σwᵢxᵢ + b) = {output.toFixed(3)}
      </p>
    </div>
  );
}

// Activation functions
export function ActivationFunctionsMini() {
  const [func, setFunc] = useState<'relu' | 'sigmoid' | 'tanh'>('relu');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Axes
    ctx.strokeStyle = '#666';
    ctx.beginPath();
    ctx.moveTo(0, h/2);
    ctx.lineTo(w, h/2);
    ctx.moveTo(w/2, 0);
    ctx.lineTo(w/2, h);
    ctx.stroke();

    // Function
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let px = 0; px < w; px++) {
      const x = (px - w/2) / 20;
      let y;
      if (func === 'relu') y = Math.max(0, x);
      else if (func === 'sigmoid') y = 1 / (1 + Math.exp(-x));
      else y = Math.tanh(x);

      const py = h/2 - y * 30;
      if (px === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }, [func]);

  return (
    <div className="space-y-3">
      <div className="flex gap-1 justify-center">
        {(['relu', 'sigmoid', 'tanh'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFunc(f)}
            className={`px-2 py-1 rounded text-xs uppercase ${func === f ? 'bg-purple-500 text-white' : 'bg-[var(--card-bg-alt)]'}`}
          >
            {f}
          </button>
        ))}
      </div>
      <canvas ref={canvasRef} width={120} height={80} className="w-full rounded bg-[var(--card-bg-alt)]" />
    </div>
  );
}

// Convolution kernel
export function ConvolutionMini() {
  const [kernelType, setKernelType] = useState<'edge' | 'blur' | 'sharpen'>('edge');
  const kernels = {
    edge: [[-1, -1, -1], [-1, 8, -1], [-1, -1, -1]],
    blur: [[1, 1, 1], [1, 1, 1], [1, 1, 1]].map(r => r.map(v => v/9)),
    sharpen: [[0, -1, 0], [-1, 5, -1], [0, -1, 0]],
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-1 justify-center">
        {(['edge', 'blur', 'sharpen'] as const).map((k) => (
          <button
            key={k}
            onClick={() => setKernelType(k)}
            className={`px-2 py-1 rounded text-xs capitalize ${kernelType === k ? 'bg-blue-500 text-white' : 'bg-[var(--card-bg-alt)]'}`}
          >
            {k}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-1 w-24 mx-auto">
        {kernels[kernelType].flat().map((v, i) => (
          <div
            key={i}
            className={`aspect-square rounded text-xs flex items-center justify-center font-mono
              ${v > 0 ? 'bg-green-500/30' : v < 0 ? 'bg-red-500/30' : 'bg-[var(--card-bg-alt)]'}`}
          >
            {typeof v === 'number' ? v.toFixed(1).replace('0.', '.') : v}
          </div>
        ))}
      </div>
      <p className="text-xs text-center text-[var(--muted)]">
        3×3 kernel slides over image
      </p>
    </div>
  );
}

// Pooling
export function PoolingMini() {
  const [poolType, setPoolType] = useState<'max' | 'avg'>('max');
  const input = [[4, 2, 1, 3], [1, 5, 6, 2], [3, 1, 2, 4], [2, 3, 5, 1]];

  const pool = (grid: number[][]): number[][] => {
    const result = [];
    for (let i = 0; i < 2; i++) {
      const row = [];
      for (let j = 0; j < 2; j++) {
        const block = [
          grid[i*2][j*2], grid[i*2][j*2+1],
          grid[i*2+1][j*2], grid[i*2+1][j*2+1]
        ];
        row.push(poolType === 'max' ? Math.max(...block) : block.reduce((a,b) => a+b, 0) / 4);
      }
      result.push(row);
    }
    return result;
  };

  const output = pool(input);

  return (
    <div className="space-y-3">
      <div className="flex gap-1 justify-center">
        {(['max', 'avg'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPoolType(p)}
            className={`px-2 py-1 rounded text-xs uppercase ${poolType === p ? 'bg-green-500 text-white' : 'bg-[var(--card-bg-alt)]'}`}
          >
            {p}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-center gap-3">
        <div className="grid grid-cols-4 gap-0.5">
          {input.flat().map((v, i) => (
            <div key={i} className="w-6 h-6 bg-[var(--card-bg-alt)] text-xs flex items-center justify-center">{v}</div>
          ))}
        </div>
        <span>→</span>
        <div className="grid grid-cols-2 gap-0.5">
          {output.flat().map((v, i) => (
            <div key={i} className="w-8 h-8 bg-green-500/30 text-xs flex items-center justify-center font-bold">
              {poolType === 'avg' ? v.toFixed(1) : v}
            </div>
          ))}
        </div>
      </div>
      <p className="text-xs text-center text-[var(--muted)]">
        4×4 → 2×2 ({poolType === 'max' ? 'take maximum' : 'average values'})
      </p>
    </div>
  );
}

// Dropout
export function DropoutMini() {
  const [dropRate, setDropRate] = useState(0.3);
  const [dropped, setDropped] = useState<boolean[]>([]);
  const neurons = 12;

  const randomize = () => {
    setDropped(Array(neurons).fill(0).map(() => Math.random() < dropRate));
  };

  useEffect(() => { randomize(); }, [dropRate]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1 justify-center">
        {Array(neurons).fill(0).map((_, i) => (
          <div
            key={i}
            className={`w-6 h-6 rounded-full transition-all ${dropped[i] ? 'bg-red-500/30 scale-75' : 'bg-blue-500'}`}
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-[var(--muted)]">Drop</span>
        <input
          type="range"
          min="0"
          max="0.8"
          step="0.1"
          value={dropRate}
          onChange={(e) => setDropRate(parseFloat(e.target.value))}
          className="flex-1"
        />
        <span className="text-xs font-mono">{(dropRate * 100).toFixed(0)}%</span>
      </div>
      <button
        onClick={randomize}
        className="w-full text-xs py-1 rounded bg-[var(--card-bg-alt)] hover:bg-[var(--border)]"
      >
        Re-sample
      </button>
    </div>
  );
}

// Loss landscape
export function LossLandscape() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pos, setPos] = useState({ x: 0.3, y: 0.7 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Draw loss surface (simple bowl)
    const imageData = ctx.createImageData(w, h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const nx = (x / w - 0.5) * 2;
        const ny = (y / h - 0.5) * 2;
        const loss = nx * nx + ny * ny;
        const intensity = Math.min(255, loss * 200);
        const i = (y * w + x) * 4;
        imageData.data[i] = intensity * 0.3;
        imageData.data[i + 1] = intensity * 0.1;
        imageData.data[i + 2] = intensity * 0.5;
        imageData.data[i + 3] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);

    // Draw position
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(pos.x * w, pos.y * h, 5, 0, Math.PI * 2);
    ctx.fill();

    // Draw minimum
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(w/2, h/2, 4, 0, Math.PI * 2);
    ctx.fill();
  }, [pos]);

  return (
    <div className="space-y-3">
      <canvas
        ref={canvasRef}
        width={120}
        height={120}
        className="w-full rounded cursor-crosshair"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setPos({
            x: (e.clientX - rect.left) / rect.width,
            y: (e.clientY - rect.top) / rect.height,
          });
        }}
      />
      <p className="text-xs text-center text-[var(--muted)]">
        Click to place optimizer (yellow = minimum)
      </p>
    </div>
  );
}

// Learning rate effect
export function LearningRateMini() {
  const [lr, setLr] = useState(0.1);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Draw parabola
    ctx.strokeStyle = '#666';
    ctx.beginPath();
    for (let x = 0; x < w; x++) {
      const nx = (x - w/2) / 30;
      const y = h - 20 - (1 - nx * nx * 0.3) * 50;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Simulate gradient descent steps
    ctx.fillStyle = '#22c55e';
    let px = -2;
    for (let i = 0; i < 8; i++) {
      const screenX = w/2 + px * 30;
      const screenY = h - 20 - (1 - px * px * 0.3) * 50;
      ctx.beginPath();
      ctx.arc(screenX, screenY, 3, 0, Math.PI * 2);
      ctx.fill();
      px = px - lr * (-px * 0.6);
      if (Math.abs(px) > 4) break; // diverged
    }
  }, [lr]);

  return (
    <div className="space-y-3">
      <canvas ref={canvasRef} width={150} height={80} className="w-full rounded bg-[var(--card-bg-alt)]" />
      <div className="flex items-center gap-2">
        <span className="text-xs text-[var(--muted)]">LR</span>
        <input
          type="range"
          min="0.05"
          max="2"
          step="0.05"
          value={lr}
          onChange={(e) => setLr(parseFloat(e.target.value))}
          className="flex-1"
        />
        <span className="text-xs font-mono">{lr.toFixed(2)}</span>
      </div>
      <p className="text-xs text-center text-[var(--muted)]">
        {lr < 0.3 ? 'Slow convergence' : lr > 1 ? 'Diverging!' : 'Good convergence'}
      </p>
    </div>
  );
}

// Batch normalization
export function BatchNormMini() {
  const [normalized, setNormalized] = useState(false);
  const data = [2, 8, 3, 9, 1, 7, 4, 6];
  const mean = data.reduce((a, b) => a + b, 0) / data.length;
  const std = Math.sqrt(data.reduce((a, b) => a + (b - mean) ** 2, 0) / data.length);
  const normData = data.map(d => (d - mean) / std);

  const displayData = normalized ? normData : data;
  const max = Math.max(...displayData.map(Math.abs));

  return (
    <div className="space-y-3">
      <div className="flex gap-1 justify-center h-16 items-end">
        {displayData.map((d, i) => (
          <div
            key={i}
            className={`w-6 rounded-t transition-all ${d >= 0 ? 'bg-blue-500' : 'bg-red-500'}`}
            style={{ height: `${(Math.abs(d) / max) * 100}%` }}
          />
        ))}
      </div>
      <button
        onClick={() => setNormalized(!normalized)}
        className={`w-full text-xs py-1 rounded ${normalized ? 'bg-green-500 text-white' : 'bg-[var(--card-bg-alt)]'}`}
      >
        {normalized ? 'Normalized (μ=0, σ=1)' : 'Raw activations'}
      </button>
    </div>
  );
}

// ============ METAHUMAN MECHANISMS ============

// Skinning weights
export function SkinningWeightsMini() {
  const [bonePos, setBonePos] = useState(0.5);
  const vertices = [0.2, 0.35, 0.5, 0.65, 0.8];

  return (
    <div className="space-y-3">
      <div className="relative h-16 bg-[var(--card-bg-alt)] rounded">
        {/* Mesh line */}
        <svg className="absolute inset-0 w-full h-full">
          <path
            d={`M ${vertices.map((v, i) => {
              const x = v * 100;
              const offset = Math.abs(v - 0.5) < 0.2 ? (bonePos - 0.5) * 30 : 0;
              return `${x}%,${50 + offset}%`;
            }).join(' L ')}`}
            stroke="#666"
            strokeWidth="3"
            fill="none"
          />
          {vertices.map((v, i) => {
            const weight = 1 - Math.min(1, Math.abs(v - 0.5) * 3);
            const offset = weight * (bonePos - 0.5) * 30;
            return (
              <circle
                key={i}
                cx={`${v * 100}%`}
                cy={`${50 + offset}%`}
                r="4"
                fill={`rgb(${weight * 139}, ${92 + weight * 50}, 246)`}
              />
            );
          })}
        </svg>
        {/* Bone */}
        <div
          className="absolute w-3 h-3 bg-yellow-400 rounded-full"
          style={{ left: '50%', top: `${50 + (bonePos - 0.5) * 30}%`, transform: 'translate(-50%, -50%)' }}
        />
      </div>
      <input
        type="range"
        min="0"
        max="1"
        step="0.05"
        value={bonePos}
        onChange={(e) => setBonePos(parseFloat(e.target.value))}
        className="w-full"
      />
      <p className="text-xs text-center text-[var(--muted)]">
        Vertices follow bone based on weight (purple = high)
      </p>
    </div>
  );
}

// FK vs IK
export function FKvsIKMini() {
  const [mode, setMode] = useState<'fk' | 'ik'>('fk');
  const [angle, setAngle] = useState(45);
  const [target, setTarget] = useState({ x: 80, y: 60 });

  return (
    <div className="space-y-3">
      <div className="flex gap-2 justify-center">
        <button
          onClick={() => setMode('fk')}
          className={`px-3 py-1 rounded text-xs ${mode === 'fk' ? 'bg-blue-500 text-white' : 'bg-[var(--card-bg-alt)]'}`}
        >
          Forward K
        </button>
        <button
          onClick={() => setMode('ik')}
          className={`px-3 py-1 rounded text-xs ${mode === 'ik' ? 'bg-green-500 text-white' : 'bg-[var(--card-bg-alt)]'}`}
        >
          Inverse K
        </button>
      </div>
      <div className="relative h-24 bg-[var(--card-bg-alt)] rounded">
        <svg className="w-full h-full">
          {mode === 'fk' ? (
            <>
              <line x1="30" y1="80" x2={30 + Math.cos(angle * Math.PI/180) * 40} y2={80 - Math.sin(angle * Math.PI/180) * 40} stroke="#3b82f6" strokeWidth="4" />
              <line
                x1={30 + Math.cos(angle * Math.PI/180) * 40}
                y1={80 - Math.sin(angle * Math.PI/180) * 40}
                x2={30 + Math.cos(angle * Math.PI/180) * 40 + Math.cos((angle-30) * Math.PI/180) * 35}
                y2={80 - Math.sin(angle * Math.PI/180) * 40 - Math.sin((angle-30) * Math.PI/180) * 35}
                stroke="#22c55e"
                strokeWidth="3"
              />
            </>
          ) : (
            <>
              <circle cx={target.x} cy={target.y} r="6" fill="#ef4444" opacity="0.5" />
              <line x1="30" y1="80" x2={target.x * 0.6 + 12} y2={target.y * 0.6 + 32} stroke="#3b82f6" strokeWidth="4" />
              <line x1={target.x * 0.6 + 12} y1={target.y * 0.6 + 32} x2={target.x} y2={target.y} stroke="#22c55e" strokeWidth="3" />
            </>
          )}
        </svg>
      </div>
      {mode === 'fk' && (
        <input
          type="range"
          min="0"
          max="90"
          value={angle}
          onChange={(e) => setAngle(parseInt(e.target.value))}
          className="w-full"
        />
      )}
      <p className="text-xs text-center text-[var(--muted)]">
        {mode === 'fk' ? 'Rotate joints → end position' : 'Set target → compute angles'}
      </p>
    </div>
  );
}

// LOD levels
export function LODMini() {
  const [distance, setDistance] = useState(50);
  const lods = [
    { maxDist: 30, tris: '50K', detail: 'Full' },
    { maxDist: 60, tris: '15K', detail: 'Medium' },
    { maxDist: 100, tris: '3K', detail: 'Low' },
  ];
  const currentLOD = lods.findIndex(l => distance <= l.maxDist);

  return (
    <div className="space-y-3">
      <div className="flex gap-2 justify-center">
        {lods.map((lod, i) => (
          <div
            key={i}
            className={`px-3 py-2 rounded text-center ${currentLOD === i ? 'bg-purple-500/30 ring-2 ring-purple-500' : 'bg-[var(--card-bg-alt)]'}`}
          >
            <div className="text-xs font-bold">{lod.detail}</div>
            <div className="text-xs text-[var(--muted)]">{lod.tris}</div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs">Near</span>
        <input
          type="range"
          min="10"
          max="100"
          value={distance}
          onChange={(e) => setDistance(parseInt(e.target.value))}
          className="flex-1"
        />
        <span className="text-xs">Far</span>
      </div>
      <p className="text-xs text-center text-[var(--muted)]">
        Distance: {distance}m → LOD{currentLOD}
      </p>
    </div>
  );
}

// FACS Action Units
export function FACSMini() {
  const [aus, setAus] = useState({ AU1: 0, AU2: 0, AU12: 0, AU25: 0 });

  return (
    <div className="space-y-3">
      <svg width="80" height="80" viewBox="0 0 80 80" className="mx-auto">
        <circle cx="40" cy="40" r="35" fill="none" stroke="#666" strokeWidth="2" />
        {/* Eyebrows */}
        <path
          d={`M 20 ${28 - aus.AU1 * 5} Q 30 ${25 - aus.AU1 * 8 - aus.AU2 * 3} 35 ${28 - aus.AU1 * 5}`}
          fill="none" stroke="#666" strokeWidth="2"
        />
        <path
          d={`M 45 ${28 - aus.AU1 * 5} Q 50 ${25 - aus.AU1 * 8 - aus.AU2 * 3} 60 ${28 - aus.AU1 * 5}`}
          fill="none" stroke="#666" strokeWidth="2"
        />
        {/* Eyes */}
        <ellipse cx="30" cy="35" rx="5" ry="4" fill="#666" />
        <ellipse cx="50" cy="35" rx="5" ry="4" fill="#666" />
        {/* Mouth */}
        <path
          d={`M 25 ${55 - aus.AU25 * 3} Q 40 ${55 + aus.AU12 * 10 + aus.AU25 * 5} 55 ${55 - aus.AU25 * 3}`}
          fill="none" stroke="#666" strokeWidth="2"
        />
      </svg>
      <div className="grid grid-cols-2 gap-1 text-xs">
        {Object.entries(aus).map(([au, val]) => (
          <div key={au} className="flex items-center gap-1">
            <span className="w-10 text-[var(--muted)]">{au}</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={val}
              onChange={(e) => setAus({ ...aus, [au]: parseFloat(e.target.value) })}
              className="flex-1"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// Wrinkle maps
export function WrinkleMapMini() {
  const [expression, setExpression] = useState(0);

  return (
    <div className="space-y-3">
      <div className="relative w-20 h-20 mx-auto rounded-full bg-[var(--card-bg-alt)] overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-transparent"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent ${10 - expression * 3}px, rgba(0,0,0,${expression * 0.3}) ${10 - expression * 3}px, rgba(0,0,0,${expression * 0.3}) ${11 - expression * 3}px)`,
          }}
        />
        <div className="absolute top-1/4 left-1/4 w-1/2 text-center text-xs text-[var(--muted)]">
          Forehead
        </div>
      </div>
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={expression}
        onChange={(e) => setExpression(parseFloat(e.target.value))}
        className="w-full"
      />
      <p className="text-xs text-center text-[var(--muted)]">
        Wrinkle intensity: {(expression * 100).toFixed(0)}%
      </p>
    </div>
  );
}

// ============ GENERATIVE VIDEO MECHANISMS ============

// U-Net skip connections
export function UNetSkipMini() {
  const [showSkip, setShowSkip] = useState(true);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center gap-1">
        {/* Encoder */}
        <div className="space-y-1">
          {[32, 24, 16, 8].map((s, i) => (
            <div
              key={i}
              className="bg-blue-500/50 rounded"
              style={{ width: s * 2, height: 16, marginLeft: (32 - s) }}
            />
          ))}
        </div>
        {/* Skip connections */}
        <div className="relative w-8">
          {showSkip && [0, 1, 2].map((i) => (
            <div
              key={i}
              className="absolute h-0.5 bg-yellow-400"
              style={{ top: 8 + i * 17, left: 0, width: 32 }}
            />
          ))}
        </div>
        {/* Decoder */}
        <div className="space-y-1">
          {[8, 16, 24, 32].map((s, i) => (
            <div
              key={i}
              className="bg-green-500/50 rounded"
              style={{ width: s * 2, height: 16 }}
            />
          ))}
        </div>
      </div>
      <button
        onClick={() => setShowSkip(!showSkip)}
        className={`w-full text-xs py-1 rounded ${showSkip ? 'bg-yellow-500 text-black' : 'bg-[var(--card-bg-alt)]'}`}
      >
        {showSkip ? 'Skip connections ON' : 'Skip connections OFF'}
      </button>
    </div>
  );
}

// Attention heatmap
export function AttentionHeatmapMini() {
  const [query, setQuery] = useState(2);
  const attention = Array(8).fill(0).map((_, i) =>
    Math.exp(-Math.abs(i - query) * 0.8)
  );
  const sum = attention.reduce((a, b) => a + b, 0);
  const normalized = attention.map(a => a / sum);

  return (
    <div className="space-y-3">
      <div className="flex gap-0.5 justify-center">
        {normalized.map((a, i) => (
          <div
            key={i}
            className={`w-6 h-12 rounded cursor-pointer transition-all ${i === query ? 'ring-2 ring-white' : ''}`}
            style={{ backgroundColor: `rgba(139, 92, 246, ${a})` }}
            onClick={() => setQuery(i)}
          />
        ))}
      </div>
      <p className="text-xs text-center text-[var(--muted)]">
        Click token to see its attention
      </p>
    </div>
  );
}

// VAE latent
export function VAELatentMini() {
  const [compressed, setCompressed] = useState(true);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center gap-2">
        <div className={`transition-all ${compressed ? 'w-6 h-6' : 'w-16 h-16'} bg-gradient-to-br from-purple-500 to-blue-500 rounded`} />
        <span className="text-lg">{compressed ? '←' : '→'}</span>
        <div className={`transition-all ${compressed ? 'w-16 h-16' : 'w-6 h-6'} bg-gradient-to-br from-purple-500 to-blue-500 rounded`} />
      </div>
      <button
        onClick={() => setCompressed(!compressed)}
        className="w-full text-xs py-1 rounded bg-[var(--card-bg-alt)] hover:bg-[var(--border)]"
      >
        {compressed ? 'Decode (expand)' : 'Encode (compress)'}
      </button>
      <p className="text-xs text-center text-[var(--muted)]">
        {compressed ? '64×64×4 latent' : '512×512×3 image'}
      </p>
    </div>
  );
}

// CFG strength
export function CFGStrengthMini() {
  const [cfg, setCfg] = useState(7);

  return (
    <div className="space-y-3">
      <div className="flex gap-2 justify-center items-end h-16">
        <div className="text-center">
          <div className="w-12 h-12 rounded bg-gradient-to-br from-gray-500 to-gray-700 opacity-50" />
          <span className="text-xs">Uncond</span>
        </div>
        <div className="text-center">
          <div
            className="w-12 rounded bg-gradient-to-br from-purple-500 to-blue-500"
            style={{ height: Math.min(48, 12 + cfg * 4) }}
          />
          <span className="text-xs">Result</span>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 rounded bg-gradient-to-br from-green-500 to-teal-500" />
          <span className="text-xs">Cond</span>
        </div>
      </div>
      <input
        type="range"
        min="1"
        max="20"
        value={cfg}
        onChange={(e) => setCfg(parseInt(e.target.value))}
        className="w-full"
      />
      <p className="text-xs text-center text-[var(--muted)]">
        CFG: {cfg} {cfg < 5 ? '(blurry)' : cfg > 15 ? '(artifacts)' : '(good)'}
      </p>
    </div>
  );
}

// Noise schedule
export function NoiseScheduleMini() {
  const [schedule, setSchedule] = useState<'linear' | 'cosine'>('linear');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let t = 0; t <= 1; t += 0.01) {
      const x = t * w;
      let noise;
      if (schedule === 'linear') {
        noise = t;
      } else {
        noise = 1 - Math.cos((t * Math.PI) / 2);
      }
      const y = h - noise * (h - 10) - 5;
      if (t === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }, [schedule]);

  return (
    <div className="space-y-3">
      <div className="flex gap-2 justify-center">
        {(['linear', 'cosine'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSchedule(s)}
            className={`px-3 py-1 rounded text-xs capitalize ${schedule === s ? 'bg-purple-500 text-white' : 'bg-[var(--card-bg-alt)]'}`}
          >
            {s}
          </button>
        ))}
      </div>
      <canvas ref={canvasRef} width={120} height={60} className="w-full rounded bg-[var(--card-bg-alt)]" />
      <p className="text-xs text-center text-[var(--muted)]">
        {schedule === 'cosine' ? 'Slower start, faster end' : 'Constant rate'}
      </p>
    </div>
  );
}

// Temporal consistency
export function TemporalConsistencyMini() {
  const [frame, setFrame] = useState(0);
  const [consistent, setConsistent] = useState(true);
  const jitter = consistent ? 0 : Math.sin(frame * 2.5) * 5;

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame(f => (f + 1) % 60);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-3">
      <div className="h-16 bg-[var(--card-bg-alt)] rounded flex items-center justify-center">
        <div
          className="w-12 h-12 rounded-full bg-purple-500 transition-transform"
          style={{ transform: `translateX(${jitter}px)` }}
        />
      </div>
      <button
        onClick={() => setConsistent(!consistent)}
        className={`w-full text-xs py-1 rounded ${consistent ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
      >
        {consistent ? 'Temporally stable' : 'Flickering/jittery'}
      </button>
    </div>
  );
}

// ============ STREAMING MECHANISMS ============

// ICE candidates
export function ICECandidatesMini() {
  const [selected, setSelected] = useState<'host' | 'srflx' | 'relay'>('host');
  const candidates = {
    host: { latency: '1ms', desc: 'Direct local', color: '#22c55e' },
    srflx: { latency: '20ms', desc: 'Via STUN', color: '#f59e0b' },
    relay: { latency: '80ms', desc: 'Via TURN', color: '#ef4444' },
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2 justify-center">
        {(Object.keys(candidates) as Array<keyof typeof candidates>).map((c) => (
          <button
            key={c}
            onClick={() => setSelected(c)}
            className={`px-2 py-1 rounded text-xs ${selected === c ? 'text-white' : 'bg-[var(--card-bg-alt)]'}`}
            style={selected === c ? { backgroundColor: candidates[c].color } : {}}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="text-center">
        <div className="text-lg font-mono" style={{ color: candidates[selected].color }}>
          {candidates[selected].latency}
        </div>
        <div className="text-xs text-[var(--muted)]">{candidates[selected].desc}</div>
      </div>
      <div className="h-2 bg-[var(--card-bg-alt)] rounded overflow-hidden">
        <div
          className="h-full transition-all"
          style={{
            width: selected === 'host' ? '10%' : selected === 'srflx' ? '40%' : '100%',
            backgroundColor: candidates[selected].color,
          }}
        />
      </div>
    </div>
  );
}

// Bitrate adaptation
export function BitrateAdaptationMini() {
  const [bandwidth, setBandwidth] = useState(5);
  const quality = bandwidth < 2 ? '360p' : bandwidth < 4 ? '720p' : '1080p';
  const bitrate = bandwidth < 2 ? 0.5 : bandwidth < 4 ? 2 : 4;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center gap-4">
        <div className="text-center">
          <div className="text-2xl font-mono">{quality}</div>
          <div className="text-xs text-[var(--muted)]">{bitrate} Mbps</div>
        </div>
        <div
          className={`w-16 h-12 rounded ${bandwidth < 2 ? 'bg-red-500/50' : bandwidth < 4 ? 'bg-yellow-500/50' : 'bg-green-500/50'}`}
          style={{ filter: `blur(${(5 - bandwidth) * 0.5}px)` }}
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs">BW</span>
        <input
          type="range"
          min="1"
          max="6"
          step="0.5"
          value={bandwidth}
          onChange={(e) => setBandwidth(parseFloat(e.target.value))}
          className="flex-1"
        />
        <span className="text-xs font-mono">{bandwidth}Mbps</span>
      </div>
    </div>
  );
}

// Simulcast layers
export function SimulcastMini() {
  const [activeLayer, setActiveLayer] = useState(2);
  const layers = [
    { res: '360p', fps: 15, bps: '300k' },
    { res: '720p', fps: 30, bps: '1.5M' },
    { res: '1080p', fps: 30, bps: '4M' },
  ];

  return (
    <div className="space-y-3">
      <div className="flex gap-2 justify-center items-end">
        {layers.map((l, i) => (
          <div
            key={i}
            className={`rounded cursor-pointer transition-all ${activeLayer === i ? 'ring-2 ring-green-500' : 'opacity-50'}`}
            style={{
              width: 20 + i * 15,
              height: 15 + i * 10,
              backgroundColor: activeLayer === i ? '#22c55e' : '#666',
            }}
            onClick={() => setActiveLayer(i)}
          />
        ))}
      </div>
      <div className="text-center">
        <div className="text-sm font-medium">{layers[activeLayer].res} @ {layers[activeLayer].fps}fps</div>
        <div className="text-xs text-[var(--muted)]">{layers[activeLayer].bps}</div>
      </div>
      <p className="text-xs text-center text-[var(--muted)]">
        SFU selects layer based on receiver bandwidth
      </p>
    </div>
  );
}

// FEC recovery
export function FECRecoveryMini() {
  const [lostPacket, setLostPacket] = useState<number | null>(null);
  const packets = ['D1', 'D2', 'D3', 'D4', 'FEC'];

  return (
    <div className="space-y-3">
      <div className="flex gap-1 justify-center">
        {packets.map((p, i) => (
          <div
            key={i}
            className={`w-10 h-10 rounded flex items-center justify-center text-xs font-mono cursor-pointer transition-all
              ${lostPacket === i ? 'bg-red-500/30 text-red-400 line-through' : p === 'FEC' ? 'bg-purple-500/30 text-purple-400' : 'bg-blue-500/30 text-blue-400'}`}
            onClick={() => setLostPacket(lostPacket === i ? null : i)}
          >
            {p}
          </div>
        ))}
      </div>
      <p className="text-xs text-center text-[var(--muted)]">
        {lostPacket !== null && lostPacket < 4
          ? `Lost ${packets[lostPacket]} → Recovered via FEC!`
          : lostPacket === 4
          ? 'Lost FEC → Data still intact'
          : 'Click a packet to simulate loss'}
      </p>
    </div>
  );
}

// RTT measurement
export function RTTMeasurementMini() {
  const [measuring, setMeasuring] = useState(false);
  const [rtt, setRtt] = useState(45);

  const measure = () => {
    setMeasuring(true);
    setTimeout(() => {
      setRtt(30 + Math.random() * 40);
      setMeasuring(false);
    }, 500);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center gap-4">
        <div className="w-8 h-8 rounded bg-blue-500 flex items-center justify-center text-xs">A</div>
        <div className="flex-1 h-0.5 bg-[var(--border)] relative">
          {measuring && (
            <div className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-green-500 rounded-full animate-ping" />
          )}
        </div>
        <div className="w-8 h-8 rounded bg-green-500 flex items-center justify-center text-xs">B</div>
      </div>
      <div className="text-center">
        <span className="text-2xl font-mono">{rtt.toFixed(0)}</span>
        <span className="text-sm text-[var(--muted)]">ms RTT</span>
      </div>
      <button
        onClick={measure}
        disabled={measuring}
        className="w-full text-xs py-1 rounded bg-[var(--card-bg-alt)] hover:bg-[var(--border)] disabled:opacity-50"
      >
        {measuring ? 'Measuring...' : 'Ping'}
      </button>
    </div>
  );
}

// Codec comparison
export function CodecComparisonMini() {
  const [codec, setCodec] = useState<'h264' | 'vp9' | 'av1'>('h264');
  const codecs = {
    h264: { efficiency: 1, speed: 1, support: '99%' },
    vp9: { efficiency: 1.4, speed: 0.7, support: '90%' },
    av1: { efficiency: 1.8, speed: 0.3, support: '60%' },
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-1 justify-center">
        {(Object.keys(codecs) as Array<keyof typeof codecs>).map((c) => (
          <button
            key={c}
            onClick={() => setCodec(c)}
            className={`px-2 py-1 rounded text-xs uppercase ${codec === c ? 'bg-blue-500 text-white' : 'bg-[var(--card-bg-alt)]'}`}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs">
          <span className="w-16 text-[var(--muted)]">Efficiency</span>
          <div className="flex-1 h-2 bg-[var(--card-bg-alt)] rounded">
            <div className="h-full bg-green-500 rounded" style={{ width: `${codecs[codec].efficiency / 2 * 100}%` }} />
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="w-16 text-[var(--muted)]">Speed</span>
          <div className="flex-1 h-2 bg-[var(--card-bg-alt)] rounded">
            <div className="h-full bg-blue-500 rounded" style={{ width: `${codecs[codec].speed * 100}%` }} />
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="w-16 text-[var(--muted)]">Support</span>
          <span className="font-mono">{codecs[codec].support}</span>
        </div>
      </div>
    </div>
  );
}

// WebSocket vs WebRTC
export function WSvsWebRTCMini() {
  const [protocol, setProtocol] = useState<'ws' | 'webrtc'>('webrtc');

  return (
    <div className="space-y-3">
      <div className="flex gap-2 justify-center">
        <button
          onClick={() => setProtocol('ws')}
          className={`px-3 py-1 rounded text-xs ${protocol === 'ws' ? 'bg-orange-500 text-white' : 'bg-[var(--card-bg-alt)]'}`}
        >
          WebSocket
        </button>
        <button
          onClick={() => setProtocol('webrtc')}
          className={`px-3 py-1 rounded text-xs ${protocol === 'webrtc' ? 'bg-green-500 text-white' : 'bg-[var(--card-bg-alt)]'}`}
        >
          WebRTC
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="text-right text-[var(--muted)]">Transport</div>
        <div>{protocol === 'ws' ? 'TCP' : 'UDP (SCTP)'}</div>
        <div className="text-right text-[var(--muted)]">Latency</div>
        <div>{protocol === 'ws' ? '~100ms' : '~30ms'}</div>
        <div className="text-right text-[var(--muted)]">Media</div>
        <div>{protocol === 'ws' ? 'Manual' : 'Native'}</div>
        <div className="text-right text-[var(--muted)]">P2P</div>
        <div>{protocol === 'ws' ? 'No' : 'Yes'}</div>
      </div>
    </div>
  );
}

// SFU topology
export function SFUTopologyMini() {
  const [topology, setTopology] = useState<'mesh' | 'sfu'>('sfu');

  return (
    <div className="space-y-3">
      <div className="flex gap-2 justify-center">
        <button
          onClick={() => setTopology('mesh')}
          className={`px-3 py-1 rounded text-xs ${topology === 'mesh' ? 'bg-red-500 text-white' : 'bg-[var(--card-bg-alt)]'}`}
        >
          Mesh
        </button>
        <button
          onClick={() => setTopology('sfu')}
          className={`px-3 py-1 rounded text-xs ${topology === 'sfu' ? 'bg-green-500 text-white' : 'bg-[var(--card-bg-alt)]'}`}
        >
          SFU
        </button>
      </div>
      <div className="relative h-20">
        {topology === 'mesh' ? (
          <svg className="w-full h-full">
            {/* 4 peers fully connected */}
            <circle cx="30" cy="20" r="8" fill="#666" />
            <circle cx="90" cy="20" r="8" fill="#666" />
            <circle cx="30" cy="60" r="8" fill="#666" />
            <circle cx="90" cy="60" r="8" fill="#666" />
            <line x1="30" y1="20" x2="90" y2="20" stroke="#ef4444" strokeWidth="1" />
            <line x1="30" y1="20" x2="30" y2="60" stroke="#ef4444" strokeWidth="1" />
            <line x1="30" y1="20" x2="90" y2="60" stroke="#ef4444" strokeWidth="1" />
            <line x1="90" y1="20" x2="30" y2="60" stroke="#ef4444" strokeWidth="1" />
            <line x1="90" y1="20" x2="90" y2="60" stroke="#ef4444" strokeWidth="1" />
            <line x1="30" y1="60" x2="90" y2="60" stroke="#ef4444" strokeWidth="1" />
          </svg>
        ) : (
          <svg className="w-full h-full">
            {/* SFU in center */}
            <rect x="50" y="30" width="20" height="20" rx="4" fill="#22c55e" />
            <circle cx="30" cy="20" r="8" fill="#666" />
            <circle cx="90" cy="20" r="8" fill="#666" />
            <circle cx="30" cy="60" r="8" fill="#666" />
            <circle cx="90" cy="60" r="8" fill="#666" />
            <line x1="30" y1="20" x2="50" y2="40" stroke="#22c55e" strokeWidth="1" />
            <line x1="90" y1="20" x2="70" y2="40" stroke="#22c55e" strokeWidth="1" />
            <line x1="30" y1="60" x2="50" y2="40" stroke="#22c55e" strokeWidth="1" />
            <line x1="90" y1="60" x2="70" y2="40" stroke="#22c55e" strokeWidth="1" />
          </svg>
        )}
      </div>
      <p className="text-xs text-center text-[var(--muted)]">
        {topology === 'mesh' ? '6 connections (n²)' : '4 connections (n)'}
      </p>
    </div>
  );
}
