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

// @description: Delete a User
// @route: DELETE /api/v1/user/:id
// @access: Protect & Admin
exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  // Check if user exists and role === 'admin'
  if (!user || user.role === 'admin')
    return next(
      new ErrorResponse(
        'No user found or you are not authorize to do this task',
        403,
      ),
    );
  await user.deleteOne();
  res.status(200).json({ status: 'success', data: null });
});
