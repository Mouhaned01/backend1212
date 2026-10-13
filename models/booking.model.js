const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  clientName: { type: String, required: true },
  clientPhone: { type: String, required: true },
  email: { type: String },
  carName: { type: String, required: true },
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: false
  },
  cars: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car'
  }],
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  totalPrice: { type: Number, required: true },
  days: { type: Number },
  pickupLocation: { type: String },
  status: { type: String, default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);