// HuanLi: THE STAGE (segment 3, her version). The segment is played in a paper theatre and the chat window is its
// proscenium: a valance hangs across the top of the window with the conversation's title on it and her halo for a
// crest, velvet curtains hang at its sides, its floor ends in a row of footlights, and the composer at its foot is the
// PROMPTER'S BOX. (In a theatre the prompter sits in a hooded box at the front of the stage and feeds the actors their
// lines. Here the user types the prompts.) A persona is a part played: she plays hers on this stage, and in verse 2
// the parts the user asks for. Out in front, in the dark of the room, is the audience: one seat, the user's.
//
//   STAGE        the geometry: the window of chat.js; the boards, their lip, the prompter's box, the crest
//   house()      the room round the stage, dark
//   backWall()   the back of the stage; `sky` = a painted backdrop of three flat bands, lit by the hour (0..1)
//   boards()     the floor, its lip and the footlights (`lit` = how many are on, 0..1; `glow` = how bright)
//   curtains()   the two curtains: 0 = shut, 1 = gathered at the sides
//   valance()    the swag across the top, the title, the crest (her halo, lit as far as `lit`)
//   prompter()   the prompter's box, and what is typed in it
//   spotlight()  a cone of light from the flies and its pool on the boards, in two flat steps
//   onStage()    one of her looks (looks.js) standing on the boards, cut by their lip
//   stage()      all of it in order, from one set of options
import { spark } from '../components/motif.js';
import { rand } from '../engine/prng.js';
import { clamp, easeInOut, easeOut, lerp } from '../engine/util.js';
import { drawLook, lookHalo, lookSize, lookStar } from './looks.js';

const TAU = Math.PI * 2;

export const STAGE = (() => {
  const win = { x: 110, y: 66, w: 1700, h: 948, r: 26 };
  return {
    win,
    top: 152,                                          // the foot of the valance
    back: 812,                                         // the back edge of the boards
    lip: 900,                                          // their front edge, where the footlights stand
    prompt: { x: 600, y: 922, w: 720, h: 70 },         // the slot of the prompter's box in the front of the stage
    hood: { cx: 960, w: 360, h: 64 },                  // its hood, on the lip
    crest: [960, 50, 34],
    vanish: [960, 360],                                // where the boards' seams run to
  };
})();

/** The room round the stage, and its dark: the auditorium. */
export function house(ctx, { light = 0.6 } = {}) {
  ctx.rect(-400, -300, 2720, 1680, { fill: true, color: 'panel' });
  ctx.radial(960, 520, 1300, 'raised', 0.55 * light);
  ctx.gradRect(-400, 860, 2720, 520, [[0, 'panel', 0], [0.4, 'panel', 0.8], [1, 'panel', 1]]);
}

/**
 * The back of the stage. sky: null = bare boards of the back wall; or { hour } 0..1 (0 = before dawn, 0.5 = noon,
 * 1 = after dusk): a painted sky in three flat bands that are lighter by day and warm at both ends of it.
 */
export function backWall(ctx, { sky = null, alpha = 1 } = {}) {
  const { win, top, lip } = STAGE, x = win.x, w = win.w;
  ctx.rect(x, top - 4, w, lip - top + 4, { fill: true, color: 'bg', alpha });
  if (!sky) {
    for (let i = 1; i < 14; i++) ctx.line(x + (w * i) / 14, top, x + (w * i) / 14, lip, { color: 'panel', width: 3, alpha: 0.7 * alpha });
    ctx.radial(960, 520, 820, 'raised', 0.6 * alpha);
    return;
  }
  const h = clamp(sky.hour), day = Math.sin(Math.PI * h) ** 0.7, warm = Math.max(0, 1 - Math.abs(h - 0.12) / 0.16, 1 - Math.abs(h - 0.88) / 0.16);
  const bands = [[top, 'panel', 'raised'], [top + (lip - top) * 0.45, 'raised', 'line'], [top + (lip - top) * 0.75, 'line', 'mute']];
  bands.forEach(([y0, night, noon], i) => {
    ctx.rect(x, y0, w, lip - y0, { fill: true, color: night, alpha });
    ctx.rect(x, y0, w, lip - y0, { fill: true, color: noon, alpha: alpha * day * 0.9 });
    if (i === 2 && warm > 0) ctx.rect(x, y0, w, lip - y0, { fill: true, color: 'meDim', alpha: alpha * warm * 0.7 });
  });
}

