// ─── COMPOSANTS PARTAGÉS ──────────────────────────────────────

// Étiquette noire (eyebrow Webyn) — réutilisable
function Tag({ children, variant = "dark", style }) {
  const cls = variant === "green" ? "tag tag-green" : variant === "outline" ? "tag tag-outline" : "tag";
  return <span className={cls} style={style}>{children}</span>;
}

// Titre de section : étiquette noire + label
function SectionTitle({ children, style }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, whiteSpace: "nowrap", ...style }}>
      <Tag>{children}</Tag>
    </div>
  );
}

// Score ICP en diamants
function DiamondScore({ score, size = 12 }) {
  return (
    <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }} title={`Score ICP ${score}/3`}>
      {[1, 2, 3].map(i => {
        const on = i <= score;
        return (
          <span key={i} style={{
            width: size, height: size, transform: "rotate(45deg)", display: "inline-block",
            borderRadius: 2,
            background: on ? "var(--green)" : "transparent",
            border: on ? "none" : "1.5px solid var(--stroke-2)",
          }} />
        );
      })}
    </span>
  );
}

// Badge de statut (tone-based, thème clair)
function StatusBadge({ statut }) {
  const st = STATUT[statut];
  const c = toneColors(st.tone);
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      fontSize: 11.5, fontWeight: 700, color: c.fg, background: c.bg,
      border: `1px solid ${c.bd}`, padding: "4px 11px", borderRadius: 999, letterSpacing: "0.01em",
      whiteSpace: "nowrap",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: c.fg }} />
      {st.label}
    </span>
  );
}

// Graphe sparkline SVG (thème clair)
function MiniChart({ data, label, accent = false }) {
  const get = (d) => (d.rep !== undefined ? d.rep : d.dm);
  const max = Math.max(...data.map(get), 1);
  const W = 100, H = 38, pad = 2;
  const pts = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (W - pad * 2);
    const y = H - pad - (get(d) / max) * (H - pad * 2);
    return [x, y];
  });
  const line = pts.map(p => p.join(",")).join(" ");
  const area = `${pad},${H - pad} ${line} ${W - pad},${H - pad}`;
  const stroke = accent ? "var(--green-2)" : "var(--ink-2)";
  const gid = "g_" + (label || "x").replace(/[^a-z]/gi, "");

  return (
    <div>
      <div style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: "100%", height: 56, overflow: "visible", display: "block" }}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent ? "rgba(31,223,124,0.28)" : "rgba(13,16,20,0.12)"} />
            <stop offset="100%" stopColor="rgba(31,223,124,0)" />
          </linearGradient>
        </defs>
        <polygon points={area} fill={`url(#${gid})`} />
        <polyline points={line} fill="none" stroke={stroke} strokeWidth={accent ? 1.6 : 1.2} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}

