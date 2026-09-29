import { v4 as uuidv4 } from 'uuid';
import { format as dateFormat } from 'date-fns';

export const generateId = (): string => {
  return uuidv4();
};

export const generateShortId = (): string => {
  return uuidv4().substring(0, 8);
};

export const generateCode = (length: number = 6): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const generateNumberCode = (length: number = 6): string => {
  const chars = '0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const formatDate = (date: Date | string, format: string = 'dd/MM/yyyy'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) {
    return '';
  }
  return dateFormat(d, format);
};

export const formatCurrency = (amount: number, currency: string = 'MGA'): string => {
  return new Intl.NumberFormat('fr-MG', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatNumber = (number: number, decimals: number = 0): string => {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number);
};

export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.substring(0, 3)} ${cleaned.substring(3, 5)} ${cleaned.substring(5, 7)} ${cleaned.substring(7, 9)}`;
  }
  return phone;
};

export const formatName = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0).toUpperCase()}. ${lastName.charAt(0).toUpperCase()}${lastName.slice(1).toLowerCase()}`;
};

export const formatFullName = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0).toUpperCase()}${firstName.slice(1).toLowerCase()} ${lastName.charAt(0).toUpperCase()}${lastName.slice(1).toLowerCase()}`;
};

export const truncate = (str: string, length: number, suffix: string = '...'): string => {
  if (!str || str.length <= length) return str;
  return str.substring(0, length) + suffix;
};

export const capitalize = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const capitalizeAll = (str: string): string => {
  if (!str) return '';
  return str.split(' ').map(word => capitalize(word)).join(' ');
};

export const snakeToCamel = (str: string): string => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

export const camelToSnake = (str: string): string => {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};

export const snakeToPascal = (str: string): string => {
  return snakeToCamel(str).replace(/^[a-z]/, letter => letter.toUpperCase());
};

export const pascalToSnake = (str: string): string => {
  return str.replace(/[A-Z]/g, (letter, index) => 
    index === 0 ? letter.toLowerCase() : `_${letter.toLowerCase()}`
  );
};

export const isEmail = (str: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(str);
};

export const isPhone = (str: string): boolean => {
  const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  return phoneRegex.test(str);
};

export const isUrl = (str: string): boolean => {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
};

export const isDate = (str: string): boolean => {
  const date = new Date(str);
  return !isNaN(date.getTime());
};

export const isNumber = (str: string): boolean => {
  return !isNaN(Number(str)) && str.trim() !== '';
};

export const isInteger = (str: string): boolean => {
  return Number.isInteger(Number(str)) && str.trim() !== '';
};

export const isBoolean = (str: string): boolean => {
  return str === 'true' || str === 'false' || str === '1' || str === '0';
};

export const toBoolean = (str: string): boolean => {
  return str === 'true' || str === '1';
};

export const toNumber = (str: string): number => {
  return Number(str);
};

export const toDate = (str: string): Date | null => {
  const date = new Date(str);
  return isNaN(date.getTime()) ? null : date;
};

export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

export const mergeObjects = <T extends Record<string, any>>(
  target: T,
  source: Partial<T>
): T => {
  const result = { ...target };
  for (const key in source) {
    if (source[key] !== undefined) {
      if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
        result[key] = mergeObjects(result[key], source[key]);
      } else {
        result[key] = source[key] as any;
      }
    }
  }
  return result;
};

export const pick = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> => {
  const result: any = {};
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
};

export const omit = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> => {
  const result: any = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result;
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const retry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries) {
        await sleep(delay * attempt);
      }
    }
  }
  
  throw lastError;
};

export const debounce = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

export const memoize = <T extends (...args: any[]) => any>(
  fn: T
): ((...args: Parameters<T>) => ReturnType<T>) => {
  const cache = new Map<string, ReturnType<T>>();
  
  return (...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};