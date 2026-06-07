// ─── DONNÉES MOCK + CONSTANTES ────────────────────────────────
const STATS_30J = [
  { date: "01/05", dm: 8, rep: 18 }, { date: "02/05", dm: 0, rep: 0 },
  { date: "03/05", dm: 0, rep: 0 }, { date: "04/05", dm: 0, rep: 0 },
  { date: "05/05", dm: 12, rep: 28 }, { date: "06/05", dm: 18, rep: 42 },
  { date: "07/05", dm: 22, rep: 55 }, { date: "08/05", dm: 15, rep: 38 },
  { date: "09/05", dm: 20, rep: 47 }, { date: "10/05", dm: 0, rep: 0 },
  { date: "11/05", dm: 0, rep: 0 }, { date: "12/05", dm: 25, rep: 61 },
  { date: "13/05", dm: 19, rep: 44 }, { date: "14/05", dm: 23, rep: 58 },
  { date: "15/05", dm: 16, rep: 39 }, { date: "16/05", dm: 21, rep: 52 },
  { date: "17/05", dm: 0, rep: 8 }, { date: "18/05", dm: 0, rep: 5 },
  { date: "19/05", dm: 14, rep: 34 }, { date: "20/05", dm: 0, rep: 12 },
  { date: "21/05", dm: 8, rep: 19 }, { date: "22/05", dm: 26, rep: 63 },
  { date: "23/05", dm: 18, rep: 44 }, { date: "24/05", dm: 0, rep: 5 },
  { date: "25/05", dm: 0, rep: 3 }, { date: "26/05", dm: 22, rep: 54 },
  { date: "27/05", dm: 17, rep: 41 }, { date: "28/05", dm: 15, rep: 37 },
  { date: "29/05", dm: 14, rep: 52 }, { date: "30/05", dm: 0, rep: 0 },
];

const TODAY = { newDM: 14, fu: 89, looms: 2, reponses: 52, propCall: 8, bookes: 1, closes: 0 };

// ─── PARAMÈTRES PRÉ-SUASION (objectifs auto, définis en réglages) ─
const PRESU_DEFAULTS = { objectif: 24000, panier: 2500, closing: 33 };
function loadPresu() { try { return { ...PRESU_DEFAULTS, ...JSON.parse(localStorage.getItem("presu_settings") || "{}") }; } catch { return { ...PRESU_DEFAULTS }; } }
function savePresu(s) { try { localStorage.setItem("presu_settings", JSON.stringify(s)); } catch {} try { window.dispatchEvent(new CustomEvent("presu-change", { detail: s })); } catch {} }
// Objectifs d'activité dérivés de l'objectif € (jamais demandés dans le dashboard).
// Taux benchmark « sains » → la cible représente le rythme à tenir.
function objectivesFor(range, s) {
  const f = range / 30;
  const periodObj = (s.objectif || 24000) * f;
  const panier = Math.max(1, s.panier || 2500);
  const closing = Math.max(1, s.closing || 33) / 100;
  const clients = Math.max(1, Math.ceil(periodObj / panier));
  const callsAcc = Math.ceil(clients / closing);
  const callsProp = Math.ceil(callsAcc / 0.5);
  const reponses = Math.ceil(callsProp / 0.28);
  const dm = Math.ceil(reponses / 0.55);
  const fu = Math.ceil(dm * 0.62);
  return { clients, callsAcc, callsProp, reponses, dm, fu, periodObj, panier, closing };
}

const daysSince = (d) => Math.floor((Date.now() - d.getTime()) / 86400000);

// URL LinkedIn du prospect (profil / conversation). Recherche par nom = lien réel, jamais 404.
const liUrl = (lead) => lead.li || `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(lead.prenom + " " + lead.nom)}`;

