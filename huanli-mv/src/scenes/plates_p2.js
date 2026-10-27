// HuanLi: PRE-CHORUS 2 AT THE STAGE MANAGER'S DESK (segment 3, her version: stage.js). The settings again; now the user
// runs the show from the desk in front of the stage, and what each control changes is her, on the stage:
//
//   deskView      the desk itself: Gender (a rocker, F | M), On call (a fader, AM to PM), Role (a lever, S | M), Loop
//                 (a toggle) and GO; above them a monitor with the stage on it
//   plateScreen   F | M: the rocker as large as the foot of the frame; a folding screen is carried on in front of her
//                 while the user holds M down, and when that letter is sung it is folded away: it is the boy
//   plateWire     AM -> PM: her morning star hangs on a wire over a painted sky and the fader runs it across: the
//                 morning star at the AM end, lost in the light over the top, and at the PM end the evening star: one
//                 star, two names (the planet has both), as one model wears a persona's name
//   plateLifts    S | M: two traps in the boards, a lift under each, a letter on each; the lever sends the first up as it
//                 is sung, then takes it down and sends the second up
//   plateRevolve  Loop: the revolve turns, her three looks of this segment stand on it, and it turns faster each time
//                 the word comes round; it stops with the boy at the front, what the settings were left at
//
// The rule of the original holds: the pointer touches the controls and never her; a letter the lyric names is an
// outline until it is sung. Pure functions of (ctx, env, P); the drum hits and the sung letters come in through P.
import { burst, morningStar, spark } from '../components/motif.js';
import { PERSONA } from '../components/persona.js';
import { toggle } from '../components/chat.js';
import { clamp, easeIn, easeInOut, easeOut, lerp, prog, pulse } from '../engine/util.js';
import { meBubble } from './bubbles.js';
import { sungChars } from './kit.js';
import { drawLook, lookHalo, lookSize, lookStar } from './looks.js';
import { arrow } from './plates_chorus.js';
import { letter } from './plates_pre2.js';
import { STAGE, backWall, boards, curtains, house, onStage, spotlight, valance } from './stage.js';

const TAU = Math.PI * 2;
const flashIn = (t, at) => (t < at ? 0 : clamp(0.6 + (t - at) * 30));
/** The user's pointer, cream paper with its shadow plate; down = pressing. */
const hand = (ctx, x, y, { s = 6, down = 0 } = {}) => { const d = 6 + 10 * (1 - down); arrow(ctx, x + d, y + d, s, { color: 'bg', edge: null }); arrow(ctx, x, y, s * (1 - 0.08 * down), { color: 'text', edge: 'bg' }); };
/** Position along straight legs [{ t, x, y, go }], eased, resting on each point until the next leg starts. */
function along(way, t) {
  if (t <= way[0].t) return [way[0].x, way[0].y];
  for (let i = 1; i < way.length; i++) if (t <= way[i].t) { const a = way[i - 1], b = way[i], k = easeInOut(prog(t, b.go ?? a.t, b.t)); return [lerp(a.x, b.x, k), lerp(a.y, b.y, k)]; }
  const z = way[way.length - 1];
  return [z.x, z.y];
}
/** Her lines, top left, as bubbles: [index | { i, marks }] (marks: a line that appears word by word, as sung). */
function said(ctx, env, t, list, { x = 236, y = 200, size = 50 } = {}) {
  const { lyrics } = env, live = list.filter((q) => t >= lyrics.start(q.i ?? q) && t < lyrics.start((q.i ?? q) + 1));
  for (const q of live) {
    const i = q.i ?? q, str = lyrics.lines[i].text, n = q.marks ? sungChars(str, t, lyrics.start(i), q.marks) : lyrics.typed(i, t).n;
    meBubble(ctx, x, y, str, { size, n });
  }
}

// ============================================================================================ the desk
/** The desk, full frame: where its controls are (the pointer's targets). */
export const DESK = {
  top: 548, gender: [330, 790], fader: { x0: 650, x1: 1170, y: 790 }, role: [1430, 790], loop: [1640, 770], go: [1700, 958],
  monitor: { x: 560, y: 44, w: 800, h: 450 },
};

