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

const dir = path.join(ROOT, 'public', 'avatar');
fs.mkdirSync(dir, { recursive: true });

const cal = readCalendar();
let linked = 0;
let missing = 0;

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

  short.avatar = `avatar/${short.id}.mp4`;
  short.audioSeconds = dur;
  if (short.status === 'draft' || short.status === 'preview') short.status = 'avatar';
  linked++;
  console.log(`  ${short.id}  ${dur.toFixed(1)} s  ${short.title}`);
}

writeCalendar(cal);

console.log(`\n  ${linked} video(s) rattachee(s), ${missing} short(s) sans video.`);
if (linked) console.log(`  Etape suivante : node scripts/render.mjs   (ou --all)`);
else console.log(`  Depose tes mp4 dans public/avatar/ en les nommant S01.mp4, S02.mp4, ...`);
