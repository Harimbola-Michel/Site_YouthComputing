import { Prisma } from '@prisma/client';

/**
 * Base repository interface with common CRUD operations
 */
export interface IBaseRepository<T, WhereInput, CreateInput, UpdateInput> {
  /**
   * Find entity by ID
   */
  findById(id: string): Promise<T | null>;

  /**
   * Find entity by ID or throw
   */
  findByIdOrThrow(id: string): Promise<T>;

  /**
   * Find first entity matching where clause
   */
  findFirst(where: WhereInput): Promise<T | null>;

  /**
   * Find all entities
   */
  findAll(params?: {
    where?: WhereInput;
    skip?: number;
    take?: number;
    orderBy?: any;
    include?: any;
  }): Promise<T[]>;

  /**
   * Find paginated entities
   */
  findPaginated(params: {
    page?: number;
    limit?: number;
    where?: WhereInput;
    orderBy?: any;
    include?: any;
  }): Promise<{
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;

  /**
   * Create a new entity
   */
  create(data: CreateInput): Promise<T>;

  /**
   * Update an existing entity
   */
  update(id: string, data: UpdateInput): Promise<T>;

  /**
   * Delete an entity
   */
  delete(id: string): Promise<T>;

  /**
   * Count entities matching where clause
   */
  count(where?: WhereInput): Promise<number>;

  /**
   * Check if entity exists
   */
  exists(where: WhereInput): Promise<boolean>;
}

/**
 * Repository with soft delete capabilities
 */
export interface ISoftDeleteRepository<T, WhereInput, CreateInput, UpdateInput>
  extends IBaseRepository<T, WhereInput, CreateInput, UpdateInput> {
  /**
   * Soft delete an entity
   */
  softDelete(id: string): Promise<T>;

  /**
   * Restore a soft-deleted entity
   */
  restore(id: string): Promise<T>;

  /**
   * Find soft-deleted entities
   */
  findDeleted(params?: {
    skip?: number;
    take?: number;
    where?: WhereInput;
    orderBy?: any;
  }): Promise<T[]>;

  /**
   * Permanently delete an entity
   */
  permanentDelete(id: string): Promise<T>;
}

/**
 * Repository with bulk operations
 */
export interface IBulkRepository<T, CreateInput, UpdateInput> {
  /**
   * Bulk create entities
   */
  bulkCreate(data: CreateInput[]): Promise<T[]>;

  /**
   * Bulk update entities
   */
  bulkUpdate(ids: string[], data: UpdateInput): Promise<number>;

  /**
   * Bulk delete entities
   */
  bulkDelete(ids: string[]): Promise<number>;

  /**
   * Upsert entities
   */
  upsert(data: CreateInput[]): Promise<T[]>;
}

/**
 * Repository with search capabilities
 */
export interface ISearchableRepository<T> {
  /**
   * Search by text
   */
  search(query: string, fields: string[], params?: {
    skip?: number;
    take?: number;
    where?: any;
    orderBy?: any;
  }): Promise<{
    data: T[];
    total: number;
  }>;

  /**
   * Full-text search
   */
  fullTextSearch(query: string, params?: {
    skip?: number;
    take?: number;
    where?: any;
    orderBy?: any;
  }): Promise<{
    data: T[];
    total: number;
  }>;
}

/**
 * Repository with transaction support
 */
export interface ITransactionalRepository {
  /**
   * Execute operation in transaction
   */
  transaction<R>(fn: (tx: Prisma.TransactionClient) => Promise<R>): Promise<R>;
}

/**
 * Repository with aggregation support
 */
export interface IAggregationRepository<T> {
  /**
   * Group by field
   */
  groupBy(field: string, where?: any): Promise<{
    [key: string]: number;
  }>;

  /**
   * Aggregate with multiple operations
   */
  aggregate(params: {
    where?: any;
    _count?: any;
    _sum?: any;
    _avg?: any;
    _min?: any;
    _max?: any;
  }): Promise<any>;
}

/**
 * Repository with caching support
 */
export interface ICacheableRepository {
  /**
   * Clear cache
   */
  clearCache(pattern?: string): Promise<void>;

