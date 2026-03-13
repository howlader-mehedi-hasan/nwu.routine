const dbRepository = require('../repositories/dbRepository');
const { logActivity } = require('./auditLogController');

exports.getSettings = (req, res) => {
    try {
        const settings = dbRepository.getSettings();
        res.json({ success: true, data: settings });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateSettings = (req, res) => {
    try {
        const settings = dbRepository.updateSettings(req.body);
        
        logActivity(req.user.id, req.user.username, 'Update Settings', `Updated application settings.`);

        res.json({ success: true, data: settings });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
