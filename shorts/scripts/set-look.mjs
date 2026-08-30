#!/usr/bin/env node
// Affecte un look (decor / tenue) a un short, ou fait tourner plusieurs looks
// sur tout le calendrier. Le look prime sur HEYGEN_AVATAR_ID de .env.
//
//   node scripts/set-look.mjs S02 b2330823ec034109b6eb3cd9482b9657
//   node scripts/set-look.mjs --rotate id1 id2 id3     (alterne sur les 30)
//   node scripts/set-look.mjs --clear S02              (revient au look par defaut)
//   node scripts/set-look.mjs --list                   (qui a quel look)
import { readCalendar, writeCalendar } from './lib.mjs';

const args = process.argv.slice(2);
const cal = readCalendar();
const find = (id) => {
  const s = cal.shorts.find((x) => x.id.toLowerCase() === String(id).toLowerCase());
  if (!s) {
    console.error(`\n  Short inconnu : ${id}\n`);
    process.exit(1);
  }
  return s;
};

if (!args.length || args[0] === '--list') {
  console.log('');
  for (const s of cal.shorts) console.log(`  ${s.id}  ${s.date}  ${s.avatarId ?? '(look par defaut)'}  ${s.title}`);
  console.log('');
  process.exit(0);
}

if (args[0] === '--clear') {
  const targets = args.length > 1 ? args.slice(1).map(find) : cal.shorts;
  for (const s of targets) delete s.avatarId;
  writeCalendar(cal);
  console.log(`\n  ${targets.length} short(s) remis sur le look par defaut.\n`);
  process.exit(0);
}

if (args[0] === '--rotate') {
  const looks = args.slice(1);
  if (looks.length < 2) {
    console.error(`\n  Donne au moins deux identifiants de look.\n  node scripts/heygen.mjs --looks   pour les lister.\n`);
    process.exit(1);
  }
  cal.shorts.forEach((s, i) => {
    s.avatarId = looks[i % looks.length];
  });
  writeCalendar(cal);
  console.log(`\n  ${looks.length} looks repartis sur ${cal.shorts.length} shorts, en alternance.`);
  console.log(`  Verifie avec : node scripts/set-look.mjs --list\n`);
  process.exit(0);
}

// Cas simple : un short, un look.
const [id, look] = args;
if (!look) {
  console.error(`\n  Il manque l'identifiant du look.\n  node scripts/set-look.mjs ${id} <identifiant>\n`);
  process.exit(1);
}
const short = find(id);
short.avatarId = look;
writeCalendar(cal);
console.log(`\n  ${short.id} · ${short.title}\n  look : ${look}\n\n  Genere-le : node scripts/make-short.mjs ${short.id}\n`);
