/* Petites fonctions partagées */

// Transforme les erreurs async en réponse JSON propre
const wrap = fn => (req, res) => fn(req, res).catch(e => {
  console.error(e.message);
  res.status(e.statusCode || 500).json({ error: e.message });
});

// Date du jour au format AAAA-MM-JJ
const today = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

// Échappe les caractères spéciaux d'une recherche (pour $regex)
const escapeRegex = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

module.exports = { wrap, today, escapeRegex };
