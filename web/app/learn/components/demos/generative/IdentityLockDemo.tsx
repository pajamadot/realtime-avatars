'use client';

import { useState, useEffect, useRef } from 'react';

interface FaceFeatures {
  eyeDistance: number;
  noseLength: number;
  jawWidth: number;
  foreheadHeight: number;
  lipFullness: number;
}

const DEFAULT_IDENTITY: FaceFeatures = {
  eyeDistance: 0.5,
  noseLength: 0.5,
  jawWidth: 0.5,
  foreheadHeight: 0.5,
  lipFullness: 0.5,
};

export function IdentityLockDemo() {
  const [identity, setIdentity] = useState<FaceFeatures>(DEFAULT_IDENTITY);
  const [motion, setMotion] = useState(0); // 0-1 animation progress
  const [isAnimating, setIsAnimating] = useState(false);
  const [identityStrength, setIdentityStrength] = useState(0.9);
  const [showComparison, setShowComparison] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  // Animation loop
  useEffect(() => {
    if (!isAnimating) return;

    const animate = () => {
      setMotion(prev => {
        const next = prev + 0.02;
        return next > 1 ? 0 : next;
      });
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isAnimating]);

  // Render face
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const halfWidth = width / 2;

    ctx.clearRect(0, 0, width, height);

    // Calculate motion values (simulating talking)
    const mouthOpen = Math.sin(motion * Math.PI * 4) * 0.5 + 0.5;
    const headTilt = Math.sin(motion * Math.PI * 2) * 0.1;
    const browRaise = Math.sin(motion * Math.PI * 3) * 0.2;

    // Draw two faces side by side if comparison mode
    const drawFace = (centerX: number, applyIdentity: boolean) => {
      const id = applyIdentity ? identity : DEFAULT_IDENTITY;
      const strength = applyIdentity ? identityStrength : 0;

      // Interpolate features based on identity strength
      const features = {
        eyeDistance: DEFAULT_IDENTITY.eyeDistance + (id.eyeDistance - DEFAULT_IDENTITY.eyeDistance) * strength,
        noseLength: DEFAULT_IDENTITY.noseLength + (id.noseLength - DEFAULT_IDENTITY.noseLength) * strength,
        jawWidth: DEFAULT_IDENTITY.jawWidth + (id.jawWidth - DEFAULT_IDENTITY.jawWidth) * strength,
        foreheadHeight: DEFAULT_IDENTITY.foreheadHeight + (id.foreheadHeight - DEFAULT_IDENTITY.foreheadHeight) * strength,
        lipFullness: DEFAULT_IDENTITY.lipFullness + (id.lipFullness - DEFAULT_IDENTITY.lipFullness) * strength,
      };

      ctx.save();
      ctx.translate(centerX, height / 2);
      ctx.rotate(headTilt);

      // Face shape (affected by jawWidth)
      const faceWidth = 70 + features.jawWidth * 30;
      const faceHeight = 90 + features.foreheadHeight * 20;

      const gradient = ctx.createRadialGradient(0, -10, 10, 0, 0, faceHeight);
      gradient.addColorStop(0, '#ffdbac');
      gradient.addColorStop(0.8, '#e0ac69');
      gradient.addColorStop(1, '#c68642');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.ellipse(0, 0, faceWidth, faceHeight, 0, 0, Math.PI * 2);
      ctx.fill();

      // Eyes (affected by eyeDistance)
      const eyeSpacing = 20 + features.eyeDistance * 25;
      const eyeY = -20 - browRaise * 10;
      const eyeHeight = 8 + browRaise * 3;

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(-eyeSpacing, eyeY, 12, eyeHeight, 0, 0, Math.PI * 2);
      ctx.ellipse(eyeSpacing, eyeY, 12, eyeHeight, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#3d2314';
      ctx.beginPath();
      ctx.arc(-eyeSpacing, eyeY, 5, 0, Math.PI * 2);
      ctx.arc(eyeSpacing, eyeY, 5, 0, Math.PI * 2);
      ctx.fill();

      // Eyebrows (dynamic)
      ctx.strokeStyle = '#5d4e37';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';

      const browY = eyeY - 15 - browRaise * 8;
      ctx.beginPath();
      ctx.moveTo(-eyeSpacing - 15, browY + 5);
      ctx.quadraticCurveTo(-eyeSpacing, browY, -eyeSpacing + 15, browY + 3);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(eyeSpacing - 15, browY + 3);
      ctx.quadraticCurveTo(eyeSpacing, browY, eyeSpacing + 15, browY + 5);
      ctx.stroke();

      // Nose (affected by noseLength)
      const noseLength = 20 + features.noseLength * 15;
      ctx.strokeStyle = '#c68642';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, eyeY + 10);
      ctx.lineTo(0, eyeY + 10 + noseLength);
      ctx.lineTo(-8, eyeY + 10 + noseLength);
      ctx.stroke();

      // Mouth (dynamic motion + identity lip fullness)
      const mouthY = eyeY + noseLength + 25;
      const lipHeight = 3 + features.lipFullness * 6;
      const mouthOpenAmount = mouthOpen * 15;

      // Upper lip
      ctx.fillStyle = '#c9544d';
      ctx.beginPath();
      ctx.ellipse(0, mouthY - lipHeight / 2, 20, lipHeight, 0, Math.PI, Math.PI * 2);
      ctx.fill();

      // Lower lip
      ctx.beginPath();
      ctx.ellipse(0, mouthY + mouthOpenAmount + lipHeight / 2, 22, lipHeight + 2, 0, 0, Math.PI);
      ctx.fill();

      // Mouth opening
      if (mouthOpenAmount > 2) {
        ctx.fillStyle = '#2d1f1f';
        ctx.beginPath();
        ctx.ellipse(0, mouthY + mouthOpenAmount / 2, 15, mouthOpenAmount / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Teeth
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.rect(-12, mouthY - 2, 24, 6);
        ctx.fill();
      }

      ctx.restore();
    };

    if (showComparison) {
      // Draw divider
      ctx.strokeStyle = 'var(--border)';
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(halfWidth, 0);
      ctx.lineTo(halfWidth, height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Labels
      ctx.fillStyle = 'var(--muted)';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Without Identity Lock', halfWidth / 2, 20);
      ctx.fillText('With Identity Lock', halfWidth + halfWidth / 2, 20);

      drawFace(halfWidth / 2, false);
      drawFace(halfWidth + halfWidth / 2, true);
    } else {
      drawFace(halfWidth, true);
    }

  }, [identity, motion, identityStrength, showComparison]);

  const randomizeIdentity = () => {
    setIdentity({
      eyeDistance: Math.random(),
      noseLength: Math.random(),
      jawWidth: Math.random(),
      foreheadHeight: Math.random(),
      lipFullness: Math.random(),
    });
  };

  return (
    <div className="card p-6">
      <h3 className="font-semibold mb-2">Identity Preservation Demo</h3>
      <p className="text-sm text-[var(--muted)] mb-6">
        See how identity lock maintains facial features while allowing expression/motion changes.
        Without identity lock, the face drifts to an average appearance.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Canvas */}
        <div>
          <canvas
            ref={canvasRef}
            width={400}
            height={250}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--card-bg-alt)]"
          />

          {/* Controls */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setIsAnimating(!isAnimating)}
              className="flex-1 badge hover:border-[var(--border-strong)] justify-center"
            >
              {isAnimating ? 'Pause' : 'Animate'}
            </button>
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="flex-1 badge hover:border-[var(--border-strong)] justify-center"
            >
              {showComparison ? 'Single View' : 'Compare'}
            </button>
            <button
              onClick={randomizeIdentity}
              className="flex-1 badge hover:border-[var(--border-strong)] justify-center"
            >
              New Identity
            </button>
          </div>
        </div>

        {/* Identity Controls */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Identity Strength</span>
              <span className="font-mono">{(identityStrength * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={identityStrength}
              onChange={(e) => setIdentityStrength(Number(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-[var(--muted)]">
              Lower values allow more drift toward average face
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium">Identity Features</p>

            {Object.entries(identity).map(([key, value]) => (
              <div key={key}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                  <span className="font-mono">{value.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={value}
                  onChange={(e) => setIdentity(prev => ({
                    ...prev,
                    [key]: Number(e.target.value)
                  }))}
                  className="w-full"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className="mt-6 p-4 bg-[var(--card-bg-alt)] rounded">
        <p className="font-medium mb-2">How Identity Lock Works</p>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-[var(--muted)]">
          <div>
            <p className="font-medium text-[var(--foreground)] mb-1">1. Extract Identity</p>
            <p>Encoder captures facial features (eye spacing, nose shape, etc.) as a latent vector</p>
          </div>
          <div>
            <p className="font-medium text-[var(--foreground)] mb-1">2. Condition Generation</p>
            <p>Identity vector is injected via cross-attention at every denoising step</p>
          </div>
          <div>
            <p className="font-medium text-[var(--foreground)] mb-1">3. Preserve + Animate</p>
            <p>Motion changes expressions while identity features remain locked</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IdentityLockDemo;
