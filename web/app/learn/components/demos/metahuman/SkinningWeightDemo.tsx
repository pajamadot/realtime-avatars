'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface Vertex {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  weights: number[];  // Weight per bone
}

interface Bone {
  name: string;
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  angle: number;
  baseAngle: number;
  length: number;
  color: string;
  parent: number | null;
}

const BONES: Bone[] = [
  { name: 'Root', x: 200, y: 300, baseX: 200, baseY: 300, angle: 0, baseAngle: 0, length: 0, color: '#666', parent: null },
  { name: 'Spine', x: 200, y: 250, baseX: 200, baseY: 250, angle: -Math.PI/2, baseAngle: -Math.PI/2, length: 50, color: '#4CAF50', parent: 0 },
  { name: 'Neck', x: 200, y: 180, baseX: 200, baseY: 180, angle: -Math.PI/2, baseAngle: -Math.PI/2, length: 40, color: '#2196F3', parent: 1 },
  { name: 'Head', x: 200, y: 130, baseX: 200, baseY: 130, angle: -Math.PI/2, baseAngle: -Math.PI/2, length: 50, color: '#9C27B0', parent: 2 },
  { name: 'L_Shoulder', x: 160, y: 200, baseX: 160, baseY: 200, angle: Math.PI, baseAngle: Math.PI, length: 40, color: '#FF5722', parent: 1 },
  { name: 'R_Shoulder', x: 240, y: 200, baseX: 240, baseY: 200, angle: 0, baseAngle: 0, length: 40, color: '#FF5722', parent: 1 },
];

function createMeshVertices(): Vertex[] {
  const vertices: Vertex[] = [];

  // Create a simple torso/head mesh
  const bodyPoints = [
    // Head
    { x: 180, y: 100, weights: [0, 0, 0, 1, 0, 0] },
    { x: 220, y: 100, weights: [0, 0, 0, 1, 0, 0] },
    { x: 175, y: 130, weights: [0, 0, 0.2, 0.8, 0, 0] },
    { x: 225, y: 130, weights: [0, 0, 0.2, 0.8, 0, 0] },
    // Neck
    { x: 185, y: 160, weights: [0, 0, 0.8, 0.2, 0, 0] },
    { x: 215, y: 160, weights: [0, 0, 0.8, 0.2, 0, 0] },
    // Upper torso
    { x: 160, y: 190, weights: [0, 0.3, 0.5, 0, 0.2, 0] },
    { x: 240, y: 190, weights: [0, 0.3, 0.5, 0, 0, 0.2] },
    // Mid torso
    { x: 155, y: 220, weights: [0, 0.7, 0.1, 0, 0.2, 0] },
    { x: 245, y: 220, weights: [0, 0.7, 0.1, 0, 0, 0.2] },
    // Lower torso
    { x: 165, y: 260, weights: [0.3, 0.7, 0, 0, 0, 0] },
    { x: 235, y: 260, weights: [0.3, 0.7, 0, 0, 0, 0] },
    // Hips
    { x: 170, y: 300, weights: [1, 0, 0, 0, 0, 0] },
    { x: 230, y: 300, weights: [1, 0, 0, 0, 0, 0] },
    // Left arm
    { x: 140, y: 200, weights: [0, 0, 0, 0, 1, 0] },
    { x: 120, y: 210, weights: [0, 0, 0, 0, 1, 0] },
    // Right arm
    { x: 260, y: 200, weights: [0, 0, 0, 0, 0, 1] },
    { x: 280, y: 210, weights: [0, 0, 0, 0, 0, 1] },
  ];

  return bodyPoints.map(p => ({
    ...p,
    baseX: p.x,
    baseY: p.y,
  }));
}

