const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authenticate } = require('../middlewares/authMiddleware');

/**
 * POST /api/payment/initiate
 * Initiate a payment: requires auth, body: amount, product, firstname, email, mobile, address, orderItems
 */
router.post('/initiate', authenticate, paymentController.initiatePayment);

/**
 * POST /api/payment/verify/:txnid
 * Verify payment (callback from PayU): query params: payment_id
 * Note: This endpoint may be called by PayU as callback, so it can be without auth
 * or you can add optional auth validation
 */
router.post('/verify/:txnid', paymentController.verifyPayment);

/**
 * GET /api/payment/status/:paymentId
 * Get payment status: requires auth
 */
router.get('/status/:paymentId', authenticate, paymentController.getPaymentStatus);

module.exports = router;
