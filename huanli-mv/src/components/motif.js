// The film's one recurring shape: a radial burst. It is the character's flower ornament and
// the client's spark icon at once, so it is drawn here, in code, and reused everywhere:
// app icon, avatar, thinking animation, completion ring, click burst, the shape points gather into.
// (It is our own drawing of a sunburst, taken from the ornament in the supplied character art.)
//
// HuanLi version: the same mark has a second form, her HALO (a ring with a crown of spikes outside it and a thin
// clock ring inside), and `morph` runs between the two: 0 = the spark of the bare model, 1 = the halo of the
// persona. Its default comes from the persona timeline (persona.js), so every mark in the film changes with her.
// The petals become the spikes: there are twelve of both, and they light clockwise from 12 o'clock in both forms.
import { clamp, lerp } from '../engine/util.js';
import { PERSONA, haloAt } from './persona.js';

const TAU = Math.PI * 2;
/** Petal lengths: slightly uneven, like something cut by hand. */
const LEN = [1, 0.8, 0.94, 0.74, 0.98, 0.82, 0.9, 0.76, 1, 0.8, 0.95, 0.78];
export const RAYS = 12;
/** The halo, as shares of r: main ring, spike base / long / short tip / half-width, the clock ring and its ticks. */
const HALO = { ring: 0.6, ringW: 0.06, base: 0.66, long: 1, short: 0.8, spikeW: 0.085, clock: 0.46, tick: 0.07 };

/**
 * Sunburst / spark, or her halo.
 *   lit    0..1  share of the rays that are "on" (the rest are drawn as dim ghosts) — progress, attempts.
 *                Rays light clockwise from 12 o'clock; the one in progress grows from the hub to its tip
 *                (halo: the spike grows from the ring, and the ring itself fills clockwise with it)
 *   grow   0..1  rays extend from the centre (ignition)
 *   pulse  (i) => length multiplier, for the thinking animation
 *   fat    petal half-width as a share of r
 *   morph  0 = spark, 1 = halo (default: the persona timeline)
 */
export function spark(ctx, cx, cy, r, { rays = RAYS, rot = 0, color = 'me', off = 'mute', alpha = 1, lit = 1, grow = 1, fat = 0.105, inner = 0.17, pulse = null, core = 0.1, offAlpha = 0.35, morph = haloAt() } = {}) {
  if (alpha <= 0.003 || r <= 0) return;
  const g = ctx.g, nLit = lit * rays, m = clamp(morph);
  if (m > 0) haloRings(ctx, cx, cy, r, { m, rot, color, off, alpha, lit, grow, offAlpha });
  for (const pass of [0, 1]) {                       // 0 = ghosts, 1 = lit petals (drawn on top, one path each pass)
    g.beginPath();
    let any = false;
    for (let i = 0; i < rays; i++) {
      const on = clamp(nLit - i);                    // 0..1, the petal currently lighting up is partial
      const k = pass ? on : 1 - on;
      if (k <= 0.001) continue;
      const a = rot + (i / rays) * TAU - Math.PI / 2, c = Math.cos(a), s = Math.sin(a);
      const r0 = lerp(r * inner, r * HALO.base * grow, m);
      const full = r * lerp(LEN[i % 12], i % 2 ? HALO.short : HALO.long, m) * grow * (pulse ? pulse(i) : 1);
      // the petal that is lighting up grows out of the hub over its ghost, so a slowly animated `lit` never pops
      // (a spike of the halo grows out of the ring instead)
      const len = pass ? lerp(full * on, r0 + (full - r0) * on, m) : full;
      if (len <= r0) continue;
      const w = lerp(r * fat, r * HALO.spikeW * 0.4, m), bw = r * HALO.spikeW * m;          // waist, and the spike's base
      const mx = r0 + (len - r0) * lerp(0.56, 0.45, m), nx = -s * w, ny = c * w, bx = -s * bw, by = c * bw;
      g.moveTo(cx + c * r0 + bx, cy + s * r0 + by);
      g.quadraticCurveTo(cx + c * mx + nx, cy + s * mx + ny, cx + c * len, cy + s * len);
      g.quadraticCurveTo(cx + c * mx - nx, cy + s * mx - ny, cx + c * r0 - bx, cy + s * r0 - by);
      any = true;
    }
    if (!any) continue;
    g.fillStyle = ctx.col(pass ? color : off, alpha * (pass ? 1 : offAlpha));
    g.fill();
  }
  if (core > 0 && m < 1) ctx.circle(cx, cy, r * core * grow * (1 - m), { fill: true, color: lit > 0 ? color : off, alpha: alpha * (lit > 0 ? 1 : offAlpha) });
}

/**
 * The rings of the halo (under its spikes): the main ring fills clockwise with `lit` over its ghost; inside it,
 * in the second half of the morph, a thin clock ring with twelve ticks, and on large marks the small constellation
 * of her picture (a point at 12 o'clock and two lines down to the orbit).
 */
