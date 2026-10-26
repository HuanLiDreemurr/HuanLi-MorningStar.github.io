// HISTORY (v4): what flows under the spark while the user drags the AI's knowledge date back (04_pre1.js, pre1-date).
// One strip of cut paper in the three inks, far longer than the frame. From the right (now) to the left (then).
//
// HuanLi version: the history is the one she watched (the maker's 創世紀 and her diary, in years of 乐历 = A.D. here):
//
//   [now: A.D. 3111]  towers, a bunch of wild flowers at their feet  ·  the half-burnt city, a child with a book in its
//   burning door (2111)  ·  the temple that grew over the sun, its light getting out round it (1300)  ·  the one who sat up all night counting the stars
//   (308)  ·  [THE ERA LINE]  ·  her first three children, walking up to it  ·  the world before anyone: mountains, a
//   river, trees, birds  ·  the first light
//
// on one low line of roofs that joins them. Between two landmarks is a gap, and the gaps are where the spark is at the
// end of each pull of the hand (STOPS): what it has passed stands to its right, what it still knows to its left. Every landmark is a few LARGE flat shapes: no rows of thin columns, no
// arcades, nothing that would flicker when the strip is pulled fast. A landmark is drawn in one of three ways:
//
//   'dark'     one flat dark shape (what is seen while the strip moves fast; also the base of the inked state)
//   'ink'      its cream and orange plates printed onto that shape (as it slows)
//   'hollow'   only its outline: the spark has passed it, it is no longer known
//
// HuanLi additions:
//   - every era has its own SKY (stripSky, drawn under the strip on the known side): the city's glow, the fire's glow and
//     smoke, the light the temple stands in, the stars the stargazer counted, a warm ground under the children, the sky
//     before anyone, and the dawn, which grows as the spark reaches it
//   - LIVE parts, functions of song time: flames that move, embers going up, a river that glints, birds that beat their
//     wings, the children walking, and the sun of the first light, which rises with `rise` (0..1, given by the shot)
//   - a caption under every era (mono, from her diary), printed with the inked state only
//   - the three children are pictures (assets/character/kid_*.png), not polygons: `figs` of their era, drawn from the art
//     in the same three ways (silhouette, the picture's own plates, the outline of the whole figure)
//
// World x: 0 = now, negative = the past (strip units; 04_pre1.js maps years onto it and draws it at 0.86). y: 0 = the ground, up is negative.
// Pure functions (of song time too); lab set `history` shows the whole strip in one still (it has to read at a third of that size too).
import { ground } from '../components/plate.js';
import { rand } from '../engine/prng.js';

const TAU = Math.PI * 2;
const rect = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
const disc = (x, y, r, n = 20) => Array.from({ length: n }, (_, i) => [x + r * Math.cos((i / n) * TAU), y + r * Math.sin((i / n) * TAU)]);
/** A bar of width w from a to b (a limb, a stem, a constellation's edge: a line drawn as a shape). */
const bar = ([ax, ay], [bx, by], w) => { const l = Math.hypot(bx - ax, by - ay), nx = (-(by - ay) / l) * (w / 2), ny = ((bx - ax) / l) * (w / 2); return [[ax + nx, ay + ny], [bx + nx, by + ny], [bx - nx, by - ny], [ax - nx, ay - ny]]; };
/** What shows above the ground (y < 0) of a disc of radius r centred at (0, cy): a sun still rising. */
const cap = (r, cy, n = 44) => {
  const s0 = Math.max(-1, Math.min(1, -cy / r)), a0 = Math.PI - Math.asin(s0), a1 = TAU + Math.asin(s0);
  return Array.from({ length: n + 1 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / n; return [r * Math.cos(a), Math.min(0, cy + r * Math.sin(a))]; });
};
/** A chunky bird (a chevron) at x, y; its wingtips beat with t. */
const bird = (x, y, s = 1, t = 0, k = 0) => { const w = 9 * s * Math.sin(t * 9 + k * 2.3); return [[x - 34 * s, y - 8 * s + w], [x, y + 8 * s], [x + 34 * s, y - 8 * s + w], [x, y + 22 * s]]; };
/** A flame standing on (x, y); its tongues move with t. */
const flame = (x, y, s = 1, t = 0, k = 0) => {
  const f = (i) => 1 + 0.22 * Math.sin(t * 13 + k * 2.1 + i * 1.9) + 0.1 * Math.sin(t * 23 + k + i * 3.1);
  return [[x - 22 * s, y], [x - 13 * s, y - 34 * s * f(0)], [x - 3 * s, y - 15 * s], [x + 5 * s, y - 54 * s * f(1)], [x + 15 * s, y - 16 * s], [x + 19 * s, y - 28 * s * f(2)], [x + 23 * s, y]];
};

