// Stand-in lyric lines for previews made before a complete lyric file is in `音頻&歌詞/`.
//   node tools/placeholder_lyrics.mjs              -> data/lyrics.json, every line a marker
//   node tools/placeholder_lyrics.mjs <file>       -> data/lyrics.json, the lines found in <file>, markers for the rest
// A marker reads "lyric 07" (keyword lines "LYRIC 07"); line 12, the title of the song, is set as the title.
// Keep a partial file OUTSIDE the top of `音頻&歌詞/` (e.g. `音頻&歌詞/partial/`): a lyric file there must be
// complete, or the preview and the export stop (tools/fill_lyrics.mjs). Once a complete file is in place, it
// overwrites data/lyrics.json and nothing else has to change. data/lyrics.json is local; it is never committed.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fill } from './fill_lyrics.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const cfg = readJson('config.json'), table = readJson('data/lyric_timing.json');
const TITLE = 11;

const src = process.argv[2] ? path.resolve(process.argv[2]) : null;
const found = src ? fill(table, fs.readFileSync(src), path.basename(src)) : null;
const missing = new Set(found ? found.report.missing : table.lines.map((_, i) => i));

const lines = table.lines.map((L, i) => {
  if (!missing.has(i)) return found.lyrics.lines[i];
  const n = String(i + 1).padStart(2, '0');
  const text = i === TITLE ? 'world.execute(me);' : L.emphasis ? `LYRIC ${n}` : `lyric ${n}`;
  return { start: L.start, text, index: i, end: L.end, section: L.section, emphasis: L.emphasis };
});
const lyrics = { source: found ? `${path.basename(src)} + placeholders` : 'placeholder', encoding: found?.lyrics.encoding ?? 'utf-8',
  hasWordTimestamps: false, credits: [], meta: {}, sections: table.sections, lines };
const out = path.join(ROOT, cfg.paths.lyrics);
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(lyrics, null, 1) + '\n', 'utf8');
const first = [...missing].sort((a, b) => a - b)[0];
console.log(`[lyrics] wrote ${path.relative(ROOT, out)}: ${lines.length - missing.size} lines from your file, ${missing.size} placeholders` +
  (missing.size ? ` (first at line ${first + 1}, ${table.lines[first].start.toFixed(2)} s)` : ''));
