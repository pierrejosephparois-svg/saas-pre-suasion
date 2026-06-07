// ═══ DASHBOARD PERFORMANCE — REVENUE VELOCITY ════════════════
//  Partie 1 · PERFORMANCE COMMERCIALE   (le pipeline réel + l'argent)
//  Partie 2 · INTELLIGENCE DE PRÉ-SUASION (vitesse · ce qui accélère)

const RANGE_LABEL = { 1: "Aujourd'hui", 7: "7 jours", 30: "30 jours", 90: "90 jours" };
const eur = (n) => Math.round(n).toLocaleString("fr-FR") + " €";

// ─── Filtre global (sticky, pilote toute la page) ─────────────
function RangeToggle({ range, setRange }) {
  return (
    <div style={{ display: "flex", gap: 2, padding: 3, background: "var(--surface-2)", borderRadius: 999 }}>
      {[1, 7, 30, 90].map(r => (
        <button key={r} onClick={() => setRange(r)} style={{
          padding: "7px 14px", borderRadius: 999, border: "none", fontFamily: "inherit", whiteSpace: "nowrap",
          fontSize: 11.5, fontWeight: 700, cursor: "pointer", transition: "all .15s ease",
          background: range === r ? "var(--ink-1)" : "transparent",
          color: range === r ? "#fff" : "var(--ink-2)",
        }}>{RANGE_LABEL[r]}</button>
      ))}
    </div>
  );
}

function BlockHead({ tag, question, right }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14, marginBottom: 18, flexWrap: "wrap" }}>
      <div>
        <Tag>{tag}</Tag>
        {question && <div style={{ fontSize: 13, color: "var(--ink-2)", fontWeight: 600, marginTop: 11, fontStyle: "italic" }}>« {question} »</div>}
      </div>
      {right}
    </div>
  );
}

function PartLabel({ n, title, subtitle }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "calc(var(--gap) * 1.2) 0 var(--gap)" }}>
      <span style={{ fontSize: 13, fontWeight: 800, color: "var(--green-2)", letterSpacing: "0.12em" }}>{n}</span>
      <div style={{ flexShrink: 0 }}>
        <div className="display" style={{ fontSize: 21, textTransform: "none", letterSpacing: "-0.01em" }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12.5, color: "var(--ink-3)", fontWeight: 600, marginTop: 2 }}>{subtitle}</div>}
      </div>
      <div style={{ flex: 1, height: 1, background: "var(--stroke-2)" }} />
    </div>
  );
}

