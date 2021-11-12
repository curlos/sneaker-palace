export {}
import { Request, Response } from 'express'

const router = require('express').Router()
const stripe = require('stripe')(process.env.STRIPE_KEY)

router.post('/payment', (req: Request, res: Response) => {
  stripe.charges.create(
    {

    },
    (stripeErr: any, stripeRes: any) => {
      if (stripeErr) {
        res.status(500).json(stripeErr)
      } else {
        res.status(200).json(stripeRes)
      }
    }
  )
})

module.exports = router;