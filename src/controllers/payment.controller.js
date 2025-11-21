const paymentService = require('../services/payment.service');

/**
 * POST /api/payment/initiate
 * Initiate payment: validate cart, amount, address, create payment record and return PayU form
 */
const initiatePayment = async (req, res) => {
    try {
        const userId = req.user && req.user.id;
        if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });

        const {
            amount,
            product,
            firstname,
            email,
            mobile,
            address,
            orderItems
        } = req.body;

        // Validate required fields
        if (!amount || !product || !firstname || !email || !mobile || !address) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: amount, product, firstname, email, mobile, address'
            });
        }

        const paymentRequestData = {
            amount,
            product,
            firstname,
            email,
            mobile,
            address,
            orderItems: orderItems || []
        };

        const result = await paymentService.initiatePayment(userId, paymentRequestData);

        res.status(200).json(result);
    } catch (error) {
        console.error('Initiate payment error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * POST /api/payment/verify/:txnid
 * Verify payment with PayU, update payment status, create order if successful
 * Query params: payment_id
 */
const verifyPayment = async (req, res) => {
    try {
        const { txnid } = req.params;
        const { payment_id } = req.query;

        if (!txnid || !payment_id) {
            return res.status(400).json({
                success: false,
                message: 'Missing required params: txnid and payment_id'
            });
        }

        const result = await paymentService.verifyPayment(txnid, payment_id);

        // Return JSON response
        // For React Native, include deep link URL that can be handled by the app
        const deepLinkUrl = `silverrest://payment?status=${result.status}&txnid=${result.txnid}&payment_id=${result.paymentId}&order_id=${result.orderId || 'null'}`;
        const webRedirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/${result.status}/${result.txnid}/${result.paymentId}/${result.orderId || ''}`;

        res.json({
            success: true,
            status: result.status,
            message: result.message,
            txnid: result.txnid,
            paymentId: result.paymentId,
            orderId: result.orderId,
            deepLinkUrl: deepLinkUrl,
            webRedirectUrl: webRedirectUrl
        });
    } catch (error) {
        console.error('Verify payment error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * GET /api/payment/status/:paymentId
 * Get payment status
 */
const getPaymentStatus = async (req, res) => {
    try {
        const userId = req.user && req.user.id;
        if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });

        const { paymentId } = req.params;

        if (!paymentId) {
            return res.status(400).json({
                success: false,
                message: 'Payment ID is required'
            });
        }

        const payment = await paymentService.getPaymentStatus(paymentId);

        // Verify payment belongs to authenticated user
        if (payment.userId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized: Payment does not belong to you'
            });
        }

        res.status(200).json({
            success: true,
            data: payment
        });
    } catch (error) {
        console.error('Get payment status error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    initiatePayment,
    verifyPayment,
    getPaymentStatus
};
