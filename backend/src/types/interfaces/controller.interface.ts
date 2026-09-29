import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../express.d';

/**
 * Base controller interface
 */
export interface IBaseController {
  /**
   * Get all entities
   */
  getAll(req: Request, res: Response, next: NextFunction): Promise<void>;

  /**
   * Get entity by ID
   */
  getById(req: Request, res: Response, next: NextFunction): Promise<void>;

  /**
   * Create a new entity
   */
  create(req: Request, res: Response, next: NextFunction): Promise<void>;

  /**
   * Update an entity
   */
  update(req: Request, res: Response, next: NextFunction): Promise<void>;

  /**
   * Delete an entity
   */
  delete(req: Request, res: Response, next: NextFunction): Promise<void>;
}

/**
 * Controller with pagination support
 */
export interface IPaginatedController<T> extends IBaseController {
  /**
   * Get paginated entities
   */
  getPaginated(req: Request, res: Response, next: NextFunction): Promise<void>;
}

/**
 * Controller with search support
 */
export interface ISearchableController<T> extends IBaseController {
  /**
   * Search entities
   */
  search(req: Request, res: Response, next: NextFunction): Promise<void>;

  /**
   * Advanced search with filters
   */
  advancedSearch(req: Request, res: Response, next: NextFunction): Promise<void>;
}

/**
 * Controller with export support
 */
export interface IExportableController<T> {
  /**
   * Export data
   */
  export(req: Request, res: Response, next: NextFunction): Promise<void>;

  /**
   * Get export template
   */
  getExportTemplate(req: Request, res: Response, next: NextFunction): Promise<void>;
}

/**
 * Controller with import support
 */
export interface IImportableController<T> {
  /**
   * Import data
   */
  import(req: Request, res: Response, next: NextFunction): Promise<void>;

  /**
   * Validate import
   */
  validateImport(req: Request, res: Response, next: NextFunction): Promise<void>;
}

/**
 * Controller with bulk operations
 */
export interface IBulkOperationController<T> {
  /**
   * Bulk create
   */
  bulkCreate(req: Request, res: Response, next: NextFunction): Promise<void>;

  /**
   * Bulk update
   */
  bulkUpdate(req: Request, res: Response, next: NextFunction): Promise<void>;

  /**
   * Bulk delete
   */
  bulkDelete(req: Request, res: Response, next: NextFunction): Promise<void>;
}

/**
 * Controller with statistics
 */
export interface IStatsController {
  /**
   * Get statistics
   */
  getStats(req: Request, res: Response, next: NextFunction): Promise<void>;

  /**
   * Get dashboard data
   */
  getDashboard(req: Request, res: Response, next: NextFunction): Promise<void>;
}

/**
 * Controller with file upload
 */
export interface IFileUploadController {
  /**
   * Upload single file
   */
  uploadFile(req: Request, res: Response, next: NextFunction): Promise<void>;

  /**
   * Upload multiple files
   */
  uploadFiles(req: Request, res: Response, next: NextFunction): Promise<void>;

  /**
   * Delete file
   */
  deleteFile(req: Request, res: Response, next: NextFunction): Promise<void>;
}

/**
 * Controller with audit
 */
export interface IAuditableController {
  /**
   * Get audit logs
   */
  getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void>;
}

/**
 * Controller with notification
 */
export interface INotificationController {
  /**
   * Send notification
   */
  sendNotification(req: Request, res: Response, next: NextFunction): Promise<void>;

  /**
   * Get notifications
   */
  getNotifications(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;

  /**
   * Mark notification as read
   */
  markAsRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;

  /**
   * Mark all as read
   */
  markAllAsRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}

/**
 * Controller with settings
 */
export interface ISettingsController {
  /**
   * Get settings
   */
  getSettings(req: Request, res: Response, next: NextFunction): Promise<void>;

  /**
   * Update settings
   */
  updateSettings(req: Request, res: Response, next: NextFunction): Promise<void>;
}

/**
 * Main controller interface
 */
export interface IController<T = any> {
  // Core CRUD
  create(req: Request, res: Response, next: NextFunction): Promise<void>;
  update(req: Request, res: Response, next: NextFunction): Promise<void>;
  delete(req: Request, res: Response, next: NextFunction): Promise<void>;
  findById(req: Request, res: Response, next: NextFunction): Promise<void>;
  findAll(req: Request, res: Response, next: NextFunction): Promise<void>;

  // Pagination
  findPaginated(req: Request, res: Response, next: NextFunction): Promise<void>;

  // Search
  search(req: Request, res: Response, next: NextFunction): Promise<void>;
  filter(req: Request, res: Response, next: NextFunction): Promise<void>;

  // Export
  export(req: Request, res: Response, next: NextFunction): Promise<void>;

  // Statistics
  stats(req: Request, res: Response, next: NextFunction): Promise<void>;

  // Bulk operations
  bulkCreate(req: Request, res: Response, next: NextFunction): Promise<void>;
  bulkUpdate(req: Request, res: Response, next: NextFunction): Promise<void>;
  bulkDelete(req: Request, res: Response, next: NextFunction): Promise<void>;

