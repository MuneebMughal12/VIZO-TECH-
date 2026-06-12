const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Generate unique name: timestamp + original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to restrict uploads to images and documents
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|svg|pdf|doc|docx|txt/;
  const mimetype = /image|pdf|msword|wordprocessingml|text\/plain/.test(file.mimetype);
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Only images, PDFs, Word docs, and text files are allowed!'));
};

// Initialize multer upload middleware
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

// POST /api/upload - Public image and document upload
router.post('/', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'Please select a file to upload' });
    }

    // Build the absolute URL for the uploaded file
    const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    res.json({ imageUrl: fileUrl, fileUrl: fileUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'File upload failed' });
  }
}, (error, req, res, next) => {
  // Error handling middleware for Multer errors
  res.status(400).json({ msg: error.message });
});

module.exports = router;
