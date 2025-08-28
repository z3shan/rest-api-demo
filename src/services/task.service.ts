import { Task, ITask } from '../models/task.model';
import { AppError } from '../utils/appError';

export class TaskService {
  /**
   * Get all tasks for a user
   */
  public async getUserTasks(userId: string): Promise<ITask[]> {
    return await Task.find({ userId }).sort({ createdAt: -1 });
  }

  /**
   * Create a new task
   */
  public async createTask(taskData: {
    title: string;
    description?: string;
    userId: string;
  }): Promise<ITask> {
    return await Task.create(taskData);
  }

  /**
   * Get a task by ID
   */
  public async getTaskById(taskId: string, userId: string): Promise<ITask | null> {
    return await Task.findOne({ _id: taskId, userId });
  }

  /**
   * Update a task
   */
  public async updateTask(
    taskId: string,
    userId: string,
    updateData: {
      title?: string;
      description?: string;
      completed?: boolean;
    }
  ): Promise<ITask | null> {
    return await Task.findOneAndUpdate(
      { _id: taskId, userId },
      updateData,
      { new: true, runValidators: true }
    );
  }

  /**
   * Delete a task
   */
  public async deleteTask(taskId: string, userId: string): Promise<boolean> {
    const result = await Task.deleteOne({ _id: taskId, userId });
    return result.deletedCount > 0;
  }
}