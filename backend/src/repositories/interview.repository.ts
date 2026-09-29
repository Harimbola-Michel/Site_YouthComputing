import { BaseRepository } from './base.repository';
import { Prisma, Interview } from '@prisma/client';

export class InterviewRepository extends BaseRepository<
  Interview,
  Prisma.InterviewWhereInput,
  Prisma.InterviewCreateInput,
  Prisma.InterviewUpdateInput
> {
  constructor() {
    super('interview');
  }

  async findByCandidature(candidatureId: string): Promise<Interview[]> {
    return this.findMany({
      where: { candidatureId },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async findUpcoming(limit: number = 10): Promise<Interview[]> {
    return this.findMany({
      where: {
        scheduledAt: { gt: new Date() },
        status: 'SCHEDULED',
      },
      orderBy: { scheduledAt: 'asc' },
      take: limit,
    });
  }

  async findToday(): Promise<Interview[]> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    return this.findMany({
      where: {
        scheduledAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: 'SCHEDULED',
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async getStats(): Promise<{
    total: number;
    scheduled: number;
    completed: number;
    cancelled: number;
    noShow: number;
  }> {
    const [total, scheduled, completed, cancelled, noShow] = await Promise.all([
      this.count(),
      this.count({ status: 'SCHEDULED' }),
      this.count({ status: 'COMPLETED' }),
      this.count({ status: 'CANCELLED' }),
      this.count({ status: 'NO_SHOW' }),
    ]);

    return { total, scheduled, completed, cancelled, noShow };
  }
}