const LEADS = [
  {
    id: 1, prenom: "Thomas", nom: "D.", poste: "Growth Freelance", score: 3,
    dm1: new Date(Date.now() - 12 * 86400000), dernierContact: new Date(Date.now() - 12 * 86400000),
    statut: "FU_EN_ATTENTE", fuStade: 3, nbEchanges: 2,
    icpRaison: "Freelance explicite + domaine Growth = T1 parfait",
    analyse: {
      temp: 38, profil: "senior",
      pense: "Le concept l'intrigue, mais rien ne l'oblige à répondre maintenant.",
      ressent: "Curieux",
      obstacle: "Pas prioritaire",
      declencheur: "Étude de cas",
      preuves: ["« Oui toujours ! Tu fais quoi de ton côté ? »", "Silence depuis 12 j après une question ouverte"],
      strategie: { choix: "Sortir de la conversation", pourquoi: "Intérêt initial puis silence prolongé : un retrait élégant relance plus qu'une n-ième relance." },
      reponses: [
        { reco: true, text: "Hello Thomas, je ne sais pas si je relance inutilement 😇. Je ferme le sujet si ce n'est pas prioritaire pour toi en ce moment." },
        { text: "Toujours d'actualité côté missions, ou pas du tout ?" },
        { text: "Si je me trompe, dis-le moi franchement — sinon je n'insiste pas." },
      ],
    },
    conv: [
      { from: "pj", text: "Salut Thomas, top ce positionnement growth freelance. Tu vends toujours tes services ?", date: new Date(Date.now() - 12 * 86400000) },
      { from: "lead", text: "Oui toujours ! Tu fais quoi de ton côté ?", date: new Date(Date.now() - 11 * 86400000) },
      { from: "pj", text: "Je travaille avec des consultants IA qui veulent sortir du temps vendu. Tu m'autorises à te poser une question ?", date: new Date(Date.now() - 11 * 86400000) },
    ]
  },
  {
    id: 2, prenom: "Marie", nom: "L.", poste: "Consultant IA indépendante", score: 3,
    dm1: new Date(Date.now() - 3 * 86400000), dernierContact: new Date(Date.now() - 3 * 86400000),
    statut: "FU_EN_ATTENTE", fuStade: 1, nbEchanges: 1,
    icpRaison: "Consultant IA + indépendante = sweet spot absolu",
    analyse: {
      temp: 24, profil: "senior", faible: true,
      pense: "Signal faible — un seul message envoyé, aucune réponse pour étayer une lecture.",
      ressent: "Curieux",
      obstacle: "Pas prioritaire",
      declencheur: "Étude de cas",
      preuves: ["Aucune réponse à ce stade — lecture provisoire"],
      strategie: { choix: "Continuer à creuser", pourquoi: "Aucun problème verbalisé : uniquement des questions de diagnostic, jamais d'explication." },
      reponses: [
        { reco: true, text: "Pour voir si c'est pertinent dans ton cas, tu m'autorises à te poser une question ?" },
        { text: "Tu vends toujours tes services en direct, aujourd'hui ?" },
        { text: "Qu'est-ce qui est le plus difficile depuis ton passage en indépendante ?" },
      ],
    },
    conv: [
      { from: "pj", text: "Salut Marie, top cette expertise IA appliquée. Tu vends toujours tes services ?", date: new Date(Date.now() - 3 * 86400000) },
    ]
  },
  {
    id: 3, prenom: "Axel", nom: "R.", poste: "Fondateur SaaS IA", score: 2,
    dm1: new Date(Date.now() - 7 * 86400000), dernierContact: new Date(Date.now() - 5 * 86400000),
    statut: "EN_COURS", fuStade: null, nbEchanges: 4,
    icpRaison: "Founder + SaaS IA = T2, taille boîte inconnue",
    analyse: {
      temp: 48, profil: "senior",
      pense: "Il reconnaît le problème mais le minimise : 6/10, donc supportable à ses yeux.",
      ressent: "Curieux",
      obstacle: "Pas prioritaire",
      declencheur: "Comparaison avant/après",
      preuves: ["« Je dirais 6/10 »", "« je vends beaucoup de mon temps »", "« c'est pas toujours régulier »"],
      strategie: { choix: "Recadrer le problème", pourquoi: "Problème tiède (6/10) : créer le contraste entre aujourd'hui et l'objectif avant toute méthode." },
      reponses: [
        { reco: true, text: "Qu'est-ce qui t'empêche d'être à 10/10 pour signer les clients que tu aimerais vraiment ?" },
        { text: "Qu'est-ce qui se passerait si le modèle restait exactement le même dans les 12 prochains mois ?" },
        { text: "À quoi correspondent les 4 points manquants entre ton 6 et un 10 ?" },
      ],
    },
    conv: [
      { from: "pj", text: "Salut Axel, très bon positionnement sur les agents IA. Tu vends toujours tes services ?", date: new Date(Date.now() - 7 * 86400000) },
      { from: "lead", text: "Oui absolument, on est en pleine croissance !", date: new Date(Date.now() - 6 * 86400000) },
      { from: "pj", text: "Sur une échelle de 1 à 10, ta capacité à signer les clients que tu aimerais vraiment avoir ?", date: new Date(Date.now() - 5 * 86400000) },
      { from: "lead", text: "Je dirais 6/10. J'ai des clients mais c'est pas toujours régulier et je vends beaucoup de mon temps.", date: new Date(Date.now() - 4 * 86400000) },
    ]
  },
  {
    id: 4, prenom: "Julien", nom: "B.", poste: "Automation Consultant", score: 3,
    dm1: new Date(Date.now() - 5 * 86400000), dernierContact: new Date(Date.now() - 1 * 86400000),
    statut: "CALL_PROPOSE", fuStade: null, nbEchanges: 6,
    icpRaison: "Automation + consultant = T1. Pipeline irrégulier confirmé.",
    analyse: {
      temp: 76, profil: "senior",
      pense: "Il a nommé son vrai problème : pas de système, dépendance au réseau.",
      ressent: "Frustré",
      obstacle: "Manque de confiance",
      declencheur: "Étude de cas",
      preuves: ["« Honnêtement 5/10 »", "« des missions mais très irrégulières »", "« Pas de système vraiment »"],
      strategie: { choix: "Recadrer le problème", pourquoi: "Problème clair mais méthode non demandée : valider l'enjeu avant de proposer quoi que ce soit." },
      reponses: [
        { reco: true, text: "Si je comprends bien, le vrai enjeu n'est pas la compétence mais l'absence d'un système qui sécurise tes contrats en parallèle des missions. C'est bien ça ?" },
        { text: "Qu'est-ce qui se passerait si rien ne change dans les 12 prochains mois ?" },
        { text: "Je peux te partager ce que je mettrais en place dans ton contexte ?" },
      ],
    },
    conv: [
      { from: "pj", text: "Salut Julien, top ce focus automation. Tu vends toujours tes services ?", date: new Date(Date.now() - 5 * 86400000) },
      { from: "lead", text: "Oui ! Curieux d'en savoir plus.", date: new Date(Date.now() - 4 * 86400000) },
      { from: "pj", text: "Sur une échelle de 1 à 10, ta capacité à signer les clients que tu aimerais vraiment avoir ?\n10 = clients réguliers, facturés chers et sans effort\n1 = source de frustration importante", date: new Date(Date.now() - 3 * 86400000) },
      { from: "lead", text: "Honnêtement 5/10. J'ai des missions mais très irrégulières, je dépends encore beaucoup de mon réseau.", date: new Date(Date.now() - 2 * 86400000) },
      { from: "pj", text: "Je vois. Qu'est-ce qui t'empêche d'être à 10/10 selon toi ?", date: new Date(Date.now() - 2 * 86400000) },
      { from: "lead", text: "Pas de système vraiment. Je prospecte par à-coups quand j'ai le temps mais c'est pas structuré.", date: new Date(Date.now() - 1 * 86400000) },
    ]
  },
  {
    id: 5, prenom: "Sophie", nom: "M.", poste: "Data Scientist Freelance", score: 3,
    dm1: new Date(Date.now() - 1 * 86400000), dernierContact: new Date(Date.now() - 1 * 86400000),
    statut: "FU_EN_ATTENTE", fuStade: 1, nbEchanges: 1,
    icpRaison: "Data + Freelance = T1 évident",
    analyse: {
      temp: 22, profil: "senior", faible: true,
      pense: "Trop tôt — message envoyé, aucune réponse pour étayer une lecture.",
      ressent: "Curieux",
      obstacle: "Pas prioritaire",
      declencheur: "Étude de cas",
      preuves: ["Pas encore de réponse"],
      strategie: { choix: "Continuer à creuser", pourquoi: "Aucun problème verbalisé : rester en diagnostic, ne rien expliquer." },
      reponses: [
        { reco: true, text: "Tu vends toujours tes services en direct, aujourd'hui ?" },
        { text: "Qu'est-ce qui est le plus difficile depuis ton passage en freelance ?" },
        { text: "Tu as l'impression de perdre le plus d'argent où, aujourd'hui ?" },
      ],
    },
    conv: [
      { from: "pj", text: "Salut Sophie, top ce parcours data science en freelance. Tu vends toujours tes services ?", date: new Date(Date.now() - 1 * 86400000) },
    ]
  },
];

