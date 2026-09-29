import { PaginationParams, PaginatedResult, FilterOptions } from '../index';

/**
 * Base service interface with common CRUD operations
 */
export interface IBaseService<T, CreateDTO, UpdateDTO> {
  /**
   * Find all entities with pagination
   */
  findAll(params?: PaginationParams & FilterOptions): Promise<PaginatedResult<T>>;

  /**
   * Find entity by ID
   */
  findById(id: string): Promise<T | null>;

  /**
   * Find entity by ID or throw if not found
   */
  findByIdOrThrow(id: string): Promise<T>;

  /**
   * Create a new entity
   */
  create(data: CreateDTO): Promise<T>;

  /**
   * Update an existing entity
   */
  update(id: string, data: UpdateDTO): Promise<T>;

  /**
   * Delete an entity
   */
  delete(id: string): Promise<T>;

  /**
   * Check if entity exists
   */
  exists(id: string): Promise<boolean>;

  /**
   * Count entities matching criteria
   */
  count(filters?: FilterOptions): Promise<number>;
}

/**
 * Service with soft delete capabilities
 */
export interface ISoftDeleteService<T, CreateDTO, UpdateDTO> extends IBaseService<T, CreateDTO, UpdateDTO> {
  /**
   * Restore a soft-deleted entity
   */
  restore(id: string): Promise<T>;

  /**
   * Permanently delete an entity
   */
  permanentDelete(id: string): Promise<T>;

  /**
   * Find soft-deleted entities
   */
  findDeleted(params?: PaginationParams): Promise<PaginatedResult<T>>;
}

/**
 * Service with search capabilities
 */
export interface ISearchableService<T> {
  /**
   * Search entities by query
   */
  search(query: string, params?: PaginationParams): Promise<PaginatedResult<T>>;

  /**
   * Advanced search with filters
   */
  advancedSearch(filters: FilterOptions, params?: PaginationParams): Promise<PaginatedResult<T>>;
}

/**
 * Service with export capabilities
 */
export interface IExportableService<T> {
  /**
   * Export data to specified format
   */
  export(format: 'csv' | 'excel' | 'pdf' | 'json', filters?: FilterOptions): Promise<Buffer | string>;

  /**
   * Get export fields configuration
   */
  getExportFields(): string[];
}

/**
 * Service with import capabilities
 */
export interface IImportableService<T> {
  /**
   * Import data from file
   */
  import(file: Express.Multer.File, options?: { validateOnly?: boolean }): Promise<ImportResult<T>>;

  /**
   * Validate import data
   */
  validateImport(data: any[]): Promise<ValidationResult>;
}

/**
 * Service with bulk operations
 */
export interface IBulkOperationService<T> {
  /**
   * Bulk create entities
   */
  bulkCreate(data: any[]): Promise<BulkOperationResult<T>>;

  /**
   * Bulk update entities
   */
  bulkUpdate(ids: string[], data: any): Promise<BulkOperationResult<T>>;

  /**
   * Bulk delete entities
   */
  bulkDelete(ids: string[]): Promise<BulkOperationResult<T>>;
}

/**
 * Service with caching capabilities
 */
export interface ICacheableService {
  /**
   * Clear cache for this service
   */
  clearCache(pattern?: string): Promise<void>;

  /**
   * Invalidate cache for specific entity
   */
  invalidateCache(id: string): Promise<void>;
}

/**
 * Service with event handling
 */
export interface IEventEmittingService {
  /**
   * Emit an event
   */
  emit(event: string, data: any): void;

  /**
   * Add event listener
   */
  on(event: string, handler: (data: any) => void): void;
}

/**
 * Service with validation
 */
export interface IValidatingService<T> {
  /**
   * Validate data before creation
   */
  validateCreate(data: any): Promise<ValidationResult>;

  /**
   * Validate data before update
   */
  validateUpdate(id: string, data: any): Promise<ValidationResult>;

