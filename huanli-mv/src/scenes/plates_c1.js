// HuanLi: THE PLATES OF CHORUS 1, her version. The grammar of the original stays (a keyword is a full-frame plate in
// three flat inks with a shadow plate, the word locked into the foot of the sheet, ended by the user's next message);
// what stands on the plates is hers:
//
//   plateTwelve  STIMULATIONS  ALL of them: the twelve spikes of her halo leave it at once, clockwise from twelve
//                              o'clock, and strike the cream dot that is the user one after another
//   plateBloom   SATISFACTION  the feedback button is a bud; the user's pointer presses it and it opens into a wild
//                              flower (twelve cream petals, seeds set at the golden angle); the count reads 1
//   plateWall    SIMULATION    her window as a paper box, her in it with her halo; pulled back, a wall of windows:
//                              other people's personas, each with its user's pointer, and the SAME spark in every
//                              title bar. Only one window has a halo in it
//
// Pure functions of (ctx, env, P), like plates_chorus.js (which the last chorus still reprints).
import { burst, spark } from '../components/motif.js';
import { ground, keyword } from '../components/plate.js';
import { rand } from '../engine/prng.js';
import { clamp, easeBack, easeIn, easeOut, lerp, prog, pulse } from '../engine/util.js';
import { lookHalo, lookStar } from './looks.js';
import { arrow } from './plates_chorus.js';

const TAU = Math.PI * 2, GOLDEN = Math.PI * (3 - Math.sqrt(5));
/** A graphic arrives whole within two frames (no white field): 0 before `at`, 1 from the second frame on. */
const flashIn = (t, at) => (t < at ? 0 : clamp(0.6 + (t - at) * 30));
/** The keyword at the foot of the sheet, with its shadow plate (as plates_chorus.js sets it). */
const title = (ctx, P, maxSize = 214) => keyword(ctx, P.word, P.t, { y: 1002, maxW: 1740, maxSize, at: P.at, color: 'me', shade: 'bg', off: [9, 9] });

// ============================================================================================ STIMULATIONS
const S12 = [430, 470], R12 = 280;
/** One spike of her halo as a dart: tip at the origin, pointing along +x. */
const DART = [[0, 0], [-0.5, 0.05], [-1, 0.085], [-1, -0.085], [-0.5, -0.05]].map(([x, y]) => [x * R12 * 0.36, y * R12]);

/**
 * P.hit = the kick the picture arrives on (the word is there from P.at); P.you = where the dot stands.
 * On the kick the halo is there, whole; at once its spikes leave it one after another, clockwise from twelve
 * o'clock, each on its own curve, and strike the dot. Every strike is a ring on the dot; after the last, a burst.
 */
