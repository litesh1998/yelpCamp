const express = require('express');
const router = express.Router({mergeParams: true});
const Review = require('../models/review');
const Campground = require('../models/campground');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError')
const {reviewSchema} = require('../schema');


const validateReview = (req,res, next)=>{
    const {error}= reviewSchema.validate(req.body)
    if (error){
        const msg= error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }
    else{
        next();
    }
}

router.post('/', validateReview ,catchAsync(async(req, res) =>{
    console.log(req.params.id)
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review)
    campground.reviews.push(review)
    await review.save();
    await campground.save();
    req.flash('success', 'Successfully created A New Review');
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.delete('/:reviewId', catchAsync(async(req, res)=>{
    await Review.findByIdAndDelete(req.params.reviewId);
    Campground.findByIdAndUpdate(req.params.id, {$pull: {reviews: req.params.reviewId}});
    req.flash('success', 'Successfully Deleted A  Review');
    res.redirect(`/campgrounds/${req.params.id}`);
}))


module.exports = router