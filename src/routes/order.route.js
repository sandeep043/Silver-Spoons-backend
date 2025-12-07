const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderDetails.controller');
const { authenticate } = require('../middlewares/authMiddleware');

/**
 * GET /api/order/history
 * Get order history for authenticated user (query: page, limit)
 */
router.get('/history', authenticate, orderController.getOrderHistory);

/**
 * GET /api/order/:orderId
 * Get single order details (authenticated owner only)
 */
router.get('/:orderId', authenticate, orderController.getOrderById);

module.exports = router;
