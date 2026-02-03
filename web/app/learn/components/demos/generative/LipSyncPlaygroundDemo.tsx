'use client';

import { useState, useEffect, useRef } from 'react';
import { Mic, FileText, Smile, Drama } from 'lucide-react';

interface Viseme {
  id: string;
  phonemes: string[];
  mouthShape: string;
  jawOpen: number;
  lipWidth: number;
  lipRound: number;
}

const VISEMES: Viseme[] = [
  { id: 'sil', phonemes: ['silence'], mouthShape: 'Closed', jawOpen: 0, lipWidth: 0.5, lipRound: 0 },
  { id: 'PP', phonemes: ['p', 'b', 'm'], mouthShape: 'Bilabial', jawOpen: 0.1, lipWidth: 0.4, lipRound: 0 },
  { id: 'FF', phonemes: ['f', 'v'], mouthShape: 'Labiodental', jawOpen: 0.2, lipWidth: 0.5, lipRound: 0 },
  { id: 'TH', phonemes: ['th'], mouthShape: 'Dental', jawOpen: 0.3, lipWidth: 0.5, lipRound: 0 },
  { id: 'DD', phonemes: ['t', 'd', 'n'], mouthShape: 'Alveolar', jawOpen: 0.4, lipWidth: 0.5, lipRound: 0 },
  { id: 'kk', phonemes: ['k', 'g'], mouthShape: 'Velar', jawOpen: 0.5, lipWidth: 0.5, lipRound: 0 },
  { id: 'CH', phonemes: ['ch', 'j', 'sh'], mouthShape: 'Palatal', jawOpen: 0.4, lipWidth: 0.4, lipRound: 0.3 },
  { id: 'SS', phonemes: ['s', 'z'], mouthShape: 'Sibilant', jawOpen: 0.3, lipWidth: 0.4, lipRound: 0 },
  { id: 'nn', phonemes: ['n', 'l'], mouthShape: 'Nasal', jawOpen: 0.3, lipWidth: 0.5, lipRound: 0 },
  { id: 'RR', phonemes: ['r'], mouthShape: 'Retroflex', jawOpen: 0.4, lipWidth: 0.5, lipRound: 0.2 },
  { id: 'aa', phonemes: ['a', 'ah'], mouthShape: 'Open', jawOpen: 0.9, lipWidth: 0.6, lipRound: 0 },
  { id: 'E', phonemes: ['e', 'eh'], mouthShape: 'Mid-Front', jawOpen: 0.5, lipWidth: 0.6, lipRound: 0 },
  { id: 'I', phonemes: ['i', 'ee'], mouthShape: 'High-Front', jawOpen: 0.3, lipWidth: 0.7, lipRound: 0 },
  { id: 'O', phonemes: ['o', 'oh'], mouthShape: 'Mid-Back', jawOpen: 0.6, lipWidth: 0.4, lipRound: 0.7 },
  { id: 'U', phonemes: ['u', 'oo'], mouthShape: 'High-Back', jawOpen: 0.3, lipWidth: 0.3, lipRound: 0.9 },
];

const SAMPLE_PHRASES = [
  { text: 'Hello', sequence: ['sil', 'E', 'nn', 'O', 'sil'] },
  { text: 'Avatar', sequence: ['aa', 'FF', 'aa', 'DD', 'aa', 'RR', 'sil'] },
  { text: 'Real-time', sequence: ['RR', 'I', 'O', 'nn', 'DD', 'aa', 'I', 'PP', 'sil'] },
  { text: 'Wow', sequence: ['sil', 'U', 'aa', 'U', 'sil'] },
];

