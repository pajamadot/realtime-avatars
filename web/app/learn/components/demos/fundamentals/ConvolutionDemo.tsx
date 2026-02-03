'use client';

import { useState, useEffect, useRef } from 'react';

type KernelType = 'identity' | 'blur' | 'sharpen' | 'edge' | 'emboss';

const KERNELS: Record<KernelType, { name: string; values: number[][]; description: string }> = {
  identity: {
    name: 'Identity',
    values: [[0, 0, 0], [0, 1, 0], [0, 0, 0]],
    description: 'No change - outputs the input pixel',
  },
  blur: {
    name: 'Blur (Box)',
    values: [[1/9, 1/9, 1/9], [1/9, 1/9, 1/9], [1/9, 1/9, 1/9]],
    description: 'Averages neighbors - smooths the image',
  },
  sharpen: {
    name: 'Sharpen',
    values: [[0, -1, 0], [-1, 5, -1], [0, -1, 0]],
    description: 'Enhances edges - makes details pop',
  },
  edge: {
    name: 'Edge Detect',
    values: [[-1, -1, -1], [-1, 8, -1], [-1, -1, -1]],
    description: 'Finds boundaries - outputs edges only',
  },
  emboss: {
    name: 'Emboss',
    values: [[-2, -1, 0], [-1, 1, 1], [0, 1, 2]],
    description: '3D effect - creates shadow/highlight',
  },
};

