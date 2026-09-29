// src/services/setting.service.ts
import prisma from '../../prisma/client';
import { ApiError } from '../utils/ApiError';
import { logger } from '../config/logger';

/* ============================================================
 *  TYPES
 * ============================================================ */
export interface NavbarSettings {
  logoUrl: string;
  logoAlt: string;
  brandPrimary: string;
  brandSecondary: string;
  navItems: { label: string; href: string }[];
  showThemeToggle: boolean;
  showNotifications: boolean;
  showAuthButtons: boolean;
  ctaLabel: string;
  ctaHref: string;
}

export interface FooterColumn {
  title: string;
  links: { label: string; href: string }[];
}

export interface FooterSettings {
  brandPrimary: string;
  brandSecondary: string;
  description: string;
  social: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
  };
  columns: FooterColumn[];
  contact: { email?: string; phone?: string; address?: string };
  copyright: string;
}

export interface GeneralSettings {
  siteName: string;
  siteUrl: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
}

export interface SecuritySettings {
  sessionTimeout: number;
  maxLoginAttempts: number;
  passwordMinLength: number;
  twoFactorAuth: boolean;
  sslRequired: boolean;
  sessionIpCheck: boolean;
}

export interface EmailSettings {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  smtpSecure: boolean;
  fromEmail: string;
  fromName: string;
  replyTo: string;
}

export interface BackupSettings {
  autoBackup: boolean;
  backupFrequency: number;
  backupRetention: number;
  backupStorage: string;
}

export interface PublicPrefsSettings {
  allowPublicRegistration: boolean;
  showStatsOnHome: boolean;
  defaultLanguage: string;
}

/** Groupes toujours publics */
const PUBLIC_GROUPS = ['public', 'general', 'navbar', 'footer'] as const;

/** Whitelist globale pour updateGroup */
export const ALLOWED_GROUPS = [
  'general',
  'security',
  'email',
  'backup',
  'public',
  'navbar',
  'footer',
] as const;
export type AllowedGroup = (typeof ALLOWED_GROUPS)[number];

/* ============================================================
 *  SERVICE
 * ============================================================ */
export class SettingService {
  private defaultSettings = {
    general: {
      siteName: 'Youth Computing',
      siteUrl: 'https://youthcomputing.mg',
      siteDescription: 'Association pour la promotion des NTIC à Madagascar',
      contactEmail: 'contact@youthcomputing.mg',
      contactPhone: '+261 34 00 000 00',
      address: 'Antananarivo, Madagascar',
      maintenanceMode: false,
      allowRegistration: true,
    } as GeneralSettings,

    security: {
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      passwordMinLength: 8,
      twoFactorAuth: false,
      sslRequired: true,
      sessionIpCheck: true,
    } as SecuritySettings,

    email: {
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUser: 'contact@youthcomputing.mg',
      smtpPassword: '',
      smtpSecure: true,
      fromEmail: 'contact@youthcomputing.mg',
      fromName: 'Youth Computing',
      replyTo: 'contact@youthcomputing.mg',
    } as EmailSettings,

    backup: {
      autoBackup: true,
      backupFrequency: 24,
      backupRetention: 30,
      backupStorage: '/backups/youthcomputing/',
    } as BackupSettings,

    public: {
      allowPublicRegistration: true,
      showStatsOnHome: true,
      defaultLanguage: 'fr',
    } as PublicPrefsSettings,

    navbar: {
      logoUrl: '/images/Youth Computing.png',
      logoAlt: 'Youth Computing',
      brandPrimary: 'Youth',
      brandSecondary: 'Computing',
      navItems: [
        { label: 'Accueil', href: '/' },
        { label: 'À propos', href: '/a-propos' },
        { label: 'Recrutement', href: '/recrutements' },
        { label: 'Partenaires', href: '/partenaires' },
      ],
      showThemeToggle: true,
      showNotifications: true,
      showAuthButtons: true,
      ctaLabel: "S'inscrire",
      ctaHref: '/inscription',
    } as NavbarSettings,

    footer: {
      brandPrimary: 'Youth',
      brandSecondary: 'Computing',
      description: 'Association pour la promotion des NTIC à Madagascar.',
      social: { facebook: '', instagram: '', linkedin: '', twitter: '' },
      columns: [
        {
          title: 'Youth Computing',
          links: [
            { label: 'À propos', href: '/a-propos' },
            { label: 'Contact', href: '/contact' },
          ],
        },
        {
          title: 'Services',
          links: [
            { label: 'Formations', href: '/services/formations' },
            { label: 'Événements', href: '/services/evenements' },
          ],
        },
      ],
      contact: {
        email: 'contact@youthcomputing.mg',
        phone: '+261 34 00 000 00',
        address: 'Antananarivo, Madagascar',
      },
      copyright: '',
    } as FooterSettings,
  };

