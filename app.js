const path = require('path')
const express = require('express')
const mongoose = require('mongoose')
const MongoDbStore = require('connect-mongo');
const dotenv = require('dotenv')
const morgan = require('morgan')
const exphbs = require('express-handlebars')

const methodOverride = require('method-override')
const passport = require('passport')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const connectDB = require('./config/db')

// Load config
dotenv.config({path: './config/config.env'})
// passport config
require('./config/passport')(passport)


connectDB()



const app = express()

// body parser
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// over ride
 
app.use(methodOverride(function (req,res)
{
    if(req.body && typeof req.body === 'object' && '_method' in req.body)
    {
        var method = req.body._method
        delete req.body._method
        return method
    }

    

}))

//set global

if(process.env.NODE_ENV === 'development')
{
    app.use(morgan('dev'))
}
//handlebars helper
const{ formatDate, stripTags,
    truncate,editIcon,
    select
} = require('./helper/hbs')

app.engine('.hbs', exphbs({helpers:{ 
    formatDate,  stripTags,
    truncate,editIcon,select }, defaultLayout: 'main', extname:'.hbs'}))
app.set('view engine', '.hbs')

// session
app.use(session({
    secret: 'keyboard',
    resave: false,
    saveUninitialized: false,
    store: MongoDbStore.create({
        mongoUrl: process.env.MONGO_URI
    })
}))

// passport middlewarte
app.use(passport.initialize())
app.use(passport.session())

///
app.use(function (req, res, next) {
    res.locals.user = req.user || null
    next()
  })
  

// Static folder
app.use(express.static(path.join(__dirname, 'public')))



// Routes
app.use('/',require('./routes/index'))
app.use('/auth',require('./routes/auth'))
app.use('/stories',require('./routes/stories'))


const PORT = process.env.PORT || 5000

app.listen(PORT,console.log(` run in  ${process.env.NODE_ENV} log ${PORT}`))