#!/usr/bin/env node
// Cale les sous-titres sur la voix reelle.
//
// Sans cette etape, le minutage est estime depuis le texte puis mis a
// l'echelle de la duree totale : le total tombe juste, mais les mots
// derivent des que le debit varie ou qu'une pause n'etait pas prevue.
//
// Ici on mesure les vrais intervalles de parole dans l'audio (ffmpeg
// silencedetect) et on les enregistre dans le calendrier. Le montage
// repartit alors les mots dans la parole uniquement : pendant une pause,
// le sous-titre reste en place au lieu de prendre de l'avance.
//
//   node scripts/align.mjs S01
//   node scripts/align.mjs --all
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, readCalendar, writeCalendar, pickShort, ffmpeg, mediaDuration } from './lib.mjs';

const args = process.argv.slice(2);
const NOISE = '-38dB'; // seuil en dessous duquel on considere qu'il n'y a pas de voix
const MIN_SILENCE = 0.18; // une respiration compte, un blanc de 0,05 s non
const PAD = 0.06; // marge autour de chaque segment, pour ne pas rogner les attaques

const cal = readCalendar();
const targets = args.includes('--all')
  ? cal.shorts.filter((s) => s.avatar)
  : [pickShort(cal, args.find((a) => /^S\d\d$/i.test(a)))];

let done = 0;

for (const short of targets) {
  if (!short.avatar) {
    console.log(`  ${short.id} : pas de video avatar, rien a caler.`);
    continue;
  }
  const src = path.join(ROOT, 'public', short.avatar);
  if (!fs.existsSync(src)) {
    console.log(`  ${short.id} : ${short.avatar} introuvable.`);
    continue;
  }

  const total = mediaDuration(src);
  const log = ffmpeg(['-i', src, '-vn', '-af', `silencedetect=noise=${NOISE}:d=${MIN_SILENCE}`, '-c:a', 'pcm_s16le', '-f', 'null', '-']);
  const starts = [...log.matchAll(/silence_start:\s*(-?[\d.]+)/g)].map((m) => Number(m[1]));
  const ends = [...log.matchAll(/silence_end:\s*([\d.]+)/g)].map((m) => Number(m[1]));

  // Les silences delimitent la parole : on prend les intervalles complementaires.
  const silences = starts.map((s, i) => ({ start: Math.max(0, s), end: ends[i] ?? total }));
  const speech = [];
  let cursor = 0;
  for (const s of silences) {
    if (s.start - cursor > 0.08) speech.push([Math.max(0, cursor - PAD), s.start + PAD]);
    cursor = s.end;
  }
  if (total - cursor > 0.08) speech.push([Math.max(0, cursor - PAD), total]);

  const spoken = speech.reduce((a, [s, e]) => a + (e - s), 0);

  if (!speech.length || spoken < total * 0.15) {
    console.log(`  ${short.id} : aucune parole detectee (piste muette ou seuil trop bas). Calage ignore.`);
    continue;
  }

  short.speech = speech.map(([s, e]) => [Number(s.toFixed(3)), Number(e.toFixed(3))]);
  short.audioSeconds = total;
  done++;
  console.log(`  ${short.id}  ${speech.length} segment(s) de parole, ${spoken.toFixed(1)} s parlees sur ${total.toFixed(1)} s`);
}

if (done) {
  writeCalendar(cal);
  console.log(`\n  ${done} short(s) cale(s). Remonte-les : node scripts/render.mjs ${targets.length === 1 ? targets[0].id : '--all'}\n`);
} else {
  console.log('');
}
