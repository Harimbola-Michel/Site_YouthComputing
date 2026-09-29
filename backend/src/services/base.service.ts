import { BaseRepository } from '../repositories/base.repository';
import { logger } from '../config/logger';

export abstract class BaseService<T, CreateDTO, UpdateDTO> {
  protected repository: BaseRepository<T, any, any, any>;

  constructor(repository: BaseRepository<T, any, any, any>) {
    this.repository = repository;
  }

  async findAll(params?: any): Promise<T[]> {
    try {
      if (params?.page) {
        const result = await this.repository.findPaginated(params);
        return result.data;
      }
      return await this.repository.findAll(params);
    } catch (error) {
      logger.error('Error in findAll:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<T> {
    try {
      return await this.repository.findByIdOrThrow(id);
    } catch (error) {
      logger.error(`Error in findById ${id}:`, error);
      throw error;
    }
  }

  async create(data: CreateDTO): Promise<T> {
    try {
      return await this.repository.create(data);
    } catch (error) {
      logger.error('Error in create:', error);
      throw error;
    }
  }

  async update(id: string, data: UpdateDTO): Promise<T> {
    try {
      return await this.repository.update(id, data);
    } catch (error) {
      logger.error(`Error in update ${id}:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<T> {
    try {
      return await this.repository.softDelete(id);
    } catch (error) {
      logger.error(`Error in delete ${id}:`, error);
      throw error;
    }
  }

  async hardDelete(id: string): Promise<T> {
    try {
      return await this.repository.delete(id);
    } catch (error) {
      logger.error(`Error in hardDelete ${id}:`, error);
      throw error;
    }
  }

  async count(where?: any): Promise<number> {
    try {
      return await this.repository.count(where);
    } catch (error) {
      logger.error('Error in count:', error);
      throw error;
    }
  }

  async exists(where: any): Promise<boolean> {
    try {
      return await this.repository.exists(where);
    } catch (error) {
      logger.error('Error in exists:', error);
      throw error;
    }
  }
}