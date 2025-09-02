import { Task, ITask } from '../../models/task.model';
import { User } from '../../models/user.model';
import mongoose from 'mongoose';

describe('Task Model', () => {
  describe('Task Schema Validation', () => {
    it('should validate required fields', () => {
      const task = new Task();
      const validationError = task.validateSync();
      
      expect(validationError).toBeDefined();
      expect(validationError?.errors.title).toBeDefined();
      expect(validationError?.errors.userId).toBeDefined();
    });

    it('should validate title length constraints', () => {
      const task = new Task({
        title: 'A'.repeat(101), // Too long
        userId: 'user123'
      });
      
      const validationError = task.validateSync();
      expect(validationError?.errors.title).toBeDefined();
    });

    it('should validate description length constraints', () => {
      const task = new Task({
        title: 'Test Task',
        description: 'A'.repeat(501), // Too long
        userId: 'user123'
      });
      
      const validationError = task.validateSync();
      expect(validationError?.errors.description).toBeDefined();
    });

    it('should accept valid task data', () => {
      const task = new Task({
        title: 'Test Task',
        description: 'This is a test task',
        userId: new mongoose.Types.ObjectId()
      });
      
      const validationError = task.validateSync();
      expect(validationError).toBeUndefined();
    });

    it('should accept task with only required fields', () => {
      const task = new Task({
        title: 'Test Task',
        userId: new mongoose.Types.ObjectId()
      });
      
      const validationError = task.validateSync();
      expect(validationError).toBeUndefined();
    });

    it('should set completed to false by default', () => {
      const task = new Task({
        title: 'Test Task',
        userId: new mongoose.Types.ObjectId()
      });
      
      expect(task.completed).toBe(false);
    });

    it('should validate userId is a valid ObjectId', () => {
      const task = new Task({
        title: 'Test Task',
        userId: 'invalid-object-id'
      });
      
      const validationError = task.validateSync();
      expect(validationError?.errors.userId).toBeDefined();
    });
  });

  describe('Task Properties', () => {
    it('should have correct default values', () => {
      const userId = new mongoose.Types.ObjectId();
      const task = new Task({
        title: 'Test Task',
        userId: userId
      });

      expect(task.completed).toBe(false);
      expect(task.title).toBe('Test Task');
      expect(task.userId.toString()).toBe(userId.toString());
    });

    it('should allow setting completed status', () => {
      const task = new Task({
        title: 'Test Task',
        userId: new mongoose.Types.ObjectId(),
        completed: true
      });

      expect(task.completed).toBe(true);
    });

    it('should allow optional description', () => {
      const task = new Task({
        title: 'Test Task',
        description: 'Optional description',
        userId: new mongoose.Types.ObjectId()
      });

      expect(task.description).toBe('Optional description');
    });
  });

  describe('Task Timestamps', () => {
    it('should have createdAt and updatedAt fields', () => {
      const task = new Task({
        title: 'Test Task',
        userId: new mongoose.Types.ObjectId()
      });

      // In test environment, timestamps might not be automatically set
      // This test verifies the schema has timestamp configuration
      const schema = Task.schema;
      expect(schema.options.timestamps).toBe(true);
    });
  });

  describe('Task Indexes', () => {
    it('should have compound index on userId and createdAt', () => {
      // This test verifies the schema has the index defined
      const taskSchema = Task.schema;
      const indexes = taskSchema.indexes();
      
      // Check if the compound index exists
      const compoundIndex = indexes.find(
        (index: any) => 
          index[0] && 
          index[0].userId === 1 && 
          index[0].createdAt === -1
      );
      
      expect(compoundIndex).toBeDefined();
    });
  });
});