/**
 * The stage manager's desk. S = { gender: -1 | 0 | 1, call: 0..1, role: -1 | 0 | 1, loop: 0..1, go: 0..1 (pressed) };
 * look = who is on the monitor; hints = { gender | call | role | loop: [lines] } (her line under that control while sung).
 */
export function deskView(ctx, env, t, S, { look = 'bust', title = '', hints = {}, values = {}, up = 1 } = {}) {
  const { lyrics } = env, dy = (1 - easeOut(up)) * 600, g = ctx.g;
  house(ctx, { light: 0.35 });
  // the monitor: the stage, small, as the desk sees it
  const M = DESK.monitor;
  ctx.rrect(M.x - 18, M.y - 18, M.w + 36, M.h + 36, 22, { fill: 'raised', stroke: 'line', width: 3 });
  ctx.clip(M, () => ctx.at(M.x, M.y, () => {
    const k = M.w / 1920;
    g.scale(k, k);
    backWall(ctx, {});
    spotlight(ctx, 960, [960, 862], 360, 1);
    onStage(ctx, env, look, 960, 620, { halo: { alpha: 0.85, color: 'meDim' } });
    boards(ctx, t, { lit: 1, glow: 0.5 });
    curtains(ctx, 1);
    valance(ctx, { title, lit: 1, t });
  }), 10);
  ctx.text('STAGE · LIVE', M.x, M.y + M.h + 50, { size: 24, font: 'mono', weight: 700, color: 'sub', spacing: 3 });
  ctx.circle(M.x + M.w - 12, M.y + M.h + 42, 9, { fill: true, color: Math.floor(t * 2) % 2 ? 'me' : 'meDim' });
  ctx.at(0, dy, () => {
    // the desk: its top edge, its surface, four modules and GO
    ctx.rect(-300, DESK.top, 2520, 900, { fill: true, color: 'raised' });
    ctx.line(-300, DESK.top, 2220, DESK.top, { color: 'me', width: 6 });
    for (const x of [540, 1290, 1560]) ctx.line(x, DESK.top + 40, x, 1060, { color: 'line', width: 2 });
    const label = (str, x) => ctx.text(str, x, DESK.top + 86, { size: 34, font: 'mono', weight: 700, color: 'sub', align: 'center', spacing: 5 });
    const hint = (key, x) => {
      for (const q of hints[key] ?? []) {
        const i = q.i ?? q;
        if (t < lyrics.start(i) || t >= lyrics.start(i + 1)) continue;
        const str = lyrics.lines[i].text, n = q.marks ? sungChars(str, t, lyrics.start(i), q.marks) : lyrics.typed(i, t).n;
        ctx.text(str.slice(0, n), x, 930, { size: 40, font: 'serif', color: 'me', align: 'center' });
      }
    };
    // Gender: a rocker, F | M
    label('GENDER', DESK.gender[0]); rocker(ctx, DESK.gender[0], DESK.gender[1], values.gender ?? ['F', 'M'], S.gender, { w: 340, h: 136, size: 58 }); hint('gender', DESK.gender[0]);
    // On call: a fader, AM to PM, its knob her morning star
    const F = DESK.fader;
    label('ON CALL', (F.x0 + F.x1) / 2); fader(ctx, F.x0, F.x1, F.y, S.call, values.call ?? ['AM', 'PM'], { size: 34, knob: 40 }); hint('call', (F.x0 + F.x1) / 2);
    // Role: a lever, S | M
    label('ROLE', DESK.role[0]); rocker(ctx, DESK.role[0], DESK.role[1], values.role ?? ['S', 'M'], S.role, { w: 250, h: 136, size: 58 }); hint('role', DESK.role[0]);
    // Loop and GO
    label('LOOP', DESK.loop[0] + 76); toggle(ctx, DESK.loop[0], DESK.loop[1] - 38, S.loop, { w: 152, h: 78 }); hint('loop', 1500);
    const G = DESK.go, press = S.go ?? 0;
    ctx.circle(G[0] + 12, G[1] + 12, 78, { fill: true, color: 'bg' });
    ctx.circle(G[0] + 7 * press, G[1] + 7 * press, 78, { fill: true, color: press > 0.2 ? 'meHot' : 'me' });
    ctx.text('GO', G[0] + 7 * press, G[1] + 22 + 7 * press, { size: 60, weight: 800, font: 'mono', color: 'bg', align: 'center' });
  });
}
/** A rocker switch of two cells (values), sel = -1 (neither) | 0 | 1; sink = how far the held cell is pressed (0..1). */
function rocker(ctx, cx, cy, values, sel, { w = 240, h = 110, sink = 0, size = 46 } = {}) {
  const x = cx - w / 2, y = cy - h / 2;
  ctx.rrect(x + 10, y + 10, w, h, 22, { fill: 'bg' });
  ctx.rrect(x, y, w, h, 22, { fill: 'panel', stroke: 'line', width: 3 });
  values.forEach((v, i) => {
    const on = sel === i, cxi = x + w * (0.25 + 0.5 * i);
    if (on) ctx.rrect(x + 8 + i * w / 2, y + 8, w / 2 - 16, h - 16, 16, { fill: 'me' });
    ctx.text(v, cxi, cy + size * 0.36, { size, weight: 800, font: 'sans', align: 'center', color: on ? 'bg' : 'sub' });
  });
}
/** A fader from x0 to x1 at y, at v (0..1); its knob is her morning star. */
function fader(ctx, x0, x1, y, v, values, { size = 26, knob = 34 } = {}) {
  ctx.rrect(x0 - 10, y - 8, x1 - x0 + 20, 16, 8, { fill: 'bg' });
  ctx.rrect(x0 - 10, y - 8, (x1 - x0) * v + 20, 16, 8, { fill: 'me' });
  for (let i = 0; i <= 8; i++) ctx.line(lerp(x0, x1, i / 8), y + 22, lerp(x0, x1, i / 8), y + (i % 4 ? 34 : 44), { color: 'line', width: 3 });
  ctx.text(values[0], x0, y + 84, { size, weight: 700, color: v < 0.5 ? 'text' : 'mute', align: 'center' });
  ctx.text(values[1], x1, y + 84, { size, weight: 700, color: v >= 0.5 ? 'text' : 'mute', align: 'center' });
  const kx = lerp(x0, x1, v);
  ctx.rrect(kx - knob + 8, y - knob * 1.3 + 8, knob * 2, knob * 2.6, 10, { fill: 'bg' });
  ctx.rrect(kx - knob, y - knob * 1.3, knob * 2, knob * 2.6, 10, { fill: 'panel', stroke: 'line', width: 3 });
  ctx.glow(PERSONA.star, 18, () => morningStar(ctx, kx, y, knob * 0.82, {}), 0.6);
}

