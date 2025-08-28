import mongoose, { Document, Schema } from 'mongoose';

export interface ITask extends Document {
  title: string;
  description?: string;
  completed: boolean;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, 'Please provide a task title'],
      trim: true,
      maxlength: [100, 'Task title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      maxlength: [500, 'Task description cannot be more than 500 characters'],
    },
    completed: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task must belong to a user'],
    },
  },
  {
    timestamps: true,
  }
);

taskSchema.index({ userId: 1, createdAt: -1 });

export const Task = mongoose.model<ITask>('Task', taskSchema);