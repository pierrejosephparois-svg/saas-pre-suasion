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

/**
 * @param {{t:string,v?:object}[]} lines
 * @param {number|null} audioSeconds duree reelle de la voix (HeyGen), si connue
 */
export function buildTimeline(lines, audioSeconds = null) {
  const raw = lines.map((l) => estimateLine(l.t));
  const rawTotal = raw.reduce((a, b) => a + b, 0);
  const scale = audioSeconds && audioSeconds > 0 ? audioSeconds / rawTotal : 1;

  let cursor = LEAD_IN;
  const out = lines.map((line, i) => {
    const dur = raw[i] * scale;
    const start = cursor;
    const end = start + dur;
    cursor = end;

    // repartition des mots au prorata de leur longueur (approximation lisible)
    const ws = words(line.t);
    const weights = ws.map((w) => Math.max(2, w.length));
    const wTotal = weights.reduce((a, b) => a + b, 0);
    let wc = start;
    const timedWords = ws.map((w, j) => {
      const wd = (weights[j] / wTotal) * dur;
      const s = wc;
      wc += wd;
      return { w, start: s, end: wc };
    });

    return { ...line, index: i, start, end, duration: dur, words: timedWords };
  });

  const speech = cursor;
  return { lines: out, speechEnd: speech, total: speech + OUTRO };
}

export const secToFrames = (s, fps) => Math.round(s * fps);
