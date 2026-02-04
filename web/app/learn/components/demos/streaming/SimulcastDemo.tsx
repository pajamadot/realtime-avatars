'use client';

import { useState, useEffect, useRef } from 'react';

interface VideoLayer {
  id: string;
  name: string;
  resolution: string;
  bitrate: number;
  fps: number;
  color: string;
}

const LAYERS: VideoLayer[] = [
  { id: 'high', name: 'High', resolution: '1080p', bitrate: 2500, fps: 30, color: '#2ecc71' },
  { id: 'medium', name: 'Medium', resolution: '720p', bitrate: 1000, fps: 30, color: '#3498db' },
  { id: 'low', name: 'Low', resolution: '360p', bitrate: 300, fps: 15, color: '#e74c3c' },
];

interface Participant {
  id: number;
  name: string;
  bandwidth: number;
  selectedLayer: string;
  x: number;
  y: number;
}

export function SimulcastDemo() {
  const [participants, setParticipants] = useState<Participant[]>([
    { id: 1, name: 'User A', bandwidth: 3000, selectedLayer: 'high', x: 280, y: 80 },
    { id: 2, name: 'User B', bandwidth: 1500, selectedLayer: 'medium', x: 280, y: 150 },
    { id: 3, name: 'User C', bandwidth: 500, selectedLayer: 'low', x: 280, y: 220 },
  ]);
  const [simulcastEnabled, setSimulcastEnabled] = useState(true);
  const [showBandwidth, setShowBandwidth] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  // Auto-select layers based on bandwidth
  useEffect(() => {
    if (!simulcastEnabled) return;

    setParticipants(prev => prev.map(p => {
      let layer = 'low';
      if (p.bandwidth >= 2000) layer = 'high';
      else if (p.bandwidth >= 800) layer = 'medium';
      return { ...p, selectedLayer: layer };
    }));
  }, [simulcastEnabled]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    const render = () => {
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, width, height);

      // Draw sender (left side)
      const senderX = 60;
      const senderY = height / 2;

      ctx.fillStyle = '#4ecdc4';
      ctx.beginPath();
      ctx.arc(senderX, senderY, 35, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#1a1a2e';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('📹', senderX, senderY);

      ctx.fillStyle = '#ffffff';
      ctx.font = '11px sans-serif';
      ctx.fillText('Sender', senderX, senderY + 50);

      // Draw SFU (middle)
      const sfuX = 170;
      const sfuY = height / 2;

      ctx.fillStyle = '#9b59b6';
      ctx.fillRect(sfuX - 30, sfuY - 50, 60, 100);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SFU', sfuX, sfuY - 30);

      // Draw simulcast layers in SFU
      if (simulcastEnabled) {
        LAYERS.forEach((layer, i) => {
          const layerY = sfuY - 10 + i * 20;
          ctx.fillStyle = layer.color;
          ctx.fillRect(sfuX - 20, layerY - 6, 40, 12);
          ctx.fillStyle = '#ffffff';
          ctx.font = '8px sans-serif';
          ctx.fillText(layer.name, sfuX, layerY + 1);
        });
      } else {
        ctx.fillStyle = LAYERS[0].color;
        ctx.fillRect(sfuX - 20, sfuY - 6, 40, 12);
        ctx.fillStyle = '#ffffff';
        ctx.font = '8px sans-serif';
        ctx.fillText('Single', sfuX, sfuY + 1);
      }

      // Draw connections from sender to SFU
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 2;

      if (simulcastEnabled) {
        // Multiple streams
        LAYERS.forEach((layer, i) => {
          ctx.strokeStyle = layer.color;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(senderX + 35, senderY);
          ctx.lineTo(sfuX - 30, sfuY - 10 + i * 20);
          ctx.stroke();
        });
      } else {
        ctx.strokeStyle = LAYERS[0].color;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(senderX + 35, senderY);
        ctx.lineTo(sfuX - 30, sfuY);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // Draw participants (right side)
      participants.forEach((p, i) => {
        const layer = LAYERS.find(l => l.id === p.selectedLayer) || LAYERS[2];

        // Participant circle
        ctx.fillStyle = simulcastEnabled ? layer.color : LAYERS[0].color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 25, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#1a1a2e';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('👤', p.x, p.y);

        // Labels
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(p.name, p.x + 35, p.y - 10);

        if (showBandwidth) {
          ctx.fillStyle = 'rgba(255,255,255,0.6)';
          ctx.fillText(`${p.bandwidth} kbps`, p.x + 35, p.y + 5);

          const receivingLayer = simulcastEnabled ? layer : LAYERS[0];
          ctx.fillText(`← ${receivingLayer.resolution}`, p.x + 35, p.y + 20);
        }

        // Connection line
        const sourceY = simulcastEnabled
          ? sfuY - 10 + LAYERS.findIndex(l => l.id === p.selectedLayer) * 20
          : sfuY;

        ctx.strokeStyle = simulcastEnabled ? layer.color : LAYERS[0].color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(sfuX + 30, sourceY);
        ctx.lineTo(p.x - 25, p.y);
        ctx.stroke();

        // Animated packet
        animationRef.current = (animationRef.current + 0.02) % 1;
        const t = (animationRef.current + i * 0.3) % 1;
        const packetX = sfuX + 30 + (p.x - 25 - sfuX - 30) * t;
        const packetY = sourceY + (p.y - sourceY) * t;

        ctx.fillStyle = simulcastEnabled ? layer.color : LAYERS[0].color;
        ctx.beginPath();
        ctx.arc(packetX, packetY, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      // Legend
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Simulcast: ' + (simulcastEnabled ? 'ON' : 'OFF'), 10, 20);

      requestAnimationFrame(render);
    };

    const animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [participants, simulcastEnabled, showBandwidth]);

  const updateBandwidth = (id: number, bandwidth: number) => {
    setParticipants(prev => prev.map(p => {
      if (p.id !== id) return p;

      let layer = 'low';
      if (simulcastEnabled) {
        if (bandwidth >= 2000) layer = 'high';
        else if (bandwidth >= 800) layer = 'medium';
      } else {
        layer = 'high';
      }

      return { ...p, bandwidth, selectedLayer: layer };
    }));
  };

  return (
    <div className="card p-6">
      <h3 className="font-semibold mb-2">Simulcast Streaming</h3>
      <p className="text-sm text-[var(--text-muted)] mb-6">
        Simulcast encodes video at multiple quality levels. Each receiver gets the best quality
        their bandwidth supports. Compare to single-quality streaming.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Canvas */}
        <div>
          <canvas
            ref={canvasRef}
            width={380}
            height={300}
            className="w-full rounded-lg border border-[var(--border)]"
          />

          {/* Controls */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setSimulcastEnabled(!simulcastEnabled)}
              className={`flex-1 py-2 rounded font-medium text-sm transition-colors ${
                simulcastEnabled
                  ? 'bg-[#2ecc71] text-white'
                  : 'bg-[#e74c3c] text-white'
              }`}
            >
              Simulcast: {simulcastEnabled ? 'ON' : 'OFF'}
            </button>
            <button
              onClick={() => setShowBandwidth(!showBandwidth)}
              className={`badge ${showBandwidth ? 'bg-[var(--accent)]/20' : ''}`}
            >
              Details
            </button>
          </div>

          {/* Legend */}
          <div className="mt-3 flex flex-wrap gap-3 text-xs">
            {LAYERS.map(layer => (
              <div key={layer.id} className="flex items-center gap-1">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: layer.color }}
                />
                <span>{layer.name} ({layer.resolution})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bandwidth controls */}
        <div className="space-y-4">
          <div className="p-4 bg-[var(--surface-2)] rounded">
            <p className="font-medium text-sm mb-3">Participant Bandwidth</p>
            {participants.map(p => {
              const layer = LAYERS.find(l => l.id === p.selectedLayer) || LAYERS[2];
              return (
                <div key={p.id} className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span>{p.name}</span>
                    <span className="font-mono">{p.bandwidth} kbps</span>
                  </div>
                  <input
                    type="range"
                    min={100}
                    max={4000}
                    step={100}
                    value={p.bandwidth}
                    onChange={(e) => updateBandwidth(p.id, Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-[var(--text-muted)]">
                    <span>Receiving:</span>
                    <span style={{ color: simulcastEnabled ? layer.color : LAYERS[0].color }}>
                      {simulcastEnabled ? layer.resolution : LAYERS[0].resolution}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 bg-[var(--surface-2)] rounded">
            <p className="font-medium text-sm mb-2">Simulcast vs Single Stream</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-[var(--surface-0)] rounded">
                <p className="font-medium text-[#2ecc71]">Simulcast</p>
                <p className="text-[var(--text-muted)]">Each user gets optimal quality</p>
              </div>
              <div className="p-2 bg-[var(--surface-0)] rounded">
                <p className="font-medium text-[#e74c3c]">Single</p>
                <p className="text-[var(--text-muted)]">One quality for all (wasteful or insufficient)</p>
              </div>
            </div>
          </div>

          <div className="p-3 border border-[var(--border)] rounded text-sm">
            <p className="font-medium mb-1">For Avatar Streaming</p>
            <p className="text-xs text-[var(--text-muted)]">
              Avatar providers often use simulcast so mobile users on cellular get 360p
              while desktop users on fiber get 1080p. The SFU selects the best layer per client.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SimulcastDemo;
