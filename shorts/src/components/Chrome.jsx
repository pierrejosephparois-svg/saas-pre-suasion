import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { theme, SAFE } from '../lib/theme.js';

// Barre de progression + signature de marque. Elements fixes de la DA.
export const Chrome = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const pct = interpolate(frame, [0, durationInFrames - 1], [0, 100], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', top: SAFE.top - 74, left: 72, right: 72, height: 5, borderRadius: 4, background: 'rgba(255,255,255,.10)' }}>
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            borderRadius: 4,
            background: `linear-gradient(90deg, ${theme.accentDeep}, ${theme.accent})`,
            boxShadow: `0 0 22px ${theme.accent}66`,
          }}
        />
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 92,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: theme.display,
          fontWeight: 600,
          fontSize: 26,
          letterSpacing: 8,
          color: 'rgba(244,241,235,.42)',
        }}
      >
        PRÉ-SUASION
      </div>
    </AbsoluteFill>
  );
};
