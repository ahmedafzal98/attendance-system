/**
 * Office Timing Validation Utility
 * 
 * Validates if the current time is within office hours.
 * Office hours: 9:00 PM (21:00) to 6:00 AM (06:00)
 * This spans midnight, so we need to handle the edge case.
 */

/**
 * Check if the current time is within office hours (9pm to 6am)
 * @param {Date} date - Optional date to check. If not provided, uses current time.
 * @returns {boolean} - True if within office hours, false otherwise
 */
const isWithinOfficeHours = (date = new Date()) => {
  const hour = date.getHours();
  
  // Office hours: 21:00 (9pm) to 05:59:59 (5:59:59am)
  // Valid hours: 21, 22, 23 (9pm-11:59pm) and 0, 1, 2, 3, 4, 5 (midnight-5:59am)
  // Invalid hours: 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20 (6am-8:59pm)
  
  return hour >= 21 || hour < 6;
};

/**
 * Get a human-readable message about office hours
 * @returns {string} - Message describing office hours
 */
const getOfficeHoursMessage = () => {
  return 'Office hours are from 9:00 PM to 6:00 AM. Check-in/check-out is only allowed during these hours.';
};

/**
 * Get the next valid check-in time if current time is outside office hours
 * @param {Date} date - Optional date to check. If not provided, uses current time.
 * @returns {Date} - Next valid check-in time
 */
const getNextValidCheckInTime = (date = new Date()) => {
  const nextValid = new Date(date);
  const hour = nextValid.getHours();
  
  if (hour >= 6 && hour < 21) {
    // Current time is between 6am and 8:59pm
    // Next valid time is 9pm today
    nextValid.setHours(21, 0, 0, 0);
  } else if (hour >= 21) {
    // Current time is already within office hours (9pm-11:59pm)
    // This shouldn't happen if validation is working, but return current time
    return nextValid;
  } else {
    // Current time is between midnight and 5:59am
    // This is already valid, return current time
    return nextValid;
  }
  
  return nextValid;
};

/**
 * Get the next valid check-out time if current time is outside office hours
 * @param {Date} date - Optional date to check. If not provided, uses current time.
 * @returns {Date} - Next valid check-out time
 */
const getNextValidCheckOutTime = (date = new Date()) => {
  // For check-out, we need to consider that if someone checked in during office hours,
  // they should be able to check out during office hours or slightly after
  // But for validation, we'll use the same logic as check-in
  return getNextValidCheckInTime(date);
};

module.exports = {
  isWithinOfficeHours,
  getOfficeHoursMessage,
  getNextValidCheckInTime,
  getNextValidCheckOutTime,
};

