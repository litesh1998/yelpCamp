const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");
const CampgroundController = require("../controllers/capgrounds");
const {storage} = require('../cloudinary')
const multer  = require('multer')
const upload = multer({ storage })

router
  .route("")
  .get(catchAsync(CampgroundController.index))
  .post(
    isLoggedIn,
    upload.array('campground[image]'),
    validateCampground,
    catchAsync(CampgroundController.newCampground)
  );

router.get("/new", isLoggedIn, catchAsync(CampgroundController.renderNewForm));

router
  .route("/:id")
  .get(catchAsync(CampgroundController.getCampground))
  .put(
    isLoggedIn,
    isAuthor,
    upload.array('campground[image]'),
    validateCampground,
    catchAsync(CampgroundController.editCampground)
  )
  .delete(
    isLoggedIn,
    isAuthor,
    catchAsync(CampgroundController.deleteCampground)
  );

router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(CampgroundController.renderEditForm)
);

module.exports = router;
