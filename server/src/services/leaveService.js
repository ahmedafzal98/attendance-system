const Leave = require('../models/Leave');
const User = require('../models/User');

/**
 * Create a leave request
 */
const createLeaveRequest = async (userId, leaveData) => {
  const { leaveType, startDate, endDate, reason } = leaveData;

  // Validate dates
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if start date is in the past
  if (start < today) {
    throw new Error('Start date cannot be in the past');
  }

  // Check if end date is before start date
  if (end < start) {
    throw new Error('End date must be after start date');
  }

  // Check for overlapping leave requests
  const overlappingLeaves = await Leave.find({
    user: userId,
    status: { $in: ['PENDING', 'APPROVED'] },
    $or: [
      {
        startDate: { $lte: end },
        endDate: { $gte: start },
      },
    ],
  });

  if (overlappingLeaves.length > 0) {
    throw new Error('You have an overlapping leave request that is pending or approved');
  }

  // Calculate total days (inclusive of both start and end dates)
  const diffTime = Math.abs(end - start);
  const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  // Create leave request
  const leave = await Leave.create({
    user: userId,
    leaveType,
    startDate: start,
    endDate: end,
    totalDays,
    reason,
    status: 'PENDING',
  });

  return leave;
};

/**
 * Get leave requests for a user
 */
const getUserLeaves = async (userId, startDate, endDate, status) => {
  const query = { user: userId };

  if (status) {
    query.status = status;
  }

  if (startDate || endDate) {
    query.$or = [];
    if (startDate) {
      query.$or.push({ startDate: { $gte: new Date(startDate) } });
    }
    if (endDate) {
      query.$or.push({ endDate: { $lte: new Date(endDate) } });
    }
  }

  const leaves = await Leave.find(query)
    .populate('user', 'name email')
    .populate('reviewedBy', 'name email')
    .sort({ createdAt: -1 })
    .lean();

  return leaves;
};

/**
 * Get all leave requests (Admin)
 */
const getAllLeaves = async (startDate, endDate, status, userId) => {
  const query = {};

  if (status) {
    query.status = status;
  }

  if (userId) {
    query.user = userId;
  }

  if (startDate || endDate) {
    query.$or = [];
    if (startDate) {
      query.$or.push({ startDate: { $gte: new Date(startDate) } });
    }
    if (endDate) {
      query.$or.push({ endDate: { $lte: new Date(endDate) } });
    }
  }

  const leaves = await Leave.find(query)
    .populate('user', 'name email')
    .populate('reviewedBy', 'name email')
    .sort({ createdAt: -1 })
    .lean();

  return leaves;
};

/**
 * Get pending leave requests (Admin)
 */
const getPendingLeaves = async () => {
  const leaves = await Leave.find({ status: 'PENDING' })
    .populate('user', 'name email')
    .sort({ createdAt: 1 })
    .lean();

  return leaves;
};

/**
 * Update leave request status (Admin)
 */
const updateLeaveStatus = async (leaveId, adminId, status, adminNotes) => {
  const validStatuses = ['APPROVED', 'REJECTED'];
  
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }

  const leave = await Leave.findById(leaveId);

  if (!leave) {
    throw new Error('Leave request not found');
  }

  if (leave.status !== 'PENDING') {
    throw new Error(`Leave request has already been ${leave.status.toLowerCase()}`);
  }

  leave.status = status;
  leave.reviewedBy = adminId;
  leave.reviewedAt = new Date();
  if (adminNotes) {
    leave.adminNotes = adminNotes;
  }

  await leave.save();

  return leave;
};

/**
 * Get leave request by ID
 */
const getLeaveById = async (leaveId, userId = null) => {
  const query = { _id: leaveId };

  // If userId is provided, ensure the leave belongs to that user (for employees)
  if (userId) {
    query.user = userId;
  }

  const leave = await Leave.findOne(query)
    .populate('user', 'name email')
    .populate('reviewedBy', 'name email')
    .lean();

  if (!leave) {
    throw new Error('Leave request not found');
  }

  return leave;
};

/**
 * Delete leave request (only if pending)
 */
const deleteLeaveRequest = async (leaveId, userId) => {
  const leave = await Leave.findOne({
    _id: leaveId,
    user: userId,
  });

  if (!leave) {
    throw new Error('Leave request not found');
  }

  if (leave.status !== 'PENDING') {
    throw new Error('Only pending leave requests can be deleted');
  }

  await Leave.findByIdAndDelete(leaveId);

  return { message: 'Leave request deleted successfully' };
};

/**
 * Get leave statistics for a user
 */
const getUserLeaveStats = async (userId) => {
  const leaves = await Leave.find({ user: userId }).lean();

  const total = leaves.length;
  const pending = leaves.filter((l) => l.status === 'PENDING').length;
  const approved = leaves.filter((l) => l.status === 'APPROVED').length;
  const rejected = leaves.filter((l) => l.status === 'REJECTED').length;

  const totalDays = leaves
    .filter((l) => l.status === 'APPROVED')
    .reduce((sum, l) => sum + l.totalDays, 0);

  return {
    total,
    pending,
    approved,
    rejected,
    totalDays,
  };
};

/**
 * Get leave statistics for all employees (Admin)
 */
const getAllLeaveStats = async () => {
  const leaves = await Leave.find().lean();

  const total = leaves.length;
  const pending = leaves.filter((l) => l.status === 'PENDING').length;
  const approved = leaves.filter((l) => l.status === 'APPROVED').length;
  const rejected = leaves.filter((l) => l.status === 'REJECTED').length;

  // Group by leave type
  const byType = {
    SICK: leaves.filter((l) => l.leaveType === 'SICK').length,
    VACATION: leaves.filter((l) => l.leaveType === 'VACATION').length,
    PERSONAL: leaves.filter((l) => l.leaveType === 'PERSONAL').length,
    EMERGENCY: leaves.filter((l) => l.leaveType === 'EMERGENCY').length,
    OTHER: leaves.filter((l) => l.leaveType === 'OTHER').length,
  };

  return {
    total,
    pending,
    approved,
    rejected,
    byType,
  };
};

module.exports = {
  createLeaveRequest,
  getUserLeaves,
  getAllLeaves,
  getPendingLeaves,
  updateLeaveStatus,
  getLeaveById,
  deleteLeaveRequest,
  getUserLeaveStats,
  getAllLeaveStats,
};

