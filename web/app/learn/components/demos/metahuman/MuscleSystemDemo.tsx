'use client';

import { useState, useRef, useEffect } from 'react';

interface Muscle {
  id: string;
  name: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  activation: number;
  color: string;
}

export function MuscleSystemDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [showLabels, setShowLabels] = useState(true);
  const [animating, setAnimating] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0);

  // Define facial muscles
  const [muscles, setMuscles] = useState<Muscle[]>([
    // Forehead
    { id: 'frontalis_l', name: 'Frontalis L', startX: 200, startY: 85, endX: 200, endY: 60, activation: 0, color: '#ff6666' },
    { id: 'frontalis_r', name: 'Frontalis R', startX: 300, startY: 85, endX: 300, endY: 60, activation: 0, color: '#ff6666' },

    // Eye area
    { id: 'orbicularis_l', name: 'Orbicularis L', startX: 185, startY: 130, endX: 215, endY: 130, activation: 0, color: '#66aaff' },
    { id: 'orbicularis_r', name: 'Orbicularis R', startX: 285, startY: 130, endX: 315, endY: 130, activation: 0, color: '#66aaff' },

    // Cheek
    { id: 'zygomaticus_l', name: 'Zygomaticus L', startX: 185, startY: 185, endX: 160, endY: 140, activation: 0, color: '#66ff66' },
    { id: 'zygomaticus_r', name: 'Zygomaticus R', startX: 315, startY: 185, endX: 340, endY: 140, activation: 0, color: '#66ff66' },

    // Mouth
    { id: 'orbicularis_oris', name: 'Orbicularis Oris', startX: 230, startY: 210, endX: 270, endY: 210, activation: 0, color: '#ffaa66' },
    { id: 'depressor_l', name: 'Depressor L', startX: 220, startY: 220, endX: 200, endY: 250, activation: 0, color: '#aa66ff' },
    { id: 'depressor_r', name: 'Depressor R', startX: 280, startY: 220, endX: 300, endY: 250, activation: 0, color: '#aa66ff' },

    // Jaw
    { id: 'masseter_l', name: 'Masseter L', startX: 175, startY: 180, endX: 165, endY: 230, activation: 0, color: '#ff66aa' },
    { id: 'masseter_r', name: 'Masseter R', startX: 325, startY: 180, endX: 335, endY: 230, activation: 0, color: '#ff66aa' },
  ]);

  // Preset expressions
  const presets: Record<string, Record<string, number>> = {
    neutral: {},
    smile: {
      'zygomaticus_l': 0.8, 'zygomaticus_r': 0.8,
      'orbicularis_oris': 0.3, 'orbicularis_l': 0.2, 'orbicularis_r': 0.2
    },
    surprised: {
      'frontalis_l': 0.9, 'frontalis_r': 0.9,
      'orbicularis_l': 0.5, 'orbicularis_r': 0.5,
      'orbicularis_oris': 0.6
    },
    angry: {
      'frontalis_l': 0.3, 'frontalis_r': 0.3,
      'orbicularis_l': 0.7, 'orbicularis_r': 0.7,
      'masseter_l': 0.6, 'masseter_r': 0.6
    },
    sad: {
      'depressor_l': 0.7, 'depressor_r': 0.7,
      'frontalis_l': 0.4, 'frontalis_r': 0.4
    },
  };

  const applyPreset = (presetName: string) => {
    const preset = presets[presetName] || {};
    setMuscles(prev => prev.map(m => ({
      ...m,
      activation: preset[m.id] || 0
    })));
  };

  // Animation
  useEffect(() => {
    if (!animating) return;

    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 0.1) % (Math.PI * 2));

      // Animate through expressions
      const expressions = ['neutral', 'smile', 'surprised', 'neutral', 'sad', 'neutral'];
      const expressionIndex = Math.floor((animationPhase / (Math.PI * 2)) * expressions.length) % expressions.length;
      applyPreset(expressions[expressionIndex]);
    }, 100);

    return () => clearInterval(interval);
  }, [animating, animationPhase]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    const centerX = 250;
    const centerY = 160;

    // Draw head outline
    ctx.strokeStyle = '#444466';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, 100, 120, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Draw eyes
    ctx.fillStyle = '#333344';
    ctx.beginPath();
    ctx.ellipse(200, 130, 20, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(300, 130, 20, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw nose
    ctx.strokeStyle = '#444466';
    ctx.beginPath();
    ctx.moveTo(centerX, 140);
    ctx.lineTo(centerX - 10, 180);
    ctx.lineTo(centerX + 10, 180);
    ctx.stroke();

    // Draw base mouth
    ctx.beginPath();
    ctx.ellipse(centerX, 210, 25, 10, 0, 0, Math.PI);
    ctx.stroke();

    // Draw muscles
    muscles.forEach(muscle => {
      const isSelected = selectedMuscle === muscle.id;
      const activation = muscle.activation;

      // Calculate contracted position
      const contractionAmount = activation * 0.3;
      const dx = muscle.endX - muscle.startX;
      const dy = muscle.endY - muscle.startY;
      const contractedEndX = muscle.startX + dx * (1 - contractionAmount);
      const contractedEndY = muscle.startY + dy * (1 - contractionAmount);

      // Muscle fiber visualization
      ctx.strokeStyle = muscle.color;
      ctx.lineWidth = isSelected ? 6 : 4;
      ctx.lineCap = 'round';

      // Draw main muscle line
      ctx.globalAlpha = 0.3 + activation * 0.7;
      ctx.beginPath();
      ctx.moveTo(muscle.startX, muscle.startY);
      ctx.lineTo(contractedEndX, contractedEndY);
      ctx.stroke();

      // Bulge when contracted
      if (activation > 0) {
        const midX = (muscle.startX + contractedEndX) / 2;
        const midY = (muscle.startY + contractedEndY) / 2;
        const bulgeSize = activation * 8;

        ctx.fillStyle = muscle.color;
        ctx.globalAlpha = activation * 0.5;
        ctx.beginPath();
        ctx.ellipse(midX, midY, bulgeSize, bulgeSize * 0.6, Math.atan2(dy, dx), 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;

      // Attachment points
      ctx.fillStyle = isSelected ? '#ffffff' : muscle.color;
      ctx.beginPath();
      ctx.arc(muscle.startX, muscle.startY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(contractedEndX, contractedEndY, 3, 0, Math.PI * 2);
      ctx.fill();

      // Label
      if (showLabels && (isSelected || activation > 0.3)) {
        ctx.fillStyle = isSelected ? '#ffffff' : '#aaaaaa';
        ctx.font = '9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(muscle.name.replace('_', ' '), muscle.startX, muscle.startY - 10);
        if (activation > 0) {
          ctx.fillText(`${(activation * 100).toFixed(0)}%`, muscle.startX, muscle.startY + 20);
        }
      }
    });

    // Legend
    ctx.fillStyle = '#888888';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Click muscle to select, use slider to activate', 10, height - 10);

  }, [muscles, selectedMuscle, showLabels]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find clicked muscle
    const clicked = muscles.find(m => {
      const dist = Math.sqrt((m.startX - x) ** 2 + (m.startY - y) ** 2);
      return dist < 20;
    });

    setSelectedMuscle(clicked?.id || null);
  };

  const updateMuscleActivation = (activation: number) => {
    if (!selectedMuscle) return;

    setMuscles(prev => prev.map(m =>
      m.id === selectedMuscle ? { ...m, activation } : m
    ));
  };

  const selectedMuscleData = muscles.find(m => m.id === selectedMuscle);

  return (
    <div className="card p-6">
      <h3 className="font-semibold mb-2">Facial Muscle System</h3>
      <p className="text-sm text-[var(--muted)] mb-4">
        Anatomically-based facial animation. Click muscles to activate them and create expressions.
      </p>

      <canvas
        ref={canvasRef}
        width={500}
        height={320}
        className="w-full max-w-[500px] mb-4 rounded cursor-pointer"
        onClick={handleCanvasClick}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="text-xs text-[var(--muted)] block mb-1">Preset Expression</label>
          <select
            onChange={(e) => applyPreset(e.target.value)}
            className="w-full px-2 py-1 rounded bg-[var(--card-bg)] border border-[var(--border)] text-sm"
          >
            <option value="neutral">Neutral</option>
            <option value="smile">Smile</option>
            <option value="surprised">Surprised</option>
            <option value="angry">Angry</option>
            <option value="sad">Sad</option>
          </select>
        </div>
        {selectedMuscleData && (
          <div>
            <label className="text-xs text-[var(--muted)] block mb-1">
              {selectedMuscleData.name}: {(selectedMuscleData.activation * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={selectedMuscleData.activation}
              onChange={(e) => updateMuscleActivation(Number(e.target.value))}
              className="w-full"
            />
          </div>
        )}
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showLabels}
              onChange={(e) => setShowLabels(e.target.checked)}
            />
            Labels
          </label>
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={animating}
              onChange={(e) => setAnimating(e.target.checked)}
            />
            Animate
          </label>
        </div>
      </div>

      <div className="p-3 bg-[var(--card-bg-alt)] rounded text-xs">
        <p className="font-medium mb-1">Muscle-Based Animation</p>
        <p className="text-[var(--muted)]">
          FACS (Facial Action Coding System) maps muscle activations to Action Units.
          MetaHuman uses this for physically plausible facial animation driven by blendshapes.
        </p>
      </div>
    </div>
  );
}
