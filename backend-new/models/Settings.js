const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  agencyName: {
    type: String,
    default: 'VIZO TECH'
  },
  adminEmail: {
    type: String,
    default: 'admin@vizotech.agency'
  },
  emailAlerts: {
    type: Boolean,
    default: true
  },
  systemStatusUpdates: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Settings', SettingsSchema);
