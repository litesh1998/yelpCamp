if (process.env.NODE_ENV !== "production"){
  require('dotenv').config();
}

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const methodOveride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require('passport');
const passportLocal = require('passport-local')
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })

const ExpressError = require("./utils/ExpressError");
const User = require('./models/user');

const campgroundRoutes = require("./routes/campgrounds");
const reviewsRoutes = require("./routes/reviews");
const authRoutes = require('./routes/auth')


mongoose.connect(
  "mongodb://root:example@localhost:27017/yelp-camp?authSource=admin&readPreference=primary&ssl=false"
);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection Error"));
db.once("open", () => {
  console.log("Database Connected");
});

const app = express();
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOveride("_method"));
app.use(express.static(path.join(__dirname, "public")));

const sessionConfig = {
  secret: "mySecret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 600000,
    maxAge: 600000,
    httpOnly: true,
  },
};


app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new passportLocal(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next)=>{
    // console.log(req.session)s
    
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user;
    
    next();
})

app.use('/auth', authRoutes);
app.use("/campgrounds/:id/reviews", reviewsRoutes);
app.use("/campgrounds", campgroundRoutes);
app.get("/", (req, res) => {
  res.render("home");
});

app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Somthing Went Wrong";
  res.status(statusCode).render("./error", { err });
});

app.listen(3000, () => {
  console.log("Serving on Port 3000");
});
