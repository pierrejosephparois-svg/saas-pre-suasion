import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { theme, SAFE } from '../lib/theme.js';

// Carte de verre : le langage visuel demande (translucide, style Apple).
const glass = {
  background: `linear-gradient(180deg, rgba(255,255,255,.085), rgba(255,255,255,.035))`,
  border: '1px solid rgba(255,255,255,.14)',
  borderRadius: 40,
  backdropFilter: 'blur(26px)',
  WebkitBackdropFilter: 'blur(26px)',
  boxShadow: '0 34px 90px rgba(0,0,0,.46), inset 0 1px 0 rgba(255,255,255,.20)',
  padding: '44px 48px',
};

const Chip = ({ text }) => (
  <div style={{ textAlign: 'center' }}>
  <span
    style={{
      display: 'inline-block',
      padding: '18px 34px',
      borderRadius: 999,
      background: 'rgba(123,252,153,.13)',
      border: `1px solid ${theme.accent}55`,
      color: theme.accent,
      fontFamily: theme.display,
      fontWeight: 600,
      fontSize: 32,
      letterSpacing: 4.5,
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
    }}
  >
    {text}
  </span>
  </div>
);

const Stat = ({ value, label }) => (
  <div style={{ ...glass, textAlign: 'center' }}>
    <div style={{ fontFamily: theme.display, fontWeight: 700, fontSize: 132, lineHeight: 1, letterSpacing: -4, color: theme.accent, textShadow: `0 0 60px ${theme.accent}44` }}>{value}</div>
    <div style={{ marginTop: 18, fontFamily: theme.display, fontWeight: 500, fontSize: 34, color: 'rgba(244,241,235,.72)' }}>{label}</div>
  </div>
);

const ListBlock = ({ items, mark, progress, fps, frame, startFrame }) => (
  <div style={{ ...glass, display: 'grid', gap: 26 }}>
    {items.map((it, i) => {
      const s = spring({ frame: frame - startFrame - i * 6, fps, config: { damping: 200, mass: 0.5 } });
      const ok = mark === 'check';
      return (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 24, opacity: s, transform: `translateX(${(1 - s) * 26}px)` }}>
          <div
            style={{
              width: 52,
              height: 52,
              flex: '0 0 52px',
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: ok ? 'rgba(123,252,153,.16)' : 'rgba(255,107,107,.14)',
              border: `1px solid ${ok ? theme.accent + '66' : theme.danger + '55'}`,
              color: ok ? theme.accent : theme.danger,
              fontFamily: theme.display,
              fontWeight: 700,
              fontSize: 30,
            }}
          >
            {ok ? '✓' : '✕'}
          </div>
          <div style={{ fontFamily: theme.display, fontWeight: 500, fontSize: 40, color: theme.text, lineHeight: 1.2 }}>{it}</div>
        </div>
      );
    })}
  </div>
);

const Bar = ({ label, value, pct, color, grow }) => (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
      <span style={{ fontFamily: theme.display, fontWeight: 500, fontSize: 30, color: 'rgba(244,241,235,.66)' }}>{label}</span>
      <span style={{ fontFamily: theme.display, fontWeight: 700, fontSize: 40, color }}>{value}</span>
    </div>
    <div style={{ height: 16, borderRadius: 10, background: 'rgba(255,255,255,.08)', overflow: 'hidden' }}>
      <div style={{ width: `${pct * grow}%`, height: '100%', borderRadius: 10, background: color, boxShadow: `0 0 26px ${color}66` }} />
    </div>
  </div>
);

const Compare = ({ before, after, grow }) => (
  <div style={{ ...glass, display: 'grid', gap: 38 }}>
    <Bar label={before.label} value={before.value} pct={before.pct} color="rgba(255,107,107,.9)" grow={grow} />
    <Bar label={after.label} value={after.value} pct={after.pct} color={theme.accent} grow={grow} />
  </div>
);

