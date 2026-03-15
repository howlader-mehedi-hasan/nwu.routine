const dbRepository = require('../repositories/dbRepository');

exports.getAuditLogs = (req, res) => {
    try {
        const logs = dbRepository.getAll('audit_logs');
        // Sort by timestamp descending (newest first)
        const sortedLogs = [...logs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        res.json(sortedLogs);
    } catch (error) {
        console.error("Error fetching audit logs:", error.message);
        res.status(500).json({ message: 'Failed to fetch audit logs' });
    }
};
exports.updateAuditLog = (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        const updatedLog = dbRepository.update('audit_logs', id, updates);
        
        if (!updatedLog) {
            return res.status(404).json({ message: 'Audit log not found' });
        }
        
        res.json(updatedLog);
    } catch (error) {
        console.error("Error updating audit log:", error.message);
        res.status(500).json({ message: 'Failed to update audit log' });
    }
};

exports.deleteMultipleAuditLogs = (req, res) => {
    try {
        const { ids } = req.body;
        
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: 'No IDs provided for deletion' });
        }
        
        // Delete each log entry
        ids.forEach(id => {
            dbRepository.delete('audit_logs', id);
        });
        
        // Log the bulk deletion activity
        this.logActivity(
            req.user.id,
            req.user.fullName || req.user.username,
            'Bulk Delete',
            `Deleted ${ids.length} activity log entries`
        );
        
        res.json({ message: `Successfully deleted ${ids.length} logs` });
    } catch (error) {
        console.error("Error bulk deleting audit logs:", error.message);
        res.status(500).json({ message: 'Failed to bulk delete audit logs' });
    }
};

// Helper for internal use in other controllers
exports.logActivity = (userId, fullName, activityType, details) => {
    try {
        const newLog = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            userId,
            fullName,
            activityType,
            details,
            timestamp: new Date().toISOString()
        };
        dbRepository.create('audit_logs', newLog);
    } catch (error) {
        console.error("Logging Error:", error.message);
    }
};
