# Task Manager API

A RESTful API for managing tasks with authentication built with Node.js, Express, TypeScript, and MongoDB.

## Features

- User authentication (register/login) with JWT
- CRUD operations for tasks
- Data isolation (users can only access their own tasks)
- Input validation with Joi
- Service layer architecture
- MongoDB with Mongoose ODM
- TypeScript for type safety

## Project Structure

```
/src
  app.ts                 # Express app wiring, routes, middleware, error handling
  server.ts              # App bootstrap and HTTP server
  /controllers
    auth.controller.ts   # Auth endpoints (register/login)
    tasks.controller.ts  # Task endpoints (CRUD)
  /middleware
    auth.middleware.ts   # JWT protect middleware; attaches user to request
    validation.middleware.ts # Joi validator
  /models
    task.model.ts        # Task schema & model
    user.model.ts        # User schema & model
  /routes
    auth.routes.ts       # /api/v1/auth routes
    tasks.routes.ts      # /api/v1/tasks routes
  /services
    auth.service.ts      # Auth logic (register/login/getUser)
    task.service.ts      # Task logic
  /utils
    appError.ts          # AppError class
    database.ts          # Mongoose connection helper
  /validations
    auth.validation.ts   # Joi schemas for auth
    task.validation.ts   # Joi schemas for tasks
```

Top-level:
- `docker-compose.yml`: Local MongoDB service
- `tsconfig.json`: TypeScript configuration
- `.gitignore`: Node/TS ignores (build artifacts, env files)
- `package.json`: Scripts and dependencies

## Requirements

- Node.js 18+
- npm
- Docker (for local MongoDB)

## Environment Variables

Create a `.env` file (not committed) or export in your shell:

```
MONGODB_URI=mongodb://localhost:27017/taskmanager
JWT_SECRET=devsecret
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
   # or specify the file explicitly
   # docker compose -f docker-compose.yml up -d
   ```

3. Run the dev server:
   - Using env exports in current shell:
     ```bash
     export MONGODB_URI=mongodb://localhost:27017/taskmanager JWT_SECRET=devsecret JWT_EXPIRES_IN=90d NODE_ENV=development PORT=3000
     npm run dev
     ```
   - Or with a `.env` file (add `import 'dotenv/config'` at the top of `src/server.ts` or `src/app.ts`):
     ```bash
     npm run dev
     ```

4. Build and run in production mode (optional):
   ```bash
   npm run build
   npm start
   ```

## Scripts

- `npm run dev`: Run with `ts-node-dev` (auto-reload)
- `npm run build`: Compile TypeScript to `dist/`
- `npm start`: Start compiled app from `dist/`

## API

Base URL: `http://localhost:3000/api/v1`

### Auth
- `POST /auth/register` — Register new user
- `POST /auth/login` — Login and receive JWT

Example:
```bash
curl -s -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Passw0rd!"}'

curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Passw0rd!"}'
```

The login response contains a `token` you must send in the `Authorization` header:
```
Authorization: Bearer <token>
```

### Tasks (protected)
- `GET /tasks` — List tasks for current user
- `POST /tasks` — Create task
- `GET /tasks/:id` — Get task
- `PATCH /tasks/:id` — Update task
- `DELETE /tasks/:id` — Delete task

Example create/list:
```bash
TOKEN="<paste-token-here>"

curl -s -X POST http://localhost:3000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"My first task","description":"Try the API","completed":false}'

curl -s -X GET http://localhost:3000/api/v1/tasks \
  -H "Authorization: Bearer $TOKEN"
```

## Validation & Errors
- All inputs are validated with Joi. On validation failure, a `400` with an aggregated message is returned.
- Errors conform to `{ status, message }` with appropriate HTTP status codes via a global error handler.

## Notes
- The API isolates data per user; you only see and modify your own tasks.
- Adjust `MONGODB_URI` if your MongoDB is not local.
