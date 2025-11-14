const OTPService = require('../services/OTPverify.services');

const signup = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        // Validate input
        if (!name || !email || !password || !phone) {
            return res.status(400).json({
                success: false,
                message: 'All fields (name, email, password, phone) are required'
            });
        }

        const response = await OTPService.signup(req.body);
        res.status(200).json({ message: "User Created Successfully", response });
    } catch (error) {
        console.error('Signup controller error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error during signup process'
        });
    }
};

const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Email and OTP are required'
            });
        }

        const response = await OTPService.verifyOTP(email, otp);
        res.status(201).json(response);
    } catch (error) {
        console.error('OTP verification controller error:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Error during OTP verification'
        });
    }
};

const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        const response = await OTPService.resendOTP(email);
        res.status(200).json(response);
    } catch (error) {
        console.error('Resend OTP controller error:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Error resending OTP'
        });
    }
};

module.exports = {
    signup,
    verifyOTP,
    resendOTP
};
