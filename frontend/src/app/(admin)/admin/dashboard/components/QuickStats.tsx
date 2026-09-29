// src/app/(admin)/admin/dashboard/components/QuickStats.tsx
'use client';

import { motion } from 'framer-motion';
import { Users, UserPlus, CalendarCheck, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface QuickStatsProps {
  data: {
    activeUsers: number;
    newUsersToday: number;
    registrationsThisWeek: number;
    revenueThisMonth: number;
  };
}

const configs = [
  {
    key: 'activeUsers',
    label: 'Utilisateurs actifs',
    icon: Users,
    color: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
    format: (val: number) => val.toLocaleString(),
  },
  {
    key: 'newUsersToday',
    label: 'Nouveaux aujourd\'hui',
    icon: UserPlus,
    color: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400',
    format: (val: number) => val.toLocaleString(),
  },
  {
    key: 'registrationsThisWeek',
    label: 'Inscriptions cette semaine',
    icon: CalendarCheck,
    color: 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400',
    format: (val: number) => val.toLocaleString(),
  },
  {
    key: 'revenueThisMonth',
    label: 'Revenu ce mois',
    icon: DollarSign,
    color: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',
    format: (val: number) => val.toLocaleString() + ' Ar',
  },
];

export function QuickStats({ data }: QuickStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {configs.map((config, index) => {
        const value = data[config.key as keyof typeof data] || 0;
        const formattedValue = config.format(value);

        return (
          <motion.div
            key={config.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
          >
            <Card className="hover:shadow-md transition-shadow border border-border/50">
              <CardContent className="p-4 flex items-center gap-4">
                <div className={cn('rounded-full p-3', config.color)}>
                  <config.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{config.label}</p>
                  <p className="text-2xl font-bold font-ubuntu tabular-nums">
                    {formattedValue}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}