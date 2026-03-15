const express = require('express');
const router = express.Router();
const auditLogController = require('../controllers/auditLogController');
const { protect, requirePermission } = require('../middleware/authMiddleware');

router.get('/', protect, requirePermission('view_activity_logs'), auditLogController.getAuditLogs);
router.put('/:id', protect, requirePermission('view_activity_logs'), (req, res, next) => {
    // Extra check to ensure ONLY Super Admin can edit
    if (req.user.role !== 'Super Admin') {
        return res.status(403).json({ message: 'Only Super Admin can edit activity logs' });
    }
    next();
}, auditLogController.updateAuditLog);

router.post('/delete-multiple', protect, requirePermission('view_activity_logs'), (req, res, next) => {
    // Extra check for Super Admin
    if (req.user.role !== 'Super Admin') {
        return res.status(403).json({ message: 'Only Super Admin can delete activity logs' });
    }
    next();
}, auditLogController.deleteMultipleAuditLogs);

module.exports = router;
