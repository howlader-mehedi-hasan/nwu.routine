const express = require('express');
const { register, login, getMe, getAllUsers, updateUserStatus, createUser, updateUser, changeUserPassword, requestNameChange, resolveNameChange } = require('../controllers/authController');
const { protect, requirePermission } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

// Admin / Super Admin routes for User Management
router.get('/users', protect, requirePermission('assign_permissions'), getAllUsers);
router.post('/users', protect, requirePermission('assign_permissions'), createUser);
router.put('/users/:id', protect, updateUser);
router.post('/users/:id/name-change', protect, requestNameChange);
router.post('/users/:id/name-change-resolve', protect, requirePermission('assign_permissions'), resolveNameChange);
router.put('/users/:id/password', protect, changeUserPassword);
router.put('/users/:id/status', protect, requirePermission('assign_permissions'), updateUserStatus);

module.exports = router;
