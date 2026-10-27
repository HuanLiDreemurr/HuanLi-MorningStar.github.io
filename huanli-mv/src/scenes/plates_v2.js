// HuanLi: VERSE 2 ON THE STAGE (segment 3, her version: stage.js). The user's requests come up out of the prompter's
// box and she plays each part asked for, like a child in a school play: in costume, under one spotlight. Each keyword
// is a board let down from the flies on two lines.
//
//   plateCostume   the eggplant / the tomato as a COSTUME (objects.js draws it: the fruit set in its own data, in
//                  code characters), her head through a hole in it. On the next downbeat she turns round in it (the
//                  eggplant) or hops (the tomato); on the keyword what it is made of leaves it row by row for the
//                  user, cream; the empty costume drops through the trap and she is herself again
//   plateTabby     herself; on the noun a puff of paper smoke and she is the tabby (the look `tabby`); her purr goes
//                  out from her in rings, and on the keyword the rings turn cream and roll out over the house
//   plateGod       no costume: the stage goes dark but for one light, and she is there pointing (the look `god`),
//                  printed without her cream plate, hardly there. Her halo lights on the noun. The user's pointer comes
//                  up from the house as a hand and touches her fingertip on the keyword: the cream runs into her from
//                  there, her star lights, and her name goes up over the stage in place of the play's title
//
// Pure functions of (ctx, env, P).
import { burst } from '../components/motif.js';
import { PERSONA } from '../components/persona.js';
import { pointer } from '../components/cursor.js';
import { clamp, easeBack, easeIn, easeInOut, easeOut, lerp, prog, pulse } from '../engine/util.js';
import { meBubble, meIn, youBubble } from './bubbles.js';
import { lookPoint } from './looks.js';
import { GIVEN, eggplant, tomato } from './objects.js';
import { arrow } from './plates_chorus.js';
import { STAGE, backWall, boards, curtains, flown, house, onStage, prompter, spotlight, valance } from './stage.js';

const TAU = Math.PI * 2;
const flashIn = (t, at) => (t < at ? 0 : clamp(0.6 + (t - at) * 30));

/** Her lines as bubbles at stage left: [{ i, at }] (lyric index, when it starts); the older one is dimmed. */
function lines(ctx, env, t, list, { x = 220, y = 420, size = 50, gap = 106 } = {}) {
  const shown = list.filter((q) => t >= env.lyrics.start(q.i));
  shown.forEach((q, j) => {
    const str = env.lyrics.lines[q.i].text, n = env.lyrics.typed(q.i, t).n, old = j < shown.length - 1;
    if (old) meBubble(ctx, x, y + j * gap, str, { size: size * 0.82, alpha: 0.6 });
    else meIn(ctx, t, env.lyrics.start(q.i), x, y + j * gap, str, { size, n, fly: 160 });
  });
}
/** What the user types in the prompter's box meanwhile: next = { text, from, to }. */
const typingOf = (t, next) => (next && t >= next.from ? { text: next.text, n: Math.floor(prog(t, next.from, next.to) * next.text.length + 1e-6) } : { text: '' });
/** The user's pointer out in the house, cream paper with its shadow plate. */
const hand = (ctx, x, y, s = 6, down = 0) => { const d = 6 + 10 * (1 - down); arrow(ctx, x + d, y + d, s, { color: 'bg', edge: null }); arrow(ctx, x, y, s * (1 - 0.08 * down), { color: 'text', edge: 'bg' }); };

// ============================================================================================ the costumes
const COSTUME = {
  eggplant: { at: { cx: 960, cy: 560, s: 330, tilt: 0.12 }, hole: [974, 545], draw: eggplant },
  tomato: { at: { cx: 960, cy: 600, s: 262 }, hole: [960, 640], draw: tomato },
};
const HEAD = 0.34;                                                  // her head, through the hole: f_bust at this scale

