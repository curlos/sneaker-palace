import { Request, Response } from 'express';
import authRouter from './routes/authRouter';
import userRouter from './routes/userRouter';
import shoeRouter from './routes/shoeRouter';
import cartRouter from './routes/cartRouter';
import ratingRouter from './routes/ratingRouter';
import stripeRouter from './routes/stripeRouter';
import orderRouter from './routes/orderRouter';
import imageRouter from './routes/imageRouter';
import adminRouter from './routes/adminRouter';
import { connectToServer } from './database/connection';

const express = require('express');
const session = require('express-session');
const passport = require('passport');
const logger = require('morgan');
const app = express();
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const PORT = process.env.PORT || 8888;

// Connect to database on startup
connectToServer();

app.use('/assets', express.static(path.join(__dirname, '/assets')));

app.use(logger('dev'));
app.use(cors({ origin: ['http://localhost:3000', 'https://sneaker-palace.vercel.app'] }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(session({ secret: 'cats', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRouter);
app.use('/users', userRouter);
app.use('/shoes', shoeRouter);
app.use('/cart', cartRouter);
app.use('/rating', ratingRouter);
app.use('/checkout', stripeRouter);
app.use('/orders', orderRouter);
app.use('/admin', adminRouter);
app.use('/images', imageRouter);

app.get('/', (_req: Request, res: Response) => {
	res.send('Hello World!');
});

// Only listen on a port if the script is run locally
if (!process.env.VERCEL) {
	// Vercel sets process.env.VERCEL = 1 during runtime
	app.listen(PORT, () => {
		console.log(`Server starting on port ${PORT}`);
	});
}

export default app;
