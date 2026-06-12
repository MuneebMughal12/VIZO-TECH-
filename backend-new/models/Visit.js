const mongoose = require('mongoose');

const VisitSchema = new mongoose.Schema({
  ip: {
    type: String,
    default: ''
  },
  userAgent: {
    type: String,
    default: ''
  },
  path: {
    type: String,
    default: '/'
  }
}, { timestamps: true });

module.exports = mongoose.model('Visit', VisitSchema);