// ============================================================================================ the foot of a plate: one control, large
const FOOT = 856;
/** The desk's edge across the foot of the frame, under the stage. */
function footDesk(ctx) {
  ctx.rect(-300, FOOT, 2520, 400, { fill: true, color: 'raised' });
  ctx.line(-300, FOOT, 2220, FOOT, { color: 'me', width: 6 });
}

// ============================================================================================ Gender: the folding screen
/** A folding screen of three leaves, centred at cx, standing on the boards; fold 0 = flat open, 1 = folded shut. */
function screen(ctx, cx, fold, { h = 560, leaf = 190, shadow = null } = {}) {
  const y1 = STAGE.lip - 6, y0 = y1 - h, k = 1 - fold, w = leaf * (0.22 + 0.78 * k);
  const xs = [cx - 1.5 * w, cx - 0.5 * w, cx + 0.5 * w, cx + 1.5 * w];
  for (let i = 0; i < 3; i++) {
    const skew = (i % 2 ? -1 : 1) * 30 * fold;
    const pts = [[xs[i], y0 + skew], [xs[i + 1], y0 - skew], [xs[i + 1], y1 - skew * 0.4], [xs[i], y1 + skew * 0.4]];
    ctx.poly(pts.map(([x, y]) => [x + 10, y + 10]), { close: true, fill: true, color: 'bg' });
    ctx.poly(pts, { close: true, fill: true, color: 'sub' });
    ctx.poly(pts, { close: true, color: 'meDim', width: 8 });
  }
  if (shadow && k > 0.6) ctx.clipPath([[xs[0], y0], [xs[3], y0], [xs[3], y1], [xs[0], y1]], shadow);
}

