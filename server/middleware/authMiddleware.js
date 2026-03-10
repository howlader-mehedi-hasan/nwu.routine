const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'nwu-routine-secret-key-super-secure';

exports.protect = (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies?.token) { // If using cookies instead
            token = req.cookies.token;
        }

        if (!token) {
            return res.status(401).json({ message: 'Not authorized to access this route' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Not authorized to access this route' });
    }
};

exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: `User role ${req.user?.role} is not authorized to access this route` });
        }
        next();
    }
};

exports.requirePermission = (requiredPermission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        
        // Super Admin and Admin have all permissions implicitly
        if (req.user.role === 'Super Admin' || req.user.role === 'Admin') {
            return next();
        }

        // Token might not have permissions array if it's old, 
        // ideally we'd fetch the fresh user from DB here to be secure and up-to-date,
        // but since we encode standard things in token, let's fetch from DB if needed,
        // or just trust the token if we add permissions to it.
        // Let's fetch the fresh user to avoid token staleness for permissions:
        const dbRepository = require('../repositories/dbRepository');
        const users = dbRepository.getAll('users');
        const currentUser = users.find(u => u.id === req.user.id);

        if (!currentUser) {
            return res.status(401).json({ message: 'User no longer exists' });
        }

        const userPermissions = currentUser.permissions || [];
        
        if (Array.isArray(requiredPermission)) {
            const hasAny = requiredPermission.some(p => userPermissions.includes(p));
            if (!hasAny) {
                return res.status(403).json({ message: `Requires one of: ${requiredPermission.join(', ')}` });
            }
        } else {
            if (!userPermissions.includes(requiredPermission)) {
                return res.status(403).json({ message: `Requires '${requiredPermission}' permission.` });
            }
        }

        next();
    };
};
