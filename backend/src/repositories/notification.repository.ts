// backend/src/repositories/notification.repository.ts

import { BaseRepository } from './base.repository';
import { Notification, Prisma, NotificationType } from '@prisma/client';

export class NotificationRepository extends BaseRepository<
  Notification,
  Prisma.NotificationWhereInput,
  Prisma.NotificationCreateInput,
  Prisma.NotificationUpdateInput
> {
  constructor() {
    super('notification');
  }

  async findByUserId(
    userId: string,
    options?: { take?: number; skip?: number; orderBy?: any }
  ): Promise<Notification[]> {
    const { take = 20, skip = 0, orderBy = { createdAt: 'desc' } } = options || {};
    return this.findMany({
      where: { userId },
      orderBy,
      take,
      skip,
    });
  }

  async findUnreadByUserId(userId: string): Promise<Notification[]> {
    return this.findMany({
      where: { userId, isRead: false },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(id: string): Promise<Notification> {
    return this.update(id, { isRead: true });
  }

  async markAllAsRead(userId: string): Promise<{ count: number }> {
    const result = await this.model.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { count: result.count };
  }

  async countUnread(userId: string): Promise<number> {
    return this.count({ userId, isRead: false });
  }

  async countByUser(userId: string): Promise<number> {
    return this.count({ userId });
  }

  async deleteNotification(id: string): Promise<Notification> {
    return this.delete(id);
  }

  async findAllWithFilters(filters: {
    userId?: string;
    type?: NotificationType;
    isRead?: boolean;
    startDate?: Date;
    endDate?: Date;
    skip?: number;
    take?: number;
  }): Promise<{ data: Notification[]; total: number }> {
    const where: Prisma.NotificationWhereInput = {};

    if (filters.userId) where.userId = filters.userId;
    if (filters.type) where.type = filters.type;
    if (filters.isRead !== undefined) where.isRead = filters.isRead;
    if (filters.startDate) where.createdAt = { gte: filters.startDate };
    if (filters.endDate) {
      where.createdAt = {
        ...(where.createdAt as any || {}),
        lte: filters.endDate,
      };
    }

    const [data, total] = await Promise.all([
      this.findMany({
        where,
        skip: filters.skip,
        take: filters.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.count(where),
    ]);

    return { data, total };
  }
}