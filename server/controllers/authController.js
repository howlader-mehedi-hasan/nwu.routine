const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dbRepository = require('../repositories/dbRepository');

const JWT_SECRET = process.env.JWT_SECRET || 'nwu-routine-secret-key-super-secure';

// Helper to get users
const getUsers = () => dbRepository.getAll('users') || [];
const saveUsers = (users) => dbRepository._writeCollection('users', users);

exports.register = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        const users = getUsers();

        if (users.find(u => u.username === username || u.email === email)) {
            return res.status(400).json({ message: 'Username or Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Force first user to be superAdmin implicitly if none exist, else require approval
        const isFirstUser = users.length === 0;
        const actualRole = isFirstUser ? 'Super Admin' : (role || 'Student');
        const status = isFirstUser ? 'approved' : 'pending';

        const newUser = {
            id: Date.now().toString(),
            username,
            email,
            password: hashedPassword,
            role: actualRole,
            status: status, // pending, approved, rejected
            permissions: [] // specific permissions 
        };

        const created = dbRepository.create('users', newUser);

        // Don't send token if pending
        if (status === 'pending') {
            return res.status(201).json({ message: 'Registration successful. Waiting for Super Admin approval.', status: 'pending' });
        }

        const token = jwt.sign({ id: created.id, role: created.role, status: created.status }, JWT_SECRET, { expiresIn: '24h' });
        const { password: _, ...userWithoutPass } = created;
        res.status(201).json({ token, user: userWithoutPass });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const users = getUsers();

        const user = users.find(u => u.username === username);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (user.status !== 'approved') {
            return res.status(403).json({ message: `Account is ${user.status}. Please wait for Super Admin approval.` });
        }

        const token = jwt.sign({ id: user.id, role: user.role, status: user.status }, JWT_SECRET, { expiresIn: '24h' });
        const { password: _, ...userWithoutPass } = user;

        res.json({ token, user: userWithoutPass });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getMe = (req, res) => {
    try {
        const users = getUsers();
        const user = users.find(u => u.id === req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { password: _, ...userWithoutPass } = user;
        res.json(userWithoutPass);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Super Admin functionality
exports.getAllUsers = (req, res) => {
    try {
        const users = getUsers();
        // Remove passwords
        const safeUsers = users.map(({ password, ...rest }) => rest);
        res.json(safeUsers);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateUserStatus = (req, res) => {
    try {
        const { id } = req.params;
        const { status, role } = req.body; // allow updating role at approval too

        const users = getUsers();
        const index = users.findIndex(u => u.id === id);

        if (index === -1) return res.status(404).json({ message: 'User not found' });

        if (status) users[index].status = status;
        if (role) users[index].role = role;

        saveUsers(users);
        const { password: _, ...updated } = users[index];
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
