import React from 'react';
import { AbsoluteFill } from 'remotion';
import { theme } from './lib/theme.js';
import { buildTimeline } from './lib/timing.js';
import { Fonts } from './components/Fonts.jsx';
import { Background } from './components/Background.jsx';
import { AvatarLayer } from './components/AvatarLayer.jsx';
import { Visual } from './components/Visual.jsx';
import { Captions } from './components/Captions.jsx';
import { Chrome } from './components/Chrome.jsx';
import { EndCard } from './components/EndCard.jsx';

export const Short = ({ short, avatarSrc = null, audioSeconds = null, layout = 'full' }) => {
  const timeline = buildTimeline(short.lines, audioSeconds);

  return (
    <AbsoluteFill style={{ background: theme.bgDeep, fontFamily: theme.display }}>
      <Fonts />
      <Background dimmed={Boolean(avatarSrc) && layout === 'full'} />
      <AvatarLayer avatarSrc={avatarSrc} layout={layout} />
      <Visual timeline={timeline} />
      <Captions timeline={timeline} />
      <Chrome />
      <EndCard cta={short.cta} startSeconds={timeline.speechEnd} />
    </AbsoluteFill>
  );
};
