import { BaseRepository } from './base.repository';
import { Prisma, Registration, RegistrationStatus } from '@prisma/client';

export class RegistrationRepository extends BaseRepository<
  Registration,
  Prisma.RegistrationWhereInput,
  Prisma.RegistrationCreateInput,
  Prisma.RegistrationUpdateInput
> {
  constructor() {
    super('registration');
  }

  async findByEmail(email: string): Promise<Registration[]> {
    return this.findMany({
      where: { email },
      include: {
        formation: true,
        session: true,
      },
    });
  } 

  async findByFormationId(formationId: string): Promise<Registration[]> {
    return this.findMany({
      where: { formationId },
      include: {
        session: true,
      },
    });
  }

  async findBySessionId(sessionId: string): Promise<Registration[]> {
    return this.findMany({
      where: { sessionId },
      include: {
        formation: true,
      },
    });
  }

  async findByStatus(status: RegistrationStatus): Promise<Registration[]> {
    return this.findMany({
      where: { status },
      include: {
        formation: true,
        session: true,
      },
    });
  }

  async countByStatus(): Promise<Record<string, number>> {
    const result = await this.execute(async () => {
      return await this.model.groupBy({
        by: ['status'],
        _count: { status: true },
      });
    });
    return result.reduce((acc: Record<string, number>, item: any) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {});
  }

  async countByPaymentStatus(): Promise<Record<string, number>> {
    const result = await this.execute(async () => {
      return await this.model.groupBy({
        by: ['paymentStatus'],
        _count: { paymentStatus: true },
      });
    });
    return result.reduce((acc: Record<string, number>, item: any) => {
      acc[item.paymentStatus] = item._count.paymentStatus;
      return acc;
    }, {});
  }

  async countByFormation(): Promise<Record<string, number>> {
    const result = await this.execute(async () => {
      return await this.model.groupBy({
        by: ['formationId'],
        _count: { formationId: true },
      });
    });
    return result.reduce((acc: Record<string, number>, item: any) => {
      acc[item.formationId] = item._count.formationId;
      return acc;
    }, {});
  }

  async getStats(): Promise<{
    total: number;
    pending: number;
    confirmed: number;
    cancelled: number;
    completed: number;
    waitingList: number;
  }> {
    const [total, pending, confirmed, cancelled, completed, waitingList] = await Promise.all([
      this.count(),
      this.count({ status: 'PENDING' }),
      this.count({ status: 'CONFIRMED' }),
      this.count({ status: 'CANCELLED' }),
      this.count({ status: 'COMPLETED' }),
      this.count({ status: 'WAITING_LIST' }),
    ]);
    return { total, pending, confirmed, cancelled, completed, waitingList };
  }

  async getRevenueStats(): Promise<{ total: number; paid: number; pending: number }> {
    const result = await this.execute(async () => {
      const [total, paid, pending] = await Promise.all([
        this.model.aggregate({ _sum: { paymentAmount: true } }),
        this.model.aggregate({
          _sum: { paymentAmount: true },
          where: { paymentStatus: 'PAID' },
        }),
        this.model.aggregate({
          _sum: { paymentAmount: true },
          where: { paymentStatus: 'PENDING' },
        }),
      ]);
      return {
        total: total._sum.paymentAmount || 0,
        paid: paid._sum.paymentAmount || 0,
        pending: pending._sum.paymentAmount || 0,
      };
    });
    return result;
  }

  async findWithPayments(id: string): Promise<Registration | null> {
    return this.execute(async () => {
      return await this.model.findUnique({
        where: { id },
        include: {
          payments: true,
          formation: true,
          session: true,
        },
      });
    });
  }
}