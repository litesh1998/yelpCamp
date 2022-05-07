const express = require('express');
const router = express.Router({mergeParams: true});
const Review = require('../models/review');
const Campground = require('../models/campground');
const catchAsync = require('../utils/catchAsync');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware')




router.post('/', validateReview ,isLoggedIn,catchAsync(async(req, res) =>{
    console.log(req.params.id)
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review)
    review.author=req.user._id
    campground.reviews.push(review)
    await review.save();
    await campground.save();
    req.flash('success', 'Successfully created A New Review');
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.delete('/:reviewId', isLoggedIn,isReviewAuthor,catchAsync(async(req, res)=>{
    await Review.findByIdAndDelete(req.params.reviewId);
    Campground.findByIdAndUpdate(req.params.id, {$pull: {reviews: req.params.reviewId}});
    req.flash('success', 'Successfully Deleted A  Review');
    res.redirect(`/campgrounds/${req.params.id}`);
}))


module.exports = router