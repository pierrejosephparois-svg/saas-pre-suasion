import React from 'react';
import { staticFile, delayRender, continueRender } from 'remotion';

const FACES = [
  { weight: 400, file: 'fonts/general-sans-400-1.woff2' },
  { weight: 500, file: 'fonts/general-sans-500-1.woff2' },
  { weight: 600, file: 'fonts/general-sans-600-1.woff2' },
  { weight: 700, file: 'fonts/general-sans-700-1.woff2' },
];

const css = FACES.map(
  (f) => `@font-face{font-family:'General Sans';font-style:normal;font-weight:${f.weight};font-display:block;src:url(${staticFile(f.file)}) format('woff2');}`
).join('\n');

// Charge les 4 graisses avant le rendu de la premiere frame :
// sans ca, Remotion capture des frames en police de secours.
export const Fonts = () => {
  const [handle] = React.useState(() => delayRender('Chargement General Sans'));

  React.useEffect(() => {
    let cancelled = false;
    Promise.all(FACES.map((f) => document.fonts.load(`${f.weight} 100px 'General Sans'`)))
      .then(() => document.fonts.ready)
      .catch(() => null)
      .then(() => {
        if (!cancelled) continueRender(handle);
      });
    return () => {
      cancelled = true;
    };
  }, [handle]);

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
};
