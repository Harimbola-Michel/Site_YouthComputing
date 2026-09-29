import { format, parse, differenceInDays, differenceInHours, differenceInMinutes, addDays, addMonths, addYears, isToday, isThisWeek, isThisMonth, isThisYear } from 'date-fns';
import { fr } from 'date-fns/locale';

export class DateHelper {
  static formatDate(date: Date | string, formatStr: string = 'dd/MM/yyyy'): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '';
    return format(d, formatStr, { locale: fr });
  }

  static formatDateTime(date: Date | string, formatStr: string = 'dd/MM/yyyy HH:mm'): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '';
    return format(d, formatStr, { locale: fr });
  }

  static formatTime(date: Date | string, formatStr: string = 'HH:mm'): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '';
    return format(d, formatStr);
  }

  static formatRelative(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '';
    const now = new Date();
    const diff = differenceInMinutes(now, d);
    
    if (diff < 1) return 'À l\'instant';
    if (diff < 60) return `Il y a ${diff} minute${diff > 1 ? 's' : ''}`;
    if (diff < 1440) {
      const hours = Math.floor(diff / 60);
      return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    }
    if (diff < 43200) {
      const days = Math.floor(diff / 1440);
      return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    }
    return this.formatDate(d);
  }

  static parseDate(dateStr: string, formatStr: string = 'dd/MM/yyyy'): Date | null {
    try {
      const date = parse(dateStr, formatStr, new Date(), { locale: fr });
      return isNaN(date.getTime()) ? null : date;
    } catch {
      return null;
    }
  }

  static getDaysBetween(start: Date | string, end: Date | string): number {
    const s = typeof start === 'string' ? new Date(start) : start;
    const e = typeof end === 'string' ? new Date(end) : end;
    return differenceInDays(e, s);
  }

  static getHoursBetween(start: Date | string, end: Date | string): number {
    const s = typeof start === 'string' ? new Date(start) : start;
    const e = typeof end === 'string' ? new Date(end) : end;
    return differenceInHours(e, s);
  }

  static getMinutesBetween(start: Date | string, end: Date | string): number {
    const s = typeof start === 'string' ? new Date(start) : start;
    const e = typeof end === 'string' ? new Date(end) : end;
    return differenceInMinutes(e, s);
  }

  static addDays(date: Date | string, amount: number): Date {
    const d = typeof date === 'string' ? new Date(date) : date;
    return addDays(d, amount);
  }

  static addMonths(date: Date | string, amount: number): Date {
    const d = typeof date === 'string' ? new Date(date) : date;
    return addMonths(d, amount);
  }

  static addYears(date: Date | string, amount: number): Date {
    const d = typeof date === 'string' ? new Date(date) : date;
    return addYears(d, amount);
  }

  static isToday(date: Date | string): boolean {
    const d = typeof date === 'string' ? new Date(date) : date;
    return isToday(d);
  }

  static isThisWeek(date: Date | string): boolean {
    const d = typeof date === 'string' ? new Date(date) : date;
    return isThisWeek(d);
  }

  static isThisMonth(date: Date | string): boolean {
    const d = typeof date === 'string' ? new Date(date) : date;
    return isThisMonth(d);
  }

  static isThisYear(date: Date | string): boolean {
    const d = typeof date === 'string' ? new Date(date) : date;
    return isThisYear(d);
  }

  static isFuture(date: Date | string): boolean {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d > new Date();
  }

  static isPast(date: Date | string): boolean {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d < new Date();
  }

  static getStartOfDay(date: Date | string): Date {
    const d = typeof date === 'string' ? new Date(date) : new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  static getEndOfDay(date: Date | string): Date {
    const d = typeof date === 'string' ? new Date(date) : new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
  }

  static getStartOfWeek(date: Date | string): Date {
    const d = typeof date === 'string' ? new Date(date) : new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  static getEndOfWeek(date: Date | string): Date {
    const d = this.getStartOfWeek(date);
    d.setDate(d.getDate() + 6);
    d.setHours(23, 59, 59, 999);
    return d;
  }

  static getStartOfMonth(date: Date | string): Date {
    const d = typeof date === 'string' ? new Date(date) : new Date(date);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  static getEndOfMonth(date: Date | string): Date {
    const d = typeof date === 'string' ? new Date(date) : new Date(date);
    d.setMonth(d.getMonth() + 1);
    d.setDate(0);
    d.setHours(23, 59, 59, 999);
    return d;
  }

  static getStartOfYear(date: Date | string): Date {
    const d = typeof date === 'string' ? new Date(date) : new Date(date);
    d.setMonth(0);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  static getEndOfYear(date: Date | string): Date {
    const d = typeof date === 'string' ? new Date(date) : new Date(date);
    d.setMonth(11);
    d.setDate(31);
    d.setHours(23, 59, 59, 999);
    return d;
  }

  static getDaysInMonth(year: number, month: number): number {
    return new Date(year, month, 0).getDate();
  }

  static isValidDate(date: any): boolean {
    const d = new Date(date);
    return !isNaN(d.getTime());
  }

  static toUTC(date: Date | string): Date {
    const d = typeof date === 'string' ? new Date(date) : new Date(date);
    return new Date(d.toUTCString());
  }

  static toLocal(date: Date | string): Date {
    const d = typeof date === 'string' ? new Date(date) : new Date(date);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  }

  static getAge(birthdate: Date | string): number {
    const d = typeof birthdate === 'string' ? new Date(birthdate) : birthdate;
    const today = new Date();
    let age = today.getFullYear() - d.getFullYear();
    const m = today.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) {
      age--;
    }
    return age;
  }

  static getTimeAgo(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diff = differenceInSeconds(now, d);
    
    const intervals = [
      { label: 'an', seconds: 31536000 },
      { label: 'mois', seconds: 2592000 },
      { label: 'semaine', seconds: 604800 },
      { label: 'jour', seconds: 86400 },
      { label: 'heure', seconds: 3600 },
      { label: 'minute', seconds: 60 },
      { label: 'seconde', seconds: 1 }
    ];

    for (const interval of intervals) {
      const count = Math.floor(diff / interval.seconds);
      if (count > 0) {
        return `Il y a ${count} ${interval.label}${count > 1 ? 's' : ''}`;
      }
    }
    return 'À l\'instant';
  }
}