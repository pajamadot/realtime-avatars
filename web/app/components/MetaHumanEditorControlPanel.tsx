'use client';

import { useMemo, useState } from 'react';

type ManualControls = {
  smile: number;
  jawOpen: number;
  browInnerUp: number;
  headYaw: number;
  headPitch: number;
};

const INITIAL_CONTROLS: ManualControls = {
  smile: 0.0,
  jawOpen: 0.0,
  browInnerUp: 0.0,
  headYaw: 0.0,
  headPitch: 0.0,
};

function Slider({
  label,
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="text-sm">
      <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-1">
        <span>{label}</span>
        <span>{value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number.parseFloat(e.target.value))}
        className="w-full accent-[var(--accent)]"
      />
    </label>
  );
}

export default function MetaHumanEditorControlPanel() {
  const [targetActorTag, setTargetActorTag] = useState('PajamaMetaHuman');
  const [controls, setControls] = useState<ManualControls>(INITIAL_CONTROLS);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('Idle');
  const [lastResponse, setLastResponse] = useState<string>('');

  const commandBody = useMemo(
    () => ({
      targetActorTag,
      morphTargets: {
        mouthSmileLeft: controls.smile,
        mouthSmileRight: controls.smile,
        jawOpen: controls.jawOpen,
        browInnerUp: controls.browInnerUp,
      },
      headYaw: controls.headYaw,
      headPitch: controls.headPitch,
      headRoll: 0,
    }),
    [controls, targetActorTag]
  );

  async function sendCommand(payload: unknown, label: string) {
    setBusy(true);
    setStatus(`Sending: ${label}`);

    try {
      const res = await fetch('/api/metahuman/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
      setLastResponse(JSON.stringify(data, null, 2));
      setStatus(res.ok ? `Success: ${label}` : `Failed: ${label}`);
    } catch (error) {
      setStatus(`Error: ${label}`);
      setLastResponse(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  async function checkBridgeHealth() {
    setBusy(true);
    setStatus('Checking bridge health');
    try {
      const res = await fetch('/api/metahuman/control', { method: 'GET' });
      const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
      setLastResponse(JSON.stringify(data, null, 2));
      setStatus(res.ok ? 'Bridge reachable' : 'Bridge health check failed');
    } catch (error) {
      setStatus('Bridge health check failed');
      setLastResponse(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card p-5 mt-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
        <div>
          <p className="font-medium">MetaHuman Editor Control (UE 5.7)</p>
          <p className="text-xs text-[var(--text-muted)]">
            Sends commands to <code>/api/metahuman/control</code>, which forwards to your local Unreal editor bridge.
          </p>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={checkBridgeHealth}
          className="badge hover:border-[var(--border-strong)] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Bridge health
        </button>
      </div>

      <label className="text-sm block mb-4">
        <div className="text-xs text-[var(--text-muted)] mb-1">Target actor tag in Unreal</div>
        <input
          value={targetActorTag}
          onChange={(e) => setTargetActorTag(e.target.value)}
          className="w-full bg-[var(--surface-0)] border border-[var(--border)] rounded px-3 py-2 text-sm outline-none focus:border-[var(--border-strong)]"
          placeholder="PajamaMetaHuman"
        />
      </label>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <Slider
          label="Smile"
          min={0}
          max={1}
          step={0.01}
          value={controls.smile}
          onChange={(value) => setControls((prev) => ({ ...prev, smile: value }))}
        />
        <Slider
          label="Jaw Open"
          min={0}
          max={1}
          step={0.01}
          value={controls.jawOpen}
          onChange={(value) => setControls((prev) => ({ ...prev, jawOpen: value }))}
        />
        <Slider
          label="Brow Inner Up"
          min={0}
          max={1}
          step={0.01}
          value={controls.browInnerUp}
          onChange={(value) => setControls((prev) => ({ ...prev, browInnerUp: value }))}
        />
        <Slider
          label="Head Yaw"
          min={-45}
          max={45}
          step={1}
          value={controls.headYaw}
          onChange={(value) => setControls((prev) => ({ ...prev, headYaw: value }))}
        />
        <Slider
          label="Head Pitch"
          min={-25}
          max={25}
          step={1}
          value={controls.headPitch}
          onChange={(value) => setControls((prev) => ({ ...prev, headPitch: value }))}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => sendCommand(commandBody, 'manual')}
          className="badge hover:border-[var(--border-strong)] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Apply manual
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => sendCommand({ targetActorTag, preset: 'smile', strength: 1.0 }, 'preset-smile')}
          className="badge hover:border-[var(--border-strong)] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Smile preset
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => sendCommand({ targetActorTag, preset: 'talk', strength: 1.0 }, 'preset-talk')}
          className="badge hover:border-[var(--border-strong)] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Talk preset
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            setControls(INITIAL_CONTROLS);
            void sendCommand(
              {
                targetActorTag,
                morphTargets: {
                  mouthSmileLeft: 0,
                  mouthSmileRight: 0,
                  jawOpen: 0,
                  browInnerUp: 0,
                },
                headYaw: 0,
                headPitch: 0,
                headRoll: 0,
              },
              'reset'
            );
          }}
          className="badge hover:border-[var(--border-strong)] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Reset
        </button>
      </div>

      <div className="mt-4 p-3 rounded bg-[var(--surface-2)] text-xs">
        <p className="font-medium text-[var(--foreground)] mb-1">Status</p>
        <p className="text-[var(--text-muted)] mb-2">{status}</p>
        <pre className="overflow-x-auto whitespace-pre-wrap break-words text-[11px] leading-relaxed">
          {lastResponse || 'No response yet.'}
        </pre>
      </div>
    </div>
  );
}
