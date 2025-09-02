import { AppError } from '../../utils/appError';

describe('AppError', () => {
  describe('constructor', () => {
    it('should create an AppError with correct properties', () => {
      const message = 'Test error message';
      const statusCode = 400;
      const error = new AppError(message, statusCode);

      expect(error.message).toBe(message);
      expect(error.statusCode).toBe(statusCode);
      expect(error.status).toBe('fail');
      expect(error.isOperational).toBe(true);
      expect(error).toBeInstanceOf(Error);
    });

    it('should set status to "error" for 5xx status codes', () => {
      const error = new AppError('Server error', 500);
      expect(error.status).toBe('error');
    });

    it('should set status to "fail" for 4xx status codes', () => {
      const error = new AppError('Client error', 400);
      expect(error.status).toBe('fail');
    });

    it('should capture stack trace', () => {
      const error = new AppError('Test error', 400);
      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe('string');
    });

    it('should handle different status codes correctly', () => {
      const testCases = [
        { code: 400, expectedStatus: 'fail' },
        { code: 401, expectedStatus: 'fail' },
        { code: 404, expectedStatus: 'fail' },
        { code: 500, expectedStatus: 'error' },
        { code: 502, expectedStatus: 'error' },
        { code: 503, expectedStatus: 'error' },
      ];

      testCases.forEach(({ code, expectedStatus }) => {
        const error = new AppError('Test message', code);
        expect(error.status).toBe(expectedStatus);
        expect(error.statusCode).toBe(code);
      });
    });

    it('should be operational by default', () => {
      const error = new AppError('Test error', 400);
      expect(error.isOperational).toBe(true);
    });

    it('should extend Error class', () => {
      const error = new AppError('Test error', 400);
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
    });
  });
});
