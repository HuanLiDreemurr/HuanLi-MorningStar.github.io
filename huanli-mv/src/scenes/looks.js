// HuanLi: HER LOOKS. Segment 3 shows her in four more pictures than the front bust; each is drawn by one call here.
// A look is printed from its own picture once that picture is in the film (assets/character/<file>.png, marked
// `"huanli": true` in regions.json); until then from a stand-in: f_bust and a few cut-paper shapes drawn in code.
// Either way it takes the same options as art.inks() (roles, offset, plates, alpha) and has the same landmarks, so a
// shot never needs to know which of the two it is printing.
//
//   reach   the picture she sends of herself: reaching out, wild flowers in her open paw      (file f_reach)
//   tabby   playing a tabby cat: stripes on her fur, paws up, a striped tail                 (file cat_paws)
//   boy     the boy: faceless, his outfit in inverted inks (a dark jacket, cream diamonds)   (file boy_bust)
//   god     pointing to the side, a book held to her chest                                  (file f_point)
//   bust    the front bust itself (f_bust), for symmetry
import { morningStar, spark } from '../components/motif.js';
import { ground } from '../components/plate.js';
import { PERSONA } from '../components/persona.js';

const TAU = Math.PI * 2;
/** Where each look is printed from once it is real, and the canvas (source px) its stand-in is drawn on. */
const LOOKS = {
  bust: { file: 'f_bust', w: 1086, h: 1448 },
  reach: { file: 'f_reach', w: 1086, h: 1448 },
  tabby: { file: 'cat_paws', w: 1086, h: 1448, onBust: true },
  boy: { file: 'boy_bust', w: 1086, h: 1448, onBust: true },
  god: { file: 'f_point', w: 2300, h: 1448 },
};
/**
 * The looks marked onBust are drawn into the frame of f_bust: a dst that holds f_bust holds them in register with it
 * (match cuts). Their pictures say how: regions.json `register` = [s, tx, ty], p' = s * p + [tx, ty] in source px.
 */
const onto = (art, look, dst) => {
  const f = LOOKS[look].file, r = LOOKS[look].onBust && isReal(art, look) ? art.regions[f]?.register ?? [1, 0, 0] : null;
  if (!r) return dst;
  const k = dst.w / 1086, s = art.size(f);
  return { x: dst.x + k * r[1], y: dst.y + k * r[2], w: s.w * r[0] * k, h: s.h * r[0] * k };
};
/** Landmarks of the stand-ins (source px of their canvas; [x, y] or [cx, cy, r] or [x, y, w, h], as regions.json). */
const STAND = {
  star: [544, 1024, 64], face: [337, 454, 454, 454], halo: [548, 520, 360], chin: [548, 905], figure: [40, 58, 1006, 1343],
  reach: { palm: [318, 1196, 70] }, god: { finger: [2236, 1016, 20], figure: [40, 58, 2220, 1343] },
};
/** The line between her head and her outfit in f_bust (source px): the boy's outfit is printed inverted below it. */
const COLLAR_Y = 915;

/** True once the look's own picture is in the film. */
export const isReal = (art, look) => { const f = LOOKS[look]?.file; return look === 'bust' || (!!art.ink?.[f] && art.regions?.[f]?.huanli === true); };
/** The look's canvas size in source px. */
export const lookSize = (art, look) => (isReal(art, look) && !LOOKS[look].onBust ? art.size(LOOKS[look].file) : { w: LOOKS[look].w, h: LOOKS[look].h });
/** dst for a look drawn `h` virtual px tall with its top-left at (x, y). */
export const lookRect = (art, look, x, y, h) => { const s = lookSize(art, look); return { x, y, w: (h * s.w) / s.h, h }; };

