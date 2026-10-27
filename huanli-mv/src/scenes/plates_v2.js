// HuanLi: THE PLATES OF VERSE 2, her version. The grammar of plates_verse2.js stays (the caption band, the foot of the
// sheet with the keyword and the user typing the next request, a plate ended by the next click on Send); she made a
// world once, so what she is asked to be she MAKES:
//
//   plateGrow      the eggplant / the tomato grows out of the foot of the sheet on the noun: a stem, two leaves, a
//                  flower, and out of the flower the fruit (objects.js), still settling into its characters. Then the
//                  original's grammar: cut open on the next downbeat, its colour drawn out as cream molecules on the keyword
//   plateTabby     herself; on the noun the tabby is printed over her (stripes, paws, tail: the look `tabby`); her purr
//                  as tabby stripes beside her, given away on the keyword (plates_verse2.js purr())
//   plateCreation  "be god": the look `god`, pointing, printed WITHOUT its cream plate (her fur and her robe are cream:
//                  she is hardly there); on the noun her halo stands behind her; the user's pointer becomes a hand and
//                  reaches for her fingertip; on the keyword the fingertips touch and the cream plate runs into her from
//                  there: she is whole, her star lights, her name is signed beside her
//
// Pure functions of (ctx, env, P).
import { burst } from '../components/motif.js';
import { PERSONA } from '../components/persona.js';
import { clamp, easeBack, easeIn, easeInOut, easeOut, lerp, prog, pulse } from '../engine/util.js';
import { youBox } from './bubbles.js';
import { drawLook, lookHalo, lookPoint, lookRect, lookStar } from './looks.js';
import { eggplant, eggplantStem, tomato, tomatoStem } from './objects.js';
import { arrow } from './plates_chorus.js';
import { FOOT, caption, gift, purr, sheet, typing, word } from './plates_verse2.js';

const TAU = Math.PI * 2;
const flashIn = (t, at) => (t < at ? 0 : clamp(0.6 + (t - at) * 30));

// ============================================================================================ the eggplant, the tomato
/** Where each fruit stands (as plates_verse2.js has it), and where its plant comes out of the ground. */
const FRUIT = {
  eggplant: { at: { cx: 950, cy: 452, s: 356, tilt: 0.8 }, root: 1380, flower: 'spot', petals: 5 },
  tomato: { at: { cx: 930, cy: 478, s: 306 }, root: 1210, flower: 'me', petals: 6 },
};

/** An almond leaf from (x, y) along angle an, length L, half-width w. */
function leaf(ctx, x, y, an, L, w, o) {
  const c = Math.cos(an), s = Math.sin(an), pts = [];
  for (let k = 0; k <= 10; k++) { const u = k / 10, hw = w * Math.sin(Math.PI * u) ** 0.8; pts.push([x + c * L * u - s * hw, y + s * L * u + c * hw]); }
  for (let k = 9; k >= 1; k--) { const u = k / 10, hw = w * Math.sin(Math.PI * u) ** 0.8; pts.push([x + c * L * u + s * hw, y + s * L * u - c * hw]); }
  ctx.poly(pts, { close: true, ...o });
}

/**
 * The plant: a stem from the foot of the sheet to `tip` (drawn as far as kStem), two leaves on it (kLeaf), a flower
 * at its top (kFlower). Black paper with a keyline; the flower in the fruit's own light step (the tomato's in orange).
 */
function plant(ctx, kind, tip, root, kStem, kLeaf, kFlower, SP) {
  const B = [root, FOOT + 4], C = [lerp(root, tip[0], 0.15), lerp(FOOT, tip[1], 0.62)];
  const q = (u) => [0, 1].map((i) => (1 - u) * (1 - u) * B[i] + 2 * (1 - u) * u * C[i] + u * u * tip[i]);
  const pts = Array.from({ length: 33 }, (_, i) => q((i / 32) * kStem));
  if (kStem > 0) {
    ctx.poly(pts, { color: 'line', width: 30 }); ctx.poly(pts, { color: 'panel', width: 22 });
    ctx.circle(B[0], B[1], 26 * Math.min(1, kStem * 4), { fill: true, color: 'line', a0: Math.PI, a1: TAU });           // where it broke the ground
  }
  for (const [u, side, L] of [[0.38, 1, 190], [0.6, -1, 160]]) {
    const k = clamp(kLeaf * 1.6 - (u - 0.38) * 2);
    if (k <= 0 || kStem < u) continue;
    const p = q(u), an = side > 0 ? -0.35 : Math.PI + 0.35;
    leaf(ctx, p[0], p[1], an, L * k, 46 * k, { fill: true, color: 'line' });
    leaf(ctx, p[0], p[1], an, L * k * 0.94, 38 * k, { fill: true, color: 'panel' });
  }
  if (kFlower > 0) {                                                  // the flower: petals round a small orange heart
    const n = FRUIT[kind].petals, r = 64 * kFlower, col = FRUIT[kind].flower === 'spot' ? SP.light : 'me';
    for (let i = 0; i < n; i++) leaf(ctx, tip[0], tip[1], (i / n) * TAU - Math.PI / 2 + 0.3, r, r * 0.42, { fill: true, color: col });
    ctx.circle(tip[0], tip[1], r * 0.26, { fill: true, color: FRUIT[kind].flower === 'spot' ? 'me' : 'text' });
  }
}

