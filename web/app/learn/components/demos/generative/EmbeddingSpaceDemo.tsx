'use client';

import { useState, useRef, useEffect } from 'react';

interface Point {
  x: number;
  y: number;
  label: string;
  category: string;
}

export function EmbeddingSpaceDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showClusters, setShowClusters] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);
  const [queryPoint, setQueryPoint] = useState<{ x: number, y: number } | null>(null);
  const [animationPhase, setAnimationPhase] = useState(0);

  // Define semantic clusters
  const clusters = {
    'emotions': {
      color: '#ff6666',
      center: { x: 120, y: 100 },
      points: [
        { label: 'happy', offset: { x: 0, y: -20 } },
        { label: 'smile', offset: { x: 20, y: 10 } },
        { label: 'joy', offset: { x: -15, y: 15 } },
        { label: 'sad', offset: { x: -30, y: -5 } },
      ]
    },
    'faces': {
      color: '#66aaff',
      center: { x: 350, y: 120 },
      points: [
        { label: 'face', offset: { x: 0, y: -15 } },
        { label: 'eyes', offset: { x: 25, y: 5 } },
        { label: 'mouth', offset: { x: -20, y: 20 } },
        { label: 'nose', offset: { x: 10, y: -25 } },
      ]
    },
    'audio': {
      color: '#66ff66',
      center: { x: 200, y: 220 },
      points: [
        { label: 'speech', offset: { x: -10, y: -20 } },
        { label: 'voice', offset: { x: 25, y: 0 } },
        { label: 'sound', offset: { x: -25, y: 10 } },
        { label: 'talk', offset: { x: 5, y: 25 } },
      ]
    },
    'motion': {
      color: '#ffaa66',
      center: { x: 380, y: 240 },
      points: [
        { label: 'move', offset: { x: 0, y: -20 } },
        { label: 'animate', offset: { x: 30, y: 5 } },
        { label: 'gesture', offset: { x: -25, y: 15 } },
        { label: 'walk', offset: { x: 10, y: 25 } },
      ]
    },
  };

  // Generate all points
  const allPoints: Point[] = [];
  Object.entries(clusters).forEach(([category, data]) => {
    data.points.forEach(p => {
      allPoints.push({
        x: data.center.x + p.offset.x,
        y: data.center.y + p.offset.y,
        label: p.label,
        category,
      });
    });
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 0.02) % (Math.PI * 2));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    // Draw cluster regions
    if (showClusters) {
      Object.entries(clusters).forEach(([name, data]) => {
        // Draw ellipse for cluster
        ctx.beginPath();
        ctx.ellipse(
          data.center.x,
          data.center.y,
          60 + Math.sin(animationPhase) * 5,
          50 + Math.cos(animationPhase) * 5,
          0, 0, Math.PI * 2
        );
        ctx.fillStyle = data.color + '15';
        ctx.fill();
        ctx.strokeStyle = data.color + '40';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Cluster label
        ctx.fillStyle = data.color;
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(name, data.center.x, data.center.y - 60);
      });
    }

    // Draw query lines (nearest neighbors)
    if (queryPoint) {
      // Find 3 nearest points
      const distances = allPoints.map(p => ({
        point: p,
        dist: Math.sqrt((p.x - queryPoint.x) ** 2 + (p.y - queryPoint.y) ** 2)
      })).sort((a, b) => a.dist - b.dist).slice(0, 3);

      distances.forEach((d, i) => {
        const alpha = 1 - i * 0.3;
        ctx.strokeStyle = `rgba(255, 255, 100, ${alpha})`;
        ctx.lineWidth = 2 - i * 0.5;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(queryPoint.x, queryPoint.y);
        ctx.lineTo(d.point.x, d.point.y);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Draw query point
      ctx.beginPath();
      ctx.arc(queryPoint.x, queryPoint.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#ffff66';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#ffff66';
      ctx.font = '10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('Query', queryPoint.x + 12, queryPoint.y + 4);
    }

    // Draw points
    allPoints.forEach(point => {
      const clusterData = clusters[point.category as keyof typeof clusters];
      const isSelected = selectedPoint === point;
      const isHovered = selectedPoint?.label === point.label;

      // Point size animation
      const baseSize = isSelected ? 8 : 6;
      const size = baseSize + Math.sin(animationPhase + point.x * 0.1) * (isSelected ? 2 : 1);

      ctx.beginPath();
      ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
      ctx.fillStyle = isSelected ? '#ffffff' : clusterData.color;
      ctx.fill();

      if (isSelected) {
        ctx.strokeStyle = clusterData.color;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Labels
      if (showLabels || isSelected) {
        ctx.fillStyle = isSelected ? '#ffffff' : '#aaaaaa';
        ctx.font = isSelected ? 'bold 10px monospace' : '9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(point.label, point.x, point.y + 18);
      }
    });

    // Title and info
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Embedding Space (2D projection)', 10, 20);

    ctx.fillStyle = '#888888';
    ctx.font = '10px monospace';
    ctx.fillText('Similar concepts cluster together', 10, height - 10);

    if (selectedPoint) {
      ctx.fillStyle = '#aaaaaa';
      ctx.fillText(`Selected: "${selectedPoint.label}" (${selectedPoint.category})`, width - 180, 20);
    }

  }, [allPoints, showClusters, showLabels, selectedPoint, queryPoint, animationPhase]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicked on a point
    const clickedPoint = allPoints.find(p =>
      Math.sqrt((p.x - x) ** 2 + (p.y - y) ** 2) < 15
    );

    if (clickedPoint) {
      setSelectedPoint(clickedPoint);
      setQueryPoint(null);
    } else {
      setSelectedPoint(null);
      setQueryPoint({ x, y });
    }
  };

  return (
    <div className="card p-6">
      <h3 className="font-semibold mb-2">Embedding Space</h3>
      <p className="text-sm text-[var(--muted)] mb-4">
        Neural networks learn to map concepts to vectors. Click to query nearest neighbors or select points.
      </p>

      <canvas
        ref={canvasRef}
        width={500}
        height={320}
        className="w-full max-w-[500px] mb-4 rounded cursor-crosshair"
        onClick={handleCanvasClick}
      />

      <div className="flex gap-4 mb-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showClusters}
            onChange={(e) => setShowClusters(e.target.checked)}
          />
          Show clusters
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showLabels}
            onChange={(e) => setShowLabels(e.target.checked)}
          />
          Show labels
        </label>
        <button
          onClick={() => { setQueryPoint(null); setSelectedPoint(null); }}
          className="px-3 py-1 text-sm bg-[var(--card-bg)] border border-[var(--border)] rounded hover:border-[var(--border-strong)]"
        >
          Clear
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-3 text-xs">
        <div className="p-3 bg-[var(--card-bg-alt)] rounded">
          <p className="font-medium mb-1">Vector Similarity</p>
          <p className="text-[var(--muted)]">Similar concepts have similar vectors. Cosine similarity or Euclidean distance measures closeness.</p>
        </div>
        <div className="p-3 bg-[var(--card-bg-alt)] rounded">
          <p className="font-medium mb-1">In Generative Models</p>
          <p className="text-[var(--muted)]">Face encoders, CLIP, and audio embeddings all learn meaningful spaces for conditioning generation.</p>
        </div>
      </div>
    </div>
  );
}