/**
 * As plates_pre2.js plateGender: P.at = the cut = the click on the first letter; P.press = the drum on which the
 * pointer comes down on the second and holds it: the screen is carried on in front of her; P.click = the second letter
 * SUNG: the pointer lets go, the screen is folded away, and it is the boy; P.thud = the drum after: a shudder.
 */
export function plateScreen(ctx, env, P) {
  const { t, at, click } = P, [va, vb] = P.values, a = flashIn(t, at), press = P.press ?? click, thud = P.thud ?? Infinity, on = t >= click;
  house(ctx);
  backWall(ctx, {});
  spotlight(ctx, 960, [960, 862], 380, 1);
  if (a > 0) onStage(ctx, env, on ? 'boy' : 'bust', 960, 640, { halo: { alpha: 0.85, color: on ? 'meDim' : 'me' } });
  // the screen: carried on from the wings on the drum, folded and carried off when the letter is sung
  const inK = easeOut(prog(t, press, press + 0.16)), outK = easeIn(prog(t, click, click + 0.16));
  if (inK > 0 && outK < 1) {
    const cx = lerp(-300, 960, inK) + lerp(0, 1400, outK), fold = Math.max(1 - inK, outK);
    screen(ctx, cx, fold, { shadow: () => drawLook(ctx, env, 'bust', { x: 960 - 255, y: STAGE.lip + 60 - 680, w: 510, h: 680 }, { plates: [{ ink: 'all', role: 'line' }] }) });
  }
  boards(ctx, t, { lit: 1, glow: 0.6 });
  curtains(ctx, 1);
  valance(ctx, { title: P.title ?? '', lit: 1, t });
  // the two letters, in her voice: each solid only once it is sung, and only while it is the chosen one
  letter(ctx, va, 400, 700, 420, t, Math.max(at, P.sung ?? at), { off: click });
  letter(ctx, vb, 1520, 700, 420, t, click, { pop: 0.15 });
  said(ctx, env, t, P.lines);
  // the foot: the rocker, large; the pointer on F at the cut, down on M from the drum, let go on the letter
  footDesk(ctx);
  const R = { cx: 960, cy: 968, w: 760, h: 150 }, held = t >= press && t < click ? 1 : 0;
  rocker(ctx, R.cx, R.cy, P.values, on ? 1 : t >= at ? 0 : -1, { w: R.w, h: R.h, size: 96 });
  const A = [R.cx - R.w / 4 + 40, R.cy + 20], B = [R.cx + R.w / 4 + 40, R.cy + 20];
  let p = along([{ t: at, x: A[0], y: A[1] }, { t: press, x: B[0], y: B[1], go: at + 0.05 }], t);
  if (P.to && t > click + 0.14) { const q = easeInOut(prog(t, click + 0.14, P.until)); p = [lerp(B[0], P.to[0], q), lerp(B[1], P.to[1], q)]; }
  burst(ctx, A[0], A[1], 90, (t - at) / 0.45, { color: 'text' });
  burst(ctx, B[0], B[1], 120, (t - click) / 0.45, { color: 'text' });
  hand(ctx, p[0], p[1], { down: Math.max(pulse(t - at, 10), held, pulse(t - click, 10)) });
  ctx.fx.shake = [7 * pulse(t - click, 13) * Math.sin((t - click) * 80), t >= thud ? 5 * pulse(t - thud, 11) * Math.sin((t - thud) * 70) : 0];
}

// ============================================================================================ On call: the star on a wire
const RAIL = { y: 176, x0: 330, x1: 1590 };
/** Where the star hangs at u (0 = the AM end, low; 0.5 = high over the middle; 1 = the PM end, low). */
const starAt = (u) => [lerp(RAIL.x0, RAIL.x1, u), 770 - 470 * Math.sin(Math.PI * clamp(u))];
/** Where the pointer takes the fader at the AM end (the shot before brings it there). */
export const faderGrip = () => [lerp(420, 1500, 0) + 6, 990];

