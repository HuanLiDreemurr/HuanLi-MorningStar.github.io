// HuanLi: THE PLATES OF PRE-CHORUS 2, her version. The settings again, each control as large as the frame (the grammar
// and the timing of plates_pre2.js: the sung letter is the event, the drum is the hand getting ready or the aftershock;
// the pointer touches the controls and never her):
//
//   plateGenderHL  F | M: on the second letter her bust is the boy's, his outfit printed in inverted inks (a dark
//                  jacket with cream diamonds where her robe was cream with dark ones): the switch shows as a negative
//   plateStar      On call, AM -> PM: the knob of the slider is her MORNING STAR, dragged over the sky. At the AM end it
//                  is the morning star, over the top it is lost in the daylight, at the PM end it shines again and is
//                  the evening star: one star, two names (the planet has both), as one model wears a persona's name
//   plateBalance   Role, S | M: a balance; her halo is its pivot. The pointer takes the end of the beam: up, so the
//                  first letter's pan goes down as it is sung; then down, so the second's does
//   plateTranceHL  Loop: one plate of each of her three looks of this segment (the cream of the front bust, the orange
//                  of the tabby, the black of the boy) turning about her halo, a step each time the word comes round;
//                  then in register, and it is the boy: what the settings were left at
import { burst, morningStar, spark } from '../components/motif.js';
import { PERSONA } from '../components/persona.js';
import { clamp, easeIn, easeInOut, easeOut, lerp, prog, pulse } from '../engine/util.js';
import { drawLook, lookHalo, lookPoint, lookRect, lookStar } from './looks.js';
import { along, caption, hand, letter, sheet } from './plates_pre2.js';

const TAU = Math.PI * 2;
const flashIn = (t, at) => (t < at ? 0 : clamp(0.6 + (t - at) * 30));

// ============================================================================================ Gender: F | M
const SEG = { x: 70, y: 176, w: 1780, h: 836, r: 70 };
const FIG = { x: 700, y: 214, w: 520, h: (520 * 1448) / 1086 };

/** As plates_pre2.js plateGender (P.at, P.press, P.click, P.thud, P.sung, P.values, P.to, P.until); her looks from looks.js. */
export function plateGenderHL(ctx, env, P) {
  const { t, at, click } = P, [va, vb] = P.values, a = flashIn(t, at), g = ctx.g, press = P.press ?? click, thud = P.thud ?? Infinity;
  sheet(ctx, [960, 560, 560, 'raised', 1]);
  const k = easeOut(prog(t, click, click + 0.1)), on = t >= click, cw = SEG.w / 2;
  const held = t >= press && t < click ? easeOut(prog(t, press, press + 0.07)) : 0, sink = 9 * held;
  ctx.rrect(SEG.x + 12, SEG.y + 12, SEG.w, SEG.h, SEG.r, { fill: 'bg' });
  ctx.rrect(SEG.x, SEG.y, SEG.w, SEG.h, SEG.r, { fill: 'panel', stroke: 'line', width: 3 });
  if (held > 0) ctx.rrect(SEG.x + cw + 16 + sink, SEG.y + 16 + sink, cw - 32 - sink, SEG.h - 32 - sink, SEG.r - 14, { fill: 'bg', alpha: 0.5 * held, stroke: 'line', width: 3 });
  const stretch = Math.sin(Math.PI * k) * 60, px = SEG.x + 16 + k * cw;
  ctx.rrect(px - stretch, SEG.y + 16, cw - 32 + 2 * stretch, SEG.h - 32, SEG.r - 14, { fill: 'raised', stroke: 'me', width: 4 });
  ctx.text(va, SEG.x + 70, SEG.y + 118, { size: 72, weight: 700, color: on ? 'mute' : 'text' });
  ctx.text(vb, SEG.x + SEG.w - 70 + sink, SEG.y + 118 + sink, { size: 72, weight: 700, color: on ? 'text' : held ? 'sub' : 'mute', align: 'right' });
  letter(ctx, va, 392, 790, 500, t, Math.max(at, P.sung ?? at), { off: click });
  letter(ctx, vb, 1528 + sink, 790 + sink, 500, t, click, { pop: 0.15 });
  if (a > 0) {
    const s = 1 + 0.035 * pulse(t - at, 16) + 0.05 * pulse(t - click, 14), a0 = g.globalAlpha;
    g.globalAlpha = a0 * a;
    ctx.circle(960, 520, 300, { fill: true, color: 'line', alpha: 0.55 });
    ctx.at(960 * (1 - s), 560 * (1 - s), () => {
      const look = on ? 'boy' : 'bust';
      lookHalo(ctx, env, look, FIG, { color: on ? 'meDim' : 'me', rot: 0.1 * (t - at), alpha: 0.85 });
      drawLook(ctx, env, look, FIG);
      lookStar(ctx, env, look, FIG, { glow: 0.5 });
    }, { scale: s });
    g.globalAlpha = a0;
  }
  caption(ctx, env, t, P.lines);
  const A = [470, 944], B = [1470, 944];
  let p = along([{ t: at, x: A[0], y: A[1] }, { t: press, x: B[0], y: B[1], go: at + 0.05 }], t);
  if (P.to && t > click + 0.14) {
    const q = easeInOut(prog(t, click + 0.14, P.until)), c = [700, 1050];
    p = [0, 1].map((i) => (1 - q) * (1 - q) * B[i] + 2 * (1 - q) * q * c[i] + q * q * P.to[i]);
  }
  burst(ctx, A[0], A[1], 96, (t - at) / 0.45, { color: 'text' });
  if (press < click) burst(ctx, B[0], B[1], 52, (t - press) / 0.3, { color: 'sub' });
  burst(ctx, B[0], B[1], 120, (t - click) / 0.45, { color: 'text' });
  hand(ctx, p[0], p[1], { down: Math.max(pulse(t - at, 10), t >= press && t < click ? 1 : 0, pulse(t - click, 10)) });
  ctx.fx.shake = [7 * pulse(t - click, 13) * Math.sin((t - click) * 80), t >= thud ? 5 * pulse(t - thud, 11) * Math.sin((t - thud) * 70) : 0];
}