// Carte panneau réutilisable (surface blanche)
function Panel({ children, style, hover, onClick }) {
  const [h, setH] = React.useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => hover && setH(true)}
      onMouseLeave={() => hover && setH(false)}
      style={{
        background: "var(--card)", border: "1px solid var(--stroke)", borderRadius: 16,
        position: "relative", transition: "border-color .2s ease",
        cursor: onClick ? "pointer" : "default",
        borderColor: h ? "var(--stroke-2)" : "var(--stroke)",
        boxShadow: "0 1px 2px rgba(13,16,20,0.03)",
        transform: "none",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// Feux de circulation macOS (rouge / jaune / vert)
function MacDots({ size = 12 }) {
  return (
    <span className="mac-dots" style={{ gap: size <= 10 ? 6 : 8 }}>
      <i style={{ background: "var(--mac-red)", width: size, height: size }} />
      <i style={{ background: "var(--mac-amber)", width: size, height: size }} />
      <i style={{ background: "var(--mac-green)", width: size, height: size }} />
    </span>
  );
}

// Fenêtre macOS — chrome avec feux, MÊME police (pas de monospace)
function MacWindow({ title, children, style, barRight, barStyle }) {
  return (
    <div className="mac" style={style}>
      <div className="mac-bar" style={barStyle}>
        <MacDots />
        {title && <span className="mac-title">{title}</span>}
        {barRight && <span style={{ marginLeft: "auto" }}>{barRight}</span>}
      </div>
      {children}
    </div>
  );
}

// Métrique « chiffre d'abord » (style cockpit financier)
function Stat({ value, label, sub, accent, size = 30, align = "left" }) {
  return (
    <div style={{ textAlign: align }}>
      <div className="display" style={{ fontSize: size, letterSpacing: "-0.03em", color: accent ? "var(--green-2)" : "var(--ink-1)", textTransform: "none", lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: "var(--ink-2)", fontWeight: 600, marginTop: 6 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 600, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

// Ligne de relevé : grand chiffre à gauche, libellé discret à droite
function StatRow({ value, label, pct, accent, last }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, padding: "11px 0", borderBottom: last ? "none" : "1px solid var(--stroke)" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span className="display" style={{ fontSize: 19, textTransform: "none", letterSpacing: "-0.02em", color: accent ? "var(--green-2)" : "var(--ink-1)", whiteSpace: "nowrap" }}>{value}</span>
        {pct != null && <span style={{ fontSize: 11.5, color: "var(--ink-3)", fontWeight: 700 }}>{pct}</span>}
      </div>
      <span style={{ fontSize: 11, color: "var(--ink-2)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
    </div>
  );
}

// Sparkline Apple Stocks — ligne fine, point final, peu d'annotations
function StockLine({ data, accent = false, height = 44 }) {
  const get = (d) => (d.rep !== undefined ? d.rep : d.dm);
  const max = Math.max(...data.map(get), 1);
  const W = 240, H = 44, pad = 1;
  const pts = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (W - pad * 2);
    const y = H - pad - (get(d) / max) * (H - pad * 2 - 3);
    return [x, y];
  });
  const line = pts.map(p => p.join(",")).join(" ");
  const last = pts[pts.length - 1];
  const stroke = accent ? "var(--green-2)" : "var(--ink-2)";
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: "100%", height, overflow: "visible", display: "block" }}>
      <polyline points={line} fill="none" stroke={stroke} strokeWidth={1.4} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <circle cx={last[0]} cy={last[1]} r={2.4} fill={stroke} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

// Graphe multi-courbes Apple Stocks (lignes fines, grille discrète, points finaux)
function MultiStockLine({ series, height = 200 }) {
  const W = 600, H = 200, padX = 4, padTop = 14, padBot = 12;
  const n = series[0].values.length;
  const max = Math.max(1, ...series.flatMap(s => s.values));
  const x = (i) => padX + (i / (n - 1)) * (W - padX * 2);
  const y = (v) => padTop + (1 - v / max) * (H - padTop - padBot);
  const grid = [0, 0.25, 0.5, 0.75, 1];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: "100%", height, display: "block", overflow: "visible" }}>
      {grid.map((g, i) => {
        const gy = padTop + g * (H - padTop - padBot);
        return <line key={i} x1={0} x2={W} y1={gy} y2={gy} stroke="var(--stroke)" strokeWidth={1} vectorEffect="non-scaling-stroke" />;
      })}
      {series.map((s, si) => {
        const pts = s.values.map((v, i) => `${x(i)},${y(v)}`).join(" ");
        const li = s.values.length - 1;
        return (
          <g key={si}>
            <polyline points={pts} fill="none" stroke={s.color} strokeWidth={1.6} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            <circle cx={x(li)} cy={y(s.values[li])} r={2.6} fill={s.color} vectorEffect="non-scaling-stroke" />
          </g>
        );
      })}
    </svg>
  );
}

Object.assign(window, { Tag, SectionTitle, DiamondScore, StatusBadge, MiniChart, Panel, MacDots, MacWindow, Stat, StatRow, StockLine, MultiStockLine });