// ─── FUNNEL · mini-Sankey vertical ────────────────────────────
function VerticalFunnel({ stages, between, selectable, selectedKey, onSelect }) {
  const maxV = Math.max(...stages.map(s => s.val), 1);
  const pct = (v) => Math.max(24, (v / maxV) * 100);
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {stages.map((s, i) => {
        const w = pct(s.val);
        const prev = i > 0 ? pct(stages[i - 1].val) : null;
        const baseOp = Math.max(0.52, 1 - i * 0.1);
        const op = selectable ? (s.key === selectedKey ? 1 : 0.46) : baseOp;
        const sel = selectable && s.key === selectedKey;
        return (
          <React.Fragment key={s.label}>
            {i > 0 && (
              <div style={{
                position: "relative", height: 42, background: "rgba(122,249,165,0.16)",
                clipPath: `polygon(${50 - prev / 2}% 0%, ${50 + prev / 2}% 0%, ${50 + w / 2}% 100%, ${50 - w / 2}% 100%)`,
              }}>
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1 }}>
                  {between(stages[i - 1], s, i)}
                </div>
              </div>
            )}
            <div onClick={selectable ? () => onSelect(s.key) : undefined} style={{
              width: `${w}%`, margin: "0 auto", minWidth: 132, minHeight: 52, borderRadius: 12,
              background: "var(--green)", opacity: op, boxSizing: "border-box", cursor: selectable ? "pointer" : "default",
              outline: sel ? "2.5px solid var(--ink-1)" : "none", outlineOffset: 2,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 11, padding: "0 18px",
              transition: "opacity .2s, outline-color .15s",
            }}>
              {s.render ? s.render() : (
                <>
                  <span className="display" style={{ fontSize: 19, textTransform: "none", color: "var(--green-ink)" }}>{s.val.toLocaleString("fr-FR")}</span>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--green-ink)", whiteSpace: "nowrap" }}>{s.label}</span>
                </>
              )}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── FUNNEL commercial · barres + voile vert (mini-Sankey), lecture gauche → droite ─
function CommercialFunnel({ funnel }) {
  const max = funnel[0].val || 1;
  const steps = funnel.map((s, i) => ({
    ...s,
    conv: i === 0 ? null : (funnel[i - 1].val ? Math.round(s.val / funnel[i - 1].val * 100) : 0),
    loss: i === 0 ? null : funnel[i - 1].val - s.val,
  }));
  const convs = steps.map(s => s.conv).filter(v => v != null);
  const worst = convs.length ? Math.min(...convs) : -1;
  const H = 210;
  const hOf = (v) => Math.max(8, (v / max) * H);
  return (
    <Panel style={{ padding: "26px 28px 30px", marginTop: "var(--gap)" }}>
      <BlockHead tag="Funnel" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr) 74px) minmax(0,1fr)", gridTemplateRows: `auto ${H}px auto`, alignItems: "end" }}>
        {steps.map((s, i) => {
          const col = (i * 2) + 1;
          const h = hOf(s.val);
          return (
            <React.Fragment key={s.label}>
              <span className="display" style={{ gridColumn: col, gridRow: 1, textAlign: "center", alignSelf: "end", fontSize: 22, textTransform: "none", color: "var(--ink-1)", marginBottom: 9 }}>{s.val.toLocaleString("fr-FR")}</span>
              <div style={{ gridColumn: col, gridRow: 2, alignSelf: "stretch", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                <div style={{ width: "100%", maxWidth: 96, height: h, borderRadius: "10px 10px 4px 4px", background: "var(--green)", opacity: Math.max(0.5, 1 - i * 0.12), transition: "height .55s cubic-bezier(.4,0,.2,1)" }} />
              </div>
              <span style={{ gridColumn: col, gridRow: 3, textAlign: "center", marginTop: 12, fontSize: 11, fontWeight: 700, color: "var(--ink-2)", lineHeight: 1.25 }}>{s.label}</span>
              {i < steps.length - 1 && (() => {
                const next = steps[i + 1];
                const hr = hOf(next.val);
                const topL = (1 - h / H) * 100, topR = (1 - hr / H) * 100;
                const bad = next.conv === worst;
                return (
                  <div style={{ gridColumn: col + 1, gridRow: 2, position: "relative" }}>
                    <div style={{ position: "absolute", inset: 0, background: "rgba(122,249,165,0.20)", clipPath: `polygon(0% ${topL}%, 100% ${topR}%, 100% 100%, 0% 100%)` }} />
                    <div style={{ position: "absolute", left: 0, right: 0, top: `${(Math.max(topL, topR) + 100) / 2}%`, transform: "translateY(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 800, color: bad ? "var(--alert)" : "var(--ink-1)" }}>{next.conv}%</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: bad ? "var(--alert)" : "var(--ink-3)" }}>−{next.loss.toLocaleString("fr-FR")}</span>
                    </div>
                  </div>
                );
              })()}
            </React.Fragment>
          );
        })}
      </div>
    </Panel>
  );
}

// ─── MONEY CLOCK · ARGENT NON CAPTURÉ (Apple premium) ─────────
function MoneyInput({ label, value, onChange, unit, step }) {
  return (
    <label style={{ display: "block", background: "var(--surface-2)", borderRadius: 16, padding: "11px 14px", cursor: "text" }}>
      <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--ink-3)" }}>{label}</span>
      <span style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 5 }}>
        <input type="number" value={value} step={step} min={0}
          onChange={(e) => onChange(Math.max(0, parseFloat(e.target.value) || 0))}
          style={{ width: "100%", minWidth: 0, border: "none", background: "transparent", fontFamily: "inherit", fontWeight: 800, fontSize: 19, color: "var(--ink-1)", outline: "none", padding: 0 }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-3)" }}>{unit}</span>
      </span>
    </label>
  );
}

const MONEY_TONE = {
  green: { fg: "var(--green-2)", bg: "rgba(122,249,165,0.16)", bd: "rgba(31,138,77,0.30)", label: "Objectif tenu", dot: "var(--mac-green)" },
  amber: { fg: "#B7791F",        bg: "rgba(254,188,46,0.14)",  bd: "rgba(183,121,31,0.30)", label: "Léger retard", dot: "var(--mac-amber)" },
  red:   { fg: "var(--alert)",   bg: "rgba(192,71,63,0.10)",   bd: "rgba(192,71,63,0.30)",  label: "Retard important", dot: "var(--mac-red)" },
};

// KPI réalisé / objectif — statut couleur, leviers (DM/FU) plus grands
function ObjKpi({ label, real, target, big }) {
  const pct = target ? (real / target) * 100 : 0;
  const tone = pct >= 100 ? "green" : pct >= 70 ? "amber" : "red";
  const dot = MONEY_TONE[tone].dot;
  return (
    <Panel style={{ padding: big ? "20px 22px" : "15px 17px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: big ? 12.5 : 11, color: "var(--ink-2)", fontWeight: 600 }}>{label}</span>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: dot }} />
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: big ? 13 : 9 }}>
        <span className="display" style={{ fontSize: big ? 34 : 23, textTransform: "none" }}>{real.toLocaleString("fr-FR")}</span>
        <span style={{ fontSize: big ? 16 : 13, fontWeight: 700, color: "var(--ink-3)" }}>/ {target.toLocaleString("fr-FR")}</span>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: "var(--surface-2)", overflow: "hidden", marginTop: big ? 13 : 9 }}>
        <div style={{ height: "100%", width: `${Math.min(100, pct)}%`, background: dot, borderRadius: 3, transition: "width .4s" }} />
      </div>
    </Panel>
  );
}

