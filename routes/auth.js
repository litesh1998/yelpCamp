const express = require("express");
const router = express.Router();
const User = require("../models/user");
const passport = require("passport");
const catchAsync = require("../utils/catchAsync");

router.get("/register", (req, res) => {
  res.render("auth/register");
});

router.post(
  "/register",
  catchAsync(async (req, res) => {
    try {
      const { email, username, password } = req.body;
      const user = new User({ email, username });
      const registeredUser = await User.register(user, password);
      req.login(registeredUser, err =>{
          if (err) return next();
          req.flash("success", "Welcome to YelpCamp");
        res.redirect("/campgrounds");
      })
      
    } catch (error) {
      req.flash("error", error.message);
      res.redirect("register");
    }
  })
);

router.get("/login", (req, res) => {
  res.render("auth/login");
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "login",
  }),
  catchAsync(async (req, res) => {
    req.flash("success", "Welcome Back");
    const url =  req.session.returnTo || "/campgrounds"
    // console.log(req.session.returTo) 
    delete req.session.returnTo;
    res.redirect(url);
  })
);

router.get("/logout", (req, res) => {
  req.logOut();
  req.flash("success", "You have logged out Successfully");
  res.redirect("/campgrounds");
});

module.exports = router;
