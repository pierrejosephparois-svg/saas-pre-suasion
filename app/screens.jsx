// ═══ COMPOSANTS PARTAGÉS ÉCRANS ═══════════════════════════════

// Champ libellé + valeur en pastille
function Field({ label, value, tone }) {
  const c = tone === "alert"
    ? { fg: "var(--alert)", bg: "rgba(192,71,63,0.09)", bd: "rgba(192,71,63,0.28)" }
    : tone === "mint"
    ? { fg: "var(--green-2)", bg: "rgba(122,249,165,0.20)", bd: "rgba(122,249,165,0.5)" }
    : { fg: "var(--ink-1)", bg: "var(--card)", bd: "var(--stroke-2)" };
  return (
    <div style={{ minWidth: 0 }}>
      {label && <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 7 }}>{label}</div>}
      <span style={{ display: "inline-flex", fontSize: 12.5, fontWeight: 700, color: c.fg, background: c.bg, border: `1px solid ${c.bd}`, padding: "5px 12px", borderRadius: 999 }}>{value}</span>
    </div>
  );
}

// KPI card (style Gojiberry)
function KpiCard({ label, val, pct, accent }) {
  return (
    <Panel style={{ padding: "18px 20px" }}>
      <div style={{ fontSize: 11, color: "var(--ink-2)", fontWeight: 600 }}>{label}</div>
      <div className="display" style={{ fontSize: 30, textTransform: "none", marginTop: 12, color: accent ? "var(--alert)" : "var(--ink-1)" }}>
        {typeof val === "number" ? val.toLocaleString("fr-FR") : val}
      </div>
      {pct && <div style={{ fontSize: 12, color: "var(--green-2)", fontWeight: 800, marginTop: 6 }}>{pct}</div>}
    </Panel>
  );
}

// ─── PAGE 1 · PERFORMANCE → voir app/perf.jsx ─────────────────

// ─── PAGE 2 · LEADS (page d'action) ──────────────────────────

function Screen2({ onOpenConv }) {
  const aRelancer = LEADS.filter(l => l.statut === "FU_EN_ATTENTE").length;
  const enRetard = LEADS.filter(l => daysSince(l.dernierContact) >= 10).length;
  const chauds = LEADS.filter(l => l.analyse.temp >= 61).length;
  const ghost = LEADS.filter(l => leadBadge(l).ghost).length;
  const kpis = [
    { label: "À relancer", val: aRelancer },
    { label: "En retard", val: enRetard, accent: enRetard > 0 },
    { label: "Chauds", val: chauds },
    { label: "Risque de ghost", val: ghost, accent: ghost > 0 },
  ];

  const score = (l) => (leadBadge(l).ghost ? 1000 : 0) + l.analyse.temp + daysSince(l.dernierContact) * 3;
  const sorted = [...LEADS].sort((a, b) => score(b) - score(a));

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Tag>Leads</Tag>
        <h1 className="display" style={{ fontSize: 42, marginTop: 14, marginBottom: 6 }}>À relancer</h1>
      </div>

      {/* KPIs */}
      <div className="leads-kpi" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: "var(--gap)" }}>
        {kpis.map(k => <KpiCard key={k.label} {...k} />)}
      </div>

      {/* Liste des priorités */}
      <div>
        <Panel style={{ padding: "8px 0" }}>
          {sorted.map((lead, i) => {
            const b = leadBadge(lead);
            const fu = lead.fuStade ? FU_TIMING.find(f => f.stade === lead.fuStade) : null;
            const days = daysSince(lead.dernierContact);
            return (
              <div key={lead.id} className="lead-row" onClick={() => onOpenConv(lead)}
                style={{ display: "flex", alignItems: "center", gap: 16, padding: "15px 24px", borderBottom: i < sorted.length - 1 ? "1px solid var(--stroke)" : "none", cursor: "pointer" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "var(--ink-1)" }}>{lead.prenom} {lead.nom}</div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 2, fontWeight: 500 }}>{lead.poste}</div>
                </div>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-2)", width: 54, textAlign: "center", flexShrink: 0 }}>{fu ? fu.label : "—"}</span>
                <span style={{ fontSize: 12.5, fontWeight: days >= 10 ? 800 : 600, color: days >= 10 ? "var(--alert)" : "var(--ink-2)", width: 48, textAlign: "center", flexShrink: 0 }}>J+{days}</span>
                <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase", color: b.color, width: 110, textAlign: "right", flexShrink: 0 }}>{b.label}</span>
              </div>
            );
          })}
        </Panel>
      </div>
    </div>
  );
}