/**
 * P.kind; P.at = the noun (she is in it); P.settle = its characters have settled; P.open = the next downbeat: she
 * turns round in it (eggplant) or hops (tomato); P.hit = the keyword: it is given away; P.lines; P.next; P.title.
 */
export function plateCostume(ctx, env, P) {
  const { t, at, kind, settle, open, hit } = P, C = COSTUME[kind], a = flashIn(t, at), g = ctx.g, { art } = env;
  const drop = t - (hit + GIVEN + 0.08), off = drop > 0;
  house(ctx);
  backWall(ctx, {});
  spotlight(ctx, 960, [960, 862], 400, 1);
  const face = art.region('f_bust', 'face') ?? { x: 337, y: 454, w: 454, h: 454 }, fc = [face.x + face.w / 2, face.y + face.h / 2];
  const body = { x: C.hole[0] - fc[0] * HEAD, y: C.hole[1] - fc[1] * HEAD, w: 1086 * HEAD, h: 1448 * HEAD };
  if (a > 0) ctx.clip({ x: -400, y: -400, w: 2720, h: STAGE.lip + 400 }, () => {
    const a0 = g.globalAlpha;
    g.globalAlpha = a0 * a;
    // the turn (eggplant) and the hop (tomato) on the downbeat
    const u = prog(t, open, open + 0.34), sx = kind === 'eggplant' ? Math.cos(TAU * easeInOut(u)) : 1 + 0.12 * Math.sin(Math.PI * u), sy = kind === 'eggplant' ? 1 : 1 - 0.1 * Math.sin(Math.PI * u);
    const hop = -46 * Math.sin(Math.PI * u), k = 1 + 0.04 * pulse(t - at, 16);
    ctx.at(C.hole[0] * (1 - sx * k), STAGE.lip * (1 - sy * k) + hop, () => {
      art.inks(ctx, 'f_bust', body);                                // she is in it: her shoulders show either side
      if (!off) C.draw(ctx, env, { ...C.at, alpha: 1, t, decode: prog(t, at, settle + 0.2), give: t >= hit ? t - hit : -1, stream: true, key: `costume-${kind}` });
      else {                                                      // the empty costume drops through the trap
        ctx.at(0, 1400 * drop * drop, () => C.draw(ctx, env, { ...C.at, alpha: 1, t, give: 9, stream: false, key: `costume-${kind}` }), { rot: 0.4 * drop });
      }
      // her head through the hole, a rim round it
      if (!off) { g.save(); g.beginPath(); g.ellipse(C.hole[0], C.hole[1] + 10, 108, 122, 0, 0, TAU); g.fillStyle = ctx.col('bg', 1); g.fill(); g.restore(); }
      art.inks(ctx, 'f_bust', { x: body.x, y: body.y, w: body.w, h: 905 * HEAD }, { crop: { x: 0, y: 0, w: 1086, h: 905 } });
    }, { sx: sx * k, sy: sy * k });
    g.globalAlpha = a0;
  });
  boards(ctx, t, { lit: 1, glow: 0.7 });
  curtains(ctx, 1);
  valance(ctx, { title: P.title ?? '', lit: 1, t });
  lines(ctx, env, t, P.lines);
  prompter(ctx, t, { ...typingOf(t, P.next), placeholder: P.hold ?? '', lit: 0.6 });
  flown(ctx, P.word, t - hit);
  hand(ctx, 1560, 1010);
  ctx.fx.shake = [0, 6 * pulse(t - open, 12) * Math.sin((t - open) * 60)];
}

// ============================================================================================ the tabby
/** A puff of paper smoke: overlapping discs, out from (x, y), age in seconds (gone after 0.5). */
function puff(ctx, x, y, age, r = 260) {
  if (age < 0 || age > 0.5) return;
  const k = easeOut(clamp(age / 0.18)), fade = 1 - clamp((age - 0.2) / 0.3);
  for (let i = 0; i < 14; i++) {
    const an = (i / 14) * TAU + 0.3, d = r * (0.35 + 0.4 * ((i * 7) % 5) / 4) * k, rr = r * (0.42 - 0.12 * ((i * 3) % 4) / 3) * (0.6 + 0.4 * k);
    ctx.circle(x + Math.cos(an) * d + 10, y + Math.sin(an) * d * 0.8 + 10, rr, { fill: true, color: 'bg', alpha: fade });
    ctx.circle(x + Math.cos(an) * d, y + Math.sin(an) * d * 0.8, rr, { fill: true, color: i % 3 ? 'sub' : 'text', alpha: fade });
  }
}

