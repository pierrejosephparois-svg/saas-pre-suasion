#!/usr/bin/env node
// Montage final : Remotion assemble avatar + sous-titres + elements de design.
//
//   node scripts/render.mjs            -> le short du jour
//   node scripts/render.mjs S07        -> un short precis
//   node scripts/render.mjs --all      -> les 30
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { ROOT, readCalendar, writeCalendar, pickShort, loadEnv } from './lib.mjs';

loadEnv();
const args = process.argv.slice(2);
const cal = readCalendar();
const targets = args.includes('--all') ? cal.shorts : [pickShort(cal, args.find((a) => /^S\d\d$/i.test(a)))];

fs.mkdirSync(path.join(ROOT, 'out'), { recursive: true });

for (const short of targets) {
  const slug = `${short.date}-${short.id}`;
  const out = path.join(ROOT, 'out', `${slug}.mp4`);
  const cmd = ['remotion', 'render', 'src/index.jsx', short.id, out, '--log=error'];

  // Chromium local (conteneur sans telechargement possible) si fourni.
  if (process.env.REMOTION_BROWSER_EXECUTABLE) cmd.push(`--browser-executable=${process.env.REMOTION_BROWSER_EXECUTABLE}`);

  console.log(`\n▶ ${short.id} · ${short.title}${short.avatar ? '' : '  [avatar HeyGen absent : rendu avec l\'emplacement portrait]'}`);
  const r = spawnSync('npx', cmd, { cwd: ROOT, stdio: 'inherit' });
  if (r.status !== 0) {
    console.error(`  echec du rendu de ${short.id}`);
    continue;
  }

  short.status = short.avatar ? 'ready' : 'preview';
  short.output = path.relative(ROOT, out);
  writeCalendar(cal);
  const mb = (fs.statSync(out).size / 1e6).toFixed(1);
  console.log(`  OK -> out/${slug}.mp4 (${mb} Mo)`);
}
