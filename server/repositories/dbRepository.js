const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../data/db.json');

class DBRepository {
    constructor() {
        this.dbPath = DB_PATH;
    }

    // Helper to read DB
    _readDB() {
        try {
            const data = fs.readFileSync(this.dbPath, 'utf8');
            return JSON.parse(data);
        } catch (err) {
            console.error("Error reading DB:", err);
            return {};
        }
    }

    // Helper to write DB
    _writeDB(data) {
        try {
            fs.writeFileSync(this.dbPath, JSON.stringify(data, null, 2));
            return true;
        } catch (err) {
            console.error("Error writing DB:", err);
            return false;
        }
    }

    // Generic Get All
    getAll(collectionName) {
        const db = this._readDB();
        return db[collectionName] || [];
    }

    // Generic Get By ID
    getById(collectionName, id) {
        const db = this._readDB();
        const collection = db[collectionName] || [];
        return collection.find(item => item.id == id);
    }

    // Generic Create
    create(collectionName, item) {
        const db = this._readDB();
        if (!db[collectionName]) db[collectionName] = [];

        // Generate simple ID if not provided (max id + 1)
        if (!item.id) {
            const maxId = db[collectionName].reduce((max, i) => (i.id > max ? i.id : max), 0);
            item.id = maxId + 1;
        }

        db[collectionName].push(item);
        this._writeDB(db);
        return item;
    }

    // Generic Update
    update(collectionName, id, updates) {
        const db = this._readDB();
        if (!db[collectionName]) return null;

        const index = db[collectionName].findIndex(item => item.id == id);
        if (index === -1) return null;

        db[collectionName][index] = { ...db[collectionName][index], ...updates };
        this._writeDB(db);
        return db[collectionName][index];
    }

    // Generic Delete
    delete(collectionName, id) {
        const db = this._readDB();
        if (!db[collectionName]) return false;

        const initialLength = db[collectionName].length;
        db[collectionName] = db[collectionName].filter(item => item.id != id);

        if (db[collectionName].length < initialLength) {
            this._writeDB(db);
            return true;
        }
        return false;
    }

    // Settings
    getSettings() {
        const db = this._readDB();
        return db.settings || {};
    }

    updateSettings(updates) {
        const db = this._readDB();
        db.settings = { ...(db.settings || {}), ...updates };
        this._writeDB(db);
        return db.settings;
    }
}

module.exports = new DBRepository();
