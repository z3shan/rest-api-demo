import 'dotenv/config';
import express, { ErrorRequestHandler } from 'express';
import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';
import { AppError } from './utils/appError';
import { connectDB } from './utils/database';

// Import Routes
import authRouter from './routes/auth.routes';
import taskRouter from './routes/tasks.routes';

export const app = express();

// 1) Connect to MongoDB
connectDB();

// 2) GLOBAL MIDDLEWARES
// Set security HTTP headers
app.use(helmet());

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// 3) ROUTES
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/tasks', taskRouter);

// 4) Handle undefined routes
app.all('*', (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// 5) GLOBAL ERROR HANDLING MIDDLEWARE
const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  const statusCode = (err as any).statusCode || 500;
  const status = (err as any).status || 'error';

  console.error(err);

  res.status(statusCode).json({
    status,
    message: err.message || 'Internal Server Error',
  });
};

app.use(globalErrorHandler);