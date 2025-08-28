import { Router } from 'express';
import { login, register } from '../controllers/auth.controller';
import { validate } from '../middleware/validation.middleware';
import { loginValidation, registerValidation } from '../validations/auth.validation';

const router = Router();

router.post('/register', validate(registerValidation), register);
router.post('/login', validate(loginValidation), login);

export default router;