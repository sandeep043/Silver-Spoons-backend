const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    ImageUrl: {
        type: String
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    Reviews: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
            rating: {
                type: Number,
                required: true,
            },
            comment: {
                type: String,
            },
            date: {
                type: Date,
                default: Date.now,
            },
        }
    ],

    calories: {
        type: Number,
        required: true,
    },
    grams: {
        type: Number,
        required: true,
    }
});

module.exports = mongoose.model("Product", productSchema);


