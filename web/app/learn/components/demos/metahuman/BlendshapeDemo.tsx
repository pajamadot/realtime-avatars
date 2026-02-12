'use client';

import { useState, useRef, useEffect, useCallback, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

// ═════════════════════════════════════════════════════════════════════════════
// ARKit 52 Blendshape Playground — Real 3D Face
// Reference: Apple ARFaceAnchor.BlendShapeLocation
// https://developer.apple.com/documentation/arkit/arfaceanchor/blendshapelocation
// FACS mapping: Ekman & Friesen Facial Action Coding System (1978)
// 3D Model: Three.js facecap.glb (CC0)
// ═════════════════════════════════════════════════════════════════════════════

interface BS { name: string; region: string; facs: string; }

const BLENDSHAPES: BS[] = [
  // Eyes (14)
  { name: 'eyeBlinkLeft', region: 'Eyes', facs: 'AU45L' },
  { name: 'eyeBlinkRight', region: 'Eyes', facs: 'AU45R' },
  { name: 'eyeLookDownLeft', region: 'Eyes', facs: 'AU61L' },
  { name: 'eyeLookDownRight', region: 'Eyes', facs: 'AU61R' },
  { name: 'eyeLookInLeft', region: 'Eyes', facs: 'AU62L' },
  { name: 'eyeLookInRight', region: 'Eyes', facs: 'AU62R' },
  { name: 'eyeLookOutLeft', region: 'Eyes', facs: 'AU63L' },
  { name: 'eyeLookOutRight', region: 'Eyes', facs: 'AU63R' },
  { name: 'eyeLookUpLeft', region: 'Eyes', facs: 'AU64L' },
  { name: 'eyeLookUpRight', region: 'Eyes', facs: 'AU64R' },
  { name: 'eyeSquintLeft', region: 'Eyes', facs: 'AU6L' },
  { name: 'eyeSquintRight', region: 'Eyes', facs: 'AU6R' },
  { name: 'eyeWideLeft', region: 'Eyes', facs: 'AU5L' },
  { name: 'eyeWideRight', region: 'Eyes', facs: 'AU5R' },
  // Brows (5)
  { name: 'browDownLeft', region: 'Brows', facs: 'AU4L' },
  { name: 'browDownRight', region: 'Brows', facs: 'AU4R' },
  { name: 'browInnerUp', region: 'Brows', facs: 'AU1' },
  { name: 'browOuterUpLeft', region: 'Brows', facs: 'AU2L' },
  { name: 'browOuterUpRight', region: 'Brows', facs: 'AU2R' },
  // Jaw (4)
  { name: 'jawForward', region: 'Jaw', facs: 'AU29' },
  { name: 'jawLeft', region: 'Jaw', facs: 'AU30L' },
  { name: 'jawOpen', region: 'Jaw', facs: 'AU26+27' },
  { name: 'jawRight', region: 'Jaw', facs: 'AU30R' },
  // Mouth (23)
  { name: 'mouthClose', region: 'Mouth', facs: 'AU24' },
  { name: 'mouthDimpleLeft', region: 'Mouth', facs: 'AU14L' },
  { name: 'mouthDimpleRight', region: 'Mouth', facs: 'AU14R' },
  { name: 'mouthFrownLeft', region: 'Mouth', facs: 'AU15L' },
  { name: 'mouthFrownRight', region: 'Mouth', facs: 'AU15R' },
  { name: 'mouthFunnel', region: 'Mouth', facs: 'AU22' },
  { name: 'mouthLeft', region: 'Mouth', facs: 'AU30L' },
  { name: 'mouthLowerDownLeft', region: 'Mouth', facs: 'AU16L' },
  { name: 'mouthLowerDownRight', region: 'Mouth', facs: 'AU16R' },
  { name: 'mouthPressLeft', region: 'Mouth', facs: 'AU23L' },
  { name: 'mouthPressRight', region: 'Mouth', facs: 'AU23R' },
  { name: 'mouthPucker', region: 'Mouth', facs: 'AU18' },
  { name: 'mouthRight', region: 'Mouth', facs: 'AU30R' },
  { name: 'mouthRollLower', region: 'Mouth', facs: 'AU28L' },
  { name: 'mouthRollUpper', region: 'Mouth', facs: 'AU28U' },
  { name: 'mouthShrugLower', region: 'Mouth', facs: 'AU17L' },
  { name: 'mouthShrugUpper', region: 'Mouth', facs: 'AU17U' },
  { name: 'mouthSmileLeft', region: 'Mouth', facs: 'AU12L' },
  { name: 'mouthSmileRight', region: 'Mouth', facs: 'AU12R' },
  { name: 'mouthStretchLeft', region: 'Mouth', facs: 'AU20L' },
  { name: 'mouthStretchRight', region: 'Mouth', facs: 'AU20R' },
  { name: 'mouthUpperUpLeft', region: 'Mouth', facs: 'AU10L' },
  { name: 'mouthUpperUpRight', region: 'Mouth', facs: 'AU10R' },
  // Cheeks (3)
  { name: 'cheekPuff', region: 'Cheeks', facs: 'AU33' },
  { name: 'cheekSquintLeft', region: 'Cheeks', facs: 'AU6L' },
  { name: 'cheekSquintRight', region: 'Cheeks', facs: 'AU6R' },
  // Nose (2)
  { name: 'noseSneerLeft', region: 'Nose', facs: 'AU9L' },
  { name: 'noseSneerRight', region: 'Nose', facs: 'AU9R' },
  // Tongue (1)
  { name: 'tongueOut', region: 'Tongue', facs: 'AU19' },
];

const REGIONS = ['Eyes', 'Brows', 'Jaw', 'Mouth', 'Cheeks', 'Nose', 'Tongue'];
const REGION_COUNTS: Record<string, number> = {};
BLENDSHAPES.forEach(b => { REGION_COUNTS[b.region] = (REGION_COUNTS[b.region] || 0) + 1; });

const PRESETS: Record<string, Record<string, number>> = {
  neutral: {},
  smile: {
    mouthSmileLeft: 0.85, mouthSmileRight: 0.85,
    cheekSquintLeft: 0.4, cheekSquintRight: 0.4,
    eyeSquintLeft: 0.2, eyeSquintRight: 0.2,
  },
  surprise: {
    eyeWideLeft: 1, eyeWideRight: 1,
    browInnerUp: 0.8, browOuterUpLeft: 0.7, browOuterUpRight: 0.7,
    jawOpen: 0.5, mouthFunnel: 0.3,
  },
  angry: {
    browDownLeft: 0.9, browDownRight: 0.9,
    eyeSquintLeft: 0.5, eyeSquintRight: 0.5,
    noseSneerLeft: 0.6, noseSneerRight: 0.6,
    mouthFrownLeft: 0.3, mouthFrownRight: 0.3, jawOpen: 0.15,
  },
  sad: {
    browInnerUp: 0.7, browDownLeft: 0.3, browDownRight: 0.3,
    mouthFrownLeft: 0.6, mouthFrownRight: 0.6,
    mouthPressLeft: 0.3, mouthPressRight: 0.3,
  },
  wink: { eyeBlinkLeft: 1, mouthSmileLeft: 0.6, mouthSmileRight: 0.35, cheekSquintLeft: 0.5 },
  kiss: { mouthPucker: 0.9, mouthFunnel: 0.4, eyeBlinkLeft: 0.3, eyeBlinkRight: 0.3 },
  fear: {
    eyeWideLeft: 0.9, eyeWideRight: 0.9,
    browInnerUp: 0.9, browOuterUpLeft: 0.4, browOuterUpRight: 0.4,
    mouthStretchLeft: 0.6, mouthStretchRight: 0.6, jawOpen: 0.3,
  },
};

// ═══ Name mapping: camelCase ARKit -> facecap.glb _L/_R convention ═══════════

function toMorphName(name: string): string {
  return name.replace(/Left$/, '_L').replace(/Right$/, '_R');
}

// ═══ 3D Face Model ═══════════════════════════════════════════════════════════

const MODEL_PATH = '/models/facecap.glb';
const BASIS_PATH = 'https://cdn.jsdelivr.net/gh/pmndrs/drei-assets/basis/';

function FaceModel({ weightsRef }: { weightsRef: React.MutableRefObject<Record<string, number>> }) {
  const gl = useThree(s => s.gl);

  const gltf = useLoader(GLTFLoader, MODEL_PATH, (loader) => {
    const ktx2 = new KTX2Loader();
    ktx2.setTranscoderPath(BASIS_PATH);
    ktx2.detectSupport(gl);
    loader.setKTX2Loader(ktx2);
    loader.setMeshoptDecoder(MeshoptDecoder);
  });

  const cloned = useMemo(() => {
    const s = gltf.scene.clone(true);
    s.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.isMesh && mesh.material) {
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (mat.isMeshStandardMaterial) {
          mat.roughness = 0.6;
          mat.metalness = 0.1;
          mat.envMapIntensity = 0.5;
        }
      }
    });
    return s;
  }, [gltf.scene]);

  const faceMeshRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    cloned.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.isMesh && mesh.morphTargetDictionary) {
        faceMeshRef.current = mesh;
      }
    });
  }, [cloned]);

  useFrame(() => {
    const mesh = faceMeshRef.current;
    if (!mesh?.morphTargetDictionary || !mesh.morphTargetInfluences) return;
    const dict = mesh.morphTargetDictionary;
    const w = weightsRef.current;
    for (const bs of BLENDSHAPES) {
      const morphName = toMorphName(bs.name);
      if (morphName in dict) {
        mesh.morphTargetInfluences[dict[morphName]] = w[bs.name] || 0;
      }
    }
  });

  return (
    <group position={[0, -1.65, 0.1]}>
      <primitive object={cloned} />
    </group>
  );
}


