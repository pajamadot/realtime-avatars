'use client';

import { useState, useEffect, useRef } from 'react';
import { Check, X, Circle, ArrowLeftRight, Lightbulb, PartyPopper, Ban } from 'lucide-react';

interface ICECandidate {
  id: string;
  type: 'host' | 'srflx' | 'relay';
  protocol: 'udp' | 'tcp';
  address: string;
  port: number;
  status: 'gathering' | 'checking' | 'succeeded' | 'failed';
  latency?: number;
}

interface ConnectionState {
  phase: 'idle' | 'gathering' | 'checking' | 'connected' | 'failed';
  localCandidates: ICECandidate[];
  remoteCandidates: ICECandidate[];
  selectedPair: { local: string; remote: string } | null;
  logs: string[];
}

const CANDIDATE_TYPES = {
  host: { label: 'Host', color: '#22c55e', desc: 'Direct local address' },
  srflx: { label: 'Server Reflexive', color: '#3b82f6', desc: 'Public address via STUN' },
  relay: { label: 'Relay', color: '#f59e0b', desc: 'Relayed through TURN' },
};

export function ICEConnectionDemo() {
  const [state, setState] = useState<ConnectionState>({
    phase: 'idle',
    localCandidates: [],
    remoteCandidates: [],
    selectedPair: null,
    logs: [],
  });
  const [natType, setNatType] = useState<'open' | 'moderate' | 'strict'>('moderate');
  const [showTechnical, setShowTechnical] = useState(false);
  const animationRef = useRef<number | null>(null);

  const addLog = (message: string) => {
    setState(prev => ({
      ...prev,
      logs: [...prev.logs.slice(-20), `[${new Date().toLocaleTimeString()}] ${message}`]
    }));
  };

  const generateCandidates = (isLocal: boolean): ICECandidate[] => {
    const prefix = isLocal ? 'local' : 'remote';
    const candidates: ICECandidate[] = [];

    // Host candidates (always available)
    candidates.push({
      id: `${prefix}-host-1`,
      type: 'host',
      protocol: 'udp',
      address: isLocal ? '192.168.1.100' : '192.168.1.200',
      port: 50000 + Math.floor(Math.random() * 1000),
      status: 'gathering',
    });

    // STUN (srflx) candidates
    if (natType !== 'strict' || !isLocal) {
      candidates.push({
        id: `${prefix}-srflx-1`,
        type: 'srflx',
        protocol: 'udp',
        address: isLocal ? '203.0.113.45' : '198.51.100.22',
        port: 30000 + Math.floor(Math.random() * 1000),
        status: 'gathering',
      });
    }

    // TURN (relay) candidates
    candidates.push({
      id: `${prefix}-relay-1`,
      type: 'relay',
      protocol: 'udp',
      address: 'turn.example.com',
      port: 443,
      status: 'gathering',
      latency: 50 + Math.floor(Math.random() * 100),
    });

    return candidates;
  };

  const simulateConnection = async () => {
    // Reset state
    setState({
      phase: 'gathering',
      localCandidates: [],
      remoteCandidates: [],
      selectedPair: null,
      logs: [],
    });
    addLog('Starting ICE gathering...');

    // Generate local candidates
    const localCandidates = generateCandidates(true);

    // Simulate gathering phase
    for (let i = 0; i < localCandidates.length; i++) {
      await new Promise(r => setTimeout(r, 300 + Math.random() * 500));
      const candidate = localCandidates[i];
      candidate.status = 'checking';
      candidate.latency = candidate.type === 'host' ? 5 : candidate.type === 'srflx' ? 20 : 80;

      addLog(`Gathered ${CANDIDATE_TYPES[candidate.type].label}: ${candidate.address}:${candidate.port}`);
      setState(prev => ({
        ...prev,
        localCandidates: [...prev.localCandidates, candidate],
      }));
    }

    // Generate remote candidates (received via signaling)
    addLog('Receiving remote candidates via signaling...');
    await new Promise(r => setTimeout(r, 500));

    const remoteCandidates = generateCandidates(false);
    for (let i = 0; i < remoteCandidates.length; i++) {
      await new Promise(r => setTimeout(r, 200 + Math.random() * 300));
      const candidate = remoteCandidates[i];
      candidate.status = 'checking';
      candidate.latency = candidate.type === 'host' ? 8 : candidate.type === 'srflx' ? 25 : 90;

      addLog(`Received remote ${CANDIDATE_TYPES[candidate.type].label}: ${candidate.address}:${candidate.port}`);
      setState(prev => ({
        ...prev,
        remoteCandidates: [...prev.remoteCandidates, candidate],
      }));
    }

    // Connectivity checks
    setState(prev => ({ ...prev, phase: 'checking' }));
    addLog('Starting connectivity checks...');

    // Determine which pair will succeed based on NAT type
    let successPair: { local: ICECandidate; remote: ICECandidate } | null = null;

    const localFinal = [...localCandidates];
    const remoteFinal = [...remoteCandidates];

    // Try pairs in priority order
    const pairs = [];
    for (const local of localFinal) {
      for (const remote of remoteFinal) {
        pairs.push({ local, remote });
      }
    }

    // Sort by preference (host > srflx > relay)
    const typePriority = { host: 0, srflx: 1, relay: 2 };
    pairs.sort((a, b) => {
      const aScore = typePriority[a.local.type] + typePriority[a.remote.type];
      const bScore = typePriority[b.local.type] + typePriority[b.remote.type];
      return aScore - bScore;
    });

    for (const pair of pairs.slice(0, 5)) {
      await new Promise(r => setTimeout(r, 400 + Math.random() * 400));

      const canConnect =
        (natType === 'open') ||
        (natType === 'moderate' && (pair.local.type !== 'host' || pair.remote.type !== 'host')) ||
        (pair.local.type === 'relay' || pair.remote.type === 'relay');

      if (canConnect && !successPair) {
        successPair = pair;
        pair.local.status = 'succeeded';
        pair.remote.status = 'succeeded';
        addLog(`[OK] Connectivity check succeeded: ${pair.local.type} <-> ${pair.remote.type}`);
      } else if (!canConnect) {
        pair.local.status = 'failed';
        addLog(`[FAIL] Connectivity check failed: ${pair.local.type} <-> ${pair.remote.type}`);
      }

      setState(prev => ({
        ...prev,
        localCandidates: localFinal.map(c => c.id === pair.local.id ? pair.local : c),
        remoteCandidates: remoteFinal.map(c => c.id === pair.remote.id ? pair.remote : c),
      }));
    }

    // Final state
    if (successPair) {
      setState(prev => ({
        ...prev,
        phase: 'connected',
        selectedPair: { local: successPair!.local.id, remote: successPair!.remote.id },
      }));
      addLog(`[SUCCESS] Connected via ${CANDIDATE_TYPES[successPair.local.type].label} <-> ${CANDIDATE_TYPES[successPair.remote.type].label}`);
      addLog(`Estimated latency: ${(successPair.local.latency || 0) + (successPair.remote.latency || 0)}ms`);
    } else {
      setState(prev => ({ ...prev, phase: 'failed' }));
      addLog('[ERROR] Connection failed - no viable candidate pair');
    }
  };

  const reset = () => {
    setState({
      phase: 'idle',
      localCandidates: [],
      remoteCandidates: [],
      selectedPair: null,
      logs: [],
    });
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const CandidateBox = ({ candidate, isSelected }: { candidate: ICECandidate; isSelected: boolean }) => {
    const typeInfo = CANDIDATE_TYPES[candidate.type];
    return (
      <div
        className={`p-2 rounded border text-xs transition-all ${
          isSelected
            ? 'border-green-500 bg-green-500/20 ring-2 ring-green-500'
            : candidate.status === 'failed'
            ? 'border-red-500/50 bg-red-500/10 opacity-50'
            : 'border-[var(--border)] bg-[var(--surface-2)]'
        }`}
      >
        <div className="flex items-center gap-2 mb-1">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: typeInfo.color }}
          />
          <span className="font-medium">{typeInfo.label}</span>
          {candidate.latency && (
            <span className="text-[var(--text-muted)]">{candidate.latency}ms</span>
          )}
        </div>
        {showTechnical && (
          <p className="text-[var(--text-muted)] truncate">
            {candidate.protocol}://{candidate.address}:{candidate.port}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="card p-6">
      <h3 className="font-semibold mb-2">ICE Connection Visualizer</h3>
      <p className="text-sm text-[var(--text-muted)] mb-6">
        Watch how WebRTC establishes peer-to-peer connections by gathering and testing ICE candidates.
      </p>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="text-xs text-[var(--text-muted)] block mb-1">NAT Type</label>
          <select
            value={natType}
            onChange={(e) => setNatType(e.target.value as typeof natType)}
            className="bg-[var(--surface-2)] border border-[var(--border)] rounded px-3 py-1 text-sm"
            disabled={state.phase !== 'idle'}
          >
            <option value="open">Open (No NAT)</option>
            <option value="moderate">Moderate NAT</option>
            <option value="strict">Strict/Symmetric NAT</option>
          </select>
        </div>

        <div className="flex items-end gap-2">
          {state.phase === 'idle' ? (
            <button
              onClick={simulateConnection}
              className="badge hover:border-[var(--border-strong)]"
            >
              Start Connection
            </button>
          ) : state.phase === 'connected' || state.phase === 'failed' ? (
            <button onClick={reset} className="badge hover:border-[var(--border-strong)]">
              Reset
            </button>
          ) : (
            <span className="badge animate-pulse">
              {state.phase === 'gathering' ? 'Gathering...' : 'Checking...'}
            </span>
          )}

          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={showTechnical}
              onChange={(e) => setShowTechnical(e.target.checked)}
            />
            Show addresses
          </label>
        </div>
      </div>

      {/* Visualization */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {/* Local candidates */}
        <div>
          <p className="text-sm font-medium mb-2 flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-blue-500" />
            Local Peer
          </p>
          <div className="space-y-2">
            {state.localCandidates.length === 0 ? (
              <div className="p-4 border border-dashed border-[var(--border)] rounded text-center text-xs text-[var(--text-muted)]">
                No candidates yet
              </div>
            ) : (
              state.localCandidates.map((c) => (
                <CandidateBox
                  key={c.id}
                  candidate={c}
                  isSelected={state.selectedPair?.local === c.id}
                />
              ))
            )}
          </div>
        </div>

        {/* Connection status */}
        <div className="flex flex-col items-center justify-center">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-2 transition-colors ${
              state.phase === 'connected'
                ? 'bg-green-500/20 text-green-500'
                : state.phase === 'failed'
                ? 'bg-red-500/20 text-red-500'
                : state.phase === 'idle'
                ? 'bg-[var(--surface-2)] text-[var(--text-muted)]'
                : 'bg-yellow-500/20 text-yellow-500 animate-pulse'
            }`}
          >
            {state.phase === 'connected' ? <Check size={16} /> : state.phase === 'failed' ? <X size={16} /> : state.phase === 'idle' ? <Circle size={16} /> : <ArrowLeftRight size={16} />}
          </div>
          <p className="text-sm font-medium capitalize">{state.phase}</p>
          {state.selectedPair && (
            <p className="text-xs text-[var(--text-muted)] text-center mt-1">
              via {state.localCandidates.find(c => c.id === state.selectedPair?.local)?.type}
            </p>
          )}
        </div>

        {/* Remote candidates */}
        <div>
          <p className="text-sm font-medium mb-2 flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-purple-500" />
            Remote Peer
          </p>
          <div className="space-y-2">
            {state.remoteCandidates.length === 0 ? (
              <div className="p-4 border border-dashed border-[var(--border)] rounded text-center text-xs text-[var(--text-muted)]">
                No candidates yet
              </div>
            ) : (
              state.remoteCandidates.map((c) => (
                <CandidateBox
                  key={c.id}
                  candidate={c}
                  isSelected={state.selectedPair?.remote === c.id}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-4 text-xs">
        {Object.entries(CANDIDATE_TYPES).map(([key, info]) => (
          <div key={key} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded" style={{ backgroundColor: info.color }} />
            <span className="font-medium">{info.label}:</span>
            <span className="text-[var(--text-muted)]">{info.desc}</span>
          </div>
        ))}
      </div>

      {/* Logs */}
      {state.logs.length > 0 && (
        <div className="bg-black/90 rounded p-3 font-mono text-xs max-h-[150px] overflow-y-auto">
          {state.logs.map((log, i) => (
            <div key={i} className="text-green-400">{log}</div>
          ))}
        </div>
      )}

      {/* Insight */}
      <div className="mt-4 p-4 bg-[var(--surface-2)] rounded text-sm text-[var(--text-muted)] flex items-start gap-2">
        <Lightbulb size={16} className="text-yellow-500 flex-shrink-0 mt-0.5" />
        <span><strong>Try this:</strong> Set NAT type to &quot;Strict&quot; and start a connection.
        Notice how it falls back to TURN relay when direct connections fail — this adds latency but ensures connectivity!</span>
      </div>
    </div>
  );
}

export default ICEConnectionDemo;
