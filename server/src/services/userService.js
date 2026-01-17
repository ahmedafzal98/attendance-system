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

module.exports = {
  loginUser,
  createEmployee,
  getAllEmployees,
};

