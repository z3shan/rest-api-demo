# Task Manager API

A RESTful API for managing tasks with authentication built with Node.js, Express, TypeScript, and MongoDB.

## Features

- User authentication (register/login) with JWT
- CRUD operations for tasks with data isolation
- Input validation with Joi schemas
- Service layer architecture for clean separation of concerns
- MongoDB with Mongoose ODM
- TypeScript for type safety
- Security headers with Helmet
- Global error handling middleware
- Health check endpoints
- Comprehensive input validation with custom error messages

## Project Structure

```
/src
  app.ts                 # Express app configuration, middleware, routes, error handling
  server.ts              # Server bootstrap and HTTP server setup
  /controllers
    auth.controller.ts   # Authentication endpoints (register/login)
    tasks.controller.ts  # Task management endpoints (CRUD operations)
  /middleware
    auth.middleware.ts   # JWT authentication middleware
    validation.middleware.ts # Joi validation middleware
  /models
    task.model.ts        # Task schema & model with timestamps
    user.model.ts        # User schema & model with password hashing
  /routes
    auth.routes.ts       # /api/v1/auth routes
    tasks.routes.ts      # /api/v1/tasks routes
  /services
    auth.service.ts      # Authentication business logic
    task.service.ts      # Task management business logic
  /types
    express.d.ts         # Express type extensions
  /utils
    appError.ts          # Custom error class
    database.ts          # MongoDB connection helper
  /validations
    auth.validation.ts   # Joi validation schemas for auth
    task.validation.ts   # Joi validation schemas for tasks
```

Top-level:
- `docker-compose.yml`: Local MongoDB service configuration
- `tsconfig.json`: TypeScript configuration
- `package.json`: Dependencies and scripts
- `dist/`: Compiled JavaScript output

## Requirements

- Node.js 18+
- npm
- Docker (for local MongoDB)

## Environment Variables

Create a `.env` file (not committed) or export in your shell:

```bash
MONGODB_URI=mongodb://localhost:27017/taskmanager
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=90d
NODE_ENV=development
PORT=3000
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start MongoDB locally (Docker):
   ```bash
   docker compose up -d
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Build and run in production mode:
   ```bash
   npm run build
   npm start
   ```

## Scripts

- `npm run dev`: Run with `ts-node-dev` (auto-reload on changes)
- `npm run build`: Compile TypeScript to `dist/` directory
- `npm start`: Start compiled application from `dist/`
- `npm run postinstall`: Automatically build after install

## API Endpoints

Base URL: `http://localhost:3000/api/v1`

### Health & Status
- `GET /health` — Health check endpoint
- `GET /api/v1/welcome` — Welcome message

### Authentication
- `POST /auth/register` — Register new user
- `POST /auth/login` — Login and receive JWT token

**Register Example:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Login Example:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

The login response contains a `token` that must be included in the `Authorization` header for protected routes:
```
Authorization: Bearer <your-jwt-token>
```

### Tasks (Protected Routes)
- `GET /tasks` — List all tasks for authenticated user
- `POST /tasks` — Create a new task
- `PATCH /tasks/:id` — Update an existing task
- `DELETE /tasks/:id` — Delete a task

**Create Task Example:**
```bash
TOKEN="your-jwt-token-here"

curl -X POST http://localhost:3000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Complete API documentation",
    "description": "Update README with latest features"
  }'
```

**List Tasks Example:**
```bash
curl -X GET http://localhost:3000/api/v1/tasks \
  -H "Authorization: Bearer $TOKEN"
```

**Update Task Example:**
```bash
curl -X PATCH http://localhost:3000/api/v1/tasks/task-id-here \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "completed": true,
    "title": "Updated task title"
  }'
```

## Data Models

### User Model
- `name`: String (2-50 characters, required)
- `email`: String (unique, required, validated format)
- `password`: String (min 6 characters, hashed with bcrypt)
- `createdAt`, `updatedAt`: Timestamps

### Task Model
- `title`: String (1-100 characters, required)
- `description`: String (optional, max 500 characters)
- `completed`: Boolean (default: false)
- `userId`: ObjectId reference to User
- `createdAt`, `updatedAt`: Timestamps

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt with salt rounds for password security
- **Input Validation**: Comprehensive Joi validation with custom error messages
- **Security Headers**: Helmet middleware for security headers
- **Data Isolation**: Users can only access their own tasks
- **Rate Limiting**: Built-in Express security features

## Validation & Error Handling

- All inputs are validated using Joi schemas with custom error messages
- Global error handling middleware for consistent error responses
- Custom `AppError` class for structured error handling
- Input sanitization and length restrictions
- Proper HTTP status codes for different error types

## Database Features

- MongoDB with Mongoose ODM
- Automatic timestamps on all models
- Indexed queries for performance
- Data validation at the schema level
- Proper error handling for database operations

## Development Features

- TypeScript for type safety and better development experience
- Hot reload with `ts-node-dev`
- Comprehensive type definitions
- Service layer architecture for maintainable code
- Middleware-based authentication and validation

## Notes

- The API ensures complete data isolation per user
- All task operations require valid JWT authentication
- Input validation prevents malicious data entry
- Error messages are user-friendly and informative
- The system automatically handles password hashing and JWT token management
