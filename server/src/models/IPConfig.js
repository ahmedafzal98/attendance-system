const mongoose = require('mongoose');

const ipConfigSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    ipAddress: {
      type: String,
      required: true,
      trim: true,
    },
    subnet: {
      type: String, // e.g., "255.255.255.0" or CIDR notation like "/24"
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
ipConfigSchema.index({ ipAddress: 1 });
ipConfigSchema.index({ isActive: 1 });

// Convert _id to id
ipConfigSchema.methods.toJSON = function () {
  const config = this.toObject();
  config.id = config._id.toString();
  delete config._id;
  delete config.__v;
  return config;
};

const IPConfig = mongoose.model('IPConfig', ipConfigSchema);

module.exports = IPConfig;

