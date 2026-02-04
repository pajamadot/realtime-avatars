'use client';

import { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Lightbulb } from 'lucide-react';
import ParameterSlider from '../../core/ParameterSlider';

interface SHCoefficients {
  // DC component (base color)
  c00: [number, number, number];
  // First order (directional)
  c1_1: [number, number, number];
  c10: [number, number, number];
  c11: [number, number, number];
}

const defaultCoeffs: SHCoefficients = {
  c00: [0.8, 0.6, 0.4],   // Base orange-ish
  c1_1: [0.1, 0.0, 0.0],  // X direction red
  c10: [0.0, 0.1, 0.0],   // Y direction green
  c11: [0.0, 0.0, 0.1],   // Z direction blue
};

// SH basis functions (simplified first-order)
function Y00() { return 0.282095; } // sqrt(1/4π)
function Y1_1(x: number, y: number, z: number) { return 0.488603 * y; }
function Y10(x: number, y: number, z: number) { return 0.488603 * z; }
function Y11(x: number, y: number, z: number) { return 0.488603 * x; }

function evaluateSH(normal: THREE.Vector3, coeffs: SHCoefficients): [number, number, number] {
  const { x, y, z } = normal;

  const r = coeffs.c00[0] * Y00()
          + coeffs.c1_1[0] * Y1_1(x, y, z)
          + coeffs.c10[0] * Y10(x, y, z)
          + coeffs.c11[0] * Y11(x, y, z);

  const g = coeffs.c00[1] * Y00()
          + coeffs.c1_1[1] * Y1_1(x, y, z)
          + coeffs.c10[1] * Y10(x, y, z)
          + coeffs.c11[1] * Y11(x, y, z);

  const b = coeffs.c00[2] * Y00()
          + coeffs.c1_1[2] * Y1_1(x, y, z)
          + coeffs.c10[2] * Y10(x, y, z)
          + coeffs.c11[2] * Y11(x, y, z);

  return [Math.max(0, Math.min(1, r)), Math.max(0, Math.min(1, g)), Math.max(0, Math.min(1, b))];
}

function SHSphere({ coeffs }: { coeffs: SHCoefficients }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const geometryRef = useRef<THREE.SphereGeometry>(null);

  // Update vertex colors based on SH coefficients
  useMemo(() => {
    if (!geometryRef.current) return;

    const geometry = geometryRef.current;
    const positions = geometry.attributes.position;
    const colors = new Float32Array(positions.count * 3);

    const normal = new THREE.Vector3();

    for (let i = 0; i < positions.count; i++) {
      normal.set(
        positions.getX(i),
        positions.getY(i),
        positions.getZ(i)
      ).normalize();

      const [r, g, b] = evaluateSH(normal, coeffs);
      colors[i * 3] = r;
      colors[i * 3 + 1] = g;
      colors[i * 3 + 2] = b;
    }

    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  }, [coeffs]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry ref={geometryRef} args={[1.5, 64, 64]} />
      <meshBasicMaterial vertexColors />
    </mesh>
  );
}

function Scene({ coeffs }: { coeffs: SHCoefficients }) {
  return (
    <>
      <SHSphere coeffs={coeffs} />
      <OrbitControls enablePan={false} minDistance={3} maxDistance={8} />
      <gridHelper args={[6, 6, '#444', '#333']} position={[0, -1.8, 0]} />
    </>
  );
}