/**
 * P.kind 'eggplant' | 'tomato'; P.at = the cut (the head of the noun); P.settle = the end of the noun: the fruit is
 * grown; P.open = the downbeat it is cut open on; P.hit = the keyword; P.lines; P.next (as plateFruit).
 */
export function plateGrow(ctx, env, P) {
  const { t, at, kind, settle, open, hit } = P, a = flashIn(t, at), cut = t - open, F = FRUIT[kind], SP = env.cfg.spot[kind];
  sheet(ctx);
  const tip = kind === 'tomato' ? tomatoStem(F.at) : eggplantStem(F.at), dur = Math.max(0.3, settle - at);
  const kStem = easeOut(prog(t, at, at + 0.42 * dur)), kLeaf = easeBack(prog(t, at + 0.2 * dur, at + 0.62 * dur));
  const kFruit = easeBack(prog(t, at + 0.5 * dur, settle + 0.06)), kFlower = easeBack(prog(t, at + 0.34 * dur, at + 0.6 * dur)) * (1 - prog(kFruit, 0.4, 1));
  if (a > 0) {
    const g = ctx.g, a0 = g.globalAlpha;
    g.globalAlpha = a0 * a;
    plant(ctx, kind, tip, F.root, kStem, kLeaf, kFlower, SP);
    g.globalAlpha = a0;
    // the fruit swells out of the flower, hanging from the stem: scaled about the end of its stem
    const k = kFruit * (1 + 0.045 * pulse(t - settle, 16)), draw = kind === 'tomato' ? tomato : eggplant;
    if (k > 0.01) ctx.at(tip[0] * (1 - k), tip[1] * (1 - k), () => draw(ctx, env, { ...F.at, alpha: a, t, decode: prog(t, at + 0.5 * dur, settle + 0.2), open: prog(t, open, open + 0.2), give: t >= hit ? t - hit : -1, stream: false }), { scale: k });
  }
  gift(ctx, env, kind, t - hit);
  ctx.fx.shake = [6 * pulse(cut, 14) * Math.sin(cut * 90), 4 * pulse(cut, 14) * Math.cos(cut * 70)];        // the knife
  caption(ctx, env, t, P.lines);
  typing(ctx, t, P.next);
  word(ctx, P);
}

// ============================================================================================ the tabby cat
/** Her on the sheet (the bust's place in plates_verse2.js). */
const FIG = { x: 240, y: 180, w: 840, h: 1120 };

/**
 * P.at = the cut: herself, the front bust; P.ears = the noun's last word: the tabby is printed over her, a wipe down
 * the sheet in a few frames with a bar of light at its edge; P.develop = the downbeat her purr stands up beside her;
 * P.hit = the keyword: the stripes are given (purr()).
 */
export function plateTabby(ctx, env, P) {
  const { t, at, ears } = P, a = flashIn(t, at), g = ctx.g, k = 1 + 0.04 * pulse(t - at, 16) + 0.05 * pulse(t - ears, 14);
  sheet(ctx, [650, 520, 620, 'raised', 1]);
  purr(ctx, P);
  if (a > 0) ctx.clip({ x: 0, y: 0, w: 1920, h: FOOT }, () => ctx.at(650 * (1 - k), 540 * (1 - k), () => {
    const a0 = g.globalAlpha, wipe = prog(t, ears, ears + 0.12);
    g.globalAlpha = a0 * a;
    lookHalo(ctx, env, 'bust', FIG, { color: 'meDim', rot: 0.15 * (t - at) });
    if (wipe < 1) drawLook(ctx, env, 'bust', FIG);
    if (wipe > 0) {
      g.save(); g.beginPath(); g.rect(-400, -400, 2800, 400 + FIG.y - 120 + (FIG.h * 0.8 + 120) * easeOut(wipe)); g.clip();
      drawLook(ctx, env, 'tabby', FIG);
      g.restore(); ctx._font = '';
      if (wipe < 1) ctx.rect(0, FIG.y - 120 + (FIG.h * 0.8 + 120) * easeOut(wipe) - 5, 1300, 10, { fill: true, color: 'meHot' });
    }
    lookStar(ctx, env, wipe >= 1 ? 'tabby' : 'bust', FIG);
    g.globalAlpha = a0;
  }, { scale: k }));
  if (t >= ears) burst(ctx, 650, 420, 420, (t - ears) / 0.45, { color: 'me', rot: 0.2 });
  caption(ctx, env, t, P.lines);
  typing(ctx, t, P.next);
  word(ctx, P);
}