/** A landmark of a look as drawn into dst: { x, y, w, h, cx, cy, r } in virtual px (r = half its width), or null. */
export function lookPoint(art, look, key, dst) {
  const real = isReal(art, look);
  if (real) dst = onto(art, look, dst);
  const s = real ? art.size(LOOKS[look].file) : lookSize(art, look), k = dst.w / s.w;
  let v = null;
  if (real) { const r = art.region(LOOKS[look].file, key); v = r && [r.x, r.y, r.w, r.h]; }
  else {
    const raw = STAND[look]?.[key] ?? STAND[key];
    if (raw) v = raw.length === 3 ? [raw[0] - raw[2], raw[1] - raw[2], 2 * raw[2], 2 * raw[2]] : raw.length === 2 ? [raw[0], raw[1], 0, 0] : raw;
  }
  if (!v) return null;
  const x = dst.x + v[0] * k, y = dst.y + v[1] * k, w = v[2] * k, h = v[3] * k;
  return { x, y, w, h, cx: x + w / 2, cy: y + h / 2, r: w / 2 };
}

/** The plates a call of art.inks() would print, as [{ ink, role, offset, alpha }] (the stand-ins' shapes follow them). */
function platesOf({ roles = {}, offset = {}, plates = null }) {
  if (plates) return plates.map((p) => ({ ink: p.ink, role: p.role, offset: p.offset ?? [0, 0], alpha: p.alpha ?? 1 }));
  const role = (k, d) => (roles[k] === undefined ? d : roles[k]);
  return [['cream', 'text'], ['orange', 'me'], ['black', 'panel']].map(([ink, d]) => ({ ink, role: role(ink, d), offset: offset[ink] ?? [0, 0], alpha: 1 }));
}
/** Print shapes ink by ink: shapes = { cream: [...], orange: [...], black: [...] }, each [{ poly } | { line, w } | { circle: [x, y, r] }] in source px. */
function printShapes(ctx, dst, s, shapes, opts, { keyline = true } = {}) {
  const k = dst.w / s.w, a = opts.alpha ?? 1, list = platesOf(opts);
  const map = ([x, y]) => [dst.x + x * k, dst.y + y * k];
  // how much of each ink is printed yet (art.inks() `reveal`: k, or { k, dir }: a wipe, from the top unless dir says)
  const rv = (ink) => {
    const r = opts.reveal, v = r == null ? 1 : typeof r === 'object' && !('k' in r) ? (ink in r ? r[ink] : 1) : r;
    return typeof v === 'object' ? { k: v.k, dir: v.dir ?? 'down' } : { k: v, dir: 'down' };
  };
  const put = (sh, color, alpha, grow = 0, dx = 0, dy = 0, ink = null) => {
    const g = ctx.g, { k: wipe, dir } = ink ? rv(ink) : { k: 1 };
    if (wipe <= 0) return;
    g.save();
    if (wipe < 1) {
      const B = 4000, r = dir === 'up' ? [dst.x - B, dst.y + dst.h * (1 - wipe), dst.w + 2 * B, B] : dir === 'right' ? [dst.x - B, dst.y - B, B + dst.w * wipe, dst.h + 2 * B]
        : dir === 'left' ? [dst.x + dst.w * (1 - wipe), dst.y - B, B, dst.h + 2 * B] : [dst.x - B, dst.y - B, dst.w + 2 * B, B + dst.h * wipe];
      g.beginPath(); g.rect(...r); g.clip();
    }
    g.translate(dx, dy);
    if (sh.poly) { ctx.poly(sh.poly.map(map), { close: true, fill: true, color, alpha }); if (grow) ctx.poly(sh.poly.map(map), { close: true, color, alpha, width: grow * 2 }); }
    else if (sh.line) { g.lineCap = 'round'; g.lineJoin = 'round'; ctx.poly(sh.line.map(map), { color, alpha, width: (sh.w + grow * 2 / k) * k }); g.lineCap = 'butt'; }
    else if (sh.circle) ctx.circle(...map(sh.circle), sh.circle[2] * k + grow, { fill: true, color, alpha });
    g.restore();
  };
  // a keyline of the page's darkest ink round everything: cream paper shapes must not run into her cream fur
  if (keyline && a > 0) { const kl = list.find((p) => p.ink === 'black' || p.ink === 'all'); if (kl?.role) for (const ink of ['cream', 'orange', 'black']) for (const sh of shapes[ink] ?? []) put(sh, kl.role, a * kl.alpha, 2.2, ...kl.offset, kl.ink === 'all' ? null : 'black'); }
  for (const p of list) {
    if (!p.role) continue;
    const inks = p.ink === 'all' ? ['cream', 'orange', 'black'] : [p.ink];
    for (const ink of inks) for (const sh of shapes[ink] ?? []) put(sh, p.role, a * p.alpha, 0, ...p.offset, ink);
  }
}