  // File upload
  upload(req: Request, res: Response, next: NextFunction): Promise<void>;

  // Audit
  getLogs(req: Request, res: Response, next: NextFunction): Promise<void>;

  // Lifecycle
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
}

/**
 * Controller response handlers
 */
export interface IControllerResponse {
  /**
   * Send success response
   */
  success(data: any, message?: string, statusCode?: number): void;

  /**
   * Send created response
   */
  created(data: any, message?: string): void;

  /**
   * Send updated response
   */
  updated(data: any, message?: string): void;

  /**
   * Send deleted response
   */
  deleted(message?: string): void;

  /**
   * Send paginated response
   */
  paginated(data: any[], total: number, page: number, limit: number): void;

  /**
   * Send error response
   */
  error(message: string, statusCode?: number, details?: any): void;

  /**
   * Send validation error
   */
  validationError(errors: any[]): void;

  /**
   * Send not found error
   */
  notFound(message?: string): void;

  /**
   * Send unauthorized error
   */
  unauthorized(message?: string): void;

  /**
   * Send forbidden error
   */
  forbidden(message?: string): void;
}

/**
 * Controller validator interface
 */
export interface IControllerValidator {
  /**
   * Validate create data
   */
  validateCreate(data: any): Promise<{ valid: boolean; errors: any[] }>;

  /**
   * Validate update data
   */
  validateUpdate(id: string, data: any): Promise<{ valid: boolean; errors: any[] }>;

  /**
   * Validate delete
   */
  validateDelete(id: string): Promise<{ valid: boolean; errors: any[] }>;

  /**
   * Validate search
   */
  validateSearch(params: any): Promise<{ valid: boolean; errors: any[] }>;
}

/**
 * Controller middleware interface
 */
export interface IControllerMiddleware {
  /**
   * Authentication middleware
   */
  authenticate(req: Request, res: Response, next: NextFunction): void;

  /**
   * Authorization middleware
   */
  authorize(roles: string[]): (req: Request, res: Response, next: NextFunction) => void;

  /**
   * Rate limiting middleware
   */
  rateLimit(windowMs: number, max: number): (req: Request, res: Response, next: NextFunction) => void;

  /**
   * Validation middleware
   */
  validate(schema: any): (req: Request, res: Response, next: NextFunction) => void;

  /**
   * Cache middleware
   */
  cache(ttl: number): (req: Request, res: Response, next: NextFunction) => void;

  /**
   * Logging middleware
   */
  log(req: Request, res: Response, next: NextFunction): void;
}

/**
 * Controller configuration
 */
export interface IControllerConfig {
  /**
   * Controller name
   */
  name: string;

  /**
   * Base path
   */
  path: string;

  /**
   * Middleware list
   */
  middleware?: Array<(req: Request, res: Response, next: NextFunction) => void>;

  /**
   * Route configuration
   */
  routes: {
    [key: string]: {
      method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
      path: string;
      handler: string;
      middleware?: Array<(req: Request, res: Response, next: NextFunction) => void>;
    };
  };

  /**
   * Enable/disable features
   */
  features?: {
    caching?: boolean;
    logging?: boolean;
    validation?: boolean;
    audit?: boolean;
  };

  /**
   * Rate limiting
   */
  rateLimit?: {
    enabled: boolean;
    windowMs: number;
    max: number;
  };

  /**
   * Cache configuration
   */
  cache?: {
    enabled: boolean;
    ttl: number;
  };
}

export default interface IController {
  // Core CRUD
  create(req: Request, res: Response, next: NextFunction): Promise<void>;
  update(req: Request, res: Response, next: NextFunction): Promise<void>;
  delete(req: Request, res: Response, next: NextFunction): Promise<void>;
  findById(req: Request, res: Response, next: NextFunction): Promise<void>;
  findAll(req: Request, res: Response, next: NextFunction): Promise<void>;

  // Pagination
  findPaginated(req: Request, res: Response, next: NextFunction): Promise<void>;

  // Search
  search(req: Request, res: Response, next: NextFunction): Promise<void>;
  filter(req: Request, res: Response, next: NextFunction): Promise<void>;

  // Export
  export(req: Request, res: Response, next: NextFunction): Promise<void>;

  // Statistics
  stats(req: Request, res: Response, next: NextFunction): Promise<void>;

  // Bulk operations
  bulkCreate(req: Request, res: Response, next: NextFunction): Promise<void>;
  bulkUpdate(req: Request, res: Response, next: NextFunction): Promise<void>;
  bulkDelete(req: Request, res: Response, next: NextFunction): Promise<void>;

  // File upload
  upload(req: Request, res: Response, next: NextFunction): Promise<void>;

  // Audit
  getLogs(req: Request, res: Response, next: NextFunction): Promise<void>;

  // Lifecycle
  initialize(): Promise<void>;
  shutdown(): Promise<void>;

  // Validation
  validate(data: any, context: string): Promise<{ valid: boolean; errors: any[] }>;

  // Authorization
  authorize(user: any, action: string, resource: any): Promise<boolean>;

  // Transform
  transform(data: any): any;
  transformMany(data: any[]): any[];
}