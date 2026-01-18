const WorkSchedule = require('../models/WorkSchedule');
const User = require('../models/User');

/**
 * Get work schedule for a specific employee
 */
const getWorkSchedule = async (userId) => {
  let schedule = await WorkSchedule.findOne({ user: userId, isActive: true })
    .populate('user', 'name email');

  // If no schedule exists, return default schedule
  if (!schedule) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('Employee not found');
    }
    return {
      user: user.toJSON(),
      checkInTime: '09:00',
      checkOutTime: '18:00',
      gracePeriod: 30,
      isActive: true,
      isDefault: true,
    };
  }

  return schedule.toJSON();
};

/**
 * Get all work schedules
 */
const getAllWorkSchedules = async () => {
  const schedules = await WorkSchedule.find({ isActive: true })
    .populate('user', 'name email role')
    .sort({ createdAt: -1 });

  return schedules.map(s => s.toJSON());
};

/**
 * Create or update work schedule for an employee
 */
const upsertWorkSchedule = async (userId, scheduleData) => {
  const { checkInTime, checkOutTime, gracePeriod } = scheduleData;

  // Validate time format (HH:MM)
  const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(checkInTime) || !timeRegex.test(checkOutTime)) {
    throw new Error('Invalid time format. Use HH:MM format (e.g., 09:00, 18:00)');
  }

  // Validate grace period
  if (gracePeriod < 0 || gracePeriod > 120) {
    throw new Error('Grace period must be between 0 and 120 minutes');
  }

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('Employee not found');
  }

  // Check if schedule already exists
  let schedule = await WorkSchedule.findOne({ user: userId });

  if (schedule) {
    // Update existing schedule
    schedule.checkInTime = checkInTime;
    schedule.checkOutTime = checkOutTime;
    schedule.gracePeriod = gracePeriod;
    schedule.isActive = true;
    await schedule.save();
    return schedule.toJSON();
  } else {
    // Create new schedule
    schedule = await WorkSchedule.create({
      user: userId,
      checkInTime,
      checkOutTime,
      gracePeriod: gracePeriod || 30,
      isActive: true,
    });
    return schedule.toJSON();
  }
};

/**
 * Delete/deactivate work schedule
 */
const deleteWorkSchedule = async (userId) => {
  const schedule = await WorkSchedule.findOne({ user: userId });
  
  if (!schedule) {
    throw new Error('Work schedule not found');
  }

  schedule.isActive = false;
  await schedule.save();
  
  return schedule.toJSON();
};

module.exports = {
  getWorkSchedule,
  getAllWorkSchedules,
  upsertWorkSchedule,
  deleteWorkSchedule,
};

