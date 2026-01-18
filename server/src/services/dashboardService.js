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
 * Get employees currently in the office (checked in but not checked out today)
 */
const getEmployeesInOffice = async () => {
  const todayStart = getTodayStart();
  const todayEnd = getTodayEnd();

  const attendanceRecords = await Attendance.find({
    date: {
      $gte: todayStart,
      $lte: todayEnd,
    },
    'checkIn.time': { $exists: true },
    'checkOut.time': { $exists: false },
  })
    .populate('user', 'name email role')
    .sort({ 'checkIn.time': 1 })
    .lean();

  // Format the response (filter out records with deleted users)
  const employeesInOffice = attendanceRecords
    .filter((record) => record.user) // Filter out records with deleted users
    .map((record) => ({
      id: record._id.toString(),
      userId: record.user._id.toString(),
      name: record.user.name,
      email: record.user.email,
      checkInTime: record.checkIn.time,
      checkInIP: record.checkIn.ipAddress,
      status: record.status,
      workingHours: record.workingHours || 0,
    }));

  return employeesInOffice;
};

/**
 * Get today's attendance summary (Admin Dashboard)
 */
const getTodayAttendanceSummary = async () => {
  const todayStart = getTodayStart();
  const todayEnd = getTodayEnd();

  // Get all attendance records for today
  const todayAttendance = await Attendance.find({
    date: {
      $gte: todayStart,
      $lte: todayEnd,
    },
  })
    .populate('user', 'name email role')
    .lean();

  // Filter out records with deleted users
  const validTodayAttendance = todayAttendance.filter((a) => a.user);

  // Get all employees
  const totalEmployees = await User.countDocuments({ role: 'EMPLOYEE' });

  // Get all employee IDs who have attendance records today
  const employeesWithAttendance = new Set(
    validTodayAttendance.map((a) => a.user._id.toString())
  );

  // Calculate statistics (using validTodayAttendance to avoid null reference errors)
  const checkedIn = validTodayAttendance.filter((a) => a.checkIn?.time).length;
  const checkedOut = validTodayAttendance.filter((a) => a.checkOut?.time).length;
  const inOffice = validTodayAttendance.filter(
    (a) => a.checkIn?.time && !a.checkOut?.time
  ).length;
  const present = validTodayAttendance.filter((a) => a.status === 'PRESENT').length;
  const late = validTodayAttendance.filter((a) => a.status === 'LATE').length;
  
  // Absent = total employees - employees who checked in OR were marked absent
  const employeesCheckedInOrMarked = validTodayAttendance.filter(
    (a) => a.checkIn?.time || a.status === 'ABSENT'
  ).length;
  const absent = totalEmployees - employeesCheckedInOrMarked;
  
  const halfDay = validTodayAttendance.filter((a) => a.status === 'HALF_DAY').length;

  // Get all employees who didn't check in today
  const allEmployees = await User.find({ role: 'EMPLOYEE' }).lean();
  const employeesCheckedInIds = new Set(
    validTodayAttendance
      .filter((a) => a.checkIn?.time)
      .map((a) => a.user._id.toString())
  );

  const employeesNotCheckedIn = allEmployees
    .filter((emp) => !employeesCheckedInIds.has(emp._id.toString()))
    .map((emp) => ({
      id: emp._id.toString(),
      name: emp.name,
      email: emp.email,
      date: new Date(),
    }));

  // Get employees marked as absent
  const markedAbsent = validTodayAttendance
    .filter((a) => a.status === 'ABSENT')
    .map((a) => ({
      id: a.user._id.toString(),
      name: a.user.name,
      email: a.user.email,
      date: a.date,
    }));

  // Combine absent employees (marked + not checked in) and remove duplicates
  const allAbsent = [...markedAbsent, ...employeesNotCheckedIn];
  const uniqueAbsent = Array.from(
    new Map(allAbsent.map((item) => [item.id, item])).values()
  );

  // Get employees by status
  const byStatus = {
    PRESENT: validTodayAttendance
      .filter((a) => a.status === 'PRESENT')
      .map((a) => ({
        id: a.user._id.toString(),
        name: a.user.name,
        email: a.user.email,
        checkInTime: a.checkIn?.time,
        checkOutTime: a.checkOut?.time,
        workingHours: a.workingHours || 0,
      })),
    LATE: validTodayAttendance
      .filter((a) => a.status === 'LATE')
      .map((a) => ({
        id: a.user._id.toString(),
        name: a.user.name,
        email: a.user.email,
        checkInTime: a.checkIn?.time,
        checkOutTime: a.checkOut?.time,
        workingHours: a.workingHours || 0,
      })),
    ABSENT: uniqueAbsent,
    HALF_DAY: validTodayAttendance
      .filter((a) => a.status === 'HALF_DAY')
      .map((a) => ({
        id: a.user._id.toString(),
        name: a.user.name,
        email: a.user.email,
        checkInTime: a.checkIn?.time,
        checkOutTime: a.checkOut?.time,
        workingHours: a.workingHours || 0,
      })),
  };

  return {
    summary: {
      totalEmployees,
      checkedIn,
      checkedOut,
      inOffice,
      present,
      late,
      absent,
      halfDay,
    },
    byStatus,
  };
};