const FU_MESSAGES = {
  1: (p) => `Bonjour ${p}, vous avez bien reçu mon message ?`,
  2: (p) => `${p} ?`,
  3: (p) => `Bonjour ${p}, j'ai accompagné un consultant comme vous à sécuriser des contrats premium grâce à une approche spécifique. Est-ce que cela vous intéresserait que je vous envoie une courte vidéo qui explique comment cela fonctionne ?`,
  4: (p) => `Bonjour ${p}, je ne sais pas si je relance inutilement 😇 Je ferme le sujet si ce n'est pas une priorité pour le moment.`,
};

const FU_TIMING = [
  { stade: 1, label: "FU1", delai: "24 h" },
  { stade: 2, label: "FU2", delai: "36 h" },
  { stade: 3, label: "FU3", delai: "48 h" },
  { stade: 4, label: "FU4", delai: "48 h" },
];

// Statuts adaptés au thème clair (DA lavande/vert) :
//   vert = positif/avance · ambre/rouge = alerte · reste = neutre
const STATUT = {
  FU_EN_ATTENTE: { label: "FU en attente", tone: "warn" },
  EN_COURS:      { label: "En cours",      tone: "neutral" },
  CALL_PROPOSE:  { label: "Call proposé",  tone: "accent" },
  CALL_BOOKE:    { label: "Call booké",    tone: "good" },
  CLOSE:         { label: "Closé",         tone: "good" },
  FROID:         { label: "Froid",         tone: "bad" },
};

