import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthService } from '../services/auth.service';
import { AppError } from '../utils/appError';
import { IUser } from '../models/user.model';

interface AuthRequest extends Request {
  user?: Omit<IUser, 'password'>;
}

const JWT_SECRET = process.env.JWT_SECRET as string;
const authService = new AuthService();

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

    const currentUser = await authService.getUserById(decoded.id);
    if (!currentUser) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    req.user = currentUser;
    next();
  } catch (error) {
    next(error);
  }
};