const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    txnid: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    productinfo: { type: String },
    firstname: { type: String },
    email: { type: String },
    phone: { type: String },
    status: { type: String },
    mode: { type: String },
    error_Message: { type: String },
    orderItems: [{}],
    deliveryAddress: [{}],
    addedon: { type: Date },
    orderTimeandDate: { type: Date },
    created_at: { type: Date, default: Date.now }
}, {
    timestamps: true
});
const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;