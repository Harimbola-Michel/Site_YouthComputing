// src/controllers/setting.controller.ts
import { Request, Response, NextFunction } from 'express';
import { BaseController } from './base.controller';
import { SettingService, ALLOWED_GROUPS } from '../services/setting.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { ApiError } from '../utils/ApiError';
import prisma from '../../prisma/client';

export class SettingController extends BaseController {
  private settingService: SettingService;

  constructor() {
    super();
    this.settingService = new SettingService();
    this.settingService.initializeSettings().catch(console.error);
  }

  getAll = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      this.sendSuccess(res, await this.settingService.getAllSettings());
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getPublic = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      this.sendSuccess(res, await this.settingService.getPublicSettings());
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getGroup = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { group } = req.params;
      this.sendSuccess(res, await this.settingService.getGroup(group));
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getByKey = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { key } = req.params;
      const value = await this.settingService.getSetting(key, true);
      this.sendSuccess(res, { key, value });
    } catch (error) {
      this.handleError(next, error);
    }
  };

  updateGroup = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { group } = req.params;

      if (!(ALLOWED_GROUPS as readonly string[]).includes(group)) {
        throw ApiError.badRequest(
          `Groupe "${group}" non autorisé. Autorisés : ${ALLOWED_GROUPS.join(', ')}`
        );
      }

      const data = req.body;
      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw ApiError.badRequest('Payload invalide : objet attendu');
      }

      await this.settingService.updateGroup(group, data);
      this.sendUpdated(res, { group, message: 'Paramètres mis à jour' });
    } catch (error) {
      this.handleError(next, error);
    }
  };

  updateSingle = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { key } = req.params;
      const { value } = req.body;
      if (value === undefined) throw ApiError.badRequest('La valeur est requise');

      // key = 'group.subkey' ou 'group'
      const [group] = key.split('.');
      const isPublic = ['public', 'general', 'navbar', 'footer'].includes(group);

      // Upsert sur le groupe entier
      const existing = await prisma.setting.findUnique({ where: { key: group } });
      const current = (existing?.value as any) ?? {};

      // Si 'group.subkey' → patch de la sous-clé ; sinon remplace tout
      const subKey = key.split('.').slice(1).join('.');
      const nextValue = subKey
        ? this.setNestedValue(current, subKey, value)
        : value;

      await prisma.setting.upsert({
        where: { key: group },
        update: { value: nextValue, isPublic },
        create: {
          key: group,
          group,
          value: nextValue,
          label: group,
          isPublic,
        },
      });

      this.sendUpdated(res, { key, value });
    } catch (error) {
      this.handleError(next, error);
    }
  };

  reset = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.settingService.resetSettings();
      this.sendSuccess(res, { message: 'Paramètres réinitialisés' });
    } catch (error) {
      this.handleError(next, error);
    }
  };

  private setNestedValue(obj: any, path: string, value: any): any {
    const clone = JSON.parse(JSON.stringify(obj ?? {}));
    const parts = path.split('.');
    let cur = clone;
    for (let i = 0; i < parts.length - 1; i++) {
      const p = parts[i];
      if (!cur[p] || typeof cur[p] !== 'object') cur[p] = {};
      cur = cur[p];
    }
    cur[parts[parts.length - 1]] = value;
    return clone;
  }
}