const TRIANGLES = [
  [0, 1, 2], [1, 2, 3],  // Head top
  [2, 3, 4], [3, 4, 5],  // Head bottom
  [4, 5, 6], [5, 6, 7],  // Neck to shoulders
  [6, 7, 8], [7, 8, 9],  // Upper torso
  [8, 9, 10], [9, 10, 11], // Mid torso
  [10, 11, 12], [11, 12, 13], // Lower torso
  [6, 14, 15], // Left arm
  [7, 16, 17], // Right arm
];

export function SkinningWeightDemo() {
  const [bones, setBones] = useState<Bone[]>(BONES);
  const [vertices, setVertices] = useState<Vertex[]>(createMeshVertices);
  const [selectedBone, setSelectedBone] = useState<number | null>(null);
  const [paintMode, setPaintMode] = useState(false);
  const [paintWeight, setPaintWeight] = useState(1.0);
  const [showWeights, setShowWeights] = useState(true);
  const [selectedVertex, setSelectedVertex] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Transform vertices based on bone positions
  const transformVertices = useCallback(() => {
    return vertices.map(v => {
      let newX = 0;
      let newY = 0;
      let totalWeight = 0;

      for (let i = 0; i < bones.length; i++) {
        const weight = v.weights[i];
        if (weight > 0) {
          const bone = bones[i];
          const baseBone = BONES[i];

          // Calculate transform relative to bone
          const dx = v.baseX - baseBone.baseX;
          const dy = v.baseY - baseBone.baseY;

          // Apply bone rotation
          const angleOffset = bone.angle - baseBone.baseAngle;
          const cos = Math.cos(angleOffset);
          const sin = Math.sin(angleOffset);

          const rotatedX = dx * cos - dy * sin;
          const rotatedY = dx * sin + dy * cos;

          // Add bone translation
          const boneOffsetX = bone.x - baseBone.baseX;
          const boneOffsetY = bone.y - baseBone.baseY;

          newX += (v.baseX + rotatedX - dx + boneOffsetX) * weight;
          newY += (v.baseY + rotatedY - dy + boneOffsetY) * weight;
          totalWeight += weight;
        }
      }

      if (totalWeight > 0) {
        return { ...v, x: newX / totalWeight, y: newY / totalWeight };
      }
      return { ...v, x: v.baseX, y: v.baseY };
    });
  }, [bones, vertices]);

  // Draw the scene
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const transformedVerts = transformVertices();

    // Draw mesh triangles
    ctx.globalAlpha = 0.3;
    TRIANGLES.forEach(tri => {
      const [i1, i2, i3] = tri;
      const v1 = transformedVerts[i1];
      const v2 = transformedVerts[i2];
      const v3 = transformedVerts[i3];

      ctx.fillStyle = '#e0ac69';
      ctx.beginPath();
      ctx.moveTo(v1.x, v1.y);
      ctx.lineTo(v2.x, v2.y);
      ctx.lineTo(v3.x, v3.y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#8b6914';
      ctx.lineWidth = 1;
      ctx.stroke();
    });
    ctx.globalAlpha = 1;

    // Draw bones
    bones.forEach((bone, i) => {
      if (bone.parent !== null) {
        const parent = bones[bone.parent];
        ctx.strokeStyle = bone.color;
        ctx.lineWidth = selectedBone === i ? 4 : 2;
        ctx.beginPath();
        ctx.moveTo(parent.x, parent.y);
        ctx.lineTo(bone.x, bone.y);
        ctx.stroke();
      }

      // Draw bone joint
      ctx.fillStyle = selectedBone === i ? '#fff' : bone.color;
      ctx.strokeStyle = bone.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(bone.x, bone.y, selectedBone === i ? 8 : 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    // Draw vertices with weight colors
    if (showWeights && selectedBone !== null) {
      transformedVerts.forEach((v, i) => {
        const weight = v.weights[selectedBone];
        if (weight > 0) {
          // Color based on weight (red = high, blue = low)
          const r = Math.floor(weight * 255);
          const b = Math.floor((1 - weight) * 255);
          ctx.fillStyle = `rgb(${r}, 0, ${b})`;
        } else {
          ctx.fillStyle = '#333';
        }
        ctx.beginPath();
        ctx.arc(v.x, v.y, selectedVertex === i ? 6 : 4, 0, Math.PI * 2);
        ctx.fill();
      });
    }

  }, [bones, vertices, selectedBone, showWeights, selectedVertex, transformVertices]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicking on a bone
    for (let i = bones.length - 1; i >= 0; i--) {
      const bone = bones[i];
      const dx = x - bone.x;
      const dy = y - bone.y;
      if (dx * dx + dy * dy < 100) {
        setSelectedBone(i);
        setSelectedVertex(null);
        return;
      }
    }

    // Check if clicking on a vertex (for paint mode)
    if (paintMode && selectedBone !== null) {
      const transformedVerts = transformVertices();
      for (let i = 0; i < transformedVerts.length; i++) {
        const v = transformedVerts[i];
        const dx = x - v.x;
        const dy = y - v.y;
        if (dx * dx + dy * dy < 64) {
          // Paint weight
          setVertices(prev => prev.map((vert, idx) => {
            if (idx === i) {
              const newWeights = [...vert.weights];
              newWeights[selectedBone] = paintWeight;
              // Normalize weights
              const sum = newWeights.reduce((a, b) => a + b, 0);
              return { ...vert, weights: newWeights.map(w => sum > 0 ? w / sum : w) };
            }
            return vert;
          }));
          setSelectedVertex(i);
          return;
        }
      }
    }

    setSelectedBone(null);
    setSelectedVertex(null);
  };

  const rotateBone = (index: number, delta: number) => {
    setBones(prev => prev.map((bone, i) => {
      if (i === index) {
        return { ...bone, angle: bone.angle + delta };
      }
      // Also rotate children
      if (bone.parent === index) {
        const parent = prev[index];
        const dx = bone.x - parent.x;
        const dy = bone.y - parent.y;
        const cos = Math.cos(delta);
        const sin = Math.sin(delta);
        return {
          ...bone,
          x: parent.x + dx * cos - dy * sin,
          y: parent.y + dx * sin + dy * cos,
          angle: bone.angle + delta,
        };
      }
      return bone;
    }));
  };

  const resetPose = () => {
    setBones(BONES.map(b => ({ ...b })));
  };

  const applyPose = (poseName: string) => {
    const poses: Record<string, Partial<Record<string, number>>> = {
      neutral: {},
      tiltHead: { Head: 0.3, Neck: 0.15 },
      leanLeft: { Spine: -0.2, Neck: -0.1 },
      armUp: { L_Shoulder: -0.5 },
      lookUp: { Neck: 0.3, Head: 0.2 },
    };

    resetPose();
    const pose = poses[poseName];
    if (pose) {
      Object.entries(pose).forEach(([boneName, angle]) => {
        const index = BONES.findIndex(b => b.name === boneName);
        if (index >= 0 && angle !== undefined) {
          rotateBone(index, angle);
        }
      });
    }
  };

  return (
    <div className="card p-6">
      <h3 className="font-semibold mb-2">Skinning Weight Visualizer</h3>
      <p className="text-sm text-[var(--muted)] mb-6">
        See how skinning weights determine mesh deformation. Click a bone to select it,
        then rotate to see how weights blend the deformation.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Canvas */}
        <div className="flex flex-col items-center">
          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            className="border border-[var(--border)] rounded-lg bg-[var(--card-bg-alt)] cursor-pointer"
            onClick={handleCanvasClick}
          />

          {/* Pose presets */}
          <div className="mt-4 w-full">
            <p className="text-sm font-medium mb-2">Pose Presets</p>
            <div className="flex flex-wrap gap-2">
              {['neutral', 'tiltHead', 'leanLeft', 'armUp', 'lookUp'].map(pose => (
                <button
                  key={pose}
                  onClick={() => applyPose(pose)}
                  className="badge hover:border-[var(--border-strong)] text-xs capitalize"
                >
                  {pose.replace(/([A-Z])/g, ' $1').trim()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div>
          {/* Selected bone info */}
          {selectedBone !== null && (
            <div className="mb-4 p-4 bg-[var(--card-bg-alt)] rounded">
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: bones[selectedBone].color }}
                />
                <span className="font-medium">{bones[selectedBone].name}</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-[var(--muted)]">Rotation</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => rotateBone(selectedBone, -0.1)}
                      className="px-3 py-1 bg-[var(--card-bg)] rounded hover:bg-[var(--border)]"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center text-sm">
                      {((bones[selectedBone].angle - bones[selectedBone].baseAngle) * 180 / Math.PI).toFixed(1)}°
                    </span>
                    <button
                      onClick={() => rotateBone(selectedBone, 0.1)}
                      className="px-3 py-1 bg-[var(--card-bg)] rounded hover:bg-[var(--border)]"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Weight painting mode */}
          <div className="mb-4">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={paintMode}
                onChange={(e) => setPaintMode(e.target.checked)}
              />
              Weight Paint Mode
            </label>
            {paintMode && (
              <div className="mt-2 pl-6">
                <label className="text-xs text-[var(--muted)]">Paint Weight: {paintWeight.toFixed(2)}</label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={paintWeight}
                  onChange={(e) => setPaintWeight(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            )}
          </div>

          {/* Display options */}
          <div className="mb-4">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={showWeights}
                onChange={(e) => setShowWeights(e.target.checked)}
              />
              Show Weight Colors
            </label>
          </div>

          {/* Bone list */}
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Bones</p>
            <div className="space-y-1">
              {bones.map((bone, i) => (
                <button
                  key={bone.name}
                  onClick={() => setSelectedBone(i)}
                  className={`w-full flex items-center gap-2 p-2 rounded text-left text-sm transition-colors ${
                    selectedBone === i
                      ? 'bg-[var(--accent)] text-white'
                      : 'hover:bg-[var(--card-bg-alt)]'
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: bone.color }}
                  />
                  {bone.name}
                </button>
              ))}
            </div>
          </div>

          {/* Selected vertex weights */}
          {selectedVertex !== null && (
            <div className="mt-4 p-3 bg-[var(--card-bg-alt)] rounded text-xs">
              <p className="font-medium mb-2">Vertex {selectedVertex} Weights:</p>
              <div className="space-y-1">
                {bones.map((bone, i) => {
                  const weight = vertices[selectedVertex].weights[i];
                  return weight > 0 ? (
                    <div key={bone.name} className="flex justify-between">
                      <span style={{ color: bone.color }}>{bone.name}</span>
                      <span>{(weight * 100).toFixed(0)}%</span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}

          {/* Reset */}
          <button
            onClick={() => { resetPose(); setVertices(createMeshVertices()); }}
            className="mt-4 w-full badge hover:border-[var(--border-strong)] justify-center"
          >
            Reset All
          </button>
        </div>
      </div>

      {/* Weight scale legend */}
      <div className="mt-6 p-4 bg-[var(--card-bg-alt)] rounded text-sm">
        <p className="font-medium mb-2">Weight Color Scale</p>
        <div className="flex items-center gap-4">
          <div className="flex-1 h-4 rounded" style={{
            background: 'linear-gradient(to right, blue, purple, red)'
          }} />
          <div className="flex gap-4 text-xs text-[var(--muted)]">
            <span>0% (Blue)</span>
            <span>50%</span>
            <span>100% (Red)</span>
          </div>
        </div>
        <p className="text-xs text-[var(--muted)] mt-2">
          Vertices with higher weight for the selected bone move more when that bone rotates.
          Weights are normalized so they sum to 1 per vertex.
        </p>
      </div>
    </div>
  );
}

export default SkinningWeightDemo;
