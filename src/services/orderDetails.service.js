const OrderDetails = require('../models/orderDetails.model');

/**
 * Fetch a single order by its ID and populate related fields where possible.
 * @param {String|ObjectId} orderId
 * @returns {Object} populated order document
 */
const getOrderDetailsByOrderId = async (orderId) => {
    try {
        const order = await OrderDetails.findById(orderId)
            .populate('userId', 'name email phoneNumber')
            .populate('paymentId');

        if (!order) {
            throw new Error('Order not found');
        }

        // Try to populate nested product references inside orderItems if they exist
        try {
            await order.populate({
                path: 'orderItems.productId',
                select: 'name ImageUrl description price category type calories grams'
            });
        } catch (e) {
            // If population fails (no productId refs), ignore silently
        }


        return order;
    } catch (error) {
        throw new Error(`Failed to fetch order: ${error.message}`);
    }
};

/**
 * Fetch order history for a user with basic pagination and sorting (most recent first).
 * @param {String|ObjectId} userId
 * @param {Object} options { page = 1, limit = 20 }
 * @returns {Object} { orders, total, page, pages }
 */
const getOrderHistoryByUser = async (userId, options = {}) => {
    const page = Math.max(1, parseInt(options.page, 10) || 1);
    const limit = Math.max(1, parseInt(options.limit, 10) || 20);
    const skip = (page - 1) * limit;

    try {
        const query = { userId };

        const [total, orders] = await Promise.all([
            OrderDetails.countDocuments(query),
            OrderDetails.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('paymentId')
                .populate('userId', 'name email phoneNumber')
        ]);

        // Attempt to populate nested product refs for each order
        try {
            await OrderDetails.populate(orders, {
                path: 'orderItems.productId',
                select: 'name ImageUrl description price category type calories grams'
            });
        } catch (e) {
            // ignore
        }

        const pages = Math.ceil(total / limit) || 1;

        return {
            orders,
            total,
            page,
            pages
        };
    } catch (error) {
        throw new Error(`Failed to fetch order history: ${error.message}`);
    }
};

module.exports = {
    getOrderDetailsByOrderId,
    getOrderHistoryByUser
};