// Résout un "tone" en couleurs concrètes — palette mono + menthe, sans couleur parasite.
function toneColors(tone) {
  switch (tone) {
    case "good":    return { fg: "var(--green-2)", bg: "rgba(122,249,165,0.22)", bd: "rgba(122,249,165,0.55)" };
    case "accent":  return { fg: "#FFFFFF",         bg: "var(--ink-1)",           bd: "var(--ink-1)" };
    case "warn":    return { fg: "var(--ink-1)",    bg: "var(--surface-2)",       bd: "var(--stroke-2)" };
    case "bad":     return { fg: "var(--alert)",    bg: "rgba(192,71,63,0.09)",   bd: "rgba(192,71,63,0.30)" };
    default:        return { fg: "var(--ink-2)",    bg: "var(--surface-2)",       bd: "var(--stroke-2)" };
  }
}

// ─── ANALYSE PSYCHO (Écran Conversation) ─────────────────────
function analyzeConv(conv) {
  const leadMsgs = conv.filter(m => m.from === "lead").map(m => m.text.toLowerCase());
  const all = leadMsgs.join(" ");
  const signals = [];
  let chaleur = 0;

  if (all.includes("oui") || all.includes("absolument") || all.includes("curieux") || all.includes("intéressé")) {
    signals.push({ label: "Intérêt verbal confirmé", tone: "good" });
    chaleur += 2;
  }
  if (/\d\/10/.test(all)) {
    const match = all.match(/(\d)\/10/);
    if (match) {
      const note = parseInt(match[1]);
      signals.push({ label: `Auto-évaluation : ${note}/10`, tone: note <= 6 ? "warn" : "good" });
      if (note <= 6) chaleur += 3;
    }
  }
  if (all.includes("irrégulier") || all.includes("réseau") || all.includes("pas structuré") || all.includes("temps mort")) {
    signals.push({ label: "Pain pipeline confirmé", tone: "bad" });
    chaleur += 3;
  }
  if (all.includes("temps") || all.includes("tjm") || all.includes("delivery")) {
    signals.push({ label: "Pain TJM / temps détecté", tone: "warn" });
    chaleur += 2;
  }
  if (all.includes("merci") && leadMsgs.length === 1) {
    signals.push({ label: "Réponse courte — faible engagement", tone: "neutral" });
    chaleur -= 1;
  }
  chaleur = Math.max(0, Math.min(10, chaleur));

  const etape = (() => {
    const last = conv[conv.length - 1];
    if (last.from === "pj" && conv.filter(m => m.from === "lead").length > 0) return "En attente de réponse";
    if (all.includes("pas structuré") || all.includes("irrégulier")) return "Prêt pour la proposition";
    if (/\d\/10/.test(all)) return "Qualification en cours";
    if (all.includes("curieux") || all.includes("intéressé")) return "Intérêt confirmé — qualifier";
    return "Début de conversation";
  })();

  const nextAction = (() => {
    if (etape === "Prêt pour la proposition") return "Propose le call iClosed maintenant";
    if (etape === "Qualification en cours") return "Creuse le pain : « Qu'est-ce qui t'empêche d'être à 10/10 ? »";
    if (etape === "Intérêt confirmé — qualifier") return "Pose la question 1-10";
    if (etape === "En attente de réponse") return "Attendre. FU si pas de réponse sous 24h.";
    return "Continuer la conversation";
  })();

  return { signals, chaleur, etape, nextAction };
}

// ─── BRIEFING DU JOUR (voix : COO brutal / mentor ROI) ────────
// Reco personnalisée de Claude — terse, métriques d'abord.
const BRIEFING = {
  dateLabel: "Samedi 6 juin",
  goal: "500 K€",
  countdown: "J-135",
  deadline: "19 oct 2026",

  action: {
    pct: 80,
    title: "Relance Thomas D. + Julien B.",
    meta: "~10 K€ bloqués · call jamais proposé · 4 min",
  },

  // Directives courtes (label + une phrase brève)
  directives: [
    { tag: "Bottleneck", text: "Closing, pas acquisition. 4 leads T1 dorment +7j." },
    { tag: "Bruit", text: "2 Looms à « refaire » = pseudo-productivité. Stop." },
    { tag: "Priorité", text: "8 calls à proposer avant 18 h." },
  ],

  faith: "Col 3:23 — fais-le comme pour le Seigneur. Pas de dispersion.",

  signals: [
    { tag: "Tracking", tone: "good", text: "Taux réponse 60 % / 30j — au-dessus objectif." },
    { tag: "Signal", tone: "warn", text: "Marie L. a répondu <24 h. Qualifie avant refroidissement." },
  ],
};

// Bande de température (0-100) → label + couleur (mono + menthe)
function tempBand(t) {
  if (t <= 20) return { label: "Froid", color: "var(--ink-3)" };
  if (t <= 40) return { label: "Curieux", color: "var(--ink-2)" };
  if (t <= 60) return { label: "Engagé", color: "var(--ink-1)" };
  if (t <= 80) return { label: "Chaud", color: "var(--green-2)" };
  return { label: "Prêt", color: "var(--green-2)" };
}

// ─── ANALYSE GLOBALE DU MARCHÉ (patterns récurrents) ──────────
const MARKET = {
  periode: "30 derniers jours · 5 conversations",
  objections: [
    { label: "Pas prioritaire malgré le problème", pct: 42 },
    { label: "« Est-ce que ça marche dans mon cas ? »", pct: 28 },
    { label: "Manque de preuve adaptée", pct: 18 },
  ],
  emotions: [
    { label: "Curieux", pct: 46 },
    { label: "Frustré", pct: 22 },
    { label: "Sceptique", pct: 18 },
  ],
  blocages: [
    { label: "Pas prioritaire", pct: 40 },
    { label: "Manque de confiance", pct: 30 },
    { label: "ROI flou", pct: 18 },
  ],
  declencheurs: [
    { label: "Étude de cas", pct: 48 },
    { label: "Comparaison avant/après", pct: 26 },
    { label: "Preuve ROI", pct: 16 },
  ],
  pense: "Le problème est reconnu, rarement vécu comme urgent.",
  objectionDominante: "Pas prioritaire — l'irrégularité du pipeline est tolérée.",
  croyance: "« Je peux m'en sortir seul avec mon réseau. »",
  message: "Montrer le coût de l'inaction + une étude de cas d'un profil identique.",
};

// ─── SÉRIE 90 JOURS + MÉTRIQUES PAR PÉRIODE ───────────────────
// 90 jours générés à partir du motif 30j, avec une légère croissance vers aujourd'hui.
const STATS_90 = (() => {
  const base = STATS_30J.map(d => ({ dm: d.dm, rep: d.rep }));
  const out = [];
  for (let k = 2; k >= 0; k--) {
    const f = 1 - k * 0.14;
    base.forEach(d => out.push({ dm: Math.round(d.dm * f), rep: Math.round(d.rep * f) }));
  }
  return out; // 90 entrées, plus récentes = plus hautes
})();

// ─── DATES RÉELLES (axe Activité) ─────────────────────────────
const startOfToday = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
const dateForIndexInRange = (i, range) => {
  const d = startOfToday();
  d.setDate(d.getDate() - (range - 1 - i));
  return d;
};
// "mardi 19 juin"
const fmtDateFr = (d) => {
  const s = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" }).format(d);
  return s.charAt(0).toUpperCase() + s.slice(1);
};
// "19 juin"
const fmtDayMonth = (d) => new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(d).replace(".", "");

// Agrège les métriques sur la période — funnel cohérent dérivé du volume de DM.
function metricsFor(range) {
  if (range === 1) {
    // « Aujourd'hui » — snapshot du jour (jamais zéro pour rester lisible).
    const dm = 14, rep = 9, prop = 4, acc = 1, cli = 0;
    const funnel = [
      { label: "DM envoyés", val: dm }, { label: "Réponses", val: rep },
      { label: "Calls proposés", val: prop }, { label: "Calls acceptés", val: acc },
      { label: "Clients signés", val: cli },
    ];
    return { data: [{ dm, rep }], dates: [startOfToday()], dm, rep, prop, acc, cli, funnel, today: true };
  }
  const data = STATS_90.slice(-range);
  const dates = data.map((_, i) => dateForIndexInRange(i, range));
  const dm = data.reduce((s, d) => s + d.dm, 0);
  const rep = Math.round(dm * 0.606);
  const prop = Math.round(dm * 0.256);
  const acc = Math.round(dm * 0.0237);
  const cli = Math.max(range >= 30 ? 1 : 0, Math.round(acc * 0.05));
  const funnel = [
    { label: "DM envoyés", val: dm },
    { label: "Réponses", val: rep },
    { label: "Calls proposés", val: prop },
    { label: "Calls acceptés", val: acc },
    { label: "Clients signés", val: cli },
  ];
  return { data, dates, dm, rep, prop, acc, cli, funnel };
}

