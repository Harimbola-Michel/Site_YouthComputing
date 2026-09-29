export interface DashboardStatsDTO {
  users: {
    total: number;
    active: number;
    new: {
      today: number;
      thisWeek: number;
      thisMonth: number;
    };
  };
  formations: {
    total: number;
    published: number;
    registrations: number;
    mostPopular: {
      id: string;
      title: string;
      registrations: number;
    } | null;
  };
  y2c: {
    totalMembers: number;
    activeMembers: number;
    events: number;
    registrations: number;
  };
  projects: {
    total: number;
    completed: number;
    inProgress: number;
  };
  articles: {
    total: number;
    published: number;
    views: number;
  };
  contacts: {
    total: number;
    unread: number;
  };
  payments: {
    total: number;
    totalAmount: number;
    pending: number;
  };
}

export interface DashboardChartDataDTO {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
}

export interface DashboardActivityDTO {
  id: string;
  user: string;
  action: string;
  resource: string;
  details: string;
  timestamp: Date;
}

export interface DashboardNotificationDTO {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: Date;
}

export interface DashboardQuickStatsDTO {
  totalUsers: number;
  totalFormations: number;
  totalRegistrations: number;
  totalY2CMembers: number;
  totalProjects: number;
  totalArticles: number;
  totalPayments: number;
  revenue: number;
}

export interface DashboardPerformanceDTO {
  responseTime: number;
  uptime: number;
  memoryUsage: number;
  cpuUsage: number;
  activeUsers: number;
  requestsPerMinute: number;
  errorRate: number;
}

export interface DashboardWidgetDTO {
  id: string;
  type: string;
  title: string;
  data: any;
  configuration?: {
    size: 'small' | 'medium' | 'large' | 'full';
    refreshInterval?: number;
    displayMode?: 'chart' | 'table' | 'number' | 'list';
  };
}

export interface DashboardConfigDTO {
  widgets: DashboardWidgetDTO[];
  layout: {
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
  }[];
}

export interface DashboardExportDTO {
  stats: DashboardStatsDTO;
  charts: {
    [key: string]: DashboardChartDataDTO;
  };
  activities: DashboardActivityDTO[];
  generatedAt: Date;
}