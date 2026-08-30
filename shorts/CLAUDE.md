# Machine a shorts — Pré-suasion

Projet de creation de contenu video automatisee pour **Pierre-Joseph Parois**
(pre-suasion.fr). Un short vertical par jour ouvre, dans la direction
artistique du site, sans camera et sans monteur.

## Ce que fait ce projet

Chaine complete, du script au fichier publiable :

```
content/calendar.json   le script du jour (ecrit, pas genere a la volee)
      |
      v  scripts/heygen.mjs
HeyGen                  l'avatar clone lit le script avec la voix clonee
      |
      v  scripts/trim-silence.mjs
ffmpeg                  detecte et coupe les blancs
      |
      v  scripts/render.mjs
Remotion                montage : sous-titres direct-response + design
      |
      v
out/2026-09-01-S01.mp4  1080x1920, pret a publier
```

## Regles de travail

- **Le contenu vit dans `content/calendar.json`.** Un short = un objet avec
  `lines[]` (le texte parle, decoupe en unites de sous-titre) et un `cta`.
  Chaque ligne peut porter un `v` : l'element de design affiche a ce moment.
- **Ne jamais inventer de preuve.** Chiffres, cas clients et promesses
  viennent du site (index.html) ou d'un element fourni par Pierre-Joseph.
  Une fausse rarete ou un faux temoignage detruit l'actif ; c'est la regle
  n°0 de la methode elle-meme.
- **Le CTA est un engagement actif** (commenter un mot precis, enregistrer,
  repondre), jamais un « n'hesitez pas ».
- **La DA est celle du site.** Couleurs et polices sont dans
  `src/lib/theme.js`, synchronisees avec le `:root` de `index.html`.
  Ne pas introduire d'autre couleur ni d'autre police.
- **Sous-titres : style direct-response** (facon Hormozi). 2 a 3 mots a
  l'ecran, capitales, contour noir epais, mot prononce en accent de marque.
  Reglages en tete de `src/components/Captions.jsx` (`GROUP_SIZE`, `STROKE`).
- **Zones sures** : rien d'important au-dessus de 210 px ni en dessous de
  520 px (interface Instagram / TikTok). Constante `SAFE`.
- **Duree cible : 30 a 45 s.** Au-dela, couper une idee, pas accelerer.
- **Une idee par short.** Si un script porte deux idees, en faire deux.

## Structure

```
content/calendar.json      30 shorts : script, angle, principe, CTA, statut
src/lib/theme.js           tokens de marque + zones sures
src/lib/timing.js          moteur de timing (estime, puis recale sur l'audio)
src/components/            Captions, Visual, AvatarLayer, Background, EndCard
src/Root.jsx               une composition Remotion par short (S01…S30)
scripts/heygen.mjs         generation avatar + voix
scripts/trim-silence.mjs   coupe des blancs (ffmpeg)
scripts/render.mjs         montage final
scripts/make-short.mjs     la chaine complete pour un short
scripts/link-avatars.mjs   rattache des mp4 HeyGen deposes a la main
scripts/calendar.mjs       etat du mois
public/fonts/              General Sans (400/500/600/700), copie du site
public/avatar/             videos HeyGen (ignorees par git)
out/                       fichiers finaux (ignores par git)
```

## Commandes

```bash
npm run calendar                  # etat du mois
node scripts/heygen.mjs --avatars # lister avatars et voix
npm run make                      # short du jour, chaine complete
node scripts/make-short.mjs S07   # un short precis
npm run render -- S07             # remonter sans regenerer l'avatar
npm run studio                    # previsualiser dans Remotion Studio
```

## A verifier apres chaque changement

```bash
npx remotion compositions src/index.jsx   # les 30 compositions se chargent
node scripts/render.mjs S01               # un rendu complet passe
```

## Ce qu'il ne faut pas faire

- Ne pas commiter `.env`, les mp4 de `public/avatar/` ni `out/`.
- Ne pas changer la police ni la palette sans demande explicite.
- Ne pas allonger un short au-dela de 45 s.
- Ne pas publier un short dont un chiffre n'est pas sourcable.
