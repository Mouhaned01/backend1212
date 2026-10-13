const paymentsService = require('../services/payments.service');

exports.processPayment = async (req, res) => {
    try {
        const paymentData = req.body;
        const result = await paymentsService.createPayment(paymentData);
        res.status(201).json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getPaymentStatus = async (req, res) => {
    try {
        const payment = await paymentsService.getPaymentById(req.params.id);
        if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
        res.status(200).json({ success: true, data: payment });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};