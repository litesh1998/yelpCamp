const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const methodOveride = require('method-override')
const ejsMate = require('ejs-mate')

const Campground = require('./models/campground')
const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/ExpressError')
const {campgroundSchema} = require('./schema')

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

const app = express()
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.urlencoded({extended: true}))
app.use(methodOveride('_method'))

app.get('/', (req, res)=>{
    res.render('home')
})


app.get('/campgrounds', catchAsync(async (req, res)=>{
    const campgrounds = await Campground.find({})
    res.render('campground/index', {campgrounds})
}))

app.get('/campgrounds/new', catchAsync(async (req, res)=>{

    res.render('campground/new',)
}))

app.get('/campgrounds/:id', catchAsync(async (req, res)=>{
    const campground = await Campground.findById(req.params.id)
    res.render('campground/show', {campground})
}))

app.get('/campgrounds/:id/edit', catchAsync(async (req, res)=>{
    const campground = await Campground.findById(req.params.id)
    res.render('campground/edit', {campground})
}))

app.post('/campgrounds', validateCampground ,catchAsync( async (req, res, next)=>{
    // if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);

    const campground = new Campground(req.body.campground)
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
}))

app.put('/campgrounds/:id', validateCampground ,catchAsync(async(req, res)=>{
    const {id} = req.params
    await Campground.findByIdAndUpdate(id, {...req.body.campground})
    res.redirect(`/campgrounds/${id}`)
}))

app.delete('/campgrounds/:id', catchAsync(async (req, res)=>{
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds')
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