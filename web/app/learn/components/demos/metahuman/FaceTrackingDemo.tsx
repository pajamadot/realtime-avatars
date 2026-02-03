'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface SimulatedBlendshape {
  name: string;
  value: number;
  category: string;
}

// Simulate face tracking with mouse position when no camera
function useMouseFaceSimulation(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [facePosition, setFacePosition] = useState({ x: 0.5, y: 0.5 });
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    if (!isTracking || !containerRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
      setFacePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isTracking, containerRef]);

  return { facePosition, isTracking, setIsTracking };
}

// Generate simulated blendshapes from face position and expressions
function generateBlendshapes(
  faceX: number,
  faceY: number,
  expression: string,
  mouthOpen: number,
  eyesClosed: number
): SimulatedBlendshape[] {
  const blendshapes: SimulatedBlendshape[] = [];

  // Head pose from position
  const headYaw = (faceX - 0.5) * 2; // -1 to 1
  const headPitch = (faceY - 0.5) * 2; // -1 to 1

  // Expression presets
  const expressions: Record<string, Record<string, number>> = {
    neutral: {},
    smile: {
      mouthSmileLeft: 0.8,
      mouthSmileRight: 0.8,
      cheekSquintLeft: 0.5,
      cheekSquintRight: 0.5,
    },
    surprise: {
      eyeWideLeft: 0.9,
      eyeWideRight: 0.9,
      browInnerUp: 0.7,
      browOuterUpLeft: 0.6,
      browOuterUpRight: 0.6,
      jawOpen: 0.4,
    },
    angry: {
      browDownLeft: 0.8,
      browDownRight: 0.8,
      eyeSquintLeft: 0.5,
      eyeSquintRight: 0.5,
      noseSneerLeft: 0.4,
      noseSneerRight: 0.4,
    },
    sad: {
      browInnerUp: 0.5,
      mouthFrownLeft: 0.6,
      mouthFrownRight: 0.6,
    },
  };

  const currentExpression = expressions[expression] || {};

  // Eyes
  blendshapes.push(
    { name: 'eyeBlinkLeft', value: eyesClosed, category: 'Eyes' },
    { name: 'eyeBlinkRight', value: eyesClosed, category: 'Eyes' },
    { name: 'eyeLookDownLeft', value: Math.max(0, headPitch * 0.5), category: 'Eyes' },
    { name: 'eyeLookDownRight', value: Math.max(0, headPitch * 0.5), category: 'Eyes' },
    { name: 'eyeLookUpLeft', value: Math.max(0, -headPitch * 0.5), category: 'Eyes' },
    { name: 'eyeLookUpRight', value: Math.max(0, -headPitch * 0.5), category: 'Eyes' },
    { name: 'eyeLookInLeft', value: Math.max(0, headYaw * 0.5), category: 'Eyes' },
    { name: 'eyeLookOutLeft', value: Math.max(0, -headYaw * 0.5), category: 'Eyes' },
    { name: 'eyeLookInRight', value: Math.max(0, -headYaw * 0.5), category: 'Eyes' },
    { name: 'eyeLookOutRight', value: Math.max(0, headYaw * 0.5), category: 'Eyes' },
    { name: 'eyeWideLeft', value: currentExpression.eyeWideLeft || 0, category: 'Eyes' },
    { name: 'eyeWideRight', value: currentExpression.eyeWideRight || 0, category: 'Eyes' },
    { name: 'eyeSquintLeft', value: currentExpression.eyeSquintLeft || 0, category: 'Eyes' },
    { name: 'eyeSquintRight', value: currentExpression.eyeSquintRight || 0, category: 'Eyes' }
  );

  // Brows
  blendshapes.push(
    { name: 'browDownLeft', value: currentExpression.browDownLeft || 0, category: 'Brows' },
    { name: 'browDownRight', value: currentExpression.browDownRight || 0, category: 'Brows' },
    { name: 'browInnerUp', value: currentExpression.browInnerUp || 0, category: 'Brows' },
    { name: 'browOuterUpLeft', value: currentExpression.browOuterUpLeft || 0, category: 'Brows' },
    { name: 'browOuterUpRight', value: currentExpression.browOuterUpRight || 0, category: 'Brows' }
  );

  // Mouth
  blendshapes.push(
    { name: 'jawOpen', value: mouthOpen + (currentExpression.jawOpen || 0), category: 'Mouth' },
    { name: 'mouthSmileLeft', value: currentExpression.mouthSmileLeft || 0, category: 'Mouth' },
    { name: 'mouthSmileRight', value: currentExpression.mouthSmileRight || 0, category: 'Mouth' },
    { name: 'mouthFrownLeft', value: currentExpression.mouthFrownLeft || 0, category: 'Mouth' },
    { name: 'mouthFrownRight', value: currentExpression.mouthFrownRight || 0, category: 'Mouth' },
    { name: 'mouthPucker', value: 0, category: 'Mouth' },
    { name: 'mouthLeft', value: Math.max(0, -headYaw * 0.2), category: 'Mouth' },
    { name: 'mouthRight', value: Math.max(0, headYaw * 0.2), category: 'Mouth' }
  );

  // Cheeks & Nose
  blendshapes.push(
    { name: 'cheekPuff', value: 0, category: 'Cheeks' },
    { name: 'cheekSquintLeft', value: currentExpression.cheekSquintLeft || 0, category: 'Cheeks' },
    { name: 'cheekSquintRight', value: currentExpression.cheekSquintRight || 0, category: 'Cheeks' },
    { name: 'noseSneerLeft', value: currentExpression.noseSneerLeft || 0, category: 'Nose' },
    { name: 'noseSneerRight', value: currentExpression.noseSneerRight || 0, category: 'Nose' }
  );

  return blendshapes;
}

