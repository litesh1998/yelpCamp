const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");
const CampgroundController = require("../controllers/capgrounds");

router
  .route("")
  .get(catchAsync(CampgroundController.index))
  .post(
    isLoggedIn,
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
