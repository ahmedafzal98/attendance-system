const Attendance = require('../models/Attendance');
const User = require('../models/User');

/**
 * Get today's date at midnight for comparison
 */
const getTodayStart = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

/**
 * Get today's date at end of day
 */
const getTodayEnd = () => {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return today;
};

/**
 * Check if user has already checked in today
 */
const hasCheckedInToday = async (userId) => {
  const todayStart = getTodayStart();
  const todayEnd = getTodayEnd();

  const attendance = await Attendance.findOne({
    user: userId,
    date: {
      $gte: todayStart,
      $lte: todayEnd,
    },
  });

  return attendance && attendance.checkIn?.time;
};

/**
 * Check if user has already checked out today
 */
const hasCheckedOutToday = async (userId) => {
  const todayStart = getTodayStart();
  const todayEnd = getTodayEnd();

  const attendance = await Attendance.findOne({
    user: userId,
    date: {
      $gte: todayStart,
      $lte: todayEnd,
    },
  });

  return attendance && attendance.checkOut?.time;
};

/**
 * Check in employee
 */
const checkIn = async (userId, ipAddress) => {
  const todayStart = getTodayStart();
  const todayEnd = getTodayEnd();

  // Check if already checked in today
  const existingAttendance = await Attendance.findOne({
    user: userId,
    date: {
      $gte: todayStart,
      $lte: todayEnd,
    },
  });

  if (existingAttendance && existingAttendance.checkIn?.time) {
    throw new Error('You have already checked in today');
  }

  const checkInTime = new Date();
  const expectedCheckInTime = new Date();
  expectedCheckInTime.setHours(9, 0, 0, 0); // 9 AM expected check-in

  // Calculate minutes late or early
  let minutesLate = 0;
  let minutesEarly = 0;
  if (checkInTime > expectedCheckInTime) {
    // If checked in after 9 AM
    minutesLate = Math.floor((checkInTime - expectedCheckInTime) / (1000 * 60));
  } else {
    // If checked in before 9 AM
    minutesEarly = Math.floor((expectedCheckInTime - checkInTime) / (1000 * 60));
  }

  // Determine status based on check-in time
  let status = 'PRESENT';
  if (minutesLate > 30) {
    // More than 30 minutes late
    status = 'LATE';
  }

  if (existingAttendance) {
    // Update existing attendance record
    existingAttendance.checkIn = {
      time: checkInTime,
      ipAddress: ipAddress,
    };
    existingAttendance.status = status;
    await existingAttendance.save();
    
    // Add additional info to the response (not saved to DB, just for response)
    const attendanceObj = existingAttendance.toObject();
    attendanceObj.minutesLate = minutesLate;
    attendanceObj.minutesEarly = minutesEarly;
    attendanceObj.expectedCheckInTime = expectedCheckInTime;
    attendanceObj.status = status;
    return attendanceObj;
  } else {
    // Create new attendance record
    const attendance = await Attendance.create({
      user: userId,
      date: checkInTime,
      checkIn: {
        time: checkInTime,
        ipAddress: ipAddress,
      },
      status: status,
    });
    
    // Add additional info to the response (not saved to DB, just for response)
    const attendanceObj = attendance.toObject();
    attendanceObj.minutesLate = minutesLate;
    attendanceObj.minutesEarly = minutesEarly;
    attendanceObj.expectedCheckInTime = expectedCheckInTime;
    attendanceObj.status = status;
    return attendanceObj;
  }
};

/**
 * Check out employee
 */
const checkOut = async (userId, ipAddress) => {
  const todayStart = getTodayStart();
  const todayEnd = getTodayEnd();

  // Find today's attendance
  const attendance = await Attendance.findOne({
    user: userId,
    date: {
      $gte: todayStart,
      $lte: todayEnd,
    },
  });

  if (!attendance) {
    throw new Error('You must check in before checking out');
  }

  if (!attendance.checkIn?.time) {
    throw new Error('You must check in before checking out');
  }

  if (attendance.checkOut?.time) {
    throw new Error('You have already checked out today');
  }

  const checkOutTime = new Date();
  const checkInTime = attendance.checkIn.time;

  // Calculate working hours in minutes
  const workingMinutes = Math.floor((checkOutTime - checkInTime) / (1000 * 60));

  // Update attendance
  attendance.checkOut = {
    time: checkOutTime,
    ipAddress: ipAddress,
  };
  attendance.workingHours = workingMinutes;

  // If working hours less than 4 hours, mark as half day
  if (workingMinutes < 240 && attendance.status === 'PRESENT') {
    attendance.status = 'HALF_DAY';
  }

  await attendance.save();
  return attendance;
};

/**
 * Get today's attendance for a user
 */
const getTodayAttendance = async (userId) => {
  const todayStart = getTodayStart();
  const todayEnd = getTodayEnd();

  const attendance = await Attendance.findOne({
    user: userId,
    date: {
      $gte: todayStart,
      $lte: todayEnd,
    },
  })
    .populate('user', 'name email')
    .lean();

  return attendance;
};

/**
 * Get attendance records for a user
 */
const getUserAttendance = async (userId, startDate, endDate) => {
  const query = { user: userId };

  if (startDate || endDate) {
    query.date = {};
    if (startDate) {
      query.date.$gte = new Date(startDate);
    }
    if (endDate) {
      query.date.$lte = new Date(endDate);
    }
  }

  const attendance = await Attendance.find(query)
    .populate('user', 'name email')
    .sort({ date: -1 })
    .lean();

  return attendance;
};

/**
 * Update attendance status (Admin only)
 */
const updateAttendanceStatus = async (attendanceId, status, notes) => {
  const validStatuses = ['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY'];
  
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }

  const attendance = await Attendance.findById(attendanceId);

  if (!attendance) {
    throw new Error('Attendance record not found');
  }

  attendance.status = status;
  if (notes) {
    attendance.notes = notes;
  }

  await attendance.save();
  return attendance;
};

/**
 * Mark absent for a user on a specific date (Admin only)
 */
const markAbsent = async (userId, date, notes) => {
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  const endDate = new Date(targetDate);
  endDate.setHours(23, 59, 59, 999);

  let attendance = await Attendance.findOne({
    user: userId,
    date: {
      $gte: targetDate,
      $lte: endDate,
    },
  });

  if (attendance) {
    attendance.status = 'ABSENT';
    if (notes) {
      attendance.notes = notes;
    }
    await attendance.save();
  } else {
    attendance = await Attendance.create({
      user: userId,
      date: targetDate,
      status: 'ABSENT',
      notes: notes || '',
    });
  }

  return attendance;
};

module.exports = {
  checkIn,
  checkOut,
  getTodayAttendance,
  getUserAttendance,
  updateAttendanceStatus,
  markAbsent,
  hasCheckedInToday,
  hasCheckedOutToday,
};

