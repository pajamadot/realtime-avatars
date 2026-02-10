'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface Blendshape {
  name: string;
  category: string;
  description: string;
  value: number;
}

const DEFAULT_BLENDSHAPES: Blendshape[] = [
  { name: 'eyeBlinkLeft', category: 'Eyes', description: 'Close left eye', value: 0 },
  { name: 'eyeBlinkRight', category: 'Eyes', description: 'Close right eye', value: 0 },
  { name: 'eyeWideLeft', category: 'Eyes', description: 'Widen left eye', value: 0 },
  { name: 'eyeWideRight', category: 'Eyes', description: 'Widen right eye', value: 0 },
  { name: 'eyeSquintLeft', category: 'Eyes', description: 'Squint left eye', value: 0 },
  { name: 'eyeSquintRight', category: 'Eyes', description: 'Squint right eye', value: 0 },
  { name: 'browDownLeft', category: 'Brows', description: 'Lower left brow', value: 0 },
  { name: 'browDownRight', category: 'Brows', description: 'Lower right brow', value: 0 },
  { name: 'browInnerUp', category: 'Brows', description: 'Raise inner brows', value: 0 },
  { name: 'browOuterUpLeft', category: 'Brows', description: 'Raise outer left brow', value: 0 },
  { name: 'browOuterUpRight', category: 'Brows', description: 'Raise outer right brow', value: 0 },
  { name: 'jawOpen', category: 'Mouth', description: 'Open jaw', value: 0 },
  { name: 'mouthSmileLeft', category: 'Mouth', description: 'Smile left side', value: 0 },
  { name: 'mouthSmileRight', category: 'Mouth', description: 'Smile right side', value: 0 },
  { name: 'mouthFrownLeft', category: 'Mouth', description: 'Frown left side', value: 0 },
  { name: 'mouthFrownRight', category: 'Mouth', description: 'Frown right side', value: 0 },
  { name: 'mouthPucker', category: 'Mouth', description: 'Pucker lips', value: 0 },
  { name: 'mouthFunnel', category: 'Mouth', description: 'O-shape mouth', value: 0 },
  { name: 'cheekPuff', category: 'Cheeks', description: 'Puff cheeks', value: 0 },
  { name: 'cheekSquintLeft', category: 'Cheeks', description: 'Squint left cheek', value: 0 },
  { name: 'cheekSquintRight', category: 'Cheeks', description: 'Squint right cheek', value: 0 },
  { name: 'noseSneerLeft', category: 'Nose', description: 'Sneer left', value: 0 },
  { name: 'noseSneerRight', category: 'Nose', description: 'Sneer right', value: 0 },
];

const PRESETS: Record<string, Record<string, number>> = {
  neutral: {},
  smile: { mouthSmileLeft: 0.8, mouthSmileRight: 0.8, cheekSquintLeft: 0.4, cheekSquintRight: 0.4 },
  surprise: { eyeWideLeft: 1, eyeWideRight: 1, browInnerUp: 0.7, browOuterUpLeft: 0.6, browOuterUpRight: 0.6, jawOpen: 0.5 },
  angry: { browDownLeft: 0.8, browDownRight: 0.8, eyeSquintLeft: 0.4, eyeSquintRight: 0.4, noseSneerLeft: 0.5, noseSneerRight: 0.5 },
  sad: { browInnerUp: 0.6, mouthFrownLeft: 0.5, mouthFrownRight: 0.5, eyeSquintLeft: 0.2, eyeSquintRight: 0.2 },
  wink: { eyeBlinkLeft: 1, mouthSmileLeft: 0.5, mouthSmileRight: 0.3 },
};

