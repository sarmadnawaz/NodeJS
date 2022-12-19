const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModal');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const bcrypt = require('bcryptjs');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

module.exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });
  const token = signToken(newUser._id);
  res.status(201).json({
    status: 'success',
    message: 'User has been successfully created',
    token,
  });
});

module.exports.signin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }
  const user = await User.findOne({ email }).select('+password');
  // Checking if the user exist and password is correct
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401)); // 401 unAuthorized
  }
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    message: 'User has been signed in',
    token,
  });
  // Checking Password
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  // Checking if token exists
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  )
    token = req.headers.authorization.split(' ').pop();
  if (!token)
    return next(
      new AppError('You are not logged in! Please log in to get access', 401)
    );

  // Validating token
  const { id: userId, iat: JWTTimestamp } = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );
  // Checking if user still exists
  const user = await User.findById(userId);
  if (!user) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }
  // Check if user change then password after the token was issued
  const isPasswordChanged = user.changedPasswordAfter(JWTTimestamp);
  if (isPasswordChanged) {
    return next(
      new AppError(
        'User recently changed the password! Please log in again',
        401
      )
    );
  }
  // Grant Access to protected route
  req.user = user;
  next();
});

// restricting users from doing something based on their roles
exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('you have not authorized to delete tour', 403));
    }
    next();
};
