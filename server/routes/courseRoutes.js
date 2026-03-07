const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', courseController.getAll);
router.get('/:id', courseController.getById);
router.post('/', protect, authorize('Super Admin', 'Admin'), courseController.create);
router.put('/:id', protect, authorize('Super Admin', 'Admin'), courseController.update);
router.delete('/:id', protect, authorize('Super Admin', 'Admin'), courseController.delete);

module.exports = router;
