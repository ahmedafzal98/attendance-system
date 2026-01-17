const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    leaveType: {
      type: String,
      enum: ['SICK', 'VACATION', 'PERSONAL', 'EMERGENCY', 'OTHER'],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    totalDays: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },
    adminNotes: {
      type: String,
      trim: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
leaveSchema.index({ user: 1, startDate: 1 });
leaveSchema.index({ status: 1 });
leaveSchema.index({ startDate: 1, endDate: 1 });

// Validate that endDate is after startDate
leaveSchema.pre('save', function (next) {
  if (this.endDate < this.startDate) {
    return next(new Error('End date must be after start date'));
  }
  next();
});

// Calculate total days before saving
leaveSchema.pre('save', function (next) {
  if (this.startDate && this.endDate) {
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
    this.totalDays = diffDays;
  }
  next();
});

// Convert _id to id and format dates
leaveSchema.methods.toJSON = function () {
  const leave = this.toObject();
  leave.id = leave._id.toString();
  delete leave._id;
  delete leave.__v;
  return leave;
};

const Leave = mongoose.model('Leave', leaveSchema);

module.exports = Leave;

