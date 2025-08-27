import { Request, Response } from 'express'

// Extend Express Request interface
declare module 'express-serve-static-core' {
  interface Request {
    user?: any
    order?: any
  }
}

const express = require('express')
const User = require('../models/User')
const Cart = require('../models/Cart')
const Order = require('../models/Order')
const { verifyToken } = require('./verifyToken')

const router = express.Router()

const verifyOrderAccess = async (req: Request, res: Response, next: any) => {
  try {
    const order = await Order.findById(req.params.orderID)
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }
    
    // If no userID field exists, it's a guest order - allow access
    if (!order.userID) {
      req.order = order
      return next()
    }
    
    // If userID exists, verify token first
    verifyToken(req, res, () => {
      // Check if user owns the order or is admin
      if (order.userID !== req.user!.id && !req.user!.isAdmin) {
        return res.status(403).json({ error: 'Access denied' })
      }
      
      req.order = order
      next()
    })
  } catch (error) {
    return res.status(500).json({ error: 'Server error' })
  }
}

router.get('/:orderID', verifyOrderAccess, async (req: Request, res: Response) => {
  return res.json(req.order)
})

router.get('/user/:userID', async (req: Request, res: Response) => {
  const orders = await Order.find({ userID: req.params.userID })
  return res.json(orders)
})

// TODO: Add auth.
router.post('/', async (req: Request, res: Response) => {
  const orderFound = await Order.findOne({ paymentIntentID: req.body.paymentIntentID })

  if (orderFound) {
    return res.json({ error: 'Already ordered', orderID: orderFound._id })
  }

  // TODO: Make sure the passed in userID is the same as the logged in user.
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