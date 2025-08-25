import { Request, Response } from 'express'

const express = require('express')
const User = require('../models/User')
const Cart = require('../models/Cart')
const Order = require('../models/Order')

const router = express.Router()

router.get('/:orderID', async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.orderID)
  return res.json(order)
})

router.get('/user/:userID', async (req: Request, res: Response) => {
  const orders = await Order.find({ userID: req.params.userID })
  return res.json(orders)
})

router.post('/', async (req: Request, res: Response) => {
  const orderFound = await Order.findOne({ paymentIntentID: req.body.paymentIntentID })

  if (orderFound) {
    return res.json({ error: 'Already ordered', orderID: orderFound._id })
  }

  const user = await User.findById(req.body.userID)
  const cart = await Cart.findOne({ userID: req.body.userID })
  cart.products = []

  const order = new Order({
    ...req.body
  })

  await user.updateOne({ $push: { orders: order } })
  await cart.save()
  await order.save()

  const updatedUser = await User.findById(req.body.userID)
  const updatedCart = await Cart.findOne({ userID: req.body.userID })

  return res.json({ order, updatedUser, updatedCart })
})

router.post('/no-account', async (req: Request, res: Response) => {
  const orderFound = await Order.findOne({ paymentIntentID: req.body.paymentIntentID })

  if (orderFound) {
    return res.json({ error: 'Already ordered', orderID: orderFound._id })
  }

  const order = new Order({
    ...req.body
  })

  await order.save()

  return res.json({ order })
})

module.exports = router;