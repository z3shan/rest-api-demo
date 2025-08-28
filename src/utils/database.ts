import mongoose from 'mongoose';
import { AppError } from './appError';

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI as string);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    throw new AppError('Could not connect to database', 500);
  }
};