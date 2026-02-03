'use client';

import { useState, useEffect, useRef } from 'react';
import { X, RefreshCw } from 'lucide-react';

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

// ============ MORE NEURAL NETWORK MECHANISMS ============

// Softmax
export function SoftmaxMini() {
  const [values, setValues] = useState([2, 1, 0.5]);
  const expValues = values.map(v => Math.exp(v));
  const sum = expValues.reduce((a, b) => a + b, 0);
  const probs = expValues.map(e => e / sum);

  return (
    <div className="space-y-3">
      <div className="flex gap-2 justify-center">
        {values.map((v, i) => (
          <div key={i} className="text-center">
            <input
              type="range"
              min="-2"
              max="4"
              step="0.5"
              value={v}
              onChange={(e) => {
                const newV = [...values];
                newV[i] = parseFloat(e.target.value);
                setValues(newV);
              }}
              className="w-12 -rotate-90 origin-center h-8"
            />
            <div className="text-xs font-mono mt-4">{(probs[i] * 100).toFixed(0)}%</div>
          </div>
        ))}
      </div>
      <p className="text-xs text-center text-[var(--muted)] font-mono">
        softmax(z)ᵢ = eᶻⁱ / Σeᶻʲ
      </p>
    </div>
  );
}

// Embedding space
export function EmbeddingSpaceMini() {
  const words = [
    { word: 'king', x: 30, y: 20 },
    { word: 'queen', x: 35, y: 25 },
    { word: 'man', x: 20, y: 60 },
    { word: 'woman', x: 25, y: 65 },
    { word: 'cat', x: 80, y: 50 },
    { word: 'dog', x: 75, y: 55 },
  ];

  return (
    <div className="space-y-3">
      <div className="relative h-24 bg-[var(--card-bg-alt)] rounded">
        {words.map((w, i) => (
          <div
            key={i}
            className="absolute text-xs px-1 rounded bg-purple-500/30"
            style={{ left: `${w.x}%`, top: `${w.y}%`, transform: 'translate(-50%, -50%)' }}
          >
            {w.word}
          </div>
        ))}
      </div>
      <p className="text-xs text-center text-[var(--muted)]">
        Similar concepts cluster together in vector space
      </p>
    </div>
  );
}

// Positional encoding
export function PositionalEncodingMini() {
  const positions = 8;
  const dims = 4;

  return (
    <div className="space-y-3">
      <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${dims}, 1fr)` }}>
        {Array(positions).fill(0).map((_, pos) =>
          Array(dims).fill(0).map((_, dim) => {
            const freq = 1 / Math.pow(10000, (2 * Math.floor(dim/2)) / dims);
            const val = dim % 2 === 0 ? Math.sin(pos * freq) : Math.cos(pos * freq);
            return (
              <div
                key={`${pos}-${dim}`}
                className="aspect-square rounded-sm"
                style={{
                  backgroundColor: `rgba(139, 92, 246, ${(val + 1) / 2})`,
                }}
              />
            );
          })
        )}
      </div>
      <p className="text-xs text-center text-[var(--muted)]">
        Sinusoidal patterns encode position info
      </p>
    </div>
  );
}

// Residual connection
export function ResidualConnectionMini() {
  const [useResidual, setUseResidual] = useState(true);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center gap-2">
        <div className="w-8 h-8 rounded bg-blue-500 flex items-center justify-center text-xs">x</div>
        <span>→</span>
        <div className="flex flex-col items-center gap-1">
          <div className="w-12 h-6 rounded bg-purple-500/50 text-xs flex items-center justify-center">F(x)</div>
          {useResidual && (
            <div className="w-8 h-0.5 bg-yellow-500" />
          )}
        </div>
        <span>→</span>
        <div className="w-8 h-8 rounded bg-green-500 flex items-center justify-center text-xs">
          {useResidual ? '+' : 'y'}
        </div>
      </div>
      <button
        onClick={() => setUseResidual(!useResidual)}
        className={`w-full text-xs py-1 rounded ${useResidual ? 'bg-yellow-500 text-black' : 'bg-[var(--card-bg-alt)]'}`}
      >
        {useResidual ? 'y = F(x) + x (skip)' : 'y = F(x) (no skip)'}
      </button>
    </div>
  );
}

// Layer normalization
export function LayerNormMini() {
  const [normalized, setNormalized] = useState(false);
  const values = [3, 7, 2, 8, 1, 9, 4, 6];
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
  const normValues = values.map(v => (v - mean) / Math.sqrt(variance + 1e-5));

  return (
    <div className="space-y-3">
      <div className="flex gap-0.5 justify-center h-16 items-end">
        {(normalized ? normValues : values).map((v, i) => (
          <div
            key={i}
            className={`w-4 rounded-t transition-all ${v >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
            style={{ height: `${Math.abs(v) * (normalized ? 20 : 8)}%` }}
          />
        ))}
      </div>
      <button
        onClick={() => setNormalized(!normalized)}
        className={`w-full text-xs py-1 rounded ${normalized ? 'bg-green-500 text-white' : 'bg-[var(--card-bg-alt)]'}`}
      >
        {normalized ? 'Layer Normalized' : 'Original values'}
      </button>
    </div>
  );
}

// Multi-head attention
export function MultiHeadAttentionMini() {
  const [heads, setHeads] = useState(4);

  return (
    <div className="space-y-3">
      <div className="flex gap-1 justify-center">
        {Array(heads).fill(0).map((_, i) => (
          <div
            key={i}
            className="w-8 h-8 rounded flex items-center justify-center text-xs"
            style={{ backgroundColor: `hsl(${i * (360 / heads)}, 70%, 50%)` }}
          >
            H{i+1}
          </div>
        ))}
      </div>
      <input
        type="range"
        min="1"
        max="8"
        value={heads}
        onChange={(e) => setHeads(parseInt(e.target.value))}
        className="w-full"
      />
      <p className="text-xs text-center text-[var(--muted)]">
        {heads} heads × {Math.floor(64/heads)}d = 64d total
      </p>
    </div>
  );
}

// Gradient clipping
export function GradientClippingMini() {
  const [clipValue, setClipValue] = useState(1);
  const gradients = [0.3, 2.5, -1.8, 0.7, -3.2, 1.1];
  const clipped = gradients.map(g => Math.max(-clipValue, Math.min(clipValue, g)));

  return (
    <div className="space-y-3">
      <div className="flex gap-1 justify-center h-16">
        {gradients.map((g, i) => (
          <div key={i} className="flex flex-col items-center justify-center">
            <div
              className={`w-4 transition-all ${g >= 0 ? 'bg-blue-500/30' : 'bg-blue-500/30'}`}
              style={{ height: `${Math.abs(g) * 15}px`, marginTop: g < 0 ? 0 : 'auto' }}
            />
            <div
              className={`w-4 transition-all ${clipped[i] >= 0 ? 'bg-green-500' : 'bg-green-500'}`}
              style={{ height: `${Math.abs(clipped[i]) * 15}px` }}
            />
          </div>
        ))}
      </div>
      <input
        type="range"
        min="0.5"
        max="3"
        step="0.5"
        value={clipValue}
        onChange={(e) => setClipValue(parseFloat(e.target.value))}
        className="w-full"
      />
      <p className="text-xs text-center text-[var(--muted)]">
        Clip threshold: ±{clipValue}
      </p>
    </div>
  );
}

// ============ MORE 3D GRAPHICS MECHANISMS ============

// Normal mapping
export function NormalMappingMini() {
  const [useNormals, setUseNormals] = useState(true);

  return (
    <div className="space-y-3">
      <div className="flex gap-4 justify-center">
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-lg"
            style={{
              background: useNormals
                ? 'repeating-linear-gradient(45deg, #666 0px, #888 2px, #666 4px)'
                : '#777',
              boxShadow: useNormals
                ? 'inset 2px 2px 4px rgba(255,255,255,0.3), inset -2px -2px 4px rgba(0,0,0,0.3)'
                : 'none',
            }}
          />
          <span className="text-xs text-[var(--muted)]">Surface</span>
        </div>
      </div>
      <button
        onClick={() => setUseNormals(!useNormals)}
        className={`w-full text-xs py-1 rounded ${useNormals ? 'bg-blue-500 text-white' : 'bg-[var(--card-bg-alt)]'}`}
      >
        {useNormals ? 'Normal map ON' : 'Normal map OFF'}
      </button>
    </div>
  );
}