// ============================================================================================ the stand-ins
/** A paw seen from the front, as a fist or open: palm centre (x, y), size r (source px), rot. Returns cream / black shapes. */
function paw(x, y, r, { rot = 0, open = false } = {}) {
  const P = (u, v) => [x + (u * Math.cos(rot) - v * Math.sin(rot)) * r, y + (u * Math.sin(rot) + v * Math.cos(rot)) * r];
  const blob = Array.from({ length: 28 }, (_, i) => { const an = (i / 28) * TAU, bump = open ? 0 : 0.08 * Math.max(0, -Math.sin(an)) * Math.abs(Math.sin(an * 4)); return P(Math.cos(an) * (1 + bump), Math.sin(an) * (0.86 + bump)); });
  const toes = [-0.42, 0, 0.42].map((u) => ({ line: [P(u, -0.86), P(u * 0.9, -0.45)], w: r * 0.09 }));
  return { cream: [{ poly: blob }], black: open ? [] : toes };
}
/** One small wild flower: n petals round a centre, a stem down to (sx, sy). */
function flower(cx, cy, r, sx, sy, n = 5, rot = 0) {
  const petals = Array.from({ length: n }, (_, i) => {
    const an = rot + (i / n) * TAU, c = Math.cos(an), s = Math.sin(an), w = r * 0.42;
    return { poly: [[cx + c * r * 0.25 - s * w * 0.4, cy + s * r * 0.25 + c * w * 0.4], [cx + c * r - s * w, cy + s * r + c * w], [cx + c * r * 1.12, cy + s * r * 1.12], [cx + c * r + s * w, cy + s * r - c * w], [cx + c * r * 0.25 + s * w * 0.4, cy + s * r * 0.25 - c * w * 0.4]] };
  });
  return { orange: petals, cream: [{ circle: [cx, cy, r * 0.34] }], black: [{ line: [[cx, cy + r * 0.3], [sx, sy]], w: r * 0.16 }] };
}
const merge = (...parts) => parts.reduce((m, p) => { for (const k of ['cream', 'orange', 'black']) m[k] = [...(m[k] ?? []), ...(p[k] ?? [])]; return m; }, {});

