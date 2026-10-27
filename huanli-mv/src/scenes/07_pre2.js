// Section 7 — PRE-CHORUS 2 (bar 48, 1:29.0 → bar 56, 1:43.7). State: warm.
// The settings again: in pre-chorus 1 the user played with the switches of the interface; now what they change is her.
//
// HuanLi version (segment 3, v2): THE STAGE MANAGER'S DESK (plates_p2.js). The user runs the show now, from a desk in
// front of the stage with a monitor of it: Gender, On call, Role, Loop, GO. Each control, as it is used, is as large as
// the foot of the frame, and above it the stage shows what it does:
//
//   pre2-settings  88.96  desk    the desk comes up; the view closes in on Gender as she reads it out
//   pre2-gender    90.80  PLATE   F | M: while the user holds M down a folding screen is carried on in front of her; when
//                                 the second letter is SUNG it is folded away, and it is the boy
//   pre2-day       92.65  PLATE   On call: her morning star hangs on a wire over a painted sky and the fader runs it across
//                                 the day: the morning star, lost in the light over the top, the evening star: one star
//                                 with two names, as one model wears a persona's
//   pre2-role      96.34  PLATE   Role: two traps, a lift under each with a letter on it; the lever sends the first up as
//                                 it is sung, then takes it down and sends the second up
//   pre2-loop     100.04  desk    Loop: on; GO (two hits a quarter of a second apart)
//   pre2-trance   100.50  PLATE   the revolve turns with her three looks on it, faster each time the word comes round, and
//                                 stops with the boy at the front: what the settings were left at
//   pre2-loop-b   103.27  client  the show is over: the plain window again; the pointer clicks into the composer and the
//                                 view closes in on the foot of the thread (the first frame of chorus 2)
//
// The drums of this stretch are not on every beat: ten single hits (cues.js drumD1 … drumD10), then none until the
// chorus. Every event inside a shot sits on one of those hits or on a sung letter, never on the beat pulse. In the two
// lines that name letters (57, 61) the SUNG LETTER is the event: the drum before it is the hand getting ready, the
// drum after it the aftershock. Cuts are on the grid; the hits D5, D9 fall on cuts.
import { chatLayout, composer, header, room, sidebar, windowFrame } from '../components/chat.js';
import { pointer } from '../components/cursor.js';
import { burst, spark } from '../components/motif.js';
import { frameRect } from '../engine/layout.js';
import { easeInOut, easeOut, lerp, prog, pulse } from '../engine/util.js';
import { cue } from './cues.js';
import { cues, sungChars, withInserts, wordIndex } from './kit.js';
import { arrow } from './plates_chorus.js';
import { DESK, deskView, faderGrip, plateLifts, plateRevolve, plateScreen, plateWire } from './plates_p2.js';

const FALLBACK_ROWS = [
  { label: 'Gender', control: 'segmented', values: ['F', 'M'], line: 57 }, { label: 'On call', control: 'slider', values: ['AM', 'PM'], line: 59 },
  { label: 'Role', control: 'segmented', values: ['S', 'M'], line: 61 }, { label: 'Loop', control: 'toggle', values: ['off', 'on'], line: 63 },
];