// PBR materials
export function PBRMaterialMini() {
  const [roughness, setRoughness] = useState(0.5);
  const [metallic, setMetallic] = useState(0);

  return (
    <div className="space-y-3">
      <div className="flex justify-center">
        <div
          className="w-16 h-16 rounded-full"
          style={{
            background: `radial-gradient(circle at 30% 30%,
              ${metallic > 0.5 ? '#ccc' : '#888'} 0%,
              ${metallic > 0.5 ? '#666' : '#444'} 100%)`,
            filter: `blur(${roughness * 2}px)`,
            boxShadow: roughness < 0.3 ? '0 0 10px rgba(255,255,255,0.5)' : 'none',
          }}
        />
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-[var(--muted)]">Rough</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={roughness}
            onChange={(e) => setRoughness(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <span className="text-[var(--muted)]">Metal</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={metallic}
            onChange={(e) => setMetallic(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}

// Frustum culling
export function FrustumCullingMini() {
  const [fov, setFov] = useState(60);
  const objects = [
    { x: 50, y: 30, visible: true },
    { x: 20, y: 50, visible: true },
    { x: 80, y: 40, visible: true },
    { x: 10, y: 20, visible: false },
    { x: 90, y: 70, visible: false },
  ];

  const inFrustum = (obj: typeof objects[0]) => {
    const halfFov = fov / 2;
    const angle = Math.abs(obj.x - 50);
    return angle < halfFov && obj.y > 20 && obj.y < 80;
  };

  return (
    <div className="space-y-3">
      <div className="relative h-20 bg-[var(--card-bg-alt)] rounded overflow-hidden">
        {/* Frustum */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 border-l-2 border-r-2 border-t-2 border-green-500/50"
          style={{
            width: `${fov}%`,
            height: '100%',
            borderTopLeftRadius: '50%',
            borderTopRightRadius: '50%',
          }}
        />
        {/* Objects */}
        {objects.map((obj, i) => (
          <div
            key={i}
            className={`absolute w-3 h-3 rounded-full transition-all ${inFrustum(obj) ? 'bg-green-500' : 'bg-red-500 opacity-50'}`}
            style={{ left: `${obj.x}%`, top: `${obj.y}%`, transform: 'translate(-50%, -50%)' }}
          />
        ))}
      </div>
      <input
        type="range"
        min="30"
        max="90"
        value={fov}
        onChange={(e) => setFov(parseInt(e.target.value))}
        className="w-full"
      />
      <p className="text-xs text-center text-[var(--muted)]">
        {objects.filter(inFrustum).length} of {objects.length} visible
      </p>
    </div>
  );
}

// Z-buffer
export function ZBufferMini() {
  const [showBuffer, setShowBuffer] = useState(false);

  return (
    <div className="space-y-3">
      <div className="relative h-20 bg-[var(--card-bg-alt)] rounded overflow-hidden">
        {showBuffer ? (
          <div className="absolute inset-0 grid grid-cols-8 grid-rows-4 gap-0.5 p-1">
            {Array(32).fill(0).map((_, i) => (
              <div
                key={i}
                className="rounded-sm"
                style={{ backgroundColor: `rgba(255,255,255,${0.2 + Math.random() * 0.6})` }}
              />
            ))}
          </div>
        ) : (
          <>
            <div className="absolute w-12 h-12 bg-blue-500 rounded" style={{ left: '20%', top: '20%' }} />
            <div className="absolute w-10 h-10 bg-green-500 rounded" style={{ left: '35%', top: '30%' }} />
            <div className="absolute w-8 h-8 bg-red-500 rounded" style={{ left: '50%', top: '40%' }} />
          </>
        )}
      </div>
      <button
        onClick={() => setShowBuffer(!showBuffer)}
        className={`w-full text-xs py-1 rounded ${showBuffer ? 'bg-gray-500 text-white' : 'bg-[var(--card-bg-alt)]'}`}
      >
        {showBuffer ? 'View: Depth Buffer' : 'View: Color Output'}
      </button>
    </div>
  );
}

// Mipmap levels
export function MipmapMini() {
  const [level, setLevel] = useState(0);
  const sizes = [64, 32, 16, 8, 4];

  return (
    <div className="space-y-3">
      <div className="flex gap-2 justify-center items-end h-20">
        {sizes.map((s, i) => (
          <div
            key={i}
            className={`rounded transition-all cursor-pointer ${level === i ? 'ring-2 ring-yellow-500' : 'opacity-50'}`}
            style={{
              width: s,
              height: s,
              backgroundColor: '#8b5cf6',
              filter: `blur(${i * 0.5}px)`,
            }}
            onClick={() => setLevel(i)}
          />
        ))}
      </div>
      <p className="text-xs text-center text-[var(--muted)]">
        Level {level}: {sizes[level]}×{sizes[level]}px
      </p>
    </div>
  );
}

// ============ MORE AUDIO/VIDEO MECHANISMS ============

// Mel spectrogram
export function MelSpectrogramMini() {
  const [playing, setPlaying] = useState(false);
  const bins = 8;
  const frames = 12;

  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => {}, 100);
    return () => clearInterval(interval);
  }, [playing]);

  return (
    <div className="space-y-3">
      <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${frames}, 1fr)` }}>
        {Array(bins * frames).fill(0).map((_, i) => {
          const intensity = Math.random() * 0.8 + 0.2;
          return (
            <div
              key={i}
              className="aspect-square rounded-sm transition-all"
              style={{ backgroundColor: `rgba(139, 92, 246, ${intensity})` }}
            />
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-[var(--muted)]">
        <span>Low freq</span>
        <span>Time →</span>
        <span>High freq</span>
      </div>
    </div>
  );
}

// Phoneme to viseme
export function PhonemeVisemeMini() {
  const [phoneme, setPhoneme] = useState<'a' | 'e' | 'o' | 'm'>('a');
  const visemes = {
    a: { jaw: 0.8, lips: 0.3 },
    e: { jaw: 0.4, lips: 0.6 },
    o: { jaw: 0.6, lips: 0.8 },
    m: { jaw: 0.1, lips: 0.9 },
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-1 justify-center">
        {(Object.keys(visemes) as Array<keyof typeof visemes>).map((p) => (
          <button
            key={p}
            onClick={() => setPhoneme(p)}
            className={`w-8 h-8 rounded font-mono ${phoneme === p ? 'bg-purple-500 text-white' : 'bg-[var(--card-bg-alt)]'}`}
          >
            {p}
          </button>
        ))}
      </div>
      <svg width="60" height="40" viewBox="0 0 60 40" className="mx-auto">
        <ellipse
          cx="30"
          cy="20"
          rx={8 + visemes[phoneme].lips * 8}
          ry={4 + visemes[phoneme].jaw * 12}
          fill="none"
          stroke="#666"
          strokeWidth="2"
        />
      </svg>
      <p className="text-xs text-center text-[var(--muted)]">
        /{phoneme}/ → jaw: {(visemes[phoneme].jaw * 100).toFixed(0)}%, lips: {(visemes[phoneme].lips * 100).toFixed(0)}%
      </p>
    </div>
  );
}

// Audio envelope
export function AudioEnvelopeMini() {
  const [phase, setPhase] = useState<'A' | 'D' | 'S' | 'R'>('A');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Draw ADSR curve
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(w * 0.15, h * 0.1); // Attack
    ctx.lineTo(w * 0.3, h * 0.3);  // Decay
    ctx.lineTo(w * 0.7, h * 0.3);  // Sustain
    ctx.lineTo(w, h);              // Release
    ctx.stroke();

    // Highlight current phase
    const phases = { A: 0, D: 0.15, S: 0.3, R: 0.7 };
    const phaseWidths = { A: 0.15, D: 0.15, S: 0.4, R: 0.3 };
    ctx.fillStyle = 'rgba(139, 92, 246, 0.3)';
    ctx.fillRect(phases[phase] * w, 0, phaseWidths[phase] * w, h);
  }, [phase]);

  return (
    <div className="space-y-3">
      <canvas ref={canvasRef} width={120} height={50} className="w-full rounded bg-[var(--card-bg-alt)]" />
      <div className="flex gap-1 justify-center">
        {(['A', 'D', 'S', 'R'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPhase(p)}
            className={`px-2 py-1 rounded text-xs ${phase === p ? 'bg-purple-500 text-white' : 'bg-[var(--card-bg-alt)]'}`}
          >
            {p === 'A' ? 'Attack' : p === 'D' ? 'Decay' : p === 'S' ? 'Sustain' : 'Release'}
          </button>
        ))}
      </div>
    </div>
  );
}

// Frame interpolation
export function FrameInterpolationMini() {
  const [interpolated, setInterpolated] = useState(true);
  const frames = interpolated ? [1, 1.5, 2, 2.5, 3] : [1, 2, 3];

  return (
    <div className="space-y-3">
      <div className="flex gap-1 justify-center">
        {frames.map((f, i) => (
          <div
            key={i}
            className={`w-10 h-10 rounded flex items-center justify-center text-xs font-mono
              ${Number.isInteger(f) ? 'bg-blue-500' : 'bg-purple-500/50 border border-dashed border-purple-500'}`}
          >
            {f}
          </div>
        ))}
      </div>
      <button
        onClick={() => setInterpolated(!interpolated)}
        className={`w-full text-xs py-1 rounded ${interpolated ? 'bg-purple-500 text-white' : 'bg-[var(--card-bg-alt)]'}`}
      >
        {interpolated ? '60fps (interpolated)' : '30fps (original)'}
      </button>
    </div>
  );
}

// Motion vectors
export function MotionVectorsMini() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Draw grid of motion vectors
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 1;
    for (let x = 10; x < w; x += 20) {
      for (let y = 10; y < h; y += 20) {
        const dx = (Math.random() - 0.5) * 15;
        const dy = (Math.random() - 0.5) * 15;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + dx, y + dy);
        ctx.stroke();
        // Arrow head
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(x + dx, y + dy, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, []);

  return (
    <div className="space-y-3">
      <canvas ref={canvasRef} width={120} height={80} className="w-full rounded bg-[var(--card-bg-alt)]" />
      <p className="text-xs text-center text-[var(--muted)]">
        Per-block motion vectors for prediction
      </p>
    </div>
  );
}

// Keyframe vs P-frame
export function KeyframeMini() {
  const [frameType, setFrameType] = useState<'I' | 'P' | 'B'>('I');
  const frames = ['I', 'P', 'P', 'B', 'P', 'P', 'I'];

  return (
    <div className="space-y-3">
      <div className="flex gap-0.5 justify-center">
        {frames.map((f, i) => (
          <div
            key={i}
            className={`w-8 h-10 rounded flex items-center justify-center text-xs font-bold cursor-pointer
              ${f === 'I' ? 'bg-green-500' : f === 'P' ? 'bg-blue-500' : 'bg-purple-500'}
              ${frameType === f ? 'ring-2 ring-white' : ''}`}
            onClick={() => setFrameType(f as 'I' | 'P' | 'B')}
          >
            {f}
          </div>
        ))}
      </div>
      <p className="text-xs text-center text-[var(--muted)]">
        {frameType === 'I' ? 'Keyframe: full image' : frameType === 'P' ? 'P-frame: predicted from previous' : 'B-frame: bidirectional'}
      </p>
    </div>
  );
}

// ============ MORE TRAINING MECHANISMS ============

// Overfitting visualization
export function OverfittingMini() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [epoch, setEpoch] = useState(50);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Training loss
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x < epoch * 2 && x < w; x++) {
      const y = h - 10 - Math.exp(-x / 30) * 50;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Validation loss
    ctx.strokeStyle = '#ef4444';
    ctx.beginPath();
    for (let x = 0; x < epoch * 2 && x < w; x++) {
      const decay = Math.exp(-x / 30) * 50;
      const overfit = x > 50 ? (x - 50) * 0.3 : 0;
      const y = h - 10 - decay + overfit;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }, [epoch]);

  return (
    <div className="space-y-3">
      <canvas ref={canvasRef} width={120} height={60} className="w-full rounded bg-[var(--card-bg-alt)]" />
      <div className="flex justify-between text-xs">
        <span className="text-green-500">Train</span>
        <span className="text-red-500">Val</span>
      </div>
      <input type="range" min="20" max="100" value={epoch} onChange={(e) => setEpoch(parseInt(e.target.value))} className="w-full" />
    </div>
  );
}


// Dot product
export function DotProductMini() {
  const [angle, setAngle] = useState(0);
  const dot = Math.cos(angle * Math.PI / 180);

  return (
    <div className="space-y-3">
      <svg width="100" height="100" viewBox="-1.5 -1.5 3 3" className="w-full max-w-[100px] mx-auto bg-[var(--card-bg-alt)] rounded">
        <circle cx="0" cy="0" r="1" fill="none" stroke="#666" strokeWidth="0.02" />
        <line x1="0" y1="0" x2="1" y2="0" stroke="#22c55e" strokeWidth="0.08" />
        <line x1="0" y1="0" x2={Math.cos(angle * Math.PI / 180)} y2={-Math.sin(angle * Math.PI / 180)} stroke="#3b82f6" strokeWidth="0.08" />
      </svg>
      <input type="range" min="0" max="180" value={angle} onChange={(e) => setAngle(parseInt(e.target.value))} className="w-full" />
      <p className="text-xs text-center font-mono" style={{ color: dot > 0 ? '#22c55e' : dot < 0 ? '#ef4444' : '#666' }}>a·b = {dot.toFixed(2)}</p>
    </div>
  );
}

// Quaternion rotation
export function QuaternionMini() {
  const [axis, setAxis] = useState<'x' | 'y' | 'z'>('y');
  const [angle, setAngle] = useState(45);

  return (
    <div className="space-y-3">
      <div className="flex gap-1 justify-center">
        {(['x', 'y', 'z'] as const).map((a) => (
          <button key={a} onClick={() => setAxis(a)} className={`w-8 h-8 rounded text-xs font-bold ${axis === a ? (a === 'x' ? 'bg-red-500' : a === 'y' ? 'bg-green-500' : 'bg-blue-500') + ' text-white' : 'bg-[var(--card-bg-alt)]'}`}>{a.toUpperCase()}</button>
        ))}
      </div>
      <div className="flex justify-center">
        <div className="w-12 h-12 rounded bg-purple-500/50 border-2 border-purple-500" style={{ transform: `rotate${axis.toUpperCase()}(${angle}deg)` }} />
      </div>
      <input type="range" min="0" max="360" value={angle} onChange={(e) => setAngle(parseInt(e.target.value))} className="w-full" />
    </div>
  );
}

// Interpolation types
export function InterpolationMini() {
  const [type, setType] = useState<'linear' | 'ease' | 'step'>('linear');
  const [t, setT] = useState(0.5);
  const val = type === 'linear' ? t : type === 'ease' ? t * t * (3 - 2 * t) : t < 0.5 ? 0 : 1;

  return (
    <div className="space-y-3">
      <div className="flex gap-1 justify-center">
        {(['linear', 'ease', 'step'] as const).map((i) => (
          <button key={i} onClick={() => setType(i)} className={`px-2 py-1 rounded text-xs ${type === i ? 'bg-purple-500 text-white' : 'bg-[var(--card-bg-alt)]'}`}>{i}</button>
        ))}
      </div>
      <div className="relative h-8 bg-[var(--card-bg-alt)] rounded">
        <div className="absolute top-0 bottom-0 bg-purple-500 rounded-l" style={{ width: `${val * 100}%` }} />
      </div>
      <input type="range" min="0" max="1" step="0.05" value={t} onChange={(e) => setT(parseFloat(e.target.value))} className="w-full" />
    </div>
  );
}

// ============ GAUSSIAN SPLATTING ADVANCED ============

// Covariance matrix visualization
export function CovarianceMatrixMini() {
  const [scaleX, setScaleX] = useState(1);
  const [scaleY, setScaleY] = useState(0.5);
  const [rotation, setRotation] = useState(30);

  return (
    <div className="space-y-3">
      <svg width="100" height="100" viewBox="-2 -2 4 4" className="w-full max-w-[100px] mx-auto bg-[var(--card-bg-alt)] rounded">
        <ellipse
          cx="0" cy="0"
          rx={scaleX} ry={scaleY}
          fill="rgba(139, 92, 246, 0.5)"
          stroke="#8b5cf6"
          strokeWidth="0.05"
          transform={`rotate(${rotation})`}
        />
        <line x1="-2" y1="0" x2="2" y2="0" stroke="#666" strokeWidth="0.02" />
        <line x1="0" y1="-2" x2="0" y2="2" stroke="#666" strokeWidth="0.02" />
      </svg>
      <div className="grid grid-cols-2 gap-1 text-xs">
        <div>σx<input type="range" min="0.2" max="1.5" step="0.1" value={scaleX} onChange={(e) => setScaleX(parseFloat(e.target.value))} className="w-full" /></div>
        <div>σy<input type="range" min="0.2" max="1.5" step="0.1" value={scaleY} onChange={(e) => setScaleY(parseFloat(e.target.value))} className="w-full" /></div>
      </div>
    </div>
  );
}

// Point cloud to splat
export function PointCloudToSplatMini() {
  const [splatted, setSplatted] = useState(false);
  const points = [[20, 30], [50, 20], [80, 40], [30, 70], [60, 60], [75, 75]];

  return (
    <div className="space-y-3">
      <div className="relative h-24 bg-[var(--card-bg-alt)] rounded">
        {points.map((p, i) => (
          <div
            key={i}
            className="absolute transition-all duration-500"
            style={{
              left: `${p[0]}%`,
              top: `${p[1]}%`,
              transform: 'translate(-50%, -50%)',
              width: splatted ? '24px' : '4px',
              height: splatted ? '24px' : '4px',
              borderRadius: '50%',
              background: splatted ? 'radial-gradient(circle, rgba(139,92,246,0.8) 0%, transparent 70%)' : '#8b5cf6',
            }}
          />
        ))}
      </div>
      <button
        onClick={() => setSplatted(!splatted)}
        className={`w-full text-xs py-1 rounded ${splatted ? 'bg-purple-500 text-white' : 'bg-[var(--card-bg-alt)]'}`}
      >
        {splatted ? 'Splatted' : 'Point Cloud'}
      </button>
    </div>
  );
}

// View-dependent color (SH)
export function ViewDependentColorMini() {
  const [angle, setAngle] = useState(0);
  const hue = (angle / 360) * 60 + 200;

  return (
    <div className="space-y-3">
      <div className="flex justify-center">
        <div
          className="w-16 h-16 rounded-full"
          style={{
            background: `radial-gradient(circle at ${50 + Math.cos(angle * Math.PI / 180) * 20}% ${50 - Math.sin(angle * Math.PI / 180) * 20}%, hsl(${hue}, 70%, 60%) 0%, hsl(${hue + 40}, 50%, 40%) 100%)`,
          }}
        />
      </div>
      <input type="range" min="0" max="360" value={angle} onChange={(e) => setAngle(parseInt(e.target.value))} className="w-full" />
      <p className="text-xs text-center text-[var(--muted)]">View angle: {angle}°</p>
    </div>
  );
}

// ============ NEURAL NETWORK ADVANCED ============

// Backpropagation flow
export function BackpropagationMini() {
  const [step, setStep] = useState(0);
  const layers = [3, 4, 2];

  return (
    <div className="space-y-3">
      <svg width="120" height="80" viewBox="0 0 120 80" className="w-full">
        {layers.map((count, li) =>
          Array(count).fill(0).map((_, ni) => {
            const x = 20 + li * 40;
            const y = 40 - (count * 10) / 2 + ni * 15 + 7;
            const isActive = step === 0 ? li === 0 : step === 1 ? true : li === layers.length - 1;
            return (
              <g key={`${li}-${ni}`}>
                <circle cx={x} cy={y} r="6" fill={isActive ? '#8b5cf6' : '#444'} />
                {li < layers.length - 1 && Array(layers[li + 1]).fill(0).map((_, nj) => {
                  const x2 = 20 + (li + 1) * 40;
                  const y2 = 40 - (layers[li + 1] * 10) / 2 + nj * 15 + 7;
                  return <line key={nj} x1={x} y1={y} x2={x2} y2={y2} stroke={step === 2 ? '#ef4444' : '#666'} strokeWidth="1" />;
                })}
              </g>
            );
          })
        )}
      </svg>
      <div className="flex gap-1 justify-center">
        {['Forward', 'Loss', 'Backward'].map((s, i) => (
          <button key={i} onClick={() => setStep(i)} className={`px-2 py-1 rounded text-xs ${step === i ? (i === 2 ? 'bg-red-500' : 'bg-purple-500') + ' text-white' : 'bg-[var(--card-bg-alt)]'}`}>{s}</button>
        ))}
      </div>
    </div>
  );
}

// Attention mechanism
export function AttentionMechanismMini() {
  const [query, setQuery] = useState(0);
  const keys = [0.8, 0.3, 0.9, 0.2];
  const values = ['A', 'B', 'C', 'D'];
  const scores = keys.map((k, i) => Math.exp(k * (query === i ? 2 : 1)));
  const sum = scores.reduce((a, b) => a + b, 0);
  const weights = scores.map(s => s / sum);

  return (
    <div className="space-y-3">
      <div className="flex gap-1 justify-center">
        {values.map((v, i) => (
          <div
            key={i}
            onClick={() => setQuery(i)}
            className={`w-10 h-10 rounded flex items-center justify-center text-xs font-bold cursor-pointer transition-all`}
            style={{ backgroundColor: `rgba(139, 92, 246, ${weights[i]})`, border: query === i ? '2px solid yellow' : 'none' }}
          >
            {v}
          </div>
        ))}
      </div>
      <p className="text-xs text-center text-[var(--muted)]">Query attends to keys</p>
    </div>
  );
}

// Weight initialization
export function WeightInitMini() {
  const [method, setMethod] = useState<'zeros' | 'random' | 'xavier'>('xavier');
  const getVal = () => method === 'zeros' ? 0 : method === 'random' ? Math.random() - 0.5 : (Math.random() - 0.5) * 0.5;
  const weights = Array(16).fill(0).map(() => getVal());

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-0.5">
        {weights.map((w, i) => (
          <div
            key={i}
            className="aspect-square rounded-sm"
            style={{ backgroundColor: `rgba(${w > 0 ? '34, 197, 94' : '239, 68, 68'}, ${Math.abs(w) * 2})` }}
          />
        ))}
      </div>
      <div className="flex gap-1 justify-center">
        {(['zeros', 'random', 'xavier'] as const).map((m) => (
          <button key={m} onClick={() => setMethod(m)} className={`px-2 py-1 rounded text-xs ${method === m ? 'bg-purple-500 text-white' : 'bg-[var(--card-bg-alt)]'}`}>{m}</button>
        ))}
      </div>
    </div>
  );
}

// Vanishing gradient
export function VanishingGradientMini() {
  const [depth, setDepth] = useState(5);

  return (
    <div className="space-y-3">
      <div className="flex gap-0.5 justify-center items-end h-16">
        {Array(depth).fill(0).map((_, i) => (
          <div
            key={i}
            className="w-6 rounded-t bg-red-500"
            style={{ height: `${100 * Math.pow(0.7, i)}%`, opacity: Math.pow(0.8, i) }}
          />
        ))}
      </div>
      <input type="range" min="3" max="10" value={depth} onChange={(e) => setDepth(parseInt(e.target.value))} className="w-full" />
      <p className="text-xs text-center text-[var(--muted)]">{depth} layers → gradient shrinks</p>
    </div>
  );
}

// Adam optimizer
export function AdamOptimizerMini() {
  const [momentum, setMomentum] = useState(true);

  return (
    <div className="space-y-3">
      <svg width="100" height="60" viewBox="0 0 100 60" className="w-full">
        <path d="M10,50 Q30,20 50,35 Q70,50 90,15" fill="none" stroke="#666" strokeWidth="2" />
        <circle cx={momentum ? 90 : 50} cy={momentum ? 15 : 35} r="4" fill="#22c55e" />
        {momentum && (
          <path d="M10,50 C20,30 60,25 90,15" fill="none" stroke="#22c55e" strokeWidth="1" strokeDasharray="3" />
        )}
      </svg>
      <button
        onClick={() => setMomentum(!momentum)}
        className={`w-full text-xs py-1 rounded ${momentum ? 'bg-green-500 text-white' : 'bg-[var(--card-bg-alt)]'}`}
      >
        {momentum ? 'Adam (momentum)' : 'SGD (no momentum)'}
      </button>
    </div>
  );
}

// ============ METAHUMAN ADVANCED ============

// Bone transform hierarchy
export function BoneTransformMini() {
  const [parentRotation, setParentRotation] = useState(0);
  const childOffset = 30;

  return (
    <div className="space-y-3">
      <svg width="100" height="80" viewBox="0 0 100 80" className="w-full mx-auto">
        <g transform={`translate(50, 20) rotate(${parentRotation})`}>
          <rect x="-4" y="0" width="8" height="30" fill="#8b5cf6" rx="2" />
          <g transform={`translate(0, ${childOffset}) rotate(${parentRotation / 2})`}>
            <rect x="-3" y="0" width="6" height="25" fill="#a78bfa" rx="2" />
            <circle cx="0" cy="25" r="3" fill="#c4b5fd" />
          </g>
          <circle cx="0" cy="0" r="4" fill="#7c3aed" />
        </g>
      </svg>
      <input type="range" min="-45" max="45" value={parentRotation} onChange={(e) => setParentRotation(parseInt(e.target.value))} className="w-full" />
      <p className="text-xs text-center text-[var(--muted)]">Parent rotation: {parentRotation}°</p>
    </div>
  );
}

// Morph target blend
export function MorphTargetMini() {
  const [blendA, setBlendA] = useState(0.5);
  const [blendB, setBlendB] = useState(0.3);

  return (
    <div className="space-y-3">
      <svg width="80" height="60" viewBox="0 0 80 60" className="w-full max-w-[80px] mx-auto">
        <ellipse
          cx="40"
          cy="30"
          rx={20 + blendA * 10}
          ry={20 - blendB * 5}
          fill="#8b5cf6"
        />
        <ellipse cx={30 - blendA * 5} cy={25} rx="4" ry={3 + blendB * 2} fill="white" />
        <ellipse cx={50 + blendA * 5} cy={25} rx="4" ry={3 + blendB * 2} fill="white" />
        <path
          d={`M ${35 - blendA * 3} ${38 + blendB * 5} Q 40 ${42 + blendB * 8} ${45 + blendA * 3} ${38 + blendB * 5}`}
          fill="none"
          stroke="white"
          strokeWidth="2"
        />
      </svg>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>A: {(blendA * 100).toFixed(0)}%<input type="range" min="0" max="1" step="0.1" value={blendA} onChange={(e) => setBlendA(parseFloat(e.target.value))} className="w-full" /></div>
        <div>B: {(blendB * 100).toFixed(0)}%<input type="range" min="0" max="1" step="0.1" value={blendB} onChange={(e) => setBlendB(parseFloat(e.target.value))} className="w-full" /></div>
      </div>
    </div>
  );
}

// Joint limits
export function JointLimitsMini() {
  const [angle, setAngle] = useState(45);
  const minAngle = -30;
  const maxAngle = 120;
  const clampedAngle = Math.max(minAngle, Math.min(maxAngle, angle));
  const isLimited = angle !== clampedAngle;

  return (
    <div className="space-y-3">
      <svg width="100" height="60" viewBox="0 0 100 60" className="w-full">
        <path d={`M 50 50 L 50 20`} stroke="#666" strokeWidth="4" />
        <path
          d={`M 50 50 L ${50 + Math.sin(clampedAngle * Math.PI / 180) * 30} ${50 - Math.cos(clampedAngle * Math.PI / 180) * 30}`}
          stroke={isLimited ? '#ef4444' : '#22c55e'}
          strokeWidth="4"
        />
        <circle cx="50" cy="50" r="5" fill="#8b5cf6" />
      </svg>
      <input type="range" min="-60" max="150" value={angle} onChange={(e) => setAngle(parseInt(e.target.value))} className="w-full" />
      <p className="text-xs text-center" style={{ color: isLimited ? '#ef4444' : 'var(--muted)' }}>
        {isLimited ? 'Limited!' : `${clampedAngle}°`} (range: {minAngle}° to {maxAngle}°)
      </p>
    </div>
  );
}

// ============ STREAMING ADVANCED ============

// Buffer management
export function BufferManagementMini() {
  const [bufferSize, setBufferSize] = useState(5);
  const [playhead, setPlayhead] = useState(2);

  return (
    <div className="space-y-3">
      <div className="flex gap-0.5 justify-center">
        {Array(10).fill(0).map((_, i) => (
          <div
            key={i}
            className={`w-6 h-8 rounded text-xs flex items-center justify-center
              ${i < playhead ? 'bg-gray-600' : i < playhead + bufferSize ? 'bg-green-500' : 'bg-[var(--card-bg-alt)]'}`}
          >
            {i === playhead && '▶'}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>Buffer: {bufferSize}<input type="range" min="1" max="8" value={bufferSize} onChange={(e) => setBufferSize(parseInt(e.target.value))} className="w-full" /></div>
        <div>Play: {playhead}<input type="range" min="0" max="5" value={playhead} onChange={(e) => setPlayhead(parseInt(e.target.value))} className="w-full" /></div>
      </div>
    </div>
  );
}

// Network jitter visualization
export function NetworkJitterMini() {
  const [jitter, setJitter] = useState(20);
  const baseTime = 50;

  return (
    <div className="space-y-3">
      <div className="flex gap-1 justify-center items-end h-16">
        {Array(8).fill(0).map((_, i) => {
          const variance = (Math.sin(i * 1.5) * jitter);
          return (
            <div
              key={i}
              className="w-6 rounded-t bg-blue-500"
              style={{ height: `${baseTime + variance}%` }}
            />
          );
        })}
      </div>
      <input type="range" min="0" max="40" value={jitter} onChange={(e) => setJitter(parseInt(e.target.value))} className="w-full" />
      <p className="text-xs text-center text-[var(--muted)]">Jitter: ±{jitter}ms</p>
    </div>
  );
}

// Packet loss recovery
export function PacketLossRecoveryMini() {
  const [fecEnabled, setFecEnabled] = useState(true);
  const packets = [1, 0, 1, 1, 0, 1, 1, 1];

  return (
    <div className="space-y-3">
      <div className="flex gap-0.5 justify-center">
        {packets.map((p, i) => (
          <div
            key={i}
            className={`w-6 h-8 rounded text-xs flex items-center justify-center ${
              p === 1 ? 'bg-green-500' : (fecEnabled ? 'bg-yellow-500' : 'bg-red-500')
            }`}
          >
            {p === 0 && (fecEnabled ? <RefreshCw size={12} /> : <X size={12} />)}
          </div>
        ))}
      </div>
      <button
        onClick={() => setFecEnabled(!fecEnabled)}
        className={`w-full text-xs py-1 rounded ${fecEnabled ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
      >
        FEC: {fecEnabled ? 'ON (recovered)' : 'OFF (lost)'}
      </button>
    </div>
  );
}

// ============ DIFFUSION MODEL ADVANCED ============

// DDPM vs DDIM sampling
export function SamplingMethodMini() {
  const [method, setMethod] = useState<'ddpm' | 'ddim'>('ddpm');
  const steps = method === 'ddpm' ? 50 : 10;

  return (
    <div className="space-y-3">
      <div className="flex gap-0.5 justify-center h-8">
        {Array(method === 'ddpm' ? 10 : 5).fill(0).map((_, i) => (
          <div key={i} className="w-4 h-full rounded bg-purple-500" style={{ opacity: 0.3 + (i / (method === 'ddpm' ? 10 : 5)) * 0.7 }} />
        ))}
      </div>
      <div className="flex gap-2 justify-center">
        {(['ddpm', 'ddim'] as const).map((m) => (
          <button key={m} onClick={() => setMethod(m)} className={`px-3 py-1 rounded text-xs ${method === m ? 'bg-purple-500 text-white' : 'bg-[var(--card-bg-alt)]'}`}>
            {m.toUpperCase()}
          </button>
        ))}
      </div>
      <p className="text-xs text-center text-[var(--muted)]">{steps} steps</p>
    </div>
  );
}

// Text embedding visualization
export function TextEmbeddingMini() {
  const [prompt, setPrompt] = useState<'cat' | 'dog' | 'bird'>('cat');
  const embeddings = { cat: [0.8, 0.2, 0.5], dog: [0.7, 0.3, 0.4], bird: [0.3, 0.9, 0.6] };

  return (
    <div className="space-y-3">
      <div className="flex gap-1 justify-center">
        {(['cat', 'dog', 'bird'] as const).map((p) => (
          <button key={p} onClick={() => setPrompt(p)} className={`px-2 py-1 rounded text-xs ${prompt === p ? 'bg-purple-500 text-white' : 'bg-[var(--card-bg-alt)]'}`}>{p}</button>
        ))}
      </div>
      <div className="flex gap-2 justify-center items-end h-12">
        {embeddings[prompt].map((v, i) => (
          <div key={i} className="w-8 rounded-t bg-purple-500 transition-all" style={{ height: `${v * 100}%` }} />
        ))}
      </div>
      <p className="text-xs text-center text-[var(--muted)]">Token embedding dims</p>
    </div>
  );
}

// Classifier-free guidance scale
export function CFGScaleMini() {
  const [scale, setScale] = useState(7.5);

  return (
    <div className="space-y-3">
      <div className="flex gap-2 justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded bg-gray-500" style={{ filter: `blur(${Math.max(0, 3 - scale / 5)}px)` }} />
          <span className="text-xs text-[var(--muted)]">Low</span>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 rounded bg-purple-500" style={{ filter: `contrast(${0.8 + scale / 20})` }} />
          <span className="text-xs text-[var(--muted)]">High</span>
        </div>
      </div>
      <input type="range" min="1" max="20" step="0.5" value={scale} onChange={(e) => setScale(parseFloat(e.target.value))} className="w-full" />
      <p className="text-xs text-center text-[var(--muted)]">CFG Scale: {scale}</p>
    </div>
  );
}

// ============ AUDIO/SPEECH MECHANISMS ============

// Pitch detection
export function PitchDetectionMini() {
  const [frequency, setFrequency] = useState(440);
  const note = frequency < 300 ? 'C' : frequency < 400 ? 'E' : frequency < 500 ? 'A' : 'C5';

  return (
    <div className="space-y-3">
      <svg width="100" height="40" viewBox="0 0 100 40" className="w-full">
        <path
          d={Array(20).fill(0).map((_, i) => {
            const x = i * 5;
            const y = 20 + Math.sin(i * frequency / 100) * 15;
            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
          }).join(' ')}
          fill="none"
          stroke="#8b5cf6"
          strokeWidth="2"
        />
      </svg>
      <input type="range" min="200" max="800" value={frequency} onChange={(e) => setFrequency(parseInt(e.target.value))} className="w-full" />
      <p className="text-xs text-center text-[var(--muted)]">{frequency}Hz → {note}</p>
    </div>
  );
}

// Audio waveform types
export function WaveformTypesMini() {
  const [type, setType] = useState<'sine' | 'square' | 'saw'>('sine');

  const getPath = () => {
    switch (type) {
      case 'sine': return 'M 0 20 Q 12.5 0, 25 20 Q 37.5 40, 50 20 Q 62.5 0, 75 20 Q 87.5 40, 100 20';
      case 'square': return 'M 0 35 L 0 5 L 25 5 L 25 35 L 50 35 L 50 5 L 75 5 L 75 35 L 100 35';
      case 'saw': return 'M 0 35 L 25 5 L 25 35 L 50 5 L 50 35 L 75 5 L 75 35 L 100 5';
    }
  };

  return (
    <div className="space-y-3">
      <svg width="100" height="40" viewBox="0 0 100 40" className="w-full">
        <path d={getPath()} fill="none" stroke="#8b5cf6" strokeWidth="2" />
      </svg>
      <div className="flex gap-1 justify-center">
        {(['sine', 'square', 'saw'] as const).map((t) => (
          <button key={t} onClick={() => setType(t)} className={`px-2 py-1 rounded text-xs ${type === t ? 'bg-purple-500 text-white' : 'bg-[var(--card-bg-alt)]'}`}>{t}</button>
        ))}
      </div>
    </div>
  );
}

// Lip sync weights
export function LipSyncWeightsMini() {
  const [viseme, setViseme] = useState<'AA' | 'EE' | 'OO' | 'MM'>('AA');
  const shapes = {
    AA: { jaw: 0.8, upperLip: 0.2, lowerLip: 0.4, mouthWidth: 0.6 },
    EE: { jaw: 0.3, upperLip: 0.5, lowerLip: 0.3, mouthWidth: 0.9 },
    OO: { jaw: 0.5, upperLip: 0.4, lowerLip: 0.4, mouthWidth: 0.3 },
    MM: { jaw: 0.1, upperLip: 0.8, lowerLip: 0.8, mouthWidth: 0.4 },
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-1 justify-center">
        {(Object.keys(shapes) as Array<keyof typeof shapes>).map((v) => (
          <button key={v} onClick={() => setViseme(v)} className={`px-2 py-1 rounded text-xs ${viseme === v ? 'bg-purple-500 text-white' : 'bg-[var(--card-bg-alt)]'}`}>{v}</button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-1 text-xs">
        {Object.entries(shapes[viseme]).map(([k, v]) => (
          <div key={k} className="flex items-center gap-1">
            <span className="w-12 text-[var(--muted)]">{k}</span>
            <div className="flex-1 h-2 bg-[var(--card-bg-alt)] rounded">
              <div className="h-full bg-purple-500 rounded" style={{ width: `${v * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ COMPRESSION / ENCODING ============

// DCT visualization
export function DCTVisualizationMini() {
  const [frequency, setFrequency] = useState(2);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-8 gap-0">
        {Array(64).fill(0).map((_, i) => {
          const x = i % 8;
          const y = Math.floor(i / 8);
          const val = Math.cos((x * frequency * Math.PI) / 8) * Math.cos((y * frequency * Math.PI) / 8);
          return (
            <div
              key={i}
              className="aspect-square"
              style={{ backgroundColor: `rgb(${128 + val * 127}, ${128 + val * 127}, ${128 + val * 127})` }}
            />
          );
        })}
      </div>
      <input type="range" min="0" max="7" value={frequency} onChange={(e) => setFrequency(parseInt(e.target.value))} className="w-full" />
      <p className="text-xs text-center text-[var(--muted)]">DCT frequency: {frequency}</p>
    </div>
  );
}

// Quantization levels
export function QuantizationMini() {
  const [bits, setBits] = useState(4);
  const levels = Math.pow(2, bits);

  return (
    <div className="space-y-3">
      <div className="flex gap-0 justify-center h-12">
        {Array(16).fill(0).map((_, i) => {
          const original = i / 15;
          const quantized = Math.round(original * (levels - 1)) / (levels - 1);
          return (
            <div key={i} className="flex-1 flex flex-col justify-end">
              <div className="bg-purple-500" style={{ height: `${quantized * 100}%` }} />
            </div>
          );
        })}
      </div>
      <input type="range" min="1" max="8" value={bits} onChange={(e) => setBits(parseInt(e.target.value))} className="w-full" />
      <p className="text-xs text-center text-[var(--muted)]">{bits}-bit = {levels} levels</p>
    </div>
  );
}

// ============ COLOR / LIGHTING ============

// Color space conversion
export function ColorSpaceMini() {
  const [space, setSpace] = useState<'RGB' | 'HSL' | 'YUV'>('RGB');

  return (
    <div className="space-y-3">
      <div className="flex gap-2 justify-center">
        {space === 'RGB' && (
          <>
            <div className="w-8 h-8 bg-red-500 rounded" />
            <div className="w-8 h-8 bg-green-500 rounded" />
            <div className="w-8 h-8 bg-blue-500 rounded" />
          </>
        )}
        {space === 'HSL' && (
          <>
            <div className="w-8 h-8 rounded" style={{ background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)' }} />
            <div className="w-8 h-8 rounded" style={{ background: 'linear-gradient(to right, gray, white)' }} />
            <div className="w-8 h-8 rounded" style={{ background: 'linear-gradient(to right, black, white)' }} />
          </>
        )}
        {space === 'YUV' && (
          <>
            <div className="w-8 h-8 rounded bg-gray-400" />
            <div className="w-8 h-8 rounded" style={{ background: 'linear-gradient(to right, blue, yellow)' }} />
            <div className="w-8 h-8 rounded" style={{ background: 'linear-gradient(to right, red, cyan)' }} />
          </>
        )}
      </div>
      <div className="flex gap-1 justify-center">
        {(['RGB', 'HSL', 'YUV'] as const).map((s) => (
          <button key={s} onClick={() => setSpace(s)} className={`px-2 py-1 rounded text-xs ${space === s ? 'bg-purple-500 text-white' : 'bg-[var(--card-bg-alt)]'}`}>{s}</button>
        ))}
      </div>
    </div>
  );
}

// Ambient occlusion
export function AmbientOcclusionMini() {
  const [aoEnabled, setAoEnabled] = useState(true);

  return (
    <div className="space-y-3">
      <div className="flex gap-4 justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-lg bg-gray-400" />
          <div className="absolute inset-1 rounded-lg bg-gray-300" />
          {aoEnabled && (
            <div className="absolute inset-0 rounded-lg" style={{ boxShadow: 'inset 3px 3px 8px rgba(0,0,0,0.4), inset -1px -1px 4px rgba(255,255,255,0.2)' }} />
          )}
        </div>
      </div>
      <button
        onClick={() => setAoEnabled(!aoEnabled)}
        className={`w-full text-xs py-1 rounded ${aoEnabled ? 'bg-purple-500 text-white' : 'bg-[var(--card-bg-alt)]'}`}
      >
        AO: {aoEnabled ? 'ON' : 'OFF'}
      </button>
    </div>
  );
}

// ============ GEOMETRY PROCESSING ============

// Mesh subdivision
export function MeshSubdivisionMini() {
  const [level, setLevel] = useState(0);
  const tris = Math.pow(4, level);

  return (
    <div className="space-y-3">
      <svg width="80" height="70" viewBox="0 0 80 70" className="w-full max-w-[80px] mx-auto">
        <polygon points="40,5 75,65 5,65" fill="none" stroke="#8b5cf6" strokeWidth="2" />
        {level >= 1 && (
          <>
            <line x1="22.5" y1="35" x2="57.5" y2="35" stroke="#8b5cf6" strokeWidth="1" />
            <line x1="40" y1="5" x2="40" y2="65" stroke="#8b5cf6" strokeWidth="1" />
            <line x1="22.5" y1="35" x2="5" y2="65" stroke="#8b5cf6" strokeWidth="1" />
            <line x1="57.5" y1="35" x2="75" y2="65" stroke="#8b5cf6" strokeWidth="1" />
          </>
        )}
        {level >= 2 && (
          <>
            <line x1="31.25" y1="20" x2="48.75" y2="20" stroke="#8b5cf6" strokeWidth="0.5" />
            <line x1="13.75" y1="50" x2="31.25" y2="50" stroke="#8b5cf6" strokeWidth="0.5" />
            <line x1="48.75" y1="50" x2="66.25" y2="50" stroke="#8b5cf6" strokeWidth="0.5" />
          </>
        )}
      </svg>
      <input type="range" min="0" max="2" value={level} onChange={(e) => setLevel(parseInt(e.target.value))} className="w-full" />
      <p className="text-xs text-center text-[var(--muted)]">Level {level}: {tris} triangles</p>
    </div>
  );
}

// Normal calculation
export function NormalCalculationMini() {
  const [showNormals, setShowNormals] = useState(true);

  return (
    <div className="space-y-3">
      <svg width="100" height="60" viewBox="0 0 100 60" className="w-full">
        <polygon points="10,50 50,10 90,50" fill="#8b5cf6" opacity="0.5" stroke="#8b5cf6" strokeWidth="2" />
        {showNormals && (
          <>
            <line x1="50" y1="37" x2="50" y2="17" stroke="#22c55e" strokeWidth="2" markerEnd="url(#arrow)" />
            <defs>
              <marker id="arrow" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
                <path d="M0,0 L10,5 L0,10 z" fill="#22c55e" />
              </marker>
            </defs>
          </>
        )}
      </svg>
      <button
        onClick={() => setShowNormals(!showNormals)}
        className={`w-full text-xs py-1 rounded ${showNormals ? 'bg-green-500 text-white' : 'bg-[var(--card-bg-alt)]'}`}
      >
        Normals: {showNormals ? 'Visible' : 'Hidden'}
      </button>
    </div>
  );
}

// ============ TEMPORAL MECHANISMS ============

// Motion blur
export function MotionBlurMini() {
  const [blurAmount, setBlurAmount] = useState(5);

  return (
    <div className="space-y-3">
      <div className="relative h-12 bg-[var(--card-bg-alt)] rounded overflow-hidden">
        <div
          className="absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-purple-500"
          style={{
            left: '60%',
            filter: `blur(${blurAmount}px)`,
            transform: `translateY(-50%) scaleX(${1 + blurAmount / 5})`,
          }}
        />
      </div>
      <input type="range" min="0" max="15" value={blurAmount} onChange={(e) => setBlurAmount(parseInt(e.target.value))} className="w-full" />
      <p className="text-xs text-center text-[var(--muted)]">Blur: {blurAmount}px</p>
    </div>
  );
}

// Frame rate comparison
export function FrameRateComparisonMini() {
  const [fps, setFps] = useState(30);
  const frameTime = 1000 / fps;

  return (
    <div className="space-y-3">
      <div className="flex gap-1 justify-center">
        {Array(8).fill(0).map((_, i) => (
          <div key={i} className={`w-6 h-10 rounded ${i < Math.floor(fps / 10) ? 'bg-green-500' : 'bg-[var(--card-bg-alt)]'}`} />
        ))}
      </div>
      <input type="range" min="10" max="60" step="10" value={fps} onChange={(e) => setFps(parseInt(e.target.value))} className="w-full" />
      <p className="text-xs text-center text-[var(--muted)]">{fps} FPS = {frameTime.toFixed(1)}ms/frame</p>
    </div>
  );
}

// ============ FINAL 8 MECHANISMS TO REACH 100 ============

// Texture filtering modes
export function TextureFilteringMini() {
  const [mode, setMode] = useState<'nearest' | 'bilinear' | 'trilinear'>('bilinear');

  return (
    <div className="space-y-3">
      <div className="flex justify-center">
        <div
          className="w-16 h-16 rounded"
          style={{
            background: 'linear-gradient(45deg, #8b5cf6 25%, #a78bfa 25%, #a78bfa 50%, #8b5cf6 50%, #8b5cf6 75%, #a78bfa 75%)',
            backgroundSize: mode === 'nearest' ? '16px 16px' : '8px 8px',
            filter: mode === 'nearest' ? 'none' : mode === 'bilinear' ? 'blur(0.5px)' : 'blur(1px)',
            imageRendering: mode === 'nearest' ? 'pixelated' : 'auto',
          }}
        />
      </div>
      <div className="flex gap-1 justify-center">
        {(['nearest', 'bilinear', 'trilinear'] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)} className={`px-1 py-1 rounded text-xs ${mode === m ? 'bg-purple-500 text-white' : 'bg-[var(--card-bg-alt)]'}`}>{m}</button>
        ))}
      </div>
    </div>
  );
}

// Vertex shader transform
export function VertexShaderMini() {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  return (
    <div className="space-y-3">
      <svg width="80" height="60" viewBox="0 0 80 60" className="w-full max-w-[80px] mx-auto">
        <g transform={`translate(40, 30) rotate(${rotation}) scale(${scale})`}>
          <polygon points="-15,-15 15,-15 15,15 -15,15" fill="none" stroke="#8b5cf6" strokeWidth="2" />
          <circle cx="-15" cy="-15" r="2" fill="#22c55e" />
          <circle cx="15" cy="-15" r="2" fill="#22c55e" />
          <circle cx="15" cy="15" r="2" fill="#22c55e" />
          <circle cx="-15" cy="15" r="2" fill="#22c55e" />
        </g>
      </svg>
      <div className="grid grid-cols-2 gap-1 text-xs">
        <div>Scale<input type="range" min="0.5" max="1.5" step="0.1" value={scale} onChange={(e) => setScale(parseFloat(e.target.value))} className="w-full" /></div>
        <div>Rot<input type="range" min="0" max="90" value={rotation} onChange={(e) => setRotation(parseInt(e.target.value))} className="w-full" /></div>
      </div>
    </div>
  );
}

// Fragment/Pixel shader
export function FragmentShaderMini() {
  const [effect, setEffect] = useState<'color' | 'gradient' | 'pattern'>('color');

  const getStyle = () => {
    switch (effect) {
      case 'color': return { background: '#8b5cf6' };
      case 'gradient': return { background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)' };
      case 'pattern': return { background: 'repeating-linear-gradient(45deg, #8b5cf6 0, #8b5cf6 10px, #a78bfa 10px, #a78bfa 20px)' };
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-center">
        <div className="w-16 h-16 rounded" style={getStyle()} />
      </div>
      <div className="flex gap-1 justify-center">
        {(['color', 'gradient', 'pattern'] as const).map((e) => (
          <button key={e} onClick={() => setEffect(e)} className={`px-2 py-1 rounded text-xs ${effect === e ? 'bg-purple-500 text-white' : 'bg-[var(--card-bg-alt)]'}`}>{e}</button>
        ))}
      </div>
    </div>
  );
}

// UV mapping coordinates
export function UVMappingMini() {
  const [tileU, setTileU] = useState(1);
  const [tileV, setTileV] = useState(1);

  return (
    <div className="space-y-3">
      <div
        className="w-16 h-16 mx-auto rounded"
        style={{
          background: `repeating-linear-gradient(0deg, #8b5cf6 0, #8b5cf6 ${100/tileV}%, #a78bfa ${100/tileV}%, #a78bfa ${200/tileV}%),
                       repeating-linear-gradient(90deg, transparent 0, transparent ${100/tileU}%, rgba(0,0,0,0.3) ${100/tileU}%, rgba(0,0,0,0.3) ${200/tileU}%)`,
          backgroundBlendMode: 'normal',
        }}
      />
      <div className="grid grid-cols-2 gap-1 text-xs">
        <div>U<input type="range" min="1" max="4" value={tileU} onChange={(e) => setTileU(parseInt(e.target.value))} className="w-full" /></div>
        <div>V<input type="range" min="1" max="4" value={tileV} onChange={(e) => setTileV(parseInt(e.target.value))} className="w-full" /></div>
      </div>
    </div>
  );
}

// Tone mapping / HDR
export function ToneMappingMini() {
  const [exposure, setExposure] = useState(1);

  return (
    <div className="space-y-3">
      <div className="flex gap-2 justify-center">
        {[0.3, 0.6, 0.9].map((brightness, i) => (
          <div
            key={i}
            className="w-10 h-10 rounded"
            style={{
              backgroundColor: `rgb(${Math.min(255, brightness * 255 * exposure)}, ${Math.min(255, brightness * 200 * exposure)}, ${Math.min(255, brightness * 150 * exposure)})`,
            }}
          />
        ))}
      </div>
      <input type="range" min="0.5" max="2" step="0.1" value={exposure} onChange={(e) => setExposure(parseFloat(e.target.value))} className="w-full" />
      <p className="text-xs text-center text-[var(--muted)]">Exposure: {exposure.toFixed(1)}</p>
    </div>
  );
}

// Bézier curve interpolation
export function BezierCurveMini() {
  const [control, setControl] = useState(0.5);

  return (
    <div className="space-y-3">
      <svg width="100" height="60" viewBox="0 0 100 60" className="w-full">
        <path
          d={`M 10 50 Q ${10 + control * 80} 10, 90 50`}
          fill="none"
          stroke="#8b5cf6"
          strokeWidth="2"
        />
        <circle cx="10" cy="50" r="3" fill="#22c55e" />
        <circle cx="90" cy="50" r="3" fill="#22c55e" />
        <circle cx={10 + control * 80} cy="10" r="3" fill="#ef4444" />
        <line x1="10" y1="50" x2={10 + control * 80} y2="10" stroke="#ef4444" strokeWidth="1" strokeDasharray="3" />
        <line x1={10 + control * 80} y1="10" x2="90" y2="50" stroke="#ef4444" strokeWidth="1" strokeDasharray="3" />
      </svg>
      <input type="range" min="0" max="1" step="0.05" value={control} onChange={(e) => setControl(parseFloat(e.target.value))} className="w-full" />
    </div>
  );
}

// Noise generation types
export function NoiseGenerationMini() {
  const [type, setType] = useState<'white' | 'perlin' | 'simplex'>('perlin');

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-8 gap-0">
        {Array(64).fill(0).map((_, i) => {
          const x = i % 8;
          const y = Math.floor(i / 8);
          let val: number;
          if (type === 'white') {
            val = Math.random();
          } else if (type === 'perlin') {
            val = (Math.sin(x * 0.5) * Math.cos(y * 0.5) + 1) / 2;
          } else {
            val = (Math.sin(x * 0.3 + y * 0.3) + 1) / 2;
          }
          return (
            <div
              key={i}
              className="aspect-square"
              style={{ backgroundColor: `rgb(${val * 255}, ${val * 255}, ${val * 255})` }}
            />
          );
        })}
      </div>
      <div className="flex gap-1 justify-center">
        {(['white', 'perlin', 'simplex'] as const).map((t) => (
          <button key={t} onClick={() => setType(t)} className={`px-2 py-1 rounded text-xs ${type === t ? 'bg-purple-500 text-white' : 'bg-[var(--card-bg-alt)]'}`}>{t}</button>
        ))}
      </div>
    </div>
  );
}

// Anti-aliasing comparison
export function AntiAliasingMini() {
  const [aaEnabled, setAaEnabled] = useState(true);

  return (
    <div className="space-y-3">
      <svg width="80" height="60" viewBox="0 0 80 60" className="w-full max-w-[80px] mx-auto" style={{ shapeRendering: aaEnabled ? 'auto' : 'crispEdges' }}>
        <line x1="10" y1="50" x2="70" y2="10" stroke="#8b5cf6" strokeWidth={aaEnabled ? '2' : '2'} />
        <circle cx="40" cy="30" r="15" fill="none" stroke="#8b5cf6" strokeWidth="2" />
      </svg>
      <button
        onClick={() => setAaEnabled(!aaEnabled)}
        className={`w-full text-xs py-1 rounded ${aaEnabled ? 'bg-green-500 text-white' : 'bg-[var(--card-bg-alt)]'}`}
      >
        AA: {aaEnabled ? 'ON (smooth)' : 'OFF (jagged)'}
      </button>
    </div>
  );
}