/** The context an era's sky / live drawing gets: o.at(x, y) = screen point of a local point, o.s = scale, o.t, o.rise, o.alpha. */
const pass = (o, ex) => ({ ...o, at: (x, y) => [o.scroll + (ex + x) * o.s, o.gy + y * o.s] });
/** Soft light at a local point (sky). */
const glowAt = (ctx, o, x, y, r, role, a) => { const [sx, sy] = o.at(x, y); ctx.radial(sx, sy, r * o.s, role, a * o.alpha); };
/** Stars at seeded places inside a local box, twinkling (sky). */
function stars(ctx, o, n, seed, [x0, y0, x1, y1], { size = 3, bright = 0.75 } = {}) {
  for (let i = 0; i < n; i++) {
    const [sx, sy] = o.at(x0 + (x1 - x0) * rand(seed, i, 0), y0 + (y1 - y0) * rand(seed, i, 1));
    const tw = 0.55 + 0.45 * Math.sin(o.t * (2 + 2 * rand(seed, i, 2)) + TAU * rand(seed, i, 3));
    ctx.circle(sx, sy, (0.8 + size * rand(seed, i, 4) ** 2) * o.s * 1.3, { fill: true, color: 'text', alpha: o.alpha * bright * tw });
  }
}

// the city that burnt: where its fires are (local), for flames, glow, smoke and embers
const FIRES = [[-200, -262, 1.1], [-50, -350, 0.9], [234, -230, 0.8]];
// the temple, and the sun it has grown over: right behind it, so that only its light gets out round the edges
const TEMPLE = [[-300, 0], [-300, -90], [-242, -90], [-242, -200], [-182, -200], [-182, -330], [-122, -330], [-122, -470], [-74, -470], [-74, -560], [-44, -560], [-44, -640], [-14, -640], [-14, -700], [0, -760], [14, -700], [14, -640], [44, -640], [44, -560], [74, -560], [74, -470], [122, -470], [122, -330], [182, -330], [182, -200], [242, -200], [242, -90], [300, -90], [300, 0]];
const SUN = [0, -500];
// the stars the stargazer is drawing into a figure (local)
const CHART = [[-200, -380], [-96, -452], [30, -420], [128, -492], [220, -388], [120, -340]];

