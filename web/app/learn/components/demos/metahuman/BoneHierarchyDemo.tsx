'use client';

import { useState, useEffect, useRef } from 'react';

interface Bone {
  id: string;
  name: string;
  parent: string | null;
  x: number;
  y: number;
  rotation: number;
  length: number;
  children: string[];
}

const SKELETON: Record<string, Bone> = {
  root: { id: 'root', name: 'Root', parent: null, x: 200, y: 280, rotation: 0, length: 0, children: ['spine1'] },
  spine1: { id: 'spine1', name: 'Spine', parent: 'root', x: 200, y: 280, rotation: -90, length: 40, children: ['spine2'] },
  spine2: { id: 'spine2', name: 'Chest', parent: 'spine1', x: 200, y: 240, rotation: -90, length: 35, children: ['neck', 'shoulderL', 'shoulderR'] },
  neck: { id: 'neck', name: 'Neck', parent: 'spine2', x: 200, y: 205, rotation: -90, length: 25, children: ['head'] },
  head: { id: 'head', name: 'Head', parent: 'neck', x: 200, y: 180, rotation: -90, length: 35, children: [] },
  shoulderL: { id: 'shoulderL', name: 'L Shoulder', parent: 'spine2', x: 200, y: 210, rotation: 180, length: 30, children: ['armL'] },
  shoulderR: { id: 'shoulderR', name: 'R Shoulder', parent: 'spine2', x: 200, y: 210, rotation: 0, length: 30, children: ['armR'] },
  armL: { id: 'armL', name: 'L Arm', parent: 'shoulderL', x: 170, y: 210, rotation: 160, length: 45, children: ['forearmL'] },
  armR: { id: 'armR', name: 'R Arm', parent: 'shoulderR', x: 230, y: 210, rotation: 20, length: 45, children: ['forearmR'] },
  forearmL: { id: 'forearmL', name: 'L Forearm', parent: 'armL', x: 130, y: 225, rotation: 150, length: 40, children: ['handL'] },
  forearmR: { id: 'forearmR', name: 'R Forearm', parent: 'armR', x: 270, y: 225, rotation: 30, length: 40, children: ['handR'] },
  handL: { id: 'handL', name: 'L Hand', parent: 'forearmL', x: 95, y: 245, rotation: 150, length: 15, children: [] },
  handR: { id: 'handR', name: 'R Hand', parent: 'forearmR', x: 305, y: 245, rotation: 30, length: 15, children: [] },
};

const POSES = {
  tpose: { name: 'T-Pose', rotations: {} },
  wave: {
    name: 'Wave',
    rotations: { armR: -60, forearmR: -90, handR: -20 }
  },
  thinking: {
    name: 'Thinking',
    rotations: { armR: -120, forearmR: -140, neck: -10, head: 10 }
  },
  pointing: {
    name: 'Pointing',
    rotations: { armR: -30, forearmR: 0, shoulderR: 20 }
  },
};