// ─── SECTION 7 · TEMPÉRATURE DU MARCHÉ (sunburst dynamique) ───
const TEMP_CATS = [
  { key: "prets",   label: "Prêts",   color: "var(--green-2)" },
  { key: "chauds",  label: "Chauds",  color: "var(--green)" },
  { key: "engages", label: "Engagés", color: "var(--green-soft)" },
  { key: "curieux", label: "Curieux", color: "#9AA0AD" },
  { key: "froids",  label: "Froids",  color: "#C2C6CF" },
];
// Le filtre pilote la répartition : 7j = marché chaud · 90j = marché plus froid.
function temperatureFor(range) {
  const base = ({
    1:  [11, 24, 31, 23, 11],
    7:  [10, 23, 30, 25, 12],
    30: [6, 16, 27, 31, 20],
    90: [4, 11, 23, 34, 28],
  })[range] || [6, 16, 27, 31, 20];
  const cats = TEMP_CATS.map((c, i) => ({ ...c, pct: base[i] }));
  const avance = base[0] + base[1] + base[2];
  const stagne = base[3] + base[4];
  const groups = [
    { key: "avance", label: "Avance", color: "var(--green-2)", pct: avance, cats: cats.slice(0, 3) },
    { key: "stagne", label: "Stagne", color: "#9AA0AD",        pct: stagne, cats: cats.slice(3) },
  ];
  // Tendance vs fenêtre plus longue : la part « Avance » monte-t-elle ?
  const longer = ({ 1: 55, 7: 52, 30: 49, 90: 38 })[range] ?? 49;
  const prev = ({ 1: 52, 7: 49, 30: 38, 90: 38 })[range] ?? 38;
  const delta = avance - prev;
  return { cats, groups, avance, stagne, trend: delta >= 0 ? "chauffe" : "refroidit", delta };
}

// ─── SECTION 4 · HEATMAP (jour × heure) ───────────────────────
const HEAT_DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const HEAT_HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
// metric: "rep" (réponses) | "calls" (calls acceptés)
function heatFor(metric) {
  const peak = { 8: 0.72, 9: 1.0, 10: 0.92, 11: 0.7, 12: 0.34, 13: 0.3, 14: 0.55, 15: 0.6, 16: 0.5, 17: 0.62, 18: 0.86, 19: 0.7, 20: 0.4 };
  const dayW = [0.95, 1.0, 0.98, 0.9, 0.66, 0.22, 0.16]; // Lun..Dim
  const scale = metric === "calls" ? 7 : 26;
  const grid = HEAT_DAYS.map((_, di) => HEAT_HOURS.map((h) => {
    const noise = (((di * 31 + h * 17) % 11) / 22) - 0.1;
    const v = Math.max(0, dayW[di] * (peak[h] || 0.3) * (1 + noise));
    return v;
  }));
  const mx = Math.max(...grid.flat());
  const vals = grid.map(row => row.map(v => Math.round((v / mx) * scale)));
  // Meilleure fenêtre (top cellule)
  let best = { d: 0, h: 0, v: -1 };
  vals.forEach((row, di) => row.forEach((v, hi) => { if (v > best.v) best = { d: di, h: hi, v }; }));
  return { vals, best: { day: HEAT_DAYS[best.d], hour: HEAT_HOURS[best.h], v: best.v }, max: scale };
}

