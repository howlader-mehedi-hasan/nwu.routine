const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../data/db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Default Room ID is 301 (as found)
const DEFAULT_ROOM_ID = 301;

let updatedCount = 0;

if (db.batches) {
    db.batches = db.batches.map(batch => {
        if (!batch.default_room_id) {
            batch.default_room_id = DEFAULT_ROOM_ID;
            updatedCount++;
        }
        return batch;
    });
}

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
console.log(`Updated ${updatedCount} batches with default_room_id = ${DEFAULT_ROOM_ID}`);
