const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', roomController.getAll);
router.get('/:id', roomController.getById);
router.post('/', protect, authorize('Super Admin', 'Admin'), roomController.create);
router.put('/:id', protect, authorize('Super Admin', 'Admin'), roomController.update);
router.delete('/:id', protect, authorize('Super Admin', 'Admin'), roomController.delete);

module.exports = router;
