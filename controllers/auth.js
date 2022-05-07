const User = require("../models/user");

module.exports.renderRegisterForm = (req, res) => {
    res.render("auth/register");
  }


module.exports.registerUser = async (req, res) => {
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
  }

  module.exports.renderLogin = (req, res) => {
    res.render("auth/login");
  }

module.exports.successLoginRedirect = async (req, res) => {
    req.flash("success", "Welcome Back");
    const url =  req.session.returnTo || "/campgrounds"
    // console.log(req.session.returTo) 
    delete req.session.returnTo;
    res.redirect(url);
  }

module.exports.logout =  (req, res) => {
    req.logOut();
    req.flash("success", "You have logged out Successfully");
    res.redirect("/campgrounds");
  }