const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const methodOveride = require('method-override')
const ejsMate = require('ejs-mate')

const ExpressError = require('./utils/ExpressError')

const campgrounds = require('./routes/campgrounds')
const reviews = require('./routes/reviews')

mongoose.connect('mongodb://root:example@localhost:27017/yelp-camp?authSource=admin&readPreference=primary&ssl=false');

const db = mongoose.connection;
db.on('error', console.error.bind(console, "Connection Error"));
db.once('open', ()=>{
    console.log("Database Connected")
})


const app = express()
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.urlencoded({extended: true}))
app.use(methodOveride('_method'))


app.use('/campgrounds/:id/reviews', reviews)
app.use('/campgrounds',campgrounds)
app.get('/', (req, res)=>{
    res.render('home')
})


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