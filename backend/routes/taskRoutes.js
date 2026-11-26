const router = require('express').Router();
const c = require('../controllers/taskController');

router.get('/', c.getAll);        // liste + filtres + pagination
router.get('/:id', c.getOne);     // une tâche
router.post('/', c.create);       // créer
router.put('/:id', c.update);     // modifier
router.delete('/:id', c.remove);  // supprimer

module.exports = router;
