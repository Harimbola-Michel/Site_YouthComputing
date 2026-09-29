import { AuthService } from '@services/auth.service';
import { UserRepository } from '@repositories/user.repository';
import { RefreshTokenRepository } from '@repositories/refreshToken.repository';
import { ActivityLogRepository } from '@repositories/activityLog.repository';
import { hashPassword, comparePasswords } from '@utils/password';
import { generateAccessToken, generateRefreshToken } from '@utils/jwt';
import { ApiError } from '@utils/ApiError';

jest.mock('@repositories/user.repository');
jest.mock('@repositories/refreshToken.repository');
jest.mock('@repositories/activityLog.repository');
jest.mock('@utils/password');
jest.mock('@utils/jwt');
jest.mock('@config/mailer');

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: jest.Mocked<UserRepository>;
  let refreshTokenRepository: jest.Mocked<RefreshTokenRepository>;
  let activityLogRepository: jest.Mocked<ActivityLogRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    authService = new AuthService();
    userRepository = new UserRepository() as jest.Mocked<UserRepository>;
    refreshTokenRepository = new RefreshTokenRepository() as jest.Mocked<RefreshTokenRepository>;
    activityLogRepository = new ActivityLogRepository() as jest.Mocked<ActivityLogRepository>;
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Test123!@#',
        firstName: 'Test',
        lastName: 'User',
      };

      const hashedPassword = 'hashed-password';
      const mockUser = {
        id: 'user-1',
        email: userData.email,
        password_hash: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: 'VIEWER',
        status: 'PENDING',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        phone: null,
        avatar: null,
        bio: null,
        lastLogin: null,
        emailVerified: null,
      };

      (hashPassword as jest.Mock).mockResolvedValue(hashedPassword);
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.create.mockResolvedValue(mockUser);
      (generateAccessToken as jest.Mock).mockReturnValue('access-token');
      (generateRefreshToken as jest.Mock).mockReturnValue('refresh-token');
      refreshTokenRepository.create.mockResolvedValue({
        id: 'rt-1',
        token: 'refresh-token',
        userId: 'user-1',
        expiresAt: new Date(),
        isRevoked: false,
        createdAt: new Date(),
      });

      const result = await authService.register(userData);

      expect(result.user).toBeDefined();
      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(userRepository.create).toHaveBeenCalled();
    });

    it('should throw error if email already exists', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'Test123!@#',
        firstName: 'Test',
        lastName: 'User',
      };

      userRepository.findByEmail.mockResolvedValue({ id: 'user-1' } as any);

      await expect(authService.register(userData)).rejects.toThrow(ApiError);
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const email = 'test@example.com';
      const password = 'Test123!@#';
      const ipAddress = '127.0.0.1';

      const mockUser = {
        id: 'user-1',
        email,
        password_hash: 'hashed-password',
        firstName: 'Test',
        lastName: 'User',
        role: 'VIEWER',
        status: 'ACTIVE',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        phone: null,
        avatar: null,
        bio: null,
        lastLogin: null,
        emailVerified: new Date(),
      };

      userRepository.findByEmail.mockResolvedValue(mockUser);
      (comparePasswords as jest.Mock).mockResolvedValue(true);
      (generateAccessToken as jest.Mock).mockReturnValue('access-token');
      (generateRefreshToken as jest.Mock).mockReturnValue('refresh-token');
      refreshTokenRepository.create.mockResolvedValue({
        id: 'rt-1',
        token: 'refresh-token',
        userId: 'user-1',
        expiresAt: new Date(),
        isRevoked: false,
        createdAt: new Date(),
      });
      userRepository.updateLastLogin.mockResolvedValue(mockUser);
      activityLogRepository.create.mockResolvedValue({ id: 'log-1' } as any);

      const result = await authService.login(email, password, ipAddress);

      expect(result.user).toBeDefined();
      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
    });

    it('should throw error with invalid credentials', async () => {
      const email = 'test@example.com';
      const password = 'wrong-password';
      const ipAddress = '127.0.0.1';

      const mockUser = {
        id: 'user-1',
        email,
        password_hash: 'hashed-password',
        firstName: 'Test',
        lastName: 'User',
        role: 'VIEWER',
        status: 'ACTIVE',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        phone: null,
        avatar: null,
        bio: null,
        lastLogin: null,
        emailVerified: new Date(),
      };

      userRepository.findByEmail.mockResolvedValue(mockUser);
      (comparePasswords as jest.Mock).mockResolvedValue(false);
      activityLogRepository.create.mockResolvedValue({ id: 'log-1' } as any);

      await expect(authService.login(email, password, ipAddress)).rejects.toThrow(ApiError);
    });

    it('should throw error if user is inactive', async () => {
      const email = 'test@example.com';
      const password = 'Test123!@#';
      const ipAddress = '127.0.0.1';

      const mockUser = {
        id: 'user-1',
        email,
        password_hash: 'hashed-password',
        firstName: 'Test',
        lastName: 'User',
        role: 'VIEWER',
        status: 'ACTIVE',
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        phone: null,
        avatar: null,
        bio: null,
        lastLogin: null,
        emailVerified: new Date(),
      };

      userRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(authService.login(email, password, ipAddress)).rejects.toThrow(ApiError);
    });
  });
});