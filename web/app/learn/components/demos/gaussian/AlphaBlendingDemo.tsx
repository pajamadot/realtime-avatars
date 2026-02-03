'use client';

import { useState, useCallback } from 'react';
import { Lightbulb } from 'lucide-react';
import ParameterSlider from '../../core/ParameterSlider';

interface Layer {
  id: string;
  color: string;
  alpha: number;
  label: string;
}

const defaultLayers: Layer[] = [
  { id: '1', color: '#ef4444', alpha: 0.7, label: 'Red (Front)' },
  { id: '2', color: '#22c55e', alpha: 0.6, label: 'Green (Middle)' },
  { id: '3', color: '#3b82f6', alpha: 0.8, label: 'Blue (Back)' },
];

export default function AlphaBlendingDemo() {
  const [layers, setLayers] = useState<Layer[]>(defaultLayers);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [showFormula, setShowFormula] = useState(false);

  // Compute blended color using alpha compositing formula
  const computeBlendedColor = useCallback(() => {
    let r = 0, g = 0, b = 0;
    let transmittance = 1;

    // Process front to back
    for (const layer of layers) {
      const hex = layer.color;
      const lr = parseInt(hex.slice(1, 3), 16) / 255;
      const lg = parseInt(hex.slice(3, 5), 16) / 255;
      const lb = parseInt(hex.slice(5, 7), 16) / 255;

      r += lr * layer.alpha * transmittance;
      g += lg * layer.alpha * transmittance;
      b += lb * layer.alpha * transmittance;

      transmittance *= (1 - layer.alpha);
    }

    // Add background (white)
    r += transmittance;
    g += transmittance;
    b += transmittance;

    return {
      color: `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`,
      transmittance,
      steps: layers.map((layer, i) => {
        let t = 1;
        for (let j = 0; j < i; j++) {
          t *= (1 - layers[j].alpha);
        }
        return { layer, transmittance: t, contribution: layer.alpha * t };
      }),
    };
  }, [layers]);

  const blendResult = computeBlendedColor();

  // Drag and drop handlers
  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const draggedIndex = layers.findIndex((l) => l.id === draggedId);
    const targetIndex = layers.findIndex((l) => l.id === targetId);

    const newLayers = [...layers];
    const [dragged] = newLayers.splice(draggedIndex, 1);
    newLayers.splice(targetIndex, 0, dragged);

    setLayers(newLayers);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
  };

  const updateLayerAlpha = (id: string, alpha: number) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, alpha } : l))
    );
  };

  const resetLayers = () => {
    setLayers(defaultLayers);
  };

  const shuffleLayers = () => {
    setLayers((prev) => {
      const shuffled = [...prev];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    });
  };

  return (
    <div className="card overflow-hidden">
      <div className="grid md:grid-cols-2">
        {/* Visual representation */}
        <div className="p-6 bg-black/5">
          <p className="text-sm text-[var(--muted)] mb-4">
            Drag layers to reorder (front to back):
          </p>

          {/* Layer stack visualization */}
          <div className="relative h-[250px] flex items-center justify-center">
            {/* Layers stacked with offset */}
            {[...layers].reverse().map((layer, i) => {
              const offset = i * 20;
              const zIndex = i;
              return (
                <div
                  key={layer.id}
                  draggable
                  onDragStart={() => handleDragStart(layer.id)}
                  onDragOver={(e) => handleDragOver(e, layer.id)}
                  onDragEnd={handleDragEnd}
                  className={`
                    absolute w-32 h-32 rounded-lg cursor-move
                    transition-all duration-200
                    ${draggedId === layer.id ? 'scale-110 shadow-xl' : 'hover:scale-105'}
                  `}
                  style={{
                    backgroundColor: layer.color,
                    opacity: layer.alpha,
                    transform: `translateX(${offset}px) translateY(${offset}px)`,
                    zIndex,
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm opacity-80">
                    α={layer.alpha.toFixed(1)}
                  </div>
                </div>
              );
            })}

            {/* Result preview */}
            <div
              className="absolute right-0 bottom-0 w-20 h-20 rounded-lg border-2 border-dashed border-[var(--border)]"
              style={{ backgroundColor: blendResult.color }}
            >
              <div className="absolute -top-6 left-0 text-xs text-[var(--muted)]">Result</div>
            </div>
          </div>

          {/* Layer list (draggable) */}
          <div className="mt-4 space-y-2">
            {layers.map((layer, i) => (
              <div
                key={layer.id}
                draggable
                onDragStart={() => handleDragStart(layer.id)}
                onDragOver={(e) => handleDragOver(e, layer.id)}
                onDragEnd={handleDragEnd}
                className={`
                  flex items-center gap-3 p-2 rounded cursor-move
                  ${draggedId === layer.id ? 'bg-[var(--card-bg-alt)]' : 'hover:bg-[var(--card-bg-alt)]'}
                `}
              >
                <span className="text-[var(--muted)]">☰</span>
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: layer.color }}
                />
                <span className="text-sm flex-1">{i === 0 ? 'Front' : i === layers.length - 1 ? 'Back' : `Layer ${i + 1}`}</span>
                <span className="text-xs text-[var(--muted)]">α={layer.alpha.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Controls and formula */}
        <div className="p-6 border-l border-[var(--border)]">
          <h4 className="font-semibold mb-4">Alpha Controls</h4>

          {layers.map((layer) => (
            <ParameterSlider
              key={layer.id}
              label={`${layer.label} opacity`}
              value={layer.alpha}
              min={0}
              max={1}
              onChange={(v) => updateLayerAlpha(layer.id, v)}
              color={layer.color}
            />
          ))}

          <div className="flex gap-2 mt-4">
            <button
              type="button"
              onClick={shuffleLayers}
              className="flex-1 badge hover:border-[var(--border-strong)] text-center"
            >
              Shuffle Order
            </button>
            <button
              type="button"
              onClick={resetLayers}
              className="flex-1 badge hover:border-[var(--border-strong)] text-center"
            >
              Reset
            </button>
          </div>

          {/* Formula toggle */}
          <div className="mt-6 pt-4 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={() => setShowFormula(!showFormula)}
              className="text-sm text-[var(--accent)] hover:underline flex items-center gap-2"
            >
              <span>{showFormula ? '▼' : '▶'}</span>
              Show math
            </button>

            {showFormula && (
              <div className="mt-4 p-4 bg-[var(--card-bg-alt)] rounded text-sm font-mono">
                <p className="text-[var(--muted)] mb-2">Alpha Compositing (front-to-back):</p>
                <p className="mb-4">C = Σ(cᵢ × αᵢ × Tᵢ)</p>
                <p className="text-[var(--muted)] mb-2">where Tᵢ = transmittance:</p>
                <p>Tᵢ = Π(1 - αⱼ) for j &lt; i</p>

                <div className="mt-4 pt-4 border-t border-[var(--border)]">
                  <p className="text-[var(--muted)] mb-2">Current calculation:</p>
                  {blendResult.steps.map((step, i) => (
                    <p key={step.layer.id} className="text-xs">
                      Layer {i + 1}: T={step.transmittance.toFixed(2)}, contribution={step.contribution.toFixed(2)}
                    </p>
                  ))}
                  <p className="text-xs mt-2">
                    Final transmittance: {blendResult.transmittance.toFixed(2)} (reaches background)
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Insight */}
      <div className="p-4 bg-[var(--card-bg-alt)] border-t border-[var(--border)] text-sm text-[var(--muted)] flex items-start gap-2">
        <Lightbulb size={16} className="text-yellow-500 flex-shrink-0 mt-0.5" />
        <span><strong>Key insight:</strong> Order matters! Swap the front and back layers and notice how the result changes.
        This is why 3DGS must sort all Gaussians by depth before rendering each frame.</span>
      </div>
    </div>
  );
}
