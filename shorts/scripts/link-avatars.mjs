#!/usr/bin/env node
// Route sans cle API : tu generes les videos a la main dans l'application
// HeyGen, tu les deposes dans public/avatar/ nommees S01.mp4, S02.mp4 ...
// et cette commande les rattache au calendrier (avec leur duree reelle,
// ce qui recale sous-titres et elements de design).
//
//   node scripts/link-avatars.mjs
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, readCalendar, writeCalendar, mediaDuration } from './lib.mjs';
import { estimateLine } from '../src/lib/timing.js';

const dir = path.join(ROOT, 'public', 'avatar');
fs.mkdirSync(dir, { recursive: true });

const cal = readCalendar();
let linked = 0;
let missing = 0;
let warned = 0;

for (const short of cal.shorts) {
  const file = path.join(dir, `${short.id}.mp4`);
  if (!fs.existsSync(file)) {
    missing++;
    continue;
  }

  const dur = mediaDuration(file);
  if (!dur) {
    console.log(`  ${short.id} : fichier illisible, ignore.`);
    continue;
  }

  // Garde-fou : une video dont la duree ne colle pas au script est presque
  // toujours le mauvais fichier depose dans public/avatar/.
  const expected = short.lines.reduce((a, l) => a + estimateLine(l.t), 0);
  const ratio = dur / expected;
  const suspect = ratio < 0.6 || ratio > 1.6;

  short.avatar = `avatar/${short.id}.mp4`;
  short.audioSeconds = dur;
  if (short.status === 'draft' || short.status === 'preview') short.status = 'avatar';
  linked++;
  console.log(`  ${short.id}  ${dur.toFixed(1)} s  ${short.title}${suspect ? '   <-- A VERIFIER' : ''}`);
  if (suspect) {
    warned++;
    console.log(`              le script fait ${short.lines.reduce((a, l) => a + l.t.split(/\s+/).length, 0)} mots, soit ~${expected.toFixed(0)} s attendues.`);
    console.log(`              ${dur.toFixed(1)} s mesurees : verifie que public/avatar/${short.id}.mp4 est bien la bonne video.`);
  }
}

writeCalendar(cal);

console.log(`\n  ${linked} video(s) rattachee(s), ${missing} short(s) sans video.`);
if (warned) console.log(`  ${warned} duree(s) suspecte(s) — ecoute les fichiers signales avant de monter.`);
if (linked) console.log(`  Etape suivante : node scripts/render.mjs   (ou --all)`);
else console.log(`  Depose tes mp4 dans public/avatar/ en les nommant S01.mp4, S02.mp4, ...`);
