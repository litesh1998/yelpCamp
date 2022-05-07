const express = require("express");
const router = express.Router({ mergeParams: true });
const Review = require("../models/review");
const Campground = require("../models/campground");
const catchAsync = require("../utils/catchAsync");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");
const ReviewControllers = require("../controllers/reviews");

router.post(
  "/",
  validateReview,
  isLoggedIn,
  catchAsync(ReviewControllers.addReview)
);

router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  catchAsync(ReviewControllers.deleteReview)
);

module.exports = router;
