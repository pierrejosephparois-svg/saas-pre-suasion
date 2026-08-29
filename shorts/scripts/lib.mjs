import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawnSync } from 'node:child_process';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const CALENDAR = path.join(ROOT, 'content', 'calendar.json');

export const readCalendar = () => JSON.parse(fs.readFileSync(CALENDAR, 'utf8'));
export const writeCalendar = (cal) => fs.writeFileSync(CALENDAR, JSON.stringify(cal, null, 2) + '\n', 'utf8');

// Charge .env sans dependance externe.
export function loadEnv() {
  const f = path.join(ROOT, '.env');
  if (!fs.existsSync(f)) return;
  for (const line of fs.readFileSync(f, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

export function requireEnv(name, hint) {
  loadEnv();
  const v = process.env[name];
  if (!v) {
    console.error(`\n  ${name} manquante.\n  ${hint}\n  Ajoute-la dans shorts/.env (voir .env.example).\n`);
    process.exit(1);
  }
  return v;
}

// ffmpeg. Attention : certains binaires presents sur une machine sont des
// builds reduits (celui de Playwright, par exemple, ne sait pas lire un mp4).
// On verifie donc que le binaire gere h264 + aac avant de s'en servir, sinon
// on prend celui fourni avec Remotion, qui est complet.
let _ffmpeg = null;

function handlesMp4(bin, pre = []) {
  try {
    const out = execFileSync(bin, [...pre, '-hide_banner', '-codecs'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    return /h264/.test(out) && /aac/.test(out);
  } catch {
    return false;
  }
}

export function ffmpegCommand() {
  if (_ffmpeg) return _ffmpeg;
  const candidates = [];
  if (process.env.FFMPEG_PATH) candidates.push({ bin: process.env.FFMPEG_PATH, pre: [] });
  candidates.push({ bin: 'ffmpeg', pre: [] });
  for (const c of candidates) {
    if (handlesMp4(c.bin, c.pre)) {
      _ffmpeg = c;
      return c;
    }
  }
  // Repli : le ffmpeg embarque par Remotion (complet, toujours present ici).
  _ffmpeg = { bin: 'npx', pre: ['remotion', 'ffmpeg'] };
  return _ffmpeg;
}

// Le repli Remotion suffit pour lire une duree, mais c'est un build allege :
// il lui manque des filtres (setpts) necessaires au montage. On le verifie
// avant la coupe des blancs, pour donner un message clair plutot qu'une
// erreur ffmpeg incomprehensible.
const NEEDED_FILTERS = ['trim', 'setpts', 'atrim', 'asetpts', 'concat', 'silencedetect'];

export function missingFilters() {
  const listed = new Set(
    ffmpeg(['-hide_banner', '-filters'])
      .split('\n')
      .map((l) => l.trim().split(/\s+/)[1])
      .filter(Boolean)
  );
  return NEEDED_FILTERS.filter((f) => !listed.has(f));
}

// Lance ffmpeg et renvoie sa sortie complete. ffmpeg ecrit ses informations
// (duree, silencedetect, progression) sur stderr, y compris quand il reussit :
// on concatene donc les deux flux.
export function ffmpeg(args, { inherit = false } = {}) {
  const { bin, pre } = ffmpegCommand();
  const r = spawnSync(bin, [...pre, ...args], {
    encoding: 'utf8',
    stdio: inherit ? 'inherit' : ['ignore', 'pipe', 'pipe'],
    maxBuffer: 64 * 1024 * 1024,
  });
  if (inherit) {
    if (r.status !== 0) throw new Error(`ffmpeg a echoue (code ${r.status})`);
    return '';
  }
  return `${r.stdout || ''}${r.stderr || ''}`;
}

// Duree d'un media, lue via ffmpeg (pas besoin de ffprobe).
export function mediaDuration(file) {
  const m = ffmpeg(['-i', file]).match(/Duration:\s*(\d+):(\d+):(\d+\.\d+)/);
  return m ? Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]) : null;
}

// Le short du jour (date du calendrier), sinon le premier encore en draft.
export function pickShort(cal, arg) {
  if (arg) {
    const s = cal.shorts.find((x) => x.id.toLowerCase() === arg.toLowerCase());
    if (!s) throw new Error(`Short inconnu : ${arg}`);
    return s;
  }
  const today = new Date().toISOString().slice(0, 10);
  return cal.shorts.find((x) => x.date === today) || cal.shorts.find((x) => x.status !== 'published') || cal.shorts[0];
}

// Texte parle complet, envoye tel quel a HeyGen.
export const spokenText = (short) => short.lines.map((l) => l.t).join(' ');

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
