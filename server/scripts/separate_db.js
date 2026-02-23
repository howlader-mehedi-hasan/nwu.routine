const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../data/db.json');
const dataDir = path.join(__dirname, '../data');

try {
    const rawData = fs.readFileSync(dbPath, 'utf8');
    const db = JSON.parse(rawData);

    for (const key of Object.keys(db)) {
        const filePath = path.join(dataDir, `${key}.json`);
        fs.writeFileSync(filePath, JSON.stringify(db[key], null, 2), 'utf8');
        console.log(`Created ${key}.json`);
    }

    // Check files
    console.log("Separation successful.");
} catch (error) {
    console.error("Failed to separate db:", error);
}
