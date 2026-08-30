import React from 'react';
import { Composition, staticFile } from 'remotion';
import { Short } from './Short.jsx';
import { FPS, WIDTH, HEIGHT } from './lib/theme.js';
import { buildTimeline, secToFrames } from './lib/timing.js';
import calendar from '../content/calendar.json';

// Une composition par short du calendrier : "S01" ... "S30".
// La duree est calculee depuis le script (et recalee sur l'audio HeyGen
// des qu'un mp4 existe dans public/avatar/<id>.mp4).
export const RemotionRoot = () => (
  <>
    {calendar.shorts.map((short) => (
      <Composition
        key={short.id}
        id={short.id}
        component={Short}
        width={WIDTH}
        height={HEIGHT}
        fps={FPS}
        durationInFrames={secToFrames(buildTimeline(short.lines).total, FPS)}
        defaultProps={{ short, avatarSrc: null, audioSeconds: null, layout: short.layout ?? calendar.meta.layout ?? 'full' }}
        calculateMetadata={async ({ props }) => {
          const s = props.short;
          let avatarSrc = props.avatarSrc;
          let audioSeconds = props.audioSeconds;

          // Bascule automatique vers la video HeyGen si elle a ete generee.
          if (!avatarSrc && s.avatar) avatarSrc = staticFile(s.avatar);
          if (!audioSeconds && s.audioSeconds) audioSeconds = s.audioSeconds;

          const t = buildTimeline(s.lines, audioSeconds);
          return {
            durationInFrames: secToFrames(t.total, FPS),
            props: { ...props, avatarSrc, audioSeconds, layout: s.layout ?? calendar.meta.layout ?? props.layout },
          };
        }}
      />
    ))}
  </>
);
