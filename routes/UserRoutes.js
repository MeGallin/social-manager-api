const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const UserController = require('../controllers/UserController');

router.route('/user/register').post(AuthController.register);
router.route('/user/login').post(AuthController.login);
router.route('/user/forgot-password').post(AuthController.forgotPassword);
router.route('/user/reset-password/:token').patch(AuthController.resetPassword);

router
  .route('/users')
  .get(
    AuthController.protect,
    AuthController.restrictTo('admin', 'moderator'),
    UserController.getAllUsers,
  );

router
  .route('/update-my-password')
  .patch(AuthController.protect, AuthController.updateDetails);

router
  .route('/user/:id')
  .delete(
    AuthController.protect,
    AuthController.restrictTo('admin', 'moderator'),
    UserController.deleteUser,
  );

module.exports = router;
