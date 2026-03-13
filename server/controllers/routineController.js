const dbRepository = require('../repositories/dbRepository');
const axios = require('axios'); // Will need to install axios if not present, or use fetch
const { logActivity } = require('./auditLogController');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000/optimize';

exports.addRoutineEntry = (req, res) => {
    try {
        const { day, time, batch_id, course_id, faculty_id, room_id } = req.body;

        if (!day || !time || !batch_id || !course_id || !faculty_id) {
            return res.status(400).json({ message: 'All fields are required except room' });
        }

        const newEntry = {
            id: Date.now().toString(), // Simple unique ID
            day,
            time,
            batch_id: parseInt(batch_id),
            course_id: parseInt(course_id),
            faculty_id: parseInt(faculty_id),
            room_id: room_id ? parseInt(room_id) : null
        };

        const created = dbRepository.create('routine_schedule', newEntry);

        logActivity(req.user?.id || 'System', req.user?.username || 'Guest', 'Add Routine Entry', `Added class: ${day} ${time} for batch ${batch_id}.`);

        res.json({ message: 'Class added successfully', entry: created });

    } catch (error) {
        console.error("Error adding class:", error.message);
        res.status(500).json({ message: 'Failed to add class', error: error.message });
    }
};

exports.updateRoutineEntry = (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const parsedUpdates = { ...updates };
        if (updates.batch_id) parsedUpdates.batch_id = parseInt(updates.batch_id);
        if (updates.course_id) parsedUpdates.course_id = parseInt(updates.course_id);
        if (updates.faculty_id) parsedUpdates.faculty_id = parseInt(updates.faculty_id);
        if (updates.room_id) parsedUpdates.room_id = parseInt(updates.room_id);
        else if (updates.room_id === '' || updates.room_id === null) parsedUpdates.room_id = null;

        const updatedEntry = dbRepository.update('routine_schedule', id, parsedUpdates);

        if (!updatedEntry) {
            return res.status(404).json({ message: 'Class not found' });
        }

        logActivity(req.user.id, req.user.username, 'Update Routine Entry', `Updated class entry ${id}.`);

        res.json({ message: 'Class updated successfully', entry: updatedEntry });
    } catch (error) {
        console.error("Error updating class:", error.message);
        res.status(500).json({ message: 'Failed to update class', error: error.message });
    }
};

exports.deleteRoutineEntry = (req, res) => {
    try {
        const { id } = req.params;
        const success = dbRepository.delete('routine_schedule', id);

        if (!success) {
            return res.status(404).json({ message: 'Class not found' });
        }

        logActivity(req.user.id, req.user.username, 'Delete Routine Entry', `Deleted class entry ${id}.`);

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
        // Clear the collection using direct internal collection write
        dbRepository._writeCollection('routine_schedule', []);
        
        logActivity(req.user.id, req.user.username, 'Clear Routine', `Cleared all routine entries.`);

        res.json({ message: 'Routine cleared successfully' });
    } catch (error) {
        console.error("Error clearing routine:", error.message);
        res.status(500).json({ message: 'Failed to clear routine', error: error.message });
    }
};

exports.exportRoutine = (req, res) => {
    try {
        const routine = dbRepository.getAll('routine_schedule');

        // Define filename for download
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `routine_backup_${timestamp}.json`;

        res.setHeader('Content-disposition', `attachment; filename=${filename}`);
        res.setHeader('Content-type', 'application/json');
        res.status(200).send(JSON.stringify(routine, null, 2));

    } catch (error) {
        console.error("Error exporting routine:", error.message);
        res.status(500).json({ message: 'Failed to export routine', error: error.message });
    }
};

exports.importRoutine = (req, res) => {
    try {
        const routineData = req.body;

        if (!Array.isArray(routineData)) {
            return res.status(400).json({ message: 'Invalid format. Expected an array of routine entries.' });
        }

        // Validate basic structure (optional but recommended)
        const isValid = routineData.every(entry =>
            entry.id && entry.day && entry.time && typeof entry.batch_id === 'number'
        );

        if (!isValid) {
            return res.status(400).json({ message: 'Invalid data structure in backup file.' });
        }

        // Overwrite the collection
        dbRepository._writeCollection('routine_schedule', routineData);

        logActivity(req.user.id, req.user.username, 'Import Routine', `Imported ${routineData.length} routine entries from backup.`);

        res.json({ message: 'Routine logic restored successfully.', count: routineData.length });

    } catch (error) {
        console.error("Error importing routine:", error.message);
        res.status(500).json({ message: 'Failed to import routine', error: error.message });
    }
};
