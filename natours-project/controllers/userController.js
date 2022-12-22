const User = require('../models/userModal');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const filterObj = (obj, ...allowedFields) => {
  const filterObject = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      filterObject[el] = obj[el];
    }
  });
  return filterObject;
};

exports.update = catchAsync(async (req, res, next) => {
  // 1 Give an error if user try to update password from here
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'Please use /updatepassword route for updating a password',
        404
      )
    );
  }
  // 3 Filtering the provided document
  const filterBody = filterObj(req.body, 'name', 'email');
  // 2 Updating user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deactivate = catchAsync(async (req, res, next) => {
  // Getting user from DB
  const user = await User.findById(req.user._id).select('+password');
  // Verfiy the password
  if (!(await user.correctPassword(req.body.password, user.password))) {
    return next(new AppError('Your password is wrong', 401));
  }
  await User.findByIdAndUpdate(user._id, { active: false });
  res.status(200).json({
    status: 'sucesss',
    data: null,
  });
});

exports.getAllUsers = async (req, res) => {
  const users = await User.find();
  res.status(200).json({
    status: 'error',
    data: { users },
  });
};

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};
