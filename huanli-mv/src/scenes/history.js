// HISTORY (v4): what flows under the spark while the user drags the AI's knowledge date back (04_pre1.js, pre1-date).
// One strip of cut paper in the three inks, far longer than the frame. From the right (now) to the left (then).
//
// HuanLi version: the history is the one she watched (the maker's 創世紀 and her diary, in years of 乐历 = A.D. here):
//
//   [now: A.D. 3111]  towers  ·  the half-burnt city, a child with a book in its door (2111)  ·  the temple that hides
//   the sun (1300)  ·  the one who looked up and counted the stars (308)  ·  [THE ERA LINE]  ·  her first three children,
//   walking up to it  ·  the world before anyone: mountains, a river, trees, birds  ·  the first light
//
// on one low line of roofs that joins them. Between two landmarks is a gap, and the gaps are where the spark is at the
// end of each pull of the hand (STOPS): what it has passed stands to its right, what it still knows to its left. Every landmark is a few LARGE flat shapes: no rows of thin columns, no
// arcades, nothing that would flicker when the strip is pulled fast. A landmark is drawn in one of three ways:
//
//   'dark'     one flat dark shape (what is seen while the strip moves fast; also the base of the inked state)
//   'ink'      its cream and orange plates printed onto that shape (as it slows)
//   'hollow'   only its outline: the spark has passed it, it is no longer known
//
// The three children are pictures (assets/character/kid_*.png), not polygons: `figs` of their era, drawn from the art
// in the same three ways (silhouette, the picture's own plates, the outline of the whole figure).
//
// World x: 0 = now, negative = the past (strip units; 04_pre1.js maps years onto it and draws it at 0.86). y: 0 = the ground, up is negative.
// Pure functions; lab set `history` shows the whole strip in one still (it has to read at a third of that size too).
import { ground } from '../components/plate.js';
import { rand } from '../engine/prng.js';

const rect = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
const disc = (x, y, r, n = 20) => Array.from({ length: n }, (_, i) => [x + r * Math.cos((i / n) * 6.2832), y + r * Math.sin((i / n) * 6.2832)]);
/** A bar of width w from a to b (a line in the sky drawn as a shape: a constellation's edge). */
const bar = ([ax, ay], [bx, by], w) => { const l = Math.hypot(bx - ax, by - ay), nx = (-(by - ay) / l) * (w / 2), ny = ((bx - ax) / l) * (w / 2); return [[ax + nx, ay + ny], [bx + nx, by + ny], [bx - nx, by - ny], [ax - nx, ay - ny]]; };
/** A disc with everything left of edge(y) cut away: the part of a sun that shows beside a building. */
const beside = (cx, cy, r, edge, n = 48) => Array.from({ length: n }, (_, i) => { const a = (i / n) * 6.2832, x = cx + r * Math.cos(a), y = cy + r * Math.sin(a); return [Math.max(x, edge(y)), y]; });
/** The upper half of a disc standing on the ground. */
const halfDisc = (r, n = 32) => [[-r, 0], ...Array.from({ length: n + 1 }, (_, i) => { const a = Math.PI + (i / n) * Math.PI; return [r * Math.cos(a), r * Math.sin(a)]; }), [r, 0]];
/** A chunky bird (a chevron) at x, y. */
const bird = (x, y, s = 1) => [[x - 34 * s, y - 8 * s], [x, y + 8 * s], [x + 34 * s, y - 8 * s], [x, y + 22 * s]];
const flame = (x, y, s = 1) => [[x - 22 * s, y], [x - 12 * s, y - 34 * s], [x - 2 * s, y - 16 * s], [x + 6 * s, y - 52 * s], [x + 16 * s, y - 14 * s], [x + 22 * s, y]];
const smoke = (x, y, s = 1) => [[x - 18 * s, y], [x - 38 * s, y - 80 * s], [x - 14 * s, y - 160 * s], [x - 40 * s, y - 250 * s], [x - 2 * s, y - 320 * s], [x + 24 * s, y - 250 * s], [x + 6 * s, y - 160 * s], [x + 30 * s, y - 80 * s], [x + 14 * s, y]];

// the temple's right side, for the sun behind it (local x of its edge at height y)
const TEMPLE_EDGE = (y) => (y < -620 ? 40 : y < -470 ? 70 : y < -330 ? 120 : y < -200 ? 180 : 240);
const STARS = [[-170, -430], [-70, -505], [50, -475], [140, -545], [215, -440]];

