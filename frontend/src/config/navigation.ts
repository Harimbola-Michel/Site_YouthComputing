// src/config/navigation.ts
import {
  Home,
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  Mail,
  LayoutDashboard,
  FileText,
  Calendar,
  CreditCard,
  Settings,
  UserCog,
  MessageSquare,
  Briefcase,
  FolderOpen,
  Megaphone,
  Upload,
  Bell,
  LogOut,
  UserPlus,
} from 'lucide-react';
import { ROUTES } from '@/constants/routes';

// ─── Types ──────────────────────────────────────────────────

export interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}

export interface AdminNavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
  children?: AdminNavItem[];
}

// ─── Menus ──────────────────────────────────────────────────

export const guestNavigation: NavItem[] = [
  { href: ROUTES.HOME, label: 'Accueil', icon: Home, exact: true },
  { href: ROUTES.ABOUT, label: 'À propos', icon: Users },
  { href: ROUTES.FORMATIONS, label: 'Formations', icon: GraduationCap },
  { href: ROUTES.BLOG, label: 'Blog', icon: BookOpen },
  { href: ROUTES.CONTACT, label: 'Contact', icon: Mail },
];

export const authenticatedNavigation: NavItem[] = [
  { href: ROUTES.Y2C, label: 'Communauté Y2C', icon: Users },
  { href: ROUTES.PROJECTS, label: 'Projets', icon: Building2 },
 // { href: ROUTES.PARTNERS, label: 'Partenaires', icon: Building2 },
 // { href: ROUTES.RECRUITMENTS, label: 'Recrutements', icon: Briefcase },
 // { href: ROUTES.CANDIDATURES, label: 'Candidatures', icon: UserPlus },
];

export const publicNavigation: NavItem[] = [
  ...guestNavigation,
  ...authenticatedNavigation,
];

// ─── Administration ──────────────────────────────────────────

export const adminNavigation: AdminNavItem[] = [
  {
    href: ROUTES.ADMIN_DASHBOARD,
    label: 'Tableau de bord',
    icon: LayoutDashboard,
    roles: ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'CONTRIBUTOR'],
  },
  {
    href: '#',
    label: 'Contenu',
    icon: FileText,
    roles: ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'CONTRIBUTOR'],
    children: [
      { href: ROUTES.ADMIN_FORMATIONS, label: 'Formations', icon: GraduationCap, roles: ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'CONTRIBUTOR'] },
      { href: ROUTES.ADMIN_ARTICLES, label: 'Articles', icon: BookOpen, roles: ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'CONTRIBUTOR'] },
      { href: ROUTES.ADMIN_PROJECTS, label: 'Projets', icon: FolderOpen, roles: ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'CONTRIBUTOR'] },
    ],
  },
  {
    href: '#',
    label: 'Équipe',
    icon: Users,
    roles: ['SUPER_ADMIN', 'ADMIN'],
    children: [
      { href: ROUTES.ADMIN_TEAM, label: 'Tous les membres', icon: Users, roles: ['SUPER_ADMIN', 'ADMIN'] },
      { href: ROUTES.ADMIN_TEAM_STATS, label: 'Statistiques', icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'ADMIN'] },
    ],
  },
  {
    href: '#',
    label: 'Gestion',
    icon: UserCog,
    roles: ['SUPER_ADMIN', 'ADMIN'],
    children: [
      { href: ROUTES.ADMIN_REGISTRATIONS, label: 'Inscriptions', icon: FileText, roles: ['SUPER_ADMIN', 'ADMIN'] },
      { href: ROUTES.ADMIN_Y2C_MEMBERS, label: 'Membres Y2C', icon: Users, roles: ['SUPER_ADMIN', 'ADMIN'] },
      { href: ROUTES.ADMIN_Y2C_EVENTS, label: 'Événements Y2C', icon: Calendar, roles: ['SUPER_ADMIN', 'ADMIN'] },
      { href: ROUTES.ADMIN_USERS, label: 'Utilisateurs', icon: UserCog, roles: ['SUPER_ADMIN', 'ADMIN'] },
      { href: ROUTES.ADMIN_PARTNERS, label: 'Partenaires', icon: Building2, roles: ['SUPER_ADMIN', 'ADMIN'] },
    ],
  },
  {
    href: '#',
    label: 'RH',
    icon: Briefcase,
    roles: ['SUPER_ADMIN', 'ADMIN'],
    children: [
      { href: ROUTES.ADMIN_RECRUITMENTS, label: 'Recrutements', icon: Megaphone, roles: ['SUPER_ADMIN', 'ADMIN'] },
      { href: ROUTES.ADMIN_CANDIDATURES, label: 'Candidatures', icon: UserPlus, roles: ['SUPER_ADMIN', 'ADMIN'] },
    ],
  },
  { href: ROUTES.ADMIN_MESSAGES, label: 'Messages', icon: MessageSquare, roles: ['SUPER_ADMIN', 'ADMIN'] },
  { href: ROUTES.ADMIN_PAYMENTS, label: 'Paiements', icon: CreditCard, roles: ['SUPER_ADMIN', 'ADMIN'] },
  { href: ROUTES.ADMIN_EXPORTS, label: 'Exports', icon: Upload, roles: ['SUPER_ADMIN', 'ADMIN'] },
  { href: ROUTES.ADMIN_SETTINGS, label: 'Paramètres', icon: Settings, roles: ['SUPER_ADMIN'] },
];

