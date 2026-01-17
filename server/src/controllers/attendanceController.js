const {
  checkIn,
  checkOut,
  getTodayAttendance,
  getUserAttendance,
  updateAttendanceStatus,
  markAbsent,
} = require('../services/attendanceService');

/**
 * Check in employee
 */
const checkInEmployee = async (req, res) => {
  try {
    const userId = req.user.id;
    const ipAddress = req.clientIP;

    const attendance = await checkIn(userId, ipAddress);

    res.status(200).json({
      message: 'Checked in successfully',
      attendance: attendance,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to check in';
    res.status(400).json({ error: errorMessage });
  }
};

/**
 * Check out employee
 */
const checkOutEmployee = async (req, res) => {
  try {
    const userId = req.user.id;
    const ipAddress = req.clientIP;

    const attendance = await checkOut(userId, ipAddress);

    res.status(200).json({
      message: 'Checked out successfully',
      attendance: attendance,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to check out';
    res.status(400).json({ error: errorMessage });
  }
};

/**
 * Get today's attendance for logged-in user
 */
const getMyTodayAttendance = async (req, res) => {
  try {
    const userId = req.user.id;
    const attendance = await getTodayAttendance(userId);

    if (!attendance) {
      return res.status(200).json({
        message: 'No attendance record for today',
        attendance: null,
      });
    }

    res.status(200).json({ attendance });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch attendance';
    res.status(500).json({ error: errorMessage });
  }
};

/**
 * Get attendance history for logged-in user
 */
const getMyAttendance = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    const attendance = await getUserAttendance(userId, startDate, endDate);

    res.status(200).json({ attendance });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch attendance';
    res.status(500).json({ error: errorMessage });
  }
};

/**
 * Update attendance status (Admin only)
 */
const updateStatus = async (req, res) => {
  try {
    const { attendanceId } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const attendance = await updateAttendanceStatus(attendanceId, status, notes);

    res.status(200).json({
      message: 'Attendance status updated successfully',
      attendance: attendance,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update status';
    res.status(400).json({ error: errorMessage });
  }
};

/**
 * Mark employee as absent (Admin only)
 */
const markEmployeeAbsent = async (req, res) => {
  try {
    const { userId } = req.params;
    const { date, notes } = req.body;

    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    const attendance = await markAbsent(userId, date, notes);

    res.status(200).json({
      message: 'Employee marked as absent',
      attendance: attendance,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to mark absent';
    res.status(400).json({ error: errorMessage });
  }
};

/**
 * Get attendance for a specific user (Admin only)
 */
const getUserAttendanceRecords = async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    const attendance = await getUserAttendance(userId, startDate, endDate);

    res.status(200).json({ attendance });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch attendance';
    res.status(500).json({ error: errorMessage });
  }
};

module.exports = {
  checkInEmployee,
  checkOutEmployee,
  getMyTodayAttendance,
  getMyAttendance,
  updateStatus,
  markEmployeeAbsent,
  getUserAttendanceRecords,
};

