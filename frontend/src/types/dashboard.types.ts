// src/types/dashboard.types.ts
// ============================================================
import { UserRef } from './common.types';

export interface DashboardStats {
  stats: {
    users: { total: number; active: number };
    formations: { total: number; published: number };
    registrations: { total: number; confirmed: number };
    y2c: { total: number; active: number };
    projects: { total: number; completed: number };
    payments: { total: number; success: number };
    articles: { total: number; published: number };
    contact: { unread: number };
  };
  realtime: {
    activeUsers: number;
    requestsPerMinute: number;
    responseTime: number;
    timestamp: string;
  };
  activities: RecentActivity[];
  notifications: DashboardNotification[];
  timestamp: string;
}

export interface RecentActivity {
  id: string;
  user: UserRef;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: any;
  createdAt: string;
}

export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
  }[];
}

export interface Widget {
  id: string;
  type: 'stats' | 'chart' | 'list' | 'custom';
  title: string;
  size: 'small' | 'medium' | 'large' | 'full';
  config?: any;
}