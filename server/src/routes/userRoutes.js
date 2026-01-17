const { Router } = require('express');
const { login, createEmployeeAccount, getEmployees } = require('../controllers/userController');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = Router();

// Public route
router.post('/login', login);

// Protected routes (require authentication and admin role)
router.post('/employees', authenticate, requireAdmin, createEmployeeAccount);
router.get('/employees', authenticate, requireAdmin, getEmployees);

module.exports = router;

