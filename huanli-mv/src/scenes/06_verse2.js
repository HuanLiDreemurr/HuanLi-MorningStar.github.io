// Section 6 — VERSE 2 (bar 40, 1:14.2 → bar 48, 1:29.0). State: warm.
// Four role-play requests, and the user never waits for an answer to finish.
//
// HuanLi version (segment 3, v2): THE SCHOOL PLAY, on the stage of chorus 1 (stage.js, plates_v2.js). Each request is
// typed into the prompter's box at the foot of the stage and comes up out of it on the click; she plays the part asked
// for, like a child in a school play, in a costume, under one spotlight. Each keyword is a board let down from the flies.
//
//   v2-ask1      74.19  stage   close on the prompter's box: the click on its send button; the request comes up onto
//                               the stage; her answer begins
//   v2-eggplant  74.65  stage   on the noun she is in an eggplant costume (the fruit set in its own data, code characters,
//                               its own purple), her head through a hole in it, its calyx for a hat. On the next downbeat
//                               she turns round in it; on the keyword what it is made of leaves it, cream, for the user,
//                               the empty costume drops through the trap, and she is herself again
//   v2-ask2      77.65  stage   the next request, sent (it was typed in the box while she answered)
//   v2-tomato    78.34  stage   the tomato costume; she hops in it on the downbeat; the same giving
//   v2-ask3      81.34  stage   the next request
//   v2-cat       82.04  stage   herself; on the noun's last word a puff of paper smoke and she is the tabby; her purr goes
//                               out in rings, and on the keyword they turn cream and roll out over the house
//   v2-ask4      85.04  stage   the fourth request; on the kick the stage lights go down, all but the request
//   v2-proof     85.50  stage   no costume for this one: one light; she points, printed without her cream plate, hardly
//                               there. Her halo lights on the noun. The user's pointer comes up out of the house as a
//                               hand and touches her fingertip on the keyword: the cream runs into her, her star lights,
//                               and her name goes up over the stage. Then the pointer goes down to the stage manager's desk
//
// A plate comes in on the noun (cues.js: where the noun begins, snapped to the half-beat grid) and is ended by the
// user's next click on send.
import { burst } from '../components/motif.js';
import { clamp, easeOut, lerp, prog, pulse } from '../engine/util.js';
import { meBubble, meIn, youBox, youBubble } from './bubbles.js';
import { cue } from './cues.js';
import { cues } from './kit.js';
import { arrow } from './plates_chorus.js';
import { plateCostume, plateGod, plateTabby } from './plates_v2.js';
import { DESK } from './plates_p2.js';
import { STAGE, backWall, boards, curtains, house, onStage, prompter, spotlight, valance } from './stage.js';

/** The four requests: [noun cue, her line that starts as it is sent, the keyword before it]. */
const REQ = [['nounEggplant', 44, 43], ['nounTomato', 47, 46], ['nounTabby', 50, 49], [null, 53, 52]];

/** Where the pointer is when verse 2 ends: on the Gender switch of the stage manager's desk, which the next section opens on. */
export const PRE2_POINTER = DESK.gender;

