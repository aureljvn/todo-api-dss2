# Todo API — Final Project DSSII

A full-stack Todo application built with **ASP.NET Core 10**, **Vue 3**, **PostgreSQL**, **Redis**, and **RabbitMQ**. Demonstrates a production-grade REST API with JWT authentication, caching, async event-driven audit logging, and full Docker orchestration.

---

## Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Running the Project](#running-the-project)
- [Available URLs](#available-urls)
- [API Reference](#api-reference)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Key Design Decisions](#key-design-decisions)

---

## Architecture

```
┌─────────────────┐     HTTP      ┌──────────────────────────────────┐
│   Frontend      │ ────────────► │        ASP.NET Core 10 API        │
│  Vue 3 / Vite   │               │                                  │
│   Port 3000     │               │  Controllers (Auth, Todos,        │
│   (Nginx)       │               │              Integrations)        │
└─────────────────┘               │  Services   (Auth, Todo,          │
                                  │              Redis, RabbitMQ)     │
                                  │  Middleware (GlobalException)      │
                                  └────────┬──────┬──────┬───────────┘
                                           │      │      │
                                    ┌──────┘  ┌───┘   ┌──┘
                                    ▼         ▼       ▼
                                PostgreSQL  Redis  RabbitMQ
                                 Port 5432  (cache) (events)
                                                       │
                                                       ▼
                                             AuditLogConsumer
                                           (Background Worker)
                                                       │
                                                       ▼
                                            AuditLogs table (DB)
```

### Request Flow

1. The client sends an HTTP request with a `Bearer` JWT token in the `Authorization` header.
2. `GlobalExceptionMiddleware` wraps the entire pipeline in a try/catch.
3. ASP.NET validates the JWT token automatically (configured in `Program.cs`).
4. The controller validates the request DTO and calls the appropriate service.
5. The service queries PostgreSQL via Entity Framework Core.
6. For public todo listings, Redis is checked first (60s TTL cache).
7. After any write operation, an event is published to a RabbitMQ fanout exchange.
8. `AuditLogConsumer` (background worker) receives the event and persists it to `AuditLogs`.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | ASP.NET Core 10 (C#) |
| Frontend | Vue 3 + Vite |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| Message Broker | RabbitMQ 3 |
| ORM | Entity Framework Core 10 |
| Authentication | JWT (HS256, 1h expiry) |
| Password Hashing | BCrypt |
| API Documentation | Swagger / OpenAPI |
| Containerization | Docker + Docker Compose |
| Frontend Server | Nginx (production) |

---

## Prerequisites

Only **Docker Desktop** is required. No .NET SDK, Node.js, or any other runtime needs to be installed locally.

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Compose)

Verify your installation:

```bash
docker --version
docker compose version
```

---

## Running the Project

### 1. Clone the repository

```bash
git clone <repository-url>
cd "Final Project DSSII"
```

### 2. Start all services

```bash
docker compose up --build
```

This single command will:
- Build the backend (.NET) and frontend (Vue) Docker images
- Pull PostgreSQL 16, Redis 7, and RabbitMQ 3 images
- Start all 5 services in the correct order (respecting health checks)
- Run database migrations automatically on first start

> First build takes 2–5 minutes depending on your connection speed (downloading base images + NuGet/npm packages). Subsequent starts are much faster.

### 3. Wait for all services to be healthy

You will see the following log when the backend is ready:

```
backend-1  | Database migration completed successfully.
```

### 4. Stop the project

```bash
# Stop all containers (data is preserved)
docker compose down

# Stop and delete all data (full reset)
docker compose down -v
```

---

## Available URLs

| Service | URL | Notes |
|---|---|---|
| **Frontend** | http://localhost:3000 | Vue 3 application |
| **API — Swagger UI** | http://localhost:3087/swagger | Interactive API documentation |
| **RabbitMQ Management** | http://localhost:15672 | Login: `guest` / `guest` |

> `http://localhost:3087` alone returns 404 — this is expected. The API has no root route; use `/swagger` to explore endpoints.

---

## API Reference

### Authentication

All protected routes require the `Authorization: Bearer <token>` header.

#### Register

```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secret123",
  "displayName": "John Doe"       // optional
}
```

**Response 201:**
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "email": "user@example.com",
  "displayName": "John Doe"
}
```

| Status | Meaning |
|---|---|
| 201 | User created |
| 400 | Validation error (invalid email, password too short) |
| 409 | Email already in use |

---

#### Login

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secret123"
}
```

**Response 200:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresInSeconds": 3600,
  "user": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "email": "user@example.com",
    "displayName": "John Doe"
  }
}
```

| Status | Meaning |
|---|---|
| 200 | Login successful, token returned |
| 400 | Validation error |
| 401 | Invalid email or password |

---

### Todos

#### Get public todos (no authentication required)

```
GET /api/todos/public?page=1&pageSize=10&status=all&sortBy=createdAt&sortDir=desc
```

#### Get my todos (authentication required)

```
GET /api/todos?page=1&pageSize=10
Authorization: Bearer <token>
```

**Query parameters for both listing endpoints:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | int | `1` | Page number (min 1) |
| `pageSize` | int | `10` | Items per page (max 50) |
| `status` | string | `all` | `all`, `active`, or `completed` |
| `priority` | string | — | `low`, `medium`, or `high` |
| `dueFrom` | string | — | Filter by due date `>=` (format: `YYYY-MM-DD`) |
| `dueTo` | string | — | Filter by due date `<=` (format: `YYYY-MM-DD`) |
| `sortBy` | string | `createdAt` | `createdAt`, `dueDate`, `priority`, or `title` |
| `sortDir` | string | `desc` | `asc` or `desc` |
| `search` | string | — | Full-text search in title and details |

**Response 200:**
```json
{
  "items": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "title": "Buy groceries",
      "details": "Milk, eggs, bread",
      "priority": "medium",
      "dueDate": "2026-03-30",
      "isCompleted": false,
      "isPublic": true,
      "createdAt": "2026-03-24T10:00:00Z",
      "updatedAt": "2026-03-24T10:00:00Z"
    }
  ],
  "page": 1,
  "pageSize": 10,
  "totalItems": 42,
  "totalPages": 5
}
```

---

#### Create a todo

```
POST /api/todos
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Buy groceries",
  "details": "Milk, eggs, bread",   // optional, max 1000 chars
  "priority": "medium",              // "low", "medium", or "high"
  "dueDate": "2026-03-30",           // optional, format YYYY-MM-DD
  "isPublic": false                  // default: false
}
```

| Status | Meaning |
|---|---|
| 201 | Todo created |
| 400 | Validation error |
| 401 | Not authenticated |

---

#### Get a todo by ID

```
GET /api/todos/{id}
Authorization: Bearer <token>
```

| Status | Meaning |
|---|---|
| 200 | Todo returned |
| 401 | Not authenticated |
| 403 | Todo belongs to another user |
| 404 | Todo not found |

---

#### Update a todo (full replacement)

```
PUT /api/todos/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Buy groceries (updated)",
  "details": "Also get orange juice",
  "priority": "high",
  "dueDate": "2026-03-31",
  "isPublic": true,
  "isCompleted": false
}
```

---

#### Mark a todo as complete/incomplete (partial update)

```
PATCH /api/todos/{id}/completion
Authorization: Bearer <token>
Content-Type: application/json

