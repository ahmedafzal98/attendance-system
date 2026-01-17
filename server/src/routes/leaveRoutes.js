const { Router } = require('express');
const {
  createLeave,
  getMyLeaves,
  getMyLeaveStats,
  getMyLeaveById,
  deleteMyLeave,
  getAllLeaveRequests,
  getPendingRequests,
  updateStatus,
  getLeaveStatistics,
} = require('../controllers/leaveController');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = Router();

// Employee routes
router.post('/', authenticate, createLeave);
router.get('/my-leaves', authenticate, getMyLeaves);
router.get('/my-stats', authenticate, getMyLeaveStats);
router.get('/my-leaves/:leaveId', authenticate, getMyLeaveById);
router.delete('/my-leaves/:leaveId', authenticate, deleteMyLeave);

// Admin routes
router.get('/', authenticate, requireAdmin, getAllLeaveRequests);
router.get('/pending', authenticate, requireAdmin, getPendingRequests);
router.put('/:leaveId/status', authenticate, requireAdmin, updateStatus);
router.get('/statistics', authenticate, requireAdmin, getLeaveStatistics);

module.exports = router;

