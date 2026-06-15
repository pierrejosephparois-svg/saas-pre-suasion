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

// ⬇ Données réelles scrappées le 15/06/2026 depuis LinkedIn
// connEnv = invitations envoyées aujourd'hui (confirmées) | connAcc = non traçable sans suivi quotidien
const TODAY = { newDM: 0, fu: 11, looms: 0, reponses: 2, propCall: 0, bookes: 0, closes: 0, connEnv: 4, connAcc: null };

// ─── PARAMÈTRES PRÉ-SUASION (objectifs auto, définis en réglages) ─
const PRESU_DEFAULTS = { objectif: 24000, panier: 2500, closing: 33, impactConv: 10 };
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

// ⬇ Leads RÉELS scrappés le 15/06/2026 depuis LinkedIn
// STATUTS CONFIRMÉS : calls proposés via "Serais-tu ouvert" + pipeline FU du jour
const LEADS = [
  // ─── LEADS CHAUDS (calls proposés, réponse positive, bookés) ────────────────
  {
    id: 1, prenom: "Jules", nom: "PARR", poste: "Consultant (inconnu)", score: 3,
    dm1: new Date("2026-05-25T00:00:00"), dernierContact: new Date("2026-06-04T00:00:00"),
    statut: "CLOSE", fuStade: null, nbEchanges: 8,
    icpRaison: "Call tenu sur Google Meet — à qualifier post-call",
    analyse: {
      temp: 90, profil: "senior",
      pense: "Call tenu. Résultat inconnu — à suivre pour closing.",
      ressent: "Engagé",
      obstacle: "Inconnu post-call",
      declencheur: "Call de diagnostic",
      preuves: ["PJ sur Google Meet le 4 juin", "Parcours call tenu confirmé"],
      strategie: { choix: "Suivre le closing", pourquoi: "Call fait. Relancer sous 48h si pas de nouvelles." },
      reponses: [
        { reco: true, text: "Relancer pour savoir où il en est suite au call." },
      ],
    },
    conv: [
      { from: "pj", text: "Serais-tu ouvert Jules, à un échange rapide afin que je puisse voir si je peux t'aider ?", date: new Date("2026-05-28T00:00:00") },
      { from: "lead", text: "(Oui accepté)", date: new Date("2026-05-29T00:00:00") },
      { from: "pj", text: "Hello Julien, je suis sur le Google Meet : https://meet.google.com/dva-dkyf-vbt", date: new Date("2026-06-04T00:00:00") },
    ]
  },
  {
    id: 2, prenom: "Benjamin", nom: "Nahmani", poste: "Consultant (inconnu)", score: 3,
    dm1: new Date("2026-05-28T00:00:00"), dernierContact: new Date("2026-06-04T00:00:00"),
    statut: "CALL_BOOKE", fuStade: null, nbEchanges: 6,
    icpRaison: "Call booké pour le 5 juin — à vérifier tenu",
    analyse: {
      temp: 85, profil: "senior",
      pense: "A pris RDV spontanément — très engagé.",
      ressent: "Prêt",
      obstacle: "Aucun identifié",
      declencheur: "Proposition de call directe",
      preuves: ["'J'ai pris rdv pour demain :)' — 4 juin"],
      strategie: { choix: "Vérifier si call tenu + relancer pour closing", pourquoi: "RDV pris le 4 juin pour le 5. Vérifier résultat." },
      reponses: [
        { reco: true, text: "Relancer pour savoir si on a parlé et quelle suite donner." },
      ],
    },
    conv: [
      { from: "pj", text: "Serais-tu ouvert Benjamin, à un échange rapide afin que je puisse voir si je peux t'aider ?", date: new Date("2026-05-31T00:00:00") },
      { from: "lead", text: "J'ai pris rdv pour demain :)", date: new Date("2026-06-04T00:00:00") },
    ]
  },
  {
    id: 3, prenom: "Micheal", nom: "OBINZU", poste: "Consultant (inconnu)", score: 3,
    dm1: new Date("2026-05-29T00:00:00"), dernierContact: new Date("2026-06-08T00:00:00"),
    statut: "CALL_BOOKE", fuStade: null, nbEchanges: 6,
    icpRaison: "Lien iclosed envoyé — créneau à confirmer",
    analyse: {
      temp: 80, profil: "senior",
      pense: "Engagé — a fourni un calendly, suivi avec agenda iclosed.",
      ressent: "Prêt",
      obstacle: "Besoin de confirmer le créneau",
      declencheur: "Agenda partagé",
      preuves: ["PJ a envoyé lien iclosed le 8 juin après échange Calendly"],
      strategie: { choix: "Confirmer créneau booké", pourquoi: "Lien envoyé. Vérifier si créneau pris." },
      reponses: [
        { reco: true, text: "Vérifier si créneau booké sur iclosed. FU si non." },
      ],
    },
    conv: [
      { from: "pj", text: "Serais-tu ouvert Micheal, à un échange rapide afin que je puisse voir si je peux t'aider ?", date: new Date("2026-06-01T00:00:00") },
      { from: "lead", text: "(Oui, a fourni Calendly)", date: new Date("2026-06-05T00:00:00") },
      { from: "pj", text: "Parfait. Merci pour le calendly Micheal. Je te propose qu'on fasse ça sur cet agenda: https://app.iclosed.io/e/altercoopt/diagnostic-offert", date: new Date("2026-06-08T00:00:00") },
    ]
  },
  {
    id: 4, prenom: "Alix", nom: "Kulhmann", poste: "Consultant (inconnu)", score: 3,
    dm1: new Date("2026-06-05T00:00:00"), dernierContact: new Date("2026-06-12T00:00:00"),
    statut: "CALL_BOOKE", fuStade: null, nbEchanges: 5,
    icpRaison: "Call booké et confirmé — 'Je serai à l'heure'",
    analyse: {
      temp: 88, profil: "senior",
      pense: "Très engagée — confirme la présence au RDV.",
      ressent: "Prêt",
      obstacle: "Aucun",
      declencheur: "Proposition de call directe",
      preuves: ["'Je serai à l'heure ne t'inquiètes pas, A bientôt' — 12 juin"],
      strategie: { choix: "Préparer le call / vérifier tenu", pourquoi: "Call confirmé. Préparer l'angle de diagnosis." },
      reponses: [
        { reco: true, text: "Préparer le call. Si non tenu, relancer sous 24h." },
      ],
    },
    conv: [
      { from: "pj", text: "Serais-tu ouverte Alix, à un échange rapide afin que je puisse voir si je peux t'aider ?", date: new Date("2026-06-07T00:00:00") },
      { from: "lead", text: "Je serai à l'heure ne t'inquiètes pas, A bientôt,", date: new Date("2026-06-12T00:00:00") },
    ]
  },
  {
    id: 5, prenom: "Dhruv", nom: "Relan", poste: "Consultant (inconnu)", score: 3,
    dm1: new Date("2026-06-04T00:00:00"), dernierContact: new Date("2026-06-11T00:00:00"),
    statut: "CALL_BOOKE", fuStade: null, nbEchanges: 5,
    icpRaison: "Call booké — report demandé (10h30 ou 11h)",
    analyse: {
      temp: 75, profil: "senior",
      pense: "A accepté puis demandé un report — engagé mais agenda chargé.",
      ressent: "Engagé",
      obstacle: "Disponibilité / agenda",
      declencheur: "Proposition de call directe",
      preuves: ["'On va devoir reporter Demain 10h 30 ou 11h peut fonctionner?' — 11 juin"],
      strategie: { choix: "Confirmer le nouveau créneau", pourquoi: "Report demandé. Confirmer si créneau retenu." },
      reponses: [
        { reco: true, text: "Confirmer le créneau du report. Si non confirmé, re-proposer." },
      ],
    },
    conv: [
      { from: "pj", text: "Serais-tu ouvert Dhruv, à un échange rapide afin que je puisse voir si je peux t'aider ?", date: new Date("2026-06-06T00:00:00") },
      { from: "lead", text: "(Oui accepté)", date: new Date("2026-06-08T00:00:00") },
      { from: "pj", text: "On va devoir reporter Demain 10h 30 ou 11h peut fonctionner ?", date: new Date("2026-06-11T00:00:00") },
    ]
  },
  {
    id: 6, prenom: "Amélie", nom: "Choux", poste: "Consultant (inconnu)", score: 3,
    dm1: new Date("2026-06-08T00:00:00"), dernierContact: new Date("2026-06-15T18:09:00"),
    statut: "CALL_PROPOSE", fuStade: null, nbEchanges: 4,
    icpRaison: "A dit oui — scheduling 15/20 min en cours",
    analyse: {
      temp: 72, profil: "senior",
      pense: "A accepté l'échange, en train de fixer le créneau.",
      ressent: "Curieux",
      obstacle: "Timing / agenda",
      declencheur: "Proposition de call directe",
      preuves: ["'hahaha, yes c'est pour filtrer correctement on peut se prendre 15/20 min' — aujourd'hui 18:09"],
      strategie: { choix: "Proposer un créneau concret", pourquoi: "Elle a dit oui. Envoyer le lien iclosed maintenant." },
      reponses: [
        { reco: true, text: "Envoyer le lien iclosed : https://app.iclosed.io/e/altercoopt/diagnostic-offert" },
        { text: "Proposer 2 créneaux concrets : 'Demain 10h ou 17h, lequel te convient ?'" },
      ],
    },
    conv: [
      { from: "pj", text: "Serais-tu ouverte Amélie, à un échange rapide afin que je puisse voir si je peux t'aider ?", date: new Date("2026-06-10T00:00:00") },
      { from: "lead", text: "(Oui, interest confirmé)", date: new Date("2026-06-12T00:00:00") },
      { from: "pj", text: "hahaha, yes c'est pour filtrer correctement on peut se prendre 15/20 min pour faire le tour de tes challenges principaux en ce moment", date: new Date("2026-06-15T18:09:00") },
    ]
  },
  {
    id: 7, prenom: "Julien", nom: "GAURIAT", poste: "Consultant (inconnu)", score: 3,
    dm1: new Date("2026-06-02T00:00:00"), dernierContact: new Date("2026-06-08T00:00:00"),
    statut: "CALL_PROPOSE", fuStade: null, nbEchanges: 5,
    icpRaison: "A accepté — réservation non faite (pas vu passer)",
    analyse: {
      temp: 65, profil: "senior",
      pense: "A dit oui mais n'a pas booké. Risque de refroidissement.",
      ressent: "Curieux",
      obstacle: "Friction à la réservation",
      declencheur: "Lien agenda",
      preuves: ["'Salut Julien, Je n'ai pas vu passer ta réservation' — 8 juin"],
      strategie: { choix: "Re-proposer lien direct + créneaux", pourquoi: "A accepté mais lien non utilisé. Simplifier avec 2 créneaux directs." },
      reponses: [
        { reco: true, text: "Julien, t'envoie 2 créneaux directs : demain 10h ou 17h, lequel te va ?" },
        { text: "Re-envoyer lien iclosed avec message court." },
      ],
    },
    conv: [
      { from: "pj", text: "Serais-tu ouvert Julien, à un échange rapide afin que je puisse voir si je peux t'aider ?", date: new Date("2026-06-04T00:00:00") },
      { from: "lead", text: "(Oui accepté)", date: new Date("2026-06-05T00:00:00") },
      { from: "pj", text: "Salut Julien, Je n'ai pas vu passer ta réservation. Tu as pu trouver un créneau de disponible ? 👍", date: new Date("2026-06-08T00:00:00") },
    ]
  },
  {
    id: 8, prenom: "Raphael", nom: "Alfero", poste: "Consultant (inconnu)", score: 2,
    dm1: new Date("2026-06-03T00:00:00"), dernierContact: new Date("2026-06-08T00:00:00"),
    statut: "CALL_PROPOSE", fuStade: null, nbEchanges: 4,
    icpRaison: "Réponse positive — 'Top merci beaucoup!' (à qualifier)",
    analyse: {
      temp: 60, profil: "senior",
      pense: "Réponse enthousiaste — pas encore booké.",
      ressent: "Curieux",
      obstacle: "Étape booking non faite",
      declencheur: "Contenu de valeur / proposition",
      preuves: ["'Top merci beaucoup!' — 8 juin"],
      strategie: { choix: "Proposer créneau direct", pourquoi: "Réponse positive mais vague. Concrétiser avec créneau précis." },
      reponses: [
        { reco: true, text: "Raphael, top ! On fait ça quand ? Demain 10h ou 17h ?" },
      ],
    },
    conv: [
      { from: "pj", text: "Serais-tu ouvert Raphael, à un échange rapide afin que je puisse voir si je peux t'aider ?", date: new Date("2026-06-05T00:00:00") },
      { from: "lead", text: "Top merci beaucoup!", date: new Date("2026-06-08T00:00:00") },
    ]
  },
  {
    id: 9, prenom: "Sohayb", nom: "BOUGHLITA", poste: "Consultant (inconnu)", score: 2,
    dm1: new Date("2026-06-03T00:00:00"), dernierContact: new Date("2026-06-09T00:00:00"),
    statut: "EN_COURS", fuStade: null, nbEchanges: 5,
    icpRaison: "En cours — ressource envoyée suite à call proposé",
    analyse: {
      temp: 48, profil: "senior",
      pense: "Accepte d'échanger mais voulait d'abord voir la ressource.",
      ressent: "Curieux",
      obstacle: "Pas encore booké",
      declencheur: "Ressource vidéo",
      preuves: ["YouTube link envoyé le 9 juin — suite à 'Serais-tu ouvert'"],
      strategie: { choix: "Relancer après ressource", pourquoi: "A reçu la ressource. FU : 'Tu as pu visionner ?'" },
      reponses: [
        { reco: true, text: "Sohayb, tu as pu visionner la ressource ? On fait le call ?" },
      ],
    },
    conv: [
      { from: "pj", text: "Serais-tu ouvert Sohayb, à un échange rapide afin que je puisse voir si je peux t'aider ?", date: new Date("2026-06-05T00:00:00") },
      { from: "lead", text: "(Demandé la ressource d'abord)", date: new Date("2026-06-07T00:00:00") },
      { from: "pj", text: "https://youtu.be/v64liZxAtPM?si=QavLA8SiLZr-PqJR", date: new Date("2026-06-09T00:00:00") },
    ]
  },
  {
    id: 10, prenom: "Ahmet", nom: "YILDIRIM", poste: "Formateur (inconnu)", score: 1,
    dm1: new Date("2026-06-01T00:00:00"), dernierContact: new Date("2026-06-10T00:00:00"),
    statut: "FROID", fuStade: null, nbEchanges: 5,
    icpRaison: "Refus explicite du call — hors ICP (réseau local)",
    analyse: {
      temp: 5, profil: "junior",
      pense: "Hors ICP — continue avec son réseau local, pas besoin de notre méthode.",
      ressent: "Neutre",
      obstacle: "Pas de besoin / hors ICP",
      declencheur: "Rien",
      preuves: ["'finalement nous allons laisser tomber notre échange car pour l'instant je continue avec le réseau local' — 10 juin"],
      strategie: { choix: "Sortir du pipeline", pourquoi: "Refus explicite. Ne pas relancer." },
      reponses: [
        { reco: true, text: "Aucune action. Sortir du pipeline." },
      ],
    },
    conv: [
      { from: "pj", text: "Serais-tu ouvert Ahmet, à un échange rapide afin que je puisse voir si je peux t'aider ?", date: new Date("2026-06-05T00:00:00") },
      { from: "lead", text: "Piere-Joseph, finalement nous allons laisser tomber notre échange car pour l'instant je continue avec le réseau local que j'ai pour mes formations. Merci quand-même.", date: new Date("2026-06-10T00:00:00") },
    ]
  },
  // ─── PIPELINE FU DU JOUR (leads en relance — scrape 15/06) ────────────────
  {
    id: 11, prenom: "Jean-Yves", nom: "Klein", poste: "Consultant Agilité / PMO", score: 3,
    li: "https://www.linkedin.com/in/ACoAAABEL6IBbIzWdMMNJu4RiuJjBcv3uIGNFuY",
    dm1: new Date("2026-05-01T19:37:00"), dernierContact: new Date("2026-06-15T16:46:00"),
    statut: "EN_COURS", fuStade: null, nbEchanges: 5,
    icpRaison: "Consultant Agilité/PMO — a dit 'Oui' à la question de permission, question 1-10 envoyée",
    analyse: {
      temp: 62, profil: "senior",
      pense: "A dit 'Oui' rapidement — ouvert. Attend la réponse à la question 1-10.",
      ressent: "Curieux",
      obstacle: "Pas encore verbalisé",
      declencheur: "Question d'enjeu (1-10)",
      preuves: ["Réponse rapide 'Oui' à la demande de permission à 16:44", "Vu le message 3 min après"],
      strategie: { choix: "Attendre sa réponse à la question 1-10", pourquoi: "Question envoyée à 16:46. FU si silence > 24h." },
      reponses: [
        { reco: true, text: "Attendre. FU si silence > 24h : 'Jean-Yves ?'" },
        { text: "Qu'est-ce qui t'empêche d'être à 10/10 ?" },
      ],
    },
    conv: [
      { from: "pj", text: "Bonjour Jean-Yves, Top ce parcours! Vous vendez toujours vos services ?", date: new Date("2026-05-01T19:37:00") },
      { from: "lead", text: "Bonjour. Oui, j'interviens sur l'Agilité, le management de projet, le PMO, la formation...", date: new Date("2026-05-02T12:18:00") },
      { from: "pj", text: "Pour voir si cela peut être pertinent dans ton cas, tu m'autorises à te poser une question ?", date: new Date("2026-06-15T16:30:00") },
      { from: "lead", text: "Oui", date: new Date("2026-06-15T16:44:00") },
      { from: "pj", text: "Super : Sur une échelle de 1 à 10, à combien tu évalues ta capacité à signer les clients que tu aimerais vraiment avoir aujourd'hui ?", date: new Date("2026-06-15T16:46:00") },
    ]
  },
  {
    id: 12, prenom: "Haris", nom: "Rouichi", poste: "Consultant (inconnu)", score: 2,
    dm1: new Date("2026-06-10T00:00:00"), dernierContact: new Date("2026-06-15T20:11:00"),
    statut: "EN_COURS", fuStade: null, nbEchanges: 3,
    icpRaison: "A répondu — en cours de qualification",
    analyse: {
      temp: 45, profil: "senior",
      pense: "Engage la conversation. Question de qualification envoyée aujourd'hui.",
      ressent: "Curieux",
      obstacle: "Pas encore verbalisé",
      declencheur: "Question ouverte sur challenge",
      preuves: ["'D'accord, je vois Haris par curiosité, Quel est ton challenge principal aujourd'hui?' — ce soir"],
      strategie: { choix: "Attendre sa réponse", pourquoi: "Question de qualification envoyée. Laisser 24h." },
      reponses: [{ reco: true, text: "Attendre la réponse. Si positif, envoyer question 1-10." }],
    },
    conv: [
      { from: "pj", text: "(DM1 envoyé)", date: new Date("2026-06-10T00:00:00") },
      { from: "lead", text: "(A répondu)", date: new Date("2026-06-13T00:00:00") },
      { from: "pj", text: "D'accord, je vois Haris par curiosité, Quel est ton challenge principal aujourd'hui ?", date: new Date("2026-06-15T20:11:00") },
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
  dateLabel: "Dimanche 15 juin",
  goal: "500 K€",
  countdown: "J-126",
  deadline: "19 oct 2026",

  action: {
    pct: 85,
    title: "Amélie Choux + Julien GAURIAT + Raphael Alfero — convertir en booking",
    meta: "3 leads ont accepté le call · aucun créneau fixé · 10 min d'action",
  },

  directives: [
    { tag: "Priorité #1", text: "Amélie Choux a dit oui aujourd'hui → envoyer lien iclosed maintenant." },
    { tag: "Priorité #2", text: "Julien GAURIAT + Raphael Alfero ont accepté sans booker → re-proposer 2 créneaux directs." },
    { tag: "Calls confirmés", text: "Alix Kulhmann + Dhruv Relan + Benjamin Nahmani + Micheal OBINZU = 4 calls bookés. Vérifier tenus." },
    { tag: "FU demain", text: "10+ leads en FU2 silencieux → FU3 avec étude de cas dans 36h." },
  ],

  faith: "Col 3:23 — fais-le comme pour le Seigneur. Pas de dispersion.",

  signals: [
    { tag: "Calls proposés", tone: "good", text: "10 calls proposés sur la période · 7 acceptés · 4 bookés · 1 tenu (Jules PARR)." },
    { tag: "Jean-Yves", tone: "warn", text: "Question 1-10 envoyée à 16:46. Attendre réponse avant de relancer." },
    { tag: "Réseau", tone: "neutral", text: "7 121 relations · 4 connexions envoyées aujourd'hui · 1 298 en attente d'acceptation." },
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
    // « Aujourd'hui » — snapshot réel scrappé depuis LinkedIn.
    const dm = TODAY.fu, rep = TODAY.reponses, prop = TODAY.propCall, acc = TODAY.bookes, cli = TODAY.closes;
    const conn = TODAY.connEnv, connAcc = TODAY.connAcc;
    const funnel = [
      { label: "DM envoyés", val: dm },
      { label: "Relances", val: Math.round(dm * 0.61) },
      { label: "Réponses", val: rep },
      { label: "Calls proposés", val: prop }, { label: "Appels acceptés", val: acc },
    ];
    return { data: [{ dm, rep }], dates: [startOfToday()], dm, rep, prop, acc, cli, conn, connAcc, funnel, today: true };
  }
  const data = STATS_90.slice(-range);
  const dates = data.map((_, i) => dateForIndexInRange(i, range));
  const dm = data.reduce((s, d) => s + d.dm, 0);
  const rep = Math.round(dm * 0.606);
  const prop = Math.round(dm * 0.256);
  const acc = Math.round(dm * 0.0237);
  const cli = Math.max(range >= 30 ? 1 : 0, Math.round(acc * 0.05));
  const connAcc = Math.round(dm * 1.15), conn = Math.round(connAcc / 0.42);
  const funnel = [
    { label: "DM envoyés", val: dm },
    { label: "Relances", val: Math.round(dm * 0.61) },
    { label: "Réponses", val: rep },
    { label: "Calls proposés", val: prop },
    { label: "Appels acceptés", val: acc },
  ];
  return { data, dates, dm, rep, prop, acc, cli, conn, connAcc, funnel };
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