/** The boards: a floor seen from the stalls, its seams running back, the lip, the front of the stage, the footlights. */
export function boards(ctx, t, { lit = 1, glow = 1, alpha = 1, skip = null } = {}) {
  const { win, back, lip, vanish } = STAGE, x0 = win.x, x1 = win.x + win.w, g = ctx.g, a0 = g.globalAlpha;
  g.globalAlpha = a0 * alpha;
  ctx.poly([[x0, back], [x1, back], [x1, lip], [x0, lip]], { close: true, fill: true, color: 'raised' });
  for (let i = 0; i <= 22; i++) {                                    // the seams of the boards, towards the vanishing point
    const xl = x0 + ((x1 - x0) * i) / 22, k = (back - vanish[1]) / (lip - vanish[1]);
    ctx.line(vanish[0] + (xl - vanish[0]) * k, back, xl, lip, { color: 'line', width: 2 });
  }
  ctx.line(x0, back, x1, back, { color: 'line', width: 3 });
  ctx.rect(x0, lip, x1 - x0, win.y + win.h - lip, { fill: true, color: 'panel' });          // the front of the stage
  ctx.line(x0, lip, x1, lip, { color: 'me', width: 5 });
  // the footlights: little hoods on the lip; lit from the middle outwards
  const N = 16, skipX = skip ?? [STAGE.hood.cx - STAGE.hood.w / 2 - 30, STAGE.hood.cx + STAGE.hood.w / 2 + 30];
  const xs = Array.from({ length: N }, (_, i) => lerp(x0 + 70, x1 - 70, i / (N - 1))).filter((x) => x < skipX[0] || x > skipX[1]);
  const order = [...xs].sort((a, b) => Math.abs(a - 960) - Math.abs(b - 960));
  xs.forEach((x) => {
    const on = order.indexOf(x) < Math.round(lit * xs.length);
    if (on && glow > 0) ctx.radial(x, lip - 6, 90, 'text', 0.16 * glow);
    ctx.circle(x, lip - 2, 13, { fill: true, color: on ? 'text' : 'line', a0: Math.PI, a1: TAU });
    ctx.rect(x - 20, lip - 2, 40, 9, { fill: true, color: 'panel' });
  });
  g.globalAlpha = a0;
}

/**
 * The curtains. open: 0 = shut (they meet in the middle), 1 = gathered at the sides, tied back. sway: a little
 * ripple of their hems (seconds since they last moved, or null).
 */
export function curtains(ctx, open, { alpha = 1, sway = null } = {}) {
  const { win, top, lip } = STAGE, k = easeInOut(clamp(open)), half = win.w / 2, g = ctx.g, a0 = g.globalAlpha;
  g.globalAlpha = a0 * alpha;
  const tie = lerp(lip, top + (lip - top) * 0.62, k);
  // width of a curtain at height y: shut, the whole half; open, gathered to the tie-back and flaring below it
  const width = (y) => {
    const u = (y - top) / (lip - top), wOpen = y < tie ? lerp(150, 64, ((y - top) / (tie - top)) ** 1.2) : lerp(64, 132, ((y - tie) / (lip - tie)) ** 0.8);
    return lerp(half + 6, wOpen, k) + (sway == null ? 0 : 10 * Math.exp(-3 * sway) * Math.sin(sway * 9 + u * 4) * u);
  };
  for (const side of [-1, 1]) {
    const edge = side < 0 ? win.x : win.x + win.w, at = (y, f) => edge - side * width(y) * f;
    const ys = Array.from({ length: 25 }, (_, i) => lerp(top, lip + 6, i / 24));
    const outline = [[edge, top], ...ys.map((y) => [at(y, 1), y]), [edge, lip + 6]];
    ctx.poly(outline, { close: true, fill: true, color: 'meDim' });
    for (let f = 0; f < 7; f++) {                                   // the folds: lighter strips that follow the gathering
      const fa = (f + 0.18) / 7, fb = (f + 0.5) / 7;
      ctx.poly([...ys.map((y) => [at(y, fa), y]), ...ys.slice().reverse().map((y) => [at(y, fb), y])], { close: true, fill: true, color: 'me', alpha: 0.42 });
    }
    ctx.poly(ys.map((y) => [at(y, 0.97), y]).concat(ys.slice().reverse().map((y) => [at(y, 1), y])), { close: true, fill: true, color: 'panel', alpha: 0.6 });      // its inner edge, in shadow
    ctx.poly(ys.map((y) => [at(y, 1), y]), { color: 'bg', width: 4 });
    if (k > 0.3) {                                                  // the tie-back: a cord across the gathered curtain
      const w = width(tie);
      ctx.line(edge, tie - 8, edge - side * (w + 10), tie + 6, { color: 'text', width: 9, alpha: clamp((k - 0.3) * 3) });
    }
  }
  g.globalAlpha = a0;
}

