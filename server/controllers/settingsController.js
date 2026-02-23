const dbRepository = require('../repositories/dbRepository');

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
        res.json({ success: true, data: settings });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
