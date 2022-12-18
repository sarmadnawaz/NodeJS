const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/);
  const message = `Duplicate Field Value : ${value[0]}. Please use another value`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(', ')}`;
  return new AppError(message, 400);
};

const handleJWTError = (err) =>
  new AppError('Invalid token, Please log in again!', 404);

const handleJWTExpireError = (err) =>
  new AppError('Your token has been expired. Please Log in again!', 401);
  
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // In case of programming error
    console.log(err);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error;
    if (err.name === 'CastError') {
      error = handleCastErrorDB(err);
      sendErrorProd(error, res);
      return;
    }
    // 11000 bcz this error doesn't have name property
    else if (err.code === 11000) {
      error = handleDuplicateFieldsDB(err);
      sendErrorProd(error, res);
      return;
    } else if (err.name === 'ValidationError') {
      error = handleValidationErrorDB(err);
      sendErrorProd(error, res);
      return;
    } else if (err.name === 'JsonWebTokenError') {
      error = handleJWTError(err);
      sendErrorProd(error, res);
    } else if (err.name === 'TokenExpiredError') {
      error = handleJWTExpireError();
      sendErrorProd(error, res);
    }
    sendErrorProd(err, res);
  }
};