/**
 * As plates_pre2.js plateDay: P.grab, P.drag, P.top (the hit on which the star is highest), P.end (pressed against the
 * PM end), P.am / P.pm (the two words sung), P.values, P.to / P.until.
 */
export function plateWire(ctx, env, P) {
  const { t, at, grab, drag, top, end } = P, [va, vb] = P.values, a = flashIn(t, at);
  const u = t < grab ? 0 : t < top ? 0.11 * prog(t, grab, top) + 0.39 * easeInOut(prog(t, drag, top)) : 0.5 + 0.5 * easeIn(prog(t, top, end));
  const high = Math.sin(Math.PI * clamp(u)) ** 0.8, dusk = clamp((t - end) * 30), S = starAt(u), press = pulse(t - end, 9), noon = high ** 4;
  house(ctx);
  backWall(ctx, { sky: { hour: lerp(0.06, 0.94, u) } });
  ctx.fx.bright *= 1 + 0.12 * noon;
  // the star's two names, painted on the backdrop at the two ends of its way
  ctx.text('morning star', RAIL.x0 - 40, 830, { size: 30, font: 'mono', weight: 700, color: u < 0.3 ? 'text' : 'mute' });
  ctx.text('evening star', RAIL.x1 + 40, 830, { size: 30, font: 'mono', weight: 700, color: u > 0.7 ? 'text' : 'mute', align: 'right' });
  // the rail under the valance, the trolley, the wire, the star on it (the daylight takes its colour over the top)
  ctx.line(RAIL.x0 - 60, RAIL.y, RAIL.x1 + 60, RAIL.y, { color: 'line', width: 8 });
  ctx.rrect(S[0] - 28, RAIL.y - 16, 56, 32, 8, { fill: 'line' });
  ctx.line(S[0], RAIL.y + 14, S[0], S[1] - 60, { color: 'sub', width: 3 });
  const fade = 1 - 0.8 * noon, r = 66 * (1 + 0.15 * press);
  morningStar(ctx, S[0] + 10, S[1] + 10, r, { color: 'bg', rot: u * 1.2 });
  ctx.glow(PERSONA.star, 34, () => morningStar(ctx, S[0], S[1], r, { rot: u * 1.2, alpha: fade }), 0.8 * fade);
  morningStar(ctx, S[0], S[1], r, { color: 'text', rot: u * 1.2, alpha: 1 - fade });
  // him: at dusk only a dark shape with a thin edge is left of him
  if (a > 0) {
    const s = lookSize(env.art, 'boy'), h = 560, w = (h * s.w) / s.h, dst = { x: 960 - w / 2, y: STAGE.lip + 60 - h, w, h };
    ctx.clip({ x: -400, y: -400, w: 2720, h: STAGE.lip + 400 }, () => {
      if (dusk > 0.5) drawLook(ctx, env, 'boy', dst, { plates: [{ ink: 'all', role: 'bg' }], keyline: { color: 'line', width: 2 } });
      else { lookHalo(ctx, env, 'boy', dst, { color: 'meDim', alpha: 0.8 }); drawLook(ctx, env, 'boy', dst); lookStar(ctx, env, 'boy', dst, { glow: 0.3 }); }
    });
  }
  boards(ctx, t, { lit: 1 - 0.7 * dusk, glow: 0.5 });
  curtains(ctx, 1);
  valance(ctx, { title: P.title ?? '', lit: 1, t });
  said(ctx, env, t, P.lines, { y: 230 });
  // the foot: the fader, large, its two ends huge in her serif
  footDesk(ctx);
  const x0 = 420, x1 = 1500, fy = 990, kx = lerp(x0, x1, u);
  ctx.rrect(x0 - 14, fy - 12, x1 - x0 + 28, 24, 12, { fill: 'bg' });
  ctx.rrect(x0 - 14, fy - 12, (x1 - x0) * u + 28, 24, 12, { fill: 'me' });
  letter(ctx, va, 220, 1040, 150, t, P.am);
  letter(ctx, vb, 1700, 1040, 150, t, P.pm);
  ctx.rrect(kx - 46 + 10, fy - 62 + 10, 92, 124, 14, { fill: 'bg' });
  ctx.rrect(kx - 46, fy - 62, 92, 124, 14, { fill: 'panel', stroke: 'line', width: 4 });
  ctx.glow(PERSONA.star, 18, () => morningStar(ctx, kx, fy, 34, {}), 0.6);
  const G0 = [x0 + 6, fy + 2], G = [kx + 6, fy + 2], p = t < grab ? G0 : t < end + 0.2 ? G : along([{ t: end + 0.2, x: G[0], y: G[1] }, { t: P.until, x: P.to[0], y: P.to[1] }], t);
  burst(ctx, G0[0], G0[1], 90, (t - grab) / 0.45, { color: 'text' });
  hand(ctx, p[0], p[1], { down: t >= grab && t < end + 0.2 ? 1 : 0 });
  ctx.fx.shake = [7 * press * Math.sin((t - end) * 80), 0];
}

