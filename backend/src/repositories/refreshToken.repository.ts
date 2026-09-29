// src/repositories/refreshToken.repository.ts
import { BaseRepository } from './base.repository';
import { Prisma, RefreshToken } from '@prisma/client';

export class RefreshTokenRepository extends BaseRepository<
  RefreshToken,
  Prisma.RefreshTokenWhereInput,
  Prisma.RefreshTokenCreateInput,
  Prisma.RefreshTokenUpdateInput
> {
  constructor() {
    super('refreshToken');
  }

  async findValidToken(token: string, userId: string): Promise<RefreshToken | null> {
    // ✅ Correction : findFirst attend directement le where
    return this.findFirst({
      token,
      userId,
      isRevoked: false,
      expiresAt: { gt: new Date() },
    });
  }

  async findValidTokensByUser(userId: string): Promise<RefreshToken[]> {
    // ✅ findMany accepte un objet avec where (c'est correct)
    return this.findMany({
      where: {
        userId,
        isRevoked: false,
        expiresAt: { gt: new Date() },
      },
    });
  }

  async revokeToken(id: string): Promise<RefreshToken> {
    return this.update(id, { isRevoked: true });
  }

  async revokeAllUserTokens(userId: string): Promise<number> {
    const result = await this.execute(async () => {
      return await this.model.updateMany({
        where: {
          userId,
          isRevoked: false,
        },
        data: { isRevoked: true },
      });
    });
    return result.count || 0;
  }

  async revokeExpiredTokens(): Promise<number> {
    const result = await this.execute(async () => {
      return await this.model.updateMany({
        where: {
          expiresAt: { lt: new Date() },
          isRevoked: false,
        },
        data: { isRevoked: true },
      });
    });
    return result.count || 0;
  }

  async deleteRevokedTokens(): Promise<number> {
    const result = await this.execute(async () => {
      return await this.model.deleteMany({
        where: { isRevoked: true },
      });
    });
    return result.count || 0;
  }

  async cleanupExpiredTokens(): Promise<number> {
    const result = await this.execute(async () => {
      return await this.model.deleteMany({
        where: {
          expiresAt: { lt: new Date() },
        },
      });
    });
    return result.count || 0;
  }
}