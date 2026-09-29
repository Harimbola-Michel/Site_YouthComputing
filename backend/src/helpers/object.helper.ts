export class ObjectHelper {
  static isEmpty(obj: any): boolean {
    return !obj || Object.keys(obj).length === 0;
  }

  static isNotEmpty(obj: any): boolean {
    return obj && Object.keys(obj).length > 0;
  }

  static deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  static deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
    const result = { ...target };
    for (const key in source) {
      if (source[key] !== undefined) {
        if (
          typeof source[key] === 'object' &&
          source[key] !== null &&
          !Array.isArray(source[key]) &&
          typeof result[key] === 'object' &&
          result[key] !== null
        ) {
          result[key] = this.deepMerge(result[key], source[key] as any);
        } else {
          result[key] = source[key] as any;
        }
      }
    }
    return result;
  }

  static pick<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
    const result: any = {};
    for (const key of keys) {
      if (key in obj) {
        result[key] = obj[key];
      }
    }
    return result;
  }

  static omit<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
    const result: any = { ...obj };
    for (const key of keys) {
      delete result[key];
    }
    return result;
  }

  static keys<T>(obj: T): (keyof T)[] {
    return Object.keys(obj) as (keyof T)[];
  }

  static values<T>(obj: T): T[keyof T][] {
    return Object.values(obj);
  }

  static entries<T>(obj: T): [keyof T, T[keyof T]][] {
    return Object.entries(obj) as [keyof T, T[keyof T]][];
  }

  static fromEntries<T>(entries: [string, any][]): T {
    return Object.fromEntries(entries) as T;
  }

  static mapValues<T, R>(obj: T, mapper: (value: T[keyof T], key: keyof T) => R): Record<keyof T, R> {
    const result: any = {};
    for (const key in obj) {
      result[key] = mapper(obj[key], key);
    }
    return result;
  }

  static filterValues<T>(obj: T, predicate: (value: T[keyof T], key: keyof T) => boolean): Partial<T> {
    const result: any = {};
    for (const key in obj) {
      if (predicate(obj[key], key)) {
        result[key] = obj[key];
      }
    }
    return result;
  }

  static findKey<T>(obj: T, predicate: (value: T[keyof T], key: keyof T) => boolean): keyof T | null {
    for (const key in obj) {
      if (predicate(obj[key], key)) {
        return key;
      }
    }
    return null;
  }

  static findValue<T>(obj: T, predicate: (value: T[keyof T], key: keyof T) => boolean): T[keyof T] | null {
    for (const key in obj) {
      if (predicate(obj[key], key)) {
        return obj[key];
      }
    }
    return null;
  }

  static invert<T extends Record<string, string>>(obj: T): Record<string, keyof T> {
    const result: any = {};
    for (const key in obj) {
      result[obj[key]] = key;
    }
    return result;
  }

  static hasKey<T>(obj: T, key: string): key is keyof T {
    return key in obj;
  }

  static getNestedValue<T>(obj: any, path: string): T | undefined {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  static setNestedValue(obj: any, path: string, value: any): any {
    const keys = path.split('.');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current)) {
        current[key] = {};
      }
      current = current[key];
    }
    current[keys[keys.length - 1]] = value;
    return obj;
  }

  static isPlainObject(obj: any): boolean {
    return obj !== null && typeof obj === 'object' && obj.constructor === Object;
  }

  static isObjectWithKeys(obj: any, keys: string[]): boolean {
    if (!this.isPlainObject(obj)) return false;
    return keys.every(key => key in obj);
  }

  static deepFreeze<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') return obj;
    const frozen = Object.freeze(obj);
    for (const key in frozen) {
      if (frozen[key] && typeof frozen[key] === 'object') {
        this.deepFreeze(frozen[key]);
      }
    }
    return frozen;
  }
}