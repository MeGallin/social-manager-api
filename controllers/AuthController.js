const User = require('./../models/UserModel');
const catchAsync = require('../utils/catchAsync');

// @description: Register new user
// @route: POST /api/v1/register
// @access: Public
exports.register = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  res.status(201).json({
    success: true,
    data: {
      user: newUser,
    },
  });
});
