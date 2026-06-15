// ─── PRÉ-SUASION · sections 4–8 ───────────────────────────────

// ── SECTION 4 · CARTE INFLUENCE ───────────────────────────────
function PresuInfluence() {
  return (
    <Panel style={{ padding: "30px 32px" }}>
      <CardHead title="Carte Influence" desc="Comment communiquer avec ce prospect." />
      <div className="presu-2" style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 30 }}>
        <div>
          <PresuEyebrow>Personnalité dominante</PresuEyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <PresuBar label="Analytique" val={78} accent />
            <PresuBar label="Relationnel" val={12} />
            <PresuBar label="Visionnaire" val={10} />
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div>
            <PresuEyebrow>Communication recommandée</PresuEyebrow>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {["ROI", "chiffres", "benchmark", "preuves"].map(c => <Chip key={c} tone="ok">{c}</Chip>)}
            </div>
          </div>
          <div>
            <PresuEyebrow>À éviter</PresuEyebrow>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {["storytelling long", "concepts vagues", "discours inspirationnel"].map(c => <Chip key={c} tone="no">{c}</Chip>)}
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}

// ── SECTION 5 · DÉCLENCHEURS PSYCHOLOGIQUES ───────────────────
function PresuTriggers() {
  return (
    <Panel style={{ padding: "30px 32px" }}>
      <CardHead title="Déclencheurs détectés" desc="Les leviers de conviction repérés dans son discours et ses publications." />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 26 }}>
        {["efficacité", "gain de temps", "crédibilité", "croissance", "autorité"].map(c => <Chip key={c} tone="ok">{c}</Chip>)}
      </div>
      <PresuEyebrow>Preuves recommandées</PresuEyebrow>
      <PresuList items={["Étude de cas Cabinet X", "Témoignage Consultant Y", "Vidéo Z"]} />
    </Panel>
  );
}

// ── SECTION 6 · OBJECTIONS PROBABLES ──────────────────────────
function ObjectionRow({ pct, quote, answer }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "64px 1fr", gap: 18, alignItems: "start", padding: "18px 0", borderTop: "1px solid var(--stroke)" }}>
      <span className="display" style={{ fontSize: 30, textTransform: "none", letterSpacing: "-0.03em", color: "var(--ink-1)" }}>{pct}%</span>
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ink-1)", lineHeight: 1.4 }}>« {quote} »</div>
        <div style={{ display: "flex", gap: 9, marginTop: 10, alignItems: "flex-start" }}>
          <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--green-2)", marginTop: 3, flexShrink: 0 }}>Réponse</span>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink-2)", lineHeight: 1.5 }}>{answer}</span>
        </div>
      </div>
    </div>
  );
}

function PresuObjections() {
  return (
    <Panel style={{ padding: "30px 32px" }}>
      <CardHead title="Objections probables" desc="Anticipez les freins — et la réponse adaptée à son profil analytique." />
      <div>
        <ObjectionRow pct={65} quote="Je fais déjà quelque chose de similaire"
          answer="Comparez les résultats, pas l'intention : demandez ses chiffres actuels et montrez l'écart concret avec un cas au profil identique." />
        <ObjectionRow pct={21} quote="Je manque de temps"
          answer="Reformulez le temps en coût : chaque semaine sans structuration, c'est X€ de marge non capturée. La mise en place se mesure en heures, pas en semaines." />
        <ObjectionRow pct={14} quote="Ce n'est pas ma priorité"
          answer="Reliez-le à son objectif déclaré (scaler sans plus travailler) : sans ce levier, le plafond opérationnel reste le même dans 6 mois." />
      </div>
    </Panel>
  );
}

// ── SECTION 7 · PLAN DE CALL ──────────────────────────────────
function PresuPlan() {
  const steps = [
    "Comprendre le modèle actuel",
    "Identifier le principal goulot d'étranglement",
    "Montrer l'étude de cas la plus pertinente",
    "Quantifier le coût de l'inaction",
    "Construire la prochaine étape",
  ];
  return (
    <Panel style={{ padding: "30px 32px" }}>
      <CardHead title="Plan de rendez-vous" desc="La séquence optimale pour faire avancer la décision." />
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 0", borderBottom: i < steps.length - 1 ? "1px solid var(--stroke)" : "none" }}>
            <span style={{ width: 30, height: 30, borderRadius: 16, background: "var(--surface-2)", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 13, fontWeight: 800, color: "var(--green-2)" }}>{i + 1}</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: "var(--ink-1)" }}>{s}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

// ── SECTION 8 · SYNTHÈSE FINALE ───────────────────────────────
function PresuSynthese() {
  return (
    <Panel style={{ padding: "36px 38px", background: "rgba(122,249,165,0.14)", border: "1px solid rgba(122,249,165,0.4)" }}>
      <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.09em", textTransform: "uppercase", color: "var(--green-2)", marginBottom: 16 }}>Ce qu'il faut retenir</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 760 }}>
        <p style={{ margin: 0, fontSize: 21, fontWeight: 700, color: "var(--ink-1)", lineHeight: 1.45, letterSpacing: "-0.01em" }}>Thomas semble déjà convaincu qu'il a un problème. Il n'est pas encore convaincu qu'un changement immédiat est nécessaire.</p>
        <p style={{ margin: 0, fontSize: 15.5, fontWeight: 600, color: "var(--ink-2)", lineHeight: 1.55 }}>La stratégie optimale consiste à démontrer le coût de l'inaction avec des exemples concrets et des résultats comparables.</p>
      </div>
    </Panel>
  );
}

Object.assign(window, { PresuInfluence, PresuTriggers, PresuObjections, PresuPlan, PresuSynthese });