  /* ============================================================
   *  INITIALISATION
   * ============================================================ */
  async initializeSettings(): Promise<void> {
    try {
      const count = await prisma.setting.count();
      if (count === 0) {
        logger.info('🔧 Initialisation des paramètres par défaut...');
        await this.seedAllGroups();
        logger.info('✅ Paramètres initialisés');
        return;
      }

      // S'assurer que chaque groupe existe (au cas où un nouveau groupe a été ajouté)
      for (const [group, value] of Object.entries(this.defaultSettings)) {
        const exists = await prisma.setting.findUnique({
          where: { key: group },
        });
        if (!exists) {
          logger.info(`🔧 Ajout du groupe manquant : ${group}`);
          await this.writeGroup(group, value);
        }
      }
    } catch (error) {
      logger.error("❌ Erreur lors de l'initialisation des paramètres:", error);
    }
  }

  private async seedAllGroups(): Promise<void> {
    for (const [group, value] of Object.entries(this.defaultSettings)) {
      await this.writeGroup(group, value);
    }
  }

  /** Écrit un groupe entier en une seule ligne JSON */
  private async writeGroup(group: string, value: any): Promise<void> {
    const isPublic = (PUBLIC_GROUPS as readonly string[]).includes(group);
    await prisma.setting.upsert({
      where: { key: group },
      update: { value, isPublic },
      create: {
        key: group,
        group,
        value,
        label: this.getLabel(group),
        description: this.getDescription(group),
        isPublic,
      },
    });
  }

  /* ============================================================
   *  LECTURE — ADMIN (tout)
   * ============================================================ */
  async getAllSettings(): Promise<Record<string, any>> {
    const rows = await prisma.setting.findMany();
    const result: Record<string, any> = {};

    // 1) On part des valeurs par défaut
    for (const [group, value] of Object.entries(this.defaultSettings)) {
      result[group] = this.clone(value);
    }

    // 2) On écrase avec ce qui est en BDD
    for (const row of rows) {
      const group = row.group || row.key;
      const stored = (row.value ?? {}) as any;

      if (result[group] && this.isPlainObject(result[group])) {
        result[group] = this.deepMerge(result[group], stored);
      } else {
        result[group] = stored;
      }
    }

    return result;
  }

  /* ============================================================
   *  LECTURE — UN GROUPE
   * ============================================================ */
  async getGroup(group: string): Promise<Record<string, any>> {
    const defaults = (this.defaultSettings as any)[group] ?? {};
    const row = await prisma.setting.findUnique({ where: { key: group } });

    if (!row) return this.clone(defaults);

    const stored = (row.value ?? {}) as any;
    if (this.isPlainObject(defaults) && this.isPlainObject(stored)) {
      return this.deepMerge(defaults, stored);
    }
    return stored;
  }

  /* ============================================================
   *  LECTURE — PUBLIC
   *  Renvoie { general, public, navbar, footer } toujours complet
   * ============================================================ */
  async getPublicSettings(): Promise<Record<string, any>> {
    const result: Record<string, any> = {};

    // 1) Défauts pour TOUS les groupes publics
    for (const group of PUBLIC_GROUPS) {
      result[group] = this.clone((this.defaultSettings as any)[group] ?? {});
    }

    // 2) Écrasement par ce qui est marqué public en BDD
    const rows = await prisma.setting.findMany({
      where: { isPublic: true },
    });

    for (const row of rows) {
      const group = row.group || row.key;
      if (!(PUBLIC_GROUPS as readonly string[]).includes(group)) continue;

      const stored = (row.value ?? {}) as any;
      if (this.isPlainObject(result[group]) && this.isPlainObject(stored)) {
        result[group] = this.deepMerge(result[group], stored);
      } else {
        result[group] = stored;
      }
    }

    return result;
  }