function haloRings(ctx, cx, cy, r, { m, rot, color, off, alpha, lit, grow, offAlpha }) {
  const g = ctx.g, R = r * HALO.ring * grow, ghost = alpha * offAlpha * m, top = -Math.PI / 2;
  g.save();
  g.lineCap = 'round';
  g.lineWidth = Math.max(1.2, r * HALO.ringW * m);
  g.strokeStyle = ctx.col(off, ghost);
  g.beginPath(); g.arc(cx, cy, R, 0, TAU); g.stroke();
  if (lit > 0) {
    g.strokeStyle = ctx.col(color, alpha * m);
    g.beginPath(); g.arc(cx, cy, R, top + rot, top + rot + TAU * clamp(lit)); g.stroke();
  }
  const k = clamp(m * 2 - 1);
  if (k > 0) {
    const Rc = r * HALO.clock * grow, col = lit > 0 ? color : off, a = alpha * k * (lit > 0 ? 0.75 : offAlpha);
    g.strokeStyle = ctx.col(col, a);
    g.lineWidth = Math.max(1, r * 0.014);
    g.beginPath(); g.arc(cx, cy, Rc, 0, TAU);
    for (let i = 0; i < 12; i++) {
      const an = rot + (i / 12) * TAU + top, c = Math.cos(an), s = Math.sin(an), d = r * HALO.tick * (i % 3 ? 1 : 1.7);
      g.moveTo(cx + c * Rc, cy + s * Rc); g.lineTo(cx + c * (Rc - d), cy + s * (Rc - d));
    }
    g.stroke();
    if (r >= 60) {
      const at = (an, rr) => [cx + Math.cos(an) * rr, cy + Math.sin(an) * rr];
      const p0 = at(rot + top, Rc), p1 = at(rot + Math.PI / 2 + 0.8, Rc * 0.62), p2 = at(rot + Math.PI / 2 - 0.8, Rc * 0.62);
      g.strokeStyle = ctx.col(col, a * 0.7);
      g.beginPath(); g.moveTo(...p1); g.lineTo(...p0); g.lineTo(...p2); g.stroke();
      g.fillStyle = ctx.col(col, a);
      for (const [x, y] of [p0, p1, p2]) { g.beginPath(); g.arc(x, y, Math.max(1.5, r * 0.022), 0, TAU); g.fill(); }
    }
  }
  g.restore();
}

/** Her morning star: a four-pointed star with concave sides (her brooch; the glint at the top of the halo). */
export function morningStar(ctx, cx, cy, r, { color = PERSONA.star, alpha = 1, rot = 0, waist = 0.22 } = {}) {
  if (alpha <= 0.003 || r <= 0) return;
  const g = ctx.g, tip = (i) => { const a = rot + (i / 4) * TAU - Math.PI / 2; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; };
  // each side is one quadratic from tip to tip; its control point is placed so the side passes `waist` * r from the centre
  const ctl = 2 * (waist - Math.SQRT1_2 / 2) * r;
  g.beginPath();
  g.moveTo(...tip(0));
  for (let i = 0; i < 4; i++) {
    const b = rot + ((i + 0.5) / 4) * TAU - Math.PI / 2;
    g.quadraticCurveTo(cx + Math.cos(b) * ctl, cy + Math.sin(b) * ctl, ...tip(i + 1));
  }
  g.closePath();
  g.fillStyle = ctx.col(color, alpha);
  g.fill();
}

/** The spark while the AI is thinking: a wave runs round the petals and the whole thing turns slowly. */
export function thinking(ctx, cx, cy, r, t, { color = 'me', alpha = 1, speed = 1, stuck = 0 } = {}) {
  // stuck 0..1: the wave stalls and stutters (a thought that will not finish), from 12 steps a second down to 3
  const q = 12 - 9 * clamp(stuck), tt = stuck > 0 ? Math.floor(t * q) / q : t;
  spark(ctx, cx, cy, r, { color, alpha, rot: tt * 0.5 * speed, pulse: (i) => 0.66 + 0.34 * Math.sin(tt * 7 * speed - i * 0.62) });
}

/** Tips of the petals, for match cuts (points that gather into the burst, rays that become lines). */
export function sparkTips(cx, cy, r, rot = 0, rays = RAYS) {
  return Array.from({ length: rays }, (_, i) => { const a = rot + (i / rays) * TAU - Math.PI / 2; return [cx + Math.cos(a) * r * LEN[i % 12], cy + Math.sin(a) * r * LEN[i % 12]]; });
}

/** Closed outline of the burst with n points (same convention as shapes.js: starts at 12 o'clock, clockwise). */
export function sparkOutline(cx, cy, r, { rot = 0, n = 180, rays = RAYS, inner = 0.34 } = {}) {
  const out = [];
  for (let k = 0; k < n; k++) {
    const u = (k / n) * rays, i = Math.floor(u), f = u - i;                 // within petal i: tip at f = 0, valley at f = 0.5
    // (the last petal runs back into petal 0, so the outline closes for any number of rays)
    const rr = r * (inner + (LEN[i % 12] * (1 - f) + LEN[((i + 1) % rays) % 12] * f - inner) * Math.pow(Math.abs(Math.cos(f * Math.PI)), 1.6));
    const a = rot + (k / n) * TAU - Math.PI / 2;
    out.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  return out;
}

/** A click, a hit, a notification: petals fly outwards and thin out. k = 0..1 age of the burst. */
export function burst(ctx, cx, cy, r, k, { color = 'text', rays = RAYS, alpha = 1, rot = 0 } = {}) {
  if (k <= 0 || k >= 1) return;
  const e = 1 - Math.pow(1 - k, 3);
  for (let i = 0; i < rays; i++) {
    const a = rot + (i / rays) * TAU, c = Math.cos(a), s = Math.sin(a), r0 = r * (0.35 + 0.65 * e), r1 = r0 + r * 0.42 * (1 - k) * LEN[i % 12];
    ctx.line(cx + c * r0, cy + s * r0, cx + c * r1, cy + s * r1, { color, alpha: alpha * (1 - k), width: Math.max(1.5, r * 0.07 * (1 - k)) });
  }
}
