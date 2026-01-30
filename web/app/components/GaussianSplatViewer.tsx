'use client';

import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { LumaSplatsThree } from '@lumaai/luma-web';

interface LumaSplatsComponentProps {
  source: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

function LumaSplatsComponent({ source, position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }: LumaSplatsComponentProps) {
  const splatRef = useRef<LumaSplatsThree | null>(null);
  const { scene } = useThree();

  useEffect(() => {
    const splat = new LumaSplatsThree({
      source,
      enableThreeShaderIntegration: true,
    });

    splat.position.set(...position);
    splat.rotation.set(...rotation);
    splat.scale.setScalar(scale);

    scene.add(splat);
    splatRef.current = splat;

    return () => {
      scene.remove(splat);
      splat.dispose();
    };
  }, [source, scene, position, rotation, scale]);

  useFrame((state) => {
    if (!splatRef.current) return;

    const t = state.clock.getElapsedTime();
    const idleBob = Math.sin(t * 1.1) * 0.03;
    const idleBreath = 1 + Math.sin(t * 1.6) * 0.01;
    const idleYaw = Math.sin(t * 0.35) * 0.12;

    splatRef.current.position.set(position[0], position[1] + idleBob, position[2]);
    splatRef.current.rotation.set(rotation[0] + Math.sin(t * 0.45) * 0.03, rotation[1] + idleYaw, rotation[2]);
    splatRef.current.scale.setScalar(scale * idleBreath);
  });

  return null;
}

function SceneContent({ source }: { source: string }) {
  return (
    <>
      <LumaSplatsComponent
        source={source}
        position={[0, 0, 0]}
        scale={1}
      />
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={1}
        maxDistance={10}
      />
    </>
  );
}

interface GaussianSplatViewerProps {
  source?: string;
  className?: string;
}

export default function GaussianSplatViewer({
  source = 'https://lumalabs.ai/capture/83e9aae8-7023-448e-83a6-53ccb377ec86',
  className = ''
}: GaussianSplatViewerProps) {
  const [error, setError] = useState<string | null>(null);

  if (error) {
    return (
      <div className={`bg-[var(--card-bg)] rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-lg overflow-hidden ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 3], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
        onError={() => setError('WebGL not supported')}
      >
        <SceneContent source={source} />
      </Canvas>
      <div className="absolute bottom-3 left-3 text-xs text-[var(--muted)] bg-[var(--card-bg)]/80 px-2 py-1 rounded">
        Drag to rotate | Scroll to zoom
      </div>
    </div>
  );
}
