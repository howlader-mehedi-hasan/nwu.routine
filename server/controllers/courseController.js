const dbRepository = require('../repositories/dbRepository');

const COLLECTION = 'courses';

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
        res.status(404).json({ message: 'Course not found' });
    }
};

exports.create = (req, res) => {
    const newItem = req.body;
    if (!newItem.code || !newItem.name) {
        return res.status(400).json({ message: 'Code and Name are required' });
    }
    const created = dbRepository.create(COLLECTION, newItem);
    res.status(201).json(created);
};

exports.update = (req, res) => {
    const id = req.params.id;
    const updates = req.body;
    const updated = dbRepository.update(COLLECTION, id, updates);
    if (updated) {
        res.json(updated);
    } else {
        res.status(404).json({ message: 'Course not found' });
    }
};

exports.delete = (req, res) => {
    const id = req.params.id;
    const success = dbRepository.delete(COLLECTION, id);
    if (success) {
        res.json({ message: 'Deleted successfully' });
    } else {
        res.status(404).json({ message: 'Course not found' });
    }
};
