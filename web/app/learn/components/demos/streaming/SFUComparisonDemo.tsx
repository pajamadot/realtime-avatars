'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

type ArchitectureType = 'p2p' | 'sfu' | 'mcu';

interface Particle {
  id: string;
  from: number;
  to: number;
  progress: number;
  speed: number;
  viaServer?: boolean;
  trail: { x: number; y: number }[];
}

interface ArchitectureInfo {
  name: string;
  description: string;
  pros: string[];
  cons: string[];
  useCases: string[];
  latency: string;
  serverLoad: string;
  bandwidth: string;
}

const ARCHITECTURES: Record<ArchitectureType, ArchitectureInfo> = {
  p2p: {
    name: 'Peer-to-Peer (Mesh)',
    description: 'Each participant connects directly to every other participant',
    pros: ['Lowest latency', 'No server costs', 'Most private'],
    cons: ['Scales poorly (N\u00B2 connections)', 'High client bandwidth', 'NAT traversal issues'],
    useCases: ['1:1 calls', 'Small groups (2-4)'],
    latency: '~50ms',
    serverLoad: 'None',
    bandwidth: 'High (upload to each peer)',
  },
  sfu: {
    name: 'Selective Forwarding Unit',
    description: 'Server receives all streams and forwards without processing',
    pros: ['Good scalability', 'Low server CPU', 'Flexible quality adaptation'],
    cons: ['Server bandwidth costs', 'Still moderate client download'],
    useCases: ['Video conferencing', 'Live streaming', 'Avatar streaming'],
    latency: '~100ms',
    serverLoad: 'Low (forwarding only)',
    bandwidth: 'Medium (1 upload, N downloads)',
  },
  mcu: {
    name: 'Multipoint Control Unit',
    description: 'Server mixes all streams into single composite',
    pros: ['Minimal client bandwidth', 'Consistent experience', 'Handles many participants'],
    cons: ['High server CPU (transcoding)', 'Added latency', 'Less flexible layouts'],
    useCases: ['Large meetings', 'Webinars', 'Low-bandwidth clients'],
    latency: '~200ms',
    serverLoad: 'High (mixing/transcoding)',
    bandwidth: 'Low (1 upload, 1 download)',
  },
};

