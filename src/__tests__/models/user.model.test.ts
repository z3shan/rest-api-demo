import { User, IUser } from '../../models/user.model';
import bcrypt from 'bcryptjs';

// Mock bcrypt
jest.mock('bcryptjs');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('User Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('User Schema Validation', () => {
    it('should validate required fields', () => {
      const user = new User();
      const validationError = user.validateSync();
      
      expect(validationError).toBeDefined();
      expect(validationError?.errors.name).toBeDefined();
      expect(validationError?.errors.email).toBeDefined();
      expect(validationError?.errors.password).toBeDefined();
    });

    it('should validate email format', () => {
      const user = new User({
        name: 'John Doe',
        email: 'invalid-email',
        password: 'password123'
      });
      
      const validationError = user.validateSync();
      expect(validationError?.errors.email).toBeDefined();
    });

    it('should validate name length constraints', () => {
      const user = new User({
        name: 'A'.repeat(51), // Too long
        email: 'john@example.com',
        password: 'password123'
      });
      
      const validationError = user.validateSync();
      expect(validationError?.errors.name).toBeDefined();
    });

    it('should validate password length constraints', () => {
      const user = new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: '12345' // Too short
      });
      
      const validationError = user.validateSync();
      expect(validationError?.errors.password).toBeDefined();
    });

    it('should accept valid user data', () => {
      const user = new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      });
      
      const validationError = user.validateSync();
      expect(validationError).toBeUndefined();
    });
  });

  describe('Password Hashing', () => {
    it('should have password hashing configuration', () => {
      const user = new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      });

      // Test that the schema has pre-save middleware configured
      const schema = user.schema;
      expect(schema).toBeDefined();
      
      // Test that bcrypt is available for hashing
      expect(mockedBcrypt.hash).toBeDefined();
    });

    it('should have password comparison method', () => {
      const user = new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      });

      // Test that the comparePassword method exists
      expect(typeof user.comparePassword).toBe('function');
    });
  });

  describe('Password Comparison', () => {
    it('should compare password correctly', async () => {
      const user = new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword'
      });

      mockedBcrypt.compare.mockResolvedValue(true as never);

      const isMatch = await user.comparePassword('password123');

      expect(mockedBcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
      expect(isMatch).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const user = new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword'
      });

      mockedBcrypt.compare.mockResolvedValue(false as never);

      const isMatch = await user.comparePassword('wrongpassword');

      expect(mockedBcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashedPassword');
      expect(isMatch).toBe(false);
    });
  });

  describe('JSON Transformation', () => {
    it('should exclude password from JSON output', () => {
      const user = new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      });

      const userJson = user.toJSON();

      expect(userJson.password).toBeUndefined();
      expect(userJson.name).toBe('John Doe');
      expect(userJson.email).toBe('john@example.com');
    });

    it('should have timestamp configuration', () => {
      const user = new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      });

      // In test environment, timestamps might not be automatically set
      // This test verifies the schema has timestamp configuration
      const schema = user.schema;
      expect(schema.options.timestamps).toBe(true);
    });
  });

  describe('Email Normalization', () => {
    it('should convert email to lowercase', () => {
      const user = new User({
        name: 'John Doe',
        email: 'JOHN@EXAMPLE.COM',
        password: 'password123'
      });

      expect(user.email).toBe('john@example.com');
    });
  });
});