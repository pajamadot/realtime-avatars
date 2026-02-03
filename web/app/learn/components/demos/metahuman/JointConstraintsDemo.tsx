'use client';

import { useState, useEffect, useRef } from 'react';

interface JointLimit {
  min: number;
  max: number;
}

interface Joint {
  id: string;
  name: string;
  angle: number;
  limits: JointLimit;
  x: number;
  y: number;
  parentId: string | null;
  length: number;
}

export function JointConstraintsDemo() {
  const [joints, setJoints] = useState<Joint[]>([
    { id: 'shoulder', name: 'Shoulder', angle: 0, limits: { min: -45, max: 180 }, x: 100, y: 150, parentId: null, length: 70 },
    { id: 'elbow', name: 'Elbow', angle: 0, limits: { min: 0, max: 145 }, x: 170, y: 150, parentId: 'shoulder', length: 60 },
    { id: 'wrist', name: 'Wrist', angle: 0, limits: { min: -70, max: 70 }, x: 230, y: 150, parentId: 'elbow', length: 40 },
  ]);
  const [selectedJoint, setSelectedJoint] = useState<string>('elbow');
  const [constraintsEnabled, setConstraintsEnabled] = useState(true);
  const [showLimits, setShowLimits] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const width = 380;
  const height = 300;

  // Calculate joint positions using FK
  const calculatePositions = (inputJoints: Joint[]): Joint[] => {
    const result = [...inputJoints];
    let currentX = result[0].x;
    let currentY = result[0].y;
    let totalAngle = 0;

    for (let i = 0; i < result.length; i++) {
      result[i].x = currentX;
      result[i].y = currentY;
      totalAngle += result[i].angle * (Math.PI / 180);
      currentX += Math.cos(totalAngle) * result[i].length;
      currentY += Math.sin(totalAngle) * result[i].length;
    }

    return result;
  };

  // Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    const positionedJoints = calculatePositions(joints);

    // Draw limit arcs for selected joint
    if (showLimits) {
      const joint = positionedJoints.find(j => j.id === selectedJoint);
      if (joint) {
        const idx = positionedJoints.findIndex(j => j.id === selectedJoint);
        let parentAngle = 0;
        for (let i = 0; i < idx; i++) {
          parentAngle += positionedJoints[i].angle;
        }

        const startAngle = (parentAngle + joint.limits.min) * (Math.PI / 180);
        const endAngle = (parentAngle + joint.limits.max) * (Math.PI / 180);

        // Valid range (green)
        ctx.fillStyle = 'rgba(46, 204, 113, 0.15)';
        ctx.beginPath();
        ctx.moveTo(joint.x, joint.y);
        ctx.arc(joint.x, joint.y, 50, startAngle, endAngle);
        ctx.closePath();
        ctx.fill();

        // Invalid range (red)
        ctx.fillStyle = 'rgba(231, 76, 60, 0.1)';
        ctx.beginPath();
        ctx.moveTo(joint.x, joint.y);
        ctx.arc(joint.x, joint.y, 50, endAngle, startAngle + Math.PI * 2);
        ctx.closePath();
        ctx.fill();

        // Limit lines
        ctx.strokeStyle = 'rgba(46, 204, 113, 0.8)';
        ctx.setLineDash([3, 3]);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(joint.x, joint.y);
        ctx.lineTo(joint.x + Math.cos(startAngle) * 55, joint.y + Math.sin(startAngle) * 55);
        ctx.moveTo(joint.x, joint.y);
        ctx.lineTo(joint.x + Math.cos(endAngle) * 55, joint.y + Math.sin(endAngle) * 55);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // Draw bones
    let prevX = positionedJoints[0].x;
    let prevY = positionedJoints[0].y;
    let totalAngle = 0;

    positionedJoints.forEach((joint, i) => {
      totalAngle += joint.angle * (Math.PI / 180);
      const endX = joint.x + Math.cos(totalAngle) * joint.length;
      const endY = joint.y + Math.sin(totalAngle) * joint.length;

      // Bone
      ctx.strokeStyle = joint.id === selectedJoint ? '#4ecdc4' : '#ffffff';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(joint.x, joint.y);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      // Joint circle
      ctx.fillStyle = joint.id === selectedJoint ? '#ffd93d' : '#ffffff';
      ctx.strokeStyle = '#1a1a2e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(joint.x, joint.y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Joint name
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(joint.name, joint.x, joint.y - 18);

      // Angle indicator
      if (joint.id === selectedJoint) {
        const isConstrained = constraintsEnabled &&
          (joint.angle < joint.limits.min || joint.angle > joint.limits.max);
        ctx.fillStyle = isConstrained ? '#e74c3c' : '#2ecc71';
        ctx.fillText(`${joint.angle.toFixed(0)}°`, joint.x, joint.y + 28);
      }

      prevX = endX;
      prevY = endY;
    });

    // End effector
    ctx.fillStyle = '#ff6b6b';
    ctx.beginPath();
    ctx.arc(prevX, prevY, 6, 0, Math.PI * 2);
    ctx.fill();

    // Labels
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Constraints: ${constraintsEnabled ? 'ON' : 'OFF'}`, 10, 20);

  }, [joints, selectedJoint, constraintsEnabled, showLimits]);

  const updateJointAngle = (jointId: string, angle: number) => {
    setJoints(prev => prev.map(j => {
      if (j.id !== jointId) return j;

      let newAngle = angle;
      if (constraintsEnabled) {
        newAngle = Math.max(j.limits.min, Math.min(j.limits.max, angle));
      }

      return { ...j, angle: newAngle };
    }));
  };

  const selectedJointData = joints.find(j => j.id === selectedJoint);

  return (
    <div className="card p-6">
      <h3 className="font-semibold mb-2">Joint Constraints</h3>
      <p className="text-sm text-[var(--muted)] mb-6">
        Real joints have physical limits. Elbows can't bend backward. MetaHuman enforces these
        constraints to prevent unnatural poses.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Canvas */}
        <div>
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="w-full rounded-lg border border-[var(--border)]"
          />

          {/* Joint selector */}
          <div className="mt-4 flex gap-2">
            {joints.map(j => (
              <button
                key={j.id}
                onClick={() => setSelectedJoint(j.id)}
                className={`flex-1 py-2 rounded font-medium text-sm transition-colors ${
                  selectedJoint === j.id ? 'bg-[var(--accent)] text-white' : 'bg-[var(--card-bg-alt)]'
                }`}
              >
                {j.name}
              </button>
            ))}
          </div>

          <div className="mt-3 flex gap-2">
            <button
              onClick={() => setConstraintsEnabled(!constraintsEnabled)}
              className={`badge ${constraintsEnabled ? 'bg-[#2ecc71]/20 text-[#2ecc71]' : 'bg-[#e74c3c]/20 text-[#e74c3c]'}`}
            >
              Constraints {constraintsEnabled ? 'ON' : 'OFF'}
            </button>
            <button
              onClick={() => setShowLimits(!showLimits)}
              className={`badge ${showLimits ? 'bg-[var(--accent)]/20' : ''}`}
            >
              Show Limits
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {selectedJointData && (
            <div className="p-4 bg-[var(--card-bg-alt)] rounded">
              <div className="flex justify-between text-sm mb-2">
                <span>{selectedJointData.name} Angle</span>
                <span className="font-mono">{selectedJointData.angle.toFixed(0)}°</span>
              </div>
              <input
                type="range"
                min={-180}
                max={180}
                value={selectedJointData.angle}
                onChange={(e) => updateJointAngle(selectedJoint, Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-[var(--muted)] mt-1">
                <span>Limit: {selectedJointData.limits.min}°</span>
                <span>Limit: {selectedJointData.limits.max}°</span>
              </div>
            </div>
          )}

          <div className="p-4 bg-[var(--card-bg-alt)] rounded">
            <p className="font-medium text-sm mb-2">Joint Limits</p>
            <div className="space-y-2 text-xs">
              {joints.map(j => (
                <div key={j.id} className="flex justify-between p-2 bg-[var(--card-bg)] rounded">
                  <span className="font-medium">{j.name}</span>
                  <span className="text-[var(--muted)]">
                    {j.limits.min}° to {j.limits.max}°
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-[var(--card-bg-alt)] rounded">
            <p className="font-medium text-sm mb-2">Constraint Types</p>
            <div className="space-y-2 text-xs text-[var(--muted)]">
              <p><span className="font-medium text-[var(--foreground)]">Hinge:</span> Single axis rotation (elbow, knee)</p>
              <p><span className="font-medium text-[var(--foreground)]">Ball:</span> Multi-axis with cone limits (shoulder, hip)</p>
              <p><span className="font-medium text-[var(--foreground)]">Saddle:</span> Two-axis with asymmetric limits (thumb)</p>
            </div>
          </div>

          <div className="p-3 border border-[var(--border)] rounded text-sm">
            <p className="font-medium mb-1">In Animation</p>
            <p className="text-xs text-[var(--muted)]">
              Constraints prevent impossible poses during IK solving and motion retargeting.
              They also help with collision avoidance (elbow not going through torso).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JointConstraintsDemo;
