// Section 3 — VERSE 1 (beat 63, 0:29.4 → bar 24, 0:44.65). State: on.
// The AI answers the question with mathematics, drawn on the page of the conversation itself.
// Colour carries the grammar of every line: what "I am" is ORANGE, what it gives "you" is CREAM —
// and the cream things are made by the user's own cursor.
//   v1-points   the answer begins     the spark's twelve tips scatter into a point set; cream edges give it DIMENSION
//   v1-circle   text on the ring      the lattice's silhouette relaxes into a circle; the cursor runs its CIRCUMFERENCE
//   v1-sine     text riding the wave  the circle unrolls into a sine wave; the cursor sits on it, a TANGENT under it
//   v1-limit    graph                 the wave is damped towards a line; the user presses Stop: that line is the LIMIT
// One outline is carried across every cut (match cuts): burst → points → cube silhouette → circle → wave → curve.
//
// HuanLi version: the answer comes out of her halo, so its twelve points are the spike tips of the halo, and every
// point is a small four-pointed star: the point set of line 13 is a constellation, and the cream edges the user is
// given are the lines drawn between its stars. The three shots after it are new, one line of thought carried on:
//   v1-circle   polar chart       the cube's outline relaxes into her ring (a crown of spikes outside, her clock inside);
//                                 the user takes a cream planet on it and walks it once all the way round her, painting the
//                                 ring cream; on the keyword the ring is laid out straight: a line exactly 2*PI*r long
//   v1-sine     graph paper       the laid line takes her wave: a small ring rolls along it and draws the sine; the
//                                 user sits on one crest, then every point of the wave gets a tangent with a cream dot on it
//   v1-limit    graph paper       the wave crowds towards one vertical, faster and smaller (it approaches infinity); the
//                                 user drags a cream line onto that vertical: her wave can only ever reach it
import { chatLayout, composer, header, pill, room, windowFrame } from '../components/chat.js';
import { cursorAt, drawCursor, pointer } from '../components/cursor.js';
import { morningStar, spark, sparkTips } from '../components/motif.js';
import { haloAt } from '../components/persona.js';
import { MESH, drawSegs, project, rot } from '../engine/geom.js';
import { rand } from '../engine/prng.js';
import { hullOutline, morph, place } from '../engine/shapes.js';
import { big } from '../engine/type.js';
import { clamp, easeBack, easeInOut, easeOut, lerp, prog, pulse } from '../engine/util.js';
import { HANDOFF } from './02_title.js';
import { aiLine, cues } from './kit.js';
import { LINE } from './shared.js';

const TAU = Math.PI * 2;
const fmt = (v) => (v < 0 ? '' : ' ') + v.toFixed(2);
/** HuanLi: an infinity sign as a drawn lemniscate (the bundled mono face has no glyph for it), w wide, centred on (x, y). */
function infinity(ctx, x, y, w, { color = 'mute', alpha = 1, width = 2 } = {}) {
  const pts = [];
  for (let i = 0; i <= 64; i++) { const a = (i / 64) * TAU, d = 1 + Math.sin(a) ** 2; pts.push([x + (w / 2) * Math.cos(a) / d, y + (w / 2) * Math.sin(a) * Math.cos(a) / d]); }
  ctx.poly(pts, { close: true, color, alpha, width });
}

