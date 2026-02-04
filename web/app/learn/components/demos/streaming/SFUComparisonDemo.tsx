'use client';

import { useState, useEffect, useRef } from 'react';

type ArchitectureType = 'p2p' | 'sfu' | 'mcu';

interface Packet {
  id: string;
  from: number;
  to: number;
  progress: number;
  viaServer?: boolean;
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
    cons: ['Scales poorly (N² connections)', 'High client bandwidth', 'NAT traversal issues'],
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
  const [packets, setPackets] = useState<Packet[]>([]);
  const [isAnimating, setIsAnimating] = useState(true);
  const animationRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Calculate positions for participants
  const getParticipantPositions = (count: number, width: number, height: number) => {
    const positions: { x: number; y: number }[] = [];
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;

    for (let i = 0; i < count; i++) {
      const angle = (i * 2 * Math.PI) / count - Math.PI / 2;
      positions.push({
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      });
    }

    return positions;
  };

  // Animation loop
  useEffect(() => {
    if (!isAnimating) return;

    let lastSpawn = 0;
    const spawnInterval = 500;

    const animate = (timestamp: number) => {
      // Spawn new packets
      if (timestamp - lastSpawn > spawnInterval) {
        lastSpawn = timestamp;
        const from = Math.floor(Math.random() * participantCount);

        if (architecture === 'p2p') {
          // P2P: packet to each other participant
          const newPackets: Packet[] = [];
          for (let i = 0; i < participantCount; i++) {
            if (i !== from) {
              newPackets.push({
                id: `${timestamp}-${from}-${i}`,
                from,
                to: i,
                progress: 0,
              });
            }
          }
          setPackets(prev => [...prev.slice(-20), ...newPackets]);
        } else if (architecture === 'sfu') {
          // SFU: packet to server, then server to all others
          const toServer: Packet = {
            id: `${timestamp}-${from}-server`,
            from,
            to: -1, // -1 = server
            progress: 0,
          };
          setPackets(prev => [...prev.slice(-20), toServer]);
        } else {
          // MCU: packet to server only (server handles mixing)
          const toServer: Packet = {
            id: `${timestamp}-${from}-server`,
            from,
            to: -1,
            progress: 0,
          };
          setPackets(prev => [...prev.slice(-20), toServer]);
        }
      }

      // Update packet positions
      setPackets(prev => {
        const updated = prev.map(p => ({
          ...p,
          progress: p.progress + (architecture === 'mcu' ? 0.015 : 0.025),
        }));

        // For SFU: spawn fan-out packets when reaching server
        const newPackets: Packet[] = [];
        updated.forEach(p => {
          if (architecture === 'sfu' && p.to === -1 && p.progress >= 0.5 && p.progress < 0.52) {
            for (let i = 0; i < participantCount; i++) {
              if (i !== p.from) {
                newPackets.push({
                  id: `${p.id}-fanout-${i}`,
                  from: -1,
                  to: i,
                  progress: 0.5,
                  viaServer: true,
                });
              }
            }
          }
          // For MCU: spawn mixed packet to all when reaching server
          if (architecture === 'mcu' && p.to === -1 && p.progress >= 0.5 && p.progress < 0.52) {
            for (let i = 0; i < participantCount; i++) {
              newPackets.push({
                id: `${p.id}-mixed-${i}`,
                from: -1,
                to: i,
                progress: 0.5,
                viaServer: true,
              });
            }
          }
        });

        return [...updated.filter(p => p.progress < 1), ...newPackets];
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isAnimating, architecture, participantCount]);

  // Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const positions = getParticipantPositions(participantCount, width, height);
    const serverPos = { x: width / 2, y: height / 2 };

    ctx.clearRect(0, 0, width, height);

    // Draw connections (faded)
    ctx.strokeStyle = 'rgba(150, 150, 150, 0.2)';
    ctx.lineWidth = 1;

    if (architecture === 'p2p') {
      // Mesh connections
      for (let i = 0; i < positions.length; i++) {
        for (let j = i + 1; j < positions.length; j++) {
          ctx.beginPath();
          ctx.moveTo(positions[i].x, positions[i].y);
          ctx.lineTo(positions[j].x, positions[j].y);
          ctx.stroke();
        }
      }
    } else {
      // Star connections to server
      positions.forEach(pos => {
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        ctx.lineTo(serverPos.x, serverPos.y);
        ctx.stroke();
      });
    }

    // Draw packets
    packets.forEach(packet => {
      let startPos, endPos;

      if (packet.from === -1) {
        startPos = serverPos;
        endPos = positions[packet.to];
      } else if (packet.to === -1) {
        startPos = positions[packet.from];
        endPos = serverPos;
      } else {
        startPos = positions[packet.from];
        endPos = positions[packet.to];
      }

      const progress = packet.viaServer ? (packet.progress - 0.5) * 2 : packet.progress;
      const x = startPos.x + (endPos.x - startPos.x) * progress;
      const y = startPos.y + (endPos.y - startPos.y) * progress;

      ctx.fillStyle = packet.viaServer ? '#4ecdc4' : '#ff6b6b';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw server (if not P2P)
    if (architecture !== 'p2p') {
      ctx.fillStyle = architecture === 'mcu' ? '#9b59b6' : '#3498db';
      ctx.beginPath();
      ctx.arc(serverPos.x, serverPos.y, 20, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(architecture.toUpperCase(), serverPos.x, serverPos.y);
    }

    // Draw participants
    positions.forEach((pos, i) => {
      ctx.fillStyle = '#2ecc71';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 15, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`P${i + 1}`, pos.x, pos.y);
    });

  }, [packets, architecture, participantCount]);

  const info = ARCHITECTURES[architecture];

  // Calculate connection counts
  const getConnectionCount = () => {
    if (architecture === 'p2p') {
      return (participantCount * (participantCount - 1)) / 2;
    }
    return participantCount;
  };

  return (
    <div className="card p-6">
      <h3 className="font-semibold mb-2">Media Routing Architecture Comparison</h3>
      <p className="text-sm text-[var(--text-muted)] mb-6">
        Compare P2P, SFU, and MCU architectures for real-time media streaming.
        Watch how data packets flow differently in each architecture.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Visualization */}
        <div>
          <div className="flex gap-2 mb-4">
            {(Object.keys(ARCHITECTURES) as ArchitectureType[]).map((arch) => (
              <button
                key={arch}
                onClick={() => {
                  setArchitecture(arch);
                  setPackets([]);
                }}
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
            width={350}
            height={300}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)]"
          />

          {/* Controls */}
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
                onChange={(e) => {
                  setParticipantCount(Number(e.target.value));
                  setPackets([]);
                }}
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
                onClick={() => setPackets([])}
                className="flex-1 badge hover:border-[var(--border-strong)] justify-center"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Info Panel */}
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">{info.name}</h4>
            <p className="text-sm text-[var(--text-muted)]">{info.description}</p>
          </div>

          {/* Stats */}
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
              <p className="text-[var(--text-muted)] text-xs">Connections</p>
              <p className="font-mono">{getConnectionCount()}</p>
            </div>
          </div>

          {/* Pros/Cons */}
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

          {/* Use Cases */}
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

          {/* Legend */}
          <div className="p-3 bg-[var(--surface-2)] rounded text-xs">
            <p className="font-medium mb-2">Legend</p>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-[#2ecc71]" />
                <span>Participant</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-[#3498db]" />
                <span>SFU Server</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-[#9b59b6]" />
                <span>MCU Server</span>
              </div>
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
