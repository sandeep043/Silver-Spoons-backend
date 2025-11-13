const userService = require('../services/user.service');

const registerUser = async (req, res) => {
    try {
        const userData = req.body;
        const newUser = await userService.registerUser(userData);
        res.status(201).json({
            message: "User Created Successfully",
            user: newUser,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const { user, token } = await userService.loginUser(email, password);
        res.status(200).json({ message: 'login successful', token: token, user: user })
    }
    catch (error) {
        res.status(401).json({ message: error.message });
    }
};


module.exports = {
    registerUser,
    loginUser,
};  