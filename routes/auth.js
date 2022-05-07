const express = require("express");
const router = express.Router();
const passport = require("passport");
const catchAsync = require("../utils/catchAsync");
const authController = require("../controllers/auth");

router
  .route("/register")
  .get(authController.renderRegisterForm)
  .post(catchAsync(authController.registerUser));

router
  .route("/login")
  .get(authController.renderLogin)
  .post(
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "login",
    }),
    catchAsync(authController.successLoginRedirect)
  );

router.get("/logout", authController.logout);

module.exports = router;
