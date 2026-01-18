const {
  getWorkSchedule,
  getAllWorkSchedules,
  upsertWorkSchedule,
  deleteWorkSchedule,
} = require('../services/workScheduleService');

/**
 * Get work schedule for a specific employee
 */
const getEmployeeWorkSchedule = async (req, res) => {
  try {
    const { userId } = req.params;
    const schedule = await getWorkSchedule(userId);
    res.status(200).json({ schedule });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch work schedule';
    res.status(400).json({ error: errorMessage });
  }
};

/**
 * Get all work schedules
 */
const getAllEmployeeWorkSchedules = async (req, res) => {
  try {
    const schedules = await getAllWorkSchedules();
    res.status(200).json({ schedules });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch work schedules';
    res.status(500).json({ error: errorMessage });
  }
};

/**
 * Create or update work schedule for an employee
 */
const createOrUpdateWorkSchedule = async (req, res) => {
  try {
    const { userId } = req.params;
    const { checkInTime, checkOutTime, gracePeriod } = req.body;

    if (!checkInTime || !checkOutTime) {
      res.status(400).json({ error: 'Check-in time and check-out time are required' });
      return;
    }

    const schedule = await upsertWorkSchedule(userId, {
      checkInTime,
      checkOutTime,
      gracePeriod: gracePeriod || 30,
    });

    res.status(200).json({
      message: 'Work schedule saved successfully',
      schedule,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to save work schedule';
    res.status(400).json({ error: errorMessage });
  }
};

/**
 * Delete work schedule
 */
const deleteEmployeeWorkSchedule = async (req, res) => {
  try {
    const { userId } = req.params;
    const schedule = await deleteWorkSchedule(userId);
    res.status(200).json({
      message: 'Work schedule deleted successfully',
      schedule,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete work schedule';
    res.status(400).json({ error: errorMessage });
  }
};

module.exports = {
  getEmployeeWorkSchedule,
  getAllEmployeeWorkSchedules,
  createOrUpdateWorkSchedule,
  deleteEmployeeWorkSchedule,
};

