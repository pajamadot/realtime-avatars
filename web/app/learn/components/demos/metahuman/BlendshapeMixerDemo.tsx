'use client';

import { useState, useEffect, useRef } from 'react';

interface Expression {
  name: string;
  blendshapes: Record<string, number>;
  color: string;
}

const EXPRESSIONS: Expression[] = [
  {
    name: 'Happy',
    blendshapes: { mouthSmile: 0.8, eyeSquint: 0.3, browUp: 0.2, cheekPuff: 0.1 },
    color: '#f1c40f',
  },
  {
    name: 'Sad',
    blendshapes: { mouthFrown: 0.7, browDown: 0.5, eyeDroop: 0.3 },
    color: '#3498db',
  },
  {
    name: 'Angry',
    blendshapes: { browDown: 0.8, eyeSquint: 0.4, mouthTight: 0.5, nostrilFlare: 0.3 },
    color: '#e74c3c',
  },
  {
    name: 'Surprised',
    blendshapes: { browUp: 0.9, eyeWide: 0.8, mouthOpen: 0.6, jawDrop: 0.4 },
    color: '#9b59b6',
  },
  {
    name: 'Disgusted',
    blendshapes: { noseScrunch: 0.7, upperLipUp: 0.5, browDown: 0.3 },
    color: '#27ae60',
  },
];

const ALL_BLENDSHAPES = [
  'mouthSmile', 'mouthFrown', 'mouthOpen', 'mouthTight',
  'eyeSquint', 'eyeWide', 'eyeDroop',
  'browUp', 'browDown',
  'cheekPuff', 'jawDrop', 'noseScrunch', 'nostrilFlare', 'upperLipUp'
];

