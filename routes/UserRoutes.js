const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');

router.route('/register').post(AuthController.register);

module.exports = router;
