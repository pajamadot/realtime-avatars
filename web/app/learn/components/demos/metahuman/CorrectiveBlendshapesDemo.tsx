'use client';

import { useState, useEffect, useRef } from 'react';

interface Blendshape {
  id: string;
  name: string;
  value: number;
}

export function CorrectiveBlendshapesDemo() {
  const [blendshapeA, setBlendshapeA] = useState(0);
  const [blendshapeB, setBlendshapeB] = useState(0);
  const [correctivesEnabled, setCorrectivesEnabled] = useState(true);
  const [showCombination, setShowCombination] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const width = 350;
  const height = 300;

  // Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const faceRadius = 70;

    // Face base
    const gradient = ctx.createRadialGradient(centerX, centerY - 10, 10, centerX, centerY, faceRadius);
    gradient.addColorStop(0, '#ffdbac');
    gradient.addColorStop(0.8, '#e0ac69');
    gradient.addColorStop(1, '#c68642');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, faceRadius * 0.85, faceRadius, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eye calculations
    const eyeY = centerY - 15;
    const eyeSpacing = 25;

    // Blendshape A = Blink (eye close)
    // Blendshape B = Look Down
    // Combined without corrective = Double deformation (eyes go too far down)
    // Combined with corrective = Natural blink while looking down

    const blinkAmount = blendshapeA;
    const lookDownAmount = blendshapeB;

    // Calculate eye deformation
    let eyeOpenness = 1 - blinkAmount * 0.9;
    let eyeVerticalOffset = lookDownAmount * 15;

    // The problem: when combining blink + look down, deformations add up incorrectly
    // This is where corrective blendshapes come in
    const combinedEffect = blinkAmount * lookDownAmount;

    if (!correctivesEnabled && combinedEffect > 0) {
      // Without corrective: both deformations stack, creating artifact
      eyeVerticalOffset += combinedEffect * 10; // Extra unwanted offset
      eyeOpenness *= (1 - combinedEffect * 0.3); // Eyes close too much
    }

    // With corrective: the corrective shape counteracts the artifact
    // (Corrective is automatically triggered when both A and B are active)

    // Draw eyes
    ctx.fillStyle = '#ffffff';
    const eyeHeight = Math.max(2, 8 * eyeOpenness);

    // Left eye
    ctx.beginPath();
    ctx.ellipse(
      centerX - eyeSpacing,
      eyeY + eyeVerticalOffset,
      10,
      eyeHeight,
      0, 0, Math.PI * 2
    );
    ctx.fill();

    // Right eye
    ctx.beginPath();
    ctx.ellipse(
      centerX + eyeSpacing,
      eyeY + eyeVerticalOffset,
      10,
      eyeHeight,
      0, 0, Math.PI * 2
    );
    ctx.fill();

    // Pupils (if eyes open enough)
    if (eyeOpenness > 0.3) {
      ctx.fillStyle = '#3d2314';
      const pupilSize = 3 * eyeOpenness;
      const pupilOffset = lookDownAmount * 3;

      ctx.beginPath();
      ctx.arc(centerX - eyeSpacing, eyeY + eyeVerticalOffset + pupilOffset, pupilSize, 0, Math.PI * 2);
      ctx.arc(centerX + eyeSpacing, eyeY + eyeVerticalOffset + pupilOffset, pupilSize, 0, Math.PI * 2);
      ctx.fill();
    }

    // Eyelids
    ctx.strokeStyle = '#8d5524';
    ctx.lineWidth = 2;

    // Upper eyelid
    const lidOffset = blinkAmount * 8;
    ctx.beginPath();
    ctx.moveTo(centerX - eyeSpacing - 12, eyeY + eyeVerticalOffset);
    ctx.quadraticCurveTo(
      centerX - eyeSpacing,
      eyeY + eyeVerticalOffset - 10 + lidOffset,
      centerX - eyeSpacing + 12,
      eyeY + eyeVerticalOffset
    );
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centerX + eyeSpacing - 12, eyeY + eyeVerticalOffset);
    ctx.quadraticCurveTo(
      centerX + eyeSpacing,
      eyeY + eyeVerticalOffset - 10 + lidOffset,
      centerX + eyeSpacing + 12,
      eyeY + eyeVerticalOffset
    );
    ctx.stroke();

    // Nose
    ctx.strokeStyle = 'rgba(150, 100, 80, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - 5);
    ctx.lineTo(centerX - 8, centerY + 20);
    ctx.lineTo(centerX + 8, centerY + 20);
    ctx.stroke();

    // Mouth
    ctx.strokeStyle = '#c9544d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY + 35, 15, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();

    // Warning indicator for artifact
    if (!correctivesEnabled && combinedEffect > 0.3) {
      ctx.strokeStyle = '#e74c3c';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(centerX, eyeY + eyeVerticalOffset, 35, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#e74c3c';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Artifact!', centerX, eyeY + eyeVerticalOffset + 50);
    }

    // Labels
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Blink: ${(blendshapeA * 100).toFixed(0)}%`, 10, 20);
    ctx.fillText(`Look Down: ${(blendshapeB * 100).toFixed(0)}%`, 10, 35);
    ctx.fillText(`Correctives: ${correctivesEnabled ? 'ON' : 'OFF'}`, 10, 50);

  }, [blendshapeA, blendshapeB, correctivesEnabled]);

  return (
    <div className="card p-6">
      <h3 className="font-semibold mb-2">Corrective Blendshapes</h3>
      <p className="text-sm text-[var(--text-muted)] mb-6">
        When multiple blendshapes activate together, their deformations can combine incorrectly.
        Corrective blendshapes fix these artifacts automatically.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Canvas */}
        <div>
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="w-full rounded-lg border border-[var(--border)]"
          />

          {/* Toggle */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setCorrectivesEnabled(!correctivesEnabled)}
              className={`flex-1 py-2 rounded font-medium text-sm transition-colors ${
                correctivesEnabled
                  ? 'bg-[#2ecc71] text-white'
                  : 'bg-[#e74c3c] text-white'
              }`}
            >
              Correctives: {correctivesEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          <p className="mt-2 text-xs text-[var(--text-muted)] text-center">
            Toggle correctives and combine both sliders to see the artifact
          </p>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <div className="p-4 bg-[var(--surface-2)] rounded">
            <div className="flex justify-between text-sm mb-2">
              <span>Blendshape A: Blink</span>
              <span className="font-mono">{(blendshapeA * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={blendshapeA}
              onChange={(e) => setBlendshapeA(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="p-4 bg-[var(--surface-2)] rounded">
            <div className="flex justify-between text-sm mb-2">
              <span>Blendshape B: Look Down</span>
              <span className="font-mono">{(blendshapeB * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={blendshapeB}
              onChange={(e) => setBlendshapeB(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="p-4 bg-[var(--surface-2)] rounded">
            <p className="font-medium text-sm mb-2">How It Works</p>
            <div className="space-y-2 text-xs text-[var(--text-muted)]">
              <p>
                <span className="font-medium text-[var(--foreground)]">Problem:</span>{' '}
                Blink moves eyelids down. Look down also moves eye region down.
                Combined = double deformation artifact.
              </p>
              <p>
                <span className="font-medium text-[var(--foreground)]">Solution:</span>{' '}
                Corrective shape (blink_lookDown) activates when both are {">"} 0,
                counteracting the excess deformation.
              </p>
            </div>
          </div>

          <div className="p-4 bg-[var(--surface-2)] rounded">
            <p className="font-medium text-sm mb-2">Corrective Formula</p>
            <code className="text-xs block font-mono text-[var(--text-muted)]">
              corrective_weight = blendA × blendB
            </code>
            <p className="text-xs text-[var(--text-muted)] mt-2">
              The corrective is sculpted to exactly cancel the artifact when both blendshapes
              are at 100%, and scales proportionally for partial activations.
            </p>
          </div>

          <div className="p-3 border border-[var(--border)] rounded text-sm">
            <p className="font-medium mb-1">MetaHuman Usage</p>
            <p className="text-xs text-[var(--text-muted)]">
              MetaHuman has hundreds of corrective shapes for common expression combinations:
              smile+blink, frown+jawOpen, etc. These are pre-computed and activate automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CorrectiveBlendshapesDemo;
