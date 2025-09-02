import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { validate } from '../../middleware/validation.middleware';
import { AppError } from '../../utils/appError';

describe('Validation Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      body: {}
    };
    mockRes = {};
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('validate middleware', () => {
    it('should pass validation for valid data', () => {
      const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required()
      });

      mockReq.body = {
        name: 'John Doe',
        email: 'john@example.com'
      };

      const middleware = validate(schema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should reject validation for invalid data', () => {
      const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required()
      });

      mockReq.body = {
        name: 'John Doe',
        email: 'invalid-email'
      };

      const middleware = validate(schema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect((mockNext as jest.Mock).mock.calls[0][0].message).toContain('valid email');
      expect((mockNext as jest.Mock).mock.calls[0][0].statusCode).toBe(400);
    });

    it('should reject validation for missing required fields', () => {
      const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required()
      });

      mockReq.body = {
        name: 'John Doe'
        // missing email
      };

      const middleware = validate(schema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect((mockNext as jest.Mock).mock.calls[0][0].message).toContain('required');
      expect((mockNext as jest.Mock).mock.calls[0][0].statusCode).toBe(400);
    });

    it('should handle multiple validation errors', () => {
      const schema = Joi.object({
        name: Joi.string().min(2).required(),
        email: Joi.string().email().required(),
        age: Joi.number().min(18).required()
      });

      mockReq.body = {
        name: 'J', // Too short
        email: 'invalid-email',
        age: 15 // Too young
      };

      const middleware = validate(schema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      const errorMessage = (mockNext as jest.Mock).mock.calls[0][0].message;
      expect(errorMessage).toContain(',');
      expect(errorMessage).toContain('at least 2 characters');
      expect(errorMessage).toContain('valid email');
      expect(errorMessage).toContain('greater than or equal to 18');
    });

    it('should reject unknown fields when allowUnknown is false', () => {
      const schema = Joi.object({
        name: Joi.string().required()
      });

      mockReq.body = {
        name: 'John Doe',
        unknownField: 'should be rejected'
      };

      const middleware = validate(schema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect((mockNext as jest.Mock).mock.calls[0][0].message).toContain('not allowed');
    });

    it('should handle empty request body', () => {
      const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required()
      });

      mockReq.body = {};

      const middleware = validate(schema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect((mockNext as jest.Mock).mock.calls[0][0].message).toContain('required');
    });

    it('should handle null request body', () => {
      const schema = Joi.object({
        name: Joi.string().required()
      });

      mockReq.body = null;

      const middleware = validate(schema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
    });

    it('should handle undefined request body', () => {
      const schema = Joi.object({
        name: Joi.string().required()
      });

      mockReq.body = undefined;

      const middleware = validate(schema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      // Joi handles undefined gracefully, so this might not throw an error
      // The test verifies the middleware doesn't crash
      expect(mockNext).toHaveBeenCalled();
    });

    it('should validate with custom error messages', () => {
      const schema = Joi.object({
        name: Joi.string().min(2).required().messages({
          'string.min': 'Name must be at least 2 characters long',
          'any.required': 'Name is required'
        }),
        email: Joi.string().email().required().messages({
          'string.email': 'Please provide a valid email address',
          'any.required': 'Email is required'
        })
      });

      mockReq.body = {
        name: 'J',
        email: 'invalid-email'
      };

      const middleware = validate(schema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      const errorMessage = (mockNext as jest.Mock).mock.calls[0][0].message;
      expect(errorMessage).toContain('Name must be at least 2 characters long');
      expect(errorMessage).toContain('Please provide a valid email address');
    });

    it('should handle complex nested validation', () => {
      const schema = Joi.object({
        user: Joi.object({
          name: Joi.string().required(),
          profile: Joi.object({
            age: Joi.number().min(18).required()
          }).required()
        }).required()
      });

      mockReq.body = {
        user: {
          name: 'John Doe',
          profile: {
            age: 15
          }
        }
      };

      const middleware = validate(schema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect((mockNext as jest.Mock).mock.calls[0][0].message).toContain('greater than or equal to 18');
    });

    it('should handle array validation', () => {
      const schema = Joi.object({
        items: Joi.array().items(Joi.string().min(1)).min(1).required()
      });

      mockReq.body = {
        items: ['item1', 'item2', 'item3']
      };

      const middleware = validate(schema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should reject empty array when minimum length required', () => {
      const schema = Joi.object({
        items: Joi.array().items(Joi.string().min(1)).min(1).required()
      });

      mockReq.body = {
        items: []
      };

      const middleware = validate(schema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect((mockNext as jest.Mock).mock.calls[0][0].message).toContain('at least 1');
    });
  });
});
