import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

const rawUploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads');
const uploadDir = path.resolve(rawUploadDir);

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration with random UUID / timestamp naming
const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb) => {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (_req: Request, file: Express.Multer.File, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const sanitizedExt = path.extname(file.originalname).toLowerCase();
    cb(null, `doc-${uniqueSuffix}${sanitizedExt}`);
  }
});

// Allowed MIME types: PDF, JPEG, PNG
const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, JPEG, and PNG files are accepted.'));
  }
};

export const documentUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB maximum limit
  }
});
