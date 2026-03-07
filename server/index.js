const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dbRepository = require('./repositories/dbRepository');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/faculty', require('./routes/facultyRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/batches', require('./routes/batchRoutes'));
app.use('/api/routine', require('./routes/routineRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));

// Basic Route
app.get('/', (req, res) => {
    res.send('Smart Routine API is running');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
