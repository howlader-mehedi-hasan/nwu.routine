const fs = require('fs');

const courses = JSON.parse(fs.readFileSync('./data/courses.json', 'utf8'));
const faculties = JSON.parse(fs.readFileSync('./data/faculty.json', 'utf8'));
const rooms = JSON.parse(fs.readFileSync('./data/rooms.json', 'utf8'));


// Build maps for quick lookup
const courseMap = {};
courses.forEach(c => {
    courseMap[c.code.toLowerCase().replace(/[^a-z0-9-]/g, '')] = c.id;
    // Map with dashes removed
    courseMap[c.code.toLowerCase().replace(/[^a-z0-9]/g, '')] = c.id;
    courseMap[c.code] = c.id;
});

const facultyMap = {};
faculties.forEach(f => {
    facultyMap[f.initials.toLowerCase().replace(/[^a-z]/g, '')] = f.id;
    facultyMap[f.initials] = f.id;
});

const roomMap = {};
rooms.forEach(r => {
    roomMap[String(r.room_number)] = r.id; // Map like '301': 301
});

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const times = [
    '08:00-09:15', '09:15-10:30', '10:45-12:00', '12:00-01:15', '02:00-03:15', '03:15-04:30', '04:30-05:45', '05:45-07:00'
];

let db = [];
let idCounter = 1800000000000;

function getId() {
    return String(idCounter++);
}

function processLine(line) {
    if (!line.trim() || line.startsWith('//')) return;

    // line format: "batch_id | Day | time | courseCode | facultyInitials | room_number"
    // Multiple courses can be separated by '&' inside the components (e.g. course1 & course2)
    // Same for faculty and rooms. But let's build string format precisely:
    // batch, dayIdx, timeIdx/rangeIdx(s), Course_Code, Faculty, R-Room
    const parts = line.split('|').map(s => s.trim());
    if (parts.length < 6) {
        console.warn('Skipping invalid line:', line);
        return;
    }

    const batch_id = parseInt(parts[0]);
    const day = days[parseInt(parts[1])];

    // Time can be "0" for first time block or "2-3" for 10:45-01:15 range
    let timeStr = "";
    if (parts[2].includes('-')) {
        const [startIdx, endIdx] = parts[2].split('-').map(Number);
        timeStr = times[startIdx].split('-')[0] + '-' + times[endIdx].split('-')[1];
    } else {
        timeStr = times[parseInt(parts[2])];
    }

    const courseCodes = parts[3].split('&').map(s => s.trim());
    const facultyInitials = parts[4].split('&').map(s => s.trim());
    const roomNumbers = parts[5].split('&').map(s => s.trim().replace('R-', ''));

    // Create an entry per sub-course/faculty pair
    for (let i = 0; i < courseCodes.length; i++) {
        const code = courseCodes[i];
        let cId = courseMap[code] || courseMap[code.toLowerCase().replace(/[^a-z0-9-]/g, '')];
        if (!cId) {
            console.warn(`Course code not found: "${code}" in line:`, line);
            continue; // Or add default
        }

        const fac = facultyInitials[i] || facultyInitials[0];
        let fId = facultyMap[fac];
        if (fac && !fId) {
            let match = faculties.find(x => x.initials.toLowerCase() === fac.toLowerCase());
            if (match) fId = match.id;
            else {
                console.warn(`Faculty not found: "${fac}" in line:`, line);
            }
        }

        const rm = roomNumbers[i] || roomNumbers[0];
        let rId = roomMap[rm];
        if (rm && !rId) {
            console.warn(`Room not found: "${rm}" in line:`, line);
        }

        db.push({
            id: getId(),
            day: day,
            time: timeStr,
            batch_id: batch_id,
            course_id: cId,
            faculty_id: fId || 0,
            room_id: rId || 0
        });
    }
}

// FORMAT OF raw
// batch_id | DayNodeIdx (0-5) | TimeNodeIdx(s) | Course(s) | Faculty(s) | Room(s)
const raw = `
// 1st Year 1st Sem A
401 | 0 | 1 | CSE-1101 | IUH | R-301
401 | 0 | 2-3 | CSE-1102 | IUH | R-302
401 | 0 | 4 | Math-1131 | AZ | R-301
401 | 0 | 5 | Hum-1141 | SMM | R-301

401 | 1 | 5 | Chem-1135 | SR | R-301

401 | 2 | 2 | Hum-1141 | SMM | R-301
401 | 2 | 3 | Chem-1135 | SR | R-301
401 | 2 | 4 | CSE-1101 | IUH | R-301

401 | 3 | 1 | Hum-1143 | HS | R-301
401 | 3 | 2 | Math-1131 | AZ | R-301
401 | 3 | 4 | Phy-1133 | MRZI | R-301

401 | 4 | 5 | Phy-1133 | MRZI | R-301
401 | 4 | 6 | Hum-1143 | HS | R-301
401 | 4 | 7 | Hum-1142 | AAM | R-301

// 1st Year 1st Sem B
402 | 0 | 1 | Chem-1135 | SR | R-305
402 | 0 | 2 | Math-1131 | AZ | R-305
402 | 0 | 3 | Phy-1133 | MRZI | R-305
402 | 0 | 4 | Hum-1141 | SMM | R-305

402 | 1 | 3 | Hum-1143 | TZS | R-305
402 | 1 | 4 | CSE-1101 | IUH | R-305
402 | 1 | 5 | Hum-1142 | AAM | R-305

402 | 2 | 4 | Phy-1133 | MRZI | R-305
402 | 2 | 5 | Chem-1135 | SR | R-305
402 | 2 | 6 | Hum-1141 | SMM | R-305

402 | 3 | 5 | CSE-1102 | IUH | R-302
402 | 3 | 6 | Math-1131 | AZ | R-305

402 | 4 | 5 | Phy-1134 & Chem-1136 | FYP & SR | R-705 & R-505
402 | 4 | 6 | Hum-1143 | TZS | R-305
402 | 4 | 7 | CSE-1101 | IUH | R-305

402 | 5 | 7 | Chem-1136 | SR | R-505
`;

raw.split('\n').forEach(processLine);
fs.writeFileSync('./data/routine_schedule.json', JSON.stringify(db, null, 2), 'utf8');
console.log('Successfully wrote', db.length, 'entries to routine_schedule.json');
