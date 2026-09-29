// src/repositories/formation-session.repository.ts

import { BaseRepository } from './base.repository';
import { Prisma, FormationSession } from '@prisma/client';
import { NotFoundException } from '../exceptions';

export class FormationSessionRepository extends BaseRepository<
  FormationSession,
  Prisma.FormationSessionWhereInput,
  Prisma.FormationSessionCreateInput,
  Prisma.FormationSessionUpdateInput
> {
  constructor() {
    super('formationSession');
  }

  async findByFormationId(formationId: string): Promise<FormationSession[]> {
    return this.findMany({
      where: { formationId },
      orderBy: { startDate: 'asc' },
    });
  }

  async findUpcomingSessions(limit: number = 10): Promise<FormationSession[]> {
    return this.findMany({
      where: { startDate: { gt: new Date() }, status: 'SCHEDULED' },
      orderBy: { startDate: 'asc' },
      take: limit,
    });
  }

  async updateParticipantsCount(id: string, increment: number = 1): Promise<FormationSession> {
    return this.execute(async () => {
      const session = await this.model.findUnique({ where: { id } });
      if (!session) throw NotFoundException.resource('FormationSession', id);
      const newCount = session.currentParticipants + increment;
      if (newCount > session.maxParticipants) throw new Error('Session is full');
      return await this.model.update({
        where: { id },
        data: { currentParticipants: newCount },
      });
    });
  }

  async getStats(): Promise<{
    total: number;
    scheduled: number;
    ongoing: number;
    completed: number;
    cancelled: number;
    totalParticipants: number;
  }> {
    const [total, scheduled, ongoing, completed, cancelled] = await Promise.all([
      this.count(),
      this.count({ status: 'SCHEDULED' }),
      this.count({ status: 'ONGOING' }),
      this.count({ status: 'COMPLETED' }),
      this.count({ status: 'CANCELLED' }),
    ]);
    const result = await this.execute(async () =>
      await this.model.aggregate({ _sum: { currentParticipants: true } })
    );
    return {
      total,
      scheduled,
      ongoing,
      completed,
      cancelled,
      totalParticipants: result._sum.currentParticipants || 0,
    };
  }

  async findWithRegistrations(id: string): Promise<FormationSession | null> {
    return this.execute(async () =>
      await this.model.findUnique({
        where: { id },
        include: { registrations: true, formation: true },
      })
    );
  }
}