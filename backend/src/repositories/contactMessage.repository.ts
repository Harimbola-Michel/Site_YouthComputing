import { BaseRepository } from './base.repository';
import { Prisma, ContactMessage } from '@prisma/client';

export class ContactMessageRepository extends BaseRepository<
  ContactMessage,
  Prisma.ContactMessageWhereInput,
  Prisma.ContactMessageCreateInput,
  Prisma.ContactMessageUpdateInput
> {
  constructor() {
    super('contactMessage');
  }

  async findUnread(): Promise<ContactMessage[]> {
    return this.findMany({
      where: { isRead: false },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findReplied(): Promise<ContactMessage[]> {
    return this.findMany({
      where: { repliedAt: { not: null } },
      orderBy: { repliedAt: 'desc' },
    });
  }

  async findUnreplied(): Promise<ContactMessage[]> {
    return this.findMany({
      where: { repliedAt: null },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getStats(): Promise<{
    total: number;
    unread: number;
    read: number;
    replied: number;
    unreplied: number;
    thisWeek: number;
    thisMonth: number;
  }> {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [total, unread, read, replied, unreplied, thisWeek, thisMonth] = await Promise.all([
      this.count(),
      this.count({ isRead: false }),
      this.count({ isRead: true }),
      this.count({ repliedAt: { not: null } }),
      this.count({ repliedAt: null }),
      this.count({ createdAt: { gte: weekStart } }),
      this.count({ createdAt: { gte: monthStart } }),
    ]);

    return {
      total,
      unread,
      read,
      replied,
      unreplied,
      thisWeek,
      thisMonth,
    };
  }

  async markAsRead(id: string): Promise<ContactMessage> {
    return this.update(id, { isRead: true });
  }

  async markAllAsRead(): Promise<number> {
    const result = await this.execute(async () => {
      return await this.model.updateMany({
        where: { isRead: false },
        data: { isRead: true },
      });
    });
    return result.count || 0;
  }
}