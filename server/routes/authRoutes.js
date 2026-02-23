const express = require('express');
const { register, login, getMe, getAllUsers, updateUserStatus } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

// Admin / Super Admin routes for User Management
router.get('/users', protect, authorize('Super Admin', 'Admin'), getAllUsers);
router.put('/users/:id/status', protect, authorize('Super Admin'), updateUserStatus);

module.exports = router;