export function SFUComparisonDemo() {
  const [architecture, setArchitecture] = useState<ArchitectureType>('sfu');
  const [participantCount, setParticipantCount] = useState(4);
  const [isAnimating, setIsAnimating] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animRef = useRef<number | null>(null);
  const lastSpawnRef = useRef(0);
  const particleIdRef = useRef(0);
  const timeRef = useRef(0);

  const getPositions = useCallback((count: number, w: number, h: number) => {
    const positions: { x: number; y: number }[] = [];
    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(w, h) * 0.35;
    for (let i = 0; i < count; i++) {
      const angle = (i * 2 * Math.PI) / count - Math.PI / 2;
      positions.push({
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
      });
    }
    return positions;
  }, []);

  // Main animation loop
  useEffect(() => {
    if (!isAnimating) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const animate = (timestamp: number) => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;
      const positions = getPositions(participantCount, w, h);
      const serverPos = { x: w / 2, y: h / 2 };
      timeRef.current = timestamp;

      // Spawn particles
      if (timestamp - lastSpawnRef.current > 600) {
        lastSpawnRef.current = timestamp;
        const from = Math.floor(Math.random() * participantCount);
        const id = `p${particleIdRef.current++}`;

        if (architecture === 'p2p') {
          for (let i = 0; i < participantCount; i++) {
            if (i !== from) {
              particlesRef.current.push({
                id: `${id}-${i}`,
                from,
                to: i,
                progress: 0,
                speed: 0.012 + Math.random() * 0.005,
                trail: [],
              });
            }
          }
        } else {
          particlesRef.current.push({
            id,
            from,
            to: -1,
            progress: 0,
            speed: 0.015 + Math.random() * 0.005,
            trail: [],
          });
        }
      }

      // Update particles
      const newParticles: Particle[] = [];
      particlesRef.current.forEach(p => {
        p.progress += p.speed;

        // Calculate current position for trail
        let startPos, endPos;
        if (p.from === -1) {
          startPos = serverPos;
          endPos = positions[p.to];
        } else if (p.to === -1) {
          startPos = positions[p.from];
          endPos = serverPos;
        } else {
          startPos = positions[p.from];
          endPos = positions[p.to];
        }

        const prog = p.viaServer ? Math.min(1, (p.progress - 0.5) * 2) : Math.min(1, p.progress);
        const px = startPos.x + (endPos.x - startPos.x) * prog;
        const py = startPos.y + (endPos.y - startPos.y) * prog;

        p.trail.push({ x: px, y: py });
        if (p.trail.length > 12) p.trail.shift();

        // SFU/MCU fan-out
        if (p.to === -1 && p.progress >= 0.5 && p.progress < 0.52) {
          for (let i = 0; i < participantCount; i++) {
            if (architecture === 'sfu' && i === p.from) continue;
            newParticles.push({
              id: `${p.id}-fan-${i}`,
              from: -1,
              to: i,
              progress: 0.5,
              speed: architecture === 'mcu' ? 0.01 : 0.015,
              viaServer: true,
              trail: [],
            });
          }
        }
      });

      particlesRef.current = [
        ...particlesRef.current.filter(p => {
          const maxProg = p.viaServer ? 1 : (p.to === -1 ? 0.55 : 1);
          return p.progress < maxProg;
        }),
        ...newParticles,
      ];

      // --- DRAW ---
      // Background
      const bg = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.7);
      bg.addColorStop(0, '#151528');
      bg.addColorStop(1, '#0d0d1a');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Connection lines (animated dashes)
      const dashOffset = (timestamp * 0.02) % 20;

      if (architecture === 'p2p') {
        for (let i = 0; i < positions.length; i++) {
          for (let j = i + 1; j < positions.length; j++) {
            ctx.setLineDash([6, 6]);
            ctx.lineDashOffset = -dashOffset;
            ctx.strokeStyle = 'rgba(100,200,150,0.12)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(positions[i].x, positions[i].y);
            ctx.lineTo(positions[j].x, positions[j].y);
            ctx.stroke();
          }
        }
      } else {
        positions.forEach(pos => {
          ctx.setLineDash([6, 6]);
          ctx.lineDashOffset = -dashOffset;
          ctx.strokeStyle = 'rgba(100,180,255,0.12)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(pos.x, pos.y);
          ctx.lineTo(serverPos.x, serverPos.y);
          ctx.stroke();
        });
      }
      ctx.setLineDash([]);

      // Draw particle trails + particles
      particlesRef.current.forEach(p => {
        const isForwarded = p.viaServer;
        const baseColor = isForwarded ? [78, 205, 196] : [255, 107, 107];

        // Trail
        if (p.trail.length > 1) {
          for (let i = 1; i < p.trail.length; i++) {
            const alpha = (i / p.trail.length) * 0.5;
            const width = (i / p.trail.length) * 3;
            ctx.strokeStyle = `rgba(${baseColor[0]},${baseColor[1]},${baseColor[2]},${alpha})`;
            ctx.lineWidth = width;
            ctx.beginPath();
            ctx.moveTo(p.trail[i - 1].x, p.trail[i - 1].y);
            ctx.lineTo(p.trail[i].x, p.trail[i].y);
            ctx.stroke();
          }
        }

        // Glowing particle
        const last = p.trail[p.trail.length - 1];
        if (last) {
          const glow = ctx.createRadialGradient(last.x, last.y, 0, last.x, last.y, 10);
          glow.addColorStop(0, `rgba(${baseColor[0]},${baseColor[1]},${baseColor[2]},0.9)`);
          glow.addColorStop(0.5, `rgba(${baseColor[0]},${baseColor[1]},${baseColor[2]},0.3)`);
          glow.addColorStop(1, `rgba(${baseColor[0]},${baseColor[1]},${baseColor[2]},0)`);
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(last.x, last.y, 10, 0, Math.PI * 2);
          ctx.fill();

          // Core
          ctx.fillStyle = `rgb(${baseColor[0]},${baseColor[1]},${baseColor[2]})`;
          ctx.beginPath();
          ctx.arc(last.x, last.y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Server node (SFU/MCU)
      if (architecture !== 'p2p') {
        const serverColor = architecture === 'mcu' ? [155, 89, 182] : [52, 152, 219];
        const pulse = Math.sin(timestamp * 0.004) * 0.2 + 0.8;

        // Outer glow
        const serverGlow = ctx.createRadialGradient(
          serverPos.x, serverPos.y, 15,
          serverPos.x, serverPos.y, 35
        );
        serverGlow.addColorStop(0, `rgba(${serverColor[0]},${serverColor[1]},${serverColor[2]},${0.3 * pulse})`);
        serverGlow.addColorStop(1, `rgba(${serverColor[0]},${serverColor[1]},${serverColor[2]},0)`);
        ctx.fillStyle = serverGlow;
        ctx.beginPath();
        ctx.arc(serverPos.x, serverPos.y, 35, 0, Math.PI * 2);
        ctx.fill();

        // Body
        const sGrad = ctx.createRadialGradient(
          serverPos.x - 5, serverPos.y - 5, 2,
          serverPos.x, serverPos.y, 22
        );
        sGrad.addColorStop(0, `rgb(${Math.min(255, serverColor[0] + 40)},${Math.min(255, serverColor[1] + 40)},${Math.min(255, serverColor[2] + 40)})`);
        sGrad.addColorStop(1, `rgb(${serverColor[0]},${serverColor[1]},${serverColor[2]})`);
        ctx.fillStyle = sGrad;
        ctx.beginPath();
        ctx.arc(serverPos.x, serverPos.y, 22, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(architecture.toUpperCase(), serverPos.x, serverPos.y);
      }

      // Participant nodes
      positions.forEach((pos, i) => {
        const hasActive = particlesRef.current.some(
          p => (p.from === i && p.progress < 0.3) || (p.to === i && p.progress > 0.7)
        );
        const pulse = hasActive ? Math.sin(timestamp * 0.008) * 0.3 + 0.7 : 0;

        // Glow ring
        if (pulse > 0) {
          const ring = ctx.createRadialGradient(pos.x, pos.y, 12, pos.x, pos.y, 28);
          ring.addColorStop(0, `rgba(46,204,113,${0.3 * pulse})`);
          ring.addColorStop(1, 'rgba(46,204,113,0)');
          ctx.fillStyle = ring;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 28, 0, Math.PI * 2);
          ctx.fill();
        }

        // Node body
        const nGrad = ctx.createRadialGradient(pos.x - 3, pos.y - 3, 2, pos.x, pos.y, 16);
        nGrad.addColorStop(0, '#5dde8f');
        nGrad.addColorStop(1, '#2ecc71');
        ctx.fillStyle = nGrad;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 16, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`P${i + 1}`, pos.x, pos.y);
      });

      // Connection count HUD
      const connCount = architecture === 'p2p'
        ? (participantCount * (participantCount - 1)) / 2
        : participantCount;
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(8, 8, 120, 20);
      ctx.font = '10px monospace';
      ctx.fillStyle = '#787268';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(`Connections: ${connCount}`, 14, 13);

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [isAnimating, architecture, participantCount, getPositions]);

  // Clear particles on architecture change
  useEffect(() => {
    particlesRef.current = [];
  }, [architecture, participantCount]);

  const info = ARCHITECTURES[architecture];

  return (
    <div className="card p-6">
      <h3 className="font-semibold mb-2">Media Routing Architecture Comparison</h3>
      <p className="text-sm text-[var(--text-muted)] mb-6">
        Compare P2P, SFU, and MCU architectures for real-time media streaming.
        Watch how data packets flow differently in each architecture.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <div className="flex gap-2 mb-4">
            {(Object.keys(ARCHITECTURES) as ArchitectureType[]).map((arch) => (
              <button
                key={arch}
                onClick={() => setArchitecture(arch)}
                className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                  architecture === arch
                    ? 'bg-[var(--accent)] text-white'
                    : 'bg-[var(--surface-2)] hover:bg-[var(--border)]'
                }`}
              >
                {arch.toUpperCase()}
              </button>
            ))}
          </div>

          <canvas
            ref={canvasRef}
            width={400}
            height={340}
            className="w-full rounded-lg border border-[var(--border)]"
          />

          <div className="mt-4 space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Participants</span>
                <span className="text-[var(--text-muted)]">{participantCount}</span>
              </div>
              <input
                type="range"
                min={2}
                max={8}
                value={participantCount}
                onChange={(e) => setParticipantCount(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsAnimating(!isAnimating)}
                className="flex-1 badge hover:border-[var(--border-strong)] justify-center"
              >
                {isAnimating ? 'Pause' : 'Play'}
              </button>
              <button
                onClick={() => { particlesRef.current = []; }}
                className="flex-1 badge hover:border-[var(--border-strong)] justify-center"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium">{info.name}</h4>
            <p className="text-sm text-[var(--text-muted)]">{info.description}</p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="p-2 bg-[var(--surface-2)] rounded text-center">
              <p className="text-[var(--text-muted)] text-xs">Latency</p>
              <p className="font-mono">{info.latency}</p>
            </div>
            <div className="p-2 bg-[var(--surface-2)] rounded text-center">
              <p className="text-[var(--text-muted)] text-xs">Server Load</p>
              <p className="font-mono text-xs">{info.serverLoad}</p>
            </div>
            <div className="p-2 bg-[var(--surface-2)] rounded text-center">
              <p className="text-[var(--text-muted)] text-xs">Bandwidth</p>
              <p className="font-mono text-xs">{info.bandwidth}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-green-600 mb-1">Pros</p>
              <ul className="text-xs text-[var(--text-muted)] space-y-1">
                {info.pros.map((pro, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="text-green-500">+</span>
                    {pro}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm font-medium text-red-600 mb-1">Cons</p>
              <ul className="text-xs text-[var(--text-muted)] space-y-1">
                {info.cons.map((con, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="text-red-500">-</span>
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-1">Best For</p>
            <div className="flex flex-wrap gap-1">
              {info.useCases.map((useCase, i) => (
                <span key={i} className="text-xs px-2 py-1 bg-[var(--surface-2)] rounded">
                  {useCase}
                </span>
              ))}
            </div>
          </div>

          <div className="p-3 bg-[var(--surface-2)] rounded text-xs">
            <p className="font-medium mb-2">Legend</p>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-[#2ecc71]" />
                <span>Participant</span>
              </div>
              {architecture !== 'p2p' && (
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: architecture === 'mcu' ? '#9b59b6' : '#3498db' }} />
                  <span>{architecture.toUpperCase()} Server</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-[#ff6b6b]" />
                <span>Outgoing</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-[#4ecdc4]" />
                <span>Forwarded</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SFUComparisonDemo;
