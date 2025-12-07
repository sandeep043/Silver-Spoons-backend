const crypto = require('crypto');
const { PayData } = require('../../pay.config');
const Payment = require('../models/payment.model');
const OrderDetails = require('../models/orderDetails.model');
const cartService = require('./cart.service');

/**
 * Initiate payment: generate txn_id, compute hash, save payment record, and return PayU payment form data
 */
const initiatePayment = async (userId, paymentRequestData) => {
    try {
        const {
            amount,
            product,
            firstname,
            email,
            mobile,
            address,
            orderItems
        } = paymentRequestData;

        // Validate required fields
        if (!amount || !firstname || !email || !mobile) {
            throw new Error('Missing required payment fields: amount, firstname, email, mobile');
        }

        // Generate unique transaction ID
        const txn_id = 'PAYU_' + Date.now() + '_' + Math.floor(Math.random() * 10000);

        // Prepare UDF fields (user-defined fields for storing custom data)
        let udf1 = amount ? JSON.stringify(amount) : "";
        let udf2 = firstname ? JSON.stringify(firstname) : "";
        let udf3 = orderItems ? JSON.stringify(orderItems) : "";
        let udf4 = address ? JSON.stringify(address) : "";
        let udf5 = email ? JSON.stringify(email) : "";
        // Additional UDFs can be used as needed

        // Build hash string for payment security
        const hashString = `${PayData.payu_key}|${txn_id}|${amount}|${JSON.stringify(product)}|${firstname}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${PayData.payu_salt}`;
        const hash = crypto.createHash('sha512').update(hashString).digest('hex');


        // Prepare payment record to save in DB
        const paymentData = {
            txnid: txn_id,
            amount,
            currency: 'INR',
            userId,
            productinfo: JSON.stringify(product),
            firstname,
            email,
            phone: mobile,
            status: 'initiated',
            orderItems: orderItems || [],
            deliveryAddress: address ? [address] : [],
            orderTimeandDate: new Date(),
            addedon: new Date()
        };

        // Save payment record
        const savedPayment = await Payment.create(paymentData);

        // Get port for callback URLs
        const port = process.env.PORT || 4000;
        const baseUrl = process.env.BASE_URL || `http://localhost:${port}`;

        // Call PayU SDK to initiate payment
        const paymentFormData = await PayData.payuClient.paymentInitiate({
            isAmountFilledByCustomer: false,
            txnid: txn_id,
            amount: amount,
            currency: 'INR',
            productinfo: JSON.stringify(product),
            firstname: firstname,
            email: email,
            phone: mobile,
            surl: `${baseUrl}/api/payment/verify/${txn_id}?payment_id=${savedPayment._id}`,
            furl: `${baseUrl}/api/payment/verify/${txn_id}?payment_id=${savedPayment._id}`,
            hash,
            udf1,
            udf2,
            udf3,
            udf4,
            udf5
        });

        return {
            success: true,
            paymentId: savedPayment._id,
            txnid: txn_id,
            paymentForm: paymentFormData
        };
    } catch (error) {
        throw new Error(`Payment initiation failed: ${error.message}`);
    }
};

/**
 * Verify payment: check with PayU, update payment status, create order if successful
 */
const verifyPayment = async (txnid, paymentId) => {
    try {
        // Verify with PayU
        const verifiedData = await PayData.payuClient.verifyPayment(txnid);
        const transactionData = verifiedData.transaction_details[txnid];
        console.log('Verified transaction data:', transactionData);

        if (!transactionData) {
            throw new Error('Transaction details not found');
        }

        // Update payment record with verification result
        const updatedPayment = await Payment.findOneAndUpdate(
            { txnid: txnid },
            {
                status: transactionData.status,
                mode: transactionData.mode || 'N/A',
                error_Message: transactionData.error_Message || null,
                addedon: transactionData.addedon ? new Date(transactionData.addedon) : undefined
            },
            { new: true }
        );

        let createdOrder = null;

        // If payment is successful, create order
        if (transactionData.status === 'success') {
            // Fetch payment document to get all stored data
            const paymentDoc = await Payment.findById(paymentId);
            if (!paymentDoc) {
                throw new Error('Payment record not found');
            }

            // Prepare order object
            // Handle deliveryAddress: it may be an array or object, convert to string
            let addressString = 'Address not provided';
            if (paymentDoc.deliveryAddress) {
                if (Array.isArray(paymentDoc.deliveryAddress) && paymentDoc.deliveryAddress.length > 0) {
                    // If it's an array of objects, try to serialize the first one or extract relevant field
                    const addr = paymentDoc.deliveryAddress[0];
                    if (typeof addr === 'object') {
                        // Assuming address object has fields like street, city, etc.
                        addressString = addr.address || addr.street || JSON.stringify(addr);
                    } else {
                        addressString = String(addr);
                    }
                } else if (typeof paymentDoc.deliveryAddress === 'string') {
                    addressString = paymentDoc.deliveryAddress;
                }
            }

            const orderData = {
                userId: paymentDoc.userId,
                address: addressString,
                paymentId: paymentId,
                orderItems: paymentDoc.orderItems || [],
                totalAmount: transactionData.amt || paymentDoc.amount,
                orderStatus: 'Completed',

            };

            // Create order
            createdOrder = await OrderDetails.create(orderData);

            // Clear user's cart after successful order creation
            try {
                await cartService.clearCart(paymentDoc.userId);
                console.log(`✅ Cart cleared for user ${paymentDoc.userId} after successful payment`);
            } catch (cartError) {
                console.warn(`⚠️ Failed to clear cart for user ${paymentDoc.userId}:`, cartError.message);
                // Don't throw error here - order was created successfully, cart clearing is non-critical
            }





        }

        return {
            success: true,
            status: transactionData.status,
            txnid: transactionData.txnid,
            amount: transactionData.amt,
            mode: transactionData.mode,
            paymentId: paymentId,
            orderId: createdOrder ? createdOrder._id : null,
            message: transactionData.status === 'success' ? 'Payment successful and order created' : 'Payment failed'
        };
    } catch (error) {
        throw new Error(`Payment verification failed: ${error.message}`);
    }
};

/**
 * Get payment status
 */
const getPaymentStatus = async (paymentId) => {
    try {
        const payment = await Payment.findById(paymentId);
        if (!payment) {
            throw new Error('Payment not found');
        }
        return payment;
    } catch (error) {
        throw new Error(`Failed to fetch payment status: ${error.message}`);
    }
};

module.exports = {
    initiatePayment,
    verifyPayment,
    getPaymentStatus
};
