const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');

class DBRepository {
    constructor() {
        this.dataDir = DATA_DIR;
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true });
        }
    }

    _getFilePath(collectionName) {
        return path.join(this.dataDir, `${collectionName}.json`);
    }

    // Helper to read DB for a specific collection
    _readCollection(collectionName) {
        const filePath = this._getFilePath(collectionName);
        try {
            if (fs.existsSync(filePath)) {
                const data = fs.readFileSync(filePath, 'utf8');
                return JSON.parse(data);
            }
        } catch (err) {
            console.error(`Error reading ${collectionName} DB:`, err);
        }

        // Default values based on collection
        if (collectionName === 'settings') return {};
        return [];
    }

    // Helper to write DB for a specific collection
    _writeCollection(collectionName, data) {
        const filePath = this._getFilePath(collectionName);
        try {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
            return true;
        } catch (err) {
            console.error(`Error writing ${collectionName} DB:`, err);
            return false;
        }
    }

    // Generic Get All
    getAll(collectionName) {
        return this._readCollection(collectionName);
    }

    // Generic Get By ID
    getById(collectionName, id) {
        const collection = this._readCollection(collectionName);
        return collection.find(item => item.id == id);
    }

    // Generic Create
    create(collectionName, item) {
        const collection = this._readCollection(collectionName);

        // Generate simple ID if not provided (max id + 1)
        if (!item.id) {
            const maxId = collection.reduce((max, i) => (i.id > max ? i.id : max), 0);
            item.id = maxId + 1;
        }

        collection.push(item);
        this._writeCollection(collectionName, collection);
        return item;
    }

    // Generic Update
    update(collectionName, id, updates) {
        const collection = this._readCollection(collectionName);
        const index = collection.findIndex(item => item.id == id);
        if (index === -1) return null;

        collection[index] = { ...collection[index], ...updates };
        this._writeCollection(collectionName, collection);
        return collection[index];
    }

    // Generic Delete
    delete(collectionName, id) {
        let collection = this._readCollection(collectionName);
        const initialLength = collection.length;

        collection = collection.filter(item => item.id != id);

        if (collection.length < initialLength) {
            this._writeCollection(collectionName, collection);
            return true;
        }
        return false;
    }

    // Settings (special handling)
    getSettings() {
        return this._readCollection('settings');
    }

    updateSettings(updates) {
        const settings = this._readCollection('settings');
        const newSettings = { ...settings, ...updates };
        this._writeCollection('settings', newSettings);
        return newSettings;
    }
}

module.exports = new DBRepository();
