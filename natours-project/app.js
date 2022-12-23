const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const appError = require('./utils/appError');
const globalErrorHandler = require('./controllers/ErrorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const app = express();

app.use(helmet());

// 1) MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// REQUEST RATE LIMITER MIDDLWARE
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP, please try again in an hour',
});

app.use('/api', limiter);

// Data Snaitization
app.use(mongoSanitize());

app.use(xss());

app.use(
  hpp({
    whitelist: ['duration', 'ratingsQuantity'],
  })
);
app.use(express.json({ limit: '10kb' }));

app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3) ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// Handler to handle unhandled routes

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// Global error handling middle ware to handle operation error

app.use(globalErrorHandler);
module.exports = app;
