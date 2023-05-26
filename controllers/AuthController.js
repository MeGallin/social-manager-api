const jwt = require('jsonwebtoken');
const User = require('./../models/UserModel');
const catchAsync = require('../utils/catchAsync');
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/email');
const crypto = require('crypto');
const { promisify } = require('util');

const signInToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401),
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401,
      ),
    );
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401),
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

// @description: Register new user
// @route: POST /api/v1/user/register
// @access: Public
exports.register = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;
  const newUser = await User.create({
    name,
    email,
    password,
    photo: '/assets/images/sample.jpg',
  });

  //This will log the user into the application
  const token = signInToken(newUser._id);
  //Future email confirmation
  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

// @description: USER login
// @route: POST /api/v1/user/login
// @access: Public
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // 1. check if email and PW exists
  if (!email || !password)
    return next(new ErrorResponse('Please provide an email and Password', 400));

  // 2. check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new ErrorResponse('Incorrect email or Password', 401));

  // 3. if all true then send token to client
  const token = signInToken(user._id);
  res.status(200).json({ status: 'success', token });
});

// @description: Forgotten PW
// @route: POST /api/v1/user/forgot-password
// @access: Public
exports.forgotPassword = catchAsync(async (req, res, next) => {
  //Get user details from existing email
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new ErrorResponse('That email does not exsist', 404));

  //Generate random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  //Send magic link via email
  const resetUrl = `${req.protocol}://${req.get(
    'host',
  )}/api/v1/user/reset-password/${resetToken}`;

  const message = `Forgot your password? Submit a request with your new password to ${resetUrl}. \n If you did not send this request then please ignore this email.`;
  try {
    await sendEmail({
      from: process.env.MAILER_FROM,
      to: user.email,
      subject: 'Password Reset Request valid for 10 minutes',
      html: message,
    });
    res
      .status(200)
      .json({ status: 'success', message: `Email sent successfully` });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new ErrorResponse(
        'There was an error sending your email. Please try again.',
      ),
      500,
    );
  }
});

// @description: Forgotten PW
// @route: POST /api/v1/user/reset-password
// @access: Public
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1. Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  //2. check if token is still valid and that there is a user
  if (!user)
    return next(
      new ErrorResponse('Your token is invalid or it has expired.', 400),
    );
  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  //3. Then update changedPasswordAt property for th user
  //4. Log the user in.
  const token = signInToken(user._id);
  res.status(200).json({ status: 'success', token });
});

// @description: USER Update PW
// @route: POST /api/v1/user/update-details
// @access: Private
exports.updateDetails = catchAsync(async function (req, res, next) {
  //1. Make sure user exists
  const user = await User.findById(req.user.id).select('+password');

  //2. Check if the POSTED PW is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password)))
    return next(new ErrorResponse('Your current PW is incorrect.', 401));
  //3. If all good then we can update the PW
  user.password = req.body.password;
  await user.save();
  //4. Then login the user
  //4. Log the user in.
  const token = signInToken(user._id);
  res.status(200).json({ status: 'success', token });
});
