export const CACHE_KEYS = {
  // User cache keys
  USER: (id: string) => `user:${id}`,
  USER_EMAIL: (email: string) => `user:email:${email}`,
  USER_LIST: (params: string) => `user:list:${params}`,
  USER_STATS: 'user:stats',

  // Formation cache keys
  FORMATION: (id: string) => `formation:${id}`,
  FORMATION_SLUG: (slug: string) => `formation:slug:${slug}`,
  FORMATION_LIST: (params: string) => `formation:list:${params}`,
  FORMATION_PUBLISHED: 'formation:published',
  FORMATION_STATS: 'formation:stats',
  FORMATION_POPULAR: 'formation:popular',

  // Article cache keys
  ARTICLE: (id: string) => `article:${id}`,
  ARTICLE_SLUG: (slug: string) => `article:slug:${slug}`,
  ARTICLE_LIST: (params: string) => `article:list:${params}`,
  ARTICLE_PUBLISHED: 'article:published',
  ARTICLE_STATS: 'article:stats',
  ARTICLE_MOST_VIEWED: 'article:most-viewed',

  // Project cache keys
  PROJECT: (id: string) => `project:${id}`,
  PROJECT_SLUG: (slug: string) => `project:slug:${slug}`,
  PROJECT_LIST: (params: string) => `project:list:${params}`,
  PROJECT_FEATURED: 'project:featured',
  PROJECT_STATS: 'project:stats',

  // Event cache keys
  EVENT: (id: string) => `event:${id}`,
  EVENT_SLUG: (slug: string) => `event:slug:${slug}`,
  EVENT_LIST: (params: string) => `event:list:${params}`,
  EVENT_PUBLISHED: 'event:published',
  EVENT_UPCOMING: 'event:upcoming',
  EVENT_STATS: 'event:stats',

  // Y2C cache keys
  Y2C_MEMBER: (id: string) => `y2c:member:${id}`,
  Y2C_MEMBER_EMAIL: (email: string) => `y2c:member:email:${email}`,
  Y2C_MEMBER_LIST: (params: string) => `y2c:member:list:${params}`,
  Y2C_MEMBER_STATS: 'y2c:member:stats',
  Y2C_EVENT_LIST: (params: string) => `y2c:event:list:${params}`,
  Y2C_EVENT_STATS: 'y2c:event:stats',

  // Dashboard cache keys
  DASHBOARD_STATS: 'dashboard:stats',
  DASHBOARD_QUICK_STATS: 'dashboard:quick-stats',
  DASHBOARD_CHART: (type: string, period: string) => `dashboard:chart:${type}:${period}`,
  DASHBOARD_ACTIVITIES: 'dashboard:activities',
  DASHBOARD_NOTIFICATIONS: 'dashboard:notifications',
  DASHBOARD_PERFORMANCE: 'dashboard:performance',

  // Stats cache keys
  STATS_GLOBAL: 'stats:global',
  STATS_DAILY: (date: string) => `stats:daily:${date}`,
  STATS_MONTHLY: (year: number, month: number) => `stats:monthly:${year}:${month}`,
  STATS_YEARLY: (year: number) => `stats:yearly:${year}`,
  STATS_REALTIME: 'stats:realtime',

  // System cache keys
  SYSTEM_CONFIG: 'system:config',
  SYSTEM_HEALTH: 'system:health',
  SYSTEM_VERSION: 'system:version',
} as const;

export type CacheKey = typeof CACHE_KEYS[keyof typeof CACHE_KEYS];