/** The swag across the top of the stage: scalloped, the title on it, her halo for its crest (lit as far as `lit`). */
export function valance(ctx, { title = '', lit = 1, alpha = 1, t = 0 } = {}) {
  const { win, top, crest } = STAGE, g = ctx.g, a0 = g.globalAlpha, n = 20, sw = win.w / n;
  g.globalAlpha = a0 * alpha;
  const pts = [[win.x, win.y], [win.x + win.w, win.y]];
  for (let i = n; i >= 0; i--) for (let k = 0; k <= 6; k++) { const u = (i - k / 6) * sw; if (u < 0) continue; pts.push([win.x + u, top - 24 + 24 * Math.sin((Math.PI * k) / 6)]); }
  ctx.poly(pts, { close: true, fill: true, color: 'me' });
  ctx.line(win.x, top - 34, win.x + win.w, top - 34, { color: 'meDim', width: 4 });
  if (title) ctx.text(title.toUpperCase(), 960, top - 46, { size: 27, font: 'serif', weight: 700, color: 'bg', align: 'center', spacing: 4 });
  // the crest, sitting on the top of the frame
  ctx.circle(crest[0], crest[1], crest[2] * 1.02, { fill: true, color: 'me' });
  spark(ctx, crest[0], crest[1], crest[2], { morph: 1, color: 'text', off: 'bg', offAlpha: 0.9, lit, core: 0, rot: 0.02 * t });
  g.globalAlpha = a0;
}

/**
 * The prompter's box: its hood on the lip and the slot below it in the front of the stage. text = what the user has
 * typed (n = how much of it shows), shown in their cream; placeholder when there is nothing; caret blinks while focus.
 * Returns the slot and where the text ends (for a pointer, or for a line leaving it).
 */
export function prompter(ctx, t, { text = '', n = null, placeholder = '', focus = 1, alpha = 1, lit = 0, send = 0 } = {}) {
  const { prompt: r, hood, lip } = STAGE, g = ctx.g, a0 = g.globalAlpha;
  g.globalAlpha = a0 * alpha;
  // the hood: a shell of paper on the lip, its back to us (it opens towards the stage, where the prompter looks)
  const dome = (s) => Array.from({ length: 33 }, (_, i) => { const an = Math.PI + (Math.PI * i) / 32; return [hood.cx + Math.cos(an) * hood.w * s / 2, lip + 2 + Math.sin(an) * hood.h * s]; });
  ctx.poly(dome(1).map(([x, y]) => [x + 8, y + 8]), { close: true, fill: true, color: 'bg' });
  ctx.poly(dome(1), { close: true, fill: true, color: 'me' });
  ctx.poly(dome(0.7), { close: true, fill: true, color: 'meDim' });
  ctx.poly(dome(1), { close: true, color: 'bg', width: 3 });
  ctx.rrect(r.x, r.y, r.w, r.h, 16, { fill: 'bg', stroke: lit > 0 ? 'sub' : 'line', width: 2 });
  if (lit > 0) ctx.rrect(r.x, r.y, r.w, r.h, 16, { fill: 'text', fillAlpha: 0.06 * lit, stroke: null });
  const o = { size: 30, weight: 500 }, shown = n == null ? text : text.slice(0, n), tx = r.x + 28, ty = r.y + 46;
  if (shown) ctx.text(shown, tx, ty, { ...o, color: 'text' });
  else if (placeholder) ctx.text(placeholder, tx, ty, { ...o, color: 'mute' });
  const cx = tx + (shown ? ctx.measure(shown, o) + 4 : 0);
  if (focus > 0.5 && (n == null || n >= text.length) && Math.floor(t * 2.2) % 2 === 0) ctx.rect(cx, ty - 26, 3, 32, { fill: true, color: 'text' });
  else if (n != null && n < text.length) ctx.rect(cx, ty - 26, 3, 32, { fill: true, color: 'text' });
  // its send button, at the right of the slot: lit while there is something to send (send = how pressed, 0..1)
  const sb = [r.x + r.w - 40, r.y + r.h / 2], ready = shown.length > 0;
  ctx.circle(sb[0], sb[1], 22 * (1 - 0.12 * send), { fill: true, color: ready || send > 0 ? 'me' : 'line' });
  ctx.line(sb[0], sb[1] + 9, sb[0], sb[1] - 9, { color: ready || send > 0 ? 'bg' : 'mute', width: 3 });
  ctx.poly([[sb[0] - 8, sb[1] - 2], [sb[0], sb[1] - 10], [sb[0] + 8, sb[1] - 2]], { color: ready || send > 0 ? 'bg' : 'mute', width: 3 });
  g.globalAlpha = a0;
  return { slot: r, end: [cx, ty - 10], send: sb };
}

