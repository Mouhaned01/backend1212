const express = require('express');
const router = express.Router();
const bookingsController = require('../controllers/bookings.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// If user is admin, return all bookings; otherwise, return customer's bookings
router.get('/', verifyToken, async (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return bookingsController.getAllBookings(req, res, next);
  }
  return bookingsController.getMyBookings(req, res, next);
});

router.get('/my-bookings', verifyToken, bookingsController.getMyBookings);
router.post('/', bookingsController.createBooking);
router.delete('/my-bookings/:id', verifyToken, bookingsController.deleteBooking);

// Admin Routes
router.get('/admin/all', verifyToken, isAdmin, bookingsController.getAllBookings);
router.patch('/:id/status', verifyToken, isAdmin, bookingsController.updateBookingStatus);

// Parameterized delete route placed AFTER specific '/my-bookings/:id' routes to prevent collision
router.delete('/:id', verifyToken, isAdmin, bookingsController.deleteBooking);

module.exports = router;