export function ConvolutionDemo() {
  const [selectedKernel, setSelectedKernel] = useState<KernelType>('blur');
  const [kernelPosition, setKernelPosition] = useState({ x: 3, y: 3 });
  const [isAnimating, setIsAnimating] = useState(false);
  const [showCalculation, setShowCalculation] = useState(true);
  const inputCanvasRef = useRef<HTMLCanvasElement>(null);
  const outputCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  const gridSize = 8;
  const cellSize = 35;

  // Generate simple pattern
  const [inputImage] = useState<number[][]>(() => {
    const img: number[][] = [];
    for (let y = 0; y < gridSize; y++) {
      img[y] = [];
      for (let x = 0; x < gridSize; x++) {
        // Create a simple pattern with a bright square
        if (x >= 2 && x <= 5 && y >= 2 && y <= 5) {
          img[y][x] = 200;
        } else {
          img[y][x] = 50;
        }
      }
    }
    return img;
  });

  // Apply convolution
  const applyConvolution = (img: number[][], kernel: number[][]): number[][] => {
    const output: number[][] = [];
    for (let y = 0; y < gridSize; y++) {
      output[y] = [];
      for (let x = 0; x < gridSize; x++) {
        let sum = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const imgY = Math.max(0, Math.min(gridSize - 1, y + ky));
            const imgX = Math.max(0, Math.min(gridSize - 1, x + kx));
            sum += img[imgY][imgX] * kernel[ky + 1][kx + 1];
          }
        }
        output[y][x] = Math.max(0, Math.min(255, sum));
      }
    }
    return output;
  };

  const [outputImage, setOutputImage] = useState<number[][]>(() =>
    applyConvolution(inputImage, KERNELS.blur.values)
  );

  // Update output when kernel changes
  useEffect(() => {
    setOutputImage(applyConvolution(inputImage, KERNELS[selectedKernel].values));
  }, [selectedKernel, inputImage]);

  // Animation
  useEffect(() => {
    if (!isAnimating) {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
      return;
    }

    animationRef.current = setInterval(() => {
      setKernelPosition(prev => {
        let newX = prev.x + 1;
        let newY = prev.y;
        if (newX > gridSize - 2) {
          newX = 1;
          newY = prev.y + 1;
          if (newY > gridSize - 2) {
            newY = 1;
          }
        }
        return { x: newX, y: newY };
      });
    }, 500) as unknown as number;

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [isAnimating]);

  // Render input grid
  useEffect(() => {
    const canvas = inputCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const value = inputImage[y][x];
        ctx.fillStyle = `rgb(${value}, ${value}, ${value})`;
        ctx.fillRect(x * cellSize + 1, y * cellSize + 1, cellSize - 2, cellSize - 2);

        // Value label
        ctx.fillStyle = value > 127 ? '#000' : '#fff';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(value), x * cellSize + cellSize / 2, y * cellSize + cellSize / 2);
      }
    }

    // Draw kernel overlay
    const kx = kernelPosition.x;
    const ky = kernelPosition.y;
    ctx.strokeStyle = '#ff6b6b';
    ctx.lineWidth = 2;
    ctx.strokeRect(
      (kx - 1) * cellSize,
      (ky - 1) * cellSize,
      cellSize * 3,
      cellSize * 3
    );

    // Highlight center
    ctx.fillStyle = 'rgba(255, 107, 107, 0.3)';
    ctx.fillRect(kx * cellSize, ky * cellSize, cellSize, cellSize);

  }, [inputImage, kernelPosition]);

  // Render output grid
  useEffect(() => {
    const canvas = outputCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const value = Math.round(outputImage[y][x]);
        ctx.fillStyle = `rgb(${value}, ${value}, ${value})`;
        ctx.fillRect(x * cellSize + 1, y * cellSize + 1, cellSize - 2, cellSize - 2);

        ctx.fillStyle = value > 127 ? '#000' : '#fff';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(value), x * cellSize + cellSize / 2, y * cellSize + cellSize / 2);
      }
    }

    // Highlight current output position
    ctx.strokeStyle = '#2ecc71';
    ctx.lineWidth = 2;
    ctx.strokeRect(
      kernelPosition.x * cellSize,
      kernelPosition.y * cellSize,
      cellSize,
      cellSize
    );

  }, [outputImage, kernelPosition]);

  // Calculate current convolution
  const kernel = KERNELS[selectedKernel].values;
  const kx = kernelPosition.x;
  const ky = kernelPosition.y;
  let calculation = '';
  let sum = 0;

  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const imgY = Math.max(0, Math.min(gridSize - 1, ky + dy));
      const imgX = Math.max(0, Math.min(gridSize - 1, kx + dx));
      const imgVal = inputImage[imgY][imgX];
      const kernelVal = kernel[dy + 1][dx + 1];
      sum += imgVal * kernelVal;
      if (calculation) calculation += ' + ';
      calculation += `${imgVal}×${kernelVal.toFixed(2)}`;
    }
  }

  return (
    <div className="card p-6">
      <h3 className="font-semibold mb-2">Convolution Operation</h3>
      <p className="text-sm text-[var(--muted)] mb-6">
        Convolution slides a kernel (filter) over the image, computing weighted sums.
        This is the core operation in CNNs used for face recognition and image generation.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Grids */}
        <div>
          <div className="flex gap-4 mb-4">
            <div>
              <p className="text-xs text-[var(--muted)] mb-1 text-center">Input</p>
              <canvas
                ref={inputCanvasRef}
                width={gridSize * cellSize}
                height={gridSize * cellSize}
                className="rounded border border-[var(--border)]"
              />
            </div>
            <div>
              <p className="text-xs text-[var(--muted)] mb-1 text-center">Output</p>
              <canvas
                ref={outputCanvasRef}
                width={gridSize * cellSize}
                height={gridSize * cellSize}
                className="rounded border border-[var(--border)]"
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            <button
              onClick={() => setIsAnimating(!isAnimating)}
              className={`flex-1 py-2 rounded font-medium text-sm transition-colors ${
                isAnimating ? 'bg-red-500 text-white' : 'bg-[var(--accent)] text-white'
              }`}
            >
              {isAnimating ? 'Stop' : 'Animate'}
            </button>
            <button
              onClick={() => setShowCalculation(!showCalculation)}
              className={`badge ${showCalculation ? 'bg-[var(--accent)]/20' : ''}`}
            >
              Math
            </button>
          </div>

          {/* Calculation */}
          {showCalculation && (
            <div className="mt-3 p-3 bg-[var(--card-bg-alt)] rounded text-xs font-mono">
              <p className="text-[var(--muted)] mb-1">At position ({kx}, {ky}):</p>
              <p className="break-all">{calculation}</p>
              <p className="mt-1 font-bold">= {Math.round(Math.max(0, Math.min(255, sum)))}</p>
            </div>
          )}
        </div>

        {/* Kernel selector */}
        <div className="space-y-4">
          <div className="space-y-2">
            {(Object.keys(KERNELS) as KernelType[]).map(key => {
              const k = KERNELS[key];
              return (
                <button
                  key={key}
                  onClick={() => setSelectedKernel(key)}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    selectedKernel === key
                      ? 'border-2 border-[var(--accent)] bg-[var(--accent)]/10'
                      : 'border border-[var(--border)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  <p className="font-medium text-sm">{k.name}</p>
                  <p className="text-xs text-[var(--muted)]">{k.description}</p>
                </button>
              );
            })}
          </div>

          {/* Kernel visualization */}
          <div className="p-4 bg-[var(--card-bg-alt)] rounded">
            <p className="font-medium text-sm mb-2">Kernel Values</p>
            <div className="grid grid-cols-3 gap-1 w-fit mx-auto">
              {KERNELS[selectedKernel].values.flat().map((v, i) => (
                <div
                  key={i}
                  className="w-12 h-10 flex items-center justify-center text-xs font-mono rounded"
                  style={{
                    backgroundColor: v > 0 ? `rgba(46, 204, 113, ${Math.abs(v) * 0.5})` :
                                    v < 0 ? `rgba(231, 76, 60, ${Math.abs(v) * 0.5})` :
                                    'rgba(255,255,255,0.1)',
                  }}
                >
                  {v.toFixed(2)}
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 border border-[var(--border)] rounded text-sm">
            <p className="font-medium mb-1">In Neural Networks</p>
            <p className="text-xs text-[var(--muted)]">
              CNNs learn kernel values through backpropagation. Early layers detect edges,
              later layers detect complex patterns like eyes or noses. This is how face
              encoders extract identity features.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConvolutionDemo;
