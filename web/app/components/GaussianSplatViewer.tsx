'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { LumaSplatsThree } from '@lumaai/luma-web';

interface LumaSplatsComponentProps {
  source: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  onLoaded?: () => void;
}

function LumaSplatsComponent({ source, position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, onLoaded }: LumaSplatsComponentProps) {
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

    // Listen for load completion
    splat.onLoad = () => {
      onLoaded?.();
    };

    scene.add(splat);
    splatRef.current = splat;

    return () => {
      scene.remove(splat);
      splat.dispose();
    };
  }, [source, scene, position, rotation, scale, onLoaded]);

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

function SceneContent({ source, onLoaded }: { source: string; onLoaded?: () => void }) {
  return (
    <>
      <LumaSplatsComponent
        source={source}
        position={[0, 0, 0]}
        scale={1}
        onLoaded={onLoaded}
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

// Loading placeholder with animated gradient
function LoadingPlaceholder({ isLoading }: { isLoading: boolean }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--surface-0)] transition-opacity duration-500"
         style={{ opacity: isLoading ? 1 : 0, pointerEvents: isLoading ? 'auto' : 'none' }}>
      <div className="relative w-24 h-24 mb-4">
        {/* Animated gaussian-like circles */}
        <div className="absolute inset-0 rounded-full bg-[var(--accent)]/20 animate-ping" style={{ animationDuration: '2s' }} />
        <div className="absolute inset-2 rounded-full bg-[var(--accent)]/30 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.3s' }} />
        <div className="absolute inset-4 rounded-full bg-[var(--accent)]/40 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.6s' }} />
        <div className="absolute inset-6 rounded-full bg-[var(--accent)]/50 animate-pulse" />
        <div className="absolute inset-8 rounded-full bg-[var(--accent)]/60 flex items-center justify-center">
          <span className="text-xs font-medium text-white">3D</span>
        </div>
      </div>
      <p className="text-sm text-[var(--text-muted)]">Loading Gaussian Splat...</p>
      <p className="text-xs text-[var(--text-muted)] mt-1 opacity-60">Streaming point cloud data</p>
    </div>
  );
}

interface GaussianSplatViewerProps {
  source?: string;
  className?: string;
  lazyLoad?: boolean;
}

export default function GaussianSplatViewer({
  source = 'https://lumalabs.ai/capture/83e9aae8-7023-448e-83a6-53ccb377ec86',
  className = '',
  lazyLoad = true
}: GaussianSplatViewerProps) {
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(!lazyLoad);
  const [isLoading, setIsLoading] = useState(true);
  const [shouldRender, setShouldRender] = useState(!lazyLoad);
  const containerRef = useRef<HTMLDivElement>(null);

  // IntersectionObserver for lazy loading
  useEffect(() => {
    if (!lazyLoad || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            // Small delay to prevent janky loading when quickly scrolling past
            setTimeout(() => setShouldRender(true), 100);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '200px', // Start loading 200px before entering viewport
        threshold: 0
      }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [lazyLoad]);

  const handleLoaded = useCallback(() => {
    setIsLoading(false);
  }, []);

  if (error) {
    return (
      <div ref={containerRef} className={`bg-[var(--surface-0)] rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center p-4">
          <p className="text-red-500 mb-2">{error}</p>
          <p className="text-xs text-[var(--text-muted)]">WebGL is required for 3D visualization</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative rounded-lg overflow-hidden ${className}`}>
      {/* Loading placeholder - always present but fades out */}
      <LoadingPlaceholder isLoading={isLoading || !shouldRender} />

      {/* Only render Canvas when visible and should render */}
      {shouldRender && (
        <Canvas
          camera={{ position: [0, 0, 3], fov: 50 }}
          gl={{ antialias: true, alpha: true }}
          style={{ background: 'transparent' }}
          onError={() => setError('WebGL not supported')}
        >
          <SceneContent source={source} onLoaded={handleLoaded} />
        </Canvas>
      )}

      {/* Controls hint - only show when loaded */}
      <div
        className="absolute bottom-3 left-3 text-xs text-[var(--text-muted)] bg-[var(--surface-0)]/80 px-2 py-1 rounded transition-opacity duration-500"
        style={{ opacity: isLoading ? 0 : 1 }}
      >
        Drag to rotate | Scroll to zoom
      </div>
    </div>
  );
}
