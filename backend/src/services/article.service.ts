import { ArticleRepository } from '../repositories/article.repository';
import { ArticleCommentRepository } from '../repositories/articleComment.repository';
import { CreateArticleDTO, UpdateArticleDTO, CreateArticleCommentDTO } from '../types/dto/article.dto';
import { ApiError } from '../utils/ApiError';
import { Article, ArticleStatus } from '@prisma/client';
import { generateUniqueSlug } from '../utils/slugify';
import { mailer } from '../config/mailer';
import { logger } from '../config/logger';
import { prisma } from '../config/prisma';

export class ArticleService {
  private articleRepository: ArticleRepository;
  private commentRepository: ArticleCommentRepository;

  constructor() {
    this.articleRepository = new ArticleRepository();
    this.commentRepository = new ArticleCommentRepository();
  }

  // ─── CRUD Articles ──────────────────────────────────────────

  async findAllPaginated(page: number, limit: number) {
    return this.articleRepository.findPaginated({
      page,
      limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<Article> {
    return this.articleRepository.findByIdOrThrow(id);
  }

  async getBySlug(slug: string): Promise<Article | null> {
    return this.articleRepository.findBySlug(slug);
  }

  async create(data: CreateArticleDTO, authorId: string): Promise<Article> {
    const userExists = await prisma.user.findUnique({
      where: { id: authorId },
      select: { id: true },
    });
    if (!userExists) {
      throw ApiError.notFound('Utilisateur introuvable');
    }

    const slug = await generateUniqueSlug(data.title, 'article');
    const status = data.status || ArticleStatus.DRAFT;
    const publishedAt = status === ArticleStatus.PUBLISHED ? new Date() : null;

    const articleData = {
      title: data.title,
      slug,
      content: data.content,
      excerpt: data.excerpt || null,
      featuredImage: data.featuredImage || null,
      category: data.category,
      tags: data.tags || [],
      status,
      isFeatured: data.isFeatured || false,
      publishedAt,
      User: { connect: { id: authorId } },
    };

    const article = await this.articleRepository.create(articleData);
    if (article.status === ArticleStatus.PUBLISHED) {
      await this.notifySubscribers(article);
    }
    return article;
  }

  async update(id: string, data: UpdateArticleDTO): Promise<Article> {
    const article = await this.articleRepository.findByIdOrThrow(id);

    let slug = article.slug;
    if (data.title && data.title !== article.title) {
      slug = await generateUniqueSlug(data.title, 'article');
    }

    const updateData: any = { ...data, slug };
    if (data.status) {
      const status = data.status as ArticleStatus;
      updateData.status = status;
      if (status === ArticleStatus.PUBLISHED && article.status !== ArticleStatus.PUBLISHED) {
        updateData.publishedAt = new Date();
      } else if (status === ArticleStatus.DRAFT && article.status === ArticleStatus.PUBLISHED) {
        updateData.publishedAt = null;
      }
    }

    const updated = await this.articleRepository.update(id, updateData);
    if (data.status === ArticleStatus.PUBLISHED && article.status !== ArticleStatus.PUBLISHED) {
      await this.notifySubscribers(updated);
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.articleRepository.delete(id);
  }

  // ─── Publication ──────────────────────────────────────────

  async publish(id: string): Promise<Article> {
    const article = await this.articleRepository.findByIdOrThrow(id);
    if (article.status === ArticleStatus.PUBLISHED) {
      throw ApiError.badRequest('Article déjà publié');
    }
    const updated = await this.articleRepository.update(id, {
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date(),
    });
    await this.notifySubscribers(updated);
    return updated;
  }

  async unpublish(id: string): Promise<Article> {
    const article = await this.articleRepository.findByIdOrThrow(id);
    if (article.status !== ArticleStatus.PUBLISHED) {
      throw ApiError.badRequest('Article non publié');
    }
    return this.articleRepository.update(id, {
      status: ArticleStatus.DRAFT,
      publishedAt: null,
    });
  }

  // ─── Lectures ──────────────────────────────────────────────

  async incrementViews(id: string): Promise<void> {
    await this.articleRepository.incrementViews(id);
  }

  async getPublishedArticlesPaginated(page: number, limit: number) {
    return this.articleRepository.findPublishedPaginated(page, limit);
  }

  async getArticlesByAuthor(authorId: string): Promise<Article[]> {
    return this.articleRepository.findByAuthor(authorId);
  }

  async getStats() {
    return this.articleRepository.getStats();
  }

  async getMostViewed(limit: number = 5): Promise<Article[]> {
    return this.articleRepository.getMostViewed(limit);
  }

  async searchArticles(query: string): Promise<Article[]> {
    return this.articleRepository.search(query);
  }

  // ─── Commentaires ──────────────────────────────────────────

  async createComment(data: CreateArticleCommentDTO): Promise<any> {
    await this.articleRepository.findByIdOrThrow(data.articleId);

    const commentData: any = {
      content: data.content,
      authorName: data.authorName,
      authorEmail: data.authorEmail,
      isApproved: false,
      articleId: data.articleId,
      parentId: data.parentId || null,
    };

    const comment = await this.commentRepository.create(commentData);
    try {
      await this.notifyComment(comment);
    } catch (error) {
      logger.error('Échec de l’envoi de la notification de commentaire :', error);
    }
    return comment;
  }

  async approveComment(id: string): Promise<any> {
    return this.commentRepository.update(id, { isApproved: true });
  }

  async deleteComment(id: string): Promise<void> {
    await this.commentRepository.delete(id);
  }

  // Récupère les commentaires approuvés d'un article (public)
  async getArticleComments(articleId: string): Promise<any[]> {
    return this.commentRepository.findApprovedByArticle(articleId);
  }

  // Récupère TOUS les commentaires d'un article (admin, y compris non approuvés)
  async getAllCommentsByArticle(articleId: string): Promise<any[]> {
    await this.articleRepository.findByIdOrThrow(articleId);
    return this.commentRepository.findByArticleAll(articleId);
  }

  // Récupère les commentaires en attente (admin)
  async getUnapprovedComments(): Promise<any[]> {
    return this.commentRepository.findPending();
  }

  async getCommentCountByArticle(articleId: string): Promise<number> {
    return this.commentRepository.countByArticle(articleId);
  }

  // ─── Notifications ─────────────────────────────────────────

  private async notifySubscribers(article: Article): Promise<void> {
    try {
      logger.info(`Article publié : ${article.title}`);
    } catch (error) {
      logger.error('Échec de la notification aux abonnés :', error);
    }
  }

  
private async notifyComment(comment: any): Promise<void> {
  try {
    // Récupération de l'article pour avoir son titre et slug
    const article = await this.articleRepository.findByIdOrThrow(comment.articleId);
    const frontendUrl = process.env.FRONTEND_URL || 'https://youthcomputing.mg';

    const subject = `📝 Nouveau commentaire sur "${article.title}"`;

    const html = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f6f9fc;
            color: #1e293b;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0,0,0,0.05);
          }
          .header {
            background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
            padding: 30px 24px;
            text-align: center;
          }
          .header h1 {
            color: #ffffff;
            font-size: 24px;
            font-weight: 600;
            margin: 0;
            letter-spacing: -0.3px;
          }
          .header p {
            color: rgba(255,255,255,0.85);
            font-size: 14px;
            margin: 8px 0 0;
          }
          .body {
            padding: 32px 24px;
          }
          .body h2 {
            font-size: 20px;
            font-weight: 600;
            color: #0f172a;
            margin-top: 0;
            margin-bottom: 20px;
          }
          .meta-grid {
            background: #f8fafc;
            border-radius: 12px;
            padding: 16px 20px;
            margin-bottom: 24px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px 16px;
            font-size: 14px;
            color: #334155;
          }
          .meta-grid .label {
            font-weight: 500;
            color: #0f172a;
          }
          .comment-box {
            background: #f1f5f9;
            border-left: 4px solid #3b82f6;
            padding: 16px 20px;
            border-radius: 8px;
            margin-bottom: 28px;
            font-size: 15px;
            line-height: 1.6;
            color: #0f172a;
          }
          .comment-box::before {
            content: "💬 ";
            font-size: 18px;
          }
          .actions {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            margin-bottom: 12px;
          }
          .actions a {
            display: inline-block;
            padding: 10px 24px;
            border-radius: 40px;
            font-size: 14px;
            font-weight: 500;
            text-decoration: none;
            transition: background 0.2s;
          }
          .btn-approve {
            background: #10b981;
            color: #ffffff;
          }
          .btn-approve:hover {
            background: #059669;
          }
          .btn-view {
            background: #e2e8f0;
            color: #1e293b;
          }
          .btn-view:hover {
            background: #cbd5e1;
          }
          .btn-admin {
            background: #3b82f6;
            color: #ffffff;
          }
          .btn-admin:hover {
            background: #2563eb;
          }
          .footer {
            padding: 20px 24px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            font-size: 13px;
            color: #94a3b8;
          }
          .footer a {
            color: #3b82f6;
            text-decoration: none;
          }
          .footer a:hover {
            text-decoration: underline;
          }
          @media (max-width: 480px) {
            .meta-grid {
              grid-template-columns: 1fr;
              gap: 4px;
            }
            .actions a {
              width: 100%;
              text-align: center;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- En-tête -->
          <div class="header">
            <h1>✉️ Nouveau commentaire</h1>
            <p>Un lecteur a laissé un commentaire sur votre article</p>
          </div>
          <!-- Corps -->
          <div class="body">
            <h2>Détails du commentaire</h2>
            <div class="meta-grid">
              <span><span class="label">Auteur :</span> ${comment.authorName}</span>
              <span><span class="label">Email :</span> ${comment.authorEmail}</span>
              <span style="grid-column: 1 / -1;"><span class="label">Article :</span> "${article.title}"</span>
            </div>
            <div class="comment-box">${comment.content}</div>

            <div class="actions">
              <a href="${frontendUrl}/admin/comments/${comment.id}/approve" class="btn-approve">✅ Approuver</a>
              <a href="${frontendUrl}/articles/${article.slug}" class="btn-view">📖 Voir l’article</a>
              <a href="${frontendUrl}/admin/comments/${comment.id}" class="btn-admin">⚙️ Gérer</a>
            </div>
          </div>
          <!-- Pied de page -->
          <div class="footer">
            <p>
              Cet email a été envoyé automatiquement par<br />
              <strong>Youth Computing</strong> – <a href="${frontendUrl}">${frontendUrl}</a>
            </p>
            <p style="margin-top:8px; font-size:12px; color: #cbd5e1;">
              Vous recevez cet email car vous êtes administrateur du site.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    await mailer.sendTemplatedEmail(
      process.env.ADMIN_EMAIL || 'admin@youthcomputing.mg',
      'new-comment',
      { subject, html }
    );

    logger.info(`Email de notification de commentaire envoyé pour l'article "${article.title}"`);
  } catch (error) {
    logger.error('Échec de l’envoi de la notification de commentaire :', error);
  }
}
}