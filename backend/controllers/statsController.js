/* =========================================================
   Statistiques du tableau de bord — calculées par les vues MapReduce
   GET /api/stats
   ========================================================= */
const { db } = require('../config/couchdb');
const { wrap, today } = require('../utils/helpers');

const CLE_STATUT = { 'Terminée': 'terminees', 'En cours': 'enCours', 'À faire': 'aFaire' };
const vide = () => ({ total: 0, terminees: 0, enCours: 0, aFaire: 0, enRetard: 0 });
const ajouter = (o, statut, n) => {
  o.total += n;
  if (CLE_STATUT[statut]) o[CLE_STATUT[statut]] += n;
};
const avecTaux = o => ({ ...o, taux: o.total ? (o.terminees / o.total) * 100 : 0 });

exports.getStats = wrap(async (req, res) => {
  const debut = Date.now();

  const [parClasse, parType, parMatiere, enRetard] = await Promise.all([
    db.view('stats', 'par_section_classe_statut', { group: true }),
    db.view('stats', 'par_type_statut', { group: true }),
    db.view('stats', 'par_matiere_statut', { group: true }),
    // Tâches non terminées dont la date limite est avant aujourd'hui
    db.view('stats', 'non_terminees_par_echeance', { endkey: today(), inclusive_end: false, reduce: false }),
  ]);

  const stats = { ...vide(), parType: {}, parMatiere: {}, sections: [], classes: [] };
  const sections = {}, classes = {};

  for (const { key: [section, classe, statut], value: n } of parClasse.rows) {
    ajouter(stats, statut, n);
    ajouter(sections[section] ??= { nom: section, ...vide() }, statut, n);
    ajouter(classes[classe] ??= { nom: classe, section, ...vide() }, statut, n);
  }
  for (const { key: [type, statut], value: n } of parType.rows) {
    ajouter(stats.parType[type] ??= vide(), statut, n);
  }
  for (const { key: [matiere, statut], value: n } of parMatiere.rows) {
    ajouter(stats.parMatiere[matiere] ??= vide(), statut, n);
  }
  for (const { value: [section, classe] } of enRetard.rows) {
    stats.enRetard++;
    if (sections[section]) sections[section].enRetard++;
    if (classes[classe]) classes[classe].enRetard++;
  }

  stats.sections = Object.values(sections).map(avecTaux);
  stats.classes = Object.values(classes).map(avecTaux);
  stats.meta = { source: 'Vues MapReduce CouchDB', dureeMs: Date.now() - debut };

  res.json(stats);
});
