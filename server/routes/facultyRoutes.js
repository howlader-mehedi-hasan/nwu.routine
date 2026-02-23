const express = require('express');
const router = express.Router();
const facultyController = require('../controllers/facultyController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', facultyController.getAll);
router.get('/:id', facultyController.getById);
router.post('/', protect, authorize('Super Admin', 'Admin'), facultyController.create);
router.put('/:id', protect, authorize('Super Admin', 'Admin'), facultyController.update);
router.delete('/:id', protect, authorize('Super Admin', 'Admin'), facultyController.delete);

module.exports = router;
