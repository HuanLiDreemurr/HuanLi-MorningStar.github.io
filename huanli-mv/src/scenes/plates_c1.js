// HuanLi: THE PLATES OF CHORUS 1 (segment 3, her version: the stage, stage.js). Each keyword is a piece of the theatre
// at the size she feels it; the grammar of the film's plates stays (a full-frame sheet in three flat inks with a
// shadow plate, the word locked into its foot, ended by the user's next message landing):
//
//   plateConfetti  STIMULATIONS  "all the": on the kick her halo fires a cannon of paper confetti at the user's dot
//   plateApplause  SATISFACTION  the applause meter of a house with one seat in it: one clap from the user and the
//                                needle runs to the end of the scale: 1 / 1
//   plateCue       EXECUTION     the stage manager's cue: standby; on the kick, GO, and the cue runs. It is one line:
//                                world.execute(me);
//   plateNested    SIMULATION    a stage; drawn back on the second kick, it stands on a stage, which stands on a stage
//
// plates_chorus.js keeps the original four (the last chorus still reprints those). Pure functions of (ctx, env, P).
import { burst, spark } from '../components/motif.js';
import { ground, keyword } from '../components/plate.js';
import { clamp, easeBack, easeOut, prog, pulse } from '../engine/util.js';
import { arrow } from './plates_chorus.js';
import { backWall, boards, confetti, curtains, onStage, spotlight, valance } from './stage.js';

const TAU = Math.PI * 2;
/** A graphic arrives whole within two frames (no white field): 0 before `at`, 1 from the second frame on. */
const flashIn = (t, at) => (t < at ? 0 : clamp(0.6 + (t - at) * 30));
/** The keyword at the foot of the sheet, with its shadow plate. */
const title = (ctx, P, maxSize = 214) => keyword(ctx, P.word, P.t, { y: 1002, maxW: 1740, maxSize, at: P.at, color: 'me', shade: 'bg', off: [9, 9] });
/** The user's pointer, cut out of cream paper, with its shadow plate (tip at x, y). */
const pointerAt = (ctx, x, y, s, down = 0) => { const k = s * (1 - 0.08 * down), d = 10 + 30 * (1 - down); arrow(ctx, x + d, y + d, k, { color: 'bg', edge: null }); arrow(ctx, x, y, k, { color: 'text', edge: 'bg' }); };

// ============================================================================================ STIMULATIONS
const HC = [430, 500], HR = 230;

