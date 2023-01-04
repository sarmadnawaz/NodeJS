const reviewsController = require('../controllers/reviewsController');
const authController = require('../controllers/authController')
const express = require('express');
const router = express.Router();

router
  .route('/')
  .get(reviewsController.getReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewsController.createReview
  );

module.exports = router;
