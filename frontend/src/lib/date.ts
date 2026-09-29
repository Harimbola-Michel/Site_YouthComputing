import {
  format,
  formatDistance,
  formatRelative,
  parseISO,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  addDays,
  addMonths,
  addYears,
  isToday,
  isTomorrow,
  isYesterday,
  isThisWeek,
  isThisMonth,
  isThisYear,
} from 'date-fns';
import { fr } from 'date-fns/locale';

export const dateUtils = {
  // Formatage
  format: (date: string | Date, pattern: string = 'dd/MM/yyyy') => {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, pattern, { locale: fr });
  },

  formatDateTime: (date: string | Date) => {
    return dateUtils.format(date, 'dd/MM/yyyy HH:mm');
  },

  formatTime: (date: string | Date) => {
    return dateUtils.format(date, 'HH:mm');
  },

  // Relatif
  relative: (date: string | Date) => {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return formatDistance(d, new Date(), { addSuffix: true, locale: fr });
  },

  relativeShort: (date: string | Date) => {
    const d = typeof date === 'string' ? parseISO(date) : date;
    const diff = differenceInMinutes(new Date(), d);
    if (diff < 1) return 'À l\'instant';
    if (diff < 60) return `${diff} min`;
    if (diff < 1440) return `${Math.floor(diff / 60)} h`;
    if (diff < 43200) return `${Math.floor(diff / 1440)} j`;
    return dateUtils.format(date);
  },

  // Comparaisons
  isToday,
  isTomorrow,
  isYesterday,
  isThisWeek,
  isThisMonth,
  isThisYear,

  // Différences
  daysBetween: (start: string | Date, end: string | Date) => {
    const s = typeof start === 'string' ? parseISO(start) : start;
    const e = typeof end === 'string' ? parseISO(end) : end;
    return differenceInDays(e, s);
  },

  hoursBetween: (start: string | Date, end: string | Date) => {
    const s = typeof start === 'string' ? parseISO(start) : start;
    const e = typeof end === 'string' ? parseISO(end) : end;
    return differenceInHours(e, s);
  },

  minutesBetween: (start: string | Date, end: string | Date) => {
    const s = typeof start === 'string' ? parseISO(start) : start;
    const e = typeof end === 'string' ? parseISO(end) : end;
    return differenceInMinutes(e, s);
  },

  // Manipulations
  addDays: (date: string | Date, amount: number) => {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return addDays(d, amount);
  },

  addMonths: (date: string | Date, amount: number) => {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return addMonths(d, amount);
  },

  addYears: (date: string | Date, amount: number) => {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return addYears(d, amount);
  },

  // Utilitaires
  parse: (dateStr: string) => parseISO(dateStr),

  toDate: (date: string | Date) => {
    return typeof date === 'string' ? parseISO(date) : date;
  },

  isValid: (date: any) => {
    const d = new Date(date);
    return !isNaN(d.getTime());
  },

  startOfDay: (date: string | Date) => {
    const d = typeof date === 'string' ? parseISO(date) : date;
    d.setHours(0, 0, 0, 0);
    return d;
  },

  endOfDay: (date: string | Date) => {
    const d = typeof date === 'string' ? parseISO(date) : date;
    d.setHours(23, 59, 59, 999);
    return d;
  },

  getAge: (birthdate: string | Date) => {
    const d = typeof birthdate === 'string' ? parseISO(birthdate) : birthdate;
    const today = new Date();
    let age = today.getFullYear() - d.getFullYear();
    const m = today.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) {
      age--;
    }
    return age;
  },
};

export default dateUtils;