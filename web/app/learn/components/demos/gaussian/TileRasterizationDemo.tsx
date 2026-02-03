'use client';

import { useState, useEffect, useRef } from 'react';

interface Gaussian {
  x: number;
  y: number;
  radius: number;
  color: [number, number, number];
  opacity: number;
}

export function TileRasterizationDemo() {
  const [tileSize, setTileSize] = useState(64);
  const [gaussianCount, setGaussianCount] = useState(50);
  const [showTileGrid, setShowTileGrid] = useState(true);
  const [showGaussianBounds, setShowGaussianBounds] = useState(false);
  const [selectedTile, setSelectedTile] = useState<{ x: number; y: number } | null>(null);
  const [gaussians, setGaussians] = useState<Gaussian[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const width = 384;
  const height = 288;

  // Generate random gaussians
  useEffect(() => {
    const newGaussians: Gaussian[] = [];
    for (let i = 0; i < gaussianCount; i++) {
      newGaussians.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 10 + Math.random() * 30,
        color: [
          Math.floor(Math.random() * 255),
          Math.floor(Math.random() * 255),
          Math.floor(Math.random() * 255),
        ],
        opacity: 0.3 + Math.random() * 0.5,
      });
    }
    setGaussians(newGaussians);
  }, [gaussianCount]);

  // Check if gaussian overlaps with tile
  const gaussianInTile = (g: Gaussian, tileX: number, tileY: number): boolean => {
    const tileLeft = tileX * tileSize;
    const tileRight = tileLeft + tileSize;
    const tileTop = tileY * tileSize;
    const tileBottom = tileTop + tileSize;

    // Gaussian bounding box
    const gLeft = g.x - g.radius;
    const gRight = g.x + g.radius;
    const gTop = g.y - g.radius;
    const gBottom = g.y + g.radius;

    // Check overlap
    return !(gRight < tileLeft || gLeft > tileRight || gBottom < tileTop || gTop > tileBottom);
  };

  // Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    const tilesX = Math.ceil(width / tileSize);
    const tilesY = Math.ceil(height / tileSize);

    // Draw gaussians
    gaussians.forEach((g) => {
      const gradient = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, g.radius);
      gradient.addColorStop(0, `rgba(${g.color[0]}, ${g.color[1]}, ${g.color[2]}, ${g.opacity})`);
      gradient.addColorStop(1, `rgba(${g.color[0]}, ${g.color[1]}, ${g.color[2]}, 0)`);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(g.x, g.y, g.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw tile grid
    if (showTileGrid) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;

      for (let x = 0; x <= tilesX; x++) {
        ctx.beginPath();
        ctx.moveTo(x * tileSize, 0);
        ctx.lineTo(x * tileSize, height);
        ctx.stroke();
      }

      for (let y = 0; y <= tilesY; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * tileSize);
        ctx.lineTo(width, y * tileSize);
        ctx.stroke();
      }

      // Show gaussian count per tile
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (let tx = 0; tx < tilesX; tx++) {
        for (let ty = 0; ty < tilesY; ty++) {
          const count = gaussians.filter((g) => gaussianInTile(g, tx, ty)).length;
          const centerX = tx * tileSize + tileSize / 2;
          const centerY = ty * tileSize + tileSize / 2;

          const isSelected = selectedTile && selectedTile.x === tx && selectedTile.y === ty;

          if (isSelected) {
            ctx.fillStyle = 'rgba(255, 217, 61, 0.3)';
            ctx.fillRect(tx * tileSize, ty * tileSize, tileSize, tileSize);
          }

          ctx.fillStyle = count > 10 ? '#ff6b6b' : count > 5 ? '#ffd93d' : '#2ecc71';
          ctx.fillText(String(count), centerX, centerY);
        }
      }
    }

    // Draw gaussian bounds
    if (showGaussianBounds) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.setLineDash([2, 2]);
      gaussians.forEach((g) => {
        ctx.strokeRect(g.x - g.radius, g.y - g.radius, g.radius * 2, g.radius * 2);
      });
      ctx.setLineDash([]);
    }

    // Highlight selected tile's gaussians
    if (selectedTile) {
      ctx.strokeStyle = '#ffd93d';
      ctx.lineWidth = 2;
      gaussians.forEach((g) => {
        if (gaussianInTile(g, selectedTile.x, selectedTile.y)) {
          ctx.beginPath();
          ctx.arc(g.x, g.y, g.radius + 3, 0, Math.PI * 2);
          ctx.stroke();
        }
      });
    }
  }, [gaussians, tileSize, showTileGrid, showGaussianBounds, selectedTile]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const tileX = Math.floor(x / tileSize);
    const tileY = Math.floor(y / tileSize);
    setSelectedTile({ x: tileX, y: tileY });
  };

  const tilesX = Math.ceil(width / tileSize);
  const tilesY = Math.ceil(height / tileSize);
  const totalTiles = tilesX * tilesY;

  const selectedCount = selectedTile
    ? gaussians.filter((g) => gaussianInTile(g, selectedTile.x, selectedTile.y)).length
    : 0;

  return (
    <div className="card p-6">
      <h3 className="font-semibold mb-2">Tile-Based Rasterization</h3>
      <p className="text-sm text-[var(--muted)] mb-6">
        3DGS uses tile-based rasterization for parallelization. Each tile processes only gaussians
        that overlap it. Click a tile to see which gaussians it needs to render.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Canvas */}
        <div>
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            onClick={handleCanvasClick}
            className="w-full rounded-lg border border-[var(--border)] cursor-pointer"
          />

          {/* Toggles */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setShowTileGrid(!showTileGrid)}
              className={`badge ${showTileGrid ? 'bg-[var(--accent)]/20' : ''}`}
            >
              Tile Grid
            </button>
            <button
              onClick={() => setShowGaussianBounds(!showGaussianBounds)}
              className={`badge ${showGaussianBounds ? 'bg-[var(--accent)]/20' : ''}`}
            >
              Bounds
            </button>
            <button
              onClick={() => setGaussians([...gaussians])}
              className="badge"
            >
              Regenerate
            </button>
          </div>

          {/* Legend */}
          <div className="mt-3 flex flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-1">
              <span className="text-[#2ecc71]">0-5</span>
              <span className="text-[var(--muted)]">Low load</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[#ffd93d]">6-10</span>
              <span className="text-[var(--muted)]">Medium load</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[#ff6b6b]">11+</span>
              <span className="text-[var(--muted)]">High load</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <div className="p-4 bg-[var(--card-bg-alt)] rounded">
            <div className="flex justify-between text-sm mb-2">
              <span>Tile Size</span>
              <span className="font-mono">{tileSize}px</span>
            </div>
            <input
              type="range"
              min={32}
              max={128}
              step={16}
              value={tileSize}
              onChange={(e) => setTileSize(Number(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-[var(--muted)] mt-1">
              {totalTiles} tiles ({tilesX} × {tilesY})
            </p>
          </div>

          <div className="p-4 bg-[var(--card-bg-alt)] rounded">
            <div className="flex justify-between text-sm mb-2">
              <span>Gaussian Count</span>
              <span className="font-mono">{gaussianCount}</span>
            </div>
            <input
              type="range"
              min={10}
              max={200}
              step={10}
              value={gaussianCount}
              onChange={(e) => setGaussianCount(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {selectedTile && (
            <div className="p-4 bg-[#ffd93d]/10 border border-[#ffd93d]/30 rounded">
              <p className="font-medium text-sm mb-2">
                Selected Tile ({selectedTile.x}, {selectedTile.y})
              </p>
              <p className="text-sm text-[var(--muted)]">
                This tile processes <span className="font-mono font-bold">{selectedCount}</span> gaussians.
              </p>
            </div>
          )}

          <div className="p-4 bg-[var(--card-bg-alt)] rounded">
            <p className="font-medium text-sm mb-2">How It Works</p>
            <ol className="text-xs text-[var(--muted)] space-y-1">
              <li>1. Project 3D gaussians to 2D screen space</li>
              <li>2. Compute each gaussian's bounding box</li>
              <li>3. Assign gaussians to overlapping tiles</li>
              <li>4. Each tile sorts its gaussians by depth</li>
              <li>5. GPU threads process tiles in parallel</li>
            </ol>
          </div>

          <div className="p-3 border border-[var(--border)] rounded text-sm">
            <p className="font-medium mb-1">Performance Impact</p>
            <p className="text-xs text-[var(--muted)]">
              Smaller tiles = more parallelism but more overhead per gaussian.
              Larger tiles = less overhead but uneven workload distribution.
              16×16 is typical for modern GPUs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TileRasterizationDemo;