/** [ink, outline] in print order. k = black (the silhouette itself), c = cream, o = orange; outline = points or (o) => points. */
export const ERAS = [
  {
    name: 'towers', x: -520, w: 680, label: 'A.D. 3111  ·  built again', parts: [
      ['k', [[-330, 0], [-330, -40], [-300, -40], [-300, -300], [-150, -300], [-150, -60], [-140, -60], [-140, -430], [-110, -430], [-110, -470], [-62, -470], [-62, -548], [-48, -548], [-48, -470], [10, -470], [10, -430], [40, -430], [40, -60], [60, -60], [60, -250], [190, -250], [190, -60], [200, -60], [200, -320], [310, -384], [310, -40], [330, -40], [330, 0]]],
      ['c', rect(-112, -410, 44, 300)], ['c', rect(-276, -272, 102, 34)], ['c', rect(-276, -204, 102, 34)], ['c', rect(84, -222, 82, 112)],
      ['o', [[200, -320], [310, -384], [310, -330], [200, -266]]], ['o', rect(-62, -548, 14, 78)],
      // at their feet the wild flowers she left on the earth
      ['k', bar([404, 0], [392, -40], 4)], ['k', bar([404, 0], [406, -48], 4)], ['k', bar([404, 0], [418, -36], 4)],
      ['c', disc(391, -44, 8, 10)], ['c', disc(406, -53, 9, 10)], ['o', disc(420, -40, 7, 10)],
    ],
    sky(ctx, o) { glowAt(ctx, o, 0, 0, 620, 'meDim', 0.32); },
  },
  {
    name: 'burnt city', x: -1420, w: 640, label: '2111  ·  enough', parts: [
      ['k', [[-320, 0], [-320, -180], [-282, -214], [-252, -170], [-232, -262], [-168, -262], [-150, -204], [-120, -232], [-120, -322], [-62, -352], [-40, -300], [-20, -332], [12, -282], [12, -204], [62, -204], [82, -252], [118, -150], [150, -192], [150, -122], [200, -142], [230, -232], [272, -210], [300, -262], [320, -240], [320, 0]]],
      ...FIRES.map(([x, y, s], k) => ['o', (o) => flame(x, y, s, o.t, k)]),
      ['o', rect(-282, -150, 30, 42)], ['o', rect(92, -128, 26, 38)], ['o', rect(244, -184, 26, 42)],
      ['o', [[-76, 0], [-76, -112], [-38, -134], [0, -112], [0, 0]]],                    // the doorway, burning behind the child
      ['k', [[-50, -70], [-22, -70], [-17, 0], [-29, 0], [-33, -36], [-38, 0], [-52, 0]]], ['k', disc(-36, -86, 14)],   // the child
      ['c', [[-49, -62], [-27, -64], [-25, -44], [-47, -42]]],                           // the book held to its chest
    ],
    sky(ctx, o) {
      for (const [x, y] of FIRES) glowAt(ctx, o, x, y - 30, 420, 'me', 0.2);
      for (let i = 0; i < 42; i++) {                                                      // smoke: soft puffs going up, spreading, leaning with the wind
        const [x, y] = FIRES[i % 3], ph = (o.t * 0.38 + rand(741, i)) % 1, [sx, sy] = o.at(x + ph * 170 + 16 * Math.sin(o.t * 0.8 + i), y - 30 - ph * 430);
        ctx.radial(sx, sy, (40 + 130 * ph) * o.s, 'text', o.alpha * 0.2 * Math.sin(Math.PI * ph) ** 0.7);
      }
    },
    live(ctx, o) {
      for (let i = 0; i < 30; i++) {                                                      // embers
        const [x, y] = FIRES[i % 3], ph = (o.t * (0.5 + 0.3 * rand(733, i)) + rand(731, i)) % 1;
        const [sx, sy] = o.at(x + (rand(732, i) - 0.5) * 70 + Math.sin(o.t * 2.4 + i) * 22 * ph, y - 30 - ph * 300);
        ctx.circle(sx, sy, (2.2 + 2.6 * rand(734, i)) * o.s * 1.4, { fill: true, color: 'me', alpha: o.alpha * (1 - ph) });
      }
    },
  },
  {
    name: 'temple', x: -2300, w: 600, label: '1300  ·  taller than the sun', parts: [
      ['k', TEMPLE],
      ['k', [[-300, 0], [-860, 0], [-300, -14]]],                                         // its shadow, laid far over the land before it
      ['o', [[-28, 0], [-28, -58], [0, -78], [28, -58], [28, 0]]], ['o', rect(-44, -578, 88, 18)], ['o', rect(-14, -706, 28, 10)],
    ],
    sky(ctx, o) {                                                                         // the sun, behind it: its light gets out round the edges
      const [cx, cy] = SUN;
      glowAt(ctx, o, cx, cy, 760, 'meDim', 0.45); glowAt(ctx, o, cx, cy, 330, 'text', 0.3);
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * TAU + 0.05 * o.t, w = i % 2 ? 0.03 : 0.05, r1 = i % 2 ? 560 : 860;
        const p = [[cx + Math.cos(a - w) * 120, cy + Math.sin(a - w) * 120], [cx + Math.cos(a) * r1, cy + Math.sin(a) * r1], [cx + Math.cos(a + w) * 120, cy + Math.sin(a + w) * 120]].map(([x, y]) => o.at(x, y));
        ctx.poly(p, { close: true, fill: true, color: 'text', alpha: o.alpha * (i % 2 ? 0.08 : 0.13) });
      }
    },
    live(ctx, o) { ctx.poly(TEMPLE.slice(1, -1).map(([x, y]) => o.at(x, y)), { color: 'text', width: 2, alpha: o.alpha * 0.45 }); },   // its rim, lit from behind
  },
  {
    name: 'stargazer', x: -3140, w: 520, label: '308  ·  "the universe has order"', parts: [
      ...CHART.slice(1).map((p, i) => ['c', bar(CHART[i], p, 5)]), ['c', bar(CHART[5], CHART[2], 5)], ...CHART.map(([x, y], i) => ['c', disc(x, y, i % 2 ? 11 : 8, 12)]),
      ['k', [[-260, 0], [-200, -60], [-120, -108], [-20, -128], [80, -114], [180, -70], [260, 0]]],                     // the hill
      ['k', [[-26, -128], [-4, -128], [-16, -198], [-38, -194]]],                         // sitting, leaning back
      ['k', disc(-34, -214, 16)],                                                         // the head, turned up
      ['k', bar([-22, -188], [34, -258], 11)], ['k', disc(37, -262, 7, 10)],              // the arm, pointing up at what he has worked out
      ['k', bar([-10, -134], [36, -170], 17)], ['k', bar([36, -170], [48, -128], 13)],    // knees up
      ['c', bar([-8, -152], [34, -182], 8)],                                              // the sheet on his knees
      ['o', disc(-74, -132, 10, 12)], ['o', [[-80, -140], [-74, -162], [-68, -140]]],     // the lamp he wrote by
    ],
    sky(ctx, o) { stars(ctx, o, 70, 3081, [-760, -560, 760, -200]); glowAt(ctx, o, -74, -140, 200, 'me', 0.25); },
  },
  {
    // her first three children, walking up to the era line, about to walk into history: the first ahead, the other two
    // after him. They stand just left of it, so that when the spark stops on the line they are all still known, lit by its flash
    name: 'children', x: -4310, w: 740, label: 'A.D. 1  ·  the first three', parts: [], figs: [
      { name: 'kid_cat', x: -250, h: 290, w: 206, phase: 0.62 }, { name: 'kid_leopard', x: -20, h: 330, w: 277, phase: 0.31 }, { name: 'kid_fox', x: 230, h: 300, w: 282, phase: 0 },
    ],
    sky(ctx, o) { glowAt(ctx, o, 0, -30, 520, 'meDim', 0.4); stars(ctx, o, 26, 4310, [-500, -600, 500, -360], { bright: 0.5 }); },
  },
  {
    name: 'before anyone', x: -5050, w: 700, label: 'before anyone', parts: [
      ['k', [[-350, 0], [-250, -230], [-180, -150], [-60, -380], [60, -200], [120, -262], [220, -120], [350, 0]]],    // mountains
      ['c', [[-60, -380], [-24, -306], [-48, -320], [-66, -296], [-92, -318]]],          // snow on the highest of them
      ['k', rect(160, -74, 16, 74)], ['k', disc(168, -116, 50)], ['k', rect(262, -50, 13, 50)], ['k', disc(268, -82, 36)],   // trees
      ['k', (o) => bird(-160, -470, 1, o.t, 0)], ['k', (o) => bird(-60, -525, 0.8, o.t, 1)], ['k', (o) => bird(40, -486, 0.9, o.t, 2)],
      ['c', [[-350, 0], [-330, -14], [-200, -32], [-60, -18], [80, -36], [220, -20], [350, -32], [350, 0]]],          // the river
      ['o', disc(150, -128, 8, 10)], ['o', disc(184, -100, 7, 10)], ['o', disc(272, -90, 6, 10)],                      // fruit
    ],
    sky(ctx, o) { stars(ctx, o, 40, 5050, [-600, -600, 600, -260], { bright: 0.55 }); },
    live(ctx, o) {
      for (let i = 0; i < 9; i++) {                                                       // the river glints
        const x = -330 + ((i * 83 + o.t * 46) % 660), [sx, sy] = o.at(x, -16 - 6 * Math.sin(x * 0.02));
        ctx.rect(sx - 13 * o.s, sy, 26 * o.s, 3, { fill: true, color: 'bg', alpha: o.alpha * 0.5 });
      }
    },
  },
  {
    name: 'first light', x: -6850, w: 1100, label: 'let there be light', parts: [
      ['k', rect(-550, -18, 1100, 18)],                                                  // the horizon
      // the sun, rising with `rise`, and its rays, growing with it (only what is above the ground)
      ...Array.from({ length: 11 }, (_, i) => ['c', (o) => {
        const cy = 150 * (1 - o.rise), a = Math.PI + ((i + 0.5) / 11) * Math.PI, w = 0.045, r0 = 270, r1 = r0 + (i % 2 ? 190 : 300) * (0.25 + 0.75 * o.rise);
        const p = [[Math.cos(a - w) * r0, cy + Math.sin(a - w) * r0], [Math.cos(a) * r1, cy + Math.sin(a) * r1], [Math.cos(a + w) * r0, cy + Math.sin(a + w) * r0]];
        return p.every(([, y]) => y < -6) ? p : [];
      }]),
      ['c', (o) => cap(232, 150 * (1 - o.rise))], ['o', (o) => cap(150, 150 * (1 - o.rise))],
    ],
    sky(ctx, o) { glowAt(ctx, o, 0, 0, 1000, 'meDim', 0.25 + 0.35 * o.rise); glowAt(ctx, o, 0, -40, 520, 'me', 0.1 + 0.25 * o.rise); stars(ctx, o, 30, 6850, [-700, -600, 700, -300], { bright: 0.5 * (1 - o.rise) }); },
  },
];
/** Where the strip ends on either side: beyond the first light; now. */
export const SPAN = [-7800, 0];
/**
 * Where the spark is at the end of each pull, right to left: now · between towers and the burnt city · between the city
 * and the temple · between the temple and the stargazer · ON THE ERA LINE (the three children just before it) ·
 * beyond the world before anyone · the end, with the first light before it.
 */
