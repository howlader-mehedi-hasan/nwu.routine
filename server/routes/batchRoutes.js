const express = require('express');
const router = express.Router();
const batchController = require('../controllers/batchController');
const { protect, requirePermission } = require('../middleware/authMiddleware');

router.get('/', batchController.getAll);
router.get('/:id', batchController.getById);
router.post('/', protect, requirePermission('manage_batches'), batchController.create);
router.put('/:id', protect, requirePermission('manage_batches'), batchController.update);
router.delete('/:id', protect, requirePermission('manage_batches'), batchController.delete);

module.exports = router;