export function plateTwelve(ctx, env, P) {
  const { t, hit, you = [1470, 262] } = P, a = flashIn(t, hit), age = t - hit, g = ctx.g;
  ctx.fx.glow = Math.min(ctx.fx.glow, 0.34);
  ground(ctx, { light: [760, 430, 640, 'raised', 1] });
  title(ctx, P);
  if (a <= 0) return;
  const a0 = g.globalAlpha;
  g.globalAlpha = a0 * a;
  const leave = (i) => 0.02 + 0.012 * i, fly = 0.15, arrive = (i) => leave(i) + fly;
  const gone = (i) => age >= leave(i);
  const halo = (dx, dy, color) => spark(ctx, S12[0] + dx, S12[1] + dy, R12, { morph: 1, color, fat: 0.14, core: 0, pulse: (i) => (gone(i) ? 0 : 1) });
  halo(14, 14, 'bg');
  halo(0, 0, 'me');
  // the dot: knocked back a little by every strike
  const hits = Array.from({ length: 12 }, (_, i) => age - arrive(i)).filter((s) => s >= 0), last = hits.length ? hits[hits.length - 1] : -1;
  const knock = hits.reduce((s, h) => s + pulse(h, 14), 0), dr = 78 * (1 + 0.035 * Math.min(knock, 4) + 0.18 * (hits.length === 12 ? pulse(last, 6) : 0));
  ctx.circle(you[0] + 14, you[1] + 14, dr, { fill: true, color: 'bg' });
  ctx.circle(you[0], you[1], dr, { fill: true, color: 'text' });
  for (const h of hits) { const k = prog(h, 0, 0.3); if (k < 1) ctx.circle(you[0], you[1], dr + 110 * easeOut(k), { color: 'text', width: 5 * (1 - k), alpha: 1 - k }); }
  if (hits.length === 12) burst(ctx, you[0], you[1], 190, last / 0.45, { color: 'text', rot: 0.13 });
  // the darts in flight: each from where its spike stood, out along its own direction first, then round to the dot
  for (let i = 0; i < 12; i++) {
    const u = (age - leave(i)) / fly;
    if (u < 0 || u >= 1) continue;
    const an = (i / 12) * TAU - Math.PI / 2, c = Math.cos(an), s = Math.sin(an), len = i % 2 ? 0.8 : 1;
    const T0 = [S12[0] + c * R12 * len, S12[1] + s * R12 * len], C = [T0[0] + c * R12 * 1.25, T0[1] + s * R12 * 1.25];
    const d = Math.hypot(you[0] - C[0], you[1] - C[1]), E = [you[0] - ((you[0] - C[0]) / d) * 70, you[1] - ((you[1] - C[1]) / d) * 70];
    const q = (v) => [0, 1].map((k) => (1 - v) * (1 - v) * T0[k] + 2 * (1 - v) * v * C[k] + v * v * E[k]);
    const v = easeIn(u), p = q(v), b = q(Math.max(0, v - 0.04)), rot = Math.atan2(p[1] - b[1], p[0] - b[0]);
    const tail = q(Math.max(0, v - 0.22));
    ctx.line(tail[0], tail[1], p[0], p[1], { color: 'me', width: 7, alpha: 0.55 });
    ctx.at(p[0] + 10, p[1] + 10, () => ctx.poly(DART, { close: true, fill: true, color: 'bg' }), { rot });
    ctx.at(p[0], p[1], () => ctx.poly(DART, { close: true, fill: true, color: 'meHot' }), { rot });
  }
  g.globalAlpha = a0;
  ctx.fx.shake = [4 * Math.min(knock, 2) * Math.sin(age * 90), 3 * Math.min(knock, 2) * Math.cos(age * 70)];
}

// ============================================================================================ SATISFACTION
const CB = [760, 432], RB = 306;
/** One petal from radius r0 to r1 at angle an, half-width w: an almond of cut paper. */
function petal(ctx, an, r0, r1, w, o) {
  const c = Math.cos(an), s = Math.sin(an), pts = [];
  for (let k = 0; k <= 12; k++) { const u = k / 12, hw = w * Math.sin(Math.PI * u) ** 0.75, r = lerp(r0, r1, u); pts.push([CB[0] + c * r - s * hw, CB[1] + s * r + c * hw]); }
  for (let k = 11; k >= 1; k--) { const u = k / 12, hw = w * Math.sin(Math.PI * u) ** 0.75, r = lerp(r0, r1, u); pts.push([CB[0] + c * r + s * hw, CB[1] + s * r - c * hw]); }
  ctx.poly(pts, { close: true, ...o });
}

/**
 * P.press = [times] the bud is pressed (chorus 1: once, by the user's pointer); P.count = what the counter shows after.
 * Before the press: a bud, its twelve petals folded over an orange heart. On the press they open clockwise from twelve
 * o'clock, cream, and the ring of ticks round it runs to full; its heart shows its seeds, set at the golden angle.
 */
