import { BaseRepository } from './base.repository';
import { Prisma, Recruitment } from '@prisma/client';

export class RecruitmentRepository extends BaseRepository<
  Recruitment,
  Prisma.RecruitmentWhereInput,
  Prisma.RecruitmentCreateInput,
  Prisma.RecruitmentUpdateInput
> {
  constructor() {
    super('recruitment');
  }

  async findBySlug(slug: string): Promise<Recruitment | null> {
    return this.findFirst({ slug });
  }

  async findActive(): Promise<Recruitment[]> {
    return this.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ✅ Méthode groupBy ajoutée
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

  async getStats(): Promise<{
    total: number;
    active: number;
    closed: number;
  }> {
    const [total, active, closed] = await Promise.all([
      this.count(),
      this.count({ isActive: true }),
      this.count({ isActive: false }),
    ]);
    return { total, active, closed };
  }
}