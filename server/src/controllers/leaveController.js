const {
  createLeaveRequest,
  getUserLeaves,
  getAllLeaves,
  getPendingLeaves,
  updateLeaveStatus,
  getLeaveById,
  deleteLeaveRequest,
  getUserLeaveStats,
  getAllLeaveStats,
} = require('../services/leaveService');

/**
 * Create a leave request (Employee)
 */
const createLeave = async (req, res) => {
  try {
    const userId = req.user.id;
    const { leaveType, startDate, endDate, reason } = req.body;

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({
        error: 'leaveType, startDate, endDate, and reason are required',
      });
    }

    // Validate leave type
    const validLeaveTypes = ['SICK', 'VACATION', 'PERSONAL', 'EMERGENCY', 'OTHER'];
    if (!validLeaveTypes.includes(leaveType)) {
      return res.status(400).json({
        error: `Invalid leave type. Must be one of: ${validLeaveTypes.join(', ')}`,
      });
    }

    const leave = await createLeaveRequest(userId, {
      leaveType,
      startDate,
      endDate,
      reason,
    });

    res.status(201).json({
      message: 'Leave request created successfully',
      leave: leave.toJSON(),
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create leave request';
    res.status(400).json({ error: errorMessage });
  }
};

/**
 * Get my leave requests (Employee)
 */
const getMyLeaves = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate, status,totalDays } = req.query;

    const leaves = await getUserLeaves(userId, startDate, endDate, status,totalDays);

    res.status(200).json({
      message: 'Your leave requests',
      leaves: leaves.map((leave) => ({
        ...leave,
        id: leave._id.toString(),
        userId: leave.user._id.toString(),
        user: {
          id: leave.user._id.toString(),
          name: leave.user.name,
          email: leave.user.email,
        },
        reviewedBy: leave.reviewedBy
          ? {
              id: leave.reviewedBy._id.toString(),
              name: leave.reviewedBy.name,
              email: leave.reviewedBy.email,
            }
          : null,
        _id: undefined,
      })),
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch leave requests';
    res.status(500).json({ error: errorMessage });
  }
};

/**
 * Get my leave statistics (Employee)
 */
const getMyLeaveStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await getUserLeaveStats(userId);

    res.status(200).json({
      message: 'Your leave statistics',
      statistics: stats,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch leave statistics';
    res.status(500).json({ error: errorMessage });
  }
};

/**
 * Get a specific leave request (Employee)
 */
const getMyLeaveById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { leaveId } = req.params;

    const leave = await getLeaveById(leaveId, userId);

    res.status(200).json({
      leave: {
        ...leave,
        id: leave._id.toString(),
        userId: leave.user._id.toString(),
        user: {
          id: leave.user._id.toString(),
          name: leave.user.name,
          email: leave.user.email,
        },
        reviewedBy: leave.reviewedBy
          ? {
              id: leave.reviewedBy._id.toString(),
              name: leave.reviewedBy.name,
              email: leave.reviewedBy.email,
            }
          : null,
        _id: undefined,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Leave request not found';
    res.status(404).json({ error: errorMessage });
  }
};

/**
 * Delete a leave request (Employee - only if pending)
 */
const deleteMyLeave = async (req, res) => {
  try {
    const userId = req.user.id;
    const { leaveId } = req.params;

    const result = await deleteLeaveRequest(leaveId, userId);

    res.status(200).json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete leave request';
    res.status(400).json({ error: errorMessage });
  }
};

/**
 * Get all leave requests (Admin)
 */
const getAllLeaveRequests = async (req, res) => {
  try {
    const { startDate, endDate, status, userId } = req.query;

    const leaves = await getAllLeaves(startDate, endDate, status, userId);
    console.log('leaves', leaves);
    res.status(200).json({
      message: 'All leave requests',
      leaves: leaves.map((leave) => ({
        ...leave,
        id: leave._id.toString(),
        userId: leave.user._id.toString(),
        user: {
          id: leave.user._id.toString(),
          name: leave.user.name,
          email: leave.user.email,
        },
        reviewedBy: leave.reviewedBy
          ? {
              id: leave.reviewedBy._id.toString(),
              name: leave.reviewedBy.name,
              email: leave.reviewedBy.email,
            }
          : null,
        _id: undefined,
      })),
    });
  } catch (error) {
    console.log('error', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch leave requests';
    res.status(500).json({ error: errorMessage });
  }
};

/**
 * Get pending leave requests (Admin)
 */
const getPendingRequests = async (req, res) => {
  try {
    const leaves = await getPendingLeaves();

    res.status(200).json({
      message: 'Pending leave requests',
      count: leaves.length,
      leaves: leaves.map((leave) => ({
        ...leave,
        id: leave._id.toString(),
        userId: leave.user._id.toString(),
        user: {
          id: leave.user._id.toString(),
          name: leave.user.name,
          email: leave.user.email,
        },
        _id: undefined,
      })),
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch pending requests';
    res.status(500).json({ error: errorMessage });
  }
};

/**
 * Update leave request status (Admin)
 */
const updateStatus = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { leaveId } = req.params;
    const { status, adminNotes } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const leave = await updateLeaveStatus(leaveId, adminId, status, adminNotes);

    res.status(200).json({
      message: `Leave request ${status.toLowerCase()} successfully`,
      leave: leave.toJSON(),
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update leave status';
    res.status(400).json({ error: errorMessage });
  }
};

/**
 * Get leave statistics (Admin)
 */
const getLeaveStatistics = async (req, res) => {
  try {
    const stats = await getAllLeaveStats();

    res.status(200).json({
      message: 'Leave statistics',
      statistics: stats,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch leave statistics';
    res.status(500).json({ error: errorMessage });
  }
};

module.exports = {
  createLeave,
  getMyLeaves,
  getMyLeaveStats,
  getMyLeaveById,
  deleteMyLeave,
  getAllLeaveRequests,
  getPendingRequests,
  updateStatus,
  getLeaveStatistics,
};

