import { hashPassword, comparePasswords, validatePasswordStrength } from '@utils/password';
import bcrypt from 'bcryptjs';
import { env } from '@config/env';

jest.mock('bcryptjs');

describe('Password Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('hashPassword', () => {
    it('should hash a password successfully', async () => {
      const password = 'Test123!@#';
      const salt = 'mock-salt';
      const hash = 'mock-hash';

      (bcrypt.genSalt as jest.Mock).mockResolvedValue(salt);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hash);

      const result = await hashPassword(password);

      expect(result).toBe(hash);
      expect(bcrypt.genSalt).toHaveBeenCalledWith(env.BCRYPT_ROUNDS);
      expect(bcrypt.hash).toHaveBeenCalledWith(password, salt);
    });

    it('should throw error if hashing fails', async () => {
      const password = 'Test123!@#';
      (bcrypt.genSalt as jest.Mock).mockRejectedValue(new Error('Hashing error'));

      await expect(hashPassword(password)).rejects.toThrow();
    });
  });

  describe('comparePasswords', () => {
    it('should return true for matching passwords', async () => {
      const password = 'Test123!@#';
      const hashedPassword = 'mock-hash';

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await comparePasswords(password, hashedPassword);

      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
    });

    it('should return false for non-matching passwords', async () => {
      const password = 'WrongPassword';
      const hashedPassword = 'mock-hash';

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await comparePasswords(password, hashedPassword);

      expect(result).toBe(false);
    });

    it('should throw error if comparison fails', async () => {
      const password = 'Test123!@#';
      const hashedPassword = 'mock-hash';

      (bcrypt.compare as jest.Mock).mockRejectedValue(new Error('Comparison error'));

      await expect(comparePasswords(password, hashedPassword)).rejects.toThrow();
    });
  });

  describe('validatePasswordStrength', () => {
    it('should return valid for strong password', () => {
      const password = 'Test123!@#';
      const result = validatePasswordStrength(password);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return errors for weak password', () => {
      const password = 'weak';
      const result = validatePasswordStrength(password);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });

    it('should return error if no uppercase letter', () => {
      const password = 'test123!@#';
      const result = validatePasswordStrength(password);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('should return error if no lowercase letter', () => {
      const password = 'TEST123!@#';
      const result = validatePasswordStrength(password);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    it('should return error if no number', () => {
      const password = 'TestPassword!@#';
      const result = validatePasswordStrength(password);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });

    it('should return error if no special character', () => {
      const password = 'Test123456';
      const result = validatePasswordStrength(password);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one special character');
    });
  });
});