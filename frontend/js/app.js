/* =========================================================
   TaskFlow — Interface
   ========================================================= */

/* ---------- Icônes (Lucide, MIT) ---------- */
const ICONS = {
  dashboard: '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>',
  tasks: '<path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  edit: '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/>',
  trash: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  left: '<path d="m15 18-6-6 6-6"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  check: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  layers: '<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/>',
  menu: '<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>',
  database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/>',
  arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  reset: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
};
const icon = (name, size = 16) =>
  `<svg class="i" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;

/* ---------- Utilitaires ---------- */
const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = n => new Intl.NumberFormat('fr-FR').format(Math.round(n));
const pct = (a, b) => (b ? (a / b) * 100 : 0);
const fmtPct = v => v.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' %';
const fmtDate = iso => iso ? new Date(iso + 'T00:00:00').toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const joursEntre = (a, b) => Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 86400000);
const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
const options = (list, value, placeholder) =>
  (placeholder !== undefined ? `<option value="">${esc(placeholder)}</option>` : '') +
  list.map(v => `<option value="${esc(v)}"${v === value ? ' selected' : ''}>${esc(v)}</option>`).join('');

/* ---------- État ---------- */
const FILTRES_VIDES = { q: '', section: '', classe: '', statut: '', typeTache: '', matiere: '', retard: false };
const state = { filtres: { ...FILTRES_VIDES }, page: 1, limit: 15, lignes: new Map() };

/* ---------- Composants ---------- */
const pageHeader = (titre, description, actions = '') => `
  <header class="page-head reveal">
    <div>
      <h1>${titre}</h1>
      <p>${description}</p>
    </div>
    <div class="page-actions">${actions}</div>
  </header>`;

const statusBadge = statut => {
  const cls = { 'Terminée': 'success', 'En cours': 'accent', 'À faire': 'neutral' }[statut] || 'neutral';
  return `<span class="badge badge-${cls}"><span class="dot"></span>${esc(statut)}</span>`;
};

const panelHead = (titre, sous = '', extra = '') => `
  <div class="panel-head">
    <div><h3>${titre}</h3>${sous ? `<p>${sous}</p>` : ''}</div>${extra}
  </div>`;

const emptyState = (titre, texte) => `
  <div class="empty">${icon('inbox', 20)}<strong>${titre}</strong><span>${texte}</span></div>`;

/* =========================================================
   Tableau de bord
   ========================================================= */
async function renderDashboard(view) {
  view.innerHTML = pageHeader('Tableau de bord',
    'Vue d’ensemble de la performance académique, toutes sections confondues.') +
    `<div class="loading">Chargement des indicateurs…</div>`;

  let s;
  try { s = await api.stats(); } catch (e) { return renderErreur(view, e); }
  if (!s.total) {
    view.innerHTML = pageHeader('Tableau de bord', 'Vue d’ensemble de la performance académique.') +
      `<div class="panel">${emptyState('Aucune donnée disponible', 'Ajoutez des tâches pour voir apparaître les indicateurs.')}</div>`;
    return;
  }

  const sections = [...s.sections].sort((a, b) => b.taux - a.taux);
  const classes = [...s.classes].sort((a, b) => b.taux - a.taux);
  const alertes = [...s.classes]
    .map(c => ({ ...c, tauxRetard: pct(c.enRetard, c.total) }))
    .sort((a, b) => b.tauxRetard - a.tauxRetard).slice(0, 6);
  const moyenne = pct(s.terminees, s.total);

  view.innerHTML = `
    ${pageHeader('Tableau de bord', 'Vue d’ensemble de la performance académique, toutes sections confondues.',
      `<span class="meta">${s.meta ? `Calculé par ${esc(s.meta.source)} en ${fmt(s.meta.dureeMs)} ms` : `Mis à jour le ${fmtDate(today())}`}</span>`)}

    <section class="kpis reveal" style="--d:1">
      ${kpi('layers', 'Total des tâches', s.total, `${s.sections.length} sections · ${s.classes.length} classes`)}
      ${kpi('check', 'Tâches terminées', s.terminees, `${fmtPct(moyenne)} du total`, 'success')}
      ${kpi('clock', 'Tâches en cours', s.enCours, `${fmt(s.aFaire)} encore à faire`)}
      ${kpi('alert', 'Tâches en retard', s.enRetard, `${fmtPct(pct(s.enRetard, s.total))} du total`, 'danger')}
    </section>

    <div class="block-title reveal" style="--d:2">
      <h2>Performance académique</h2>
      <p>Classement selon le taux de tâches terminées. Moyenne de l’établissement : <strong>${fmtPct(moyenne)}</strong></p>
    </div>
    <div class="grid-2 reveal" style="--d:2">
      <div class="panel">
        ${panelHead('Classement des sections', `${sections.length} sections`)}
        ${tableClassement(sections, false, moyenne)}
      </div>
      <div class="panel">
        ${panelHead('Classement des classes', 'Les 8 meilleures classes')}
        ${tableClassement(classes.slice(0, 8), true, moyenne)}
      </div>
    </div>

    <div class="block-title reveal" style="--d:3">
      <h2>Alertes</h2>
      <p>Classes dont la proportion de tâches en retard est la plus élevée.</p>
    </div>
    <div class="panel reveal" style="--d:3">
      <div class="table-wrap">
        <table class="table table-compact">
          <thead><tr>
            <th>Classe</th><th class="hide-sm">Section</th><th class="num">En retard</th>
            <th class="col-bar">Taux de retard</th><th class="hide-sm">Niveau</th><th></th>
          </tr></thead>
          <tbody>${alertes.map(c => ligneAlerte(c, alertes[0].tauxRetard)).join('')}</tbody>
        </table>
      </div>
    </div>

    <div class="block-title reveal" style="--d:4">
      <h2>Analyses</h2>
      <p>Répartition des ${fmt(s.total)} tâches enregistrées dans CouchDB.</p>
    </div>
    <div class="grid-2 reveal" style="--d:4">
      <div class="panel">${chartStatut(s)}</div>
      <div class="panel">${chartType(s)}</div>
      <div class="panel">${chartMatiere(s)}</div>
      <div class="panel">${chartClasses(classes, moyenne)}</div>
    </div>`;

  // Lien « Voir les tâches » depuis les alertes
  $$('[data-voir-classe]', view).forEach(b => b.addEventListener('click', () => {
    state.filtres = { ...FILTRES_VIDES, classe: b.dataset.voirClasse, section: REF.sectionOf(b.dataset.voirClasse), retard: true };
    state.page = 1;
    location.hash = '#/taches';
  }));

  animerEntree(view);
}

function kpi(ic, label, valeur, contexte, ton = '') {
  return `
    <div class="kpi ${ton ? 'kpi-' + ton : ''}">
      <div class="kpi-label">${icon(ic, 15)}${label}</div>
      <div class="kpi-value" data-count="${valeur}">${fmt(valeur)}</div>
      <div class="kpi-context">${contexte}</div>
    </div>`;
}

function tableClassement(rows, avecSection, moyenne) {
  return `
    <div class="table-wrap">
      <table class="table table-compact">
        <thead><tr><th class="rank">#</th><th>${avecSection ? 'Classe' : 'Section'}</th>
          <th class="col-bar">Taux de complétion</th><th class="num">Taux</th><th class="num hide-sm">Tâches</th></tr></thead>
        <tbody>
          ${rows.map((r, i) => `
            <tr>
              <td class="rank">${i + 1}</td>
              <td><div class="cell-main">${esc(r.nom)}</div>${avecSection ? `<div class="cell-sub">${esc(r.section)}</div>` : ''}</td>
              <td class="col-bar">
                <div class="bar" data-tip="${esc(r.nom)} : ${fmt(r.terminees)} terminées sur ${fmt(r.total)}">
                  <span class="bar-fill ${r.taux < moyenne - 5 ? 'is-warning' : ''}" style="--w:${r.taux.toFixed(1)}%"></span>
                  <span class="bar-mark" style="left:${moyenne.toFixed(1)}%"></span>
                </div>
              </td>
              <td class="num strong">${fmtPct(r.taux)}</td>
              <td class="num muted hide-sm">${fmt(r.total)}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

function ligneAlerte(c, max) {
  const niveau = c.tauxRetard >= 25 ? ['danger', 'Critique'] : c.tauxRetard >= 15 ? ['warning', 'À surveiller'] : ['neutral', 'Modéré'];
  return `
    <tr>
      <td><div class="cell-main">${esc(c.nom)}</div></td>
      <td class="hide-sm muted">${esc(c.section)}</td>
      <td class="num strong">${fmt(c.enRetard)}</td>
      <td class="col-bar">
        <div class="bar-inline">
          <div class="bar"><span class="bar-fill is-danger" style="--w:${pct(c.tauxRetard, max).toFixed(1)}%"></span></div>
          <span class="num">${fmtPct(c.tauxRetard)}</span>
        </div>
      </td>
      <td class="hide-sm"><span class="badge badge-${niveau[0]}"><span class="dot"></span>${niveau[1]}</span></td>
      <td class="num"><button class="btn btn-link" data-voir-classe="${esc(c.nom)}"><span class="hide-sm">Voir les tâches</span>${icon('arrow', 14)}</button></td>
    </tr>`;
}

/* ---------- Graphiques (HTML/CSS, sans dépendance) ---------- */
const SERIES = [
  { key: 'terminees', label: 'Terminée', cls: 's-success' },
  { key: 'enCours', label: 'En cours', cls: 's-accent' },
  { key: 'aFaire', label: 'À faire', cls: 's-neutral' },
];

const legende = () => `<div class="legend">${SERIES.map(x => `<span><i class="${x.cls}"></i>${x.label}</span>`).join('')}</div>`;

const stack = (o, nom) => `
  <div class="stack">
    ${SERIES.map(x => {
      const p = pct(o[x.key], o.total);
      return `<span class="${x.cls}" style="--w:${p.toFixed(2)}%" data-tip="${esc(nom)} · ${x.label} : ${fmt(o[x.key])} (${fmtPct(p)})"></span>`;
    }).join('')}
  </div>`;

function chartStatut(s) {
  return `
    ${panelHead('Répartition par statut', `Dont <strong class="text-danger">${fmt(s.enRetard)}</strong> tâches en retard`)}
    <div class="chart-body">
      ${stack(s, 'Toutes les tâches').replace('class="stack"', 'class="stack stack-lg"')}
      <div class="stat-list">
        ${SERIES.map(x => `
          <div class="stat-row">
            <span class="stat-label"><i class="${x.cls}"></i>${x.label}</span>
            <span class="num strong">${fmt(s[x.key])}</span>
            <span class="num muted">${fmtPct(pct(s[x.key], s.total))}</span>
          </div>`).join('')}
        <div class="stat-row stat-row-danger">
          <span class="stat-label"><i class="s-danger"></i>En retard (non terminées)</span>
          <span class="num strong">${fmt(s.enRetard)}</span>
          <span class="num muted">${fmtPct(pct(s.enRetard, s.total))}</span>
        </div>
      </div>
    </div>`;
}

function chartType(s) {
  const types = REFERENTIEL.types.filter(t => s.parType[t]);
  return `
    ${panelHead('Répartition par type', 'Avancement des devoirs, projets et examens', legende())}
    <div class="chart-body rows">
      ${types.map(t => {
        const o = s.parType[t];
        return `
          <div class="row-chart">
            <div class="row-label"><span class="cell-main">${t}</span><span class="cell-sub">${fmt(o.total)} tâches</span></div>
            ${stack(o, t)}
            <span class="num strong">${fmtPct(pct(o.terminees, o.total))}</span>
          </div>`;
      }).join('')}
    </div>`;
}

function chartMatiere(s) {
  const list = Object.entries(s.parMatiere).map(([nom, o]) => ({ nom, ...o }))
    .sort((a, b) => b.total - a.total).slice(0, 8);
  const max = Math.max(...list.map(m => m.total));
  return `
    ${panelHead('Répartition par matière', 'Les 8 matières les plus représentées')}
    <div class="chart-body rows">
      ${list.map(m => `
        <div class="row-chart">
          <div class="row-label"><span class="cell-main">${esc(m.nom)}</span></div>
          <div class="bar bar-lg" data-tip="${esc(m.nom)} : ${fmt(m.total)} tâches · ${fmtPct(pct(m.terminees, m.total))} terminées">
            <span class="bar-fill is-slate" style="--w:${pct(m.total, max).toFixed(1)}%"></span>
          </div>
          <span class="num strong">${fmt(m.total)}</span>
        </div>`).join('')}
    </div>`;
}

function chartClasses(classes, moyenne) {
  const list = [...classes].sort((a, b) => a.nom.localeCompare(b.nom));
  return `
    ${panelHead('Comparaison des classes', 'Taux de complétion par classe',
      `<div class="legend"><span><i class="line-mark"></i>Moyenne ${fmtPct(moyenne)}</span></div>`)}
    <div class="chart-body">
      <div class="columns-wrap">
        <div class="columns">
          <div class="grid-lines"><span>100 %</span><span>50 %</span><span>0 %</span></div>
          <div class="avg-line" style="bottom:${moyenne.toFixed(1)}%"></div>
          ${list.map(c => `
            <div class="col" data-tip="${esc(c.nom)} · ${esc(c.section)} : ${fmtPct(c.taux)}">
              <span class="col-fill ${c.taux < moyenne - 5 ? 'is-warning' : ''}" style="--h:${c.taux.toFixed(1)}%"></span>
            </div>`).join('')}
        </div>
        <div class="col-labels">${list.map(c => `<span>${esc(c.nom).replace('-', '<br>')}</span>`).join('')}</div>
      </div>
    </div>`;
}

/* =========================================================
   Gestion des tâches
   ========================================================= */
function renderTasks(view) {
  const f = state.filtres;
  view.innerHTML = `
    ${pageHeader('Gestion des tâches',
      'Consultez, filtrez et mettez à jour les devoirs, projets et examens de l’établissement.',
      `<button class="btn btn-primary" id="btnNouvelle">${icon('plus')}Nouvelle tâche</button>`)}

    <div class="panel reveal" style="--d:1">
      <div class="toolbar">
        <label class="search">
          ${icon('search')}
          <input id="fQ" type="search" placeholder="Rechercher par titre…" value="${esc(f.q)}" aria-label="Rechercher">
        </label>
        <div class="filters" aria-label="Filtrer les résultats">
          <select id="fSection" aria-label="Section">${options(REF.sections(), f.section, 'Toutes les sections')}</select>
          <select id="fClasse" aria-label="Classe">${options(REF.classes(f.section), f.classe, 'Toutes les classes')}</select>
          <select id="fStatut" aria-label="Statut">${options(REFERENTIEL.statuts, f.statut, 'Tous les statuts')}</select>
          <select id="fType" aria-label="Type">${options(REFERENTIEL.types, f.typeTache, 'Tous les types')}</select>
          <select id="fMatiere" aria-label="Matière">${options(REF.matieres(f.section), f.matiere, 'Toutes les matières')}</select>
          <label class="toggle"><input type="checkbox" id="fRetard" ${f.retard ? 'checked' : ''}><span></span>En retard</label>
          <button class="btn btn-ghost btn-sm" id="btnReset" title="Réinitialiser les filtres">${icon('reset', 14)}Réinitialiser</button>
        </div>
      </div>

      <div class="table-wrap">
        <table class="table table-tasks">
          <thead><tr>
            <th>Tâche</th><th>Type</th><th>Classe</th><th>Statut</th>
            <th class="hide-md">Priorité</th><th>Date limite</th><th class="actions"><span class="sr-only">Actions</span></th>
          </tr></thead>
          <tbody id="tbody"></tbody>
        </table>
      </div>
      <div class="pager" id="pager"></div>
    </div>`;

  const set = (k, v) => { state.filtres[k] = v; state.page = 1; chargerTable(); };
  $('#fQ').addEventListener('input', debounce(e => set('q', e.target.value), 250));
  $('#fSection').addEventListener('change', e => {
    state.filtres.section = e.target.value;
    state.filtres.classe = '';
    state.filtres.matiere = '';
    $('#fClasse').innerHTML = options(REF.classes(e.target.value), '', 'Toutes les classes');
    $('#fMatiere').innerHTML = options(REF.matieres(e.target.value), '', 'Toutes les matières');
    state.page = 1; chargerTable();
  });
  $('#fClasse').addEventListener('change', e => set('classe', e.target.value));
  $('#fStatut').addEventListener('change', e => set('statut', e.target.value));
  $('#fType').addEventListener('change', e => set('typeTache', e.target.value));
  $('#fMatiere').addEventListener('change', e => set('matiere', e.target.value));
  $('#fRetard').addEventListener('change', e => set('retard', e.target.checked));
  $('#btnReset').addEventListener('click', () => { state.filtres = { ...FILTRES_VIDES }; state.page = 1; renderTasks(view); animerEntree(view); });
  $('#btnNouvelle').addEventListener('click', () => ouvrirFormulaire());

  $('#tbody').addEventListener('click', e => {
    const b = e.target.closest('button[data-action]');
    if (!b) return;
    const t = state.lignes.get(b.dataset.id);
    if (b.dataset.action === 'edit') ouvrirFormulaire(t);
    if (b.dataset.action === 'delete') confirmerSuppression(t);
  });
  $('#pager').addEventListener('click', e => {
    const b = e.target.closest('button[data-page]');
    if (!b || b.disabled) return;
    state.page = Number(b.dataset.page);
    chargerTable();
  });

  chargerTable();
  animerEntree(view);
}

async function chargerTable() {
  const tbody = $('#tbody');
  if (!tbody) return;
  tbody.classList.add('is-loading');
  let res;
  try { res = await api.listTasks(state.filtres, state.page, state.limit); }
  catch (e) {
    tbody.innerHTML = `<tr><td colspan="7">${emptyState('Impossible de charger les tâches', esc(e.message))}</td></tr>`;
    tbody.classList.remove('is-loading');
    return;
  }
  const pages = Math.max(1, Math.ceil(res.total / state.limit));
  if (state.page > pages) { state.page = pages; return chargerTable(); }

  state.lignes = new Map(res.docs.map(t => [t._id, t]));
  tbody.innerHTML = res.docs.length
    ? res.docs.map(ligneTache).join('')
    : `<tr><td colspan="7">${emptyState('Aucune tâche ne correspond à vos filtres', 'Modifiez la recherche ou réinitialisez les filtres.')}</td></tr>`;
  tbody.classList.remove('is-loading');
  $('#pager').innerHTML = pagination(res.total, pages);
}

function ligneTache(t) {
  const retard = estEnRetard(t);
  const auj = today();
  let echeance = '';
  if (retard) echeance = `<span class="cell-sub text-danger">En retard de ${joursEntre(t.dateLimite, auj)} j</span>`;
  else if (t.statut !== 'Terminée') {
    const j = joursEntre(auj, t.dateLimite);
    if (j <= 3) echeance = `<span class="cell-sub text-warning">${j === 0 ? 'Aujourd’hui' : `Dans ${j} j`}</span>`;
  }
  return `
    <tr class="${retard ? 'is-overdue' : ''}">
      <td class="cell-task">
        <div class="cell-main">${esc(t.titre)}</div>
        <div class="cell-sub">${esc(t.matiere)}${t.etudiant ? ' · ' + esc(t.etudiant) : ''}</div>
      </td>
      <td><span class="tag">${esc(t.typeTache)}</span></td>
      <td><div class="cell-main">${esc(t.classe)}</div><div class="cell-sub">${esc(t.section)}</div></td>
      <td>${statusBadge(t.statut)}</td>
      <td class="hide-md"><span class="prio prio-${(t.priorite || '').toLowerCase()}">${esc(t.priorite)}</span></td>
      <td class="cell-date"><div>${fmtDate(t.dateLimite)}</div>${echeance}</td>
      <td class="actions">
        <button class="icon-btn" data-action="edit" data-id="${esc(t._id)}" title="Modifier" aria-label="Modifier">${icon('edit', 15)}</button>
        <button class="icon-btn icon-btn-danger" data-action="delete" data-id="${esc(t._id)}" title="Supprimer" aria-label="Supprimer">${icon('trash', 15)}</button>
      </td>
    </tr>`;
}

function pagination(total, pages) {
  const p = state.page;
  const debut = total ? (p - 1) * state.limit + 1 : 0;
  const fin = Math.min(total, p * state.limit);
  const nums = [...new Set([1, p - 1, p, p + 1, pages])].filter(n => n >= 1 && n <= pages).sort((a, b) => a - b);
  let html = '', prev = 0;
  for (const n of nums) {
    if (n - prev > 1) html += `<span class="ellipsis">…</span>`;
    html += `<button class="page-btn ${n === p ? 'is-active' : ''}" data-page="${n}" ${n === p ? 'aria-current="page"' : ''}>${fmt(n)}</button>`;
    prev = n;
  }
  return `
    <span class="pager-info">${fmt(debut)}–${fmt(fin)} sur ${fmt(total)} tâche${total > 1 ? 's' : ''}</span>
    <div class="pager-nav">
      <button class="page-btn" data-page="${p - 1}" ${p <= 1 ? 'disabled' : ''} aria-label="Page précédente">${icon('left', 14)}</button>
      ${html}
      <button class="page-btn" data-page="${p + 1}" ${p >= pages ? 'disabled' : ''} aria-label="Page suivante">${icon('right', 14)}</button>
    </div>`;
}

/* ---------- Formulaire (création / modification) ---------- */
function ouvrirFormulaire(t = null) {
  const v = t || {
    titre: '', description: '', typeTache: 'Devoir', section: REF.sections()[0], classe: '', matiere: '',
    priorite: 'Moyenne', statut: 'À faire', dateLimite: addDays(today(), 7), etudiant: '',
  };
  ouvrirModal(`
    <form id="taskForm" novalidate>
      <div class="modal-head">
        <div>
          <h2>${t ? 'Modifier la tâche' : 'Nouvelle tâche'}</h2>
          <p>${t ? `Document <code>${esc(t._id)}</code> · révision <code>${esc((t._rev || '').split('-')[0])}</code>` : 'La tâche sera enregistrée comme un document JSON dans CouchDB.'}</p>
        </div>
        <button type="button" class="icon-btn" data-close aria-label="Fermer">${icon('x')}</button>
      </div>
      <div class="modal-body form-grid">
        <label class="field span-2"><span>Titre</span>
          <input name="titre" required maxlength="120" value="${esc(v.titre)}" placeholder="Ex. Mini-projet — Bases de données">
          <small class="error-msg">Le titre est obligatoire.</small>
        </label>
        <label class="field span-2"><span>Description <em>facultatif</em></span>
          <textarea name="description" rows="2" placeholder="Consignes, livrables…">${esc(v.description)}</textarea>
        </label>
        <label class="field"><span>Type</span><select name="typeTache">${options(REFERENTIEL.types, v.typeTache)}</select></label>
        <label class="field"><span>Priorité</span><select name="priorite">${options(REFERENTIEL.priorites, v.priorite)}</select></label>
        <label class="field"><span>Section</span><select name="section">${options(REF.sections(), v.section)}</select></label>
        <label class="field"><span>Classe</span><select name="classe">${options(REF.classes(v.section), v.classe)}</select></label>
        <label class="field"><span>Matière</span><select name="matiere">${options(REF.matieres(v.section), v.matiere)}</select></label>
        <label class="field"><span>Étudiant <em>facultatif</em></span><input name="etudiant" value="${esc(v.etudiant)}" placeholder="Nom de l’étudiant"></label>
        <label class="field"><span>Statut</span><select name="statut">${options(REFERENTIEL.statuts, v.statut)}</select></label>
        <label class="field"><span>Date limite</span>
          <input type="date" name="dateLimite" required value="${esc(v.dateLimite)}">
          <small class="error-msg">La date limite est obligatoire.</small>
        </label>
      </div>
      <div class="modal-foot">
        <button type="button" class="btn btn-ghost" data-close>Annuler</button>
        <button type="submit" class="btn btn-primary">${t ? 'Enregistrer les modifications' : 'Créer la tâche'}</button>
      </div>
    </form>`);

  const form = $('#taskForm');
  form.section.addEventListener('change', () => {
    form.classe.innerHTML = options(REF.classes(form.section.value), '');
    form.matiere.innerHTML = options(REF.matieres(form.section.value), '');
  });
  form.addEventListener('submit', async e => {
    e.preventDefault();
    let ok = true;
    for (const el of [form.titre, form.dateLimite]) {
      const invalide = !el.value.trim();
      el.closest('.field').classList.toggle('has-error', invalide);
      if (invalide) ok = false;
    }
    if (!ok) return;
    const data = Object.fromEntries(new FormData(form));
    data.titre = data.titre.trim();
    const btn = form.querySelector('[type=submit]');
    btn.disabled = true;
    try {
      t ? await api.update(t._id, data) : await api.create(data);
      fermerModal();
      toast(t ? 'Tâche mise à jour' : 'Tâche créée');
      rafraichir();
    } catch (err) {
      btn.disabled = false;
      toast('Erreur : ' + err.message, true);
    }
  });
  setTimeout(() => form.titre.focus(), 50);
}

function confirmerSuppression(t) {
  ouvrirModal(`
    <div class="modal-head">
      <div><h2>Supprimer la tâche</h2>
      <p>« ${esc(t.titre)} » (${esc(t.classe)}) sera définitivement supprimée de la base. Cette action est irréversible.</p></div>
      <button type="button" class="icon-btn" data-close aria-label="Fermer">${icon('x')}</button>
    </div>
    <div class="modal-foot">
      <button class="btn btn-ghost" data-close>Annuler</button>
      <button class="btn btn-danger" id="btnConfirmer">Supprimer</button>
    </div>`, 'modal-sm');
  $('#btnConfirmer').addEventListener('click', async () => {
    try {
      await api.remove(t._id);
      fermerModal();
      toast('Tâche supprimée');
      rafraichir();
    } catch (err) { toast('Erreur : ' + err.message, true); }
  });
}

/* ---------- Modale, toast, infobulle ---------- */
let focusAvant = null;
function ouvrirModal(html, taille = '') {
  const root = $('#modal'), box = $('#modalBox');
  focusAvant = document.activeElement;
  box.className = 'modal ' + taille;
  box.innerHTML = html;
  root.hidden = false;
  requestAnimationFrame(() => root.classList.add('is-open'));
  $$('[data-close]', box).forEach(b => b.addEventListener('click', fermerModal));
}
function fermerModal() {
  const root = $('#modal');
  root.classList.remove('is-open');
  setTimeout(() => { root.hidden = true; $('#modalBox').innerHTML = ''; focusAvant?.focus?.(); }, reduceMotion() ? 0 : 160);
}

let toastTimer;
function toast(msg, erreur = false) {
  const el = $('#toast');
  el.innerHTML = (erreur ? icon('alert', 15) : icon('check', 15)) + esc(msg);
  el.classList.toggle('is-error', erreur);
  el.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-visible'), 2600);
}

function initInfobulles() {
  const tip = $('#tooltip');
  document.addEventListener('mouseover', e => {
    const el = e.target.closest('[data-tip]');
    if (!el) return tip.classList.remove('is-visible');
    tip.textContent = el.dataset.tip;
    tip.classList.add('is-visible');
  });
  document.addEventListener('mousemove', e => {
    if (!tip.classList.contains('is-visible')) return;
    const x = Math.min(e.clientX + 12, window.innerWidth - tip.offsetWidth - 8);
    tip.style.transform = `translate(${x}px, ${e.clientY + 14}px)`;
  });
}

/* ---------- Animations ---------- */
function animerEntree(view) {
  requestAnimationFrame(() => requestAnimationFrame(() => view.classList.add('is-in')));
  if (reduceMotion()) return;
  $$('[data-count]', view).forEach(el => {
    const cible = Number(el.dataset.count), duree = 700, t0 = performance.now();
    const pas = now => {
      const k = Math.min(1, (now - t0) / duree);
      el.textContent = fmt(cible * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(pas);
    };
    requestAnimationFrame(pas);
  });
}

function renderErreur(view, e) {
  view.innerHTML = pageHeader('Tableau de bord', 'Vue d’ensemble de la performance académique.') +
    `<div class="panel">${emptyState('Impossible de joindre le serveur', `${esc(e.message)}. Vérifiez que le backend est démarré sur ${esc(CONFIG.API_URL)}.`)}</div>`;
}

/* ---------- Routeur ---------- */
const ROUTES = {
  '#/tableau-de-bord': renderDashboard,
  '#/taches': renderTasks,
};
function rafraichir() {
  if (location.hash === '#/taches') chargerTable();
  else router();
}
function router() {
  const hash = ROUTES[location.hash] ? location.hash : '#/tableau-de-bord';
  $$('[data-route]').forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === hash));
  const view = $('#view');
  view.classList.remove('is-in');
  window.scrollTo(0, 0);
  document.body.classList.remove('nav-open');
  ROUTES[hash](view);
}

/* ---------- Démarrage ---------- */
function init() {
  $$('[data-icon]').forEach(el => el.insertAdjacentHTML('afterbegin', icon(el.dataset.icon, el.dataset.size || 16)));
  $('#source').innerHTML = CONFIG.USE_MOCK
    ? `<span class="source-dot is-mock"></span>Données de démonstration`
    : `<span class="source-dot"></span>CouchDB · taskflow_db`;
  $('#menuBtn').addEventListener('click', () => document.body.classList.toggle('nav-open'));
  $('#scrim').addEventListener('click', () => document.body.classList.remove('nav-open'));
  $('#modal').addEventListener('mousedown', e => { if (e.target.id === 'modal') fermerModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#modal').hidden) fermerModal(); });
  initInfobulles();
  window.addEventListener('hashchange', router);
  router();
}
init();