export default function SphericalHarmonicsDemo() {
  const [coeffs, setCoeffs] = useState<SHCoefficients>(defaultCoeffs);
  const [activeChannel, setActiveChannel] = useState<'r' | 'g' | 'b'>('r');
  const [preset, setPreset] = useState<string>('custom');

  const presets: Record<string, SHCoefficients> = {
    uniform: {
      c00: [0.7, 0.7, 0.7],
      c1_1: [0, 0, 0],
      c10: [0, 0, 0],
      c11: [0, 0, 0],
    },
    gradient: {
      c00: [0.5, 0.5, 0.5],
      c1_1: [0.3, 0, 0],
      c10: [0, 0.3, 0],
      c11: [0, 0, 0.3],
    },
    sunset: {
      c00: [0.9, 0.5, 0.2],
      c1_1: [0.2, -0.1, -0.2],
      c10: [0.3, 0.1, -0.1],
      c11: [0.1, 0.05, 0],
    },
    cool: {
      c00: [0.3, 0.5, 0.8],
      c1_1: [0, 0.1, 0.2],
      c10: [-0.1, 0.1, 0.3],
      c11: [0.1, 0.2, 0.1],
    },
  };

  const updateCoeff = (band: keyof SHCoefficients, channel: 0 | 1 | 2, value: number) => {
    setPreset('custom');
    setCoeffs(prev => ({
      ...prev,
      [band]: prev[band].map((v, i) => i === channel ? value : v) as [number, number, number]
    }));
  };

  const applyPreset = (name: string) => {
    setPreset(name);
    if (presets[name]) {
      setCoeffs(presets[name]);
    }
  };

  const channelIndex = { r: 0, g: 1, b: 2 }[activeChannel] as 0 | 1 | 2;
  const channelColor = { r: '#ef4444', g: '#22c55e', b: '#3b82f6' }[activeChannel];

  return (
    <div className="card overflow-hidden">
      <div className="grid md:grid-cols-2">
        {/* 3D Canvas */}
        <div className="h-[400px] bg-black/90">
          <Canvas camera={{ position: [3, 2, 3], fov: 50 }}>
            <Scene coeffs={coeffs} />
          </Canvas>
        </div>

        {/* Controls */}
        <div className="p-4 border-l border-[var(--border)]">
          <h3 className="font-semibold mb-2">Spherical Harmonics Playground</h3>
          <p className="text-xs text-[var(--text-muted)] mb-4">
            Adjust SH coefficients to change how color varies across the sphere surface.
            This is how 3D Gaussian Splatting encodes view-dependent color.
          </p>

          {/* Presets */}
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.keys(presets).map(name => (
              <button
                key={name}
                onClick={() => applyPreset(name)}
                className={`px-3 py-1 text-xs rounded capitalize transition-colors ${
                  preset === name
                    ? 'bg-[var(--color-gaussian)] text-white'
                    : 'bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--foreground)]'
                }`}
              >
                {name}
              </button>
            ))}
          </div>

          {/* Channel selector */}
          <div className="flex gap-2 mb-4">
            {(['r', 'g', 'b'] as const).map((ch) => (
              <button
                key={ch}
                onClick={() => setActiveChannel(ch)}
                className={`flex-1 py-1 text-sm rounded uppercase font-medium transition-colors ${
                  activeChannel === ch
                    ? `text-white`
                    : 'bg-[var(--surface-2)] text-[var(--text-muted)]'
                }`}
                style={activeChannel === ch ? { backgroundColor: { r: '#ef4444', g: '#22c55e', b: '#3b82f6' }[ch] } : {}}
              >
                {ch}
              </button>
            ))}
          </div>

          {/* SH coefficient sliders */}
          <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
            <div>
              <p className="text-xs text-[var(--text-muted)] mb-1">c₀₀ (Base brightness)</p>
              <ParameterSlider
                label=""
                value={coeffs.c00[channelIndex]}
                min={0}
                max={1}
                onChange={(v) => updateCoeff('c00', channelIndex, v)}
                color={channelColor}
              />
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)] mb-1">c₁₋₁ (Y-direction gradient)</p>
              <ParameterSlider
                label=""
                value={coeffs.c1_1[channelIndex]}
                min={-0.5}
                max={0.5}
                onChange={(v) => updateCoeff('c1_1', channelIndex, v)}
                color={channelColor}
              />
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)] mb-1">c₁₀ (Z-direction gradient)</p>
              <ParameterSlider
                label=""
                value={coeffs.c10[channelIndex]}
                min={-0.5}
                max={0.5}
                onChange={(v) => updateCoeff('c10', channelIndex, v)}
                color={channelColor}
              />
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)] mb-1">c₁₁ (X-direction gradient)</p>
              <ParameterSlider
                label=""
                value={coeffs.c11[channelIndex]}
                min={-0.5}
                max={0.5}
                onChange={(v) => updateCoeff('c11', channelIndex, v)}
                color={channelColor}
              />
            </div>
          </div>

          {/* Formula */}
          <div className="mt-4 p-3 bg-[var(--surface-2)] rounded text-xs font-mono">
            <p className="text-[var(--text-muted)] mb-1">Color at direction (x,y,z):</p>
            <p>c = c₀₀·Y₀₀ + c₁₋₁·Y₁₋₁ + c₁₀·Y₁₀ + c₁₁·Y₁₁</p>
          </div>
        </div>
      </div>

      {/* Insight */}
      <div className="p-4 bg-[var(--surface-2)] border-t border-[var(--border)] text-sm text-[var(--text-muted)] flex items-start gap-2">
        <Lightbulb size={16} className="text-yellow-500 flex-shrink-0 mt-0.5" />
        <span><strong>Try this:</strong> Select the &quot;gradient&quot; preset and rotate the sphere.
        Notice how color changes based on viewing direction — this is how 3DGS captures specular highlights!</span>
      </div>
    </div>
  );
}
