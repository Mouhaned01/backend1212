const express = require('express');
const router = express.Router();
const Review = require('../models/review.model'); // Direct use for simplicity or route linking

router.post('/', async (req, res) => {
  try {
    const { user, car, rating, comment } = req.body;
    
    if (!user || !car || !rating || !comment) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const newReview = await Review.create({ user, car, rating, comment });
    return res.status(201).json({ success: true, data: newReview });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;