const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModal');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const crypto = require('crypto');
const { sendEmail } = require('../utils/email');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

module.exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  createSendToken(newUser, 201, res);
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

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // Get a user on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('No user found with this credentials', 404));
  }
  // Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetpassword/${resetToken}`;
  const message = `Forgot your password? Submit a patch request with your new password and confirm password to : ${resetURL}. \n if you didn't forget you password, please ignore`;
  try {
    // sending email to client
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min only)',
      message,
    });
    res.status(200).json({
      status: 'success',
      message: 'Token has been send successfully',
    });
  } catch (err) {
    (user.passwordResetToken = undefined),
      (user.passwordResetExpires = undefined),
      await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        `${err.message}There was an error happen during sending email. Please try again!`
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //* Fetching User from DATABASE based on provided token
  // Hashing token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  //* Checking if token does belong to any user
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  //* reseting password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  const token = signToken(user._id);
  res.status(200).json({
    status: 200,
    message:
      'Password has been successfully updated and user has been logged in',
    token,
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // Getting user from DB
  const user = await User.findById(req.user._id).select('+password');
  // Verfiy the current password
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong', 401));
  }
  // Updating Password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  createSendToken(user, 200, res);
});
