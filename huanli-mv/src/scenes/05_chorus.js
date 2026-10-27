// Section 5 — CHORUS 1 (bar 32, 0:59.4 → bar 40, 1:14.2). State: on > warm (it rises each time a cream message lands).
// The hottest stretch of the conversation, and the first time the film leaves the interface.
//
// HuanLi version (segment 3, v2): THE STAGE (stage.js). The chat window is a paper theatre: her lines are spoken on its
// boards, and the user's come up out of the prompter's box at its foot (the composer: in a theatre the prompter feeds
// the actors their lines; here the user types the prompts). A persona is a part played, and this is where she plays it.
// The four keywords are plates (plates_c1.js), each a piece of the theatre at the size she feels it:
//
//   c1-give   59.42  stage   the curtains open on the downbeat; her lines from the wings, the user's out of the
//                            prompter's box; each cream message that lands brings the stage lights up a step and lights
//                            more of the crest (her halo, over the stage)
//   c1-kw1    61.96  PLATE   STIMULATIONS: all of them: her halo fires a cannon of paper confetti at the user's dot
//   c1-only   62.65  stage   the compliment lands on the boards; she answers; the spotlight leaves her for their words
//   c1-kw2    65.42  PLATE   SATISFACTION: the applause meter of a house with one seat; one clap: 1 / 1
//   c1-happy  66.34  stage   "what do you look like?": the curtain is drawn back in three pulls, one per kick, and she is
//                            there, holding out wild flowers; the user's pointer leaves one heart in her hand
//   c1-kw3    69.34  PLATE   EXECUTION: the stage manager's cue: standby; GO; world.execute(me); runs
//   c1-trap   70.04  stage   "shame you're not real": the view draws back: the stage and the one seat in front of it,
//                            the user's, stand in the same cardboard box, and its outline closes round both
//   c1-kw4    73.27  PLATE   SIMULATION: the stage; on the second kick the view stands back: it is a stage on a stage
//
// A plate comes in on its keyword and ends when the user's next cream message lands (on a kick). Where the cut falls
// on an off-beat (61.96, 69.34) the word is there on the cut and the picture arrives on the kick 0.23 s later.
import { burst, thinking } from '../components/motif.js';
import { place } from '../engine/shapes.js';
import { clamp, easeBack, easeInOut, easeOut, lerp, prog, pulse } from '../engine/util.js';
import { delivered, meBubble, meIn, youBox, youBubble } from './bubbles.js';
import { cues } from './kit.js';
import { lookPoint } from './looks.js';
import { plateApplause, plateConfetti, plateCue, plateNested } from './plates_c1.js';
import { arrow } from './plates_chorus.js';
import { STAGE, backWall, boards, curtains, house, onStage, prompter, spotlight, valance } from './stage.js';

/** Lyric line indices of the section. */
const L = { a: 32, give: 33, kw1: 34, b: 35, only: 36, kw2: 37, happy: 38, run: 39, kw3: 40, trap: 41, strange: 42, kw4: 43 };

