'use client';

import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
);

interface StatsChartProps {
  type: 'line' | 'bar' | 'doughnut';
  title: string;
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    fill?: boolean;
  }[];
  className?: string;
  height?: number;
}

export function StatsChart({
  type,
  title,
  labels,
  datasets,
  className,
  height = 300,
}: StatsChartProps) {
  const chartRef = useRef<ChartJS>(null);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
      },
    },
    scales: type === 'doughnut' ? undefined : {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0,0,0,0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const chartComponents = {
    line: Line,
    bar: Bar,
    doughnut: Doughnut,
  };

  const ChartComponent = chartComponents[type];

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader>
        <CardTitle className="font-ubuntu text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height }}>
          <ChartComponent
            ref={chartRef}
            data={{ labels, datasets }}
            options={options}
          />
        </div>
      </CardContent>
    </Card>
  );
}