'use client';

import { useState, useEffect, useRef } from 'react';

interface FeatureVector {
  identity: number[];
  expression: number[];
  pose: number[];
}

export function FaceEncoderDemo() {
  const [features, setFeatures] = useState<FeatureVector>({
    identity: [0.8, -0.3, 0.5, 0.2, -0.6, 0.9, -0.1, 0.4],
    expression: [0.2, 0.7, -0.4, 0.1],
    pose: [0.0, 0.0, 0.0], // yaw, pitch, roll
  });
  const [showLatentSpace, setShowLatentSpace] = useState(true);
  const [encoderStage, setEncoderStage] = useState<'input' | 'conv1' | 'conv2' | 'pool' | 'fc' | 'output'>('input');
  const [isAnimating, setIsAnimating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  // Animation through encoder stages
  useEffect(() => {
    if (!isAnimating) {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
      return;
    }

    const stages: typeof encoderStage[] = ['input', 'conv1', 'conv2', 'pool', 'fc', 'output'];
    let currentIndex = stages.indexOf(encoderStage);

    animationRef.current = setInterval(() => {
      currentIndex = (currentIndex + 1) % stages.length;
      setEncoderStage(stages[currentIndex]);
      if (currentIndex === stages.length - 1) {
        setIsAnimating(false);
      }
    }, 1000) as unknown as number;

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [isAnimating, encoderStage]);

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

    // Draw encoder pipeline stages
    const stageWidth = 60;
    const stageHeight = 80;
    const stages = [
      { id: 'input', name: 'Input', size: '256×256', color: '#3498db' },
      { id: 'conv1', name: 'Conv1', size: '128×128', color: '#9b59b6' },
      { id: 'conv2', name: 'Conv2', size: '64×64', color: '#9b59b6' },
      { id: 'pool', name: 'Pool', size: '8×8', color: '#e67e22' },
      { id: 'fc', name: 'FC', size: '512', color: '#e74c3c' },
      { id: 'output', name: 'Latent', size: '15-D', color: '#2ecc71' },
    ];

    const startX = 30;
    const y = 50;

    stages.forEach((stage, i) => {
      const x = startX + i * 65;
      const isActive = stage.id === encoderStage;
      const isPast = stages.findIndex(s => s.id === encoderStage) > i;

      // Stage box
      ctx.fillStyle = isActive ? stage.color : isPast ? `${stage.color}80` : `${stage.color}40`;
      ctx.fillRect(x, y, stageWidth, stageHeight);

      // Border for active
      if (isActive) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, stageWidth, stageHeight);
      }

      // Labels
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(stage.name, x + stageWidth / 2, y + 20);

      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = '9px sans-serif';
      ctx.fillText(stage.size, x + stageWidth / 2, y + 40);

      // Visual representation
      if (stage.id === 'input') {
        // Face icon
        ctx.fillStyle = '#ffdbac';
        ctx.beginPath();
        ctx.arc(x + stageWidth / 2, y + 60, 12, 0, Math.PI * 2);
        ctx.fill();
      } else if (stage.id === 'conv1' || stage.id === 'conv2') {
        // Feature maps
        const mapSize = stage.id === 'conv1' ? 4 : 3;
        for (let r = 0; r < mapSize; r++) {
          for (let c = 0; c < mapSize; c++) {
            ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.5 + 0.2})`;
            ctx.fillRect(x + 15 + c * 8, y + 50 + r * 6, 6, 4);
          }
        }
      } else if (stage.id === 'pool') {
        // Pooled features
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillRect(x + 20, y + 55, 20, 15);
      } else if (stage.id === 'fc') {
        // Vector
        for (let v = 0; v < 6; v++) {
          ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.5 + 0.3})`;
          ctx.fillRect(x + 25, y + 48 + v * 5, 10, 3);
        }
      } else if (stage.id === 'output') {
        // Latent code visualization
        ctx.fillStyle = '#2ecc71';
        for (let v = 0; v < 5; v++) {
          const val = v < 3 ? features.identity[v] : features.expression[v - 3];
          const barHeight = Math.abs(val) * 20;
          ctx.fillRect(x + 10 + v * 9, y + 70 - barHeight, 7, barHeight);
        }
      }

      // Arrow to next stage
      if (i < stages.length - 1) {
        ctx.strokeStyle = isPast ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + stageWidth + 2, y + stageHeight / 2);
        ctx.lineTo(x + stageWidth + 3, y + stageHeight / 2);
        ctx.stroke();
      }
    });

    // Draw latent space visualization
    if (showLatentSpace) {
      const latentY = 160;

      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Latent Code Components:', 20, latentY);

      // Identity features
      ctx.fillStyle = '#3498db';
      ctx.font = '10px sans-serif';
      ctx.fillText('Identity (8D)', 20, latentY + 20);

      features.identity.forEach((val, i) => {
        const x = 20 + i * 42;
        const barWidth = 35;
        const barHeight = Math.abs(val) * 30;
        const barY = latentY + 50;

        ctx.fillStyle = val >= 0 ? '#3498db' : '#e74c3c';
        if (val >= 0) {
          ctx.fillRect(x, barY - barHeight, barWidth, barHeight);
        } else {
          ctx.fillRect(x, barY, barWidth, barHeight);
        }

        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(val.toFixed(1), x + barWidth / 2, barY + 40);
      });

      // Expression features
      const exprX = 20;
      const exprY = latentY + 100;

      ctx.fillStyle = '#2ecc71';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Expression (4D)', exprX, exprY);

      features.expression.forEach((val, i) => {
        const x = exprX + i * 50;
        const barWidth = 40;
        const barHeight = Math.abs(val) * 25;
        const barY = exprY + 30;

        ctx.fillStyle = val >= 0 ? '#2ecc71' : '#e74c3c';
        if (val >= 0) {
          ctx.fillRect(x, barY - barHeight, barWidth, barHeight);
        } else {
          ctx.fillRect(x, barY, barWidth, barHeight);
        }

        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(val.toFixed(1), x + barWidth / 2, barY + 35);
      });

      // Pose
      ctx.fillStyle = '#f1c40f';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Pose (3D)', 230, exprY);

      const poseLabels = ['Yaw', 'Pitch', 'Roll'];
      features.pose.forEach((val, i) => {
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = '9px sans-serif';
        ctx.fillText(`${poseLabels[i]}: ${val.toFixed(1)}°`, 230, exprY + 20 + i * 15);
      });
    }

  }, [features, showLatentSpace, encoderStage]);

  const randomizeFeatures = () => {
    setFeatures({
      identity: Array(8).fill(0).map(() => (Math.random() - 0.5) * 2),
      expression: Array(4).fill(0).map(() => (Math.random() - 0.5) * 2),
      pose: [(Math.random() - 0.5) * 60, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 30],
    });
  };

  return (
    <div className="card p-6">
      <h3 className="font-semibold mb-2">Face Encoder Architecture</h3>
      <p className="text-sm text-[var(--text-muted)] mb-6">
        Face encoders extract identity, expression, and pose into a compact latent code.
        This enables identity-preserving generation and expression transfer.
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

          {/* Controls */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => {
                setEncoderStage('input');
                setIsAnimating(true);
              }}
              disabled={isAnimating}
              className="flex-1 py-2 rounded font-medium text-sm bg-[var(--accent)] text-white disabled:opacity-50"
            >
              {isAnimating ? 'Encoding...' : 'Animate'}
            </button>
            <button onClick={randomizeFeatures} className="badge">
              Randomize
            </button>
            <button
              onClick={() => setShowLatentSpace(!showLatentSpace)}
              className={`badge ${showLatentSpace ? 'bg-[var(--accent)]/20' : ''}`}
            >
              Latent
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-4">
          <div className="p-4 bg-[var(--surface-2)] rounded">
            <p className="font-medium text-sm mb-2">Encoder Pipeline</p>
            <ol className="text-xs text-[var(--text-muted)] space-y-1">
              <li className={encoderStage === 'input' ? 'text-[#3498db]' : ''}>
                1. Input: 256×256 RGB face image
              </li>
              <li className={encoderStage === 'conv1' || encoderStage === 'conv2' ? 'text-[#9b59b6]' : ''}>
                2. Conv layers: Extract spatial features
              </li>
              <li className={encoderStage === 'pool' ? 'text-[#e67e22]' : ''}>
                3. Global pooling: Spatial → vector
              </li>
              <li className={encoderStage === 'fc' ? 'text-[#e74c3c]' : ''}>
                4. Fully connected: Compress features
              </li>
              <li className={encoderStage === 'output' ? 'text-[#2ecc71]' : ''}>
                5. Output: Disentangled latent code
              </li>
            </ol>
          </div>

          <div className="p-4 bg-[var(--surface-2)] rounded">
            <p className="font-medium text-sm mb-2">Disentanglement</p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2 bg-[#3498db]/20 rounded text-center">
                <p className="font-medium text-[#3498db]">Identity</p>
                <p className="text-[var(--text-muted)]">Who the person is</p>
              </div>
              <div className="p-2 bg-[#2ecc71]/20 rounded text-center">
                <p className="font-medium text-[#2ecc71]">Expression</p>
                <p className="text-[var(--text-muted)]">Facial state</p>
              </div>
              <div className="p-2 bg-[#f1c40f]/20 rounded text-center">
                <p className="font-medium text-[#f1c40f]">Pose</p>
                <p className="text-[var(--text-muted)]">Head orientation</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-[var(--surface-2)] rounded">
            <p className="font-medium text-sm mb-2">Common Architectures</p>
            <div className="space-y-1 text-xs text-[var(--text-muted)]">
              <p><span className="font-medium text-[var(--foreground)]">ArcFace:</span> Identity-focused, used for recognition</p>
              <p><span className="font-medium text-[var(--foreground)]">DECA:</span> 3DMM parameter prediction</p>
              <p><span className="font-medium text-[var(--foreground)]">InsightFace:</span> Fast, good for real-time</p>
            </div>
          </div>

          <div className="p-3 border border-[var(--border)] rounded text-sm">
            <p className="font-medium mb-1">For Avatar Generation</p>
            <p className="text-xs text-[var(--text-muted)]">
              The identity code is used to condition the diffusion model, ensuring
              the generated face looks like the reference. Expression codes drive animation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FaceEncoderDemo;
