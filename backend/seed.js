/* =========================================================
   Génère des tâches réalistes et les insère dans CouchDB
   avec _bulk_docs (insertion par lots).

   Utilisation :
     node seed.js                 → 50 000 tâches
     node seed.js 10000           → 10 000 tâches
     node seed.js 50000 --reset   → vide la base avant d'insérer
   ========================================================= */
const { nano, db, DB_NAME, initDB } = require('./config/couchdb');
const { REFERENTIEL } = require('./data/referentiel');

const TOTAL = parseInt(process.argv[2], 10) || 50000;
const RESET = process.argv.includes('--reset');
const TAILLE_LOT = 5000;

/* ---------- Générateur pseudo-aléatoire (résultats reproductibles) ---------- */
let seed = 20261126;
const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const pick = a => a[Math.floor(rand() * a.length)];

const iso = d => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const addDays = (s, n) => { const d = new Date(s + 'T00:00:00'); d.setDate(d.getDate() + n); return iso(d); };
const AUJ = iso(new Date());

const CLASSES = Object.entries(REFERENTIEL.sections)
  .flatMap(([section, s]) => s.classes.map(classe => ({ section, classe })));
const INTITULES = {
  Devoir: ['Série d’exercices', 'Compte rendu de TP', 'Travaux dirigés', 'Fiche de lecture', 'Exercices de révision'],
  Projet: ['Mini-projet', 'Projet de fin de module', 'Étude de cas', 'Projet en binôme', 'Rapport technique'],
  Examen: ['Contrôle continu', 'Partiel', 'Examen final', 'Évaluation pratique', 'Rattrapage'],
};
const ETUDIANTS = ['Rihab H.', 'Yasmine B.', 'Omar E.', 'Salma K.', 'Youssef A.', 'Imane T.', 'Mehdi R.',
  'Nour L.', 'Hamza Z.', 'Kenza M.', 'Ayoub F.', 'Sara O.', 'Adam C.', 'Lina D.', 'Anas G.'];

// Chaque classe a son propre niveau de performance → classements intéressants
const PERF = Object.fromEntries(CLASSES.map(c => [c.classe, 0.42 + rand() * 0.45]));

function genererTache(i) {
  const { section, classe } = pick(CLASSES);
  const typeTache = rand() < 0.5 ? 'Devoir' : rand() < 0.6 ? 'Projet' : 'Examen';
  const matiere = pick(rand() < 0.85 ? REFERENTIEL.sections[section].matieres : REFERENTIEL.matieresCommunes);
  const dateCreation = addDays(AUJ, -Math.floor(rand() * 120));
  const dateLimite = addDays(dateCreation, 5 + Math.floor(rand() * 40));
  const p = PERF[classe];

  let statut;
  if (dateLimite < AUJ) {
    statut = rand() < p + 0.1 ? 'Terminée' : rand() < 0.5 ? 'En cours' : 'À faire';
  } else {
    const r = rand();
    statut = r < p * 0.45 ? 'Terminée' : r < p * 0.45 + 0.35 ? 'En cours' : 'À faire';
  }

  return {
    _id: 'task_' + String(i).padStart(6, '0'),
    type: 'task',
    titre: `${pick(INTITULES[typeTache])} — ${matiere}`,
    description: '',
    typeTache, section, classe, matiere,
    etudiant: pick(ETUDIANTS),
    priorite: typeTache === 'Examen' ? 'Haute' : pick(REFERENTIEL.priorites),
    statut, dateLimite, dateCreation,
  };
}

async function main() {
  console.log(`\n📦 Base : ${DB_NAME} — ${TOTAL.toLocaleString('fr-FR')} tâches à générer`);

  if (RESET) {
    await nano.db.destroy(DB_NAME).catch(() => {});
    console.log('🗑  Base vidée');
  }
  await initDB();

  const t0 = Date.now();
  let inserees = 0, erreurs = 0;

  for (let debut = 1; debut <= TOTAL; debut += TAILLE_LOT) {
    const fin = Math.min(TOTAL, debut + TAILLE_LOT - 1);
    const docs = [];
    for (let i = debut; i <= fin; i++) docs.push(genererTache(i));

    const resultat = await db.bulk({ docs });          // POST /taskflow_db/_bulk_docs
    const ko = resultat.filter(r => r.error).length;
    inserees += resultat.length - ko;
    erreurs += ko;
    process.stdout.write(`\r⏳ Insertion : ${inserees.toLocaleString('fr-FR')} / ${TOTAL.toLocaleString('fr-FR')}`);
  }
  const duree = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`\n✅ ${inserees.toLocaleString('fr-FR')} documents insérés en ${duree} s` + (erreurs ? ` (${erreurs} déjà existants)` : ''));

  // Construit les index des vues tout de suite (sinon c'est fait à la 1re visite du tableau de bord)
  const t1 = Date.now();
  process.stdout.write('⏳ Construction des vues MapReduce…');
  await db.view('stats', 'par_section_classe_statut', { limit: 1 });
  await db.find({ selector: { type: 'task', dateCreation: { $gt: null } }, use_index: 'idx-type-date', limit: 1 });
  console.log(` terminé en ${((Date.now() - t1) / 1000).toFixed(1)} s\n`);
}

main().catch(e => {
  console.error('\n❌ Erreur :', e.message);
  process.exit(1);
});
