// src/services/user.service.ts

import { BaseService } from './base.service';
import { UserRepository } from '../repositories/user.repository';
import { CreateUserDTO, UpdateUserDTO, UserDTO } from '../types/dto/user.dto';
import { ApiError } from '../utils/ApiError';
import { hashPassword, comparePassword } from '../utils/password';
import { User } from '@prisma/client';
import { Role, UserStatus, ROLE_HIERARCHY } from '../types/roles.enum';
import { mailer } from '../config/mailer';
import { logger } from '../config/logger';
import fs from 'fs';          // ← import ajouté
import path from 'path';      // ← import ajouté

export class UserService extends BaseService<User, CreateUserDTO, UpdateUserDTO> {
  private userRepository: UserRepository;

  constructor() {
    super(new UserRepository());
    this.userRepository = new UserRepository();
  }

  // ─── CRUD ──────────────────────────────────────────────

  async findAll(pagination?: { page: number; limit: number }): Promise<User[]> {
    if (pagination) {
      const result = await this.userRepository.findPaginated({
        page: pagination.page,
        limit: pagination.limit,
        orderBy: { createdAt: 'desc' },
      });
      return result.data;
    }
    return this.userRepository.findAll();
  }

  async findById(id: string): Promise<User> {
    return this.userRepository.findByIdOrThrow(id);
  }

  async create(data: CreateUserDTO): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw ApiError.conflict('Email already registered');
    }

    const hashedPassword = await hashPassword(data.password);
    const defaultRole = data.role || Role.VIEWER;

    const user = await this.userRepository.create({
      email: data.email,
      password_hash: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      role: defaultRole,
      status: data.status || UserStatus.PENDING,
      isActive: true,
    });

    try {
      await mailer.sendTemplatedEmail(user.email, 'welcome', {
        name: `${user.firstName} ${user.lastName}`,
      });
    } catch (error) {
      logger.error('Failed to send welcome email:', error);
    }

    return user;
  }

  async update(id: string, data: UpdateUserDTO): Promise<User> {
    const user = await this.userRepository.findByIdOrThrow(id);

    const updateData: any = {};

    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.avatar !== undefined) updateData.avatar = data.avatar;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    return this.userRepository.update(id, updateData);
  }

  async delete(id: string): Promise<User> {
    await this.userRepository.findByIdOrThrow(id);
    return this.userRepository.softDelete(id);
  }

  async hardDelete(id: string): Promise<User> {
    await this.userRepository.findByIdOrThrow(id);
    return this.userRepository.delete(id);
  }

  // ─── Recherche et statistiques ────────────────────────

  async searchUsers(search: string): Promise<User[]> {
    return this.userRepository.searchUsers(search);
  }

  async getStats() {
    return this.userRepository.getStats();
  }

// src/services/user.service.ts

// src/services/user.service.ts
async updateAvatar(userId: string, filePath: string): Promise<User> {
  if (!filePath) {
    throw new ApiError(400, 'Chemin du fichier manquant');
  }
  const user = await this.userRepository.findByIdOrThrow(userId);
  if (user.avatar) {
    const oldPath = path.join(process.env.STORAGE_PATH || process.cwd(), 'uploads/avatars', path.basename(user.avatar));
    try { fs.unlinkSync(oldPath); } catch (_) {}
  }
  const avatarUrl = `/uploads/avatars/${path.basename(filePath)}`;
  return this.userRepository.update(userId, { avatar: avatarUrl });
}
  // ─── Actions sur le compte ─────────────────────────────

  async changePassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findByIdOrThrow(id);
    const isValid = await comparePassword(currentPassword, user.password_hash);
    if (!isValid) {
      throw ApiError.badRequest('Current password is incorrect');
    }
    const hashedPassword = await hashPassword(newPassword);
    await this.userRepository.update(id, {
      password_hash: hashedPassword,
    });
  }

  async toggleActive(id: string): Promise<User> {
    const user = await this.userRepository.findByIdOrThrow(id);
    return this.userRepository.update(id, {
      isActive: !user.isActive,
    });
  }

  async validateUser(id: string): Promise<User> {
    const user = await this.userRepository.findByIdOrThrow(id);
    if (user.status === UserStatus.ACTIVE) {
      throw ApiError.badRequest('User is already validated');
    }
    const updated = await this.userRepository.update(id, {
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
    });
    try {
      await mailer.sendTemplatedEmail(updated.email, 'account-validated', {
        name: `${updated.firstName} ${updated.lastName}`,
      });
    } catch (error) {
      logger.error('Failed to send validation email:', error);
    }
    return updated;
  }

  async toggleStatus(id: string): Promise<User> {
    const user = await this.userRepository.findByIdOrThrow(id);
    const newStatus = user.status === UserStatus.SUSPENDED ? UserStatus.ACTIVE : UserStatus.SUSPENDED;
    return this.userRepository.update(id, { status: newStatus });
  }

  async changeRole(id: string, role: Role): Promise<User> {
    const user = await this.userRepository.findByIdOrThrow(id);
    if (!Object.values(Role).includes(role)) {
      throw ApiError.badRequest('Invalid role');
    }
    return this.userRepository.update(id, { role });
  }

  // ─── Utilitaires ────────────────────────────────────────

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async findByEmailOrThrow(email: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    return user;
  }

  async findActiveUsers(): Promise<User[]> {
    return this.userRepository.findActiveUsers();
  }

  async findAdmins(): Promise<User[]> {
    return this.userRepository.findAdmins();
  }

  async updateLastLogin(id: string): Promise<User> {
    return this.userRepository.updateLastLogin(id);
  }

  async hasRole(id: string, role: Role): Promise<boolean> {
    const user = await this.userRepository.findByIdOrThrow(id);
    return user.role === role;
  }

  async hasMinRole(id: string, minRole: Role): Promise<boolean> {
    const user = await this.userRepository.findByIdOrThrow(id);
    return (ROLE_HIERARCHY[user.role as Role] || 0) >= (ROLE_HIERARCHY[minRole] || 0);
  }

  // ─── DTO ────────────────────────────────────────────────

  toDTO(user: User): UserDTO {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: `${user.firstName} ${user.lastName}`.trim(),
      phone: user.phone || undefined,
      avatar: user.avatar || undefined,
      bio: user.bio || undefined,
      role: user.role as Role,
      status: user.status as UserStatus,
      isActive: user.isActive,
      lastLogin: user.lastLogin || undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  toDTOs(users: User[]): UserDTO[] {
    return users.map(user => this.toDTO(user));
  }
}
