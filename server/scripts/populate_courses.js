const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../data/db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Helper to infer type
const getType = (title) => {
    const t = title.toLowerCase();
    if (t.includes('laboratory') || t.includes('lab') || t.includes(' sessional')) return 'Lab';
    if (t.includes('project') || t.includes('thesis')) return 'Project/Thesis';
    if (t.includes('training')) return 'Training';
    return 'Theory';
};

const courses = [
    // Year: First, Semester: First
    { code: "Chem-1135", name: "Chemistry", credit: 3.00 },
    { code: "Chem-1136", name: "Chemistry Laboratory", credit: 0.75 },
    { code: "CSE-1101", name: "Computer Basics and Programming", credit: 3.00 },
    { code: "CSE-1102", name: "Computer Basics and Programming Laboratory", credit: 1.50 },
    { code: "Hum-1141", name: "English and Human Communication", credit: 3.00 },
    { code: "Hum-1142", name: "English and Human Communication Laboratory", credit: 0.75 },
    { code: "Hum-1143", name: "History of the Emergence of Bangladesh", credit: 3.00 },
    { code: "Math-1131", name: "Engineering Mathematics-I", credit: 3.00 },
    { code: "Phy-1133", name: "Physics-I", credit: 3.00 },
    { code: "Phy-1134", name: "Physics-I Laboratory", credit: 0.75 },

    // Year: First, Semester: Second
    { code: "CSE-1201", name: "Structured Programming", credit: 3.00 },
    { code: "CSE-1202", name: "Structured Programming Laboratory", credit: 1.50 },
    { code: "CSE-1203", name: "Digital Logic Design", credit: 3.00 },
    { code: "CSE-1204", name: "Digital Logic Design Laboratory", credit: 1.50 },
    { code: "EEE-1221", name: "Basic Electrical Circuit", credit: 3.00 },
    { code: "EEE-1222", name: "Basic Electrical Circuit Laboratory", credit: 0.75 },
    { code: "Math-1231", name: "Engineering Mathematics-II", credit: 3.00 },
    { code: "ME-1223", name: "Mechanics and Heat Engineering", credit: 3.00 },
    { code: "ME-1224", name: "Computer Aided Design Laboratory", credit: 0.75 },
    { code: "Phy-1233", name: "Physics-II", credit: 3.00 }, // Note: Image shows 3.00 for credit, usually Physics II has a lab too but not listed in that block? Ah, wait, Phy-1233 is Theory. Previous list had Phy-1234 maybe? Image doesn't show it in that block.

    // Year: Second, Semester: First
    { code: "CSE-2101", name: "Object Oriented Programming", credit: 3.00 },
    { code: "CSE-2102", name: "Object Oriented Programming Laboratory", credit: 1.50 },
    { code: "CSE-2103", name: "Data Structures", credit: 3.00 },
    { code: "CSE-2104", name: "Data Structures Laboratory", credit: 0.75 },
    { code: "CSE-2105", name: "Computer Architecture", credit: 3.00 },
    { code: "CSE-2107", name: "Discrete Mathematics", credit: 3.00 },
    { code: "EEE-2121", name: "Electronic Devices and Circuits", credit: 3.00 },
    { code: "EEE-2122", name: "Electronic Devices and Circuits Laboratory", credit: 0.75 },
    { code: "Math-2131", name: "Engineering Mathematics-III", credit: 3.00 },

    // Year: Second, Semester: Second
    { code: "CSE-2200", name: "Software Development Laboratory", credit: 1.50 },
    { code: "CSE-2201", name: "Database Systems", credit: 3.00 },
    { code: "CSE-2202", name: "Database Systems Laboratory", credit: 1.50 },
    { code: "CSE-2203", name: "Algorithm Analysis and Design", credit: 3.00 },
    { code: "CSE-2204", name: "Algorithm Analysis and Design Laboratory", credit: 0.75 },
    { code: "CSE-2205", name: "Numerical Analysis", credit: 3.00 },
    { code: "CSE-2206", name: "Numerical Analysis Laboratory", credit: 0.75 },
    { code: "EEE-2221", name: "Electrical Drives and Instrumentation", credit: 3.00 }, // Checked code: EEE-2221
    { code: "EEE-2222", name: "Electrical Drives and Instrumentation Laboratory", credit: 0.75 },
    { code: "Hum-2241", name: "Psychology", credit: 3.00 }, // Assuming 3.00 based on typical theory
    { code: "Math-2231", name: "Engineering Mathematics-IV", credit: 3.00 },

    // Year: Third, Semester: First
    { code: "CSE-3101", name: "Microprocessors and Microcontrollers", credit: 3.00 },
    { code: "CSE-3102", name: "Microprocessors and Microcontrollers Laboratory", credit: 0.75 },
    { code: "CSE-3103", name: "Software Engineering", credit: 3.00 },
    { code: "CSE-3104", name: "Software Engineering Laboratory", credit: 0.75 },
    { code: "CSE-3105", name: "Theory of Computation", credit: 3.00 },
    { code: "CSE-3108", name: "Internet Programming Laboratory", credit: 1.50 },
    { code: "CSE-3109", name: "Digital System Design", credit: 3.00 },
    { code: "CSE-3110", name: "Digital System Design Laboratory", credit: 0.75 },
    { code: "CSE-3121", name: "Data Communication", credit: 3.00 },
    { code: "Hum-3141", name: "Engineering Economics and Accounting", credit: 3.00 },

    // Year: Third, Semester: Second
    { code: "CSE-3200", name: "Advanced Programming Laboratory", credit: 1.50 },
    { code: "CSE-3201", name: "System Programming and Operating System", credit: 3.00 },
    { code: "CSE-3202", name: "System Programming and Operating System Laboratory", credit: 1.50 },
    { code: "CSE-3203", name: "Computer Networks", credit: 3.00 },
    { code: "CSE-3204", name: "Computer Networks Laboratory", credit: 0.75 },
    { code: "CSE-3208", name: "Technical Writing and Presentation Laboratory", credit: 0.75 },
    { code: "CSE-3211", name: "Data Warehousing and Mining", credit: 3.00 },
    { code: "CSE-3212", name: "Data Warehousing and Mining Laboratory", credit: 0.75 },
    { code: "Hum-3241", name: "Industrial Management", credit: 3.00 }, // Assuming 3.00
    { code: "Hum-3243", name: "Bengali Language and Literature", credit: 3.00 }, // Wait, image says 3.00? Yes.

    // Year: Fourth, Semester: First
    { code: "CSE-4100", name: "Project / Thesis-I", credit: 1.50 }, // Image says 1.50
    { code: "CSE-4102", name: "Artificial Intelligence Laboratory", credit: 0.75 },
    { code: "CSE-4101", name: "Artificial Intelligence", credit: 3.00 }, // Corrected ID order from image, code sequence is random there
    { code: "CSE-4103", name: "Compiler Design", credit: 3.00 },
    { code: "CSE-4104", name: "Compiler Design Laboratory", credit: 0.75 },
    { code: "CSE-4105", name: "Information Security and Control", credit: 3.00 },
    { code: "CSE-4117", name: "Computer Vision and Image Processing", credit: 3.00 },
    { code: "CSE-4118", name: "Computer Vision and Image Processing Laboratory", credit: 0.75 },
    { code: "CSE-4119", name: "Machine Learning", credit: 3.00 },
    { code: "CSE-4120", name: "Machine Learning Laboratory", credit: 0.75 },

    // Year: Fourth, Semester: Second
    { code: "CSE-4200", name: "Project / Thesis-II", credit: 3.00 },
    { code: "CSE-4205", name: "Applied Probability and Queuing Theory", credit: 3.00 },
    { code: "CSE-4201", name: "Computer Graphics", credit: 3.00 },
    { code: "CSE-4202", name: "Computer Graphics Laboratory", credit: 0.75 },
    { code: "CSE-4206", name: "Industrial Training", credit: 0.00 }, // Image says 0.00
    { code: "CSE-4216", name: "Natural Language Processing", credit: 3.00 },
    { code: "Hum-4241", name: "Government and Sociology", credit: 3.00 }
];

// Enrich with IDs and Type
let idCounter = 201;
const enrichedCourses = courses.map(c => ({
    id: idCounter++,
    ...c,
    type: getType(c.name)
}));

db.courses = enrichedCourses;
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
console.log(`Populated ${enrichedCourses.length} courses.`);