export const STOPS = [0, -980, -1860, -2720, -3920, -5500, -6200];
export const ERA_LINE = STOPS[4];

const ptsOf = (pts, o) => (typeof pts === 'function' ? pts(o) : pts);
const STILL = { t: 0, rise: 0 };
/** The x range a landmark stands on: its black plates, or its pictures. */
const footOf = (e) => {
  const xs = [...e.parts.filter(([ink]) => ink === 'k').flatMap(([, pts]) => ptsOf(pts, STILL).map(([x]) => x + e.x)), ...(e.figs ?? []).flatMap((f) => [e.x + f.x - f.w / 2, e.x + f.x + f.w / 2])];
  return [Math.min(...xs) - 6, Math.max(...xs) + 6];
};

/**
 * The low line of roofs all of it stands on: flat steps of unequal width, nowhere higher than a tenth of a landmark,
 * and flat on the ground under a landmark (so that an outline of the strip is one line, not two).
 */
const ROOFS = (() => {
  const foot = ERAS.map(footOf);
  const top = [];
  const put = (xa, xb, h) => { if (xb - xa > 1) top.push([xa, -h], [xb, -h]); };
  for (let x = SPAN[0], i = 0; x < SPAN[1]; i++) {
    const w = 170 + 190 * rand(4411, i), h = 18 + 40 * rand(4412, i), xb = Math.min(SPAN[1], x + w);
    let at = x;                                                          // (the last step ends at now: beyond it there is nothing)
    for (const [fa, fb] of foot.filter(([fa, fb]) => fb > x && fa < xb).sort((p, q) => p[0] - q[0])) { put(at, Math.max(at, fa), h); put(Math.max(at, fa), Math.min(xb, fb), 0); at = Math.min(xb, fb); }
    put(at, xb, h);
    x = xb;
  }
  return [[SPAN[0], 0], ...top, [SPAN[1], 0]];
})();

