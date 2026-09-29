import { Request, Response, NextFunction } from 'express';
import { BaseController } from './base.controller';
import { EventService } from '../services/event.service';
import { AuthRequest } from '../middlewares/auth.middleware';
export class EventController extends BaseController {
  private eventService: EventService;

  constructor() {
    super();
    this.eventService = new EventService();
  }

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pagination = this.getPaginationParams(req);
      const events = await this.eventService.findAll(pagination);
      this.sendSuccess(res, events);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getPublished = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pagination = this.getPaginationParams(req);
      const events = await this.eventService.getPublishedEvents(pagination);
      this.sendSuccess(res, events);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getUpcoming = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const events = await this.eventService.getUpcomingEvents(limit);
      this.sendSuccess(res, events);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { slug } = req.params;
      const event = await this.eventService.getBySlug(slug);
      this.sendSuccess(res, event);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const event = await this.eventService.findById(id);
      this.sendSuccess(res, event);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const event = await this.eventService.create(req.body);
      this.sendCreated(res, event);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const event = await this.eventService.update(id, req.body);
      this.sendUpdated(res, event);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.eventService.delete(id);
      this.sendDeleted(res, null);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.eventService.getStats();
      this.sendSuccess(res, stats);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getByType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { type } = req.params;
      const events = await this.eventService.getEventsByType(type);
      this.sendSuccess(res, events);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  // ============ REGISTRATIONS ============
  registerForEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const registration = await this.eventService.registerForEvent(id, req.body);
      this.sendCreated(res, registration);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getEventRegistrations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const registrations = await this.eventService.getEventRegistrations(id);
      this.sendSuccess(res, registrations);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  confirmRegistration = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const registration = await this.eventService.confirmRegistration(id);
      this.sendUpdated(res, registration);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  cancelRegistration = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const registration = await this.eventService.cancelRegistration(id);
      this.sendUpdated(res, registration);
    } catch (error) {
      this.handleError(next, error);
    }
  };
}