const { Router } = require('express');
const { login, createEmployeeAccount, getEmployees, resetEmployeePasswordHandler, updateEmployeeAccount, deleteEmployeeAccount } = require('../controllers/userController');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = Router();

// Public route
router.post('/login', login);

// Protected routes (require authentication and admin role)
router.post('/employees', authenticate, requireAdmin, createEmployeeAccount);
router.get('/employees', authenticate, requireAdmin, getEmployees);
router.put('/employees/:userId', authenticate, requireAdmin, updateEmployeeAccount);
router.delete('/employees/:userId', authenticate, requireAdmin, deleteEmployeeAccount);
router.post('/employees/:userId/reset-password', authenticate, requireAdmin, resetEmployeePasswordHandler);

module.exports = router;

