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
import { estimateLine } from '../src/lib/timing.js';

const API = 'https://api.heygen.com';
const key = requireEnv('HEYGEN_API_KEY', 'Cle API HeyGen : espace developpeur > API key.');
const H = { 'X-Api-Key': key, 'Content-Type': 'application/json' };

const TIMEOUT = 30000;

async function get(url) {
  let r;
  try {
    r = await fetch(url, { headers: H, signal: AbortSignal.timeout(TIMEOUT) });
  } catch (e) {
    if (e.name === 'TimeoutError') throw new Error(`HeyGen n'a pas repondu en ${TIMEOUT / 1000} s. Verifie ta connexion, puis relance.`);
    throw new Error(`Impossible de joindre HeyGen : ${e.message}`);
  }
  if (r.status === 401 || r.status === 403) {
    // Le corps de la reponse dit la vraie cause : cle invalide, offre sans API,
    // ou proxy reseau qui bloque le domaine. On l'affiche tel quel.
    throw new Error(
      `Acces refuse (${r.status}). Reponse du serveur :\n  ${(await r.text()).slice(0, 300)}\n\n` +
        `  Si c'est la cle : dans .env, "HEYGEN_API_KEY=" une seule fois, puis la cle, sans espace ni guillemets.\n` +
        `  Verifie aussi que ton offre HeyGen donne acces a l'API.`
    );
  }
  if (!r.ok) throw new Error(`HeyGen ${r.status} sur ${url} : ${(await r.text()).slice(0, 300)}`);
  return r.json();
}

async function listAvatars(filter) {
  const norm = (x) => String(x ?? '').toLowerCase();
  const keep = (name) => !filter || norm(name).includes(norm(filter));

  console.log('\nInterrogation de HeyGen…');
  const a = await get(`${API}/v2/avatars`);
  console.log('Recuperation des voix…');
  const v = await get(`${API}/v2/voices`);

  // HeyGen renvoie parfois la meme entree dans plusieurs listes : on dedoublonne
  // sur l'identifiant, sinon chaque avatar s'affiche deux fois.
  const dedupe = (rows) => [...new Map(rows.filter((r) => r.id).map((r) => [r.id, r])).values()];

  const avatars = dedupe([
    ...(a.data?.avatars ?? []).map((x) => ({ id: x.avatar_id, name: x.avatar_name, kind: 'avatar' })),
    ...(a.data?.talking_photos ?? []).map((x) => ({ id: x.talking_photo_id, name: x.talking_photo_name, kind: 'photo' })),
  ]);
  const voices = dedupe((v.data?.voices ?? []).map((x) => ({ id: x.voice_id, name: x.name, lang: x.language })));

  // La liste complete part dans un fichier : la bibliotheque HeyGen fait des
  // centaines d'entrees et noie les tiennes dans le terminal.
  const dump = path.join(ROOT, 'heygen-liste.txt');
  fs.writeFileSync(
    dump,
    ['AVATARS', ...avatars.map((x) => `${x.id}\t${x.name ?? ''}\t${x.kind}`), '', 'VOIX', ...voices.map((x) => `${x.id}\t${x.name ?? ''}\t${x.lang ?? ''}`)].join('\n'),
    'utf8'
  );

  const myAvatars = avatars.filter((x) => keep(x.name));
  const myVoices = voices.filter((x) => keep(x.name));

  const show = (title, rows, empty) => {
    console.log(`\n${title}`);
    if (!rows.length) return console.log(`  ${empty}`);
    for (const r of rows.slice(0, 30)) console.log(`  ${r.id}  ${r.name ?? ''}${r.lang ? `  (${r.lang})` : ''}${r.kind === 'photo' ? '  [talking photo]' : ''}`);
    if (rows.length > 30) console.log(`  … ${rows.length - 30} autres, voir heygen-liste.txt`);
  };

  show(`AVATARS${filter ? ` contenant « ${filter} »` : ''} — a mettre dans HEYGEN_AVATAR_ID`, myAvatars, 'aucun.');
  show(`VOIX${filter ? ` contenant « ${filter} »` : ''} — a mettre dans HEYGEN_VOICE_ID`, myVoices, 'aucune.');

  console.log(`\n  ${avatars.length} avatar(s) et ${voices.length} voix au total.`);
  console.log(`  Liste complete ecrite dans heygen-liste.txt`);
  if (!filter) console.log(`  Astuce : node scripts/heygen.mjs --avatars pierre   pour ne voir que les tiens.`);
  console.log('');
}

