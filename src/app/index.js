const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morganMiddleware = require('../logger/morgan.logger.js');
const CustomError = require('../utils/Error.js');
const { globalLimiter } = require('../middlewares/rateLimiter.middleware.js');
const errorMiddleware = require('../middlewares/error.middleware.js');
const { CORS_ORIGIN } = require('../config/env.js');

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));
app.use(cookieParser());

function sanitize(obj) {
  if (typeof obj !== 'object' || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(sanitize);
  return Object.keys(obj).reduce((acc, key) => {
    if (key.startsWith('$') || key.includes('.')) return acc;
    acc[key] = sanitize(obj[key]);
    return acc;
  }, {});
}

app.use((req, _res, next) => {
  if (req.body) req.body = sanitize(req.body);
  if (req.params) {
    const clean = sanitize(req.params);
    Object.keys(clean).forEach((k) => {
      req.params[k] = clean[k];
    });
  }
  next();
});

app.use(morganMiddleware);
app.use(globalLimiter);

app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is up and running',
  });
});

const authRouter = require('../routes/auth.routes');
const expenseRouter = require('../routes/expense.routes');
const incomeRouter = require('../routes/income.routes');
const categoryRouter = require('../routes/category.routes');
const budgetRouter = require('../routes/budget.routes');
const dashboardRouter = require('../routes/dashboard.routes');
const reportRouter = require('../routes/report.routes');

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/expenses', expenseRouter);
app.use('/api/v1/income', incomeRouter);
app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/budgets', budgetRouter);
app.use('/api/v1/dashboard', dashboardRouter);
app.use('/api/v1/reports', reportRouter);

app.use((_req, res) => {
  const error = CustomError.notFound({
    message: 'Resource Not Found',
    errors: ['The requested resource does not exist'],
    hints: 'Please check the URL and try again',
  });
  res.status(error.status).json({ ...error, status: undefined });
});

app.use(errorMiddleware);

module.exports = { httpServer: app };
