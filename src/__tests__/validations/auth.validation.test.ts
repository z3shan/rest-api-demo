import { registerValidation, loginValidation } from '../../validations/auth.validation';

describe('Auth Validation Schemas', () => {
  describe('registerValidation', () => {
    it('should validate correct registration data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      const { error } = registerValidation.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should reject empty name', () => {
      const invalidData = {
        name: '',
        email: 'john@example.com',
        password: 'password123'
      };

      const { error } = registerValidation.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toBe('Name is required');
    });

    it('should reject name shorter than 2 characters', () => {
      const invalidData = {
        name: 'J',
        email: 'john@example.com',
        password: 'password123'
      };

      const { error } = registerValidation.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toBe('Name must be at least 2 characters long');
    });

    it('should reject name longer than 50 characters', () => {
      const invalidData = {
        name: 'A'.repeat(51),
        email: 'john@example.com',
        password: 'password123'
      };

      const { error } = registerValidation.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toBe('Name cannot be more than 50 characters long');
    });

    it('should reject invalid email', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'invalid-email',
        password: 'password123'
      };

      const { error } = registerValidation.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toBe('Please provide a valid email address');
    });

    it('should reject empty email', () => {
      const invalidData = {
        name: 'John Doe',
        email: '',
        password: 'password123'
      };

      const { error } = registerValidation.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toBe('Email is required');
    });

    it('should reject password shorter than 6 characters', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: '12345'
      };

      const { error } = registerValidation.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toBe('Password must be at least 6 characters long');
    });

    it('should reject empty password', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: ''
      };

      const { error } = registerValidation.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toBe('Password is required');
    });

    it('should reject missing required fields', () => {
      const invalidData = {
        name: 'John Doe'
        // missing email and password
      };

      const { error } = registerValidation.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details.length).toBeGreaterThan(0);
    });
  });

  describe('loginValidation', () => {
    it('should validate correct login data', () => {
      const validData = {
        email: 'john@example.com',
        password: 'password123'
      };

      const { error } = loginValidation.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123'
      };

      const { error } = loginValidation.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toBe('Please provide a valid email address');
    });

    it('should reject empty email', () => {
      const invalidData = {
        email: '',
        password: 'password123'
      };

      const { error } = loginValidation.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toBe('Email is required');
    });

    it('should reject empty password', () => {
      const invalidData = {
        email: 'john@example.com',
        password: ''
      };

      const { error } = loginValidation.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toBe('Password is required');
    });

    it('should reject missing required fields', () => {
      const invalidData = {
        email: 'john@example.com'
        // missing password
      };

      const { error } = loginValidation.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain('required');
    });
  });
});
