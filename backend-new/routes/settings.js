const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const auth = require('../middleware/auth');

// GET /api/settings - retrieve settings (initialize if empty)
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({
        agencyName: 'VIZO TECH',
        adminEmail: 'admin@vizotech.agency',
        emailAlerts: true,
        systemStatusUpdates: false
      });
      await settings.save();
    }
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// PUT /api/settings (Protected) - update settings
router.put('/', auth, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings(req.body);
    } else {
      settings = await Settings.findOneAndUpdate(
        {},
        { $set: req.body },
        { new: true }
      );
    }
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
