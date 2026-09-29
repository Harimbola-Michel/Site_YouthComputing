// src/middlewares/uploadCV.middleware.ts
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const CV_UPLOAD_DIR = path.join(process.env.STORAGE_PATH || process.cwd(), 'uploads/cvs');

if (!fs.existsSync(CV_UPLOAD_DIR)) {
  fs.mkdirSync(CV_UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, CV_UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${uuidv4()}${ext}`;
    cb(null, uniqueName);
  },
});

const allowedTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const fileFilter = (req: any, file: any, cb: any) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Format non supporté. Utilisez PDF, DOC ou DOCX.'), false);
  }
};

export const uploadCV = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,      // 5 Mo
    fieldSize: 10 * 1024 * 1024,    // 10 Mo pour les champs texte
  },
  fileFilter,
});
