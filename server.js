require('dotenv').config()
const fs = require('fs')
const cors = require('cors')
const morgan = require('morgan')
const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')


// app 
const app = express()

// database 
mongoose.connect(process.env.DATABASE_LOCAL, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
    .then(() => console.log('database connected'))

// middleware
app.use(morgan('dev'))
app.use(bodyParser.json())
app.use(cookieParser())
if (process.env.NODE_ENV == 'development') {
    app.use(cors({ origin: `${process.env.CLIENT_URL}` }))    
}

// routes -> auto detect from routes directory
fs.readdirSync('./routes').map((r) => app.use('/api', require(`./routes/${r}`)))

// port 
const port = process.env.PORT || 8000
app.listen(port, () => {
    console.log(`app is running on port ${port} - http://localhost:${port}`)
})