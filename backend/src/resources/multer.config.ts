import { memoryStorage } from 'multer';
import { extname } from 'path';

const SAFE_MIMES = new Set([
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'video/mp4', 'video/webm', 'video/x-msvideo',
  'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/flac',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain', 'text/csv',
]);

const SAFE_EXT = new Set([
  'jpg', 'jpeg', 'png', 'gif', 'webp',
  'mp4', 'webm', 'avi',
  'mp3', 'wav', 'ogg', 'aac', 'flac',
  'pdf', 'docx', 'xlsx', 'pptx',
  'txt', 'csv',
]);

export const multerConfig = {
  storage: memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req: any, file: Express.Multer.File, cb: any) => {
    const ext = extname(file.originalname).toLowerCase().replace('.', '');
    if (!SAFE_MIMES.has(file.mimetype) || !SAFE_EXT.has(ext)) {
      return cb(new Error('File type not allowed'), false);
    }
    cb(null, true);
  },
};
