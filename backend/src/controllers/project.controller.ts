// backend/src/controllers/project.controller.ts
import { Request, Response, NextFunction } from 'express';
import { BaseController } from './base.controller';
import { ProjectService } from '../services/project.service';

export class ProjectController extends BaseController {
  private projectService: ProjectService;

  constructor() {
    super();
    this.projectService = new ProjectService();
  }

  // ✅ Utilise findPaginated
  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const search = req.query.search as string;

      let result;
      if (search) {
        const projects = await this.projectService.searchProjects(search);
        result = {
          data: projects,
          pagination: {
            page: 1,
            limit: projects.length,
            total: projects.length,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          },
        };
      } else {
        // ✅ Utilisation de la pagination
        result = await this.projectService.findAllPaginated(page, limit);
      }

      this.sendSuccess(res, result);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { slug } = req.params;
      const project = await this.projectService.getBySlug(slug);
      this.sendSuccess(res, project);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const project = await this.projectService.findById(id);
      this.sendSuccess(res, project);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const project = await this.projectService.create(req.body);
      this.sendCreated(res, project);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const project = await this.projectService.update(id, req.body);
      this.sendUpdated(res, project);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.projectService.delete(id);
      this.sendDeleted(res, null);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getFeatured = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const projects = await this.projectService.getFeatured();
      this.sendSuccess(res, projects);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getByCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { category } = req.params;
      const projects = await this.projectService.getByCategory(category);
      this.sendSuccess(res, projects);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getByYear = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { year } = req.params;
      const projects = await this.projectService.getByYear(parseInt(year));
      this.sendSuccess(res, projects);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.projectService.getStats();
      this.sendSuccess(res, stats);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getWithMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const project = await this.projectService.getProjectsWithMetrics(id);
      this.sendSuccess(res, project);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  // ============ METRICS ============
  addMetric = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { projectId } = req.params;
      const metric = await this.projectService.addMetric(projectId, req.body);
      this.sendCreated(res, metric);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  updateMetric = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const metric = await this.projectService.updateMetric(id, req.body);
      this.sendUpdated(res, metric);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  deleteMetric = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.projectService.deleteMetric(id);
      this.sendDeleted(res, null);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getProjectMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { projectId } = req.params;
      const metrics = await this.projectService.getProjectMetrics(projectId);
      this.sendSuccess(res, metrics);
    } catch (error) {
      this.handleError(next, error);
    }
  };
}