// ============================================================================================ On call: the morning star
/** The horizon, the two ends of the arc on it, and the bust (the boy, small) whose head the top of the arc passes over. */
const DAY = { y: 900, x0: 150, x1: 1770, bust: 500 };

function starGeom(art) {
  const B = lookRect(art, 'boy', 0, DAY.y - DAY.bust, DAY.bust);
  B.x = 960 - B.w / 2;
  const top = B.y + (40 / 1448) * B.h - 70;                                           // a little over the tips of his ears
  const half = (DAY.x1 - DAY.x0) / 2, sag = DAY.y - top, R = (half * half + sag * sag) / (2 * sag), C = [960, top + R];
  const f0 = Math.atan2(DAY.y - C[1], DAY.x0 - C[0]), f1 = Math.atan2(DAY.y - C[1], DAY.x1 - C[0]);
  const on = (u) => { const f = lerp(f0, f1, u); return [C[0] + R * Math.cos(f), C[1] + R * Math.sin(f), Math.cos(f), Math.sin(f)]; };
  const grip = (q) => [q[0] + q[2] * 120, q[1] + q[3] * 120];                         // the pointer holds the star by its outer point
  return { B, R, C, f0, f1, on, grip };
}
/** Where the pointer takes the star at the AM end (the shot before brings it there). */
export const starGrip = (art) => { const G = starGeom(art); return G.grip(G.on(0)); };

/**
 * As plates_pre2.js plateDay: P.grab, P.drag, P.top (the hit on which the star is highest), P.end (pressed against the
 * PM end), P.am / P.pm (the two words sung), P.values, P.from / P.to / P.until (the pointer).
 * The star: blue at the AM end (the morning star), paler and paler as the day comes up, lost in the light over the top,
 * and blue again at the PM end, where its name is the other one.
 */
