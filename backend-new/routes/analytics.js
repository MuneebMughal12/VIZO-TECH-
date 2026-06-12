const express = require('express');
const router = express.Router();
const Visit = require('../models/Visit');
const auth = require('../middleware/auth');

// POST /api/analytics/hit - Log a page visit
router.post('/hit', async (req, res) => {
  try {
    const { path } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';

    const newVisit = new Visit({
      ip,
      userAgent,
      path: path || '/'
    });

    await newVisit.save();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET /api/analytics/stats - Get visits statistics (Protected)
router.get('/stats', auth, async (req, res) => {
  try {
    const totalVisits = await Visit.countDocuments();
    
    const today = new Date();
    const daysLabel = [];
    const chartData = Array(7).fill(0);
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      daysLabel.push(dayName);
      
      const startOfDay = new Date(d);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(d);
      endOfDay.setHours(23, 59, 59, 999);
      
      const count = await Visit.countDocuments({
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      });
      chartData[6 - i] = count;
    }

    res.json({
      totalVisits,
      chartData,
      daysLabel
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