export function BlendshapeMixerDemo() {
  const [expressionWeights, setExpressionWeights] = useState<Record<string, number>>(
    Object.fromEntries(EXPRESSIONS.map(e => [e.name, 0]))
  );
  const [finalBlendshapes, setFinalBlendshapes] = useState<Record<string, number>>({});
  const [showContributions, setShowContributions] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Calculate final blendshape values from expression mix
  useEffect(() => {
    const result: Record<string, number> = {};

    ALL_BLENDSHAPES.forEach(bs => {
      let value = 0;
      EXPRESSIONS.forEach(expr => {
        const weight = expressionWeights[expr.name] || 0;
        const bsValue = expr.blendshapes[bs] || 0;
        value += weight * bsValue;
      });
      result[bs] = Math.min(1, Math.max(0, value));
    });

    setFinalBlendshapes(result);
  }, [expressionWeights]);

  // Render face
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    ctx.clearRect(0, 0, width, height);

    // Get blendshape values
    const smile = finalBlendshapes.mouthSmile || 0;
    const frown = finalBlendshapes.mouthFrown || 0;
    const mouthOpen = finalBlendshapes.mouthOpen || 0;
    const eyeSquint = finalBlendshapes.eyeSquint || 0;
    const eyeWide = finalBlendshapes.eyeWide || 0;
    const browUp = finalBlendshapes.browUp || 0;
    const browDown = finalBlendshapes.browDown || 0;
    const cheekPuff = finalBlendshapes.cheekPuff || 0;
    const jawDrop = finalBlendshapes.jawDrop || 0;

    // Face
    const faceWidth = 90 + cheekPuff * 15;
    const faceHeight = 110 + jawDrop * 15;

    const gradient = ctx.createRadialGradient(
      centerX, centerY - 10, 10,
      centerX, centerY, faceHeight
    );
    gradient.addColorStop(0, '#ffdbac');
    gradient.addColorStop(0.8, '#e0ac69');
    gradient.addColorStop(1, '#c68642');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, faceWidth, faceHeight, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyebrows
    const browY = centerY - 45 - browUp * 12 + browDown * 8;
    const browAngle = browDown * 0.3 - browUp * 0.1;

    ctx.strokeStyle = '#5d4e37';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';

    // Left eyebrow
    ctx.save();
    ctx.translate(centerX - 30, browY);
    ctx.rotate(-browAngle);
    ctx.beginPath();
    ctx.moveTo(-20, 0);
    ctx.quadraticCurveTo(0, -5 + browDown * 8, 20, 0);
    ctx.stroke();
    ctx.restore();

    // Right eyebrow
    ctx.save();
    ctx.translate(centerX + 30, browY);
    ctx.rotate(browAngle);
    ctx.beginPath();
    ctx.moveTo(-20, 0);
    ctx.quadraticCurveTo(0, -5 + browDown * 8, 20, 0);
    ctx.stroke();
    ctx.restore();

    // Eyes
    const eyeY = centerY - 20;
    const eyeOpenness = 1 - eyeSquint * 0.6 + eyeWide * 0.4;
    const eyeHeight = 12 * eyeOpenness;

    // Eye whites
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(centerX - 30, eyeY, 15, eyeHeight, 0, 0, Math.PI * 2);
    ctx.ellipse(centerX + 30, eyeY, 15, eyeHeight, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pupils
    ctx.fillStyle = '#3d2314';
    const pupilSize = Math.min(6, eyeHeight * 0.5);
    ctx.beginPath();
    ctx.arc(centerX - 30, eyeY, pupilSize, 0, Math.PI * 2);
    ctx.arc(centerX + 30, eyeY, pupilSize, 0, Math.PI * 2);
    ctx.fill();

    // Mouth
    const mouthY = centerY + 40 + jawDrop * 10;
    const mouthWidth = 30 + smile * 10 - frown * 5;
    const mouthCurve = smile * 15 - frown * 15;
    const mouthOpenAmount = mouthOpen * 20 + jawDrop * 10;

    ctx.fillStyle = '#c9544d';
    ctx.beginPath();

    if (mouthOpenAmount > 5) {
      // Open mouth
      ctx.ellipse(centerX, mouthY, mouthWidth, mouthOpenAmount / 2 + 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Teeth
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.rect(centerX - mouthWidth * 0.7, mouthY - mouthOpenAmount / 4, mouthWidth * 1.4, mouthOpenAmount / 3);
      ctx.fill();

      // Inner mouth
      ctx.fillStyle = '#2d1f1f';
      ctx.beginPath();
      ctx.ellipse(centerX, mouthY + 3, mouthWidth * 0.7, mouthOpenAmount / 3, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Closed mouth with curve
      ctx.strokeStyle = '#8b4513';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(centerX - mouthWidth, mouthY);
      ctx.quadraticCurveTo(centerX, mouthY + mouthCurve, centerX + mouthWidth, mouthY);
      ctx.stroke();
    }

  }, [finalBlendshapes]);

  const setPreset = (presetName: string) => {
    const newWeights = Object.fromEntries(EXPRESSIONS.map(e => [e.name, e.name === presetName ? 1 : 0]));
    setExpressionWeights(newWeights);
  };

  const randomMix = () => {
    const newWeights = Object.fromEntries(
      EXPRESSIONS.map(e => [e.name, Math.random() * 0.5])
    );
    setExpressionWeights(newWeights);
  };

  const reset = () => {
    setExpressionWeights(Object.fromEntries(EXPRESSIONS.map(e => [e.name, 0])));
  };

  return (
    <div className="card p-6">
      <h3 className="font-semibold mb-2">Expression Blending Mixer</h3>
      <p className="text-sm text-[var(--muted)] mb-6">
        Mix multiple expressions together. Real faces blend emotions - you can be
        happy-surprised or sad-angry. Blendshapes add linearly then clamp to [0,1].
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Face visualization */}
        <div>
          <canvas
            ref={canvasRef}
            width={250}
            height={280}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--card-bg-alt)]"
          />

          {/* Presets */}
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Presets</p>
            <div className="flex flex-wrap gap-2">
              {EXPRESSIONS.map(expr => (
                <button
                  key={expr.name}
                  onClick={() => setPreset(expr.name)}
                  className="px-3 py-1 rounded text-xs font-medium text-white"
                  style={{ backgroundColor: expr.color }}
                >
                  {expr.name}
                </button>
              ))}
              <button onClick={randomMix} className="badge">
                Random Mix
              </button>
              <button onClick={reset} className="badge">
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Mixer controls */}
        <div className="space-y-4">
          {/* Expression sliders */}
          <div className="p-4 bg-[var(--card-bg-alt)] rounded">
            <p className="font-medium text-sm mb-3">Expression Mix</p>
            {EXPRESSIONS.map(expr => (
              <div key={expr.name} className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: expr.color }}>{expr.name}</span>
                  <span className="font-mono">{((expressionWeights[expr.name] || 0) * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={expressionWeights[expr.name] || 0}
                  onChange={(e) => setExpressionWeights(prev => ({
                    ...prev,
                    [expr.name]: Number(e.target.value)
                  }))}
                  className="w-full"
                  style={{ accentColor: expr.color }}
                />
              </div>
            ))}
          </div>

          {/* Blendshape output */}
          <div className="p-4 bg-[var(--card-bg-alt)] rounded">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-sm">Final Blendshapes</span>
              <button
                onClick={() => setShowContributions(!showContributions)}
                className="text-xs text-[var(--muted)]"
              >
                {showContributions ? 'Hide' : 'Show'} Details
              </button>
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {ALL_BLENDSHAPES.filter(bs => finalBlendshapes[bs] > 0.01).map(bs => (
                <div key={bs} className="flex items-center gap-2 text-xs">
                  <span className="w-24 truncate">{bs}</span>
                  <div className="flex-1 h-2 bg-[var(--card-bg)] rounded overflow-hidden">
                    <div
                      className="h-full bg-[var(--accent)]"
                      style={{ width: `${(finalBlendshapes[bs] || 0) * 100}%` }}
                    />
                  </div>
                  <span className="font-mono w-10">{(finalBlendshapes[bs] * 100).toFixed(0)}%</span>
                </div>
              ))}
              {ALL_BLENDSHAPES.filter(bs => finalBlendshapes[bs] > 0.01).length === 0 && (
                <p className="text-[var(--muted)] text-center py-4">No active blendshapes</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className="mt-6 p-4 bg-[var(--card-bg-alt)] rounded">
        <p className="font-medium mb-2">How Expression Blending Works</p>
        <code className="text-xs block mb-2 font-mono">
          final_blendshape[i] = clamp(Σ(expression_weight × blendshape_value), 0, 1)
        </code>
        <p className="text-xs text-[var(--muted)]">
          Each expression defines target values for relevant blendshapes. When you mix expressions,
          the blendshape values add together (then clamp). This is how MetaHuman and ARKit
          create nuanced expressions from simple building blocks.
        </p>
      </div>
    </div>
  );
}

export default BlendshapeMixerDemo;