/** reach: her open paw at the lower left, held out, with a few wild flowers in it. */
function reachShapes() {
  const [px, py] = STAND.reach.palm;
  const sleeve = { poly: [[-60, 1470], [-60, 1300], [196, 1150], [262, 1300], [80, 1470]] };
  const diamonds = [[30, 1360], [140, 1300]].map(([x, y]) => ({ poly: [[x, y - 46], [x + 56, y], [x, y + 46], [x - 56, y]] }));
  const cuff = { poly: [[176, 1146], [214, 1128], [282, 1286], [244, 1306]] };
  const fingers = [-0.95, -0.42, 0.12, 0.62].map((u, i) => { const an = -0.35 - 1.25 + u * 0.9; return { circle: [px + Math.cos(an) * 116, py + Math.sin(an) * 104, 34 - 3 * Math.abs(i - 1.5)] }; });
  return merge({ cream: [sleeve], black: diamonds, orange: [cuff] }, paw(px, py, 112, { rot: -0.35, open: true }), { cream: fingers },
    flower(px - 40, py - 120, 46, px - 10, py + 10, 5, 0.3), flower(px + 50, py - 150, 40, px + 10, py + 6, 6, 0.1), flower(px + 4, py - 70, 34, px, py + 20, 5, 0.9));
}
/** tabby: stripes on her fur (clipped to it), two paws raised beside her face, a striped tail. */
const TABBY_STRIPES = [
  [[478, 318], [494, 420]], [[548, 296], [548, 404]], [[618, 318], [602, 420]],          // the forehead
  [[392, 380], [452, 452]], [[704, 380], [644, 452]],
  [[120, 590], [262, 618]], [[112, 672], [252, 690]], [[140, 756], [262, 760]],           // the cheeks
  [[976, 590], [834, 618]], [[984, 672], [844, 690]], [[956, 756], [834, 760]],
  [[172, 186], [250, 214]], [[150, 262], [232, 284]], [[164, 340], [236, 352]],           // the left ear (the right one has its own)
];
function tabbyShapes() {
  const tail = Array.from({ length: 24 }, (_, i) => { const u = i / 23, an = -0.4 - u * 2.6; return [70 + 150 * Math.cos(an) * (1 - 0.5 * u) - 40 * u, 1100 - 470 * u + 120 * Math.sin(an) * (1 - u)]; });
  const tailStripes = [0.25, 0.45, 0.65, 0.82].map((u) => { const i = Math.round(u * 23); return { line: [[tail[i][0] - 40, tail[i][1] - 6], [tail[i][0] + 40, tail[i][1] + 6]], w: 22 }; });
  return { tail: { cream: [{ line: tail, w: 92 }], orange: tailStripes }, front: merge(paw(282, 870, 92, { rot: 0.25 }), paw(814, 870, 92, { rot: -0.25 })) };
}
/** god: an arm from her right shoulder, straight out to the side, pointing. */
function godShapes() {
  const sleeve = { poly: [[860, 1080], [1780, 960], [1800, 1100], [930, 1290]] };
  const diamonds = [[1080, 1100], [1300, 1068], [1520, 1036]].map(([x, y]) => ({ poly: [[x, y - 54], [x + 70, y], [x, y + 54], [x - 70, y]] }));
  const cuff = { poly: [[1730, 952], [1790, 944], [1810, 1112], [1752, 1124]] };
  const fist = { poly: Array.from({ length: 24 }, (_, i) => { const an = (i / 24) * TAU; return [1900 + Math.cos(an) * 104, 1048 + Math.sin(an) * 86]; }) };
  const finger = { line: [[1960, 1000], [2216, 1014]], w: 46 };
  const thumb = { line: [[1880, 966], [1956, 950]], w: 40 };
  return { cream: [sleeve, fist, finger, thumb], black: diamonds, orange: [cuff] };
}

/**
 * Print a look into dst (art.inks() options). `parts` (stand-ins only): false leaves the code-drawn shapes out
 * (what is left is f_bust, in register with the real look's bust).
 */