function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 4, 5]} intensity={1.2} color="#ffeedd" />
      <directionalLight position={[-3, 2, 3]} intensity={0.5} color="#ddeeff" />
      <directionalLight position={[0, -1, 3]} intensity={0.3} color="#ffffff" />
    </>
  );
}

// ═══ Component ═══════════════════════════════════════════════════════════════

export function BlendshapeDemo() {
  const [weights, setWeights] = useState<Record<string, number>>(() =>
    Object.fromEntries(BLENDSHAPES.map(b => [b.name, 0])),
  );
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(['Eyes', 'Mouth']));
  const [activePreset, setActivePreset] = useState('neutral');
  const targetRef = useRef<Record<string, number>>({});
  const currentRef = useRef<Record<string, number>>(
    Object.fromEntries(BLENDSHAPES.map(b => [b.name, 0])),
  );
  const weightsRef = useRef<Record<string, number>>(
    Object.fromEntries(BLENDSHAPES.map(b => [b.name, 0])),
  );
  const rafRef = useRef(0);

  const activeCount = Object.values(weights).filter(v => v > 0.01).length;

  // Keep weightsRef in sync
  useEffect(() => { weightsRef.current = weights; }, [weights]);

  const toggle = (region: string) => {
    setExpanded(prev => {
      const n = new Set(prev);
      n.has(region) ? n.delete(region) : n.add(region);
      return n;
    });
  };

  const setWeight = (name: string, value: number) => {
    currentRef.current[name] = value;
    setWeights(prev => ({ ...prev, [name]: value }));
  };

  const applyPreset = useCallback((presetName: string) => {
    setActivePreset(presetName);
    const preset = PRESETS[presetName] || {};
    BLENDSHAPES.forEach(b => { targetRef.current[b.name] = preset[b.name] ?? 0; });
    const animate = () => {
      let settled = true;
      const next: Record<string, number> = {};
      BLENDSHAPES.forEach(b => {
        const cur = currentRef.current[b.name] || 0;
        const tgt = targetRef.current[b.name] ?? 0;
        const diff = tgt - cur;
        if (Math.abs(diff) > 0.002) {
          settled = false;
          next[b.name] = cur + diff * 0.13;
        } else {
          next[b.name] = tgt;
        }
      });
      currentRef.current = next;
      setWeights({ ...next });
      if (!settled) rafRef.current = requestAnimationFrame(animate);
    };
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  return (
    <div className="card p-6">
      <h3 className="font-semibold mb-1">ARKit 52 Blendshape Playground</h3>
      <p className="text-xs text-[var(--text-muted)] mb-1">
        Apple <code className="text-[10px]">ARFaceAnchor.BlendShapeLocation</code> &mdash; 52 coefficients mapped to FACS Action Units.
      </p>
      <p className="text-[10px] text-[var(--text-muted)] mb-4">
        Each w<sub>i</sub> &isin; [0,1] linearly blends a basis deformation B<sub>i</sub> onto the neutral mesh x<sub>0</sub>. Drag to orbit.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* 3D Face */}
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-lg overflow-hidden w-full max-w-[340px] bg-[#0f0f1a]" style={{ aspectRatio: '340/400' }}>
            <Suspense fallback={
              <div className="flex items-center justify-center h-full text-[var(--text-muted)]">
                <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
              </div>
            }>
              <Canvas
                camera={{ position: [0, 0.05, 1.5], fov: 28 }}
                gl={{ antialias: true, alpha: false }}
                style={{ background: '#0f0f1a' }}
              >
                <color attach="background" args={['#0f0f1a']} />
                <SceneLighting />
                <FaceModel weightsRef={weightsRef} />
                <OrbitControls
                  target={[0, 0.05, 0]}
                  enableZoom={false}
                  enablePan={false}
                  minPolarAngle={Math.PI / 3}
                  maxPolarAngle={Math.PI * 2 / 3}
                  minAzimuthAngle={-Math.PI / 3}
                  maxAzimuthAngle={Math.PI / 3}
                />
              </Canvas>
            </Suspense>
          </div>

          <div className="w-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium">Expression Presets</span>
              <span className="text-[10px] text-[var(--text-muted)]">
                {activeCount}/52 active
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {Object.keys(PRESETS).map(p => (
                <button
                  key={p}
                  onClick={() => applyPreset(p)}
                  className={`text-xs px-2.5 py-1 rounded capitalize transition-colors ${
                    activePreset === p
                      ? 'bg-[var(--accent)] text-white'
                      : 'bg-[var(--surface-2)] hover:bg-[var(--border)]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Blendshape sliders by region */}
        <div className="max-h-[440px] overflow-y-auto space-y-1 pr-1">
          {REGIONS.map(region => {
            const isOpen = expanded.has(region);
            const regionBs = BLENDSHAPES.filter(b => b.region === region);
            const regionActive = regionBs.filter(b => (weights[b.name] || 0) > 0.01).length;
            return (
              <div key={region} className="border border-[var(--border)] rounded overflow-hidden">
                <button
                  onClick={() => toggle(region)}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium hover:bg-[var(--surface-1)] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-[10px] text-[var(--text-muted)]">{isOpen ? '\u25BC' : '\u25B6'}</span>
                    {region}
                    {regionActive > 0 && (
                      <span className="text-[9px] bg-[var(--accent)]/20 text-[var(--accent)] px-1.5 rounded-full">
                        {regionActive}
                      </span>
                    )}
                  </span>
                  <span className="text-[var(--text-muted)] text-[10px]">{REGION_COUNTS[region]}</span>
                </button>
                {isOpen && (
                  <div className="px-3 pb-2.5 pt-0.5 space-y-2 border-t border-[var(--border)]">
                    {regionBs.map(bs => {
                      const val = weights[bs.name] || 0;
                      return (
                        <div key={bs.name}>
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-[10px] font-mono leading-none">{bs.name}</span>
                            <span className="text-[9px] text-[var(--text-muted)] font-mono">
                              <span className="opacity-60">{bs.facs}</span> {val.toFixed(2)}
                            </span>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.01}
                            value={val}
                            onChange={e => setWeight(bs.name, parseFloat(e.target.value))}
                            className="w-full h-1.5"
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Formula + info */}
      <div className="mt-4 p-3 bg-[var(--surface-2)] rounded">
        <div className="flex items-center justify-between mb-1">
          <code className="text-xs font-mono">f(x) = x&#x2080; + &#x03A3; w&#x1D62; &middot; B&#x1D62;</code>
          <span className="text-[10px] text-[var(--text-muted)]">{activeCount}/52 active</span>
        </div>
        <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">
          Linear blend: neutral mesh x&#x2080; + weighted sum of 52 basis deformations.
          Mapped to FACS Action Units (Ekman &amp; Friesen, 1978).
          3D model: Three.js facecap.glb with ARKit morph targets.
        </p>
      </div>
    </div>
  );
}

export default BlendshapeDemo;
