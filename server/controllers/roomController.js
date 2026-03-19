const dbRepository = require('../repositories/dbRepository');
const { logActivity } = require('./auditLogController');

const COLLECTION = 'rooms';

exports.getAll = async (req, res) => {
    try {
        const data = await dbRepository.getAll(COLLECTION);
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const id = req.params.id;
        const item = await dbRepository.getById(COLLECTION, id);
        if (item) {
            res.json(item);
        } else {
            res.status(404).json({ message: 'Room not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const newItem = req.body;
        if (!newItem.room_number) {
            return res.status(400).json({ message: 'Room Number is required' });
        }
        const created = await dbRepository.create(COLLECTION, newItem);
        
        logActivity(req.user.id, req.user.username, 'Create Room', `Created new room: ${newItem.room_number}.`);

        res.status(201).json(created);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        const updates = req.body;
        const updated = await dbRepository.update(COLLECTION, id, updates);
        if (updated) {
            logActivity(req.user.id, req.user.username, 'Update Room', `Updated room: ${updated.room_number} (ID: ${id}).`);
            res.json(updated);
        } else {
            res.status(404).json({ message: 'Room not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        const success = await dbRepository.delete(COLLECTION, id);
        if (success) {
            logActivity(req.user.id, req.user.username, 'Delete Room', `Deleted room ID: ${id}.`);
            res.json({ message: 'Deleted successfully' });
        } else {
            res.status(404).json({ message: 'Room not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
