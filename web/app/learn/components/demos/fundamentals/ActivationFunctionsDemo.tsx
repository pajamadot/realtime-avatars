'use client';

import { useState, useEffect, useRef } from 'react';

type ActivationType = 'relu' | 'sigmoid' | 'tanh' | 'leaky_relu' | 'gelu';

interface ActivationInfo {
  name: string;
  formula: string;
  description: string;
  color: string;
  fn: (x: number) => number;
  derivative: (x: number) => number;
}

const ACTIVATIONS: Record<ActivationType, ActivationInfo> = {
  relu: {
    name: 'ReLU',
    formula: 'max(0, x)',
    description: 'Simple, fast. Most common. Can "die" if always negative.',
    color: '#e74c3c',
    fn: (x) => Math.max(0, x),
    derivative: (x) => x > 0 ? 1 : 0,
  },
  sigmoid: {
    name: 'Sigmoid',
    formula: '1 / (1 + e^(-x))',
    description: 'Squashes to [0,1]. Good for probabilities. Vanishing gradients.',
    color: '#3498db',
    fn: (x) => 1 / (1 + Math.exp(-x)),
    derivative: (x) => {
      const s = 1 / (1 + Math.exp(-x));
      return s * (1 - s);
    },
  },
  tanh: {
    name: 'Tanh',
    formula: '(e^x - e^(-x)) / (e^x + e^(-x))',
    description: 'Squashes to [-1,1]. Zero-centered. Also has vanishing gradients.',
    color: '#2ecc71',
    fn: (x) => Math.tanh(x),
    derivative: (x) => 1 - Math.tanh(x) ** 2,
  },
  leaky_relu: {
    name: 'Leaky ReLU',
    formula: 'max(0.01x, x)',
    description: 'Fixes "dying ReLU" by allowing small negative values.',
    color: '#9b59b6',
    fn: (x) => x > 0 ? x : 0.01 * x,
    derivative: (x) => x > 0 ? 1 : 0.01,
  },
  gelu: {
    name: 'GELU',
    formula: 'x · Φ(x)',
    description: 'Used in Transformers. Smooth, probabilistic gating.',
    color: '#f1c40f',
    fn: (x) => 0.5 * x * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * x ** 3))),
    derivative: (x) => {
      const c = Math.sqrt(2 / Math.PI);
      const inner = c * (x + 0.044715 * x ** 3);
      const tanhInner = Math.tanh(inner);
      const sech2 = 1 - tanhInner ** 2;
      return 0.5 * (1 + tanhInner) + 0.5 * x * sech2 * c * (1 + 3 * 0.044715 * x ** 2);
    },
  },
};

