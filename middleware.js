const ExpressError = require("./utils/ExpressError");
const Campground = require("./models/campground");
const { campgroundSchema, reviewSchema } = require("./schema");
const Review = require("./models/review");

module.exports.isLoggedIn = (req, res, next) => {
  // console.log(req.user)
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash("error", "You Must be logged In");
    return res.redirect("/auth/login");
  } else {
    next();
  }
};

module.exports.validateCampground = (req, res, next) => {
  // console.log(req.body)
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground.author.equals(req.user._id)) {
    req.flash("error", "You Do not have permission to do that");
    return res.redirect(`/campgrounds/${id}`);
  } else {
    next();
  }
};


module.exports.validateReview = (req,res, next)=>{
    const {error}= reviewSchema.validate(req.body)
    if (error){
        const msg= error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }
    else{
        next();
    }
}

module.exports.isReviewAuthor = async (req, res, next) => {
  const { reviewId, id } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You Do not have permission to do that");
    return res.redirect(`/campgrounds/${id}`);
  } else {
    next();
  }
};
