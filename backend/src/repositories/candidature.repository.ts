import { BaseRepository } from './base.repository';
import { Prisma, Candidature } from '@prisma/client';

export class CandidatureRepository extends BaseRepository<
  Candidature,
  Prisma.CandidatureWhereInput,
  Prisma.CandidatureCreateInput,
  Prisma.CandidatureUpdateInput
> {
  constructor() {
    super('candidature');
  }

  async findByRecruitment(recruitmentId: string): Promise<Candidature[]> {
    return this.findMany({
      where: { recruitmentId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByEmail(email: string): Promise<Candidature[]> {
    return this.findMany({
      where: { email },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ✅ groupBy correcte
  async groupBy(field: string): Promise<Record<string, number>> {
    const result = await this.execute(async () => {
      return await this.model.groupBy({
        by: [field],
        _count: {
          [field]: true,
        },
      });
    });
    return result.reduce((acc: Record<string, number>, item: any) => {
      acc[item[field]] = item._count[field];
      return acc;
    }, {});
  }

  async getStats(recruitmentId?: string): Promise<{
    total: number;
    pending: number;
    reviewed: number;
    shortlisted: number;
    interviewed: number;
    accepted: number;
    rejected: number;
  }> {
    // where est un objet de filtres ou un objet vide
    const where = recruitmentId ? { recruitmentId } : {};

    // ✅ On passe directement l'objet where, sans le wrapper { where: ... }
    const [total, pending, reviewed, shortlisted, interviewed, accepted, rejected] = await Promise.all([
      this.count(where),
      this.count({ ...where, status: 'PENDING' }),
      this.count({ ...where, status: 'REVIEWED' }),
      this.count({ ...where, status: 'SHORTLISTED' }),
      this.count({ ...where, status: 'INTERVIEWED' }),
      this.count({ ...where, status: 'ACCEPTED' }),
      this.count({ ...where, status: 'REJECTED' }),
    ]);

    return { total, pending, reviewed, shortlisted, interviewed, accepted, rejected };
  }
}