export function plateStar(ctx, env, P) {
  const { t, at, grab, drag, top, end } = P, { art } = env, [va, vb] = P.values, g = ctx.g, a = flashIn(t, at);
  const { B, R, C, f0, f1, on, grip } = starGeom(art);
  const u = t < grab ? 0 : t < top ? 0.11 * prog(t, grab, top) + 0.39 * easeInOut(prog(t, drag, top)) : 0.5 + 0.5 * easeIn(prog(t, top, end));
  const high = Math.sin(Math.PI * clamp(u)) ** 0.8, dusk = clamp((t - end) * 30), S = on(clamp(u)), press = pulse(t - end, 9);
  // the sky, printed in flat discs: the dawn low on the left, the whole sky at noon, the dusk low on the right
  sheet(ctx, [960, 560, 640, 'raised', 0.25 + 0.6 * high]);
  const dawn = clamp(1 - u * 2.2), eve = clamp((u - 0.55) * 2.2), noon = high ** 4;
  for (const [x, k, role] of [[DAY.x0, dawn, 'line'], [DAY.x1, eve, 'meDim']]) if (k > 0) for (const [r, al] of [[620, 0.35], [380, 0.45], [200, 0.55]]) ctx.circle(x, DAY.y, r, { fill: true, color: role, alpha: al * k * (1 - dusk * 0.4) });
  if (noon > 0) ctx.rect(0, 0, 1920, DAY.y, { fill: true, color: 'mute', alpha: 0.42 * noon });
  ctx.fx.bright *= 1 + 0.12 * noon;
  ctx.rect(0, DAY.y, 1920, 1080 - DAY.y, { fill: true, color: 'bg', alpha: 0.6 });
  // the slider: its track is the arc, lit from the AM end as far as the knob has come
  const arc = (ua, ub, o) => { g.beginPath(); g.arc(C[0], C[1], R, lerp(f0, f1, ua), lerp(f0, f1, ub)); g.strokeStyle = ctx.col(o.color, 1); g.lineWidth = o.width; g.stroke(); };
  arc(0, 1, { color: 'line', width: 7 });
  if (u > 0.004) arc(0, clamp(u), { color: 'me', width: 9 });
  for (let i = 0; i <= 12; i++) { const q = on(i / 12), l = i % 6 === 0 ? 34 : 18; ctx.line(q[0] + q[2] * 14, q[1] + q[3] * 14, q[0] + q[2] * (14 + l), q[1] + q[3] * (14 + l), { color: i / 12 <= u ? 'sub' : 'mute', width: 4 }); }
  ctx.line(60, DAY.y, 1860, DAY.y, { color: 'line', width: 3 });
  ctx.text(va, DAY.x0, DAY.y + 62, { size: 40, weight: 700, color: u < 0.5 ? 'text' : 'mute', align: 'center' });
  ctx.text(vb, DAY.x1, DAY.y + 62, { size: 40, weight: 700, color: u >= 0.5 ? 'text' : 'mute', align: 'center' });
  // the star's two names, under the two ends: lit where the star is
  ctx.text('morning star', DAY.x0 + 70, DAY.y + 58, { size: 26, font: 'mono', color: u < 0.3 ? 'text' : 'mute' });
  ctx.text('evening star', DAY.x1 - 70, DAY.y + 58, { size: 26, font: 'mono', color: u > 0.7 ? 'text' : 'mute', align: 'right' });
  letter(ctx, va, 330, 430, 250, t, P.am);
  letter(ctx, vb, 1590, 430, 250, t, P.pm);
  // him: small, whole, never touched. At dusk only a dark shape with a thin edge is left of him
  if (a > 0) {
    if (dusk > 0.5) drawLook(ctx, env, 'boy', B, { alpha: a, plates: [{ ink: 'all', role: 'bg' }], keyline: { color: 'line', width: 2 } });
    else { drawLook(ctx, env, 'boy', B, { alpha: a }); lookStar(ctx, env, 'boy', B, { alpha: a * 0.9, glow: 0.3 }); }
  }
  // the knob: her morning star, rising out of the horizon and setting into it; the daylight takes its colour
  const fade = 1 - 0.8 * noon, r = 74 * (1 + 0.15 * press);
  ctx.clip({ x: 0, y: 0, w: 1920, h: DAY.y }, () => {
    ctx.circle(S[0], S[1], 96, { fill: true, color: 'panel', alpha: 0.5 * fade });
    morningStar(ctx, S[0] + 10, S[1] + 10, r, { color: 'bg', rot: u * 1.2 });
    ctx.glow(PERSONA.star, 34, () => morningStar(ctx, S[0], S[1], r, { rot: u * 1.2, alpha: fade }), 0.8 * fade);
    morningStar(ctx, S[0], S[1], r, { color: 'text', rot: u * 1.2, alpha: 1 - fade });
  });
  caption(ctx, env, t, P.lines);
  const G0 = grip(on(0)), G = grip(S), G1 = grip(on(1)), from = P.from ?? G0;
  const p = t < grab ? along([{ t: at, x: from[0], y: from[1] }, { t: grab, x: G0[0], y: G0[1] }], t) : t < end + 0.2 ? G : along([{ t: end + 0.2, x: G1[0], y: G1[1] }, { t: P.until, x: P.to[0], y: P.to[1] }], t);
  burst(ctx, G0[0], G0[1], 96, (t - grab) / 0.45, { color: 'text' });
  hand(ctx, p[0], p[1], { down: t >= grab && t < end + 0.2 ? 1 : 0 });
  ctx.fx.shake = [7 * press * Math.sin((t - end) * 80), 0];
}

// ============================================================================================ Role: the balance
const BAL = { ground: 900, pivot: [880, 300], arm: 520, drop: 330, pan: 150 };