// ─── PAGE 3 · CONVERSATIONS (3 colonnes · copilote NEPQ) ──────

function ConvListItem({ lead, active, onClick }) {
  const a = lead.analyse;
  const band = tempBand(a.temp);
  const last = lead.conv[lead.conv.length - 1];
  const snippet = (last.from === "pj" ? "Toi · " : "") + last.text.replace(/\n/g, " ");
  return (
    <div onClick={onClick} style={{
      padding: "13px 16px", cursor: "pointer",
      borderBottom: "1px solid var(--stroke)",
      borderLeft: `3px solid ${active ? band.color : "transparent"}`,
      background: active ? "var(--surface-2)" : "transparent",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink-1)", whiteSpace: "nowrap" }}>{lead.prenom} {lead.nom}</span>
        <span style={{ fontSize: 10.5, color: "var(--ink-3)", fontWeight: 600, flexShrink: 0 }}>J+{daysSince(lead.dm1)}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
        <span className="display" style={{ fontSize: 14, textTransform: "none", color: band.color }}>{a.temp}</span>
        <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: band.color }}>{band.label}</span>
      </div>
      <div style={{ fontSize: 11.5, color: "var(--ink-3)", fontWeight: 500, marginTop: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{snippet}</div>
    </div>
  );
}

function CoBlock({ label, children, accent }) {
  return (
    <div style={{ paddingTop: 14, marginTop: 14, borderTop: "1px solid var(--stroke)" }}>
      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.07em", textTransform: "uppercase", color: accent ? "var(--green-2)" : "var(--ink-3)", marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  );
}

function Screen3({ initialLead }) {
  const [sel, setSel] = React.useState(initialLead || LEADS[0]);
  const reco = (l) => l.analyse.reponses.find(r => r.reco) || l.analyse.reponses[0];
  const [draft, setDraft] = React.useState(reco(initialLead || LEADS[0]).text);
  const [toast, setToast] = React.useState(false);

  const a = sel.analyse;
  const band = tempBand(a.temp);
  const pick = (lead) => { setSel(lead); setDraft(reco(lead).text); };
  // Workflow 1 clic : copie auto → ouvre LinkedIn → toast discret
  const respond = (txt) => {
    try { navigator.clipboard?.writeText(txt); } catch {}
    window.open(liUrl(sel), "_blank", "noopener,noreferrer");
    setToast(true);
    clearTimeout(window.__liToast);
    window.__liToast = setTimeout(() => setToast(false), 2800);
  };

  return (
    <div className="conv3" style={{ display: "grid", gridTemplateColumns: "minmax(170px,220px) minmax(0,1fr) minmax(232px,304px)", height: "100vh" }}>

      {/* COLONNE 1 · liste */}
      <div style={{ borderRight: "1px solid var(--stroke)", overflowY: "auto", background: "var(--card)" }}>
        <div style={{ padding: "16px 16px 12px", position: "sticky", top: 0, background: "var(--card)", borderBottom: "1px solid var(--stroke)", zIndex: 1 }}>
          <Tag>Conversations · {LEADS.length}</Tag>
        </div>
        {LEADS.map(l => <ConvListItem key={l.id} lead={l} active={l.id === sel.id} onClick={() => pick(l)} />)}
      </div>

      {/* COLONNE 2 · conversation + réponses */}
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        <div style={{ padding: "15px 24px", borderBottom: "1px solid var(--stroke)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, background: "var(--card)" }}>
          <div>
            <div className="display" style={{ fontSize: 19, textTransform: "none" }}>{sel.prenom} {sel.nom}</div>
            <div style={{ fontSize: 11.5, color: "var(--ink-3)", fontWeight: 600, marginTop: 2 }}>{sel.poste} · {sel.nbEchanges} échanges</div>
          </div>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.07em", textTransform: "uppercase", color: band.color }}>{a.temp} · {band.label}</span>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "22px 24px", display: "flex", flexDirection: "column", gap: 10, background: "var(--bg)", minHeight: 0 }}>
          {sel.conv.map((msg, i) => {
            const mine = msg.from === "pj";
            return (
              <div key={i} style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "78%", padding: "10px 14px",
                  borderRadius: mine ? "16px 16px 5px 16px" : "16px 16px 16px 5px",
                  background: mine ? "var(--green)" : "var(--card)",
                  border: `1px solid ${mine ? "transparent" : "var(--stroke)"}`,
                  color: mine ? "var(--green-ink)" : "var(--ink-1)",
                  fontSize: 13, lineHeight: 1.55, whiteSpace: "pre-wrap", fontWeight: 500,
                }}>{msg.text}</div>
              </div>
            );
          })}
          {sel.statut === "FU_EN_ATTENTE" && (
            <div style={{ alignSelf: "center", padding: "7px 14px", background: "rgba(192,71,63,0.08)", border: "1px solid rgba(192,71,63,0.28)", borderRadius: 999, fontSize: 11, color: "var(--alert)", fontWeight: 700, marginTop: 4 }}>
              Silence depuis J+{daysSince(sel.dernierContact)}
            </div>
          )}
        </div>

        {/* réponses suggérées + composer */}
        <div style={{ borderTop: "1px solid var(--stroke)", padding: "16px 24px 18px", background: "var(--card)", maxHeight: "48%", overflowY: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <SectionTitle style={{ marginBottom: 0 }}>Réponses suggérées</SectionTitle>
            <span style={{ fontSize: 10.5, color: "var(--ink-3)", fontWeight: 600 }}>clique pour charger</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {a.reponses.map((r, i) => {
              const isActive = draft === r.text;
              return (
                <div key={i} onClick={() => setDraft(r.text)} className="reply-opt" style={{
                  cursor: "pointer", borderRadius: 16, padding: "11px 14px",
                  background: r.reco ? "var(--green)" : "var(--surface-2)",
                  border: `1.5px solid ${isActive ? (r.reco ? "var(--green-ink)" : "var(--ink-1)") : (r.reco ? "transparent" : "var(--stroke)")}`,
                  transition: "transform .15s ease, box-shadow .15s ease",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: "0.07em", textTransform: "uppercase", color: r.reco ? "var(--green-ink)" : "var(--ink-3)" }}>
                      Option {i + 1}{r.reco ? " · Recommandée" : ""}
                    </span>
                    <span onClick={(e) => { e.stopPropagation(); respond(r.text); }} style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.03em", textTransform: "uppercase", color: r.reco ? "var(--green-ink)" : "var(--ink-2)", cursor: "pointer" }}>Répondre&nbsp;↗</span>
                  </div>
                  <div style={{ fontSize: 13, lineHeight: 1.5, fontWeight: r.reco ? 600 : 500, color: r.reco ? "var(--green-ink)" : "var(--ink-1)" }}>{r.text}</div>
                </div>
              );
            })}
          </div>

          <div className="mac" style={{ marginTop: 12 }}>
            <div className="mac-bar">
              <MacDots size={11} />
              <span className="mac-title">message.linkedin</span>
            </div>
            <textarea value={draft} onChange={e => setDraft(e.target.value)}
              style={{ width: "100%", minHeight: 64, padding: 14, background: "var(--card)", border: "none", fontSize: 13, resize: "vertical", fontFamily: "inherit", lineHeight: 1.6, boxSizing: "border-box", color: "var(--ink-1)", outline: "none", display: "block", fontWeight: 500 }} />
          </div>
          <button onClick={() => respond(draft)} className="btn-primary lg" style={{ width: "100%", marginTop: 10, gap: 9 }}>
            Répondre sur LinkedIn <span style={{ fontSize: 16, lineHeight: 1 }}>↗</span>
          </button>
        </div>
      </div>

      {/* COLONNE 3 · copilote Jeremy Miner */}
      <div className="conv-cop" style={{ borderLeft: "1px solid var(--stroke)", background: "var(--surface-2)", overflowY: "auto", padding: "20px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <span style={{ width: 7, height: 7, borderRadius: 999, background: "var(--green)" }} />
          <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-2)" }}>Copilote · Jeremy Miner</span>
        </div>

        <div style={{ display: "flex", alignItems: "baseline", gap: 9, marginBottom: 10 }}>
          <span className="display" style={{ fontSize: 34, textTransform: "none", color: band.color }}>{a.temp}</span>
          <span style={{ fontSize: 13, color: "var(--ink-3)", fontWeight: 700 }}>/100</span>
          <span style={{ marginLeft: "auto", fontSize: 11.5, fontWeight: 800, letterSpacing: "0.07em", textTransform: "uppercase", color: band.color }}>{band.label}</span>
        </div>
        <div style={{ height: 7, background: "var(--bg-2)", borderRadius: 4, overflow: "hidden" }}>
          <div style={{ height: 7, width: `${a.temp}%`, background: band.color, borderRadius: 4, transition: "width .5s" }} />
        </div>
        {a.faible && <div style={{ fontSize: 10.5, color: "var(--ink-3)", fontWeight: 700, fontStyle: "italic", marginTop: 8 }}>signal faible · lecture provisoire</div>}

        <CoBlock label="Ce qu'il pense">
          <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink-1)", lineHeight: 1.45 }}>{a.pense}</div>
        </CoBlock>
        <CoBlock label="Ce qu'il ressent"><Field value={a.ressent} /></CoBlock>
        <CoBlock label="Obstacle"><Field value={a.obstacle} tone="alert" /></CoBlock>
        <CoBlock label="Déclencheur"><Field value={a.declencheur} tone="mint" /></CoBlock>
        <CoBlock label="Meilleure stratégie" accent>
          <div style={{ display: "inline-flex", fontSize: 13, fontWeight: 800, color: "var(--green-ink)", background: "var(--green)", padding: "6px 13px", borderRadius: 999, marginBottom: 8 }}>{a.strategie.choix}</div>
          <div style={{ fontSize: 12, color: "var(--ink-2)", fontWeight: 500, lineHeight: 1.5 }}>{a.strategie.pourquoi}</div>
        </CoBlock>
        <CoBlock label="Preuves">
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {a.preuves.map((p, i) => (
              <div key={i} style={{ display: "flex", gap: 8 }}>
                <span style={{ color: "var(--ink-3)", flexShrink: 0 }}>·</span>
                <span style={{ fontSize: 12, color: "var(--ink-2)", fontWeight: 500, lineHeight: 1.45 }}>{p}</span>
              </div>
            ))}
          </div>
        </CoBlock>
      </div>

      {/* Toast discret — confirmation copie + LinkedIn ouvert */}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 90, display: "flex", alignItems: "center", gap: 12, padding: "13px 18px", background: "var(--ink-1)", borderRadius: 16, boxShadow: "0 8px 24px -14px rgba(20,20,38,0.30)", animation: "toastIn .22s cubic-bezier(.2,.9,.3,1.4)" }}>
          <span style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--green)", color: "var(--green-ink)", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>✓</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>Réponse copiée — collez avec ⌘V</div>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>LinkedIn ouvert dans un nouvel onglet</div>
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { Screen2, Screen3, KpiCard });
