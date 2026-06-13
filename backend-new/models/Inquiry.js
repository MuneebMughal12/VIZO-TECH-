const mongoose = require('mongoose');

const ReplySchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ['admin', 'client'],
    default: 'admin'
  },
  message: {
    type: String,
    required: true
  },
  attachmentUrl: {
    type: String,
    default: ''
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const InquirySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  whatsapp: {
    type: String,
    default: '',
    trim: true
  },
  serviceChips: {
    type: [String],
    default: []
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  attachmentUrl: {
    type: String,
    default: ''
  },
  replies: [ReplySchema]
}, { timestamps: true });

module.exports = mongoose.model('Inquiry', InquirySchema);
