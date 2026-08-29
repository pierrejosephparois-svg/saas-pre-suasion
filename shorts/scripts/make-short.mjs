#!/usr/bin/env node
// La chaine complete pour un short : avatar HeyGen -> coupe des blancs -> montage.
//
//   node scripts/make-short.mjs          -> le short du jour
//   node scripts/make-short.mjs S07
import { spawnSync } from 'node:child_process';
import { ROOT, readCalendar, pickShort } from './lib.mjs';

const arg = process.argv[2];
const short = pickShort(readCalendar(), arg);
const run = (script) => {
  const r = spawnSync('node', [`scripts/${script}`, short.id], { cwd: ROOT, stdio: 'inherit' });
  if (r.status !== 0) process.exit(r.status ?? 1);
};

console.log(`\n=== ${short.id} · ${short.title} (${short.date}) ===`);
run('heygen.mjs');
run('trim-silence.mjs');
run('render.mjs');
console.log(`\n=== Termine. Le fichier est dans out/. ===`);
