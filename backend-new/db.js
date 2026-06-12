const mongoose = require('mongoose');
require('dotenv').config();

// Cache the connection across serverless function invocations
let isConnected = false;

const connectDB = async () => {
  // If already connected, reuse the connection
  if (isConnected && mongoose.connection.readyState === 1) {
    console.log('Reusing existing MongoDB connection');
    return;
  }

  try {
    const connURI = process.env.MONGODB_URI;

    if (!connURI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    await mongoose.connect(connURI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    isConnected = true;
    console.log('MongoDB Connected successfully');
  } catch (error) {
    isConnected = false;
    console.error(`MongoDB connection error: ${error.message}`);
    // Do NOT call process.exit() on Vercel — it kills the serverless function
    throw error;
  }
};

module.exports = connectDB;

