import { registerValidator, loginValidator, refreshTokenValidator } from '@validators/auth.validator';
import { validate } from '@middlewares/validate.middleware';
import { Request, Response, NextFunction } from 'express';

describe('Auth Validators', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock<NextFunction>;

  beforeEach(() => {
    req = { body: {} };
    res = {};
    next = jest.fn();
  });

  describe('registerValidator', () => {
    it('should validate valid registration data', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'Test123!@#',
        firstName: 'Test',
        lastName: 'User',
        phone: '+261331234567',
      };

      const validation = validate(registerValidator);
      await validation(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalledWith(expect.any(Error));
    });

    it('should reject invalid email', async () => {
      req.body = {
        email: 'invalid-email',
        password: 'Test123!@#',
        firstName: 'Test',
        lastName: 'User',
      };

      const validation = validate(registerValidator);
      await validation(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should reject password that is too short', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'Test1!',
        firstName: 'Test',
        lastName: 'User',
      };

      const validation = validate(registerValidator);
      await validation(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should reject password without uppercase', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'test123!@#',
        firstName: 'Test',
        lastName: 'User',
      };

      const validation = validate(registerValidator);
      await validation(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should reject missing first name', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'Test123!@#',
        lastName: 'User',
      };

      const validation = validate(registerValidator);
      await validation(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should reject missing last name', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'Test123!@#',
        firstName: 'Test',
      };

      const validation = validate(registerValidator);
      await validation(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('loginValidator', () => {
    it('should validate valid login data', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'Test123!@#',
      };

      const validation = validate(loginValidator);
      await validation(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalledWith(expect.any(Error));
    });

    it('should reject invalid email', async () => {
      req.body = {
        email: 'invalid-email',
        password: 'Test123!@#',
      };

      const validation = validate(loginValidator);
      await validation(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should reject missing password', async () => {
      req.body = {
        email: 'test@example.com',
      };

      const validation = validate(loginValidator);
      await validation(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('refreshTokenValidator', () => {
    it('should validate valid refresh token data', async () => {
      req.body = {
        refreshToken: 'valid-refresh-token',
      };

      const validation = validate(refreshTokenValidator);
      await validation(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalledWith(expect.any(Error));
    });

    it('should reject missing refresh token', async () => {
      req.body = {};

      const validation = validate(refreshTokenValidator);
      await validation(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});