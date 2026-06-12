const express = require('express');
const router = express.Router();
const { upload } = require('../utils/cloudinary');

// POST /api/upload - Upload image to Cloudinary
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

module.exports = router;
