const express = require('express');
const router = express.Router();
const routineController = require('../controllers/routineController');
const { protect, requirePermission } = require('../middleware/authMiddleware');

router.post('/add', protect, requirePermission(['edit_routine', 'edit_week_routine']), routineController.addRoutineEntry);
router.put('/:id', protect, requirePermission(['edit_routine', 'edit_week_routine']), routineController.updateRoutineEntry);
router.delete('/clear', protect, requirePermission(['edit_routine', 'edit_week_routine']), routineController.clearRoutine);
router.get('/export', protect, requirePermission(['edit_routine', 'edit_week_routine']), routineController.exportRoutine);
router.post('/import', protect, requirePermission(['edit_routine', 'edit_week_routine']), routineController.importRoutine);
router.delete('/:id', protect, requirePermission(['edit_routine', 'edit_week_routine']), routineController.deleteRoutineEntry);
router.get('/', routineController.getRoutine);

module.exports = router;
