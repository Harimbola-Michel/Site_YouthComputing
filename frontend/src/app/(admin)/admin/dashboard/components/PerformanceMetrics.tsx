'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Star, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PerformanceMetricsProps {
  metrics: {
    averageRating: number;
    completionRate: number;
    satisfactionScore: number;
    responseTime: number;
  };
}

const configs = [
  {
    key: 'averageRating',
    label: 'Note moyenne',
    icon: Star,
    color: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',
    suffix: '/5',
    max: 5,
  },
  {
    key: 'completionRate',
    label: 'Taux de complétion',
    icon: CheckCircle,
    color: 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400',
    suffix: '%',
    max: 100,
  },
  {
    key: 'satisfactionScore',
    label: 'Satisfaction',
    icon: TrendingUp,
    color: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
    suffix: '%',
    max: 100,
  },
  {
    key: 'responseTime',
    label: 'Temps de réponse',
    icon: Clock,
    color: 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400',
    suffix: ' min',
    max: 60,
  },
];

export function PerformanceMetrics({ metrics }: PerformanceMetricsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-secondary" />
          Métriques de performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {configs.map((config, index) => {
            const value = metrics[config.key as keyof typeof metrics] || 0;
            const percentage = config.max ? (value / config.max) * 100 : value;
            const displayValue = typeof value === 'number' ? value.toFixed(1) : value;

            return (
              <motion.div
                key={config.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn('rounded-full p-1.5', config.color)}>
                        <config.icon className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-sm text-muted-foreground">{config.label}</span>
                    </div>
                    <span className="text-sm font-medium">
                      {displayValue}
                      {config.suffix}
                    </span>
                  </div>
                  <Progress
                    value={Math.min(percentage, 100)}
                    className="h-1.5"
                    indicatorClassName="bg-gradient-to-r from-primary to-secondary"
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}