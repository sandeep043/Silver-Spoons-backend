
const userModel = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');



const registerUser = async (userData) => {
    const { name, email, password, phoneNumber } = userData;
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
        throw new Error('User already exists');
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new userModel({
        name,
        email,
        password: hashedPassword,
        phoneNumber,
        loyaltyPoints: 0,
    });
    await newUser.save();
    return newUser;
}

const loginUser = async (email, password) => {
    const user = await userModel.findOne({ email });
    if (!user) {
        throw new Error('Invalid email or password');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
        { id: user._id, email: user.email },
        "mysecretkey",
        { expiresIn: '1h' }
    );

    return { token, user };
}


module.exports = {
    registerUser,
    loginUser,
};
