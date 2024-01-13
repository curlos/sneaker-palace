export { };

const express = require('express');
const session = require("express-session");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const LocalStrategy = require("passport-local").Strategy;
const dotenv = require('dotenv').config();
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const app = express();
const cors = require('cors');
const multer = require("multer");
const path = require("path");
require('dotenv').config();

const PORT = process.env.PORT || 8888;
const authRouter = require('./routes/authRouter');
const userRouter = require('./routes/userRouter');
const shoeRouter = require('./routes/shoeRouter');
const cartRouter = require('./routes/cartRouter');
const ratingRouter = require('./routes/ratingRouter');
const stripeRouter = require('./routes/stripeRouter');
const orderRouter = require('./routes/orderRouter');
const imageRouter = require('./routes/imageRouter');
const database = require('./database/connection');
const User = require('./models/User');

app.use("/assets", express.static(path.join(__dirname, "/assets")));

app.use(logger('dev'));
app.use(cors({ origin: ['http://localhost:3000', 'https://sneaker-palace.vercel.app'] }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(session({ secret: "cats", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRouter);
app.use('/users', userRouter);
app.use('/shoes', shoeRouter);
app.use('/cart', cartRouter);
app.use('/rating', ratingRouter);
app.use('/checkout', stripeRouter);
app.use('/orders', orderRouter);
app.use('/images', imageRouter);

app.listen(PORT, () => {
  console.log(`Server starting on port ${PORT}`);

  database.connectToServer((err: any) => {
    if (err) {
      console.error(err);
    }
  });

});