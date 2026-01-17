const { Router } = require('express');
const {
  getWhoIsInOffice,
  getTodaySummary,
  getStatistics,
  getMyAttendanceStats,
} = require('../controllers/dashboardController');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = Router();

// Employee routes
router.get('/my-stats', authenticate, getMyAttendanceStats);

// Admin routes
router.get('/who-is-in-office', authenticate, requireAdmin, getWhoIsInOffice);
router.get('/today-summary', authenticate, requireAdmin, getTodaySummary);
router.get('/statistics', authenticate, requireAdmin, getStatistics);

module.exports = router;

