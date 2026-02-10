'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

// ═════════════════════════════════════════════════════════════════════════════
// ARKit 52 Blendshape Playground
// Reference: Apple ARFaceAnchor.BlendShapeLocation
// https://developer.apple.com/documentation/arkit/arfaceanchor/blendshapelocation
// FACS mapping: Ekman & Friesen Facial Action Coding System (1978)
// ═════════════════════════════════════════════════════════════════════════════

interface BS { name: string; region: string; facs: string; }

const BLENDSHAPES: BS[] = [
  // Eyes (14)
  { name: 'eyeBlinkLeft', region: 'Eyes', facs: 'AU45L' },
  { name: 'eyeBlinkRight', region: 'Eyes', facs: 'AU45R' },
  { name: 'eyeLookDownLeft', region: 'Eyes', facs: 'AU61L' },
  { name: 'eyeLookDownRight', region: 'Eyes', facs: 'AU61R' },
  { name: 'eyeLookInLeft', region: 'Eyes', facs: 'AU62L' },
  { name: 'eyeLookInRight', region: 'Eyes', facs: 'AU62R' },
  { name: 'eyeLookOutLeft', region: 'Eyes', facs: 'AU63L' },
  { name: 'eyeLookOutRight', region: 'Eyes', facs: 'AU63R' },
  { name: 'eyeLookUpLeft', region: 'Eyes', facs: 'AU64L' },
  { name: 'eyeLookUpRight', region: 'Eyes', facs: 'AU64R' },
  { name: 'eyeSquintLeft', region: 'Eyes', facs: 'AU6L' },
  { name: 'eyeSquintRight', region: 'Eyes', facs: 'AU6R' },
  { name: 'eyeWideLeft', region: 'Eyes', facs: 'AU5L' },
  { name: 'eyeWideRight', region: 'Eyes', facs: 'AU5R' },
  // Brows (5)
  { name: 'browDownLeft', region: 'Brows', facs: 'AU4L' },
  { name: 'browDownRight', region: 'Brows', facs: 'AU4R' },
  { name: 'browInnerUp', region: 'Brows', facs: 'AU1' },
  { name: 'browOuterUpLeft', region: 'Brows', facs: 'AU2L' },
  { name: 'browOuterUpRight', region: 'Brows', facs: 'AU2R' },
  // Jaw (4)
  { name: 'jawForward', region: 'Jaw', facs: 'AU29' },
  { name: 'jawLeft', region: 'Jaw', facs: 'AU30L' },
  { name: 'jawOpen', region: 'Jaw', facs: 'AU26+27' },
  { name: 'jawRight', region: 'Jaw', facs: 'AU30R' },
  // Mouth (23)
  { name: 'mouthClose', region: 'Mouth', facs: 'AU24' },
  { name: 'mouthDimpleLeft', region: 'Mouth', facs: 'AU14L' },
  { name: 'mouthDimpleRight', region: 'Mouth', facs: 'AU14R' },
  { name: 'mouthFrownLeft', region: 'Mouth', facs: 'AU15L' },
  { name: 'mouthFrownRight', region: 'Mouth', facs: 'AU15R' },
  { name: 'mouthFunnel', region: 'Mouth', facs: 'AU22' },
  { name: 'mouthLeft', region: 'Mouth', facs: 'AU30L' },
  { name: 'mouthLowerDownLeft', region: 'Mouth', facs: 'AU16L' },
  { name: 'mouthLowerDownRight', region: 'Mouth', facs: 'AU16R' },
  { name: 'mouthPressLeft', region: 'Mouth', facs: 'AU23L' },
  { name: 'mouthPressRight', region: 'Mouth', facs: 'AU23R' },
  { name: 'mouthPucker', region: 'Mouth', facs: 'AU18' },
  { name: 'mouthRight', region: 'Mouth', facs: 'AU30R' },
  { name: 'mouthRollLower', region: 'Mouth', facs: 'AU28L' },
  { name: 'mouthRollUpper', region: 'Mouth', facs: 'AU28U' },
  { name: 'mouthShrugLower', region: 'Mouth', facs: 'AU17L' },
  { name: 'mouthShrugUpper', region: 'Mouth', facs: 'AU17U' },
  { name: 'mouthSmileLeft', region: 'Mouth', facs: 'AU12L' },
  { name: 'mouthSmileRight', region: 'Mouth', facs: 'AU12R' },
  { name: 'mouthStretchLeft', region: 'Mouth', facs: 'AU20L' },
  { name: 'mouthStretchRight', region: 'Mouth', facs: 'AU20R' },
  { name: 'mouthUpperUpLeft', region: 'Mouth', facs: 'AU10L' },
  { name: 'mouthUpperUpRight', region: 'Mouth', facs: 'AU10R' },
  // Cheeks (3)
  { name: 'cheekPuff', region: 'Cheeks', facs: 'AU33' },
  { name: 'cheekSquintLeft', region: 'Cheeks', facs: 'AU6L' },
  { name: 'cheekSquintRight', region: 'Cheeks', facs: 'AU6R' },
  // Nose (2)
  { name: 'noseSneerLeft', region: 'Nose', facs: 'AU9L' },
  { name: 'noseSneerRight', region: 'Nose', facs: 'AU9R' },
  // Tongue (1)
  { name: 'tongueOut', region: 'Tongue', facs: 'AU19' },
];

