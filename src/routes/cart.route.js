const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const { authenticate } = require('../middlewares/authMiddleware');

// All cart routes require authentication — userId is taken from `req.user`
router.post('/add', authenticate, cartController.addToCart);

// Decrease item quantity (- button): quantity > 1 → decrease, quantity = 1 → remove
router.post('/decrease', authenticate, cartController.decreaseQuantity);

// Remove entire item from cart
router.delete('/remove', authenticate, cartController.removeFromCart);

// Get all cart items for authenticated user
router.get('/', authenticate, cartController.getCart);

module.exports = router;
