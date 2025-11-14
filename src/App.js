const express = require('express');
const connectDB = require('../config/db');

const userRoutes = require('./routes/user.route');




const app = express();
app.use(express.json());


app.use('/api/user', userRoutes);
// app.use('/api/menu', menuRoutes);
// app.use('/api/cart', cartRoutes);
// app.use('/api/order', orderRoutes);
// app.use('/api/auth', authRoutes); // Include Firebase authentication routes

connectDB();

module.exports = app;