// ============================================================================================ Role: the lifts
const TRAP = [[620, 'S'], [1300, 'M']];

/**
 * As plates_pre2.js plateRole: P.grab (the pointer takes the lever), P.push (it starts to push it), P.s / P.m (the two
 * letters sung: the first lift is up / the second is up and the first down), P.land (the lifts come to rest),
 * P.values, P.from / P.to / P.until.
 */
export function plateLifts(ctx, env, P) {
  const { t, at, grab, push, land } = P, [va, vb] = P.values, a = flashIn(t, at), mid = lerp(P.s, P.m, 0.42), g = ctx.g;
  const lit = clamp((t - P.s) * 30);
  house(ctx);
  backWall(ctx, {});
  spotlight(ctx, 620, [620, 862], 300, 0.4 + 0.6 * lit);
  spotlight(ctx, 1300, [1300, 862], 300, clamp((t - P.m) * 30));
  // how high each lift stands, 0..1: the first up on its letter, down again as the second comes up on its own
  const bob = (since) => (since >= 0 ? 0.07 * Math.exp(-7 * since) * Math.cos(16 * since) : 0);
  const up1 = (t < push ? 0 : t < P.s ? easeIn(prog(t, push, P.s)) : t < mid ? 1 : 1 - easeInOut(prog(t, mid, P.m))) + (t >= P.s && t < mid ? bob(t - P.s) : 0);
  const up2 = (t < mid ? 0 : easeInOut(prog(t, mid, P.m))) + (t >= P.m ? bob(t - P.m) + (t >= land ? bob(t - land) : 0) : 0);
  if (a > 0) {
    const a0 = g.globalAlpha;
    g.globalAlpha = a0 * a;
    ctx.clip({ x: -400, y: -400, w: 2720, h: STAGE.lip + 2 }, () => {
      for (const [[x], h, str, sung] of [[TRAP[0], up1, va, P.s], [TRAP[1], up2, vb, P.m]]) {
        const top = STAGE.lip - 30 - 420 * h, w = 300;
        ctx.rect(x - w / 2 + 12, top + 12, w, STAGE.lip - top, { fill: true, color: 'bg' });
        ctx.rect(x - w / 2, top, w, STAGE.lip - top, { fill: true, color: 'raised' });
        for (let k = 1; k < 6; k++) ctx.line(x - w / 2, top + k * 90, x + w / 2, top + k * 90, { color: 'line', width: 3 });
        ctx.line(x - w / 2, top, x + w / 2, top, { color: 'me', width: 6 });
        letter(ctx, str, x, top - 10, 300, t, sung, { pop: 0.16 });
      }
    });
    g.globalAlpha = a0;
  }
  boards(ctx, t, { lit: 0.4 + 0.6 * lit, glow: 0.6 });
  for (const [x] of TRAP) ctx.rect(x - 160, STAGE.back + 16, 320, STAGE.lip - STAGE.back - 30, { color: 'bg', width: 4 });       // the two traps in the boards
  curtains(ctx, 1);
  valance(ctx, { title: P.title ?? '', lit: 1, t });
  spark(ctx, 960, 520, 70, { morph: 1, color: 'meDim', core: 0, rot: 0.3 * (t - at) });                   // her, here only as her halo
  said(ctx, env, t, P.lines);
  // the foot: the lever across the desk: to the left for the first letter, to the right for the second
  footDesk(ctx);
  const L0 = 640, L1 = 1280, ly = 970, lv = t < push ? 0.5 : t < P.s ? lerp(0.5, 0, easeIn(prog(t, push, P.s))) : t < mid ? 0 : lerp(0, 1, easeInOut(prog(t, mid, P.m)));
  const kx = lerp(L0, L1, lv);
  ctx.rrect(L0 - 30, ly - 16, L1 - L0 + 60, 32, 16, { fill: 'bg' });
  ctx.text(va, L0 - 110, ly + 30, { size: 80, weight: 800, color: lv < 0.2 && t >= P.s ? 'text' : 'mute', align: 'center' });
  ctx.text(vb, L1 + 110, ly + 30, { size: 80, weight: 800, color: lv > 0.8 && t >= P.m ? 'text' : 'mute', align: 'center' });
  ctx.circle(kx + 10, ly + 10, 50, { fill: true, color: 'bg' });
  ctx.circle(kx, ly, 50, { fill: true, color: 'text' });
  const p = t < grab ? along([{ t: at, x: P.from[0], y: P.from[1] }, { t: grab, x: kx + 8, y: ly + 10, go: grab - 0.5 }], t) : t < P.m + 0.2 ? [kx + 8, ly + 10] : along([{ t: P.m + 0.2, x: kx + 8, y: ly + 10 }, { t: P.until, x: P.to[0], y: P.to[1] }], t);
  burst(ctx, kx, ly, 60, (t - grab) / 0.35, { color: 'sub' });
  hand(ctx, p[0], p[1], { down: t >= grab && t < P.m + 0.2 ? 1 : 0 });
  const wob = (since, amp, decay, f) => (since >= 0 ? amp * pulse(since, decay) * Math.sin(since * f) : 0);
  ctx.fx.shake = [wob(t - P.m, 8, 13, 80), wob(t - P.s, 10, 13, 80) + wob(t - land, 4, 12, 70)];
}

