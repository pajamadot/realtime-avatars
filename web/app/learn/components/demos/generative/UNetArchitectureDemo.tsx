'use client';

import { useState, useEffect, useRef } from 'react';

interface LayerInfo {
  name: string;
  channels: number;
  size: number;
  type: 'conv' | 'attention' | 'downsample' | 'upsample' | 'skip';
}

const ENCODER_LAYERS: LayerInfo[] = [
  { name: 'Input', channels: 4, size: 64, type: 'conv' },
  { name: 'Conv 1', channels: 320, size: 64, type: 'conv' },
  { name: 'Attn 1', channels: 320, size: 64, type: 'attention' },
  { name: 'Down 1', channels: 320, size: 32, type: 'downsample' },
  { name: 'Conv 2', channels: 640, size: 32, type: 'conv' },
  { name: 'Attn 2', channels: 640, size: 32, type: 'attention' },
  { name: 'Down 2', channels: 640, size: 16, type: 'downsample' },
  { name: 'Conv 3', channels: 1280, size: 16, type: 'conv' },
  { name: 'Attn 3', channels: 1280, size: 16, type: 'attention' },
  { name: 'Down 3', channels: 1280, size: 8, type: 'downsample' },
];

const MIDDLE_LAYERS: LayerInfo[] = [
  { name: 'Mid Conv', channels: 1280, size: 8, type: 'conv' },
  { name: 'Mid Attn', channels: 1280, size: 8, type: 'attention' },
  { name: 'Mid Conv 2', channels: 1280, size: 8, type: 'conv' },
];

const DECODER_LAYERS: LayerInfo[] = [
  { name: 'Up 1', channels: 1280, size: 16, type: 'upsample' },
  { name: 'Skip 3', channels: 1280, size: 16, type: 'skip' },
  { name: 'Conv 4', channels: 1280, size: 16, type: 'conv' },
  { name: 'Attn 4', channels: 1280, size: 16, type: 'attention' },
  { name: 'Up 2', channels: 640, size: 32, type: 'upsample' },
  { name: 'Skip 2', channels: 640, size: 32, type: 'skip' },
  { name: 'Conv 5', channels: 640, size: 32, type: 'conv' },
  { name: 'Up 3', channels: 320, size: 64, type: 'upsample' },
  { name: 'Skip 1', channels: 320, size: 64, type: 'skip' },
  { name: 'Conv 6', channels: 320, size: 64, type: 'conv' },
  { name: 'Output', channels: 4, size: 64, type: 'conv' },
];

const TYPE_COLORS: Record<string, string> = {
  conv: '#3498db',
  attention: '#9b59b6',
  downsample: '#e74c3c',
  upsample: '#2ecc71',
  skip: '#f1c40f',
};

