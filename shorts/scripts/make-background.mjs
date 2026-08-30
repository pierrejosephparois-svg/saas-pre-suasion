#!/usr/bin/env node
// Prepare une image de decor au format des shorts (1080x1920, 9:16).
//
// Une photo de decor est presque toujours en paysage : la recadrer betement
// au centre coupe ce qui compte (un logo, un mur). --focus choisit la partie
// a garder.
//
//   node scripts/make-background.mjs ~/Desktop/bureau.png
//   node scripts/make-background.mjs ~/Desktop/bureau.png --focus 0.8
//   node scripts/make-background.mjs ~/Desktop/bureau.png --focus 0.8 --top 0.3 --name decor-bureau
//
// --focus  0 = bord gauche, 0.5 = centre (defaut), 1 = bord droit
// --top    0 = haut, 0.5 = centre (defaut), 1 = bas
// --name   nom du fichier de sortie (sans extension)
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, ffmpeg, missingFilters } from './lib.mjs';

const W = 1080;
const H = 1920;

const args = process.argv.slice(2);
const src = args.find((a) => !a.startsWith('--'));
const flag = (n, d) => {
  const i = args.indexOf(`--${n}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : d;
};

if (!src) {
  console.error(`\n  Donne le chemin d'une image.\n  node scripts/make-background.mjs ~/Desktop/mon-decor.png\n`);
  process.exit(1);
}
if (!fs.existsSync(src)) {
  console.error(`\n  Fichier introuvable : ${src}\n`);
  process.exit(1);
}

const missing = missingFilters(['scale', 'crop']);
if (missing.length) {
  console.error(`\n  Le ffmpeg utilise n'a pas ${missing.join(', ')}.`);
  console.error(`  Installe un ffmpeg complet : brew install ffmpeg\n`);
  process.exit(1);
}

const clamp = (v) => Math.min(1, Math.max(0, Number(v)));
const fx = clamp(flag('focus', 0.5));
const fy = clamp(flag('top', 0.5));
const name = flag('name', path.basename(src).replace(/\.[^.]+$/, '')) + '-9x16';

// Le dossier images/ du site : ce qu'on y depose devient public une fois
// pousse (Vercel sert les fichiers statiques a la racine).
const outDir = path.join(ROOT, '..', 'images');
fs.mkdirSync(outDir, { recursive: true });
const out = path.join(outDir, `${name}.png`);

// On agrandit l'image jusqu'a couvrir 1080x1920, puis on decoupe la zone
// choisie par --focus / --top.
const vf = [
  `scale=${W}:${H}:force_original_aspect_ratio=increase`,
  `crop=${W}:${H}:(in_w-${W})*${fx}:(in_h-${H})*${fy}`,
].join(',');

const log = ffmpeg(['-y', '-i', src, '-vf', vf, '-frames:v', '1', out]);

if (!fs.existsSync(out)) {
  console.error(`\n  La conversion a echoue :\n${log.slice(-500)}\n`);
  process.exit(1);
}

const rel = path.relative(path.join(ROOT, '..'), out);
console.log(`\n  ${rel}  (${W}x${H})`);
console.log(`\n  Verifie le cadrage : open ${out}`);
console.log(`  Si le sujet est coupe, rejoue avec --focus (0 gauche → 1 droite) et --top.`);
console.log(`\n  Pour le mettre en ligne :`);
console.log(`    git add ${rel} && git commit -m "decor shorts" && git push`);
console.log(`\n  Puis dans .env :`);
console.log(`    HEYGEN_BACKGROUND=https://www.pre-suasion.fr/${rel}\n`);
