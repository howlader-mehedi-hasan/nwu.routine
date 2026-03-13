const dbRepository = require('../repositories/dbRepository');
const { logActivity } = require('./auditLogController');

const COLLECTION = 'rooms';

exports.getAll = (req, res) => {
    const data = dbRepository.getAll(COLLECTION);
    res.json(data);
};

exports.getById = (req, res) => {
    const id = req.params.id;
    const item = dbRepository.getById(COLLECTION, id);
    if (item) {
        res.json(item);
    } else {
        res.status(404).json({ message: 'Room not found' });
    }
};

exports.create = (req, res) => {
    const newItem = req.body;
    if (!newItem.room_number) {
        return res.status(400).json({ message: 'Room Number is required' });
    }
    const created = dbRepository.create(COLLECTION, newItem);
    
    logActivity(req.user.id, req.user.username, 'Create Room', `Created new room: ${newItem.room_number}.`);

    res.status(201).json(created);
};

exports.update = (req, res) => {
    const id = req.params.id;
    const updates = req.body;
    const updated = dbRepository.update(COLLECTION, id, updates);
    if (updated) {
        logActivity(req.user.id, req.user.username, 'Update Room', `Updated room: ${updated.room_number} (ID: ${id}).`);
        res.json(updated);
    } else {
        res.status(404).json({ message: 'Room not found' });
    }
};

exports.delete = (req, res) => {
    const id = req.params.id;
    const success = dbRepository.delete(COLLECTION, id);
    if (success) {
        logActivity(req.user.id, req.user.username, 'Delete Room', `Deleted room ID: ${id}.`);
        res.json({ message: 'Deleted successfully' });
    } else {
        res.status(404).json({ message: 'Room not found' });
    }
};
