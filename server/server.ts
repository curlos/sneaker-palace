export {}

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
const authRouter = require('./routes/authRouter')
const shoeRouter = require('./routes/shoeRouter')
const cartRouter = require('./routes/cartRouter')
const database = require('./database/connection')
const User = require('./models/User')

app.use(logger('dev'));
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }));

app.use(session({ secret: "cats", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRouter)
app.use('/shoes', shoeRouter)
app.use('/cart', cartRouter)


app.listen(PORT, () => {
  database.connectToServer((err: any) => {
    if (err) {
      console.error(err)
    }
  })
  console.log(`Server is listening on port ${PORT}`)
})