/** One picture of the strip (a child), in one of the three ways, standing on the ground at its x (walking: it bobs). */
function fig(ctx, art, f, ex, scroll, gy, scale, mode, { alpha, dark, edge, width, t }) {
  const S = art.size(f.name), h = f.h * scale, w = (h * S.w) / S.h, bob = 7 * scale * Math.abs(Math.sin(Math.PI * (t * 1.9 + (f.phase ?? 0))));
  const dst = { x: scroll + (ex + f.x) * scale - w / 2, y: gy - h + 4 * scale - bob, w, h };
  if (mode === 'dark') art.silhouette(ctx, f.name, dst, { color: dark, alpha });
  else if (mode === 'ink') art.inks(ctx, f.name, dst, { alpha });
  else {
    const path = art.inkPath(f.name, 'all'), g = ctx.g, k = w / S.w;
    if (!path) return;
    g.save(); g.translate(dst.x, dst.y); g.scale(k, k);
    g.lineWidth = width / k; g.lineJoin = 'round'; g.strokeStyle = ctx.col(edge, alpha); g.stroke(path);
    g.restore();
  }
}

const visible = (era, scroll, scale, from, to) => { const ox = scroll + era.x * scale, half = (era.w / 2 + 300) * scale; return !(ox + half < from || ox - half > to); };

