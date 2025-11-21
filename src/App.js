const express = require('express');
const connectDB = require('../config/db');

const userRoutes = require('./routes/user.route');
const productRoutes = require('./routes/product.route');
const cartRoutes = require('./routes/cart.route');
const addressRoutes = require('./routes/address.route');
// const menuRoutes = require('./routes/menu.route');
// const orderRoutes = require('./routes/order.route');
// const authRoutes = require('./routes/auth.route'); // For Firebase authentication


const paymentRoutes = require('./routes/payment.route');


const app = express();
app.use(express.json());


app.use('/api/user', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/address', addressRoutes);
app.use('/api/payment', paymentRoutes);
// app.use('/api/menu', menuRoutes);
// app.use('/api/cart', cartRoutes);
// app.use('/api/order', orderRoutes);
// app.use('/api/auth', authRoutes); // Include Firebase authentication routes

connectDB();

module.exports = app;
