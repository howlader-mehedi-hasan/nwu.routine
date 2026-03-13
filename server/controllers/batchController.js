const dbRepository = require('../repositories/dbRepository');
const { logActivity } = require('./auditLogController');

const COLLECTION = 'batches';

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
        res.status(404).json({ message: 'Batch not found' });
    }
};

exports.create = (req, res) => {
    const newItem = req.body;
    if (!newItem.name) {
        return res.status(400).json({ message: 'Batch Name is required' });
    }
    const created = dbRepository.create(COLLECTION, newItem);
    
    logActivity(req.user.id, req.user.username, 'Create Batch', `Created new batch: ${newItem.name}.`);

    res.status(201).json(created);
};

exports.update = (req, res) => {
    const id = req.params.id;
    const updates = req.body;
    const updated = dbRepository.update(COLLECTION, id, updates);
    if (updated) {
        logActivity(req.user.id, req.user.username, 'Update Batch', `Updated batch: ${updated.name} (ID: ${id}).`);
        res.json(updated);
    } else {
        res.status(404).json({ message: 'Batch not found' });
    }
};

exports.delete = (req, res) => {
    const id = req.params.id;
    const success = dbRepository.delete(COLLECTION, id);
    if (success) {
        logActivity(req.user.id, req.user.username, 'Delete Batch', `Deleted batch ID: ${id}.`);
        res.json({ message: 'Deleted successfully' });
    } else {
        res.status(404).json({ message: 'Batch not found' });
    }
};
