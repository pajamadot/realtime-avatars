'use client';

import { useState, useEffect, useRef } from 'react';

interface WrinkleRegion {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  driver: string;
  angle: number;
}

const WRINKLE_REGIONS: WrinkleRegion[] = [
  { id: 'forehead', name: 'Forehead', x: 75, y: 30, width: 100, height: 25, driver: 'browRaise', angle: 0 },
  { id: 'glabella', name: 'Glabella', x: 110, y: 55, width: 30, height: 20, driver: 'browFurrow', angle: 90 },
  { id: 'crowsL', name: "Crow's Feet L", x: 40, y: 80, width: 25, height: 30, driver: 'squint', angle: 45 },
  { id: 'crowsR', name: "Crow's Feet R", x: 185, y: 80, width: 25, height: 30, driver: 'squint', angle: -45 },
  { id: 'nasolabialL', name: 'Nasolabial L', x: 65, y: 130, width: 20, height: 40, driver: 'smile', angle: -30 },
  { id: 'nasolabialR', name: 'Nasolabial R', x: 165, y: 130, width: 20, height: 40, driver: 'smile', angle: 30 },
  { id: 'lipLines', name: 'Lip Lines', x: 100, y: 165, width: 50, height: 15, driver: 'pucker', angle: 90 },
];

