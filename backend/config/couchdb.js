/* =========================================================
   Connexion CouchDB + création des index et des vues MapReduce
   ========================================================= */
require('dotenv').config();
const nano = require('nano')(process.env.COUCHDB_URL);

const DB_NAME = process.env.DB_NAME || 'taskflow_db';
const db = nano.use(DB_NAME);

/* Index Mango : permet de trier les tâches par date de création */
const INDEX_DATE = {
  index: { fields: ['type', 'dateCreation'] },
  name: 'idx-type-date',
  ddoc: 'idx-type-date',
  type: 'json',
};

/* Vues MapReduce : statistiques du tableau de bord */
const DESIGN_STATS = {
  _id: '_design/stats',
  language: 'javascript',
  views: {
    // Nombre de tâches par [section, classe, statut]
    par_section_classe_statut: {
      map: "function (doc) { if (doc.type === 'task') { emit([doc.section, doc.classe, doc.statut], 1); } }",
      reduce: '_count',
    },
    // Nombre de tâches par [type, statut]
    par_type_statut: {
      map: "function (doc) { if (doc.type === 'task') { emit([doc.typeTache, doc.statut], 1); } }",
      reduce: '_count',
    },
    // Nombre de tâches par [matière, statut]
    par_matiere_statut: {
      map: "function (doc) { if (doc.type === 'task') { emit([doc.matiere, doc.statut], 1); } }",
      reduce: '_count',
    },
    // Tâches non terminées, triées par date limite → requête « en retard » = dateLimite < aujourd'hui
    non_terminees_par_echeance: {
      map: "function (doc) { if (doc.type === 'task' && doc.statut !== 'Terminée') { emit(doc.dateLimite, [doc.section, doc.classe]); } }",
      reduce: '_count',
    },
  },
};

/* Crée ou met à jour un design document */
async function upsertDesign(design) {
  try {
    const current = await db.get(design._id);
    if (JSON.stringify(current.views) === JSON.stringify(design.views)) return;
    design = { ...design, _rev: current._rev };
  } catch (e) {
    if (e.statusCode !== 404) throw e;
  }
  await db.insert(design);
}

async function initDB() {
  const dbs = await nano.db.list();
  if (!dbs.includes(DB_NAME)) await nano.db.create(DB_NAME);
  await db.createIndex(INDEX_DATE);
  await upsertDesign(DESIGN_STATS);
  console.log(`CouchDB connecté : ${DB_NAME} (index + vues prêts)`);
}

module.exports = { nano, db, DB_NAME, initDB, INDEX_DATE };