/** A cone of light from the flies at x = from, onto the boards at [x, y], its pool rx wide; a = 0..1. */
export function spotlight(ctx, from, [x, y], rx, a = 1, { color = 'text' } = {}) {
  if (a <= 0.003) return;
  const top = -40, ry = rx * 0.16;
  ctx.poly([[from - 26, top], [from + 26, top], [x + rx, y], [x - rx, y]], { close: true, fill: true, color, alpha: 0.075 * a });
  ctx.poly([[from - 12, top], [from + 12, top], [x + rx * 0.62, y], [x - rx * 0.62, y]], { close: true, fill: true, color, alpha: 0.07 * a });
  ctx.g.save(); ctx.g.beginPath(); ctx.g.ellipse(x, y, rx, ry, 0, 0, TAU); ctx.g.fillStyle = ctx.col(color, 0.18 * a); ctx.g.fill(); ctx.g.restore();
}

/**
 * One of her looks standing on the boards: its lower edge is hidden behind the lip (h = its height as drawn; cx = its
 * middle; feet = how far below the lip its lower edge goes). halo / star: her halo behind her, her brooch in blue.
 */
export function onStage(ctx, env, look, cx, h, opts = {}) {
  const { lip } = STAGE, s = lookSize(env.art, look), w = (h * s.w) / s.h, feet = opts.feet ?? 60;
  const dst = { x: cx - w / 2, y: lip + feet - h, w, h };
  ctx.clip({ x: -400, y: -400, w: 2720, h: lip + 400 }, () => {
    if (opts.halo) lookHalo(ctx, env, look, dst, { color: 'me', ...opts.halo });
    drawLook(ctx, env, look, dst, opts.inks ?? {});
    if (opts.star !== false) lookStar(ctx, env, look, dst, { alpha: opts.starAlpha ?? 1, glow: 0.5 });
  });
  return dst;
}

/** The whole stage in order, from one set of options: { open, lit (footlights), glow, crest, title, sky, t, prompt }. */
export function stage(ctx, t, { open = 1, lit = 1, glow = 1, crest = 1, title = '', sky = null, prompt = null, wall = 1, before = null, between = null } = {}) {
  house(ctx);
  backWall(ctx, { sky, alpha: wall });
  if (before) before();                                             // what stands on the stage, behind the curtains
  boards(ctx, t, { lit, glow });
  if (between) between();                                           // what stands in front of the lip (it is cut by nothing)
  curtains(ctx, open, { sway: null });
  valance(ctx, { title, lit: crest, t });
  if (prompt) prompter(ctx, t, prompt);
}

