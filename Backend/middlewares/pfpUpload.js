import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads/pfp directory exists
const uploadDir = path.join(process.cwd(), 'uploads', 'pfp');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `pfp-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

export const uploadPfp = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

export const handlePfpUpload = (req, res, next) => {
  uploadPfp.single('profile_photo')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || 'Profile image upload failed' });
    }
    next();
  });
};
