// Load environment variables FIRST - before any other imports
const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const User = require('../models/User');
const { hashPassword } = require('../utils/auth');

async function createAdmin() {
  // Validate required environment variables
  if (!process.env.DATABASE_URL) {
    console.error('Error: DATABASE_URL is not set in environment variables.');
    console.error('Please create a .env file in the server directory with DATABASE_URL.');
    process.exit(1);
  }

  if (!process.env.JWT_SECRET) {
    console.error('Error: JWT_SECRET is not set in environment variables.');
    console.error('Please create a .env file in the server directory with JWT_SECRET.');
    process.exit(1);
  }

  const email = process.argv[2] || 'admin@example.com';
  const password = process.argv[3] || 'admin123';
  const name = process.argv[4] || 'Admin User';

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log('Admin with this email already exists');
      await mongoose.connection.close();
      return;
    }

    const hashedPassword = await hashPassword(password);

    const admin = await User.create({
      email,
      password: hashedPassword,
      name,
      role: 'ADMIN',
    });

    console.log('Admin created successfully!');
    console.log('Email:', admin.email);
    console.log('Name:', admin.name);
    console.log('Role:', admin.role);
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

createAdmin();

