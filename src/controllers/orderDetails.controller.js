const mongoose = require('mongoose');
const orderService = require('../services/orderDetails.service');

/**
 * GET /api/order/:orderId
 * Fetch an order by ID (authenticated user only, owner check)
 */
const getOrderById = async (req, res) => {
    try {
        const userId = req.user && req.user.id;
        if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });

        const { orderId } = req.params;
        if (!orderId) return res.status(400).json({ success: false, message: 'Order ID is required' });

        // Validate ObjectId early to avoid Mongoose Cast errors and give clearer response
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ success: false, message: 'Invalid order ID format' });
        }

        const order = await orderService.getOrderDetailsByOrderId(orderId);

        // Ensure the authenticated user is the owner of the order
        if (order.userId && order.userId._id) {
            if (order.userId._id.toString() !== userId) {
                return res.status(403).json({ success: false, message: 'Unauthorized: Order does not belong to you' });
            }
        } else if (order.userId && order.userId.toString && order.userId.toString() !== userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized: Order does not belong to you' });
        }

        res.json({ success: true, data: order });
    } catch (error) {
        console.error('getOrderById error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * GET /api/order/history
 * Query: page, limit
 * Returns order history for authenticated user
 */
const getOrderHistory = async (req, res) => {
    try {
        const userId = req.user && req.user.id;
        if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });

        const { page, limit } = req.query;

        const result = await orderService.getOrderHistoryByUser(userId, { page, limit });

        res.json({ success: true, data: result.orders, meta: { total: result.total, page: result.page, pages: result.pages } });
    } catch (error) {
        console.error('getOrderHistory error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getOrderById,
    getOrderHistory
};
