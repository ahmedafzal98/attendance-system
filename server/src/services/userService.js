const User = require('../models/User');
const { hashPassword, comparePassword, generateToken } = require('../utils/auth');

const loginUser = async (credentials) => {
  const { email, password } = credentials;

  // Find user by email
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.password);
  
  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  // Generate JWT token
  const token = generateToken(user._id.toString(), user.email, user.role);

  // Return user data (without password) and token
  const userObject = user.toJSON();
  return {
    user: userObject,
    token,
  };
};

const createEmployee = async (data) => {
  const { email, password, name } = data;

  // Check if user already exists
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create employee user
  const user = await User.create({
    email,
    password: hashedPassword,
    name,
    role: 'EMPLOYEE',
  });

  // Return user data without password
  return user.toJSON();
};

const getAllEmployees = async () => {
  const employees = await User.find({ role: 'EMPLOYEE' })
    .select('-password')
    .sort({ createdAt: -1 });

  return employees;
};

/**
 * Reset employee password (for admin)
 * Returns the new plain text password so admin can share it with employee
 */
const resetEmployeePassword = async (userId, newPassword) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new Error('Employee not found');
  }

  if (!newPassword) {
    throw new Error('New password is required');
  }

  // Password validation (minimum 6 characters)
  if (newPassword.length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }

  // Hash the password
  const hashedPassword = await hashPassword(newPassword);
  
  // Update user password
  user.password = hashedPassword;
  await user.save();

  // Return plain password for admin to share with employee
  return {
    email: user.email,
    name: user.name,
    newPassword: newPassword,
  };
};

/**
 * Update employee details (for admin)
 */
const updateEmployee = async (userId, data) => {
  const { email, name, password } = data;

  const user = await User.findById(userId);
  
  if (!user) {
    throw new Error('Employee not found');
  }

  // Check if email is being changed and if it's already taken
  if (email && email !== user.email) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('Email already exists');
    }
  }

  // Update fields
  if (email) {
    user.email = email.toLowerCase().trim();
  }

  if (name) {
    user.name = name.trim();
  }

  // Update password if provided
  if (password) {
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }
    user.password = await hashPassword(password);
  }

  await user.save();

  // Return updated user without password
  return user.toJSON();
};

/**
 * Delete employee (for admin)
 */
const deleteEmployee = async (userId) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new Error('Employee not found');
  }

  // Prevent deleting admin users
  if (user.role === 'ADMIN') {
    throw new Error('Cannot delete admin user');
  }

  await User.findByIdAndDelete(userId);

  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
  };
};

module.exports = {
  loginUser,
  createEmployee,
  getAllEmployees,
  resetEmployeePassword,
  updateEmployee,
  deleteEmployee,
};

