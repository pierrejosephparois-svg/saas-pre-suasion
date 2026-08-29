#!/usr/bin/env node
// Vue d'ensemble du mois : ce qui est ecrit, tourne, monte, publie.
import { readCalendar } from './lib.mjs';

const cal = readCalendar();
const icon = { draft: '·', avatar: '◐', preview: '◑', ready: '●', published: '✓' };

console.log(`\n${cal.meta.brand} — ${cal.meta.cadence}\nICP : ${cal.meta.icp}\n`);
for (const s of cal.shorts) {
  const words = s.lines.reduce((n, l) => n + l.t.split(/\s+/).length, 0);
  console.log(
    `${icon[s.status] ?? '?'} ${s.id}  ${s.date}  ${String(words).padStart(3)} mots  ${s.title.padEnd(42)} ${s.principle}`
  );
}
const by = cal.shorts.reduce((a, s) => ({ ...a, [s.status]: (a[s.status] ?? 0) + 1 }), {});
console.log(`\n${Object.entries(by).map(([k, v]) => `${k}: ${v}`).join('  ·  ')}\n`);
