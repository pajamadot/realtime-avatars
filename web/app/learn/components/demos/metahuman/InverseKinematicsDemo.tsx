'use client';

import { useState, useEffect, useRef } from 'react';

interface Joint {
  x: number;
  y: number;
  angle: number;
  length: number;
}

export function InverseKinematicsDemo() {
  const [target, setTarget] = useState({ x: 280, y: 150 });
  const [joints, setJoints] = useState<Joint[]>([
    { x: 100, y: 200, angle: 0, length: 80 },
    { x: 180, y: 200, angle: 0, length: 60 },
    { x: 240, y: 200, angle: 0, length: 50 },
  ]);
  const [mode, setMode] = useState<'ik' | 'fk'>('ik');
  const [selectedJoint, setSelectedJoint] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [iterations, setIterations] = useState(10);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Forward kinematics - calculate positions from angles
  const calculateFK = (inputJoints: Joint[]): Joint[] => {
    const result: Joint[] = [];
    let currentX = inputJoints[0].x;
    let currentY = inputJoints[0].y;
    let totalAngle = 0;

    inputJoints.forEach((joint, i) => {
      totalAngle += joint.angle;
      const endX = currentX + Math.cos(totalAngle) * joint.length;
      const endY = currentY + Math.sin(totalAngle) * joint.length;

      result.push({
        ...joint,
        x: currentX,
        y: currentY,
      });

      currentX = endX;
      currentY = endY;
    });

    return result;
  };

  // FABRIK IK solver
  const solveIK = (targetX: number, targetY: number) => {
    const newJoints = [...joints];
    const baseX = joints[0].x;
    const baseY = joints[0].y;

    // Get end effector chain
    let positions: { x: number; y: number }[] = [];
    let x = baseX;
    let y = baseY;
    let totalAngle = 0;

    for (const joint of newJoints) {
      positions.push({ x, y });
      totalAngle += joint.angle;
      x += Math.cos(totalAngle) * joint.length;
      y += Math.sin(totalAngle) * joint.length;
    }
    positions.push({ x, y }); // End effector

    // FABRIK iterations
    for (let iter = 0; iter < iterations; iter++) {
      // Backward pass - start from target
      positions[positions.length - 1] = { x: targetX, y: targetY };

      for (let i = positions.length - 2; i >= 0; i--) {
        const dx = positions[i].x - positions[i + 1].x;
        const dy = positions[i].y - positions[i + 1].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const length = newJoints[i].length;

        if (dist > 0) {
          const ratio = length / dist;
          positions[i] = {
            x: positions[i + 1].x + dx * ratio,
            y: positions[i + 1].y + dy * ratio,
          };
        }
      }

      // Forward pass - start from base
      positions[0] = { x: baseX, y: baseY };

      for (let i = 1; i < positions.length; i++) {
        const dx = positions[i].x - positions[i - 1].x;
        const dy = positions[i].y - positions[i - 1].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const length = newJoints[i - 1].length;

        if (dist > 0) {
          const ratio = length / dist;
          positions[i] = {
            x: positions[i - 1].x + dx * ratio,
            y: positions[i - 1].y + dy * ratio,
          };
        }
      }
    }

    // Convert positions back to angles
    let prevAngle = 0;
    for (let i = 0; i < newJoints.length; i++) {
      const dx = positions[i + 1].x - positions[i].x;
      const dy = positions[i + 1].y - positions[i].y;
      const worldAngle = Math.atan2(dy, dx);
      newJoints[i].angle = worldAngle - prevAngle;
      prevAngle = worldAngle;
    }

    setJoints(newJoints);
  };

  // Auto-solve when target moves in IK mode
  useEffect(() => {
    if (mode === 'ik') {
      solveIK(target.x, target.y);
    }
  }, [target, mode, iterations]);

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

    const fkJoints = calculateFK(joints);

    // Draw reach circle
    const totalLength = joints.reduce((sum, j) => sum + j.length, 0);
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(joints[0].x, joints[0].y, totalLength, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw bones
    let prevX = fkJoints[0].x;
    let prevY = fkJoints[0].y;
    let totalAngle = 0;

    fkJoints.forEach((joint, i) => {
      totalAngle += joint.angle;
      const endX = joint.x + Math.cos(totalAngle) * joint.length;
      const endY = joint.y + Math.sin(totalAngle) * joint.length;

      // Bone line
      const gradient = ctx.createLinearGradient(joint.x, joint.y, endX, endY);
      gradient.addColorStop(0, '#4ecdc4');
      gradient.addColorStop(1, '#45b7d1');

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(joint.x, joint.y);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      // Joint circle
      const isSelected = selectedJoint === i;
      ctx.fillStyle = isSelected ? '#ffd93d' : '#ffffff';
      ctx.strokeStyle = '#1a1a2e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(joint.x, joint.y, isSelected ? 10 : 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Joint number
      ctx.fillStyle = '#1a1a2e';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(i + 1), joint.x, joint.y);

      prevX = endX;
      prevY = endY;
    });

    // End effector
    ctx.fillStyle = '#2ecc71';
    ctx.beginPath();
    ctx.arc(prevX, prevY, 6, 0, Math.PI * 2);
    ctx.fill();

    // Target
    ctx.strokeStyle = '#ff6b6b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(target.x - 10, target.y);
    ctx.lineTo(target.x + 10, target.y);
    ctx.moveTo(target.x, target.y - 10);
    ctx.lineTo(target.x, target.y + 10);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(target.x, target.y, 15, 0, Math.PI * 2);
    ctx.stroke();

    // Mode label
    ctx.fillStyle = mode === 'ik' ? '#ff6b6b' : '#4ecdc4';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(mode === 'ik' ? 'Inverse Kinematics' : 'Forward Kinematics', 10, 25);

  }, [joints, target, mode, selectedJoint]);

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (mode === 'ik') {
      setIsDragging(true);
      setTarget({ x, y });
    } else {
      // FK mode - check if clicking a joint
      const fkJoints = calculateFK(joints);
      for (let i = 0; i < fkJoints.length; i++) {
        const dx = x - fkJoints[i].x;
        const dy = y - fkJoints[i].y;
        if (dx * dx + dy * dy < 225) {
          setSelectedJoint(i);
          setIsDragging(true);
          return;
        }
      }
      setSelectedJoint(null);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (mode === 'ik') {
      setTarget({ x, y });
    } else if (selectedJoint !== null) {
      // FK mode - rotate selected joint
      const fkJoints = calculateFK(joints);
      const joint = fkJoints[selectedJoint];
      const angle = Math.atan2(y - joint.y, x - joint.x);

      let prevWorldAngle = 0;
      for (let i = 0; i < selectedJoint; i++) {
        prevWorldAngle += joints[i].angle;
      }

      const newJoints = [...joints];
      newJoints[selectedJoint].angle = angle - prevWorldAngle;
      setJoints(newJoints);
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="card p-6">
      <h3 className="font-semibold mb-2">Inverse vs Forward Kinematics</h3>
      <p className="text-sm text-[var(--muted)] mb-6">
        FK: Set joint angles → calculate end position. IK: Set target position → solve for angles.
        MetaHuman uses IK for realistic hand/foot placement.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Canvas */}
        <div>
          <canvas
            ref={canvasRef}
            width={400}
            height={300}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
            className="w-full rounded-lg border border-[var(--border)] cursor-crosshair"
          />

          {/* Mode toggle */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setMode('ik')}
              className={`flex-1 py-2 rounded font-medium text-sm transition-colors ${
                mode === 'ik' ? 'bg-[#ff6b6b] text-white' : 'bg-[var(--card-bg-alt)]'
              }`}
            >
              Inverse Kinematics
            </button>
            <button
              onClick={() => setMode('fk')}
              className={`flex-1 py-2 rounded font-medium text-sm transition-colors ${
                mode === 'fk' ? 'bg-[#4ecdc4] text-white' : 'bg-[var(--card-bg-alt)]'
              }`}
            >
              Forward Kinematics
            </button>
          </div>

          {/* Legend */}
          <div className="mt-3 flex flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded-full border-2 border-[#ff6b6b]" />
              <span>Target</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-[#2ecc71]" />
              <span>End effector</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-white border border-[var(--border)]" />
              <span>Joint</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {mode === 'ik' ? (
            <>
              <div className="p-4 bg-[var(--card-bg-alt)] rounded">
                <p className="font-medium text-sm mb-2">IK Mode</p>
                <p className="text-xs text-[var(--muted)]">
                  Drag anywhere to move the target. The arm automatically solves
                  for joint angles using the FABRIK algorithm.
                </p>
              </div>

              <div className="p-4 bg-[var(--card-bg-alt)] rounded">
                <div className="flex justify-between text-sm mb-2">
                  <span>Solver Iterations</span>
                  <span className="font-mono">{iterations}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={20}
                  value={iterations}
                  onChange={(e) => setIterations(Number(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-[var(--muted)] mt-1">
                  More iterations = more accurate but slower
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="p-4 bg-[var(--card-bg-alt)] rounded">
                <p className="font-medium text-sm mb-2">FK Mode</p>
                <p className="text-xs text-[var(--muted)]">
                  Click and drag joints to rotate them. Child joints follow
                  their parents automatically.
                </p>
              </div>

              <div className="p-4 bg-[var(--card-bg-alt)] rounded space-y-3">
                <p className="font-medium text-sm">Joint Angles</p>
                {joints.map((joint, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Joint {i + 1}</span>
                      <span className="font-mono">{(joint.angle * 180 / Math.PI).toFixed(0)}°</span>
                    </div>
                    <input
                      type="range"
                      min={-Math.PI}
                      max={Math.PI}
                      step={0.1}
                      value={joint.angle}
                      onChange={(e) => {
                        const newJoints = [...joints];
                        newJoints[i].angle = Number(e.target.value);
                        setJoints(newJoints);
                      }}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="p-4 bg-[var(--card-bg-alt)] rounded">
            <p className="font-medium text-sm mb-2">Comparison</p>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="font-medium text-[#4ecdc4]">FK</p>
                <ul className="text-[var(--muted)] mt-1 space-y-1">
                  <li>• Simple to compute</li>
                  <li>• Direct control</li>
                  <li>• Animation curves</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-[#ff6b6b]">IK</p>
                <ul className="text-[var(--muted)] mt-1 space-y-1">
                  <li>• Goal-oriented</li>
                  <li>• Foot placement</li>
                  <li>• Hand targets</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InverseKinematicsDemo;