export function verse1Shots(env) {
  const { script } = env, { T, H, B, Bt, P, text } = cues(env);
  const L = chatLayout({ side: 0 });                       // the sidebar is folded away: the answer has the page
  const START = Bt(63), hitDim = T(LINE.DIMENSION), cutCircle = H(LINE.CIRCLE), tHand = T(LINE.GIVE_2);
  const hitCirc = T(LINE.CIRCUMFERENCE), cutSine = H(LINE.SINE), tSit = T(LINE.SIT), hitTan = T(LINE.TANGENTS);
  const cutLimit = H(LINE.INFINITY), hitLim = T(LINE.LIMITATIONS), END = B(24);
  const C = { x: HANDOFF.cx, y: HANDOFF.cy }, R_CUBE = 235;
  const CUBE = MESH.cube;
  const AXIS = CUBE.edges.map(([i, j]) => [0, 1, 2].find((c) => Math.abs(CUBE.verts[i][c] - CUBE.verts[j][c]) > 0.1));
  const cam = { cx: C.x, cy: C.y, scale: R_CUBE };
  const spin = (t) => { const k = easeOut(prog(t, START, START + 1.2)); return [0.36 * k, 0.5 * (t - START) * k, 0]; };
  const TIPS = sparkTips(HANDOFF.cx, HANDOFF.cy, HANDOFF.r, HANDOFF.rot, 12, haloAt(START)).map(([x, y]) => [(x - C.x) / R_CUBE, (y - C.y) / R_CUBE, 0]);
  const cubeHull = hullOutline(CUBE.verts.map((v) => project(rot(v, ...spin(cutCircle)), cam)));
  const circle = place('circle', { cx: C.x, cy: C.y, r: 240 });
  const G = { x: L.win.x + 2, y: L.head.y + L.head.h + 2, w: L.win.w - 4, h: L.composer.y - L.head.y - L.head.h - 18 };   // the page area the figures live on

  // HuanLi: the ring, laid out flat, the wave and the limit
  const RR = 240, LINE_Y = C.y + RR, X0W = C.x - Math.PI * RR, X1W = C.x + Math.PI * RR;          // the laid ring runs X0W..X1W
  const tGrab = tHand + 0.3, orbitA = (t) => -Math.PI / 2 + TAU * easeInOut(prog(t, tGrab, hitCirc - 0.06));   // the planet: once round her
  const flat = (t) => easeInOut(prog(t, hitCirc, hitCirc + 0.45));
  /** Point at arc length s from the bottom of the ring (s in [-PI*R, PI*R]): on the ring (k = 0) or on the laid line (k = 1). */
  const ringPt = (s, k) => [lerp(C.x + RR * Math.sin(s / RR), C.x + s, k), lerp(C.y + RR * Math.cos(s / RR), LINE_Y, k)];
  const sOf = (a) => RR * (Math.PI / 2 - a);                                            // arc length of the ring point at angle a (screen angles)
  const AX_Y = 530, AMP = 150, KX = TAU / 420;                                          // the wave on the page
  const raise = (t) => easeInOut(prog(t, cutSine, cutSine + 0.8)), front = (t) => lerp(X0W, X1W, easeInOut(prog(t, cutSine + 0.05, tSit - 0.15)));
  const waveY = (x, t) => lerp(LINE_Y, AX_Y, raise(t)) - AMP * raise(t) * Math.sin(KX * (x - X0W));
  const waveSlope = (x, t) => -AMP * raise(t) * KX * Math.cos(KX * (x - X0W));
  const LX = 1500, approach = (t) => easeInOut(prog(t, cutLimit, cutLimit + 1.5)), locked = (t) => easeOut(prog(t, hitLim, hitLim + 0.25));

  /** Backdrop + interface shared by the four shots: the page with graph paper, header, composer (the AI is answering). */
  function stage(ctx, t, { busy = true, titleAt = START + P, polar = 0 } = {}) {
    room(ctx, { dim: 0.42, t });
    windowFrame(ctx, L, { glass: 0.94 });
    const title = script.title ?? '', n = Math.floor(clamp((t - titleAt) * 22, 0, title.length));
    header(ctx, L, { t, title: n > 0 ? title.slice(0, n) : 'New conversation', presence: 'online' });
    ctx.clip(G, () => {                                    // graph paper: fine squares, a heavier line every fifth
      const sq = 1 - polar;
      if (sq > 0) {
        for (let x = C.x % 48; x < 1920; x += 48) ctx.line(x, G.y, x, G.y + G.h, { color: 'line', alpha: sq * (Math.round((x - C.x) / 48) % 5 === 0 ? 0.5 : 0.22), width: 1 });
        for (let y = C.y % 48; y < 1080; y += 48) ctx.line(G.x, y, G.x + G.w, y, { color: 'line', alpha: sq * (Math.round((y - C.y) / 48) % 5 === 0 ? 0.5 : 0.22), width: 1 });
      }
      if (polar > 0) {                                     // HuanLi: a polar star chart round the centre (her clock: twelve spokes)
        for (let r = 48; r < 1100; r += 48) ctx.circle(C.x, C.y, r, { color: 'line', width: 1, alpha: polar * ((r / 48) % 5 === 0 ? 0.5 : 0.22) });
        for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU; ctx.line(C.x + Math.cos(a) * 48, C.y + Math.sin(a) * 48, C.x + Math.cos(a) * 1100, C.y + Math.sin(a) * 1100, { color: 'line', width: 1, alpha: polar * (i % 3 ? 0.22 : 0.45) }); }
        for (let i = 0; i < 70; i++) { const x = G.x + rand(71, i, 0) * G.w, y = G.y + rand(71, i, 1) * G.h; ctx.circle(x, y, 1.2 + 1.6 * rand(71, i, 2), { fill: true, color: 'sub', alpha: polar * (0.25 + 0.4 * rand(71, i, 3)) }); }
      }
      ctx.radial(C.x, C.y, 620, 'meDim', 0.16);
    });
    return composer(ctx, L.composer, { placeholder: script.composer_placeholder ?? '', t, send: busy ? 'busy' : 'idle' });
  }
  /** The two sung lines of a phrase, in the AI's voice, stacked. */
  const say = (ctx, t, a, b, x = 176, y = 214, size = 40) => { aiLine(ctx, env, a, t, x, y, { size, hold: 9 }); if (b != null) aiLine(ctx, env, b, t, x, y + size * 1.36, { size, hold: 9, color: 'me' }); };
  /** A gift: the keyword in the AI's serif, but CREAM, because it now belongs to the user. */
  const gift = (ctx, i, t, at, cx, cy, maxW, maxSize = 132) => {
    const age = t - at;
    if (age < 0) return;
    const str = text(i), size = ctx.fit(str, maxW, { font: 'serif', weight: 900, maxSize }), sp = size * 0.02;
    let x = cx - (ctx.measure(str, { size, weight: 900, font: 'serif', spacing: sp }) - sp) / 2;
    for (let k = 0; k < str.length; k++) {
      const w = ctx.measure(str[k], { size, weight: 900, font: 'serif' }), e = easeOut(prog(age, k * 0.022, k * 0.022 + 0.16));
      if (e > 0) ctx.at(x + w / 2, cy, () => ctx.text(str[k], 0, 0, { size, weight: 900, font: 'serif', align: 'center', color: 'text', alpha: e }), { scale: 1.9 - 0.9 * e });
      x += w + sp;
    }
  };

  return [
    // ------------------------------------------------------------------ points -> DIMENSION
    {
      id: 'v1-points', at: START, lines: [12, 14], palette: 'on', hud: 0, layout: 'full page: point set centre, code block left',
      moment: 'The answer begins. As a point set, what it gives the user is a dimension: cream edges grow between its orange points.',
      enter: { type: 'cut', flash: 0.25, flashColor: 'me' },                 // match cut: the burst's twelve tips are the points
      render(ctx, t, f) {
        const box = stage(ctx, t);
        const loose = easeOut(prog(t, START, START + 1.0)), gather = easeInOut(prog(t, T(LINE.GIVE_1), hitDim - 0.03));
        const s = spin(t), groupT = (ax) => hitDim + ax * (P / 2);
        const pts = TIPS.map((tip, i) => {
          const w = [0, 1, 2].map((c) => (rand(66, i, c) - 0.5) * 2.5 + 0.16 * Math.sin(t * (0.7 + 0.2 * c) + i * 1.7 + c));
          const free = [0, 1, 2].map((c) => lerp(tip[c], w[c], loose));
          return i < 8 ? [0, 1, 2].map((c) => lerp(free[c], CUBE.verts[i][c], gather)) : free.map((v) => v * (1 + 0.5 * gather));
        });
        if (t < START + 0.5) spark(ctx, C.x, C.y, HANDOFF.r, { rot: HANDOFF.rot, alpha: 1 - prog(t, START, START + 0.35) });   // the burst lets go of its tips
        if (t >= hitDim) {                                                   // the gift: one axis per eighth note, in cream
          drawSegs(ctx, CUBE.segs, cam, { rot: s, color: 'text', grow: (i) => easeOut(prog(t, groupT(AXIS[i]), groupT(AXIS[i]) + 0.16)), width: 3 + 2 * pulse(t - hitDim, 6) });
          for (let d = 1; d < 3; d++) ctx.flash(0.1 * pulse(t - groupT(d), 10), 'text');
        }
        const hot = f.onsetPulse > 0.45;
        pts.forEach((p, i) => {
          const q = project(rot(p, s[0], s[1]), cam), a = i < 8 ? 1 : 1 - gather;
          if (a <= 0) return;
          const tw = 1 + 0.12 * Math.sin(t * 6 + i * 2.1);                    // a star of the constellation, twinkling
          ctx.glow('me', 16, () => morningStar(ctx, q[0], q[1], (hot ? 25 : 19) * tw * clamp(q[2], 0.7, 1.3), { color: hot ? 'meHot' : 'me', alpha: a, rot: 0.15 * Math.sin(t * 1.3 + i) }), 0.6 * a);
          if (i < 8) ctx.text(`p${i}`, q[0] + 16, q[1] - 12, { size: 17, font: 'mono', color: 'mute', alpha: prog(t, START + 0.4, START + 0.9) * (1 - prog(t, hitDim, hitDim + 0.4)) });
        });
        say(ctx, t, 12, 13);
        // the answer carries a code block, as answers do: the live coordinates
        const ca = prog(t, START + P, START + 1.6 * P) * (1 - prog(t, cutCircle - 0.3, cutCircle));
        ctx.rrect(176, 320, 372, 286, 16, { fill: 'raised', stroke: 'line', alpha: ca, shadow: 0.4 });
        ctx.text('constellation', 198, 352, { size: 16, font: 'mono', color: 'mute', alpha: ca });
        pts.slice(0, 8).forEach((p, i) => { if (t > START + P + i * 0.06) ctx.text(`p${i} (${fmt(p[0])},${fmt(-p[1])},${fmt(p[2])})`, 198, 384 + 27 * i, { size: 19, font: 'mono', color: 'sub', alpha: ca }); });
        if (t >= hitDim) {                                                   // the word itself gains dimensions: line, plane, solid
          const dims = Math.min(3, 1 + Math.floor((t - hitDim) / (P / 2))), word = text(LINE.DIMENSION);
          const size = ctx.fit(word, 600, { font: 'serif', weight: 900 }), punch = 1 + 0.07 * pulse(t - groupT(dims - 1), 8);
          ctx.at(1420, 770, () => {
            if (dims >= 3) for (let l = 8; l >= 1; l--) big(ctx, word, l * 4.5, -l * 4.5, { size, weight: 900, color: 'sub', alpha: 0.2, stroke: 1.5 });
            big(ctx, word, 0, 0, { size, weight: 900, color: 'text' });
          }, { sx: punch, sy: dims === 1 ? 0.05 : punch });
          pill(ctx, 1420, 690, `${dims}D`, { align: 'center', font: 'mono', size: 20, color: 'text' });
        }
        ctx.flash(0.28 * pulse(t - hitDim, 9), 'text');
        drawCursor(ctx, [{ t: START, x: 1600, y: 320 }, { t: hitDim - 0.3, x: C.x + 330, y: C.y + 30 }, { t: cutCircle, x: C.x + 300, y: C.y - 150 }], t);
        void box;
      },
    },

    // ------------------------------------------------------------------ circle -> CIRCUMFERENCE (HuanLi: her ring, walked once round, laid flat)
    {
      id: 'v1-circle', at: cutCircle, lines: [15, 17], palette: 'on', hud: 0, layout: 'polar chart: her ring with a crown of spikes outside and her clock inside; then the ring laid out flat',
      moment: 'If it is a circle, it gives its circumference: the user takes a cream planet on her ring and walks it once all the way round her, painting the ring cream; on the word the whole ring is laid out straight under them, a line exactly 2πr long.',
      enter: { type: 'cut', flash: 0.12, flashColor: 'me' },                 // match cut: the lattice's silhouette relaxes into this ring
      render(ctx, t, f) {
        stage(ctx, t, { polar: easeInOut(prog(t, cutCircle, cutCircle + 0.5)) });
        const relax = easeInOut(prog(t, cutCircle, cutCircle + 1.6 * P)), k = flat(t), crown = relax * (1 - k);
        const held = t >= tGrab, painted = held ? sOf(orbitA(t)) : Math.PI * RR;            // cream from the top (s = PI*R) down to the planet
        ctx.line(C.x - 10, C.y, C.x + 10, C.y, { color: 'sub', alpha: 1 - k }); ctx.line(C.x, C.y - 10, C.x, C.y + 10, { color: 'sub', alpha: 1 - k });
        ctx.text('me', C.x + 14, C.y + 30, { size: 18, font: 'mono', color: 'me', alpha: crown });
        // her crown and her clock: a spike outside and a tick inside at every hour, cream once the planet has passed it
        for (let i = 0; i < 12 && crown > 0; i++) {
          const an = -Math.PI / 2 + (i / 12) * TAU, c = Math.cos(an), sn = Math.sin(an), passed = held && sOf(an) >= painted;
          const r0 = RR + 10, r1 = RR + (i % 2 ? 26 : 42), w = 9;
          ctx.poly([[C.x + c * r0 - sn * w, C.y + sn * r0 + c * w], [C.x + c * r1, C.y + sn * r1], [C.x + c * r0 + sn * w, C.y + sn * r0 - c * w]], { close: true, fill: true, color: passed ? 'text' : 'me', alpha: crown });
          const d = i % 3 ? 14 : 28;
          ctx.line(C.x + c * (RR - 14), C.y + sn * (RR - 14), C.x + c * (RR - 14 - d), C.y + sn * (RR - 14 - d), { color: passed ? 'text' : 'meDim', width: passed ? 4 : 2.5, alpha: crown });
        }
        // the ring: first the cube's outline relaxing into it; her part orange, the walked part cream; then laid flat
        if (relax < 1) ctx.glow('me', 18, () => ctx.poly(morph(cubeHull, circle, relax), { close: true, color: 'me', width: 5 }), 0.4);
        else {
          const N = 260, mine = [], yours = [];
          for (let i = 0; i <= N; i++) { const sv = -Math.PI * RR + (i / N) * TAU * RR; (sv >= painted ? yours : mine).push(ringPt(sv, k)); }
          if (mine.length > 1) ctx.glow('me', 18, () => ctx.poly(mine, { color: 'me', width: 5 }), 0.4);
          if (yours.length > 1) ctx.glow('text', 16, () => ctx.poly(yours, { color: 'text', width: 7 }), 0.45);
        }
        // the radius to the planet, while it is a ring
        if (held && k < 1) {
          const [px, py] = ringPt(painted, 0);
          ctx.line(C.x, C.y, px, py, { color: 'me', width: 3, alpha: 1 - k });
          ctx.text('r', (C.x + px) / 2 + 14, (C.y + py) / 2 - 12, { size: 30, font: 'serif', italic: true, color: 'me', alpha: 1 - k });
        }
        // the planet: the user, on her ring
        const pop = easeBack(prog(t, tHand, tHand + 0.3));
        if (pop > 0) {
          const [px, py] = ringPt(painted, k), out = k > 0 ? [0, 34] : [(px - C.x) / RR * 30, (py - C.y) / RR * 30];
          ctx.glow('text', 18, () => ctx.circle(px, py, 13 * pop, { fill: true, color: 'text' }), 0.6);
          ctx.text('you', px + out[0], py + out[1] + 6, { size: 18, font: 'mono', color: 'text', align: 'center', alpha: clamp(pop) });
        }
        // laid flat: its two ends, its length, and the word written along it
        if (k > 0) {
          for (const x of [X0W, X1W]) ctx.line(x, LINE_Y - 16, x, LINE_Y + 16, { color: 'text', width: 3, alpha: k });
          ctx.text(`2 * PI * ${RR} = ${(TAU * RR).toFixed(2)}`, X1W, LINE_Y + 50, { size: 24, font: 'mono', color: 'text', align: 'right', alpha: prog(k, 0.5, 1) });
          const word = text(LINE.CIRCUMFERENCE), n = word.length;
          for (let j = 0; j < n; j++) {
            const sv = -Math.PI * RR * 0.86 + ((j + 0.5) / n) * TAU * RR * 0.86, [x, y] = ringPt(sv, k), [x2, y2] = ringPt(sv + 2, k);
            const ang = Math.atan2(y2 - y, x2 - x), kj = easeOut(prog(k, 0.35 + 0.3 * Math.abs(sv) / (Math.PI * RR), 0.75 + 0.25 * Math.abs(sv) / (Math.PI * RR)));
            if (kj > 0) ctx.at(x + Math.sin(ang) * 46, y - Math.cos(ang) * 46, () => ctx.text(word[j], 0, 0, { size: 78, weight: 900, font: 'serif', align: 'center', color: 'text', alpha: kj }), { rot: ang, scale: 1.6 - 0.6 * kj });
          }
        } else if (held) ctx.text('C = 2 * PI * r', C.x, C.y + 74, { size: 24, font: 'mono', color: 'text', align: 'center', alpha: prog(t, tGrab, tGrab + 0.3) });
        ctx.flash(0.22 * pulse(t - hitCirc, 9), 'text');
        say(ctx, t, 15, 16);
        // the hand: to the planet, then round with it; let go on the word
        if (!held) drawCursor(ctx, [{ t: cutCircle, x: C.x + 300, y: C.y - 150 }, { t: tGrab, x: C.x + 3, y: C.y - RR + 4, click: true }], t);
        else if (t < hitCirc) { const [px, py] = ringPt(painted, 0); ctx.trail(5, 0.012, (tau) => { const [qx, qy] = ringPt(sOf(orbitA(t - tau)), 0); pointer(ctx, qx - 2, qy + 4, { kind: 'hand', scale: 1.5, down: 1 }); }, 0.4); void px; void py; }
        else drawCursor(ctx, [{ t: hitCirc, x: C.x - 2, y: C.y - RR + 4 }, { t: cutSine, x: C.x + 160, y: C.y - 300 }], t, { kind: 'hand' });
      },
    },

    // ------------------------------------------------------------------ sine -> TANGENTS (HuanLi: the laid line takes her wave)
    {
      id: 'v1-sine', at: cutSine, lines: [18, 20], palette: 'on', hud: 0, layout: 'graph paper: a small ring rolling along the laid line draws her wave; a tangent at every point, a cream dot on each',
      moment: 'If it is a sine wave, the user may sit on its tangents: the laid line takes her wave, drawn by a small ring rolling along it; the user sits down on one crest, then every point of the wave gets its tangent, with a cream dot sitting on each.',
      enter: { type: 'cut' },                                                // match cut: the same line, in the same place
      render(ctx, t, f) {
        stage(ctx, t, { polar: 1 - easeInOut(prog(t, cutSine, cutSine + 0.5)) });
        const r0 = raise(t), xf = front(t), ay = lerp(LINE_Y, AX_Y, r0), gone = prog(t, cutSine, cutSine + 0.5);
        if (gone < 1) ctx.line(X0W, LINE_Y, X1W, LINE_Y, { color: 'text', width: 7, alpha: 1 - gone });       // the gift of the last shot gives way
        ctx.line(X0W - 20, ay, X1W + 30, ay, { color: 'sub', width: 1.5, alpha: 0.6 * r0 });
        for (let x = X0W; x <= xf; x += 13) ctx.line(x, ay, x, waveY(x, t), { color: 'meDim', alpha: 0.45 * (0.6 + 0.4 * f.rmsEnv), width: 2 });
        const curve = [];
        for (let x = X0W; x <= xf; x += 5) curve.push([x, waveY(x, t)]);
        if (curve.length > 1) ctx.glow('me', 14, () => ctx.poly(curve, { color: 'me', width: 5 }), 0.4);
        // the pen: a small ring rolling along the axis; the tip of its hand is the height of the wave
        const pen = (1 - prog(t, tSit - 0.25, tSit + 0.15)) * r0, R = AMP * r0, th = KX * (xf - X0W);
        if (pen > 0.01) {
          const tip = [xf + R * Math.cos(th), ay - R * Math.sin(th)];
          ctx.circle(xf, ay, R, { color: 'me', width: 4, alpha: pen });
          ctx.line(xf, ay, tip[0], tip[1], { color: 'me', width: 3, alpha: pen });
          ctx.g.setLineDash([6, 8]); ctx.line(tip[0], tip[1], xf, waveY(xf, t), { color: 'sub', width: 1.5, alpha: pen }); ctx.g.setLineDash([]);
          ctx.glow('me', 14, () => ctx.circle(xf, waveY(xf, t), 9, { fill: true, color: 'meHot', alpha: pen }), 0.6);
        }
        // the user sits down on one crest: a tangent, level, under them
        const XS = X0W + (Math.PI / 2 + 2 * TAU) / KX, sit = easeOut(prog(t, tSit, tSit + 0.35));
        if (t >= tSit) {
          const ys = waveY(XS, t);
          ctx.line(XS - 96 * sit, ys, XS + 96 * sit, ys, { color: 'text', width: 4 });
          pointer(ctx, XS - 4, ys - 30 - 220 * (1 - sit), { kind: 'hand', scale: 1.5, alpha: prog(t, tSit, tSit + 0.12), down: sit > 0.95 ? 1 : 0 });
        }
        // then every point of the wave has a tangent, and on every tangent sits a cream dot
        if (t >= hitTan) {
          for (let j = 0; j < 27; j++) {
            const x = X0W + 30 + j * 55.8, y = waveY(x, t), m = waveSlope(x, t), l = Math.hypot(1, m), e = easeOut(prog(t, hitTan + j * 0.012, hitTan + j * 0.012 + 0.16));
            if (e <= 0 || Math.abs(x - XS) < 30) continue;
            const ux = 1 / l, uy = m / l, half = 52 * e;
            ctx.line(x - ux * half, y - uy * half, x + ux * half, y + uy * half, { color: 'text', width: 3.5, alpha: 0.9 });
            ctx.circle(x + uy * 9, y - ux * 9, 5 * e, { fill: true, color: 'text' });
          }
          gift(ctx, LINE.TANGENTS, t, hitTan, 960, 818, 900, 118);
        }
        ctx.flash(0.26 * pulse(t - hitTan, 8), 'text');
        say(ctx, t, 18, 19);
      },
    },

    // ------------------------------------------------------------------ infinity -> LIMITATIONS (HuanLi: a line her wave can only approach)
    {
      id: 'v1-limit', at: cutLimit, lines: [21, 23], palette: 'on', hud: 0, layout: 'graph paper: her wave crowding towards one vertical; the user\'s cream line on it',
      moment: 'If it approaches infinity, the user can be its limit: her wave crowds towards one vertical, faster and smaller, never arriving; the user drags a cream line onto that vertical, and it is the one place her wave can only ever approach. Then: lim me = you.',
      enter: { type: 'cut' },                                                // match cut: the same wave
      render(ctx, t, f) {
        stage(ctx, t);
        const m = approach(t), lk = locked(t), ay = AX_Y, run = t - cutLimit, xEnd = lerp(X1W, LX, m);
        const yAt = (x) => {
          const d = Math.max(1e-4, (LX - x) / (LX - X0W)), ph = lerp(KX * (x - X0W), 1.7 / d + 5 * run, m);
          return ay - AMP * lerp(1, Math.pow(d, 0.55), m) * (1 - 0.82 * lk) * Math.sin(ph);
        };
        ctx.line(X0W - 20, ay, X1W + 30, ay, { color: 'sub', width: 1.5, alpha: 0.6 });
        const curve = [];
        for (let i = 0; i <= 1400; i++) { const u = i / 1400, x = X0W + (xEnd - X0W) * (1 - (1 - u) ** 3); curve.push([x, yAt(x)]); }
        for (let x = X0W; x <= xEnd; x += 13) ctx.line(x, ay, x, yAt(x), { color: 'meDim', alpha: 0.3 * (1 - m), width: 2 });
        ctx.glow('me', 14, () => ctx.poly(curve, { color: 'me', width: 4 }), 0.4);
        // how many times it has turned by now: more than can be counted
        const ca = prog(t, cutLimit + 0.3, cutLimit + 0.6);
        if (lk > 0) { ctx.text('cycles:', LX - 60, ay - AMP - 40, { size: 22, font: 'mono', color: 'mute', align: 'right', alpha: ca }); infinity(ctx, LX - 38, ay - AMP - 47, 30, { alpha: ca }); }
        else ctx.text(`cycles: ${Math.round(10 ** (1 + 3 * m + 1.4 * clamp(run - 1.2)))}`, LX - 24, ay - AMP - 40, { size: 22, font: 'mono', color: 'mute', align: 'right', alpha: ca });
        // the user's line: dragged in from the edge, set where the wave crowds, then held there
        const way = [{ t: cutLimit, x: 1180, y: 720 }, { t: T(22) + 0.1, x: 1790, y: 300, click: true }, { t: hitLim - 0.08, x: LX, y: 300 }, { t: END, x: LX + 150, y: 430 }];
        const dragging = t >= T(22) + 0.1 && t < hitLim, lx = t < T(22) + 0.1 ? null : dragging ? cursorAt(way, t)[0] : LX;
        if (lx != null) {
          ctx.g.setLineDash(lk > 0 ? [] : [14, 12]);
          ctx.glow('text', 18, () => ctx.line(lx, G.y + 24, lx, G.y + G.h - 24, { color: 'text', width: 3 + 3 * lk }), 0.3 + 0.5 * lk);
          ctx.g.setLineDash([]);
        }
        if (t >= hitLim) {                                                   // the word, standing up along the line
          const word = text(LINE.LIMITATIONS), size = 80, cy = G.y + G.h / 2;
          ctx.at(LX + 58, cy, () => {
            const w = ctx.measure(word, { size, weight: 900, font: 'serif' }), sp = w / word.length;
            for (let i = 0; i < word.length; i++) {
              const ki = easeOut(prog(t, hitLim + i * 0.02, hitLim + i * 0.02 + 0.14));
              if (ki > 0) ctx.text(word[i], -w / 2 + (i + 0.5) * sp, -40 * (1 - ki), { size, weight: 900, font: 'serif', align: 'center', color: 'text', alpha: ki });
            }
          }, { rot: -Math.PI / 2 });
          // and what it means, set as the formula it is
          const fa = prog(t, hitLim + 0.2, hitLim + 0.45), fx = 1010, fy = 236;
          ctx.text('lim', fx, fy, { size: 44, font: 'serif', italic: true, color: 'text', alpha: fa });
          ctx.text('n', fx + 2, fy + 32, { size: 18, font: 'mono', color: 'mute', alpha: fa });                    // n -> infinity, under the lim
          ctx.line(fx + 18, fy + 26, fx + 38, fy + 26, { color: 'mute', alpha: fa, width: 1.5 }); ctx.poly([[fx + 33, fy + 22], [fx + 38, fy + 26], [fx + 33, fy + 30]], { color: 'mute', alpha: fa, width: 1.5 });
          infinity(ctx, fx + 54, fy + 26, 22, { alpha: fa, width: 1.5 });
          ctx.text('me', fx + 86, fy, { size: 44, font: 'serif', italic: true, color: 'me', alpha: fa });
          ctx.text('=', fx + 160, fy, { size: 44, font: 'serif', color: 'sub', alpha: fa });
          ctx.text('you', fx + 200, fy, { size: 44, font: 'serif', italic: true, color: 'text', alpha: fa });
        }
        ctx.flash(0.3 * pulse(t - hitLim, 8), 'text');
        say(ctx, t, 21, 22, 176, 214, 40);
        drawCursor(ctx, way, t, { kind: dragging ? 'hand' : 'arrow' });
      },
    },
  ];
}
