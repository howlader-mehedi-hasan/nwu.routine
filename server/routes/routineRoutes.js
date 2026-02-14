const express = require('express');
const router = express.Router();
const routineController = require('../controllers/routineController');

router.post('/add', routineController.addRoutineEntry);
router.put('/:id', routineController.updateRoutineEntry);
router.delete('/clear', routineController.clearRoutine);
router.delete('/:id', routineController.deleteRoutineEntry);
router.get('/', routineController.getRoutine);

module.exports = router;