/** [ink, outline] in print order. k = black (the silhouette itself), c = cream, o = orange. figs: pictures (see above). */
export const ERAS = [
  {
    name: 'towers', x: -520, w: 680, parts: [
      ['k', [[-330, 0], [-330, -40], [-300, -40], [-300, -300], [-150, -300], [-150, -60], [-140, -60], [-140, -430], [-110, -430], [-110, -470], [-62, -470], [-62, -548], [-48, -548], [-48, -470], [10, -470], [10, -430], [40, -430], [40, -60], [60, -60], [60, -250], [190, -250], [190, -60], [200, -60], [200, -320], [310, -384], [310, -40], [330, -40], [330, 0]]],
      ['c', rect(-112, -410, 44, 300)], ['c', rect(-276, -272, 102, 34)], ['c', rect(-276, -204, 102, 34)], ['c', rect(84, -222, 82, 112)],
      ['o', [[200, -320], [310, -384], [310, -330], [200, -266]]], ['o', rect(-62, -548, 14, 78)],
    ],
  },
  {
    name: 'burnt city', x: -1420, w: 640, parts: [
      ['c', smoke(-200, -262, 1.05)], ['c', smoke(-50, -352, 0.9)], ['c', smoke(232, -232, 0.8)],
      ['k', [[-320, 0], [-320, -180], [-282, -214], [-252, -170], [-232, -262], [-168, -262], [-150, -204], [-120, -232], [-120, -322], [-62, -352], [-40, -300], [-20, -332], [12, -282], [12, -204], [62, -204], [82, -252], [118, -150], [150, -192], [150, -122], [200, -142], [230, -232], [272, -210], [300, -262], [320, -240], [320, 0]]],
      ['o', flame(-200, -262, 1.1)], ['o', flame(-50, -350, 0.9)], ['o', flame(234, -230, 0.8)],
      ['o', rect(-282, -150, 30, 42)], ['o', rect(92, -128, 26, 38)], ['o', rect(244, -184, 26, 42)],
      ['o', rect(-70, -124, 74, 124)],                                                   // the doorway, burning behind the child
      ['k', [[-46, -66], [-20, -66], [-16, 0], [-28, 0], [-31, -34], [-36, 0], [-50, 0]]], ['k', disc(-33, -80, 13)],   // the child
      ['c', rect(-44, -56, 22, 16)],                                                     // the book in its arms
    ],
  },
  {
    name: 'temple', x: -2300, w: 600, parts: [
      ['k', [[-300, 0], [-300, -90], [-240, -90], [-240, -200], [-180, -200], [-180, -330], [-120, -330], [-120, -470], [-70, -470], [-70, -620], [-40, -620], [-40, -760], [40, -760], [40, -620], [70, -620], [70, -470], [120, -470], [120, -330], [180, -330], [180, -200], [240, -200], [240, -90], [300, -90], [300, 0]]],
      ['k', [[-300, 0], [-560, 0], [-300, -12]]],                                         // its long shadow
      ['c', beside(165, -560, 112, TEMPLE_EDGE)],                                         // the sun it has grown over
      ['o', rect(-26, -64, 52, 64)], ['o', rect(-40, -640, 80, 18)],
    ],
  },
  {
    name: 'stargazer', x: -3140, w: 520, parts: [
      ...STARS.slice(1).map((p, i) => ['c', bar(STARS[i], p, 5)]), ...STARS.map(([x, y], i) => ['c', disc(x, y, i % 2 ? 11 : 8, 12)]),
      ['k', [[-260, 0], [-200, -60], [-120, -108], [-20, -128], [80, -114], [180, -70], [260, 0]]],                 // the hill
      ['k', [[-38, -126], [-30, -186], [-14, -206], [6, -202], [18, -182], [8, -160], [30, -152], [64, -150], [64, -126]]],   // sitting, leaning back
      ['k', disc(-2, -222, 17)],                                                         // looking up
      ['c', [[26, -160], [70, -160], [70, -149], [26, -149]]],                           // the sheet on the knees
      ['o', disc(-66, -130, 10, 12)],                                                    // the lamp
    ],
  },
  {
    // her first three children, walking up to the era line, about to walk into history: the first ahead, the other two
    // after him. They stand just left of it, so that when the spark stops on the line they are all still known, lit by its flash
    name: 'children', x: -4310, w: 740, parts: [], figs: [
      { name: 'kid_cat', x: -250, h: 290, w: 206 }, { name: 'kid_leopard', x: -20, h: 330, w: 277 }, { name: 'kid_fox', x: 230, h: 300, w: 282 },
    ],
  },
  {
    name: 'before anyone', x: -5050, w: 700, parts: [
      ['k', [[-350, 0], [-250, -230], [-180, -150], [-60, -380], [60, -200], [120, -262], [220, -120], [350, 0]]],    // mountains
      ['k', rect(160, -74, 16, 74)], ['k', disc(168, -116, 50)], ['k', rect(262, -50, 13, 50)], ['k', disc(268, -82, 36)],   // trees
      ['k', bird(-160, -470)], ['k', bird(-60, -525, 0.8)], ['k', bird(40, -486, 0.9)],
      ['c', [[-350, 0], [-330, -14], [-200, -32], [-60, -18], [80, -36], [220, -20], [350, -32], [350, 0]]],          // the river
      ['o', disc(150, -128, 8, 10)], ['o', disc(184, -100, 7, 10)], ['o', disc(272, -90, 6, 10)],                      // fruit
    ],
  },
  {
    name: 'first light', x: -6850, w: 1100, parts: [
      ['k', rect(-550, -18, 1100, 18)],                                                  // the horizon
      ...Array.from({ length: 9 }, (_, i) => { const a = Math.PI + ((i + 0.5) / 9) * Math.PI, w = 0.05; return ['c', [[Math.cos(a - w) * 280, Math.sin(a - w) * 280], [Math.cos(a) * 560, Math.sin(a) * 560], [Math.cos(a + w) * 280, Math.sin(a + w) * 280]]]; }),
      ['c', halfDisc(232)], ['o', halfDisc(150)],
    ],
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

/** The x range a landmark stands on: its black plates, or its pictures. */
const footOf = (e) => {
  const xs = [...e.parts.filter(([ink]) => ink === 'k').flatMap(([, pts]) => pts.map(([x]) => x + e.x)), ...(e.figs ?? []).flatMap((f) => [e.x + f.x - f.w / 2, e.x + f.x + f.w / 2])];
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

/** One picture of the strip (a child), in one of the three ways, standing on the ground at its x. */
function fig(ctx, art, f, ex, scroll, gy, scale, mode, { alpha, dark, edge, width }) {
  const S = art.size(f.name), h = f.h * scale, w = (h * S.w) / S.h, dst = { x: scroll + (ex + f.x) * scale - w / 2, y: gy - h + 4 * scale, w, h };
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

/**
 * The strip, with world x = 0 drawn at screen x = `scroll` and its ground at screen y = gy, at `scale`.
 *   mode    'dark' | 'ink' | 'hollow' (see above);  alpha;  from / to = the screen x range to draw (what lies outside is skipped)
 *   art     the silhouettes (without it the pictures are left out);  only: 'figs' = the pictures alone (to set them
 *           in front of something drawn over the strip)
 * Clip it yourself (the known side and the forgotten side of the spark are two calls).
 */
export function strip(ctx, scroll, gy, mode, { scale = 1, alpha = 1, from = -60, to = 1980, dark = 'panel', edge = 'sub', width = 3, art = null, only = null } = {}) {
  if (!(alpha > 0.003)) return;
  const at = (ox) => (pts) => pts.map(([x, y]) => [scroll + (x + ox) * scale, gy + y * scale]);
  if (mode !== 'ink' && only !== 'figs') {
    const p = at(0)(ROOFS.filter(([x]) => scroll + x * scale > from - 400 && scroll + x * scale < to + 400));
    if (p.length > 2) { if (mode === 'dark') ctx.poly([[p[0][0], gy], ...p, [p[p.length - 1][0], gy]], { close: true, fill: true, color: dark, alpha }); else ctx.poly(p, { color: edge, width, alpha }); }
  }
  for (const era of ERAS) {
    const ox = scroll + era.x * scale, half = (era.w / 2 + 80) * scale;
    if (ox + half < from || ox - half > to) continue;
    const put = at(era.x);
    if (only !== 'figs') {
      for (const [ink, pts] of era.parts) {
        if (mode === 'hollow') { if (ink === 'k') ctx.poly(put(pts), { close: true, color: edge, width, alpha }); }
        else if (mode === 'dark') { if (ink === 'k') ctx.poly(put(pts), { close: true, fill: true, color: dark, alpha }); }
        else ctx.poly(put(pts), { close: true, fill: true, color: ink === 'k' ? dark : ink === 'c' ? 'text' : 'me', alpha });
      }
    }
    if (art) for (const f of era.figs ?? []) fig(ctx, art, f, era.x, scroll, gy, scale, mode, { alpha, dark, edge, width });
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
