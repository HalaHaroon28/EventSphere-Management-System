import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Target directory set to uploads/documents
const uploadDir = 'uploads/documents';

// Ensure the folder exists before saving files
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `doc-${uniqueSuffix}${ext}`);
  },
});

export const uploadDocument = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Target directory for expo images
const expoUploadDir = 'uploads/expos';
if (!fs.existsSync(expoUploadDir)) {
  fs.mkdirSync(expoUploadDir, { recursive: true });
}

const expoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, expoUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `expo-${uniqueSuffix}${ext}`);
  },
});

export const uploadExpoImage = multer({
  storage: expoStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
});