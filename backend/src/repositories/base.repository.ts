import prisma from '../../prisma/client';
import { Prisma } from '@prisma/client';
import { logger } from '../config/logger';
import { DatabaseException } from '../exceptions/database.exception';
import { NotFoundException } from '../exceptions/not-found.exception';

export class BaseRepository<T, WhereInput = any, CreateInput = any, UpdateInput = any> {
  protected modelName: string;
  protected prisma: typeof prisma;

  constructor(modelName: string) {
    this.modelName = modelName;
    this.prisma = prisma;
  }

  protected get model(): any {
    return (this.prisma as any)[this.modelName];
  }

  protected async execute<R>(operation: () => Promise<R>): Promise<R> {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        logger.error(`Prisma error (${this.modelName}):`, {
          code: error.code,
          meta: error.meta,
          message: error.message,
        });
        
        if (error.code === 'P2025') {
          throw NotFoundException.resource(this.modelName, '');
        }
        
        throw DatabaseException.queryError(this.modelName, {
          code: error.code,
          meta: error.meta,
        });
      }
      
      if (error instanceof Prisma.PrismaClientValidationError) {
        logger.error(`Prisma validation error (${this.modelName}):`, error.message);
        throw DatabaseException.queryError(this.modelName, {
          validationError: error.message,
        });
      }
      
      logger.error(`Database error (${this.modelName}):`, error);
      throw DatabaseException.queryError(this.modelName, {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async transaction<R>(fn: (tx: Prisma.TransactionClient) => Promise<R>): Promise<R> {
    try {
      return await prisma.$transaction(fn);
    } catch (error) {
      logger.error(`Transaction error (${this.modelName}):`, error);
      throw DatabaseException.transactionError({
        model: this.modelName,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async findById(id: string): Promise<T | null> {
    return this.execute(async () => {
      return await this.model.findUnique({
        where: { id },
      });
    });
  }

  async findByIdOrThrow(id: string): Promise<T> {
    const result = await this.findById(id);
    if (!result) {
      throw NotFoundException.resource(this.modelName, id);
    }
    return result;
  }

  async findFirst(where: WhereInput): Promise<T | null> {
    return this.execute(async () => {
      return await this.model.findFirst({
        where,
      });
    });
  }

  // findMany avec skip/take pour la pagination
  async findMany(params?: {
    where?: WhereInput;
    skip?: number;
    take?: number;
    orderBy?: any;
    include?: any;
    select?: any;
  }): Promise<T[]> {
    return this.execute(async () => {
      return await this.model.findMany(params || {});
    });
  }

  // alias findAll
  async findAll(params?: any): Promise<T[]> {
    return this.findMany(params);
  }

  // ❌ LA PREMIÈRE VERSION DE softDelete A ÉTÉ SUPPRIMÉE ICI
  // (il n'y a plus de doublon)

  // findPaginated – pagination complète avec métadonnées
  async findPaginated(params: {
    page?: number;
    limit?: number;
    where?: WhereInput;
    orderBy?: any;
    include?: any;
    select?: any;
  }): Promise<{
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 10, 100);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.findMany({
        where: params.where,
        skip,
        take: limit,
        orderBy: params.orderBy,
        include: params.include,
        select: params.select,
      }),
      this.count(params.where),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  async create(data: CreateInput): Promise<T> {
    return this.execute(async () => {
      return await this.model.create({
        data,
      });
    });
  }

  async update(id: string, data: UpdateInput): Promise<T> {
    return this.execute(async () => {
      const result = await this.model.update({
        where: { id },
        data,
      });
      if (!result) {
        throw NotFoundException.resource(this.modelName, id);
      }
      return result;
    });
  }

  async delete(id: string): Promise<T> {
    return this.execute(async () => {
      const result = await this.model.delete({
        where: { id },
      });
      if (!result) {
        throw NotFoundException.resource(this.modelName, id);
      }
      return result;
    });
  }

  async count(where?: WhereInput): Promise<number> {
    return this.execute(async () => {
      return await this.model.count({ where });
    });
  }

  async exists(where: WhereInput): Promise<boolean> {
    const count = await this.count(where);
    return count > 0;
  }

  // ✅ UNIQUE VERSION DE softDelete (avec champ personnalisable)
  async softDelete(id: string, field: string = 'deletedAt'): Promise<T> {
    return this.execute(async () => {
      return await this.model.update({
        where: { id },
        data: { [field]: new Date() },
      });
    });
  }

  async restore(id: string, field: string = 'deletedAt'): Promise<T> {
    return this.execute(async () => {
      return await this.model.update({
        where: { id },
        data: { [field]: null },
      });
    });
  }

  async bulkCreate(data: CreateInput[]): Promise<any> {
    return this.execute(async () => {
      return await this.model.createMany({
        data,
      });
    });
  }

  async bulkUpdate(ids: string[], data: UpdateInput): Promise<number> {
    return this.execute(async () => {
      const result = await this.model.updateMany({
        where: { id: { in: ids } },
        data,
      });
      return result.count || 0;
    });
  }

  async bulkDelete(ids: string[]): Promise<number> {
    return this.execute(async () => {
      const result = await this.model.deleteMany({
        where: { id: { in: ids } },
      });
      return result.count || 0;
    });
  }
}