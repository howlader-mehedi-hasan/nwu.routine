const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data');

// Exact ID maps from previous snapshot
const roomsMap = [
    { room_number: "301", id: 301, floor: 3, type: "Theory" },
    { room_number: "305", id: 302, floor: 3, type: "Theory" },
    { room_number: "501", id: 303, floor: 5, type: "Theory" },
    { room_number: "502", id: 304, floor: 5, type: "Theory" },
    { room_number: "503", id: 305, floor: 5, type: "Theory" },
    { room_number: "604", id: 306, floor: 6, type: "Theory" },
    { room_number: "703", id: 307, floor: 7, type: "Theory" },
    { room_number: "504", id: 309, floor: 5, type: "Theory" },
    { room_number: "702", id: 310, floor: 7, type: "Theory" },
    { room_number: "701", id: 311, floor: 7, type: "Theory" },
    { room_number: "903", id: 312, floor: 9, type: "Theory" },
    { room_number: "801", id: 313, floor: 8, type: "Theory" },
    { room_number: "704", id: 314, floor: 7, type: "Theory" },
    { room_number: "901", id: 315, floor: 9, type: "Theory" },
    { room_number: "601", id: 316, floor: 6, type: "Theory" },
    { room_number: "302", id: 317, floor: 3, type: "Lab" },
    { room_number: "303", id: 318, floor: 3, type: "Lab" },
    { room_number: "304", id: 319, floor: 3, type: "Lab" },
    { room_number: "605", id: 320, floor: 6, type: "Theory" },
    { room_number: "705", id: 321, floor: 7, type: "Lab" },
    { room_number: "901", id: 322, floor: 9, type: "Theory" },
    { room_number: "801", id: 323, floor: 8, type: "Theory" },
    { room_number: "903", id: 324, floor: 9, type: "Theory" }
];

try {
    const files = fs.readdirSync(dataDir).filter(file => file.endsWith('.json'));

    files.forEach(file => {
        const filePath = path.join(dataDir, file);
        const rawData = fs.readFileSync(filePath, 'utf8');
        let data = JSON.parse(rawData);

        if (Array.isArray(data)) {
            data = data.map((item, index) => {
                if (file === 'users.json') {
                    item.id = 1;
                } else if (file === 'faculty.json') {
                    item.id = 101 + index;
                } else if (file === 'courses.json') {
                    item.id = 201 + index;
                } else if (file === 'batches.json') {
                    item.id = 401 + index;
                } else if (file === 'routine_schedule.json') {
                    item.id = Date.now().toString() + index;
                } else if (file === 'rooms.json') {
                    // Match room with map exactly to restore skipped increment
                    const match = roomsMap[index];
                    if (match) item.id = match.id;
                    else item.id = 300 + index; // fallback
                }
                return item;
            });
        }

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        console.log(`Restored IDs to ${file}`);
    });

    console.log("ID restore complete.");
} catch (error) {
    console.error("Failed to restore IDs:", error);
}
