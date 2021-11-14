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

module.exports = router;