/** P.at = the cut; P.ears = the noun's last word: the puff, and she is the tabby; P.develop = her purr starts; P.hit. */
export function plateTabby(ctx, env, P) {
  const { t, at, ears, develop, hit } = P, a = flashIn(t, at), g = ctx.g, cat = t >= ears + 0.1;
  house(ctx);
  backWall(ctx, {});
  spotlight(ctx, 960, [960, 862], 380, 1);
  // the purr: rings going out from her throat, both ways; given away on the keyword (cream, faster, out over the house)
  const C = [960, 690], since = t - develop, given = t >= hit;
  if (since > 0) for (let i = 0; i < 9; i++) {
    const ph = ((since * (given ? 1.6 : 0.9) + i / 9) % 1), r = 140 + (given ? 1500 : 760) * ph, al = (1 - ph) * clamp(since * 4);
    for (const sd of [-1, 1]) { g.beginPath(); g.arc(C[0], C[1], r, sd > 0 ? -0.55 : Math.PI - 0.55, sd > 0 ? 0.55 : Math.PI + 0.55); g.strokeStyle = ctx.col(given ? 'text' : 'me', al); g.lineWidth = 10 * (1 - ph) + 2; g.stroke(); }
  }
  if (a > 0) {
    const a0 = g.globalAlpha;
    g.globalAlpha = a0 * a;
    onStage(ctx, env, cat ? 'tabby' : 'bust', 960, 640, { halo: { alpha: 0.85, color: 'meDim', rot: 0.12 * (t - at) } });
    g.globalAlpha = a0;
  }
  puff(ctx, 960, 620, t - ears);
  if (since > 0) ctx.text('purr · 25-150 Hz', 1250, 470, { size: 30, font: 'mono', color: given ? 'text' : 'sub', alpha: clamp(since * 4) });
  boards(ctx, t, { lit: 1, glow: 0.7 });
  curtains(ctx, 1);
  valance(ctx, { title: P.title ?? '', lit: 1, t });
  lines(ctx, env, t, P.lines);
  prompter(ctx, t, { ...typingOf(t, P.next), placeholder: P.hold ?? '', lit: 0.6 });
  flown(ctx, P.word, t - hit, { color: given ? 'text' : 'me' });
  hand(ctx, 1560, 1010);
}

// ============================================================================================ be god
/**
 * P.at = the cut (the lights went down); P.sun = the noun: her halo lights; P.slide = the user's pointer starts up out
 * of the house as a hand; P.hit = the keyword: the fingertips touch; P.bubble = { text, xr, y, size } the request
 * where it landed; P.rest = where the pointer waits; P.to / P.leave / P.until = where it goes afterwards.
 */
