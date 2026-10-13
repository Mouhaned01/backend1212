const Payment = require('../models/payment.model');
const Booking = require('../models/booking.model');

exports.createPayment = async (data) => {
    const payment = await Payment.create(data);
    
    // Update the booking status to Confirmed if payment succeeds
    if (payment.status === 'Completed') {
        await Booking.findByIdAndUpdate(data.booking, { 
            status: 'Confirmed',
            payment: payment._id 
        });
    }
    return payment;
};

exports.getPaymentById = async (id) => {
    return await Payment.findById(id).populate('booking');
};