import { BaseRepository } from './base.repository';
import { Prisma, ActivityLog } from '@prisma/client';

export class ActivityLogRepository extends BaseRepository<
  ActivityLog,
  Prisma.ActivityLogWhereInput,
  Prisma.ActivityLogCreateInput,
  Prisma.ActivityLogUpdateInput
> {
  constructor() {
    super('activityLog');
  }

  async findByUser(userId: string): Promise<ActivityLog[]> {
    return this.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByAction(action: string): Promise<ActivityLog[]> {
    return this.findMany({
      where: { action: action as any },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByResource(resource: string, resourceId?: string): Promise<ActivityLog[]> {
    return this.findMany({
      where: {
        resource,
        ...(resourceId && { resourceId }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStats(): Promise<{
    total: number;
    byAction: Record<string, number>;
    byResource: Record<string, number>;
    last24Hours: number;
    last7Days: number;
  }> {
    const [total, last24Hours, last7Days] = await Promise.all([
      this.count(),
      this.count({ createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
      this.count({ createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
    ]);

    const actionResult = await this.execute(async () => {
      return await this.model.groupBy({
        by: ['action'],
        _count: {
          action: true,
        },
      });
    });

    const byAction = actionResult.reduce((acc: Record<string, number>, item: any) => {
      acc[item.action] = item._count.action;
      return acc;
    }, {});

    const resourceResult = await this.execute(async () => {
      return await this.model.groupBy({
        by: ['resource'],
        _count: {
          resource: true,
        },
      });
    });

    const byResource = resourceResult.reduce((acc: Record<string, number>, item: any) => {
      acc[item.resource] = item._count.resource;
      return acc;
    }, {});

    return {
      total,
      byAction,
      byResource,
      last24Hours,
      last7Days,
    };
  }

  async getActivityTimeline(days: number = 7): Promise<{
    date: string;
    count: number;
  }[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await this.findMany({
      where: { createdAt: { gte: startDate } },
      orderBy: { createdAt: 'asc' },
    });

    const timeline = new Map<string, number>();

    for (const log of logs) {
      const date = log.createdAt.toISOString().split('T')[0];
      timeline.set(date, (timeline.get(date) || 0) + 1);
    }

    return Array.from(timeline.entries()).map(([date, count]) => ({
      date,
      count,
    }));
  }
}