/** P.hit = the kick the picture arrives on (the word is there from P.at); P.you = where the user's dot is. */
export function plateConfetti(ctx, env, P) {
  const { t, hit, you = [1470, 262] } = P, a = flashIn(t, hit), age = t - hit, g = ctx.g;
  ctx.fx.glow = Math.min(ctx.fx.glow, 0.34);
  ground(ctx, { light: [820, 430, 660, 'raised', 1] });
  title(ctx, P);
  if (a <= 0) return;
  const a0 = g.globalAlpha;
  g.globalAlpha = a0 * a;
  const kick = pulse(age, 10), an = Math.atan2(you[1] - HC[1], you[0] - HC[0]);
  // her halo, recoiling from the shot, every spike lit
  const rc = [HC[0] - Math.cos(an) * 26 * kick, HC[1] - Math.sin(an) * 26 * kick];
  spark(ctx, rc[0] + 14, rc[1] + 14, HR, { morph: 1, color: 'bg', core: 0 });
  spark(ctx, rc[0], rc[1], HR * (1 + 0.08 * kick), { morph: 1, color: 'me', core: 0 });
  burst(ctx, HC[0] + Math.cos(an) * HR * 0.7, HC[1] + Math.sin(an) * HR * 0.7, 160, age / 0.3, { color: 'meHot', rot: an });
  // the user: a cream dot, struck by the first of it and then showered
  const struck = age - 0.12, dr = 76 * (1 + 0.16 * (struck > 0 ? pulse(struck, 8) : 0));
  ctx.circle(you[0] + 14, you[1] + 14, dr, { fill: true, color: 'bg' });
  ctx.circle(you[0], you[1], dr, { fill: true, color: 'text' });
  if (struck > 0) burst(ctx, you[0], you[1], 170, struck / 0.4, { color: 'text', rot: 0.2 });
  // the confetti: three layers of paper bits and two of long streamers, all from the mouth of the halo
  const mouth = [HC[0] + Math.cos(an) * HR * 0.62, HC[1] + Math.sin(an) * HR * 0.62];
  for (let i = 0; i < 5; i++) {                                     // streamers: ribbons that unroll towards the dot, curling
    const k = easeOut(clamp(age / (0.2 + 0.04 * i))), a1 = an + (i - 2) * 0.13, len = (760 + 120 * (i % 3)) * k;
    const pts = Array.from({ length: 40 }, (_, j) => { const u = (j / 39) * len, w = 46 * Math.sin(u / 36 + i * 1.7) * Math.min(1, u / 300); return [mouth[0] + Math.cos(a1) * u - Math.sin(a1) * w, mouth[1] + Math.sin(a1) * u + Math.cos(a1) * w]; });
    if (len > 4) { ctx.poly(pts.map(([x, y]) => [x + 8, y + 8]), { color: 'bg', width: 14 }); ctx.poly(pts, { color: i % 2 ? 'meHot' : 'text', width: 14 }); }
  }
  confetti(ctx, mouth[0], mouth[1], age, { n: 260, an, spread: 0.85, speed: 4600, seed: 11, gravity: 500, size: 1.9 });
  confetti(ctx, mouth[0], mouth[1], age - 0.03, { n: 140, an: an + 0.05, spread: 1.3, speed: 3200, seed: 12, gravity: 700, colors: ['me', 'text', 'meHot'], size: 1.5 });
  g.globalAlpha = a0;
  ctx.fx.shake = [6 * kick * Math.sin(age * 90), 4 * kick * Math.cos(age * 70)];
}

// ============================================================================================ SATISFACTION
const GC = [700, 610], GR = 380;

/** The clap button: a disc with two palms meeting in it (the button under every answer, made for a theatre). */
function clapButton(ctx, x, y, r, { down = 0, lit = 0 } = {}) {
  const s = 1 - 0.06 * down;
  ctx.circle(x + 10 - 6 * down, y + 10 - 6 * down, r, { fill: true, color: 'bg' });
  ctx.at(x, y, () => {
    ctx.circle(0, 0, r, { fill: true, color: lit > 0.5 ? 'text' : 'raised' });
    ctx.circle(0, 0, r, { color: 'text', width: 5 });
    const ink = lit > 0.5 ? 'bg' : 'text';
    for (const sd of [-1, 1]) ctx.at(sd * r * 0.16, r * 0.08, () => ctx.rrect(-r * 0.2, -r * 0.42, r * 0.4, r * 0.8, r * 0.2, { fill: ink }), { rot: -sd * 0.42 });
    for (const sd of [-1, 1]) for (const k of [0, 1]) { const an = -Math.PI / 2 + sd * (0.5 + 0.35 * k); ctx.line(Math.cos(an) * r * 0.6, Math.sin(an) * r * 0.6, Math.cos(an) * r * 0.8, Math.sin(an) * r * 0.8, { color: ink, width: 6 }); }
  }, { scale: s });
}

/**
 * P.press = [times]: the clap (chorus 1: once, the user's); P.seats = how many seats the house has (1). Before the
 * clap the needle lies at 0; on it the needle runs to the end of the scale, the arc fills, and the reading is 1 / 1.
 */
