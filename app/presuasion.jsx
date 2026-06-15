// ─── PRÉ-SUASION · écran principal ────────────────────────────
//  Préparer, personnaliser et gagner le rendez-vous avant qu'il ait lieu.

function PresuHeader() {
  return (
    <div className="presu-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 24, flexWrap: "wrap", marginBottom: "var(--gap)" }}>
      <div>
        <Tag variant="green">Pré-suasion</Tag>
        <h1 className="display" style={{ fontSize: 42, marginTop: 14, marginBottom: 8, textTransform: "none", letterSpacing: "-0.02em" }}>Pré-suasion</h1>
        <div style={{ fontSize: 14.5, color: "var(--ink-2)", fontWeight: 600, maxWidth: 480, lineHeight: 1.5 }}>Arrivez au rendez-vous comme si vous connaissiez déjà votre prospect.</div>
      </div>
      <div style={{ display: "flex", alignItems: "stretch", gap: 12 }}>
        <Panel style={{ padding: "16px 20px", display: "flex", flexDirection: "column", justifyContent: "center", minWidth: 156 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 11.5, fontWeight: 800, color: "var(--green-2)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green-2)" }} />Call confirmé
          </span>
          <span className="display" style={{ fontSize: 22, textTransform: "none", letterSpacing: "-0.02em", marginTop: 8 }}>Mardi 15:00</span>
        </Panel>
        <Panel style={{ padding: "16px 22px", display: "flex", flexDirection: "column", justifyContent: "center", minWidth: 156 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Score de préparation</span>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 8 }}>
            <span className="display" style={{ fontSize: 30, textTransform: "none", letterSpacing: "-0.03em", color: "var(--green-2)" }}>92</span>
            <span className="display" style={{ fontSize: 17, textTransform: "none", letterSpacing: "-0.02em", color: "var(--ink-3)" }}>/ 100</span>
          </div>
          <div style={{ height: 5, borderRadius: 999, background: "var(--surface-2)", overflow: "hidden", marginTop: 10 }}>
            <div style={{ height: "100%", width: "92%", borderRadius: 999, background: "var(--green)" }} />
          </div>
        </Panel>
      </div>
    </div>
  );
}

function ScreenPresuasion() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap)" }}>
      <PresuHeader />
      <PresuBriefing />
      <PresuMessage />
      <PresuResources />
      <PresuInfluence />
      <div className="presu-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--gap)" }}>
        <PresuTriggers />
        <PresuPlan />
      </div>
      <PresuObjections />
      <PresuSynthese />
    </div>
  );
}

Object.assign(window, { ScreenPresuasion });
