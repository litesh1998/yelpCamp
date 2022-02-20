const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const methodOveride = require('method-override')
const ejsMate = require('ejs-mate')

const Campground = require('./models/campground')


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

app.get('/', (req, res)=>{
    res.render('home')
})


app.get('/campgrounds', async (req, res)=>{
    const campgrounds = await Campground.find({})
    res.render('campground/index', {campgrounds})
})

app.get('/campgrounds/new', async (req, res)=>{

    res.render('campground/new',)
})

app.get('/campgrounds/:id', async (req, res)=>{
    const campground = await Campground.findById(req.params.id)
    res.render('campground/show', {campground})
})

app.get('/campgrounds/:id/edit', async (req, res)=>{
    const campground = await Campground.findById(req.params.id)
    res.render('campground/edit', {campground})
})

app.post('/campgrounds', async(req, res)=>{
    const campground = new Campground(req.body.campground)
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
})

app.put('/campgrounds/:id', async(req, res)=>{
    const {id} = req.params
    await Campground.findByIdAndUpdate(id, {...req.body.campground})
    res.redirect(`/campgrounds/${id}`)
})

app.delete('/campground/:id', async (req, res)=>{
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds')
})

app.listen(3000, ()=>{
    console.log('Serving on Port 3000');
})