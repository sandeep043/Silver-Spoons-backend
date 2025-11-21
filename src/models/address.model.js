const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    addressLine1: {
        type: String,
        required: true,
    },
    addressLine2: {
        type: String,
    },
    street: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    zipCode: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        required: true,
    },
    default: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true
});

// For clarity rename in code to `isDefault` while keeping existing DB field `default` compatibility.
// If existing documents use `default`, mongoose will map to `default`. We'll add a virtual getter/setter
// to expose `isDefault` while reading/writing the underlying `default` field for compatibility.

addressSchema.virtual('isDefault')
    .get(function () { return this.default; })
    .set(function (v) { this.default = v; });

const Address = mongoose.model('Address', addressSchema);

module.exports = Address;