// ============================================================================================ Loop: the revolve
const REV = { c: [960, 872], rx: 600, ry: 74, r: 470 };
const LOOKS3 = ['bust', 'tabby', 'boy'];

/** As plates_pre2.js plateTrance: P.steps (the two times the word is sung), P.settle = [from, to], P.log. */
export function plateRevolve(ctx, env, P) {
  const { t, at } = P, a = flashIn(t, at), g = ctx.g;
  // the angle of the revolve: it turns, a third of a turn more on each step; over `settle` it comes to rest with the
  // boy (the third look) at the front
  const free = 1.6 * (t - at) + P.steps.reduce((s, s0) => s + (TAU / 3) * easeOut(prog(t, s0, s0 + 0.22)), 0);
  const stop = Math.ceil((free + TAU / 3 * 2) / TAU) * TAU - TAU / 3 * 2, k = easeInOut(prog(t, P.settle[0], P.settle[1])), th = lerp(free, stop, k);
  house(ctx);
  backWall(ctx, {});
  // two lights sweeping round the stage
  for (const ph of [0, Math.PI]) { const x = 960 + 520 * Math.sin(th * 0.7 + ph); spotlight(ctx, 960 + 300 * Math.sin(th * 0.3 + ph), [x, 862], 260, 0.9 * (1 - k) + 0.3); }
  spotlight(ctx, 960, [960, 862], 340, k);
  boards(ctx, t, { lit: 1, glow: 0.5 });
  // the revolve: a disc in the boards with its seams, turning
  g.save(); g.beginPath(); g.ellipse(REV.c[0], REV.c[1], REV.rx, REV.ry, 0, 0, TAU); g.fillStyle = ctx.col('raised', 1); g.fill(); g.strokeStyle = ctx.col('me', 1); g.lineWidth = 5; g.stroke(); g.restore();
  for (let i = 0; i < 12; i++) { const an = th + (i / 12) * TAU; ctx.line(REV.c[0], REV.c[1], REV.c[0] + Math.cos(an) * REV.rx, REV.c[1] + Math.sin(an) * REV.ry, { color: 'line', width: 2 }); }
  if (a > 0) {
    // her three looks on it, back to front
    const items = LOOKS3.map((look, i) => { const an = th + (i * TAU) / 3; return { look, x: REV.c[0] + Math.sin(an) * REV.r, z: Math.cos(an) }; }).sort((p, q) => p.z - q.z);
    const a0 = g.globalAlpha;
    g.globalAlpha = a0 * a;
    for (const it of items) {
      const h = 500 * (0.72 + 0.28 * (it.z + 1) / 2), s = lookSize(env.art, it.look), w = (h * s.w) / s.h, dst = { x: it.x - w / 2, y: REV.c[1] + 20 * it.z - h, w, h };
      const dim = (1 - it.z) / 2;
      if (it.z > 0.5) lookHalo(ctx, env, it.look, dst, { color: 'meDim', alpha: 0.7 * (it.z - 0.5) * 2, rot: th });
      drawLook(ctx, env, it.look, dst, dim > 0.55 ? { plates: [{ ink: 'all', role: 'line' }, { ink: 'black', role: 'panel', alpha: 0.6 }] } : {});
      if (dim < 0.3) lookStar(ctx, env, it.look, dst, { glow: 0.3 });
    }
    g.globalAlpha = a0;
  }
  curtains(ctx, 1);
  valance(ctx, { title: P.title ?? '', lit: 1, t });
  said(ctx, env, t, P.lines);
  footDesk(ctx);
  ctx.text(`› ${P.log ?? ''}`, 140, 960, { size: 34, font: 'mono', color: 'sub' });
  spark(ctx, 1700, 960, 46, { morph: 1, color: 'me', core: 0, rot: th });
}

