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

router.use(protect);

router.get('/', getAllTasks);
router.post('/', validate(createTaskValidation), createTask);
router.patch('/:id', validate(updateTaskValidation), updateTask);
router.delete('/:id', deleteTask);

export default router;