/** The skies of the eras (under the strip, on the known side): glows, smoke, light, stars. t = song time; rise = the first light. */
export function stripSky(ctx, scroll, gy, { scale = 1, alpha = 1, t = 0, rise = 0, from = -60, to = 1980 } = {}) {
  if (!(alpha > 0.003)) return;
  const o = { scroll, gy, s: scale, t, rise, alpha };
  for (const era of ERAS) if (era.sky && visible(era, scroll, scale, from - 600, to + 600)) era.sky(ctx, pass(o, era.x));
}

/** The captions of the eras, centred under them just below the ground (the known side prints them; see `label`). */
export function stripLabels(ctx, scroll, gy, { scale = 1, alpha = 1, from = -60, to = 1980 } = {}) {
  if (!(alpha > 0.003)) return;
  for (const era of ERAS) if (era.label && visible(era, scroll, scale, from, to)) ctx.text(era.label, scroll + era.x * scale, gy + 30, { size: 17, font: 'mono', color: 'sub', align: 'center', alpha });
}

/**
 * The strip, with world x = 0 drawn at screen x = `scroll` and its ground at screen y = gy, at `scale`.
 *   mode    'dark' | 'ink' | 'hollow' (see above);  alpha;  from / to = the screen x range to draw (what lies outside is skipped)
 *   art     the silhouettes (without it the pictures are left out);  only: 'figs' = the pictures alone (to set them
 *           in front of something drawn over the strip);  t, rise: see stripSky (captions: stripLabels)
 * Clip it yourself (the known side and the forgotten side of the spark are two calls).
 */
