import { Request, Response } from 'express';

require('dotenv').config();
const router = require('express').Router();
const stripe = require('stripe')(process.env.STRIPE_KEY);

router.post('/create-payment-intent', async (req: Request, res: Response) => {
	const { items } = req.body;

	try {
		// Create a PaymentIntent with the order amount and currency
		const paymentIntent = await stripe.paymentIntents.create({
			amount: Number(req.body.total) * 100,
			currency: 'usd',
			payment_method_types: ['card'],
			description: `Sneakers`,
			receipt_email: 'sneakerpalacesite@gmail.com',
		});

		return res.send({
			clientSecret: paymentIntent.client_secret,
		});
	} catch (err) {
		return res.json({ error: err });
	}
});

router.get('/payment-method/:paymentMethodID', async (req: Request, res: Response) => {
	const paymentMethod = await stripe.paymentMethods.retrieve(req.params.paymentMethodID);

	return res.json(paymentMethod);
});

module.exports = router;
