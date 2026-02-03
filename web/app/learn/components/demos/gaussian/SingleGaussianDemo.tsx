'use client';

import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line } from '@react-three/drei';
import * as THREE from 'three';
import { Lightbulb } from 'lucide-react';
import ParameterSlider from '../../core/ParameterSlider';

interface GaussianParams {
  posX: number;
  posY: number;
  posZ: number;
  scaleX: number;
  scaleY: number;
  scaleZ: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  opacity: number;
}

const defaultParams: GaussianParams = {
  posX: 0,
  posY: 0,
  posZ: 0,
  scaleX: 1,
  scaleY: 1,
  scaleZ: 1,
  rotX: 0,
  rotY: 0,
  rotZ: 0,
  opacity: 0.8,
};

function GaussianEllipsoid({ params }: { params: GaussianParams }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.set(params.posX, params.posY, params.posZ);
      meshRef.current.scale.set(params.scaleX, params.scaleY, params.scaleZ);
      meshRef.current.rotation.set(params.rotX, params.rotY, params.rotZ);
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshPhysicalMaterial
        color="#4f46e5"
        transparent
        opacity={params.opacity}
        roughness={0.3}
        metalness={0.1}
        clearcoat={0.3}
      />
    </mesh>
  );
}

function CoordinateAxes() {
  return (
    <group>
      {/* X axis - red */}
      <Line
        points={[[-3, 0, 0], [3, 0, 0]]}
        color="#ef4444"
        lineWidth={1}
        transparent
        opacity={0.5}
      />
      {/* Y axis - green */}
      <Line
        points={[[0, -3, 0], [0, 3, 0]]}
        color="#22c55e"
        lineWidth={1}
        transparent
        opacity={0.5}
      />
      {/* Z axis - blue */}
      <Line
        points={[[0, 0, -3], [0, 0, 3]]}
        color="#3b82f6"
        lineWidth={1}
        transparent
        opacity={0.5}
      />
    </group>
  );
}

function Scene({ params }: { params: GaussianParams }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />

      <CoordinateAxes />
      <GaussianEllipsoid params={params} />

      <OrbitControls
        enablePan={false}
        minDistance={3}
        maxDistance={10}
      />

      {/* Grid helper */}
      <gridHelper args={[6, 6, '#444', '#333']} rotation={[0, 0, 0]} />
    </>
  );
}

