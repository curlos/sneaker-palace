import { Request, Response } from 'express'

const express = require('express')
const mongoose = require('mongoose')
const Rating = require('../models/Rating')
const Shoe = require('../models/Shoe')
const User = require('../models/User')
const Cart = require('../models/Cart')
const Order = require('../models/Order')

const router = express.Router()

router.get('/:orderID', async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.orderID)
  res.json(order)
})

router.get('/user/:userID', async (req: Request, res: Response) => {
  const orders = await Order.find({ userID: req.params.userID })
  res.json(orders)
})

router.post('/', async (req: Request, res: Response) => {
  const orderFound = await Order.findOne({ paymentIntentID: req.body.paymentIntentID })




  if (orderFound) {
    res.json({ error: 'Already ordered', orderID: orderFound._id })
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

  res.json({ order, updatedUser, updatedCart })
})






module.exports = router;