import { Request, Response, NextFunction } from 'express';
import { createAuthController } from '../../controllers/auth.controller';
import { AuthService } from '../../services/auth.service';
import { AppError } from '../../utils/appError';

// Mock the AuthService
jest.mock('../../services/auth.service');
const mockedAuthService = AuthService as jest.MockedClass<typeof AuthService>;

describe('Auth Controller', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let authServiceInstance: jest.Mocked<AuthService>;
  let register: any;
  let login: any;

  beforeEach(() => {
    mockReq = {
      body: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
    
    authServiceInstance = {
      register: jest.fn(),
      login: jest.fn(),
      getUserById: jest.fn()
    } as any;
    
    mockedAuthService.mockImplementation(() => authServiceInstance);
    
    // Create controller with mocked service
    const controller = createAuthController(authServiceInstance);
    register = controller.register;
    login = controller.login;
    
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      const mockResult = {
        user: {
          _id: 'user123',
          name: userData.name,
          email: userData.email,
          createdAt: new Date(),
          updatedAt: new Date()
        } as any,
        token: 'jwt-token'
      };

      mockReq.body = userData;
      authServiceInstance.register.mockResolvedValue(mockResult);

      await register(mockReq as Request, mockRes as Response, mockNext);

      expect(authServiceInstance.register).toHaveBeenCalledWith(userData);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        token: mockResult.token,
        data: {
          user: mockResult.user
        }
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle registration errors', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      const error = new AppError('User already exists', 400);
      mockReq.body = userData;
      authServiceInstance.register.mockRejectedValue(error);

      await register(mockReq as Request, mockRes as Response, mockNext);

      expect(authServiceInstance.register).toHaveBeenCalledWith(userData);
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      const error = new Error('Database connection failed');
      mockReq.body = userData;
      authServiceInstance.register.mockRejectedValue(error);

      await register(mockReq as Request, mockRes as Response, mockNext);

      expect(authServiceInstance.register).toHaveBeenCalledWith(userData);
      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should handle missing request body', async () => {
      mockReq.body = {};

      await register(mockReq as Request, mockRes as Response, mockNext);

      expect(authServiceInstance.register).toHaveBeenCalledWith({
        name: undefined,
        email: undefined,
        password: undefined
      });
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const loginData = {
        email: 'john@example.com',
        password: 'password123'
      };

      const mockResult = {
        user: {
          _id: 'user123',
          name: 'John Doe',
          email: loginData.email,
          createdAt: new Date(),
          updatedAt: new Date()
        } as any,
        token: 'jwt-token'
      };

      mockReq.body = loginData;
      authServiceInstance.login.mockResolvedValue(mockResult);

      await login(mockReq as Request, mockRes as Response, mockNext);

      expect(authServiceInstance.login).toHaveBeenCalledWith(loginData);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        token: mockResult.token,
        data: {
          user: mockResult.user
        }
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle login errors', async () => {
      const loginData = {
        email: 'john@example.com',
        password: 'wrongpassword'
      };

      const error = new AppError('Incorrect email or password', 401);
      mockReq.body = loginData;
      authServiceInstance.login.mockRejectedValue(error);

      await login(mockReq as Request, mockRes as Response, mockNext);

      expect(authServiceInstance.login).toHaveBeenCalledWith(loginData);
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      const loginData = {
        email: 'john@example.com',
        password: 'password123'
      };

      const error = new Error('Database connection failed');
      mockReq.body = loginData;
      authServiceInstance.login.mockRejectedValue(error);

      await login(mockReq as Request, mockRes as Response, mockNext);

      expect(authServiceInstance.login).toHaveBeenCalledWith(loginData);
      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should handle missing request body', async () => {
      mockReq.body = {};

      await login(mockReq as Request, mockRes as Response, mockNext);

      expect(authServiceInstance.login).toHaveBeenCalledWith({
        email: undefined,
        password: undefined
      });
    });

    it('should handle validation errors from service', async () => {
      const loginData = {
        email: '',
        password: ''
      };

      const error = new AppError('Please provide email and password!', 400);
      mockReq.body = loginData;
      authServiceInstance.login.mockRejectedValue(error);

      await login(mockReq as Request, mockRes as Response, mockNext);

      expect(authServiceInstance.login).toHaveBeenCalledWith(loginData);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
