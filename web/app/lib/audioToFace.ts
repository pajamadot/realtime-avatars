export type AudioToFaceFrame = {
  jawOpen: number;
  mouthFunnel: number;
  mouthPucker: number;
  mouthClose: number;
  browInnerUp: number;
  cheekSquintLeft: number;
  cheekSquintRight: number;
};

export function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

export function mapAmplitudeToFace(rms: number, lowBandEnergy = 0, highBandEnergy = 0): AudioToFaceFrame {
  const normalized = clamp01((rms - 0.01) / 0.14);
  const low = clamp01(lowBandEnergy);
  const high = clamp01(highBandEnergy);

  const jawOpen = clamp01(normalized * 1.2);
  const mouthFunnel = clamp01(normalized * 0.45 + high * 0.25);
  const mouthPucker = clamp01((1 - normalized) * 0.2 + high * 0.15);
  const mouthClose = clamp01((1 - normalized) * 0.25);
  const browInnerUp = clamp01(normalized * 0.2 + low * 0.1);
  const cheekSquint = clamp01(normalized * 0.15);

  return {
    jawOpen,
    mouthFunnel,
    mouthPucker,
    mouthClose,
    browInnerUp,
    cheekSquintLeft: cheekSquint,
    cheekSquintRight: cheekSquint,
  };
}
