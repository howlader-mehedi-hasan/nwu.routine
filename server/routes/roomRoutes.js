const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const { protect, requirePermission } = require('../middleware/authMiddleware');

router.get('/', roomController.getAll);
router.get('/:id', roomController.getById);
router.post('/', protect, requirePermission('manage_rooms'), roomController.create);
router.put('/:id', protect, requirePermission('manage_rooms'), roomController.update);
router.delete('/:id', protect, requirePermission('manage_rooms'), roomController.delete);

module.exports = router;
