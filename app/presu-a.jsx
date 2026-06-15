// ─── PRÉ-SUASION · helpers + sections 1–3 ─────────────────────
// Composants partagés de la page (exportés en bas vers window).

// En-tête de carte : titre + description
function CardHead({ title, desc, right }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14, marginBottom: 20 }}>
      <div>
        <div className="display" style={{ fontSize: 20, textTransform: "none", letterSpacing: "-0.01em" }}>{title}</div>
        {desc && <div style={{ fontSize: 13, color: "var(--ink-2)", fontWeight: 600, marginTop: 7, maxWidth: 460, lineHeight: 1.5 }}>{desc}</div>}
      </div>
      {right}
    </div>
  );
}

// Eyebrow de bloc (numéro + libellé)
function PresuEyebrow({ children }) {
  return <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.09em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 12 }}>{children}</div>;
}

// Puce avec coche / croix / neutre
function Chip({ children, tone = "neutral" }) {
  const map = {
    ok: { bg: "rgba(122,249,165,0.20)", fg: "var(--green-2)", mark: "✓" },
    no: { bg: "rgba(192,71,63,0.10)", fg: "var(--alert)", mark: "✕" },
    neutral: { bg: "var(--surface-2)", fg: "var(--ink-1)", mark: null },
  };
  const c = map[tone];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 13px", borderRadius: 999, background: c.bg, fontSize: 12.5, fontWeight: 700, color: c.fg }}>
      {c.mark && <span style={{ fontSize: 11 }}>{c.mark}</span>}
      {children}
    </span>
  );
}

// Liste à puces discrètes
function PresuList({ items }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
      {items.map((it, i) => (
        <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--green-2)", marginTop: 8, flexShrink: 0 }} />
          <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink-1)", lineHeight: 1.45 }}>{it}</span>
        </div>
      ))}
    </div>
  );
}

// Barre de progression horizontale (personnalité)
function PresuBar({ label, val, accent }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-1)" }}>{label}</span>
        <span className="display" style={{ fontSize: 16, textTransform: "none", letterSpacing: "-0.02em", color: accent ? "var(--green-2)" : "var(--ink-2)" }}>{val}%</span>
      </div>
      <div style={{ height: 8, borderRadius: 999, background: "var(--surface-2)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${val}%`, borderRadius: 999, background: accent ? "var(--green)" : "var(--ink-3)", transition: "width .5s cubic-bezier(.4,0,.2,1)" }} />
      </div>
    </div>
  );
}

// ── SECTION 1 · BRIEFING EXÉCUTIF ─────────────────────────────
function PresuBriefing() {
  return (
    <Panel style={{ padding: "30px 32px" }}>
      <CardHead title="Briefing exécutif" desc="Résumé du prospect en moins de 30 secondes." />
      <div className="presu-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 26 }}>
        <div>
          <PresuEyebrow>Qui est-il ?</PresuEyebrow>
          <PresuList items={["Growth Freelancer", "8 ans d'expérience", "Paris", "Publie régulièrement sur LinkedIn", "Recrute actuellement"]} />
        </div>
        <div>
          <PresuEyebrow>Ce qui ressort</PresuEyebrow>
          <PresuList items={["Cherche à scaler son activité", "Sensible à la rentabilité", "Souhaite structurer ses process", "Veut réduire sa dépendance au temps vendu"]} />
        </div>
        <div>
          <PresuEyebrow>Objectif probable</PresuEyebrow>
          <div style={{ background: "rgba(122,249,165,0.14)", borderRadius: 16, padding: "18px 20px", height: "calc(100% - 0px)" }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: "var(--ink-1)", lineHeight: 1.5 }}>Développer son activité sans augmenter sa charge opérationnelle.</span>
          </div>
        </div>
      </div>
    </Panel>
  );
}

// ── SECTION 2 · MESSAGE WOW ───────────────────────────────────
function PresuMessage() {
  const msg = `Bonjour Thomas,

Merci pour la réservation.

J'ai pris quelques minutes pour regarder votre profil et vos dernières publications.

J'ai notamment remarqué votre positionnement autour de la croissance freelance ainsi que vos réflexions sur la structuration de l'activité.

J'ai préparé quelques pistes spécifiques à votre contexte pour notre échange.

À mardi.`;
  const [copied, setCopied] = React.useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(msg).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1600); });
  };
  const Btn = ({ children, primary, onClick }) => (
    <button onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 16, cursor: "pointer",
      fontFamily: "inherit", fontSize: 12.5, fontWeight: 700,
      border: primary ? "none" : "1px solid var(--stroke-2)",
      background: primary ? "var(--ink-1)" : "transparent",
      color: primary ? "#fff" : "var(--ink-1)", transition: "all .15s",
    }}>{children}</button>
  );
  return (
    <Panel style={{ padding: "30px 32px" }}>
      <CardHead title="Message personnalisé avant rendez-vous" desc="Envoyez un message qui donne l'impression d'une préparation manuelle." />
      <div style={{ background: "var(--surface-2)", borderRadius: 16, padding: "24px 26px", whiteSpace: "pre-wrap", fontSize: 14.5, fontWeight: 500, color: "var(--ink-1)", lineHeight: 1.7 }}>{msg}</div>
      <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
        <Btn primary onClick={copy}>{copied ? "✓ Copié" : "Copier"}</Btn>
        <Btn>Envoyer sur LinkedIn</Btn>
        <Btn>Envoyer par email</Btn>
      </div>
    </Panel>
  );
}

// ── SECTION 3 · RESSOURCES RECOMMANDÉES ───────────────────────
function ResourceCard({ kind, title, meta, why }) {
  return (
    <Panel style={{ padding: "24px 26px", display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <Tag variant="green">{kind}</Tag>
        {meta && <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-3)" }}>{meta}</span>}
      </div>
      <div className="display" style={{ fontSize: 18, textTransform: "none", letterSpacing: "-0.015em", lineHeight: 1.25 }}>{title}</div>
      <div style={{ marginTop: 2 }}>
        <PresuEyebrow>Pourquoi cette recommandation</PresuEyebrow>
        {Array.isArray(why)
          ? <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>{why.map((w, i) => <Chip key={i}>{w}</Chip>)}</div>
          : <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink-1)", lineHeight: 1.5 }}>{why}</span>}
      </div>
    </Panel>
  );
}

function PresuResources() {
  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div className="display" style={{ fontSize: 20, textTransform: "none", letterSpacing: "-0.01em" }}>Ressources recommandées</div>
        <div style={{ fontSize: 13, color: "var(--ink-2)", fontWeight: 600, marginTop: 7 }}>Contenus les plus susceptibles de créer de la conviction avant le call.</div>
      </div>
      <div className="presu-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <ResourceCard kind="Vidéo YouTube" meta="12 min" title="Pourquoi les consultants IA restent bloqués à 10k/mois" why={["croissance", "productivité", "structuration"]} />
        <ResourceCard kind="Étude de cas" meta="+47k€ · 90 jours" title="Consultant IA · +47k€ en 90 jours" why="Même profil et mêmes enjeux." />
      </div>
    </div>
  );
}

Object.assign(window, { CardHead, PresuEyebrow, Chip, PresuList, PresuBar, PresuBriefing, PresuMessage, PresuResources });
