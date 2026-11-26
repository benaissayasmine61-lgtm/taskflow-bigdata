/* =========================================================
   CRUD des tâches + recherche / filtres / pagination (Mango)
   ========================================================= */
const { db } = require('../config/couchdb');
const { wrap, today, escapeRegex } = require('../utils/helpers');

// Seuls ces champs peuvent être envoyés par le frontend
const CHAMPS = ['titre', 'description', 'typeTache', 'section', 'classe', 'matiere',
  'etudiant', 'priorite', 'statut', 'dateLimite'];

const garderChamps = body => Object.fromEntries(
  CHAMPS.filter(k => body[k] !== undefined)
    .map(k => [k, typeof body[k] === 'string' ? body[k].trim() : body[k]]));

/* Recherche insensible à la casse : "big" → "[bB][iI][gG]" */
const regexInsensible = texte => [...escapeRegex(texte)]
  .map(c => c.toLowerCase() !== c.toUpperCase() ? `[${c.toLowerCase()}${c.toUpperCase()}]` : c)
  .join('');

/* Construit le sélecteur Mango à partir des paramètres de l'URL
   ?section=&classe=&statut=&typeTache=&matiere=&q=&retard=true */
function construireSelecteur(q) {
  const selector = { type: 'task', dateCreation: { $gt: null } };

  for (const k of ['section', 'classe', 'statut', 'typeTache', 'matiere']) {
    if (q[k]) selector[k] = q[k];
  }
  // En retard = pas terminée ET date limite dépassée
  if (q.retard === 'true') {
    selector.dateLimite = { $lt: today() };
    if (!q.statut) selector.statut = { $ne: 'Terminée' };
    else if (q.statut === 'Terminée') return null;          // impossible : aucun résultat
  }
  if (q.q && String(q.q).trim()) {
    selector.titre = { $regex: regexInsensible(String(q.q).trim()) };
  }
  return selector;
}

// GET /api/tasks  →  { total, page, limit, docs }
exports.getAll = wrap(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100000, Math.max(1, parseInt(req.query.limit, 10) || 15));
  const selector = construireSelecteur(req.query);
  if (!selector) return res.json({ total: 0, page, limit, docs: [] });

  const [resultat, comptage] = await Promise.all([
    db.find({
      selector,
      sort: [{ type: 'desc' }, { dateCreation: 'desc' }],
      use_index: 'idx-type-date',
      skip: (page - 1) * limit,
      limit,
    }),
    db.find({ selector, fields: ['_id'], use_index: 'idx-type-date', limit: 1000000 }),
  ]);

  res.json({ total: comptage.docs.length, page, limit, docs: resultat.docs });
});

// GET /api/tasks/:id
exports.getOne = wrap(async (req, res) => {
  res.json(await db.get(req.params.id));
});

// POST /api/tasks
exports.create = wrap(async (req, res) => {
  const data = garderChamps(req.body);
  if (!data.titre || !data.dateLimite) {
    return res.status(400).json({ error: 'Le titre et la date limite sont obligatoires.' });
  }
  const doc = {
    _id: `task_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type: 'task',
    statut: 'À faire',
    priorite: 'Moyenne',
    ...data,
    dateCreation: today(),
  };
  const r = await db.insert(doc);
  res.status(201).json({ ...doc, _rev: r.rev });
});

// PUT /api/tasks/:id  (gestion des révisions CouchDB via _rev)
exports.update = wrap(async (req, res) => {
  const current = await db.get(req.params.id);
  // Si le client envoie un _rev périmé → conflit (démonstration du contrôle de révision)
  if (req.body._rev && req.body._rev !== current._rev) {
    return res.status(409).json({ error: 'Conflit de révision : le document a été modifié entre-temps.' });
  }
  const updated = { ...current, ...garderChamps(req.body) };
  const r = await db.insert(updated);
  res.json({ ...updated, _rev: r.rev });
});

// DELETE /api/tasks/:id
exports.remove = wrap(async (req, res) => {
  const doc = await db.get(req.params.id);
  await db.destroy(doc._id, doc._rev);
  res.json({ ok: true });
});
