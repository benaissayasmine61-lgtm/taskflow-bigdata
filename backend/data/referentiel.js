/* Référentiel académique — identique à frontend/js/data.js */
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

module.exports = { REFERENTIEL };
