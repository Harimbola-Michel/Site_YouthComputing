import { Request, Response, NextFunction } from 'express';
import { BaseController } from './base.controller';
import { ArticleService } from '../services/article.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export class ArticleController extends BaseController {
  private articleService: ArticleService;

  constructor() {
    super();
    this.articleService = new ArticleService();
  }

  // ─── Récupération des articles ──────────────────────────

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const search = req.query.search as string;

      let result;
      if (search) {
        const articles = await this.articleService.searchArticles(search);
        result = {
          data: articles,
          pagination: {
            page: 1,
            limit: articles.length,
            total: articles.length,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          },
        };
      } else {
        result = await this.articleService.findAllPaginated(page, limit);
      }

      this.sendSuccess(res, result);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getPublished = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const result = await this.articleService.getPublishedArticlesPaginated(page, limit);
      this.sendSuccess(res, result);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { slug } = req.params;
      const article = await this.articleService.getBySlug(slug);
      if (!article) {
        throw new Error('Article not found');
      }
      await this.articleService.incrementViews(article.id);
      this.sendSuccess(res, article);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const article = await this.articleService.findById(id);
      this.sendSuccess(res, article);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  // ─── Création, mise à jour, suppression ──────────────────

  create = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new Error('User not authenticated');
      }
      const article = await this.articleService.create(req.body, userId);
      this.sendCreated(res, article);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const article = await this.articleService.update(id, req.body);
      this.sendUpdated(res, article);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.articleService.delete(id);
      this.sendDeleted(res, null);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  // ─── Publication / dépublier ─────────────────────────────

  publish = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const article = await this.articleService.publish(id);
      this.sendUpdated(res, article);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  unpublish = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const article = await this.articleService.unpublish(id);
      this.sendUpdated(res, article);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  // ─── Statistiques et vues ────────────────────────────────

  getStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.articleService.getStats();
      this.sendSuccess(res, stats);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getMostViewed = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string, 10) || 5;
      const articles = await this.articleService.getMostViewed(limit);
      this.sendSuccess(res, articles);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  // ─── Gestion des commentaires ─────────────────────────────

  // Créer un commentaire (public)
  createComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const comment = await this.articleService.createComment(req.body);
      this.sendCreated(res, comment);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  // Récupérer les commentaires approuvés d'un article (public)
  getArticleComments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { articleId } = req.params;
      const comments = await this.articleService.getArticleComments(articleId);
      this.sendSuccess(res, comments);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  // Récupérer TOUS les commentaires d'un article (admin, y compris non approuvés)
  getAllCommentsByArticle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { articleId } = req.params;
      const comments = await this.articleService.getAllCommentsByArticle(articleId);
      this.sendSuccess(res, comments);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  // Récupérer les commentaires en attente (admin)
  getUnapprovedComments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const comments = await this.articleService.getUnapprovedComments();
      this.sendSuccess(res, comments);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  // Approuver un commentaire
  approveComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const comment = await this.articleService.approveComment(id);
      this.sendUpdated(res, comment);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  // Supprimer un commentaire
  deleteComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.articleService.deleteComment(id);
      this.sendDeleted(res, null);
    } catch (error) {
      this.handleError(next, error);
    }
  };
}