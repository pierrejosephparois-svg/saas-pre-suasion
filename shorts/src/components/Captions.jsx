import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { theme } from '../lib/theme.js';

// Sous-titres style direct-response (Hormozi) : 2-3 mots a l'ecran, capitales,
// tres gros, contour noir epais, le mot prononce en accent de marque avec un
// petit rebond. Objectif : lisible son coupe, a bout de bras, en scroll.

const GROUP_SIZE = 3; // mots par groupe
const STROKE = 12; // epaisseur du contour noir

// Un groupe se termine aussi sur une ponctuation forte : on ne coupe pas
// une phrase au milieu juste pour remplir trois mots.
const buildGroups = (words) => {
  const groups = [];
  let cur = [];
  for (const w of words) {
    cur.push(w);
    const breaks = /[.?!:]$/.test(w.w);
    if (cur.length >= GROUP_SIZE || breaks) {
      groups.push(cur);
      cur = [];
    }
  }
  if (cur.length) groups.push(cur);
  return groups.map((g) => ({ words: g, start: g[0].start, end: g[g.length - 1].end }));
};

export const Captions = ({ timeline }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const line = timeline.lines.find((l) => t >= l.start && t < l.end);
  if (!line) return null;

  const groups = buildGroups(line.words);
  const group = groups.find((g) => t >= g.start && t < g.end) || (t >= line.end - 0.01 ? groups[groups.length - 1] : null);
  if (!group) return null;

  const startFrame = Math.round(group.start * fps);
  const pop = spring({ frame: frame - startFrame, fps, config: { damping: 12, mass: 0.4, stiffness: 190 } });
  const scale = 0.82 + pop * 0.18;

  return (
    <div
      style={{
        position: 'absolute',
        left: 56,
        right: 56,
        bottom: 300,
        textAlign: 'center',
        transform: `scale(${scale})`,
      }}
    >
      <div
        style={{
          fontFamily: theme.display,
          fontWeight: 700,
          fontSize: group.words.length >= 3 ? 104 : 118,
          lineHeight: 1.02,
          letterSpacing: -2,
          textTransform: 'uppercase',
          color: theme.text,
          WebkitTextStroke: `${STROKE}px #05040c`,
          paintOrder: 'stroke fill',
          filter: 'drop-shadow(0 14px 26px rgba(0,0,0,.72))',
        }}
      >
        {group.words.map((w, i) => {
          const on = t >= w.start && t < w.end;
          const hit = on ? spring({ frame: frame - Math.round(w.start * fps), fps, config: { damping: 11, mass: 0.28 } }) : 0;
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                margin: '0 12px',
                color: on ? theme.accent : theme.text,
                transform: `scale(${1 + hit * 0.09}) translateY(${-hit * 6}px)`,
              }}
            >
              {w.w}
            </span>
          );
        })}
      </div>
    </div>
  );
};