export function drawLook(ctx, env, look, dst, opts = {}) {
  const { art } = env;
  if (isReal(art, look)) { art.inks(ctx, LOOKS[look].file, onto(art, look, dst), opts); return; }
  const s = lookSize(art, look), k = dst.w / s.w, bust = { x: dst.x, y: dst.y, w: 1086 * k, h: 1448 * k };
  if (look === 'bust' || opts.parts === false) { art.inks(ctx, 'f_bust', bust, opts); return; }
  if (look === 'tabby') {
    const T = tabbyShapes();
    printShapes(ctx, dst, s, T.tail, opts);
    art.inks(ctx, 'f_bust', bust, opts);
    const stripes = platesOf(opts).find((p) => p.ink === 'orange' || p.ink === 'all');
    if (stripes?.role) art.inkClip(ctx, 'f_bust', bust, () => {                      // the stripes lie on her fur only
      const g = ctx.g; g.lineCap = 'round';
      for (const [a, b] of TABBY_STRIPES) ctx.line(dst.x + a[0] * k + stripes.offset[0], dst.y + a[1] * k + stripes.offset[1], dst.x + b[0] * k + stripes.offset[0], dst.y + b[1] * k + stripes.offset[1], { color: stripes.role, width: 30 * k, alpha: opts.alpha ?? 1 });
      g.lineCap = 'butt';
    }, { ink: 'cream', exact: true });
    printShapes(ctx, dst, s, T.front, opts);
    return;
  }
  if (look === 'boy') {                                                             // the outfit, inverted: cream <-> black
    const r = opts.roles ?? {}, inv = { cream: r.black === undefined ? 'panel' : r.black, orange: r.orange, black: r.cream === undefined ? 'text' : r.cream };
    const cut = dst.y + COLLAR_Y * k, g = ctx.g;
    g.save(); g.beginPath(); g.rect(dst.x - 4000, dst.y - 4000, 9000, cut - dst.y + 4000); g.clip();
    art.inks(ctx, 'f_bust', bust, opts);
    g.restore();
    g.save(); g.beginPath(); g.rect(dst.x - 4000, cut, 9000, 9000); g.clip();
    art.inks(ctx, 'f_bust', bust, { ...opts, roles: inv, plates: opts.plates ? opts.plates.map((p) => ({ ...p, ink: p.ink === 'cream' ? 'black' : p.ink === 'black' ? 'cream' : p.ink })) : null });
    g.restore(); ctx._font = '';
    return;
  }
  if (look === 'reach') { art.inks(ctx, 'f_bust', bust, opts); printShapes(ctx, dst, s, reachShapes(), opts); return; }
  if (look === 'god') { art.inks(ctx, 'f_bust', bust, opts); printShapes(ctx, dst, s, godShapes(), opts); return; }
}

/** Her halo behind the look's head (region `halo`; scale 1.9 = its ring clears her hair); extra options go to spark(). */
export function lookHalo(ctx, env, look, dst, { scale = 1.9, ...o } = {}) {
  const h = lookPoint(env.art, look, 'halo', dst);
  if (h) spark(ctx, h.cx, h.cy, h.r * scale, { morph: 1, ...o });
}
/** Her brooch, in her blue, over the look (the pictures have it in the black plate). */
export function lookStar(ctx, env, look, dst, { alpha = 1, glow = 0.5, rot = 0, scale = 1 } = {}) {
  const s = lookPoint(env.art, look, 'star', dst);
  if (s && alpha > 0.003) ctx.glow(PERSONA.star, 26, () => morningStar(ctx, s.cx, s.cy, s.r * scale, { alpha, rot }), glow * alpha);
}

// ---------------------------------------------------------------------------------------------- check cards
export function labCards(env) {
  const { art } = env;
  const one = (ctx, look, x, y, h, o = {}) => {
    const r = lookRect(art, look, x, y, h), f = lookPoint(art, look, 'figure', r) ?? r;
    ctx.circle(f.cx, y + h * 0.45, Math.min(f.w, h) * 0.42, { fill: true, color: 'raised' });
    lookHalo(ctx, env, look, r, { color: 'me', alpha: 0.9 });
    drawLook(ctx, env, look, r, o);
    lookStar(ctx, env, look, r);
    ctx.text(`${look}${isReal(art, look) ? '' : ' (stand-in)'}`, x, y + h + 30, { size: 22, font: 'mono', color: 'sub' });
  };
  return {
    looks: [
      { palette: 'warm', render(ctx) { ground(ctx, { light: null }); ['bust', 'reach', 'tabby', 'boy'].forEach((l, i) => one(ctx, l, 40 + i * 470, 120, 600)); } },
      { palette: 'warm', render(ctx) { ground(ctx, { light: null }); one(ctx, 'god', 40, 160, 560); one(ctx, 'god', 1000, 160, 560, { roles: { cream: null } }); } },
    ],
  };
}