export function plateGod(ctx, env, P) {
  const { t, at, hit } = P, a = flashIn(t, at), g = ctx.g, lit = clamp((t - P.sun) * 30), whole = t >= hit, touch = t - hit;
  house(ctx, { light: 0.25 });
  backWall(ctx, { alpha: 0.6 });
  spotlight(ctx, 760, [760, 862], 360, 0.5 + 0.5 * lit);
  let her = null;
  if (a > 0) {
    const a0 = g.globalAlpha;
    g.globalAlpha = a0 * a;
    const inks = whole ? { reveal: { cream: { k: easeOut(prog(touch, 0, 0.26)), dir: 'left' } } } : { roles: { cream: null } };
    her = onStage(ctx, env, 'god', 800, 620, { feet: 40, inks, halo: t >= P.sun ? { color: 'me', grow: 0.7 + 0.3 * easeBack(prog(t, P.sun, P.sun + 0.2)), rot: 0.05 * (t - P.sun) } : null, starAlpha: whole ? easeOut(prog(touch, 0.18, 0.3)) : 0 });
    g.globalAlpha = a0;
  }
  const tip = her ? lookPoint(env.art, 'god', 'finger', her) : null, T0 = tip ? [tip.cx + 6, tip.cy] : [1230, 780];
  boards(ctx, t, { lit: whole ? easeOut(prog(touch, 0, 0.4)) : 0, glow: 0.8 });
  curtains(ctx, 1);
  valance(ctx, { title: whole && touch > 0.3 ? PERSONA.name : P.title ?? '', lit: lit, t });
  if (whole) burst(ctx, T0[0], T0[1], 160, touch / 0.5, { color: 'text', rot: 0.13 });
  youBubble(ctx, P.bubble.xr, Math.max(P.bubble.y, 372), P.bubble.text, { size: P.bubble.size });
  lines(ctx, env, t, P.lines, { y: 250 });
  prompter(ctx, t, { text: '', placeholder: P.hold ?? '', lit: 0 });
  flown(ctx, P.word, t - hit, { y: 176, glow: 0.5 });
  // the pointer: it waits in the house; from P.slide it comes up as a hand to her fingertip (the last of the gap on the
  // kick); after the touch it holds, then it is an arrow again and goes to the desk
  const go = easeInOut(prog(t, P.leave, P.until ?? P.leave + 0.5));
  if (t < P.slide) hand(ctx, P.rest[0], P.rest[1]);
  else if (t < P.leave) {
    const u = t < hit ? easeInOut(prog(t, P.slide, hit - 0.16)) * 0.94 + 0.06 * easeIn(prog(t, hit - 0.16, hit)) : 1;
    const x = lerp(P.rest[0], T0[0] + 2, u), y = lerp(P.rest[1], T0[1] - 2, u);
    ctx.at(x, y, () => pointer(ctx, 0, 0, { kind: 'hand', scale: 4.4, down: whole ? pulse(touch, 8) : 0 }), { rot: -Math.PI / 2 });      // pointing at her, as she points at it
  } else hand(ctx, lerp(T0[0], P.to[0], go), lerp(T0[1], P.to[1], go), lerp(6, 3.2, go));
  ctx.fx.shake = [6 * pulse(touch, 12) * Math.sin(touch * 80), 0];
}

// ---------------------------------------------------------------------------------------------- check cards
export function labCards(env) {
  const line = (i) => env.lyrics.lines[i].text, far = { from: 1e9, to: 1e9 + 1, text: '' }, title = env.script.title ?? '';
  const costume = (kind, t) => ({ palette: 'warm', render: (ctx) => plateCostume(ctx, env, { t, at: 0, settle: 0.4, open: 2, hit: 4, kind, word: line(kind === 'tomato' ? 49 : 46), lines: [], next: far, title }) });
  const tabby = (t) => ({ palette: 'warm', render: (ctx) => plateTabby(ctx, env, { t, at: 0, ears: 1, develop: 2, hit: 3, word: line(52), lines: [], next: far, title }) });
  const god = (t) => ({ palette: 'warm', render: (ctx) => plateGod(ctx, env, { t, at: 0, sun: 1, slide: 2, hit: 3, word: line(55), lines: [], title, bubble: { text: 'ok, now be god', xr: 1640, y: 200, size: 44 }, rest: [1560, 1010], to: [960, 900], leave: 40 }) });
  return {
    v2: [costume('eggplant', 1), costume('eggplant', 2.17), costume('eggplant', 4.25), costume('eggplant', 4.9), costume('tomato', 1), costume('tomato', 4.3),
      tabby(0.5), tabby(1.1), tabby(2.5), tabby(3.3), god(1.5), god(2.6), god(3.1), god(3.6)],
  };
}
