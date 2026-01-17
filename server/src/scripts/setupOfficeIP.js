const mongoose = require('mongoose');
const dotenv = require('dotenv');
const IPConfig = require('../models/IPConfig');

dotenv.config();

async function setupOfficeIP() {
  // Validate required environment variables
  if (!process.env.DATABASE_URL) {
    console.error('Error: DATABASE_URL is not set in environment variables.');
    console.error('Please create a .env file in the server directory with DATABASE_URL.');
    process.exit(1);
  }

  const name = process.argv[2] || 'Office WiFi';
  const ipAddress = process.argv[3];
  const subnet = process.argv[4]; // Optional subnet mask or CIDR

  if (!ipAddress) {
    console.error('Error: IP address is required');
    console.log('Usage: node src/scripts/setupOfficeIP.js <name> <ipAddress> [subnet]');
    console.log('Example: node src/scripts/setupOfficeIP.js "Main Office" "192.168.1.1" "255.255.255.0"');
    console.log('Example: node src/scripts/setupOfficeIP.js "Main Office" "192.168.1.0" "/24"');
    process.exit(1);
  }

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('Connected to MongoDB');

    // Check if IP already exists
    const existing = await IPConfig.findOne({ ipAddress });

    if (existing) {
      console.log('IP configuration already exists:');
      console.log(existing);
      await mongoose.connection.close();
      process.exit(0);
    }

    // Create IP configuration
    const config = await IPConfig.create({
      name,
      ipAddress,
      subnet: subnet || undefined,
      isActive: true,
      description: `Office WiFi configuration for ${name}`,
    });

    console.log('✅ Office IP configuration created successfully!');
    console.log('Name:', config.name);
    console.log('IP Address:', config.ipAddress);
    console.log('Subnet:', config.subnet || 'Not set');
    console.log('Active:', config.isActive);
  } catch (error) {
    console.error('Error creating IP configuration:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

setupOfficeIP();

