'use client';

import { useState, useRef, useEffect } from 'react';

interface Packet {
  id: number;
  x: number;
  sent: boolean;
  lost: boolean;
  recovered: boolean;
  fecPacket: boolean;
  retransmitted: boolean;
}

export function PacketLossRecoveryDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [lossRate, setLossRate] = useState(0.15);
  const [recoveryMethod, setRecoveryMethod] = useState<'none' | 'fec' | 'nack' | 'both'>('fec');
  const [fecRatio, setFecRatio] = useState(4); // 1 FEC packet per N data packets
  const [packets, setPackets] = useState<Packet[]>([]);
  const [stats, setStats] = useState({ sent: 0, lost: 0, recovered: 0 });
  const animationRef = useRef<number | null>(null);

  // Initialize packets
  useEffect(() => {
    const newPackets: Packet[] = [];
    for (let i = 0; i < 20; i++) {
      const isFec = (recoveryMethod === 'fec' || recoveryMethod === 'both') && (i + 1) % fecRatio === 0;
      newPackets.push({
        id: i,
        x: -50 - i * 40,
        sent: false,
        lost: false,
        recovered: false,
        fecPacket: isFec,
        retransmitted: false,
      });
    }
    setPackets(newPackets);
    setStats({ sent: 0, lost: 0, recovered: 0 });
  }, [recoveryMethod, fecRatio, lossRate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let localStats = { sent: 0, lost: 0, recovered: 0 };

    const animate = () => {
      setPackets(prev => {
        const newPackets = prev.map(packet => {
          const newPacket = { ...packet };

          // Move packet
          newPacket.x += 2;

          // Check if packet crosses the "network" zone
          const networkZoneStart = 150;
          const networkZoneEnd = 350;

          if (!packet.sent && newPacket.x > networkZoneStart) {
            newPacket.sent = true;
            localStats.sent++;

            // Determine if packet is lost (FEC packets don't get lost for demo simplicity)
            if (!packet.fecPacket && Math.random() < lossRate) {
              newPacket.lost = true;
              localStats.lost++;
            }
          }

          // Recovery at receiver
          if (newPacket.lost && !newPacket.recovered && newPacket.x > networkZoneEnd) {
            if (recoveryMethod === 'fec' || recoveryMethod === 'both') {
              // FEC recovery (simplified: recover with some probability based on FEC ratio)
              if (Math.random() < 0.8) {
                newPacket.recovered = true;
                localStats.recovered++;
              }
            }

            if ((recoveryMethod === 'nack' || recoveryMethod === 'both') && !newPacket.recovered) {
              // NACK retransmission
              newPacket.retransmitted = true;
              newPacket.recovered = true;
              localStats.recovered++;
            }
          }

          return newPacket;
        });

        // Reset packets that have gone off screen
        return newPackets.map((packet, i) => {
          if (packet.x > canvas.width + 50) {
            const isFec = (recoveryMethod === 'fec' || recoveryMethod === 'both') && (i + 1) % fecRatio === 0;
            return {
              id: packet.id,
              x: -50,
              sent: false,
              lost: false,
              recovered: false,
              fecPacket: isFec,
              retransmitted: false,
            };
          }
          return packet;
        });
      });

      // Update stats periodically
      setStats({ ...localStats });

      render(ctx, canvas.width, canvas.height);
      animationRef.current = requestAnimationFrame(animate);
    };

    const render = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, width, height);

      const packetY = height / 2;
      const networkZoneStart = 150;
      const networkZoneEnd = 350;

      // Draw zones
      // Sender
      ctx.fillStyle = 'rgba(100, 255, 100, 0.1)';
      ctx.fillRect(0, 50, networkZoneStart, height - 100);
      ctx.strokeStyle = '#446644';
      ctx.strokeRect(0, 50, networkZoneStart, height - 100);
      ctx.fillStyle = '#66aa66';
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Sender', networkZoneStart / 2, 40);

      // Network (danger zone)
      ctx.fillStyle = 'rgba(255, 100, 100, 0.1)';
      ctx.fillRect(networkZoneStart, 50, networkZoneEnd - networkZoneStart, height - 100);
      ctx.strokeStyle = '#664444';
      ctx.strokeRect(networkZoneStart, 50, networkZoneEnd - networkZoneStart, height - 100);
      ctx.fillStyle = '#aa6666';
      ctx.fillText('Network', (networkZoneStart + networkZoneEnd) / 2, 40);
      ctx.font = '9px monospace';
      ctx.fillText(`(${(lossRate * 100).toFixed(0)}% loss)`, (networkZoneStart + networkZoneEnd) / 2, 55);

      // Receiver
      ctx.fillStyle = 'rgba(100, 100, 255, 0.1)';
      ctx.fillRect(networkZoneEnd, 50, width - networkZoneEnd, height - 100);
      ctx.strokeStyle = '#444466';
      ctx.strokeRect(networkZoneEnd, 50, width - networkZoneEnd, height - 100);
      ctx.fillStyle = '#6666aa';
      ctx.font = '11px monospace';
      ctx.fillText('Receiver', (networkZoneEnd + width) / 2, 40);

      // Draw packets
      packets.forEach(packet => {
        const size = packet.fecPacket ? 12 : 16;
        let color = '#66aaff'; // Normal packet

        if (packet.fecPacket) {
          color = '#ffaa66'; // FEC packet
        } else if (packet.lost && !packet.recovered) {
          color = '#ff4444'; // Lost
        } else if (packet.recovered) {
          color = packet.retransmitted ? '#aa66ff' : '#66ff66'; // Recovered via NACK or FEC
        }

        // Packet shape
        if (packet.lost && !packet.recovered) {
          // Draw X for lost packet
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(packet.x - size / 2, packetY - size / 2);
          ctx.lineTo(packet.x + size / 2, packetY + size / 2);
          ctx.moveTo(packet.x + size / 2, packetY - size / 2);
          ctx.lineTo(packet.x - size / 2, packetY + size / 2);
          ctx.stroke();
        } else {
          ctx.fillStyle = color;

          if (packet.fecPacket) {
            // Triangle for FEC
            ctx.beginPath();
            ctx.moveTo(packet.x, packetY - size / 2);
            ctx.lineTo(packet.x + size / 2, packetY + size / 2);
            ctx.lineTo(packet.x - size / 2, packetY + size / 2);
            ctx.closePath();
            ctx.fill();
          } else {
            // Square for data packet
            ctx.fillRect(packet.x - size / 2, packetY - size / 2, size, size);
          }

          // Recovered indicator
          if (packet.recovered) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(packet.x, packetY, size / 2 + 3, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
      });

      // Legend
      ctx.font = '9px monospace';
      ctx.textAlign = 'left';

      const legendY = height - 25;
      const legendItems = [
        { color: '#66aaff', label: 'Data', shape: 'square' },
        { color: '#ffaa66', label: 'FEC', shape: 'triangle' },
        { color: '#ff4444', label: 'Lost', shape: 'x' },
        { color: '#66ff66', label: 'FEC Recovered', shape: 'circle' },
        { color: '#aa66ff', label: 'NACK Recovered', shape: 'circle' },
      ];

      legendItems.forEach((item, i) => {
        const x = 20 + i * 100;
        ctx.fillStyle = item.color;
        if (item.shape === 'square') {
          ctx.fillRect(x, legendY - 4, 8, 8);
        } else if (item.shape === 'triangle') {
          ctx.beginPath();
          ctx.moveTo(x + 4, legendY - 4);
          ctx.lineTo(x + 8, legendY + 4);
          ctx.lineTo(x, legendY + 4);
          ctx.closePath();
          ctx.fill();
        } else if (item.shape === 'x') {
          ctx.strokeStyle = item.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x, legendY - 4);
          ctx.lineTo(x + 8, legendY + 4);
          ctx.moveTo(x + 8, legendY - 4);
          ctx.lineTo(x, legendY + 4);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(x + 4, legendY, 5, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.fillStyle = '#888888';
        ctx.fillText(item.label, x + 12, legendY + 4);
      });

      // Stats
      const effectiveLoss = localStats.sent > 0
        ? ((localStats.lost - localStats.recovered) / localStats.sent * 100).toFixed(1)
        : '0.0';
      ctx.fillStyle = '#aaaaaa';
      ctx.font = '10px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`Effective loss: ${effectiveLoss}%`, width - 10, 25);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [packets.length, lossRate, recoveryMethod, fecRatio]);

  return (
    <div className="card p-6">
      <h3 className="font-semibold mb-2">Packet Loss Recovery</h3>
      <p className="text-sm text-[var(--muted)] mb-4">
        Real-time streaming must handle packet loss. See how FEC (Forward Error Correction) and NACK (retransmission) recover lost data.
      </p>

      <canvas
        ref={canvasRef}
        width={550}
        height={220}
        className="w-full max-w-[550px] mb-4 rounded"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="text-xs text-[var(--muted)] block mb-1">Loss Rate: {(lossRate * 100).toFixed(0)}%</label>
          <input
            type="range"
            min="0"
            max="0.4"
            step="0.05"
            value={lossRate}
            onChange={(e) => setLossRate(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="text-xs text-[var(--muted)] block mb-1">Recovery Method</label>
          <select
            value={recoveryMethod}
            onChange={(e) => setRecoveryMethod(e.target.value as typeof recoveryMethod)}
            className="w-full px-2 py-1 rounded bg-[var(--card-bg)] border border-[var(--border)] text-sm"
          >
            <option value="none">None</option>
            <option value="fec">FEC Only</option>
            <option value="nack">NACK Only</option>
            <option value="both">FEC + NACK</option>
          </select>
        </div>
        {(recoveryMethod === 'fec' || recoveryMethod === 'both') && (
          <div>
            <label className="text-xs text-[var(--muted)] block mb-1">FEC Ratio: 1:{fecRatio}</label>
            <input
              type="range"
              min="2"
              max="8"
              value={fecRatio}
              onChange={(e) => setFecRatio(Number(e.target.value))}
              className="w-full"
            />
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-3 text-xs">
        <div className="p-3 bg-[var(--card-bg-alt)] rounded">
          <p className="font-medium mb-1">FEC (Forward Error Correction)</p>
          <p className="text-[var(--muted)]">Adds redundant data so receiver can reconstruct lost packets without retransmission. Low latency but uses more bandwidth.</p>
        </div>
        <div className="p-3 bg-[var(--card-bg-alt)] rounded">
          <p className="font-medium mb-1">NACK (Negative Acknowledgment)</p>
          <p className="text-[var(--muted)]">Receiver requests retransmission of lost packets. Efficient bandwidth but adds RTT latency.</p>
        </div>
      </div>
    </div>
  );
}