/**
 * Get attendance statistics for a date range (Admin Dashboard)
 */
const getAttendanceStatistics = async (startDate, endDate) => {
  const query = {};

  if (startDate || endDate) {
    query.date = {};
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      query.date.$gte = start;
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.date.$lte = end;
    }
  }

  const attendanceRecords = await Attendance.find(query)
    .populate('user', 'name email role')
    .lean();

  // Calculate statistics
  const totalRecords = attendanceRecords.length;
  const present = attendanceRecords.filter((a) => a.status === 'PRESENT').length;
  const late = attendanceRecords.filter((a) => a.status === 'LATE').length;
  const absent = attendanceRecords.filter((a) => a.status === 'ABSENT').length;
  const halfDay = attendanceRecords.filter((a) => a.status === 'HALF_DAY').length;

  // Calculate average working hours
  const recordsWithHours = attendanceRecords.filter((a) => a.workingHours > 0);
  const totalWorkingHours = recordsWithHours.reduce(
    (sum, a) => sum + a.workingHours,
    0
  );
  const averageWorkingHours =
    recordsWithHours.length > 0
      ? Math.round(totalWorkingHours / recordsWithHours.length)
      : 0;

  // Group by date
  const byDate = {};
  attendanceRecords.forEach((record) => {
    const dateKey = new Date(record.date).toISOString().split('T')[0];
    if (!byDate[dateKey]) {
      byDate[dateKey] = {
        date: dateKey,
        present: 0,
        late: 0,
        absent: 0,
        halfDay: 0,
        total: 0,
      };
    }
    byDate[dateKey].total++;
    if (record.status === 'PRESENT') byDate[dateKey].present++;
    if (record.status === 'LATE') byDate[dateKey].late++;
    if (record.status === 'ABSENT') byDate[dateKey].absent++;
    if (record.status === 'HALF_DAY') byDate[dateKey].halfDay++;
  });

  return {
    summary: {
      totalRecords,
      present,
      late,
      absent,
      halfDay,
      averageWorkingHours,
    },
    byDate: Object.values(byDate).sort((a, b) => b.date.localeCompare(a.date)),
  };
};

/**
 * Get employee attendance statistics and summary
 */
const getEmployeeAttendanceStats = async (userId, startDate, endDate) => {
  const query = { user: userId };

  if (startDate || endDate) {
    query.date = {};
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      query.date.$gte = start;
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.date.$lte = end;
    }
  }

  const attendanceRecords = await Attendance.find(query)
    .populate('user', 'name email')
    .sort({ date: -1 })
    .lean();

  // Calculate statistics
  const totalDays = attendanceRecords.length;
  const present = attendanceRecords.filter((a) => a.status === 'PRESENT').length;
  const late = attendanceRecords.filter((a) => a.status === 'LATE').length;
  const absent = attendanceRecords.filter((a) => a.status === 'ABSENT').length;
  const halfDay = attendanceRecords.filter((a) => a.status === 'HALF_DAY').length;

  // Calculate total and average working hours
  const recordsWithHours = attendanceRecords.filter((a) => a.workingHours > 0);
  const totalWorkingHours = recordsWithHours.reduce(
    (sum, a) => sum + a.workingHours,
    0
  );
  const averageWorkingHours =
    recordsWithHours.length > 0
      ? Math.round(totalWorkingHours / recordsWithHours.length)
      : 0;

  // Calculate attendance percentage
  const attendancePercentage =
    totalDays > 0
      ? Math.round(((present + late + halfDay) / totalDays) * 100)
      : 0;

  // Get recent attendance (last 30 days or all if less)
  const recentAttendance = attendanceRecords.slice(0, 30).map((record) => ({
    id: record._id.toString(),
    date: record.date,
    checkInTime: record.checkIn?.time,
    checkOutTime: record.checkOut?.time,
    status: record.status,
    workingHours: record.workingHours || 0,
    notes: record.notes,
  }));

  return {
    statistics: {
      totalDays,
      present,
      late,
      absent,
      halfDay,
      totalWorkingHours,
      averageWorkingHours,
      attendancePercentage,
    },
    recentAttendance,
    allAttendance: attendanceRecords.map((record) => ({
      id: record._id.toString(),
      date: record.date,
      checkInTime: record.checkIn?.time,
      checkOutTime: record.checkOut?.time,
      status: record.status,
      workingHours: record.workingHours || 0,
      notes: record.notes,
    })),
  };
};

module.exports = {
  getEmployeesInOffice,
  getTodayAttendanceSummary,
  getAttendanceStatistics,
  getEmployeeAttendanceStats,
};

