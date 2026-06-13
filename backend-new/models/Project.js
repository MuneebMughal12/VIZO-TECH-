const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: ['Development', 'Design', 'AI', 'Digital Marketing', 'Video Editing', 'Shopify']
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  client: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Production', 'Staging', 'Concept', 'Delivered'],
    default: 'Production'
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  projectLink: {
    type: String,
    default: ''
  },
  isPinnedHome: {
    type: Boolean,
    default: false
  },
  challenge: {
    type: String,
    required: true
  },
  solution: {
    type: String,
    required: true
  },
  impact: {
    type: String,
    default: ''
  },
  metrics: {
    latency: { type: String, default: '' },
    dailyTxs: { type: String, default: '' },
    uptime: { type: String, default: '' },
    roiMultiplier: { type: String, default: '' }
  },
  techStack: {
    type: [String],
    default: []
  }
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);
