// src/routes/upload.routes.ts
import { Router } from 'express';
import { UploadController } from '../controllers/upload.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { isAdmin } from '../middlewares/role.middleware';
import { upload, uploadAvatar } from '../middlewares/upload.middleware';

const router = Router();
const uploadController = new UploadController();

// Routes protégées
router.use(authMiddleware);

// Upload générique
router.post('/single', upload.single('file'), uploadController.uploadSingle);
router.post('/multiple', upload.array('files', 5), uploadController.uploadMultiple);
router.delete('/:id', uploadController.deleteFile);
router.get('/', uploadController.getFiles);
router.get('/:id', uploadController.getFile);

// ✅ Route pour la photo d'équipe (existante)
router.post(
  '/team-photo',
  authMiddleware,
  isAdmin,
  upload.single('file'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Aucun fichier reçu' });
    }
    const filePath = `/uploads/${req.file.filename}`;
    return res.status(201).json({
      success: true,
      data: { url: filePath, filename: req.file.filename },
    });
  }
);

// ✅ Route spécifique pour les images d'événements
router.post(
  '/event-image',
  authMiddleware,
  isAdmin,
  upload.single('file'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Aucun fichier reçu' });
    }
    const filePath = `/uploads/${req.file.filename}`;
    return res.status(201).json({
      success: true,
      data: { url: filePath, filename: req.file.filename },
    });
  }
);

// Upload d'avatar
router.post('/avatar', uploadAvatar.single('avatar'), uploadController.uploadSingle);

export default router;