const mongoose = require('mongoose');
const validator = require('validator');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    require: [true, 'Please type your name'],
    maxlength: [20, 'A User name must have less or equal then 20 characters'],
    minlength: [5, 'A User name must have more or equal then 5 characters'],
  },
  email: {
    type: String,
    require: [true, 'Please type your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Please type your password'],
    minlength: [8, 'A password must have more or equal then 8 characters'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please type your password'],
    validate: {
      validator(el) {
        return el === this.password;
      },
      message: 'passwords are not matching',
    },
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  passwordChangedAt: {
    type: Date,
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  photo: String,
  active: {
    type: Boolean,
    default: true,
  },
});

//* ENCRYPTING THE PASSWORD *\\

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  // Hashing password
  this.password = await bcrypt.hash(this.password, 12);
  // deleting confirm passowrd
  this.passwordConfirm = undefined;
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Will return only active user
userSchema.pre(/^find/, function (next) {
  this.find({ active: true });
  next();
});
userSchema.methods.correctPassword = async function (
  providedPassword,
  realPassword
) {
  return await bcrypt.compare(providedPassword, realPassword);
};
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const timeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    console.log(timeStamp, JWTTimestamp);
    return JWTTimestamp < timeStamp;
  }
  // False indicate no change
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

module.exports = mongoose.model('User', userSchema);
