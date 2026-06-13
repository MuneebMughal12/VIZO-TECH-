const mongoose = require('mongoose');

const TeamMemberSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    trim: true
  },
  bio: {
    type: String,
    required: true
  },
  isPinnedHome: {
    type: Boolean,
    default: false
  },
  experience: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('TeamMember', TeamMemberSchema);
