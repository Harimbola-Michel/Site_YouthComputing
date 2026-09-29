import { BaseRepository } from './base.repository';
import { Prisma, Event, EventRegistration } from '@prisma/client';

export class EventRepository extends BaseRepository<
  Event,
  Prisma.EventWhereInput,
  Prisma.EventCreateInput,
  Prisma.EventUpdateInput
> {
  constructor() {
    super('event');
  }

  async findBySlug(slug: string): Promise<Event | null> {
    return this.execute(async () => {
      return await this.model.findUnique({
        where: { slug },
      });
    });
  }

  async findPublished(params?: {
    skip?: number;
    take?: number;
    where?: Prisma.EventWhereInput;
  }): Promise<Event[]> {
    return this.findMany({
      where: { 
        isPublished: true,
        ...params?.where,
      },
      orderBy: { startDate: 'asc' },
      skip: params?.skip,
      take: params?.take,
    });
  }

  async findUpcoming(limit: number = 5): Promise<Event[]> {
    return this.findMany({
      where: {
        isPublished: true,
        startDate: { gt: new Date() },
      },
      orderBy: { startDate: 'asc' },
      take: limit,
    });
  }

  async findByType(eventType: string): Promise<Event[]> {
    return this.findMany({
      where: { eventType: eventType as any, isPublished: true },
      orderBy: { startDate: 'asc' },
    });
  }

  async getStats(): Promise<{
    total: number;
    published: number;
    draft: number;
    upcoming: number;
    past: number;
    byType: Record<string, number>;
    totalRegistrations: number;
  }> {
    const [total, published, draft, upcoming, past] = await Promise.all([
      this.count(),
      this.count({ isPublished: true }),
      this.count({ isPublished: false }),
      this.count({ startDate: { gt: new Date() }, isPublished: true }),
      this.count({ endDate: { lt: new Date() }, isPublished: true }),
    ]);

    const result = await this.execute(async () => {
      return await this.model.groupBy({
        by: ['eventType'],
        _count: {
          eventType: true,
        },
      });
    });

    const byType = result.reduce((acc: Record<string, number>, item: any) => {
      acc[item.eventType] = item._count.eventType;
      return acc;
    }, {});

    const registrationsResult = await this.execute(async () => {
      return await (this.prisma as any).eventRegistration.aggregate({
        _count: {
          id: true,
        },
      });
    });

    return {
      total,
      published,
      draft,
      upcoming,
      past,
      byType,
      totalRegistrations: registrationsResult._count.id || 0,
    };
  }

  async getRegistrations(eventId: string): Promise<EventRegistration[]> {
    return this.execute(async () => {
      return await (this.prisma as any).eventRegistration.findMany({
        where: { eventId },
        orderBy: { createdAt: 'desc' },
      });
    });
  }

  async createRegistration(data: any): Promise<EventRegistration> {
    return this.execute(async () => {
      return await (this.prisma as any).eventRegistration.create({
        data,
      });
    });
  }

  async updateRegistration(id: string, data: any): Promise<EventRegistration> {
    return this.execute(async () => {
      return await (this.prisma as any).eventRegistration.update({
        where: { id },
        data,
      });
    });
  }

  async getRegistrationStats(eventId: string): Promise<{
    total: number;
    pending: number;
    confirmed: number;
    cancelled: number;
    attended: number;
  }> {
    const [total, pending, confirmed, cancelled, attended] = await Promise.all([
      (this.prisma as any).eventRegistration.count({ where: { eventId } }),
      (this.prisma as any).eventRegistration.count({ where: { eventId, status: 'PENDING' } }),
      (this.prisma as any).eventRegistration.count({ where: { eventId, status: 'CONFIRMED' } }),
      (this.prisma as any).eventRegistration.count({ where: { eventId, status: 'CANCELLED' } }),
      (this.prisma as any).eventRegistration.count({ where: { eventId, attended: true } }),
    ]);

    return { total, pending, confirmed, cancelled, attended };
  }
}