'use client';

import { useState, useRef, useEffect } from 'react';

interface Blendshape {
  name: string;
  category: string;
  description: string;
  value: number;
}

const DEFAULT_BLENDSHAPES: Blendshape[] = [
  // Eyes
  { name: 'eyeBlinkLeft', category: 'Eyes', description: 'Close left eye', value: 0 },
  { name: 'eyeBlinkRight', category: 'Eyes', description: 'Close right eye', value: 0 },
  { name: 'eyeWideLeft', category: 'Eyes', description: 'Widen left eye', value: 0 },
  { name: 'eyeWideRight', category: 'Eyes', description: 'Widen right eye', value: 0 },
  { name: 'eyeSquintLeft', category: 'Eyes', description: 'Squint left eye', value: 0 },
  { name: 'eyeSquintRight', category: 'Eyes', description: 'Squint right eye', value: 0 },
  // Brows
  { name: 'browDownLeft', category: 'Brows', description: 'Lower left brow', value: 0 },
  { name: 'browDownRight', category: 'Brows', description: 'Lower right brow', value: 0 },
  { name: 'browInnerUp', category: 'Brows', description: 'Raise inner brows', value: 0 },
  { name: 'browOuterUpLeft', category: 'Brows', description: 'Raise outer left brow', value: 0 },
  { name: 'browOuterUpRight', category: 'Brows', description: 'Raise outer right brow', value: 0 },
  // Mouth
  { name: 'jawOpen', category: 'Mouth', description: 'Open jaw', value: 0 },
  { name: 'mouthSmileLeft', category: 'Mouth', description: 'Smile left side', value: 0 },
  { name: 'mouthSmileRight', category: 'Mouth', description: 'Smile right side', value: 0 },
  { name: 'mouthFrownLeft', category: 'Mouth', description: 'Frown left side', value: 0 },
  { name: 'mouthFrownRight', category: 'Mouth', description: 'Frown right side', value: 0 },
  { name: 'mouthPucker', category: 'Mouth', description: 'Pucker lips', value: 0 },
  { name: 'mouthFunnel', category: 'Mouth', description: 'O-shape mouth', value: 0 },
  // Cheeks
  { name: 'cheekPuff', category: 'Cheeks', description: 'Puff cheeks', value: 0 },
  { name: 'cheekSquintLeft', category: 'Cheeks', description: 'Squint left cheek', value: 0 },
  { name: 'cheekSquintRight', category: 'Cheeks', description: 'Squint right cheek', value: 0 },
  // Nose
  { name: 'noseSneerLeft', category: 'Nose', description: 'Sneer left', value: 0 },
  { name: 'noseSneerRight', category: 'Nose', description: 'Sneer right', value: 0 },
];

