'use client';

import { useMemo, useState } from 'react';
import '@livekit/components-styles';
import {
  BarVisualizer,
  LiveKitRoom,
  RoomAudioRenderer,
  VideoTrack,
  VoiceAssistantControlBar,
  useTracks,
  useVoiceAssistant,
} from '@livekit/components-react';
import { Track } from 'livekit-client';

function safeRandomId() {
  try {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
  } catch {
    // ignore
  }
  return `user-${Date.now()}`;
}

function AvatarStage() {
  const tracks = useTracks([Track.Source.Camera], { onlySubscribed: true });
  const remoteVideo = tracks.find((t) => !t.participant.isLocal);

  return (
    <div className="relative h-[420px] w-full bg-black/20 rounded border border-[var(--border)] overflow-hidden flex items-center justify-center">
      {remoteVideo ? (
        <VideoTrack
          trackRef={remoteVideo}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="text-sm text-[var(--muted)]">
          Waiting for an avatar video track...
        </div>
      )}
    </div>
  );
}

function AgentStatus() {
  const { state, audioTrack } = useVoiceAssistant();

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <p className="text-xs text-[var(--muted)]">
        Voice assistant state: <span className="font-medium">{state}</span>
      </p>
      {audioTrack ? (
        <div className="flex items-center gap-3">
          <span className="text-xs text-[var(--muted)]">Audio</span>
          <BarVisualizer
            state={state}
            barCount={18}
            trackRef={audioTrack}
            className="h-6 w-56"
          />
        </div>
      ) : (
        <p className="text-xs text-[var(--muted)]">
          (No agent audio track yet)
        </p>
      )}
    </div>
  );
}

export default function LiveKitStreamingAvatarDemo({
  className = '',
}: {
  className?: string;
}) {
  const identity = useMemo(() => safeRandomId(), []);

  const [roomName, setRoomName] = useState('realtime-avatar-demo');
  const [agentName, setAgentName] = useState('avatar-agent');
  const [displayName, setDisplayName] = useState('web-user');

  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [connect, setConnect] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function join() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch('/api/livekit/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_name: roomName.trim(),
          participant_identity: identity,
          participant_name: displayName.trim() || identity,
          agent_name: agentName.trim() || undefined,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || `Token request failed (${res.status})`);
      }

      if (!data?.server_url || !data?.participant_token) {
        throw new Error('Token endpoint returned an invalid payload');
      }

      setServerUrl(data.server_url);
      setToken(data.participant_token);
      setConnect(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setConnect(false);
      setServerUrl(null);
      setToken(null);
    } finally {
      setBusy(false);
    }
  }

  function leave() {
    setConnect(false);
    setToken(null);
    setServerUrl(null);
  }

  return (
    <div className={className}>
      <div className="card p-5 mb-4">
        <p className="font-medium mb-2">LiveKit Streaming Avatar Demo</p>
        <p className="text-sm text-[var(--muted)]">
          This page connects to a LiveKit room and renders the first remote video track (your
          avatar worker). To make this fully interactive, run a LiveKit Agent with an avatar
          integration (e.g., Hedra) under the same <code>agentName</code>.
        </p>
      </div>

      <div className="card p-5 mb-4">
        <div className="grid md:grid-cols-3 gap-4">
          <label className="text-sm">
            <div className="text-xs text-[var(--muted)] mb-1">Room</div>
            <input
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="w-full bg-[var(--card-bg)] border border-[var(--border)] rounded px-3 py-2 text-sm outline-none focus:border-[var(--border-strong)]"
              placeholder="realtime-avatar-demo"
            />
          </label>
          <label className="text-sm">
            <div className="text-xs text-[var(--muted)] mb-1">Agent name (optional)</div>
            <input
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              className="w-full bg-[var(--card-bg)] border border-[var(--border)] rounded px-3 py-2 text-sm outline-none focus:border-[var(--border-strong)]"
              placeholder="avatar-agent"
            />
          </label>
          <label className="text-sm">
            <div className="text-xs text-[var(--muted)] mb-1">Display name</div>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-[var(--card-bg)] border border-[var(--border)] rounded px-3 py-2 text-sm outline-none focus:border-[var(--border-strong)]"
              placeholder="web-user"
            />
          </label>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-3 mt-4">
          <button
            type="button"
            disabled={busy || connect}
            onClick={join}
            className="badge hover:border-[var(--border-strong)] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {busy ? 'Joining...' : connect ? 'Connected' : 'Join'}
          </button>
          <button
            type="button"
            disabled={!connect}
            onClick={leave}
            className="badge hover:border-[var(--border-strong)] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Leave
          </button>
          <p className="text-xs text-[var(--muted)]">
            Identity: <code>{identity}</code>
          </p>
        </div>

        {error ? (
          <p className="text-sm text-red-600 mt-3">{error}</p>
        ) : null}
      </div>

      {serverUrl && token ? (
        <div data-lk-theme="default" className="card p-5">
          <LiveKitRoom
            token={token}
            serverUrl={serverUrl}
            connect={connect}
            audio={true}
            video={false}
            onDisconnected={leave}
          >
            <RoomAudioRenderer />
            <div className="space-y-4">
              <AvatarStage />
              <AgentStatus />
              <div className="flex items-center justify-center">
                <VoiceAssistantControlBar />
              </div>
            </div>
          </LiveKitRoom>
        </div>
      ) : null}
    </div>
  );
}
