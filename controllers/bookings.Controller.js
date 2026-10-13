const Booking = require('../models/booking.model');
const Car = require('../models/car.model');
const User = require('../models/user.model');
const { sendAdminNotification } = require('../utils/email.service');

const getTimestamp = (dateStr) => {
  if (!dateStr) return null;
  let cleanStr = dateStr.trim();
  
  if (cleanStr.includes('/')) {
    const [datePart, timePart = '00:00'] = cleanStr.split(' ');
    const [day, month, year] = datePart.split('/');
    cleanStr = `${year}-${month}-${day}T${timePart}`;
  }
  
  return new Date(cleanStr).getTime();
};

const parseAmount = (val) => {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  const cleaned = val.toString().replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

const formatCarDisplay = (b) => {
  if (b.carName) return b.carName;

  const targetCar = b.car || b.cars;
  if (targetCar) {
    if (Array.isArray(targetCar) && targetCar.length > 0) {
      const firstCar = targetCar[0];
      return firstCar?.brand && firstCar?.model 
        ? `${firstCar.brand} ${firstCar.model}` 
        : (firstCar?.name || firstCar?.brand || firstCar?.title || 'Car');
    } 
    if (typeof targetCar === 'object') {
      return targetCar?.brand && targetCar?.model 
        ? `${targetCar.brand} ${targetCar.model}` 
        : (targetCar?.name || targetCar?.brand || targetCar?.title || 'Car');
    } 
    if (typeof targetCar === 'string') {
      return targetCar;
    }
  }
  return 'Car Rental';
};

exports.getMyBookings = async (req, res) => {
  try {
    const authUser = req.user;

    if (!authUser) {
      return res.status(401).json({ 
        success: false, 
        error: 'Unauthorized', 
        message: 'You must be logged in to view your bookings.' 
      });
    }

    const userId = authUser.id || authUser._id || authUser.userId;
    const fullUser = await User.findById(userId);

    const userEmail = (fullUser?.email || authUser.email || '').toLowerCase().trim();
    const currentUserName = (fullUser?.name || fullUser?.username || fullUser?.firstname || fullUser?.fullName || authUser.name || '').toLowerCase().trim();

    const allBookings = await Booking.find()
      .populate({ path: 'car', select: 'name brand model title image', strictPopulate: false })
      .populate({ path: 'cars', select: 'name brand model title image', strictPopulate: false })
      .populate({ path: 'user', select: 'firstname lastname name email', strictPopulate: false })
      .sort({ createdAt: -1 });

    const myBookings = allBookings.filter(b => {
      if (userId && b.user) {
        const bUserId = b.user._id ? b.user._id.toString() : b.user.toString();
        if (bUserId === userId.toString()) return true;
      }

      const bEmail = (b.email || (b.user && b.user.email) || '').toLowerCase().trim();
      if (userEmail && bEmail && bEmail === userEmail) return true;

      const bookingClientName = (b.clientName || '').toLowerCase().trim();
      if (bookingClientName && currentUserName && bookingClientName === currentUserName) {
        return true;
      }

      return false;
    });

    const formattedBookings = myBookings.map(b => ({
      _id: b._id,
      carName: formatCarDisplay(b),
      startDate: b.startDate,
      endDate: b.endDate,
      totalPrice: b.totalPrice,
      status: b.status || 'Pending',
      createdAt: b.createdAt
    }));

    return res.status(200).json({ 
      success: true, 
      data: formattedBookings,
      bookings: formattedBookings 
    });
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    return res.status(500).json({ success: false, error: 'Failed to fetch your bookings', message: error.message });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (status === 'Cancelled') {
      const deletedBooking = await Booking.findByIdAndDelete(id);
      if (!deletedBooking) {
        return res.status(404).json({ success: false, error: 'Booking not found' });
      }
      return res.status(200).json({ success: true, message: 'Booking cancelled successfully', data: deletedBooking });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      id, 
      { status }, 
      { new: true }
    );

    if (!updatedBooking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    return res.status(200).json({ success: true, data: updatedBooking });
  } catch (error) {
    console.error("Error updating booking status:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    const deletedBooking = await Booking.findByIdAndDelete(id);

    if (!deletedBooking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    return res.status(200).json({ success: true, message: 'Booking cancelled/deleted successfully', data: deletedBooking });
  } catch (error) {
    console.error("Error deleting booking:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.createBooking = async (req, res) => {
  try {
    const bookingData = { ...req.body };
    
    if (req.user) {
      bookingData.user = req.user.id || req.user._id || req.user.userId;
      bookingData.email = req.user.email;
    }

    if (!bookingData.clientName && req.user) {
      bookingData.clientName = req.user.name || req.user.username || req.user.firstname;
    }

    if (!bookingData.user || bookingData.user === 'undefined' || bookingData.user === null) {
      delete bookingData.user;
    }

    const { carName, startDate, endDate } = bookingData;

    if (!carName || !startDate || !endDate) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing fields', 
        message: 'Car name, start date, and end date are required.' 
      });
    }

    const newStartMs = getTimestamp(startDate);
    const newEndMs = getTimestamp(endDate);

    const existingBookings = await Booking.find({ 
      carName: { $regex: new RegExp(`^${carName.trim()}$`, 'i') },
      status: { $ne: 'Cancelled' }
    });

    let conflictingBooking = null;
    let latestEndMs = newStartMs;

    for (let booking of existingBookings) {
      const existingStartMs = getTimestamp(booking.startDate);
      const existingEndMs = getTimestamp(booking.endDate);

      const isOverlapping = (newStartMs < existingEndMs) && (newEndMs > existingStartMs);

      if (isOverlapping) {
        conflictingBooking = booking;
        if (existingEndMs > latestEndMs) {
          latestEndMs = existingEndMs;
        }
      }
    }

    if (conflictingBooking) {
      const availableDateObj = new Date(latestEndMs);
      availableDateObj.setDate(availableDateObj.getDate() + 1);
      const formattedAvailableDate = availableDateObj.toISOString().split('T')[0];

      return res.status(400).json({ 
        success: false, 
        error: 'Vehicule non disponible',
        message: `Ce véhicule (${carName}) n'est pas disponible du ${conflictingBooking.startDate} au ${conflictingBooking.endDate}. Vous pouvez le réserver à partir du ${formattedAvailableDate}.` 
      });
    }

    const newBooking = await Booking.create(bookingData);

    // Sends email notification to admin upon booking creation
    await sendAdminNotification(bookingData);

    return res.status(201).json({ success: true, data: newBooking });
  } catch (error) {
    console.error("Error creating booking:", error);
    return res.status(500).json({ success: false, error: 'Failed to create booking', message: error.message });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'firstname lastname name email')
      .populate({ path: 'car', select: 'name brand model title', strictPopulate: false })
      .populate({ path: 'cars', select: 'name brand model title', strictPopulate: false })
      .sort({ createdAt: -1 });

    const formattedLog = bookings.map(b => {
      let customerName = 'Guest Client';
      let customerEmail = '';
      
      if (b.user) {
        customerName = b.user.firstname && b.user.lastname 
          ? `${b.user.firstname} ${b.user.lastname}` 
          : (b.user.name || 'Guest Client');
        customerEmail = b.user.email || '';
      } else if (b.clientName) {
        customerName = b.clientName;
      }

      const carDisplay = formatCarDisplay(b);

      return {
        bookingId: b._id,
        status: b.status || 'Pending',
        customerName,
        customerEmail,
        carName: carDisplay,
        bookedCars: [carDisplay],
        totalAmount: parseAmount(b.totalPrice),
        brand: carDisplay,
        name: carDisplay,
        email: customerEmail
      };
    });

    return res.status(200).json({ 
      success: true, 
      data: bookings,
      activeBookingsLog: formattedLog 
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return res.status(500).json({ success: false, error: 'Failed to fetch bookings' });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate('user', 'firstname lastname name email')
      .populate({ path: 'car', select: 'name brand model title', strictPopulate: false })
      .populate({ path: 'cars', select: 'name brand model title', strictPopulate: false })
      .sort({ createdAt: -1 });

    const formattedLog = bookings.map(b => {
      let customerName = 'Guest Client';
      let customerEmail = '';

      if (b.user) {
        customerName = b.user.firstname && b.user.lastname 
          ? `${b.user.firstname} ${b.user.lastname}` 
          : (b.user.name || 'Guest Client');
        customerEmail = b.user.email || '';
      } else if (b.clientName) {
        customerName = b.clientName;
      }

      const carDisplay = formatCarDisplay(b);

      return {
        bookingId: b._id,
        status: b.status || 'Pending',
        customerName,
        customerEmail,
        carName: carDisplay,
        bookedCars: [carDisplay],
        totalAmount: parseAmount(b.totalPrice),
        brand: carDisplay,
        name: carDisplay,
        email: customerEmail
      };
    });

    const totalCarsCount = await Car.countDocuments();
    const activeRevenueSum = formattedLog.reduce((sum, item) => sum + item.totalAmount, 0);

    return res.status(200).json({
      success: true,
      totalInventoryCars: totalCarsCount,
      globalRevenue: activeRevenueSum,
      activeBookingsLog: formattedLog
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};