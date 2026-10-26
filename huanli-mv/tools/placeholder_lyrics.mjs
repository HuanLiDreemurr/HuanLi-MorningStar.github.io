// Stand-in lyric lines for previews made before the song's own lyric file is in `音頻&歌詞/`.
//   node tools/placeholder_lyrics.mjs   -> data/lyrics.json   (local; never committed)
// Every line becomes a visible marker ("lyric 07", keyword lines "LYRIC 07"), except line 12, which is the
// title of the song and is set as the title. Once a real lyric file is put in place, tools/fill_lyrics.mjs
// overwrites this file with the real lines; nothing else has to change.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const cfg = readJson('config.json'), table = readJson('data/lyric_timing.json');
const TITLE = 11;

const lines = table.lines.map((L, i) => {
  const n = String(i + 1).padStart(2, '0');
  const text = i === TITLE ? 'world.execute(me);' : L.emphasis ? `LYRIC ${n}` : `lyric ${n}`;
  return { start: L.start, text, index: i, end: L.end, section: L.section, emphasis: L.emphasis };
});
const lyrics = { source: 'placeholder', encoding: 'utf-8', hasWordTimestamps: false, credits: [], meta: {}, sections: table.sections, lines };
const out = path.join(ROOT, cfg.paths.lyrics);
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(lyrics, null, 1) + '\n', 'utf8');
console.log(`[lyrics] wrote ${path.relative(ROOT, out)}: ${lines.length} placeholder lines`);