// ---------------------------------------------------------------------------------------------- check cards
export function labCards(env) {
  const v = (k) => (env.script.settings_rows?.section7 ?? [])[k]?.values ?? ['A', 'B'];
  const card = (fn, P) => ({ palette: 'warm', render: (ctx) => fn(ctx, env, { at: 0, lines: [], title: env.script.title ?? '', ...P }) });
  const desk = (S) => ({ palette: 'warm', render: (ctx, t) => deskView(ctx, env, t, S, { title: env.script.title ?? '' }) });
  return {
    p2: [
      desk({ gender: -1, call: 0, role: -1, loop: 0 }), desk({ gender: 1, call: 1, role: 1, loop: 1, go: 1 }),
      card(plateScreen, { t: 0.3, press: 0.6, click: 1, values: v(0) }), card(plateScreen, { t: 0.75, press: 0.6, click: 1, values: v(0) }), card(plateScreen, { t: 1.4, press: 0.6, click: 1, values: v(0) }),
      card(plateWire, { t: 1.5, grab: 1, drag: 2, top: 3, end: 4, am: 2.5, pm: 3.4, values: v(1), to: [1500, 600], until: 5 }), card(plateWire, { t: 3, grab: 1, drag: 2, top: 3, end: 4, am: 2.5, pm: 3.4, values: v(1), to: [1500, 600], until: 5 }), card(plateWire, { t: 4.4, grab: 1, drag: 2, top: 3, end: 4, am: 2.5, pm: 3.4, values: v(1), to: [1500, 600], until: 5 }),
      card(plateLifts, { t: 2, grab: 1, push: 1.5, s: 1.8, m: 2.5, land: 3, values: v(2), from: [1700, 1000], to: [1700, 1000], until: 4 }), card(plateLifts, { t: 2.9, grab: 1, push: 1.5, s: 1.8, m: 2.5, land: 3, values: v(2), from: [1700, 1000], to: [1700, 1000], until: 4 }),
      card(plateRevolve, { t: 1.4, steps: [1.2, 2.1], settle: [2.5, 2.9], log: 'loop: on' }), card(plateRevolve, { t: 3.2, steps: [1.2, 2.1], settle: [2.5, 2.9], log: 'loop: on' }),
    ],
  };
}