export function BoneHierarchyDemo() {
  const [selectedBone, setSelectedBone] = useState<string | null>(null);
  const [boneRotations, setBoneRotations] = useState<Record<string, number>>({});
  const [showHierarchy, setShowHierarchy] = useState(true);
  const [animating, setAnimating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  // Calculate bone positions based on hierarchy and rotations
  const calculateBonePositions = () => {
    const positions: Record<string, { x: number; y: number; endX: number; endY: number; worldRotation: number }> = {};

    const processBone = (boneId: string, parentPos: { x: number; y: number } | null, parentRotation: number) => {
      const bone = SKELETON[boneId];
      const localRotation = boneRotations[boneId] || 0;
      const baseRotation = bone.rotation;
      const worldRotation = parentRotation + baseRotation + localRotation;

      let startX: number, startY: number;

      if (parentPos) {
        startX = parentPos.x;
        startY = parentPos.y;
      } else {
        startX = bone.x;
        startY = bone.y;
      }

      const radians = (worldRotation * Math.PI) / 180;
      const endX = startX + Math.cos(radians) * bone.length;
      const endY = startY + Math.sin(radians) * bone.length;

      positions[boneId] = { x: startX, y: startY, endX, endY, worldRotation };

      bone.children.forEach(childId => {
        processBone(childId, { x: endX, y: endY }, worldRotation);
      });
    };

    processBone('root', null, 0);
    return positions;
  };

  // Render skeleton
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const positions = calculateBonePositions();

    // Draw bones
    Object.entries(SKELETON).forEach(([boneId, bone]) => {
      if (bone.length === 0) return;

      const pos = positions[boneId];
      if (!pos) return;

      const isSelected = selectedBone === boneId;
      const isHighlighted = selectedBone && (
        bone.parent === selectedBone ||
        SKELETON[selectedBone]?.parent === boneId
      );

      // Bone line
      ctx.strokeStyle = isSelected ? '#ff6b6b' : isHighlighted ? '#ffd93d' : '#4ecdc4';
      ctx.lineWidth = isSelected ? 4 : 2;
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      ctx.lineTo(pos.endX, pos.endY);
      ctx.stroke();

      // Joint circle
      ctx.fillStyle = isSelected ? '#ff6b6b' : '#4ecdc4';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, isSelected ? 6 : 4, 0, Math.PI * 2);
      ctx.fill();

      // End effector for leaf bones
      if (bone.children.length === 0) {
        ctx.fillStyle = '#96ceb4';
        ctx.beginPath();
        ctx.arc(pos.endX, pos.endY, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Label
      if (showHierarchy) {
        ctx.fillStyle = isSelected ? '#ff6b6b' : 'rgba(255,255,255,0.7)';
        ctx.font = '10px sans-serif';
        ctx.fillText(bone.name, pos.x + 8, pos.y - 5);
      }
    });

    // Draw hierarchy lines if enabled
    if (showHierarchy && selectedBone) {
      ctx.strokeStyle = 'rgba(255, 107, 107, 0.3)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);

      // Highlight parent chain
      let current = selectedBone;
      while (current) {
        const bone = SKELETON[current];
        const pos = positions[current];
        if (bone.parent && pos) {
          const parentPos = positions[bone.parent];
          if (parentPos) {
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
            ctx.lineTo(parentPos.x, parentPos.y);
            ctx.stroke();
          }
        }
        current = bone.parent || '';
      }

      ctx.setLineDash([]);
    }
  }, [boneRotations, selectedBone, showHierarchy]);

  // Animation
  useEffect(() => {
    if (!animating) return;

    let time = 0;
    const animate = () => {
      time += 0.05;
      setBoneRotations({
        spine1: Math.sin(time) * 5,
        spine2: Math.sin(time * 1.2) * 3,
        neck: Math.sin(time * 0.8) * 8,
        head: Math.sin(time * 1.5) * 5,
        armL: Math.sin(time) * 15,
        armR: Math.sin(time + Math.PI) * 15,
        forearmL: Math.sin(time * 1.3) * 10,
        forearmR: Math.sin(time * 1.3 + Math.PI) * 10,
      });
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [animating]);

  const applyPose = (poseKey: keyof typeof POSES) => {
    const pose = POSES[poseKey];
    setBoneRotations(pose.rotations as Record<string, number>);
    setAnimating(false);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const positions = calculateBonePositions();

    // Find clicked bone
    let clickedBone: string | null = null;
    let minDist = 15;

    Object.entries(positions).forEach(([boneId, pos]) => {
      const dist = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
      if (dist < minDist) {
        minDist = dist;
        clickedBone = boneId;
      }
    });

    setSelectedBone(clickedBone);
  };

  return (
    <div className="card p-6">
      <h3 className="font-semibold mb-2">Bone Hierarchy Explorer</h3>
      <p className="text-sm text-[var(--muted)] mb-6">
        Explore how skeletal animation works. Click bones to select them,
        then adjust rotation. Notice how child bones inherit parent transformations.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Canvas */}
        <div>
          <canvas
            ref={canvasRef}
            width={400}
            height={350}
            onClick={handleCanvasClick}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--card-bg-alt)] cursor-pointer"
          />

          {/* Pose buttons */}
          <div className="mt-4 flex flex-wrap gap-2">
            {Object.entries(POSES).map(([key, pose]) => (
              <button
                key={key}
                onClick={() => applyPose(key as keyof typeof POSES)}
                className="badge hover:border-[var(--border-strong)]"
              >
                {pose.name}
              </button>
            ))}
            <button
              onClick={() => setAnimating(!animating)}
              className={`badge ${animating ? 'bg-[var(--accent)] text-white' : ''}`}
            >
              {animating ? 'Stop' : 'Idle Anim'}
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {/* Selected bone info */}
          {selectedBone ? (
            <div className="p-4 bg-[var(--card-bg-alt)] rounded">
              <div className="flex justify-between items-center mb-3">
                <span className="font-medium">{SKELETON[selectedBone].name}</span>
                <span className="text-xs text-[var(--muted)]">
                  Parent: {SKELETON[selectedBone].parent || 'None'}
                </span>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Local Rotation</span>
                  <span className="font-mono">{(boneRotations[selectedBone] || 0).toFixed(0)}°</span>
                </div>
                <input
                  type="range"
                  min={-180}
                  max={180}
                  value={boneRotations[selectedBone] || 0}
                  onChange={(e) => {
                    setAnimating(false);
                    setBoneRotations(prev => ({
                      ...prev,
                      [selectedBone]: Number(e.target.value)
                    }));
                  }}
                  className="w-full"
                />
              </div>

              {/* Children list */}
              {SKELETON[selectedBone].children.length > 0 && (
                <div className="mt-3 text-xs">
                  <span className="text-[var(--muted)]">Children: </span>
                  {SKELETON[selectedBone].children.map(c => SKELETON[c].name).join(', ')}
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-[var(--card-bg-alt)] rounded text-center text-[var(--muted)]">
              Click a bone joint to select it
            </div>
          )}

          {/* Hierarchy tree */}
          <div className="p-4 bg-[var(--card-bg-alt)] rounded">
            <div className="flex justify-between items-center mb-3">
              <span className="font-medium text-sm">Bone Hierarchy</span>
              <button
                onClick={() => setShowHierarchy(!showHierarchy)}
                className="text-xs text-[var(--muted)]"
              >
                {showHierarchy ? 'Hide Labels' : 'Show Labels'}
              </button>
            </div>
            <div className="text-xs font-mono space-y-0.5 max-h-40 overflow-y-auto">
              <div
                className={`cursor-pointer ${selectedBone === 'root' ? 'text-[#ff6b6b]' : ''}`}
                onClick={() => setSelectedBone('root')}
              >
                Root
              </div>
              <div className="ml-2">
                <div
                  className={`cursor-pointer ${selectedBone === 'spine1' ? 'text-[#ff6b6b]' : ''}`}
                  onClick={() => setSelectedBone('spine1')}
                >
                  └─ Spine
                </div>
                <div className="ml-4">
                  <div
                    className={`cursor-pointer ${selectedBone === 'spine2' ? 'text-[#ff6b6b]' : ''}`}
                    onClick={() => setSelectedBone('spine2')}
                  >
                    └─ Chest
                  </div>
                  <div className="ml-4 space-y-0.5">
                    <div
                      className={`cursor-pointer ${selectedBone === 'neck' ? 'text-[#ff6b6b]' : ''}`}
                      onClick={() => setSelectedBone('neck')}
                    >
                      ├─ Neck → Head
                    </div>
                    <div
                      className={`cursor-pointer ${selectedBone === 'shoulderL' ? 'text-[#ff6b6b]' : ''}`}
                      onClick={() => setSelectedBone('shoulderL')}
                    >
                      ├─ L.Shoulder → Arm → Forearm → Hand
                    </div>
                    <div
                      className={`cursor-pointer ${selectedBone === 'shoulderR' ? 'text-[#ff6b6b]' : ''}`}
                      onClick={() => setSelectedBone('shoulderR')}
                    >
                      └─ R.Shoulder → Arm → Forearm → Hand
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key insight */}
          <div className="p-3 border border-[var(--border)] rounded text-sm">
            <p className="font-medium mb-1">Key Insight</p>
            <p className="text-[var(--muted)] text-xs">
              When you rotate a parent bone, all children follow. This is
              <strong> forward kinematics</strong>. MetaHuman uses 700+ bones
              with this hierarchy to create lifelike movement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BoneHierarchyDemo;
