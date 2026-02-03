'use client';

import { useState, useEffect, useRef } from 'react';

interface Neuron {
  x: number;
  y: number;
  value: number;
  gradient: number;
  activation: number;
}

interface Weight {
  from: number;
  to: number;
  value: number;
  gradient: number;
}

export function BackpropagationDemo() {
  const [phase, setPhase] = useState<'forward' | 'backward' | 'update'>('forward');
  const [input, setInput] = useState(0.5);
  const [target, setTarget] = useState(0.8);
  const [learningRate, setLearningRate] = useState(0.5);
  const [step, setStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Simple 2-layer network: 1 input -> 2 hidden -> 1 output
  const [weights, setWeights] = useState<Weight[]>([
    { from: 0, to: 1, value: 0.5, gradient: 0 },
    { from: 0, to: 2, value: -0.3, gradient: 0 },
    { from: 1, to: 3, value: 0.7, gradient: 0 },
    { from: 2, to: 3, value: 0.4, gradient: 0 },
  ]);

  const [neurons, setNeurons] = useState<Neuron[]>([
    { x: 60, y: 150, value: input, gradient: 0, activation: input },
    { x: 180, y: 80, value: 0, gradient: 0, activation: 0 },
    { x: 180, y: 220, value: 0, gradient: 0, activation: 0 },
    { x: 300, y: 150, value: 0, gradient: 0, activation: 0 },
  ]);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));
  const sigmoidDerivative = (x: number) => {
    const s = sigmoid(x);
    return s * (1 - s);
  };

  // Forward pass
  const forwardPass = () => {
    const newNeurons = [...neurons];
    newNeurons[0].value = input;
    newNeurons[0].activation = input;

    // Hidden layer
    newNeurons[1].value = weights[0].value * input;
    newNeurons[1].activation = sigmoid(newNeurons[1].value);

    newNeurons[2].value = weights[1].value * input;
    newNeurons[2].activation = sigmoid(newNeurons[2].value);

    // Output layer
    newNeurons[3].value = weights[2].value * newNeurons[1].activation +
                          weights[3].value * newNeurons[2].activation;
    newNeurons[3].activation = sigmoid(newNeurons[3].value);

    setNeurons(newNeurons);
  };

  // Backward pass
  const backwardPass = () => {
    const newNeurons = [...neurons];
    const newWeights = [...weights];

    // Output gradient (loss derivative)
    const output = newNeurons[3].activation;
    const error = output - target;
    const outputGrad = error * sigmoidDerivative(newNeurons[3].value);
    newNeurons[3].gradient = outputGrad;

    // Hidden layer gradients
    newNeurons[1].gradient = outputGrad * weights[2].value * sigmoidDerivative(newNeurons[1].value);
    newNeurons[2].gradient = outputGrad * weights[3].value * sigmoidDerivative(newNeurons[2].value);

    // Weight gradients
    newWeights[2].gradient = outputGrad * newNeurons[1].activation;
    newWeights[3].gradient = outputGrad * newNeurons[2].activation;
    newWeights[0].gradient = newNeurons[1].gradient * input;
    newWeights[1].gradient = newNeurons[2].gradient * input;

    setNeurons(newNeurons);
    setWeights(newWeights);
  };

  // Update weights
  const updateWeights = () => {
    const newWeights = weights.map(w => ({
      ...w,
      value: w.value - learningRate * w.gradient,
    }));
    setWeights(newWeights);
  };

  // Run one complete step
  const runStep = () => {
    if (phase === 'forward') {
      forwardPass();
      setPhase('backward');
    } else if (phase === 'backward') {
      backwardPass();
      setPhase('update');
    } else {
      updateWeights();
      setPhase('forward');
      setStep(s => s + 1);
    }
  };

  // Animation
  useEffect(() => {
    if (!isAnimating) return;

    const timer = setTimeout(() => {
      runStep();
    }, 800);

    return () => clearTimeout(timer);
  }, [isAnimating, phase]);

  // Recalculate forward pass when input changes
  useEffect(() => {
    forwardPass();
  }, [input]);

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

    // Draw connections with gradient flow
    weights.forEach((w, i) => {
      const from = neurons[w.from];
      const to = neurons[w.to];

      // Connection line
      const lineWidth = Math.abs(w.value) * 4 + 1;
      ctx.strokeStyle = w.value > 0 ? 'rgba(46, 204, 113, 0.6)' : 'rgba(231, 76, 60, 0.6)';
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      ctx.moveTo(from.x + 25, from.y);
      ctx.lineTo(to.x - 25, to.y);
      ctx.stroke();

      // Weight label
      const midX = (from.x + to.x) / 2;
      const midY = (from.y + to.y) / 2;
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`w=${w.value.toFixed(2)}`, midX, midY - 8);

      // Gradient (during backward pass)
      if (phase === 'backward' || phase === 'update') {
        ctx.fillStyle = Math.abs(w.gradient) > 0.1 ? '#ffd93d' : 'rgba(255,217,61,0.5)';
        ctx.fillText(`∂=${w.gradient.toFixed(3)}`, midX, midY + 8);
      }
    });

    // Draw neurons
    neurons.forEach((n, i) => {
      // Node circle
      const isActive = (phase === 'forward' && i <= step % 4) ||
                       (phase === 'backward' && i >= 4 - step % 4) ||
                       phase === 'update';

      ctx.fillStyle = isActive ? '#4ecdc4' : 'rgba(78, 205, 196, 0.5)';
      ctx.beginPath();
      ctx.arc(n.x, n.y, 25, 0, Math.PI * 2);
      ctx.fill();

      // Border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Activation value
      ctx.fillStyle = '#1a1a2e';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(n.activation.toFixed(2), n.x, n.y);

      // Gradient (during backward pass)
      if ((phase === 'backward' || phase === 'update') && i > 0) {
        ctx.fillStyle = '#ffd93d';
        ctx.font = '9px monospace';
        ctx.fillText(`∂${n.gradient.toFixed(2)}`, n.x, n.y + 35);
      }

      // Labels
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = '10px sans-serif';
      if (i === 0) ctx.fillText('Input', n.x, n.y - 35);
      if (i === 3) ctx.fillText('Output', n.x, n.y - 35);
    });

    // Draw target
    ctx.fillStyle = '#ff6b6b';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Target: ${target.toFixed(2)}`, neurons[3].x + 35, neurons[3].y - 10);

    // Loss
    const loss = 0.5 * (neurons[3].activation - target) ** 2;
    ctx.fillText(`Loss: ${loss.toFixed(4)}`, neurons[3].x + 35, neurons[3].y + 10);

    // Phase indicator
    ctx.fillStyle = phase === 'forward' ? '#2ecc71' :
                    phase === 'backward' ? '#ffd93d' : '#9b59b6';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(
      phase === 'forward' ? '→ Forward Pass' :
      phase === 'backward' ? '← Backward Pass' : '↻ Update Weights',
      10, 20
    );

    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '11px sans-serif';
    ctx.fillText(`Step: ${step}`, 10, 40);

  }, [neurons, weights, phase, step, target]);

  const reset = () => {
    setWeights([
      { from: 0, to: 1, value: 0.5, gradient: 0 },
      { from: 0, to: 2, value: -0.3, gradient: 0 },
      { from: 1, to: 3, value: 0.7, gradient: 0 },
      { from: 2, to: 3, value: 0.4, gradient: 0 },
    ]);
    setPhase('forward');
    setStep(0);
    setIsAnimating(false);
  };

  return (
    <div className="card p-6">
      <h3 className="font-semibold mb-2">Backpropagation</h3>
      <p className="text-sm text-[var(--muted)] mb-6">
        The algorithm that trains neural networks. Forward pass computes output,
        backward pass computes gradients, then weights update to reduce error.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Canvas */}
        <div>
          <canvas
            ref={canvasRef}
            width={380}
            height={300}
            className="w-full rounded-lg border border-[var(--border)]"
          />

          {/* Controls */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={runStep}
              disabled={isAnimating}
              className="flex-1 py-2 rounded font-medium text-sm bg-[var(--accent)] text-white disabled:opacity-50"
            >
              Step
            </button>
            <button
              onClick={() => setIsAnimating(!isAnimating)}
              className={`flex-1 py-2 rounded font-medium text-sm ${
                isAnimating ? 'bg-red-500 text-white' : 'bg-[var(--card-bg-alt)]'
              }`}
            >
              {isAnimating ? 'Stop' : 'Auto'}
            </button>
            <button onClick={reset} className="badge">
              Reset
            </button>
          </div>

          {/* Legend */}
          <div className="mt-3 flex flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-[#2ecc71]" />
              <span>Positive weight</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-[#e74c3c]" />
              <span>Negative weight</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[#ffd93d]">∂</span>
              <span>Gradient</span>
            </div>
          </div>
        </div>

        {/* Parameters */}
        <div className="space-y-4">
          <div className="p-4 bg-[var(--card-bg-alt)] rounded">
            <div className="flex justify-between text-sm mb-2">
              <span>Input</span>
              <span className="font-mono">{input.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={input}
              onChange={(e) => setInput(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="p-4 bg-[var(--card-bg-alt)] rounded">
            <div className="flex justify-between text-sm mb-2">
              <span>Target</span>
              <span className="font-mono">{target.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={target}
              onChange={(e) => setTarget(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="p-4 bg-[var(--card-bg-alt)] rounded">
            <div className="flex justify-between text-sm mb-2">
              <span>Learning Rate</span>
              <span className="font-mono">{learningRate.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0.1}
              max={2}
              step={0.1}
              value={learningRate}
              onChange={(e) => setLearningRate(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="p-4 bg-[var(--card-bg-alt)] rounded">
            <p className="font-medium text-sm mb-2">The Algorithm</p>
            <ol className="text-xs text-[var(--muted)] space-y-1">
              <li className={phase === 'forward' ? 'text-[#2ecc71]' : ''}>
                1. Forward: Compute activations layer by layer
              </li>
              <li className={phase === 'backward' ? 'text-[#ffd93d]' : ''}>
                2. Backward: Compute gradients via chain rule
              </li>
              <li className={phase === 'update' ? 'text-[#9b59b6]' : ''}>
                3. Update: w = w - lr × gradient
              </li>
            </ol>
          </div>

          <div className="p-3 border border-[var(--border)] rounded text-sm">
            <p className="font-medium mb-1">For Diffusion Models</p>
            <p className="text-xs text-[var(--muted)]">
              The U-Net denoiser is trained with backpropagation. Gradients flow from
              the reconstruction loss back through millions of parameters, updating
              each weight to predict noise better.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BackpropagationDemo;
