// src/types/dto/setting.dto.ts
import { z } from 'zod';

// ─── Schémas de validation ──────────────────────────────────────

export const SettingSchema = z.object({
  key: z.string().min(1, 'La clé est requise'),
  value: z.any(),
  group: z.enum(['general', 'security', 'email', 'backup', 'public']),
  label: z.string().optional(),
  description: z.string().optional(),
  isPublic: z.boolean().default(false),
});

export const UpdateSettingSchema = z.object({
  value: z.any(),
});

export const SettingsGroupSchema = z.object({
  general: z.object({
    siteName: z.string().min(1, 'Le nom du site est requis'),
    siteUrl: z.string().url('URL invalide'),
    siteDescription: z.string().optional(),
    contactEmail: z.string().email('Email invalide'),
    contactPhone: z.string().optional(),
    address: z.string().optional(),
    maintenanceMode: z.boolean().default(false),
    allowRegistration: z.boolean().default(true),
  }),
  security: z.object({
    sessionTimeout: z.number().min(5).max(1440),
    maxLoginAttempts: z.number().min(1).max(20),
    passwordMinLength: z.number().min(6).max(32),
    twoFactorAuth: z.boolean().default(false),
    sslRequired: z.boolean().default(true),
    sessionIpCheck: z.boolean().default(true),
  }),
  email: z.object({
    smtpHost: z.string().min(1),
    smtpPort: z.number().min(1).max(65535),
    smtpUser: z.string().min(1),
    smtpPassword: z.string().min(1),
    smtpSecure: z.boolean().default(true),
    fromEmail: z.string().email('Email invalide'),
    fromName: z.string().min(1),
    replyTo: z.string().email('Email invalide').optional(),
  }),
  backup: z.object({
    autoBackup: z.boolean().default(true),
    backupFrequency: z.number().min(1).max(168),
    backupRetention: z.number().min(1).max(365),
    backupStorage: z.string().min(1),
  }),
  public: z.object({
    allowPublicRegistration: z.boolean().default(true),
    showStatsOnHome: z.boolean().default(true),
    defaultLanguage: z.string().default('fr'),
  }),
});

export type Setting = z.infer<typeof SettingSchema>;
export type UpdateSetting = z.infer<typeof UpdateSettingSchema>;
export type SettingsGroup = z.infer<typeof SettingsGroupSchema>;