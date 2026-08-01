import express, { Request, Response } from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_KEY as string, { apiVersion: '2026-06-24.dahlia' });

router.post('/create-payment-intent', async (req: Request, res: Response) => {
	const { total } = req.body;
	const amount = Number(total);

	if (total === undefined || total === null || Number.isNaN(amount)) {
		return res.status(400).json({ error: 'A valid total is required' });
	}

	try {
		// Create a PaymentIntent with the order amount and currency
		const paymentIntent = await stripe.paymentIntents.create({
			amount: amount * 100,
			currency: 'usd',
			payment_method_types: ['card'],
			description: `Sneakers`,
			receipt_email: 'sneakerpalacesite@gmail.com',
		});

		return res.send({
			clientSecret: paymentIntent.client_secret,
		});
	} catch {
		return res.status(500).json({ error: 'Failed to create payment intent' });
	}
});

router.get('/payment-method/:paymentMethodID', async (req: Request, res: Response) => {
	const paymentMethod = await stripe.paymentMethods.retrieve(req.params.paymentMethodID as string);

	return res.json(paymentMethod);
});

export default router;
