const mongoose = require('mongoose')
const cities =require('./cities')
const Campground = require('../models/campground')
const {places, descriptors} = require('./seedhelpers')


mongoose.connect('mongodb://root:example@localhost:27017/yelp-camp?authSource=admin&readPreference=primary&ssl=false');

const db = mongoose.connection;
db.on('error', console.error.bind(console, "Connection Error"));
db.once('open', ()=>{
    console.log("Database Connected")
})

const sample = (arr) => arr[Math.floor(Math.random()*arr.length)]

const seedDb = async () => {
    await Campground.deleteMany({})
    for (let i=0; i<50; i++){
        const random1000 = Math.floor(Math.random()*1000)
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: 'https://source.unsplash.com/collection/483251',
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Hic, consequuntur corporis maiores laborum quam sunt dolorem eius provident error aliquam ratione distinctio facilis ab iste cumque quibusdam soluta obcaecati illum.',
            price: Math.floor(Math.random()*20)+1
        })
        await camp.save()
    }
}

seedDb().then(()=> db.close())
