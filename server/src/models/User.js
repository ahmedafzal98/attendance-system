const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['ADMIN', 'EMPLOYEE'],
      default: 'EMPLOYEE',
    },
  },
  {
    timestamps: true,
  }
);

// Remove password from JSON output and convert _id to id
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  user.id = user._id.toString();
  delete user.password;
  delete user._id;
  delete user.__v;
  return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;

