const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const connectDB = require('./db');

const app = express();

// CORS — allow all origins (required for Vercel serverless)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));

// Handle preflight OPTIONS requests
app.options('*', cors());

app.use(express.json());

// Serve static uploads folder (fallback for local development)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to DB on each request (connection is cached/reused)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('DB connection failed:', err.message);
    res.status(500).json({ msg: 'Database connection failed' });
  }
});

// Mount routers
app.use('/api/admin', require('./routes/admin'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/team', require('./routes/team'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/inquiries', require('./routes/inquiries'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/analytics', require('./routes/analytics'));

// Base route for testing
app.get('/', (req, res) => {
  res.json({ msg: 'VIZO TECH API Operational' });
});

// Export for Vercel serverless (do NOT use app.listen on Vercel)
module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running locally on port ${PORT}`);
  });
}

