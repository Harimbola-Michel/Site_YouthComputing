import { format, formatDistance, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export const formatters = {
  date: (date: string | Date) => {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, 'dd/MM/yyyy', { locale: fr });
  },

  dateTime: (date: string | Date) => {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, 'dd/MM/yyyy HH:mm', { locale: fr });
  },

  time: (date: string | Date) => {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, 'HH:mm', { locale: fr });
  },

  relativeDate: (date: string | Date) => {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return formatDistance(d, new Date(), { addSuffix: true, locale: fr });
  },

  currency: (amount: number, currency: string = 'MGA') => {
    return new Intl.NumberFormat('fr-MG', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(amount);
  },

  number: (num: number, decimals: number = 0) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  },

  percentage: (value: number, decimals: number = 1) => {
    return `${formatters.number(value * 100, decimals)}%`;
  },

  truncate: (text: string, length: number = 100) => {
    if (text.length <= length) return text;
    return text.slice(0, length) + '...';
  },

  capitalize: (text: string) => {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  },

  titleCase: (text: string) => {
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  },

  status: {
    active: 'Actif',
    inactive: 'Inactif',
    pending: 'En attente',
    suspended: 'Suspendu',
    published: 'Publié',
    draft: 'Brouillon',
    archived: 'Archivé',
    confirmed: 'Confirmé',
    cancelled: 'Annulé',
    completed: 'Terminé',
  },

  role: {
    SUPER_ADMIN: 'Super Administrateur',
    ADMIN: 'Administrateur',
    EDITOR: 'Éditeur',
    CONTRIBUTOR: 'Contributeur',
    VIEWER: 'Visiteur',
  },

  paymentStatus: {
    PENDING: 'En attente',
    PAID: 'Payé',
    FAILED: 'Échoué',
    REFUNDED: 'Remboursé',
    PARTIAL: 'Partiel',
  },

  registrationStatus: {
    PENDING: 'En attente',
    CONFIRMED: 'Confirmé',
    CANCELLED: 'Annulé',
    COMPLETED: 'Terminé',
    WAITING_LIST: 'Liste d\'attente',
  },
};

export default formatters;