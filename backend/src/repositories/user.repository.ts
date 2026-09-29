import { Prisma, User } from '@prisma/client';
import { BaseRepository } from './base.repository';
import { Role, UserStatus } from '../types/roles.enum';
import { NotFoundException } from '../exceptions/not-found.exception';

export class UserRepository extends BaseRepository<
  User,
  Prisma.UserWhereInput,
  Prisma.UserCreateInput,
  Prisma.UserUpdateInput
> {
  constructor() {
    super('user');
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findFirst({ email } as Prisma.UserWhereInput);
  }

  async findByEmailOrThrow(email: string): Promise<User> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw NotFoundException.resource('User', email);
    }
    return user;
  }

  async findActiveUsers(): Promise<User[]> {
    return this.findMany({
      where: { isActive: true } as Prisma.UserWhereInput,
    });
  }

  async findAdmins(): Promise<User[]> {
    return this.findMany({
      where: {
        role: {
          in: [Role.ADMIN, Role.SUPER_ADMIN],
        },
      } as Prisma.UserWhereInput,
    });
  }

  async searchUsers(search: string): Promise<User[]> {
    return this.findMany({
      where: {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
        ],
      } as Prisma.UserWhereInput,
    });
  }

  async getStats() {
    const [total, active, inactive] = await Promise.all([
      this.count(),
      this.count({ isActive: true } as Prisma.UserWhereInput),
      this.count({ isActive: false } as Prisma.UserWhereInput),
    ]);

    const byRole = await this.getCountByRole();
    const byStatus = await this.getCountByStatus();

    return { total, active, inactive, byRole, byStatus };
  }

  async getCountByRole(): Promise<Record<string, number>> {
    const users = await this.findMany();
    const countByRole = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const allRoles = Object.values(Role);
    allRoles.forEach(role => {
      if (!countByRole[role]) {
        countByRole[role] = 0;
      }
    });

    return countByRole;
  }

  async getCountByStatus(): Promise<Record<string, number>> {
    const users = await this.findMany();
    return users.reduce((acc, user) => {
      acc[user.status] = (acc[user.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  async updateLastLogin(id: string): Promise<User> {
    return this.update(id, { lastLogin: new Date() } as Prisma.UserUpdateInput);
  }

  async toggleActive(id: string): Promise<User> {
    const user = await this.findByIdOrThrow(id);
    return this.update(id, { isActive: !user.isActive } as Prisma.UserUpdateInput);
  }

  async hardDelete(id: string): Promise<User> {
    return this.delete(id);
  }

  async hardDeleteMany(ids: string[]): Promise<number> {
    return this.bulkDelete(ids);
  }
}