export function FaceTrackingDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { facePosition, isTracking, setIsTracking } = useMouseFaceSimulation(containerRef);

  const [expression, setExpression] = useState('neutral');
  const [mouthOpen, setMouthOpen] = useState(0);
  const [eyesClosed, setEyesClosed] = useState(0);
  const [blendshapes, setBlendshapes] = useState<SimulatedBlendshape[]>([]);
  const [showAllBlendshapes, setShowAllBlendshapes] = useState(false);
  const [fps, setFps] = useState(0);

  const lastFrameTime = useRef(Date.now());
  const frameCount = useRef(0);

  // Update blendshapes
  useEffect(() => {
    if (!isTracking) return;

    const interval = setInterval(() => {
      const newBlendshapes = generateBlendshapes(
        facePosition.x,
        facePosition.y,
        expression,
        mouthOpen,
        eyesClosed
      );
      setBlendshapes(newBlendshapes);

      // Calculate FPS
      frameCount.current++;
      const now = Date.now();
      if (now - lastFrameTime.current >= 1000) {
        setFps(frameCount.current);
        frameCount.current = 0;
        lastFrameTime.current = now;
      }
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [isTracking, facePosition, expression, mouthOpen, eyesClosed]);

  // Draw face visualization
  const drawFace = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2 + (facePosition.x - 0.5) * 60;
    const cy = h / 2 + (facePosition.y - 0.5) * 60;

    ctx.clearRect(0, 0, w, h);

    // Face oval
    ctx.fillStyle = '#ffdbac';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 80, 100, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#c68642';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Get blendshape values
    const getBs = (name: string) => blendshapes.find(b => b.name === name)?.value || 0;

    // Eyes
    const blinkL = getBs('eyeBlinkLeft');
    const blinkR = getBs('eyeBlinkRight');
    const wideL = getBs('eyeWideLeft');
    const wideR = getBs('eyeWideRight');

    ctx.fillStyle = '#fff';
    const eyeHeightL = Math.max(0.1, 1 - blinkL) * (1 + wideL * 0.3);
    const eyeHeightR = Math.max(0.1, 1 - blinkR) * (1 + wideR * 0.3);

    ctx.beginPath();
    ctx.ellipse(cx - 25, cy - 15, 15, 10 * eyeHeightL, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(cx + 25, cy - 15, 15, 10 * eyeHeightR, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Pupils (follow gaze direction)
    const gazeX = (facePosition.x - 0.5) * 6;
    const gazeY = (facePosition.y - 0.5) * 4;

    if (eyeHeightL > 0.2) {
      ctx.fillStyle = '#3d2314';
      ctx.beginPath();
      ctx.arc(cx - 25 + gazeX, cy - 15 + gazeY, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    if (eyeHeightR > 0.2) {
      ctx.fillStyle = '#3d2314';
      ctx.beginPath();
      ctx.arc(cx + 25 + gazeX, cy - 15 + gazeY, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Brows
    const browDownL = getBs('browDownLeft');
    const browDownR = getBs('browDownRight');
    const browInnerUp = getBs('browInnerUp');

    ctx.strokeStyle = '#4a3728';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(cx - 45, cy - 35 + browDownL * 10);
    ctx.quadraticCurveTo(cx - 25, cy - 45 + browDownL * 8 - browInnerUp * 10, cx - 10, cy - 35 - browInnerUp * 10);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx + 45, cy - 35 + browDownR * 10);
    ctx.quadraticCurveTo(cx + 25, cy - 45 + browDownR * 8 - browInnerUp * 10, cx + 10, cy - 35 - browInnerUp * 10);
    ctx.stroke();

    // Nose
    ctx.strokeStyle = '#c68642';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 5);
    ctx.lineTo(cx - 3, cy + 20);
    ctx.lineTo(cx + 3, cy + 20);
    ctx.stroke();

    // Mouth
    const jawOpen = getBs('jawOpen');
    const smileL = getBs('mouthSmileLeft');
    const smileR = getBs('mouthSmileRight');
    const frownL = getBs('mouthFrownLeft');
    const frownR = getBs('mouthFrownRight');

    const mouthWidth = 25;
    const mouthOpenAmount = jawOpen * 20;
    const cornerLY = (smileL - frownL) * 10;
    const cornerRY = (smileR - frownR) * 10;

    ctx.fillStyle = '#8b4513';
    ctx.beginPath();
    ctx.moveTo(cx - mouthWidth, cy + 40 - cornerLY);
    ctx.quadraticCurveTo(cx, cy + 40 + mouthOpenAmount, cx + mouthWidth, cy + 40 - cornerRY);
    ctx.quadraticCurveTo(cx, cy + 40 - 3, cx - mouthWidth, cy + 40 - cornerLY);
    ctx.fill();

    // Teeth if mouth open
    if (jawOpen > 0.2) {
      ctx.fillStyle = '#fff';
      ctx.fillRect(cx - mouthWidth * 0.7, cy + 38, mouthWidth * 1.4, 5);
    }

    // Tracking indicator
    ctx.fillStyle = isTracking ? '#22c55e' : '#ef4444';
    ctx.beginPath();
    ctx.arc(20, 20, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '10px monospace';
    ctx.fillText(isTracking ? 'LIVE' : 'OFF', 35, 24);

    if (isTracking) {
      ctx.fillText(`${fps} FPS`, w - 50, 24);
    }
  }, [facePosition, blendshapes, isTracking, fps]);

  useEffect(() => {
    drawFace();
  }, [drawFace]);

  const activeBlendshapes = blendshapes.filter(b => b.value > 0.01);
  const displayedBlendshapes = showAllBlendshapes ? blendshapes : activeBlendshapes;

  return (
    <div className="card p-6">
      <h3 className="font-semibold mb-2">Face Tracking Simulator</h3>
      <p className="text-sm text-[var(--muted)] mb-6">
        Simulate how ARKit extracts 52 blendshapes from face tracking.
        Move your mouse over the canvas to control head pose, and use the sliders for expressions.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Face visualization */}
        <div ref={containerRef} className="flex flex-col items-center">
          <canvas
            ref={canvasRef}
            width={300}
            height={300}
            className="border border-[var(--border)] rounded-lg bg-[var(--card-bg-alt)] cursor-crosshair"
          />

          {/* Start/Stop button */}
          <button
            onClick={() => setIsTracking(!isTracking)}
            className={`mt-4 px-6 py-2 rounded-lg font-medium transition-colors ${
              isTracking
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {isTracking ? 'Stop Tracking' : 'Start Tracking'}
          </button>

          <p className="text-xs text-[var(--muted)] mt-2 text-center">
            {isTracking
              ? 'Move mouse to control gaze direction'
              : 'Click to start simulated tracking'}
          </p>
        </div>

        {/* Controls */}
        <div>
          {/* Expression selector */}
          <div className="mb-4">
            <p className="text-sm font-medium mb-2">Expression</p>
            <div className="flex flex-wrap gap-2">
              {['neutral', 'smile', 'surprise', 'angry', 'sad'].map((exp) => (
                <button
                  key={exp}
                  onClick={() => setExpression(exp)}
                  className={`px-3 py-1 text-xs rounded capitalize transition-colors ${
                    expression === exp
                      ? 'bg-[var(--color-metahuman)] text-white'
                      : 'bg-[var(--card-bg-alt)] hover:bg-[var(--border)]'
                  }`}
                >
                  {exp}
                </button>
              ))}
            </div>
          </div>

          {/* Manual controls */}
          <div className="space-y-3 mb-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Mouth Open</span>
                <span>{(mouthOpen * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={mouthOpen}
                onChange={(e) => setMouthOpen(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Eyes Closed</span>
                <span>{(eyesClosed * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={eyesClosed}
                onChange={(e) => setEyesClosed(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          {/* Blendshape output */}
          <div className="border-t border-[var(--border)] pt-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium">
                Blendshapes ({activeBlendshapes.length} active)
              </p>
              <label className="flex items-center gap-1 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={showAllBlendshapes}
                  onChange={(e) => setShowAllBlendshapes(e.target.checked)}
                />
                Show all
              </label>
            </div>

            <div className="max-h-[200px] overflow-y-auto space-y-1 text-xs">
              {displayedBlendshapes.map((bs) => (
                <div key={bs.name} className="flex items-center gap-2">
                  <span className="w-28 truncate text-[var(--muted)]">{bs.name}</span>
                  <div className="flex-1 h-2 bg-[var(--border)] rounded overflow-hidden">
                    <div
                      className="h-full bg-[var(--color-metahuman)] transition-all"
                      style={{ width: `${bs.value * 100}%` }}
                    />
                  </div>
                  <span className="w-10 text-right">{(bs.value * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Output as JSON */}
      <div className="mt-6 p-4 bg-black/90 rounded text-xs font-mono max-h-[150px] overflow-y-auto">
        <p className="text-green-400 mb-2">// ARKit blendshape output (simplified)</p>
        <pre className="text-gray-300">
          {JSON.stringify(
            Object.fromEntries(
              activeBlendshapes.map(b => [b.name, Math.round(b.value * 1000) / 1000])
            ),
            null,
            2
          )}
        </pre>
      </div>

      {/* Info */}
      <div className="mt-4 p-4 bg-[var(--card-bg-alt)] rounded text-sm text-[var(--muted)]">
        <p className="font-medium mb-2">How Real Face Tracking Works</p>
        <ul className="space-y-1 text-xs">
          <li>• iPhone TrueDepth projects 30,000 infrared dots onto your face</li>
          <li>• ARKit processes the depth map to extract 52 blendshape coefficients</li>
          <li>• Each coefficient ranges from 0.0 to 1.0, representing muscle activation</li>
          <li>• Data streams at 60 FPS via Live Link to Unreal Engine</li>
        </ul>
      </div>
    </div>
  );
}

export default FaceTrackingDemo;
