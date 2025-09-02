import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createAuthMiddleware } from '../../middleware/auth.middleware';
import { AuthService } from '../../services/auth.service';
import { AppError } from '../../utils/appError';

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('../../services/auth.service');

const mockedJwt = jwt as jest.Mocked<typeof jwt>;
const mockedAuthService = AuthService as jest.MockedClass<typeof AuthService>;

describe('Auth Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let authServiceInstance: jest.Mocked<AuthService>;
  let protect: any;

  beforeEach(() => {
    mockReq = {
      headers: {},
      user: undefined
    };
    mockRes = {};
    mockNext = jest.fn();
    
    authServiceInstance = {
      getUserById: jest.fn()
    } as any;
    
    mockedAuthService.mockImplementation(() => authServiceInstance);
    
    // Create middleware with mocked service
    const middleware = createAuthMiddleware(authServiceInstance);
    protect = middleware.protect;
    
    jest.clearAllMocks();
  });

  describe('protect middleware', () => {
    it('should authenticate user with valid token', async () => {
      const userId = 'user123';
      const token = 'valid-jwt-token';
      const mockUser = {
        _id: userId,
        name: 'John Doe',
        email: 'john@example.com',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockReq.headers = {
        authorization: `Bearer ${token}`
      };

      mockedJwt.verify.mockReturnValue({ id: userId } as any);
      authServiceInstance.getUserById.mockResolvedValue(mockUser as any);

      await protect(mockReq as Request, mockRes as Response, mockNext);

      expect(mockedJwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET);
      expect(authServiceInstance.getUserById).toHaveBeenCalledWith(userId);
      expect(mockReq.user).toEqual({
        _id: userId,
        name: mockUser.name,
        email: mockUser.email,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt
      });
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should reject request without authorization header', async () => {
      mockReq.headers = {};

      await protect(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect((mockNext as jest.Mock).mock.calls[0][0].message).toBe('You are not logged in! Please log in to get access.');
      expect((mockNext as jest.Mock).mock.calls[0][0].statusCode).toBe(401);
    });

    it('should reject request with invalid authorization header format', async () => {
      mockReq.headers = {
        authorization: 'InvalidFormat token'
      };

      await protect(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect((mockNext as jest.Mock).mock.calls[0][0].message).toBe('You are not logged in! Please log in to get access.');
      expect((mockNext as jest.Mock).mock.calls[0][0].statusCode).toBe(401);
    });

    it('should reject request with malformed Bearer token', async () => {
      mockReq.headers = {
        authorization: 'Bearer'
      };

      await protect(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect((mockNext as jest.Mock).mock.calls[0][0].message).toBe('You are not logged in! Please log in to get access.');
      expect((mockNext as jest.Mock).mock.calls[0][0].statusCode).toBe(401);
    });

    it('should reject request with invalid JWT token', async () => {
      const token = 'invalid-jwt-token';
      mockReq.headers = {
        authorization: `Bearer ${token}`
      };

      mockedJwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await protect(mockReq as Request, mockRes as Response, mockNext);

      expect(mockedJwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET);
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should reject request if user no longer exists', async () => {
      const userId = 'user123';
      const token = 'valid-jwt-token';

      mockReq.headers = {
        authorization: `Bearer ${token}`
      };

      mockedJwt.verify.mockReturnValue({ id: userId } as any);
      authServiceInstance.getUserById.mockResolvedValue(null);

      await protect(mockReq as Request, mockRes as Response, mockNext);

      expect(mockedJwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET);
      expect(authServiceInstance.getUserById).toHaveBeenCalledWith(userId);
      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect((mockNext as jest.Mock).mock.calls[0][0].message).toBe('The user belonging to this token no longer exists.');
      expect((mockNext as jest.Mock).mock.calls[0][0].statusCode).toBe(401);
    });

    it('should handle JWT verification errors', async () => {
      const token = 'expired-jwt-token';
      mockReq.headers = {
        authorization: `Bearer ${token}`
      };

      mockedJwt.verify.mockImplementation(() => {
        throw new jwt.TokenExpiredError('Token expired', new Date());
      });

      await protect(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(jwt.TokenExpiredError));
    });

    it('should handle malformed JWT token', async () => {
      const token = 'malformed-token';
      mockReq.headers = {
        authorization: `Bearer ${token}`
      };

      mockedJwt.verify.mockImplementation(() => {
        throw new jwt.JsonWebTokenError('Malformed token');
      });

      await protect(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(jwt.JsonWebTokenError));
    });

    it('should set user object with correct structure', async () => {
      const userId = 'user123';
      const token = 'valid-jwt-token';
      const mockUser = {
        _id: userId,
        name: 'John Doe',
        email: 'john@example.com',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02')
      };

      mockReq.headers = {
        authorization: `Bearer ${token}`
      };

      mockedJwt.verify.mockReturnValue({ id: userId } as any);
      authServiceInstance.getUserById.mockResolvedValue(mockUser as any);

      await protect(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.user).toEqual({
        _id: userId,
        name: mockUser.name,
        email: mockUser.email,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt
      });
    });
  });
});
