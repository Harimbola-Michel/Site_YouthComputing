import { Prisma, ArticleComment } from '@prisma/client';
import { prisma } from '../config/prisma';

export class ArticleCommentRepository {
  // ─── Récupération (public) ────────────────────────────────

  /**
   * Récupère les commentaires d’un article (seulement les approuvés, sans les réponses)
   * Utilisé sur le site public.
   */
  async findByArticle(articleId: string): Promise<ArticleComment[]> {
    return prisma.articleComment.findMany({
      where: {
        articleId,
        parentId: null,
        isApproved: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Récupère TOUS les commentaires d’un article (y compris non approuvés)
   * Utilisé dans l’administration.
   */
  async findByArticleAll(articleId: string): Promise<ArticleComment[]> {
    return prisma.articleComment.findMany({
      where: { articleId },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Récupère les commentaires approuvés d’un article (sans réponses)
   * Utilisé pour l’affichage public.
   */
  async findApprovedByArticle(articleId: string): Promise<ArticleComment[]> {
    return prisma.articleComment.findMany({
      where: {
        articleId,
        isApproved: true,
        parentId: null,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Récupère les commentaires en attente de modération (admin)
   * Inclut les informations de l'article.
   */
  async findPending(): Promise<ArticleComment[]> {
    return prisma.articleComment.findMany({
      where: { isApproved: false },
      orderBy: { createdAt: 'asc' },
      include: {
        Article: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });
  }

  /**
   * Récupère un commentaire par son ID (lève une erreur s’il n’existe pas).
   */
  async findByIdOrThrow(id: string): Promise<ArticleComment> {
    const comment = await prisma.articleComment.findUnique({ where: { id } });
    if (!comment) {
      throw new Error(`Commentaire ${id} non trouvé`);
    }
    return comment;
  }

  // ─── Statistiques ──────────────────────────────────────────

  /**
   * Compte le nombre de commentaires approuvés pour un article.
   */
  async countByArticle(articleId: string): Promise<number> {
    return prisma.articleComment.count({
      where: { articleId, isApproved: true },
    });
  }

  /**
   * Compte le nombre de commentaires en attente.
   */
  async countPending(): Promise<number> {
    return prisma.articleComment.count({
      where: { isApproved: false },
    });
  }

  // ─── Écriture ──────────────────────────────────────────────

  async create(data: Prisma.ArticleCommentCreateInput): Promise<ArticleComment> {
    return prisma.articleComment.create({ data });
  }

  async update(id: string, data: Prisma.ArticleCommentUpdateInput): Promise<ArticleComment> {
    await this.findByIdOrThrow(id);
    return prisma.articleComment.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.findByIdOrThrow(id);
    await prisma.articleComment.delete({ where: { id } });
  }

  // ─── Réponses (si besoin ultérieurement) ──────────────────

  async findReplies(commentId: string): Promise<ArticleComment[]> {
    return prisma.articleComment.findMany({
      where: { parentId: commentId },
      orderBy: { createdAt: 'asc' },
    });
  }

  // ─── Statistiques globales (admin) ────────────────────────

  async getStats(): Promise<{
    total: number;
    approved: number;
    pending: number;
    byArticle: Record<string, number>;
  }> {
    const [total, approved, pending] = await Promise.all([
      prisma.articleComment.count(),
      prisma.articleComment.count({ where: { isApproved: true } }),
      prisma.articleComment.count({ where: { isApproved: false } }),
    ]);

    const result = await prisma.articleComment.groupBy({
      by: ['articleId'],
      _count: { articleId: true },
    });

    const byArticle = result.reduce((acc: Record<string, number>, item: any) => {
      acc[item.articleId] = item._count.articleId;
      return acc;
    }, {});

    return { total, approved, pending, byArticle };
  }
}