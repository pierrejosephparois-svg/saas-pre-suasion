#!/usr/bin/env node
// Verifie ce que .env contient reellement, sans jamais afficher la cle API.
// A lancer quand un script annonce une variable manquante.
//
//   node scripts/check-env.mjs
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, loadEnv } from './lib.mjs';

const file = path.join(ROOT, '.env');

if (!fs.existsSync(file)) {
  console.error(`\n  Pas de fichier .env dans ${ROOT}`);
  console.error(`  Cree-le : cp .env.example .env\n`);
  process.exit(1);
}

loadEnv();

// La cle est un secret : on n'en montre que la longueur et le debut.
const SECRET = new Set(['HEYGEN_API_KEY']);
const CHECKS = [
  { name: 'HEYGEN_API_KEY', required: true, hint: 'HeyGen > espace developpeur > API key' },
  { name: 'HEYGEN_AVATAR_ID', required: true, hint: 'node scripts/heygen.mjs --avatars pierre' },
  { name: 'HEYGEN_VOICE_ID', required: true, hint: 'node scripts/heygen.mjs --avatars pierre' },
  { name: 'HEYGEN_VOICE_SPEED', required: false },
  { name: 'HEYGEN_BACKGROUND', required: false },
];

console.log(`\nFichier : ${file}\n`);
let ko = 0;

for (const c of CHECKS) {
  const v = process.env[c.name];
  if (!v) {
    if (c.required) ko++;
    console.log(`  ${c.required ? 'MANQUANT' : 'absent  '}  ${c.name}${c.hint ? `\n              -> ${c.hint}` : ''}`);
    continue;
  }
  const shown = SECRET.has(c.name) ? `${v.slice(0, 10)}… (${v.length} caracteres)` : v;
  console.log(`  OK        ${c.name} = ${shown}`);

  // Les erreurs de collage les plus frequentes.
  if (v.includes(c.name)) console.log(`              ATTENTION : "${c.name}" apparait dans la valeur — la ligne est collee en double.`);
  if (v.includes('...') || v.includes('…')) console.log(`              ATTENTION : la valeur contient "..." — c'est un exemple, pas ta vraie valeur.`);
  if (/^["']|["']$/.test(v)) console.log(`              ATTENTION : enleve les guillemets autour de la valeur.`);
}

console.log(ko ? `\n  ${ko} variable(s) a completer dans .env, puis enregistre le fichier (Cmd+S).\n` : `\n  Tout est en place. Tu peux lancer : node scripts/make-short.mjs S01\n`);
process.exit(ko ? 1 : 0);
