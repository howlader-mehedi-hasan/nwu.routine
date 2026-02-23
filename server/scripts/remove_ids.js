const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data');

try {
    const files = fs.readdirSync(dataDir).filter(file => file.endsWith('.json'));

    files.forEach(file => {
        const filePath = path.join(dataDir, file);
        const rawData = fs.readFileSync(filePath, 'utf8');

        let data = JSON.parse(rawData);

        // If the data is an array
        if (Array.isArray(data)) {
            data = data.map(item => {
                const { id, ID, ...rest } = item;
                return rest;
            });
        }
        // If the data is an object (for settings.json)
        else if (data !== null && typeof data === 'object') {
            const { id, ID, ...rest } = data;
            data = rest;

            // Just in case it's a nested structure like settings
            for (let key in data) {
                if (Array.isArray(data[key])) {
                    data[key] = data[key].map(item => {
                        if (typeof item === 'object') {
                            const { id, ID, ...restItem } = item;
                            return restItem;
                        }
                        return item;
                    });
                }
            }
        }

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        console.log(`Removed IDs from ${file}`);
    });

    console.log("ID removal complete.");
} catch (error) {
    console.error("Failed to remove IDs:", error);
}
