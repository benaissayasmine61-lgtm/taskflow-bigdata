/* =========================================================
   TaskFlow — Couche d'accès aux données
   Mode automatique :
   - page ouverte via le backend (http://localhost:5000) → vraies données CouchDB
   - page ouverte par double-clic ou Live Server          → données de démonstration
   Pour forcer un mode, remplacez la valeur de USE_MOCK par true ou false.
   ========================================================= */

const CONFIG = {
  USE_MOCK: location.port !== '5000',
  API_URL: 'http://localhost:5000/api',
};

/* ---------- Filtres (utilisés en mode mock, ou si l'API renvoie un tableau) ---------- */
function appliquerFiltres(tasks, f = {}) {
  const q = (f.q || '').trim().toLowerCase();
  const auj = today();
  return tasks.filter(t =>
    (!f.section || t.section === f.section) &&
    (!f.classe || t.classe === f.classe) &&
    (!f.statut || t.statut === f.statut) &&
    (!f.typeTache || t.typeTache === f.typeTache) &&
    (!f.matiere || t.matiere === f.matiere) &&
    (!f.retard || (t.statut !== 'Terminée' && t.dateLimite < auj)) &&
    (!q || t.titre.toLowerCase().includes(q)));
}

/* ---------- Statistiques (même format que GET /api/stats) ---------- */
function calculerStats(tasks) {
  const s = {
    total: tasks.length, terminees: 0, enCours: 0, aFaire: 0, enRetard: 0,
    parType: {}, parMatiere: {}, sections: [], classes: [],
  };
  const sec = {}, cls = {};
  const auj = today();
  const blank = () => ({ total: 0, terminees: 0, enCours: 0, aFaire: 0, enRetard: 0 });

  for (const t of tasks) {
    const retard = t.statut !== 'Terminée' && t.dateLimite < auj;
    const key = t.statut === 'Terminée' ? 'terminees' : t.statut === 'En cours' ? 'enCours' : 'aFaire';
    const buckets = [
      s,
      s.parType[t.typeTache] ??= blank(),
      s.parMatiere[t.matiere] ??= blank(),
      sec[t.section] ??= { nom: t.section, ...blank() },
      cls[t.classe] ??= { nom: t.classe, section: t.section, ...blank() },
    ];
    for (const b of buckets) {
      if (b !== s) b.total++;
      b[key]++;
      if (retard) b.enRetard++;
    }
  }
  const taux = o => ({ ...o, taux: o.total ? (o.terminees / o.total) * 100 : 0 });
  s.sections = Object.values(sec).map(taux);
  s.classes = Object.values(cls).map(taux);
  return s;
}

/* ---------- HTTP ---------- */
async function http(path, options = {}) {
  const res = await fetch(CONFIG.API_URL + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Erreur ${res.status}`);
  }
  return res.json();
}
const nettoyer = f => Object.fromEntries(Object.entries(f).filter(([, v]) => v !== '' && v !== false && v != null));

/* ---------- API publique ---------- */
const api = {
  /** Liste paginée → { total, page, limit, docs } */
  async listTasks(filtres = {}, page = 1, limit = 15) {
    if (CONFIG.USE_MOCK) {
      const list = appliquerFiltres(MOCK.tasks, filtres);
      return { total: list.length, page, limit, docs: list.slice((page - 1) * limit, page * limit) };
    }
    const params = new URLSearchParams({ ...nettoyer(filtres), page, limit });
    const data = await http(`/tasks?${params}`);
    if (Array.isArray(data)) {           // compatibilité : backend qui renvoie un simple tableau
      const list = appliquerFiltres(data, filtres);
      return { total: list.length, page, limit, docs: list.slice((page - 1) * limit, page * limit) };
    }
    return data;
  },

  /** Statistiques globales pour le tableau de bord */
  async stats() {
    if (CONFIG.USE_MOCK) return calculerStats(MOCK.tasks);
    try {
      return await http('/stats');
    } catch {
      // Si /api/stats n'existe pas encore : calcul côté navigateur
      const data = await http('/tasks?limit=100000');
      return calculerStats(Array.isArray(data) ? data : data.docs);
    }
  },

  async create(task) {
    if (CONFIG.USE_MOCK) {
      const doc = { _id: 'task_' + Date.now(), _rev: '1-mock', type: 'task', ...task, dateCreation: today() };
      MOCK.tasks.unshift(doc);
      return doc;
    }
    return http('/tasks', { method: 'POST', body: JSON.stringify(task) });
  },

  async update(id, task) {
    if (CONFIG.USE_MOCK) {
      const i = MOCK.tasks.findIndex(t => t._id === id);
      const rev = parseInt(MOCK.tasks[i]._rev, 10) + 1;
      MOCK.tasks[i] = { ...MOCK.tasks[i], ...task, _rev: `${rev}-mock` };
      return MOCK.tasks[i];
    }
    return http(`/tasks/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(task) });
  },

  async remove(id) {
    if (CONFIG.USE_MOCK) {
      MOCK.tasks = MOCK.tasks.filter(t => t._id !== id);
      return { ok: true };
    }
    return http(`/tasks/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },
};
