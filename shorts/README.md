# Machine a shorts — Pré-suasion

Un short vertical par jour ouvre, sans camera et sans monteur :
**script → avatar HeyGen → coupe des blancs → montage Remotion → mp4 publiable**.

Le mois est deja ecrit : **30 shorts** dans `content/calendar.json`, adaptes
a l'ICP (consultants IA & automatisation) et bases sur les 7 principes
d'influence de Cialdini.

## Installation

```bash
cd shorts
npm install
cp .env.example .env
```

**ffmpeg** est necessaire pour la coupe des blancs (macOS : `brew install ffmpeg`,
Linux : `apt install ffmpeg`). Sans lui, cette etape est simplement sautee avec
un message clair : le reste de la chaine fonctionne. Un ffmpeg est bien livre
avec Remotion, mais c'est un build allege qui ne suffit pas pour le montage.

## Configurer HeyGen (une seule fois)

1. **Cloner l'avatar.** HeyGen > *Avatars* > *New avatar* > *Clone a real
   person*. Televerse une video de toi qui parles — plus elle est longue,
   plus le rendu est fidele. Un changement de coupe ou de couleur de
   cheveux demande un nouvel avatar.
2. **Cloner la voix.** HeyGen > *Voice cloning*. Choisis le moteur
   (ElevenLabs v3 y est accessible directement). Meme regle : plus tu
   donnes d'audio, plus la voix te ressemble. Une voix de la bibliotheque
   fait l'affaire pour demarrer.
3. **Recuperer la cle API.** Espace developpeur > *API key*. Colle-la dans
   `.env` (`HEYGEN_API_KEY`).
4. **Recuperer les identifiants** de ton avatar et de ta voix :

```bash
node scripts/heygen.mjs --avatars
```

Colle-les dans `.env` (`HEYGEN_AVATAR_ID`, `HEYGEN_VOICE_ID`).

## Produire le short du jour

```bash
npm run make
```

La commande enchaine : generation de l'avatar, coupe des blancs, montage.
Le fichier sort dans `out/<date>-<ID>.mp4`, en 1080x1920.

Pour un short precis :

```bash
node scripts/make-short.mjs S07
```

## Les autres commandes

| Commande | Effet |
|---|---|
| `npm run calendar` | etat du mois : ecrit, tourne, monte, publie |
| `npm run studio` | previsualisation interactive (Remotion Studio) |
| `npm run render -- S07` | remonter un short sans regenerer l'avatar |
| `npm run render:all` | remonter les 30 |
| `node scripts/heygen.mjs --avatars` | lister avatars et voix |
| `node scripts/link-avatars.mjs` | rattacher des mp4 deposes a la main |

## Route sans cle API

Si tu preferes ne pas utiliser l'API : genere les videos a la main dans
l'application HeyGen, telecharge-les, et depose-les dans `public/avatar/`
en les nommant `S01.mp4`, `S02.mp4`, … Puis :

```bash
node scripts/link-avatars.mjs   # rattache les videos au calendrier
node scripts/render.mjs --all   # monte tout
```

Aucune cle nulle part. La duree reelle de chaque video est mesuree et les
sous-titres se recalent dessus, exactement comme par l'API.

## Sans video avatar du tout

Tout se rend quand meme : l'avatar est remplace par un emplacement portrait
de marque, et le reste du montage (sous-titres mot a mot, elements de
design, carte CTA) est final. Des qu'une video HeyGen existe pour un short,
elle prend automatiquement le plein cadre et la timeline se recale sur la
duree reelle de la voix — sans retoucher une ligne de code.

## Ecrire un nouveau short

Ajoute un objet dans `content/calendar.json` :

```json
{
  "id": "S31",
  "day": 31,
  "date": "2026-10-13",
  "title": "…",
  "angle": "…",
  "principle": "Rareté",
  "cta": "Commente X, je t'envoie Y.",
  "status": "draft",
  "avatar": null,
  "audioSeconds": null,
  "lines": [
    { "t": "Huit mots maximum par ligne.", "v": { "type": "chip", "text": "LABEL" } },
    { "t": "La ligne suivante n'a pas besoin de visuel." }
  ]
}
```

La composition Remotion `S31` apparait toute seule. Les conventions
d'ecriture et les types d'elements de design sont dans `AGENTS.md`.

## Notes techniques

- Rendu : 1080x1920, 30 fps, H.264, CRF 18.
- Polices : General Sans (400/500/600/700), copiees depuis `assets/fonts`
  du site — memes fichiers, meme rendu que pre-suasion.fr.
- Palette : `#131222` / `#7BFC99` / `#F4F1EB`, synchronisee avec le `:root`
  de `index.html`.
- Machine sans acces au telechargement de Chromium : renseigne
  `REMOTION_BROWSER_EXECUTABLE` dans `.env`.
- ffmpeg est choisi automatiquement : celui du systeme s'il gere h264/aac,
  sinon celui de Remotion (lecture seule). `FFMPEG_PATH` force le choix.
- Un rendu prend environ 1 min 30 par short.
