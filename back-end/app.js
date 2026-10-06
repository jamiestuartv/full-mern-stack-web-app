require('dotenv').config({ silent: true }) // load environmental variables from a hidden file named .env
const express = require('express') // CommonJS import style!
const morgan = require('morgan') // middleware for nice logging of incoming HTTP requests
const cors = require('cors') // middleware for enabling CORS (Cross-Origin Resource Sharing) requests.
const mongoose = require('mongoose')

const app = express() // instantiate an Express object
app.use(morgan('dev', { skip: (req, res) => process.env.NODE_ENV === 'test' })) // log all incoming requests, except when in unit test mode.  morgan has a few logging default styles - dev is a nice concise color-coded style
app.use(cors()) // allow cross-origin resource sharing

// use express's builtin body-parser middleware to parse any data included in a request
app.use(express.json()) // decode JSON-formatted incoming POST data
app.use(express.urlencoded({ extended: true })) // decode url-encoded incoming POST data

// connect to database
mongoose
  .connect(`${process.env.DB_CONNECTION_STRING}`)
  .then(data => console.log(`Connected to MongoDB`))
  .catch(err => console.error(`Failed to connect to MongoDB: ${err}`))

// load the dataabase models we want to deal with
const { Message } = require('./models/Message')
const { User } = require('./models/User')

// a route to handle fetching all messages
app.get('/messages', async (req, res) => {
  // load all messages from database
  try {
    const messages = await Message.find({})
    res.json({
      messages: messages,
      status: 'all good',
    })
  } catch (err) {
    console.error(err)
    res.status(400).json({
      error: err,
      status: 'failed to retrieve messages from the database',
    })
  }
})

// a route to handle fetching a single message by its id
app.get('/messages/:messageId', async (req, res) => {
  // load all messages from database
  try {
    const messages = await Message.find({ _id: req.params.messageId })
    res.json({
      messages: messages,
      status: 'all good',
    })
  } catch (err) {
    console.error(err)
    res.status(400).json({
      error: err,
      status: 'failed to retrieve messages from the database',
    })
  }
})
// a route to handle logging out users
app.post('/messages/save', async (req, res) => {
  // try to save the message to the database
  try {
    const message = await Message.create({
      name: req.body.name,
      message: req.body.message,
    })
    return res.json({
      message: message, // return the message we just saved
      status: 'all good',
    })
  } catch (err) {
    console.error(err)
    return res.status(400).json({
      error: err,
      status: 'failed to save the message to the database',
    })
  }
})

// a route that returns the content for the About Us page as JSON
app.get('/about', (req, res) => {
  res.json({
    name: 'Jamie',
    title: 'About Us',
    imageUrl: 'https://github.com/jamiestuartv.png?size=400',
    paragraphs: [
      "Hi, I'm Jamie! I'm a student at NYU in the Class of 2027, studying Computer Science alongside Business at NYU Stern. I like working right where those two worlds meet: building products and figuring out how to get them into people's hands.",
      'I grew up in Bogotá, Colombia, and I speak English and Spanish natively. Moving to New York for school has been a big change, but the energy of the city fits the way I like to work.',
      "Outside of class I'm a Growth Fellow at Nodi, an AI recruitment platform, and VP of ULABA at NYU. I've also interned in business development and growth at Cloud Science Labs and Five Iron Golf, and in finance and operations at Hupecol.",
      "On the building side, I founded Budget Bud, an iOS budgeting app, and I'm always tinkering with side projects. I'm taking Agile Software Development & DevOps to sharpen how I work on real engineering teams.",
    ],
    status: 'all good',
  })
})

// export the express app we created to make it available to other modules
module.exports = app // CommonJS export style!