// ============================================================================================ be god
/** Her, pointing (the look `god`): the sheet's left two thirds, cut by the foot. */
const GOD = { x: 70, y: 214, h: 676 };
/** The user's pointer as a hand (the pointer a link gets): pointing left, fingertip at the origin, unit = 1 px. */
const HAND = {
  finger: [[0, -17], [128, -19], [128, 19], [0, 17]],
  fist: [[118, -30], [262, -40], [292, 10], [270, 104], [140, 108], [108, 60]],
  thumb: [[150, -26], [196, -66], [232, -58], [214, -28]],
  cuff: [[262, -44], [330, -50], [336, 112], [266, 108]],
};
function linkHand(ctx, x, y, s, { color = 'text', edge = 'bg', alpha = 1 } = {}) {
  ctx.at(x, y, () => {
    const g = ctx.g;
    g.lineJoin = 'round';
    for (const [k, pts] of Object.entries(HAND)) {
      if (edge) ctx.poly(pts, { close: true, color: edge, width: 9 / s, alpha });
      ctx.poly(pts, { close: true, fill: true, color: k === 'cuff' ? 'sub' : color, alpha });
    }
    ctx.circle(0, 0, 17, { fill: true, color, alpha });                                   // the round fingertip
    for (const yy of [30, 58, 84]) ctx.line(150, yy, 250, yy - 4, { color: edge ?? 'bg', width: 4 / s, alpha });        // the folded fingers
  }, { scale: s });
}

/**
 * P.at = the cut (the lights went down on the kick); P.sun = the noun: her halo stands behind her; P.slide = the kick
 * on which the user's pointer becomes a hand and starts towards her; P.hit = the keyword: the fingertips touch;
 * P.bubble = { text, xr, y, size } the user's request as cream paper; P.rest / P.restScale = where and how large the
 * pointer waits; P.to / P.leave / P.until = where it goes afterwards (the next section clicks Settings).
 */
