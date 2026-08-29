#!/usr/bin/env node
// Traitement du son facon monteur : detecte les blancs dans la video avatar
// et les coupe. A lancer entre heygen.mjs et render.mjs.
//
//   node scripts/trim-silence.mjs S07 [--noise -35dB] [--min 0.45]
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, readCalendar, writeCalendar, pickShort, ffmpeg, ffmpegCommand, missingFilters, mediaDuration } from './lib.mjs';

const args = process.argv.slice(2);
const flag = (n, d) => {
  const i = args.indexOf(`--${n}`);
  return i >= 0 ? args[i + 1] : d;
};
const noise = flag('noise', '-35dB');
const minSilence = Number(flag('min', 0.45)); // on ne coupe pas en dessous
const keep = 0.12; // respiration laissee de chaque cote d'une coupe

const cal = readCalendar();
const short = pickShort(cal, args.find((a) => /^S\d\d$/i.test(a)));
if (!short.avatar) {
  console.error(`${short.id} : pas encore de video avatar. Lance d'abord node scripts/heygen.mjs ${short.id}`);
  process.exit(1);
}

const src = path.join(ROOT, 'public', short.avatar);

const missing = missingFilters();
if (missing.length) {
  const { bin } = ffmpegCommand();
  console.log(`\n  Coupe des blancs ignoree : le ffmpeg utilise (${bin}) est un build allege,`);
  console.log(`  il lui manque ${missing.join(', ')}.`);
  console.log(`  Installe un ffmpeg complet (macOS : brew install ffmpeg — Linux : apt install ffmpeg),`);
  console.log(`  ou renseigne FFMPEG_PATH dans .env. Le montage fonctionne sans cette etape.\n`);
  process.exit(0);
}

// 1) reperer les silences
// -vn + pcm : on n'analyse que l'audio. Certains builds de ffmpeg (dont celui
// livre avec Remotion) n'ont pas d'encodeur video pour le muxer null.
const log = ffmpeg(['-i', src, '-vn', '-af', `silencedetect=noise=${noise}:d=${minSilence}`, '-c:a', 'pcm_s16le', '-f', 'null', '-']);
const starts = [...log.matchAll(/silence_start:\s*([\d.]+)/g)].map((m) => Number(m[1]));
const ends = [...log.matchAll(/silence_end:\s*([\d.]+)/g)].map((m) => Number(m[1]));
const total = mediaDuration(src);

const silences = starts.map((s, i) => ({ start: s, end: ends[i] ?? total })).filter((s) => s.end - s.start >= minSilence);

if (!silences.length) {
  console.log(`${short.id} : aucun blanc de plus de ${minSilence}s. Rien a couper.`);
  process.exit(0);
}

// Garde-fou : si presque tout est silencieux, c'est que la piste audio est
// vide ou que le seuil est mal regle. On ne coupe pas, on previent.
const silentTotal = silences.reduce((a, s) => a + (s.end - s.start), 0);
if (silentTotal > total * 0.9) {
  console.log(`${short.id} : ${Math.round((silentTotal / total) * 100)} % de la piste est silencieuse — piste vide ou seuil trop haut. Rien de coupe.`);
  process.exit(0);
}

// 2) construire les segments a garder
const segs = [];
let cursor = 0;
for (const s of silences) {
  const cutFrom = Math.max(cursor, s.start + keep);
  if (cutFrom > cursor + 0.05) segs.push([cursor, cutFrom]);
  cursor = Math.max(cutFrom, s.end - keep);
}
if (cursor < total - 0.05) segs.push([cursor, total]);

// 3) reassembler avec un seul filtre (pas de fichiers intermediaires)
const parts = segs
  .map((s, i) => `[0:v]trim=start=${s[0]}:end=${s[1]},setpts=PTS-STARTPTS[v${i}];[0:a]atrim=start=${s[0]}:end=${s[1]},asetpts=PTS-STARTPTS[a${i}];`)
  .join('');
const concat = segs.map((_, i) => `[v${i}][a${i}]`).join('') + `concat=n=${segs.length}:v=1:a=1[v][a]`;

const out = src.replace(/\.mp4$/, '.trimmed.mp4');
ffmpeg(['-y', '-i', src, '-filter_complex', parts + concat, '-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-crf', '18', '-preset', 'medium', '-c:a', 'aac', out], { inherit: true });

fs.renameSync(out, src);
const dur = mediaDuration(src);
short.audioSeconds = dur;
writeCalendar(cal);

const saved = total - dur;
console.log(`\n  ${silences.length} blanc(s) coupe(s) — ${saved.toFixed(1)} s gagnees (${total.toFixed(1)} -> ${dur.toFixed(1)} s).`);
console.log(`  Calendrier recale. Etape suivante : node scripts/render.mjs ${short.id}`);
