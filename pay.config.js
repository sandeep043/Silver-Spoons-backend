const PayU = require('payu-websdk');

const payu_key = process.env.MERCHANT_KEY || '5CWhYy';
const payu_salt = process.env.MERCHANT_SALT || 'blJRjgXnW7BJZQof2pj45UrQaAHZC1VC';

let payuClient = null;

try {
    payuClient = new PayU(
        {
            key: payu_key,
            salt: payu_salt
        },
        process.env.PAYU_ENVIRONMENT || 'TEST'
    );
    console.log('✅ PayU client initialized successfully');
} catch (error) {
    console.error('❌ PayU client initialization failed:', error.message);
}

module.exports = {
    PayData: {
        payuClient,
        payu_key,
        payu_salt
    }
};