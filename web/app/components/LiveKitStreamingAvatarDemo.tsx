'use client';

/* eslint-disable @next/next/no-img-element */

import { useMemo, useState } from 'react';
import { fal } from '@fal-ai/client';
import '@livekit/components-styles';
import {
  BarVisualizer,
  LiveKitRoom,
  RoomAudioRenderer,
  VideoTrack,
  VoiceAssistantControlBar,
  useVoiceAssistant,
} from '@livekit/components-react';

fal.config({
  proxyUrl: '/api/fal/proxy',
});

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
  const { videoTrack } = useVoiceAssistant();

  return (
    <div className="relative h-[420px] w-full bg-black/20 rounded border border-[var(--border)] overflow-hidden flex items-center justify-center">
      {videoTrack ? (
        <VideoTrack
          trackRef={videoTrack}
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
  const tokenEndpoint =
    process.env.NEXT_PUBLIC_LIVEKIT_TOKEN_ENDPOINT || '/api/livekit/token';

  const [roomName, setRoomName] = useState('realtime-avatar-demo');
  const [agentName, setAgentName] = useState('avatar-agent');
  const [displayName, setDisplayName] = useState('web-user');

  const [avatarPrompt, setAvatarPrompt] = useState(
    'A photorealistic close-up headshot of a friendly digital human, neutral background, studio lighting, looking at the camera, high detail, sharp focus'
  );
  const [avatarImageUrl, setAvatarImageUrl] = useState('');
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [connect, setConnect] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generateAvatar() {
    setAvatarError(null);
    setAvatarBusy(true);
    try {
      const result = await fal.subscribe('fal-ai/flux/schnell', {
        input: {
          prompt: avatarPrompt.trim(),
          image_size: 'square_hd',
          num_images: 1,
        },
        storageSettings: { expiresIn: '1d' },
        pollInterval: 1000,
      });

      const url = result?.data?.images?.[0]?.url;
      if (!url) {
        throw new Error('fal response missing images[0].url');
      }

      setAvatarImageUrl(url);
    } catch (e) {
      setAvatarError(e instanceof Error ? e.message : String(e));
    } finally {
      setAvatarBusy(false);
    }
  }

  async function join() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_name: roomName.trim(),
          participant_identity: identity,
          participant_name: displayName.trim() || identity,
          agent_name: agentName.trim() || undefined,
          agent_metadata: avatarImageUrl.trim()
            ? { avatarImageUrl: avatarImageUrl.trim() }
            : undefined,
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

        <div className="mt-6 pt-5 border-t border-[var(--border)]">
          <p className="text-sm font-medium mb-2">Avatar (fal.ai)</p>
          <p className="text-xs text-[var(--muted)] mb-3">
            Generate a face image, then we pass the image URL to the agent via LiveKit dispatch
            metadata (<code>avatarImageUrl</code>). The fal key stays server-side via the proxy
            route.
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            <label className="text-sm md:col-span-2">
              <div className="text-xs text-[var(--muted)] mb-1">Prompt</div>
              <textarea
                value={avatarPrompt}
                onChange={(e) => setAvatarPrompt(e.target.value)}
                rows={3}
                className="w-full bg-[var(--card-bg)] border border-[var(--border)] rounded px-3 py-2 text-sm outline-none focus:border-[var(--border-strong)] resize-y"
                placeholder="Describe your digital human..."
              />
            </label>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                disabled={avatarBusy}
                onClick={generateAvatar}
                className="badge hover:border-[var(--border-strong)] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {avatarBusy ? 'Generating...' : 'Generate face image'}
              </button>

              <label className="text-sm">
                <div className="text-xs text-[var(--muted)] mb-1">Or paste image URL</div>
                <input
                  value={avatarImageUrl}
                  onChange={(e) => setAvatarImageUrl(e.target.value)}
                  className="w-full bg-[var(--card-bg)] border border-[var(--border)] rounded px-3 py-2 text-sm outline-none focus:border-[var(--border-strong)]"
                  placeholder="https://..."
                />
              </label>
            </div>
          </div>

          {avatarImageUrl ? (
            <div className="mt-4 flex flex-col md:flex-row md:items-center gap-4">
              <img
                src={avatarImageUrl}
                alt="Generated avatar"
                className="h-24 w-24 rounded border border-[var(--border)] object-cover"
              />
              <p className="text-xs text-[var(--muted)] break-all">
                Using: <code>{avatarImageUrl}</code>
              </p>
            </div>
          ) : null}

          {avatarError ? (
            <p className="text-sm text-red-600 mt-3">{avatarError}</p>
          ) : null}
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
