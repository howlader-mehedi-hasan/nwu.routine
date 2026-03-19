const dbRepository = require('../repositories/dbRepository');
const { logActivity } = require('./auditLogController');

exports.getSettings = async (req, res) => {
    try {
        const settings = await dbRepository.getSettings();
        res.json({ success: true, data: settings });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        const settings = await dbRepository.updateSettings(req.body);
        
        await logActivity(req.user.id, req.user.username, 'Update Settings', `Updated application settings.`);

        res.json({ success: true, data: settings });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
