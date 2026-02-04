'use client';

import { useState, useEffect, useRef } from 'react';

interface Point {
  x: number;
  y: number;
}

// Loss landscape function (2D bowl shape with some complexity)
const lossFunction = (x: number, y: number): number => {
  // Main bowl
  const bowl = 0.5 * (x * x + y * y);
  // Add some local minima
  const bumps = 0.3 * Math.sin(3 * x) * Math.sin(3 * y);
  return bowl + bumps;
};

// Gradient of loss function
const gradient = (x: number, y: number): Point => {
  const dx = x + 0.9 * Math.cos(3 * x) * Math.sin(3 * y);
  const dy = y + 0.9 * Math.sin(3 * x) * Math.cos(3 * y);
  return { x: dx, y: dy };
};

export function GradientDescentDemo() {
  const [position, setPosition] = useState<Point>({ x: 2, y: 2 });
  const [history, setHistory] = useState<Point[]>([{ x: 2, y: 2 }]);
  const [learningRate, setLearningRate] = useState(0.1);
  const [momentum, setMomentum] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [velocity, setVelocity] = useState<Point>({ x: 0, y: 0 });
  const [stepCount, setStepCount] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  // Render loss landscape
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const scale = 60; // pixels per unit
    const centerX = width / 2;
    const centerY = height / 2;

    // Draw loss landscape as heatmap
    const imageData = ctx.createImageData(width, height);

    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        const x = (px - centerX) / scale;
        const y = (py - centerY) / scale;
        const loss = lossFunction(x, y);

        // Map loss to color (blue = low, red = high)
        const normalized = Math.min(1, loss / 5);
        const r = Math.floor(normalized * 255);
        const g = Math.floor((1 - normalized) * 100);
        const b = Math.floor((1 - normalized) * 255);

        const i = (py * width + px) * 4;
        imageData.data[i] = r;
        imageData.data[i + 1] = g;
        imageData.data[i + 2] = b;
        imageData.data[i + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);

    // Draw contour lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;

    for (let level = 0.5; level < 5; level += 0.5) {
      ctx.beginPath();
      for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
        const r = Math.sqrt(level * 2);
        const x = centerX + Math.cos(angle) * r * scale;
        const y = centerY + Math.sin(angle) * r * scale;
        if (angle === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    }

    // Draw optimization path
    if (history.length > 1) {
      ctx.strokeStyle = '#ffd93d';
      ctx.lineWidth = 2;
      ctx.beginPath();
      history.forEach((p, i) => {
        const px = centerX + p.x * scale;
        const py = centerY + p.y * scale;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();

      // Draw path points
      history.forEach((p, i) => {
        const px = centerX + p.x * scale;
        const py = centerY + p.y * scale;
        ctx.fillStyle = i === history.length - 1 ? '#ff6b6b' : 'rgba(255, 217, 61, 0.5)';
        ctx.beginPath();
        ctx.arc(px, py, i === history.length - 1 ? 6 : 3, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Draw current position
    const currentPx = centerX + position.x * scale;
    const currentPy = centerY + position.y * scale;

    ctx.fillStyle = '#ff6b6b';
    ctx.beginPath();
    ctx.arc(currentPx, currentPy, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw gradient arrow
    const grad = gradient(position.x, position.y);
    const gradMag = Math.sqrt(grad.x * grad.x + grad.y * grad.y);
    const arrowScale = 20 / Math.max(gradMag, 0.1);

    ctx.strokeStyle = '#4ecdc4';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(currentPx, currentPy);
    ctx.lineTo(currentPx - grad.x * arrowScale, currentPy - grad.y * arrowScale);
    ctx.stroke();

    // Draw global minimum marker
    ctx.fillStyle = 'rgba(46, 204, 113, 0.8)';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();

  }, [position, history]);

  // Optimization step
  const step = () => {
    const grad = gradient(position.x, position.y);

    // Apply momentum
    const newVelX = momentum * velocity.x - learningRate * grad.x;
    const newVelY = momentum * velocity.y - learningRate * grad.y;

    const newX = position.x + newVelX;
    const newY = position.y + newVelY;

    // Clamp to visible area
    const clampedX = Math.max(-3, Math.min(3, newX));
    const clampedY = Math.max(-3, Math.min(3, newY));

    setVelocity({ x: newVelX, y: newVelY });
    setPosition({ x: clampedX, y: clampedY });
    setHistory(prev => [...prev, { x: clampedX, y: clampedY }]);
    setStepCount(prev => prev + 1);
  };

  // Animation loop
  useEffect(() => {
    if (!isRunning) return;

    const animate = () => {
      step();
      animationRef.current = setTimeout(() => {
        animationRef.current = requestAnimationFrame(animate);
      }, 100) as unknown as number;
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        clearTimeout(animationRef.current);
      }
    };
  }, [isRunning, position, velocity, learningRate, momentum]);

  const reset = (startX = 2, startY = 2) => {
    setIsRunning(false);
    setPosition({ x: startX, y: startY });
    setHistory([{ x: startX, y: startY }]);
    setVelocity({ x: 0, y: 0 });
    setStepCount(0);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const scale = 60;
    const x = (px - canvas.width / 2) / scale;
    const y = (py - canvas.height / 2) / scale;

    reset(x, y);
  };

  const currentLoss = lossFunction(position.x, position.y);

  return (
    <div className="card p-6">
      <h3 className="font-semibold mb-2">Gradient Descent Visualizer</h3>
      <p className="text-sm text-[var(--text-muted)] mb-6">
        Watch how neural networks learn by following the gradient downhill.
        Click anywhere on the landscape to set a starting point.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Canvas */}
        <div>
          <canvas
            ref={canvasRef}
            width={350}
            height={350}
            onClick={handleCanvasClick}
            className="w-full rounded-lg border border-[var(--border)] cursor-crosshair"
          />

          {/* Legend */}
          <div className="mt-3 flex flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-[#ff6b6b]" />
              <span>Current position</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-[#ffd93d]" />
              <span>Path</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-[#2ecc71]" />
              <span>Global minimum</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-1 bg-[#4ecdc4]" />
              <span>Gradient</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {/* Metrics */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 bg-[var(--surface-2)] rounded text-center">
              <p className="text-xs text-[var(--text-muted)]">Loss</p>
              <p className="font-mono text-lg">{currentLoss.toFixed(3)}</p>
            </div>
            <div className="p-3 bg-[var(--surface-2)] rounded text-center">
              <p className="text-xs text-[var(--text-muted)]">Steps</p>
              <p className="font-mono text-lg">{stepCount}</p>
            </div>
            <div className="p-3 bg-[var(--surface-2)] rounded text-center">
              <p className="text-xs text-[var(--text-muted)]">Position</p>
              <p className="font-mono text-sm">({position.x.toFixed(2)}, {position.y.toFixed(2)})</p>
            </div>
          </div>

          {/* Learning rate */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Learning Rate</span>
              <span className="font-mono">{learningRate.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0.01}
              max={0.5}
              step={0.01}
              value={learningRate}
              onChange={(e) => setLearningRate(Number(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-[var(--text-muted)]">
              {learningRate < 0.1 ? 'Slow but stable' : learningRate > 0.3 ? 'Fast but may overshoot' : 'Balanced'}
            </p>
          </div>

          {/* Momentum */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Momentum</span>
              <span className="font-mono">{momentum.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={0.95}
              step={0.05}
              value={momentum}
              onChange={(e) => setMomentum(Number(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-[var(--text-muted)]">
              {momentum === 0 ? 'No momentum (vanilla SGD)' : momentum > 0.7 ? 'High momentum - escapes local minima' : 'Moderate momentum'}
            </p>
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`flex-1 py-2 rounded font-medium text-sm transition-colors ${
                isRunning
                  ? 'bg-red-500 text-white'
                  : 'bg-[var(--accent)] text-white'
              }`}
            >
              {isRunning ? 'Pause' : 'Run'}
            </button>
            <button
              onClick={step}
              disabled={isRunning}
              className="flex-1 badge hover:border-[var(--border-strong)] justify-center disabled:opacity-50"
            >
              Step
            </button>
            <button
              onClick={() => reset()}
              className="flex-1 badge hover:border-[var(--border-strong)] justify-center"
            >
              Reset
            </button>
          </div>

          {/* Quick starts */}
          <div>
            <p className="text-sm font-medium mb-2">Starting Points</p>
            <div className="flex gap-2">
              <button
                onClick={() => reset(2, 2)}
                className="badge hover:border-[var(--border-strong)]"
              >
                Top Right
              </button>
              <button
                onClick={() => reset(-2, 1)}
                className="badge hover:border-[var(--border-strong)]"
              >
                Near Local Min
              </button>
              <button
                onClick={() => reset(0.5, -2)}
                className="badge hover:border-[var(--border-strong)]"
              >
                Saddle Point
              </button>
            </div>
          </div>

          {/* Explanation */}
          <div className="p-3 border border-[var(--border)] rounded text-sm">
            <p className="font-medium mb-1">The Update Rule</p>
            <code className="text-xs block mb-2 font-mono">
              w = w - lr * gradient + momentum * velocity
            </code>
            <p className="text-xs text-[var(--text-muted)]">
              This is how diffusion models, face encoders, and all neural networks learn.
              The gradient points uphill; we go downhill.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GradientDescentDemo;
