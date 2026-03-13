const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dbRepository = require('../repositories/dbRepository');
const { encryptText, decryptText } = require('../utils/encryption');

const JWT_SECRET = process.env.JWT_SECRET || 'nwu-routine-secret-key-super-secure';

// Helper to get users
const getUsers = () => dbRepository.getAll('users') || [];
const saveUsers = (users) => dbRepository._writeCollection('users', users);

exports.register = async (req, res) => {
    try {
        const { username, email, password, role, fullName, mobileNumber, section, facultyId } = req.body;
        
        if (!username || !email || !password || !fullName || !mobileNumber) {
            return res.status(400).json({ message: 'All fields (Username, Email, Password, Full Name, Mobile Number) are required for registration' });
        }

        const users = getUsers();

        if (users.find(u => u.username === username || (u.email && u.email === email))) {
            return res.status(400).json({ message: 'Username or Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const encryptedPassword = encryptText(password);

        // Validate Requested Role against Settings
        const settings = dbRepository.getSettings();
        const allowedRoles = settings?.general?.registration_roles || ['Student', 'Faculty', 'CR/ACR'];
        
        let requestedRole = role || 'Student';
        if (!allowedRoles.includes(requestedRole)) {
            // If they modify the frontend to send a role not allowed, downgrade them to the first allowed role, or Student
            requestedRole = allowedRoles.length > 0 ? allowedRoles[0] : 'Student';
        }

        // Force first user to be superAdmin implicitly if none exist, else require approval
        const isFirstUser = users.length === 0;
        const actualRole = isFirstUser ? 'Super Admin' : requestedRole;
        const status = isFirstUser ? 'approved' : 'pending';

        const newUser = {
            id: Date.now().toString(),
            username,
            email,
            password: hashedPassword,
            encryptedPassword,
            role: actualRole,
            status: status, // pending, approved, rejected
            permissions: [], // specific permissions 
            fullName: fullName || '',
            mobileNumber: mobileNumber || '',
            section: section || '',
            facultyId: facultyId || null
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
        let safeUsers = users.map(({ password, ...rest }) => rest);

        if (req.user && req.user.role !== 'Super Admin') {
            safeUsers = safeUsers.filter(u => u.role !== 'Super Admin');
        } else if (req.user && req.user.role === 'Super Admin') {
            // Expose plain password for Super Admin only
            safeUsers = safeUsers.map(u => ({
                ...u,
                plainPassword: decryptText(u.encryptedPassword) || 'Unrecoverable (Legacy)'
            }));
        }

        // Always strip actual encrypted string so it doesn't leak raw encrypted string
        safeUsers = safeUsers.map(({ encryptedPassword, ...rest }) => rest);

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

        if (req.user && req.user.role !== 'Super Admin') {
            if (users[index].role === 'Super Admin') {
                return res.status(403).json({ message: 'Cannot modify a Super Admin' });
            }
            if (role === 'Super Admin') {
                return res.status(403).json({ message: 'Cannot assign Super Admin role' });
            }
        }

        if (status) users[index].status = status;
        if (role) users[index].role = role;

        saveUsers(users);
        const { password: _, ...updated } = users[index];
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createUser = async (req, res) => {
    try {
        const { username, email, password, role, fullName, mobileNumber, section, facultyId } = req.body;
        const users = getUsers();

        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        if (users.find(u => u.username === username || (email && u.email === email))) {
            return res.status(400).json({ message: 'Username or Email already exists' });
        }

        if (req.user && req.user.role !== 'Super Admin' && role === 'Super Admin') {
            return res.status(403).json({ message: 'Only Super Admins can create Super Admins' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const encryptedPassword = encryptText(password);

        const newUser = {
            id: Date.now().toString(),
            username,
            email,
            password: hashedPassword,
            encryptedPassword,
            role: role || 'Student',
            status: 'approved', // Created by admin, so pre-approved
            permissions: req.body.permissions || [],
            fullName: fullName || '',
            mobileNumber: mobileNumber || '',
            section: section || '',
            facultyId: facultyId || null
        };

        const created = dbRepository.create('users', newUser);
        const { password: _, ...userWithoutPass } = created;
        
        res.status(201).json(userWithoutPass);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateUser = (req, res) => {
    try {
        const { id } = req.params;
        let { username, email, role, status, fullName, mobileNumber, permissions, section, facultyId } = req.body;
        
        const users = getUsers();
        const index = users.findIndex(u => u.id === id);

        if (index === -1) return res.status(404).json({ message: 'User not found' });

        if (req.user && req.user.role !== 'Super Admin' && req.user.id !== id) {
            // Admin can edit others but not Super Admin (handled below)
            // Regular user can ONLY edit themselves
            if (req.user.role !== 'Admin' && (!req.user.permissions || !req.user.permissions.includes('assign_permissions'))) {
                return res.status(403).json({ message: 'You can only edit your own profile' });
            }
        }

        if (req.user && req.user.role !== 'Super Admin') {
            if (users[index].role === 'Super Admin' && req.user.id !== id) {
                return res.status(403).json({ message: 'Cannot modify a Super Admin' });
            }
            if (role === 'Super Admin') {
                return res.status(403).json({ message: 'Cannot assign Super Admin role' });
            }
        }

        // If it's a regular user editing themselves, prevent them from elevating their own role or status or permissions
        const isSelfEdit = (req.user && req.user.id === id);
        const isAdminEdit = (req.user && (req.user.role === 'Super Admin' || req.user.role === 'Admin' || (req.user.permissions && req.user.permissions.includes('assign_permissions'))));

        if (isSelfEdit && !isAdminEdit) {
            // Override these sensitive fields back to their original values so they can't be self-escalated
            role = users[index].role;
            status = users[index].status;
            permissions = users[index].permissions;
            // Also restrict fullName change, must go through request/approve flow
            fullName = users[index].fullName;
            // Allow changing section if permitted implicitly, but keep this safe.
        }

        // Check if new username/email overlaps with ANOTHER user
        const conflict = users.find(u => 
            u.id !== id && (
                (username && u.username === username) || 
                (email && u.email && u.email === email)
            )
        );
        if (conflict) {
            return res.status(400).json({ message: 'Username or Email already in use by another account' });
        }

        if (username) users[index].username = username;
        if (email) users[index].email = email;
        if (role) users[index].role = role;
        if (status) users[index].status = status;
        if (fullName !== undefined) users[index].fullName = fullName;
        if (mobileNumber !== undefined) users[index].mobileNumber = mobileNumber;
        if (permissions !== undefined) users[index].permissions = permissions;
        if (section !== undefined) users[index].section = section;
        if (facultyId !== undefined) users[index].facultyId = facultyId;

        saveUsers(users);
        const { password: _, ...updated } = users[index];
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.changeUserPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.body;

        if (!password || password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        if (req.user && req.user.role !== 'Super Admin' && req.user.id !== id) {
            return res.status(403).json({ message: 'You can only change your own password' });
        }

        const users = getUsers();
        const index = users.findIndex(u => u.id === id);

        if (index === -1) return res.status(404).json({ message: 'User not found' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const encryptedPassword = encryptText(password);
        users[index].password = hashedPassword;
        users[index].encryptedPassword = encryptedPassword;

        saveUsers(users);
        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.requestNameChange = (req, res) => {
    try {
        const { id } = req.params;
        const { requestedName } = req.body;
        if (req.user && req.user.role !== 'Super Admin' && req.user.id !== id) {
            return res.status(403).json({ message: 'You can only request your own name change' });
        }
        if (!requestedName || requestedName.trim() === '') {
            return res.status(400).json({ message: 'Name cannot be empty' });
        }
        const users = getUsers();
        const index = users.findIndex(u => u.id === id);
        if (index === -1) return res.status(404).json({ message: 'User not found' });

        users[index].pendingFullName = requestedName;
        saveUsers(users);
        
        const { password: _, ...updated } = users[index];
        res.json({ message: 'Name change requested successfully', user: updated });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.resolveNameChange = (req, res) => {
    try {
        const { id } = req.params;
        const { action } = req.body; // 'approve' or 'reject'
        const users = getUsers();
        const index = users.findIndex(u => u.id === id);
        if (index === -1) return res.status(404).json({ message: 'User not found' });
        
        if (action === 'approve') {
            users[index].fullName = users[index].pendingFullName;
        }
        users[index].pendingFullName = null; 
        
        saveUsers(users);
        res.json({ message: `Name change ${action}d successfully` });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

