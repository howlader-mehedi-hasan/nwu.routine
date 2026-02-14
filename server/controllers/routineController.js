const dbRepository = require('../repositories/dbRepository');
const axios = require('axios'); // Will need to install axios if not present, or use fetch

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000/optimize';

exports.addRoutineEntry = (req, res) => {
    try {
        const { day, time, batch_id, course_id, faculty_id, room_id } = req.body;

        if (!day || !time || !batch_id || !course_id || !faculty_id || !room_id) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const db = dbRepository._readDB();

        // Create new entry
        const newEntry = {
            id: Date.now().toString(), // Simple unique ID
            day,
            time,
            batch_id: parseInt(batch_id),
            course_id: parseInt(course_id),
            faculty_id: parseInt(faculty_id),
            room_id: parseInt(room_id)
        };

        // Optional: Check for conflicts (Room/Faculty/Batch busy at this time)
        // For now, user requested "manual add", so we trust them or can add checks later.

        if (!db.routine_schedule) {
            db.routine_schedule = [];
        }

        db.routine_schedule.push(newEntry);
        dbRepository._writeDB(db);

        res.json({ message: 'Class added successfully', entry: newEntry });

    } catch (error) {
        console.error("Error adding class:", error.message);
        res.status(500).json({ message: 'Failed to add class', error: error.message });
    }
};

exports.updateRoutineEntry = (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const db = dbRepository._readDB();

        const index = db.routine_schedule.findIndex(entry => entry.id === id);

        if (index === -1) {
            return res.status(404).json({ message: 'Class not found' });
        }

        // Update fields, ensuring IDs are parsed as integers if provided
        const updatedEntry = { ...db.routine_schedule[index], ...updates };
        if (updates.batch_id) updatedEntry.batch_id = parseInt(updates.batch_id);
        if (updates.course_id) updatedEntry.course_id = parseInt(updates.course_id);
        if (updates.faculty_id) updatedEntry.faculty_id = parseInt(updates.faculty_id);
        if (updates.room_id) updatedEntry.room_id = parseInt(updates.room_id);

        db.routine_schedule[index] = updatedEntry;
        dbRepository._writeDB(db);

        res.json({ message: 'Class updated successfully', entry: updatedEntry });
    } catch (error) {
        console.error("Error updating class:", error.message);
        res.status(500).json({ message: 'Failed to update class', error: error.message });
    }
};

exports.deleteRoutineEntry = (req, res) => {
    try {
        const { id } = req.params;
        const db = dbRepository._readDB();

        const initialLength = db.routine_schedule.length;
        db.routine_schedule = db.routine_schedule.filter(entry => entry.id !== id);

        if (db.routine_schedule.length === initialLength) {
            return res.status(404).json({ message: 'Class not found' });
        }

        dbRepository._writeDB(db);
        res.json({ message: 'Class deleted successfully' });
    } catch (error) {
        console.error("Error deleting class:", error.message);
        res.status(500).json({ message: 'Failed to delete class', error: error.message });
    }
};

exports.getRoutine = (req, res) => {
    const routine = dbRepository.getAll('routine_schedule');
    res.json(routine);
};

exports.clearRoutine = (req, res) => {
    try {
        const db = dbRepository._readDB();
        db.routine_schedule = [];
        dbRepository._writeDB(db);
        res.json({ message: 'Routine cleared successfully' });
    } catch (error) {
        console.error("Error clearing routine:", error.message);
        res.status(500).json({ message: 'Failed to clear routine', error: error.message });
    }
};