// ─── INTELLIGENCE DE PRÉ-SUASION ──────────────────────────────
// Funnel PSYCHOLOGIQUE (≠ funnel commercial) : la montée en température.
// Froids → Curieux → Engagés → Chauds → Prêts → Call accepté → Client
function psyFunnelFor(range) {
  const r = range === 1 ? 7 : range;          // « Aujourd'hui » ≈ semaine
  const f = r / 30;
  const base = [
    { key: "froids",  label: "Froids",       n: 560 },
    { key: "curieux", label: "Curieux",      n: 330 },
    { key: "engages", label: "Engagés",      n: 184 },
    { key: "chauds",  label: "Chauds",       n: 98 },
    { key: "prets",   label: "Prêts",        n: 46 },
    { key: "call",    label: "Call accepté", n: 22 },
    { key: "client",  label: "Client",       n: 6 },
  ];
  const timeFromPrev = [null, 1.8, 3.4, 5.2, 2.1, 1.5, 4.8]; // jours moyens entre étapes
  const varia = [4, 9, 12, 6, 18, 3, 1];                      // variation vs période précédente (%)
  const top = Math.max(1, Math.round(base[0].n * f));
  return base.map((s, i) => {
    const val = Math.max(i >= 5 ? 1 : 3, Math.round(s.n * f));
    return { ...s, val, pct: Math.round((s.n / base[0].n) * 100), variation: varia[i], timeFromPrev: timeFromPrev[i] };
  });
}

// TIMING / VELOCITY DE PRÉ-SUASION — vitesse de conditionnement
const TIMING = {
  // Jamais une simple moyenne : médiane + P75 + P90
  velocity: [
    { label: "Première réponse", median: 1.8, p75: 3.2, p90: 5.1 },
    { label: "Call accepté", median: 6.2, p75: 9.4, p90: 13.0 },
    { label: "Client signé", median: 11.4, p75: 16.8, p90: 22.5 },
  ],
  bestFU: "36 h",
  avgFollowups: "2.7",
  topFollowup: "FU3",
  // parcours : durée écoulée à chaque jalon
  journey: [
    { step: "Premier message", t: "J0" },
    { step: "Réponse", t: "+1.8 j" },
    { step: "Follow-up", t: "+36 h" },
    { step: "Chaud", t: "+5.2 j" },
    { step: "Appel accepté", t: "+6.2 j" },
  ],
};

// IMPACT DES FOLLOW-UPS — ce qui accélère réellement la conversion
const FU_IMPACT = [
  { step: "FU1", delai: "24 h", reply: 12, temp: 3, toCall: 6 },
  { step: "FU2", delai: "36 h", reply: 18, temp: 8, toCall: 14 },
  { step: "FU3", delai: "48 h", reply: 41, temp: 19, toCall: 38, best: true },
  { step: "FU4", delai: "48 h", reply: 9, temp: 1, toCall: 3 },
];

// INTELLIGENCE MARCHÉ — détail par température (objections / déclencheurs / messages / comportements)
const MARKET_BY_TEMP = {
  prets: {
    objections: [{ label: "Question de prix", pct: 44 }, { label: "Timing / disponibilité", pct: 33 }, { label: "Validation interne", pct: 14 }],
    declencheurs: [{ label: "Garantie de résultat", pct: 51 }, { label: "Cas client identique", pct: 30 }, { label: "Disponibilité limitée", pct: 12 }],
    messages: [{ label: "Proposition de call direct", pct: 58 }, { label: "Récap de la valeur", pct: 27 }],
    comportements: ["Demandent souvent le prix d'eux-mêmes", "Acceptent l'appel sous 48 h"],
  },
  chauds: {
    objections: [{ label: "Pas le bon moment", pct: 38 }, { label: "Besoin de preuve", pct: 29 }, { label: "Budget à arbitrer", pct: 16 }],
    declencheurs: [{ label: "Étude de cas", pct: 48 }, { label: "Preuve ROI", pct: 31 }, { label: "Audit offert", pct: 12 }],
    messages: [{ label: "Étude de cas ciblée", pct: 46 }, { label: "Question d'enjeu", pct: 28 }],
    comportements: ["Répondent sous 24 h", "Acceptent généralement après FU3"],
  },
  engages: {
    objections: [{ label: "Pas prioritaire", pct: 41 }, { label: "« Ça marche chez moi ? »", pct: 28 }, { label: "Manque de confiance", pct: 17 }],
    declencheurs: [{ label: "Comparaison avant/après", pct: 39 }, { label: "Étude de cas", pct: 33 }, { label: "Diagnostic gratuit", pct: 15 }],
    messages: [{ label: "Question de qualification", pct: 44 }, { label: "Recadrage du problème", pct: 26 }],
    comportements: ["Posent des questions techniques", "Engagement irrégulier selon la semaine"],
  },
  curieux: {
    objections: [{ label: "Pas prioritaire", pct: 47 }, { label: "Simple curiosité", pct: 26 }, { label: "Pas de problème ressenti", pct: 18 }],
    declencheurs: [{ label: "Contenu de valeur", pct: 42 }, { label: "Question ouverte", pct: 30 }, { label: "Cas inspirant", pct: 14 }],
    messages: [{ label: "Question de diagnostic", pct: 49 }, { label: "Apport de valeur sans pitch", pct: 24 }],
    comportements: ["Lisent mais répondent peu", "Réagissent au contenu, pas aux relances"],
  },
  froids: {
    objections: [{ label: "Aucun signal", pct: 58 }, { label: "Mauvais ICP", pct: 24 }, { label: "Inactif sur LinkedIn", pct: 12 }],
    declencheurs: [{ label: "Accroche personnalisée", pct: 45 }, { label: "Point commun réel", pct: 33 }, { label: "Timing d'actualité", pct: 13 }],
    messages: [{ label: "Premier message court", pct: 61 }, { label: "Accroche contextuelle", pct: 21 }],
    comportements: ["Ouvrent rarement", "À retravailler ou à sortir du pipeline"],
  },
};


