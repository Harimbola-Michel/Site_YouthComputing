import { BaseRepository } from './base.repository';
import { Prisma, File } from '@prisma/client';

export class FileRepository extends BaseRepository<
  File,
  Prisma.FileWhereInput,
  Prisma.FileCreateInput,
  Prisma.FileUpdateInput
> {
  constructor() {
    super('file');
  }

  async findByUserId(userId: string): Promise<File[]> {
    return this.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByIdOrThrow(id: string): Promise<File> {
    const file = await this.findById(id);
    if (!file) {
      throw new Error('File not found');
    }
    return file;
  }
}