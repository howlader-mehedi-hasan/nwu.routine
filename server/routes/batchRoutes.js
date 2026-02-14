const express = require('express');
const router = express.Router();
const batchController = require('../controllers/batchController');

router.get('/', batchController.getAll);
router.get('/:id', batchController.getById);
router.post('/', batchController.create);
router.put('/:id', batchController.update);
router.delete('/:id', batchController.delete);

module.exports = router;
