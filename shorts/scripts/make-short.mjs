#!/usr/bin/env node
// La chaine complete : avatar HeyGen -> coupe des blancs -> montage.
//
//   node scripts/make-short.mjs          le short du jour
//   node scripts/make-short.mjs S07      un short precis
//   node scripts/make-short.mjs --all    tous ceux qui n'ont pas encore d'avatar
//   node scripts/make-short.mjs --all --force   tous, meme deja generes
import { spawnSync } from 'node:child_process';
import { ROOT, readCalendar, pickShort } from './lib.mjs';

const args = process.argv.slice(2);
const all = args.includes('--all');
const force = args.includes('--force');
const cal = readCalendar();

const run = (script, id) => spawnSync('node', [`scripts/${script}`, id], { cwd: ROOT, stdio: 'inherit' }).status === 0;

const makeOne = (short) => {
  console.log(`\n=== ${short.id} · ${short.title} (${short.date}) ===`);
  // La generation HeyGen consomme des credits : si elle echoue, on ne monte pas
  // par-dessus une video absente, on passe au suivant.
  if (!run('heygen.mjs', short.id)) return false;
  run('trim-silence.mjs', short.id); // etape optionnelle : un echec n'arrete rien
  run('align.mjs', short.id); // cale les sous-titres sur la voix
  return run('render.mjs', short.id);
};

if (!all) {
  const short = pickShort(cal, args.find((a) => /^S\d\d$/i.test(a)));
  process.exit(makeOne(short) ? 0 : 1);
}

// Lot complet, en serie : HeyGen limite les generations simultanees, et une
// erreur sur un short ne doit pas faire tomber les vingt-neuf autres.
const targets = cal.shorts.filter((s) => force || !s.avatar);
const skipped = cal.shorts.length - targets.length;

console.log(`\n${targets.length} short(s) a produire${skipped ? `, ${skipped} deja fait(s) — --force pour les refaire` : ''}.`);
console.log(`Compte environ 5 minutes par short. Tu peux laisser tourner.\n`);

const failed = [];
targets.forEach((short, i) => {
  console.log(`\n———  ${i + 1}/${targets.length}  ———`);
  if (!makeOne(short)) failed.push(short.id);
});

console.log(`\n=== Termine : ${targets.length - failed.length}/${targets.length} short(s) dans out/ ===`);
if (failed.length) {
  console.log(`  Echecs : ${failed.join(', ')}`);
  console.log(`  Relance-les un par un : node scripts/make-short.mjs ${failed[0]}\n`);
  process.exit(1);
}
console.log('');
