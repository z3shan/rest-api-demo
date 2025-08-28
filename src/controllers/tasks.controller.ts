import { Request, Response, NextFunction } from 'express';
import { TaskService } from '../services/task.service';
import { AppError } from '../utils/appError';

const taskService = new TaskService();

export const getAllTasks = async (req: Request, res: Response, next: NextFunction) => {
  try {
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

export const createTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
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

export const updateTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
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

export const deleteTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // First, verify the task belongs to the user
    const task = await taskService.getTaskById(id, req.user._id);

    if (!task) {
      return next(new AppError('No task found with that ID', 404));
    }

    await taskService.deleteTask(id, req.user._id);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};