/**
 * As plates_pre2.js plateRole: P.grab (the pointer takes the right end of the beam), P.push (it starts to lift it),
 * P.s / P.m (the two letters sung: the left pan is down / the right pan is down), P.land (the pans come to rest),
 * P.values, P.from / P.to / P.until.
 */
export function plateBalance(ctx, env, P) {
  const { t, at, grab, push, land } = P, [va, vb] = P.values, a = flashIn(t, at), g = ctx.g, a0 = g.globalAlpha;
  const lit = clamp((t - P.s) * 30);
  sheet(ctx, [880, 520, 640, 'raised', 0.55 + 0.45 * lit]);
  ctx.fx.bright *= 1 + 0.09 * lit;
  // the beam: level; lifted at its right end from `push` so the left pan is down when the first letter is sung; then
  // pressed down so the right pan is down when the second is; at `land` the pans come to rest with one swing
  const TILT = 0.24, mid = lerp(P.s, P.m, 0.42);
  let th = t < push ? 0 : t < P.s ? -TILT * easeIn(prog(t, push, P.s)) : t < mid ? -TILT : t < P.m ? lerp(-TILT, TILT, easeInOut(prog(t, mid, P.m))) : TILT;
  th += t >= P.s && t < mid ? -0.03 * Math.exp(-14 * (t - P.s)) * Math.sin(40 * (t - P.s)) : 0;
  th += t >= P.m ? 0.05 * Math.exp(-6 * (t - P.m)) * Math.cos(16 * (t - P.m)) * (t >= land ? Math.exp(-8 * (t - land)) : 1) : 0;
  const [px, py] = BAL.pivot, end = (sgn) => [px + sgn * BAL.arm * Math.cos(th), py + sgn * BAL.arm * Math.sin(th)];
  const L = end(-1), Rr = end(1);
  g.globalAlpha = a0 * a;
  // the stand: a base and a post up to the pivot
  ctx.poly([[px - 190, BAL.ground], [px + 190, BAL.ground], [px + 70, BAL.ground - 60], [px - 70, BAL.ground - 60]], { close: true, fill: true, color: 'raised' });
  ctx.rect(px - 16 + 10, py + 10, 32, BAL.ground - 60 - py, { fill: true, color: 'bg' });
  ctx.rect(px - 16, py, 32, BAL.ground - 60 - py, { fill: true, color: 'raised' });
  ctx.line(60, BAL.ground, 1860, BAL.ground, { color: 'sub', width: 5 });
  // a pan hanging from one end: three cords and a shallow bowl; its letter in it (outline until sung)
  const pan = (E, str, sung) => {
    const bx = E[0], by = E[1] + BAL.drop, w = BAL.pan;
    for (const dx of [-w, 0, w]) ctx.line(E[0], E[1], bx + dx, by, { color: 'sub', width: 3 });
    letter(ctx, str, bx, by - 14, 230, t, sung, { pop: 0.14 });
    ctx.poly(Array.from({ length: 17 }, (_, i) => { const an = Math.PI * (i / 16); return [bx - Math.cos(an) * w * 1.08, by + Math.sin(an) * 46]; }), { close: true, fill: true, color: 'raised' });
    ctx.line(bx - w * 1.08, by, bx + w * 1.08, by, { color: 'sub', width: 5 });
  };
  pan(L, va, P.s);
  pan(Rr, vb, P.m);
  // the beam, its shadow plate, and her halo at the pivot (it does not turn with the beam)
  ctx.line(L[0] + 10, L[1] + 10, Rr[0] + 10, Rr[1] + 10, { color: 'bg', width: 22 });
  ctx.line(L[0], L[1], Rr[0], Rr[1], { color: 'text', width: 22 });
  for (const E of [L, Rr]) ctx.circle(E[0], E[1], 18, { fill: true, color: 'me' });
  spark(ctx, px, py, 92, { morph: 1, color: 'me', rot: th * 0.5, core: 0 });
  ctx.circle(px, py, 22, { fill: true, color: 'me' });
  burst(ctx, L[0], L[1] + BAL.drop - 100, 300, (t - P.s) / 0.4, { color: 'meDim', rays: 16 });
  burst(ctx, Rr[0], Rr[1] + BAL.drop - 100, 260, (t - P.m) / 0.36, { color: 'meDim', rays: 16 });
  g.globalAlpha = a0;
  caption(ctx, env, t, P.lines);
  // the pointer: it takes the right end of the beam, lifts it, presses it down, lets go and leaves
  const hold = [Rr[0] + 14, Rr[1] + 14];
  const p = t < grab ? along([{ t: at, x: P.from[0], y: P.from[1] }, { t: grab, x: hold[0], y: hold[1], go: grab - 0.5 }], t) : t < P.m + 0.2 ? hold : along([{ t: P.m + 0.2, x: hold[0], y: hold[1] }, { t: P.until, x: P.to[0], y: P.to[1] }], t);
  burst(ctx, Rr[0], Rr[1], 60, (t - grab) / 0.35, { color: 'sub' });
  hand(ctx, p[0], p[1], { down: t >= grab && t < P.m + 0.2 ? 1 : 0 });
  const wob = (since, amp, decay, f) => (since >= 0 ? amp * pulse(since, decay) * Math.sin(since * f) : 0);
  ctx.fx.shake = [wob(t - P.m, 8, 13, 80), wob(t - P.s, 10, 13, 80) + wob(t - land, 4, 12, 70)];
}

