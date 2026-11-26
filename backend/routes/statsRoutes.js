const router = require('express').Router();
const { getStats } = require('../controllers/statsController');

router.get('/', getStats);        // statistiques (vues MapReduce)

module.exports = router;