const REGIONS = ['Eyes', 'Brows', 'Jaw', 'Mouth', 'Cheeks', 'Nose', 'Tongue'];
const REGION_COUNTS: Record<string, number> = {};
BLENDSHAPES.forEach(b => { REGION_COUNTS[b.region] = (REGION_COUNTS[b.region] || 0) + 1; });

const PRESETS: Record<string, Record<string, number>> = {
  neutral: {},
  smile: {
    mouthSmileLeft: 0.85, mouthSmileRight: 0.85,
    cheekSquintLeft: 0.4, cheekSquintRight: 0.4,
    eyeSquintLeft: 0.2, eyeSquintRight: 0.2,
  },
  surprise: {
    eyeWideLeft: 1, eyeWideRight: 1,
    browInnerUp: 0.8, browOuterUpLeft: 0.7, browOuterUpRight: 0.7,
    jawOpen: 0.5, mouthFunnel: 0.3,
  },
  angry: {
    browDownLeft: 0.9, browDownRight: 0.9,
    eyeSquintLeft: 0.5, eyeSquintRight: 0.5,
    noseSneerLeft: 0.6, noseSneerRight: 0.6,
    mouthFrownLeft: 0.3, mouthFrownRight: 0.3, jawOpen: 0.15,
  },
  sad: {
    browInnerUp: 0.7, browDownLeft: 0.3, browDownRight: 0.3,
    mouthFrownLeft: 0.6, mouthFrownRight: 0.6,
    mouthPressLeft: 0.3, mouthPressRight: 0.3,
  },
  wink: { eyeBlinkLeft: 1, mouthSmileLeft: 0.6, mouthSmileRight: 0.35, cheekSquintLeft: 0.5 },
  kiss: { mouthPucker: 0.9, mouthFunnel: 0.4, eyeBlinkLeft: 0.3, eyeBlinkRight: 0.3 },
  fear: {
    eyeWideLeft: 0.9, eyeWideRight: 0.9,
    browInnerUp: 0.9, browOuterUpLeft: 0.4, browOuterUpRight: 0.4,
    mouthStretchLeft: 0.6, mouthStretchRight: 0.6, jawOpen: 0.3,
  },
};

// ═══ Mesh overlay ════════════════════════════════════════════════════════════