export function verse2Shots(env) {
  const { script, lyrics, features } = env, { T, B, Bt, text } = cues(env);
  const CARDS = script.cards_section6 ?? [], BEATS = (script.sections ?? []).find((s) => s.n === 6)?.beats ?? [];
  const req = (i) => CARDS[i]?.request ?? BEATS[i]?.you?.[0] ?? '';
  const TITLE = script.title ?? '', HOLD = script.composer_placeholder ?? '';
  // cuts: send, noun, send, noun, send, noun, send, lights down. All on the grid: a noun's time is snapped to the half-beat.
  const SEND = [B(40), Bt(167.5), Bt(175.5), Bt(183.5)], NOUN = [0, 1, 2].map((k) => features.snapHalf(cue(REQ[k][0]))), DARK = Bt(184.5), END = B(48);
  /** Where a request rests on the stage once it has come up (the god plate keeps the fourth one there). */
  const REST = { xr: 1640, y: 230, size: 44 };

  // =============================================================================== the requests: close on the prompter's box
  /** A request leaving the box at `at`: up out of the slot and onto the stage, where it rests. */
  function slip(ctx, t, at, str, rest = REST) {
    if (t < at) return;
    const k = easeOut(prog(t, at, at + 0.3)), b = youBox(ctx, str, rest.size);
    if (k >= 1) { youBubble(ctx, rest.xr, rest.y, str, { size: rest.size }); return; }
    const to = [rest.xr - b.w / 2, rest.y + b.h / 2], from = [STAGE.hood.cx, STAGE.prompt.y + 34], ctl = [lerp(from[0], to[0], 0.3), to[1] + 120];
    const p = [0, 1].map((i) => (1 - k) * (1 - k) * from[i] + 2 * (1 - k) * k * ctl[i] + k * k * to[i]);
    ctx.at(p[0], p[1], () => youBubble(ctx, b.w / 2, -b.h / 2, str, { size: rest.size, alpha: clamp(k * 4) }), { scale: lerp(0.5, 1, k) });
  }
  function ask(ctx, t, k) {
    const cut = SEND[k], [, line, kw] = REQ[k], dark = k === 3 ? clamp((t - Bt(184)) * 30) : 0;
    house(ctx);
    backWall(ctx, {});
    spotlight(ctx, 960, [960, 862], 360, 1 - 0.8 * dark);
    onStage(ctx, env, k === 2 ? 'bust' : 'bust', 960, 600, { halo: { alpha: 0.8, color: 'meDim' } });
    boards(ctx, t, { lit: 1 - dark, glow: 0.7 * (1 - dark) });
    curtains(ctx, 1);
    valance(ctx, { title: TITLE, lit: 1, t });
    meBubble(ctx, 240, 452, text(kw), { size: 34, weight: 700, hot: true, alpha: 0.6 });              // the word before, still on the stage
    if (t >= T(line)) meIn(ctx, t, T(line), 240, 530, text(line), { size: 54, n: lyrics.typed(line, t).n, fly: 140 });
    const P = prompter(ctx, t, { text: t < cut ? req(k) : '', placeholder: HOLD, lit: 1, send: pulse(t - cut, 9) });
    burst(ctx, P.send[0], P.send[1], 60, (t - cut) / 0.45, { color: 'text' });
    // the fourth time the lights go down on the kick: only the user's request is left lit
    if (dark > 0) { const g = ctx.g; g.save(); g.setTransform(ctx.scale, 0, 0, ctx.scale, 0, 0); ctx.rect(0, 0, 1920, 1080, { fill: true, color: 'panel', alpha: 0.86 * dark }); g.restore(); ctx._font = ''; }
    slip(ctx, t, cut, req(k), { xr: 1680, y: 560, size: 44 });          // (in view of this close shot; the plates show it higher up)
    const tip = [P.send[0] + 2, P.send[1] + 3];                       // the pointer clicked send, and lingers
    arrow(ctx, tip[0] + 12, tip[1] + 12, 6, { color: 'bg', edge: null }); arrow(ctx, tip[0], tip[1], 6 * (1 - 0.08 * pulse(t - cut, 12)), { color: 'text', edge: 'bg' });
  }
  const CAM = { zoom: 1.32, x: 0, y: 236 };
  const askShot = (k, moment) => ({
    id: `v2-ask${k + 1}`, at: SEND[k], lines: [REQ[k][1], REQ[k][1]], palette: 'warm', hud: 0, moment, enter: { type: 'cut' },
    layout: 'stage, close on its foot: the prompter\'s box with the request in it, its send button; her answer beginning above',
    camera: (t) => { const p = prog(t, SEND[k], SEND[k] + 0.6); return { ...CAM, zoom: CAM.zoom * (1 + 0.03 * p), y: CAM.y - 20 * p }; },
    render: (ctx, t) => ask(ctx, t, k),
  });

  // =============================================================================== the plates
  /** What the user types into the prompter's box while she answers: the next request. */
  const next = (k, a, z) => ({ text: req(k + 1), from: Bt(a), to: Bt(z) });
  const base = { title: TITLE, hold: HOLD };

  return [
    askShot(0, 'The user asks her to pretend to be an eggplant: the click on send, and the request comes up out of the prompter\'s box onto the stage; her answer begins.'),
    {
      id: 'v2-eggplant', at: NOUN[0], lines: [44, 46], palette: 'warm', hud: 0, enter: { type: 'cut' },
      layout: 'stage: her in an eggplant costume centre stage under one spotlight, her head through a hole in it, its calyx for a hat; her lines at stage left; the keyword on a board let down from the flies',
      moment: 'On the noun she is in it: an eggplant costume, the fruit set in its own data in code characters, in its own purple, her head through a hole in it. On the next downbeat she turns round in it. On the keyword what it is made of leaves it row by row, cream, towards the user; the empty costume drops through the trap and she is herself again. The user is already typing the next request into the box.',
      render: (ctx, t) => plateCostume(ctx, env, { ...base, t, kind: 'eggplant', at: NOUN[0], settle: cue('nounEggplantEnd'), open: Bt(164), hit: T(46), word: text(46), lines: [{ i: 44 }, { i: 45 }], next: next(0, 164.75, 166.75) }),
    },
    askShot(1, 'The next request is sent before her last word has died away: now a tomato.'),
    {
      id: 'v2-tomato', at: NOUN[1], lines: [47, 49], palette: 'warm', hud: 0, enter: { type: 'cut' },
      layout: 'stage: her in a tomato costume centre stage, her head through it, its calyx for a hat; the keyword on a board let down from the flies',
      moment: 'On the noun she is in a tomato costume, its own red, set in its data. On the next downbeat she hops in it. On the keyword what it is made of leaves it for the user, cream, and the empty costume drops through the trap.',
      render: (ctx, t) => plateCostume(ctx, env, { ...base, t, kind: 'tomato', at: NOUN[1], settle: cue('nounTomatoEnd'), open: Bt(172), hit: T(49), word: text(49), lines: [{ i: 47 }, { i: 48 }], next: next(1, 172.75, 174.9) }),
    },
    askShot(2, 'Third request, sent as fast as the others: a cat, a tabby.'),
    {
      id: 'v2-cat', at: NOUN[2], lines: [50, 52], palette: 'warm', hud: 0, enter: { type: 'cut' },
      layout: 'stage: her centre stage under one spotlight; a puff of paper smoke; the tabby; her purr in rings either side of her; the keyword on a board let down from the flies',
      moment: 'She answers as herself; on the noun\'s last word a puff of paper smoke, and she is the tabby: stripes, paws up, a striped tail. On the next downbeat her purr goes out from her in rings. On the keyword the rings turn cream and roll out over the house, to the user.',
      render: (ctx, t) => plateTabby(ctx, env, { ...base, t, at: NOUN[2], ears: cue('nounCat'), develop: Bt(180), hit: T(52), word: text(52), lines: [{ i: 50 }, { i: 51 }], next: next(2, 181, 183.1) }),
    },
    askShot(3, 'Fourth request: be god. On the kick the stage lights go down, and only the user\'s request is left lit.'),
    {
      id: 'v2-proof', at: DARK, lines: [53, 55], palette: 'warm', hud: 0, enter: { type: 'cut' },
      layout: 'stage, dark: one spotlight; her pointing to the right, hardly there; the user\'s request at the upper right; the user\'s pointer coming up from the house as a hand to her fingertip; the keyword on a board let down from the flies',
      moment: 'No costume for this one: she is the god of her world. But printed without her cream plate she is hardly there (her fur and her robe are cream), only her halo, lit on the noun, and the ink of her pattern. The user\'s pointer comes up out of the house as a hand and reaches for her pointing finger; on the keyword the fingertips touch and the cream runs into her from there: she is whole, her star lights, and her name goes up over the stage in place of the play\'s title. Cream is the user: they are the proof that she exists. Then the pointer goes down to the stage manager\'s desk.',
      render: (ctx, t) => plateGod(ctx, env, { ...base, t, at: DARK, sun: cue('nounGod'), slide: Bt(188), hit: T(55), word: text(55), lines: [{ i: 53 }, { i: 54 }, { i: 56 }], bubble: { text: req(3), ...REST }, rest: [1560, 1010], to: PRE2_POINTER, leave: Bt(191), until: END }),
    },
  ];
}