export function strip(ctx, scroll, gy, mode, { scale = 1, alpha = 1, from = -60, to = 1980, dark = 'panel', edge = 'sub', width = 3, art = null, only = null, t = 0, rise = 0 } = {}) {
  if (!(alpha > 0.003)) return;
  const at = (ox) => (pts) => pts.map(([x, y]) => [scroll + (x + ox) * scale, gy + y * scale]);
  const o = { scroll, gy, s: scale, t, rise, alpha };
  if (mode !== 'ink' && only !== 'figs') {
    const p = at(0)(ROOFS.filter(([x]) => scroll + x * scale > from - 400 && scroll + x * scale < to + 400));
    if (p.length > 2) { if (mode === 'dark') ctx.poly([[p[0][0], gy], ...p, [p[p.length - 1][0], gy]], { close: true, fill: true, color: dark, alpha }); else ctx.poly(p, { color: edge, width, alpha }); }
  }
  for (const era of ERAS) {
    if (!visible(era, scroll, scale, from, to)) continue;
    const put = at(era.x);
    if (only !== 'figs') {
      for (const [ink, raw] of era.parts) {
        const pts = ptsOf(raw, o);
        if (pts.length < 3) continue;
        if (mode === 'hollow') { if (ink === 'k') ctx.poly(put(pts), { close: true, color: edge, width, alpha }); }
        else if (mode === 'dark') { if (ink === 'k') ctx.poly(put(pts), { close: true, fill: true, color: dark, alpha }); }
        else ctx.poly(put(pts), { close: true, fill: true, color: ink === 'k' ? dark : ink === 'c' ? 'text' : 'me', alpha });
      }
      if (mode === 'ink' && era.live) era.live(ctx, pass(o, era.x));
    }
    if (art) for (const f of era.figs ?? []) fig(ctx, art, f, era.x, scroll, gy, scale, mode, { alpha, dark, edge, width, t });
  }
}

// ---------------------------------------------------------------------------------------------- check cards
export function labCards() {
  const sky = (ctx, y, h) => ctx.gradRect(0, y, 1920, h, [[0, 'line', 0], [1, 'line', 0.85]]);
  // the whole strip in one still, at a quarter of its size in the film: dark, inked, hollow. It has to read here
  const whole = {
    palette: 'on',
    render(ctx) {
      ground(ctx, { light: null, tone: 'raised', dots: 0.5 });
      const k = 1840 / (SPAN[1] - SPAN[0]), x0 = 40 - SPAN[0] * k;
      [['dark'], ['dark', 'ink'], ['hollow']].forEach((modes, j) => {
        const gy = 330 + 300 * j;
        sky(ctx, gy - 200, 200);
        for (const m of modes) strip(ctx, x0, gy, m, { scale: k, from: -1e5, to: 1e5, width: 2 });
        for (const w of STOPS) ctx.circle(x0 + w * k, gy + 16, 5, { fill: true, color: w === ERA_LINE ? 'text' : 'me' });
      });
    },
  };
  // and what the frame holds at the end of each pull (the spark in its gap; inked to its left, hollow to its right)
  const stop = (i) => ({
    palette: 'on',
    render(ctx) {
      ground(ctx, { light: null, tone: 'raised', dots: 0.5 });
      const K = 0.86, kx = [1560, 1540, 1440, 1350, 1260, 1170, 1090][i], sc = kx - STOPS[i] * K, gy = 640;
      ctx.clip({ x: 0, y: 100, w: kx, h: gy - 100 }, () => { sky(ctx, 100, gy - 100); strip(ctx, sc, gy, 'dark', { scale: K }); strip(ctx, sc, gy, 'ink', { scale: K }); });
      ctx.clip({ x: kx, y: 100, w: 1920 - kx, h: gy - 100 }, () => strip(ctx, sc, gy, 'hollow', { scale: K }));
      ctx.circle(kx, gy + 66, 46, { fill: true, color: 'me' });
    },
  });
  return { history: [whole, ...STOPS.map((_, i) => stop(i))] };
}
