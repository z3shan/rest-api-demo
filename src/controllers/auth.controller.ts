import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { AppError } from '../utils/appError';

const authService = new AuthService();

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name } = req.body;

    const { user, token } = await authService.register({
      name,
      email,
      password,
    });

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const { user, token } = await authService.login({
      email,
      password,
    });

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};