import multer from 'multer';
import path from 'path';
import fs from 'fs';

const createStorage = (subfolder: 'documents' | 'od' | 'lms') => {
  const uploadPath = path.resolve(process.cwd(), 'backend', 'uploads', subfolder);
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, uploadPath);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
      cb(null, `${cleanName}-${uniqueSuffix}${ext}`);
    }
  });
};

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.zip', '.txt'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type ${ext}. Allowed: PDF, Word docs, PNG, JPG, ZIP, TXT.`));
  }
};

export const documentUpload = multer({
  storage: createStorage('documents'),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter
});

export const odProofUpload = multer({
  storage: createStorage('od'),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter
});

export const lmsMaterialUpload = multer({
  storage: createStorage('lms'),
  limits: { fileSize: 30 * 1024 * 1024 }, // 30MB
  fileFilter
});
