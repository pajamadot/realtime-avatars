'use client';

import { useState, useEffect, useRef } from 'react';

interface Gaussian {
  x: number;
  y: number;
  scale: number;
  opacity: number;
  gradient: number; // Simulated gradient magnitude
  color: [number, number, number];
}

export function AdaptiveDensityDemo() {
  const [gaussians, setGaussians] = useState<Gaussian[]>([]);
  const [iteration, setIteration] = useState(0);
  const [isTraining, setIsTraining] = useState(false);
  const [densifyThreshold, setDensifyThreshold] = useState(0.5);
  const [pruneThreshold, setPruneThreshold] = useState(0.1);
  const [showGradients, setShowGradients] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  const width = 400;
  const height = 300;

  // Initialize gaussians
  useEffect(() => {
    const initial: Gaussian[] = [];
    for (let i = 0; i < 30; i++) {
      initial.push({
        x: Math.random() * width,
        y: Math.random() * height,
        scale: 15 + Math.random() * 20,
        opacity: 0.3 + Math.random() * 0.5,
        gradient: Math.random(),
        color: [
          100 + Math.floor(Math.random() * 155),
          100 + Math.floor(Math.random() * 155),
          100 + Math.floor(Math.random() * 155),
        ],
      });
    }
    setGaussians(initial);
  }, []);

  // Training simulation
  useEffect(() => {
    if (!isTraining) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const train = () => {
      setIteration(prev => prev + 1);

      setGaussians(prev => {
        let newGaussians = [...prev];

        // Update gradients (simulate based on position - higher near edges)
        newGaussians = newGaussians.map(g => {
          const edgeDist = Math.min(
            g.x, g.y, width - g.x, height - g.y,
            Math.sqrt((g.x - width/2)**2 + (g.y - height/2)**2) / 2
          );
          const normalizedEdgeDist = edgeDist / (Math.min(width, height) / 2);
          const newGradient = Math.random() * 0.3 + (1 - normalizedEdgeDist) * 0.7;

          return {
            ...g,
            gradient: newGradient,
            // Slightly move towards gradient direction
            x: g.x + (Math.random() - 0.5) * 2,
            y: g.y + (Math.random() - 0.5) * 2,
          };
        });

        // Densification: split large gaussians with high gradients
        const toAdd: Gaussian[] = [];
        newGaussians = newGaussians.map(g => {
          if (g.gradient > densifyThreshold && g.scale > 10 && newGaussians.length + toAdd.length < 200) {
            // Clone and offset
            toAdd.push({
              ...g,
              x: g.x + (Math.random() - 0.5) * g.scale,
              y: g.y + (Math.random() - 0.5) * g.scale,
              scale: g.scale * 0.7,
              gradient: g.gradient * 0.5,
            });
            return { ...g, scale: g.scale * 0.7 };
          }
          return g;
        });

        newGaussians = [...newGaussians, ...toAdd];

        // Pruning: remove low opacity gaussians
        newGaussians = newGaussians.filter(g => g.opacity > pruneThreshold);

        // Slight opacity decay for all
        newGaussians = newGaussians.map(g => ({
          ...g,
          opacity: Math.max(0.05, g.opacity - 0.002),
        }));

        return newGaussians;
      });

      animationRef.current = requestAnimationFrame(train);
    };

    animationRef.current = requestAnimationFrame(train);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isTraining, densifyThreshold, pruneThreshold]);

  // Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    // Sort by scale (larger first)
    const sorted = [...gaussians].sort((a, b) => b.scale - a.scale);

    sorted.forEach(g => {
      // Gaussian splat
      const gradient = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, g.scale);
      gradient.addColorStop(0, `rgba(${g.color[0]}, ${g.color[1]}, ${g.color[2]}, ${g.opacity})`);
      gradient.addColorStop(1, `rgba(${g.color[0]}, ${g.color[1]}, ${g.color[2]}, 0)`);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(g.x, g.y, g.scale, 0, Math.PI * 2);
      ctx.fill();

      // Show gradient indicator
      if (showGradients) {
        const indicatorSize = g.gradient * 6;
        ctx.fillStyle = g.gradient > densifyThreshold ? '#ff6b6b' :
                        g.opacity < pruneThreshold + 0.05 ? '#ffd93d' : '#2ecc71';
        ctx.beginPath();
        ctx.arc(g.x, g.y, indicatorSize, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Stats
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Gaussians: ${gaussians.length}`, 10, 20);
    ctx.fillText(`Iteration: ${iteration}`, 10, 35);

  }, [gaussians, iteration, showGradients, densifyThreshold, pruneThreshold]);

  const reset = () => {
    setIteration(0);
    const initial: Gaussian[] = [];
    for (let i = 0; i < 30; i++) {
      initial.push({
        x: Math.random() * width,
        y: Math.random() * height,
        scale: 15 + Math.random() * 20,
        opacity: 0.3 + Math.random() * 0.5,
        gradient: Math.random(),
        color: [
          100 + Math.floor(Math.random() * 155),
          100 + Math.floor(Math.random() * 155),
          100 + Math.floor(Math.random() * 155),
        ],
      });
    }
    setGaussians(initial);
  };

  return (
    <div className="card p-6">
      <h3 className="font-semibold mb-2">Adaptive Density Control</h3>
      <p className="text-sm text-[var(--text-muted)] mb-6">
        3DGS dynamically adjusts Gaussian count during training. High gradient areas get more Gaussians (densification),
        while low-contribution ones are removed (pruning).
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
              onClick={() => setIsTraining(!isTraining)}
              className={`flex-1 py-2 rounded font-medium text-sm transition-colors ${
                isTraining ? 'bg-red-500 text-white' : 'bg-[var(--accent)] text-white'
              }`}
            >
              {isTraining ? 'Stop' : 'Train'}
            </button>
            <button onClick={reset} className="badge">
              Reset
            </button>
            <button
              onClick={() => setShowGradients(!showGradients)}
              className={`badge ${showGradients ? 'bg-[var(--accent)]/20' : ''}`}
            >
              Gradients
            </button>
          </div>

          {/* Legend */}
          <div className="mt-3 flex flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-[#ff6b6b]" />
              <span>High gradient (will split)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-[#ffd93d]" />
              <span>Low opacity (may prune)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-[#2ecc71]" />
              <span>Stable</span>
            </div>
          </div>
        </div>

        {/* Parameters */}
        <div className="space-y-4">
          <div className="p-4 bg-[var(--surface-2)] rounded">
            <div className="flex justify-between text-sm mb-2">
              <span>Densify Threshold</span>
              <span className="font-mono">{densifyThreshold.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0.2}
              max={0.9}
              step={0.05}
              value={densifyThreshold}
              onChange={(e) => setDensifyThreshold(Number(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Gaussians with gradient {">"} threshold will split
            </p>
          </div>

          <div className="p-4 bg-[var(--surface-2)] rounded">
            <div className="flex justify-between text-sm mb-2">
              <span>Prune Threshold</span>
              <span className="font-mono">{pruneThreshold.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0.01}
              max={0.3}
              step={0.01}
              value={pruneThreshold}
              onChange={(e) => setPruneThreshold(Number(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Gaussians with opacity {"<"} threshold will be removed
            </p>
          </div>

          <div className="p-4 bg-[var(--surface-2)] rounded">
            <p className="font-medium text-sm mb-2">Adaptive Density Process</p>
            <ol className="text-xs text-[var(--text-muted)] space-y-1">
              <li>1. Compute reconstruction loss gradient per Gaussian</li>
              <li>2. Large gradient + large scale → split into 2 smaller</li>
              <li>3. Large gradient + small scale → clone nearby</li>
              <li>4. Very low opacity → prune (remove)</li>
              <li>5. Reset opacity periodically to allow regrowth</li>
            </ol>
          </div>

          <div className="p-3 border border-[var(--border)] rounded text-sm">
            <p className="font-medium mb-1">Why This Matters</p>
            <p className="text-xs text-[var(--text-muted)]">
              Without adaptive density, you'd need to manually choose Gaussian count.
              Too few = blurry, too many = slow. The algorithm automatically concentrates
              detail where the scene needs it (edges, textures) and saves memory elsewhere.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdaptiveDensityDemo;
