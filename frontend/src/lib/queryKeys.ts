export const queryKeys = {
  // Auth
  auth: {
    me: ['auth', 'me'],
  },

  // Users
  users: {
    all: ['users'],
    lists: () => [...queryKeys.users.all, 'list'],
    list: (filters: any) => [...queryKeys.users.lists(), filters],
    details: () => [...queryKeys.users.all, 'detail'],
    detail: (id: string) => [...queryKeys.users.details(), id],
    profile: ['users', 'profile'],
    stats: ['users', 'stats'],
  },

  // Formations
  formations: {
    all: ['formations'],
    lists: () => [...queryKeys.formations.all, 'list'],
    list: (filters: any) => [...queryKeys.formations.lists(), filters],
    details: () => [...queryKeys.formations.all, 'detail'],
    detail: (slug: string) => [...queryKeys.formations.details(), slug],
    published: ['formations', 'published'],
    stats: ['formations', 'stats'],
    popular: ['formations', 'popular'],
  },

  // Registrations
  registrations: {
    all: ['registrations'],
    lists: () => [...queryKeys.registrations.all, 'list'],
    list: (filters: any) => [...queryKeys.registrations.lists(), filters],
    details: () => [...queryKeys.registrations.all, 'detail'],
    detail: (id: string) => [...queryKeys.registrations.details(), id],
    stats: ['registrations', 'stats'],
    revenue: ['registrations', 'revenue'],
  },

  // Y2C
  y2c: {
    members: ['y2c', 'members'],
    membersList: (filters: any) => ['y2c', 'members', filters],
    member: (id: string) => ['y2c', 'members', id],
    stats: ['y2c', 'stats'],
    events: ['y2c', 'events'],
    eventsList: (filters: any) => ['y2c', 'events', filters],
    event: (id: string) => ['y2c', 'events', id],
    eventRegistrations: (id: string) => ['y2c', 'events', id, 'registrations'],
  },

  // Articles
  articles: {
    all: ['articles'],
    lists: () => [...queryKeys.articles.all, 'list'],
    list: (filters: any) => [...queryKeys.articles.lists(), filters],
    details: () => [...queryKeys.articles.all, 'detail'],
    detail: (slug: string) => [...queryKeys.articles.details(), slug],
    published: ['articles', 'published'],
    stats: ['articles', 'stats'],
    mostViewed: ['articles', 'most-viewed'],
    comments: (articleId: string) => ['articles', articleId, 'comments'],
  },

  // Projects
  projects: {
    all: ['projects'],
    lists: () => [...queryKeys.projects.all, 'list'],
    list: (filters: any) => [...queryKeys.projects.lists(), filters],
    details: () => [...queryKeys.projects.all, 'detail'],
    detail: (slug: string) => [...queryKeys.projects.details(), slug],
    featured: ['projects', 'featured'],
    stats: ['projects', 'stats'],
    metrics: (projectId: string) => ['projects', projectId, 'metrics'],
  },

  // Events
  events: {
    all: ['events'],
    lists: () => [...queryKeys.events.all, 'list'],
    list: (filters: any) => [...queryKeys.events.lists(), filters],
    details: () => [...queryKeys.events.all, 'detail'],
    detail: (slug: string) => [...queryKeys.events.details(), slug],
    published: ['events', 'published'],
    upcoming: ['events', 'upcoming'],
    stats: ['events', 'stats'],
    registrations: (id: string) => ['events', id, 'registrations'],
  },

  // Contact
  contact: {
    all: ['contact'],
    lists: () => [...queryKeys.contact.all, 'list'],
    list: (filters: any) => [...queryKeys.contact.lists(), filters],
    detail: (id: string) => [...queryKeys.contact.all, 'detail', id],
    stats: ['contact', 'stats'],
  },

  // Payments
  payments: {
    all: ['payments'],
    lists: () => [...queryKeys.payments.all, 'list'],
    list: (filters: any) => [...queryKeys.payments.lists(), filters],
    detail: (id: string) => [...queryKeys.payments.all, 'detail', id],
    stats: ['payments', 'stats'],
    my: ['payments', 'my'],
  },

  // Dashboard
  dashboard: {
    stats: ['dashboard', 'stats'],
    quickStats: ['dashboard', 'quick-stats'],
    chart: (params: any) => ['dashboard', 'chart', params],
    activities: (params: any) => ['dashboard', 'activities', params],
    notifications: ['dashboard', 'notifications'],
    performance: ['dashboard', 'performance'],
    widgets: ['dashboard', 'widgets'],
  },

  // Stats
  stats: {
    global: ['stats', 'global'],
    daily: (params: any) => ['stats', 'daily', params],
    monthly: (params: any) => ['stats', 'monthly', params],
    yearly: (params: any) => ['stats', 'yearly', params],
    realtime: ['stats', 'realtime'],
  },
};

export default queryKeys;