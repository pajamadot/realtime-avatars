'use client';

import { useState, useEffect, useRef } from 'react';

export function CFGStrengthDemo() {
  const [cfgScale, setCfgScale] = useState(7.5);
  const [prompt, setPrompt] = useState<'smile' | 'neutral' | 'surprised'>('smile');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Render demo showing CFG effect on generation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    // Draw three comparison panels
    const panelWidth = width / 3;

    const cfgValues = [1.0, cfgScale, 15.0];
    const labels = ['CFG = 1.0', `CFG = ${cfgScale.toFixed(1)}`, 'CFG = 15.0'];

    cfgValues.forEach((cfg, i) => {
      const x = i * panelWidth;

      // Panel background
      ctx.fillStyle = i === 1 ? 'rgba(46, 204, 113, 0.1)' : 'rgba(255,255,255,0.05)';
      ctx.fillRect(x + 5, 5, panelWidth - 10, height - 30);

      // Draw simplified face with expression controlled by CFG
      const centerX = x + panelWidth / 2;
      const centerY = height / 2 - 10;
      const faceRadius = 45;

      // Calculate expression intensity based on CFG
      // Low CFG = blurry/weak expression, High CFG = oversaturated/artifacts
      const expressionStrength = Math.min(1, cfg / 10);
      const artifactLevel = Math.max(0, (cfg - 10) / 5);

      // Face
      const faceColor = cfg < 3 ? 'rgba(255, 200, 160, 0.5)' : 'rgb(255, 200, 160)';
      ctx.fillStyle = faceColor;
      ctx.beginPath();
      ctx.arc(centerX, centerY, faceRadius, 0, Math.PI * 2);
      ctx.fill();

      // Add blur effect for low CFG
      if (cfg < 3) {
        ctx.fillStyle = 'rgba(255, 200, 160, 0.3)';
        ctx.beginPath();
        ctx.arc(centerX, centerY, faceRadius + 5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Add artifacts for high CFG
      if (artifactLevel > 0) {
        ctx.fillStyle = `rgba(255, 100, 100, ${artifactLevel * 0.3})`;
        for (let j = 0; j < 8 * artifactLevel; j++) {
          const ax = centerX + (Math.random() - 0.5) * faceRadius * 2;
          const ay = centerY + (Math.random() - 0.5) * faceRadius * 2;
          ctx.beginPath();
          ctx.arc(ax, ay, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Eyes
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(centerX - 15, centerY - 10, 8, 5, 0, 0, Math.PI * 2);
      ctx.ellipse(centerX + 15, centerY - 10, 8, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#3d2314';
      ctx.beginPath();
      ctx.arc(centerX - 15, centerY - 10, 3, 0, Math.PI * 2);
      ctx.arc(centerX + 15, centerY - 10, 3, 0, Math.PI * 2);
      ctx.fill();

      // Mouth based on prompt and expression strength
      ctx.strokeStyle = '#c9544d';
      ctx.lineWidth = 2 + expressionStrength;
      ctx.beginPath();

      if (prompt === 'smile') {
        const smileIntensity = 0.2 + expressionStrength * 0.5;
        ctx.arc(centerX, centerY + 5, 15, smileIntensity * Math.PI, (1 - smileIntensity) * Math.PI);
      } else if (prompt === 'surprised') {
        const mouthHeight = 5 + expressionStrength * 10;
        ctx.ellipse(centerX, centerY + 15, 8, mouthHeight, 0, 0, Math.PI * 2);
      } else {
        ctx.moveTo(centerX - 12, centerY + 15);
        ctx.lineTo(centerX + 12, centerY + 15);
      }
      ctx.stroke();

      // Eyebrows for surprised
      if (prompt === 'surprised') {
        ctx.strokeStyle = '#5d4037';
        ctx.lineWidth = 2;
        const browRaise = expressionStrength * 8;
        ctx.beginPath();
        ctx.moveTo(centerX - 22, centerY - 22 - browRaise);
        ctx.quadraticCurveTo(centerX - 15, centerY - 26 - browRaise, centerX - 8, centerY - 22 - browRaise);
        ctx.moveTo(centerX + 8, centerY - 22 - browRaise);
        ctx.quadraticCurveTo(centerX + 15, centerY - 26 - browRaise, centerX + 22, centerY - 22 - browRaise);
        ctx.stroke();
      }

      // Label
      ctx.fillStyle = i === 1 ? '#2ecc71' : 'rgba(255,255,255,0.6)';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(labels[i], centerX, height - 10);

      // Quality indicator
      const quality =
        cfg < 3 ? 'Blurry' : cfg < 5 ? 'Weak' : cfg > 12 ? 'Artifacts' : cfg > 9 ? 'Saturated' : 'Good';
      ctx.fillStyle =
        quality === 'Good' ? '#2ecc71' : quality === 'Artifacts' ? '#e74c3c' : '#f1c40f';
      ctx.font = '9px sans-serif';
      ctx.fillText(quality, centerX, 18);
    });

    // Draw CFG scale bar
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, height - 25);
    ctx.lineTo(width - 20, height - 25);
    ctx.stroke();

  }, [cfgScale, prompt]);

  return (
    <div className="card p-6">
      <h3 className="font-semibold mb-2">Classifier-Free Guidance (CFG)</h3>
      <p className="text-sm text-[var(--text-muted)] mb-6">
        CFG controls how strongly the model follows the conditioning (audio/text).
        Low values = blurry/generic, High values = artifacts/oversaturation. Sweet spot: 5-9.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Canvas */}
        <div>
          <canvas
            ref={canvasRef}
            width={400}
            height={200}
            className="w-full rounded-lg border border-[var(--border)]"
          />

          {/* Prompt selector */}
          <div className="mt-4 flex gap-2">
            {(['neutral', 'smile', 'surprised'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPrompt(p)}
                className={`flex-1 py-2 rounded font-medium text-sm transition-colors capitalize ${
                  prompt === p ? 'bg-[var(--accent)] text-white' : 'bg-[var(--surface-2)]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <div className="p-4 bg-[var(--surface-2)] rounded">
            <div className="flex justify-between text-sm mb-2">
              <span>CFG Scale</span>
              <span className="font-mono">{cfgScale.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min={1}
              max={15}
              step={0.5}
              value={cfgScale}
              onChange={(e) => setCfgScale(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-[var(--text-muted)] mt-1">
              <span>Ignore prompt</span>
              <span>Follow strictly</span>
            </div>
          </div>

          <div className="p-4 bg-[var(--surface-2)] rounded">
            <p className="font-medium text-sm mb-2">The Math</p>
            <code className="text-xs block font-mono text-[var(--text-muted)] mb-2">
              output = uncond + cfg * (cond - uncond)
            </code>
            <p className="text-xs text-[var(--text-muted)]">
              CFG scales the difference between conditioned and unconditioned predictions.
              Higher values amplify prompt influence but can overshoot.
            </p>
          </div>

          <div className="p-4 bg-[var(--surface-2)] rounded">
            <p className="font-medium text-sm mb-2">Recommended Values</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-[var(--surface-0)] rounded">
                <span className="font-medium">Stable Diffusion:</span>
                <span className="text-[var(--text-muted)]"> 7-8</span>
              </div>
              <div className="p-2 bg-[var(--surface-0)] rounded">
                <span className="font-medium">SDXL:</span>
                <span className="text-[var(--text-muted)]"> 5-7</span>
              </div>
              <div className="p-2 bg-[var(--surface-0)] rounded">
                <span className="font-medium">Face gen:</span>
                <span className="text-[var(--text-muted)]"> 3-5</span>
              </div>
              <div className="p-2 bg-[var(--surface-0)] rounded">
                <span className="font-medium">Artistic:</span>
                <span className="text-[var(--text-muted)]"> 10-12</span>
              </div>
            </div>
          </div>

          <div className="p-3 border border-[var(--border)] rounded text-sm">
            <p className="font-medium mb-1">For Avatars</p>
            <p className="text-xs text-[var(--text-muted)]">
              Talking head models typically use CFG 3-6. Lower values preserve identity better,
              higher values give more pronounced expressions but risk artifacts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CFGStrengthDemo;
