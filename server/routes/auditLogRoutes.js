const express = require('express');
const router = express.Router();
const auditLogController = require('../controllers/auditLogController');
const { protect, requirePermission } = require('../middleware/authMiddleware');

router.get('/', protect, requirePermission('view_activity_logs'), auditLogController.getAuditLogs);

module.exports = router;
