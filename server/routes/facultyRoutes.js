const express = require('express');
const router = express.Router();
const facultyController = require('../controllers/facultyController');
const { protect, requirePermission } = require('../middleware/authMiddleware');

router.get('/', facultyController.getAll);
router.get('/:id', facultyController.getById);
router.post('/', protect, requirePermission('manage_faculty'), facultyController.create);
router.put('/:id', protect, requirePermission('manage_faculty'), facultyController.update);
router.delete('/:id', protect, requirePermission('manage_faculty'), facultyController.delete);

module.exports = router;
