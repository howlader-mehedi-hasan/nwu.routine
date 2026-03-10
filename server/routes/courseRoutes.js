const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { protect, requirePermission } = require('../middleware/authMiddleware');

router.get('/', courseController.getAll);
router.get('/:id', courseController.getById);
router.post('/', protect, requirePermission('manage_courses'), courseController.create);
router.put('/:id', protect, requirePermission('manage_courses'), courseController.update);
router.delete('/:id', protect, requirePermission('manage_courses'), courseController.delete);

module.exports = router;
