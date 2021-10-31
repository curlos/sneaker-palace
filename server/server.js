const express = require('express')
const session = require("express-session");
const passport = require("passport");
const bcrypt = require("bcryptjs")
const LocalStrategy = require("passport-local").Strategy;
const dotenv = require('dotenv').config()
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const app = express()
const cors = require('cors')
require('dotenv').config()

const PORT = process.env.PORT || 8888
const shoeRouter = require('./routes/shoeRouter')
const userRouter = require('./routes/userRouter')
const database = require('./database/connection')
const User = require('./models/User')

app.use(logger('dev'));
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }));

app.use(session({ secret: "cats", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
require('./passport/config')(passport)

app.use('/shoes', shoeRouter)
app.use('/users', userRouter)


app.listen(PORT, () => {
  database.connectToServer((err) => {
    if (err) {
      console.error(err)
    }
  })
  console.log(`Server is listening on port ${PORT}`)
})