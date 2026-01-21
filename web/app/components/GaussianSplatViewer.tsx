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

  useFrame(() => {
    if (splatRef.current) {
      splatRef.current.rotation.y += 0.002;
    }
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
  source = 'https://lumalabs.ai/capture/822bac8d-70d6-404e-aaae-f89f46672c67',
  className = ''
}: GaussianSplatViewerProps) {
  const [isClient, setIsClient] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className={`bg-[var(--card-bg)] rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-[var(--muted)]">Loading 3D viewer...</div>
      </div>
    );
  }

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
