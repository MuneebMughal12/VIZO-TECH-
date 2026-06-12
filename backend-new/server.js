const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./db');

// Initialize database
connectDB();

const app = express();

// CORS — allow frontend origin (set FRONTEND_URL in env for production)
const allowedOrigins = [
  process.env.FRONTEND_URL,         // e.g. https://vizo-tech-xyz.vercel.app
  'http://localhost:5173',          // local dev
  'http://localhost:3000',          // local dev alternative
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());
// Note: /uploads static serving removed - images are now hosted on Cloudinary CDN

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

// Port configuration
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