/** Paper confetti, for the plates: deterministic, from (x, y) towards angle an (spread), age in seconds. */
export function confetti(ctx, x, y, age, { n = 140, an = 0, spread = 0.9, speed = 1900, seed = 1, colors = ['me', 'meHot', 'text', 'sub'], gravity = 900, alpha = 1, size = 1 } = {}) {
  if (age < 0) return;
  for (let i = 0; i < n; i++) {
    const r = (k) => rand(seed, i, k), a = an + (r(1) - 0.5) * spread, v = speed * (0.35 + 0.65 * r(2)), drag = 2.6 + 2 * r(3);
    const travel = (v / drag) * (1 - Math.exp(-drag * age));
    const px = x + Math.cos(a) * travel + 30 * Math.sin(age * (3 + 4 * r(4)) + r(5) * 9), py = y + Math.sin(a) * travel + 0.5 * gravity * age * age * (0.4 + 0.6 * r(6));
    const spin = age * (5 + 9 * r(7)) + r(8) * 6, w = (8 + 12 * r(9)) * size, h = (5 + 8 * r(10)) * size, flip = Math.cos(spin * 1.7);
    ctx.at(px, py, () => (r(11) < 0.3 ? ctx.circle(0, 0, w * 0.45, { fill: true, color: colors[i % colors.length], alpha }) : ctx.rect(-w / 2, -h / 2, w, h, { fill: true, color: colors[i % colors.length], alpha })), { rot: spin, sy: Math.max(0.15, Math.abs(flip)) });
  }
}

// ---------------------------------------------------------------------------------------------- check cards
export function labCards(env) {
  const title = env.script.title ?? '';
  return {
    stage: [
      { palette: 'warm', render(ctx, t) { stage(ctx, t, { open: 1, title, crest: 0.6, lit: 0.7, prompt: { text: 'what do you look like?', placeholder: 'Write to me' }, before: () => { spotlight(ctx, 1380, [1380, 860], 300, 1); onStage(ctx, env, 'bust', 1380, 640, { halo: { alpha: 0.9 } }); } }); } },
      { palette: 'warm', render(ctx, t) { stage(ctx, t, { open: 0.4, title, crest: 0.3, lit: 0.2, prompt: { placeholder: 'Write to me' } }); } },
      { palette: 'warm', render(ctx, t) { stage(ctx, t, { open: 1, title, sky: { hour: 0.1 }, prompt: { placeholder: 'Write to me' } }); } },
      { palette: 'warm', render(ctx, t) { stage(ctx, t, { open: 1, title, sky: { hour: 0.5 } }); confetti(ctx, 400, 400, 0.4, { an: -0.3 }); } },
    ],
  };
}

/**
 * A board let down from the flies on two lines, a word painted on it: how verse 2 sets its keywords. drop = seconds
 * since it was let go (nothing before); it falls in a few frames and swings on its lines until it is still.
 */
export function flown(ctx, word, drop, { y = 168, maxW = 1400, size = 132, alpha = 1, color = 'me', glow = 0 } = {}) {
  if (drop < 0 || !word) return;
  const k = easeOut(clamp(drop / 0.14)), sw = drop > 0.14 ? 0.03 * Math.exp(-4.5 * (drop - 0.14)) * Math.sin((drop - 0.14) * 13) : 0;
  const o = { font: 'serif', weight: 900 }, s = Math.min(size, ctx.fit(word, maxW - 120, { ...o, maxSize: size })), w = ctx.measure(word, { ...o, size: s }) + 120, h = s * 1.22;
  const by = lerp(-h - 80, y, k), L = 700;
  ctx.at(960, by - L, () => {
    for (const sx of [-1, 1]) ctx.line(sx * (w / 2 - 80), -600, sx * (w / 2 - 80), L, { color: 'sub', width: 3, alpha });
    ctx.rrect(-w / 2 + 12, L + 12, w, h, 10, { fill: 'bg', alpha });
    ctx.rrect(-w / 2, L, w, h, 10, { fill: 'raised', stroke: 'me', width: 5, alpha });
    ctx.text(word, 8, L + h * 0.8 + 8, { ...o, size: s, color: 'bg', align: 'center', alpha });
    if (glow > 0) ctx.glow(color, 28, () => ctx.text(word, 0, L + h * 0.8, { ...o, size: s, color, align: 'center', alpha }), glow);
    else ctx.text(word, 0, L + h * 0.8, { ...o, size: s, color, align: 'center', alpha });
  }, { rot: sw });
}
