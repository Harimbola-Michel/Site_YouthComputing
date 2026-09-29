// src/components/admin/StatsOverview.tsx
'use client';

import { motion } from 'framer-motion';
import { Users, GraduationCap, FileText, Building2, CreditCard, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface StatsOverviewProps {
  stats: any;
  loading: boolean;
}

const statItems = [
  {
    key: 'users',
    label: 'Utilisateurs',
    icon: Users,
    color: 'bg-primary/10 text-primary',
    getValue: (stats: any) => stats?.users?.total ?? 0,
    getSubLabel: (stats: any) => `${stats?.users?.active ?? 0} actifs`,
  },
  // ... (les autres items restent identiques)
];

export function StatsOverview({ stats = {}, loading }: StatsOverviewProps) {
  const safeStats = stats || {};
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {statItems.map((item, index) => {
        const value = item.getValue(safeStats);
        const subLabel = item.getSubLabel(safeStats);
        return (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card>
              <CardContent className="p-4">
                {loading ? (
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-7 w-7 rounded-full" />
                    </div>
                    <Skeleton className="h-7 w-16" />
                    <Skeleton className="h-3 w-14" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between">
                      <span className="text-xs font-medium uppercase text-muted-foreground">
                        {item.label}
                      </span>
                      <div className={cn('rounded-full p-1.5', item.color)}>
                        <item.icon className="h-3.5 w-3.5" />
                      </div>
                    </div>
                    <p className="mt-2 font-ubuntu text-2xl font-bold">{value}</p>
                    <p className="text-xs text-muted-foreground">{subLabel}</p>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
