export class ValidationHelper {
  static isEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isPhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    return phoneRegex.test(phone);
  }

  static isUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static isSlug(slug: string): boolean {
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    return slugRegex.test(slug);
  }

  static isUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
    return uuidRegex.test(uuid);
  }

  static isDate(date: string): boolean {
    const dateObj = new Date(date);
    return !isNaN(dateObj.getTime());
  }

  static isDateTime(dateTime: string): boolean {
    const dateObj = new Date(dateTime);
    return !isNaN(dateObj.getTime());
  }

  static isTime(time: string): boolean {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
    return timeRegex.test(time);
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

  static isInteger(str: string): boolean {
    return /^-?\d+$/.test(str);
  }

  static isFloat(str: string): boolean {
    return /^-?\d+(\.\d+)?$/.test(str);
  }

  static isBoolean(str: string): boolean {
    return str === 'true' || str === 'false' || str === '1' || str === '0';
  }

  static isJSON(str: string): boolean {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  }

  static isArray(obj: any): boolean {
    return Array.isArray(obj);
  }

  static isObject(obj: any): boolean {
    return obj !== null && typeof obj === 'object' && !Array.isArray(obj);
  }

  static isString(str: any): boolean {
    return typeof str === 'string';
  }

  static isNumber(num: any): boolean {
    return typeof num === 'number' && !isNaN(num);
  }

  static isIntegerNumber(num: any): boolean {
    return Number.isInteger(num);
  }

  static isPositiveNumber(num: any): boolean {
    return this.isNumber(num) && num > 0;
  }

  static isNegativeNumber(num: any): boolean {
    return this.isNumber(num) && num < 0;
  }

  static isZero(num: any): boolean {
    return this.isNumber(num) && num === 0;
  }

  static isBetween(num: number, min: number, max: number, inclusive: boolean = true): boolean {
    if (inclusive) {
      return num >= min && num <= max;
    }
    return num > min && num < max;
  }

  static isLength(str: string, min: number, max: number): boolean {
    return str.length >= min && str.length <= max;
  }

  static isMinLength(str: string, min: number): boolean {
    return str.length >= min;
  }

  static isMaxLength(str: string, max: number): boolean {
    return str.length <= max;
  }

  static isEqual(value1: any, value2: any): boolean {
    return value1 === value2;
  }

  static isInArray(value: any, array: any[]): boolean {
    return array.includes(value);
  }

  static isNotInArray(value: any, array: any[]): boolean {
    return !array.includes(value);
  }

  static isUnique(array: any[]): boolean {
    return new Set(array).size === array.length;
  }

  static isPhoneInternational(phone: string): boolean {
    const phoneRegex = /^\+(?:[0-9] ?){6,14}[0-9]$/;
    return phoneRegex.test(phone);
  }

  static isPhoneFrench(phone: string): boolean {
    const phoneRegex = /^(\+33|0)[1-9](\d{2}){4}$/;
    return phoneRegex.test(phone);
  }

  static isPhoneMalagasy(phone: string): boolean {
    const phoneRegex = /^(\+261|0)[3-9]\d{8}$/;
    return phoneRegex.test(phone);
  }

  static isPasswordStrong(password: string): boolean {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  static isPasswordMedium(password: string): boolean {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return passwordRegex.test(password);
  }

  static isPasswordWeak(password: string): boolean {
    return password.length >= 8;
  }

  static isHexColor(hex: string): boolean {
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexRegex.test(hex);
  }

  static isRGBColor(rgb: string): boolean {
    const rgbRegex = /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/;
    return rgbRegex.test(rgb);
  }

  static isIPAddress(ip: string): boolean {
    const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipv4Regex.test(ip);
  }

  static isHTML(html: string): boolean {
    const htmlRegex = /<[^>]*>/;
    return htmlRegex.test(html);
  }

  static isBase64(str: string): boolean {
    const base64Regex = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$/;
    return base64Regex.test(str);
  }

  static validatePassword(password: string): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}