export default function SingleGaussianDemo() {
  const [params, setParams] = useState<GaussianParams>(defaultParams);
  const [activeTab, setActiveTab] = useState<'position' | 'scale' | 'rotation'>('position');

  const updateParam = (key: keyof GaussianParams, value: number) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  const reset = () => setParams(defaultParams);

  // Compute covariance matrix display
  const covMatrix = computeCovarianceDisplay(params);

  return (
    <div className="card overflow-hidden">
      <div className="grid md:grid-cols-2">
        {/* 3D Canvas */}
        <div className="h-[400px] bg-black/90">
          <Canvas camera={{ position: [4, 3, 4], fov: 50 }}>
            <Scene params={params} />
          </Canvas>
        </div>

        {/* Controls */}
        <div className="p-4 border-l border-[var(--border)]">
          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            {(['position', 'scale', 'rotation'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`
                  px-3 py-1 text-sm rounded transition-colors
                  ${activeTab === tab
                    ? 'bg-[var(--color-gaussian)] text-white'
                    : 'bg-[var(--card-bg-alt)] text-[var(--muted)] hover:text-[var(--foreground)]'
                  }
                `}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Position controls */}
          {activeTab === 'position' && (
            <div>
              <ParameterSlider
                label="X Position"
                value={params.posX}
                min={-2}
                max={2}
                onChange={(v) => updateParam('posX', v)}
                color="var(--color-gaussian)"
              />
              <ParameterSlider
                label="Y Position"
                value={params.posY}
                min={-2}
                max={2}
                onChange={(v) => updateParam('posY', v)}
                color="var(--color-gaussian)"
              />
              <ParameterSlider
                label="Z Position"
                value={params.posZ}
                min={-2}
                max={2}
                onChange={(v) => updateParam('posZ', v)}
                color="var(--color-gaussian)"
              />
            </div>
          )}

          {/* Scale controls */}
          {activeTab === 'scale' && (
            <div>
              <ParameterSlider
                label="X Scale"
                value={params.scaleX}
                min={0.1}
                max={3}
                onChange={(v) => updateParam('scaleX', v)}
                description="Stretch along X axis"
                color="var(--color-gaussian)"
              />
              <ParameterSlider
                label="Y Scale"
                value={params.scaleY}
                min={0.1}
                max={3}
                onChange={(v) => updateParam('scaleY', v)}
                description="Stretch along Y axis"
                color="var(--color-gaussian)"
              />
              <ParameterSlider
                label="Z Scale"
                value={params.scaleZ}
                min={0.1}
                max={3}
                onChange={(v) => updateParam('scaleZ', v)}
                description="Stretch along Z axis"
                color="var(--color-gaussian)"
              />
            </div>
          )}

          {/* Rotation controls */}
          {activeTab === 'rotation' && (
            <div>
              <ParameterSlider
                label="X Rotation"
                value={params.rotX}
                min={-Math.PI}
                max={Math.PI}
                onChange={(v) => updateParam('rotX', v)}
                unit=" rad"
                color="var(--color-gaussian)"
              />
              <ParameterSlider
                label="Y Rotation"
                value={params.rotY}
                min={-Math.PI}
                max={Math.PI}
                onChange={(v) => updateParam('rotY', v)}
                unit=" rad"
                color="var(--color-gaussian)"
              />
              <ParameterSlider
                label="Z Rotation"
                value={params.rotZ}
                min={-Math.PI}
                max={Math.PI}
                onChange={(v) => updateParam('rotZ', v)}
                unit=" rad"
                color="var(--color-gaussian)"
              />
            </div>
          )}

          {/* Opacity (always visible) */}
          <div className="mt-4 pt-4 border-t border-[var(--border)]">
            <ParameterSlider
              label="Opacity (α)"
              value={params.opacity}
              min={0}
              max={1}
              onChange={(v) => updateParam('opacity', v)}
              color="var(--color-gaussian)"
            />
          </div>

          {/* Covariance matrix display */}
          <div className="mt-4 pt-4 border-t border-[var(--border)]">
            <p className="text-xs text-[var(--muted)] mb-2">Covariance Matrix (Σ = RSS'R')</p>
            <div className="font-mono text-xs bg-[var(--card-bg-alt)] p-2 rounded">
              <div className="grid grid-cols-3 gap-1 text-center">
                {covMatrix.map((row, i) => (
                  row.map((val, j) => (
                    <span key={`${i}-${j}`} className={val > 0.5 ? 'text-[var(--color-gaussian)]' : ''}>
                      {val.toFixed(2)}
                    </span>
                  ))
                ))}
              </div>
            </div>
          </div>

          {/* Reset button */}
          <button
            type="button"
            onClick={reset}
            className="mt-4 w-full badge hover:border-[var(--border-strong)] text-center"
          >
            Reset to Defaults
          </button>
        </div>
      </div>

      {/* Insight */}
      <div className="p-4 bg-[var(--card-bg-alt)] border-t border-[var(--border)] text-sm text-[var(--muted)] flex items-start gap-2">
        <Lightbulb size={16} className="text-yellow-500 flex-shrink-0 mt-0.5" />
        <span><strong>Try this:</strong> Set X Scale to 2 and Y Scale to 0.5, then rotate around Z.
        Watch how the covariance matrix changes — this is exactly how 3DGS stores shape information!</span>
      </div>
    </div>
  );
}

// Helper to compute a simplified covariance matrix for display
function computeCovarianceDisplay(params: GaussianParams): number[][] {
  const { scaleX, scaleY, scaleZ, rotX, rotY, rotZ } = params;

  // Simplified: just show the diagonal scaled by rotation influence
  // In reality, this would be R * S * S^T * R^T
  const sx2 = scaleX * scaleX;
  const sy2 = scaleY * scaleY;
  const sz2 = scaleZ * scaleZ;

  // Simplified rotation mixing (not exact, but illustrative)
  const cx = Math.cos(rotX), sx = Math.sin(rotX);
  const cy = Math.cos(rotY), sy = Math.sin(rotY);
  const cz = Math.cos(rotZ), sz = Math.sin(rotZ);

  // Approximate covariance (simplified for demo)
  return [
    [sx2 * cy * cy * cz * cz + sy2 * sz * sz + sz2 * sy * sy, 0.1 * (sx2 - sy2) * sz, 0.1 * (sx2 - sz2) * sy],
    [0.1 * (sx2 - sy2) * sz, sy2 * cx * cx + sx2 * sz * sz * sx * sx + sz2 * cx * cx, 0.1 * (sy2 - sz2) * sx],
    [0.1 * (sx2 - sz2) * sy, 0.1 * (sy2 - sz2) * sx, sz2 * cy * cy + sx2 * sy * sy + sy2 * sx * sx * cz * cz],
  ];
}