{
  "isCompleted": true
}
```

---

#### Delete a todo

```
DELETE /api/todos/{id}
Authorization: Bearer <token>
```

| Status | Meaning |
|---|---|
| 204 | Deleted successfully (no body) |
| 401 | Not authenticated |
| 403 | Todo belongs to another user |
| 404 | Todo not found |

---

### Health Checks

```
GET /api/integrations/redis/health
GET /api/integrations/rabbitmq/health
```

**Response 200:** `{ "status": "connected" }`
**Response 503:** `{ "status": "disconnected" }`

---

### Error Format

All errors follow [RFC 7807 Problem Details](https://datatracker.ietf.org/doc/html/rfc7807):

```json
{
  "type": "https://httpstatuses.com/404",
  "title": "Not Found",
  "status": 404,
  "detail": "Todo not found."
}
```

---

## Environment Variables

These are pre-configured in `docker-compose.yml` and ready to run. For production, replace the JWT key and database credentials.

| Variable | Default | Description |
|---|---|---|
| `ConnectionStrings__Default` | `Host=db;...` | PostgreSQL connection string |
| `Jwt__Key` | `your-super-secret-jwt-key...` | HS256 signing key (min 32 chars) |
| `Jwt__Issuer` | `TodoApi` | JWT issuer claim |
| `Jwt__Audience` | `TodoApiUsers` | JWT audience claim |
| `RabbitMq__Host` | `rabbitmq` | RabbitMQ hostname |
| `RabbitMq__Port` | `5672` | RabbitMQ AMQP port |
| `RabbitMq__Username` | `guest` | RabbitMQ username |
| `RabbitMq__Password` | `guest` | RabbitMQ password |
| `Redis__ConnectionString` | `redis:6379` | Redis connection string |

> In Docker Compose, `__` (double underscore) maps to nested config sections in .NET (e.g. `Jwt__Key` → `Jwt:Key`).

---

## Project Structure

```
Final Project DSSII/
├── docker-compose.yml              # Orchestrates all 5 services
│
├── Todo.Api/                       # ASP.NET Core 10 Backend
│   ├── Program.cs                  # Entry point: DI, middleware pipeline, JWT config
│   ├── Dockerfile                  # Multi-stage build (SDK → Runtime)
│   ├── appsettings.json            # Default configuration
│   │
│   ├── Controllers/
│   │   ├── AuthController.cs       # POST /api/auth/register, /login
│   │   ├── TodosController.cs      # CRUD /api/todos + /api/todos/public
│   │   └── IntegrationsController.cs # GET /api/integrations/*/health
│   │
│   ├── Services/
│   │   ├── AuthService.cs          # Registration, login, JWT generation
│   │   ├── TodoService.cs          # CRUD logic + Redis cache + RabbitMQ publish
│   │   ├── RedisService.cs         # Cache abstraction (graceful degradation)
│   │   ├── RabbitMqService.cs      # Event publisher to fanout exchange
│   │   ├── Exceptions.cs           # ConflictException, NotFoundException, etc.
│   │   ├── IAuthService.cs
│   │   ├── ITodoService.cs
│   │   ├── IRedisService.cs
│   │   └── IRabbitMqService.cs
│   │
│   ├── Workers/
│   │   └── AuditLogConsumer.cs     # Background service: consumes RabbitMQ → writes AuditLogs
│   │
│   ├── Middleware/
│   │   └── GlobalExceptionMiddleware.cs  # Centralized RFC 7807 error responses
│   │
│   ├── Domain/
│   │   ├── Entities/
│   │   │   ├── User.cs             # User entity
│   │   │   ├── TodoItem.cs         # Todo entity
│   │   │   └── AuditLog.cs         # Audit log entity
│   │   └── Enums/
│   │       └── Priority.cs         # Low, Medium, High
│   │
│   ├── Data/
│   │   └── AppDbContext.cs         # EF Core context + table configuration
│   │
│   ├── DTOs/
│   │   ├── Auth/
│   │   │   ├── RegisterRequest.cs  # Email, password, displayName + validation
│   │   │   ├── LoginRequest.cs     # Email, password + validation
│   │   │   ├── LoginResponse.cs    # accessToken, tokenType, expiresIn, user
│   │   │   └── AuthUserResponse.cs # id, email, displayName
│   │   └── Todos/
│   │       ├── CreateTodoRequest.cs   # title, details, priority, dueDate, isPublic
│   │       ├── UpdateTodoRequest.cs   # same + isCompleted
│   │       ├── SetCompletionRequest.cs # isCompleted only
│   │       ├── TodoResponse.cs         # full todo representation
│   │       ├── TodoQueryParams.cs      # page, pageSize, status, priority, search, sort
│   │       └── PagedResponse.cs        # generic paginated wrapper
│   │
│   └── Migrations/                 # EF Core auto-generated database migrations
│
└── todo-frontend/                  # Vue 3 Frontend
    ├── Dockerfile                  # Node build + Nginx serve
    └── ...
