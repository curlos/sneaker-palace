export {}
import { Request, Response } from 'express'

const router = require('express').Router()
const stripe = require('stripe')(process.env.STRIPE_KEY)

router.post('/payment', async (req: Request, res: Response) => {
  let { amount, id } = req.body
	const payment = await stripe.paymentIntents.create({
    amount,
    currency: "USD",
    description: "Spatula company",
    payment_method: id,
    confirm: true
  })
  console.log("Payment", payment)
  res.json({
    message: "Payment successful",
    success: true
  })
})

router.post("/create-payment-intent", async (req: Request, res: Response) => {
  const { items } = req.body;

  console.log(req.body)

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: (Number(req.body.total) * 100),
    currency: "usd",
    payment_method_types: [
      "card",
    ],
    description: `Sneakers`
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});

module.exports = router;