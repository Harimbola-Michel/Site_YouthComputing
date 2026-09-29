import { BaseRepository } from './base.repository';
import { Prisma, Y2CEvent, Y2CEventRegistration } from '@prisma/client';
import prisma from '../../prisma/client';
import { NotFoundException } from '../exceptions/not-found.exception';

export class Y2CEventRepository extends BaseRepository<
  Y2CEvent,
  Prisma.Y2CEventWhereInput,
  Prisma.Y2CEventCreateInput,
  Prisma.Y2CEventUpdateInput
> {
  constructor() {
    // ✅ On passe le nom du modèle (le BaseRepository utilisera prisma[modelName])
    super('y2CEvent');
  }

  async findBySlug(slug: string): Promise<Y2CEvent | null> {
    return this.execute(async () => {
      return await this.model.findUnique({
        where: { slug },
      });
    });
  }

  async findBySlugOrThrow(slug: string): Promise<Y2CEvent> {
    const event = await this.findBySlug(slug);
    if (!event) throw NotFoundException.resource('Y2CEvent', `slug: ${slug}`);
    return event;
  }

  async findPublished(): Promise<Y2CEvent[]> {
    return this.findMany({
      where: { isPublished: true },
      orderBy: { startDate: 'asc' },
    });
  }

  async findUpcoming(limit: number = 5): Promise<Y2CEvent[]> {
    return this.findMany({
      where: {
        isPublished: true,
        startDate: { gt: new Date() },
      },
      orderBy: { startDate: 'asc' },
      take: limit,
    });
  }

  async findByType(eventType: string): Promise<Y2CEvent[]> {
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

    const result = await prisma.y2CEvent.groupBy({
      by: ['eventType'],
      _count: { eventType: true },
    });

    const byType = result.reduce((acc: Record<string, number>, item: any) => {
      acc[item.eventType] = item._count.eventType;
      return acc;
    }, {});

    const registrationsResult = await prisma.y2CEventRegistration.aggregate({
      _count: { id: true },
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

  // ─── Inscriptions ──────────────────────────────────────────
  async getRegistrations(eventId: string): Promise<Y2CEventRegistration[]> {
    return prisma.y2CEventRegistration.findMany({
      where: { eventId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createRegistration(data: Prisma.Y2CEventRegistrationCreateInput): Promise<Y2CEventRegistration> {
    return prisma.y2CEventRegistration.create({ data });
  }

  async updateRegistration(id: string, data: Prisma.Y2CEventRegistrationUpdateInput): Promise<Y2CEventRegistration> {
    return prisma.y2CEventRegistration.update({
      where: { id },
      data,
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
      prisma.y2CEventRegistration.count({ where: { eventId } }),
      prisma.y2CEventRegistration.count({ where: { eventId, status: 'PENDING' } }),
      prisma.y2CEventRegistration.count({ where: { eventId, status: 'CONFIRMED' } }),
      prisma.y2CEventRegistration.count({ where: { eventId, status: 'CANCELLED' } }),
      prisma.y2CEventRegistration.count({ where: { eventId, attended: true } }),
    ]);

    return { total, pending, confirmed, cancelled, attended };
  }
}