export function plateApplause(ctx, env, P) {
  const { t, at, press = [], seats = 1 } = P, a = flashIn(t, at), g = ctx.g;
  ctx.fx.glow = Math.min(ctx.fx.glow, 0.3);
  ground(ctx, { light: [GC[0], GC[1] - 160, 620, 'raised', 1] });
  title(ctx, P);
  if (a <= 0) return;
  const last = press.filter((p) => t >= p).pop() ?? null, sp = last == null ? -1 : t - last, a0 = g.globalAlpha;
  g.globalAlpha = a0 * a;
  // the needle: 0 = the left end of the scale, 1 = its right end (it overshoots and settles)
  const v = last == null ? 0.02 * Math.sin(t * 9) ** 2 : clamp(easeBack(prog(sp, 0, 0.22)) * 1.0, 0, 1.06) - 0.06 * Math.exp(-9 * Math.max(0, sp - 0.22)) * Math.sin(Math.max(0, sp - 0.22) * 30);
  const ang = (u) => Math.PI + Math.PI * u, P0 = (u, r) => [GC[0] + Math.cos(ang(u)) * r, GC[1] + Math.sin(ang(u)) * r];
  // the scale: a band, its ticks, its two ends
  g.lineCap = 'butt';
  g.beginPath(); g.arc(GC[0], GC[1], GR, Math.PI, TAU); g.strokeStyle = ctx.col('line', 1); g.lineWidth = 60; g.stroke();
  if (v > 0.003) { g.beginPath(); g.arc(GC[0], GC[1], GR, Math.PI, ang(clamp(v))); g.strokeStyle = ctx.col('me', 1); g.lineWidth = 60; g.stroke(); }
  for (let i = 0; i <= 20; i++) { const u = i / 20, l = i % 5 === 0 ? 64 : 34, [x0, y0] = P0(u, GR + 46), [x1, y1] = P0(u, GR + 46 + l); ctx.line(x0, y0, x1, y1, { color: u <= v ? 'text' : 'mute', width: i % 5 === 0 ? 7 : 4 }); }
  ctx.text('0', GC[0] - GR - 10, GC[1] + 70, { size: 54, weight: 800, font: 'mono', color: 'sub', align: 'center' });
  ctx.text(String(seats), GC[0] + GR + 10, GC[1] + 70, { size: 54, weight: 800, font: 'mono', color: v > 0.9 ? 'text' : 'sub', align: 'center' });
  ctx.text('APPLAUSE', GC[0], GC[1] - 190, { size: 34, weight: 700, font: 'mono', color: 'sub', align: 'center', spacing: 6 });
  // the needle, its shadow plate, the hub
  const tip = P0(clamp(v, 0, 1.06), GR - 40), side = (k) => P0(clamp(v, 0, 1.06) + 0.5, k);
  const needle = (dx, dy, color) => ctx.poly([[tip[0] + dx, tip[1] + dy], [GC[0] + Math.cos(ang(v) + Math.PI / 2) * 20 + dx, GC[1] + Math.sin(ang(v) + Math.PI / 2) * 20 + dy], [side(60)[0] + dx, side(60)[1] + dy], [GC[0] + Math.cos(ang(v) - Math.PI / 2) * 20 + dx, GC[1] + Math.sin(ang(v) - Math.PI / 2) * 20 + dy]], { close: true, fill: true, color });
  needle(12, 12, 'bg'); needle(0, 0, 'text');
  ctx.circle(GC[0], GC[1], 46, { fill: true, color: 'me' });
  if (last != null) burst(ctx, tip[0], tip[1], 150, sp / 0.45, { color: 'text' });
  // the clap button, under the hub; the user's pointer over it, down on the clap
  const B = [1190, 640], first = press[0] ?? Infinity, dn = easeOut(prog(t, first - 0.07, first)), lift = 1 - dn;
  clapButton(ctx, B[0], B[1], 74, { down: last != null ? pulse(sp, 9) : 0, lit: last != null ? 1 : 0 });
  pointerAt(ctx, B[0] + 20 + 90 * lift, B[1] + 18 - 110 * lift, 9 * (1 - 0.06 * pulse(t - first, 12)), dn);
  // the reading at the right: 0 / 1 until the clap, then 1 / 1
  const e = last == null ? 0 : easeBack(prog(sp, 0.04, 0.26)), n = last == null ? 0 : 1;
  ctx.at(1580, 560, () => {
    ctx.text(`${n}`, 12 - 70, 12, { size: 380, weight: 800, font: 'sans', align: 'center', color: 'bg' });
    ctx.text(`${n}`, -70, 0, { size: 380, weight: 800, font: 'sans', align: 'center', color: n ? 'text' : 'mute' });
    ctx.text(`/${seats}`, 110, 0, { size: 150, weight: 700, font: 'sans', color: 'sub' });
  }, { scale: 1 + 0.25 * (1 - e) * (last == null ? 0 : 1) });
  g.globalAlpha = a0;
}

