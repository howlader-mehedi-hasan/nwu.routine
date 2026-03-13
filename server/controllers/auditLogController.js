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