export function UNetArchitectureDemo() {
  const [hoveredLayer, setHoveredLayer] = useState<LayerInfo | null>(null);
  const [activePhase, setActivePhase] = useState<'all' | 'encoder' | 'middle' | 'decoder'>('all');
  const [showSkipConnections, setShowSkipConnections] = useState(true);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  // Animation
  useEffect(() => {
    if (!isAnimating) return;

    const totalLayers = ENCODER_LAYERS.length + MIDDLE_LAYERS.length + DECODER_LAYERS.length;

    const animate = () => {
      setAnimationProgress(prev => {
        const next = prev + 0.02;
        if (next >= 1) {
          setIsAnimating(false);
          return 1;
        }
        return next;
      });
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isAnimating]);

  // Render U-Net
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const allLayers = [...ENCODER_LAYERS, ...MIDDLE_LAYERS, ...DECODER_LAYERS];
    const totalLayers = allLayers.length;
    const layerWidth = (width - 60) / totalLayers;
    const maxSize = 64;
    const verticalCenter = height / 2;

    // Calculate positions
    const positions = allLayers.map((layer, i) => {
      const x = 30 + i * layerWidth + layerWidth / 2;
      const heightScale = layer.size / maxSize;
      const boxHeight = 30 + heightScale * 120;
      const widthScale = Math.log2(layer.channels + 1) / Math.log2(1281);
      const boxWidth = 8 + widthScale * 20;

      return { x, y: verticalCenter, boxHeight, boxWidth, layer };
    });

    // Draw skip connections first (behind)
    if (showSkipConnections) {
      const skipPairs = [
        [2, totalLayers - 3], // Attn 1 -> Skip 1
        [5, totalLayers - 8], // Attn 2 -> Skip 2
        [8, totalLayers - 13], // Attn 3 -> Skip 3
      ];

      skipPairs.forEach(([fromIdx, toIdx]) => {
        if (fromIdx < positions.length && toIdx >= 0 && toIdx < positions.length) {
          const from = positions[fromIdx];
          const to = positions[toIdx];

          const animIdx = isAnimating ? Math.floor(animationProgress * totalLayers) : totalLayers;

          if (animIdx >= toIdx) {
            ctx.strokeStyle = 'rgba(241, 196, 15, 0.4)';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(from.x, from.y - from.boxHeight / 2 - 10);
            ctx.bezierCurveTo(
              from.x, from.y - from.boxHeight / 2 - 50,
              to.x, to.y - to.boxHeight / 2 - 50,
              to.x, to.y - to.boxHeight / 2 - 10
            );
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }
      });
    }

    // Draw connections between layers
    for (let i = 0; i < positions.length - 1; i++) {
      const from = positions[i];
      const to = positions[i + 1];

      const animIdx = isAnimating ? Math.floor(animationProgress * totalLayers) : totalLayers;
      const opacity = i < animIdx ? 1 : 0.2;

      ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 * opacity})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(from.x + from.boxWidth / 2, from.y);
      ctx.lineTo(to.x - to.boxWidth / 2, to.y);
      ctx.stroke();
    }

    // Draw layers
    positions.forEach((pos, i) => {
      const { x, y, boxHeight, boxWidth, layer } = pos;
      const isHovered = hoveredLayer === layer;
      const animIdx = isAnimating ? Math.floor(animationProgress * totalLayers) : totalLayers;
      const isActive = i <= animIdx;

      const inPhase =
        activePhase === 'all' ||
        (activePhase === 'encoder' && i < ENCODER_LAYERS.length) ||
        (activePhase === 'middle' && i >= ENCODER_LAYERS.length && i < ENCODER_LAYERS.length + MIDDLE_LAYERS.length) ||
        (activePhase === 'decoder' && i >= ENCODER_LAYERS.length + MIDDLE_LAYERS.length);

      const opacity = inPhase && isActive ? 1 : 0.3;

      // Layer box
      ctx.fillStyle = isHovered
        ? TYPE_COLORS[layer.type]
        : `rgba(${hexToRgb(TYPE_COLORS[layer.type])}, ${opacity})`;
      ctx.strokeStyle = isHovered ? '#ffffff' : 'rgba(255,255,255,0.3)';
      ctx.lineWidth = isHovered ? 2 : 1;

      ctx.beginPath();
      ctx.roundRect(x - boxWidth / 2, y - boxHeight / 2, boxWidth, boxHeight, 3);
      ctx.fill();
      ctx.stroke();

      // Size indicator at bottom
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = '8px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${layer.size}²`, x, y + boxHeight / 2 + 12);
    });

    // Phase labels
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';

    const encoderEndX = 30 + ENCODER_LAYERS.length * layerWidth;
    const middleEndX = encoderEndX + MIDDLE_LAYERS.length * layerWidth;

    ctx.fillText('Encoder (Compress)', (30 + encoderEndX) / 2, 20);
    ctx.fillText('Middle', (encoderEndX + middleEndX) / 2, 20);
    ctx.fillText('Decoder (Expand)', (middleEndX + width - 30) / 2, 20);

    // Draw U shape indicator
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(30, height - 30);
    ctx.lineTo(30, height - 60);
    ctx.quadraticCurveTo(width / 2, height - 100, width - 30, height - 60);
    ctx.lineTo(width - 30, height - 30);
    ctx.stroke();

  }, [hoveredLayer, activePhase, showSkipConnections, animationProgress, isAnimating]);

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
      : '255, 255, 255';
  };

  const handleCanvasMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = canvasRef.current!.width;

    const allLayers = [...ENCODER_LAYERS, ...MIDDLE_LAYERS, ...DECODER_LAYERS];
    const layerWidth = (width - 60) / allLayers.length;
    const idx = Math.floor((x - 30) / layerWidth);

    if (idx >= 0 && idx < allLayers.length) {
      setHoveredLayer(allLayers[idx]);
    } else {
      setHoveredLayer(null);
    }
  };

  return (
    <div className="card p-6">
      <h3 className="font-semibold mb-2">U-Net Architecture Explorer</h3>
      <p className="text-sm text-[var(--text-muted)] mb-6">
        The U-Net is the backbone of Stable Diffusion. It compresses the image (encoder),
        processes it (middle), then expands back (decoder). Skip connections preserve detail.
      </p>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Architecture visualization */}
        <div className="md:col-span-2">
          <canvas
            ref={canvasRef}
            width={600}
            height={300}
            onMouseMove={handleCanvasMove}
            onMouseLeave={() => setHoveredLayer(null)}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] cursor-crosshair"
          />

          {/* Controls */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => {
                setAnimationProgress(0);
                setIsAnimating(true);
              }}
              disabled={isAnimating}
              className="badge hover:border-[var(--border-strong)] disabled:opacity-50"
            >
              Animate Forward Pass
            </button>
            <button
              onClick={() => setShowSkipConnections(!showSkipConnections)}
              className={`badge ${showSkipConnections ? 'bg-[#f1c40f]/20' : ''}`}
            >
              Skip Connections
            </button>
            {(['all', 'encoder', 'middle', 'decoder'] as const).map(phase => (
              <button
                key={phase}
                onClick={() => setActivePhase(phase)}
                className={`badge capitalize ${activePhase === phase ? 'bg-[var(--accent)] text-white' : ''}`}
              >
                {phase}
              </button>
            ))}
          </div>
        </div>

        {/* Info panel */}
        <div className="space-y-4">
          {/* Hovered layer info */}
          <div className="p-4 bg-[var(--surface-2)] rounded">
            <p className="font-medium text-sm mb-2">
              {hoveredLayer ? hoveredLayer.name : 'Hover over a layer'}
            </p>
            {hoveredLayer && (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Type</span>
                  <span
                    className="px-2 py-0.5 rounded text-white"
                    style={{ backgroundColor: TYPE_COLORS[hoveredLayer.type] }}
                  >
                    {hoveredLayer.type}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Channels</span>
                  <span className="font-mono">{hoveredLayer.channels}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Spatial Size</span>
                  <span className="font-mono">{hoveredLayer.size}×{hoveredLayer.size}</span>
                </div>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="p-4 bg-[var(--surface-2)] rounded">
            <p className="font-medium text-sm mb-2">Layer Types</p>
            <div className="space-y-1">
              {Object.entries(TYPE_COLORS).map(([type, color]) => (
                <div key={type} className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
                  <span className="capitalize">{type}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key insight */}
          <div className="p-3 border border-[var(--border)] rounded text-sm">
            <p className="font-medium mb-1">Why U-Net?</p>
            <p className="text-xs text-[var(--text-muted)]">
              The "U" shape allows: (1) Compression to capture global context,
              (2) Skip connections to preserve fine detail, (3) Attention layers
              to incorporate conditioning (text/audio). Height = spatial resolution,
              Width = channel depth.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UNetArchitectureDemo;
