# Agents — machine a shorts Pré-suasion

Un seul agent execute la chaine aujourd'hui, mais le travail se decompose en
quatre roles. Les garder distincts evite le melange des genres : un montage
rate se corrige sans toucher au script, un script faible ne se rattrape pas
avec du design.

Les regles communes (DA, preuves, zones sures) sont dans `CLAUDE.md`.

---

## 1. Scenariste

**Entree** : un angle, un principe d'influence, l'ICP.
**Sortie** : un objet dans `content/calendar.json`.

- Deux premieres secondes = l'accroche pre-suasive. Elle dirige l'attention
  sur **le concept** qui rend le message evident ensuite. Pas de teasing
  hors sujet : une amorce non alignee sur la demande ne fait rien.
- Une ligne de `lines[]` = une unite de sous-titre : **8 mots maximum**,
  ponctuee, lisible seule.
- 45 a 70 mots parles par short (≈ 30-45 s a 2,6 mots/seconde).
- Le `cta` demande une action precise et couteuse en attention (ecrire un
  mot, coller sa premiere ligne, repondre par un chiffre).
- Interdit : chiffre non sourcable, rarete inventee, temoignage reformule
  au-dela de ce qui est publie sur le site.

## 2. Directeur artistique

**Entree** : les `lines[]` du script.
**Sortie** : le champ `v` de certaines lignes.

- 3 a 4 elements de design par short. Au-dela, ils se volent l'attention.
- Chaque element **illustre** la ligne qu'il accompagne, il ne la repete pas
  mot pour mot — sauf `big`, qui existe justement pour marteler une phrase.
- Types disponibles (voir `src/components/Visual.jsx`) :
  `chip`, `stat`, `list` (`mark: "check" | "x"`), `compare`, `quote`,
  `math`, `logos`, `big`.
- Un element reste a l'ecran jusqu'au suivant : ne pas en poser un sur
  chaque ligne, ca clignote.

## 3. Avatar & voix

**Entree** : le texte parle complet.
**Sortie** : `public/avatar/<ID>.mp4` + `audioSeconds` dans le calendrier.

- `scripts/heygen.mjs` fait l'appel, attend le rendu, telecharge et mesure.
- La duree reelle **remplace** l'estimation : sous-titres et elements de
  design se recalent seuls (`src/lib/timing.js`).
- Si la diction sonne mecanique : reentrainer la voix avec plus d'audio
  plutot que de bricoler `HEYGEN_VOICE_SPEED`.

## 4. Monteur

**Entree** : la video avatar + le calendrier recale.
**Sortie** : `out/<date>-<ID>.mp4`.

- `scripts/trim-silence.mjs` coupe les blancs (seuil `-35dB`, 0,45 s),
  en laissant 0,12 s de respiration de chaque cote.
- `scripts/render.mjs` assemble via Remotion.
- Controle avant publication : accroche lisible en 2 s son coupe, aucun
  texte dans les zones d'interface, dernier plan = le CTA.
