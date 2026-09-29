import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

export class UploadController {
  // Upload d'un seul fichier
  async uploadSingle(req: Request, res: Response) {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Aucun fichier reçu' });
    }
    // ✅ Renvoyer le chemin relatif
    const filePath = `/uploads/${req.file.filename}`;
    return res.status(201).json({
      success: true,
      data: {
        url: filePath,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });
  }

  // Upload multiple
  async uploadMultiple(req: Request, res: Response) {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, message: 'Aucun fichier reçu' });
    }
    const fileData = files.map(file => ({
      url: `/uploads/${file.filename}`,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    }));
    return res.status(201).json({ success: true, data: fileData });
  }

  // Supprimer un fichier
  async deleteFile(req: Request, res: Response) {
    const { id } = req.params;
    const filePath = path.join(process.env.STORAGE_PATH || process.cwd(), 'uploads', id);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Fichier introuvable' });
    }
    fs.unlinkSync(filePath);
    return res.status(200).json({ success: true, message: 'Fichier supprimé' });
  }

  // Récupérer la liste des fichiers (optionnel)
  async getFiles(req: Request, res: Response) {
    const dir = path.join(process.env.STORAGE_PATH || process.cwd(), 'uploads');
    const files = fs.readdirSync(dir).map(filename => ({
      filename,
      url: `/uploads/${filename}`,
    }));
    return res.status(200).json({ success: true, data: files });
  }

  // Récupérer un fichier (optionnel)
  async getFile(req: Request, res: Response) {
    const { id } = req.params;
    const filePath = path.join(process.env.STORAGE_PATH || process.cwd(), 'uploads', id);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Fichier introuvable' });
    }
    return res.sendFile(filePath);
  }
}
