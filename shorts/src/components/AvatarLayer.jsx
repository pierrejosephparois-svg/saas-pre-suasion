import React from 'react';
import { AbsoluteFill, OffthreadVideo, Img, staticFile, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { theme } from '../lib/theme.js';

// Deux modes :
//  - avatarSrc fourni (mp4 HeyGen) -> plein cadre, comme un reel filme.
//  - sinon -> emplacement portrait de marque (photo fixe) pour que la video
//    soit deja publiable en preview ; la bascule est automatique des que la
//    cle HEYGEN_API_KEY produit un mp4.
export const AvatarLayer = ({ avatarSrc }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const zoom = interpolate(frame, [0, durationInFrames], [1, 1.06]);

  if (avatarSrc) {
    return (
      <AbsoluteFill>
        <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
          <OffthreadVideo src={avatarSrc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </AbsoluteFill>
        <AbsoluteFill
          style={{
            background:
              'linear-gradient(180deg, rgba(11,10,22,.86) 0%, rgba(11,10,22,.30) 26%, rgba(11,10,22,.10) 46%, rgba(11,10,22,.72) 74%, rgba(11,10,22,.96) 100%)',
          }}
        />
      </AbsoluteFill>
    );
  }

  const enter = interpolate(frame, [6, 26], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: 740,
        width: 520,
        height: 640,
        marginLeft: -260,
        borderRadius: 48,
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,.16)',
        boxShadow: `0 50px 120px rgba(0,0,0,.60), 0 0 0 1px ${theme.accent}18, inset 0 1px 0 rgba(255,255,255,.18)`,
        opacity: enter,
        transform: `translateY(${(1 - enter) * 26}px)`,
      }}
    >
      <Img
        src={staticFile('avatar/placeholder.png')}
        style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom})`, filter: 'saturate(.82) contrast(1.04) brightness(.86)' }}
      />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(19,18,34,.30) 0%, rgba(19,18,34,0) 34%, rgba(19,18,34,.78) 100%)' }} />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 26,
          textAlign: 'center',
          fontFamily: theme.display,
          fontWeight: 600,
          fontSize: 26,
          letterSpacing: 3,
          color: 'rgba(244,241,235,.80)',
        }}
      >
        PIERRE-JOSEPH PAROIS
      </div>
    </div>
  );
};
