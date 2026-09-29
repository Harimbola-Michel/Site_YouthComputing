// src/types/stats.types.ts
export interface GlobalStats {
  users: number;
  formations: number;
  registrations: number;
  y2cMembers: number;
  projects: number;
  payments: number;
  articles: number;
  revenue: number;
}

export interface DailyStats {
  date: string;
  newUsers: number;
  newRegistrations: number;
  revenue: number;
  newY2CMembers: number;
  visits: number;
}

export interface MonthlyStats {
  month: string;
  newUsers: number;
  newRegistrations: number;
  revenue: number;
  newY2CMembers: number;
  visits: number;
}

export interface YearlyStats {
  year: number;
  totalUsers: number;
  totalRegistrations: number;
  totalRevenue: number;
  totalY2CMembers: number;
}