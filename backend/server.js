require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const { initDB } = require('./config/couchdb');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));
app.use('/api', (req, res) => res.status(404).json({ error: 'Route introuvable' }));

// Interface (dossier frontend)
app.use(express.static(path.join(__dirname, '..', 'frontend')));

initDB()
  .then(() => app.listen(PORT, () => console.log(`TaskFlow → http://localhost:${PORT}`)))
  .catch(e => {
    console.error('Impossible de se connecter à CouchDB :', e.message);
    process.exit(1);
  });