function MoneyClock({ range, presu, setPresu }) {
  const o = objectivesFor(range, presu);
  const m = metricsFor(range);
  const retard = Math.max(0, o.callsAcc - m.acc);
  const moneyLost = Math.round(retard * o.closing * o.panier);
  const ratio = o.callsAcc ? m.acc / o.callsAcc : 1;
  const tone = ratio >= 1 ? "green" : ratio >= 0.7 ? "amber" : "red";
  const T = MONEY_TONE[tone];
  return (
    <Panel style={{ padding: "24px 26px", marginTop: "var(--gap)" }}>
      <BlockHead tag="Coût d'inaction"
        right={<span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-3)" }}>Horizon · {RANGE_LABEL[range]}</span>} />
      <div className="cout-grid" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr auto", gap: "var(--gap)", alignItems: "center" }}>
        {/* Montant */}
        <div>
          <div className="display" style={{ fontSize: 46, textTransform: "none", letterSpacing: "-0.03em", color: T.fg, lineHeight: 1 }}>
            {moneyLost > 0 ? "−" : ""}{eur(moneyLost)}
          </div>
          <div style={{ fontSize: 12.5, color: "var(--ink-2)", fontWeight: 600, marginTop: 9 }}>
            {moneyLost > 0 ? `perdu sur ${RANGE_LABEL[range].toLowerCase()}` : "rien de perdu sur cette période"}
          </div>
        </div>
        {/* Cause + panier */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 6 }}>Cause principale</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ink-1)" }}>{retard} calls manquants</div>
          </div>
          <MoneyInput label="Panier moyen (modifiable)" value={presu.panier} unit="€" step={100} onChange={(v) => setPresu({ ...presu, panier: v })} />
        </div>
        {/* Statut */}
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 9, padding: "11px 16px", borderRadius: 16, background: T.bg, border: `1px solid ${T.bd}`, whiteSpace: "nowrap" }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: T.dot }} />
            <span style={{ fontSize: 12.5, fontWeight: 800, color: T.fg }}>{T.label}</span>
          </div>
        </div>
      </div>
    </Panel>
  );
}

