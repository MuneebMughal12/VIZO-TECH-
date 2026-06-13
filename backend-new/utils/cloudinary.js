const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary with credentials from .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary storage engine for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const isSvg = file.originalname.toLowerCase().endsWith('.svg') || file.mimetype === 'image/svg+xml';
    return {
      folder: 'vizo-tech',           // All uploads go into "vizo-tech" folder on Cloudinary
      // For SVG, do not apply raster transformations, and specify format as 'svg'
      transformation: isSvg ? undefined : [{ width: 1200, crop: 'limit', quality: 'auto', fetch_format: 'auto' }],
      format: isSvg ? 'svg' : undefined,
      public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}`,
    };
  },
});

// Multer instance using Cloudinary storage
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|svg/;
    const ext = allowed.test(file.originalname.toLowerCase());
    const mime = /image/.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error('Only image files are allowed (jpg, png, gif, webp, svg)'));
  },
});

// Cloudinary storage engine for arbitrary documents/files
const fileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const isSvg = file.originalname.toLowerCase().endsWith('.svg') || file.mimetype === 'image/svg+xml';
    const isImage = file.mimetype.startsWith('image/');
    return {
      folder: 'vizo-tech-files',
      resource_type: 'auto', // Cloudinary auto-detects image, video, raw file
      transformation: (isImage && !isSvg) ? [{ width: 1200, crop: 'limit', quality: 'auto', fetch_format: 'auto' }] : undefined,
      format: isSvg ? 'svg' : undefined,
      public_id: `${Date.now()}-${file.originalname.split('.')[0].replace(/[^a-zA-Z0-9]/g, '_')}`,
    };
  },
});

// Multer instance for any file upload (PDF, zip, docx, image, etc.)
const uploadAny = multer({
  storage: fileStorage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
});

module.exports = { cloudinary, upload, uploadAny };
