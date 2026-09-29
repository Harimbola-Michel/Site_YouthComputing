import { Request, Response, NextFunction } from 'express';
import { BaseController } from './base.controller';
import { TeamMemberService } from '../services/teamMember.service';

export class TeamMemberController extends BaseController {
  private teamMemberService: TeamMemberService;

  constructor() {
    super();
    this.teamMemberService = new TeamMemberService();
  }

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pagination = this.getPaginationParams(req);
      const members = await this.teamMemberService.findAll(pagination);
      this.sendSuccess(res, members);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const member = await this.teamMemberService.findById(id);
      this.sendSuccess(res, member);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const member = await this.teamMemberService.create(req.body);
      this.sendCreated(res, member);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const member = await this.teamMemberService.update(id, req.body);
      this.sendUpdated(res, member);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.teamMemberService.delete(id);
      this.sendDeleted(res, null);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getActive = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const members = await this.teamMemberService.getActiveMembers();
      this.sendSuccess(res, members);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getByDepartment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { department } = req.params;
      const members = await this.teamMemberService.getByDepartment(department);
      this.sendSuccess(res, members);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  reorder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { memberIds } = req.body;
      await this.teamMemberService.reorder(memberIds);
      this.sendSuccess(res, null, 'Members reordered successfully');
    } catch (error) {
      this.handleError(next, error);
    }
  };

  toggleActive = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const member = await this.teamMemberService.toggleActive(id);
      this.sendUpdated(res, member);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.teamMemberService.getStats();
      this.sendSuccess(res, stats);
    } catch (error) {
      this.handleError(next, error);
    }
  };
}