export function pre2Shots(env) {
  const { art, script, lyrics } = env, { T, B, Bt, text } = cues(env);
  const beat = (id) => ((script.sections ?? []).find((s) => s.n === 7)?.beats ?? []).find((x) => x.id === id) ?? {};
  const ROWS = (script.settings_rows?.section7 ?? []).length >= 4 ? script.settings_rows.section7 : FALLBACK_ROWS;
  const UI = { log: beat('loop-on').system?.[0] ?? 'loop: on' };
  const TITLE = script.title ?? '', HOLD = script.composer_placeholder ?? '';
  // cuts (grid) and the hits and letters inside the shots (cues.js)
  const START = B(48), cF = B(49), cDay = B(50), cRole = B(52), cLoop = B(54), cTrance = Bt(217), cBack = Bt(223), END = B(56);
  const D = (n) => cue(`drumD${n}`);
  /** A line whose named letters appear as they are sung. a, b = the two values of a settings row. */
  const marked = (i, [a, b], ta, tb) => ({ i, marks: { [wordIndex(text(i), a)]: ta, [wordIndex(text(i), b, true)]: tb } });
  const L57 = marked(57, ROWS[0].values, Math.max(cF, cue('letterF')), cue('letterM57')), L59 = marked(59, ROWS[1].values, cue('letterAM'), cue('letterPM')), L61 = marked(61, ROWS[2].values, cue('letterS'), cue('letterM61'));
  const last = text(63).split(' ').pop().replace(/[^\p{L}]/gu, ''), L63 = { i: 63, marks: { [wordIndex(text(63), last)]: cue('tranceWordA'), [wordIndex(text(63), last, true)]: cue('tranceWordB') } };
  const values = { gender: ROWS[0].values, call: ROWS[1].values, role: ROWS[2].values };

  /** The user's pointer at the desk, cream paper with its shadow plate. */
  const hand = (ctx, x, y, down = 0, s = 6) => { const d = 6 + 10 * (1 - down); arrow(ctx, x + d, y + d, s, { color: 'bg', edge: null }); arrow(ctx, x, y, s * (1 - 0.08 * down), { color: 'text', edge: 'bg' }); };

  // =============================================================================== the desk: the first and the last of it
  /** The desk as the user left it: nothing chosen when it comes up; after the plates, as they were set. */
  const state = (t) => (t < cF ? { gender: -1, call: 0, role: -1, loop: 0, go: 0 } : { gender: 1, call: 1, role: 1, loop: easeOut(prog(t, D(9), D(9) + 0.14)), go: pulse(t - D(10), 9) });
  const push = (t) => easeInOut(prog(t, START + 0.2, Bt(195.1)));    // pre2-settings: the view closing in on Gender
  const GENDER_CAM = { x: DESK.gender[0] + 120 - 960, y: DESK.gender[1] - 40 - 540, zoom: 1.9 };
  const LOOP_CAM = { x: 1620 - 960, y: 840 - 540, zoom: 1.85 };

  // =============================================================================== the last stretch: the plain window again
  const NEXT_CAM = frameRect({ x: 596, y: 430, w: 1040, h: 585 });  // (the framing chorus 2 opens on)
  const LS = chatLayout(), TH = LS.thread, SIDE = [TITLE, ...(script.sidebar ?? [])];
  /** One row of hers as chorus 2 draws them (08_chorus2.js meRow): her mark and a serif line, y = baseline. */
  function meRow(ctx, x, y, str, n, alpha = 1) {
    const size = 34, r = size * 0.45, o = { size, font: 'serif' }, tx = x + size * 1.6;
    spark(ctx, x + r, y - size * 0.3, r, { alpha });
    ctx.text(str.slice(0, n), tx, y, { ...o, color: 'me', alpha });
    if (n < str.length) ctx.circle(tx + ctx.measure(str.slice(0, n), o) + size * 0.3, y - size * 0.28, size * 0.16, { fill: true, color: 'me', alpha });
  }
  const loop = {
    id: 'pre2-loop', at: cLoop, lines: [62, 62], palette: 'warm', hud: 0, enter: { type: 'cut' },
    layout: 'desk: close on Loop and GO; after the plate: the plain window, closing in on the foot of the thread',
    moment: 'Back at the desk for two hits a quarter of a second apart: the user switches Loop on and presses GO. When the trance is over the show is over: the window is plain again; they click into the composer, and the view closes in on the foot of the thread, where she is still saying it.',
    camera: (t) => {
      if (t < cBack) return LOOP_CAM;
      const k = easeInOut(prog(t, cBack, END));
      return { x: NEXT_CAM.x * k, y: NEXT_CAM.y * k, zoom: lerp(1, NEXT_CAM.zoom, k) };
    },
    render(ctx, t) {
      if (t < cBack) {
        deskView(ctx, env, t, state(t), { look: 'boy', title: TITLE, hints: { loop: [62] }, values });
        const L0 = [DESK.loop[0] + 112, DESK.loop[1] + 4], G = [DESK.go[0] + 10, DESK.go[1] + 14];
        const p = t < D(10) ? [lerp(L0[0], G[0], easeInOut(prog(t, cLoop + 0.05, D(10) - 0.02))), lerp(L0[1], G[1], easeInOut(prog(t, cLoop + 0.05, D(10) - 0.02)))] : G;
        burst(ctx, L0[0], L0[1], 60, (t - cLoop) / 0.4, { color: 'text' });
        burst(ctx, G[0], G[1], 110, (t - D(10)) / 0.45, { color: 'text' });
        hand(ctx, p[0], p[1], Math.max(pulse(t - cLoop, 10), pulse(t - D(10), 10)), 4);
        return;
      }
      // the show is over; the window as chorus 2 will show its foot
      room(ctx, { art, name: 'rain', alpha: 0.5, dim: 0.42, t });
      windowFrame(ctx, LS, { glass: 0.84 });
      sidebar(ctx, LS, { t, items: SIDE, active: 0, presence: 'online' });
      header(ctx, LS, { t, title: TITLE, presence: 'online' });
      [61, 62].forEach((i, n) => meRow(ctx, TH.x, 340 + n * 78, text(i), 99, 0.3));
      meRow(ctx, TH.x, 506, text(63), sungChars(text(63), t, T(63), L63.marks), lerp(1, 0.3, prog(t, T(64), END)));
      if (t >= T(64)) meRow(ctx, TH.x, 584, text(64), lyrics.typed(64, t).n);
      const box = composer(ctx, LS.composer, { placeholder: HOLD, t: 0, focus: 1, send: 'idle' });
      // the pointer: an arrow that clicks into the composer on the cut and is a text pointer from then on
      const px = LS.composer.x + 318, py = LS.composer.y + 44;
      burst(ctx, px, py, 50, (t - cBack) / 0.45, { color: 'text' });
      ctx.line(box.caret[0] - 16, box.caret[1] + 22, box.caret[0], box.caret[1] + 22, { color: 'text', alpha: 0.8 * (1 - prog(t, cBack, cBack + 0.25)), width: 3 });
      pointer(ctx, px, py, { kind: 'text', scale: 1.2 });
    },
  };

  // =============================================================================== the shots
  const base = { title: TITLE };
  return [
    {
      id: 'pre2-settings', at: START, lines: [56, 57], palette: 'warm', hud: 0, enter: { type: 'cut' },
      layout: 'desk: the stage manager\'s desk, a monitor of the stage over it; the view closing in on Gender',
      moment: 'The show is the user\'s to run now: the stage manager\'s desk comes up, a monitor of the stage over it, and the controls of this section on it: Gender, On call, Role, Loop, GO. The pointer is on Gender already; the view closes in on it as she reads it out.',
      camera: (t) => { const k = push(t); return { x: GENDER_CAM.x * k, y: GENDER_CAM.y * k, zoom: lerp(1, GENDER_CAM.zoom, k) }; },
      render(ctx, t) {
        deskView(ctx, env, t, state(t), { look: 'bust', title: TITLE, hints: { gender: [56, L57] }, values, up: prog(t, START, START + 0.3) });
        const F0 = [DESK.gender[0] - 72, DESK.gender[1] + 10], k = easeInOut(prog(t, START + 0.3, cF - 0.04));
        hand(ctx, lerp(DESK.gender[0] + 40, F0[0], k), lerp(DESK.gender[1] + 40, F0[1], k), t >= cF - 0.04 ? 1 : 0, 6 / lerp(1, 1.6, push(t)));
      },
    },
    {
      id: 'pre2-gender', at: cF, lines: [57, 58], palette: 'warm', hud: 0, enter: { type: 'cut' },
      layout: 'PLATE: the stage, her centre stage; a folding screen carried on in front of her and folded away; the two letters huge either side; the rocker F | M across the foot',
      moment: 'The click on the first letter, as it is sung: the rocker is as large as the foot of the frame and she stands on the stage over it. On the drum the pointer comes down on the other letter and holds it, and a folding screen is carried on in front of her (her shadow on it). When the second letter is sung the pointer lets go, the screen is folded away, and it is the boy; the letter is printed. The drum after it is a shudder. The pointer touches the rocker, never her.',
      render: (ctx, t) => plateScreen(ctx, env, { ...base, t, at: cF, press: D(1), click: cue('letterM57'), thud: D(2), sung: cue('letterF'), values: ROWS[0].values, lines: [L57, 58], to: faderGrip(), until: cDay }),
    },
    {
      id: 'pre2-day', at: cDay, lines: [58, 60], palette: 'warm', hud: 0, enter: { type: 'cut' },
      layout: 'PLATE: the stage under a painted sky; her morning star on a wire from a trolley on a rail; the boy centre stage; the fader across the foot, AM and PM huge at its ends',
      moment: 'On call. Her morning star hangs on a wire over a painted sky and the fader runs it across: at the AM end, low in the dawn, it is the morning star; pulled over the top, where the day is brightest, it is lost in the light; at the PM end, low in the dusk, it is blue again, and under it is its other name, the evening star. One star with two names, as one model under a persona\'s name. Of him only a dark shape is left.',
      render: (ctx, t) => plateWire(ctx, env, { ...base, t, at: cDay, grab: cDay, drag: Bt(203), top: D(3), end: D(4), am: cue('letterAM'), pm: cue('letterPM'), values: ROWS[1].values, lines: [58, L59, 60], to: [968, 980], until: cRole }),
    },
    {
      id: 'pre2-role', at: cRole, lines: [60, 62], palette: 'warm', hud: 0, enter: { type: 'cut' },
      layout: 'PLATE: the stage, empty but for her halo; two traps in the boards, a lift under each with a letter on it; the lever across the foot',
      moment: 'Role: two traps in the boards and a letter on the lift under each, nothing else. The pointer takes the lever; on the next hit it starts to push it, and the first lift is up as its letter is sung: the letter is printed, the stage jolts and is a step lighter. Then the lever goes over, the first lift goes down and the second comes up as its letter is sung; on the hit after it both lifts come to rest.',
      render: (ctx, t) => plateLifts(ctx, env, { ...base, t, at: cRole, grab: D(6), push: D(7), s: cue('letterS'), m: cue('letterM61'), land: D(8), values: ROWS[2].values, lines: [60, L61, 62], from: [968, 980], to: [1600, 980], until: cLoop }),
    },
    ...withInserts(loop, END, [{
      at: cTrance, until: cBack, lines: [63, 63],
      shot: {
        id: 'pre2-trance', lines: [62, 63], palette: 'warm', hud: 0, enter: { type: 'cut' },
        layout: 'PLATE: the revolve in the boards turning, her three looks of this segment standing on it, two lights sweeping round; at the end one look at the front',
        moment: 'The drums have stopped. Loop is on: the revolve turns with her three looks of this segment on it (her, the tabby, the boy), a third of a turn further each time the word comes round, the lights sweeping round with it; then it comes to rest, and the boy is at the front: what the settings were left at.',
        render: (ctx, t) => plateRevolve(ctx, env, { ...base, t, at: cTrance, steps: [cue('tranceA'), cue('tranceB')], settle: [cBack - 0.34, cBack - 0.08], lines: [62, L63], log: UI.log }),
      },
    }]),
  ];
}