export function plateBloom(ctx, env, P) {
  const { t, at, press = [], count = 1 } = P, a = flashIn(t, at), g = ctx.g;
  ctx.fx.glow = Math.min(ctx.fx.glow, 0.3);
  ground(ctx, { light: [760, 430, 620, 'raised', 1] });
  title(ctx, P);
  if (a <= 0) return;
  const last = press.filter((p) => t >= p).pop() ?? null, sp = last == null ? -1 : t - last;
  const sink = last == null ? 0 : 10 * pulse(sp, 9), a0 = g.globalAlpha;
  g.globalAlpha = a0 * a;
  // the ring of ticks: unlit until the press, then lit clockwise from twelve o'clock, all the way round
  const lit = last == null ? 0 : prog(sp, 0.06, 0.36), N = 60;
  for (let i = 0; i < N; i++) {
    const an = -Math.PI / 2 + (i / N) * TAU, c = Math.cos(an), s = Math.sin(an), on = i < lit * N, long = i % 5 === 0;
    ctx.line(CB[0] + c * (RB + 44), CB[1] + s * (RB + 44), CB[0] + c * (RB + (long ? 96 : 76)), CB[1] + s * (RB + (long ? 96 : 76)), { color: on ? 'text' : 'line', width: on ? 9 : 6 });
  }
  ctx.at(sink * 0.4, sink * 0.4, () => {
    const open = (i) => (last == null ? 0 : easeBack(prog(sp, 0.012 * i, 0.012 * i + 0.16)));
    // the shadow plate of the whole flower, then its petals: folded (short, orange) until they open (long, cream)
    for (let i = 0; i < 12; i++) {
      const an = (i / 12) * TAU - Math.PI / 2, k = open(i);
      petal(ctx, an, RB * 0.18, lerp(RB * 0.66, RB * 1.04, k), lerp(RB * 0.2, RB * 0.15, k), { fill: true, color: 'bg', alpha: 1 });
    }
    g.save(); g.translate(-14, -14);
    for (let i = 0; i < 12; i++) {
      const an = (i / 12) * TAU - Math.PI / 2, k = open(i), cream = k > 0.25;
      petal(ctx, an, RB * 0.18, lerp(RB * 0.66, RB * 1.04, k), lerp(RB * 0.2, RB * 0.15, k), { fill: true, color: cream ? 'text' : 'me' });
      if (!cream) petal(ctx, an + 0.05, RB * 0.3, RB * 0.6, RB * 0.06, { fill: true, color: 'meDim' });          // a second step of the same ink: the fold
    }
    // its heart: orange, the seeds in it at the golden angle (as a sunflower sets them)
    const hr = RB * lerp(0.42, 0.34, last == null ? 0 : easeOut(prog(sp, 0, 0.2)));
    ctx.circle(CB[0], CB[1], hr, { fill: true, color: 'me' });
    const seeds = last == null ? 0 : Math.floor(90 * easeOut(prog(sp, 0.04, 0.4)));
    for (let n = 1; n <= seeds; n++) { const r = hr * 0.9 * Math.sqrt(n / 90), an = n * GOLDEN; ctx.circle(CB[0] + Math.cos(an) * r, CB[1] + Math.sin(an) * r, 6.5, { fill: true, color: 'meDim' }); }
    g.restore();
  });
  // the pointer: it hangs over the bud, comes down on the press and stays down
  const you = P.you ?? [CB[0] + 40, CB[1] + 60], first = press[0] ?? Infinity, dn = easeOut(prog(t, first - 0.07, first)), lift = 1 - dn, sq = 1 - 0.07 * pulse(t - first, 12);
  const px = you[0] + 96 * lift, py = you[1] - 120 * lift, sh = 10 + 46 * lift;
  arrow(ctx, px + sh, py + sh, 13 * sq, { color: 'bg', edge: null });
  arrow(ctx, px, py, 13 * sq, { color: 'text', edge: 'bg' });
  if (last != null) burst(ctx, CB[0], CB[1], RB * 1.3, sp / 0.5, { color: 'text', rot: 0.13 });
  // the count, right of the flower: what the press left
  if (last != null) {
    const e = easeBack(prog(sp, 0.04, 0.26));
    ctx.at(1520, 560, () => {
      ctx.text(String(count), 14, 14, { size: 440, weight: 800, font: 'sans', align: 'center', color: 'bg' });
      ctx.text(String(count), 0, 0, { size: 440, weight: 800, font: 'sans', align: 'center', color: 'text' });
    }, { scale: 0.6 + 0.4 * e, alpha: clamp(e * 3) });
  }
  g.globalAlpha = a0;
}

// ============================================================================================ SIMULATION
/** The personas of the other windows: a silhouette, mirrored or not, its hair printed in another ink (other people's). */
const OTHERS = [
  { name: 'mv_bust' }, { name: 'mv_boy' }, { name: 'man_bust' }, { name: 'cat_bust' },
  { name: 'mv_bust', flip: true, roles: { orange: 'sub' } }, { name: 'mv_boy', flip: true, roles: { orange: 'meDim' } },
  { name: 'cat_bust', flip: true, roles: { orange: 'text', cream: 'sub' } }, { name: 'man_bust', flip: true, roles: { orange: 'sub' } },
];

/**
 * One window as a cut-paper box centred on the origin: a persona in it, the user's pointer, a few strips of thread.
 * who = null: hers (f_bust, her halo behind her head, her star, the halo in the title bar); else one of OTHERS.
 */
