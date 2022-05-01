const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const methodOveride = require('method-override')
const ejsMate = require('ejs-mate')

const Campground = require('./models/campground')
const Review = require('./models/review')
const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/ExpressError')
const {campgroundSchema, reviewSchema} = require('./schema')

const campgrounds = require('./routes/campgrounds')

mongoose.connect('mongodb://root:example@localhost:27017/yelp-camp?authSource=admin&readPreference=primary&ssl=false');

const db = mongoose.connection;
db.on('error', console.error.bind(console, "Connection Error"));
db.once('open', ()=>{
    console.log("Database Connected")
})

const validateCampground = (req, res, next) =>{

    const {error}= campgroundSchema.validate(req.body)
    if (error){
        const msg= error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }
    else{
        next();
    }
    
}

const validateReview = (req,res, next)=>{
    const {error}= reviewSchema.validate(req.body)
    if (error){
        const msg= error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }
    else{
        next();
    }
}

const app = express()
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.urlencoded({extended: true}))
app.use(methodOveride('_method'))


app.use('/campgrounds',campgrounds)

app.get('/', (req, res)=>{
    res.render('home')
})



app.post('/campgrounds/:id/reviews', validateReview ,catchAsync(async(req, res) =>{
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review)
    campground.reviews.push(review)
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
}))

app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async(req, res)=>{
    await Review.findByIdAndDelete(req.params.reviewId);
    Campground.findByIdAndUpdate(req.params.id, {$pull: {reviews: req.params.reviewId}});
    res.redirect(`/campgrounds/${req.params.id}`);
}))

app.all('*', (req, res, next)=>{
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next)=>{
    const {statusCode=500} = err
    if(!err.message) err.message = 'Somthing Went Wrong'
    res.status(statusCode).render('./error', {err})
    
})

app.listen(3000, ()=>{
    console.log('Serving on Port 3000');
})