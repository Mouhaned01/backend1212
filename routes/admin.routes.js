const express = require('express');
const router = express.Router();
const bookingsController = require('../controllers/bookings.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// Route definition pointing to the dashboard stats handler
router.get('/dashboard', verifyToken, isAdmin, bookingsController.getDashboardStats);

module.exports = router;