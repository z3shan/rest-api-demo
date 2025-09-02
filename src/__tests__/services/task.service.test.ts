import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';

// Mock the Task model
jest.mock('../../models/task.model');
const mockedTask = Task as jest.Mocked<typeof Task>;

describe('TaskService', () => {
  let taskService: TaskService;

  beforeEach(() => {
    taskService = new TaskService();
    jest.clearAllMocks();
  });

  describe('getUserTasks', () => {
    it('should return tasks for a user sorted by creation date', async () => {
      const userId = 'user123';
      const mockTasks = [
        {
          _id: 'task1',
          title: 'Task 1',
          description: 'Description 1',
          completed: false,
          userId,
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-01')
        },
        {
          _id: 'task2',
          title: 'Task 2',
          description: 'Description 2',
          completed: true,
          userId,
          createdAt: new Date('2023-01-02'),
          updatedAt: new Date('2023-01-02')
        }
      ];

      mockedTask.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockTasks)
      } as any);

      const result = await taskService.getUserTasks(userId);

      expect(mockedTask.find).toHaveBeenCalledWith({ userId });
      expect(result).toEqual(mockTasks);
    });

    it('should return empty array if no tasks found', async () => {
      const userId = 'user123';

      mockedTask.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([])
      } as any);

      const result = await taskService.getUserTasks(userId);

      expect(result).toEqual([]);
    });
  });

  describe('createTask', () => {
    it('should create a new task', async () => {
      const taskData = {
        title: 'New Task',
        description: 'Task description',
        userId: 'user123'
      };

      const mockCreatedTask = {
        _id: 'task123',
        ...taskData,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockedTask.create.mockResolvedValue(mockCreatedTask as any);

      const result = await taskService.createTask(taskData);

      expect(mockedTask.create).toHaveBeenCalledWith(taskData);
      expect(result).toEqual(mockCreatedTask);
    });

    it('should create task with only required fields', async () => {
      const taskData = {
        title: 'New Task',
        userId: 'user123'
      };

      const mockCreatedTask = {
        _id: 'task123',
        ...taskData,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockedTask.create.mockResolvedValue(mockCreatedTask as any);

      const result = await taskService.createTask(taskData);

      expect(mockedTask.create).toHaveBeenCalledWith(taskData);
      expect(result).toEqual(mockCreatedTask);
    });
  });

  describe('getTaskById', () => {
    it('should return task if found and belongs to user', async () => {
      const taskId = 'task123';
      const userId = 'user123';
      const mockTask = {
        _id: taskId,
        title: 'Test Task',
        description: 'Task description',
        completed: false,
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockedTask.findOne.mockResolvedValue(mockTask as any);

      const result = await taskService.getTaskById(taskId, userId);

      expect(mockedTask.findOne).toHaveBeenCalledWith({ _id: taskId, userId });
      expect(result).toEqual(mockTask);
    });

    it('should return null if task not found', async () => {
      const taskId = 'nonexistent';
      const userId = 'user123';

      mockedTask.findOne.mockResolvedValue(null);

      const result = await taskService.getTaskById(taskId, userId);

      expect(mockedTask.findOne).toHaveBeenCalledWith({ _id: taskId, userId });
      expect(result).toBeNull();
    });

    it('should return null if task belongs to different user', async () => {
      const taskId = 'task123';
      const userId = 'user123';
      const differentUserId = 'user456';

      mockedTask.findOne.mockResolvedValue(null);

      const result = await taskService.getTaskById(taskId, differentUserId);

      expect(mockedTask.findOne).toHaveBeenCalledWith({ _id: taskId, userId: differentUserId });
      expect(result).toBeNull();
    });
  });

  describe('updateTask', () => {
    it('should update task successfully', async () => {
      const taskId = 'task123';
      const userId = 'user123';
      const updateData = {
        title: 'Updated Task',
        description: 'Updated description',
        completed: true
      };

      const mockUpdatedTask = {
        _id: taskId,
        ...updateData,
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockedTask.findOneAndUpdate.mockResolvedValue(mockUpdatedTask as any);

      const result = await taskService.updateTask(taskId, userId, updateData);

      expect(mockedTask.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: taskId, userId },
        updateData,
        { new: true, runValidators: true }
      );
      expect(result).toEqual(mockUpdatedTask);
    });

    it('should update task with partial data', async () => {
      const taskId = 'task123';
      const userId = 'user123';
      const updateData = {
        completed: true
      };

      const mockUpdatedTask = {
        _id: taskId,
        title: 'Original Task',
        description: 'Original description',
        ...updateData,
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockedTask.findOneAndUpdate.mockResolvedValue(mockUpdatedTask as any);

      const result = await taskService.updateTask(taskId, userId, updateData);

      expect(mockedTask.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: taskId, userId },
        updateData,
        { new: true, runValidators: true }
      );
      expect(result).toEqual(mockUpdatedTask);
    });

    it('should return null if task not found', async () => {
      const taskId = 'nonexistent';
      const userId = 'user123';
      const updateData = {
        title: 'Updated Task'
      };

      mockedTask.findOneAndUpdate.mockResolvedValue(null);

      const result = await taskService.updateTask(taskId, userId, updateData);

      expect(result).toBeNull();
    });

    it('should return null if task belongs to different user', async () => {
      const taskId = 'task123';
      const userId = 'user123';
      const differentUserId = 'user456';
      const updateData = {
        title: 'Updated Task'
      };

      mockedTask.findOneAndUpdate.mockResolvedValue(null);

      const result = await taskService.updateTask(taskId, differentUserId, updateData);

      expect(mockedTask.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: taskId, userId: differentUserId },
        updateData,
        { new: true, runValidators: true }
      );
      expect(result).toBeNull();
    });
  });

  describe('deleteTask', () => {
    it('should delete task successfully', async () => {
      const taskId = 'task123';
      const userId = 'user123';

      mockedTask.deleteOne.mockResolvedValue({ deletedCount: 1 } as any);

      const result = await taskService.deleteTask(taskId, userId);

      expect(mockedTask.deleteOne).toHaveBeenCalledWith({ _id: taskId, userId });
      expect(result).toBe(true);
    });

    it('should return false if task not found', async () => {
      const taskId = 'nonexistent';
      const userId = 'user123';

      mockedTask.deleteOne.mockResolvedValue({ deletedCount: 0 } as any);

      const result = await taskService.deleteTask(taskId, userId);

      expect(mockedTask.deleteOne).toHaveBeenCalledWith({ _id: taskId, userId });
      expect(result).toBe(false);
    });

    it('should return false if task belongs to different user', async () => {
      const taskId = 'task123';
      const userId = 'user123';
      const differentUserId = 'user456';

      mockedTask.deleteOne.mockResolvedValue({ deletedCount: 0 } as any);

      const result = await taskService.deleteTask(taskId, differentUserId);

      expect(mockedTask.deleteOne).toHaveBeenCalledWith({ _id: taskId, userId: differentUserId });
      expect(result).toBe(false);
    });
  });
});
