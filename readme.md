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
- `npm test`: Run the complete unit test suite
- `npm run test:watch`: Run tests in watch mode (auto-reload on changes)
- `npm run test:coverage`: Generate and view test coverage report

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

## Testing

This project includes a comprehensive unit test suite built with Jest and TypeScript. The tests cover all major components of the application including controllers, services, models, middleware, and utilities.


### Test Commands

Run the complete test suite:
```bash
npm test
```

Run tests in watch mode (automatically re-runs on file changes):
```bash
npm run test:watch
```

Generate and view test coverage report:
```bash
npm run test:coverage
```
