const {
  getEmployeesInOffice,
  getTodayAttendanceSummary,
  getAttendanceStatistics,
  getEmployeeAttendanceStats,
} = require('../services/dashboardService');

/**
 * Get employees currently in the office (Admin Dashboard)
 */
const getWhoIsInOffice = async (req, res) => {
  try {
    const employees = await getEmployeesInOffice();

    res.status(200).json({
      message: 'Employees currently in office',
      count: employees.length,
      employees,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch employees in office';
    res.status(500).json({ error: errorMessage });
  }
};

/**
 * Get today's attendance summary (Admin Dashboard)
 */
const getTodaySummary = async (req, res) => {
  try {
    const summary = await getTodayAttendanceSummary();

    res.status(200).json({
      message: "Today's attendance summary",
      date: new Date().toISOString().split('T')[0],
      ...summary,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch attendance summary';
    res.status(500).json({ error: errorMessage });
  }
};

/**
 * Get attendance statistics for a date range (Admin Dashboard)
 */
const getStatistics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const statistics = await getAttendanceStatistics(startDate, endDate);

    res.status(200).json({
      message: 'Attendance statistics',
      dateRange: {
        startDate: startDate || 'all time',
        endDate: endDate || 'all time',
      },
      ...statistics,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch statistics';
    res.status(500).json({ error: errorMessage });
  }
};

/**
 * Get employee attendance statistics and history (Employee App)
 */
const getMyAttendanceStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    const stats = await getEmployeeAttendanceStats(userId, startDate, endDate);

    res.status(200).json({
      message: 'Your attendance statistics',
      ...stats,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch attendance statistics';
    res.status(500).json({ error: errorMessage });
  }
};

module.exports = {
  getWhoIsInOffice,
  getTodaySummary,
  getStatistics,
  getMyAttendanceStats,
};