```

---

## Key Design Decisions

### Graceful Degradation
Both Redis and RabbitMQ connections are wrapped in try/catch at startup. If either service is unavailable, the API continues to function:
- Without Redis: every request hits PostgreSQL directly (no caching)
- Without RabbitMQ: todos are still created/updated, but no audit trail is recorded

### JWT Stateless Authentication
The API is fully stateless — no server-side sessions. The JWT token contains the user ID and email as claims, signed with HMAC-SHA256. The server only needs the secret key to validate any token, enabling horizontal scaling.

### Scoped vs Singleton Services
- `AuthService` and `TodoService` are **Scoped** (one instance per HTTP request) because they depend on `AppDbContext` which is not thread-safe.
- `RabbitMqService` is **Singleton** (one instance for the app lifetime) because establishing a RabbitMQ connection is expensive.
- `AuditLogConsumer` uses `IServiceScopeFactory` to create a temporary scope per message, since it's a singleton background service that needs to use the scoped `AppDbContext`.

### Cache Invalidation Strategy
Public todo results are cached in Redis with a 60-second TTL per unique query combination. On any write operation (create, update, delete), all `public_todos_*` keys are deleted to ensure consistency. Private todo queries bypass the cache entirely.

### Fanout Exchange Pattern
RabbitMQ uses a `fanout` exchange (`todo_events`). Any service that wants to react to todo events simply binds a new queue to this exchange — no changes needed in the publisher. This makes the system easily extensible (e.g., adding email notifications, webhooks).

### Async Database Migration
Migrations run asynchronously after the HTTP server starts listening. This prevents connection-refused errors in Docker when all containers start simultaneously, as the API can serve health-check requests while waiting for PostgreSQL to be ready.
