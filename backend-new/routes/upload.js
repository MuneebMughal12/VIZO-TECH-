const express = require('express');
const router = express.Router();
const { upload, uploadAny } = require('../utils/cloudinary');
const auth = require('../middleware/auth');

// POST /api/upload - Upload image to Cloudinary (Public / Contact Form)
router.post('/', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'Please select a file to upload' });
    }

    // Cloudinary returns the URL in req.file.path
    const imageUrl = req.file.path;
    res.json({ imageUrl, fileUrl: imageUrl });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'File upload failed' });
  }
}, (error, req, res, next) => {
  res.status(400).json({ msg: error.message });
});

// POST /api/upload/file - Upload any document/file to Cloudinary (Protected for admin replies)
router.post('/file', auth, uploadAny.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'Please select a file to upload' });
    }

    // Cloudinary returns the file URL in req.file.path
    const fileUrl = req.file.path;
    res.json({ fileUrl });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'File upload failed' });
  }
}, (error, req, res, next) => {
  res.status(400).json({ msg: error.message });
});

module.exports = router;
