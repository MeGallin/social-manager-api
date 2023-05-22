const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');

router.route('/user/register').post(AuthController.register);
router.route('/user/login').post(AuthController.login);

module.exports = router;
