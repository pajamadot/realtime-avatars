'use client';

import { useState, useRef, useEffect } from 'react';

export function VAEDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [latentDim1, setLatentDim1] = useState(0);
  const [latentDim2, setLatentDim2] = useState(0);
  const [showSampling, setShowSampling] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'encode' | 'latent' | 'decode'>('encode');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    // Draw VAE architecture
    const encoderX = 60;
    const latentX = width / 2;
    const decoderX = width - 60;
    const centerY = height / 2;

    // Helper function to draw a neural network layer
    const drawLayer = (x: number, y: number, nodes: number, layerHeight: number, color: string, label?: string) => {
      const nodeSpacing = layerHeight / (nodes + 1);
      const positions: {x: number, y: number}[] = [];

      for (let i = 0; i < nodes; i++) {
        const ny = y - layerHeight / 2 + nodeSpacing * (i + 1);
        positions.push({ x, y: ny });

        ctx.beginPath();
        ctx.arc(x, ny, 6, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      }

      if (label) {
        ctx.fillStyle = '#888888';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(label, x, y + layerHeight / 2 + 20);
      }

      return positions;
    };

    // Draw connections between layers
    const drawConnections = (from: {x: number, y: number}[], to: {x: number, y: number}[], alpha: number = 0.3) => {
      ctx.strokeStyle = `rgba(100, 150, 255, ${alpha})`;
      ctx.lineWidth = 0.5;

      for (const f of from) {
        for (const t of to) {
          ctx.beginPath();
          ctx.moveTo(f.x, f.y);
          ctx.lineTo(t.x, t.y);
          ctx.stroke();
        }
      }
    };

    // Input "image" (simplified as a grid)
    ctx.fillStyle = '#444466';
    ctx.fillRect(encoderX - 25, centerY - 25, 50, 50);
    ctx.strokeStyle = '#6666aa';
    ctx.strokeRect(encoderX - 25, centerY - 25, 50, 50);

    // Draw a simple face in the input
    ctx.fillStyle = '#8888aa';
    ctx.beginPath();
    ctx.arc(encoderX, centerY - 5, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#444466';
    ctx.beginPath();
    ctx.arc(encoderX - 5, centerY - 8, 3, 0, Math.PI * 2);
    ctx.arc(encoderX + 5, centerY - 8, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(encoderX, centerY, 6, 0, Math.PI);
    ctx.stroke();

    ctx.fillStyle = '#888888';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Input x', encoderX, centerY + 45);

    // Encoder layers
    const enc1 = drawLayer(encoderX + 70, centerY, 6, 100, animationPhase === 'encode' ? '#66aaff' : '#446688');
    const enc2 = drawLayer(encoderX + 120, centerY, 4, 80, animationPhase === 'encode' ? '#66aaff' : '#446688');

    // Draw connections from input to encoder
    const inputNodes = [
      { x: encoderX + 25, y: centerY - 15 },
      { x: encoderX + 25, y: centerY },
      { x: encoderX + 25, y: centerY + 15 },
    ];
    drawConnections(inputNodes, enc1, animationPhase === 'encode' ? 0.5 : 0.2);
    drawConnections(enc1, enc2, animationPhase === 'encode' ? 0.5 : 0.2);

    // Latent space (μ and σ)
    const muY = centerY - 30;
    const sigmaY = centerY + 30;

    // Draw mu and sigma outputs from encoder
    ctx.beginPath();
    ctx.moveTo(encoderX + 126, centerY);
    ctx.lineTo(latentX - 40, muY);
    ctx.strokeStyle = animationPhase === 'latent' ? '#ffaa66' : '#886644';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(encoderX + 126, centerY);
    ctx.lineTo(latentX - 40, sigmaY);
    ctx.stroke();

    // Mu node
    ctx.beginPath();
    ctx.arc(latentX - 40, muY, 15, 0, Math.PI * 2);
    ctx.fillStyle = animationPhase === 'latent' ? '#ffaa66' : '#886644';
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('μ', latentX - 40, muY + 4);

    // Sigma node
    ctx.beginPath();
    ctx.arc(latentX - 40, sigmaY, 15, 0, Math.PI * 2);
    ctx.fillStyle = animationPhase === 'latent' ? '#ffaa66' : '#886644';
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillText('σ', latentX - 40, sigmaY + 4);

    // Sampling (reparameterization trick)
    ctx.fillStyle = animationPhase === 'latent' ? '#66ff66' : '#448844';
    ctx.font = '10px monospace';
    ctx.fillText('ε ~ N(0,1)', latentX, sigmaY + 50);

    // Z = μ + σ * ε
    ctx.beginPath();
    ctx.arc(latentX + 20, centerY, 18, 0, Math.PI * 2);
    ctx.fillStyle = animationPhase === 'latent' ? '#66ffaa' : '#448866';
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('z', latentX + 20, centerY + 5);

    // Draw lines to z
    ctx.strokeStyle = animationPhase === 'latent' ? '#66ffaa' : '#448866';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(latentX - 25, muY);
    ctx.lineTo(latentX + 5, centerY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(latentX - 25, sigmaY);
    ctx.lineTo(latentX + 5, centerY);
    ctx.stroke();

    // Latent space visualization (2D projection)
    const latentVizX = latentX + 20;
    const latentVizY = centerY - 80;

    ctx.strokeStyle = '#444466';
    ctx.strokeRect(latentVizX - 40, latentVizY - 40, 80, 80);

    // Draw distribution as ellipse
    if (showSampling) {
      ctx.beginPath();
      ctx.ellipse(latentVizX, latentVizY, 25, 15, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(100, 255, 170, 0.2)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(100, 255, 170, 0.5)';
      ctx.stroke();
    }

    // Draw the sampled point based on sliders
    const sampleX = latentVizX + latentDim1 * 35;
    const sampleY = latentVizY - latentDim2 * 35;
    ctx.beginPath();
    ctx.arc(sampleX, sampleY, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffff66';
    ctx.fill();

    ctx.fillStyle = '#888888';
    ctx.font = '9px monospace';
    ctx.fillText('z₁, z₂', latentVizX, latentVizY + 55);

    // Decoder layers
    const dec1 = drawLayer(decoderX - 120, centerY, 4, 80, animationPhase === 'decode' ? '#ff66aa' : '#884466');
    const dec2 = drawLayer(decoderX - 70, centerY, 6, 100, animationPhase === 'decode' ? '#ff66aa' : '#884466');

    // Connect z to decoder
    const zNode = [{ x: latentX + 38, y: centerY }];
    drawConnections(zNode, dec1, animationPhase === 'decode' ? 0.5 : 0.2);
    drawConnections(dec1, dec2, animationPhase === 'decode' ? 0.5 : 0.2);

    // Output "image"
    ctx.fillStyle = '#444466';
    ctx.fillRect(decoderX - 25, centerY - 25, 50, 50);
    ctx.strokeStyle = '#aa66aa';
    ctx.strokeRect(decoderX - 25, centerY - 25, 50, 50);

    // Draw reconstructed face (varies with latent dims)
    ctx.fillStyle = '#aa88aa';
    ctx.beginPath();
    ctx.arc(decoderX, centerY - 5 + latentDim2 * 5, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#444466';
    const eyeOffset = 5 + latentDim1 * 2;
    ctx.beginPath();
    ctx.arc(decoderX - eyeOffset, centerY - 8, 3, 0, Math.PI * 2);
    ctx.arc(decoderX + eyeOffset, centerY - 8, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#aa66aa';
    const smileSize = 6 + latentDim2 * 3;
    ctx.beginPath();
    ctx.arc(decoderX, centerY - 2 + latentDim2 * 3, smileSize, 0, Math.PI);
    ctx.stroke();

    // Connect decoder to output
    const outputNodes = [
      { x: decoderX - 25, y: centerY - 15 },
      { x: decoderX - 25, y: centerY },
      { x: decoderX - 25, y: centerY + 15 },
    ];
    drawConnections(dec2, outputNodes, animationPhase === 'decode' ? 0.5 : 0.2);

    ctx.fillStyle = '#888888';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Output x̂', decoderX, centerY + 45);

    // Labels
    ctx.fillStyle = '#aaaaaa';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('ENCODER', encoderX + 95, height - 20);
    ctx.fillText('LATENT', latentX, height - 20);
    ctx.fillText('DECODER', decoderX - 95, height - 20);

    // Loss annotation
    ctx.fillStyle = '#666688';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Loss = Reconstruction + KL Divergence', 20, 25);

  }, [latentDim1, latentDim2, showSampling, animationPhase]);

  // Animation cycle
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase(prev => {
        if (prev === 'encode') return 'latent';
        if (prev === 'latent') return 'decode';
        return 'encode';
      });
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="card p-6">
      <h3 className="font-semibold mb-2">Variational Autoencoder (VAE)</h3>
      <p className="text-sm text-[var(--text-muted)] mb-4">
        VAEs learn a compressed latent representation. Adjust the latent dimensions to see how they affect the output.
      </p>

      <canvas
        ref={canvasRef}
        width={600}
        height={280}
        className="w-full max-w-[600px] mb-4 rounded"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="text-xs text-[var(--text-muted)] block mb-1">Latent z₁: {latentDim1.toFixed(2)}</label>
          <input
            type="range"
            min="-1"
            max="1"
            step="0.1"
            value={latentDim1}
            onChange={(e) => setLatentDim1(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="text-xs text-[var(--text-muted)] block mb-1">Latent z₂: {latentDim2.toFixed(2)}</label>
          <input
            type="range"
            min="-1"
            max="1"
            step="0.1"
            value={latentDim2}
            onChange={(e) => setLatentDim2(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showSampling}
              onChange={(e) => setShowSampling(e.target.checked)}
            />
            Show distribution
          </label>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-3 text-xs">
        <div className="p-3 bg-[var(--surface-2)] rounded">
          <p className="font-medium mb-1">Encoder q(z|x)</p>
          <p className="text-[var(--text-muted)]">Maps input to mean μ and variance σ² of the latent distribution.</p>
        </div>
        <div className="p-3 bg-[var(--surface-2)] rounded">
          <p className="font-medium mb-1">Reparameterization</p>
          <p className="text-[var(--text-muted)]">z = μ + σ·ε enables backprop through sampling (ε ~ N(0,1)).</p>
        </div>
        <div className="p-3 bg-[var(--surface-2)] rounded">
          <p className="font-medium mb-1">Decoder p(x|z)</p>
          <p className="text-[var(--text-muted)]">Reconstructs the input from the sampled latent vector z.</p>
        </div>
      </div>
    </div>
  );
}
