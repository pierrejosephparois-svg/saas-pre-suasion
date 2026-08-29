import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

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

// ffmpeg : binaire du systeme, ou celui fourni par Playwright dans ce conteneur.
export function ffmpegPath() {
  if (process.env.FFMPEG_PATH) return process.env.FFMPEG_PATH;
  const candidates = ['/opt/pw-browsers/ffmpeg-1011/ffmpeg-linux', '/usr/bin/ffmpeg', '/usr/local/bin/ffmpeg'];
  for (const c of candidates) if (fs.existsSync(c)) return c;
  return 'ffmpeg';
}

// Duree d'un media, lue via ffmpeg (pas besoin de ffprobe).
export function mediaDuration(file) {
  try {
    const out = execFileSync(ffmpegPath(), ['-i', file], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    return parseDuration(out);
  } catch (e) {
    return parseDuration(String(e.stderr || ''));
  }
}

function parseDuration(text) {
  const m = text.match(/Duration:\s*(\d+):(\d+):(\d+\.\d+)/);
  if (!m) return null;
  return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
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
