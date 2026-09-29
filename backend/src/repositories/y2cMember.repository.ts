// src/repositories/y2cMember.repository.ts
import { Prisma, Y2CMember } from '@prisma/client';
import { prisma } from '../config/prisma';
import { ApiError } from '../utils/ApiError';

export class Y2CMemberRepository {
  async findMany(params: Prisma.Y2CMemberFindManyArgs): Promise<Y2CMember[]> {
    return prisma.y2CMember.findMany(params);
  }

  async findUnique(where: Prisma.Y2CMemberWhereUniqueInput): Promise<Y2CMember | null> {
    return prisma.y2CMember.findUnique({ where });
  }

  async findById(id: string): Promise<Y2CMember | null> {
    return prisma.y2CMember.findUnique({ where: { id } });
  }

  async findByIdOrThrow(id: string): Promise<Y2CMember> {
    const member = await this.findById(id);
    if (!member) {
      throw ApiError.notFound(`Membre Y2C non trouvé (id: ${id})`);
    }
    return member;
  }

  async findByEmail(email: string): Promise<Y2CMember | null> {
    return prisma.y2CMember.findUnique({ where: { email } });
  }

  async findByBadgeNumber(badgeNumber: string): Promise<Y2CMember | null> {
    return prisma.y2CMember.findUnique({ where: { badgeNumber } });
  }

  async create(data: Prisma.Y2CMemberCreateInput): Promise<Y2CMember> {
    return prisma.y2CMember.create({ data });
  }

  async update(id: string, data: Prisma.Y2CMemberUpdateInput): Promise<Y2CMember> {
    await this.findByIdOrThrow(id);
    return prisma.y2CMember.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await this.findByIdOrThrow(id);
    await prisma.y2CMember.delete({ where: { id } });
  }

  async count(where?: Prisma.Y2CMemberWhereInput): Promise<number> {
    return prisma.y2CMember.count({ where });
  }

  async findPaginated(params: {
    page?: number;
    limit?: number;
    search?: string;
    where?: Prisma.Y2CMemberWhereInput;
    orderBy?: Prisma.Y2CMemberOrderByWithRelationInput;
  }): Promise<{ data: Y2CMember[]; pagination: any }> {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;
    let where = params.where || {};
    if (params.search) {
      where = {
        OR: [
          { name: { contains: params.search, mode: 'insensitive' } },
          { email: { contains: params.search, mode: 'insensitive' } },
          { phone: { contains: params.search, mode: 'insensitive' } },
          { institution: { contains: params.search, mode: 'insensitive' } },
        ],
      };
    }
    const [data, total] = await Promise.all([
      prisma.y2CMember.findMany({
        skip,
        take: limit,
        where,
        orderBy: params.orderBy || { createdAt: 'desc' },
      }),
      prisma.y2CMember.count({ where }),
    ]);
    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  async getStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    expired: number;
    pending: number;
    byInstitution: Record<string, number>;
  }> {
    const [total, active, inactive, expired, pending] = await Promise.all([
      prisma.y2CMember.count(),
      prisma.y2CMember.count({ where: { status: 'ACTIVE' } }),
      prisma.y2CMember.count({ where: { status: 'INACTIVE' } }),
      prisma.y2CMember.count({ where: { status: 'EXPIRED' } }),
      prisma.y2CMember.count({ where: { status: 'PENDING' } }),
    ]);
    const result = await prisma.y2CMember.groupBy({
      by: ['institution'],
      _count: { institution: true },
    });
    const byInstitution = result.reduce((acc, item) => {
      if (item.institution) {
        acc[item.institution] = item._count.institution;
      }
      return acc;
    }, {} as Record<string, number>);
    return { total, active, inactive, expired, pending, byInstitution };
  }
}