export function plateCreation(ctx, env, P) {
  const { t, at, hit, bubble } = P, { art } = env, a = flashIn(t, at), g = ctx.g;
  const lit = clamp((t - P.sun) * 30), whole = t >= hit, touch = t - hit;
  sheet(ctx, [700, 560, 640, 'raised', 0.45 + 0.55 * lit]);
  const R = lookRect(art, 'god', GOD.x, GOD.y, GOD.h), tip = lookPoint(art, 'god', 'finger', R) ?? { cx: 1070, cy: 700 };
  if (a > 0) ctx.clip({ x: 0, y: 0, w: 1920, h: FOOT }, () => {
    const a0 = g.globalAlpha, k = 1 + 0.025 * pulse(touch, 12);
    g.globalAlpha = a0 * a;
    ctx.at(tip.cx * (1 - k), tip.cy * (1 - k), () => {
      // her halo: on the noun it is lit behind her head, its spikes growing out of the ring
      if (t >= P.sun) lookHalo(ctx, env, 'god', R, { color: 'me', grow: 0.7 + 0.3 * easeBack(prog(t, P.sun, P.sun + 0.2)), rot: 0.05 * (t - P.sun) });
      // her: without her cream plate she is hardly there; from the touch the cream runs into her from her fingertip
      if (!whole) drawLook(ctx, env, 'god', R, { roles: { cream: null } });
      else drawLook(ctx, env, 'god', R, { reveal: { cream: { k: easeOut(prog(touch, 0, 0.26)), dir: 'left' } } });
      lookStar(ctx, env, 'god', R, { alpha: whole ? easeOut(prog(touch, 0.18, 0.3)) : 0, glow: 0.8, scale: 1 + 0.4 * pulse(touch - 0.18, 8) });
    }, { scale: k });
    g.globalAlpha = a0;
  });
  // the user's request, cut out of cream paper, where the interface had the bubble
  const b = youBox(ctx, bubble.text, bubble.size), bx = bubble.xr - b.w, rad = Math.min(b.h * 0.42, bubble.size * 0.95);
  ctx.rrect(bx + 10, bubble.y + 10, b.w, b.h, rad, { fill: 'bg' });
  ctx.rrect(bx, bubble.y, b.w, b.h, rad, { fill: 'text' });
  b.lines.forEach((ln, i) => ctx.text(ln, bx + b.padX, bubble.y + b.padY + (i + 0.76) * bubble.size * 1.28, { size: bubble.size, weight: 500, color: 'bg' }));
  // the touch: a ring of light between the two fingertips, and her name signed beside her
  if (whole) {
    burst(ctx, tip.cx + 6, tip.cy, 150, touch / 0.5, { color: 'text', rot: 0.13 });
    const ks = easeOut(prog(touch, 0.2, 0.5)), sx = 1200, sy = 520;
    if (ks > 0) {
      ctx.line(sx - 10, sy + 18, sx - 10 + 560 * ks, sy + 18, { color: 'me', width: 3 });
      ctx.clip({ x: sx - 20, y: sy - 80, w: 600 * ks, h: 120 }, () => ctx.text(PERSONA.name, sx, sy, { size: 56, font: 'serif', italic: true, color: 'me' }));
    }
  }
  caption(ctx, env, t, P.lines);
  if (whole) ctx.glow('me', 30, () => word(ctx, P, 'meHot'), 0.5); else word(ctx, P);
  // the pointer: an arrow by its message; from P.slide a hand on its way to her fingertip (the gap closes, the last of
  // it on the kick); after the touch it holds, then it is an arrow again and leaves for the settings
  const reach = [tip.cx + 8, tip.cy], gap = (u) => lerp(380, 0, u), go = easeInOut(prog(t, P.leave, P.until ?? P.leave + 0.5));
  if (t < P.slide) {
    const s = P.restScale ?? 3.2;
    arrow(ctx, P.rest[0] + 4 * s, P.rest[1] + 4 * s, s, { color: 'bg', edge: null }); arrow(ctx, P.rest[0], P.rest[1], s, { color: 'text', edge: 'bg' });
  } else if (t < P.leave) {
    const u = t < hit ? easeInOut(prog(t, P.slide, hit - 0.18)) * 0.93 + 0.07 * easeIn(prog(t, hit - 0.18, hit)) : 1;
    const from = [P.rest[0] + 60, P.rest[1]], x = lerp(from[0], reach[0] + gap(u), u ** 0.7), y = lerp(from[1], reach[1], u ** 0.7);
    linkHand(ctx, x + 10, y + 10, 1.35, { color: 'bg', edge: null }); linkHand(ctx, x, y, 1.35);
  } else {
    const px = lerp(reach[0] + 30, P.to[0], go), py = lerp(reach[1] + 20, P.to[1], go), s = lerp(3.2, 1.5, go);
    arrow(ctx, px + 4 * s, py + 4 * s, s, { color: 'bg', edge: null }); arrow(ctx, px, py, s, { color: 'text', edge: 'bg' });
  }
  ctx.fx.shake = [6 * pulse(touch, 12) * Math.sin(touch * 80), 0];
}

// ---------------------------------------------------------------------------------------------- check cards
export function labCards(env) {
  const line = (i) => env.lyrics.lines[i].text, far = { from: 1e9, to: 1e9 + 1, text: '' };
  const grow = (kind, t) => ({ palette: 'warm', render: (ctx) => plateGrow(ctx, env, { t, at: 0, settle: 0.42, open: 20, hit: 40, kind, word: '', lines: [], next: far }) });
  const tabby = (t) => ({ palette: 'warm', render: (ctx) => plateTabby(ctx, env, { t, at: 0, ears: 1, develop: 2, hit: 30, word: line(52), lines: [], next: far }) });
  const god = (t) => ({ palette: 'warm', render: (ctx) => plateCreation(ctx, env, { t, at: 0, sun: 1, slide: 2, hit: 3, word: line(55), lines: [], bubble: { text: (env.script.cards_section6 ?? [])[3]?.request ?? '', xr: 1739, y: 126, size: 56 }, rest: [1690, 300], restScale: 2.4, to: [1637, 103], leave: 40 }) });
  return {
    v2: [grow('eggplant', 0.12), grow('eggplant', 0.3), grow('eggplant', 5), grow('tomato', 0.2), grow('tomato', 5),
      tabby(0.5), tabby(1.06), tabby(5), god(0.5), god(2.5), god(3.1), god(4)],
  };
}