function drawMesh(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, s: number,
  faceW: number, faceH: number, jawShift: number,
  w: Record<string, number>,
) {
  const rows = 18;
  const cols = 14;
  const pts: [number, number][][] = [];

  for (let r = 0; r <= rows; r++) {
    const row: [number, number][] = [];
    const v = (r / rows) * 2 - 1;
    for (let c = 0; c <= cols; c++) {
      const u = (c / cols) * 2 - 1;
      const maxX = Math.sqrt(Math.max(0, 1 - v * v));
      const nx = u * maxX;
      let px = cx + nx * faceW + jawShift * Math.max(0, v) * 0.3;
      let py = cy + v * faceH;
      // jaw open: lower face drops
      if (v > 0.05) py += (w.jawOpen || 0) * v * 14 * s;
      // cheek puff: expand sideways
      if (v > -0.15 && v < 0.35) {
        const t = 1 - Math.abs(v - 0.1) / 0.25;
        if (t > 0) px += Math.sign(nx) * (w.cheekPuff || 0) * t * 10 * s;
      }
      // brow region lifts
      if (v < -0.5) {
        const browUp = ((w.browInnerUp || 0) * (1 - Math.abs(nx)) +
          (nx < 0 ? (w.browOuterUpLeft || 0) : (w.browOuterUpRight || 0)) * Math.abs(nx)) * 0.5;
        py -= browUp * 10 * s;
      }
      row.push([px, py]);
    }
    pts.push(row);
  }

  ctx.strokeStyle = 'rgba(140, 180, 255, 0.18)';
  ctx.lineWidth = 0.6;
  for (let r = 0; r <= rows; r++) {
    ctx.beginPath();
    pts[r].forEach(([px, py], i) => i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py));
    ctx.stroke();
  }
  for (let c = 0; c <= cols; c++) {
    ctx.beginPath();
    for (let r = 0; r <= rows; r++) {
      const [px, py] = pts[r][c];
      r === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(140, 180, 255, 0.25)';
  for (const row of pts) for (const [px, py] of row) {
    ctx.beginPath(); ctx.arc(px, py, 1.2, 0, Math.PI * 2); ctx.fill();
  }
}

// ═══ Face drawing ════════════════════════════════════════════════════════════

function drawFace(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  weights: Record<string, number>,
  showMesh: boolean,
) {
  const cx = w / 2;
  const cy = h / 2 - 12;
  const s = w / 340;
  const g = (n: string) => weights[n] || 0;

  ctx.fillStyle = '#0f0f1a';
  ctx.fillRect(0, 0, w, h);

  // ── Face outline ──
  const cheekPuff = g('cheekPuff');
  const jawOpen = g('jawOpen');
  const jawLeft = g('jawLeft');
  const jawRight = g('jawRight');
  const jawFwd = g('jawForward');
  const jawShift = (jawRight - jawLeft) * 8 * s;
  const faceW = (102 + cheekPuff * 18 + jawFwd * 3) * s;
  const faceH = (130 + jawOpen * 16) * s;
  const faceCx = cx + jawShift * 0.3;
  const faceCy = cy + jawOpen * 5 * s;

  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 24 * s;
  ctx.shadowOffsetX = 3 * s;
  ctx.shadowOffsetY = 5 * s;
  const fg = ctx.createRadialGradient(
    faceCx - 15 * s, faceCy - 30 * s, 8 * s,
    faceCx, faceCy + 10 * s, faceH,
  );
  fg.addColorStop(0, '#ffe8cc');
  fg.addColorStop(0.35, '#ffdbac');
  fg.addColorStop(0.75, '#e8b88a');
  fg.addColorStop(1, '#c4956a');
  ctx.fillStyle = fg;
  ctx.beginPath();
  ctx.ellipse(faceCx, faceCy, faceW, faceH, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // ── Mesh overlay ──
  if (showMesh) drawMesh(ctx, faceCx, faceCy, s, faceW, faceH, jawShift, weights);

  // ── Cheek blush ──
  const smL = g('mouthSmileLeft'), smR = g('mouthSmileRight');
  const csqL = g('cheekSquintLeft'), csqR = g('cheekSquintRight');
  const blush = Math.max(csqL, csqR, smL * 0.5, smR * 0.5, cheekPuff * 0.3);
  if (blush > 0.04) {
    for (const bx of [faceCx - 58 * s, faceCx + 58 * s]) {
      const bg = ctx.createRadialGradient(bx, cy + 22 * s, 0, bx, cy + 22 * s, 24 * s);
      bg.addColorStop(0, `rgba(255,130,130,${blush * 0.35})`);
      bg.addColorStop(1, 'rgba(255,130,130,0)');
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.arc(bx, cy + 22 * s, 24 * s, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ── Nose sneer wrinkles ──
  const snL = g('noseSneerLeft'), snR = g('noseSneerRight');
  if (snL > 0.1 || snR > 0.1) {
    ctx.strokeStyle = `rgba(180,130,90,${Math.max(snL, snR) * 0.6})`;
    ctx.lineWidth = 1.2 * s;
    if (snL > 0.1) {
      ctx.beginPath();
      ctx.moveTo(cx - 14 * s, cy - 2 * s);
      ctx.quadraticCurveTo(cx - 22 * s, cy + 6 * s, cx - 30 * s, cy + 2 * s);
      ctx.stroke();
    }
    if (snR > 0.1) {
      ctx.beginPath();
      ctx.moveTo(cx + 14 * s, cy - 2 * s);
      ctx.quadraticCurveTo(cx + 22 * s, cy + 6 * s, cx + 30 * s, cy + 2 * s);
      ctx.stroke();
    }
  }

  // ── Brows ──
  const bdL = g('browDownLeft'), bdR = g('browDownRight');
  const biu = g('browInnerUp');
  const bouL = g('browOuterUpLeft'), bouR = g('browOuterUpRight');

  ctx.strokeStyle = '#4a3728';
  ctx.lineWidth = 5 * s;
  ctx.lineCap = 'round';

  // Left brow
  ctx.beginPath();
  ctx.moveTo(cx - 66 * s, cy - 48 * s + bdL * 15 * s - bouL * 16 * s);
  ctx.quadraticCurveTo(
    cx - 42 * s, cy - 62 * s + bdL * 10 * s - ((biu + bouL) / 2) * 14 * s,
    cx - 18 * s, cy - 48 * s - biu * 16 * s,
  );
  ctx.stroke();
  // Right brow
  ctx.beginPath();
  ctx.moveTo(cx + 66 * s, cy - 48 * s + bdR * 15 * s - bouR * 16 * s);
  ctx.quadraticCurveTo(
    cx + 42 * s, cy - 62 * s + bdR * 10 * s - ((biu + bouR) / 2) * 14 * s,
    cx + 18 * s, cy - 48 * s - biu * 16 * s,
  );
  ctx.stroke();

  // ── Eyes ──
  const drawEye = (
    ex: number, side: 'L' | 'R',
    blink: number, wide: number, squint: number, cheekSq: number,
    lookUp: number, lookDown: number, lookIn: number, lookOut: number,
  ) => {
    const openness = Math.max(0.06, 1 - blink) * (1 + wide * 0.35) * (1 - squint * 0.5) * (1 - cheekSq * 0.3);
    const rx = 23 * s;
    const ry = 14 * s * openness;

    // White
    const ewg = ctx.createRadialGradient(ex, cy - 18 * s, 2 * s, ex, cy - 18 * s, rx);
    ewg.addColorStop(0, '#ffffff');
    ewg.addColorStop(1, '#f0ece8');
    ctx.fillStyle = ewg;
    ctx.beginPath();
    ctx.ellipse(ex, cy - 18 * s, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#3a2f28';
    ctx.lineWidth = 1.5 * s;
    ctx.stroke();

    if (openness > 0.14) {
      // Iris position from look directions
      const irisMaxX = 6 * s, irisMaxY = 4 * s;
      const dirX = side === 'L'
        ? (-lookIn + lookOut) * irisMaxX
        : (lookIn - lookOut) * irisMaxX;
      const dirY = (lookDown - lookUp) * irisMaxY;
      const ix = ex + dirX;
      const iy = cy - 18 * s + dirY;

      const irisR = Math.min(9 * s, ry * 0.72);
      const ig = ctx.createRadialGradient(ix - 1 * s, iy - 1 * s, 1 * s, ix, iy, irisR);
      ig.addColorStop(0, '#5a3d2b');
      ig.addColorStop(0.5, '#3d2314');
      ig.addColorStop(1, '#2a1a0e');
      ctx.fillStyle = ig;
      ctx.beginPath();
      ctx.arc(ix, iy, irisR, 0, Math.PI * 2);
      ctx.fill();

      // Pupil
      ctx.fillStyle = '#0a0604';
      ctx.beginPath();
      ctx.arc(ix, iy, irisR * 0.38, 0, Math.PI * 2);
      ctx.fill();

      // Highlight
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.beginPath();
      ctx.arc(ix - 2 * s, iy - 2.5 * s, 2.5 * s, 0, Math.PI * 2);
      ctx.fill();
    }

    // Top eyelash
    if (openness > 0.18) {
      ctx.strokeStyle = '#2a1a0e';
      ctx.lineWidth = 2 * s;
      ctx.beginPath();
      ctx.ellipse(ex, cy - 18 * s, rx + 1 * s, ry + 1 * s, 0, Math.PI + 0.15, -0.15);
      ctx.stroke();
    }
  };

  drawEye(
    cx - 38 * s, 'L',
    g('eyeBlinkLeft'), g('eyeWideLeft'), g('eyeSquintLeft'), csqL,
    g('eyeLookUpLeft'), g('eyeLookDownLeft'), g('eyeLookInLeft'), g('eyeLookOutLeft'),
  );
  drawEye(
    cx + 38 * s, 'R',
    g('eyeBlinkRight'), g('eyeWideRight'), g('eyeSquintRight'), csqR,
    g('eyeLookUpRight'), g('eyeLookDownRight'), g('eyeLookInRight'), g('eyeLookOutRight'),
  );

  // ── Nose ──
  ctx.strokeStyle = '#c4956a';
  ctx.lineWidth = 2 * s;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx, cy - 5 * s);
  ctx.quadraticCurveTo(cx - 2 * s, cy + 15 * s, cx - 8 * s - snL * 5 * s, cy + 28 * s);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, cy - 5 * s);
  ctx.quadraticCurveTo(cx + 2 * s, cy + 15 * s, cx + 8 * s + snR * 5 * s, cy + 28 * s);
  ctx.stroke();
  ctx.fillStyle = '#b8845a';
  ctx.beginPath();
  ctx.ellipse(cx - 7 * s - snL * 4 * s, cy + 28 * s, (5 + snL * 3) * s, 3 * s, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + 7 * s + snR * 4 * s, cy + 28 * s, (5 + snR * 3) * s, 3 * s, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // ── Mouth ──
  const mLeft = g('mouthLeft'), mRight = g('mouthRight');
  const mClose = g('mouthClose');
  const mDimL = g('mouthDimpleLeft'), mDimR = g('mouthDimpleRight');
  const mFrownL = g('mouthFrownLeft'), mFrownR = g('mouthFrownRight');
  const mFunnel = g('mouthFunnel');
  const mLowerDnL = g('mouthLowerDownLeft'), mLowerDnR = g('mouthLowerDownRight');
  const mPressL = g('mouthPressLeft'), mPressR = g('mouthPressRight');
  const mPucker = g('mouthPucker');
  const mRollLo = g('mouthRollLower'), mRollUp = g('mouthRollUpper');
  const mShrugLo = g('mouthShrugLower'), mShrugUp = g('mouthShrugUpper');
  const mStretchL = g('mouthStretchLeft'), mStretchR = g('mouthStretchRight');
  const mUpL = g('mouthUpperUpLeft'), mUpR = g('mouthUpperUpRight');

  const mouthShift = (mRight - mLeft) * 10 * s;
  const mouthCx = cx + jawShift + mouthShift;
  const baseY = cy + 56 * s + jawOpen * 10 * s;

  const mouthW = (36
    + (mStretchL + mStretchR) * 6
    - mPucker * 14
    - mFunnel * 6
    + (smL + smR) * 3
    - (mDimL + mDimR) * 3
  ) * s;

  const press = (mPressL + mPressR) / 2;
  const lipGap = Math.max(0, jawOpen * 28 - mClose * 20) * (1 - press * 0.5) * s;
  const cornerLY = (smL - mFrownL + mStretchL * 0.3 - mDimL * 0.3) * 14 * s;
  const cornerRY = (smR - mFrownR + mStretchR * 0.3 - mDimR * 0.3) * 14 * s;

  const upperLipOff = (-mUpL * 4 - mUpR * 4 + mRollUp * 3 - mShrugUp * 3) * s / 2;
  const lowerLipOff = (mLowerDnL * 4 + mLowerDnR * 4 - mRollLo * 3 + mShrugLo * 3) * s / 2;

  if (mFunnel > 0.4 || mPucker > 0.4) {
    // O/pucker shape
    const ow = mouthW * (0.5 + mFunnel * 0.15);
    const oh = (4 + lipGap * 0.7) * s;
    const lg = ctx.createRadialGradient(mouthCx, baseY, 0, mouthCx, baseY, Math.max(ow, oh));
    lg.addColorStop(0, '#4a1515');
    lg.addColorStop(0.5, '#c45050');
    lg.addColorStop(1, '#d4887a');
    ctx.fillStyle = lg;
    ctx.beginPath();
    ctx.ellipse(mouthCx, baseY, ow, oh, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Standard mouth shape
    const ulY = baseY + upperLipOff;
    const llY = baseY + lowerLipOff;

    // Mouth interior
    if (lipGap > 1) {
      ctx.fillStyle = '#3a1010';
      ctx.beginPath();
      ctx.moveTo(mouthCx - mouthW, ulY - cornerLY);
      ctx.quadraticCurveTo(mouthCx, ulY + lipGap, mouthCx + mouthW, ulY - cornerRY);
      ctx.quadraticCurveTo(mouthCx, ulY - lipGap * 0.2, mouthCx - mouthW, ulY - cornerLY);
      ctx.fill();

      // Teeth
      if (jawOpen > 0.2) {
        ctx.fillStyle = '#f5f0eb';
        const tw = mouthW * 0.6;
        ctx.fillRect(mouthCx - tw, ulY - 1 * s, tw * 2, Math.min(8 * s, lipGap * 0.4));
      }
    }

    // Upper lip
    const ulGrad = ctx.createLinearGradient(mouthCx - mouthW, ulY, mouthCx + mouthW, ulY);
    ulGrad.addColorStop(0, '#c47060');
    ulGrad.addColorStop(0.5, '#d4887a');
    ulGrad.addColorStop(1, '#c47060');
    ctx.strokeStyle = ulGrad;
    ctx.lineWidth = (3 - mRollUp * 1.5) * s;
    ctx.beginPath();
    ctx.moveTo(mouthCx - mouthW, ulY - cornerLY);
    ctx.quadraticCurveTo(mouthCx, ulY - lipGap * 0.15 + upperLipOff, mouthCx + mouthW, ulY - cornerRY);
    ctx.stroke();

    // Lower lip
    if (lipGap > 1) {
      ctx.lineWidth = (3.5 - mRollLo * 1.5) * s;
      ctx.beginPath();
      ctx.moveTo(mouthCx - mouthW, llY - cornerLY + lipGap * 0.4);
      ctx.quadraticCurveTo(mouthCx, llY + lipGap * 0.6 + lowerLipOff, mouthCx + mouthW, llY - cornerRY + lipGap * 0.4);
      ctx.stroke();
    }
  }

  // Dimples
  if (mDimL > 0.15) {
    ctx.fillStyle = `rgba(180,130,100,${mDimL * 0.3})`;
    ctx.beginPath();
    ctx.arc(mouthCx - mouthW - 6 * s, baseY - cornerLY, 3 * s * mDimL, 0, Math.PI * 2);
    ctx.fill();
  }
  if (mDimR > 0.15) {
    ctx.fillStyle = `rgba(180,130,100,${mDimR * 0.3})`;
    ctx.beginPath();
    ctx.arc(mouthCx + mouthW + 6 * s, baseY - cornerRY, 3 * s * mDimR, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── Tongue ──
  const tongueOut = g('tongueOut');
  if (tongueOut > 0.05 && lipGap > 2) {
    const tongueLen = tongueOut * 18 * s;
    const tongueW = Math.min(mouthW * 0.5, 14 * s);
    const tongueY = baseY + lipGap * 0.3;
    const tg = ctx.createRadialGradient(mouthCx, tongueY, 0, mouthCx, tongueY + tongueLen, tongueW);
    tg.addColorStop(0, '#d45555');
    tg.addColorStop(1, '#c44040');
    ctx.fillStyle = tg;
    ctx.beginPath();
    ctx.ellipse(mouthCx, tongueY + tongueLen * 0.4, tongueW, tongueLen, 0, 0, Math.PI * 2);
    ctx.fill();
    // Center line
    ctx.strokeStyle = 'rgba(160,40,40,0.3)';
    ctx.lineWidth = 1 * s;
    ctx.beginPath();
    ctx.moveTo(mouthCx, tongueY);
    ctx.lineTo(mouthCx, tongueY + tongueLen * 0.7);
    ctx.stroke();
  }

  // ── Active weight bars ──
  const active = BLENDSHAPES.filter(b => (weights[b.name] || 0) > 0.01);
  if (active.length > 0) {
    const barArea = { x: 8 * s, y: h - 44 * s, w: w - 16 * s, h: 36 * s };
    const barW = Math.min(barArea.w / active.length - 0.8, 12 * s);
    const startX = barArea.x + (barArea.w - active.length * (barW + 0.8)) / 2;

    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = `${9 * s}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(
      `f = x\u2080 + \u03A3 w\u1D62\u00B7B\u1D62  [${active.length}/52 active]`,
      w / 2, barArea.y - 3 * s,
    );

    active.forEach((b, i) => {
      const x = startX + i * (barW + 0.8);
      const val = weights[b.name] || 0;
      ctx.fillStyle = 'rgba(124,106,156,0.12)';
      ctx.fillRect(x, barArea.y, barW, barArea.h);
      const fillH = val * barArea.h;
      ctx.fillStyle = `rgba(124,106,156,${0.35 + val * 0.65})`;
      ctx.fillRect(x, barArea.y + barArea.h - fillH, barW, fillH);
    });
  }
}

// ═══ Component ═══════════════════════════════════════════════════════════════

export function BlendshapeDemo() {
  const [weights, setWeights] = useState<Record<string, number>>(() =>
    Object.fromEntries(BLENDSHAPES.map(b => [b.name, 0])),
  );
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(['Eyes', 'Mouth']));
  const [showMesh, setShowMesh] = useState(false);
  const [activePreset, setActivePreset] = useState('neutral');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const targetRef = useRef<Record<string, number>>({});
  const currentRef = useRef<Record<string, number>>(
    Object.fromEntries(BLENDSHAPES.map(b => [b.name, 0])),
  );
  const rafRef = useRef(0);

  const activeCount = Object.values(weights).filter(v => v > 0.01).length;

  const toggle = (region: string) => {
    setExpanded(prev => {
      const n = new Set(prev);
      n.has(region) ? n.delete(region) : n.add(region);
      return n;
    });
  };

  const setWeight = (name: string, value: number) => {
    currentRef.current[name] = value;
    setWeights(prev => ({ ...prev, [name]: value }));
  };

  const applyPreset = useCallback((presetName: string) => {
    setActivePreset(presetName);
    const preset = PRESETS[presetName] || {};
    BLENDSHAPES.forEach(b => { targetRef.current[b.name] = preset[b.name] ?? 0; });
    const animate = () => {
      let settled = true;
      const next: Record<string, number> = {};
      BLENDSHAPES.forEach(b => {
        const cur = currentRef.current[b.name] || 0;
        const tgt = targetRef.current[b.name] ?? 0;
        const diff = tgt - cur;
        if (Math.abs(diff) > 0.002) {
          settled = false;
          next[b.name] = cur + diff * 0.13;
        } else {
          next[b.name] = tgt;
        }
      });
      currentRef.current = next;
      setWeights({ ...next });
      if (!settled) rafRef.current = requestAnimationFrame(animate);
    };
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawFace(ctx, canvas.width, canvas.height, weights, showMesh);
  }, [weights, showMesh]);

  return (
    <div className="card p-6">
      <h3 className="font-semibold mb-1">ARKit 52 Blendshape Playground</h3>
      <p className="text-xs text-[var(--text-muted)] mb-1">
        Apple <code className="text-[10px]">ARFaceAnchor.BlendShapeLocation</code> &mdash; 52 coefficients mapped to FACS Action Units.
      </p>
      <p className="text-[10px] text-[var(--text-muted)] mb-4">
        Each w<sub>i</sub> &isin; [0,1] linearly blends a basis deformation B<sub>i</sub> onto the neutral mesh x<sub>0</sub>.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Canvas */}
        <div className="flex flex-col items-center gap-3">
          <canvas
            ref={canvasRef}
            width={340}
            height={400}
            className="rounded-lg w-full max-w-[340px]"
          />
          <div className="w-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium">Expression Presets</span>
              <button
                onClick={() => setShowMesh(v => !v)}
                className={`text-[10px] px-2 py-0.5 rounded transition-colors ${
                  showMesh
                    ? 'bg-blue-500/20 text-blue-300'
                    : 'bg-[var(--surface-2)] text-[var(--text-muted)] hover:bg-[var(--border)]'
                }`}
              >
                {showMesh ? 'Mesh ON' : 'Show Mesh'}
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {Object.keys(PRESETS).map(p => (
                <button
                  key={p}
                  onClick={() => applyPreset(p)}
                  className={`text-xs px-2.5 py-1 rounded capitalize transition-colors ${
                    activePreset === p
                      ? 'bg-[var(--accent)] text-white'
                      : 'bg-[var(--surface-2)] hover:bg-[var(--border)]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Blendshape sliders by region */}
        <div className="max-h-[440px] overflow-y-auto space-y-1 pr-1">
          {REGIONS.map(region => {
            const isOpen = expanded.has(region);
            const regionBs = BLENDSHAPES.filter(b => b.region === region);
            const regionActive = regionBs.filter(b => (weights[b.name] || 0) > 0.01).length;
            return (
              <div key={region} className="border border-[var(--border)] rounded overflow-hidden">
                <button
                  onClick={() => toggle(region)}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium hover:bg-[var(--surface-1)] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-[10px] text-[var(--text-muted)]">{isOpen ? '\u25BC' : '\u25B6'}</span>
                    {region}
                    {regionActive > 0 && (
                      <span className="text-[9px] bg-[var(--accent)]/20 text-[var(--accent)] px-1.5 rounded-full">
                        {regionActive}
                      </span>
                    )}
                  </span>
                  <span className="text-[var(--text-muted)] text-[10px]">{REGION_COUNTS[region]}</span>
                </button>
                {isOpen && (
                  <div className="px-3 pb-2.5 pt-0.5 space-y-2 border-t border-[var(--border)]">
                    {regionBs.map(bs => {
                      const val = weights[bs.name] || 0;
                      return (
                        <div key={bs.name}>
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-[10px] font-mono leading-none">{bs.name}</span>
                            <span className="text-[9px] text-[var(--text-muted)] font-mono">
                              <span className="opacity-60">{bs.facs}</span> {val.toFixed(2)}
                            </span>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.01}
                            value={val}
                            onChange={e => setWeight(bs.name, parseFloat(e.target.value))}
                            className="w-full h-1.5"
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Formula + info */}
      <div className="mt-4 p-3 bg-[var(--surface-2)] rounded">
        <div className="flex items-center justify-between mb-1">
          <code className="text-xs font-mono">f(x) = x&#x2080; + &#x03A3; w&#x1D62; &middot; B&#x1D62;</code>
          <span className="text-[10px] text-[var(--text-muted)]">{activeCount}/52 active</span>
        </div>
        <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">
          Linear blend: neutral mesh x&#x2080; + weighted sum of 52 basis deformations.
          Mapped to FACS Action Units (Ekman &amp; Friesen, 1978).
          Ref: <span className="opacity-60">Apple ARFaceAnchor.BlendShapeLocation</span>
        </p>
      </div>
    </div>
  );
}

export default BlendshapeDemo;
