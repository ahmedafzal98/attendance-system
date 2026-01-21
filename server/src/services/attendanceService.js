const Attendance = require('../models/Attendance');
const User = require('../models/User');
const WorkSchedule = require('../models/WorkSchedule');
const { isWithinOfficeHours, getOfficeHoursMessage } = require('../utils/officeTiming');

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
 * @param {string} userId - User ID
 * @param {string} ipAddress - IP address
 * @param {Date} clientTime - Optional client's local time for validation (defaults to server time)
 */
const checkIn = async (userId, ipAddress, clientTime = null) => {
  // Use server time for recording check-in
  const checkInTime = new Date();
  
  // Use client's local time for office hours validation (if provided)
  // This ensures office hours are checked against user's local time, not server UTC time
  const validationTime = clientTime || checkInTime;
  const currentHour = validationTime.getHours();
  const isWithinHours = isWithinOfficeHours(validationTime);
  console.log(`[Check-In] Validation time: ${validationTime.toISOString()}, Local hour: ${currentHour}, Within office hours: ${isWithinHours}`);
  console.log(`[Check-In] Server time (recorded): ${checkInTime.toISOString()}, Client time provided: ${clientTime ? clientTime.toISOString() : 'none'}`);
  
  if (!isWithinHours) {
    throw new Error(getOfficeHoursMessage());
  }

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
  
  // Get employee's work schedule
  let workSchedule = await WorkSchedule.findOne({ user: userId, isActive: true });
  
  // If no schedule exists, create default one (9 AM - 6 PM, 30 min grace)
  if (!workSchedule) {
    workSchedule = await WorkSchedule.create({
      user: userId,
      checkInTime: '09:00',
      checkOutTime: '18:00',
      gracePeriod: 30,
    });
  }

  // Parse check-in time from schedule (format: "HH:MM")
  const [checkInHour, checkInMinute] = workSchedule.checkInTime.split(':').map(Number);
  const expectedCheckInTime = new Date();
  expectedCheckInTime.setHours(checkInHour, checkInMinute, 0, 0);

  // Calculate minutes late or early
  let minutesLate = 0;
  let minutesEarly = 0;
  if (checkInTime > expectedCheckInTime) {
    // If checked in after expected time
    minutesLate = Math.floor((checkInTime - expectedCheckInTime) / (1000 * 60));
  } else {
    // If checked in before expected time
    minutesEarly = Math.floor((expectedCheckInTime - checkInTime) / (1000 * 60));
  }

  // Determine status based on check-in time and grace period
  let status = 'PRESENT';
  if (minutesLate > workSchedule.gracePeriod) {
    // More than grace period minutes late
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
 * @param {string} userId - User ID
 * @param {string} ipAddress - IP address
 * @param {Date} clientTime - Optional client's local time for validation (defaults to server time)
 */
const checkOut = async (userId, ipAddress, clientTime = null) => {
  // Use server time for recording check-out
  const checkOutTime = new Date();
  
  // Use client's local time for office hours validation (if provided)
  const validationTime = clientTime || checkOutTime;
  const currentHour = validationTime.getHours();
  const isWithinHours = isWithinOfficeHours(validationTime);
  console.log(`[Check-Out] Validation time: ${validationTime.toISOString()}, Local hour: ${currentHour}, Within office hours: ${isWithinHours}`);
  console.log(`[Check-Out] Server time (recorded): ${checkOutTime.toISOString()}, Client time provided: ${clientTime ? clientTime.toISOString() : 'none'}`);
  
  if (!isWithinHours) {
    throw new Error(getOfficeHoursMessage());
  }

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
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0); // Set to beginning of day
      query.date.$gte = start;
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Set to end of day
      query.date.$lte = end;
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

/**
 * Manual check in employee (admin bypasses IP validation and office hours)
 * Used when employee has issues with mobile app (slow internet, app crash, etc.)
 * Note: This function bypasses office hours validation as it's an admin override
 */
const manualCheckIn = async (userId, adminId) => {
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
    throw new Error('Employee has already checked in today');
  }

  const checkInTime = new Date();
  
  // Get employee's work schedule
  let workSchedule = await WorkSchedule.findOne({ user: userId, isActive: true });
  
  // If no schedule exists, create default one (9 AM - 6 PM, 30 min grace)
  if (!workSchedule) {
    workSchedule = await WorkSchedule.create({
      user: userId,
      checkInTime: '09:00',
      checkOutTime: '18:00',
      gracePeriod: 30,
    });
  }

  // Parse check-in time from schedule (format: "HH:MM")
  const [checkInHour, checkInMinute] = workSchedule.checkInTime.split(':').map(Number);
  const expectedCheckInTime = new Date();
  expectedCheckInTime.setHours(checkInHour, checkInMinute, 0, 0);

  // Calculate minutes late or early
  let minutesLate = 0;
  let minutesEarly = 0;
  if (checkInTime > expectedCheckInTime) {
    minutesLate = Math.floor((checkInTime - expectedCheckInTime) / (1000 * 60));
  } else {
    minutesEarly = Math.floor((expectedCheckInTime - checkInTime) / (1000 * 60));
  }

  // Determine status based on check-in time and grace period
  let status = 'PRESENT';
  if (minutesLate > workSchedule.gracePeriod) {
    status = 'LATE';
  }

  if (existingAttendance) {
    // Update existing attendance record
    existingAttendance.checkIn = {
      time: checkInTime,
      ipAddress: 'MANUAL_BY_ADMIN',
    };
    existingAttendance.status = status;
    await existingAttendance.save();
    
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
        ipAddress: 'MANUAL_BY_ADMIN',
      },
      status: status,
    });
    
    const attendanceObj = attendance.toObject();
    attendanceObj.minutesLate = minutesLate;
    attendanceObj.minutesEarly = minutesEarly;
    attendanceObj.expectedCheckInTime = expectedCheckInTime;
    attendanceObj.status = status;
    return attendanceObj;
  }
};

/**
 * Manual check out employee (admin bypasses IP validation and office hours)
 * Used when employee has issues with mobile app
 * Note: This function bypasses office hours validation as it's an admin override
 */
const manualCheckOut = async (userId, adminId) => {
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
    throw new Error('Employee must check in before checking out. Please check them in first.');
  }

  if (!attendance.checkIn?.time) {
    throw new Error('Employee must check in before checking out. Please check them in first.');
  }

  if (attendance.checkOut?.time) {
    throw new Error('Employee has already checked out today');
  }

  const checkOutTime = new Date();
  const checkInTime = attendance.checkIn.time;

  // Calculate working hours in minutes
  const workingMinutes = Math.floor((checkOutTime - checkInTime) / (1000 * 60));

  attendance.checkOut = {
    time: checkOutTime,
    ipAddress: 'MANUAL_BY_ADMIN',
  };
  attendance.workingHours = workingMinutes;

  // Update status based on working hours
  if (workingMinutes < 240) {
    // Less than 4 hours = half day
    attendance.status = 'HALF_DAY';
  }

  await attendance.save();
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
  manualCheckIn,
  manualCheckOut,
};

