# Trackr — Backend API

Production-ready REST API for the Trackr expense tracker. Built with **Express 5**, **MongoDB**, **Mongoose**, **JWT authentication**, and **Zod validation**.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js 5
- **Database:** MongoDB + Mongoose ODM
- **Auth:** JWT (access + refresh tokens) via HTTP-only cookies
- **Validation:** Zod
- **Security:** Helmet, CORS, rate limiting, bcrypt, MongoDB injection sanitization
- **Logging:** Winston + Morgan

## Features

- JWT authentication (register, login, logout, refresh)
- User profile management (update, change password, delete account)
- Expense CRUD with search, filter, sort, pagination
- Income CRUD
- Category management with icons and colors
- Budget management with monthly progress tracking
- Dashboard stats with aggregation pipeline
- Report generation (weekly/monthly/yearly)
- Centralized error handling
- Rate limiting (global + auth endpoints)

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy env and configure
cp .env.sample .env
# Edit .env with your MongoDB URI and JWT secrets

# 3. Run in development
npm run dev
```

The server starts at `http://localhost:8000`.

## API Endpoints

### Auth
| Method | Endpoint              | Description        |
| ------ | --------------------- | ------------------ |
| POST   | /api/v1/auth/register  | Create account     |
| POST   | /api/v1/auth/login     | Sign in            |
| POST   | /api/v1/auth/logout    | Sign out           |
| POST   | /api/v1/auth/refresh   | Refresh tokens     |
| GET    | /api/v1/auth/me        | Get current user   |
| PATCH  | /api/v1/auth/profile   | Update profile     |
| PATCH  | /api/v1/auth/change-password | Change password |
| DELETE | /api/v1/auth/delete-account | Delete account |

### Expenses
| Method | Endpoint              | Description        |
| ------ | --------------------- | ------------------ |
| GET    | /api/v1/expenses      | List (paginated)   |
| POST   | /api/v1/expenses      | Create             |
| GET    | /api/v1/expenses/:id  | Get by ID          |
| PATCH  | /api/v1/expenses/:id  | Update             |
| DELETE | /api/v1/expenses/:id  | Delete             |

### Income
| Method | Endpoint              | Description        |
| ------ | --------------------- | ------------------ |
| GET    | /api/v1/income        | List (paginated)   |
| POST   | /api/v1/income        | Create             |
| GET    | /api/v1/income/:id    | Get by ID          |
| PATCH  | /api/v1/income/:id    | Update             |
| DELETE | /api/v1/income/:id    | Delete             |

### Categories
| Method | Endpoint                | Description        |
| ------ | ----------------------- | ------------------ |
| GET    | /api/v1/categories      | List               |
| POST   | /api/v1/categories      | Create             |
| GET    | /api/v1/categories/:id  | Get by ID          |
| PATCH  | /api/v1/categories/:id  | Update             |
| DELETE | /api/v1/categories/:id  | Delete             |

### Budgets
| Method | Endpoint              | Description        |
| ------ | --------------------- | ------------------ |
| GET    | /api/v1/budgets       | List (with progress)|
| POST   | /api/v1/budgets       | Create             |
| GET    | /api/v1/budgets/:id   | Get by ID          |
| PATCH  | /api/v1/budgets/:id   | Update             |
| DELETE | /api/v1/budgets/:id   | Delete             |

### Dashboard & Reports
| Method | Endpoint              | Description        |
| ------ | --------------------- | ------------------ |
| GET    | /api/v1/dashboard     | Stats & charts data|
| GET    | /api/v1/reports       | Generate report    |

## Project Structure

```
src/
├── app/           # Express app setup (middleware, routes)
├── config/        # Environment variables
├── constants/     # App constants
├── controllers/   # Request handlers
├── db/            # Database connection & seed
├── logger/        # Winston & Morgan loggers
├── middlewares/   # Auth, error, rate limiter
├── models/        # Mongoose schemas
├── routes/        # Route definitions
├── services/      # Business logic
├── utils/         # Helpers (ApiResponse, asyncHandler, validation)
├── validators/    # Zod schemas
└── index.js       # Entry point
```

## Scripts

```bash
npm run dev        # Start with nodemon
npm start          # Start in production
npm run db:seed    # Seed the database
npm run format     # Format with Prettier
```

## Environment Variables

| Variable                     | Description              |
| ---------------------------- | ------------------------ |
| `NODE_ENV`                   | Environment              |
| `PORT`                       | Server port              |
| `CORS_ORIGIN`                | Allowed CORS origin      |
| `MONGODB_URI`               | MongoDB connection string|
| `JWT_ACCESS_TOKEN_SECRET`    | Access token secret      |
| `JWT_ACCESS_TOKEN_EXPIRY`   | Access token expiry      |
| `JWT_REFRESH_TOKEN_SECRET`   | Refresh token secret     |
| `JWT_REFRESH_TOKEN_EXPIRY`  | Refresh token expiry     |
