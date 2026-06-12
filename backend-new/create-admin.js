/**
 * Create Admin User Script
 * Run: node create-admin.js
 * This creates the admin user in the production MongoDB database
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const ADMIN_USERNAME = 'vizotech.official@gmail.com';
const ADMIN_PASSWORD = '686332@Vizo';

async function createAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existing = await User.findOne({ username: ADMIN_USERNAME });
    if (existing) {
      console.log('⚠️  Admin user already exists. Updating password...');
      existing.password = ADMIN_PASSWORD;
      await existing.save();
      console.log('✅ Admin password updated!');
    } else {
      // Create new admin user
      const admin = new User({
        username: ADMIN_USERNAME,
        password: ADMIN_PASSWORD,
      });
      await admin.save();
      console.log('✅ Admin user created successfully!');
    }

    console.log('-----------------------------------');
    console.log('Username:', ADMIN_USERNAME);
    console.log('Password:', ADMIN_PASSWORD);
    console.log('-----------------------------------');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

createAdmin();
