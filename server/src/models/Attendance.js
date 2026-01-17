const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    checkIn: {
      time: {
        type: Date,
      },
      ipAddress: {
        type: String,
      },
    },
    checkOut: {
      time: {
        type: Date,
      },
      ipAddress: {
        type: String,
      },
    },
    status: {
      type: String,
      enum: ['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY'],
      default: 'PRESENT',
    },
    workingHours: {
      type: Number, // in minutes
      default: 0,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
attendanceSchema.index({ user: 1, date: 1 }, { unique: true });
attendanceSchema.index({ date: 1 });

// Convert _id to id and format date
attendanceSchema.methods.toJSON = function () {
  const attendance = this.toObject();
  attendance.id = attendance._id.toString();
  delete attendance._id;
  delete attendance.__v;
  return attendance;
};

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;

