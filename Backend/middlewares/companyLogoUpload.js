import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads/companylogos directory exists
const uploadDir = path.join(process.cwd(), 'uploads', 'companylogos');
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
    cb(null, `logo-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed for company logo!'), false);
  }
};

export const uploadCompanyLogo = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

export const handleCompanyLogoUpload = (req, res, next) => {
  uploadCompanyLogo.single('logo')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || 'Logo image upload failed' });
    }
    next();
  });
};
