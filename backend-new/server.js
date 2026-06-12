const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./db');

// Initialize database
connectDB();

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

