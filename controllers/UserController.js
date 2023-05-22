const User = require('./../models/UserModel');
const catchAsync = require('../utils/catchAsync');
const ErrorResponse = require('../utils/errorResponse');

// @description: Get All users
// @route: GET /api/v1/users
// @access: Admin
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res
    .status(200)
    .json({ status: 'success', results: users.length, data: { users } });
});
