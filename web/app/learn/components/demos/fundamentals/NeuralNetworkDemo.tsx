'use client';

import { useState, useEffect, useRef } from 'react';

interface Neuron {
  value: number;
  activated: number;
}

interface Layer {
  neurons: Neuron[];
  weights?: number[][];
  biases?: number[];
}

const ACTIVATION_FUNCTIONS = {
  relu: { name: 'ReLU', fn: (x: number) => Math.max(0, x), formula: 'max(0, x)' },
  sigmoid: { name: 'Sigmoid', fn: (x: number) => 1 / (1 + Math.exp(-x)), formula: '1/(1+e^-x)' },
  tanh: { name: 'Tanh', fn: (x: number) => Math.tanh(x), formula: 'tanh(x)' },
};

export function NeuralNetworkDemo() {
  const [inputValues, setInputValues] = useState([0.5, 0.8, 0.3]);
  const [activationFn, setActivationFn] = useState<keyof typeof ACTIVATION_FUNCTIONS>('relu');
  const [layers, setLayers] = useState<Layer[]>([]);
  const [showWeights, setShowWeights] = useState(true);
  const [isForwardPassing, setIsForwardPassing] = useState(false);
  const [highlightedLayer, setHighlightedLayer] = useState(-1);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize network weights
  useEffect(() => {
    const initLayers: Layer[] = [
      { neurons: inputValues.map(v => ({ value: v, activated: v })) },
      {
        neurons: Array(4).fill(null).map(() => ({ value: 0, activated: 0 })),
        weights: Array(4).fill(null).map(() => inputValues.map(() => (Math.random() - 0.5) * 2)),
        biases: Array(4).fill(null).map(() => (Math.random() - 0.5)),
      },
      {
        neurons: Array(4).fill(null).map(() => ({ value: 0, activated: 0 })),
        weights: Array(4).fill(null).map(() => Array(4).fill(null).map(() => (Math.random() - 0.5) * 2)),
        biases: Array(4).fill(null).map(() => (Math.random() - 0.5)),
      },
      {
        neurons: Array(2).fill(null).map(() => ({ value: 0, activated: 0 })),
        weights: Array(2).fill(null).map(() => Array(4).fill(null).map(() => (Math.random() - 0.5) * 2)),
        biases: Array(2).fill(null).map(() => (Math.random() - 0.5)),
      },
    ];
    setLayers(initLayers);
  }, []);

  // Forward pass
  const forwardPass = async () => {
    setIsForwardPassing(true);
    const activation = ACTIVATION_FUNCTIONS[activationFn].fn;

    const newLayers = [...layers];

    // Update input layer
    newLayers[0].neurons = inputValues.map(v => ({ value: v, activated: v }));
    setLayers([...newLayers]);
    setHighlightedLayer(0);
    await new Promise(r => setTimeout(r, 500));

    // Process each hidden/output layer
    for (let l = 1; l < newLayers.length; l++) {
      const prevLayer = newLayers[l - 1];
      const currLayer = newLayers[l];

      for (let n = 0; n < currLayer.neurons.length; n++) {
        let sum = currLayer.biases![n];
        for (let p = 0; p < prevLayer.neurons.length; p++) {
          sum += prevLayer.neurons[p].activated * currLayer.weights![n][p];
        }
        currLayer.neurons[n].value = sum;
        currLayer.neurons[n].activated = activation(sum);
      }

      setLayers([...newLayers]);
      setHighlightedLayer(l);
      await new Promise(r => setTimeout(r, 500));
    }

    setHighlightedLayer(-1);
    setIsForwardPassing(false);
  };

  // Render network
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || layers.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const layerSpacing = width / (layers.length + 1);
    const neuronRadius = 18;

    // Calculate positions
    const positions: { x: number; y: number }[][] = layers.map((layer, li) => {
      const x = layerSpacing * (li + 1);
      const neuronSpacing = height / (layer.neurons.length + 1);
      return layer.neurons.map((_, ni) => ({
        x,
        y: neuronSpacing * (ni + 1),
      }));
    });

    // Draw connections
    for (let l = 1; l < layers.length; l++) {
      const prevPositions = positions[l - 1];
      const currPositions = positions[l];
      const currLayer = layers[l];

      for (let n = 0; n < currLayer.neurons.length; n++) {
        for (let p = 0; p < prevPositions.length; p++) {
          const weight = currLayer.weights![n][p];
          const absWeight = Math.abs(weight);
          const isPositive = weight >= 0;

          ctx.strokeStyle = isPositive
            ? `rgba(46, 204, 113, ${0.2 + absWeight * 0.4})`
            : `rgba(231, 76, 60, ${0.2 + absWeight * 0.4})`;
          ctx.lineWidth = showWeights ? 1 + absWeight * 2 : 1;

          ctx.beginPath();
          ctx.moveTo(prevPositions[p].x, prevPositions[p].y);
          ctx.lineTo(currPositions[n].x, currPositions[n].y);
          ctx.stroke();

          // Weight label
          if (showWeights && absWeight > 0.3) {
            const midX = (prevPositions[p].x + currPositions[n].x) / 2;
            const midY = (prevPositions[p].y + currPositions[n].y) / 2;
            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            ctx.font = '9px monospace';
            ctx.fillText(weight.toFixed(1), midX - 10, midY);
          }
        }
      }
    }

    // Draw neurons
    layers.forEach((layer, li) => {
      layer.neurons.forEach((neuron, ni) => {
        const pos = positions[li][ni];
        const isHighlighted = highlightedLayer === li;

        // Neuron circle
        const activation = Math.abs(neuron.activated);
        const hue = neuron.activated >= 0 ? 150 : 0;
        ctx.fillStyle = isHighlighted
          ? `hsl(${hue}, 70%, ${40 + activation * 30}%)`
          : `hsl(${hue}, 50%, ${30 + activation * 25}%)`;
        ctx.strokeStyle = isHighlighted ? '#ffd93d' : '#ffffff';
        ctx.lineWidth = isHighlighted ? 3 : 1;

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, neuronRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Value
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(neuron.activated.toFixed(2), pos.x, pos.y);
      });

      // Layer label
      const layerLabels = ['Input', 'Hidden 1', 'Hidden 2', 'Output'];
      ctx.fillStyle = highlightedLayer === li ? '#ffd93d' : 'rgba(255,255,255,0.5)';
      ctx.font = '12px sans-serif';
      ctx.fillText(layerLabels[li], positions[li][0].x, 20);
    });

  }, [layers, highlightedLayer, showWeights]);

  const randomizeWeights = () => {
    const newLayers = layers.map((layer, li) => {
      if (li === 0) return layer;
      return {
        ...layer,
        weights: layer.weights!.map(row => row.map(() => (Math.random() - 0.5) * 2)),
        biases: layer.biases!.map(() => (Math.random() - 0.5)),
      };
    });
    setLayers(newLayers);
  };

  return (
    <div className="card p-6">
      <h3 className="font-semibold mb-2">Neural Network Forward Pass</h3>
      <p className="text-sm text-[var(--text-muted)] mb-6">
        Watch data flow through a neural network. Each neuron computes a weighted sum of inputs,
        adds a bias, then applies an activation function.
      </p>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Network visualization */}
        <div className="md:col-span-2">
          <canvas
            ref={canvasRef}
            width={500}
            height={300}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)]"
          />

          {/* Controls */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={forwardPass}
              disabled={isForwardPassing}
              className={`px-4 py-2 rounded font-medium text-sm transition-colors ${
                isForwardPassing
                  ? 'bg-[var(--border)] text-[var(--text-muted)]'
                  : 'bg-[var(--accent)] text-white'
              }`}
            >
              {isForwardPassing ? 'Processing...' : 'Forward Pass'}
            </button>
            <button
              onClick={randomizeWeights}
              className="badge hover:border-[var(--border-strong)]"
            >
              Randomize Weights
            </button>
            <button
              onClick={() => setShowWeights(!showWeights)}
              className="badge hover:border-[var(--border-strong)]"
            >
              {showWeights ? 'Hide' : 'Show'} Weights
            </button>
          </div>
        </div>

        {/* Controls panel */}
        <div className="space-y-4">
          {/* Input values */}
          <div className="p-4 bg-[var(--surface-2)] rounded">
            <p className="font-medium text-sm mb-3">Input Values</p>
            {inputValues.map((val, i) => (
              <div key={i} className="mb-2">
                <div className="flex justify-between text-xs mb-1">
                  <span>x{i + 1}</span>
                  <span className="font-mono">{val.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={val}
                  onChange={(e) => {
                    const newInputs = [...inputValues];
                    newInputs[i] = Number(e.target.value);
                    setInputValues(newInputs);
                  }}
                  className="w-full"
                />
              </div>
            ))}
          </div>

          {/* Activation function */}
          <div className="p-4 bg-[var(--surface-2)] rounded">
            <p className="font-medium text-sm mb-3">Activation Function</p>
            <div className="space-y-2">
              {Object.entries(ACTIVATION_FUNCTIONS).map(([key, { name, formula }]) => (
                <button
                  key={key}
                  onClick={() => setActivationFn(key as keyof typeof ACTIVATION_FUNCTIONS)}
                  className={`w-full p-2 rounded text-left text-sm transition-colors ${
                    activationFn === key
                      ? 'bg-[var(--accent)] text-white'
                      : 'bg-[var(--surface-0)] hover:bg-[var(--border)]'
                  }`}
                >
                  <span className="font-medium">{name}</span>
                  <span className="text-xs ml-2 opacity-70">{formula}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Output */}
          {layers.length > 0 && (
            <div className="p-4 bg-[var(--surface-2)] rounded">
              <p className="font-medium text-sm mb-2">Output</p>
              <div className="grid grid-cols-2 gap-2">
                {layers[layers.length - 1]?.neurons.map((n, i) => (
                  <div key={i} className="p-2 bg-[var(--surface-0)] rounded text-center">
                    <p className="text-xs text-[var(--text-muted)]">y{i + 1}</p>
                    <p className="font-mono font-bold">{n.activated.toFixed(3)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Explanation */}
      <div className="mt-6 p-4 bg-[var(--surface-2)] rounded">
        <p className="font-medium mb-2">The Forward Pass Equation</p>
        <code className="text-sm block mb-2 font-mono">
          output = activation(Σ(weight × input) + bias)
        </code>
        <p className="text-xs text-[var(--text-muted)]">
          Green connections = positive weights (amplify signal), Red = negative weights (inhibit signal).
          Line thickness shows weight magnitude. This is how diffusion U-Nets, face encoders, and LLMs process data.
        </p>
      </div>
    </div>
  );
}

export default NeuralNetworkDemo;
