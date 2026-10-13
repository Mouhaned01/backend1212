const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking', // Matches your booking.model.js name
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'USD'
    },
    paymentMethod: {
        type: String,
        enum: ['Credit Card', 'PayPal', 'Stripe', 'Bank Transfer'],
        required: true
    },
    transactionId: {
        type: String,
        required: true,
        unique: true // Unique ID provided by your external payment system
    },
    status: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
        default: 'Pending'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);