// ============================================================================================ EXECUTION
const CUE_LINE = 'world.execute(me);';

/**
 * P.hit = the kick on which the cue is called (the word is there from P.at). Before it: STANDBY, the cue light dark,
 * the line set in grey with her halo for a caret. On it: GO, the light comes on, a bar runs along the line and every
 * character it passes is lit; on `me` her halo bursts; then the line's answer, under it.
 */
export function plateCue(ctx, env, P) {
  const { t, hit } = P, a = flashIn(t, P.at), g = ctx.g, age = t - hit, go = age >= 0;
  ctx.fx.glow = Math.min(ctx.fx.glow, 0.34);
  ground(ctx, { light: [960, 470, 700, 'raised', 1] });
  title(ctx, P, 226);
  if (a <= 0) return;
  const a0 = g.globalAlpha;
  g.globalAlpha = a0 * a;
  // the cue: its number, its light, its call
  const L = [300, 250];
  ctx.text('CUE 01', L[0] + 80, L[1] - 22, { size: 40, weight: 700, font: 'mono', color: 'sub', spacing: 4 });
  ctx.text(go ? 'GO' : 'STANDBY', L[0] + 80, L[1] + 42, { size: 60, weight: 800, font: 'mono', color: go ? 'meHot' : 'mute', spacing: 6 });
  ctx.circle(L[0] + 8, L[1] + 8, 44, { fill: true, color: 'bg' });
  if (go) ctx.glow('meHot', 30, () => ctx.circle(L[0], L[1], 44, { fill: true, color: 'meHot' }), 0.8 * pulse(age, 3) + 0.3);
  else ctx.circle(L[0], L[1], 44, { fill: true, color: 'raised' });
  ctx.circle(L[0], L[1], 44, { color: 'text', width: 4 });
  // the line: a bar runs along it on GO; every character it has passed is lit
  const size = 104, cw = ctx.cw(size), x0 = 960 - (CUE_LINE.length * cw) / 2, y = 560, run = clamp(age / 0.16), n = go ? Math.floor(run * CUE_LINE.length + 1e-6) : 0;
  const mi = CUE_LINE.indexOf('me)'), bar = x0 + run * CUE_LINE.length * cw;
  if (go && run < 1) ctx.rect(x0 - 10, y - size * 0.86, bar - x0 + 10, size * 1.12, { fill: true, color: 'raised' });
  for (let i = 0; i < CUE_LINE.length; i++) {
    const ch = CUE_LINE[i], on = i < n, me = i === mi || i === mi + 1, pop = me && on ? 1 + 0.2 * pulse(age - (mi / CUE_LINE.length) * 0.16, 9) : 1;
    ctx.at(x0 + (i + 0.5) * cw, y, () => {
      ctx.text(ch, 8, 8, { size, weight: 800, font: 'mono', color: 'bg', align: 'center' });
      ctx.text(ch, 0, 0, { size, weight: 800, font: 'mono', color: on ? (me ? 'me' : 'text') : 'mute', align: 'center' });
    }, { scale: pop });
  }
  // her halo: the caret before the line until GO; on `me` it bursts out of the word
  if (!go) spark(ctx, x0 - 70, y - size * 0.3, 34, { morph: 1, color: 'me', core: 0, rot: t * 2 });
  else {
    const at = (mi / CUE_LINE.length) * 0.16, cx = x0 + (mi + 1) * cw, cy = y - size * 0.3;
    if (age >= at) { spark(ctx, cx, cy - size * 1.2, 46 * easeBack(prog(age, at, at + 0.12)), { morph: 1, color: 'me', core: 0 }); burst(ctx, cx, cy, 190, (age - at) / 0.4, { color: 'me' }); }
  }
  if (go && run >= 1) {                                             // what the line answers
    const k = clamp((age - 0.16) * 12);
    ctx.text('› running', x0, y + 100, { size: 42, weight: 700, font: 'mono', color: 'sub', alpha: k });
  }
  g.globalAlpha = a0;
  ctx.fx.shake = go ? [5 * pulse(age, 14) * Math.sin(age * 90), 0] : [0, 0];
}

