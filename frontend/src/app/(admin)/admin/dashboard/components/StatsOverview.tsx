// src/app/(admin)/admin/dashboard/components/StatsOverview.tsx
'use client';

import {
  Users,
  GraduationCap,
  UsersRound,
  CalendarCheck,
  Briefcase,
  Activity as ActivityIcon,
  FileText,
  DollarSign,
} from 'lucide-react';
import { StatCard } from './StatCard';

// ============================================================
// TYPES
// ============================================================
interface StatsOverviewProps {
  stats?: Record<string, any> | null;
  loading?: boolean;
}

// ============================================================
// HELPERS — Sécurité maximale
// ============================================================
function getNum(obj: any, ...keys: string[]): number {
  if (!obj) return 0;
  for (const key of keys) {
    const val = obj[key];
    if (typeof val === 'number' && Number.isFinite(val)) return val;
    if (typeof val === 'string') {
      const parsed = Number(val);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return 0;
}

function getArr(obj: any, ...keys: string[]): number[] | undefined {
  if (!obj) return undefined;
  for (const key of keys) {
    const val = obj[key];
    if (Array.isArray(val) && val.length >= 2) return val;
  }
  return undefined;
}

// ============================================================
// COMPOSANT
// ============================================================
export function StatsOverview({ stats, loading }: StatsOverviewProps) {
  // ✅ Log pour debug (à retirer après)
  if (typeof window !== 'undefined') {
    console.log('🎯 [StatsOverview] Reçu:', stats, 'Loading:', loading);
  }

  // ✅ Toujours un objet
  const s = stats || {};

  // ✅ Support de plusieurs formats de clés (fallback)
  const totalUsers = getNum(s, 'totalUsers', 'users', 'userCount', 'total_users');
  const totalFormations = getNum(s, 'totalFormations', 'formations', 'formationCount', 'total_formations');
  const totalRegistrations = getNum(s, 'totalRegistrations', 'registrations', 'registrationCount', 'total_registrations');
  const totalY2CMembers = getNum(s, 'totalY2CMembers', 'y2cMembers', 'members', 'totalY2cMembers', 'total_y2c_members');
  const totalProjects = getNum(s, 'totalProjects', 'projects', 'projectCount', 'total_projects');
  const totalEvents = getNum(s, 'totalEvents', 'events', 'eventCount', 'total_events');
  const totalArticles = getNum(s, 'totalArticles', 'articles', 'articleCount', 'total_articles');
  const revenue = getNum(s, 'revenue', 'totalRevenue', 'total_revenue');
  const recentSignups = getNum(s, 'recentSignups', 'newUsersToday', 'recent_signups');
  const pendingValidations = getNum(s, 'pendingValidations', 'pending_validations');

  // Trends (peuvent venir à plat OU dans .trends)
  const trends = s.trends || s;
  const t = {
    users: getNum(trends, 'usersTrend', 'trends.users') || undefined,
    formations: getNum(trends, 'formationsTrend') || undefined,
    registrations: getNum(trends, 'registrationsTrend') || undefined,
    y2c: getNum(trends, 'y2cTrend') || undefined,
    events: getNum(trends, 'eventsTrend') || undefined,
    projects: getNum(trends, 'projectsTrend') || undefined,
    articles: getNum(trends, 'articlesTrend') || undefined,
    revenue: getNum(trends, 'revenueTrend') || undefined,
  };

  // Sparklines (peuvent venir à plat OU dans .sparklines)
  const sparks = s.sparklines || s;
  const sp = {
    users: getArr(sparks, 'usersSparkline', 'sparklineUsers'),
    y2c: getArr(sparks, 'y2cSparkline', 'sparklineY2c'),
    revenue: getArr(sparks, 'revenueSparkline', 'sparklineRevenue'),
  };

  // Capacité
  const c = s.capacity || {};

  const validated = Math.max(totalRegistrations - pendingValidations, 0);

  // ✅ 8 cartes toujours affichées
  const cards = [
    {
      title: 'Utilisateurs',
      value: totalUsers,
      icon: <Users className="h-5 w-5" />,
      color: 'primary' as const,
      trend: t.users,
      description: recentSignups > 0 ? `+${recentSignups} ce mois` : 'Total',
      sparkline: sp.users,
    },
    {
      title: 'Formations',
      value: totalFormations,
      icon: <GraduationCap className="h-5 w-5" />,
      color: 'secondary' as const,
      trend: t.formations,
      description: totalFormations > 1 ? `${totalFormations} actives` : 'Formation',
      progress:
        c.formations && c.formations > 0
          ? Math.min((totalFormations / c.formations) * 100, 100)
          : undefined,
    },
    {
      title: 'Inscriptions',
      value: totalRegistrations,
      icon: <CalendarCheck className="h-5 w-5" />,
      color: 'info' as const,
      trend: t.registrations,
      description:
        pendingValidations > 0
          ? `${pendingValidations} en attente`
          : 'Total',
      breakdown:
        pendingValidations > 0
          ? [
              {
                label: 'Validées',
                value: validated,
                color: 'text-emerald-600 dark:text-emerald-400',
              },
              {
                label: 'En attente',
                value: pendingValidations,
                color: 'text-amber-600 dark:text-amber-400',
              },
            ]
          : undefined,
    },
    {
      title: 'Membres Y2C',
      value: totalY2CMembers,
      icon: <UsersRound className="h-5 w-5" />,
      color: 'success' as const,
      trend: t.y2c,
      description: 'Membres actifs',
      sparkline: sp.y2c,
    },
    {
      title: 'Événements',
      value: totalEvents,
      icon: <ActivityIcon className="h-5 w-5" />,
      color: 'info' as const,
      trend: t.events,
      description: 'Programmés',
    },
    {
      title: 'Projets',
      value: totalProjects,
      icon: <Briefcase className="h-5 w-5" />,
      color: 'secondary' as const,
      trend: t.projects,
      description: 'En cours',
      progress:
        c.projects && c.projects > 0
          ? Math.min((totalProjects / c.projects) * 100, 100)
          : undefined,
    },
    {
      title: 'Articles',
      value: totalArticles,
      icon: <FileText className="h-5 w-5" />,
      color: 'primary' as const,
      trend: t.articles,
      description: 'Publiés',
    },
    {
      title: 'Revenu',
      value: revenue,
      icon: <DollarSign className="h-5 w-5" />,
      color: 'success' as const,
      format: 'currency' as const,
      currency: 'MGA',
      suffix: ' Ar',
      trend: t.revenue,
      description: 'Total',
      sparkline: sp.revenue,
    },
  ];

  // ✅ RENDU — TOUJOURS affiché
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <StatCard
          key={card.title}
          title={card.title}
          value={card.value}
          icon={card.icon}
          color={card.color}
          trend={card.trend}
          description={card.description}
          sparkline={card.sparkline}
          progress={card.progress}
          breakdown={card.breakdown}
          format={card.format}
          currency={card.currency}
          suffix={card.suffix}
          loading={loading}
          delay={index}
        />
      ))}
    </div>
  );
}