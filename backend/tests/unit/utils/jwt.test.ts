import { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken, decodeToken } from '@utils/jwt';
import jwt from 'jsonwebtoken';
import { env } from '@config/env';

jest.mock('jsonwebtoken');

describe('JWT Utils', () => {
  const mockPayload = {
    userId: 'user-1',
    email: 'test@example.com',
    role: 'VIEWER',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateAccessToken', () => {
    it('should generate an access token', () => {
      const mockToken = 'mock-access-token';
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      const token = generateAccessToken(mockPayload);

      expect(token).toBe(mockToken);
      expect(jwt.sign).toHaveBeenCalledWith(
        mockPayload,
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN }
      );
    });

    it('should throw error if signing fails', () => {
      (jwt.sign as jest.Mock).mockImplementation(() => {
        throw new Error('Signing error');
      });

      expect(() => generateAccessToken(mockPayload)).toThrow();
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a refresh token', () => {
      const mockToken = 'mock-refresh-token';
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      const token = generateRefreshToken(mockPayload);

      expect(token).toBe(mockToken);
      expect(jwt.sign).toHaveBeenCalledWith(
        mockPayload,
        env.JWT_REFRESH_SECRET,
        { expiresIn: env.JWT_REFRESH_EXPIRES_IN }
      );
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify a valid access token', () => {
      const mockToken = 'mock-token';
      const mockDecoded = { ...mockPayload, iat: 123456, exp: 123456789 };
      (jwt.verify as jest.Mock).mockReturnValue(mockDecoded);

      const result = verifyAccessToken(mockToken);

      expect(result).toEqual(mockDecoded);
      expect(jwt.verify).toHaveBeenCalledWith(mockToken, env.JWT_SECRET);
    });

    it('should return null for invalid token', () => {
      const mockToken = 'invalid-token';
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = verifyAccessToken(mockToken);

      expect(result).toBeNull();
    });

    it('should return null for expired token', () => {
      const mockToken = 'expired-token';
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new jwt.TokenExpiredError('Token expired', new Date());
      });

      const result = verifyAccessToken(mockToken);

      expect(result).toBeNull();
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify a valid refresh token', () => {
      const mockToken = 'mock-refresh-token';
      const mockDecoded = { ...mockPayload, iat: 123456, exp: 123456789 };
      (jwt.verify as jest.Mock).mockReturnValue(mockDecoded);

      const result = verifyRefreshToken(mockToken);

      expect(result).toEqual(mockDecoded);
      expect(jwt.verify).toHaveBeenCalledWith(mockToken, env.JWT_REFRESH_SECRET);
    });

    it('should return null for invalid refresh token', () => {
      const mockToken = 'invalid-token';
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = verifyRefreshToken(mockToken);

      expect(result).toBeNull();
    });
  });

  describe('decodeToken', () => {
    it('should decode a token without verification', () => {
      const mockToken = 'mock-token';
      const mockDecoded = { ...mockPayload, iat: 123456 };
      (jwt.decode as jest.Mock).mockReturnValue(mockDecoded);

      const result = decodeToken(mockToken);

      expect(result).toEqual(mockDecoded);
      expect(jwt.decode).toHaveBeenCalledWith(mockToken);
    });

    it('should return null if decoding fails', () => {
      const mockToken = 'invalid-token';
      (jwt.decode as jest.Mock).mockImplementation(() => {
        throw new Error('Decode error');
      });

      const result = decodeToken(mockToken);

      expect(result).toBeNull();
    });
  });
});