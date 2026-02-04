'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface Neuron {
  x: number;
  y: number;
  active: boolean;
  value: number;
}

export function DropoutDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dropoutRate, setDropoutRate] = useState(0.3);
  const [isTraining, setIsTraining] = useState(true);
  const [neurons, setNeurons] = useState<Neuron[][]>([]);
  const [iteration, setIteration] = useState(0);

  // Initialize network
  useEffect(() => {
    const layers = [4, 6, 6, 4, 2];
    const newNeurons: Neuron[][] = [];
    const width = 500;
    const layerSpacing = width / (layers.length + 1);

    layers.forEach((count, layerIdx) => {
      const layer: Neuron[] = [];
      const height = 250;
      const neuronSpacing = height / (count + 1);

      for (let i = 0; i < count; i++) {
        layer.push({
          x: layerSpacing * (layerIdx + 1),
          y: neuronSpacing * (i + 1) + 30,
          active: true,
          value: Math.random(),
        });
      }
      newNeurons.push(layer);
    });

    setNeurons(newNeurons);
  }, []);

  // Apply dropout randomly
  const applyDropout = useCallback(() => {
    if (!isTraining) return;

    setNeurons(prev => {
      return prev.map((layer, layerIdx) => {
        // Don't apply dropout to input or output layers
        if (layerIdx === 0 || layerIdx === prev.length - 1) {
          return layer.map(n => ({ ...n, active: true }));
        }

        return layer.map(neuron => ({
          ...neuron,
          active: Math.random() > dropoutRate,
          value: Math.random(),
        }));
      });
    });
    setIteration(prev => prev + 1);
  }, [dropoutRate, isTraining]);

  // Animation loop
  useEffect(() => {
    const interval = setInterval(applyDropout, 1000);
    return () => clearInterval(interval);
  }, [applyDropout]);

  // When switching to inference mode, activate all neurons
  useEffect(() => {
    if (!isTraining) {
      setNeurons(prev =>
        prev.map(layer =>
          layer.map(neuron => ({
            ...neuron,
            active: true,
            // Scale values by (1 - dropoutRate) to compensate
            value: neuron.value * (1 - dropoutRate),
          }))
        )
      );
    }
  }, [isTraining, dropoutRate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || neurons.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    // Draw title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(isTraining ? 'Training Mode (Dropout Active)' : 'Inference Mode (All Active)', 20, 25);

    // Draw iteration counter
    ctx.fillStyle = '#888888';
    ctx.font = '11px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`Iteration: ${iteration}`, width - 20, 25);

    // Draw connections first (behind neurons)
    for (let l = 0; l < neurons.length - 1; l++) {
      const currentLayer = neurons[l];
      const nextLayer = neurons[l + 1];

      for (const fromNeuron of currentLayer) {
        for (const toNeuron of nextLayer) {
          const isActive = fromNeuron.active && toNeuron.active;

          ctx.strokeStyle = isActive
            ? `rgba(100, 150, 255, ${0.3 + fromNeuron.value * 0.4})`
            : 'rgba(100, 100, 100, 0.1)';
          ctx.lineWidth = isActive ? 1.5 : 0.5;

          ctx.beginPath();
          ctx.moveTo(fromNeuron.x, fromNeuron.y);
          ctx.lineTo(toNeuron.x, toNeuron.y);
          ctx.stroke();
        }
      }
    }

    // Draw neurons
    neurons.forEach((layer, layerIdx) => {
      layer.forEach(neuron => {
        const radius = 12;

        if (neuron.active) {
          // Active neuron
          const gradient = ctx.createRadialGradient(
            neuron.x, neuron.y, 0,
            neuron.x, neuron.y, radius
          );
          gradient.addColorStop(0, `rgba(100, 200, 255, ${0.5 + neuron.value * 0.5})`);
          gradient.addColorStop(1, `rgba(50, 100, 200, ${0.3 + neuron.value * 0.4})`);

          ctx.beginPath();
          ctx.arc(neuron.x, neuron.y, radius, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
          ctx.strokeStyle = '#66aaff';
          ctx.lineWidth = 2;
          ctx.stroke();
        } else {
          // Dropped neuron
          ctx.beginPath();
          ctx.arc(neuron.x, neuron.y, radius, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(60, 60, 80, 0.5)';
          ctx.fill();
          ctx.strokeStyle = '#ff6666';
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 3]);
          ctx.stroke();
          ctx.setLineDash([]);

          // X mark
          ctx.strokeStyle = '#ff6666';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(neuron.x - 5, neuron.y - 5);
          ctx.lineTo(neuron.x + 5, neuron.y + 5);
          ctx.moveTo(neuron.x + 5, neuron.y - 5);
          ctx.lineTo(neuron.x - 5, neuron.y + 5);
          ctx.stroke();
        }
      });

      // Layer label
      if (layer.length > 0) {
        ctx.fillStyle = '#666666';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        const label = layerIdx === 0 ? 'Input' :
                     layerIdx === neurons.length - 1 ? 'Output' :
                     `Hidden ${layerIdx}`;
        ctx.fillText(label, layer[0].x, height - 10);
      }
    });

    // Draw dropout statistics
    const hiddenLayers = neurons.slice(1, -1);
    const totalHidden = hiddenLayers.flat().length;
    const activeHidden = hiddenLayers.flat().filter(n => n.active).length;
    const actualDropout = 1 - (activeHidden / totalHidden);

    ctx.fillStyle = '#888888';
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`Target dropout: ${(dropoutRate * 100).toFixed(0)}%`, 20, height - 35);
    ctx.fillText(`Actual: ${(actualDropout * 100).toFixed(0)}% (${totalHidden - activeHidden}/${totalHidden} dropped)`, 20, height - 20);

  }, [neurons, isTraining, iteration, dropoutRate]);

  return (
    <div className="card p-6">
      <h3 className="font-semibold mb-2">Dropout Regularization</h3>
      <p className="text-sm text-[var(--text-muted)] mb-4">
        Dropout randomly deactivates neurons during training to prevent overfitting. Watch neurons get "dropped" each iteration.
      </p>

      <canvas
        ref={canvasRef}
        width={500}
        height={300}
        className="w-full max-w-[500px] mb-4 rounded"
      />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="text-xs text-[var(--text-muted)] block mb-1">Dropout Rate: {(dropoutRate * 100).toFixed(0)}%</label>
          <input
            type="range"
            min="0"
            max="0.8"
            step="0.1"
            value={dropoutRate}
            onChange={(e) => setDropoutRate(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isTraining}
              onChange={(e) => setIsTraining(e.target.checked)}
            />
            Training mode
          </label>
        </div>
        <div className="flex items-end">
          <button
            onClick={applyDropout}
            className="px-3 py-1.5 text-sm bg-[var(--surface-0)] border border-[var(--border)] rounded hover:border-[var(--border-strong)]"
          >
            Resample
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3 text-xs">
        <div className="p-3 bg-[var(--surface-2)] rounded">
          <p className="font-medium mb-1">Training</p>
          <p className="text-[var(--text-muted)]">Random neurons deactivated each forward pass. Forces network to learn redundant representations.</p>
        </div>
        <div className="p-3 bg-[var(--surface-2)] rounded">
          <p className="font-medium mb-1">Inference</p>
          <p className="text-[var(--text-muted)]">All neurons active, but outputs scaled by (1-p) to match expected training statistics.</p>
        </div>
      </div>
    </div>
  );
}
