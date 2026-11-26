/* =========================================================
   TaskFlow — Référentiel académique + données de démonstration
   ========================================================= */

const REFERENTIEL = {
  sections: {
    'Informatique': {
      classes: ['INFO-1A', 'INFO-1B', 'INFO-2A', 'INFO-2B', 'INFO-3A'],
      matieres: ['Bases de données', 'Algorithmique', 'Réseaux', 'Développement web', 'Big Data'],
    },
    'Génie civil': {
      classes: ['GC-1A', 'GC-2A', 'GC-3A'],
      matieres: ['Résistance des matériaux', 'Topographie', 'Béton armé', 'Gestion de projet'],
    },
    'Économie et gestion': {
      classes: ['ECO-1A', 'ECO-1B', 'ECO-2A'],
      matieres: ['Microéconomie', 'Comptabilité', 'Statistiques', 'Gestion de projet'],
    },
    'Mathématiques appliquées': {
      classes: ['MATH-1A', 'MATH-2A'],
      matieres: ['Analyse', 'Algèbre linéaire', 'Probabilités', 'Statistiques'],
    },
    'Biologie': {
      classes: ['BIO-1A', 'BIO-2A'],
      matieres: ['Biologie cellulaire', 'Génétique', 'Biochimie', 'Statistiques'],
    },
  },
  matieresCommunes: ['Anglais', 'Communication'],
  types: ['Devoir', 'Projet', 'Examen'],
  statuts: ['À faire', 'En cours', 'Terminée'],
  priorites: ['Basse', 'Moyenne', 'Haute'],
};

const REF = {
  sections: () => Object.keys(REFERENTIEL.sections),
  classes: section => section
    ? REFERENTIEL.sections[section]?.classes || []
    : Object.values(REFERENTIEL.sections).flatMap(s => s.classes),
  matieres: section => {
    const list = section
      ? REFERENTIEL.sections[section]?.matieres || []
      : Object.values(REFERENTIEL.sections).flatMap(s => s.matieres);
    return [...new Set([...list, ...REFERENTIEL.matieresCommunes])].sort((a, b) => a.localeCompare(b, 'fr'));
  },
  sectionOf: classe => Object.keys(REFERENTIEL.sections)
    .find(s => REFERENTIEL.sections[s].classes.includes(classe)) || '',
};

/* ---------- Dates ---------- */
const isoDate = d => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
};
const today = () => isoDate(new Date());
const addDays = (iso, n) => {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return isoDate(d);
};
const estEnRetard = t => t.statut !== 'Terminée' && !!t.dateLimite && t.dateLimite < today();

/* ---------- Données de démonstration (50 000 tâches) ---------- */
const MOCK = (() => {
  const TOTAL = 50000;
  let seed = 20261126;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const pick = a => a[Math.floor(rand() * a.length)];

  const INTITULES = {
    Devoir: ['Série d’exercices', 'Compte rendu de TP', 'Travaux dirigés', 'Fiche de lecture', 'Exercices de révision'],
    Projet: ['Mini-projet', 'Projet de fin de module', 'Étude de cas', 'Projet en binôme', 'Rapport technique'],
    Examen: ['Contrôle continu', 'Partiel', 'Examen final', 'Évaluation pratique', 'Rattrapage'],
  };
  const ETUDIANTS = ['Rihab H.', 'Yasmine B.', 'Omar E.', 'Salma K.', 'Youssef A.', 'Imane T.', 'Mehdi R.',
    'Nour L.', 'Hamza Z.', 'Kenza M.', 'Ayoub F.', 'Sara O.', 'Adam C.', 'Lina D.', 'Anas G.'];

  // Chaque classe a un niveau de performance différent → classements réalistes
  const perf = {};
  REF.classes().forEach(c => { perf[c] = 0.42 + rand() * 0.45; });

  const now = today();
  const tasks = [];
  for (let i = 1; i <= TOTAL; i++) {
    const classe = pick(REF.classes());
    const section = REF.sectionOf(classe);
    const typeTache = rand() < 0.5 ? 'Devoir' : rand() < 0.6 ? 'Projet' : 'Examen';
    const matiere = pick(rand() < 0.85 ? REFERENTIEL.sections[section].matieres : REFERENTIEL.matieresCommunes);
    const dateCreation = addDays(now, -Math.floor(rand() * 120));
    const dateLimite = addDays(dateCreation, 5 + Math.floor(rand() * 40));
    const p = perf[classe];

    let statut;
    if (dateLimite < now) {
      statut = rand() < p + 0.1 ? 'Terminée' : rand() < 0.5 ? 'En cours' : 'À faire';
    } else {
      const r = rand();
      statut = r < p * 0.45 ? 'Terminée' : r < p * 0.45 + 0.35 ? 'En cours' : 'À faire';
    }

    tasks.push({
      _id: 'task_' + String(i).padStart(6, '0'),
      _rev: '1-' + Math.floor(rand() * 1e8).toString(16),
      type: 'task',
      titre: `${pick(INTITULES[typeTache])} — ${matiere}`,
      description: '',
      typeTache, section, classe, matiere,
      etudiant: pick(ETUDIANTS),
      priorite: typeTache === 'Examen' ? 'Haute' : pick(REFERENTIEL.priorites),
      statut, dateLimite, dateCreation,
    });
  }
  // Plus récentes en premier
  tasks.sort((a, b) => b.dateCreation.localeCompare(a.dateCreation));
  return { tasks };
})();