const PRESETS = {
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
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const categories = ['all', ...Array.from(new Set(DEFAULT_BLENDSHAPES.map(b => b.category)))];

  const updateBlendshape = (name: string, value: number) => {
    setBlendshapes(prev => prev.map(b => b.name === name ? { ...b, value } : b));
  };

  const applyPreset = (presetName: keyof typeof PRESETS) => {
    const preset = PRESETS[presetName];
    setBlendshapes(DEFAULT_BLENDSHAPES.map(b => ({
      ...b,
      value: preset[b.name as keyof typeof preset] || 0
    })));
  };

  const getBlendshapeValue = (name: string) => {
    return blendshapes.find(b => b.name === name)?.value || 0;
  };

  // Draw the face
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    // Clear
    ctx.clearRect(0, 0, w, h);

    // Face
    ctx.fillStyle = '#ffdbac';
    ctx.beginPath();
    const cheekPuff = getBlendshapeValue('cheekPuff');
    ctx.ellipse(cx, cy, 120 + cheekPuff * 20, 150, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#c68642';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Brows
    const browDownL = getBlendshapeValue('browDownLeft');
    const browDownR = getBlendshapeValue('browDownRight');
    const browInnerUp = getBlendshapeValue('browInnerUp');
    const browOuterL = getBlendshapeValue('browOuterUpLeft');
    const browOuterR = getBlendshapeValue('browOuterUpRight');

    ctx.strokeStyle = '#4a3728';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';

    // Left brow
    ctx.beginPath();
    ctx.moveTo(cx - 70, cy - 50 + browDownL * 15 - browOuterL * 15);
    ctx.quadraticCurveTo(cx - 45, cy - 60 + browDownL * 10 - browInnerUp * 15, cx - 20, cy - 50 - browInnerUp * 15);
    ctx.stroke();

    // Right brow
    ctx.beginPath();
    ctx.moveTo(cx + 70, cy - 50 + browDownR * 15 - browOuterR * 15);
    ctx.quadraticCurveTo(cx + 45, cy - 60 + browDownR * 10 - browInnerUp * 15, cx + 20, cy - 50 - browInnerUp * 15);
    ctx.stroke();

    // Eyes
    const blinkL = getBlendshapeValue('eyeBlinkLeft');
    const blinkR = getBlendshapeValue('eyeBlinkRight');
    const wideL = getBlendshapeValue('eyeWideLeft');
    const wideR = getBlendshapeValue('eyeWideRight');
    const squintL = getBlendshapeValue('eyeSquintLeft');
    const squintR = getBlendshapeValue('eyeSquintRight');
    const cheekSquintL = getBlendshapeValue('cheekSquintLeft');
    const cheekSquintR = getBlendshapeValue('cheekSquintRight');

    // Left eye white
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    const eyeHeightL = Math.max(0.1, 1 - blinkL) * (1 + wideL * 0.3) * (1 - squintL * 0.5) * (1 - cheekSquintL * 0.3);
    ctx.ellipse(cx - 40, cy - 20, 25, 15 * eyeHeightL, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Right eye white
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    const eyeHeightR = Math.max(0.1, 1 - blinkR) * (1 + wideR * 0.3) * (1 - squintR * 0.5) * (1 - cheekSquintR * 0.3);
    ctx.ellipse(cx + 40, cy - 20, 25, 15 * eyeHeightR, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Pupils (only if eyes not fully closed)
    if (eyeHeightL > 0.2) {
      ctx.fillStyle = '#3d2314';
      ctx.beginPath();
      ctx.arc(cx - 40, cy - 20, 8, 0, Math.PI * 2);
      ctx.fill();
    }
    if (eyeHeightR > 0.2) {
      ctx.fillStyle = '#3d2314';
      ctx.beginPath();
      ctx.arc(cx + 40, cy - 20, 8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Nose
    const sneerL = getBlendshapeValue('noseSneerLeft');
    const sneerR = getBlendshapeValue('noseSneerRight');

    ctx.strokeStyle = '#c68642';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 10);
    ctx.lineTo(cx - 5 - sneerL * 5, cy + 30);
    ctx.lineTo(cx + 5 + sneerR * 5, cy + 30);
    ctx.stroke();

    // Mouth
    const jawOpen = getBlendshapeValue('jawOpen');
    const smileL = getBlendshapeValue('mouthSmileLeft');
    const smileR = getBlendshapeValue('mouthSmileRight');
    const frownL = getBlendshapeValue('mouthFrownLeft');
    const frownR = getBlendshapeValue('mouthFrownRight');
    const pucker = getBlendshapeValue('mouthPucker');
    const funnel = getBlendshapeValue('mouthFunnel');

    const mouthWidth = 40 * (1 - pucker * 0.5) * (1 - funnel * 0.3);
    const mouthHeight = 5 + jawOpen * 30;
    const cornerLY = (smileL - frownL) * 15;
    const cornerRY = (smileR - frownR) * 15;

    ctx.fillStyle = '#8b4513';
    ctx.beginPath();

    if (funnel > 0.5 || pucker > 0.5) {
      // O-shape or pucker
      ctx.ellipse(cx, cy + 60, mouthWidth * 0.5, mouthHeight * 0.8, 0, 0, Math.PI * 2);
    } else {
      // Normal mouth
      ctx.moveTo(cx - mouthWidth, cy + 60 - cornerLY);
      ctx.quadraticCurveTo(cx, cy + 60 + mouthHeight, cx + mouthWidth, cy + 60 - cornerRY);
      ctx.quadraticCurveTo(cx, cy + 60 - mouthHeight * 0.3, cx - mouthWidth, cy + 60 - cornerLY);
    }
    ctx.fill();

    // Teeth if mouth open
    if (jawOpen > 0.3) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx - mouthWidth * 0.7, cy + 55, mouthWidth * 1.4, 8);
    }

  }, [blendshapes]);

  const filteredBlendshapes = activeCategory === 'all'
    ? blendshapes
    : blendshapes.filter(b => b.category === activeCategory);

  return (
    <div className="card p-6">
      <h3 className="font-semibold mb-4">ARKit Blendshape Playground</h3>
      <p className="text-sm text-[var(--muted)] mb-6">
        Manipulate individual blendshapes to understand how the 52 ARKit parameters combine to create facial expressions.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Face visualization */}
        <div className="flex flex-col items-center">
          <canvas
            ref={canvasRef}
            width={300}
            height={350}
            className="border border-[var(--border)] rounded-lg bg-[var(--card-bg-alt)]"
          />

          {/* Presets */}
          <div className="mt-4 w-full">
            <p className="text-sm font-medium mb-2">Expression Presets</p>
            <div className="flex flex-wrap gap-2">
              {Object.keys(PRESETS).map((preset) => (
                <button
                  key={preset}
                  onClick={() => applyPreset(preset as keyof typeof PRESETS)}
                  className="badge hover:border-[var(--border-strong)] text-xs capitalize"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div>
          {/* Category filter */}
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-xs px-2 py-1 rounded ${
                  activeCategory === cat
                    ? 'bg-[var(--accent)] text-white'
                    : 'bg-[var(--card-bg-alt)] hover:bg-[var(--border)]'
                }`}
              >
                {cat === 'all' ? 'All' : cat}
              </button>
            ))}
          </div>

          {/* Sliders */}
          <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2">
            {filteredBlendshapes.map((bs) => (
              <div key={bs.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium">{bs.name}</span>
                  <span className="text-[var(--muted)]">{bs.value.toFixed(2)}</span>
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
                <p className="text-xs text-[var(--muted)] mt-0.5">{bs.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Current values as JSON */}
      <div className="mt-6 p-4 bg-[var(--card-bg-alt)] rounded text-xs">
        <p className="font-medium mb-2">Active Blendshapes (non-zero)</p>
        <code className="text-[var(--muted)]">
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
