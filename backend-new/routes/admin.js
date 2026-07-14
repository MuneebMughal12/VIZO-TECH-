const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// POST /api/admin/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    if (!username || !password) {
      return res.status(400).json({ msg: 'Please enter all fields' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET || 'vizo_tech_secret_key_2026',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

const Service = require('../models/Service');
const Package = require('../models/Package');
const auth = require('../middleware/auth');

// GET /api/admin/dashboard-stats
router.get('/dashboard-stats', auth, async (req, res) => {
  try {
    const totalServices = await Service.countDocuments();
    const totalPackages = await Package.countDocuments();
    const pinnedPackages = await Package.countDocuments({ isPinned: true });
    const activeDiscounts = await Package.countDocuments({ discountActive: true });

    res.json({
      totalServices,
      totalPackages,
      pinnedPackages,
      activeDiscounts
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
