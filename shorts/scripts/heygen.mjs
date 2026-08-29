#!/usr/bin/env node
// Genere la video avatar d'un short avec HeyGen, la telecharge dans
// public/avatar/<ID>.mp4 et recale le calendrier sur la duree reelle.
//
//   node scripts/heygen.mjs            -> le short du jour
//   node scripts/heygen.mjs S07        -> un short precis
//   node scripts/heygen.mjs --avatars  -> liste tes avatars et voix clones
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, readCalendar, writeCalendar, requireEnv, pickShort, spokenText, mediaDuration, sleep } from './lib.mjs';

const API = 'https://api.heygen.com';
const key = requireEnv('HEYGEN_API_KEY', 'Cle API HeyGen : espace developpeur > API key.');
const H = { 'X-Api-Key': key, 'Content-Type': 'application/json' };

async function get(url) {
  const r = await fetch(url, { headers: H });
  if (!r.ok) throw new Error(`HeyGen ${r.status} ${url} : ${await r.text()}`);
  return r.json();
}

async function listAvatars() {
  const a = await get(`${API}/v2/avatars`);
  console.log('\nAvatars :');
  for (const av of a.data?.avatars ?? []) console.log(`  ${av.avatar_id}  ${av.avatar_name ?? ''}`);
  for (const av of a.data?.talking_photos ?? []) console.log(`  ${av.talking_photo_id}  ${av.talking_photo_name ?? ''} (talking photo)`);
  const v = await get(`${API}/v2/voices`);
  console.log('\nVoix (les tiennes en premier) :');
  for (const vo of (v.data?.voices ?? []).slice(0, 40)) console.log(`  ${vo.voice_id}  ${vo.name ?? ''}  ${vo.language ?? ''}`);
}

async function generate(short) {
  const avatarId = requireEnv('HEYGEN_AVATAR_ID', 'ID de ton avatar clone (node scripts/heygen.mjs --avatars).');
  const voiceId = requireEnv('HEYGEN_VOICE_ID', 'ID de ta voix clonee (node scripts/heygen.mjs --avatars).');

  const body = {
    video_inputs: [
      {
        character: { type: 'avatar', avatar_id: avatarId, avatar_style: 'normal' },
        voice: { type: 'text', input_text: spokenText(short), voice_id: voiceId, speed: Number(process.env.HEYGEN_VOICE_SPEED || 1.0) },
      },
    ],
    dimension: { width: 1080, height: 1920 },
    caption: false,
  };

  const r = await fetch(`${API}/v2/video/generate`, { method: 'POST', headers: H, body: JSON.stringify(body) });
  const j = await r.json();
  if (!r.ok || !j.data?.video_id) throw new Error(`Generation refusee : ${JSON.stringify(j)}`);
  const videoId = j.data.video_id;
  console.log(`  video_id=${videoId} — rendu HeyGen en cours…`);

  // HeyGen rend en quelques minutes : on interroge jusqu'a completed/failed.
  const deadline = Date.now() + 25 * 60 * 1000;
  while (Date.now() < deadline) {
    await sleep(15000);
    const s = await get(`${API}/v1/video_status.get?video_id=${videoId}`);
    const st = s.data?.status;
    process.stdout.write(`  statut : ${st}\r`);
    if (st === 'completed') return s.data.video_url;
    if (st === 'failed') throw new Error(`HeyGen a echoue : ${JSON.stringify(s.data?.error ?? s.data)}`);
  }
  throw new Error('Delai depasse (25 min) cote HeyGen.');
}

async function download(url, dest) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Telechargement ${r.status}`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, Buffer.from(await r.arrayBuffer()));
}

const arg = process.argv[2];
if (arg === '--avatars') {
  await listAvatars();
  process.exit(0);
}

const cal = readCalendar();
const short = pickShort(cal, arg);
console.log(`\n${short.id} · ${short.title}`);
console.log(`  ${spokenText(short).split(/\s+/).length} mots a faire dire a ton avatar.`);

const url = await generate(short);
const rel = `avatar/${short.id}.mp4`;
const dest = path.join(ROOT, 'public', rel);
await download(url, dest);

const dur = mediaDuration(dest);
short.avatar = rel;
short.audioSeconds = dur;
short.status = 'avatar';
writeCalendar(cal);

console.log(`\n  OK -> public/${rel}${dur ? ` (${dur.toFixed(1)} s)` : ''}`);
console.log(`  Les sous-titres et les elements de design sont recales sur cette duree.`);
console.log(`  Etape suivante : node scripts/render.mjs ${short.id}`);
