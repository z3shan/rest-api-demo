import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { AppError } from '../../utils/appError';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Mock dependencies
jest.mock('../../models/user.model');
jest.mock('jsonwebtoken');
jest.mock('bcryptjs');

const mockedUser = User as jest.Mocked<typeof User>;
const mockedJwt = jwt as jest.Mocked<typeof jwt>;
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    // Set up environment variables for testing
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRES_IN = '90d';
    
    authService = new AuthService();
    jest.clearAllMocks();
  });

  describe('register', () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123'
    };

    it('should register a new user successfully', async () => {
      const mockUser = {
        _id: 'user123',
        name: userData.name,
        email: userData.email,
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
        toObject: jest.fn().mockReturnValue({
          _id: 'user123',
          name: userData.name,
          email: userData.email,
          createdAt: new Date(),
          updatedAt: new Date()
        })
      };

      mockedUser.findOne.mockResolvedValue(null);
      mockedUser.create.mockResolvedValue(mockUser as any);
      mockedJwt.sign.mockReturnValue('jwt-token' as any);

      const result = await authService.register(userData);

      expect(mockedUser.findOne).toHaveBeenCalledWith({ email: userData.email });
      expect(mockedUser.create).toHaveBeenCalledWith(userData);
      expect(mockedJwt.sign).toHaveBeenCalledWith({ id: 'user123' }, undefined, expect.any(Object));
      expect(result.user).toEqual(expect.objectContaining({
        name: userData.name,
        email: userData.email
      }));
      expect(result.token).toBe('jwt-token');
    });

    it('should throw error if user already exists', async () => {
      const existingUser = {
        _id: 'user123',
        name: 'Existing User',
        email: userData.email
      };

      mockedUser.findOne.mockResolvedValue(existingUser as any);

      await expect(authService.register(userData)).rejects.toThrow(AppError);
      await expect(authService.register(userData)).rejects.toThrow('A user with this email already exists.');
    });

    it('should exclude password from returned user object', async () => {
      const mockUser = {
        _id: 'user123',
        name: userData.name,
        email: userData.email,
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
        toObject: jest.fn().mockReturnValue({
          _id: 'user123',
          name: userData.name,
          email: userData.email,
          password: 'hashedPassword',
          createdAt: new Date(),
          updatedAt: new Date()
        })
      };

      mockedUser.findOne.mockResolvedValue(null);
      mockedUser.create.mockResolvedValue(mockUser as any);
      mockedJwt.sign.mockReturnValue('jwt-token' as any);

      const result = await authService.register(userData);

      expect(result.user).not.toHaveProperty('password');
    });
  });

  describe('login', () => {
    const loginData = {
      email: 'john@example.com',
      password: 'password123'
    };

    it('should login user with correct credentials', async () => {
      const mockUser = {
        _id: 'user123',
        name: 'John Doe',
        email: loginData.email,
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
        comparePassword: jest.fn().mockResolvedValue(true),
        toObject: jest.fn().mockReturnValue({
          _id: 'user123',
          name: 'John Doe',
          email: loginData.email,
          password: 'hashedPassword',
          createdAt: new Date(),
          updatedAt: new Date()
        })
      };

      const mockQuery = {
        select: jest.fn().mockResolvedValue(mockUser)
      };
      mockedUser.findOne.mockReturnValue(mockQuery as any);
      mockedJwt.sign.mockReturnValue('jwt-token' as any);

      const result = await authService.login(loginData);

      expect(mockedUser.findOne).toHaveBeenCalledWith({ email: loginData.email });
      expect(mockQuery.select).toHaveBeenCalledWith('+password');
      expect(mockUser.comparePassword).toHaveBeenCalledWith(loginData.password);
      expect(mockedJwt.sign).toHaveBeenCalledWith({ id: 'user123' }, undefined, expect.any(Object));
      expect(result.user).toEqual(expect.objectContaining({
        name: 'John Doe',
        email: loginData.email
      }));
      expect(result.token).toBe('jwt-token');
    });

    it('should throw error if email or password is missing', async () => {
      await expect(authService.login({ email: '', password: 'password' })).rejects.toThrow(AppError);
      await expect(authService.login({ email: 'john@example.com', password: '' })).rejects.toThrow(AppError);
      await expect(authService.login({ email: '', password: '' })).rejects.toThrow(AppError);
    });

    it('should throw error if user does not exist', async () => {
      const mockQuery = {
        select: jest.fn().mockResolvedValue(null)
      };
      mockedUser.findOne.mockReturnValue(mockQuery as any);

      await expect(authService.login(loginData)).rejects.toThrow(AppError);
      await expect(authService.login(loginData)).rejects.toThrow('Incorrect email or password');
    });

    it('should throw error if password is incorrect', async () => {
      const mockUser = {
        _id: 'user123',
        name: 'John Doe',
        email: loginData.email,
        password: 'hashedPassword',
        comparePassword: jest.fn().mockResolvedValue(false)
      };

      const mockQuery = {
        select: jest.fn().mockResolvedValue(mockUser)
      };
      mockedUser.findOne.mockReturnValue(mockQuery as any);

      await expect(authService.login(loginData)).rejects.toThrow(AppError);
      await expect(authService.login(loginData)).rejects.toThrow('Incorrect email or password');
    });

    it('should exclude password from returned user object', async () => {
      const mockUser = {
        _id: 'user123',
        name: 'John Doe',
        email: loginData.email,
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
        comparePassword: jest.fn().mockResolvedValue(true),
        toObject: jest.fn().mockReturnValue({
          _id: 'user123',
          name: 'John Doe',
          email: loginData.email,
          password: 'hashedPassword',
          createdAt: new Date(),
          updatedAt: new Date()
        })
      };

      const mockQuery = {
        select: jest.fn().mockResolvedValue(mockUser)
      };
      mockedUser.findOne.mockReturnValue(mockQuery as any);
      mockedJwt.sign.mockReturnValue('jwt-token' as any);

      const result = await authService.login(loginData);

      expect(result.user).not.toHaveProperty('password');
    });
  });

  describe('getUserById', () => {
    it('should return user if found', async () => {
      const mockUser = {
        _id: 'user123',
        name: 'John Doe',
        email: 'john@example.com'
      };

      mockedUser.findById.mockResolvedValue(mockUser as any);

      const result = await authService.getUserById('user123');

      expect(mockedUser.findById).toHaveBeenCalledWith('user123');
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      mockedUser.findById.mockResolvedValue(null);

      const result = await authService.getUserById('nonexistent');

      expect(mockedUser.findById).toHaveBeenCalledWith('nonexistent');
      expect(result).toBeNull();
    });
  });
});