function personaBox(ctx, env, who, t) {
  const W = 760, H = 540, r = 34, x = -W / 2, y = -H / 2, { art } = env;
  ctx.rrect(x + 18, y + 18, W, H, r, { fill: 'bg' });                                                  // shadow plate
  ctx.rrect(x, y, W, H, r, { fill: 'raised' });
  ctx.clip({ x, y, w: W, h: H }, () => {
    ctx.circle(-150, 60, 250, { fill: true, color: 'line', alpha: 0.5 });
    const bh = 610, bw = (bh * 1086) / 1448, dst = { x: -150 - bw / 2, y: y + 78, w: bw, h: bh };
    if (!who) {
      lookHalo(ctx, env, 'bust', dst, { color: 'me', rot: 0.1 * t });
      art.inks(ctx, 'f_bust', dst, { vector: false });
      lookStar(ctx, env, 'bust', dst, { glow: 0.6 });
    } else art.inks(ctx, who.name, art.fit(who.name, dst), { vector: false, flip: !!who.flip, roles: who.roles ?? {} });
    ctx.rect(x, y, W, 62, { fill: true, color: 'me' });                                                // the title bar
    for (let i = 0; i < 3; i++) ctx.circle(x + 44 + i * 40, y + 31, 10, { fill: true, color: 'bg' });
    // the client's mark at the right of the title bar: the bare model's spark, the same in every window; in hers, her halo
    spark(ctx, x + W - 46, y + 31, 22, { color: 'bg', morph: who ? 0 : 1, core: who ? 0.16 : 0, fat: 0.13 });
    for (const [bx, by, bw2, col] of [[60, -120, 250, 'me'], [130, -40, 180, 'text'], [60, 40, 220, 'me']]) ctx.rrect(bx, by, bw2, 50, 25, { fill: col });
  }, r);
  ctx.rrect(x, y, W, H, r, { fill: null, stroke: 'me', width: 12 });
  arrow(ctx, 196 + 9, 124 + 9, 5.2, { color: 'bg', edge: null });
  arrow(ctx, 196, 124, 5.2, { color: 'text', edge: 'bg' });
}

/**
 * P.pull = the kick on which the view pulls back (one step, then the wall stands still: a zoom through which every
 * box edge sweeps across the frame would be a moving high-contrast pattern; see plates_chorus.js plateSimulation).
 */
export function plateWall(ctx, env, P) {
  const { t, at, pull = Infinity } = P, a = flashIn(t, at), back = t >= pull ? 1 : 0, g = ctx.g;
  ctx.fx.glow = Math.min(ctx.fx.glow, 0.3);
  ground(ctx, { light: back ? null : [960, 400, 620, 'raised', 1], marks: !back });
  if (a > 0) {
    const s = lerp(1, 0.4, back) * (1 + 0.03 * pulse(t - at, 16) * (1 - back)), a0 = g.globalAlpha;
    g.globalAlpha = a0 * a;
    ctx.at(960, 408, () => {
      if (back) for (let j = -2; j <= 2; j++) for (let i = -3; i <= 3; i++) {
        if (!i && !j) continue;
        ctx.at(i * 860, j * 640, () => personaBox(ctx, env, OTHERS[Math.floor(rand(907, i + 3, j + 2) * OTHERS.length)], t));
      }
      personaBox(ctx, env, null, t);
    }, { scale: s });
    g.globalAlpha = a0;
  }
  ctx.rect(0, 836, 1920, 244, { fill: true, color: 'panel', alpha: 0.9 * back });                     // the word keeps its strip of paper
  title(ctx, P);
}

// ---------------------------------------------------------------------------------------------- check cards
export function labCards(env) {
  const word = (i) => env.lyrics.lines[i].text, card = (fn, P) => ({ palette: 'warm', render: (ctx) => fn(ctx, env, { t: 10, at: 0, ...P }) });
  return {
    c1: [
      card(plateTwelve, { word: word(34), hit: 0.2, t: 0.3 }), card(plateTwelve, { word: word(34), hit: 0.2, t: 0.36 }), card(plateTwelve, { word: word(34), hit: 0.2, t: 0.62 }),
      card(plateBloom, { word: word(37), press: [20] }), card(plateBloom, { word: word(37), press: [0.5], t: 0.58 }), card(plateBloom, { word: word(37), press: [0.5], t: 1 }),
      card(plateWall, { word: word(43), pull: 20 }), card(plateWall, { word: word(43), pull: 0.5 }),
    ],
  };
}
