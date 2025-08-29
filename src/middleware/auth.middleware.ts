import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthService } from '../services/auth.service';
import { AppError } from '../utils/appError';

const JWT_SECRET = process.env.JWT_SECRET as string;
const authService = new AuthService();

export const protect = async (req: Request, res: Response, next: NextFunction) => {
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

    // Transform the user object to match the Express Request interface
    req.user = {
      _id: String(currentUser._id),
      name: currentUser.name,
      email: currentUser.email,
      createdAt: currentUser.createdAt,
      updatedAt: currentUser.updatedAt
    };
    next();
  } catch (error) {
    next(error);
  }
};