
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const redis = require('../../config/redis');
const User = require('../models/user.model');


const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
}
// Configure nodemailer transporter
let transporter;


transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "sandeep.000182@gmail.com",
        pass: "fmwx fayr wjfk wknx"
    },
    pool: {
        maxConnections: 1
    }
});


// Verify transporter connection
transporter.verify((error, success) => {
    if (error) {
        console.log('⚠️  Nodemailer transporter error:', error.message);
        console.log('📧 OTP emails will not be sent. Using test mode.');
    } else {
        console.log('✅ Nodemailer transporter is ready');
    }
});

const sendOTPEmail = async (email, otp) => {
    const mailOptions = {
        from: process.env.EMAIL_USER || 'rhett.walter91@ethereal.email',
        to: email,
        subject: 'Email Verification OTP',
        html: `
      <h2>Email Verification</h2>
      <p>Your OTP for email verification is:</p>
      <h1 style="color: #4CAF50; font-size: 32px;">${otp}</h1>
      <p>This OTP will expire in 20 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ OTP email sent to ${email}`);
        console.log(`📧 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
        return info;
    } catch (error) {
        console.error(`⚠️  Failed to send OTP email to ${email}:`, error.message);
        console.log(`📝 OTP: ${otp} (for testing purposes)`);
        // Don't throw error - allow signup to continue even if email fails
        return { messageId: 'test-mode', otp };
    }
};


const signup = async (userData) => {
    try {
        const { name, email, password, phone } = userData;

        // Validate input
        if (!name || !email || !password || !phone) {
            throw new Error('All fields are required');
        }

        // Check if user already exists in MongoDB
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new Error('User already exists with this email');
        }

        // Check if signup is already pending in Redis
        const redisKey = `signup:${email}`;
        const existingSignup = await redis.get(redisKey);
        if (existingSignup) {
            // Delete existing Redis key and create new one
            await redis.del(redisKey);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate OTP
        const otp = generateOTP();

        // Store user data and OTP in Redis with 20 minutes expiry
        const redisData = {
            name,
            email,
            password: hashedPassword,
            phone,
            otp,
            createdAt: Date.now()
        };

        await redis.setex(redisKey, 1200, JSON.stringify(redisData)); // 1200 seconds = 20 minutes

        // Send OTP email
        await sendOTPEmail(email, otp);

        return {
            success: true,
            message: 'OTP sent to your email. Please verify within 20 minutes.',
            email
        };

    } catch (error) {
        console.error('Signup error:', error);
        throw error;
    }
};

const verifyOTP = async (email, otp) => {
    try {
        if (!email || !otp) {
            throw new Error('Email and OTP are required');
        }

        // Get user data from Redis
        const redisKey = `signup:${email}`;
        const userData = await redis.get(redisKey);

        if (!userData) {
            throw new Error('OTP expired or invalid email. Please signup again.');
        }

        const parsedData = JSON.parse(userData);

        // Verify OTP
        if (parsedData.otp !== otp) {
            throw new Error('Invalid OTP');
        }

        // Create user in MongoDB
        const newUser = new User({
            name: parsedData.name,
            email: parsedData.email,
            password: parsedData.password,
            phoneNumber: parsedData.phone,
            isVerified: true
        });

        await newUser.save();

        // Delete data from Redis
        await redis.del(redisKey);

        return {
            success: true,
            message: 'Email verified successfully. User created.',
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                phone: newUser.phoneNumber
            }
        };

    } catch (error) {
        console.error('OTP verification error:', error);
        throw error;
    }
};

// Resend OTP
const resendOTP = async (email) => {
    try {
        if (!email) {
            throw new Error('Email is required');
        }

        // Get existing user data from Redis
        const redisKey = `signup:${email}`;
        const userData = await redis.get(redisKey);

        if (!userData) {
            throw new Error('No pending signup found for this email. Please signup again.');
        }

        const parsedData = JSON.parse(userData);

        // Generate new OTP
        const newOTP = generateOTP();

        // Update user data with new OTP
        parsedData.otp = newOTP;
        parsedData.createdAt = Date.now();

        // Store updated data in Redis with fresh 20 minutes expiry
        await redis.setex(redisKey, 1200, JSON.stringify(parsedData));

        // Send new OTP email
        await sendOTPEmail(email, newOTP);

        return {
            success: true,
            message: 'New OTP sent to your email'
        };

    } catch (error) {
        console.error('Resend OTP error:', error);
        throw error;
    }
};


module.exports = {
    signup,
    verifyOTP,
    resendOTP
};