const Booking = require('../models/booking.model');
const Car = require('../models/car.model');
// 1. Import your exact Payment model
const Payment = require('../models/payment.model'); 
// Import crypto to generate unique mock transaction IDs automatically
const crypto = require('crypto');

module.exports.createBooking = async (bookingData) => {
  try {
    const { user, cars, startDate, endDate } = bookingData;

    // 1. Fetch all matching cars from the database
    const foundCars = await Car.find({ _id: { $in: cars } });
    
    // Check if all requested cars exist
    if (foundCars.length !== cars.length) {
      return { status: 404, message: "One or more selected cars do not exist." };
    }

    // 2. Calculate dynamic days rented
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end.getTime() - start.getTime();
    let daysBooked = Math.ceil(timeDiff / (1000 * 3600 * 24));
    if (daysBooked <= 0) daysBooked = 1; // 1-day minimum protection

    // 3. Sum up daily prices for all cars in the array
    const pricePerDaySum = foundCars.reduce((sum, car) => sum + car.pricePerDay, 0);
    const calculatedTotalPrice = pricePerDaySum * daysBooked;

    // 4. Save the booking document
    const newBooking = await Booking.create({
      user,
      cars, // Array of car IDs
      startDate,
      endDate,
      totalPrice: calculatedTotalPrice
    });

    // 5. AUTOMATICALLY CREATE THE VALIDATED PAYMENT RECORD HERE!
    await Payment.create({
      booking: newBooking._id,
      amount: calculatedTotalPrice,
      currency: 'USD',
      paymentMethod: 'Credit Card', // Must match one of your schema's enum options
      transactionId: `TXN-${crypto.randomBytes(6).toString('hex').toUpperCase()}`, // Generates a unique ID like TXN-A1B2C3D4E5
      status: 'Completed' // Must match one of your schema's enum options
    });

    return {
      status: 201,
      message: "Booking recorded and payment processed successfully!",
      data: newBooking
    };

  } catch (error) {
    return { status: 500, message: error.message };
  }
};

// Keeps your fetch and cancellation methods completely intact below:
module.exports.getAllBookings = async (query) => {
  try {
    const bookings = await Booking.find(query).populate('user').populate('cars');
    return { status: 200, data: bookings };
  } catch (error) {
    return { status: 500, message: error.message };
  }
};

module.exports.cancelBooking = async (bookingId) => {
  return await Booking.findByIdAndUpdate(bookingId, { status: 'Cancelled' }, { new: true });
};