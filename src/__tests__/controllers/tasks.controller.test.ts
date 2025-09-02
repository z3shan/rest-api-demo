import { Request, Response, NextFunction } from 'express';
import { createTasksController } from '../../controllers/tasks.controller';
import { TaskService } from '../../services/task.service';
import { AppError } from '../../utils/appError';

// Mock the TaskService
jest.mock('../../services/task.service');
const mockedTaskService = TaskService as jest.MockedClass<typeof TaskService>;

describe('Tasks Controller', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let taskServiceInstance: jest.Mocked<TaskService>;
  let getAllTasks: any;
  let createTask: any;
  let updateTask: any;
  let deleteTask: any;

  beforeEach(() => {
    mockReq = {
      body: {},
      params: {},
      user: {
        _id: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
    
    taskServiceInstance = {
      getUserTasks: jest.fn(),
      createTask: jest.fn(),
      getTaskById: jest.fn(),
      updateTask: jest.fn(),
      deleteTask: jest.fn()
    } as any;
    
    mockedTaskService.mockImplementation(() => taskServiceInstance);
    
    // Create controller with mocked service
    const controller = createTasksController(taskServiceInstance);
    getAllTasks = controller.getAllTasks;
    createTask = controller.createTask;
    updateTask = controller.updateTask;
    deleteTask = controller.deleteTask;
    
    jest.clearAllMocks();
  });

  describe('getAllTasks', () => {
    it('should get all tasks for authenticated user', async () => {
      const mockTasks = [
        {
          _id: 'task1',
          title: 'Task 1',
          description: 'Description 1',
          completed: false,
          userId: 'user123',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: 'task2',
          title: 'Task 2',
          description: 'Description 2',
          completed: true,
          userId: 'user123',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      taskServiceInstance.getUserTasks.mockResolvedValue(mockTasks as any);

      await getAllTasks(mockReq as Request, mockRes as Response, mockNext);

      expect(taskServiceInstance.getUserTasks).toHaveBeenCalledWith('user123');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        results: 2,
        data: {
          tasks: mockTasks
        }
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return empty array when no tasks found', async () => {
      taskServiceInstance.getUserTasks.mockResolvedValue([]);

      await getAllTasks(mockReq as Request, mockRes as Response, mockNext);

      expect(taskServiceInstance.getUserTasks).toHaveBeenCalledWith('user123');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        results: 0,
        data: {
          tasks: []
        }
      });
    });

    it('should handle unauthenticated user', async () => {
      mockReq.user = undefined;

      await getAllTasks(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect((mockNext as jest.Mock).mock.calls[0][0].message).toBe('User not authenticated');
      expect((mockNext as jest.Mock).mock.calls[0][0].statusCode).toBe(401);
      expect(taskServiceInstance.getUserTasks).not.toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      const error = new Error('Database connection failed');
      taskServiceInstance.getUserTasks.mockRejectedValue(error);

      await getAllTasks(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('createTask', () => {
    it('should create a new task successfully', async () => {
      const taskData = {
        title: 'New Task',
        description: 'Task description'
      };

      const mockCreatedTask = {
        _id: 'task123',
        ...taskData,
        completed: false,
        userId: 'user123',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockReq.body = taskData;
      taskServiceInstance.createTask.mockResolvedValue(mockCreatedTask as any);

      await createTask(mockReq as Request, mockRes as Response, mockNext);

      expect(taskServiceInstance.createTask).toHaveBeenCalledWith({
        title: taskData.title,
        description: taskData.description,
        userId: 'user123'
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          task: mockCreatedTask
        }
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should create task with only title', async () => {
      const taskData = {
        title: 'New Task'
      };

      const mockCreatedTask = {
        _id: 'task123',
        ...taskData,
        completed: false,
        userId: 'user123',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockReq.body = taskData;
      taskServiceInstance.createTask.mockResolvedValue(mockCreatedTask as any);

      await createTask(mockReq as Request, mockRes as Response, mockNext);

      expect(taskServiceInstance.createTask).toHaveBeenCalledWith({
        title: taskData.title,
        description: undefined,
        userId: 'user123'
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it('should handle unauthenticated user', async () => {
      mockReq.user = undefined;
      mockReq.body = { title: 'New Task' };

      await createTask(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect((mockNext as jest.Mock).mock.calls[0][0].message).toBe('User not authenticated');
      expect((mockNext as jest.Mock).mock.calls[0][0].statusCode).toBe(401);
      expect(taskServiceInstance.createTask).not.toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      const error = new Error('Database connection failed');
      mockReq.body = { title: 'New Task' };
      taskServiceInstance.createTask.mockRejectedValue(error);

      await createTask(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('updateTask', () => {
    it('should update task successfully', async () => {
      const taskId = 'task123';
      const updateData = {
        title: 'Updated Task',
        description: 'Updated description',
        completed: true
      };

      const mockExistingTask = {
        _id: taskId,
        title: 'Original Task',
        description: 'Original description',
        completed: false,
        userId: 'user123'
      };

      const mockUpdatedTask = {
        _id: taskId,
        ...updateData,
        userId: 'user123',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockReq.params = { id: taskId };
      mockReq.body = updateData;
      taskServiceInstance.getTaskById.mockResolvedValue(mockExistingTask as any);
      taskServiceInstance.updateTask.mockResolvedValue(mockUpdatedTask as any);

      await updateTask(mockReq as Request, mockRes as Response, mockNext);

      expect(taskServiceInstance.getTaskById).toHaveBeenCalledWith(taskId, 'user123');
      expect(taskServiceInstance.updateTask).toHaveBeenCalledWith(taskId, 'user123', updateData);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          task: mockUpdatedTask
        }
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle task not found', async () => {
      const taskId = 'nonexistent';
      const updateData = { title: 'Updated Task' };

      mockReq.params = { id: taskId };
      mockReq.body = updateData;
      taskServiceInstance.getTaskById.mockResolvedValue(null);

      await updateTask(mockReq as Request, mockRes as Response, mockNext);

      expect(taskServiceInstance.getTaskById).toHaveBeenCalledWith(taskId, 'user123');
      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect((mockNext as jest.Mock).mock.calls[0][0].message).toBe('No task found with that ID');
      expect((mockNext as jest.Mock).mock.calls[0][0].statusCode).toBe(404);
      expect(taskServiceInstance.updateTask).not.toHaveBeenCalled();
    });

    it('should handle unauthenticated user', async () => {
      mockReq.user = undefined;
      mockReq.params = { id: 'task123' };
      mockReq.body = { title: 'Updated Task' };

      await updateTask(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect((mockNext as jest.Mock).mock.calls[0][0].message).toBe('User not authenticated');
      expect((mockNext as jest.Mock).mock.calls[0][0].statusCode).toBe(401);
      expect(taskServiceInstance.getTaskById).not.toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      const error = new Error('Database connection failed');
      mockReq.params = { id: 'task123' };
      mockReq.body = { title: 'Updated Task' };
      taskServiceInstance.getTaskById.mockRejectedValue(error);

      await updateTask(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteTask', () => {
    it('should delete task successfully', async () => {
      const taskId = 'task123';
      const mockExistingTask = {
        _id: taskId,
        title: 'Task to Delete',
        description: 'Description',
        completed: false,
        userId: 'user123'
      };

      mockReq.params = { id: taskId };
      taskServiceInstance.getTaskById.mockResolvedValue(mockExistingTask as any);
      taskServiceInstance.deleteTask.mockResolvedValue(true);

      await deleteTask(mockReq as Request, mockRes as Response, mockNext);

      expect(taskServiceInstance.getTaskById).toHaveBeenCalledWith(taskId, 'user123');
      expect(taskServiceInstance.deleteTask).toHaveBeenCalledWith(taskId, 'user123');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Task deleted successfully',
        data: {
          deletedTaskId: taskId
        }
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle task not found', async () => {
      const taskId = 'nonexistent';

      mockReq.params = { id: taskId };
      taskServiceInstance.getTaskById.mockResolvedValue(null);

      await deleteTask(mockReq as Request, mockRes as Response, mockNext);

      expect(taskServiceInstance.getTaskById).toHaveBeenCalledWith(taskId, 'user123');
      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect((mockNext as jest.Mock).mock.calls[0][0].message).toBe('No task found with that ID');
      expect((mockNext as jest.Mock).mock.calls[0][0].statusCode).toBe(404);
      expect(taskServiceInstance.deleteTask).not.toHaveBeenCalled();
    });

    it('should handle unauthenticated user', async () => {
      mockReq.user = undefined;
      mockReq.params = { id: 'task123' };

      await deleteTask(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect((mockNext as jest.Mock).mock.calls[0][0].message).toBe('User not authenticated');
      expect((mockNext as jest.Mock).mock.calls[0][0].statusCode).toBe(401);
      expect(taskServiceInstance.getTaskById).not.toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      const error = new Error('Database connection failed');
      mockReq.params = { id: 'task123' };
      taskServiceInstance.getTaskById.mockRejectedValue(error);

      await deleteTask(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
