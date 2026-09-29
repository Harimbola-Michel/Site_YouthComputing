'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PageTransition } from '@/components/shared/PageTransition';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, UserCheck, UserX, Building2, TrendingUp, PieChart } from 'lucide-react';
import { team } from '@/lib/api';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface StatsData {
  total: number;
  active: number;
  inactive: number;
  byDepartment: Record<string, number>;
}

export default function TeamStatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await team.getStats();
        const data = res?.data?.data ?? res?.data;
        setStats(data);
      } catch (error) {
        console.error('Erreur chargement stats équipe:', error);
        toast.error('Impossible de charger les statistiques');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </PageTransition>
    );
  }

  if (!stats) {
    return (
      <PageTransition>
        <div className="flex h-[60vh] items-center justify-center">
          <p className="text-muted-foreground">Aucune donnée disponible.</p>
        </div>
      </PageTransition>
    );
  }

  const { total, active, inactive, byDepartment } = stats;

  const statCards = [
    {
      label: 'Total membres',
      value: total,
      icon: Users,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
    },
    {
      label: 'Membres actifs',
      value: active,
      icon: UserCheck,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
      border: 'border-green-500/20',
    },
    {
      label: 'Membres inactifs',
      value: inactive,
      icon: UserX,
      color: 'text-rose-500',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
    },
    {
      label: 'Départements',
      value: Object.keys(byDepartment).length,
      icon: PieChart,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
    },
  ];

  return (
    <PageTransition>
      <div className="space-y-8">
        <div>
          <h1 className="font-ubuntu text-3xl font-bold tracking-tight">
            Statistiques de l’équipe
          </h1>
          <p className="text-muted-foreground">
            Vue d’ensemble des membres et de leur répartition.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={cn(
                    'transition-all hover:shadow-lg hover:-translate-y-1 border-l-4',
                    stat.border
                  )}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                        <p className="mt-2 text-3xl font-bold">{stat.value}</p>
                      </div>
                      <div className={cn('rounded-full p-3', stat.bg)}>
                        <Icon className={cn('h-5 w-5', stat.color)} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-ubuntu text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5 text-secondary" />
                Répartition par département
              </CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(byDepartment).length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  Aucun département renseigné.
                </p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(byDepartment)
                    .sort((a, b) => b[1] - a[1])
                    .map(([dept, count]) => (
                      <div key={dept} className="flex items-center gap-4">
                        <span className="w-32 text-sm font-medium text-muted-foreground truncate">
                          {dept || 'Non défini'}
                        </span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-secondary rounded-full transition-all duration-500"
                            style={{ width: `${(count / total) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-ubuntu text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-secondary" />
                Taux d’activité
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="relative h-32 w-32">
                  <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" strokeWidth="12" />
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="hsl(var(--secondary))"
                      strokeWidth="12"
                      strokeDasharray={`${(active / total) * 314} 314`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold">
                      {total > 0 ? Math.round((active / total) * 100) : 0}%
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Membres actifs sur l’ensemble
                  </p>
                  <p className="text-sm font-medium">
                    {active} actif{active > 1 ? 's' : ''} / {total} total
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}