  /* ============================================================
   *  MISE À JOUR — UN GROUPE ENTIER
   * ============================================================ */
  async updateGroup(group: string, data: any): Promise<void> {
    if (!(ALLOWED_GROUPS as readonly string[]).includes(group)) {
      throw ApiError.badRequest(
        `Groupe "${group}" non autorisé. Autorisés : ${ALLOWED_GROUPS.join(', ')}`
      );
    }

    // 1) Charger l'existant (BDD ou défaut)
    const existing = await prisma.setting.findUnique({ where: { key: group } });
    const defaults = (this.defaultSettings as any)[group] ?? {};
    const current = existing
      ? this.isPlainObject(existing.value)
        ? (existing.value as any)
        : {}
      : {};

    // 2) Merge profond : defaults ⊕ current ⊕ incoming
    const merged = this.deepMerge(defaults, current, data);

    // 3) Persistance en une seule ligne
    const isPublic = (PUBLIC_GROUPS as readonly string[]).includes(group);
    await prisma.setting.upsert({
      where: { key: group },
      update: { value: merged, isPublic },
      create: {
        key: group,
        group,
        value: merged,
        label: this.getLabel(group),
        description: this.getDescription(group),
        isPublic,
      },
    });

    logger.info(`💾 Settings "${group}" mis à jour`);
  }

  /* ============================================================
   *  LECTURE PAR CLÉ (ex: 'general.siteName')
   * ============================================================ */
  async getSetting(key: string, requireAuth = false): Promise<any> {
    // Si c'est un groupe entier
    if ((ALLOWED_GROUPS as readonly string[]).includes(key)) {
      return this.getGroup(key);
    }

    // Sinon : groupe.sousClé
    const [group, ...rest] = key.split('.');
    const subPath = rest.join('.');

    const row = await prisma.setting.findUnique({ where: { key: group } });
    const source = row?.value ?? (this.defaultSettings as any)[group] ?? {};

    if (requireAuth && row && !row.isPublic) {
      throw ApiError.unauthorized('Accès non autorisé');
    }

    const value = subPath
      ? this.getNestedValue(source, subPath)
      : source;

    if (value === undefined) {
      throw ApiError.notFound(`Paramètre ${key} introuvable`);
    }
    return value;
  }

  /* ============================================================
   *  RESET
   * ============================================================ */
  async resetSettings(): Promise<void> {
    await prisma.setting.deleteMany();
    await this.seedAllGroups();
  }

  /* ============================================================
   *  HELPERS
   * ============================================================ */
  private isPlainObject(v: any): boolean {
    return !!v && typeof v === 'object' && !Array.isArray(v);
  }

  private clone<T>(v: T): T {
    return JSON.parse(JSON.stringify(v));
  }

  /** Merge profond récursif : les objets fusionnent, les tableaux/prim. écrasent */
  private deepMerge(...objs: any[]): any {
    const out: any = {};
    for (const obj of objs) {
      if (!this.isPlainObject(obj)) continue;
      for (const [k, v] of Object.entries(obj)) {
        if (v === undefined) continue;
        if (this.isPlainObject(v) && this.isPlainObject(out[k])) {
          out[k] = this.deepMerge(out[k], v);
        } else {
          out[k] = Array.isArray(v) ? [...v] : v;
        }
      }
    }
    return out;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((prev, curr) => prev?.[curr], obj);
  }

  private getLabel(key: string): string {
    const labels: Record<string, string> = {
      general: 'Paramètres généraux',
      security: 'Sécurité',
      email: 'Email / SMTP',
      backup: 'Sauvegarde',
      public: 'Préférences publiques',
      navbar: 'Navigation (Navbar)',
      footer: 'Pied de page (Footer)',
    };
    return labels[key] || key;
  }

  private getDescription(key: string): string {
    const descriptions: Record<string, string> = {
      general: 'Informations générales du site',
      security: 'Paramètres de sécurité et sessions',
      email: 'Configuration SMTP pour l’envoi d’emails',
      backup: 'Sauvegardes automatiques de la base',
      public: 'Options publiques de la plateforme',
      navbar: 'Configuration de la barre de navigation',
      footer: 'Configuration du pied de page',
    };
    return descriptions[key] || '';
  }

  async getValue<T>(
    key: string,
    defaultValue?: T,
    requireAuth = false
  ): Promise<T> {
    try {
      const value = await this.getSetting(key, requireAuth);
      return value as T;
    } catch {
      return defaultValue as T;
    }
  }
}