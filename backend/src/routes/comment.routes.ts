// src/routes/article.routes.ts ou src/routes/comment.routes.ts

import { Router } from 'express';
import { ArticleController } from '../controllers/article.controller';

const router = Router();
const articleController = new ArticleController();

// ... vos autres routes

// ✅ Route pour récupérer tous les commentaires en attente (admin)
router.get(
  '/admin/comments/pending',
  authMiddleware,
  isEditor,
  articleController.getUnapprovedComments
);

// ✅ Route pour récupérer tous les commentaires d'un article (y compris non approuvés) pour admin
router.get(
  '/admin/articles/:articleId/comments',
  authMiddleware,
  isEditor,
  articleController.getAllCommentsByArticle
);

export default router;