// ─── Helpers ──────────────────────────────────────────────────

export const getAdminNavByRole = (role: string): AdminNavItem[] => {
  return adminNavigation
    .map((item) => {
      if (item.roles && !item.roles.includes(role)) return null;
      if (item.children) {
        const filteredChildren = item.children.filter(
          (child) => !child.roles || child.roles.includes(role)
        );
        if (filteredChildren.length === 0) return null;
        return { ...item, children: filteredChildren };
      }
      return item;
    })
    .filter(Boolean) as AdminNavItem[];
};

// ✅ Ajout de isActiveRoute (manquant)
export const isActiveRoute = (pathname: string, href: string, exact: boolean = false): boolean => {
  if (exact) return pathname === href;
  return pathname.startsWith(href) && href !== '/';
};

// ─── Footer Navigation ──────────────────────────────────────

export const footerNavigation = {
  company: [
    { href: ROUTES.ABOUT, label: 'À propos' },
    { href: ROUTES.CONTACT, label: 'Contact' },
    { href: '/mentions-legales', label: 'Mentions légales' },
    { href: '/politique-confidentialite', label: 'Politique de confidentialité' },
    { href: '/cookies', label: 'Cookies' },
  ],
  services: [
    { href: ROUTES.FORMATIONS, label: 'Formations' },
    { href: ROUTES.Y2C, label: 'Communauté Y2C' },
    { href: ROUTES.PROJECTS, label: 'Projets' },
    { href: ROUTES.BLOG, label: 'Blog' },
  ],
  social: [
    { href: 'https://facebook.com/youthcomputing', label: 'Facebook', icon: 'facebook' },
    { href: 'https://instagram.com/youthcomputing', label: 'Instagram', icon: 'instagram' },
    { href: 'https://linkedin.com/company/youthcomputing', label: 'LinkedIn', icon: 'linkedin' },
    { href: 'https://twitter.com/youthcomputing', label: 'Twitter', icon: 'twitter' },
    { href: 'https://wa.me/261341234567', label: 'WhatsApp', icon: 'whatsapp' },
    { href: 'https://youtube.com/@youthcomputing', label: 'YouTube', icon: 'youtube' },
  ],
};

export default {
  public: publicNavigation,
  admin: adminNavigation,
  getAdminNavByRole,
  isActiveRoute,
  footerNavigation,
};