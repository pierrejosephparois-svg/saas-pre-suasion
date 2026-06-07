// ─── APP SHELL (sidebar) ──────────────────────────────────────
const { useState } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "grid": 1,
  "greenHue": "#7AF9A5",
  "density": "regular"
}/*EDITMODE-END*/;

// Icônes sidebar (trait fin)
const Icon = {
  perf: (p) => <svg className="ic" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 19V5M4 19h16M8 16l3.5-4 3 2.5L20 8" /></svg>,
  leads: (p) => <svg className="ic" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="9" cy="8" r="3" /><path d="M3.5 19a5.5 5.5 0 0 1 11 0M16 11a3 3 0 0 0 0-6M20.5 19a5.5 5.5 0 0 0-4-5.3" /></svg>,
  conv: (p) => <svg className="ic" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 5h16v11H9l-4 3v-3H4z" /></svg>,
  gear: (p) => <svg className="ic" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" /></svg>,
};

function SettingsPop({ t, setTweak, onClose }) {
  const [ps, setPs] = React.useState(loadPresu);
  const upd = (k, v) => { const n = { ...ps, [k]: Math.max(0, parseFloat(v) || 0) }; setPs(n); savePresu(n); };
  const PField = ({ label, k, unit, step }) => (
    <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, background: "var(--surface-2)", borderRadius: 16, padding: "9px 12px", marginBottom: 7 }}>
      <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-2)" }}>{label}</span>
      <span style={{ display: "inline-flex", alignItems: "baseline", gap: 3 }}>
        <input type="number" value={ps[k]} step={step} min={0} onChange={(e) => upd(k, e.target.value)}
          style={{ width: 62, textAlign: "right", border: "none", background: "transparent", fontFamily: "inherit", fontWeight: 800, fontSize: 14, color: "var(--ink-1)", outline: "none", padding: 0 }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-3)" }}>{unit}</span>
      </span>
    </label>
  );
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 55 }} />
      <div className="settings-pop">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-2)" }}>Paramètres</span>
          <button onClick={onClose} style={{ border: "none", background: "transparent", color: "var(--ink-3)", cursor: "pointer", fontSize: 15, fontFamily: "inherit" }}>✕</button>
        </div>

        <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 8 }}>Objectif commercial</div>
        <PField label="Objectif mensuel" k="objectif" unit="€" step={500} />
        <PField label="Panier moyen" k="panier" unit="€" step={100} />
        <PField label="Taux de closing" k="closing" unit="%" step={1} />
        <div style={{ fontSize: 10.5, color: "var(--ink-3)", fontWeight: 600, margin: "2px 2px 16px", lineHeight: 1.4 }}>Les objectifs d'activité du dashboard en sont déduits automatiquement.</div>

        <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 8 }}>Densité</div>
        <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
          {["compact", "regular", "comfy"].map(d => (
            <button key={d} onClick={() => setTweak("density", d)} style={{
              flex: 1, padding: "7px 0", borderRadius: 8, border: "1px solid",
              borderColor: t.density === d ? "var(--ink-1)" : "var(--stroke-2)",
              background: t.density === d ? "var(--ink-1)" : "transparent",
              color: t.density === d ? "#fff" : "var(--ink-2)",
              fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", textTransform: "capitalize",
            }}>{d}</button>
          ))}
        </div>

        <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 8 }}>Teinte menthe</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {["#7AF9A5", "#96FCAA", "#6FF0C0", "#8DFB9A", "#62EFA0"].map(c => (
            <button key={c} onClick={() => setTweak("greenHue", c)} style={{
              width: 26, height: 26, borderRadius: 8, cursor: "pointer", background: c,
              border: t.greenHue === c ? "2px solid var(--ink-1)" : "1px solid var(--stroke-2)",
            }} />
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0 14px" }}>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-1)" }}>Grille de fond</span>
          <button onClick={() => setTweak("grid", t.grid ? 0 : 1)} style={{
            width: 40, height: 23, borderRadius: 999, border: "none", cursor: "pointer", position: "relative",
            background: t.grid ? "var(--green)" : "var(--stroke-2)", transition: "background .15s",
          }}>
            <span style={{ position: "absolute", top: 2, left: t.grid ? 19 : 2, width: 19, height: 19, borderRadius: "50%", background: "#fff", transition: "left .15s", boxShadow: "0 1px 2px rgba(0,0,0,.2)" }} />
          </button>
        </div>
      </div>
    </>
  );
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [screen, setScreen] = useState("perf");
  const [selectedLead, setSelectedLead] = useState(null);
  const [settings, setSettings] = useState(false);
  const aRelancer = LEADS.filter(l => l.statut === "FU_EN_ATTENTE").length;

  const openConv = (lead) => { setSelectedLead(lead); setScreen("conv"); };

  const gap = t.density === "compact" ? 16 : t.density === "comfy" ? 30 : 22;
  const pad = t.density === "compact" ? 22 : t.density === "comfy" ? 44 : 34;
  const rootStyle = { "--glow": t.grid, "--green": t.greenHue, "--gap": gap + "px", "--shell-pad": pad + "px" };

  const nav = [
    { id: "perf", label: "Performance", icon: Icon.perf },
    { id: "leads", label: "Leads", icon: Icon.leads, badge: aRelancer || null },
    { id: "conv", label: "Conversations", icon: Icon.conv },
  ];

  return (
    <div className="app-root" style={rootStyle}>
      <div className="app-shell">

        {/* Sidebar */}
        <aside className="sidebar">
          <div className="side-brand">
            <svg className="brand-mark" width="34" height="34" viewBox="0 0 34 34" aria-label="Pré-suasion" role="img">
              <defs>
                <mask id="pjMask">
                  <rect width="34" height="34" fill="black" />
                  <text x="17" y="27" textAnchor="middle" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="29" fontWeight="800" fill="white">P</text>
                </mask>
              </defs>
              <rect width="34" height="34" rx="10" fill="var(--green)" />
              <image href={window.PJ_FACE} x="-3" y="-1" width="40" height="40" preserveAspectRatio="xMidYMid slice" mask="url(#pjMask)" />
            </svg>
            <span className="side-brand-name" style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-0.02em" }}>Pré-suasion</span>
          </div>
          <nav className="side-nav">
            {nav.map(n => (
              <button key={n.id} onClick={() => { setScreen(n.id); if (n.id !== "conv") setSelectedLead(null); }}
                className={screen === n.id ? "side-item active" : "side-item"}>
                <n.icon />
                <span className="side-label">{n.label}</span>
                {n.badge && <span className="side-badge side-label">{n.badge}</span>}
              </button>
            ))}
          </nav>
          <div className="side-foot">
            <button className="side-gear" onClick={() => setSettings(s => !s)}>
              <Icon.gear />
              <span className="side-label">Paramètres</span>
            </button>
          </div>
        </aside>

        {/* Contenu */}
        <div className="content">
          {screen === "conv" ? (
            <Screen3 initialLead={selectedLead} />
          ) : (
            <div className="content-pad">
              {screen === "perf" && <ScreenPerformance onOpenConv={openConv} onGoLeads={() => setScreen("leads")} />}
              {screen === "leads" && <Screen2 onOpenConv={openConv} />}
            </div>
          )}
        </div>
      </div>

      {settings && <SettingsPop t={t} setTweak={setTweak} onClose={() => setSettings(false)} />}

      {/* Tweaks (barre d'outils) */}
      <TweaksPanel>
        <TweakSection label="Direction artistique" />
        <TweakColor label="Teinte menthe" value={t.greenHue}
          options={["#7AF9A5", "#96FCAA", "#6FF0C0", "#8DFB9A", "#62EFA0"]}
          onChange={(v) => setTweak('greenHue', v)} />
        <TweakToggle label="Grille de fond" value={!!t.grid}
          onChange={(v) => setTweak('grid', v ? 1 : 0)} />
        <TweakSection label="Mise en page" />
        <TweakRadio label="Densité" value={t.density} options={["compact", "regular", "comfy"]}
          onChange={(v) => setTweak('density', v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
