import { Request, Response, NextFunction } from 'express';
import { BaseController } from './base.controller';
import { Y2CService } from '../services/y2c.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export class Y2CController extends BaseController {
  private y2cService: Y2CService;

  constructor() {
    super();
    this.y2cService = new Y2CService();
  }

  // ============ MEMBERS ============

  getMembers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pagination = this.getPaginationParams(req);
      const search = req.query.search as string;
      const members = await this.y2cService.findMembers({ ...pagination, search });
      this.sendSuccess(res, members);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const member = await this.y2cService.getMemberById(id);
      this.sendSuccess(res, member);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  createMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const member = await this.y2cService.createMember(req.body);
      this.sendCreated(res, member);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  updateMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const member = await this.y2cService.updateMember(id, req.body);
      this.sendUpdated(res, member);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  deleteMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.y2cService.deleteMember(id);
      this.sendDeleted(res, null);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  approveMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const member = await this.y2cService.approveMember(id);
      this.sendUpdated(res, member);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getMemberStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.y2cService.getMemberStats();
      this.sendSuccess(res, stats);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  // ============ BADGE GENERATION ============

  generateBadgeForMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const member = await this.y2cService.generateBadgeForMember(id);
      this.sendSuccess(res, member);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  generateBadges = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.y2cService.generateBadges();
      this.sendSuccess(res, result);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  // ============ EVENTS ============

  getEvents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pagination = this.getPaginationParams(req);
      const search = req.query.search as string;
      const events = await this.y2cService.findEvents({ ...pagination, search });
      this.sendSuccess(res, events);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const event = await this.y2cService.getEvent(id);
      this.sendSuccess(res, event);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  createEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const event = await this.y2cService.createEvent(req.body);
      this.sendCreated(res, event);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  updateEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const event = await this.y2cService.updateEvent(id, req.body);
      this.sendUpdated(res, event);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  deleteEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.y2cService.deleteEvent(id);
      this.sendDeleted(res, null);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getEventStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.y2cService.getEventStats();
      this.sendSuccess(res, stats);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  registerForEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const registration = await this.y2cService.registerForEvent(id, req.body);
      this.sendCreated(res, registration);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getEventRegistrations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const registrations = await this.y2cService.getEventRegistrations(id);
      this.sendSuccess(res, registrations);
    } catch (error) {
      this.handleError(next, error);
    }
  };
}