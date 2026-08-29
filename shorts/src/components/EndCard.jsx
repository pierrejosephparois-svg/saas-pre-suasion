import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { theme } from '../lib/theme.js';

// Verrouillage post-suasif : le CTA est un engagement actif (commenter,
// enregistrer, repondre), pas une simple invitation passive.
export const EndCard = ({ cta, startSeconds }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const start = Math.round(startSeconds * fps);
  if (frame < start) return null;

  const s = spring({ frame: frame - start, fps, config: { damping: 200, mass: 0.6 } });
  const veil = interpolate(frame - start, [0, 12], [0, 0.86], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <AbsoluteFill style={{ background: `rgba(11,10,22,${veil})`, backdropFilter: `blur(${s * 16}px)`, WebkitBackdropFilter: `blur(${s * 16}px)` }} />
      <div style={{ position: 'relative', padding: '0 92px', textAlign: 'center', opacity: s, transform: `translateY(${(1 - s) * 34}px) scale(${0.94 + s * 0.06})` }}>
        <div style={{ fontFamily: theme.display, fontWeight: 600, fontSize: 30, letterSpacing: 7, color: theme.accent, marginBottom: 34 }}>À TOI DE JOUER</div>
        <div style={{ fontFamily: theme.display, fontWeight: 700, fontSize: 68, lineHeight: 1.16, letterSpacing: -1.6, color: theme.text }}>{cta}</div>
        <div
          style={{
            marginTop: 56,
            display: 'inline-block',
            padding: '26px 52px',
            borderRadius: 999,
            background: `linear-gradient(90deg, ${theme.accentDeep}, ${theme.accent})`,
            color: '#0B0A16',
            fontFamily: theme.display,
            fontWeight: 700,
            fontSize: 38,
            boxShadow: `0 24px 70px ${theme.accent}3a`,
          }}
        >
          pre-suasion.fr
        </div>
      </div>
    </AbsoluteFill>
  );
};
