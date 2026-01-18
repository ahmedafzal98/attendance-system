const { Router } = require('express');
const {
  checkInEmployee,
  checkOutEmployee,
  getMyTodayAttendance,
  getMyAttendance,
  updateStatus,
  markEmployeeAbsent,
  getUserAttendanceRecords,
  manualCheckInEmployee,
  manualCheckOutEmployee,
} = require('../controllers/attendanceController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { validateOfficeIP } = require('../middleware/ipValidator');

const router = Router();

// Employee routes (require authentication and office IP)
router.post('/checkin', authenticate, validateOfficeIP, checkInEmployee);
router.post('/checkout', authenticate, validateOfficeIP, checkOutEmployee);
router.get('/today', authenticate, getMyTodayAttendance);
router.get('/my-attendance', authenticate, getMyAttendance);

// Admin routes (require authentication and admin role)
router.put('/:attendanceId/status', authenticate, requireAdmin, updateStatus);
router.post('/:userId/absent', authenticate, requireAdmin, markEmployeeAbsent);
router.get('/user/:userId', authenticate, requireAdmin, getUserAttendanceRecords);
// Manual check-in/check-out (bypasses IP validation)
router.post('/admin/checkin/:userId', authenticate, requireAdmin, manualCheckInEmployee);
router.post('/admin/checkout/:userId', authenticate, requireAdmin, manualCheckOutEmployee);

module.exports = router;