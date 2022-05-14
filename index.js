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
const mongoSanitize = require('express-mongo-sanitize');
const ExpressError = require("./utils/ExpressError");
const User = require('./models/user');
const MongoStore = require('connect-mongo');

const campgroundRoutes = require("./routes/campgrounds");
const reviewsRoutes = require("./routes/reviews");
const authRoutes = require('./routes/auth')
// const helmet = require('helmet');

// const db_url = process.env.DB_URL
const db_url =  process.env.DB_URL || "mongodb://root:example@localhost:27017/yelp-camp?authSource=admin&readPreference=primary&ssl=false"
mongoose.connect(
  db_url
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

app.use(mongoSanitize());
const secret =  process.env.SECRET || secret

const store = new MongoStore({
  mongoUrl: db_url,
  secret: secret,
  touchAfter: 24*3600,
})

store.on('error', function(e){
  console.log("Session Store Error", e)
})

const sessionConfig = {
  name: 'session',
  secret: secret,
  resave: false,
  saveUninitialized: true,
  store,
  cookie: {
    expires: Date.now() + 600000,
    maxAge: 600000,
    httpOnly: true,
  },
};


app.use(session(sessionConfig));
app.use(flash());
// app.use(helmet({crossOriginEmbedderPolicy: false,}));

// const scriptSrcUrls = [
//   "https://stackpath.bootstrapcdn.com/",
//   "https://api.tiles.mapbox.com/",
//   "https://api.mapbox.com/",
//   "https://kit.fontawesome.com/",
//   "https://cdnjs.cloudflare.com/",
//   "https://cdn.jsdelivr.net",
// ];
// const styleSrcUrls = [
//   "https://kit-free.fontawesome.com/",
//   "https://stackpath.bootstrapcdn.com/",
//   "https://api.mapbox.com/",
//   "https://api.tiles.mapbox.com/",
//   "https://fonts.googleapis.com/",
//   "https://use.fontawesome.com/",
//   "cdn.jsdelivr.net",
//   "api.mapbox.com"
// ];
// const connectSrcUrls = [
//   "https://api.mapbox.com/",
//   "https://a.tiles.mapbox.com/",
//   "https://b.tiles.mapbox.com/",
//   "https://events.mapbox.com/",
//   "source.unsplash.com"
// ];
// const fontSrcUrls = [];
// app.use(
//   helmet.contentSecurityPolicy({
//       directives: {
//           defaultSrc: [],
//           connectSrc: ["'self'", ...connectSrcUrls],
//           scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
//           styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
//           workerSrc: ["'self'", "blob:"],
//           objectSrc: [],
//           imgSrc: [
//               "'self'",
//               "blob:",
//               "data:",
//               `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`, //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
//               "https://images.unsplash.com/",
//               "https://source.unsplash.com/",
//           ],
//           fontSrc: ["'self'", ...fontSrcUrls],
//       },
//   })
// );



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
app.use(function (req, res, next) {
  res.setHeader('Cross-Origin-Resource-Policy', 'same-site')
  next()
})

app.use('/auth', authRoutes);
app.use("/campgrounds/:id/reviews", reviewsRoutes);
app.use("/campgrounds", campgroundRoutes);
app.get("/", (req, res) => {
  res.render("home", {profile: process.env.PROFILE});
});

app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Somthing Went Wrong";
  res.status(statusCode).render("./error", { err });
});

const port = process.env.PORT || 3000

app.listen(port, () => {
  console.log(`Serving on Port ${port}`);
});
