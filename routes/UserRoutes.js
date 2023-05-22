const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const UserController = require('../controllers/UserController');

router.route('/user/register').post(AuthController.register);
router.route('/user/login').post(AuthController.login);

router.route('/users').get(UserController.getAllUsers);

module.exports = router;
