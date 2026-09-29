// src/repositories/teamMember.repository.ts
import { BaseRepository } from './base.repository';
import { Prisma, TeamMember } from '@prisma/client';
import { prisma } from '../config/prisma';

export class TeamMemberRepository extends BaseRepository<
  TeamMember,
  Prisma.TeamMemberWhereInput,
  Prisma.TeamMemberCreateInput,
  Prisma.TeamMemberUpdateInput
> {
  constructor() {
    super('teamMember');
  }

  async findByUserId(userId: string): Promise<TeamMember | null> {
    return this.findFirst({ userId });
  }

  async getStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byDepartment: Record<string, number>;
  }> {
    const total = await this.count();
    const active = await this.count({ isActive: true });
    const inactive = await this.count({ isActive: false });
    const deptResult = await prisma.teamMember.groupBy({
      by: ['department'],
      _count: { department: true },
    });
    const byDepartment = deptResult.reduce<Record<string, number>>((acc, item) => {
      const key = item.department || 'Non défini';
      acc[key] = item._count.department;
      return acc;
    }, {});
    return { total, active, inactive, byDepartment };
  }
}