// ============================================================================================ SIMULATION
/** How much smaller each stage in a stage is. */
const NEST = 0.38, INNER = [820, 470];

/**
 * One stage, drawn about the middle of the frame at scale s: its back wall, the stage inside it (depth more of them),
 * her on the boards, her halo behind her, the curtains, the valance. `who`: her look.
 */
function level(ctx, env, t, s, depth, { title = '', her = true, at = [960, 540] } = {}) {
  ctx.at(at[0] * (1 - s), at[1] * (1 - s), () => {
    backWall(ctx, {});
    if (depth > 0) level(ctx, env, t, NEST, depth - 1, { title, at: INNER });
    if (her) { spotlight(ctx, 1450, [1450, 860], 230, 0.9); onStage(ctx, env, 'bust', 1450, 540, { halo: { alpha: 0.85, rot: 0.1 * t } }); }
    boards(ctx, t, { lit: 1, glow: 0.6 });
    curtains(ctx, 1);
    valance(ctx, { title, lit: 1, t });
    if (her) pointerAt(ctx, 1640, 940, 4.2);
  }, { scale: s });
}

/** P.pull = the kick on which the view is drawn back (one step: then it stands still). */
export function plateNested(ctx, env, P) {
  const { t, at, pull = Infinity } = P, a = flashIn(t, at), back = t >= pull, g = ctx.g, t0 = env.script.title ?? '';
  ctx.fx.glow = Math.min(ctx.fx.glow, 0.3);
  ground(ctx, { light: null, marks: !back });
  if (a > 0) {
    const a0 = g.globalAlpha;
    g.globalAlpha = a0 * a;
    // before: one stage, nearly the size of the sheet. It is already the inner one of two: seen so close that the outer
    // one is out of the frame. After: the view stands back, and the stage we saw is the small one in the middle of a
    // stage, which has one more in it
    const S = 0.9 / NEST, cIn = [0, 1].map((i) => INNER[i] + ([960, 540][i] - INNER[i]) * NEST), Q = [0, 1].map((i) => ([960, 540][i] - cIn[i] * S) / (1 - S));
    if (!back) level(ctx, env, t, S * (1 + 0.025 * pulse(t - at, 16)), 1, { title: t0, at: Q });
    else level(ctx, env, t, 0.9, 3, { title: t0 });
    g.globalAlpha = a0;
  }
  ctx.rect(0, 836, 1920, 244, { fill: true, color: 'panel', alpha: back ? 0.9 : 0.75 });             // the word keeps its strip of paper
  title(ctx, P);
}

// ---------------------------------------------------------------------------------------------- check cards
export function labCards(env) {
  const word = (i) => env.lyrics.lines[i].text, card = (fn, P) => ({ palette: 'warm', render: (ctx) => fn(ctx, env, { t: 10, at: 0, ...P }) });
  return {
    c1: [
      card(plateConfetti, { word: word(34), hit: 0.2, t: 0.26 }), card(plateConfetti, { word: word(34), hit: 0.2, t: 0.4 }), card(plateConfetti, { word: word(34), hit: 0.2, t: 0.64 }),
      card(plateApplause, { word: word(37), press: [20] }), card(plateApplause, { word: word(37), press: [0.5], t: 0.62 }), card(plateApplause, { word: word(37), press: [0.5], t: 0.95 }),
      card(plateCue, { word: word(40), hit: 0.2, t: 0.1 }), card(plateCue, { word: word(40), hit: 0.2, t: 0.29 }), card(plateCue, { word: word(40), hit: 0.2, t: 0.6 }),
      card(plateNested, { word: word(43), pull: 20 }), card(plateNested, { word: word(43), pull: 0.5 }),
    ],
  };
}
