const Campground = require("../models/campground");

module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campground/index", { campgrounds });
};

module.exports.renderNewForm = async (req, res) => {
  res.render("campground/new");
};

module.exports.getCampground = async (req, res) => {
  const campground = await Campground.findById(req.params.id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("author");
  if (!campground) {
    req.flash("error", "Campground Does not exists");
    res.redirect("/campgrounds");
  }
  // console.log(campground)
  res.render("campground/show", { campground });
};

module.exports.renderEditForm = async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  if (!campground) {
    req.flash("error", "Campground Does not exists");
    res.redirect("/campgrounds");
  }

  res.render("campground/edit", { campground });
};

module.exports.newCampground = async (req, res, next) => {
  // if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);

  const campground = new Campground(req.body.campground);
  campground.author = req.user._id;
  await campground.save();
  req.flash("success", "Successfully Made a new Campground");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.editCampground = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  await Campground.findByIdAndUpdate(id, { ...req.body.campground });
  req.flash("success", "Successfully Updated a Campground");
  res.redirect(`/campgrounds/${id}`);
};

module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  await Campground.findByIdAndDelete(id);
  req.flash("success", "Successfully Deleted A Campground");
  res.redirect("/campgrounds");
};
