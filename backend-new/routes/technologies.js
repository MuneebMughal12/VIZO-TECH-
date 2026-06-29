const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary } = require('../utils/cloudinary');
const Technology = require('../models/Technology');
const auth = require('../middleware/auth');

// Multer Storage Configuration specifically for Technologies
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const isSvg = file.originalname.toLowerCase().endsWith('.svg') || file.mimetype === 'image/svg+xml';
    return {
      folder: 'vizo-tech-technologies',
      transformation: isSvg ? undefined : [{ width: 400, height: 400, crop: 'limit', quality: 'auto', fetch_format: 'auto' }],
      format: isSvg ? 'svg' : undefined,
      public_id: `tech-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
    };
  },
});

// Strict Multer Upload Instance with file filter for PNG, JPG, JPEG, WEBP, SVG, AVIF
const upload = multer({
  storage: storage,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml', 'image/avif'];
    const allowedExts = /\.(png|jpg|jpeg|webp|svg|avif)$/i;

    const isMimeValid = allowedMimes.includes(file.mimetype);
    const isExtValid = allowedExts.test(file.originalname);

    if (isMimeValid && isExtValid) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type. Only PNG, JPG, JPEG, WEBP, SVG, and AVIF are allowed.'));
  },
});

// Safe wrapper for Cloudinary deletion to prevent halting the API
const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log(`Cloudinary deletion success for: ${publicId}`, result);
    return result;
  } catch (err) {
    console.error(`Failed to delete asset ${publicId} from Cloudinary:`, err.message);
    // Suppress error so database sync operations don't freeze the API
    return null;
  }
};

// GET /api/technologies - Public route (Active items only, sorted by displayOrder)
router.get('/', async (req, res) => {
  try {
    const technologies = await Technology.find({ isActive: true }).sort({ displayOrder: 1 });
    res.json(technologies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET /api/technologies/admin - Admin route (All items, sorted by displayOrder)
router.get('/admin', auth, async (req, res) => {
  try {
    const technologies = await Technology.find().sort({ displayOrder: 1 });
    res.json(technologies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// POST /api/technologies - Create technology (Protected)
router.post('/', auth, (req, res, next) => {
  // Execute upload and handle multer limits/filter validation errors gracefully
  upload.single('logo')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ msg: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    const { name, category, displayOrder, isActive } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ msg: 'Please upload a logo image file' });
    }

    const newTech = new Technology({
      name,
      category,
      logoUrl: req.file.path, // Cloudinary secure URL
      cloudinaryId: req.file.filename, // Cloudinary public ID
      displayOrder: Number(displayOrder) || 0,
      isActive: isActive === 'true' || isActive === true
    });

    const savedTech = await newTech.save();
    res.json(savedTech);
  } catch (err) {
    console.error(err);
    // If saving to DB fails, clean up the newly uploaded Cloudinary asset in background
    if (req.file && req.file.filename) {
      deleteFromCloudinary(req.file.filename);
    }
    res.status(500).json({ msg: 'Server error' });
  }
});

// PUT /api/technologies/:id - Update technology (Protected)
router.put('/:id', auth, (req, res, next) => {
  upload.single('logo')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ msg: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    const { name, category, displayOrder, isActive } = req.body;
    let tech = await Technology.findById(req.params.id);
    if (!tech) {
      return res.status(404).json({ msg: 'Technology item not found' });
    }

    const updateData = {
      name: name || tech.name,
      category: category || tech.category,
      displayOrder: displayOrder !== undefined ? Number(displayOrder) : tech.displayOrder,
      isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : tech.isActive
    };

    // If new logo is uploaded
    if (req.file) {
      // Clean up the old logo from Cloudinary asynchronously
      const oldCloudinaryId = tech.cloudinaryId;
      if (oldCloudinaryId) {
        deleteFromCloudinary(oldCloudinaryId);
      }

      updateData.logoUrl = req.file.path;
      updateData.cloudinaryId = req.file.filename;
    }

    const updatedTech = await Technology.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    res.json(updatedTech);
  } catch (err) {
    console.error(err);
    if (req.file && req.file.filename) {
      deleteFromCloudinary(req.file.filename);
    }
    res.status(500).json({ msg: 'Server error' });
  }
});

// DELETE /api/technologies/:id - Delete technology (Protected)
router.delete('/:id', auth, async (req, res) => {
  try {
    const tech = await Technology.findById(req.params.id);
    if (!tech) {
      return res.status(404).json({ msg: 'Technology item not found' });
    }

    // Clean up from Cloudinary in background
    if (tech.cloudinaryId) {
      deleteFromCloudinary(tech.cloudinaryId);
    }

    await Technology.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Technology item removed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