export function ActivationFunctionsDemo() {
  const [selectedActivation, setSelectedActivation] = useState<ActivationType>('relu');
  const [inputValue, setInputValue] = useState(0);
  const [showDerivative, setShowDerivative] = useState(false);
  const [showAllCurves, setShowAllCurves] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    const graphWidth = width - 2 * padding;
    const graphHeight = height - 2 * padding;
    const centerX = padding + graphWidth / 2;
    const centerY = padding + graphHeight / 2;
    const scale = 30; // pixels per unit

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;

    // Vertical grid lines
    for (let i = -5; i <= 5; i++) {
      const x = centerX + i * scale;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
    }

    // Horizontal grid lines
    for (let i = -3; i <= 3; i++) {
      const y = centerY - i * scale;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 2;
    // X axis
    ctx.beginPath();
    ctx.moveTo(padding, centerY);
    ctx.lineTo(width - padding, centerY);
    ctx.stroke();
    // Y axis
    ctx.beginPath();
    ctx.moveTo(centerX, padding);
    ctx.lineTo(centerX, height - padding);
    ctx.stroke();

    // Draw activation curves
    const activationsToDraw = showAllCurves
      ? Object.keys(ACTIVATIONS) as ActivationType[]
      : [selectedActivation];

    activationsToDraw.forEach(key => {
      const activation = ACTIVATIONS[key];
      const isSelected = key === selectedActivation;

      // Main function curve
      ctx.strokeStyle = isSelected ? activation.color : `${activation.color}40`;
      ctx.lineWidth = isSelected ? 3 : 1;
      ctx.beginPath();

      for (let px = padding; px <= width - padding; px++) {
        const x = (px - centerX) / scale;
        const y = activation.fn(x);
        const py = centerY - y * scale;

        if (px === padding) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }

      ctx.stroke();

      // Derivative curve (if enabled and selected)
      if (showDerivative && isSelected) {
        ctx.strokeStyle = `${activation.color}80`;
        ctx.setLineDash([5, 5]);
        ctx.lineWidth = 2;
        ctx.beginPath();

        for (let px = padding; px <= width - padding; px++) {
          const x = (px - centerX) / scale;
          const dy = activation.derivative(x);
          const py = centerY - dy * scale;

          if (px === padding) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }

        ctx.stroke();
        ctx.setLineDash([]);
      }
    });

    // Draw input/output point
    const activation = ACTIVATIONS[selectedActivation];
    const outputValue = activation.fn(inputValue);
    const derivativeValue = activation.derivative(inputValue);

    const inputX = centerX + inputValue * scale;
    const inputY = centerY;
    const outputY = centerY - outputValue * scale;

    // Input line
    ctx.strokeStyle = 'rgba(255, 217, 61, 0.5)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(inputX, centerY);
    ctx.lineTo(inputX, outputY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Input point
    ctx.fillStyle = '#ffd93d';
    ctx.beginPath();
    ctx.arc(inputX, centerY, 6, 0, Math.PI * 2);
    ctx.fill();

    // Output point
    ctx.fillStyle = activation.color;
    ctx.beginPath();
    ctx.arc(inputX, outputY, 8, 0, Math.PI * 2);
    ctx.fill();

    // Labels
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('x', width - padding + 15, centerY + 4);
    ctx.fillText('f(x)', centerX, padding - 10);

    // Axis numbers
    ctx.font = '9px monospace';
    for (let i = -4; i <= 4; i++) {
      if (i === 0) continue;
      ctx.fillText(String(i), centerX + i * scale, centerY + 15);
    }
    for (let i = -2; i <= 2; i++) {
      if (i === 0) continue;
      ctx.textAlign = 'right';
      ctx.fillText(String(i), centerX - 5, centerY - i * scale + 3);
    }

  }, [selectedActivation, inputValue, showDerivative, showAllCurves]);

  const activation = ACTIVATIONS[selectedActivation];
  const outputValue = activation.fn(inputValue);
  const derivativeValue = activation.derivative(inputValue);

  return (
    <div className="card p-6">
      <h3 className="font-semibold mb-2">Activation Functions</h3>
      <p className="text-sm text-[var(--muted)] mb-6">
        Activation functions introduce non-linearity, enabling neural networks to learn complex patterns.
        Each has different properties for training stability and gradient flow.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Canvas */}
        <div>
          <canvas
            ref={canvasRef}
            width={400}
            height={280}
            className="w-full rounded-lg border border-[var(--border)]"
          />

          {/* Input slider */}
          <div className="mt-4 p-3 bg-[var(--card-bg-alt)] rounded">
            <div className="flex justify-between text-sm mb-1">
              <span>Input (x)</span>
              <span className="font-mono">{inputValue.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={-4}
              max={4}
              step={0.1}
              value={inputValue}
              onChange={(e) => setInputValue(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Toggles */}
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => setShowDerivative(!showDerivative)}
              className={`badge ${showDerivative ? 'bg-[var(--accent)]/20' : ''}`}
            >
              Derivative
            </button>
            <button
              onClick={() => setShowAllCurves(!showAllCurves)}
              className={`badge ${showAllCurves ? 'bg-[var(--accent)]/20' : ''}`}
            >
              Compare All
            </button>
          </div>
        </div>

        {/* Selector and info */}
        <div className="space-y-4">
          <div className="space-y-2">
            {(Object.keys(ACTIVATIONS) as ActivationType[]).map(key => {
              const a = ACTIVATIONS[key];
              return (
                <button
                  key={key}
                  onClick={() => setSelectedActivation(key)}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    selectedActivation === key
                      ? 'border-2'
                      : 'border border-[var(--border)] hover:border-[var(--border-strong)]'
                  }`}
                  style={{
                    borderColor: selectedActivation === key ? a.color : undefined,
                    backgroundColor: selectedActivation === key ? `${a.color}10` : undefined,
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{a.name}</span>
                    <code className="text-xs text-[var(--muted)]">{a.formula}</code>
                  </div>
                  <p className="text-xs text-[var(--muted)]">{a.description}</p>
                </button>
              );
            })}
          </div>

          {/* Current values */}
          <div className="p-4 bg-[var(--card-bg-alt)] rounded">
            <p className="font-medium text-sm mb-2">Current Values</p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2 bg-[var(--card-bg)] rounded text-center">
                <p className="text-[var(--muted)]">Input</p>
                <p className="font-mono">{inputValue.toFixed(2)}</p>
              </div>
              <div className="p-2 bg-[var(--card-bg)] rounded text-center">
                <p className="text-[var(--muted)]">Output</p>
                <p className="font-mono" style={{ color: activation.color }}>
                  {outputValue.toFixed(3)}
                </p>
              </div>
              <div className="p-2 bg-[var(--card-bg)] rounded text-center">
                <p className="text-[var(--muted)]">Gradient</p>
                <p className="font-mono">{derivativeValue.toFixed(3)}</p>
              </div>
            </div>
          </div>

          <div className="p-3 border border-[var(--border)] rounded text-sm">
            <p className="font-medium mb-1">For Avatar Models</p>
            <p className="text-xs text-[var(--muted)]">
              Face encoders typically use ReLU or LeakyReLU. Transformers (in diffusion models)
              use GELU. The final layer often uses Sigmoid or Tanh to bound outputs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ActivationFunctionsDemo;
