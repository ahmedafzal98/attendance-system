const { Router } = require('express');
const {
  getEmployeeWorkSchedule,
  getAllEmployeeWorkSchedules,
  createOrUpdateWorkSchedule,
  deleteEmployeeWorkSchedule,
} = require('../controllers/workScheduleController');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = Router();

// Admin routes (require authentication and admin role)
router.get('/', authenticate, requireAdmin, getAllEmployeeWorkSchedules);
router.get('/:userId', authenticate, requireAdmin, getEmployeeWorkSchedule);
router.post('/:userId', authenticate, requireAdmin, createOrUpdateWorkSchedule);
router.delete('/:userId', authenticate, requireAdmin, deleteEmployeeWorkSchedule);

module.exports = router;

