'use client';

import { useState, useRef, useEffect } from 'react';

export function AttentionMechanismDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [queryIndex, setQueryIndex] = useState(2);
  const [showWeights, setShowWeights] = useState(true);
  const [attentionType, setAttentionType] = useState<'self' | 'cross'>('self');
  const [temperature, setTemperature] = useState(1);

  // Tokens
  const sourceTokens = ['The', 'cat', 'sat', 'on', 'mat'];
  const targetTokens = attentionType === 'self' ? sourceTokens : ['Le', 'chat', 'assis', 'sur', 'tapis'];

  // Simulated attention weights (normalized per query)
  const getAttentionWeights = (qIdx: number): number[] => {
    // Create base similarity pattern
    const baseWeights = sourceTokens.map((_, i) => {
      // Higher weight for semantically related positions
      let weight = Math.exp(-Math.abs(i - qIdx) / temperature);

      // Add some semantic relationships
      if (attentionType === 'cross') {
        // Cross-lingual alignments
        if (qIdx === i) weight *= 2; // Direct translation
        if ((qIdx === 0 && i === 0) || (qIdx === 1 && i === 1)) weight *= 1.5;
      } else {
        // Self-attention patterns
        if (i === qIdx) weight *= 1.5; // Self-reference
        if (Math.abs(i - qIdx) === 1) weight *= 1.2; // Adjacent tokens
      }

      return weight;
    });

    // Softmax normalization
    const sum = baseWeights.reduce((a, b) => a + b, 0);
    return baseWeights.map(w => w / sum);
  };

  const weights = getAttentionWeights(queryIndex);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    // Token positions
    const tokenWidth = 60;
    const tokenHeight = 30;
    const startX = 80;
    const sourceY = 50;
    const targetY = height - 80;
    const tokenSpacing = (width - startX * 2) / (sourceTokens.length - 1);

    // Draw labels
    ctx.fillStyle = '#888888';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(attentionType === 'self' ? 'Keys (K) / Values (V)' : 'Source (Keys/Values)', 10, sourceY);
    ctx.fillText(attentionType === 'self' ? 'Queries (Q)' : 'Target (Queries)', 10, targetY);

    // Draw source tokens (Keys/Values)
    sourceTokens.forEach((token, i) => {
      const x = startX + i * tokenSpacing;
      const weight = weights[i];

      // Highlight based on attention weight
      const highlightIntensity = weight * 255;

      ctx.fillStyle = `rgba(100, ${150 + highlightIntensity * 0.4}, 255, ${0.3 + weight * 0.7})`;
      ctx.fillRect(x - tokenWidth / 2, sourceY, tokenWidth, tokenHeight);
      ctx.strokeStyle = `rgba(100, 170, 255, ${0.5 + weight * 0.5})`;
      ctx.lineWidth = weight > 0.2 ? 2 : 1;
      ctx.strokeRect(x - tokenWidth / 2, sourceY, tokenWidth, tokenHeight);

      // Token text
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(token, x, sourceY + tokenHeight / 2 + 4);

      // Weight label
      if (showWeights) {
        ctx.fillStyle = '#aaaaaa';
        ctx.font = '9px monospace';
        ctx.fillText((weight * 100).toFixed(0) + '%', x, sourceY + tokenHeight + 15);
      }
    });

    // Draw target tokens (Queries)
    targetTokens.forEach((token, i) => {
      const x = startX + i * tokenSpacing;
      const isSelected = i === queryIndex;

      ctx.fillStyle = isSelected ? 'rgba(255, 150, 100, 0.8)' : 'rgba(60, 60, 80, 0.8)';
      ctx.fillRect(x - tokenWidth / 2, targetY, tokenWidth, tokenHeight);
      ctx.strokeStyle = isSelected ? '#ffaa66' : '#444466';
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.strokeRect(x - tokenWidth / 2, targetY, tokenWidth, tokenHeight);

      // Token text
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(token, x, targetY + tokenHeight / 2 + 4);

      // Index label
      ctx.fillStyle = '#666666';
      ctx.font = '9px monospace';
      ctx.fillText(`[${i}]`, x, targetY + tokenHeight + 12);
    });

    // Draw attention connections
    const queryX = startX + queryIndex * tokenSpacing;

    sourceTokens.forEach((_, i) => {
      const keyX = startX + i * tokenSpacing;
      const weight = weights[i];

      if (weight > 0.05) {
        // Draw curved connection
        ctx.beginPath();
        ctx.moveTo(queryX, targetY);

        // Control point for curve
        const midY = (sourceY + tokenHeight + targetY) / 2;
        ctx.quadraticCurveTo(
          (queryX + keyX) / 2,
          midY + (Math.abs(queryIndex - i) * 10),
          keyX,
          sourceY + tokenHeight
        );

        ctx.strokeStyle = `rgba(255, 170, 100, ${weight})`;
        ctx.lineWidth = 1 + weight * 4;
        ctx.stroke();

        // Arrow head at key
        const arrowSize = 5 + weight * 3;
        ctx.beginPath();
        ctx.moveTo(keyX, sourceY + tokenHeight + 2);
        ctx.lineTo(keyX - arrowSize, sourceY + tokenHeight + arrowSize + 2);
        ctx.lineTo(keyX + arrowSize, sourceY + tokenHeight + arrowSize + 2);
        ctx.closePath();
        ctx.fillStyle = `rgba(255, 170, 100, ${weight})`;
        ctx.fill();
      }
    });

    // Draw attention formula
    ctx.fillStyle = '#666688';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Attention(Q,K,V) = softmax(QK^T / √d) · V', width / 2, height - 20);

    // Temperature indicator
    ctx.fillStyle = '#888888';
    ctx.textAlign = 'left';
    ctx.fillText(`Temperature: ${temperature.toFixed(1)}`, width - 120, 25);

  }, [queryIndex, weights, showWeights, attentionType, temperature, sourceTokens, targetTokens]);

  return (
    <div className="card p-6">
      <h3 className="font-semibold mb-2">Attention Mechanism</h3>
      <p className="text-sm text-[var(--muted)] mb-4">
        Attention allows models to focus on relevant parts of the input. Click different query tokens to see attention patterns.
      </p>

      <canvas
        ref={canvasRef}
        width={500}
        height={280}
        className="w-full max-w-[500px] mb-4 rounded"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="text-xs text-[var(--muted)] block mb-1">Query Token: [{queryIndex}]</label>
          <input
            type="range"
            min="0"
            max={targetTokens.length - 1}
            value={queryIndex}
            onChange={(e) => setQueryIndex(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="text-xs text-[var(--muted)] block mb-1">Attention Type</label>
          <select
            value={attentionType}
            onChange={(e) => setAttentionType(e.target.value as 'self' | 'cross')}
            className="w-full px-2 py-1 rounded bg-[var(--card-bg)] border border-[var(--border)] text-sm"
          >
            <option value="self">Self-Attention</option>
            <option value="cross">Cross-Attention</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-[var(--muted)] block mb-1">Temperature: {temperature.toFixed(1)}</label>
          <input
            type="range"
            min="0.1"
            max="3"
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showWeights}
              onChange={(e) => setShowWeights(e.target.checked)}
            />
            Show weights
          </label>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3 text-xs">
        <div className="p-3 bg-[var(--card-bg-alt)] rounded">
          <p className="font-medium mb-1">Self-Attention</p>
          <p className="text-[var(--muted)]">Each token attends to all other tokens in the same sequence. Used in transformers for context understanding.</p>
        </div>
        <div className="p-3 bg-[var(--card-bg-alt)] rounded">
          <p className="font-medium mb-1">Cross-Attention</p>
          <p className="text-[var(--muted)]">Query attends to different sequence (e.g., audio → video). Used for conditioning generation on external signals.</p>
        </div>
      </div>
    </div>
  );
}