export function BlendshapeDemo() {
  const [blendshapes, setBlendshapes] = useState<Blendshape[]>(DEFAULT_BLENDSHAPES);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activePreset, setActivePreset] = useState('neutral');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const targetRef = useRef<Record<string, number>>({});
  const animRef = useRef<number | null>(null);

  const categories = ['all', ...Array.from(new Set(DEFAULT_BLENDSHAPES.map(b => b.category)))];

  const updateBlendshape = (name: string, value: number) => {
    setBlendshapes(prev => prev.map(b => b.name === name ? { ...b, value } : b));
  };

  // Smooth animated preset transition
  const applyPreset = useCallback((presetName: string) => {
    setActivePreset(presetName);
    const preset = PRESETS[presetName] || {};
    DEFAULT_BLENDSHAPES.forEach(b => {
      targetRef.current[b.name] = preset[b.name] ?? 0;
    });
    if (animRef.current) cancelAnimationFrame(animRef.current);
    const animate = () => {
      let allDone = true;
      setBlendshapes(prev => prev.map(b => {
        const target = targetRef.current[b.name] ?? 0;
        const diff = target - b.value;
        if (Math.abs(diff) < 0.003) return { ...b, value: target };
        allDone = false;
        return { ...b, value: b.value + diff * 0.12 };
      }));
      if (!allDone) animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => () => { if (animRef.current) cancelAnimationFrame(animRef.current); }, []);

  // Draw the face with improved rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2 - 15;

    const get = (name: string) => blendshapes.find(b => b.name === name)?.value || 0;

    // Dark background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, w, h);

    const cheekPuff = get('cheekPuff');
    const faceW = 100 + cheekPuff * 15;
    const faceH = 125;

    // Face shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 6;
    const faceGrad = ctx.createRadialGradient(cx - 15, cy - 25, 10, cx, cy + 10, faceH);
    faceGrad.addColorStop(0, '#ffe8cc');
    faceGrad.addColorStop(0.4, '#ffdbac');
    faceGrad.addColorStop(0.8, '#e8b88a');
    faceGrad.addColorStop(1, '#c4956a');
    ctx.fillStyle = faceGrad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, faceW, faceH, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Cheek blush
    const smileL = get('mouthSmileLeft');
    const smileR = get('mouthSmileRight');
    const cheekSqL = get('cheekSquintLeft');
    const cheekSqR = get('cheekSquintRight');
    const blush = Math.max(cheekSqL, cheekSqR, smileL * 0.5, smileR * 0.5);
    if (blush > 0.05) {
      [cx - 55, cx + 55].forEach(bx => {
        const g = ctx.createRadialGradient(bx, cy + 20, 0, bx, cy + 20, 22);
        g.addColorStop(0, `rgba(255, 140, 140, ${blush * 0.35})`);
        g.addColorStop(1, 'rgba(255, 140, 140, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(bx, cy + 20, 22, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Brows
    const browDownL = get('browDownLeft');
    const browDownR = get('browDownRight');
    const browInnerUp = get('browInnerUp');
    const browOuterL = get('browOuterUpLeft');
    const browOuterR = get('browOuterUpRight');

    ctx.strokeStyle = '#4a3728';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(cx - 65, cy - 48 + browDownL * 15 - browOuterL * 15);
    ctx.quadraticCurveTo(cx - 42, cy - 60 + browDownL * 10 - browInnerUp * 15, cx - 18, cy - 48 - browInnerUp * 15);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx + 65, cy - 48 + browDownR * 15 - browOuterR * 15);
    ctx.quadraticCurveTo(cx + 42, cy - 60 + browDownR * 10 - browInnerUp * 15, cx + 18, cy - 48 - browInnerUp * 15);
    ctx.stroke();

    // Eyes
    const blinkL = get('eyeBlinkLeft');
    const blinkR = get('eyeBlinkRight');
    const wideL = get('eyeWideLeft');
    const wideR = get('eyeWideRight');
    const squintL = get('eyeSquintLeft');
    const squintR = get('eyeSquintRight');

    const drawEye = (ex: number, blink: number, wide: number, squint: number, cheekSq: number) => {
      const eyeH = Math.max(0.08, 1 - blink) * (1 + wide * 0.3) * (1 - squint * 0.5) * (1 - cheekSq * 0.3);
      const radiusX = 22;
      const radiusY = 13 * eyeH;

      // Eye white with slight gradient
      const ewGrad = ctx.createRadialGradient(ex, cy - 18, 2, ex, cy - 18, radiusX);
      ewGrad.addColorStop(0, '#ffffff');
      ewGrad.addColorStop(1, '#f0ece8');
      ctx.fillStyle = ewGrad;
      ctx.beginPath();
      ctx.ellipse(ex, cy - 18, radiusX, radiusY, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#3a2f28';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Iris + pupil
      if (eyeH > 0.15) {
        const irisR = Math.min(8, radiusY * 0.7);
        const irisGrad = ctx.createRadialGradient(ex - 1, cy - 19, 1, ex, cy - 18, irisR);
        irisGrad.addColorStop(0, '#5a3d2b');
        irisGrad.addColorStop(0.5, '#3d2314');
        irisGrad.addColorStop(1, '#2a1a0e');
        ctx.fillStyle = irisGrad;
        ctx.beginPath();
        ctx.arc(ex, cy - 18, irisR, 0, Math.PI * 2);
        ctx.fill();

        // Pupil
        ctx.fillStyle = '#0a0604';
        ctx.beginPath();
        ctx.arc(ex, cy - 18, irisR * 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Highlight
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.beginPath();
        ctx.arc(ex - 2, cy - 21, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Eyelashes (top)
      if (eyeH > 0.2) {
        ctx.strokeStyle = '#2a1a0e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(ex, cy - 18, radiusX + 1, radiusY + 1, 0, Math.PI + 0.15, -0.15);
        ctx.stroke();
      }
    };

    drawEye(cx - 38, blinkL, wideL, squintL, cheekSqL);
    drawEye(cx + 38, blinkR, wideR, squintR, cheekSqR);

    // Nose
    const sneerL = get('noseSneerLeft');
    const sneerR = get('noseSneerRight');

    ctx.strokeStyle = '#c4956a';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 5);
    ctx.quadraticCurveTo(cx - 2, cy + 15, cx - 8 - sneerL * 5, cy + 28);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, cy - 5);
    ctx.quadraticCurveTo(cx + 2, cy + 15, cx + 8 + sneerR * 5, cy + 28);
    ctx.stroke();
    // Nostrils
    ctx.fillStyle = '#b8845a';
    ctx.beginPath();
    ctx.ellipse(cx - 7 - sneerL * 4, cy + 28, 5 + sneerL * 2, 3, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 7 + sneerR * 4, cy + 28, 5 + sneerR * 2, 3, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Mouth
    const jawOpen = get('jawOpen');
    const frownL = get('mouthFrownLeft');
    const frownR = get('mouthFrownRight');
    const pucker = get('mouthPucker');
    const funnel = get('mouthFunnel');

    const mouthW = 35 * (1 - pucker * 0.5) * (1 - funnel * 0.3);
    const mouthH = 4 + jawOpen * 28;
    const cornerLY = (smileL - frownL) * 14;
    const cornerRY = (smileR - frownR) * 14;
    const mouthY = cy + 55 + jawOpen * 8;

    if (funnel > 0.5 || pucker > 0.5) {
      const lipGrad = ctx.createRadialGradient(cx, mouthY, 0, cx, mouthY, mouthW * 0.6);
      lipGrad.addColorStop(0, '#6b2020');
      lipGrad.addColorStop(0.6, '#c45050');
      lipGrad.addColorStop(1, '#d4887a');
      ctx.fillStyle = lipGrad;
      ctx.beginPath();
      ctx.ellipse(cx, mouthY, mouthW * 0.5, mouthH * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Mouth interior
      ctx.fillStyle = '#4a1515';
      ctx.beginPath();
      ctx.moveTo(cx - mouthW, mouthY - cornerLY);
      ctx.quadraticCurveTo(cx, mouthY + mouthH, cx + mouthW, mouthY - cornerRY);
      ctx.quadraticCurveTo(cx, mouthY - mouthH * 0.3, cx - mouthW, mouthY - cornerLY);
      ctx.fill();

      // Teeth
      if (jawOpen > 0.25) {
        ctx.fillStyle = '#f5f0eb';
        const teethW = mouthW * 0.65;
        ctx.fillRect(cx - teethW, mouthY - 2, teethW * 2, Math.min(8, mouthH * 0.4));
      }

      // Lip line
      const lipGrad = ctx.createLinearGradient(cx - mouthW, mouthY, cx + mouthW, mouthY);
      lipGrad.addColorStop(0, '#c47060');
      lipGrad.addColorStop(0.5, '#d4887a');
      lipGrad.addColorStop(1, '#c47060');
      ctx.strokeStyle = lipGrad;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - mouthW, mouthY - cornerLY);
      ctx.quadraticCurveTo(cx, mouthY - mouthH * 0.2, cx + mouthW, mouthY - cornerRY);
      ctx.stroke();
    }

    // Active weight bars at bottom
    const active = blendshapes.filter(b => b.value > 0.01);
    if (active.length > 0) {
      const barArea = { x: 8, y: h - 48, w: w - 16, h: 40 };
      const barW = Math.min(barArea.w / active.length - 1, 14);
      const startX = barArea.x + (barArea.w - active.length * (barW + 1)) / 2;

      // Formula label
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`f = x\u2080 + \u03A3 w\u1D62\u00B7B\u1D62  [${active.length} active]`, cx, barArea.y - 3);

      active.forEach((b, i) => {
        const x = startX + i * (barW + 1);
        ctx.fillStyle = 'rgba(124, 106, 156, 0.15)';
        ctx.fillRect(x, barArea.y, barW, barArea.h);
        const fillH = b.value * barArea.h;
        ctx.fillStyle = `rgba(124, 106, 156, ${0.4 + b.value * 0.6})`;
        ctx.fillRect(x, barArea.y + barArea.h - fillH, barW, fillH);
      });
    }
  }, [blendshapes]);

  const filteredBlendshapes = activeCategory === 'all'
    ? blendshapes
    : blendshapes.filter(b => b.category === activeCategory);

  return (
    <div className="card p-6">
      <h3 className="font-semibold mb-4">ARKit Blendshape Playground</h3>
      <p className="text-sm text-[var(--text-muted)] mb-6">
        Manipulate individual blendshapes to understand how the 52 ARKit parameters combine to create facial expressions.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="flex flex-col items-center">
          <canvas
            ref={canvasRef}
            width={300}
            height={350}
            className="rounded-lg"
          />
          <div className="mt-4 w-full">
            <p className="text-sm font-medium mb-2">Expression Presets</p>
            <div className="flex flex-wrap gap-2">
              {Object.keys(PRESETS).map((preset) => (
                <button
                  key={preset}
                  onClick={() => applyPreset(preset)}
                  className={`text-xs px-2.5 py-1 rounded capitalize transition-colors ${
                    activePreset === preset
                      ? 'bg-[var(--accent)] text-white'
                      : 'bg-[var(--surface-2)] hover:bg-[var(--border)]'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-xs px-2 py-1 rounded ${
                  activeCategory === cat
                    ? 'bg-[var(--accent)] text-white'
                    : 'bg-[var(--surface-2)] hover:bg-[var(--border)]'
                }`}
              >
                {cat === 'all' ? 'All' : cat}
              </button>
            ))}
          </div>

          <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2">
            {filteredBlendshapes.map((bs) => (
              <div key={bs.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium">{bs.name}</span>
                  <span className="text-[var(--text-muted)] font-mono">{bs.value.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={bs.value}
                  onChange={(e) => updateBlendshape(bs.name, parseFloat(e.target.value))}
                  className="w-full h-2"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-[var(--surface-2)] rounded text-xs">
        <p className="font-medium mb-2">Active Blendshapes (non-zero)</p>
        <code className="text-[var(--text-muted)]">
          {JSON.stringify(
            Object.fromEntries(
              blendshapes
                .filter(b => b.value > 0)
                .map(b => [b.name, Math.round(b.value * 100) / 100])
            ),
            null,
            2
          ) || '{ }'}
        </code>
      </div>
    </div>
  );
}

export default BlendshapeDemo;
