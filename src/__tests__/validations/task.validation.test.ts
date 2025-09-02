import { createTaskValidation, updateTaskValidation } from '../../validations/task.validation';

describe('Task Validation Schemas', () => {
  describe('createTaskValidation', () => {
    it('should validate correct task creation data', () => {
      const validData = {
        title: 'Test Task',
        description: 'This is a test task description'
      };

      const { error } = createTaskValidation.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should validate task with only title', () => {
      const validData = {
        title: 'Test Task'
      };

      const { error } = createTaskValidation.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should validate task with empty description', () => {
      const validData = {
        title: 'Test Task',
        description: ''
      };

      const { error } = createTaskValidation.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should reject empty title', () => {
      const invalidData = {
        title: '',
        description: 'Test description'
      };

      const { error } = createTaskValidation.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toBe('Title is required');
    });

    it('should reject title longer than 100 characters', () => {
      const invalidData = {
        title: 'A'.repeat(101),
        description: 'Test description'
      };

      const { error } = createTaskValidation.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toBe('Title cannot be more than 100 characters long');
    });

    it('should reject description longer than 500 characters', () => {
      const invalidData = {
        title: 'Test Task',
        description: 'A'.repeat(501)
      };

      const { error } = createTaskValidation.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toBe('Description cannot be more than 500 characters long');
    });

    it('should reject missing title', () => {
      const invalidData = {
        description: 'Test description'
      };

      const { error } = createTaskValidation.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain('required');
    });
  });

  describe('updateTaskValidation', () => {
    it('should validate correct task update data with title', () => {
      const validData = {
        title: 'Updated Task Title'
      };

      const { error } = updateTaskValidation.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should validate correct task update data with description', () => {
      const validData = {
        description: 'Updated task description'
      };

      const { error } = updateTaskValidation.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should validate correct task update data with completed status', () => {
      const validData = {
        completed: true
      };

      const { error } = updateTaskValidation.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should validate correct task update data with multiple fields', () => {
      const validData = {
        title: 'Updated Task',
        description: 'Updated description',
        completed: true
      };

      const { error } = updateTaskValidation.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should validate empty description', () => {
      const validData = {
        title: 'Updated Task',
        description: ''
      };

      const { error } = updateTaskValidation.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should reject title shorter than 1 character', () => {
      const invalidData = {
        title: ''
      };

      const { error } = updateTaskValidation.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain('not allowed to be empty');
    });

    it('should reject title longer than 100 characters', () => {
      const invalidData = {
        title: 'A'.repeat(101)
      };

      const { error } = updateTaskValidation.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toBe('Title cannot be more than 100 characters long');
    });

    it('should reject description longer than 500 characters', () => {
      const invalidData = {
        description: 'A'.repeat(501)
      };

      const { error } = updateTaskValidation.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toBe('Description cannot be more than 500 characters long');
    });

    it('should reject empty object', () => {
      const invalidData = {};

      const { error } = updateTaskValidation.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain('at least 1 key');
    });

    it('should reject invalid completed value', () => {
      const invalidData = {
        completed: 'not-a-boolean'
      };

      const { error } = updateTaskValidation.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain('must be a boolean');
    });
  });
});
