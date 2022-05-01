const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const Campground = require("../models/campground");
const { campgroundSchema } = require("../schema");

const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

router.get(
  "",
  catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campground/index", { campgrounds });
  })
);

router.get(
  "/new",
  catchAsync(async (req, res) => {
    res.render("campground/new");
  })
);

router.get(
  "/:id",
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate(
      "reviews"
    );
    if(!campground){
        req.flash('error', 'Campground Does not exists');
        res.redirect("/campgrounds");
    }
    // console.log(campground)
    res.render("campground/show", { campground });
  })
);

router.get(
  "/:id/edit",
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if(!campground){
        req.flash('error', 'Campground Does not exists');
        res.redirect("/campgrounds");
    }
    res.render("campground/edit", { campground });
  })
);

router.post(
  "",
  validateCampground,
  catchAsync(async (req, res, next) => {
    // if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);

    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash('success', 'Successfully Made a new Campground');
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

router.put(
  "/:id",
  validateCampground,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    req.flash('success', 'Successfully Updated a Campground');
    res.redirect(`/campgrounds/${id}`);
  })
);

router.delete(
  "/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully Deleted A Campground');
    res.redirect("/campgrounds");
  })
);

module.exports = router;
