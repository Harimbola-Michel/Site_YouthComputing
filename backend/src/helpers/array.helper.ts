export class ArrayHelper {
  static isEmpty<T>(arr: T[]): boolean {
    return !arr || arr.length === 0;
  }

  static isNotEmpty<T>(arr: T[]): boolean {
    return arr && arr.length > 0;
  }

  static first<T>(arr: T[]): T | undefined {
    return arr && arr.length > 0 ? arr[0] : undefined;
  }

  static last<T>(arr: T[]): T | undefined {
    return arr && arr.length > 0 ? arr[arr.length - 1] : undefined;
  }

  static unique<T>(arr: T[]): T[] {
    return [...new Set(arr)];
  }

  static uniqueBy<T>(arr: T[], key: keyof T): T[] {
    const seen = new Set();
    return arr.filter(item => {
      const value = item[key];
      if (seen.has(value)) return false;
      seen.add(value);
      return true;
    });
  }

  static chunk<T>(arr: T[], size: number): T[][] {
    if (!arr || arr.length === 0) return [];
    const result: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  }

  static flatten<T>(arr: any[]): T[] {
    return arr.reduce((flat, item) => {
      return flat.concat(Array.isArray(item) ? this.flatten(item) : item);
    }, []);
  }

  static groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
    return arr.reduce((groups, item) => {
      const value = String(item[key]);
      if (!groups[value]) {
        groups[value] = [];
      }
      groups[value].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  }

  static sortBy<T>(arr: T[], key: keyof T, ascending: boolean = true): T[] {
    return [...arr].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      if (aVal < bVal) return ascending ? -1 : 1;
      if (aVal > bVal) return ascending ? 1 : -1;
      return 0;
    });
  }

  static sum(arr: number[]): number {
    return arr.reduce((sum, value) => sum + value, 0);
  }

  static average(arr: number[]): number {
    if (arr.length === 0) return 0;
    return this.sum(arr) / arr.length;
  }

  static min(arr: number[]): number {
    return Math.min(...arr);
  }

  static max(arr: number[]): number {
    return Math.max(...arr);
  }

  static shuffle<T>(arr: T[]): T[] {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  static pick<T>(arr: T[], count: number): T[] {
    return this.shuffle(arr).slice(0, count);
  }

  static removeDuplicates<T>(arr: T[]): T[] {
    return Array.from(new Set(arr));
  }

  static intersect<T>(arr1: T[], arr2: T[]): T[] {
    return arr1.filter(item => arr2.includes(item));
  }

  static difference<T>(arr1: T[], arr2: T[]): T[] {
    return arr1.filter(item => !arr2.includes(item));
  }

  static union<T>(arr1: T[], arr2: T[]): T[] {
    return Array.from(new Set([...arr1, ...arr2]));
  }

  static findMaxBy<T>(arr: T[], key: keyof T): T | undefined {
    if (arr.length === 0) return undefined;
    return arr.reduce((max, item) => {
      return item[key] > max[key] ? item : max;
    });
  }

  static findMinBy<T>(arr: T[], key: keyof T): T | undefined {
    if (arr.length === 0) return undefined;
    return arr.reduce((min, item) => {
      return item[key] < min[key] ? item : min;
    });
  }

  static findDuplicates<T>(arr: T[]): T[] {
    const seen = new Set<T>();
    const duplicates = new Set<T>();
    for (const item of arr) {
      if (seen.has(item)) {
        duplicates.add(item);
      } else {
        seen.add(item);
      }
    }
    return Array.from(duplicates);
  }

  static removeNulls<T>(arr: (T | null | undefined)[]): T[] {
    return arr.filter((item): item is T => item !== null && item !== undefined);
  }

  static zip<T1, T2>(arr1: T1[], arr2: T2[]): [T1, T2][] {
    const minLength = Math.min(arr1.length, arr2.length);
    const result: [T1, T2][] = [];
    for (let i = 0; i < minLength; i++) {
      result.push([arr1[i], arr2[i]]);
    }
    return result;
  }
}