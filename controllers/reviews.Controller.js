const reviewsService = require('../services/reviews.service');

exports.createReview = async (req, res) => {
    try {
        const reviewData = req.body;
        const result = await reviewsService.addReview(reviewData);
        res.status(201).json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getCarReviews = async (req, res) => {
    try {
        const reviews = await reviewsService.fetchReviewsByCar(req.params.carId);
        res.status(200).json({ success: true, data: reviews });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};