  /**
   * Validate data before deletion
   */
  validateDelete(id: string): Promise<ValidationResult>;
}

/**
 * Service with audit logging
 */
export interface IAuditableService {
  /**
   * Log an action
   */
  logAction(userId: string, action: string, resourceId: string, metadata?: any): Promise<void>;

  /**
   * Get audit logs for an entity
   */
  getAuditLogs(resourceId: string, params?: PaginationParams): Promise<PaginatedResult<any>>;
}

/**
 * Generic result interfaces
 */
export interface ImportResult<T> {
  success: boolean;
  imported: number;
  failed: number;
  errors: Array<{
    row: number;
    field?: string;
    error: string;
    data?: any;
  }>;
  data?: T[];
}

export interface ValidationResult {
  valid: boolean;
  errors: Array<{
    field: string;
    message: string;
    value?: any;
  }>;
  warnings?: Array<{
    field: string;
    message: string;
    value?: any;
  }>;
}

export interface BulkOperationResult<T> {
  success: number;
  failed: number;
  errors: Array<{
    index: number;
    data?: any;
    error: string;
  }>;
  results?: T[];
}

/**
 * Service factory interface
 */
export interface IServiceFactory {
  /**
   * Get service instance by name
   */
  getService<T>(name: string): T;

  /**
   * Register a service
   */
  registerService(name: string, service: any): void;
}

/**
 * Service lifecycle hooks
 */
export interface ILifecycleService {
  /**
   * Called before service initialization
   */
  onBeforeInit(): Promise<void>;

  /**
   * Called after service initialization
   */
  onAfterInit(): Promise<void>;

  /**
   * Called before service shutdown
   */
  onBeforeShutdown(): Promise<void>;

  /**
   * Called after service shutdown
   */
  onAfterShutdown(): Promise<void>;
}

/**
 * Health check service interface
 */
export interface IHealthCheckService {
  /**
   * Check service health
   */
  checkHealth(): Promise<{
    status: 'healthy' | 'unhealthy' | 'degraded';
    details: Record<string, any>;
    timestamp: Date;
  }>;
}

/**
 * Service configuration interface
 */
export interface IServiceConfig {
  /**
   * Service name
   */
  name: string;

  /**
   * Service version
   */
  version?: string;

  /**
   * Whether service is enabled
   */
  enabled: boolean;

  /**
   * Service dependencies
   */
  dependencies?: string[];

  /**
   * Service configuration options
   */
  options?: Record<string, any>;
}

export default interface IService<T = any> {
  // Core operations
  create(data: any): Promise<T>;
  update(id: string, data: any): Promise<T>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<T | null>;
  findAll(params?: any): Promise<T[]>;

  // Query operations
  findOne(filter: any): Promise<T | null>;
  findMany(filter: any, options?: any): Promise<T[]>;
  count(filter?: any): Promise<number>;
  exists(filter: any): Promise<boolean>;

  // Aggregation operations
  aggregate(pipeline: any[]): Promise<any[]>;
  groupBy(field: string, filter?: any): Promise<Record<string, any>>;

  // Transaction operations
  startTransaction(): Promise<any>;
  commitTransaction(transaction: any): Promise<void>;
  rollbackTransaction(transaction: any): Promise<void>;

  // Cache operations
  getCache(key: string): Promise<any | null>;
  setCache(key: string, value: any, ttl?: number): Promise<void>;
  clearCache(pattern?: string): Promise<void>;

  // Validation operations
  validate(data: any, context?: string): Promise<ValidationResult>;

  // Event operations
  emit(event: string, payload: any): void;
  on(event: string, handler: (payload: any) => void): void;

  // Lifecycle operations
  initialize(): Promise<void>;
  shutdown(): Promise<void>;

  // Health operations
  healthCheck(): Promise<{ status: string; details: any }>;

  // Audit operations
  log(userId: string, action: string, details?: any): Promise<void>;
  getLogs(resourceId?: string, params?: any): Promise<PaginatedResult<any>>;
}