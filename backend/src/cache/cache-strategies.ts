import { CacheOptions } from './cache-manager';

export interface CacheStrategy {
  getKey(key: string): string;
  getTTL(): number;
  shouldCache(data: any): boolean;
}

export class DefaultCacheStrategy implements CacheStrategy {
  constructor(private ttl: number = 300) {}

  getKey(key: string): string {
    return `cache:${key}`;
  }

  getTTL(): number {
    return this.ttl;
  }

  shouldCache(data: any): boolean {
    return data !== null && data !== undefined;
  }
}

export class UserCacheStrategy implements CacheStrategy {
  constructor(private ttl: number = 600) {}

  getKey(key: string): string {
    return `user:${key}`;
  }

  getTTL(): number {
    return this.ttl;
  }

  shouldCache(data: any): boolean {
    return data !== null && data !== undefined && data.id !== undefined;
  }
}

export class FormationCacheStrategy implements CacheStrategy {
  constructor(private ttl: number = 900) {}

  getKey(key: string): string {
    return `formation:${key}`;
  }

  getTTL(): number {
    return this.ttl;
  }

  shouldCache(data: any): boolean {
    return data !== null && data !== undefined && data.id !== undefined;
  }
}

export class ArticleCacheStrategy implements CacheStrategy {
  constructor(private ttl: number = 600) {}

  getKey(key: string): string {
    return `article:${key}`;
  }

  getTTL(): number {
    return this.ttl;
  }

  shouldCache(data: any): boolean {
    return data !== null && data !== undefined && data.id !== undefined;
  }
}

export class ProjectCacheStrategy implements CacheStrategy {
  constructor(private ttl: number = 900) {}

  getKey(key: string): string {
    return `project:${key}`;
  }

  getTTL(): number {
    return this.ttl;
  }

  shouldCache(data: any): boolean {
    return data !== null && data !== undefined && data.id !== undefined;
  }
}

export class StatsCacheStrategy implements CacheStrategy {
  constructor(private ttl: number = 1800) {}

  getKey(key: string): string {
    return `stats:${key}`;
  }

  getTTL(): number {
    return this.ttl;
  }

  shouldCache(data: any): boolean {
    return data !== null && data !== undefined;
  }
}

export class DashboardCacheStrategy implements CacheStrategy {
  constructor(private ttl: number = 300) {}

  getKey(key: string): string {
    return `dashboard:${key}`;
  }

  getTTL(): number {
    return this.ttl;
  }

  shouldCache(data: any): boolean {
    return data !== null && data !== undefined;
  }
}

export const cacheStrategies = {
  default: new DefaultCacheStrategy(),
  user: new UserCacheStrategy(),
  formation: new FormationCacheStrategy(),
  article: new ArticleCacheStrategy(),
  project: new ProjectCacheStrategy(),
  stats: new StatsCacheStrategy(),
  dashboard: new DashboardCacheStrategy(),
};