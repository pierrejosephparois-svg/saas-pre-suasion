import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { theme } from '../lib/theme.js';

const Blob = ({ x, y, size, color, opacity, speed, phase, frame, fps }) => {
  const t = (frame / fps) * speed + phase;
  const dx = Math.sin(t) * 90;
  const dy = Math.cos(t * 0.78) * 70;
  return (
    <div
      style={{
        position: 'absolute',
        left: x + dx,
        top: y + dy,
        width: size,
        height: size,
        borderRadius: '50%',
        background: `radial-gradient(circle at 50% 50%, ${color} 0%, rgba(0,0,0,0) 68%)`,
        opacity,
        filter: 'blur(6px)',
      }}
    />
  );
};

// Fond de marque : profondeur violette + halos accent qui derivent lentement.
// Reste sombre pour que l'avatar et les sous-titres tiennent le contraste.
export const Background = ({ dimmed = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fade = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: theme.bgDeep, opacity: fade }}>
      <AbsoluteFill style={{ background: `linear-gradient(165deg, ${theme.bg} 0%, ${theme.bgDeep} 55%, #0a0913 100%)` }} />
      <Blob frame={frame} fps={fps} x={-260} y={-160} size={980} color="rgba(123,252,153,.20)" opacity={dimmed ? 0.35 : 0.7} speed={0.19} phase={0} />
      <Blob frame={frame} fps={fps} x={480} y={980} size={1180} color="rgba(96,86,220,.30)" opacity={dimmed ? 0.35 : 0.75} speed={0.14} phase={2.2} />
      <Blob frame={frame} fps={fps} x={-160} y={1320} size={840} color="rgba(52,196,106,.14)" opacity={dimmed ? 0.3 : 0.6} speed={0.11} phase={4.1} />
      {/* voile pour garder le texte lisible par-dessus les halos */}
      <AbsoluteFill style={{ background: 'radial-gradient(120% 70% at 50% 40%, rgba(0,0,0,0) 40%, rgba(6,6,14,.72) 100%)' }} />
    </AbsoluteFill>
  );
};