const SANKEY = {
  layers: [
    { key: "src",  label: "Source",   nodes: ["LinkedIn", "Référral", "Inbound"] },
    { key: "icp",  label: "ICP",      nodes: ["T1", "T2", "T3"] },
    { key: "msg",  label: "Message",  nodes: ["Étude de cas", "Loom", "Direct"] },
    { key: "rep",  label: "Réponse",  nodes: ["Répond", "Silence"] },
    { key: "call", label: "Call",     nodes: ["Call", "Pas de call"] },
    { key: "cli",  label: "Client",   nodes: ["Signé", "Perdu"] },
  ],
  // value, win = chemin gagnant (mis en avant)
  links: [
    // Source → ICP
    { from: "0:LinkedIn", to: "1:T1", v: 40, win: true }, { from: "0:LinkedIn", to: "1:T2", v: 25 }, { from: "0:LinkedIn", to: "1:T3", v: 10 },
    { from: "0:Référral", to: "1:T1", v: 10 }, { from: "0:Référral", to: "1:T2", v: 5 },
    { from: "0:Inbound", to: "1:T1", v: 6 }, { from: "0:Inbound", to: "1:T2", v: 4 },
    // ICP → Message
    { from: "1:T1", to: "2:Étude de cas", v: 30, win: true }, { from: "1:T1", to: "2:Loom", v: 16 }, { from: "1:T1", to: "2:Direct", v: 10 },
    { from: "1:T2", to: "2:Étude de cas", v: 12 }, { from: "1:T2", to: "2:Loom", v: 10 }, { from: "1:T2", to: "2:Direct", v: 12 },
    { from: "1:T3", to: "2:Direct", v: 7 }, { from: "1:T3", to: "2:Loom", v: 3 },
    // Message → Réponse
    { from: "2:Étude de cas", to: "3:Répond", v: 30, win: true }, { from: "2:Étude de cas", to: "3:Silence", v: 12 },
    { from: "2:Loom", to: "3:Répond", v: 15 }, { from: "2:Loom", to: "3:Silence", v: 14 },
    { from: "2:Direct", to: "3:Répond", v: 11 }, { from: "2:Direct", to: "3:Silence", v: 18 },
    // Réponse → Call
    { from: "3:Répond", to: "4:Call", v: 22, win: true }, { from: "3:Répond", to: "4:Pas de call", v: 34 },
    { from: "3:Silence", to: "4:Pas de call", v: 44 },
    // Call → Client
    { from: "4:Call", to: "5:Signé", v: 6, win: true }, { from: "4:Call", to: "5:Perdu", v: 16 },
    { from: "4:Pas de call", to: "5:Perdu", v: 78 },
  ],
};

// Badge d'action d'un lead : Ghost risque (silence long / FU4) sinon bande de température.
function leadBadge(lead) {
  const a = lead.analyse;
  const silence = daysSince(lead.dernierContact);
  if (lead.fuStade >= 4 || (silence >= 10 && lead.nbEchanges > 1)) {
    return { label: "Ghost risque", color: "var(--alert)", ghost: true };
  }
  return tempBand(a.temp);
}

Object.assign(window, { STATS_30J, STATS_90, metricsFor, TODAY, daysSince, liUrl, LEADS, FU_MESSAGES, FU_TIMING, STATUT, toneColors, analyzeConv, BRIEFING, tempBand, MARKET, leadBadge, fmtDateFr, fmtDayMonth, dateForIndexInRange, TEMP_CATS, temperatureFor, HEAT_DAYS, HEAT_HOURS, heatFor, SANKEY, psyFunnelFor, TIMING, FU_IMPACT, MARKET_BY_TEMP, loadPresu, savePresu, objectivesFor });
