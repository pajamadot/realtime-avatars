'use client';

import { useState, useEffect, useRef } from 'react';

interface Splat {
  id: number;
  x: number;
  y: number;
  z: number;
  color: [number, number, number];
  opacity: number;
  size: number;
}

export function DepthSortingDemo() {
  const [splats, setSplats] = useState<Splat[]>([]);
  const [sortingEnabled, setSortingEnabled] = useState(true);
  const [showDepth, setShowDepth] = useState(false);
  const [isSorting, setIsSorting] = useState(false);
  const [sortStep, setSortStep] = useState(0);
  const [sortingIndices, setSortingIndices] = useState<number[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const width = 400;
  const height = 300;

  // Initialize splats
  useEffect(() => {
    const initial: Splat[] = [];
    const colors: [number, number, number][] = [
      [231, 76, 60],   // Red
      [46, 204, 113],  // Green
      [52, 152, 219],  // Blue
      [241, 196, 15],  // Yellow
      [155, 89, 182],  // Purple
      [230, 126, 34],  // Orange
      [26, 188, 156],  // Teal
      [236, 240, 241], // White
    ];

    for (let i = 0; i < 8; i++) {
      initial.push({
        id: i,
        x: 80 + Math.random() * 240,
        y: 60 + Math.random() * 180,
        z: Math.random(),
        color: colors[i],
        opacity: 0.7,
        size: 40 + Math.random() * 30,
      });
    }
    setSplats(initial);
    setSortingIndices(initial.map((_, i) => i));
  }, []);

  // Animate sorting
  useEffect(() => {
    if (!isSorting) return;

    const timer = setTimeout(() => {
      // Bubble sort one step
      let swapped = false;
      const newIndices = [...sortingIndices];

      for (let i = 0; i < newIndices.length - 1 - sortStep; i++) {
        const splatA = splats[newIndices[i]];
        const splatB = splats[newIndices[i + 1]];

        // Sort far to near (larger z = further)
        if (splatA.z < splatB.z) {
          [newIndices[i], newIndices[i + 1]] = [newIndices[i + 1], newIndices[i]];
          swapped = true;
        }
      }

      setSortingIndices(newIndices);

      if (!swapped || sortStep >= splats.length - 1) {
        setIsSorting(false);
        setSortStep(0);
      } else {
        setSortStep(s => s + 1);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [isSorting, sortStep, sortingIndices, splats]);

  // Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    // Get render order
    const renderOrder = sortingEnabled ? sortingIndices : splats.map((_, i) => i);

    // Draw splats
    renderOrder.forEach((idx, renderIdx) => {
      const splat = splats[idx];
      if (!splat) return;

      const depthFade = showDepth ? 0.3 + splat.z * 0.7 : 1;

      // Draw splat as gradient circle
      const gradient = ctx.createRadialGradient(
        splat.x, splat.y, 0,
        splat.x, splat.y, splat.size
      );

      const [r, g, b] = splat.color;
      gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${splat.opacity * depthFade})`);
      gradient.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, ${splat.opacity * 0.5 * depthFade})`);
      gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(splat.x, splat.y, splat.size, 0, Math.PI * 2);
      ctx.fill();

      // Draw depth indicator
      if (showDepth) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`z=${splat.z.toFixed(2)}`, splat.x, splat.y);
      }

      // Highlight during sorting
      if (isSorting) {
        ctx.strokeStyle = '#ffd93d';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(splat.x, splat.y, splat.size + 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });

    // Draw render order indicator
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Render order: ${sortingEnabled ? 'Back-to-front' : 'Unsorted'}`, 10, 20);

    // Draw sorting progress
    if (isSorting) {
      ctx.fillText(`Sorting pass: ${sortStep + 1}`, 10, 35);
    }

  }, [splats, sortingIndices, sortingEnabled, showDepth, isSorting, sortStep]);

  const shuffleSplats = () => {
    setSplats(prev => prev.map(s => ({ ...s, z: Math.random() })));
    setSortingIndices(splats.map((_, i) => i));
    setSortStep(0);
  };

  const startSort = () => {
    setSortStep(0);
    setIsSorting(true);
  };

  return (
    <div className="card p-6">
      <h3 className="font-semibold mb-2">Depth Sorting for Alpha Blending</h3>
      <p className="text-sm text-[var(--muted)] mb-6">
        Transparent objects must be rendered back-to-front for correct blending.
        3DGS sorts Gaussians by depth before compositing. Watch the sorting process.
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

          {/* Controls */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={shuffleSplats}
              className="flex-1 py-2 rounded font-medium text-sm bg-[var(--card-bg-alt)]"
            >
              Shuffle Depths
            </button>
            <button
              onClick={startSort}
              disabled={isSorting}
              className="flex-1 py-2 rounded font-medium text-sm bg-[var(--accent)] text-white disabled:opacity-50"
            >
              {isSorting ? 'Sorting...' : 'Sort'}
            </button>
          </div>

          <div className="mt-3 flex gap-2">
            <button
              onClick={() => setSortingEnabled(!sortingEnabled)}
              className={`badge ${sortingEnabled ? 'bg-[#2ecc71]/20 text-[#2ecc71]' : 'bg-[#e74c3c]/20 text-[#e74c3c]'}`}
            >
              {sortingEnabled ? 'Sorting ON' : 'Sorting OFF'}
            </button>
            <button
              onClick={() => setShowDepth(!showDepth)}
              className={`badge ${showDepth ? 'bg-[var(--accent)]/20' : ''}`}
            >
              Show Z
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-4">
          {/* Sort order visualization */}
          <div className="p-4 bg-[var(--card-bg-alt)] rounded">
            <p className="font-medium text-sm mb-2">Current Render Order</p>
            <div className="flex flex-wrap gap-1">
              {sortingIndices.map((idx, i) => {
                const splat = splats[idx];
                if (!splat) return null;
                return (
                  <div
                    key={i}
                    className="w-8 h-8 rounded flex items-center justify-center text-xs font-mono"
                    style={{ backgroundColor: `rgb(${splat.color.join(',')})` }}
                  >
                    {splat.z.toFixed(1)}
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-[var(--muted)] mt-2">
              {sortingEnabled ? 'Sorted: far (high z) → near (low z)' : 'Unsorted: original order'}
            </p>
          </div>

          <div className="p-4 bg-[var(--card-bg-alt)] rounded">
            <p className="font-medium text-sm mb-2">Why Sorting Matters</p>
            <div className="space-y-2 text-xs text-[var(--muted)]">
              <p>
                <span className="font-medium text-[var(--foreground)]">Without sorting:</span>{' '}
                Near objects may be drawn first, then far objects paint over them incorrectly.
              </p>
              <p>
                <span className="font-medium text-[var(--foreground)]">With sorting:</span>{' '}
                Far objects are drawn first, then near objects blend on top correctly.
              </p>
            </div>
          </div>

          <div className="p-4 bg-[var(--card-bg-alt)] rounded">
            <p className="font-medium text-sm mb-2">3DGS Sorting Strategy</p>
            <ol className="text-xs text-[var(--muted)] space-y-1">
              <li>1. Project all Gaussians to screen space</li>
              <li>2. Compute view-space depth for each</li>
              <li>3. GPU radix sort by depth (O(n) parallel)</li>
              <li>4. Render in sorted order per tile</li>
            </ol>
          </div>

          <div className="p-3 border border-[var(--border)] rounded text-sm">
            <p className="font-medium mb-1">Performance Note</p>
            <p className="text-xs text-[var(--muted)]">
              Sorting millions of Gaussians per frame is expensive. 3DGS uses GPU radix sort
              which runs in parallel. Per-tile sorting reduces the problem size further.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DepthSortingDemo;