// ============================================================================================ Loop: the trance
const TR = { x: 660, y: 150, w: 600, h: 800 };

/** As plates_pre2.js plateTrance: P.steps (the two times the word is sung), P.settle = [from, to], P.log. */
export function plateTranceHL(ctx, env, P) {
  const { t, at } = P, a = flashIn(t, at), g = ctx.g;
  sheet(ctx, [960, 520, 600, 'raised', 0.8]);
  const settle = easeInOut(prog(t, P.settle[0], P.settle[1]));
  const d = (8 + 16 * (t - at) + P.steps.reduce((s, at2) => s + 56 * easeOut(prog(t, at2, at2 + 0.14)), 0)) * (1 - settle);
  const turn = 0.4 * (t - at), off = (k, ph) => [d * k * Math.cos(turn + ph), d * k * Math.sin(turn + ph)];
  if (a > 0) {
    const a0 = g.globalAlpha;
    g.globalAlpha = a0 * a;
    // the trance: rings going out from behind her head, and her halo turning there
    const h = lookPoint(env.art, 'bust', 'halo', TR);
    for (let i = 0; i < 7; i++) { const ph = (((t - at) * 0.9 + i / 7) % 1), r = 120 + 900 * ph; ctx.circle(h.cx, h.cy, r, { color: 'line', width: 6 * (1 - ph) + 1, alpha: 0.7 * (1 - ph) * (1 - settle) }); }
    ctx.circle(960, 500, 330, { fill: true, color: 'line', alpha: 0.45 });
    lookHalo(ctx, env, 'bust', TR, { color: 'me', rot: 0.6 * (t - at) * (1 - settle), alpha: 0.8 });
    if (t >= P.settle[1]) { drawLook(ctx, env, 'boy', TR); lookStar(ctx, env, 'boy', TR); }
    else for (const [look, ink, role, k, ph, al] of [['bust', 'cream', 'text', 1, 2.6, 1], ['tabby', 'orange', 'me', 0.8, 0.5, 1], ['boy', 'black', 'line', 0.9, -1.6, 0.8]]) {
      drawLook(ctx, env, look, TR, { plates: [{ ink, role, exact: true, offset: off(k, ph), alpha: al }] });
    }
    g.globalAlpha = a0;
  }
  caption(ctx, env, t, P.lines);
  if (P.log) ctx.text(`› ${P.log}`, 120, 1004, { size: 26, font: 'mono', color: 'sub', alpha: clamp((t - at) * 6) });
}

// ---------------------------------------------------------------------------------------------- check cards
export function labCards(env) {
  const v = (k) => (env.script.settings_rows?.section7 ?? [])[k]?.values ?? ['A', 'B'];
  const card = (fn, P) => ({ palette: 'warm', render: (ctx) => fn(ctx, env, { at: 0, lines: [], ...P }) });
  const day = (t) => card(plateStar, { t, grab: 1, drag: 2, top: 3, end: 4, am: 2.5, pm: 3.4, values: v(1), from: [1470, 944], to: [1500, 600], until: 5 });
  const role = (t) => card(plateBalance, { t, grab: 1, push: 1.5, s: 1.8, m: 2.5, land: 3, values: v(2), from: [1700, 800], to: [1700, 1000], until: 4 });
  const trance = (t) => card(plateTranceHL, { t, steps: [1.2, 2.1], settle: [2.5, 2.9], log: 'loop: on' });
  return {
    p2: [
      card(plateGenderHL, { t: 0.3, click: 1, values: v(0) }), card(plateGenderHL, { t: 1.4, click: 1, values: v(0) }),
      day(1.5), day(3), day(4.4),
      role(1.2), role(2), role(2.9),
      trance(0.6), trance(2.3), trance(3.2),
    ],
  };
}