// ─── TRACTION (timeline réelle, sans phrase explicative) ──────
function Traction({ range }) {
  const [hover, setHover] = React.useState(null);
  const wrapRef = React.useRef(null);
  const m = metricsFor(Math.max(range, 7));
  const series = [
    { key: "dm", label: "DM", color: "var(--green)", values: m.data.map(d => d.dm) },
    { key: "rep", label: "Réponses", color: "var(--green-soft)", values: m.data.map(d => d.rep) },
    { key: "call", label: "Calls", color: "#565A66", values: m.data.map(d => Math.round(d.dm * 0.25)) },
  ];
  const n = series[0].values.length;
  const W = 760, H = 210, padX = 6, padTop = 14, padBot = 8;
  const maxV = Math.max(1, ...series.flatMap(s => s.values));
  const X = (i) => padX + (i / (n - 1)) * (W - padX * 2);
  const Y = (v) => padTop + (1 - v / maxV) * (H - padTop - padBot);
  const tickIdx = [0, Math.round((n - 1) / 3), Math.round((2 * (n - 1)) / 3), n - 1];
  const onMove = (e) => {
    const r = wrapRef.current.getBoundingClientRect();
    setHover(Math.max(0, Math.min(n - 1, Math.round(((e.clientX - r.left) / r.width) * (n - 1)))));
  };
  return (
    <Panel style={{ padding: "26px 28px", marginTop: "var(--gap)" }}>
      <BlockHead tag="Traction" right={
        <div style={{ display: "flex", gap: 14 }}>
          {series.map(l => (
            <div key={l.key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 13, height: 3, borderRadius: 2, background: l.color }} />
              <span style={{ fontSize: 11.5, color: "var(--ink-2)", fontWeight: 600 }}>{l.label}</span>
            </div>
          ))}
        </div>
      } />
      <div ref={wrapRef} onMouseMove={onMove} onMouseLeave={() => setHover(null)} style={{ position: "relative", cursor: "crosshair" }}>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: "100%", height: 210, display: "block", overflow: "visible" }}>
          {[0, 0.25, 0.5, 0.75, 1].map((g, i) => {
            const gy = padTop + g * (H - padTop - padBot);
            return <line key={i} x1={0} x2={W} y1={gy} y2={gy} stroke="var(--stroke)" strokeWidth={1} vectorEffect="non-scaling-stroke" />;
          })}
          {hover != null && <line x1={X(hover)} x2={X(hover)} y1={padTop - 6} y2={H} stroke="var(--stroke-2)" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />}
          {series.map(s => (
            <polyline key={s.key} points={s.values.map((v, i) => `${X(i)},${Y(v)}`).join(" ")}
              fill="none" stroke={s.color} strokeWidth={1.8} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          ))}
          {hover != null && series.map(s => (
            <circle key={s.key} cx={X(hover)} cy={Y(s.values[hover])} r={3} fill={s.color} stroke="var(--card)" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
          ))}
        </svg>
        {hover != null && (
          <div style={{
            position: "absolute", top: -2, left: `${(X(hover) / W) * 100}%`,
            transform: `translateX(${hover > n / 2 ? "-104%" : "8px"})`,
            background: "var(--ink-1)", color: "#fff", borderRadius: 10, padding: "9px 12px",
            pointerEvents: "none", whiteSpace: "nowrap", boxShadow: "0 10px 28px -12px rgba(0,0,0,.5)", zIndex: 2,
          }}>
            <div style={{ fontSize: 11, fontWeight: 800, marginBottom: 6 }}>{fmtDateFr(m.dates[hover])}</div>
            {series.map(s => (
              <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11.5, fontWeight: 600, marginTop: 2 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />
                <span style={{ opacity: .8 }}>{s.label}</span>
                <span style={{ marginLeft: "auto", fontWeight: 800 }}>{s.values[hover]}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{ position: "relative", height: 16, marginTop: 8 }}>
        {tickIdx.map((ti, k) => (
          <span key={k} style={{
            position: "absolute", left: `${(X(ti) / W) * 100}%`,
            transform: k === 0 ? "translateX(0)" : k === tickIdx.length - 1 ? "translateX(-100%)" : "translateX(-50%)",
            fontSize: 10.5, color: "var(--ink-3)", fontWeight: 600, whiteSpace: "nowrap",
          }}>{fmtDateFr(m.dates[ti])}</span>
        ))}
      </div>
    </Panel>
  );
}

// ─── HEATMAP (compacte, style Google Calendar) ────────────────
function Heatmap() {
  const [metric, setMetric] = React.useState("rep");
  const { vals, best, max } = heatFor(metric);
  const bestDi = HEAT_DAYS.indexOf(best.day);
  const cell = (v) => v <= 0 ? "var(--surface-2)" : `color-mix(in oklab, var(--green) ${Math.round(16 + (v / max) * 84)}%, var(--surface-2))`;
  return (
    <Panel style={{ padding: "24px 28px", marginTop: "var(--gap)" }}>
      <BlockHead tag="Timing" right={
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ fontSize: 10, color: "var(--ink-3)", fontWeight: 700 }}>−</span>
            <span style={{ width: 56, height: 7, borderRadius: 4, background: "linear-gradient(90deg, var(--surface-2), var(--green))" }} />
            <span style={{ fontSize: 10, color: "var(--ink-3)", fontWeight: 700 }}>+</span>
          </div>
          <div style={{ display: "flex", gap: 2, padding: 3, background: "var(--surface-2)", borderRadius: 999 }}>
            {[{ k: "rep", l: "Réponses" }, { k: "calls", l: "Calls acceptés" }].map(o => (
              <button key={o.k} onClick={() => setMetric(o.k)} style={{
                padding: "6px 12px", borderRadius: 999, border: "none", fontFamily: "inherit", fontSize: 11, fontWeight: 700, cursor: "pointer",
                background: metric === o.k ? "var(--ink-1)" : "transparent", color: metric === o.k ? "#fff" : "var(--ink-2)", transition: "all .15s",
              }}>{o.l}</button>
            ))}
          </div>
        </div>
      } />
      <div style={{ overflowX: "auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: `34px repeat(${HEAT_HOURS.length}, minmax(0,1fr))`, gap: 3, minWidth: 540 }}>
          <div />
          {HEAT_HOURS.map(h => <div key={h} style={{ fontSize: 9.5, color: "var(--ink-3)", fontWeight: 700, textAlign: "center", paddingBottom: 3 }}>{h}h</div>)}
          {HEAT_DAYS.map((d, di) => (
            <React.Fragment key={d}>
              <div style={{ fontSize: 11, color: "var(--ink-2)", fontWeight: 700, display: "flex", alignItems: "center" }}>{d}</div>
              {vals[di].map((v, hi) => (
                <div key={hi} title={`${d} ${HEAT_HOURS[hi]}h · ${v}`} style={{
                  height: 20, borderRadius: 4, background: cell(v),
                  border: di === bestDi && HEAT_HOURS[hi] === best.hour ? "1.5px solid var(--ink-1)" : "1px solid var(--stroke)",
                }} />
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </Panel>
  );
}

// ─── VELOCITY (médiane · P75 · P90 · distribution) ────────────
function VelocityCard() {
  const { velocity, avgFollowups, topFollowup, journey } = TIMING;
  const maxP90 = Math.max(...velocity.map(v => v.p90));
  return (
    <Panel style={{ padding: "26px 28px" }}>
      <BlockHead tag="Velocity"
        right={<span style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-3)" }}>Médiane · P75 · P90</span>} />
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {velocity.map(v => (
          <div key={v.label}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 64px 64px 64px", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-1)" }}>{v.label}</span>
              <span style={{ textAlign: "right" }}><span className="display" style={{ fontSize: 18, textTransform: "none", color: "var(--green-2)" }}>{v.median}</span><span style={{ fontSize: 10.5, color: "var(--ink-3)", fontWeight: 700 }}> j</span></span>
              <span style={{ textAlign: "right", fontSize: 12.5, fontWeight: 700, color: "var(--ink-2)" }}>{v.p75} j</span>
              <span style={{ textAlign: "right", fontSize: 12.5, fontWeight: 700, color: "var(--ink-3)" }}>{v.p90} j</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 64px 64px 64px", gap: 8, marginTop: 7 }}>
              <div style={{ position: "relative", height: 6, borderRadius: 3, background: "var(--surface-2)", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, width: `${v.p75 / maxP90 * 100}%`, background: "rgba(122,249,165,0.45)" }} />
                <div style={{ position: "absolute", inset: 0, width: `${v.median / maxP90 * 100}%`, background: "var(--green)" }} />
                <div style={{ position: "absolute", top: -1, bottom: -1, left: `calc(${v.p90 / maxP90 * 100}% - 1.5px)`, width: 2, background: "var(--ink-1)" }} />
              </div>
              <div /><div /><div />
            </div>
          </div>
        ))}
      </div>

      {/* Parcours */}
      <div style={{ display: "flex", marginTop: 26 }}>
        {journey.map((j, i) => (
          <div key={i} style={{ flex: 1, position: "relative", textAlign: "center" }}>
            {i > 0 && <div style={{ position: "absolute", top: 7, left: "-50%", width: "100%", height: 2, background: "var(--stroke-2)" }} />}
            <div style={{ position: "relative", width: 16, height: 16, borderRadius: "50%", margin: "0 auto", background: i === journey.length - 1 ? "var(--green)" : "var(--ink-1)", boxShadow: "0 0 0 3px var(--card)" }} />
            <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-1)", marginTop: 10, lineHeight: 1.25 }}>{j.step}</div>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--ink-3)", marginTop: 2 }}>{j.t}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 28, marginTop: 24, paddingTop: 16, borderTop: "1px solid var(--stroke)", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 9 }}>
          <span className="display" style={{ fontSize: 20, textTransform: "none" }}>{avgFollowups}</span>
          <span style={{ fontSize: 11.5, color: "var(--ink-2)", fontWeight: 600 }}>follow-ups en moyenne</span>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 9 }}>
          <span className="display" style={{ fontSize: 20, textTransform: "none", color: "var(--green-2)" }}>{topFollowup}</span>
          <span style={{ fontSize: 11.5, color: "var(--ink-2)", fontWeight: 600 }}>follow-up le plus performant</span>
        </div>
      </div>
    </Panel>
  );
}

// ─── IMPACT DES FOLLOW-UPS ────────────────────────────────────
function FUImpact() {
  const max = Math.max(...FU_IMPACT.map(f => f.reply));
  return (
    <Panel style={{ padding: "26px 28px", marginTop: "var(--gap)" }}>
      <BlockHead tag="Impact des follow-ups" />
      <div className="fu-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {FU_IMPACT.map(f => (
          <div key={f.step} style={{
            padding: "16px 16px 14px", borderRadius: 14, position: "relative",
            background: f.best ? "rgba(122,249,165,0.16)" : "var(--surface-2)",
            border: f.best ? "1px solid var(--green)" : "1px solid transparent",
          }}>
            {f.best && <span style={{ position: "absolute", top: 12, right: 12, fontSize: 8.5, fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--green-2)" }}>Le + performant</span>}
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span className="display" style={{ fontSize: 20, textTransform: "none" }}>{f.step}</span>
              <span style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 700 }}>{f.delai}</span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 12 }}>
              <span className="display" style={{ fontSize: 26, textTransform: "none", color: f.best ? "var(--green-2)" : "var(--ink-1)" }}>{f.reply}%</span>
              <span style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 600 }}>réponses</span>
            </div>
            <div style={{ height: 5, borderRadius: 3, background: "rgba(20,20,38,0.07)", overflow: "hidden", margin: "9px 0 12px" }}>
              <div style={{ height: "100%", width: `${f.reply / max * 100}%`, background: f.best ? "var(--green)" : "var(--stroke-2)", borderRadius: 3 }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700 }}>
              <span style={{ color: "var(--green-2)" }}>▲{f.temp} temp.</span>
              <span style={{ color: "var(--ink-2)" }}>{f.toCall}% → call</span>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

