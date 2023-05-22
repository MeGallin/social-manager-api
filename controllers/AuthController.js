const jwt = require('jsonwebtoken');
const User = require('./../models/UserModel');
const requestIp = require('request-ip');
const catchAsync = require('../utils/catchAsync');
const ErrorResponse = require('../utils/errorResponse');

const signInToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

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