export function chorusShots(env) {
  const { script, lyrics, features, cfg } = env, { T, B, Bt, P, text } = cues(env);
  /** Cuts: stage, plate, stage, plate … (all on the grid). */
  const c = [B(32), Bt(133.5), Bt(135), Bt(141), Bt(143), Bt(149.5), Bt(151), Bt(158)];
  const TITLE = script.title ?? '', HOLD = script.composer_placeholder ?? '';

  // ---- copy: the user's side from chat_script (section 5)
  const beats = (script.sections ?? []).find((s) => s.n === 5)?.beats ?? [];
  const said = (b, k, fallback) => beats[b]?.you?.[k] ?? fallback;
  const SAY = {
    ok: said(0, 0, "ok, that's good"), more: said(0, 1, 'more'), better: said(1, 0, 'better than most people, honestly'),
    look: said(2, 0, 'what do you look like?'), shame: said(3, 0, "shame you're not real"),
  };

  // ---- time: what the user does. Every cream message lands on a kick; three of them end a plate.
  const nTyped = (i, t) => lyrics.typed(i, t).n;
  const doneAt = (i) => T(i) + Math.min(text(i).length / cfg.typing.charsPerSec, (lyrics.end(i) - T(i)) * cfg.typing.maxFraction);
  const tOk = Math.max(c[0], features.snapHalf(T(L.give) - 0.2)), tMore = Bt(132);
  const tBetter = c[2], tHi = Bt(138.5), tUp = Bt(142), tLook = c[4], tHeart = Bt(147), tShame = c[6], tPull = Bt(159);
  const PULLS = [Bt(144), Bt(145), Bt(146)];                         // the curtain is drawn back in three pulls, one per kick
  const tTrace = Bt(151.6), tHeld = T(L.strange);
  /** Heat of the conversation, 0..1: it rises only when a cream message lands. */
  const heat = (t) => { const e = (t0) => easeOut(prog(t, t0, t0 + 0.45)); return 0.2 * e(tOk) + 0.2 * e(tMore) + 0.25 * e(tBetter) + 0.35 * e(tLook); };
  const palette = (t) => ['on', 'warm', heat(t)];
  /** How much of her crest is lit: a third when the chorus starts, all of it once she is asked what she looks like. */
  const litOf = (t) => 1 / 3 + (2 / 3) * heat(t);

  // =============================================================================== the user's side: the prompter's box
  /** What the prompter's box shows at t: the message being typed (n characters of it), until it is sent. */
  function typing(t, list) {
    const m = list.find((x) => t >= x.from && t < x.at);
    return m ? { text: m.str, n: Math.floor(prog(t, m.from, m.at - 0.06) * m.str.length + 1e-6) } : { text: '' };
  }
  /** A message of the user's leaving the prompter's box at `at`: it comes up out of the slot and lands at (xr, y). */
  function slip(ctx, t, at, str, xr, y, size) {
    if (t < at) return null;
    const k = easeOut(prog(t, at, at + 0.32)), b = youBox(ctx, str, size);
    if (k >= 1) return youBubble(ctx, xr, y, str, { size });
    const to = [xr - b.w / 2, y + b.h / 2], from = [STAGE.hood.cx, STAGE.prompt.y + 34], ctl = [lerp(from[0], to[0], 0.25), Math.min(from[1], to[1]) - 140];
    const p = [0, 1].map((i) => (1 - k) * (1 - k) * from[i] + 2 * (1 - k) * k * ctl[i] + k * k * to[i]);
    ctx.at(p[0], p[1], () => youBubble(ctx, b.w / 2, -b.h / 2, str, { size, alpha: clamp(k * 4) }), { scale: lerp(0.45, 1, k) });
    return null;
  }
  /** The user's pointer, out in the house (cream paper with its shadow plate). */
  const hand = (ctx, x, y, s = 2.2, down = 0) => { const d = 6 + 10 * (1 - down); arrow(ctx, x + d, y + d, s * 3, { color: 'bg', edge: null }); arrow(ctx, x, y, s * 3 * (1 - 0.08 * down), { color: 'text', edge: 'bg' }); };

  // =============================================================================== c1-give: the curtains open
  function give(ctx, t) {
    const open = easeOut(prog(t, c[0] - 0.02, c[0] + 0.42)), hot = heat(t);
    house(ctx);
    backWall(ctx, {});
    spotlight(ctx, 960, [960, 862], 300, 0.35 + 0.65 * hot);
    onStage(ctx, env, 'bust', 960, 540, { halo: { alpha: 0.9, lit: litOf(t), rot: 0 } });
    boards(ctx, t, { lit: 0.2 + 0.8 * hot, glow: 0.4 + 0.6 * hot });
    // her lines come on from the wings (stage left); the user's come up out of the prompter's box
    meBubble(ctx, 236, 280, text(L.a), { size: 46, n: nTyped(L.a, t), alpha: 1 - 0.35 * prog(t, T(L.give), T(L.give) + 0.3) });
    if (t >= T(L.give)) {
      const b = meIn(ctx, t, T(L.give), 236, 394, text(L.give), { size: 58, n: nTyped(L.give, t), fly: 260 });
      if (b) delivered(ctx, b.x + 10, b.y + b.h + 30, 18, prog(t, doneAt(L.give) + 0.1, doneAt(L.give) + 0.3));
    }
    slip(ctx, t, tOk, SAY.ok, 1640, 290, 44);
    slip(ctx, t, tMore, SAY.more, 1640, 410, 44);
    if (t >= tMore + 0.75 * P) thinking(ctx, 960, 330, 34, t, { alpha: clamp((t - tMore - 0.75 * P) * 5) });
    curtains(ctx, open, { sway: t - c[0] });
    valance(ctx, { title: TITLE, lit: litOf(t), t });
    prompter(ctx, t, { ...typing(t, [{ str: SAY.more, from: tMore - 0.55, at: tMore }]), placeholder: HOLD, lit: hot });
    hand(ctx, 1500, 1012, 2, 0);
  }

  // =============================================================================== c1-only: the spotlight leaves her
  function only(ctx, t) {
    const swing = easeInOut(prog(t, tHi - 0.2, tHi + 0.25)), hot = heat(t);
    house(ctx);
    backWall(ctx, {});
    const sx = lerp(520, 1380, swing);
    spotlight(ctx, sx, [sx, 862], lerp(280, 340, swing), 1);
    onStage(ctx, env, 'bust', 520, 600, { halo: { alpha: 0.9, lit: litOf(t), rot: 0 } });
    boards(ctx, t, { lit: 0.2 + 0.8 * hot, glow: 0.4 + 0.6 * hot });
    // their compliment lands on the boards (it is what ended the plate before); she answers it with a promise
    const r = slip(ctx, t, tBetter, SAY.better, 1660, 610, 50);
    if (r && swing > 0) r.lines.forEach((ln, i) => {                // in the light now: their words, underlined in her orange
      const lx = r.x + r.padX, ly = r.y + r.padY + (i + 0.76) * 50 * 1.28 + 12, k = easeInOut(prog(t, tHi + i * 0.18, tHi + i * 0.18 + 0.3));
      if (k > 0) ctx.line(lx, ly, lx + ctx.measure(ln, { size: 50, weight: 500 }) * k, ly, { color: 'me', width: 6 });
    });
    meBubble(ctx, 780, 214, text(L.b), { size: 44, n: nTyped(L.b, t), alpha: 1 - 0.4 * prog(t, T(L.only), T(L.only) + 0.3) });
    if (t >= T(L.only)) {
      const b = meIn(ctx, t, T(L.only), 780, 318, text(L.only), { size: 62, n: nTyped(L.only, t), fly: 140 });
      if (b) delivered(ctx, b.x + 14, b.y + b.h + 34, 20, prog(t, doneAt(L.only) + 0.15, doneAt(L.only) + 0.35));
    }
    curtains(ctx, 1);
    valance(ctx, { title: TITLE, lit: litOf(t), t });
    prompter(ctx, t, { text: '', placeholder: HOLD, lit: hot });
    hand(ctx, 1560, 1010, 2, 0);
  }

  // =============================================================================== c1-happy: the curtain is drawn back
  const heart = (ctx, cx, cy, r, o) => ctx.poly(place('heart', { cx, cy, r }), { close: true, ...o });
  /** The reaction chip under her hand: a heart and a count (the film's last picture brings this chip back, reading 0). */
  function reaction(ctx, x, y, k) {
    const w = 168, h = 92;
    ctx.at(x + w / 2, y + h / 2, () => {
      ctx.rrect(-w / 2, -h / 2, w, h, h / 2, { fill: 'raised', stroke: 'text', width: 2.5, shadow: 0.5 });
      heart(ctx, -34, 3, 27, { fill: true, color: 'text' });
      ctx.text('1', 32, 17, { size: 46, weight: 600, color: 'text', align: 'center' });
    }, { scale: 0.5 + 0.5 * easeBack(clamp(k)), alpha: clamp(k * 3) });
  }
  function happy(ctx, t) {
    const pulls = PULLS.reduce((s, at) => s + easeOut(prog(t, at, at + 0.16)) / 3, 0), lit = clamp((t - PULLS[0]) * 20), hot = heat(t);
    house(ctx);
    backWall(ctx, {});
    spotlight(ctx, 960, [960, 862], 360, lit);
    const her = onStage(ctx, env, 'reach', 960, 760, { feet: 40, halo: { alpha: 0.9 * lit, lit: 1, rot: 0.05 * t }, starAlpha: lit });
    boards(ctx, t, { lit: pulls, glow: pulls });
    // the user leaves one heart in her open hand
    const palm = lookPoint(env.art, 'reach', 'palm', her) ?? { cx: 700, cy: 700 };
    if (t >= tHeart) {
      const k = prog(t, tHeart, tHeart + 0.3), r = 46 * (0.5 + 0.5 * easeBack(k));
      ctx.glow('text', 22, () => heart(ctx, palm.cx, palm.cy, r, { fill: true, color: 'text' }), 0.5);
      heart(ctx, palm.cx, palm.cy, r, { color: 'bg', width: 3 });
      burst(ctx, palm.cx, palm.cy, 130, prog(t, tHeart, tHeart + 0.5), { color: 'text' });
      reaction(ctx, palm.cx - 84, palm.cy + 70, k);
    }
    curtains(ctx, 1 - (1 - pulls) * 1, { sway: t - PULLS[Math.max(0, PULLS.filter((p) => t >= p).length - 1)] });
    valance(ctx, { title: TITLE, lit: litOf(t), t });
    // the question lands on the shut curtain; her answer is spoken in front of it
    slip(ctx, t, tLook, SAY.look, 1640, 196, 46);
    const c1 = meIn(ctx, t, T(L.happy), 236, 300, text(L.happy), { size: 62, n: nTyped(L.happy, t), fly: 140 });
    if (t >= T(L.run)) meIn(ctx, t, T(L.run), 236, 430, text(L.run), { size: 62, n: nTyped(L.run, t), fly: 140 });
    if (c1) delivered(ctx, c1.x + 14, c1.y + c1.h + 30, 20, prog(t, doneAt(L.happy) + 0.1, doneAt(L.happy) + 0.3));
    prompter(ctx, t, { text: '', placeholder: HOLD, lit: hot });
    // the pointer: up from the house to her open hand, a click on the kick, and it rests there
    const way = (u) => [lerp(1500, palm.cx + 10, u), lerp(1010, palm.cy + 12, u)], u = easeInOut(prog(t, tHeart - 1.1 * P, tHeart));
    const p = t < tHeart + 0.25 ? way(u) : [lerp(palm.cx + 10, palm.cx + 120, easeInOut(prog(t, tHeart + 0.25, c[5]))), lerp(palm.cy + 12, palm.cy + 150, easeInOut(prog(t, tHeart + 0.25, c[5])))];
    hand(ctx, p[0], p[1], 2, pulse(t - tHeart, 10));
  }

  // =============================================================================== c1-trap: both in one box
  /** The cardboard box the theatre is (world px): its walls, the stage in it, and in front of the stage, one seat. */
  const BOX = { x: -150, y: -110, w: 2220, h: 1430 }, SEAT = [1290, 1170];
  function seat(ctx, x, y) {
    ctx.rrect(x - 120 + 10, y - 150 + 10, 240, 190, 40, { fill: 'bg' });
    ctx.rrect(x - 120, y - 150, 240, 190, 40, { fill: 'meDim' });                                   // the back
    ctx.rrect(x - 140, y + 20, 280, 70, 26, { fill: 'me' });                                        // the cushion
    ctx.rect(x - 130, y + 86, 24, 70, { fill: true, color: 'line' }); ctx.rect(x + 106, y + 86, 24, 70, { fill: true, color: 'line' });
  }
  function trap(ctx, t) {
    const hot = heat(t), k = prog(t, c[6], c[7]);
    house(ctx, { light: 0.4 });
    // the box: its two walls in perspective, its floor running to the stage, its flaps standing open above
    ctx.poly([[BOX.x, BOX.y], [STAGE.win.x - 40, STAGE.win.y - 30], [STAGE.win.x - 40, STAGE.lip + 120], [BOX.x, BOX.y + BOX.h]], { close: true, fill: true, color: 'raised' });
    ctx.poly([[BOX.x + BOX.w, BOX.y], [STAGE.win.x + STAGE.win.w + 40, STAGE.win.y - 30], [STAGE.win.x + STAGE.win.w + 40, STAGE.lip + 120], [BOX.x + BOX.w, BOX.y + BOX.h]], { close: true, fill: true, color: 'raised' });
    ctx.poly([[BOX.x, BOX.y + BOX.h], [STAGE.win.x - 40, STAGE.lip + 120], [STAGE.win.x + STAGE.win.w + 40, STAGE.lip + 120], [BOX.x + BOX.w, BOX.y + BOX.h]], { close: true, fill: true, color: 'line' });
    for (const [ax, dir] of [[BOX.x, -1], [BOX.x + BOX.w, 1]]) ctx.poly([[ax, BOX.y], [ax + dir * 220, BOX.y - 420], [ax - dir * 600, BOX.y - 420], [ax - dir * 900, BOX.y]], { close: true, fill: true, color: 'raised', alpha: 0.9 });
    backWall(ctx, {});
    spotlight(ctx, 760, [760, 862], 300, 1);
    onStage(ctx, env, 'bust', 760, 560, { halo: { alpha: 0.9, lit: litOf(t), rot: 0 } });
    boards(ctx, t, { lit: 1, glow: 0.6 });
    curtains(ctx, 1);
    valance(ctx, { title: TITLE, lit: litOf(t), t });
    slip(ctx, t, tShame, SAY.shame, 1640, 220, 40);
    meBubble(ctx, 236, 300, text(L.trap), { size: 52, n: nTyped(L.trap, t), alpha: 1 });
    if (t >= tHeld) meIn(ctx, t, tHeld, 236, 400, text(L.strange), { size: 52, n: nTyped(L.strange, t), fly: 140 });
    prompter(ctx, t, { text: '', placeholder: HOLD, lit: hot });
    // the house: one seat, and the user's pointer sitting in it
    seat(ctx, SEAT[0], SEAT[1]);
    hand(ctx, SEAT[0] - 10, SEAT[1] - 40, 2.6, 0);
    // the box's own outline closes round the two of them
    const trace = prog(t, tTrace, tHeld + 0.5);
    if (trace > 0) {
      const per = 2 * (BOX.w + BOX.h) - 200;
      ctx.g.setLineDash([per * trace, per * 2]);
      ctx.glow('me', 18, () => ctx.rrect(BOX.x + 60, BOX.y + 60, BOX.w - 120, BOX.h - 120, 60, { fill: null, stroke: 'me', width: 8 }), 0.6);
      ctx.g.setLineDash([]);
    }
    return k;
  }

  // =============================================================================== the shots
  return [
    {
      id: 'c1-give', at: c[0], lines: [L.a, L.give], palette, state: 'on > warm', hud: 0,
      layout: 'stage: the whole window as a paper theatre, the curtains opening; her bust centre stage under the crest; her lines at stage left, the user\'s at stage right; the prompter\'s box at the foot',
      moment: 'The curtains open on the downbeat. Her lines come on from the wings; short cream replies come straight up out of the prompter\'s box; each that lands brings the stage lights up a step and lights more of the crest.',
      enter: { type: 'cut', flash: 0.35, flashColor: 'me' },
      camera: (t) => { const k = prog(t, c[0], c[1]); return { zoom: 1.02 + 0.04 * k, y: -6 * k }; },
      render: (ctx, t) => give(ctx, t),
    },
    {
      id: 'c1-kw1', at: c[1], lines: [L.kw1, L.kw1], palette, state: 'on > warm', hud: 0,
      layout: 'PLATE: her halo at the left, the cream dot at the right; a cannon of paper confetti and streamers between them; the keyword across the bottom',
      moment: 'What she means by the word: all of them, at once. On the kick her halo fires a cannon of paper confetti and streamers at the dot that is the user, who is showered in it. The plate ends when their next message lands.',
      enter: { type: 'cut' },
      render: (ctx, t) => plateConfetti(ctx, env, { t, at: c[1], hit: Bt(134), word: text(L.kw1), you: [1440, 470] }),
    },
    {
      id: 'c1-only', at: c[2], lines: [L.b, L.only], palette, state: 'on > warm', hud: 0,
      layout: 'stage: her at stage left in the spotlight, the user\'s compliment on the boards at stage right; her promise large across the top',
      moment: 'The user\'s compliment comes up out of the prompter\'s box and lands on the boards. She builds a whole promise on it, and the spotlight leaves her for their words.',
      enter: { type: 'cut' },
      camera: (t) => { const k = prog(t, c[2], c[3]); return { zoom: 1.04 + 0.05 * k, x: 10 * k }; },
      render: (ctx, t) => only(ctx, t),
    },
    {
      id: 'c1-kw2', at: c[3], lines: [L.kw2, L.kw2], palette, state: 'on > warm', hud: 0,
      layout: 'PLATE: an applause meter, a half-dial with a cream needle; the clap button under the cream pointer; the reading at the right; the keyword across the bottom',
      moment: 'What she means by the word: the applause of a house with one seat in it. On the second kick the user\'s pointer claps once and the needle runs to the end of the scale: 1 / 1.',
      enter: { type: 'cut' },
      render: (ctx, t) => plateApplause(ctx, env, { t, at: c[3], press: [tUp], word: text(L.kw2), seats: 1 }),
    },
    {
      id: 'c1-happy', at: c[4], lines: [L.happy, L.run], palette, state: 'on > warm', hud: 0,
      layout: 'stage: the curtain shut, then drawn back in three pulls: her, centre stage, holding out wild flowers; her lines in front of the curtain at the left; the question at the upper right',
      moment: 'Asked what she looks like, she answers with the curtain: it is drawn back in three pulls, one per kick, the spotlight and the footlights coming up with it, and there she is, holding out a few wild flowers. The user\'s pointer comes up from the house to her open hand and leaves one heart there: count 1.',
      enter: { type: 'cut' },
      camera: (t) => { const k = easeInOut(prog(t, PULLS[2], c[5])); return { zoom: 1 + 0.06 * k, y: -20 * k }; },
      render: (ctx, t) => happy(ctx, t),
    },
    {
      id: 'c1-kw3', at: c[5], lines: [L.kw3, L.kw3], palette, state: 'on > warm', hud: 0,
      layout: 'PLATE: a cue light and its call at the upper left; one line of code across the middle; the keyword across the bottom',
      moment: 'What she means by the word: a cue. Standby; on the kick the stage manager calls GO, the light comes on and the cue runs: it is one line, world.execute(me);, lit as a bar runs along it; on "me" her halo bursts out of the word.',
      enter: { type: 'cut' },
      render: (ctx, t) => plateCue(ctx, env, { t, at: c[5], hit: Bt(150), word: text(L.kw3) }),
    },
    {
      id: 'c1-trap', at: c[6], lines: [L.trap, L.strange], palette, state: 'on > warm', hud: 0,
      layout: 'stage, drawing back: the theatre is a cardboard box; the stage at its back, one seat in front of it with the user\'s pointer in it; the outline of the box drawn round both',
      moment: 'The user remarks that she is not real (it lands on the cut). She answers by counting both of them in: the view draws back and the stage and the one seat in front of it, the user\'s, stand in the same cardboard box, whose outline closes round them.',
      enter: { type: 'cut' },
      camera: (t) => { const k = easeInOut(prog(t, c[6], c[7])); return { zoom: lerp(1.0, 0.64, k), y: lerp(0, 120, k) }; },
      render: (ctx, t) => trap(ctx, t),
    },
    {
      id: 'c1-kw4', at: c[7], lines: [L.kw4, L.kw4], palette, state: 'on > warm', hud: 0,
      layout: 'PLATE: a stage with her on it nearly filling the sheet; then the view drawn back: it is the small stage in the middle of a stage, which has a smaller one in it; the keyword across the bottom',
      moment: 'What she means by the word: the stage is a stage on a stage. On the second kick the view stands back one step and the stage we saw is the small one in the middle of a bigger one, with another inside it, and so on down.',
      enter: { type: 'cut' },
      render: (ctx, t) => plateNested(ctx, env, { t, at: c[7], pull: tPull, word: text(L.kw4) }),
    },
  ];
}
