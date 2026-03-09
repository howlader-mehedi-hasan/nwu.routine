const express = require('express');
const router = express.Router();
const routineController = require('../controllers/routineController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/add', protect, authorize('Super Admin'), routineController.addRoutineEntry);
router.put('/:id', protect, authorize('Super Admin'), routineController.updateRoutineEntry);
router.delete('/clear', protect, authorize('Super Admin'), routineController.clearRoutine);
router.get('/export', protect, authorize('Super Admin'), routineController.exportRoutine);
router.post('/import', protect, authorize('Super Admin'), routineController.importRoutine);
router.delete('/:id', protect, authorize('Super Admin'), routineController.deleteRoutineEntry);
router.get('/', routineController.getRoutine);

module.exports = router;
