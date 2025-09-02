import { Request, Response, NextFunction } from 'express';
import { TaskService } from '../services/task.service';
import { AppError } from '../utils/appError';

// Default service instance for production
const defaultTaskService = new TaskService();

// Factory function to create controller with injected service
export const createTasksController = (taskService: TaskService = defaultTaskService) => {
  const getAllTasks = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new AppError('User not authenticated', 401));
      }
      
      const tasks = await taskService.getUserTasks(req.user._id);

      res.status(200).json({
        status: 'success',
        results: tasks.length,
        data: {
          tasks,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  const createTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new AppError('User not authenticated', 401));
      }
      
      const { title, description } = req.body;

      const newTask = await taskService.createTask({
        title,
        description,
        userId: req.user._id,
      });

      res.status(201).json({
        status: 'success',
        data: {
          task: newTask,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  const updateTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new AppError('User not authenticated', 401));
      }
      
      const { id } = req.params;
      const { title, description, completed } = req.body;

      // First, verify the task belongs to the user
      const task = await taskService.getTaskById(id, req.user._id);

      if (!task) {
        return next(new AppError('No task found with that ID', 404));
      }

      const updatedTask = await taskService.updateTask(
        id,
        req.user._id,
        { title, description, completed }
      );

      res.status(200).json({
        status: 'success',
        data: {
          task: updatedTask,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  const deleteTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new AppError('User not authenticated', 401));
      }
      
      const { id } = req.params;

      // First, verify the task belongs to the user
      const task = await taskService.getTaskById(id, req.user._id);

      if (!task) {
        return next(new AppError('No task found with that ID', 404));
      }

      await taskService.deleteTask(id, req.user._id);

      res.status(200).json({
        status: 'success',
        message: 'Task deleted successfully',
        data: {
          deletedTaskId: id
        },
      });
    } catch (error) {
      next(error);
    }
  };

  return { getAllTasks, createTask, updateTask, deleteTask };
};

// Export default controllers for production use
export const { getAllTasks, createTask, updateTask, deleteTask } = createTasksController();