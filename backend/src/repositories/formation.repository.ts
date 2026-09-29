// src/repositories/formation.repository.ts

import { Formation, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository';
import { NotFoundException } from '../exceptions';

interface FormationWhereInput {
  title?: { contains: string; mode: 'insensitive' };
  slug?: string;
  category?: string;
  level?: string;
  isPublished?: boolean;
  OR?: any[];
  AND?: any[];
}

export class FormationRepository extends BaseRepository<
  Formation,
  FormationWhereInput,
  Prisma.FormationCreateInput,
  Prisma.FormationUpdateInput
> {
  constructor() {
    super('formation');
  }

  async findBySlug(slug: string): Promise<Formation | null> {
    return this.findFirst({ slug } as FormationWhereInput);
  }

  async findBySlugOrThrow(slug: string): Promise<Formation> {
    const formation = await this.findBySlug(slug);
    if (!formation) throw NotFoundException.slug(slug);
    return formation;
  }

  async findPublished(pagination?: { page: number; limit: number }): Promise<Formation[]> {
    const where = { isPublished: true } as FormationWhereInput;
    if (pagination) {
      const result = await this.findPaginated({
        where,
        page: pagination.page,
        limit: pagination.limit,
        orderBy: { createdAt: 'desc' },
      });
      return result.data;
    }
    return this.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async findByCategory(category: string, pagination?: { page: number; limit: number }): Promise<Formation[]> {
    const where = { category } as FormationWhereInput;
    if (pagination) {
      const result = await this.findPaginated({
        where,
        page: pagination.page,
        limit: pagination.limit,
        orderBy: { createdAt: 'desc' },
      });
      return result.data;
    }
    return this.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async findByLevel(level: string, pagination?: { page: number; limit: number }): Promise<Formation[]> {
    const where = { level } as FormationWhereInput;
    if (pagination) {
      const result = await this.findPaginated({
        where,
        page: pagination.page,
        limit: pagination.limit,
        orderBy: { createdAt: 'desc' },
      });
      return result.data;
    }
    return this.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async searchFormations(search: string): Promise<Formation[]> {
    return this.findMany({
      where: {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { category: { contains: search, mode: 'insensitive' } },
        ],
      } as FormationWhereInput,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStats() {
    const [total, published, unpublished, byCategory, byLevel] = await Promise.all([
      this.count(),
      this.count({ isPublished: true } as FormationWhereInput),
      this.count({ isPublished: false } as FormationWhereInput),
      this.getCountByCategory(),
      this.getCountByLevel(),
    ]);
    return { total, published, unpublished, byCategory, byLevel };
  }

  async getCountByCategory(): Promise<Record<string, number>> {
    const formations = await this.findMany();
    return formations.reduce((acc, f) => {
      acc[f.category] = (acc[f.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  async getCountByLevel(): Promise<Record<string, number>> {
    const formations = await this.findMany();
    return formations.reduce((acc, f) => {
      acc[f.level] = (acc[f.level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  async getRecommended(limit: number = 5): Promise<Formation[]> {
    return this.findMany({
      where: { isPublished: true } as FormationWhereInput,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getMostPopular(limit: number = 5): Promise<Formation[]> {
    // À adapter selon vos données (ex: nombre d'inscriptions)
    return this.findMany({
      where: { isPublished: true } as FormationWhereInput,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
async findWithSessions(id: string): Promise<Formation | null> {
  return this.execute(async () => {
    return await this.model.findUnique({
      where: { id },
      include: {
        FormationSession: {  // ✅ champ correct (nom du modèle)
          orderBy: { startDate: 'asc' },
        },
      },
    });
  });
}

  async findWithRelations(id: string): Promise<Formation | null> {
    return this.execute(async () => {
      return await this.model.findUnique({
        where: { id },
        include: {
          sessions: { include: { registrations: true } },
          registrations: true,
        },
      });
    });
  }

  async findFiltered(
    filters: {
      category?: string;
      level?: string;
      isPublished?: boolean;
      search?: string;
      minPrice?: number;
      maxPrice?: number;
    },
    pagination?: { page: number; limit: number }
  ): Promise<Formation[]> {
    const where: any = {};
    if (filters.category) where.category = filters.category;
    if (filters.level) where.level = filters.level;
    if (filters.isPublished !== undefined) where.isPublished = filters.isPublished;
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { category: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) where.price.gte = filters.minPrice;
      if (filters.maxPrice !== undefined) where.price.lte = filters.maxPrice;
    }

    if (pagination) {
      const result = await this.findPaginated({
        where: where as FormationWhereInput,
        page: pagination.page,
        limit: pagination.limit,
        orderBy: { createdAt: 'desc' },
      });
      return result.data;
    }
    return this.findMany({
      where: where as FormationWhereInput,
      orderBy: { createdAt: 'desc' },
    });
  }

  async togglePublish(id: string): Promise<Formation> {
    const formation = await this.findByIdOrThrow(id);
    return this.update(id, { isPublished: !formation.isPublished });
  }

  async updateMetrics(id: string, metrics: { views?: number; registrations?: number }): Promise<Formation> {
    // Si vos métriques ne sont pas dans le modèle Formation, cette méthode peut être adaptée.
    // Par défaut, on ne fait rien, car le modèle n'a pas de champs views/registrations.
    // Vous pouvez ajouter un champ "views" et "registrationsCount" dans le modèle.
    return this.findByIdOrThrow(id);
  }

  async slugExists(slug: string): Promise<boolean> {
    const formation = await this.findBySlug(slug);
    return !!formation;
  }

  async findRecent(limit: number = 10): Promise<Formation[]> {
    return this.findMany({ orderBy: { createdAt: 'desc' }, take: limit });
  }

  async findByPriceRange(minPrice: number, maxPrice: number): Promise<Formation[]> {
    return this.findMany({
      where: { price: { gte: minPrice, lte: maxPrice } } as any,
      orderBy: { price: 'asc' },
    });
  }
}