// Les "looks" (autre tenue, autre decor) sont des variantes rangees dans des
// avatar groups. Ils n'apparaissent pas tous dans /v2/avatars, d'ou ce listing
// dedie.
async function listLooks(filter) {
  const norm = (x) => String(x ?? '').toLowerCase();
  const keep = (name) => !filter || norm(name).includes(norm(filter));

  console.log('\nRecuperation de tes looks…');
  let groups;
  try {
    groups = await get(`${API}/v2/avatar_group.list`);
  } catch (e) {
    console.error(`\n  Impossible de lister les groupes d'avatars : ${e.message}`);
    console.error(`  Tu peux recuperer l'identifiant d'un look depuis l'application HeyGen.\n`);
    return;
  }

  const list = groups.data?.avatar_group_list ?? groups.data?.avatar_groups ?? groups.data?.groups ?? [];
  if (!list.length) return console.log('  Aucun groupe d\'avatars.\n');

  const rows = [];
  for (const g of list) {
    const gid = g.id ?? g.group_id ?? g.avatar_group_id;
    const gname = g.name ?? g.group_name ?? '';
    if (!gid) continue;
    let looks;
    try {
      looks = await get(`${API}/v2/avatar_group/${gid}/avatars`);
    } catch {
      continue; // un groupe illisible ne doit pas arreter les autres
    }
    for (const a of looks.data?.avatar_list ?? looks.data?.avatars ?? []) {
      const id = a.avatar_id ?? a.id;
      const name = a.name ?? a.avatar_name ?? '';
      if (id && keep(`${gname} ${name}`)) rows.push({ id, name, group: gname });
    }
  }

  if (!rows.length) return console.log(`  Aucun look${filter ? ` contenant « ${filter} »` : ''}.\n`);

  console.log(`\nLOOKS — a mettre dans "avatarId" d'un short, ou dans HEYGEN_AVATAR_ID`);
  for (const r of rows) console.log(`  ${r.id}  ${r.name}${r.group ? `   [${r.group}]` : ''}`);
  console.log(`\n  Pour affecter un look a un short :`);
  console.log(`    node scripts/set-look.mjs S02 <identifiant>\n`);
}

async function generate(short) {
  // Un short peut imposer son propre look (et sa propre voix) ; sinon on prend
  // celui de .env. C'est ce qui permet d'alterner les decors d'un jour a l'autre.
  const avatarId = short.avatarId || requireEnv('HEYGEN_AVATAR_ID', 'ID de ton avatar clone (node scripts/heygen.mjs --avatars).');
  const voiceId = short.voiceId || requireEnv('HEYGEN_VOICE_ID', 'ID de ta voix clonee (node scripts/heygen.mjs --avatars).');
  if (short.avatarId) console.log(`  look impose par le short : ${short.avatarId}`);

  // Fond : par defaut le violet profond de la marque, pour que l'avatar
  // s'integre a la DA au lieu de trainer le decor du tournage. Remplacer par
  // "none" dans .env pour garder le decor filme, ou par une URL d'image.
  const bg = (process.env.HEYGEN_BACKGROUND ?? '#131222').trim();
  const background =
    bg === 'none' || bg === ''
      ? undefined
      : /^https?:\/\//.test(bg)
        ? { type: 'image', url: bg }
        : { type: 'color', value: bg };

  const input = {
    character: { type: 'avatar', avatar_id: avatarId, avatar_style: 'normal' },
    voice: { type: 'text', input_text: spokenText(short), voice_id: voiceId, speed: Number(process.env.HEYGEN_VOICE_SPEED || 1.0) },
  };
  if (background) input.background = background;

  const body = {
    video_inputs: [input],
    dimension: { width: 1080, height: 1920 },
    caption: false,
  };

  const r = await fetch(`${API}/v2/video/generate`, { method: 'POST', headers: H, body: JSON.stringify(body) });
  const j = await r.json();
  if (!r.ok || !j.data?.video_id) {
    // Le remplacement de fond n'est possible que si l'avatar a ete cree avec
    // un detourage exploitable (mur uni ou fond vert au tournage).
    if (background) console.error(`\n  Si l'erreur concerne le fond, mets HEYGEN_BACKGROUND=none dans .env :\n  ton avatar garde alors le decor filme.\n`);
    throw new Error(`Generation refusee : ${JSON.stringify(j)}`);
  }
  const videoId = j.data.video_id;
  console.log(`  video_id=${videoId} — rendu HeyGen en cours…`);

  // HeyGen rend en quelques minutes : on interroge jusqu'a completed/failed.
  const deadline = Date.now() + 25 * 60 * 1000;
  while (Date.now() < deadline) {
    await sleep(15000);
    const s = await get(`${API}/v1/video_status.get?video_id=${videoId}`);
    const st = s.data?.status;
    // padEnd : sans ca, "completed" s'ecrit par-dessus "processing" et laisse
    // trainer le "g" de la ligne precedente.
    process.stdout.write(`  statut : ${st}`.padEnd(40) + '\r');
    if (st === 'completed') return s.data.video_url;
    if (st === 'failed') throw new Error(`HeyGen a echoue : ${JSON.stringify(s.data?.error ?? s.data)}`);
  }
  throw new Error('Delai depasse (25 min) cote HeyGen.');
}

