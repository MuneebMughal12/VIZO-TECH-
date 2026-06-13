const express = require('express');
const router = express.Router();
const Inquiry = require('../models/Inquiry');
const auth = require('../middleware/auth');

// GET /api/inquiries (Protected) - lists all client submissions
router.get('/', auth, async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// POST /api/inquiries - public inquiry capture
router.post('/', async (req, res) => {
  const { name, email, whatsapp, serviceChips, message, attachmentUrl } = req.body;

  try {
    if (!name || !email || !whatsapp || !message) {
      return res.status(400).json({ msg: 'Please enter name, email, whatsapp, and message' });
    }

    const newInquiry = new Inquiry({
      name,
      email,
      whatsapp,
      serviceChips,
      message,
      attachmentUrl,
      isRead: false,
      replies: []
    });

    const inquiry = await newInquiry.save();
    res.json(inquiry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// POST /api/inquiries/:id/reply (Protected) - appends responses to thread
router.post('/:id/reply', auth, async (req, res) => {
  const { message } = req.body;

  try {
    if (!message) {
      return res.status(400).json({ msg: 'Reply message is required' });
    }

    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ msg: 'Inquiry not found' });
    }

    // Append reply
    inquiry.replies.push({
      sender: 'admin',
      message,
      timestamp: new Date()
    });

    inquiry.isRead = true; // Auto-mark read on reply

    await inquiry.save();

    // Trigger notification dispatches and await them so serverless functions (Vercel) don't terminate before they complete
    const { sendEmailNotification, sendWhatsAppNotification } = require('../utils/notifier');
    
    const notifications = [
      sendEmailNotification(inquiry.email, inquiry.name, message)
    ];
    
    if (inquiry.whatsapp) {
      notifications.push(sendWhatsAppNotification(inquiry.whatsapp, inquiry.name, message));
    }
    
    await Promise.allSettled(notifications);

    res.json(inquiry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// PUT /api/inquiries/:id (Protected) - update read/unread or replies
router.put('/:id', auth, async (req, res) => {
  try {
    let inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ msg: 'Inquiry not found' });
    }

    inquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json(inquiry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// DELETE /api/inquiries/:id (Protected)
router.delete('/:id', auth, async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ msg: 'Inquiry not found' });
    }

    await Inquiry.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Inquiry removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