export function LipSyncPlaygroundDemo() {
  const [currentViseme, setCurrentViseme] = useState<Viseme>(VISEMES[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingPhrase, setPlayingPhrase] = useState<string | null>(null);
  const [smoothing, setSmoothing] = useState(0.5);
  const [speed, setSpeed] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const targetVisemeRef = useRef<Viseme>(VISEMES[0]);
  const currentValuesRef = useRef({ jawOpen: 0, lipWidth: 0.5, lipRound: 0 });

  // Smooth animation loop
  useEffect(() => {
    const animate = () => {
      const target = targetVisemeRef.current;
      const current = currentValuesRef.current;
      const smoothFactor = 1 - smoothing * 0.9;

      current.jawOpen += (target.jawOpen - current.jawOpen) * smoothFactor;
      current.lipWidth += (target.lipWidth - current.lipWidth) * smoothFactor;
      current.lipRound += (target.lipRound - current.lipRound) * smoothFactor;

      renderMouth(current.jawOpen, current.lipWidth, current.lipRound);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [smoothing]);

  // Update target when viseme changes
  useEffect(() => {
    targetVisemeRef.current = currentViseme;
  }, [currentViseme]);

  const renderMouth = (jawOpen: number, lipWidth: number, lipRound: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 300;
    const height = 200;
    ctx.clearRect(0, 0, width, height);

    // Background - face
    const faceGradient = ctx.createRadialGradient(
      width / 2, height * 0.3, 10,
      width / 2, height / 2, height * 0.6
    );
    faceGradient.addColorStop(0, '#ffdbac');
    faceGradient.addColorStop(1, '#e0ac69');
    ctx.fillStyle = faceGradient;
    ctx.fillRect(0, 0, width, height);

    // Mouth opening
    const mouthCenterX = width / 2;
    const mouthCenterY = height * 0.55;
    const mouthWidth = 40 + lipWidth * 40;
    const mouthHeight = 5 + jawOpen * 45;
    const roundness = lipRound;

    // Outer lip
    ctx.fillStyle = '#c9544d';
    ctx.beginPath();

    if (roundness > 0.5) {
      // Round mouth (O, U sounds)
      ctx.ellipse(mouthCenterX, mouthCenterY, mouthWidth * (1 - roundness * 0.3), mouthHeight, 0, 0, Math.PI * 2);
    } else {
      // Wide mouth
      ctx.ellipse(mouthCenterX, mouthCenterY, mouthWidth, mouthHeight, 0, 0, Math.PI * 2);
    }
    ctx.fill();

    // Inner mouth (dark)
    if (jawOpen > 0.1) {
      ctx.fillStyle = '#2d1f1f';
      ctx.beginPath();
      const innerWidth = mouthWidth * 0.7 * (1 - roundness * 0.2);
      const innerHeight = mouthHeight * 0.7;
      ctx.ellipse(mouthCenterX, mouthCenterY, innerWidth, innerHeight, 0, 0, Math.PI * 2);
      ctx.fill();

      // Teeth (top)
      if (jawOpen > 0.3) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(mouthCenterX, mouthCenterY - innerHeight * 0.3, innerWidth * 0.8, innerHeight * 0.3, 0, Math.PI, Math.PI * 2);
        ctx.fill();
      }

      // Tongue
      if (jawOpen > 0.4) {
        ctx.fillStyle = '#d35d6e';
        ctx.beginPath();
        ctx.ellipse(mouthCenterX, mouthCenterY + innerHeight * 0.3, innerWidth * 0.5, innerHeight * 0.3, 0, 0, Math.PI);
        ctx.fill();
      }
    }

    // Upper lip highlight
    ctx.strokeStyle = '#a04030';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(mouthCenterX, mouthCenterY, mouthWidth * (1 - roundness * 0.3), mouthHeight, 0, Math.PI, Math.PI * 2);
    ctx.stroke();
  };

  const playPhrase = async (phrase: typeof SAMPLE_PHRASES[0]) => {
    setIsPlaying(true);
    setPlayingPhrase(phrase.text);

    const duration = 200 / speed;
    for (const visemeId of phrase.sequence) {
      const viseme = VISEMES.find(v => v.id === visemeId) || VISEMES[0];
      setCurrentViseme(viseme);
      await new Promise(resolve => setTimeout(resolve, duration));
    }

    setIsPlaying(false);
    setPlayingPhrase(null);
  };

  return (
    <div className="card p-6">
      <h3 className="font-semibold mb-2">Lip Sync Playground</h3>
      <p className="text-sm text-[var(--muted)] mb-6">
        Explore how audio phonemes map to visual mouth shapes (visemes).
        Click visemes or play phrases to see the lip sync in action.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Mouth Visualization */}
        <div>
          <p className="text-sm font-medium mb-2">Mouth Shape</p>
          <div className="flex flex-col items-center">
            <canvas
              ref={canvasRef}
              width={300}
              height={200}
              className="rounded-lg border border-[var(--border)] bg-[var(--card-bg-alt)]"
            />

            {/* Current viseme info */}
            <div className="mt-4 p-3 bg-[var(--card-bg-alt)] rounded text-sm w-full">
              <div className="flex justify-between items-center">
                <span className="font-medium">Current: {currentViseme.id}</span>
                <span className="text-[var(--muted)]">{currentViseme.mouthShape}</span>
              </div>
              <p className="text-xs text-[var(--muted)] mt-1">
                Phonemes: {currentViseme.phonemes.join(', ')}
              </p>
            </div>

            {/* Parameters display */}
            <div className="mt-2 grid grid-cols-3 gap-2 w-full text-xs">
              <div className="p-2 bg-[var(--card-bg-alt)] rounded text-center">
                <p className="text-[var(--muted)]">Jaw Open</p>
                <p className="font-mono">{currentViseme.jawOpen.toFixed(2)}</p>
              </div>
              <div className="p-2 bg-[var(--card-bg-alt)] rounded text-center">
                <p className="text-[var(--muted)]">Lip Width</p>
                <p className="font-mono">{currentViseme.lipWidth.toFixed(2)}</p>
              </div>
              <div className="p-2 bg-[var(--card-bg-alt)] rounded text-center">
                <p className="text-[var(--muted)]">Lip Round</p>
                <p className="font-mono">{currentViseme.lipRound.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {/* Viseme selector */}
          <div>
            <p className="text-sm font-medium mb-2">Viseme Palette</p>
            <div className="grid grid-cols-5 gap-1">
              {VISEMES.map((viseme) => (
                <button
                  key={viseme.id}
                  onClick={() => setCurrentViseme(viseme)}
                  className={`p-2 rounded text-xs font-mono transition-colors ${
                    currentViseme.id === viseme.id
                      ? 'bg-[var(--accent)] text-white'
                      : 'bg-[var(--card-bg-alt)] hover:bg-[var(--border)]'
                  }`}
                  title={`${viseme.mouthShape}: ${viseme.phonemes.join(', ')}`}
                >
                  {viseme.id}
                </button>
              ))}
            </div>
          </div>

          {/* Sample phrases */}
          <div>
            <p className="text-sm font-medium mb-2">Sample Phrases</p>
            <div className="grid grid-cols-2 gap-2">
              {SAMPLE_PHRASES.map((phrase) => (
                <button
                  key={phrase.text}
                  onClick={() => playPhrase(phrase)}
                  disabled={isPlaying}
                  className={`p-3 rounded text-sm transition-colors ${
                    playingPhrase === phrase.text
                      ? 'bg-[var(--accent)] text-white'
                      : 'bg-[var(--card-bg-alt)] hover:bg-[var(--border)]'
                  } ${isPlaying ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {phrase.text}
                </button>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Smoothing</span>
                <span className="text-[var(--muted)]">{smoothing.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={0.9}
                step={0.1}
                value={smoothing}
                onChange={(e) => setSmoothing(Number(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-[var(--muted)]">
                Higher = smoother transitions, lower = snappier
              </p>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Speed</span>
                <span className="text-[var(--muted)]">{speed}x</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={2}
                step={0.25}
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className="mt-6 p-4 bg-[var(--card-bg-alt)] rounded">
        <p className="font-medium mb-2">Audio-to-Lip-Sync Pipeline</p>
        <div className="grid md:grid-cols-4 gap-4 text-sm text-[var(--muted)]">
          <div className="text-center">
            <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-[var(--color-generative-light)] flex items-center justify-center">
              <Mic size={20} className="text-[var(--color-generative)]" />
            </div>
            <p className="font-medium text-[var(--foreground)]">Audio</p>
            <p className="text-xs">Raw waveform</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-[var(--color-generative-light)] flex items-center justify-center">
              <FileText size={20} className="text-[var(--color-generative)]" />
            </div>
            <p className="font-medium text-[var(--foreground)]">Phonemes</p>
            <p className="text-xs">"Hello" → h-ə-l-oʊ</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-[var(--color-generative-light)] flex items-center justify-center">
              <Smile size={20} className="text-[var(--color-generative)]" />
            </div>
            <p className="font-medium text-[var(--foreground)]">Visemes</p>
            <p className="text-xs">Mouth shape targets</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-[var(--color-generative-light)] flex items-center justify-center">
              <Drama size={20} className="text-[var(--color-generative)]" />
            </div>
            <p className="font-medium text-[var(--foreground)]">Animation</p>
            <p className="text-xs">Blended shapes</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LipSyncPlaygroundDemo;
