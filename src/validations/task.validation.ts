import Joi from 'joi';

export const createTaskValidation = Joi.object({
  title: Joi.string().min(1).max(100).required().messages({
    'string.empty': 'Title is required',
    'string.min': 'Title must be at least 1 character long',
    'string.max': 'Title cannot be more than 100 characters long',
  }),
  description: Joi.string().max(500).optional().allow('').messages({
    'string.max': 'Description cannot be more than 500 characters long',
  }),
});

export const updateTaskValidation = Joi.object({
  title: Joi.string().min(1).max(100).optional().messages({
    'string.min': 'Title must be at least 1 character long',
    'string.max': 'Title cannot be more than 100 characters long',
  }),
  description: Joi.string().max(500).optional().allow('').messages({
    'string.max': 'Description cannot be more than 500 characters long',
  }),
  completed: Joi.boolean().optional(),
}).min(1);