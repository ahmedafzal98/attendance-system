const mongoose = require('mongoose');

const workScheduleSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // One schedule per employee
    },
    checkInTime: {
      type: String, // Format: "HH:MM" (e.g., "09:00" for 9 AM)
      required: true,
      default: '09:00',
    },
    checkOutTime: {
      type: String, // Format: "HH:MM" (e.g., "18:00" for 6 PM)
      required: true,
      default: '18:00',
    },
    gracePeriod: {
      type: Number, // Grace period in minutes
      required: true,
      default: 30, // 30 minutes default
      min: 0,
      max: 120, // Max 2 hours grace period
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
workScheduleSchema.index({ user: 1 });

// Convert _id to id
workScheduleSchema.methods.toJSON = function () {
  const schedule = this.toObject();
  schedule.id = schedule._id.toString();
  delete schedule._id;
  delete schedule.__v;
  return schedule;
};

const WorkSchedule = mongoose.model('WorkSchedule', workScheduleSchema);

module.exports = WorkSchedule;