export function WrinkleMapDemo() {
  const [expressions, setExpressions] = useState({
    browRaise: 0,
    browFurrow: 0,
    squint: 0,
    smile: 0,
    pucker: 0,
  });
  const [showRegions, setShowRegions] = useState(true);
  const [wrinkleStrength, setWrinkleStrength] = useState(1.0);
  const [preset, setPreset] = useState<'neutral' | 'happy' | 'surprised' | 'angry'>('neutral');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Apply presets
  useEffect(() => {
    const presets = {
      neutral: { browRaise: 0, browFurrow: 0, squint: 0, smile: 0, pucker: 0 },
      happy: { browRaise: 0.2, browFurrow: 0, squint: 0.6, smile: 0.8, pucker: 0 },
      surprised: { browRaise: 0.9, browFurrow: 0, squint: 0, smile: 0.3, pucker: 0.2 },
      angry: { browRaise: 0, browFurrow: 0.8, squint: 0.3, smile: 0, pucker: 0.1 },
    };
    setExpressions(presets[preset]);
  }, [preset]);

  // Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    // Draw face base
    const centerX = width / 2;
    const centerY = height / 2;

    // Face shape
    const gradient = ctx.createRadialGradient(centerX, centerY - 20, 10, centerX, centerY, 100);
    gradient.addColorStop(0, '#ffdbac');
    gradient.addColorStop(0.7, '#e0ac69');
    gradient.addColorStop(1, '#c68642');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, 90, 110, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#ffffff';
    const eyeSquint = expressions.squint * 0.3;
    ctx.beginPath();
    ctx.ellipse(centerX - 30, centerY - 20, 12, 8 - eyeSquint * 5, 0, 0, Math.PI * 2);
    ctx.ellipse(centerX + 30, centerY - 20, 12, 8 - eyeSquint * 5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#3d2314';
    ctx.beginPath();
    ctx.arc(centerX - 30, centerY - 20, 4, 0, Math.PI * 2);
    ctx.arc(centerX + 30, centerY - 20, 4, 0, Math.PI * 2);
    ctx.fill();

    // Eyebrows
    ctx.strokeStyle = '#5d4037';
    ctx.lineWidth = 3;
    const browRaise = expressions.browRaise * 8;
    const browFurrow = expressions.browFurrow * 5;

    ctx.beginPath();
    ctx.moveTo(centerX - 50, centerY - 40 - browRaise + browFurrow);
    ctx.quadraticCurveTo(
      centerX - 30, centerY - 48 - browRaise,
      centerX - 15, centerY - 38 - browRaise + browFurrow * 0.5
    );
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centerX + 50, centerY - 40 - browRaise + browFurrow);
    ctx.quadraticCurveTo(
      centerX + 30, centerY - 48 - browRaise,
      centerX + 15, centerY - 38 - browRaise + browFurrow * 0.5
    );
    ctx.stroke();

    // Nose
    ctx.strokeStyle = 'rgba(150, 100, 80, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - 10);
    ctx.lineTo(centerX - 10, centerY + 20);
    ctx.lineTo(centerX + 10, centerY + 20);
    ctx.stroke();

    // Mouth
    ctx.strokeStyle = '#c9544d';
    ctx.lineWidth = 3;
    const smileAmount = expressions.smile;
    const puckerAmount = expressions.pucker;

    ctx.beginPath();
    if (puckerAmount > 0.5) {
      ctx.ellipse(centerX, centerY + 45, 8 - puckerAmount * 3, 6, 0, 0, Math.PI * 2);
    } else {
      ctx.arc(centerX, centerY + 35 + smileAmount * 5, 25 - puckerAmount * 10,
              (0.1 + smileAmount * 0.2) * Math.PI,
              (0.9 - smileAmount * 0.2) * Math.PI);
    }
    ctx.stroke();

    // Draw wrinkle maps
    WRINKLE_REGIONS.forEach(region => {
      const driverValue = expressions[region.driver as keyof typeof expressions] * wrinkleStrength;
      if (driverValue < 0.1) return;

      ctx.save();
      ctx.translate(region.x + region.width / 2, region.y + region.height / 2);
      ctx.rotate(region.angle * Math.PI / 180);

      // Draw wrinkle lines
      ctx.strokeStyle = `rgba(139, 90, 43, ${driverValue * 0.6})`;
      ctx.lineWidth = 1;

      const lineCount = Math.ceil(driverValue * 5);
      const spacing = region.height / (lineCount + 1);

      for (let i = 0; i < lineCount; i++) {
        const y = -region.height / 2 + spacing * (i + 1);
        const amplitude = driverValue * 2;

        ctx.beginPath();
        ctx.moveTo(-region.width / 2, y);
        for (let x = -region.width / 2; x <= region.width / 2; x += 5) {
          const wave = Math.sin(x * 0.3) * amplitude;
          ctx.lineTo(x, y + wave);
        }
        ctx.stroke();
      }

      ctx.restore();

      // Show region overlay
      if (showRegions && driverValue > 0.1) {
        ctx.strokeStyle = `rgba(255, 107, 107, ${driverValue})`;
        ctx.setLineDash([3, 3]);
        ctx.strokeRect(region.x, region.y, region.width, region.height);
        ctx.setLineDash([]);

        ctx.fillStyle = 'rgba(255, 107, 107, 0.8)';
        ctx.font = '8px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(region.name, region.x + region.width / 2, region.y - 3);
      }
    });

  }, [expressions, showRegions, wrinkleStrength]);

  return (
    <div className="card p-6">
      <h3 className="font-semibold mb-2">Wrinkle Map System</h3>
      <p className="text-sm text-[var(--text-muted)] mb-6">
        MetaHuman uses wrinkle maps for facial detail. Each expression drives specific wrinkle regions
        that blend on top of the base skin texture.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Canvas */}
        <div>
          <canvas
            ref={canvasRef}
            width={250}
            height={280}
            className="w-full rounded-lg border border-[var(--border)]"
          />

          {/* Presets */}
          <div className="mt-4 grid grid-cols-4 gap-2">
            {(['neutral', 'happy', 'surprised', 'angry'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPreset(p)}
                className={`py-2 rounded font-medium text-xs capitalize transition-colors ${
                  preset === p ? 'bg-[var(--accent)] text-white' : 'bg-[var(--surface-2)]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Toggle */}
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => setShowRegions(!showRegions)}
              className={`badge ${showRegions ? 'bg-[var(--accent)]/20' : ''}`}
            >
              {showRegions ? 'Hide Regions' : 'Show Regions'}
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <div className="p-4 bg-[var(--surface-2)] rounded">
            <div className="flex justify-between text-sm mb-2">
              <span>Global Wrinkle Strength</span>
              <span className="font-mono">{wrinkleStrength.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min={0}
              max={2}
              step={0.1}
              value={wrinkleStrength}
              onChange={(e) => setWrinkleStrength(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="p-4 bg-[var(--surface-2)] rounded space-y-3">
            <p className="font-medium text-sm">Expression Drivers</p>
            {Object.entries(expressions).map(([key, value]) => (
              <div key={key}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                  <span className="font-mono">{(value * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={value}
                  onChange={(e) => setExpressions(prev => ({
                    ...prev,
                    [key]: Number(e.target.value)
                  }))}
                  className="w-full"
                />
              </div>
            ))}
          </div>

          <div className="p-3 border border-[var(--border)] rounded text-sm">
            <p className="font-medium mb-1">Texture Layers</p>
            <p className="text-xs text-[var(--text-muted)]">
              MetaHuman blends multiple texture layers: base albedo, normal map, roughness,
              and wrinkle maps. Wrinkle maps are driven by blendshape values, creating
              realistic skin deformation during expressions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WrinkleMapDemo;
