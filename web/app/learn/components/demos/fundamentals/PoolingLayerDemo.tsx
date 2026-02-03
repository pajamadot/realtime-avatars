'use client';

import { useState, useRef, useEffect } from 'react';

type PoolingType = 'max' | 'average' | 'global_max' | 'global_avg';

export function PoolingLayerDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [poolingType, setPoolingType] = useState<PoolingType>('max');
  const [poolSize, setPoolSize] = useState(2);
  const [stride, setStride] = useState(2);
  const [highlightCell, setHighlightCell] = useState<{x: number, y: number} | null>(null);

  // 6x6 input feature map
  const inputSize = 6;
  const [inputData] = useState(() => {
    const data: number[][] = [];
    for (let i = 0; i < inputSize; i++) {
      data[i] = [];
      for (let j = 0; j < inputSize; j++) {
        data[i][j] = Math.floor(Math.random() * 100);
      }
    }
    return data;
  });

  // Calculate output size
  const outputSize = poolingType.startsWith('global')
    ? 1
    : Math.floor((inputSize - poolSize) / stride) + 1;

  // Apply pooling
  const applyPooling = (startRow: number, startCol: number, pSize: number): number => {
    const values: number[] = [];
    for (let i = 0; i < pSize; i++) {
      for (let j = 0; j < pSize; j++) {
        if (startRow + i < inputSize && startCol + j < inputSize) {
          values.push(inputData[startRow + i][startCol + j]);
        }
      }
    }

    if (poolingType === 'max' || poolingType === 'global_max') {
      return Math.max(...values);
    } else {
      return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
    }
  };

  // Generate output data
  const outputData: number[][] = [];
  if (poolingType.startsWith('global')) {
    outputData[0] = [applyPooling(0, 0, inputSize)];
  } else {
    for (let i = 0; i < outputSize; i++) {
      outputData[i] = [];
      for (let j = 0; j < outputSize; j++) {
        outputData[i][j] = applyPooling(i * stride, j * stride, poolSize);
      }
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    const cellSize = 40;
    const inputStartX = 30;
    const inputStartY = 60;
    const outputStartX = 350;
    const outputStartY = poolingType.startsWith('global') ? 140 : 80;

    // Draw title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('Input Feature Map', inputStartX, 40);
    ctx.fillText('Output', outputStartX, 40);

    // Draw input grid
    for (let i = 0; i < inputSize; i++) {
      for (let j = 0; j < inputSize; j++) {
        const x = inputStartX + j * cellSize;
        const y = inputStartY + i * cellSize;

        // Check if this cell is part of the highlighted pooling window
        let isHighlighted = false;
        if (highlightCell && !poolingType.startsWith('global')) {
          const windowStartRow = highlightCell.y * stride;
          const windowStartCol = highlightCell.x * stride;
          if (i >= windowStartRow && i < windowStartRow + poolSize &&
              j >= windowStartCol && j < windowStartCol + poolSize) {
            isHighlighted = true;
          }
        } else if (highlightCell && poolingType.startsWith('global')) {
          isHighlighted = true;
        }

        // Color based on value intensity
        const intensity = inputData[i][j] / 100;
        if (isHighlighted) {
          ctx.fillStyle = `rgba(100, 200, 255, ${0.3 + intensity * 0.7})`;
        } else {
          ctx.fillStyle = `rgba(100, 100, 200, ${0.2 + intensity * 0.5})`;
        }
        ctx.fillRect(x, y, cellSize - 2, cellSize - 2);

        // Draw value
        ctx.fillStyle = isHighlighted ? '#ffffff' : '#cccccc';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(inputData[i][j].toString(), x + cellSize / 2 - 1, y + cellSize / 2 + 4);
      }
    }

    // Draw arrow
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(inputStartX + inputSize * cellSize + 20, height / 2);
    ctx.lineTo(outputStartX - 20, height / 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(outputStartX - 20, height / 2);
    ctx.lineTo(outputStartX - 30, height / 2 - 8);
    ctx.lineTo(outputStartX - 30, height / 2 + 8);
    ctx.closePath();
    ctx.fillStyle = '#666666';
    ctx.fill();

    // Draw pooling type label
    ctx.fillStyle = '#888888';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    const poolLabel = poolingType === 'max' ? `Max ${poolSize}×${poolSize}` :
                      poolingType === 'average' ? `Avg ${poolSize}×${poolSize}` :
                      poolingType === 'global_max' ? 'Global Max' : 'Global Avg';
    ctx.fillText(poolLabel, (inputStartX + inputSize * cellSize + outputStartX) / 2, height / 2 - 15);

    // Draw output grid
    const actualOutputSize = poolingType.startsWith('global') ? 1 : outputSize;
    for (let i = 0; i < actualOutputSize; i++) {
      for (let j = 0; j < actualOutputSize; j++) {
        const x = outputStartX + j * cellSize;
        const y = outputStartY + i * cellSize;

        const isHighlighted = highlightCell && highlightCell.x === j && highlightCell.y === i;

        const intensity = outputData[i][j] / 100;
        if (isHighlighted) {
          ctx.fillStyle = `rgba(255, 200, 100, ${0.5 + intensity * 0.5})`;
        } else {
          ctx.fillStyle = `rgba(200, 150, 100, ${0.3 + intensity * 0.5})`;
        }
        ctx.fillRect(x, y, cellSize - 2, cellSize - 2);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(outputData[i][j].toString(), x + cellSize / 2 - 1, y + cellSize / 2 + 4);
      }
    }

    // Draw output size annotation
    ctx.fillStyle = '#888888';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`${actualOutputSize}×${actualOutputSize}`, outputStartX, outputStartY + actualOutputSize * cellSize + 20);
    ctx.fillText(`${inputSize}×${inputSize}`, inputStartX, inputStartY + inputSize * cellSize + 20);

    // Draw explanation
    if (highlightCell && !poolingType.startsWith('global')) {
      const windowStartRow = highlightCell.y * stride;
      const windowStartCol = highlightCell.x * stride;
      const windowValues: number[] = [];
      for (let i = 0; i < poolSize; i++) {
        for (let j = 0; j < poolSize; j++) {
          if (windowStartRow + i < inputSize && windowStartCol + j < inputSize) {
            windowValues.push(inputData[windowStartRow + i][windowStartCol + j]);
          }
        }
      }

      ctx.fillStyle = '#aaaaaa';
      ctx.font = '11px monospace';
      ctx.textAlign = 'left';
      const operation = poolingType === 'max' ? 'max' : 'avg';
      ctx.fillText(`${operation}([${windowValues.join(', ')}]) = ${outputData[highlightCell.y][highlightCell.x]}`, 30, height - 20);
    }

  }, [inputData, outputData, poolingType, poolSize, stride, highlightCell, inputSize, outputSize]);

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const cellSize = 40;
    const outputStartX = 350;
    const outputStartY = poolingType.startsWith('global') ? 140 : 80;
    const actualOutputSize = poolingType.startsWith('global') ? 1 : outputSize;

    // Check if hovering over output grid
    const col = Math.floor((x - outputStartX) / cellSize);
    const row = Math.floor((y - outputStartY) / cellSize);

    if (col >= 0 && col < actualOutputSize && row >= 0 && row < actualOutputSize) {
      setHighlightCell({ x: col, y: row });
    } else {
      setHighlightCell(null);
    }
  };

  return (
    <div className="card p-6">
      <h3 className="font-semibold mb-2">Pooling Layers</h3>
      <p className="text-sm text-[var(--muted)] mb-4">
        Pooling reduces spatial dimensions while preserving important features. Hover over output cells to see the pooling window.
      </p>

      <canvas
        ref={canvasRef}
        width={500}
        height={340}
        className="w-full max-w-[500px] mb-4 rounded cursor-crosshair"
        onMouseMove={handleCanvasMouseMove}
        onMouseLeave={() => setHighlightCell(null)}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="text-xs text-[var(--muted)] block mb-1">Pooling Type</label>
          <select
            value={poolingType}
            onChange={(e) => setPoolingType(e.target.value as PoolingType)}
            className="w-full px-2 py-1 rounded bg-[var(--card-bg)] border border-[var(--border)] text-sm"
          >
            <option value="max">Max Pooling</option>
            <option value="average">Average Pooling</option>
            <option value="global_max">Global Max</option>
            <option value="global_avg">Global Average</option>
          </select>
        </div>

        {!poolingType.startsWith('global') && (
          <>
            <div>
              <label className="text-xs text-[var(--muted)] block mb-1">Pool Size: {poolSize}×{poolSize}</label>
              <input
                type="range"
                min="2"
                max="3"
                value={poolSize}
                onChange={(e) => setPoolSize(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-xs text-[var(--muted)] block mb-1">Stride: {stride}</label>
              <input
                type="range"
                min="1"
                max="3"
                value={stride}
                onChange={(e) => setStride(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4 text-xs">
        <div className="p-3 bg-[var(--card-bg-alt)] rounded">
          <p className="font-medium mb-1">Max Pooling</p>
          <p className="text-[var(--muted)]">Takes the maximum value in each window. Preserves the strongest activations and provides translation invariance.</p>
        </div>
        <div className="p-3 bg-[var(--card-bg-alt)] rounded">
          <p className="font-medium mb-1">Average Pooling</p>
          <p className="text-[var(--muted)]">Takes the mean of values. Smoother downsampling, often used in final layers before classification.</p>
        </div>
      </div>
    </div>
  );
}
