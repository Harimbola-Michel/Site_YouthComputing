// app/(public)/projets/[slug]/components/ProjectMetrics.tsx
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Metric } from '@/types';

interface ProjectMetricsProps {
  metrics: Metric[];
}

export function ProjectMetrics({ metrics }: ProjectMetricsProps) {
  if (!metrics || metrics.length === 0) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {metrics.map((metric, index) => (
        <Card key={index} className="text-center">
          <CardContent className="p-6">
            <p className="text-3xl font-bold text-secondary">{metric.value}</p>
            <p className="text-sm text-muted-foreground">{metric.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}