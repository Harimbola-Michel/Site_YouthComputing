// src/components/admin/AdminSidebar.tsx
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { adminNavigation, isActiveRoute } from '@/config/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// ─── Types ──────────────────────────────────────────────────────
export interface NavItem {
  id?: string; // identifiant unique (optionnel, sinon on utilise href)
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
  exact?: boolean;
  children?: NavItem[];
  badge?: string | number;
  section?: string;
}

interface AdminSidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

// ─── Composants internes ──────────────────────────────────────

const NavLinkItem = ({
  item,
  isActive,
  depth,
  collapsed,
}: {
  item: NavItem;
  isActive: boolean;
  depth: number;
  collapsed: boolean;
}) => {
  const Icon = item.icon;
  const linkContent = (
    <Link
      href={item.href === '#' ? '#' : item.href}
      className={cn(
        'relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
        isActive
          ? 'bg-secondary text-white shadow-sm'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        depth > 0 && 'pl-8',
        collapsed && 'h-10 w-10 justify-center px-0'
      )}
      aria-current={isActive ? 'page' : undefined}
      onClick={(e) => {
        if (item.href === '#') e.preventDefault();
      }}
    >
      <Icon className={cn('h-4 w-4 flex-shrink-0', collapsed && 'h-5 w-5')} />
      {!collapsed && (
        <>
          <span className="flex-1">{item.label}</span>
          {item.badge && (
            <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
              {item.badge}
            </Badge>
          )}
        </>
      )}
      {collapsed && item.badge && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-[8px] font-bold text-white">
          {item.badge}
        </span>
      )}
    </Link>
  );

  if (collapsed) {
    return (
      <TooltipProvider key={item.id || item.href}>
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
          <TooltipContent side="right">
            <p>{item.label}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return linkContent;
};

const NavSectionItem = ({
  item,
  isActive,
  isOpen,
  depth,
  collapsed,
  onToggle,
  children,
}: {
  item: NavItem;
  isActive: boolean;
  isOpen: boolean;
  depth: number;
  collapsed: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) => {
  const Icon = item.icon;

  if (collapsed) {
    return (
      <TooltipProvider key={item.id || item.href}>
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <button
              className={cn(
                'relative flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-secondary text-white shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
              onClick={onToggle}
              aria-expanded={isOpen}
            >
              <Icon className="h-5 w-5" />
              {item.badge && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-[8px] font-bold text-white">
                  {item.badge}
                </span>
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{item.label}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="space-y-0.5">
      <button
        onClick={onToggle}
        className={cn(
          'w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
          isActive
            ? 'bg-secondary text-white shadow-sm'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        )}
        aria-expanded={isOpen}
      >
        <Icon className="h-4 w-4 flex-shrink-0" />
        <span className="flex-1 text-left">{item.label}</span>
        {item.badge && (
          <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
            {item.badge}
          </Badge>
        )}
        <span className="ml-auto text-muted-foreground/50">
          {isOpen ? (
            <ChevronDown className="h-3 w-3 transition-transform duration-200" />
          ) : (
            <ChevronRight className="h-3 w-3 transition-transform duration-200" />
          )}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="ml-2 overflow-hidden border-l-2 border-border pl-2"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Composant principal ──────────────────────────────────────

export function AdminSidebar({ collapsed = false, onToggleCollapse }: AdminSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const userRole = user?.role || 'VIEWER';

  // Filtrer la navigation selon le rôle
  const filteredNav = useMemo(() => {
    const filterItems = (items: NavItem[]): NavItem[] => {
      return items
        .filter((item) => {
          if (!item.roles) return true;
          return item.roles.includes(userRole);
        })
        .map((item) => {
          if (item.children) {
            const filteredChildren = filterItems(item.children);
            return { ...item, children: filteredChildren };
          }
          return item;
        })
        .filter((item) => {
          if (item.children) {
            return item.children.length > 0;
          }
          return true;
        });
    };
    return filterItems(adminNavigation);
  }, [userRole]);

  // État d'ouverture des sous-menus (un seul ouvert à la fois pour un rendu professionnel)
  const [openSectionId, setOpenSectionId] = useState<string | null>(null);

  // Initialisation : ouvrir la section qui contient la page active
  useEffect(() => {
    const findActiveSection = (items: NavItem[], parentId?: string): string | null => {
      for (const item of items) {
        if (item.children) {
          const hasActiveChild = item.children.some((child) =>
            isActiveRoute(pathname, child.href, child.exact)
          );
          if (hasActiveChild) {
            return item.id || item.href;
          }
          // Parcours récursif
          const nested = findActiveSection(item.children, item.id || item.href);
          if (nested) return nested;
        }
      }
      return null;
    };
    const activeId = findActiveSection(filteredNav);
    if (activeId) {
      setOpenSectionId(activeId);
    } else {
      // Optionnel : ouvrir la première section par défaut ?
      // setOpenSectionId(null);
    }
  }, [pathname, filteredNav]);

  // Quand le menu est réduit, on ferme toutes les sections
  useEffect(() => {
    if (collapsed) {
      setOpenSectionId(null);
    }
  }, [collapsed]);

  // Basculer l'ouverture d'une section (ferme les autres)
  const toggleSection = useCallback((sectionId: string) => {
    setOpenSectionId((prev) => (prev === sectionId ? null : sectionId));
  }, []);

  // Rendu récursif
  const renderNavItem = useCallback(
    (item: NavItem, depth = 0): JSX.Element | null => {
      const isActive = isActiveRoute(pathname, item.href, item.exact);
      const hasChildren = !!(item.children && item.children.length > 0);
      const sectionId = item.id || item.href;
      const isOpen = openSectionId === sectionId;
      const key = item.id || `${item.href}-${item.label}`;

      // Groupe de section (titre)
      if (item.section && !collapsed) {
        return (
          <div key={key} className="mt-4 first:mt-0">
            <div className="px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              {item.section}
            </div>
            <div className="mt-1 space-y-0.5">
              {item.children?.map((child) => renderNavItem(child, depth))}
            </div>
          </div>
        );
      }

      // Élément avec sous-menu
      if (hasChildren) {
        return (
          <NavSectionItem
            key={key}
            item={item}
            isActive={isActive}
            isOpen={isOpen}
            depth={depth}
            collapsed={collapsed}
            onToggle={() => toggleSection(sectionId)}
          >
            {item.children!.map((child) => renderNavItem(child, depth + 1))}
          </NavSectionItem>
        );
      }

      // Élément simple (feuille)
      return (
        <NavLinkItem
          key={key}
          item={item}
          isActive={isActive}
          depth={depth}
          collapsed={collapsed}
        />
      );
    },
    [pathname, collapsed, openSectionId, toggleSection]
  );

  // Séparer les éléments avec et sans section
  const itemsWithSection = filteredNav.filter((item) => item.section);
  const itemsWithoutSection = filteredNav.filter((item) => !item.section);

  if (filteredNav.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        Aucun accès disponible
      </div>
    );
  }

  return (
    <nav
      className={cn(
        'flex h-full flex-col overflow-y-auto px-2 py-3',
        collapsed ? 'items-center' : ''
      )}
      aria-label="Navigation principale"
    >
      {itemsWithoutSection.map((item) => renderNavItem(item))}
      {itemsWithSection.map((item) => renderNavItem(item))}
    </nav>
  );
}