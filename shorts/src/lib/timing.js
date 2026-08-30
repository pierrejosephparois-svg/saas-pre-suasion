// Moteur de timing.
// Sans audio : on estime la duree de chaque ligne (debit FR pose ~2,6 mots/s
// + pauses de ponctuation). Avec l'audio HeyGen : on garde les proportions
// estimees et on les met a l'echelle de la duree reelle, ce qui recale
// automatiquement les sous-titres et les elements de design.

export const SPEAK_RATE = 2.6; // mots par seconde
export const MIN_LINE = 1.15; // secondes
export const LEAD_IN = 0.25; // silence avant la 1re ligne
export const OUTRO = 2.6; // carte CTA finale

const PUNCT_PAUSE = { '.': 0.34, '?': 0.4, '!': 0.36, ':': 0.26, ',': 0.14, ';': 0.2 };

export const words = (t) => t.trim().split(/\s+/).filter(Boolean);

export function estimateLine(text) {
  const w = words(text);
  let d = w.length / SPEAK_RATE;
  for (const ch of text) d += PUNCT_PAUSE[ch] || 0;
  return Math.max(MIN_LINE, d);
}

// Poids d'un mot : sa longueur approche sa duree de prononciation.
const weightOf = (w) => Math.max(2, w.length);

/**
 * Convertit une fraction de parole [0..1] en temps reel, en traversant les
 * segments de parole. Les silences ne consomment aucun mot : un sous-titre
 * reste donc affiche pendant une pause au lieu de prendre de l'avance.
 */
function atSpeechFraction(f, segments, totalSpeech) {
  let target = Math.max(0, Math.min(1, f)) * totalSpeech;
  for (const [s, e] of segments) {
    const d = e - s;
    if (target <= d) return s + target;
    target -= d;
  }
  return segments[segments.length - 1][1];
}

/**
 * @param {{t:string,v?:object}[]} lines
 * @param {number|null} audioSeconds duree reelle de la voix (HeyGen), si connue
 * @param {[number,number][]|null} speechSegments intervalles de parole reels,
 *   mesures sur l'audio. Quand ils sont fournis, les sous-titres se calent sur
 *   la voix ; sinon on retombe sur une estimation mise a l'echelle de la duree,
 *   qui derive des que le debit n'est pas regulier.
 */
export function buildTimeline(lines, audioSeconds = null, speechSegments = null) {
  const perLine = lines.map((l) => words(l.t).map((w) => ({ w, weight: weightOf(w) })));
  const lineWeights = perLine.map((ws) => ws.reduce((a, x) => a + x.weight, 0));
  const totalWeight = lineWeights.reduce((a, b) => a + b, 0) || 1;

  const segments = Array.isArray(speechSegments) && speechSegments.length ? speechSegments : null;

  let toTime;
  if (segments) {
    const totalSpeech = segments.reduce((a, [s, e]) => a + (e - s), 0);
    toTime = (f) => atSpeechFraction(f, segments, totalSpeech);
  } else {
    // Repli : duree estimee par ligne, mise a l'echelle de l'audio si connu.
    const raw = lines.map((l) => estimateLine(l.t));
    const rawTotal = raw.reduce((a, b) => a + b, 0);
    const scale = audioSeconds && audioSeconds > 0 ? audioSeconds / rawTotal : 1;
    const cum = [];
    let acc = LEAD_IN;
    for (const d of raw) {
      cum.push(acc);
      acc += d * scale;
    }
    cum.push(acc);
    // f est une fraction de poids : on la convertit en position dans cum.
    toTime = (f) => {
      const target = f * totalWeight;
      let seen = 0;
      for (let i = 0; i < lineWeights.length; i++) {
        if (target <= seen + lineWeights[i] || i === lineWeights.length - 1) {
          const within = lineWeights[i] ? (target - seen) / lineWeights[i] : 0;
          return cum[i] + within * (cum[i + 1] - cum[i]);
        }
        seen += lineWeights[i];
      }
      return cum[cum.length - 1];
    };
  }

  let seen = 0;
  const out = lines.map((line, i) => {
    const start = toTime(seen / totalWeight);
    const timedWords = perLine[i].map((x) => {
      const s = toTime(seen / totalWeight);
      seen += x.weight;
      return { w: x.w, start: s, end: toTime(seen / totalWeight) };
    });
    const end = toTime(seen / totalWeight);
    return { ...line, index: i, start, end, duration: end - start, words: timedWords };
  });

  const speechEnd = out.length ? out[out.length - 1].end : 0;
  return { lines: out, speechEnd, total: speechEnd + OUTRO };
}

export const secToFrames = (s, fps) => Math.round(s * fps);