// Recupere une video deja generee chez HeyGen, a partir de son identifiant.
// Ne consomme aucun credit : c'est un telechargement, pas une generation.
// Evite le detour par le navigateur, ou l'on se trompe vite de fichier.
async function fetchExisting(shortId, videoId) {
  const cal2 = readCalendar();
  const short = pickShort(cal2, shortId);

  console.log(`\n${short.id} · ${short.title}`);
  console.log(`  video_id=${videoId}`);

  const s = await get(`${API}/v1/video_status.get?video_id=${videoId}`);
  const st = s.data?.status;
  if (st !== 'completed') {
    throw new Error(`Cette video n'est pas prete (statut : ${st ?? 'inconnu'}).`);
  }

  const rel = `avatar/${short.id}.mp4`;
  const dest = path.join(ROOT, 'public', rel);
  await download(s.data.video_url, dest);

  const dur = mediaDuration(dest);
  short.avatar = rel;
  short.audioSeconds = dur;
  short.status = 'avatar';
  delete short.speech; // l'ancien calage ne vaut plus pour cette video
  writeCalendar(cal2);

  console.log(`  OK -> public/${rel}${dur ? ` (${dur.toFixed(1)} s)` : ''}`);

  // Meme controle que link-avatars : une duree qui ne colle pas au script
  // signale presque toujours qu'on s'est trompe de video.
  const expected = short.lines.reduce((a, l) => a + estimateLine(l.t), 0);
  if (dur && (dur / expected < 0.6 || dur / expected > 1.6)) {
    console.log(`\n  ATTENTION : ~${expected.toFixed(0)} s attendues pour ce script, ${dur.toFixed(1)} s mesurees.`);
    console.log(`  Verifie que c'est bien la video de ${short.id} avant de monter.`);
  }

  console.log(`\n  Etape suivante :`);
  console.log(`    node scripts/align.mjs ${short.id} && node scripts/render.mjs ${short.id}\n`);
}

async function download(url, dest) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Telechargement ${r.status}`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, Buffer.from(await r.arrayBuffer()));
}

// Un message lisible plutot qu'une pile d'appels Node.
const fail = (e) => {
  console.error(`\n  ${e instanceof Error ? e.message : e}\n`);
  process.exit(1);
};

const arg = process.argv[2];
if (arg === '--avatars') {
  await listAvatars(process.argv[3]).catch(fail);
  process.exit(0);
}
if (arg === '--looks') {
  await listLooks(process.argv[3]).catch(fail);
  process.exit(0);
}
if (arg === '--fetch') {
  const [, , , shortId, videoId] = process.argv;
  if (!shortId || !videoId) {
    console.error(`\n  Usage : node scripts/heygen.mjs --fetch S01 <video_id>\n`);
    process.exit(1);
  }
  await fetchExisting(shortId, videoId).catch(fail);
  process.exit(0);
}

const cal = readCalendar();
const short = pickShort(cal, arg);
console.log(`\n${short.id} · ${short.title}`);
console.log(`  ${spokenText(short).split(/\s+/).length} mots a faire dire a ton avatar.`);

const url = await generate(short).catch(fail);
const rel = `avatar/${short.id}.mp4`;
const dest = path.join(ROOT, 'public', rel);
await download(url, dest).catch(fail);

const dur = mediaDuration(dest);
short.avatar = rel;
short.audioSeconds = dur;
short.status = 'avatar';
writeCalendar(cal);

console.log(`\n  OK -> public/${rel}${dur ? ` (${dur.toFixed(1)} s)` : ''}`);
console.log(`  Les sous-titres et les elements de design sont recales sur cette duree.`);
console.log(`  Etape suivante : node scripts/render.mjs ${short.id}`);