const Quote = ({ text, author }) => (
  <div style={{ ...glass, borderLeft: `4px solid ${theme.accent}` }}>
    <div style={{ fontFamily: theme.display, fontWeight: 500, fontSize: 42, lineHeight: 1.28, color: theme.text, fontStyle: 'italic' }}>“{text}”</div>
    <div style={{ marginTop: 22, fontFamily: theme.display, fontWeight: 600, fontSize: 30, letterSpacing: 2, color: theme.accent }}>{author}</div>
  </div>
);

const MathBlock = ({ rows, frame, startFrame, fps }) => (
  <div style={{ ...glass, display: 'grid', gap: 18 }}>
    {rows.map((r, i) => {
      const s = spring({ frame: frame - startFrame - i * 7, fps, config: { damping: 200, mass: 0.5 } });
      const last = i === rows.length - 1;
      return (
        <div
          key={i}
          style={{
            fontFamily: theme.display,
            fontWeight: last ? 700 : 500,
            fontSize: last ? 52 : 42,
            color: last ? theme.accent : 'rgba(244,241,235,.86)',
            borderTop: last ? '1px solid rgba(255,255,255,.14)' : 'none',
            paddingTop: last ? 20 : 0,
            opacity: s,
            transform: `translateY(${(1 - s) * 16}px)`,
          }}
        >
          {r}
        </div>
      );
    })}
  </div>
);

const Logos = ({ items }) => (
  <div style={{ display: 'flex', gap: 22, justifyContent: 'center', flexWrap: 'wrap' }}>
    {items.map((it, i) => (
      <div
        key={i}
        style={{
          ...glass,
          padding: '26px 40px',
          borderRadius: 26,
          fontFamily: theme.display,
          fontWeight: 700,
          fontSize: 46,
          letterSpacing: 3,
          color: theme.text,
        }}
      >
        {it}
      </div>
    ))}
  </div>
);

const Big = ({ text }) => (
  <div style={{ ...glass, textAlign: 'center' }}>
    <div style={{ fontFamily: theme.display, fontWeight: 700, fontSize: 58, lineHeight: 1.2, letterSpacing: -1.5, color: theme.text, whiteSpace: 'pre-line' }}>{text}</div>
  </div>
);

const render = (v, ctx) => {
  switch (v.type) {
    case 'chip': return <Chip text={v.text} />;
    case 'stat': return <Stat value={v.value} label={v.label} />;
    case 'list': return <ListBlock items={v.items} mark={v.mark} {...ctx} />;
    case 'compare': return <Compare before={v.before} after={v.after} grow={ctx.grow} />;
    case 'quote': return <Quote text={v.text} author={v.author} />;
    case 'math': return <MathBlock rows={v.rows} {...ctx} />;
    case 'logos': return <Logos items={v.items} />;
    case 'big': return <Big text={v.text} />;
    default: return null;
  }
};

// Un element de design reste a l'ecran de son apparition jusqu'au prochain
// element (ou la fin), pour eviter le clignotement.
export const Visual = ({ timeline }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const beats = [];
  timeline.lines.forEach((l, i) => {
    if (l.v) {
      const nextWithV = timeline.lines.slice(i + 1).find((x) => x.v);
      beats.push({ v: l.v, start: l.start, end: nextWithV ? nextWithV.start : timeline.speechEnd });
    }
  });

  const beat = beats.find((b) => t >= b.start && t < b.end);
  if (!beat) return null;

  const startFrame = Math.round(beat.start * fps);
  const enter = spring({ frame: frame - startFrame, fps, config: { damping: 200, mass: 0.7 } });
  const exit = interpolate(t, [beat.end - 0.22, beat.end], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const grow = interpolate(frame - startFrame, [0, 26], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div
      style={{
        position: 'absolute',
        left: 72,
        right: 72,
        top: SAFE.top + 40,
        display: 'flex',
        justifyContent: 'center',
        opacity: enter * exit,
        transform: `translateY(${(1 - enter) * 40}px) scale(${0.96 + enter * 0.04})`,
        filter: `blur(${(1 - enter) * 8}px)`,
      }}
    >
      <div style={{ width: '100%' }}>{render(beat.v, { frame, startFrame, fps, grow })}</div>
    </div>
  );
};
