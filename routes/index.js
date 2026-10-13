var express = require('express');
var router = express.Router();

// Route Imports
const usersRoutes = require('./users.routes');
const bookingsRoutes = require('./bookings.routes'); 
const carsRoutes = require('./cars.routes'); 
const paymentsRoutes = require('./payments.routes');
const reviewsRoutes = require('./reviews.routes');
const adminRoutes = require('./admin.routes');
const contactRouter = require('./contact.routes'); // <-- Added contact route import here

// Middleware
const { verifyToken } = require('../middleware/auth.middleware');

// Public Routes
router.get('/', (req, res) => res.json({ message: 'API is running' }));

// Feature Routes
router.use('/users', usersRoutes);
router.use('/bookings', bookingsRoutes);
router.use('/payments', verifyToken, paymentsRoutes);
router.use('/reviews', verifyToken, reviewsRoutes);
router.use('/cars', carsRoutes);
router.use('/admin', adminRoutes);
router.use('/messages', contactRouter); // <-- Maps /messages to contact router as a fallback/direct endpoint

module.exports = router;