// ─── INTELLIGENCE DE PRÉ-SUASION (funnel psy + détail au clic) ─
function MIBars({ title, items }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 11 }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {items.map((it, i) => (
          <div key={i}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 5 }}>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-1)" }}>{it.label}</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: i === 0 ? "var(--green-2)" : "var(--ink-2)" }}>{it.pct}%</span>
            </div>
            <div style={{ height: 5, borderRadius: 3, background: "var(--surface-2)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${it.pct}%`, background: i === 0 ? "var(--green)" : "var(--stroke-2)", borderRadius: 3, transition: "width .4s" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PreSuasionIntelligence({ range }) {
  const raw = psyFunnelFor(range);
  const [sel, setSel] = React.useState("chauds");
  const cur = raw.find(s => s.key === sel) || raw[3];
  const d = MARKET_BY_TEMP[sel];

  const stages = raw.map(s => ({
    ...s,
    render: () => (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, lineHeight: 1.1 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span className="display" style={{ fontSize: 17, textTransform: "none", color: "var(--green-ink)" }}>{s.val.toLocaleString("fr-FR")}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--green-ink)", whiteSpace: "nowrap" }}>{s.label}</span>
        </div>
        <span style={{ fontSize: 9.5, fontWeight: 700, color: "var(--green-ink)", opacity: 0.78 }}>{s.pct}% · ▲{s.variation}%</span>
      </div>
    ),
  }));
  const between = (prev, c) => (
    <>
      <span style={{ fontSize: 12.5, fontWeight: 800, color: "var(--ink-1)", whiteSpace: "nowrap" }}>{c.timeFromPrev} j</span>
      <span style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--ink-3)", whiteSpace: "nowrap" }}>temps moyen</span>
    </>
  );

  return (
    <Panel style={{ padding: "26px 28px" }}>
      <BlockHead tag="Intelligence de pré-suasion" />
      <div className="psy-intel" style={{ display: "grid", gridTemplateColumns: "minmax(280px, 1fr) 1fr", gap: "var(--gap)", alignItems: "start" }}>
        {/* Funnel psychologique cliquable */}
        <VerticalFunnel stages={stages} between={between} selectable selectedKey={sel} onSelect={setSel} />

        {/* Détail de l'étape */}
        <div style={{ borderLeft: "1px solid var(--stroke)", paddingLeft: "var(--gap)", minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span className="display" style={{ fontSize: 22, textTransform: "none" }}>{cur.label.toUpperCase()}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-3)" }}>· {cur.pct}% du marché</span>
          </div>
          <div style={{ display: "flex", gap: 22, marginBottom: 20 }}>
            <div><span className="display" style={{ fontSize: 18, textTransform: "none" }}>{cur.val.toLocaleString("fr-FR")}</span><span style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 700, marginLeft: 6 }}>prospects</span></div>
            {cur.timeFromPrev && <div><span className="display" style={{ fontSize: 18, textTransform: "none", color: "var(--green-2)" }}>{cur.timeFromPrev} j</span><span style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 700, marginLeft: 6 }}>temps moyen</span></div>}
          </div>
          {d ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "22px 26px" }} className="mi-detail">
              <MIBars title="Objections dominantes" items={d.objections} />
              <MIBars title="Déclencheurs dominants" items={d.declencheurs} />
              <div style={{ gridColumn: "1 / -1" }}>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 11 }}>Comportements dominants</div>
                <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
                  {d.comportements.map((c, i) => (
                    <div key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start", flex: "1 1 220px" }}>
                      <span style={{ width: 6, height: 6, borderRadius: 2, background: "var(--green-2)", marginTop: 6, flexShrink: 0, transform: "rotate(45deg)" }} />
                      <span style={{ fontSize: 12.5, color: "var(--ink-1)", fontWeight: 600, lineHeight: 1.4 }}>{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ padding: "16px 18px", borderRadius: 12, background: "var(--surface-2)", fontSize: 12.5, color: "var(--ink-2)", fontWeight: 600 }}>
              Étape de conversion finale — le détail psychologique s'arrête à « Prêts ». Le passage en {cur.label.toLowerCase()} se pilote côté pipeline commercial.
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
}

// ─── ÉCRAN PERFORMANCE ────────────────────────────────────────
function ScreenPerformance() {
  const [range, setRange] = React.useState(30);
  const [presu, setPresuState] = React.useState(loadPresu);
  const setPresu = (s) => { setPresuState(s); savePresu(s); };
  React.useEffect(() => {
    const h = (e) => setPresuState(e.detail || loadPresu());
    window.addEventListener("presu-change", h);
    return () => window.removeEventListener("presu-change", h);
  }, []);
  const m = metricsFor(range);
  const o = objectivesFor(range, presu);
  const fuReal = Math.round(m.dm * 0.61);
  const leviers = [
    { label: "DM envoyés", real: m.dm, target: o.dm },
    { label: "Follow-ups", real: fuReal, target: o.fu },
  ];
  const consequences = [
    { label: "Réponses", real: m.rep, target: o.reponses },
    { label: "Calls proposés", real: m.prop, target: o.callsProp },
    { label: "Calls acceptés", real: m.acc, target: o.callsAcc },
  ];

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <Tag>Performance</Tag>
        <h1 className="display" style={{ fontSize: 42, marginTop: 14, marginBottom: 6 }}>Performance</h1>
        <div style={{ fontSize: 14, color: "var(--ink-2)", fontWeight: 600 }}>Vais-je atteindre mon objectif ?</div>
      </div>

      {/* Filtre global STICKY */}
      <div style={{
        position: "sticky", top: 0, zIndex: 40,
        margin: "0 calc(var(--shell-pad) * -1) var(--gap)", padding: "12px var(--shell-pad)",
        background: "rgba(239,240,242,0.86)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--stroke)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
      }}>
        <span style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--ink-3)" }}>Période · {RANGE_LABEL[range]}</span>
        <RangeToggle range={range} setRange={setRange} />
      </div>

      {/* ═══ PARTIE 1 · PERFORMANCE COMMERCIALE ═══ */}
      <PartLabel n="01" title="Performance commerciale" subtitle="Le pipeline réel + le coût de l'inaction" />

      {/* Leviers (DM + Follow-ups) — visuellement prioritaires */}
      <div className="perf-leviers" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        {leviers.map(k => <ObjKpi key={k.label} {...k} big />)}
      </div>
      {/* Conséquences */}
      <div className="perf-kpi" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {consequences.map(k => <ObjKpi key={k.label} {...k} />)}
      </div>

      <MoneyClock range={range} presu={presu} setPresu={setPresu} />
      <CommercialFunnel funnel={m.funnel} />
      <Traction range={range} />
      <Heatmap />

      {/* ═══ PARTIE 2 · INTELLIGENCE DE PRÉ-SUASION ═══ */}
      <PartLabel n="02" title="Intelligence de pré-suasion" subtitle="Vitesse · ce qui accélère · pourquoi ça bloque" />

      <VelocityCard />
      <FUImpact />
      <div style={{ marginTop: "var(--gap)" }}><PreSuasionIntelligence range={range} /></div>
    </div>
  );
}

Object.assign(window, { ScreenPerformance });
