import { Router } from 'express';
import {
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/tasks.controller';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createTaskValidation,
  updateTaskValidation,
} from '../validations/task.validation';

const router = Router();

router.get('/', protect, getAllTasks);
router.post('/', protect, validate(createTaskValidation), createTask);
router.patch('/:id', protect, validate(updateTaskValidation), updateTask);
router.delete('/:id', protect, deleteTask);

export default router;