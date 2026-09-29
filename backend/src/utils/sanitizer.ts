import { escape, unescape } from 'html-escaper';

export const sanitizeHtml = (input: string): string => {
  if (!input) return '';
  return escape(input);
};

export const unsanitizeHtml = (input: string): string => {
  if (!input) return '';
  return unescape(input);
};

export const sanitizeObject = <T extends Record<string, any>>(obj: T): T => {
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = sanitizeHtml(value);
    } else if (typeof value === 'object' && value !== null) {
      result[key] = sanitizeObject(value);
    } else {
      result[key] = value;
    }
  }
  return result;
};

export const sanitizeEmail = (email: string): string => {
  if (!email) return '';
  return email.toLowerCase().trim();
};

export const sanitizePhone = (phone: string): string => {
  if (!phone) return '';
  return phone.replace(/[^0-9+]/g, '');
};

export const sanitizeUrl = (url: string): string => {
  if (!url) return '';
  return encodeURI(url);
};

export const sanitizeSlug = (slug: string): string => {
  if (!slug) return '';
  return slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

export const sanitizeFileName = (fileName: string): string => {
  if (!fileName) return '';
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

export const sanitizePhoneInternational = (phone: string): string => {
  if (!phone) return '';
  const cleaned = phone.replace(/[^0-9+]/g, '');
  if (cleaned.startsWith('+')) {
    return cleaned;
  }
  return `+${cleaned}`;
};

export const truncateString = (str: string, maxLength: number, suffix: string = '...'): string => {
  if (!str || str.length <= maxLength) return str;
  return str.substring(0, maxLength) + suffix;
};

export const capitalizeWords = (str: string): string => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const toTitleCase = (str: string): string => {
  if (!str) return '';
  const exceptions = ['de', 'la', 'du', 'des', 'le', 'la', 'les', 'et', 'ou', 'pour', 'par', 'avec'];
  return str
    .toLowerCase()
    .split(' ')
    .map((word, index) => {
      if (index === 0 || !exceptions.includes(word)) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return word;
    })
    .join(' ');
};

export const stripHtml = (html: string): string => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '');
};

export const extractTextFromHtml = (html: string): string => {
  if (!html) return '';
  const stripped = stripHtml(html);
  return stripped.replace(/\s+/g, ' ').trim();
};

export const generateMetaDescription = (content: string, maxLength: number = 160): string => {
  const text = extractTextFromHtml(content);
  return truncateString(text, maxLength);
};

export const normalizeWhitespace = (str: string): string => {
  if (!str) return '';
  return str.replace(/\s+/g, ' ').trim();
};

export const removeAccents = (str: string): string => {
  if (!str) return '';
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

export const toSlug = (str: string): string => {
  if (!str) return '';
  return removeAccents(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};