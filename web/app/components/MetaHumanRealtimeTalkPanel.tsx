'use client';

import { useEffect, useRef, useState } from 'react';
import { mapAmplitudeToFace } from '@/app/lib/audioToFace';

type RealtimeMintResponse = {
  ok?: boolean;
  data?: {
    client_secret?: {
      value?: string;
      expires_at?: number;
    };
  };
};

type RealtimeEvent = {
  type?: string;
  delta?: string;
  transcript?: string;
  item?: {
    role?: string;
    content?: Array<{ text?: string }>;
  };
};

function getClientSecretValue(payload: RealtimeMintResponse) {
  return payload?.data?.client_secret?.value || '';
}

export default function MetaHumanRealtimeTalkPanel() {
  const [targetActorTag, setTargetActorTag] = useState('PajamaMetaHuman');
  const [model, setModel] = useState('gpt-realtime');
  const [voice, setVoice] = useState('alloy');
  const [instructions, setInstructions] = useState(
    'You are a concise assistant. Keep responses short and conversational.'
  );
  const [promptText, setPromptText] = useState('Hello, can you introduce yourself in one sentence?');
  const [status, setStatus] = useState('Disconnected');
  const [assistantTranscript, setAssistantTranscript] = useState('');
  const [userTranscript, setUserTranscript] = useState('');
  const [lastError, setLastError] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isDrivingFace, setIsDrivingFace] = useState(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const faceIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sendInFlightRef = useRef(false);

  useEffect(() => {
    return () => {
      void stopSession();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function postFaceFrame(frame: ReturnType<typeof mapAmplitudeToFace>) {
    if (sendInFlightRef.current) {
      return;
    }
    sendInFlightRef.current = true;

    try {
      await fetch('/api/metahuman/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetActorTag,
          morphTargets: {
            jawOpen: frame.jawOpen,
            mouthFunnel: frame.mouthFunnel,
            mouthPucker: frame.mouthPucker,
            mouthClose: frame.mouthClose,
            browInnerUp: frame.browInnerUp,
            cheekSquintLeft: frame.cheekSquintLeft,
            cheekSquintRight: frame.cheekSquintRight,
          },
        }),
      });
    } catch {
      // Keep stream alive; UI already shows connection status.
    } finally {
      sendInFlightRef.current = false;
    }
  }

  async function resetFace() {
    try {
      await fetch('/api/metahuman/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetActorTag,
          morphTargets: {
            jawOpen: 0,
            mouthFunnel: 0,
            mouthPucker: 0,
            mouthClose: 0,
            browInnerUp: 0,
            cheekSquintLeft: 0,
            cheekSquintRight: 0,
          },
          headYaw: 0,
          headPitch: 0,
          headRoll: 0,
        }),
      });
    } catch {
      // best-effort
    }
  }

  function startFaceDrive(remoteStream: MediaStream) {
    if (!isDrivingFace) {
      return;
    }

    const ctx = new AudioContext();
    const source = ctx.createMediaStreamSource(remoteStream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.65;
    source.connect(analyser);

    audioCtxRef.current = ctx;
    analyserRef.current = analyser;

    const timeData = new Float32Array(analyser.fftSize);
    const freqData = new Uint8Array(analyser.frequencyBinCount);

    faceIntervalRef.current = setInterval(() => {
      if (!analyserRef.current) {
        return;
      }

      analyserRef.current.getFloatTimeDomainData(timeData);
      analyserRef.current.getByteFrequencyData(freqData);

      let sumSquares = 0;
      for (let i = 0; i < timeData.length; i += 1) {
        sumSquares += timeData[i] * timeData[i];
      }
      const rms = Math.sqrt(sumSquares / timeData.length);

      let low = 0;
      let high = 0;
      let lowCount = 0;
      let highCount = 0;

      const nyquist = ctx.sampleRate / 2;
      for (let i = 0; i < freqData.length; i += 1) {
        const freq = (i / freqData.length) * nyquist;
        const value = freqData[i] / 255;
        if (freq >= 120 && freq <= 900) {
          low += value;
          lowCount += 1;
        } else if (freq >= 1800 && freq <= 4200) {
          high += value;
          highCount += 1;
        }
      }

      const lowEnergy = lowCount > 0 ? low / lowCount : 0;
      const highEnergy = highCount > 0 ? high / highCount : 0;
      const frame = mapAmplitudeToFace(rms, lowEnergy, highEnergy);
      void postFaceFrame(frame);
    }, 80);
  }

  async function stopSession() {
    setStatus('Disconnecting');

    if (faceIntervalRef.current) {
      clearInterval(faceIntervalRef.current);
      faceIntervalRef.current = null;
    }

    analyserRef.current = null;

    if (audioCtxRef.current) {
      try {
        await audioCtxRef.current.close();
      } catch {
        // ignore
      }
      audioCtxRef.current = null;
    }

    if (dcRef.current) {
      try {
        dcRef.current.close();
      } catch {
        // ignore
      }
      dcRef.current = null;
    }

    if (pcRef.current) {
      try {
        pcRef.current.close();
      } catch {
        // ignore
      }
      pcRef.current = null;
    }

    if (localStreamRef.current) {
      for (const track of localStreamRef.current.getTracks()) {
        track.stop();
      }
      localStreamRef.current = null;
    }

    if (audioRef.current) {
      audioRef.current.srcObject = null;
    }

    setIsConnected(false);
    setIsConnecting(false);
    setStatus('Disconnected');
    await resetFace();
  }

  async function sendTextTurn() {
    if (!dcRef.current || dcRef.current.readyState !== 'open' || !promptText.trim()) {
      return;
    }

    const text = promptText.trim();

    dcRef.current.send(
      JSON.stringify({
        type: 'conversation.item.create',
        item: {
          type: 'message',
          role: 'user',
          content: [{ type: 'input_text', text }],
        },
      })
    );
    dcRef.current.send(JSON.stringify({ type: 'response.create' }));
  }

  function handleRealtimeEvent(raw: string) {
    let event: RealtimeEvent = {};
    try {
      event = JSON.parse(raw) as RealtimeEvent;
    } catch {
      return;
    }

    const type = event.type || '';
    if (type === 'response.output_audio_transcript.delta' && event.delta) {
      setAssistantTranscript((prev) => prev + event.delta);
      return;
    }

    if (type === 'response.output_audio_transcript.done') {
      setAssistantTranscript((prev) => `${prev}\n`);
      return;
    }

    if (type === 'conversation.item.input_audio_transcription.completed') {
      const text = event.transcript || event.item?.content?.[0]?.text || '';
      if (text) {
        setUserTranscript((prev) => `${prev}${prev ? '\n' : ''}${text}`);
      }
    }
  }

  async function startSession() {
    setLastError('');
    setIsConnecting(true);
    setStatus('Requesting realtime client secret');

    try {
      const mintRes = await fetch('/api/openai/realtime/client-secret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, voice, instructions }),
      });
      const mintData = (await mintRes.json()) as RealtimeMintResponse;
      if (!mintRes.ok) {
        throw new Error('Failed to mint realtime secret');
      }

      const clientSecret = getClientSecretValue(mintData);
      if (!clientSecret) {
        throw new Error('Realtime client secret missing in response');
      }

      setStatus('Opening microphone');
      const localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = localStream;

      setStatus('Connecting to OpenAI Realtime (WebRTC)');
      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      for (const track of localStream.getTracks()) {
        pc.addTrack(track, localStream);
      }

      pc.onconnectionstatechange = () => {
        const state = pc.connectionState;
        setStatus(`Peer state: ${state}`);
        if (state === 'connected') {
          setIsConnected(true);
          setIsConnecting(false);
        } else if (state === 'failed' || state === 'disconnected' || state === 'closed') {
          setIsConnected(false);
        }
      };

      pc.ontrack = (event) => {
        const [remoteStream] = event.streams;
        if (!remoteStream) return;

        if (audioRef.current) {
          audioRef.current.srcObject = remoteStream;
          void audioRef.current.play().catch(() => {
            // autoplay restrictions; user can still unmute manually
          });
        }

        startFaceDrive(remoteStream);
      };

      const dc = pc.createDataChannel('oai-events');
      dcRef.current = dc;

      dc.onopen = () => {
        setStatus('Realtime data channel open');
        dc.send(
          JSON.stringify({
            type: 'session.update',
            session: {
              type: 'realtime',
              turn_detection: { type: 'server_vad', interrupt_response: true },
              output_modalities: ['audio', 'text'],
            },
          })
        );
      };

      dc.onmessage = (event) => {
        handleRealtimeEvent(String(event.data ?? ''));
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const sdpResponse = await fetch(`https://api.openai.com/v1/realtime?model=${encodeURIComponent(model)}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${clientSecret}`,
          'Content-Type': 'application/sdp',
        },
        body: offer.sdp || '',
      });

      if (!sdpResponse.ok) {
        const errorText = await sdpResponse.text().catch(() => '');
        throw new Error(`Realtime SDP exchange failed: ${sdpResponse.status} ${errorText}`);
      }

      const answerSdp = await sdpResponse.text();
      await pc.setRemoteDescription({
        type: 'answer',
        sdp: answerSdp,
      });

      setStatus('Connected');
    } catch (error) {
      setLastError(error instanceof Error ? error.message : String(error));
      setStatus('Connection failed');
      await stopSession();
    } finally {
      setIsConnecting(false);
    }
  }

  return (
    <div className="card p-5 mt-6">
      <p className="font-medium mb-1">Realtime Talk + Audio-to-Face (In Progress)</p>
      <p className="text-xs text-[var(--text-muted)] mb-4">
        Browser mic streams to OpenAI Realtime (WebRTC). Assistant audio is analyzed in-browser and converted
        to MetaHuman morph target frames sent to Unreal through <code>/api/metahuman/control</code>.
      </p>

      <div className="grid md:grid-cols-3 gap-3 mb-4">
        <label className="text-sm">
          <div className="text-xs text-[var(--text-muted)] mb-1">Target actor tag</div>
          <input
            value={targetActorTag}
            onChange={(e) => setTargetActorTag(e.target.value)}
            className="w-full bg-[var(--surface-0)] border border-[var(--border)] rounded px-3 py-2 text-sm outline-none focus:border-[var(--border-strong)]"
          />
        </label>
        <label className="text-sm">
          <div className="text-xs text-[var(--text-muted)] mb-1">Realtime model</div>
          <input
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full bg-[var(--surface-0)] border border-[var(--border)] rounded px-3 py-2 text-sm outline-none focus:border-[var(--border-strong)]"
          />
        </label>
        <label className="text-sm">
          <div className="text-xs text-[var(--text-muted)] mb-1">Voice</div>
          <input
            value={voice}
            onChange={(e) => setVoice(e.target.value)}
            className="w-full bg-[var(--surface-0)] border border-[var(--border)] rounded px-3 py-2 text-sm outline-none focus:border-[var(--border-strong)]"
          />
        </label>
      </div>

      <label className="text-sm block mb-4">
        <div className="text-xs text-[var(--text-muted)] mb-1">Instructions</div>
        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          rows={2}
          className="w-full bg-[var(--surface-0)] border border-[var(--border)] rounded px-3 py-2 text-sm outline-none focus:border-[var(--border-strong)] resize-y"
        />
      </label>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <button
          type="button"
          disabled={isConnecting || isConnected}
          onClick={startSession}
          className="badge hover:border-[var(--border-strong)] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isConnecting ? 'Connecting...' : 'Start Realtime Session'}
        </button>
        <button
          type="button"
          disabled={!isConnected && !isConnecting}
          onClick={() => {
            void stopSession();
          }}
          className="badge hover:border-[var(--border-strong)] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Stop Session
        </button>
        <label className="inline-flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={isDrivingFace}
            onChange={(e) => setIsDrivingFace(e.target.checked)}
          />
          Drive face from assistant audio
        </label>
      </div>

      <div className="grid md:grid-cols-[1fr_auto] gap-2 items-end mb-4">
        <label className="text-sm">
          <div className="text-xs text-[var(--text-muted)] mb-1">Text turn (optional)</div>
          <input
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            className="w-full bg-[var(--surface-0)] border border-[var(--border)] rounded px-3 py-2 text-sm outline-none focus:border-[var(--border-strong)]"
          />
        </label>
        <button
          type="button"
          disabled={!isConnected}
          onClick={() => {
            void sendTextTurn();
          }}
          className="badge hover:border-[var(--border-strong)] disabled:opacity-60 disabled:cursor-not-allowed h-[38px]"
        >
          Send Text Turn
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div className="p-3 rounded bg-[var(--surface-2)] text-xs">
          <p className="font-medium text-[var(--foreground)] mb-1">Status</p>
          <p className="text-[var(--text-muted)] mb-2">{status}</p>
          {lastError ? <p className="text-red-600">{lastError}</p> : null}
        </div>
        <div className="p-3 rounded bg-[var(--surface-2)] text-xs">
          <p className="font-medium text-[var(--foreground)] mb-1">User transcript</p>
          <pre className="whitespace-pre-wrap break-words">{userTranscript || 'No transcript yet.'}</pre>
        </div>
        <div className="p-3 rounded bg-[var(--surface-2)] text-xs md:col-span-2">
          <p className="font-medium text-[var(--foreground)] mb-1">Assistant transcript</p>
          <pre className="whitespace-pre-wrap break-words">{assistantTranscript || 'No transcript yet.'}</pre>
        </div>
      </div>

      <audio ref={audioRef} autoPlay playsInline hidden />
    </div>
  );
}
