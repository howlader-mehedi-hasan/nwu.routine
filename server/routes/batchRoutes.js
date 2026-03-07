const express = require('express');
const router = express.Router();
const batchController = require('../controllers/batchController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', batchController.getAll);
router.get('/:id', batchController.getById);
router.post('/', protect, authorize('Super Admin', 'Admin'), batchController.create);
router.put('/:id', protect, authorize('Super Admin', 'Admin'), batchController.update);
router.delete('/:id', protect, authorize('Super Admin', 'Admin'), batchController.delete);

module.exports = router;
