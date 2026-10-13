const express = require('express');
const router = express.Router();

// Import the payment controller we created
const paymentsController = require('../controllers/payments.Controller'); 

// 1. Process a new payment transaction
router.post('/process', paymentsController.processPayment);

// 2. Get payment details by transaction or booking ID
router.get('/:id', paymentsController.getPaymentStatus);

module.exports = router;