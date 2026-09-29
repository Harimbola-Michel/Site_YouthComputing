import { BaseRepository } from './base.repository';
import { Prisma, Payment } from '@prisma/client';

export class PaymentRepository extends BaseRepository<
  Payment,
  Prisma.PaymentWhereInput,
  Prisma.PaymentCreateInput,
  Prisma.PaymentUpdateInput
> {
  constructor() {
    super('payment');
  }

  // ✅ Correction : passer directement le where (sans wrapper)
  async findByReference(reference: string): Promise<Payment | null> {
    return this.findFirst({ paymentReference: reference });
  }

  async findByRegistrationId(registrationId: string): Promise<Payment[]> {
    return this.findMany({
      where: { registrationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByY2CMemberId(y2cMemberId: string): Promise<Payment[]> {
    return this.findMany({
      where: { y2cMemberId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStats(): Promise<{
    total: number;
    pending: number;
    paid: number;
    failed: number;
    refunded: number;
    totalAmount: number;
    byMethod: Record<string, number>;
  }> {
    const [total, pending, paid, failed, refunded] = await Promise.all([
      this.count(),
      this.count({ status: 'PENDING' }),
      this.count({ status: 'PAID' }),
      this.count({ status: 'FAILED' }),
      this.count({ status: 'REFUNDED' }),
    ]);

    const amountResult = await this.execute(async () => {
      return await this.model.aggregate({
        _sum: {
          amount: true,
        },
        where: { status: 'PAID' },
      });
    });

    const result = await this.execute(async () => {
      return await this.model.groupBy({
        by: ['paymentMethod'],
        _count: {
          paymentMethod: true,
        },
        _sum: {
          amount: true,
        },
      });
    });

    const byMethod = result.reduce((acc: Record<string, number>, item: any) => {
      acc[item.paymentMethod] = item._count.paymentMethod;
      return acc;
    }, {});

    return {
      total,
      pending,
      paid,
      failed,
      refunded,
      totalAmount: amountResult._sum.amount || 0,
      byMethod,
    };
  }

  async sum(field: string, where?: Prisma.PaymentWhereInput): Promise<number> {
    const result = await this.execute(async () => {
      return await this.model.aggregate({
        _sum: {
          [field]: true,
        },
        where,
      });
    });
    return result._sum[field] || 0;
  }

  async groupBy(field: string, where?: Prisma.PaymentWhereInput): Promise<Record<string, number>> {
    const result = await this.execute(async () => {
      return await this.model.groupBy({
        by: [field],
        _count: {
          [field]: true,
        },
        where,
      });
    });

    return result.reduce((acc: Record<string, number>, item: any) => {
      acc[item[field]] = item._count[field];
      return acc;
    }, {});
  }

  async getPaymentTrends(days: number = 30): Promise<{
    date: string;
    count: number;
    amount: number;
  }[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const payments = await this.findMany({
      where: {
        status: 'PAID',
        paidAt: { gte: startDate },
      },
      orderBy: { paidAt: 'asc' },
    });

    const trends = new Map<string, { count: number; amount: number }>();

    for (const payment of payments) {
      const date = payment.paidAt ? payment.paidAt.toISOString().split('T')[0] : '';
      if (!trends.has(date)) {
        trends.set(date, { count: 0, amount: 0 });
      }
      const current = trends.get(date)!;
      current.count += 1;
      current.amount += payment.amount;
    }

    return Array.from(trends.entries()).map(([date, data]) => ({
      date,
      count: data.count,
      amount: data.amount,
    }));
  }
}