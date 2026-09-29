export class StringHelper {
  static capitalize(str: string): string {
    if (!str || str.length === 0) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  static capitalizeAll(str: string): string {
    if (!str || str.length === 0) return str;
    return str.split(' ').map(word => this.capitalize(word)).join(' ');
  }

  static titleCase(str: string): string {
    if (!str || str.length === 0) return str;
    const exceptions = ['de', 'la', 'du', 'des', 'le', 'la', 'les', 'et', 'ou', 'pour', 'par', 'avec'];
    return str
      .toLowerCase()
      .split(' ')
      .map((word, index) => {
        if (index === 0 || !exceptions.includes(word)) {
          return this.capitalize(word);
        }
        return word;
      })
      .join(' ');
  }

  static truncate(str: string, length: number, suffix: string = '...'): string {
    if (!str || str.length <= length) return str;
    return str.substring(0, length) + suffix;
  }

  static truncateWords(str: string, wordCount: number): string {
    if (!str) return str;
    const words = str.split(' ');
    if (words.length <= wordCount) return str;
    return words.slice(0, wordCount).join(' ') + '...';
  }

  static removeAccents(str: string): string {
    if (!str) return str;
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  static toKebabCase(str: string): string {
    if (!str) return str;
    return this.removeAccents(str)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }

  static toSnakeCase(str: string): string {
    if (!str) return str;
    return this.removeAccents(str)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s_]/g, '')
      .replace(/\s+/g, '_')
      .replace(/__+/g, '_')
      .replace(/^_+/, '')
      .replace(/_+$/, '');
  }

  static toCamelCase(str: string): string {
    if (!str) return str;
    return str
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase());
  }

  static toPascalCase(str: string): string {
    if (!str) return str;
    const camel = this.toCamelCase(str);
    return camel.charAt(0).toUpperCase() + camel.slice(1);
  }

  static toSentenceCase(str: string): string {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  static reverse(str: string): string {
    if (!str) return str;
    return str.split('').reverse().join('');
  }

  static isPalindrome(str: string): boolean {
    if (!str) return false;
    const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');
    return cleaned === cleaned.split('').reverse().join('');
  }

  static countWords(str: string): number {
    if (!str) return 0;
    return str.trim().split(/\s+/).length;
  }

  static countCharacters(str: string): number {
    if (!str) return 0;
    return str.length;
  }

  static countSentences(str: string): number {
    if (!str) return 0;
    return str.split(/[.!?]+/).filter(Boolean).length;
  }

  static isEmail(str: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(str);
  }

  static isPhone(str: string): boolean {
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    return phoneRegex.test(str);
  }

  static isUrl(str: string): boolean {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  }

  static isSlug(str: string): boolean {
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    return slugRegex.test(str);
  }

  static isAlpha(str: string): boolean {
    return /^[a-zA-Z]+$/.test(str);
  }

  static isAlphaNumeric(str: string): boolean {
    return /^[a-zA-Z0-9]+$/.test(str);
  }

  static isNumeric(str: string): boolean {
    return /^\d+$/.test(str);
  }

  static isDecimal(str: string): boolean {
    return /^\d+(\.\d+)?$/.test(str);
  }

  static isUpperCase(str: string): boolean {
    return str === str.toUpperCase();
  }

  static isLowerCase(str: string): boolean {
    return str === str.toLowerCase();
  }

  static toBase64(str: string): string {
    return Buffer.from(str).toString('base64');
  }

  static fromBase64(str: string): string {
    return Buffer.from(str, 'base64').toString();
  }

  static escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  static unescapeHtml(str: string): string {
    return str
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'");
  }

  static stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '');
  }

  static extractEmails(str: string): string[] {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    return str.match(emailRegex) || [];
  }

  static extractUrls(str: string): string[] {
    const urlRegex = /https?:\/\/[^\s]+/g;
    return str.match(urlRegex) || [];
  }

  static generateRandomString(length: number = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  static maskEmail(email: string): string {
    const [username, domain] = email.split('@');
    const maskedUsername = username.charAt(0) + '*'.repeat(Math.min(username.length - 2, 5)) + username.charAt(username.length - 1);
    return `${maskedUsername}@${domain}`;
  }

  static maskPhone(phone: string): string {
    if (!phone || phone.length < 6) return phone;
    const visible = phone.substring(0, 3) + phone.substring(phone.length - 2);
    return visible.padStart(phone.length, '*');
  }

  static normalizeWhitespace(str: string): string {
    return str.replace(/\s+/g, ' ').trim();
  }
}