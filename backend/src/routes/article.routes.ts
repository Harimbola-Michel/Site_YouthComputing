import { Router } from 'express';
import { ArticleController } from '../controllers/article.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { isEditor, isAdmin } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { cacheMiddleware } from '../middlewares/cache.middleware';
import {
  createArticleValidator,
  updateArticleValidator,
  createCommentValidator,
} from '../validators/article.validator';

const router = Router();
const articleController = new ArticleController();

// ─── Routes publiques ────────────────────────────────────────

// Liste des articles (paginée)
// Routes admin pour les commentaires
router.get(
  '/admin/articles/:articleId/comments',
  authMiddleware,
  isEditor,
  articleController.getAllCommentsByArticle
);

router.get(
  '/admin/comments/pending',
  authMiddleware,
  isEditor,
  articleController.getUnapprovedComments
);

router.get(
  '/',
  cacheMiddleware(300),
  articleController.getAll
);

// Articles publiés (paginés)
router.get(
  '/published',
  cacheMiddleware(300),
  articleController.getPublished
);

// Statistiques
router.get(
  '/stats',
  cacheMiddleware(600),
  articleController.getStats
);

// Articles les plus vus
router.get(
  '/most-viewed',
  cacheMiddleware(300),
  articleController.getMostViewed
);

// Récupérer un article par son slug
router.get(
  '/:slug',
  cacheMiddleware(300),
  articleController.getBySlug
);

// Récupérer un article par son ID (admin ou usage interne)
router.get(
  '/id/:id',
  cacheMiddleware(300),
  articleController.getById
);

// ─── Routes pour les commentaires (publiques) ──────────────

// Ajouter un commentaire (public)
router.post(
  '/comments',
  validate(createCommentValidator),   // ← validateur corrigé
  articleController.createComment
);

// Récupérer les commentaires d'un article
router.get(
  '/:articleId/comments',
  cacheMiddleware(300),
  articleController.getArticleComments
);

// ─── Routes protégées (admin / rédacteur) ──────────────────

// Créer un article
router.post(
  '/',
  authMiddleware,
  isEditor,
  validate(createArticleValidator),
  articleController.create
);

// Mettre à jour un article
router.put(
  '/:id',
  authMiddleware,
  isEditor,
  validate(updateArticleValidator),
  articleController.update
);

// Supprimer un article (admin uniquement)
router.delete(
  '/:id',
  authMiddleware,
  isAdmin,
  articleController.delete
);

// Publier un article
router.patch(
  '/:id/publish',
  authMiddleware,
  isEditor,
  articleController.publish
);

// Dépublier un article
router.patch(
  '/:id/unpublish',
  authMiddleware,
  isEditor,
  articleController.unpublish
);

// ─── Gestion des commentaires (admin / rédacteur) ──────────

// Approuver un commentaire
router.patch(
  '/comments/:id/approve',
  authMiddleware,
  isEditor,
  articleController.approveComment
);

// Supprimer un commentaire (admin uniquement)
router.delete(
  '/comments/:id',
  authMiddleware,
  isAdmin,
  articleController.deleteComment
);

export default router;