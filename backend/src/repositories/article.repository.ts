import { BaseRepository } from './base.repository';
import { Prisma, Article, ArticleStatus } from '@prisma/client';
import { prisma } from '../config/prisma';

export class ArticleRepository extends BaseRepository<
  Article,
  Prisma.ArticleWhereInput,
  Prisma.ArticleCreateInput,
  Prisma.ArticleUpdateInput
> {
  constructor() {
    super('article');
  }

  /**
   * Recherche d'articles par titre, contenu ou extrait (insensible à la casse)
   */
  async search(query: string): Promise<Article[]> {
    return this.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
          { excerpt: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Récupère un article par son slug (unique)
   */
  async findBySlug(slug: string): Promise<Article | null> {
    // ✅ findFirst attend directement les critères
    return this.findFirst({ slug });
  }

  /**
   * Récupère tous les articles publiés (sans pagination, avec skip/take optionnels)
   */
  async findPublished(params?: { skip?: number; take?: number; orderBy?: any }): Promise<Article[]> {
    return this.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      ...params,
    });
  }

  /**
   * Récupère les articles publiés avec pagination (page/limit)
   */
  async findPublishedPaginated(page: number, limit: number) {
    return this.findPaginated({
      page,
      limit,
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
    });
  }

  /**
   * Récupère les articles d'un auteur donné
   */
  async findByAuthor(authorId: string): Promise<Article[]> {
    return this.findMany({
      where: { authorId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Incrémente le compteur de vues d'un article
   */
  async incrementViews(id: string): Promise<void> {
    await this.execute(async () => {
      await this.model.update({
        where: { id },
        data: { views: { increment: 1 } },
      });
    });
  }

  /**
   * Récupère les statistiques globales des articles
   */
  async getStats(): Promise<{
    total: number;
    published: number;
    draft: number;
    archived: number;
    totalViews: number;
  }> {
    const [total, published, draft, archived] = await Promise.all([
      this.count(),
      this.count({ status: 'PUBLISHED' }),
      this.count({ status: 'DRAFT' }),
      this.count({ status: 'ARCHIVED' }),
    ]);

    // ✅ Utilisation de prisma directement pour éviter les soucis avec this.model
    const viewsResult = await prisma.article.aggregate({
      _sum: { views: true },
      where: { status: 'PUBLISHED' },
    });

    return {
      total,
      published,
      draft,
      archived,
      totalViews: viewsResult._sum.views || 0,
    };
  }

  /**
   * Récupère les articles les plus vus (limite configurable)
   */
  async getMostViewed(limit: number = 5): Promise<Article[]> {
    return this.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { views: 'desc' },
      take: limit,
    });
  }

  /**
   * Récupère les articles par catégorie
   */
  async findByCategory(category: string): Promise<Article[]> {
    return this.findMany({
      where: { category },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Récupère les articles avec leurs commentaires approuvés
   */
  async findWithComments(id: string): Promise<Article | null> {
    return this.execute(async () => {
      return await this.model.findUnique({
        where: { id },
        include: {
          comments: {
            where: { isApproved: true },
            orderBy: { createdAt: 'asc' },
          },
        },
      });
    });
  }

  /**
   * Surcharge de la méthode create pour inclure automatiquement les champs par défaut
   */
  async create(data: Prisma.ArticleCreateInput): Promise<Article> {
    return super.create(data);
  }

  /**
   * Surcharge de update
   */
  async update(id: string, data: Prisma.ArticleUpdateInput): Promise<Article> {
    return super.update(id, data);
  }
}