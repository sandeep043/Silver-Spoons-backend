const express = require('express');
const router = express.Router();

const userController = require('../controllers/user.controller');
const OTPController = require('../controllers/OTPverify.controller');

// OTP-based signup routes
router.post('/signup', OTPController.signup);
router.post('/verify-otp', OTPController.verifyOTP);
router.post('/resend-otp', OTPController.resendOTP);

// Login route
router.post('/login', userController.loginUser);

module.exports = router;