  /**
   * Get cached entity
   */
  getCached<T>(key: string): Promise<T | null>;

  /**
   * Set cached entity
   */
  setCached<T>(key: string, value: T, ttl?: number): Promise<void>;

  /**
   * Invalidate cache for entity
   */
  invalidateCache(id: string): Promise<void>;
}

export interface IRepository<T = any> {
  // Core CRUD
  create(data: any): Promise<T>;
  update(id: string, data: any): Promise<T>;
  delete(id: string): Promise<void>;
  softDelete?(id: string): Promise<T>;
  restore?(id: string): Promise<T>;
  permanentDelete?(id: string): Promise<T>;

  // Query
  findById(id: string, options?: any): Promise<T | null>;
  findOne(filter: any, options?: any): Promise<T | null>;
  findMany(filter: any, options?: any): Promise<T[]>;
  findAll(options?: any): Promise<T[]>;

  // Pagination
  findPaginated(params: {
    page?: number;
    limit?: number;
    filter?: any;
    sort?: any;
    include?: any;
  }): Promise<{
    data: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }>;

  // Aggregation
  count(filter?: any): Promise<number>;
  sum(field: string, filter?: any): Promise<number>;
  avg(field: string, filter?: any): Promise<number>;
  min(field: string, filter?: any): Promise<any>;
  max(field: string, filter?: any): Promise<any>;
  groupBy(field: string, filter?: any): Promise<Record<string, number>>;

  // Relations
  include(relation: string, include: any): this;
  with(relations: string[]): this;
  join(relation: string, options?: any): this;

  // Transactions
  transaction<R>(callback: (tx: any) => Promise<R>): Promise<R>;

  // Cache
  cache(ttl?: number): this;
  clearCache(pattern?: string): Promise<void>;

  // Validation
  validate(data: any, context?: string): Promise<{
    valid: boolean;
    errors: Array<{
      field: string;
      message: string;
    }>;
  }>;

  // Hooks
  beforeCreate?(data: any): Promise<any>;
  afterCreate?(result: any): Promise<void>;
  beforeUpdate?(id: string, data: any): Promise<any>;
  afterUpdate?(result: any): Promise<void>;
  beforeDelete?(id: string): Promise<void>;
  afterDelete?(result: any): Promise<void>;

  // Audit
  log(userId: string, action: string, resourceId: string, details?: any): Promise<void>;
  getLogs(resourceId: string, params?: any): Promise<{
    data: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;
}

/**
 * Generic repository interface
 */
export interface IGenericRepository<T, K = string> {
  // Basic operations
  create(data: any): Promise<T>;
  update(id: K, data: any): Promise<T>;
  delete(id: K): Promise<void>;
  findById(id: K, options?: any): Promise<T | null>;
  findOne(filter: any, options?: any): Promise<T | null>;
  findMany(filter: any, options?: any): Promise<T[]>;
  findAll(options?: any): Promise<T[]>;

  // Pagination
  findPaginated(params: {
    page?: number;
    limit?: number;
    filter?: any;
    sort?: any;
    include?: any;
  }): Promise<{
    data: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;

  // Aggregation
  count(filter?: any): Promise<number>;
  sum(field: string, filter?: any): Promise<number>;
  avg(field: string, filter?: any): Promise<number>;
  min(field: string, filter?: any): Promise<any>;
  max(field: string, filter?: any): Promise<any>;
  groupBy(field: string, filter?: any): Promise<Record<string, number>>;

  // Transactions
  transaction<R>(callback: (tx: any) => Promise<R>): Promise<R>;

  // Cache
  cache(ttl?: number): this;
  clearCache(): Promise<void>;

  // Validation
  validate(data: any, context?: string): Promise<{
    valid: boolean;
    errors: any[];
  }>;

  // Audit
  log(userId: string, action: string, resourceId: string, details?: any): Promise<void>;
  getLogs(resourceId: string, params?: any): Promise<any>;
}