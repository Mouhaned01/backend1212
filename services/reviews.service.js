const Review = require('../models/review.model');

module.exports.addReview = async (reviewData) => {
  try {
    const newReview = await Review.create(reviewData);
    return {
      status: 201,
      message: "Review added successfully!",
      data: newReview
    };
  } catch (error) {
    return { status: 500, message: error.message };
  }
};