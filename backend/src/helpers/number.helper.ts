export class NumberHelper {
  static formatNumber(number: number, decimals: number = 0): string {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(number);
  }

  static formatCurrency(amount: number, currency: string = 'MGA'): string {
    return new Intl.NumberFormat('fr-MG', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  }

  static formatPercentage(value: number, decimals: number = 1): string {
    return `${this.formatNumber(value * 100, decimals)}%`;
  }

  static round(value: number, decimals: number = 0): number {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  }

  static floor(value: number, decimals: number = 0): number {
    const factor = Math.pow(10, decimals);
    return Math.floor(value * factor) / factor;
  }

  static ceil(value: number, decimals: number = 0): number {
    const factor = Math.pow(10, decimals);
    return Math.ceil(value * factor) / factor;
  }

  static clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  static random(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  static randomInt(min: number, max: number): number {
    return Math.floor(this.random(min, max + 1));
  }

  static isEven(value: number): boolean {
    return value % 2 === 0;
  }

  static isOdd(value: number): boolean {
    return value % 2 !== 0;
  }

  static isPositive(value: number): boolean {
    return value > 0;
  }

  static isNegative(value: number): boolean {
    return value < 0;
  }

  static isZero(value: number): boolean {
    return value === 0;
  }

  static sum(numbers: number[]): number {
    return numbers.reduce((sum, value) => sum + value, 0);
  }

  static average(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return this.sum(numbers) / numbers.length;
  }

  static min(numbers: number[]): number {
    return Math.min(...numbers);
  }

  static max(numbers: number[]): number {
    return Math.max(...numbers);
  }

  static median(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
      return (sorted[mid - 1] + sorted[mid]) / 2;
    }
    return sorted[mid];
  }

  static mode(numbers: number[]): number[] {
    const counts = new Map<number, number>();
    let maxCount = 0;
    for (const num of numbers) {
      const count = (counts.get(num) || 0) + 1;
      counts.set(num, count);
      if (count > maxCount) maxCount = count;
    }
    return Array.from(counts.entries())
      .filter(([_, count]) => count === maxCount)
      .map(([num]) => num);
  }

  static variance(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    const mean = this.average(numbers);
    return numbers.reduce((sum, num) => sum + Math.pow(num - mean, 2), 0) / numbers.length;
  }

  static standardDeviation(numbers: number[]): number {
    return Math.sqrt(this.variance(numbers));
  }

  static percentChange(current: number, previous: number): number {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  }

  static lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t;
  }

  static mapRange(value: number, fromMin: number, fromMax: number, toMin: number, toMax: number): number {
    return ((value - fromMin) / (fromMax - fromMin)) * (toMax - toMin) + toMin;
  }

  static isBetween(value: number, min: number, max: number, inclusive: boolean = true): boolean {
    if (inclusive) {
      return value >= min && value <= max;
    }
    return value > min && value < max;
  }

  static toFixed(value: number, decimals: number = 0): string {
    return value.toFixed(decimals);
  }

  static toPrecision(value: number, precision: number = 1): string {
    return value.toPrecision(precision);
  }

  static toExponential(value: number, fractionDigits: number = 0): string {
    return value.toExponential(fractionDigits);
  }

  static isInteger(value: number): boolean {
    return Number.isInteger(value);
  }

  static isFloat(value: number): boolean {
    return !Number.isInteger(value);
  }

  static isFiniteNumber(value: number): boolean {
    return Number.isFinite(value);
  }

  static isNaN(value: number): boolean {
    return Number.isNaN(value);
  }

  static degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  static radiansToDegrees(radians: number): number {
    return radians * (180 / Math.PI);
  }
}