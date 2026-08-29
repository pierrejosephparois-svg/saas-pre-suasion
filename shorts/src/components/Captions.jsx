import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { theme, SAFE } from '../lib/theme.js';

// Sous-titres mot a mot facon reel : la ligne monte, le mot prononce
// se colore en accent avec un leger pop. Casse en 2-3 lignes max.
export const Captions = ({ timeline }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const active = timeline.lines.find((l) => t >= l.start && t < l.end) || null;
  if (!active) return null;

  const enter = spring({ frame: frame - Math.round(active.start * fps), fps, config: { damping: 200, mass: 0.55 } });
  const out = interpolate(t, [active.end - 0.16, active.end], [1, 0.82], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div
      style={{
        position: 'absolute',
        left: 76,
        right: 76,
        bottom: 300,
        textAlign: 'center',
        opacity: enter * out,
        transform: `translateY(${(1 - enter) * 34}px)`,
      }}
    >
      <div
        style={{
          fontFamily: theme.display,
          fontWeight: 700,
          fontSize: active.words.length <= 6 ? 78 : active.words.length <= 9 ? 68 : 58,
          lineHeight: 1.14,
          letterSpacing: -1.2,
          color: theme.text,
          textShadow: '0 6px 34px rgba(0,0,0,.66)',
          textWrap: 'balance',
        }}
      >
        {active.words.map((w, i) => {
          const on = t >= w.start && t < w.end;
          const pop = on ? spring({ frame: frame - Math.round(w.start * fps), fps, config: { damping: 14, mass: 0.32 } }) : 0;
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                margin: '0 9px',
                color: on ? theme.accent : theme.text,
                transform: `scale(${1 + pop * 0.055})`,
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
